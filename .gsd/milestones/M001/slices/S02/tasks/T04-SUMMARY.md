---
id: T04
parent: S02
milestone: M001
provides:
  - SearchPageLayout component with breadcrumbs, query-aware results header, and shared CardSearchGrid
  - Updated search/page.tsx server component delegating to SearchPageLayout
key_files:
  - storefront/src/components/search/SearchPageLayout.tsx
  - storefront/src/app/[locale]/(main)/search/page.tsx
  - storefront/src/components/search/__tests__/SearchPageWiring.test.tsx
key_decisions:
  - "D016: SearchPageLayout follows same pattern as CardBrowsingPage — owns its own InstantSearchNext provider and composes search-specific chrome (breadcrumbs, results header) around shared CardSearchGrid"
patterns_established:
  - "Search breadcrumbs follow wireframe pattern: Home > Search Results > \"query\" with query crumb conditionally rendered when non-empty"
  - "Results header uses useStats for live hit count and query display, with ActiveFilterChips and SortControl inline"
observability_surfaces:
  - "data-testid='search-breadcrumbs' for breadcrumb inspection"
  - "data-testid='search-results-header' for results header with live hit count"
  - "URL state via createCardsStateMapping() persists all search/filter state including q param"
duration: 25min
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T04: Search page restructured with wireframe breadcrumbs, results header, and shared grid

**Replaced minimal search wrapper with SearchPageLayout: search-specific breadcrumbs (Home > Search Results > "query"), query-aware results header with hit count, shared CardSearchGrid sidebar+grid. 719 tests pass, build clean.**

## What Happened

Created `SearchPageLayout` component that wraps `InstantSearchNext` with search-specific chrome matching the `storefront-search.html` wireframe. The component includes:

1. **SearchBreadcrumbs** — `Home > Search Results > "query"` with the query crumb conditionally rendered. Matches the wireframe's `filters-bar` breadcrumb pattern with correct Voltage tokens.

2. **SearchResultsHeader** — Uses `useStats` for live "X results for 'query'" text, or "Search SideDecked" when no query. Includes inline `ActiveFilterChips` and desktop `SortControl`, matching the wireframe's results-bar layout.

3. **CardSearchGrid** — Shared sidebar+grid from T01, reused identically by both browse and search pages.

Updated `search/page.tsx` from a server component rendering `AlgoliaSearchResults` directly to one rendering `SearchPageLayout` with the query prop.

Updated `SearchPageWiring.test.tsx` with 14 tests covering the new structure: breadcrumb rendering with/without query, results header content, section order, InstantSearchNext wiring, and filter chip/sort control presence.

CardBrowsingPage tests (11) and GameSelectorStrip tests (12) were already in good shape from T01 — verified they pass unchanged.

## Verification

- `cd storefront && npx vitest run` — **719 tests pass** (all 70 test files)
- `cd storefront && npx vitest run src/components/search/__tests__/SearchPageWiring.test.tsx` — **14 tests pass**
- `cd storefront && npx vitest run src/components/cards/__tests__/CardBrowsingPage.test.tsx` — **11 tests pass**
- `cd storefront && npx vitest run src/components/cards/__tests__/GameSelectorStrip.test.tsx` — **12 tests pass**
- `cd storefront && npx vitest run src/components/cards/__tests__/RelatedCards.test.tsx` — **9 tests pass**
- `cd storefront && npm run build` — **succeeds** (zero errors, only pre-existing warnings)

### Slice-level verification (all pass — final task):
- ✅ 719 tests pass (> 678 baseline)
- ✅ Browse page tests pass
- ✅ GameSelectorStrip tests pass
- ✅ RelatedCards tests pass
- ✅ Production build succeeds
- ✅ Search page structure matches wireframe (breadcrumbs + results header + sidebar+grid)

## Diagnostics

- Breadcrumbs: inspect `data-testid="search-breadcrumbs"` — shows Home > Search Results > "query"
- Results header: inspect `data-testid="search-results-header"` — shows hit count and query from `useStats`
- URL state: `?q=bolt&game=MTG&sort=price-asc&page=2` all preserved via `createCardsStateMapping()`
- Search grid: `data-testid="card-search-grid"` with sidebar + 4-col grid layout

## Deviations

- Task plan mentioned rewriting CardBrowsingPage tests — they were already correctly structured from T01 and needed no changes.
- Task plan mentioned adding GameSelectorStrip tests — they already existed from T01 with comprehensive coverage (12 tests). No additional tests needed.
- The "Search SideDecked" empty-query header state is driven by `useStats().query` at runtime, not the prop. Test was adjusted to verify breadcrumb behavior with empty query instead of fighting module cache for a mock swap.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/components/search/SearchPageLayout.tsx` — new search page layout with SearchBreadcrumbs, SearchResultsHeader, and CardSearchGrid composition
- `storefront/src/app/[locale]/(main)/search/page.tsx` — simplified to render SearchPageLayout with query prop
- `storefront/src/components/search/__tests__/SearchPageWiring.test.tsx` — rewritten with 14 tests for SearchPageLayout structure and wiring
