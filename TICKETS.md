# FanMapper -- Project Tickets

**Organized by Epic | Priority: P0 (MVP), P1 (V1.0), P2 (V2.0)**

---

## Epic 0: Project Foundation

### FM-001: Project Scaffolding [P0]
**Type:** Task
**Description:** Initialize the React Native (Expo) project with TypeScript template, configure ESLint, Prettier, and basic folder structure.
**Acceptance Criteria:**
- Expo project created with `expo-template-blank-typescript`
- Folder structure: `src/{screens,components,services,hooks,utils,data,db,navigation,types}`
- ESLint + Prettier configured
- `.gitignore`, `README.md` in place
- App runs on iOS simulator and Android emulator
**Estimate:** S

### FM-002: Git Repo & CI/CD Setup [P0]
**Type:** Task
**Description:** Initialize git, create GitHub repo, configure GitHub Actions for linting/testing, set up EAS Build for iOS/Android.
**Acceptance Criteria:**
- GitHub repo created with branch protection on `main`
- GitHub Actions workflow: lint, type-check, test on PR
- EAS Build configured for dev, preview, and production profiles
- `CONTRIBUTING.md` and issue templates added
**Estimate:** S

### FM-003: Navigation Shell [P0]
**Type:** Task
**Description:** Set up bottom tab navigation with placeholder screens for Home, Library, Explore, Profile.
**Acceptance Criteria:**
- Bottom tab bar with 4 tabs: Home, Library, Explore, Profile
- Stack navigators within each tab for push navigation
- Placeholder screens render with tab name
- Tab icons (use Ionicons or similar)
**Estimate:** S

### FM-004: Design System & Theme [P0]
**Type:** Task
**Description:** Establish core design tokens (colors, typography, spacing), dark/light theme support, and base UI components.
**Acceptance Criteria:**
- Theme provider with dark/light mode
- Color palette, font scale, spacing scale defined
- Base components: Button, Card, Text, Input, Avatar, Badge
- Consistent with UX style guide (`ux/minimap_x_fandom_prd.html`)
**Estimate:** M

---

## Epic 1: User Authentication & Profile (F7)

### FM-010: Supabase Auth Integration [P0]
**Type:** Story
**Description:** Set up Supabase project and integrate authentication with email/password signup and login.
**Acceptance Criteria:**
- Supabase project created and configured
- Sign up with email/password
- Login / logout flow
- Auth state persisted across app restarts
- Auth context/provider available app-wide
**Estimate:** M

### FM-011: Social Login (Google & Apple) [P0]
**Type:** Story
**Description:** Add Google and Apple sign-in options to the auth flow.
**Acceptance Criteria:**
- Google Sign-In works on both iOS and Android
- Apple Sign-In works on iOS (required by App Store)
- Social accounts linked to Supabase user record
- Existing email accounts can link social providers
**Estimate:** M

### FM-012: User Profile Screen [P0]
**Type:** Story
**Description:** Build the Profile tab screen showing user info, gaming stats summary, and settings access.
**Acceptance Criteria:**
- Display avatar, display name, join date
- Show linked platform accounts (Steam, PSN, Xbox badges)
- Gaming stats summary (total games, total playtime, completion rate)
- Edit profile (display name, avatar)
- Settings link (logout, data export, attribution/licenses)
**Estimate:** M

### FM-013: Public Profile View [P1]
**Type:** Story
**Description:** Allow viewing another user's public profile with their stats and library highlights.
**Acceptance Criteria:**
- Profile accessible via user search or activity feed
- Shows public stats, top games, recent activity
- Follow/unfollow button
**Estimate:** S

---

## Epic 2: Game Library & Backlog (F1)

### FM-020: IGDB API Client [P0]
**Type:** Task
**Description:** Build the IGDB API service with Twitch OAuth authentication, game search, and metadata fetching.
**Acceptance Criteria:**
- Twitch OAuth client credentials flow for IGDB access token
- `searchGames(query)` -- returns game list with covers
- `getGameDetails(id)` -- returns full metadata (genres, platforms, release date, screenshots)
- `getGameCover(id)` -- returns cover art URLs at multiple sizes
- Token refresh on expiry
- Rate limiting (max 4 req/sec)
- Local caching of results in SQLite
**Estimate:** M

