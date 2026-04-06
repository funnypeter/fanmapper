# FanMapper -- Product Requirements Document (PRD)

**Version:** 1.0 (Draft)
**Date:** April 6, 2026
**Status:** Proposal

---

## Context

Gamers currently juggle two separate tools: a game tracker app (like Minimap) for managing their library/achievements, and browser tabs with Fandom wikis for maps, guides, and item data. FanMapper eliminates this friction by building a full-featured game tracker that natively integrates Fandom.com wiki content -- interactive maps, item databases, crafting recipes, and walkthroughs -- into a single free, open-source mobile app. Initial focus is on open-world RPGs where wiki reference is most valuable.

---

## 1. Executive Summary

FanMapper is a free, open-source mobile app (iOS + Android) that clones Minimap's game tracking features (backlog management, achievement sync, playtime stats, social features) and differentiates by embedding rich Fandom.com wiki content -- interactive game maps, structured item/weapon/armor data, crafting recipes, and step-by-step guides. Launch targets 5 open-world RPGs: Elden Ring, Skyrim, Fallout 4, Genshin Impact, and Zelda: Tears of the Kingdom.

**Key value prop:** One app for tracking your games AND referencing wiki knowledge while playing.

---

## 2. Problem Statement

- **For gamers:** Existing trackers like Minimap have no in-game knowledge support. Players context-switch to browser wikis, breaking immersion.
- **For wiki users:** Fandom wiki content is powerful but trapped in a browser with heavy ads. No native mobile app surfaces it in a structured, gameplay-oriented format.
- **Gap:** No single app combines game-progress tracking with structured wiki knowledge.

---

## 3. Target Audience

| Segment | Needs |
|---------|-------|
| **Completionists** | Achievement sync, map checklists, completion tracking |
| **Backlog Managers** | Multi-platform library management, prioritization |
| **Open-World Explorers** | Interactive maps, item locations, quest guides |
| **Stats Enthusiasts** | Playtime charts, genre breakdowns, trends |
| **Community Contributors** | Social profiles, reviews, recommendations |

**Primary persona:** Player aged 18-35, owns games on 2+ platforms, plays open-world RPGs, regularly references Fandom wikis on their phone.

---

## 4. Core Features (MVP) -- Prioritized

*Aligned with UX spec: `ux/minimap_x_fandom_prd.html`*

### Priority 1: Must Have for MVP

**F1. Game Library & Backlog Management** *(Screen: Game Library)*
- Search/add games (IGDB API primary, RAWG fallback)
- Statuses: Playing, Completed, Dropped, Wishlist
- Track hours played, platform tagging
- Grid or list view, categorized by play status

**F2. Dashboard / Home Feed** *(Screen: Dashboard/Home)*
- Personalized feed: current game progress, recent activity
- Trending Fandom news and editorial content
- Community highlights (popular reviews, guides)
- Quick-resume links to games currently being played

**F3. Game Detail Page** *(Screen: Game Detail - Minimap style)*
- Game overview with cover art, metadata, rating
- Play tracking controls (status, hours, platform)
- Quick links to Fandom wiki sections
- Achievement/trophy progress summary
- HowLongToBeat completion estimates

**F4. Fandom Wiki Integration** *(Screen: Fandom Wiki Section)*
- Streamlined view of game-specific wiki content
- Sections: Characters, Items, Walkthroughs, Locations
- Parsed infobox data as structured cards (weapons, armor, enemies)
- Interactive game maps (Leaflet.js, filterable markers, offline tile caching)
- Crafting recipe display
- CC BY-SA 3.0 attribution on every wiki-sourced screen

**F5. Community / Explore** *(Screen: Community/Explore)*
- Hub for finding new games and popular Fandom communities
- Social feed: reviews, guides, discussions from Fandom community
- Discover games trending in the community
- User-generated game reviews and ratings

**F6. Gaming News Feed**
- Integration with Fandom's editorial and news content
- Game-specific news filtered to your library
- Breaking news, patch notes, release announcements

**F7. User Auth & Profile** *(Screen: User Profile)*
- Email/password + Google/Apple social login
- Showcase gaming stats, library, and community contributions
- Link gaming platform accounts (Steam, PSN, Xbox)
- Public profile page

**F8. Platform Account Linking & Achievement Sync**
- Steam: Official Web API (`ISteamUserStats`) -- API key required
- PlayStation: Unofficial PSN API via `psn-api` npm -- NPSSO token auth
- Xbox: Microsoft Xbox Live API via Azure AD OAuth
- Per-game achievement list with earned/unearned status

