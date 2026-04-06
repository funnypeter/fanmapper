// Game status in user's library
export type GameStatus = 'playing' | 'completed' | 'dropped' | 'wishlist' | 'backlog';

// Platform identifiers
export type Platform = 'steam' | 'psn' | 'xbox' | 'switch' | 'pc' | 'mobile';

// Core game data (from IGDB)
export interface Game {
  id: string;
  igdbId: number;
  title: string;
  coverUrl: string | null;
  genres: string[];
  platforms: Platform[];
  releaseDate: string | null;
  summary: string | null;
}

// User's relationship with a game
export interface UserGame {
  id: string;
  userId: string;
  gameId: string;
  status: GameStatus;
  playtimeMinutes: number;
  rating: number | null; // 1-5
  review: string | null;
  platform: Platform | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Achievement from platform sync
export interface Achievement {
  id: string;
  gameId: string;
  platform: Platform;
  externalId: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  globalUnlockPercent: number | null;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string | null;
  isEarned: boolean;
}

// Navigation param types
export type RootTabParamList = {
  HomeTab: undefined;
  LibraryTab: undefined;
  ExploreTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  GameDetail: { gameId: string };
};

export type LibraryStackParamList = {
  Library: undefined;
  GameDetail: { gameId: string };
  AddGame: undefined;
  Achievements: { gameId: string };
  Wiki: { config: any };
  WikiPage: { wiki: string; title: string; config: any };
};

export type ExploreStackParamList = {
  Explore: undefined;
  GameDetail: { gameId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  LinkSteam: undefined;
};