### FM-021: RAWG API Fallback Client [P0]
**Type:** Task
**Description:** Build RAWG API client as fallback for games not found in IGDB.
**Acceptance Criteria:**
- `searchGames(query)` with RAWG API
- Falls back to RAWG when IGDB returns no results
- Respects 20k req/month limit with request counting
- RAWG attribution displayed where required
**Estimate:** S

### FM-022: Game Search & Add Flow [P0]
**Type:** Story
**Description:** Users can search for games and add them to their library.
**Acceptance Criteria:**
- Search bar with debounced IGDB query
- Results show cover art, title, platforms, release year
- Tap to view game detail preview
- "Add to Library" button with status picker (Playing, Wishlist, etc.)
- Game saved to local SQLite + synced to backend
**Estimate:** M

### FM-023: Game Library Screen [P0]
**Type:** Story
**Description:** Build the Library tab showing user's game collection with filtering and sorting.
**Acceptance Criteria:**
- Grid view (cover art tiles) and list view toggle
- Filter by status: All, Playing, Completed, Dropped, Wishlist
- Sort by: Recently added, Alphabetical, Playtime, Platform
- Pull-to-refresh syncs from backend
- Empty state with "Add your first game" CTA
**Estimate:** M

### FM-024: Backlog Status Management [P0]
**Type:** Story
**Description:** Users can update game status, log playtime, rate, and review games.
**Acceptance Criteria:**
- Long-press or swipe to change status
- Playtime logging (manual hours input)
- Star rating (1-5)
- Optional text review
- Status change creates an ActivityEvent for social feed
**Estimate:** M

### FM-025: Local SQLite Database Schema [P0]
**Type:** Task
**Description:** Define and implement the local SQLite schema for offline-first data storage.
**Acceptance Criteria:**
- Tables: UserGame, Game, Achievement, UserAchievement, WikiCache, MapCache
- Migration system for schema updates
- CRUD helpers for each table
- Data syncs to backend when online, works fully offline
**Estimate:** M

### FM-026: HowLongToBeat Integration [P1]
**Type:** Story
**Description:** Show completion time estimates on game detail pages.
**Acceptance Criteria:**
- Fetch HLTB data (main story, main+extras, completionist times)
- Display on Game Detail screen
- Cached per game, refreshed weekly
- Graceful handling when game not found on HLTB
**Estimate:** S

---

## Epic 3: Platform Linking & Achievement Sync (F8)

### FM-030: Platform Adapter Interface [P0]
**Type:** Task
**Description:** Define the abstract `PlatformAdapter` interface that all platform integrations implement.
**Acceptance Criteria:**
- Interface: `authenticate()`, `getOwnedGames()`, `getAchievements(gameId)`, `getProfile()`, `sync()`
- Error handling contract for API failures
- Rate limit configuration per platform
- Adapter registry for dynamic platform resolution
**Estimate:** S

### FM-031: Steam Integration [P0]
**Type:** Story
**Description:** Link Steam account and sync owned games + achievements.
**Acceptance Criteria:**
- User enters Steam ID or authenticates via Steam OpenID
- Fetch owned games via `GetOwnedGames` API
- Fetch achievements per game via `GetPlayerAchievements`
- Map Steam games to IGDB entries (by Steam app ID)
- Import playtime from Steam
- Re-sync on demand and on app launch (background)
- Steam API key stored securely
**Estimate:** L

### FM-032: PlayStation (PSN) Integration [P0]
**Type:** Story
**Description:** Link PSN account and sync trophy data.
**Acceptance Criteria:**
- NPSSO token input flow with clear instructions
- Fetch trophy titles (games with trophies)
- Fetch trophy list per game with earned status
- Map PSN games to IGDB entries (by title matching)
- Rate limiting (1 req / 5 sec to avoid account risk)
- Manual trophy entry fallback if API fails
- Warning about unofficial API nature
**Estimate:** L

### FM-033: Xbox Integration [P1]
**Type:** Story
**Description:** Link Xbox account via Microsoft OAuth and sync achievements.
**Acceptance Criteria:**
- Microsoft OAuth 2.0 flow (Azure AD app registration)
- Fetch Xbox game library
- Fetch achievements per game
- Map Xbox games to IGDB entries
- Token refresh on expiry
**Estimate:** L

### FM-034: Achievement Detail View [P0]
**Type:** Story
**Description:** Show per-game achievement list with earned/unearned status and global unlock percentages.
**Acceptance Criteria:**
- Achievement list on Game Detail screen
- Each achievement: icon, name, description, earned status, date earned
- Global unlock percentage bar
- Filter: All, Earned, Unearned
- Total completion percentage header
**Estimate:** M

