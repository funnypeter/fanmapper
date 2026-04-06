import { useState, useEffect, useCallback } from 'react';
import { getDatabase } from '../db/schema';

interface CacheStats {
  pageCount: number;
  mapCount: number;
  totalSizeEstimate: string;
}

export function useWikiCache() {
  const [stats, setStats] = useState<CacheStats>({ pageCount: 0, mapCount: 0, totalSizeEstimate: '0 KB' });
  const [loading, setLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    const db = await getDatabase();

    const pages = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM wiki_cache');
    const maps = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM map_cache');

    // Estimate size from content length
    const pageSize = await db.getFirstAsync<{ total: number }>(
      'SELECT COALESCE(SUM(LENGTH(content)), 0) as total FROM wiki_cache'
    );
    const mapSize = await db.getFirstAsync<{ total: number }>(
      'SELECT COALESCE(SUM(LENGTH(map_json)), 0) as total FROM map_cache'
    );

    const totalBytes = (pageSize?.total ?? 0) + (mapSize?.total ?? 0);
    const sizeStr = totalBytes > 1024 * 1024
      ? `${(totalBytes / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(totalBytes / 1024)} KB`;

    setStats({
      pageCount: pages?.count ?? 0,
      mapCount: maps?.count ?? 0,
      totalSizeEstimate: sizeStr,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const clearCache = useCallback(async () => {
    const db = await getDatabase();
    await db.execAsync('DELETE FROM wiki_cache');
    await db.execAsync('DELETE FROM map_cache');
    await refreshStats();
  }, [refreshStats]);

  const clearExpired = useCallback(async () => {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM wiki_cache WHERE expires_at < datetime('now')");
    await db.runAsync("DELETE FROM map_cache WHERE expires_at < datetime('now')");
    await refreshStats();
  }, [refreshStats]);

  return { stats, loading, clearCache, clearExpired, refreshStats };
}
