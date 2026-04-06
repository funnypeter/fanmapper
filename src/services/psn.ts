import { supabase } from './supabase';

const PSN_API_BASE = 'https://m.np.playstation.com/api';

// PSN uses NPSSO token auth — user provides their token
// See: https://github.com/andshrew/PlayStation-Trophies

interface PSNTrophyTitle {
  npCommunicationId: string;
  trophyTitleName: string;
  trophyTitleIconUrl: string;
  definedTrophies: { bronze: number; silver: number; gold: number; platinum: number };
  earnedTrophies: { bronze: number; silver: number; gold: number; platinum: number };
  progress: number;
  lastUpdatedDateTime: string;
}

interface PSNTrophy {
  trophyId: number;
  trophyName: string;
  trophyDetail: string;
  trophyType: 'bronze' | 'silver' | 'gold' | 'platinum';
  trophyIconUrl: string;
  earned: boolean;
  earnedDateTime?: string;
  trophyRare: number; // 0=ultra rare, 1=very rare, 2=rare, 3=common
  trophyEarnedRate: string; // percentage string
}

// Exchange NPSSO token for access token
async function getAccessToken(npssoToken: string): Promise<string> {
  // Step 1: Get auth code
  const codeRes = await fetch(
    'https://ca.account.sony.com/api/authz/v3/oauth/authorize?' +
    new URLSearchParams({
      access_type: 'offline',
      client_id: '09515159-7ef5-4e35-8b9f-30b6f1837c68',
      redirect_uri: 'com.scee.psxandroid.scecompcall://redirect',
      response_type: 'code',
      scope: 'psn:mobile.v2.core psn:clientapp',
    }),
    {
      headers: { Cookie: `npsso=${npssoToken}` },
      redirect: 'manual',
    }
  );

  const location = codeRes.headers.get('location') ?? '';
  const code = new URL(location).searchParams.get('code');
  if (!code) throw new Error('Failed to get PSN auth code. Check your NPSSO token.');

  // Step 2: Exchange code for token
  const tokenRes = await fetch('https://ca.account.sony.com/api/authz/v3/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: 'com.scee.psxandroid.scecompcall://redirect',
      token_format: 'jwt',
    }),
  });

  if (!tokenRes.ok) throw new Error('PSN token exchange failed');
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function psnFetch(accessToken: string, path: string): Promise<any> {
  const res = await fetch(`${PSN_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`PSN API error: ${res.status}`);
  return res.json();
}

// Get trophy titles (games with trophies)
async function getTrophyTitles(accessToken: string): Promise<PSNTrophyTitle[]> {
  const data = await psnFetch(accessToken, '/trophy/v1/users/me/trophyTitles?limit=800');
  return data.trophyTitles ?? [];
}

// Get trophies for a specific game
async function getGameTrophies(accessToken: string, npCommId: string): Promise<PSNTrophy[]> {
  // Get trophy definitions
  const defs = await psnFetch(accessToken, `/trophy/v1/npCommunicationIds/${npCommId}/trophyGroups/all/trophies`);

  // Get earned status
  const earned = await psnFetch(accessToken, `/trophy/v1/users/me/npCommunicationIds/${npCommId}/trophyGroups/all/trophies`);

  const earnedMap = new Map<number, any>();
  for (const t of (earned.trophies ?? [])) {
    earnedMap.set(t.trophyId, t);
  }

  return (defs.trophies ?? []).map((t: any) => {
    const e = earnedMap.get(t.trophyId);
    return {
      trophyId: t.trophyId,
      trophyName: t.trophyName,
      trophyDetail: t.trophyDetail ?? '',
      trophyType: t.trophyType,
      trophyIconUrl: t.trophyIconUrl ?? '',
      earned: e?.earned ?? false,
      earnedDateTime: e?.earnedDateTime,
      trophyRare: t.trophyRare ?? 3,
      trophyEarnedRate: t.trophyEarnedRate ?? '0',
    };
  });
}

// Full sync: import PSN games + trophies into Supabase
export async function syncPSNLibrary(userId: string, npssoToken: string): Promise<{ imported: number; trophies: number }> {
  const accessToken = await getAccessToken(npssoToken);
  const titles = await getTrophyTitles(accessToken);

  let importedCount = 0;
  let trophyCount = 0;

  for (const title of titles) {
    const gameId = `psn-${title.npCommunicationId}`;

    // Upsert game
    await supabase.from('games').upsert({
      id: gameId,
      title: title.trophyTitleName,
      cover_url: title.trophyTitleIconUrl,
      genres: [],
      platforms: ['PlayStation'],
    });

    // Upsert into user library
    await supabase.from('user_games').upsert({
      user_id: userId,
      game_id: gameId,
      status: title.progress === 100 ? 'completed' : 'playing',
      platform: 'psn',
      updated_at: title.lastUpdatedDateTime,
    });

    importedCount++;

    // Fetch trophies (rate limited — 1 req per 5 sec for safety)
    try {
      const trophies = await getGameTrophies(accessToken, title.npCommunicationId);

      for (const trophy of trophies) {
        const { data: achRow } = await supabase.from('achievements').upsert({
          game_id: gameId,
          platform: 'psn',
          external_id: String(trophy.trophyId),
          name: trophy.trophyName,
          description: trophy.trophyDetail,
          icon_url: trophy.trophyIconUrl,
          global_unlock_percent: parseFloat(trophy.trophyEarnedRate) || null,
        }).select('id').single();

        if (achRow) {
          await supabase.from('user_achievements').upsert({
            user_id: userId,
            achievement_id: achRow.id,
            is_earned: trophy.earned,
            earned_at: trophy.earnedDateTime ?? null,
          });
          if (trophy.earned) trophyCount++;
        }
      }
    } catch {
      // Some games may fail — continue with next
    }

    // Rate limit: PSN is strict
    await new Promise((r) => setTimeout(r, 5000));
  }

  // Save PSN ID to profile
  await supabase.from('profiles').update({ psn_id: 'linked' }).eq('id', userId);

  return { imported: importedCount, trophies: trophyCount };
}
