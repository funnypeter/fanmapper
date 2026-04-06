import { getDatabase } from '../db/schema';
import type { Game } from '../types';

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_BASE_URL = 'https://api.igdb.com/v4';

// These should come from env/config — placeholder for now
const CLIENT_ID = '';
const CLIENT_SECRET = '';

let accessToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt) return accessToken;

  const res = await fetch(
    `${TWITCH_TOKEN_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  );

  if (!res.ok) throw new Error(`Twitch auth failed: ${res.status}`);

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000; // refresh 60s early
  return accessToken!;
}

async function igdbQuery(endpoint: string, body: string): Promise<any[]> {
  const token = await getAccessToken();
  const res = await fetch(`${IGDB_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'text/plain',
    },
    body,
  });

  if (res.status === 429) throw new Error('IGDB rate limit exceeded');
  if (!res.ok) throw new Error(`IGDB error: ${res.status}`);

  return res.json();
}

function mapIGDBGame(raw: any): Game {
  return {
    id: `igdb-${raw.id}`,
    igdbId: raw.id,
    title: raw.name,
    coverUrl: raw.cover?.url
      ? `https:${raw.cover.url.replace('t_thumb', 't_cover_big')}`
      : null,
    genres: (raw.genres ?? []).map((g: any) => g.name),
    platforms: (raw.platforms ?? []).map((p: any) => p.name),
    releaseDate: raw.first_release_date
      ? new Date(raw.first_release_date * 1000).toISOString().split('T')[0]
      : null,
    summary: raw.summary ?? null,
  };
}

export async function searchGames(query: string): Promise<Game[]> {
  if (!query.trim()) return [];

  // Check local cache first
  const db = await getDatabase();
  const cached = await db.getAllAsync<{ id: string; igdb_id: number; title: string; cover_url: string | null; genres: string; platforms: string; release_date: string | null; summary: string | null }>(
    `SELECT * FROM games WHERE title LIKE ? LIMIT 10`,
    [`%${query}%`]
  );

  if (cached.length >= 5) {
    return cached.map((row) => ({
      id: row.id,
      igdbId: row.igdb_id,
      title: row.title,
      coverUrl: row.cover_url,
      genres: JSON.parse(row.genres || '[]'),
      platforms: JSON.parse(row.platforms || '[]'),
      releaseDate: row.release_date,
      summary: row.summary,
    }));
  }

  // Fetch from IGDB
  const results = await igdbQuery(
    'games',
    `search "${query.replace(/"/g, '\\"')}";
fields id,name,cover.url,genres.name,platforms.name,first_release_date,summary;
limit 20;`
  );

  const games = results.map(mapIGDBGame);

  // Cache results
  for (const game of games) {
    await db.runAsync(
      `INSERT OR REPLACE INTO games (id, igdb_id, title, cover_url, genres, platforms, release_date, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [game.id, game.igdbId, game.title, game.coverUrl, JSON.stringify(game.genres), JSON.stringify(game.platforms), game.releaseDate, game.summary]
    );
  }

  return games;
}

export async function getGameDetails(igdbId: number): Promise<Game | null> {
  const results = await igdbQuery(
    'games',
    `fields id,name,cover.url,genres.name,platforms.name,first_release_date,summary,screenshots.url,artworks.url,rating,aggregated_rating;
where id = ${igdbId};
limit 1;`
  );

  if (results.length === 0) return null;
  return mapIGDBGame(results[0]);
}

export function isConfigured(): boolean {
  return CLIENT_ID.length > 0 && CLIENT_SECRET.length > 0;
}
