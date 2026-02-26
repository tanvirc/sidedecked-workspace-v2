# Story 2-4: Faceted Search Filters & Sorting — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Add faceted filtering (game, set, rarity, condition, price presets, format legality) and sorting to the Algolia-powered search results page.
**Story:** `story-2-4-faceted-search-filters-sorting` — `_bmad-output/implementation-artifacts/story-2-4-faceted-search-filters-sorting.md`
**Domain:** Frontend
**Repos:** `storefront/`
**Deployment:** `needs_deploy: true` — storefront is modified
**UX Wireframe:** `_bmad-output/planning-artifacts/ux-2-4-wireframe.html`

---

## Requirements Brief (from Phase 2)

**Clarified Acceptance Criteria:**
- AC1: Facets show live Algolia counts per option, cascading as other filters are selected
- AC2: Same-facet multi-select uses OR logic; across-facet uses AND logic (e.g., Pokémon AND NM)
- AC3: Multi-filter combinations persist in URL; individual chip × removes one refinement; "Clear All" resets URL
- AC4: Sort by Relevance (default), Price Low–High, Price High–Low. Seller rating and seller location deferred to 2-5.
- AC5: Mobile — "Filters (N)" button triggers a bottom Sheet with Apply/Clear footer

**Business Rules:**
- BR1: Filter state persists in URL search params (shareable/bookmarkable)
- BR2: Condition values must match ETL-seeded enum exactly: `NM`, `LP`, `MP`, `HP`, `DMG`
- BR3: Price as presets — Under £5 / £5–20 / £20–50 / £50+ (mutually exclusive, radio-like)
- BR4: Format legality filter deferred to 2-5 (not in scope — accordion shown collapsed only if needed)

**UX Flows:**
- Desktop: persistent left sidebar (240px, sticky), accordions per facet, active filter chips below search bar
- Mobile: toolbar with filter FAB + sort button, bottom Sheet component
- Empty state (zero results after filtering): `SearchFilteredNoResults` with smart "Remove [filter]" CTA
- Algolia unavailable: degrade gracefully — show cached grid + banner, never blank page

---

## Technical Design (from Phase 3)

**Domain routing:** `storefront/` only — no `customer-backend/` or `backend/` changes.

**Split-brain:** Not affected. All filtering is client-side Algolia — no cross-DB concerns.

**Algolia prerequisites (must complete in Task 1 before any coding):**
- Create replica index `cards_catalog_price_asc` with ranking `asc(lowest_price)`
- Create replica index `cards_catalog_price_desc` with ranking `desc(lowest_price)`
- Verify facet attributes configured on `cards_catalog`: `game`, `set_name`, `rarity`, `condition`, `lowest_price`

**Key hooks used (all from `react-instantsearch`):**
- `useRefinementList` — game, set_name, rarity, condition facets (operator: `'or'` within facet)
- `useNumericMenu` — price presets (mutually exclusive ranges via numeric filters)
- `useSortBy` — sort control (index switching between replicas)
- `useCurrentRefinements` — active filter chips + clear individual
- `clearRefinements()` — clear all

**URL routing:** `routing` prop on `InstantSearchNext` using `singleIndex()` state mapping from `instantsearch.js/es/lib/routers` — produces clean URL params, read/written via Next.js router.

**Layout strategy:** Pure Tailwind responsive — `hidden md:block` on sidebar, `flex md:hidden` on filter trigger button. No JS for layout.

---

## Pre-Task: Algolia Setup (must be done before Task 1)

Before writing any code, create the price-sort replica indices in the Algolia dashboard:

1. Open Algolia dashboard → `cards_catalog` index → Replicas
2. Create **Standard replica**: `cards_catalog_price_asc`
   - Set Custom Ranking: `asc(lowest_price)`
3. Create **Standard replica**: `cards_catalog_price_desc`
   - Set Custom Ranking: `desc(lowest_price)`
4. Verify facet attributes: go to Configuration → Facets → ensure `game`, `set_name`, `rarity`, `condition`, `lowest_price` are listed as facets
5. Verify condition enum values in Algolia records match: `NM`, `LP`, `MP`, `HP`, `DMG`

---

## Task 1: Add Algolia constants and URL routing to existing infrastructure

**Files:**
- Modify: `storefront/src/lib/algolia.ts`
- Modify: `storefront/src/components/search/AlgoliaSearchResults.tsx`
- Modify: `storefront/.env` (or `.env.local`) — add two new env vars