### Priority 2: Post-MVP (V1.0)

**F9.** Gaming statistics dashboard (charts: playtime trends, genre breakdown)
**F10.** Guide/walkthrough viewer with spoiler toggles and bookmarking
**F11.** Social features (follow users, activity feed, game reviews)

### Priority 3: V2.0

**F12.** Nintendo Switch manual tracking
**F13.** Auto-generated checklists from wiki categories
**F14.** Overlay/PiP mode for map viewing
**F15.** Push notifications
**F16.** Contribution back to Fandom (report errors)

### Screen Map (from UX spec)

| Screen | Maps to Features | Tab/Navigation |
|--------|-----------------|----------------|
| **Dashboard/Home** | F2 (feed, news, progress) | Bottom tab: Home |
| **Game Detail** | F3 (tracking, overview, wiki links) | Push from Library/Home |
| **Fandom Wiki Section** | F4 (wiki content, maps, items) | Push from Game Detail |
| **Game Library** | F1 (collection, status filters) | Bottom tab: Library |
| **Community/Explore** | F5, F6 (social, news, discovery) | Bottom tab: Explore |
| **User Profile** | F7 (stats, contributions) | Bottom tab: Profile |

---

## 5. Fandom Integration Architecture

### 5.1 API Endpoints

| API | Pattern | Purpose |
|-----|---------|---------|
| MediaWiki Action API | `{wiki}.fandom.com/api.php?action=query&prop=revisions` | Fetch page wikitext |
| MediaWiki Action API | `{wiki}.fandom.com/api.php?action=parse` | Get parsed HTML |
| MediaWiki Action API | `{wiki}.fandom.com/api.php?action=query&list=search` | Search within wiki |
| MediaWiki Action API | `{wiki}.fandom.com/api.php?action=query&list=categorymembers` | List category pages |
| Interactive Maps API | `{wiki}.fandom.com/api.php?action=getmap&name={MapName}` | Map JSON data |

### 5.2 Wiki-to-Game Registry

A curated JSON file maps game titles to Fandom wiki subdomains and key categories/templates:

```json
{
  "elden-ring": {
    "wiki_subdomain": "eldenring",
    "map_pages": ["Map:The Lands Between"],
    "categories": {
      "weapons": "Category:Weapons",
      "bosses": "Category:Bosses",
      "locations": "Category:Locations"
    },
    "infobox_templates": ["Infobox_weapon", "Infobox_armor", "Infobox_enemy"]
  }
}
```

Community-maintainable, shipped as bundled JSON, updatable via OTA config.

### 5.3 Content Parsing Pipeline

1. Fetch raw wikitext via `action=query&prop=revisions&rvprop=content`
2. Parse infobox templates using `wtf_wikipedia` (npm) or `mwparserfromhell` (Python backend)
3. Extract structured key-value pairs from infoboxes
4. Cache parsed results in local SQLite (24h TTL for content, 7-day for map tiles)
5. Render structured cards in the app

### 5.4 Rate Limiting & Caching

- Self-throttle: max 1 request/second per user session
- Local cache (SQLite): 24h TTL for wiki content, 7-day for map tiles
- Optional backend cache (Redis) for popular pages
- ETag/revision ID checks before re-fetching
- Full offline support for previously viewed content

### 5.5 CC BY-SA 3.0 Compliance

Every wiki-sourced screen must show:
- Attribution line: "Content from [Game] Wiki on Fandom.com, licensed under CC BY-SA 3.0"
- Tappable link to source wiki page and license deed
- App settings includes full "Attribution & Licenses" screen

---

## 5b. Game Content & Visual Asset Sourcing

| Content Type | Primary Source | Fallback | Notes |
|---|---|---|---|
| **Game metadata** (title, genre, release date, platforms) | IGDB API | RAWG API | IGDB has best data quality; requires Twitch dev account |
| **Cover art / thumbnails** | IGDB API | RAWG API | IGDB provides 600x800+ covers, multiple sizes. Must display "Data provided by IGDB.com" credit |
| **Screenshots & artwork** | IGDB API | Fandom wiki images (CC BY-SA) | IGDB has official press screenshots; Fandom has community gameplay images |
| **Steam-specific custom artwork** | SteamGridDB API | -- | Community-driven grids, heroes, logos. Free API key after Steam login |
| **Completion time estimates** | HowLongToBeat (via `howlongtobeatpy` wrapper) | -- | Main story / Main+Extras / Completionist times. Great for backlog prioritization ("What to play next?" feature) |
| **Review/critic scores** | OpenCritic API | RAWG Metacritic field | Aggregated scores from IGN, GameSpot, Eurogamer, etc. Free API |
| **Wiki content** (maps, items, guides) | Fandom MediaWiki API | -- | CC BY-SA 3.0 licensed. See Section 5 |

