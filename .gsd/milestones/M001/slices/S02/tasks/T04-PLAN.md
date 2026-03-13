---
estimated_steps: 5
estimated_files: 7
---

# T04: Search page restructure and cross-page test sweep

**Slice:** S02 — Card Browse, Detail & Search — Pixel Perfect
**Milestone:** M001

## Description

The search page (`/search`) is currently a minimal wrapper that renders a heading and delegates to `AlgoliaSearchResults`. The wireframe specifies a structured page with search-specific breadcrumbs (Home > Search > "query"), a query-aware results header, and the same sidebar+grid layout that the browse page uses (shared `CardSearchGrid` from T01). This task also performs the final test sweep to ensure all 678+ tests pass after T01-T03 structural changes, and adds new unit tests for key new components.

## Steps

1. **Create `SearchPageLayout` component** — Wraps `InstantSearchNext` with search-specific chrome. Breadcrumbs: `Home > Search Results > "query"` (query from URL params). Results header: query-aware text ("X results for 'query'" or "Search SideDecked" when no query). Below header: shared `CardSearchGrid` from T01 providing sidebar+grid. Remove the old inline search bar since the nav's Ctrl+K palette and the pill search in the header handle search input. The search page should feel like a search results page, not a search input page.

2. **Update `search/page.tsx`** — Replace the current heading+AlgoliaSearchResults with SearchPageLayout. Pass query from searchParams. Ensure URL routing still works (q param maps to Algolia query state). The page is a server component that renders the client SearchPageLayout.

3. **Rewrite `CardBrowsingPage` tests** — The existing test asserts `AlgoliaSearchResults` renders as a direct child, but T01 restructured the browse page to compose its own layout. Update mocks: mock GameSelectorStrip, CategoryPills, PopularSetsCarousel, BrowseBreadcrumbs, ResultsBar, and CardSearchGrid as simple test-id stubs. Assert: all wireframe sections render in correct order, initialGame and initialQuery pass through to the search provider, no hardcoded gray/blue colors.

4. **Add `GameSelectorStrip` unit tests** — New test file `storefront/src/components/cards/__tests__/GameSelectorStrip.test.tsx`. Test: renders 5 game items (All Games + 4 games), active state applied to the game matching initialGame prop, clicking a game calls the onGameChange callback, "All Games" item renders first, game names match expected display strings, no hardcoded hex colors in rendered output.

5. **Run full test suite and fix regressions** — Execute `npx vitest run` and fix any failures introduced by T01-T03. Common breakages: tests that import from `AlgoliaSearchResults` expecting old exports, tests that assert on old CardBrowsingPage structure, SearchPageWiring tests that expect old search page layout. After all tests pass, run `npm run build` to confirm production build succeeds. Run `npm run lint` if available to check for lint errors.

## Must-Haves

- [ ] Search page breadcrumbs show Home > Search Results > "query" matching wireframe
- [ ] Search page uses shared sidebar+grid layout from CardSearchGrid
- [ ] SearchPageWiring tests updated for new structure
- [ ] CardBrowsingPage tests rewritten for restructured component
- [ ] GameSelectorStrip has unit tests covering render, active state, click handler
- [ ] Full test suite (678+ tests) passes
- [ ] `npm run build` succeeds

## Verification

- `cd storefront && npx vitest run` — 678+ tests pass
- `cd storefront && npx vitest run src/components/search/__tests__/SearchPageWiring.test.tsx` — search wiring tests pass
- `cd storefront && npx vitest run src/components/cards/__tests__/GameSelectorStrip.test.tsx` — game strip tests pass
- `cd storefront && npx vitest run src/components/cards/__tests__/CardBrowsingPage.test.tsx` — browse page tests pass
- `cd storefront && npm run build` — production build succeeds with zero errors
- Search page at 1440px shows breadcrumbs + query header + sidebar+grid matching wireframe

## Inputs

- `storefront/src/components/search/CardSearchGrid.tsx` — shared grid component from T01
- `storefront/src/components/search/AlgoliaSearchResults.tsx` — refactored in T01
- `storefront/src/components/cards/CardBrowsingPage.tsx` — restructured in T01
- `storefront/src/components/cards/GameSelectorStrip.tsx` — created in T01
- `docs/plans/wireframes/storefront-search.html` — authoritative visual target for search page
- All existing test files in `cards/__tests__/` and `search/__tests__/`

## Expected Output

- `storefront/src/components/search/SearchPageLayout.tsx` — new search page layout with breadcrumbs and query header
- `storefront/src/app/[locale]/(main)/search/page.tsx` — updated to use SearchPageLayout
- `storefront/src/components/cards/__tests__/CardBrowsingPage.test.tsx` — rewritten for new structure
- `storefront/src/components/cards/__tests__/GameSelectorStrip.test.tsx` — new unit tests
- `storefront/src/components/search/__tests__/SearchPageWiring.test.tsx` — updated for new search layout
- `storefront/src/components/search/__tests__/AlgoliaSearchResults.test.tsx` — updated if needed for refactored exports