**Steps (TDD cycle):**

1. Write failing test: `storefront/src/components/search/__tests__/SearchPageWiring.test.tsx` — add test asserting that `InstantSearchNext` is rendered with a `routing` prop (check that URL params `?game[0]=pokemon` are read on mount and set as initial refinement state)
2. Run test — confirm it fails
3. Add to `storefront/.env`:
   ```
   NEXT_PUBLIC_ALGOLIA_INDEX_CARDS_PRICE_ASC=cards_catalog_price_asc
   NEXT_PUBLIC_ALGOLIA_INDEX_CARDS_PRICE_DESC=cards_catalog_price_desc
   ```
4. Add to `storefront/src/lib/algolia.ts`:
   ```typescript
   export const CARDS_INDEX_PRICE_ASC =
     process.env.NEXT_PUBLIC_ALGOLIA_INDEX_CARDS_PRICE_ASC ?? 'cards_catalog_price_asc'
   export const CARDS_INDEX_PRICE_DESC =
     process.env.NEXT_PUBLIC_ALGOLIA_INDEX_CARDS_PRICE_DESC ?? 'cards_catalog_price_desc'
   ```
5. Add `routing` prop to `InstantSearchNext` in `AlgoliaSearchResults.tsx`:
   ```typescript
   import { singleIndex } from 'instantsearch.js/es/lib/routers'
   // ...
   <InstantSearchNext
     searchClient={algoliaClient}
     indexName={CARDS_INDEX}
     routing={{ router: history(), stateMapping: singleIndex(CARDS_INDEX) }}
     initialUiState={{ [CARDS_INDEX]: { query: initialQuery } }}
   >
   ```
6. Run test — confirm it passes
7. Run: `npm run typecheck` in `storefront/` — fix any type errors
8. Commit: `feat(search): add Algolia replica index constants and URL routing`

---

## Task 2: Build FacetGroup component (reusable accordion refinement list)

**Files:**
- Create: `storefront/src/components/search/FacetGroup.tsx`
- Create: `storefront/src/components/search/__tests__/FacetGroup.test.tsx`

**Steps (TDD):**

1. Write failing tests covering:
   - Renders facet options with counts
   - Checkbox renders checked when item is refined
   - Clicking an option calls `refine(value)`
   - Clicking a checked option calls `refine(value)` (deselects)
   - Accordion collapses/expands on header click
   - Shows active count badge when refinements exist
   - "Show more / Show less" toggle at 8+ items
2. Run tests — confirm they fail
3. Implement `FacetGroup.tsx`:
   ```typescript
   interface FacetGroupProps {
     attribute: string   // e.g. 'game', 'condition'
     title: string
     limit?: number      // default 8; 'Show more' reveals rest
     renderLabel?: (value: string) => React.ReactNode  // for condition badges, game dots
   }
   ```
   - Uses `useRefinementList({ attribute, operator: 'or', limit })` from `react-instantsearch`
   - Accordion state via `useState(true)` (open by default for Game and Condition; closed for Set, Rarity, Format)
   - Checkbox: `role="checkbox"`, `aria-checked`, visible `ring-2` focus ring on keyboard focus
   - Accordion header: `role="button"`, `aria-expanded`, `aria-controls`
4. Run tests — confirm they pass
5. Run: `npm run lint && npm run typecheck` — fix all issues
6. Commit: `feat(search): add FacetGroup accordion component`

---

## Task 3: Build PricePresets component

**Files:**
- Create: `storefront/src/components/search/PricePresets.tsx`
- Create: `storefront/src/components/search/__tests__/PricePresets.test.tsx`

**Steps (TDD):**

1. Write failing tests covering:
   - Renders 4 preset buttons with correct labels
   - Clicking a preset calls `refine(item.value)`
   - Selected preset has active visual state
   - Clicking the active preset again deselects (calls `refine` with same value)
   - Only one preset can be selected at a time (radio behaviour)