### API Rate Limits & Terms Summary

| API | Free Tier | Rate Limit | Commercial/OSS Use | Attribution Required |
|---|---|---|---|---|
| **IGDB** | Yes (Twitch dev account) | 4 req/sec | Yes (must implement IGDB login for consumer apps) | "Data provided by IGDB.com" |
| **RAWG** | 20k req/month | 20k/month | Yes if <100k MAU | Link to RAWG |
| **SteamGridDB** | Yes (Steam login) | Reasonable | Yes | SteamGridDB credit |
| **HowLongToBeat** | Via community wrappers | Respectful scraping | Gray area -- use cached results | Not formally required |
| **OpenCritic** | Yes | Not published | Yes (partnerships exist) | OpenCritic credit |

### Content Caching Strategy

All external API responses are cached locally to minimize API calls:
- **Game metadata & covers:** Cached in SQLite, refreshed monthly or on user request
- **HLTB completion times:** Cached per game, refreshed weekly
- **Review scores:** Cached per game, refreshed weekly
- **Wiki content:** See Section 5.4 (24h TTL for content, 7-day for map tiles)

---

## 6. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Mobile | React Native (Expo) + TypeScript | Single codebase iOS+Android, large OSS ecosystem |
| State | Zustand + TanStack Query | App state + server/API state with built-in caching |
| Local DB | SQLite (expo-sqlite) | Offline-first storage for wiki cache and user data |
| Maps | react-native-maps + Leaflet WebView | Native maps + Fandom interactive maps |
| Charts | Victory Native | Gaming statistics visualizations |
| Backend | Node.js (Fastify) + TypeScript | API gateway, auth, social features, wiki caching |
| Backend DB | PostgreSQL | User accounts, social graph, reviews |
| Cache | Redis | Server-side wiki cache, rate limiting |
| Auth | Supabase Auth | Social logins, email/password, token management |
| CI/CD | GitHub Actions + EAS Build | Automated testing and app store deployment |

---

## 7. Data Model

### Core Entities

- **User** -- id, email, display_name, avatar_url, created_at
- **LinkedAccount** -- user_id, platform (STEAM/PSN/XBOX/SWITCH), platform_user_id, encrypted tokens, last_synced_at
- **Game** -- id, igdb_id, title, cover_image_url, platforms, genres, release_date, fandom_wiki_subdomain
- **UserGame** -- user_id, game_id, status (PLAYING/FINISHED/SHELVED/DROPPED/WISHLIST), platform, playtime_minutes, rating, review_text, dates
- **Achievement** -- game_id, platform, external_id, name, description, icon_url, global_unlock_percentage
- **UserAchievement** -- user_id, achievement_id, unlocked, unlocked_at
- **WikiCache** (local SQLite) -- wiki_subdomain, page_title, content_type, parsed_content (JSON), revision_id, fetched/expires timestamps
- **MapCache** (local SQLite) -- wiki_subdomain, map_name, map_json, tile_cache_path, fetched_at
- **Follow** -- follower_id, following_id
- **ActivityEvent** -- user_id, event_type, game_id, metadata (JSON)

---

## 8. Key User Stories

1. **First-Time Setup:** Sign up, link Steam/PSN, auto-import library and achievements
2. **Manage Backlog:** Categorize games by status, filter/sort, get "what to play next" suggestion
3. **Browse Map While Playing:** Open interactive map for a game, filter markers, tap for wiki details, works offline
4. **Look Up Item Stats:** Search for weapon/armor, see structured infobox data (damage, weight, requirements)
5. **View Gaming Stats:** Dashboard with playtime charts, genre breakdown, trends
6. **Follow Walkthrough:** Step-by-step guide with spoiler toggles and bookmark progress
7. **Social Discovery:** Find users with similar libraries, follow, see activity feed

---