### FM-035: Nintendo Switch Manual Tracking [P2]
**Type:** Story
**Description:** Allow manual game and playtime entry for Switch (no API available).
**Acceptance Criteria:**
- "Add Switch Game" flow with manual search + hours input
- Optional: screen-capture OCR for play activity (experimental)
- Switch games appear in unified library
**Estimate:** M

---

## Epic 4: Fandom Wiki Integration (F4)

### FM-040: Fandom API Client [P0]
**Type:** Task
**Description:** Build the core Fandom MediaWiki API client with rate limiting, caching, and error handling.
**Acceptance Criteria:**
- `fetchPage(wiki, title)` -- returns parsed page content
- `searchWiki(wiki, query)` -- returns search results
- `getCategory(wiki, category)` -- returns category members
- `getMapData(wiki, mapName)` -- returns interactive map JSON
- Self-throttle: max 1 req/sec per session
- Respectful User-Agent header identifying FanMapper
- Local SQLite caching with 24h TTL
- ETag/revision ID freshness checks
**Estimate:** L

### FM-041: Wikitext Parser [P0]
**Type:** Task
**Description:** Build a wikitext-to-structured-data parser for extracting infobox data from Fandom pages.
**Acceptance Criteria:**
- Parse infobox templates into key-value JSON objects
- Template-driven: uses wiki-to-game registry for template names
- Handles common wikitext formatting (links, bold, lists, images)
- Uses `wtf_wikipedia` npm package as parser foundation
- Unit tests for each launch title's infobox format
**Estimate:** L

### FM-042: Wiki-to-Game Registry [P0]
**Type:** Task
**Description:** Create and populate the initial wiki-to-game registry JSON for 5 launch titles.
**Acceptance Criteria:**
- JSON schema defined and documented
- Entries for: Elden Ring, Skyrim, Fallout 4, Genshin Impact, Zelda: TotK
- Each entry maps: wiki subdomain, category names, infobox template names, map page names
- Registry loaded at app startup, updatable via OTA config fetch
- Contribution guide for adding new games
**Estimate:** M

### FM-043: Wiki Content Viewer Screen [P0]
**Type:** Story
**Description:** Build the Fandom Wiki Section screen with browsable wiki content organized by category.
**Acceptance Criteria:**
- Accessible from Game Detail page via "Wiki" button
- Tabs/sections: Characters, Items/Weapons, Locations, Walkthroughs
- Category browser: lists all pages in a wiki category
- Article view: renders parsed wiki content with images
- Infobox data displayed as structured cards
- Search within the game's wiki
- CC BY-SA 3.0 attribution on every screen (link to source + license)
**Estimate:** L

### FM-044: WikiContentCard Component [P0]
**Type:** Task
**Description:** Build the reusable UI component for rendering parsed infobox data as structured cards.
**Acceptance Criteria:**
- Renders key-value pairs from parsed infobox JSON
- Supports images, stats bars, linked items
- Built-in CC BY-SA 3.0 attribution footer with source link
- Responsive layout for different data shapes
- Dark/light theme support
**Estimate:** M

### FM-045: Interactive Map Viewer [P0]
**Type:** Story
**Description:** Build the interactive map component for viewing Fandom game maps with markers.
**Acceptance Criteria:**
- Renders Fandom Interactive Map tile layers using Leaflet.js (WebView)
- Displays markers from map JSON data
- Filter markers by category (e.g., Bosses, Items, Fast Travel, Dungeons)
- Tap marker to show popup with wiki summary
- Pan and zoom with standard mobile gestures
- Offline tile caching (7-day TTL)
- Works for all 5 launch titles
**Estimate:** XL

### FM-046: Offline Wiki Support [P0]
**Type:** Task
**Description:** Ensure previously viewed wiki pages and map tiles are available offline.
**Acceptance Criteria:**
- SQLite WikiCache stores parsed content with expiry timestamps
- MapCache stores map JSON and tile image file paths
- Offline indicator shown when serving cached content
- Cache management UI (clear cache, cache size display)
- Graceful degradation when content not cached and offline
**Estimate:** M

