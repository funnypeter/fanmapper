import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import type { GameStatus } from '../types';

export interface LibraryGame {
  id: string;
  gameId: string;
  title: string;
  coverUrl: string | null;
  status: GameStatus;
  playtimeMinutes: number;
  rating: number | null;
  review: string | null;
  platform: string | null;
  genres: string[];
  platforms: string[];
  updatedAt: string;
}

export function useLibrary() {
  const { user } = useAuthContext();
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GameStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'alpha' | 'playtime'>('recent');

  const fetchLibrary = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('user_games')
      .select('*, game:games(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Library fetch error:', error);
      setLoading(false);
      return;
    }

    const mapped: LibraryGame[] = (data ?? []).map((row: any) => ({
      id: row.id,
      gameId: row.game_id,
      title: row.game?.title ?? 'Unknown',
      coverUrl: row.game?.cover_url ?? null,
      status: row.status,
      playtimeMinutes: row.playtime_minutes,
      rating: row.rating,
      review: row.review,
      platform: row.platform,
      genres: row.game?.genres ?? [],
      platforms: row.game?.platforms ?? [],
      updatedAt: row.updated_at,
    }));

    setGames(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const addGame = useCallback(async (gameId: string, status: GameStatus, platform?: string) => {
    if (!user) return;

    const { error } = await supabase.from('user_games').upsert({
      user_id: user.id,
      game_id: gameId,
      status,
      platform: platform ?? null,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    await fetchLibrary();
  }, [user, fetchLibrary]);

  const updateGame = useCallback(async (gameId: string, updates: {
    status?: GameStatus;
    playtime_minutes?: number;
    rating?: number;
    review?: string;
    platform?: string;
  }) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_games')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('game_id', gameId);

    if (error) throw error;
    await fetchLibrary();
  }, [user, fetchLibrary]);

  const removeGame = useCallback(async (gameId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_games')
      .delete()
      .eq('user_id', user.id)
      .eq('game_id', gameId);

    if (error) throw error;
    await fetchLibrary();
  }, [user, fetchLibrary]);

  // Filter & sort
  const filtered = games.filter((g) => filter === 'all' || g.status === filter);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'alpha') return a.title.localeCompare(b.title);
    if (sortBy === 'playtime') return b.playtimeMinutes - a.playtimeMinutes;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return {
    games: sorted,
    allGames: games,
    loading,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    addGame,
    updateGame,
    removeGame,
    refresh: fetchLibrary,
  };
}