2. Run tests — confirm they fail
3. Implement `PricePresets.tsx`:
   ```typescript
   // Uses useNumericMenu from react-instantsearch
   const PRICE_PRESETS = [
     { label: 'Under £5',  start: undefined, end: 500 },   // stored as pence integers
     { label: '£5 – £20',  start: 500,       end: 2000 },
     { label: '£20 – £50', start: 2000,      end: 5000 },
     { label: '£50+',      start: 5000,      end: undefined },
   ]
   ```
   - Note: prices stored as smallest-currency-unit integers (pence). Verify unit from ETL data — if stored as pence, use values above; if stored as pounds floats, adjust.
   - Renders as button grid, `grid-cols-2` (single column below 360px via `min-[360px]:grid-cols-2`)
4. Run tests — confirm they pass
5. Run: `npm run lint && npm run typecheck`
6. Commit: `feat(search): add PricePresets component`

---

## Task 4: Build SortControl component

**Files:**
- Create: `storefront/src/components/search/SortControl.tsx`
- Create: `storefront/src/components/search/__tests__/SortControl.test.tsx`

**Steps (TDD):**

1. Write failing tests covering:
   - Renders sort options (Relevance, Price: Low to High, Price: High to Low)
   - `currentRefinement` matches the active index name
   - Selecting an option calls `refine(indexName)`
   - Disabled state renders correctly when no results
2. Run tests — confirm they fail
3. Implement `SortControl.tsx`:
   ```typescript
   import { CARDS_INDEX, CARDS_INDEX_PRICE_ASC, CARDS_INDEX_PRICE_DESC } from '@/lib/algolia'
   // Uses useSortBy from react-instantsearch
   const SORT_ITEMS = [
     { label: 'Relevance',          value: CARDS_INDEX },
     { label: 'Price: Low to High', value: CARDS_INDEX_PRICE_ASC },
     { label: 'Price: High to Low', value: CARDS_INDEX_PRICE_DESC },
   ]
   ```
   - Desktop: native `<select>` (accessible by default)
   - Mobile: active sort shown as button in toolbar (tapping cycles or opens mini-sheet — use select for MVP simplicity)
4. Run tests — confirm they pass
5. Run: `npm run lint && npm run typecheck`
6. Commit: `feat(search): add SortControl component`

---

## Task 5: Build ActiveFilterChips component

**Files:**
- Create: `storefront/src/components/search/ActiveFilterChips.tsx`
- Create: `storefront/src/components/search/__tests__/ActiveFilterChips.test.tsx`

**Steps (TDD):**

1. Write failing tests covering:
   - Returns null when no active refinements
   - Renders one chip per active refinement
   - Each chip displays a human-readable label (e.g., "Near Mint" not "NM")
   - Clicking chip × calls `refine(item)` to remove that refinement
   - "Clear All" button calls `createURL({})` or resets all
   - `aria-label` on each × button: `"Remove ${label} filter"`
2. Run tests — confirm they fail
3. Implement `ActiveFilterChips.tsx`:
   - Uses `useCurrentRefinements` from `react-instantsearch`
   - Label map: `{ NM: 'Near Mint', LP: 'Lightly Played', MP: 'Moderately Played', HP: 'Heavily Played', DMG: 'Damaged' }`
   - Chip row: `overflow-x-auto` with `scrollbar-hide` (or `[&::-webkit-scrollbar]:hidden`)
   - "Clear All" only shown when `items.length > 0`
4. Run tests — confirm they pass
5. Run: `npm run lint && npm run typecheck`
6. Commit: `feat(search): add ActiveFilterChips component`

---

## Task 6: Build SearchFilteredNoResults component

**Files:**
- Create: `storefront/src/components/search/SearchFilteredNoResults.tsx`
- Create: `storefront/src/components/search/__tests__/SearchFilteredNoResults.test.tsx`

**Steps (TDD):**

1. Write failing tests covering:
   - Renders heading "No cards match these filters"
   - Renders "Clear All Filters" button
   - "Clear All Filters" callback is called on click
   - `role="status"` and `aria-live="polite"` present for screen reader announcement
2. Run tests — confirm they fail
3. Implement `SearchFilteredNoResults.tsx`:
   ```typescript
   interface SearchFilteredNoResultsProps {
     onClearAll: () => void
   }
   ```
   - Simple centred empty state card matching wireframe design
   - `role="status"` + `aria-live="polite"` on wrapper
   - "Clear All Filters" triggers `onClearAll` prop
4. Run tests — confirm they pass
5. Run: `npm run lint && npm run typecheck`
6. Commit: `feat(search): add SearchFilteredNoResults empty state component`

---

## Task 7: Build SearchFilters container (sidebar + mobile Sheet)

