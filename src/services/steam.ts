import { supabase } from './supabase';
import type { Game, Achievement } from '../types';

const STEAM_API_BASE = 'https://api.steampowered.com';
const STEAM_STORE_API = 'https://store.steampowered.com/api';

// Steam API key — should be proxied through a backend in production
// For now, stored here for development
const STEAM_API_KEY = '';

export interface SteamProfile {
  steamId: string;
  personaName: string;
  avatarUrl: string;
  profileUrl: string;
}

export interface SteamOwnedGame {
  appid: number;
  name: string;
  playtimeForever: number; // minutes
  playtime2Weeks: number;
  imgIconUrl: string;
}

export interface SteamAchievement {
  apiname: string;
  achieved: boolean;
  unlocktime: number;
  name?: string;
  description?: string;
}

// Get player profile
export async function getSteamProfile(steamId: string): Promise<SteamProfile> {
  const res = await fetch(
    `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`
  );
  if (!res.ok) throw new Error(`Steam API error: ${res.status}`);

  const data = await res.json();
  const player = data.response?.players?.[0];
  if (!player) throw new Error('Steam profile not found');

  return {
    steamId: player.steamid,
    personaName: player.personaname,
    avatarUrl: player.avatarfull,
    profileUrl: player.profileurl,
  };
}

// Get owned games
export async function getOwnedGames(steamId: string): Promise<SteamOwnedGame[]> {
  const res = await fetch(
    `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`
  );
  if (!res.ok) throw new Error(`Steam API error: ${res.status}`);

  const data = await res.json();
  return (data.response?.games ?? []).map((g: any) => ({
    appid: g.appid,
    name: g.name,
    playtimeForever: g.playtime_forever ?? 0,
    playtime2Weeks: g.playtime_2weeks ?? 0,
    imgIconUrl: g.img_icon_url
      ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
      : '',
  }));
}

// Get achievements for a game
export async function getAchievements(steamId: string, appId: number): Promise<SteamAchievement[]> {
  try {
    const res = await fetch(
      `${STEAM_API_BASE}/ISteamUserStats/GetPlayerAchievements/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&appid=${appId}&l=english`
    );
    if (!res.ok) return []; // Game may not have achievements

    const data = await res.json();
    if (!data.playerstats?.success) return [];

    return (data.playerstats.achievements ?? []).map((a: any) => ({
      apiname: a.apiname,
      achieved: a.achieved === 1,
      unlocktime: a.unlocktime,
      name: a.name,
      description: a.description,
    }));
  } catch {
    return []; // Silently fail — many games don't support achievements
  }
}

// Get cover art from Steam Store API
export async function getStoreCover(appId: number): Promise<string | null> {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900_2x.jpg`;
}

// Full sync: import owned games + achievements into Supabase
export async function syncSteamLibrary(userId: string, steamId: string): Promise<{ imported: number; achievements: number }> {
  const ownedGames = await getOwnedGames(steamId);
  let importedCount = 0;
  let achievementCount = 0;

  for (const steamGame of ownedGames) {
    const gameId = `steam-${steamGame.appid}`;
    const coverUrl = await getStoreCover(steamGame.appid);

    // Upsert game into games table
    await supabase.from('games').upsert({
      id: gameId,
      title: steamGame.name,
      cover_url: coverUrl,
      genres: [],
      platforms: ['PC'],
    });

    // Upsert into user's library
    const status = steamGame.playtimeForever > 0
      ? (steamGame.playtime2Weeks > 0 ? 'playing' : 'backlog')
      : 'backlog';

    await supabase.from('user_games').upsert({
      user_id: userId,
      game_id: gameId,
      status,
      playtime_minutes: steamGame.playtimeForever,
      platform: 'steam',
      updated_at: new Date().toISOString(),
    });

    importedCount++;

    // Fetch achievements (with a small delay to respect rate limits)
    const achievements = await getAchievements(steamId, steamGame.appid);
    for (const ach of achievements) {
      // Upsert achievement definition
      const { data: achRow } = await supabase.from('achievements').upsert({
        game_id: gameId,
        platform: 'steam',
        external_id: ach.apiname,
        name: ach.name ?? ach.apiname,
        description: ach.description ?? null,
      }).select('id').single();

      if (achRow) {
        await supabase.from('user_achievements').upsert({
          user_id: userId,
          achievement_id: achRow.id,
          is_earned: ach.achieved,
          earned_at: ach.achieved && ach.unlocktime > 0
            ? new Date(ach.unlocktime * 1000).toISOString()
            : null,
        });
        if (ach.achieved) achievementCount++;
      }
    }

    // Rate limit: ~2 requests per game, keep under 4/sec
    await new Promise((r) => setTimeout(r, 600));
  }

  // Save Steam ID to profile
  await supabase.from('profiles').update({ steam_id: steamId }).eq('id', userId);

  return { imported: importedCount, achievements: achievementCount };
}

export function isConfigured(): boolean {
  return STEAM_API_KEY.length > 0;
}
