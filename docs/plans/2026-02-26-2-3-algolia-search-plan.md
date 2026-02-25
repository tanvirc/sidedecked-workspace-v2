# Algolia Search Index & Card Search with Autocomplete — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Index all card prints into Algolia and wire the storefront to use Algolia for instant autocomplete and full search results.
**Story:** story-2-3 — `_bmad-output/implementation-artifacts/story-2-3-algolia-search-index-card-search-with-autocomplete.md`
**Domain:** Customer Experience
**Repos:** `customer-backend/`, `storefront/`
**Deployment:** true — storefront UI changes are user-facing
**UX Wireframe:** `_bmad-output/planning-artifacts/ux-2-3-wireframe.html`

---

## Requirements Brief (from Phase 2)

**Clarified ACs:**
- AC1: `AlgoliaIndexService.fullReindex()` indexes all `prints` (one record per print) with fields: `objectID` (print.id), `name` (card.name), `game` (game.code), `set_name` (cardSet.name), `set_code` (cardSet.code), `rarity` (print.rarity), `language` (print.language), `artist` (print.artist), `collector_number` (print.collectorNumber), `image_url` (cardImage.url), `lowest_price` (card.lowestListingPrice), `seller_count` (card.listingCount). Facets: `game`, `rarity`, `language`, `set_code`.
- AC2: `SearchCommandPalette` uses `cmdk` + Algolia `useSearchBox`/`useHits`, 200ms debounce, `hitsPerPage:5`, match highlight via `_highlightResult`. Storefront calls Algolia directly (client-side) using `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`.
- AC3: `AlgoliaSearchResults` renders `<Hits hitComponent={CardGridItem}>` — existing component. Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`.
- AC4: `PriceTag` receives `lowest_price` + `seller_count` from Algolia record. When `lowest_price === null` or `seller_count === 0`: renders "No listings".
- AC5: `SearchNoResults` checks `results.nbHits === 0`. Algolia typo tolerance on by default. Show "Did you mean [corrected]?" when `results.queryAfterRemoval` differs.

**Business rules:**
- Storefront uses read-only `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` — never the admin key
- No fallback DB search on Algolia failure — show "Search temporarily unavailable" inline
- Search works for unauthenticated users (no auth required)
- Index name: `cards_catalog` (env `ALGOLIA_INDEX_CARDS`, default already set)
- One Algolia record per **print** (not per card) — a card with 5 printings = 5 records

---

## Technical Design (from Phase 3)

**Domain routing:** Customer Experience → `customer-backend` (sidedecked-db) + `storefront`

**Data model for Algolia record:**
```typescript
interface AlgoliaCardRecord {
  objectID: string          // print.id
  name: string              // card.name
  game: string              // game.code (MTG/POKEMON/YUGIOH/OPTCG)
  set_name: string          // cardSet.name
  set_code: string          // cardSet.code
  rarity: string | null     // print.rarity
  language: string          // print.language (default 'en')
  artist: string | null     // print.artist
  collector_number: string  // print.collectorNumber
  image_url: string | null  // cardImage.url (normal face, first image)
  lowest_price: number | null  // card.lowestListingPrice (null when 0)
  seller_count: number         // card.listingCount
  card_id: string              // card.id (for navigation)
  updated_at: number           // unix timestamp for delta sync
}
```

**New customer-backend files:**
- `src/services/AlgoliaIndexService.ts`
- `src/workers/search-index-worker.ts`
- `src/routes/search.ts`

**Modified customer-backend files:**
- `src/routes/index.ts` — register `/api/search`
- `src/services/ServiceContainer.ts` — init AlgoliaIndexService

**New storefront files:**
- `src/components/search/SearchCommandPalette.tsx`
- `src/components/search/AlgoliaSearchResults.tsx`
- `src/components/search/SearchNoResults.tsx`
- `src/components/search/SearchResultsSkeleton.tsx`

**Modified storefront files:**
- `src/components/search/EnhancedSearchBar.tsx` — replace fetch with cmdk trigger
- `src/app/[locale]/(main)/search/page.tsx` — use AlgoliaSearchResults

**No database migrations.**

**New env vars:**
- customer-backend: already has `ALGOLIA_APP_ID`, `ALGOLIA_API_KEY`, `ALGOLIA_INDEX_CARDS`
- storefront: add `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`, `NEXT_PUBLIC_ALGOLIA_INDEX_CARDS`

---

## Tasks

### Task 1: AlgoliaIndexService (customer-backend)

**Files:**
- CREATE `customer-backend/src/services/AlgoliaIndexService.ts`
- CREATE `customer-backend/src/__tests__/services/AlgoliaIndexService.test.ts`

**Steps (TDD):**
1. Write failing test: `AlgoliaIndexService.buildRecord(print, card, game, cardSet, imageUrl)` returns a valid `AlgoliaCardRecord` with correct field mapping. Test `lowest_price` is `null` when `card.lowestListingPrice === 0`.
2. Run test — confirm FAIL.
3. Implement `AlgoliaIndexService`:
   - Constructor: accepts `getAlgoliaClient()` and `config.ALGOLIA_INDEX_CARDS`
   - `buildRecord(print, card, game, cardSet, imageUrl)`: maps entities → `AlgoliaCardRecord`
   - `indexPrint(printId)`: loads print + joins from DB, calls `algolia.saveObject(record)`
   - `fullReindex(gameCode?)`: paginates through all prints (1,000/batch), calls `algolia.saveObjects(batch)`. Accepts optional `gameCode` filter.
   - `updatePricing(cardId, lowestPrice, sellerCount)`: calls `algolia.partialUpdateObjects()` for all prints of that card
4. Run tests — confirm PASS.
5. Write additional tests: `fullReindex` batches correctly, `updatePricing` calls `partialUpdateObjects`, degraded mode when Algolia client is null.
6. Commit: `feat(search): add AlgoliaIndexService for catalog indexing`

---

### Task 2: search-index-worker + admin reindex route (customer-backend)

**Files:**
- CREATE `customer-backend/src/workers/search-index-worker.ts`
- CREATE `customer-backend/src/routes/search.ts`
- CREATE `customer-backend/src/__tests__/routes/search.test.ts`
- MODIFY `customer-backend/src/routes/index.ts`
- MODIFY `customer-backend/src/services/ServiceContainer.ts`

**Steps (TDD):**
1. Write failing test: `POST /api/admin/search/reindex` without `x-service-api-key` returns 401. With valid key returns `{ success: true, queued: N }`.
2. Run test — confirm FAIL.
3. Implement `src/routes/search.ts`:
   - `POST /api/admin/search/reindex` — validates `x-service-api-key` header, calls `AlgoliaIndexService.fullReindex(body.game)`, returns job count
4. Implement `src/workers/search-index-worker.ts`:
   - Processes `search-indexing` queue jobs (job data: `{ printId: string }`)
   - On each job: calls `AlgoliaIndexService.indexPrint(job.data.printId)`
   - Error handling: logs failure, allows Bull retry (3x with exponential backoff already configured)
5. Register route in `src/routes/index.ts`: `router.use('/api/search', searchRoutes)`
6. Add `AlgoliaIndexService` to `ServiceContainer.initializeServices()`
7. Run tests — confirm PASS.
8. Commit: `feat(search): add search reindex endpoint and index worker`

---

### Task 3: Storefront env + Algolia provider setup

**Files:**
- MODIFY `storefront/.env.local` (or `.env.example`) — add `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`, `NEXT_PUBLIC_ALGOLIA_INDEX_CARDS`
- CREATE `storefront/src/lib/algolia.ts` — export typed Algolia search client + index name
- CREATE `storefront/src/lib/__tests__/algolia.test.ts`

**Steps (TDD):**
1. Write failing test: `getAlgoliaSearchClient()` throws when `NEXT_PUBLIC_ALGOLIA_APP_ID` is missing. Returns configured client when env is set.
2. Run test — confirm FAIL.
3. Implement `src/lib/algolia.ts`:
   ```typescript
   import { liteClient } from 'algoliasearch/lite'
   export const algoliaClient = liteClient(
     process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
     process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
   )
   export const CARDS_INDEX = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_CARDS ?? 'cards_catalog'
   ```
4. Run tests — confirm PASS.
5. Commit: `feat(search): add Algolia client config for storefront`

---

### Task 4: SearchCommandPalette component (storefront)

**Files:**
- CREATE `storefront/src/components/search/SearchCommandPalette.tsx`
- CREATE `storefront/src/components/search/__tests__/SearchCommandPalette.test.tsx`

**Steps (TDD):**
1. Write failing tests:
   - Opens when ⌘K / Ctrl+K pressed
   - Closes on Escape
   - Renders recent searches from localStorage when query is empty
   - Renders Algolia hit suggestions when query ≥ 2 chars
   - Each suggestion shows name, set_name, game badge, lowest_price
   - Selecting a suggestion navigates to `/cards/{card_id}`
   - Pressing Enter on query navigates to `/search?q={query}`
   - `aria-label`, `role="combobox"`, `role="listbox"`, `role="option"` present
2. Run tests — confirm FAIL.
3. Implement `SearchCommandPalette`:
   - Uses `cmdk` `Command` + `CommandDialog` for overlay
   - Uses `useSearchBox` + `useHits` from `react-instantsearch` inside an `InstantSearch` provider scoped to the dialog
   - Wraps hits with `<InstantSearch client={algoliaClient} indexName={CARDS_INDEX}>`
   - Suggestion item: card thumbnail (36×50), name with `<Highlight attribute="name" hit={hit}/>`, set name, `<GameBadge game={hit.game}/>`, `<PriceTag price={hit.lowest_price} sellerCount={hit.seller_count}/>`
   - Recent searches: stored/retrieved from localStorage key `sidedecked_recent_searches`
   - Global `useEffect` listener for `⌘K`/`Ctrl+K` — sets `open` state
   - `hitsPerPage: 5` via `configure` widget
4. Run tests — confirm PASS.
5. Commit: `feat(search): add SearchCommandPalette with Algolia autocomplete`

---

### Task 5: AlgoliaSearchResults + SearchNoResults + SearchResultsSkeleton (storefront)

**Files:**
- CREATE `storefront/src/components/search/AlgoliaSearchResults.tsx`
- CREATE `storefront/src/components/search/SearchNoResults.tsx`
- CREATE `storefront/src/components/search/SearchResultsSkeleton.tsx`
- CREATE `storefront/src/components/search/__tests__/AlgoliaSearchResults.test.tsx`
- CREATE `storefront/src/components/search/__tests__/SearchNoResults.test.tsx`

**Steps (TDD):**
1. Write failing tests:
   - `AlgoliaSearchResults` renders hit count "847 results for 'charizard'"
   - Renders `CardGridItem` for each hit with mapped props
   - Renders `SearchResultsSkeleton` when `status === 'loading'`
   - Renders `SearchNoResults` when `nbHits === 0`
   - `SearchNoResults` shows "Did you mean [X]?" when `queryAfterRemoval` differs
   - `SearchNoResults` shows generic empty state when no correction available
   - `SearchResultsSkeleton` renders 20 shimmer card placeholders with correct grid layout
   - `role="alert"` on "Did you mean?" banner
2. Run tests — confirm FAIL.
3. Implement `AlgoliaSearchResults`:
   - Uses `<InstantSearchNext client={algoliaClient} indexName={CARDS_INDEX}>` (SSR-compatible)
   - `<Configure hitsPerPage={20} query={initialQuery} />`
   - `<SearchBox>` (hidden, programmatically controlled via `useSearchBox`)
   - `<Hits hitComponent={AlgoliaCardHit}>` — hit maps `objectID` → `id`, Algolia fields → `CardGridItem` props
   - Hit count from `useStats()` — "N results for 'query'"
   - Sort dropdown (Relevance only in 2-3; price replicas deferred to 2-4)
   - Pagination via `<Pagination>`, URL reflects page via `searchParams`
   - `<SearchNoResults>` rendered conditionally via `useInstantSearch().results.nbHits === 0`
4. Implement `SearchNoResults`: checks `results.queryAfterRemoval` for correction, renders banner or generic empty state
5. Implement `SearchResultsSkeleton`: 20-card shimmer grid using Midnight Forge tokens
6. Run tests — confirm PASS.
7. Commit: `feat(search): add AlgoliaSearchResults page components`

---

### Task 6: Wire up search page + update EnhancedSearchBar (storefront)

**Files:**
- MODIFY `storefront/src/app/[locale]/(main)/search/page.tsx`
- MODIFY `storefront/src/components/search/EnhancedSearchBar.tsx`
- MODIFY `storefront/src/app/layout.tsx` (add `SearchCommandPalette` globally)

**Steps (TDD):**
1. Write failing tests:
   - `search/page.tsx` renders `AlgoliaSearchResults` with `initialQuery` from `searchParams.q`
   - `EnhancedSearchBar` no longer calls `fetch('/api/search/suggestions')` — confirm no fetch mock needed
   - `EnhancedSearchBar` calls provided `onOpen` callback (or sets global state) when focused/clicked
   - `layout.tsx` renders `SearchCommandPalette` (present in DOM, closed by default)
2. Run tests — confirm FAIL.
3. Modify `search/page.tsx`:
   - Remove `SmartSearchResults` and `EnhancedSearchBar` imports
   - Replace body with `<AlgoliaSearchResults initialQuery={searchParams.q ?? ''} />`
4. Modify `EnhancedSearchBar`:
   - Remove `fetchSuggestions` function and `executeWithFeedback` call
   - On focus or click: open `SearchCommandPalette` (via context or prop callback)
   - Keep the nav-level pill UI, shortcut hint display
5. Add `<SearchCommandPalette />` to `storefront/src/app/layout.tsx` (outside locale routes, renders once globally)
6. Run tests — confirm PASS.
7. Run quality gate: `npm run lint && npm run typecheck && npm run build && npm test`
8. Commit: `feat(search): wire Algolia search to storefront search page and nav bar`

---

## Quality Gate (both repos)

```bash
# customer-backend
cd customer-backend
npm run lint && npm run typecheck && npm run build && npm test

# storefront
cd storefront
npm run lint && npm run typecheck && npm run build && npm test
```

Coverage target: >80% on all new files.

## Story File

`_bmad-output/implementation-artifacts/story-2-3-algolia-search-index-card-search-with-autocomplete.md`

Update AC status to `(IMPLEMENTED)` after each task that satisfies an AC:
- Task 1 + 2 → AC1
- Task 4 → AC2, AC5
- Task 5 + 6 → AC3, AC4