**Files:**
- Create: `storefront/src/components/search/SearchFilters.tsx`
- Create: `storefront/src/components/search/__tests__/SearchFilters.test.tsx`

**Steps (TDD):**

1. Write failing tests covering:
   - Desktop: filter sidebar renders with `FacetGroup` instances for game, condition, price, set, rarity
   - Mobile: "Filters" button is visible; sheet is not open by default
   - Mobile: clicking "Filters" button opens the Sheet
   - Sheet "Apply Filters" button closes the sheet
   - Sheet "Clear All" calls `clearRefinements` and closes
   - Filter count badge shows correct number of active refinements
2. Run tests — confirm they fail
3. Implement `SearchFilters.tsx`:
   ```typescript
   // Composes FacetGroup + PricePresets + shadcn/ui Sheet
   // Desktop sidebar: className="hidden md:block w-[240px] shrink-0 sticky top-28"
   // Mobile trigger: className="flex md:hidden"
   ```
   - Facet order (sidebar + sheet): Game → Condition → Price Range → Set → Rarity → Format Legality
   - Game facet: `renderLabel` prop passes coloured game dot + name
   - Condition facet: `renderLabel` prop passes condition badge component
   - Format Legality: collapsed accordion, shown only when game refinement includes MTG or Pokemon
   - Sheet: `role="dialog"`, `aria-label="Search Filters"`, focus trap (shadcn Sheet handles this)
4. Run tests — confirm they pass
5. Run: `npm run lint && npm run typecheck`
6. Commit: `feat(search): add SearchFilters container with responsive sidebar and bottom sheet`

---

## Task 8: Wire everything into AlgoliaSearchResults + update search page layout

**Files:**
- Modify: `storefront/src/components/search/AlgoliaSearchResults.tsx`
- Modify: `storefront/src/app/[locale]/(main)/search/page.tsx`
- Modify: `storefront/src/components/search/__tests__/SearchPageWiring.test.tsx` (extend existing tests)

**Steps (TDD):**

1. Extend failing tests in `SearchPageWiring.test.tsx`:
   - Renders `SearchFilters` inside `InstantSearchNext` provider
   - Renders `ActiveFilterChips` above the results grid
   - Renders `SortControl` in the results toolbar
   - When `nbHits === 0` AND refinements exist, renders `SearchFilteredNoResults` (not `SearchNoResults`)
   - When `nbHits === 0` AND no refinements, renders `SearchNoResults` (existing behaviour unchanged)
2. Run tests — confirm they fail
3. Refactor `AlgoliaSearchResults.tsx`:
   - Add layout split: `<div className="flex gap-5">` wrapping `<SearchFilters />` + `<div className="flex-1 min-w-0">`
   - Add `<ActiveFilterChips />` above results count
   - Add `<SortControl />` in results toolbar
   - Update `ResultsBody` to check for `items.length > 0` from `useCurrentRefinements` when `nbHits === 0` to choose which empty state to render
4. Update `search/page.tsx` to pass all search params (not just `q`) — the `routing` prop in `InstantSearchNext` handles reading them, but the page needs to forward the full `searchParams` object:
   ```typescript
   const params = await searchParams
   const query = params.q ?? ""
   // routing handles the rest — no other param extraction needed in page.tsx
   ```
5. Run tests — confirm they pass
6. Run: `npm run lint && npm run typecheck && npm run build`
7. Run: `npm test` — full test suite must pass
8. Run: `npm run test:coverage` — confirm >80% coverage on all new files
9. Mark all ACs `(IMPLEMENTED)` in `_bmad-output/implementation-artifacts/story-2-4-faceted-search-filters-sorting.md`
10. Commit: `feat(search): wire faceted search filters and sorting into search results page`

---

## Verification Checklist (before claiming Phase 4 complete)

Run in `storefront/`:
```bash
npm run lint && npm run typecheck && npm run build && npm test
npm run test:coverage
```

Evidence required:
- [ ] All quality gates pass (lint, typecheck, build, test) — output shown
- [ ] Test coverage >80% on all new files in `src/components/search/`
- [ ] All 5 ACs marked `(IMPLEMENTED)` in story file
- [ ] URL params update correctly when filters are selected (manual smoke test)
- [ ] Mobile bottom sheet opens/closes (manual smoke test)
- [ ] Sort changes results order (manual smoke test — requires Algolia replica indices to exist)
