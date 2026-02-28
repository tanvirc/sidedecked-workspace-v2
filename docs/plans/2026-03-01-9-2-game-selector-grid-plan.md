# Story 9.2: Game Selector Grid — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a 2×2 (mobile) / 4-column (desktop) game tile grid below the homepage trust strip so visitors can tap a game and land on the card browse page pre-filtered to that TCG.
**Story:** 9-2-game-selector-grid — `_bmad-output/implementation-artifacts/story-9-2-game-selector-grid.md`
**Domain:** Customer Experience (storefront/ + customer-backend/)
**Repos:** storefront/, customer-backend/
**Deployment:** true — both repos have end-user-visible changes
**UX Wireframe:** `_bmad-output/planning-artifacts/ux-9-2-game-selector-grid-wireframe.html`

---

## Requirements Brief (from Phase 2)

### Acceptance Criteria (clarified)

- **AC1:** Homepage shows a 2×2 (mobile < 640px) or 4-column (desktop ≥ 640px) grid of game tiles below the trust strip. Each tile: card-back image (`/public/images/card-backs/Back_of_{Game}_card.webp`) as CSS `background-image`, game-colour overlay, game name in Rajdhani 700 uppercase, listing count in DM Mono. Tile aspect ratio: `5/7` on all breakpoints. Game-colour overlays: MTG=purple rgba(139,92,246,0.58), POKEMON=yellow rgba(251,191,36,0.52), YUGIOH=gold rgba(212,168,67,0.58), OPTCG=red rgba(239,83,80,0.58).
- **AC2:** Listing counts come from `GET /api/catalog/listing-counts` (customer-backend), Redis-cached 30s TTL. Count = SKUs with `hasC2cListings OR hasB2cInventory` that are `isActive AND NOT deleted`, grouped by `gameCode`.
- **AC3:** When listing count service is unavailable, count row is omitted from the tile. Tile still renders. No error indicator, no "--", no spinner.
- **AC4:** Tapping a tile: (1) writes `sd_game_pref={GAME_CODE}` cookie (SameSite=Lax, max-age=2592000, path=/), (2) navigates to `/cards?game={GAME_CODE}`. No selected state — navigation is immediate. Cookie write is best-effort (navigation fires regardless).
- **AC5:** When navigating to `/cards` without an explicit `?game=` URL param, the page reads `sd_game_pref` cookie server-side and passes the game code to `AlgoliaSearchResults` as `initialGame` → `initialUiState.refinementList.game`. URL routing takes precedence over `initialUiState` when `?game=` is present.
- **AC6:** `Tab` to focus a tile → `Enter` fires identical action to click (cookie + navigate).

### Business Rules