### FM-047: Crafting Recipe Display [P1]
**Type:** Story
**Description:** Parse and display crafting recipes from wiki data in a structured format.
**Acceptance Criteria:**
- Parse crafting recipe templates from wikitext
- Display: input materials -> output item with quantities
- Link to ingredient/result wiki pages
- Works for games with crafting (Elden Ring, Skyrim, Fallout 4)
**Estimate:** M

---

## Epic 5: Dashboard / Home Feed (F2)

### FM-050: Home Screen Layout [P0]
**Type:** Story
**Description:** Build the Dashboard/Home tab with personalized feed sections.
**Acceptance Criteria:**
- "Continue Playing" section: games with status=Playing, tap to open Game Detail
- "Recent Activity" section: user's recent status changes, achievements
- "Trending" section: popular games in the community (placeholder for MVP)
- News section: gaming news cards (see FM-060)
- Pull-to-refresh
**Estimate:** M

### FM-051: Continue Playing Widget [P0]
**Type:** Story
**Description:** Show currently playing games with quick-access to wiki and map.
**Acceptance Criteria:**
- Horizontal scroll of games with status=Playing
- Each card: cover art, title, playtime, last played
- Quick action buttons: "Map", "Wiki", "Update Status"
- Tapping card opens Game Detail
**Estimate:** S

---

## Epic 6: Game Detail Page (F3)

### FM-060: Game Detail Screen [P0]
**Type:** Story
**Description:** Build the Game Detail screen with overview, tracking controls, and wiki entry points.
**Acceptance Criteria:**
- Hero section: cover art/banner, title, platforms, release date
- Rating display (user rating + OpenCritic score)
- Play tracking controls: status picker, playtime input, platform selector
- HLTB completion estimates (when available)
- Achievement progress bar with "View All" link
- Quick links: "Wiki", "Map", "Guide", "Reviews"
- "Add to Library" / "In Library" state toggle
**Estimate:** L

### FM-061: OpenCritic Score Integration [P1]
**Type:** Task
**Description:** Fetch and display OpenCritic review scores on game detail pages.
**Acceptance Criteria:**
- Fetch score by game name from OpenCritic API
- Display: score number, tier (Mighty/Strong/Fair/Weak), critic count
- Cached per game, refreshed weekly
- Graceful fallback when game not found
**Estimate:** S

---

## Epic 7: Community & Explore (F5)

### FM-070: Explore Screen [P0]
**Type:** Story
**Description:** Build the Explore tab as a hub for discovering games and Fandom communities.
**Acceptance Criteria:**
- Trending games section (based on community activity)
- Popular Fandom wikis for supported games
- Game genre browsing
- Search bar for finding games or wiki content
**Estimate:** M

### FM-071: User Game Reviews [P1]
**Type:** Story
**Description:** Allow users to write and browse game reviews.
**Acceptance Criteria:**
- Write review from Game Detail (star rating + text)
- Browse reviews on Game Detail screen
- Reviews appear in Community feed
- Sort: Most recent, Highest rated, Most helpful
**Estimate:** M

### FM-072: Social Follow System [P1]
**Type:** Story
**Description:** Users can follow other users and see their activity.
**Acceptance Criteria:**
- Follow/unfollow from user profile
- Following/followers count on profile
- Activity feed shows followed users' actions
- User discovery: "Similar gamers" based on library overlap
**Estimate:** M

### FM-073: Activity Feed [P1]
**Type:** Story
**Description:** Social feed showing activity from followed users.
**Acceptance Criteria:**
- Feed items: started game, finished game, earned achievement, wrote review
- Each item links to the relevant game/review
- Infinite scroll pagination
- Pull-to-refresh
**Estimate:** M

---

## Epic 8: Gaming News (F6)

