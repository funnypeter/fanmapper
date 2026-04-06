import { getDatabase } from '../db/schema';
import type { Game } from '../types';

const RAWG_BASE_URL = 'https://api.rawg.io/api';

// Should come from env/config — placeholder for now
const API_KEY = '';

function mapRAWGGame(raw: any): Game {
  return {
    id: `rawg-${raw.id}`,
    igdbId: 0, // RAWG games don't have IGDB IDs
    title: raw.name,
    coverUrl: raw.background_image ?? null,
    genres: (raw.genres ?? []).map((g: any) => g.name),
    platforms: (raw.platforms ?? []).map((p: any) => p.platform?.name).filter(Boolean),
    releaseDate: raw.released ?? null,
    summary: raw.description_raw ?? null,
  };
}

export async function searchGames(query: string): Promise<Game[]> {
  if (!query.trim() || !API_KEY) return [];

  const params = new URLSearchParams({
    key: API_KEY,
    search: query,
    search_precise: 'true',
    page_size: '20',
  });

  const res = await fetch(`${RAWG_BASE_URL}/games?${params}`);
  if (!res.ok) throw new Error(`RAWG error: ${res.status}`);

  const data = await res.json();
  const games = (data.results ?? []).map(mapRAWGGame);

  // Cache results
  const db = await getDatabase();
  for (const game of games) {
    await db.runAsync(
      `INSERT OR IGNORE INTO games (id, igdb_id, title, cover_url, genres, platforms, release_date, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [game.id, game.igdbId, game.title, game.coverUrl, JSON.stringify(game.genres), JSON.stringify(game.platforms), game.releaseDate, game.summary]
    );
  }

  return games;
}

export async function getGameDetails(rawgId: number): Promise<Game | null> {
  if (!API_KEY) return null;

  const res = await fetch(`${RAWG_BASE_URL}/games/${rawgId}?key=${API_KEY}`);
  if (!res.ok) return null;

  const data = await res.json();
  return mapRAWGGame(data);
}

export function isConfigured(): boolean {
  return API_KEY.length > 0;
}
