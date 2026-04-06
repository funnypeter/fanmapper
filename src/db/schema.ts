import * as SQLite from 'expo-sqlite';

const MIGRATIONS = [
  // Version 1: Initial schema
  `CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    igdb_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    cover_url TEXT,
    genres TEXT, -- JSON array
    platforms TEXT, -- JSON array
    release_date TEXT,
    summary TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`,

  `CREATE TABLE IF NOT EXISTS user_games (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    game_id TEXT NOT NULL REFERENCES games(id),
    status TEXT NOT NULL DEFAULT 'backlog',
    playtime_minutes INTEGER NOT NULL DEFAULT 0,
    rating INTEGER,
    review TEXT,
    platform TEXT,
    started_at TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, game_id)
  );`,

  `CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL REFERENCES games(id),
    platform TEXT NOT NULL,
    external_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    global_unlock_percent REAL,
    UNIQUE(game_id, platform, external_id)
  );`,

  `CREATE TABLE IF NOT EXISTS user_achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL REFERENCES achievements(id),
    is_earned INTEGER NOT NULL DEFAULT 0,
    earned_at TEXT,
    UNIQUE(user_id, achievement_id)
  );`,

  `CREATE TABLE IF NOT EXISTS wiki_cache (
    id TEXT PRIMARY KEY,
    wiki TEXT NOT NULL,
    page_title TEXT NOT NULL,
    content TEXT NOT NULL,
    revision_id TEXT,
    fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    UNIQUE(wiki, page_title)
  );`,

  `CREATE TABLE IF NOT EXISTS map_cache (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL REFERENCES games(id),
    map_name TEXT NOT NULL,
    map_json TEXT NOT NULL,
    tile_paths TEXT, -- JSON array of local file paths
    fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    UNIQUE(game_id, map_name)
  );`,

  `CREATE INDEX IF NOT EXISTS idx_user_games_user ON user_games(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_user_games_status ON user_games(user_id, status);`,
  `CREATE INDEX IF NOT EXISTS idx_achievements_game ON achievements(game_id);`,
  `CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_wiki_cache_lookup ON wiki_cache(wiki, page_title);`,
];

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('fanmapper.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  for (const migration of MIGRATIONS) {
    await db.execAsync(migration);
  }
  return db;
}
