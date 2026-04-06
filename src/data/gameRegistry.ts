// Wiki-to-Game Registry: maps games to their Fandom wiki configuration
// This drives which wiki content is available for each game

export interface GameWikiConfig {
  gameTitle: string;
  wiki: string; // Fandom subdomain (e.g., "eldenring" for eldenring.fandom.com)
  categories: {
    characters?: string;
    items?: string;
    weapons?: string;
    armor?: string;
    locations?: string;
    bosses?: string;
    quests?: string;
    walkthroughs?: string;
  };
  infoboxTemplates: {
    character?: string;
    item?: string;
    weapon?: string;
    location?: string;
    boss?: string;
  };
  maps: string[]; // Interactive map names
}

export const GAME_REGISTRY: Record<string, GameWikiConfig> = {
  'elden-ring': {
    gameTitle: 'Elden Ring',
    wiki: 'eldenring',
    categories: {
      characters: 'Characters',
      items: 'Items',
      weapons: 'Weapons',
      armor: 'Armor',
      locations: 'Locations',
      bosses: 'Bosses',
      quests: 'Quests',
    },
    infoboxTemplates: {
      character: 'Infobox character',
      weapon: 'Infobox weapon',
      boss: 'Infobox boss',
      location: 'Infobox location',
    },
    maps: ['The Lands Between'],
  },

  'skyrim': {
    gameTitle: 'The Elder Scrolls V: Skyrim',
    wiki: 'elderscrolls',
    categories: {
      characters: 'Skyrim: Characters',
      items: 'Skyrim: Items',
      weapons: 'Skyrim: Weapons',
      armor: 'Skyrim: Armor',
      locations: 'Skyrim: Locations',
      quests: 'Skyrim: Quests',
      walkthroughs: 'Skyrim: Walkthrough',
    },
    infoboxTemplates: {
      character: 'Infobox Character',
      weapon: 'Infobox Weapon',
      location: 'Infobox Location',
    },
    maps: ['Skyrim Map'],
  },

  'fallout-4': {
    gameTitle: 'Fallout 4',
    wiki: 'fallout',
    categories: {
      characters: 'Fallout 4 characters',
      items: 'Fallout 4 items',
      weapons: 'Fallout 4 weapons',
      armor: 'Fallout 4 armor and clothing',
      locations: 'Fallout 4 locations',
      quests: 'Fallout 4 quests',
    },
    infoboxTemplates: {
      character: 'Infobox character',
      weapon: 'Infobox item',
      location: 'Infobox location',
    },
    maps: ['Commonwealth Map'],
  },

  'genshin-impact': {
    gameTitle: 'Genshin Impact',
    wiki: 'genshin-impact',
    categories: {
      characters: 'Playable Characters',
      items: 'Items',
      weapons: 'Weapons',
      locations: 'Locations',
      bosses: 'Bosses',
      quests: 'Archon Quests',
    },
    infoboxTemplates: {
      character: 'Infobox Character',
      weapon: 'Infobox Weapon',
    },
    maps: ['Teyvat Interactive Map'],
  },

  'zelda-totk': {
    gameTitle: 'The Legend of Zelda: Tears of the Kingdom',
    wiki: 'zelda',
    categories: {
      characters: 'Tears of the Kingdom Characters',
      items: 'Tears of the Kingdom Items',
      weapons: 'Tears of the Kingdom Weapons',
      locations: 'Tears of the Kingdom Locations',
      bosses: 'Tears of the Kingdom Bosses',
      quests: 'Tears of the Kingdom Quests',
    },
    infoboxTemplates: {
      character: 'Infobox Character',
      item: 'Infobox Item',
    },
    maps: ['Hyrule Map'],
  },
};

// Find a wiki config by game title (fuzzy match)
export function findWikiConfig(gameTitle: string): GameWikiConfig | null {
  const lower = gameTitle.toLowerCase();

  // Direct key match
  for (const [key, config] of Object.entries(GAME_REGISTRY)) {
    if (lower.includes(key.replace(/-/g, ' ')) || config.gameTitle.toLowerCase().includes(lower)) {
      return config;
    }
  }

  // Partial match
  for (const config of Object.values(GAME_REGISTRY)) {
    const words = config.gameTitle.toLowerCase().split(/\s+/);
    if (words.some((w) => lower.includes(w) && w.length > 3)) {
      return config;
    }
  }

  return null;
}