### FM-080: Fandom News Feed [P0]
**Type:** Story
**Description:** Integrate Fandom editorial/news content into the app.
**Acceptance Criteria:**
- Fetch news articles from Fandom (RSS feed or API)
- Display as cards: thumbnail, headline, source, date
- Filter by game (show news for games in user's library)
- Tap to read article (in-app WebView or parsed content)
- CC BY-SA attribution where applicable
**Estimate:** M

### FM-081: Game-Specific News [P1]
**Type:** Story
**Description:** Show news filtered to a specific game on the Game Detail page.
**Acceptance Criteria:**
- "News" section on Game Detail screen
- Filtered to that game's Fandom wiki + general gaming news
- Patch notes, updates, DLC announcements
**Estimate:** S

---

## Epic 9: Gaming Statistics (F9)

### FM-090: Stats Dashboard Screen [P1]
**Type:** Story
**Description:** Build the gaming statistics dashboard with charts and insights.
**Acceptance Criteria:**
- Total playtime: this week, this month, all time
- Playtime by genre (pie chart)
- Weekly playtime trend (line chart)
- Top 5 most-played games
- Achievement completion rate
- Platform breakdown
**Estimate:** L

### FM-091: Weekly Gaming Summary [P2]
**Type:** Story
**Description:** Generate a weekly gaming summary notification/card.
**Acceptance Criteria:**
- Weekly digest: hours played, games touched, achievements earned
- Comparison to previous week
- Shareable summary card image
**Estimate:** M

---

## Epic 10: Guides & Walkthroughs (F10)

### FM-100: Guide Viewer [P1]
**Type:** Story
**Description:** Build a step-by-step walkthrough viewer with spoiler protection.
**Acceptance Criteria:**
- Parse walkthrough/guide pages from Fandom wiki
- Present as collapsible quest/chapter sections
- Spoiler toggle: hidden content revealed on tap
- Bookmark progress within a guide
- "Next step" / "Previous step" navigation
- CC BY-SA attribution
**Estimate:** L

### FM-101: Guide Discovery [P1]
**Type:** Story
**Description:** Browse available guides for a game from the Wiki Section.
**Acceptance Criteria:**
- List of available guides/walkthroughs for a game
- Categorized: Main quest, Side quests, Collectibles, Boss guides
- Sourced from wiki category pages
**Estimate:** S

---

## Epic 11: Backend & Infrastructure

### FM-110: Backend API Setup [P0]
**Type:** Task
**Description:** Set up the Node.js (Fastify) backend with TypeScript, PostgreSQL, and Redis.
**Acceptance Criteria:**
- Fastify server with TypeScript
- PostgreSQL database with migrations (Prisma or Drizzle ORM)
- Redis for caching and rate limiting
- Health check endpoint
- CORS configured for mobile app
- Docker Compose for local development
**Estimate:** M

### FM-111: Backend Auth Middleware [P0]
**Type:** Task
**Description:** JWT validation middleware that verifies Supabase auth tokens.
**Acceptance Criteria:**
- Validate Supabase JWT on protected endpoints
- Extract user ID from token
- Reject expired/invalid tokens with 401
**Estimate:** S

### FM-112: User & Game Backend Models [P0]
**Type:** Task
**Description:** Implement backend database models and CRUD endpoints for users and games.
**Acceptance Criteria:**
- User table with profile fields
- Game table with IGDB reference
- UserGame junction table with status, playtime, rating
- REST endpoints: GET/POST/PATCH for each
- Data sync endpoint for mobile offline queue
**Estimate:** M

### FM-113: Wiki Content Cache Backend [P1]
**Type:** Task
**Description:** Optional server-side cache for popular wiki pages to reduce per-user Fandom API calls.
**Acceptance Criteria:**
- Redis cache for frequently accessed wiki pages
- Background job to pre-fetch popular pages for launch titles
- Cache invalidation on wiki revision change
- Endpoint for mobile app to fetch cached wiki content
**Estimate:** M

### FM-114: Backend Social Graph [P1]
**Type:** Task
**Description:** Follow relationships and activity event storage in the backend.
**Acceptance Criteria:**
- Follow/unfollow endpoints
- Activity event creation on game status changes
- Activity feed endpoint (paginated, filtered by following)
- User search/discovery endpoint
**Estimate:** M

---

## Epic 12: Legal & Compliance

### FM-120: CC BY-SA Attribution System [P0]
**Type:** Task
**Description:** Build the attribution system that ensures CC BY-SA 3.0 compliance on all wiki content.
**Acceptance Criteria:**
- `AttributionFooter` component auto-included in all wiki views
- Shows: wiki name, page title, "Licensed under CC BY-SA 3.0"
- Tappable link to source page and license deed
- "Attribution & Licenses" screen in Settings listing all wikis used
- Attribution manifest auto-generated from WikiCache contents
**Estimate:** S

### FM-121: Trademark Disclaimer [P0]
**Type:** Task
**Description:** Add trademark disclaimers for game names, logos, and artwork.
**Acceptance Criteria:**
- App Store listing includes trademark disclaimer
- In-app About screen lists trademark notices
- Game cover art sourced only from licensed APIs (IGDB)
- No bundled copyrighted game assets
**Estimate:** S

### FM-122: Privacy Policy & Terms [P0]
**Type:** Task
**Description:** Draft and implement privacy policy, terms of service, and GDPR/CCPA compliance.
**Acceptance Criteria:**
- Privacy policy page (in-app and web)
- Terms of service
- Data export endpoint (GDPR right to portability)
- Account deletion endpoint (GDPR right to erasure)
- Consent flows for data collection
**Estimate:** M

---

## Epic 13: Quality & Polish

### FM-130: Accessibility Audit [P1]
**Type:** Task
**Description:** Ensure WCAG 2.1 AA compliance across all screens.
**Acceptance Criteria:**
- Screen reader support (VoiceOver, TalkBack) tested on all screens
- Dynamic font sizing support
- Color contrast meets AA standards
- Touch targets minimum 44x44pt
- High-contrast mode for map overlays
- Color-blind-friendly chart palettes
**Estimate:** M

### FM-131: Performance Optimization [P1]
**Type:** Task
**Description:** Optimize app performance to meet NFR targets.
**Acceptance Criteria:**
- Cold start < 3 seconds
- Map tile load (cached) < 500ms
- Wiki page load (cached) < 300ms
- 60 FPS on map scrolling
- Image lazy loading and progressive rendering
- Bundle size analysis and optimization
**Estimate:** M

### FM-132: App Store Submission [P1]
**Type:** Task
**Description:** Prepare and submit to Apple App Store and Google Play Store.
**Acceptance Criteria:**
- App Store screenshots and descriptions
- App Store review guidelines compliance check
- TestFlight beta distributed
- Google Play internal testing track
- Store listing with proper attributions and disclaimers
**Estimate:** M

### FM-133: OSS Repository Polish [P1]
**Type:** Task
**Description:** Prepare the GitHub repository for open-source community.
**Acceptance Criteria:**
- Comprehensive README with setup instructions
- CONTRIBUTING.md with development guide
- Code of Conduct
- Issue and PR templates
- Architecture documentation
- License file (GPLv3)
**Estimate:** S

---

## Epic 14: V2.0 Features

### FM-140: Item Comparison Tool [P2]
**Type:** Story
**Description:** Side-by-side comparison of two items/weapons/armor from wiki data.
**Estimate:** M

### FM-141: Auto-Generated Checklists [P2]
**Type:** Story
**Description:** Generate collectible/completion checklists from wiki category pages.
**Estimate:** M

### FM-142: Overlay / PiP Map Mode [P2]
**Type:** Story
**Description:** Floating map window for reference while gaming on mobile.
**Estimate:** L

### FM-143: Push Notifications [P2]
**Type:** Story
**Description:** Notifications for friend activity, new wiki content, news.
**Estimate:** M

### FM-144: Fandom Contribution Flow [P2]
**Type:** Story
**Description:** Report wiki errors or suggest edits directly from the app.
**Estimate:** M

### FM-145: Community Game Registry Contributions [P2]
**Type:** Story
**Description:** Allow community members to submit new wiki-to-game registry entries.
**Estimate:** M

### FM-146: Localization (i18n) [P2]
**Type:** Task
**Description:** Add internationalization framework and first community translations.
**Estimate:** L

---

## Sprint Grouping Suggestion

### Sprint 1 (Week 1-2): Foundation
FM-001, FM-002, FM-003, FM-004, FM-025

### Sprint 2 (Week 3-4): Auth & Game Search
FM-010, FM-011, FM-020, FM-021, FM-110, FM-111

### Sprint 3 (Week 5-6): Library & Backlog
FM-022, FM-023, FM-024, FM-012, FM-112

### Sprint 4 (Week 7-8): Steam Integration
FM-030, FM-031, FM-034

### Sprint 5 (Week 9-10): Fandom Core
FM-040, FM-041, FM-042, FM-044

### Sprint 6 (Week 11-12): Wiki UI & Maps
FM-043, FM-045, FM-046

### Sprint 7 (Week 13-14): Home & Game Detail
FM-050, FM-051, FM-060, FM-080

### Sprint 8 (Week 15-16): PSN + Legal + Beta
FM-032, FM-070, FM-120, FM-121, FM-122

**Total MVP tickets: 35 | Estimated duration: ~16 weeks (4 months)**
