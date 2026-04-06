import * as igdb from './igdb';
import * as rawg from './rawg';
import type { Game } from '../types';

/**
 * Search for games using IGDB as primary, RAWG as fallback.
 */
export async function searchGames(query: string): Promise<Game[]> {
  if (!query.trim()) return [];

  // Try IGDB first
  if (igdb.isConfigured()) {
    try {
      const results = await igdb.searchGames(query);
      if (results.length > 0) return results;
    } catch (err) {
      console.warn('IGDB search failed, trying RAWG:', err);
    }
  }

  // Fall back to RAWG
  if (rawg.isConfigured()) {
    try {
      return await rawg.searchGames(query);
    } catch (err) {
      console.warn('RAWG search also failed:', err);
    }
  }

  return [];
}

/**
 * Get detailed info for a game by its ID (prefixed with source).
 */
export async function getGameDetails(gameId: string): Promise<Game | null> {
  if (gameId.startsWith('igdb-')) {
    const id = parseInt(gameId.replace('igdb-', ''), 10);
    return igdb.getGameDetails(id);
  }

  if (gameId.startsWith('rawg-')) {
    const id = parseInt(gameId.replace('rawg-', ''), 10);
    return rawg.getGameDetails(id);
  }

  return null;
}
