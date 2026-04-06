import { getDatabase } from '../db/schema';

const USER_AGENT = 'FanMapper/1.0 (https://github.com/funnypeter/fanmapper)';
const CACHE_TTL_HOURS = 24;

interface FandomRequestOptions {
  wiki: string;
  params: Record<string, string>;
}

async function fandomApi({ wiki, params }: FandomRequestOptions): Promise<any> {
  const url = new URL(`https://${wiki}.fandom.com/api.php`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('formatversion', '2');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Encoding': 'gzip',
    },
  });

  if (!res.ok) throw new Error(`Fandom API error: ${res.status}`);
  return res.json();
}

// Fetch parsed HTML for a wiki page
export async function fetchPage(wiki: string, title: string): Promise<{
  title: string;
  html: string;
  categories: string[];
  sections: { level: string; line: string; anchor: string }[];
} | null> {
  // Check cache first
  const db = await getDatabase();
  const cached = await db.getFirstAsync<{ content: string; expires_at: string }>(
    `SELECT content, expires_at FROM wiki_cache WHERE wiki = ? AND page_title = ?`,
    [wiki, title]
  );

  if (cached && new Date(cached.expires_at) > new Date()) {
    return JSON.parse(cached.content);
  }

  const data = await fandomApi({
    wiki,
    params: {
      action: 'parse',
      page: title,
      prop: 'text|categories|sections',
    },
  });

  if (data.error) return null;

  const result = {
    title: data.parse.title,
    html: data.parse.text,
    categories: (data.parse.categories ?? []).map((c: any) => c.category ?? c['*']),
    sections: (data.parse.sections ?? []).map((s: any) => ({
      level: s.level,
      line: s.line,
      anchor: s.anchor,
    })),
  };

  // Cache it
  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();
  await db.runAsync(
    `INSERT OR REPLACE INTO wiki_cache (id, wiki, page_title, content, fetched_at, expires_at)
     VALUES (?, ?, ?, ?, datetime('now'), ?)`,
    [`${wiki}:${title}`, wiki, title, JSON.stringify(result), expiresAt]
  );

  return result;
}

// Fetch raw wikitext (for infobox parsing)
export async function fetchWikitext(wiki: string, title: string): Promise<string | null> {
  const data = await fandomApi({
    wiki,
    params: {
      action: 'query',
      titles: title,
      prop: 'revisions',
      rvprop: 'content',
      rvslots: '*',
    },
  });

  const pages = data.query?.pages;
  if (!pages || pages.length === 0 || pages[0].missing) return null;
  return pages[0].revisions?.[0]?.slots?.main?.content ?? null;
}

// Search within a wiki
export async function searchWiki(wiki: string, query: string, limit = 20): Promise<{
  title: string;
  pageId: number;
  snippet: string;
}[]> {
  const data = await fandomApi({
    wiki,
    params: {
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: String(limit),
      srprop: 'snippet',
    },
  });

  return (data.query?.search ?? []).map((r: any) => ({
    title: r.title,
    pageId: r.pageid,
    snippet: r.snippet?.replace(/<[^>]*>/g, '') ?? '',
  }));
}

// Get all pages in a category
export async function getCategory(wiki: string, category: string, limit = 500): Promise<{
  title: string;
  pageId: number;
}[]> {
  const results: { title: string; pageId: number }[] = [];
  let cmcontinue: string | undefined;

  do {
    const params: Record<string, string> = {
      action: 'query',
      list: 'categorymembers',
      cmtitle: category.startsWith('Category:') ? category : `Category:${category}`,
      cmlimit: String(Math.min(limit - results.length, 500)),
      cmtype: 'page',
      cmprop: 'ids|title',
    };
    if (cmcontinue) params.cmcontinue = cmcontinue;

    const data = await fandomApi({ wiki, params });

    const members = data.query?.categorymembers ?? [];
    for (const m of members) {
      results.push({ title: m.title, pageId: m.pageid });
    }

    cmcontinue = data.continue?.cmcontinue;
  } while (cmcontinue && results.length < limit);

  return results;
}

// Get interactive map data
export async function getMapData(wiki: string, mapName: string): Promise<any | null> {
  try {
    const data = await fandomApi({
      wiki,
      params: {
        action: 'getmap',
        name: mapName,
      },
    });
    return data;
  } catch {
    return null;
  }
}