- **BR1:** Game codes (cookie, URL, Algolia) are `MTG`, `POKEMON`, `YUGIOH`, `OPTCG` — matching `Game.code` in sidedecked-db and Algolia `game` facet values. No mapping layer.
- **BR2:** Cookie spec: `sd_game_pref`, SameSite=Lax, max-age=2592000 (30 days), path=/, no HttpOnly (client-side write).
- **BR3:** `aria-label` format: `"{Display Name} — {count} listings"` when count available; `"{Display Name}"` when count absent.
- **BR4:** `:active` CSS state (scale 0.97) provides touch feedback. `prefers-reduced-motion` suppresses all tile transforms.
- **BR5:** Card-back `background-color` fallback required for each tile (image load failure).
- **BR6:** "Shop by game" section label uses `var(--text-2)` (#8B93A6).

### UX Flows

1. **Page load, no cookie:** 4 tiles visible, no hover/active state, default search bar unchanged.
2. **Page load, cookie=POKEMON:** Tiles render identically — no pre-highlight on homepage.
3. **Tap tile:** Cookie write → `router.push("/cards?game=POKEMON")` → Algolia URL routing pre-filters.
4. **Direct nav to /cards (no ?game=):** Server reads cookie → `initialUiState` pre-filters Algolia.
5. **Listing count unavailable:** All 4 tiles render, count row absent, no layout impact.

---

## Technical Design (from Phase 3)

### Domain Routing

Customer Experience domain — `storefront/` + `customer-backend/` only. No mercur-db (backend/) involvement. Split-brain rule: compliant.

### New API Endpoint

```
GET /api/catalog/listing-counts     (customer-backend, no auth required)

Response 200:
{
  "counts": { "MTG": 387420, "POKEMON": 214850, "YUGIOH": 156290, "OPTCG": 42180 },
  "cachedAt": "2026-03-01T10:00:00.000Z"
}

DB query (uses idx_sku_market index):
SELECT game_code, COUNT(*) AS count
FROM catalog_skus
WHERE (has_c2c_listings = true OR has_b2c_inventory = true)
  AND is_active = true AND deleted_at IS NULL
GROUP BY game_code

Redis cache: key "listing-counts:by-game", TTL 30s
```

### Modified AlgoliaSearchResults Props

```typescript
interface AlgoliaSearchResultsProps {
  initialQuery: string
  initialGame?: string   // new — from cookie fallback in /cards/page.tsx
}
// initialUiState: { [CARDS_INDEX]: { query, refinementList: { game: initialGame ? [initialGame] : [] } } }
```

### Key Integration Points

| System | Usage |
|---|---|
| Redis | Listing count cache (30s TTL) — existing ioredis client in customer-backend |
| Algolia | `initialUiState.refinementList.game` + URL routing (`?game=MTG`) — existing stateMapping handles it |
| `cookies()` (next/headers) | AC5: server-side cookie read in `/cards/page.tsx` |
| `document.cookie` | AC4: client-side write in `GameTile.tsx` |

---

## Task 1: Verify card-back assets and add listing-counts API route (customer-backend)

**Files:**
- `customer-backend/src/routes/catalog.ts` — add `GET /api/catalog/listing-counts`
- `customer-backend/src/__tests__/routes/catalog.listing-counts.test.ts` — **NEW**

**Steps (TDD):**
1. Write failing test: `GET /api/catalog/listing-counts` returns `{ counts: { MTG: number, ... }, cachedAt: string }` with 200
2. Write failing test: when Redis has cached value, returns cached data without hitting DB
3. Write failing test: when DB query fails, returns 503
4. Run tests → confirm all 3 fail
5. Implement route in `catalog.ts`:
   - Try Redis get `"listing-counts:by-game"` → if hit, parse and return
   - On miss: query `catalog_skus` with the GROUP BY gameCode query
   - Set Redis key with 30s TTL, return result
   - On any error: return 503
6. Run tests → confirm all pass
7. Run `npm run lint && npm run typecheck && npm run build && npm test` in customer-backend/
8. Commit: `feat(catalog): add game listing-counts endpoint with Redis cache`

**Verify card-back assets (no code change needed):**
- Confirm `/public/images/card-backs/` contains: `Back_of_MTG_card.webp`, `Back_of_pokemon_card.webp`, `Back_of_Yu-Gi-Oh_card.webp`, `Back_of_OnePiece_card.webp` ✓ (already confirmed during discovery)

---

## Task 2: Add fetchGameListingCounts to customer-backend API client (storefront)

**Files:**
- `storefront/src/lib/api/customer-backend.ts` — add `fetchGameListingCounts()`
- `storefront/src/lib/api/__tests__/customer-backend.listing-counts.test.ts` — **NEW** (or add to existing test file)

**Steps (TDD):**
1. Write failing test: `fetchGameListingCounts()` returns `GameListingCounts` when API responds 200
2. Write failing test: returns `undefined` when API returns non-200
3. Write failing test: returns `undefined` when fetch throws (network error)
4. Run tests → confirm fail
5. Add interface + function to `customer-backend.ts`:
   ```typescript
   export interface GameListingCounts {
     counts: Record<string, number>
     cachedAt: string
   }
   export async function fetchGameListingCounts(): Promise<GameListingCounts | undefined> {
     try {
       const res = await fetch(`${CUSTOMER_BACKEND_URL}/api/catalog/listing-counts`,
         { next: { revalidate: 30 } })
       if (!res.ok) return undefined
       return res.json()
     } catch { return undefined }
   }
   ```
6. Run tests → confirm pass
7. Run quality gate in storefront/

---

## Task 3: Build GameSelectorGrid RSC and GameTile client island (storefront)

**Files:**
- `storefront/src/components/homepage/GameSelectorGrid.tsx` — **NEW** RSC
- `storefront/src/components/homepage/GameTile.tsx` — **NEW** client island (`"use client"`)
- `storefront/src/components/homepage/__tests__/GameSelectorGrid.test.tsx` — **NEW**
- `storefront/src/components/homepage/__tests__/GameTile.test.tsx` — **NEW**

### GameSelectorGrid spec

```typescript
// Server component — no "use client"
// Props: counts?: Record<string, number>  (undefined = service unavailable)
// Reads nothing from cookies (no pre-highlight state per AC5 revision)
// Renders: section with role="radiogroup" aria-label="Choose a game"
//          2×2 on mobile (grid-cols-2), 4-col on sm: (sm:grid-cols-4)
//          4 GameTile children — one per game
```

**Game config (defined once in this file or a shared constant):**
```typescript
const GAMES = [
  { code: 'MTG',     display: 'MTG',       image: '/images/card-backs/Back_of_MTG_card.webp',        overlayColor: 'rgba(139,92,246,0.58)', fallbackColor: '#2d1a54' },
  { code: 'POKEMON', display: 'POKÉMON',   image: '/images/card-backs/Back_of_pokemon_card.webp',    overlayColor: 'rgba(251,191,36,0.52)', fallbackColor: '#1a3a6b' },
  { code: 'YUGIOH',  display: 'YU-GI-OH!', image: '/images/card-backs/Back_of_Yu-Gi-Oh_card.webp',   overlayColor: 'rgba(212,168,67,0.58)', fallbackColor: '#1a3054' },
  { code: 'OPTCG',   display: 'ONE PIECE', image: '/images/card-backs/Back_of_OnePiece_card.webp',   overlayColor: 'rgba(239,83,80,0.58)',  fallbackColor: '#1a1a2e' },
] as const
```

### GameTile spec

```typescript
"use client"
// Props: code, display, image, overlayColor, fallbackColor, count?: number
// onClick + onKeyDown(Enter): document.cookie write + router.push("/cards?game={code}")
// role="radio" aria-checked="false" tabIndex={0}
// aria-label: count !== undefined ? `${display} — ${count.toLocaleString()} listings` : display
// CSS: aspect-ratio 5/7, card-back CSS background-image, overlay div, content div
// :active scale(0.97), prefers-reduced-motion suppresses transform
```

**Steps (TDD):**
1. Write failing tests for `GameTile`:
   - Renders game name (Rajdhani uppercase)
   - Renders listing count when provided
   - Does NOT render count when count is undefined (AC3)
   - onClick sets cookie (`document.cookie` mock) and calls `router.push`
   - onKeyDown Enter fires same as click
   - onKeyDown non-Enter does nothing
   - aria-label includes count when present; name only when absent
2. Write failing tests for `GameSelectorGrid`:
   - Renders 4 tiles
   - Passes counts from prop to tiles
   - Has role="radiogroup" aria-label="Choose a game"
3. Run tests → confirm all fail
4. Implement `GameTile.tsx` (client island):
   - Cookie write: `document.cookie = \`sd_game_pref=${code}; max-age=2592000; path=/; SameSite=Lax\``
   - Navigation: `router.push(\`/cards?game=${code}\`)`
   - Tailwind classes: `aspect-[5/7] relative overflow-hidden rounded-2xl border border-white/10 cursor-pointer transition-all duration-[180ms] hover:-translate-y-0.5 hover:border-white/20 hover:shadow-2xl active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 motion-reduce:transform-none motion-reduce:transition-none`
5. Implement `GameSelectorGrid.tsx` (RSC)
6. Run tests → confirm all pass
7. Run quality gate in storefront/
8. Commit: `feat(homepage): add GameSelectorGrid and GameTile components`

---

## Task 4: Wire GameSelectorGrid into homepage page.tsx

**Files:**
- `storefront/src/app/[locale]/(main)/page.tsx` — replace slot comment with component

**Steps (TDD):**
1. Write failing test (or update existing page test if present): homepage renders GameSelectorGrid section
2. Run test → confirm fail
3. Edit `page.tsx`:
   - Import `GameSelectorGrid`
   - Call `fetchGameListingCounts()` (add to existing `Promise.all` or separate)
   - Replace `{/* Story 9.2: GameSelectorGrid slot */}` with `<GameSelectorGrid counts={listingCounts?.counts} />`
4. Run test → confirm pass
5. Run quality gate in storefront/
6. Commit: `feat(homepage): wire GameSelectorGrid into homepage`

---

## Task 5: Wire /cards page to read sd_game_pref cookie for Algolia pre-filter (AC5)

**Files:**
- `storefront/src/app/[locale]/(main)/cards/page.tsx` — add `game` searchParam + cookie fallback
- `storefront/src/components/search/AlgoliaSearchResults.tsx` — add `initialGame` prop
- `storefront/src/components/cards/CardBrowsingPage.tsx` — pass `initialGame` through

**Steps (TDD):**
1. Write failing test: `/cards?game=POKEMON` renders `AlgoliaSearchResults` with `initialGame="POKEMON"`
2. Write failing test: `/cards` with no `?game=` param but cookie `sd_game_pref=MTG` renders with `initialGame="MTG"`
3. Write failing test: `/cards` with both `?game=POKEMON` and cookie `sd_game_pref=MTG` uses `"POKEMON"` (URL wins)
4. Write failing test: `AlgoliaSearchResults` with `initialGame="POKEMON"` sets `initialUiState.refinementList.game = ["POKEMON"]`
5. Write failing test: `AlgoliaSearchResults` with no `initialGame` sets `initialUiState.refinementList.game = []`
6. Run tests → confirm all fail
7. Update `/cards/page.tsx`:
   ```typescript
   type Props = { searchParams: Promise<{ q?: string; game?: string }> }
   export default async function CardsPage({ searchParams }: Props) {
     const { q: query, game: gameParam } = await searchParams
     const gameCode = gameParam ?? (await cookies()).get('sd_game_pref')?.value ?? undefined
     return <CardBrowsingPage initialQuery={query} initialGame={gameCode} />
   }
   ```
8. Thread `initialGame` through `CardBrowsingPage` → `AlgoliaSearchResults`
9. Update `AlgoliaSearchResults` `initialUiState`:
   ```typescript
   initialUiState={{ [CARDS_INDEX]: {
     query: initialQuery,
     refinementList: { game: initialGame ? [initialGame] : [] }
   }}}
   ```
10. Run tests → confirm all pass
11. Run quality gate in storefront/
12. Commit: `feat(cards): pre-filter Algolia by sd_game_pref cookie (AC5)`

---

## Task 6: Quality gate — full suite across both repos

**Steps:**
1. Run in `customer-backend/`: `npm run lint && npm run typecheck && npm run build && npm test`
2. Run in `storefront/`: `npm run lint && npm run typecheck && npm run build && npm test`
3. Run coverage in both: confirm >80% on changed modules
4. Count all `[AC1]`–`[AC6]` tasks in story file → confirm all marked `[x]`
5. If any gate fails: follow `superpowers:systematic-debugging` — do NOT retry blindly