## 9. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Cold start <3s, cached map tiles <500ms, wiki page cached <300ms |
| Offline | Library, cached wiki pages, cached map tiles all available offline |
| Security | Encrypted token storage (Keychain/Keystore), HTTPS only, OAuth 2.0, bcrypt passwords |
| Licensing | GPLv3 for code, CC BY-SA 3.0 attribution for all Fandom content |
| Accessibility | WCAG 2.1 AA, screen reader support, dynamic font sizing |
| Localization | MVP: English only; V1.0: i18n framework; V2.0: community translations |
| Privacy | GDPR/CCPA compliant, data export/deletion, no analytics SDKs transmitting gaming data without consent |

---

## 10. Roadmap

### Phase 1: MVP (Months 1-4)
- **M1:** Project scaffolding (Expo + TS), CI/CD, auth, UI shell, game search (IGDB)
- **M2:** Game library CRUD, backlog management, Steam API integration
- **M3:** Fandom wiki viewer (articles, infobox parsing for 5 games), caching layer
- **M4:** Interactive maps (Leaflet, markers, offline caching), PSN integration, beta release

**Launch titles:** Elden Ring, Skyrim, Fallout 4, Genshin Impact, Zelda: TotK

### Phase 2: V1.0 Public Launch (Months 5-7)
- **M5:** Xbox integration, stats dashboard, guide/walkthrough viewer
- **M6:** Social features (follow, feed, reviews), push notifications
- **M7:** Performance optimization, accessibility audit, App Store submission, OSS repo polish

### Phase 3: V2.0 (Months 8-12)
- Item comparison, auto-generated checklists, community-contributed game registry, localization, Switch manual tracking, PiP mode, deep linking

---

## 11. Success Metrics

| Category | Metric | Target (6mo post-launch) |
|----------|--------|--------------------------|
| Acquisition | Downloads | 50,000 |
| Acquisition | GitHub stars | 2,000 |
| Engagement | DAU/MAU | >20% |
| Engagement | Avg session | >4 min |
| Retention | Day 7 | >25% |
| Community | External contributors | >20 |

---

## 12. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| PSN API instability (reverse-engineered) | HIGH | Abstract behind `PlatformAdapter` interface; rate-limit aggressively; manual trophy entry fallback |
| Fandom API changes/blocking | MEDIUM | Generous local caching; backend pre-fetch layer; respectful User-Agent; consider Fandom partnership |
| Wikitext parsing fragility across wikis | MEDIUM | Template-driven parser via wiki-to-game registry; per-game infobox template mappings |
| CC BY-SA compliance failure | LOW but CRITICAL | Attribution built into `WikiContentCard` component; QA checklist; attribution manifest |
| App Store rejection | MEDIUM | All content CC BY-SA licensed; game metadata from licensed APIs; trademark disclaimer |
| Scope creep on wiki support | HIGH | MVP strictly limited to 5 curated games with verified registry entries |
| OSS maintainer burnout | MEDIUM | GitHub Sponsors; modular architecture; automate CI/CD |

---

## 13. Open Questions

1. Should we proactively contact Fandom's developer relations for partnership/API agreement?
2. PSN NPSSO token UX is poor -- invest in smoother flow or accept friction with clear instructions?
3. Traditional Node.js server vs. serverless (Supabase Edge Functions) for MVP backend?
4. IGDB (better data, stricter terms) vs. RAWG (more permissive) for game metadata?
5. Proxy Fandom map tiles on our own CDN vs. direct linking?
6. Should Switch support be entirely manual at MVP?
7. Long-term sustainability model if fully free (donations, sponsors, foundation)?
8. Content validation layer for vandalized wiki content, or trust Fandom's moderation?

---

## Appendix: Launch Title Wiki Mapping

| Game | Wiki Subdomain | Has Interactive Maps | Est. Pages |
|------|---------------|---------------------|------------|
| Elden Ring | `eldenring.fandom.com` | Yes | 5,000+ |
| Skyrim | `elderscrolls.fandom.com` | Yes | 20,000+ |
| Fallout 4 | `fallout.fandom.com` | Yes | 15,000+ |
| Genshin Impact | `genshin-impact.fandom.com` | Yes | 10,000+ |
| Zelda: TotK | `zelda.fandom.com` | Yes | 8,000+ |

---

## Verification / Next Steps

After approval, implementation begins with:
1. `npx create-expo-app FanMapper --template expo-template-blank-typescript`
2. Set up project structure per tech stack above
3. Initialize git repo, GitHub remote, CI/CD pipeline
4. Build F1 (Game Library) and F5 (Auth) first as the foundation
5. Verify Fandom API access by fetching a test page from `eldenring.fandom.com/api.php`
