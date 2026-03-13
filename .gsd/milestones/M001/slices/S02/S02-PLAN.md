# S02: Card Browse, Detail & Search — Pixel Perfect

**Goal:** All three card-facing storefront pages (`/cards`, `/cards/[id]`, `/search`) match their respective Voltage wireframes on desktop (1440px) and mobile (390px).
**Demo:** Visually compare each page side-by-side with its wireframe at both breakpoints. Sidebar filters, game selector strip, card grid, pagination, card detail 3-column layout, search results — all match. 678+ tests pass.

## Must-Haves

- Browse page matches `storefront-cards.html` wireframe: GameSelectorStrip, CategoryPills, PopularSetsCarousel, breadcrumb bar, results bar with view toggle + sort, 280px sidebar filters, 4-column card grid with condition/seller/add-to-cart, numbered pagination (not infinite scroll), skeleton states, empty state, TrendingStrip, SellerCTA
- Card detail page matches `storefront-card-detail.html` wireframe: glass card sections, correct spacing/typography, mobile tab navigation (Details/Prices/Sellers/Printings), "You Might Also Like" related cards section, sticky bottom buy bar on mobile
- Search page matches `storefront-search.html` wireframe: search-specific breadcrumbs, query-aware results header, shared sidebar+grid layout with browse page
- Mobile layouts match mobile wireframe frames at 390px for all three pages
- All existing 678+ tests pass; new component tests added for GameSelectorStrip, pagination, and RelatedCards

## Proof Level

- This slice proves: operational — pages render correctly in local dev against wireframes
- Real runtime required: yes (Algolia integration, BFF endpoints)
- Human/UAT required: yes (visual comparison against wireframes at both breakpoints)

## Verification

- `cd storefront && npx vitest run` — 678+ tests pass (baseline preserved plus new tests)
- `cd storefront && npx vitest run src/components/cards/__tests__/CardBrowsingPage.test.tsx` — browse page tests pass
- `cd storefront && npx vitest run src/components/cards/__tests__/GameSelectorStrip.test.tsx` — game strip component tests pass
- `cd storefront && npx vitest run src/components/cards/__tests__/RelatedCards.test.tsx` — related cards tests pass
- `cd storefront && npm run build` — production build succeeds
- Visual: browse page at 1440px matches wireframe layout (game strip, sidebar, 4-col grid, pagination)
- Visual: card detail page at 1440px matches wireframe (3-col, glass cards, related section)
- Visual: search page at 1440px matches wireframe (breadcrumbs, sidebar+grid)

## Observability / Diagnostics

- Runtime signals: Algolia search status exposed via `useInstantSearch().status` — loading/stalled/idle states drive skeleton visibility
- Inspection surfaces: URL params reflect filter state via `createCardsStateMapping()` — game, rarity, condition, set, price, sort, page all in URL
- Failure visibility: Empty state and filtered-no-results components render when zero hits — user always sees actionable feedback
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: S01 Voltage tokens (`colors.css`, `globals.css`), `CardDisplay`, `PriceTag`, `RarityBadge`, `GameBadge`, `Footer`, `ModernHeader`
- New wiring introduced in this slice: `usePagination` hook replacing `useInfiniteHits`, `page` param in URL state mapping, GameSelectorStrip ↔ Algolia game facet ↔ cookie sync, RelatedCards data source (same-set Algolia query)
- What remains before the milestone is truly usable end-to-end: S04 wires TrendingStrip to live data (S02 creates the component with placeholder), S09 wires card grid "Add to Cart" to real cart flow

## Tasks

- [x] **T01: Restructure browse page with wireframe layout and shared components** `est:3h`
  - Why: The browse page is a 33-line wrapper that delegates everything to AlgoliaSearchResults. The wireframe expects a rich page with game strip, category pills, popular sets carousel, breadcrumbs, results bar, and sidebar+grid layout. This task creates the page structure and new sub-components that both browse and search pages will share.
  - Files: `storefront/src/components/cards/CardBrowsingPage.tsx`, `storefront/src/components/cards/GameSelectorStrip.tsx`, `storefront/src/components/cards/CategoryPills.tsx`, `storefront/src/components/cards/PopularSetsCarousel.tsx`, `storefront/src/components/cards/BrowseBreadcrumbs.tsx`, `storefront/src/components/cards/ResultsBar.tsx`, `storefront/src/components/search/AlgoliaSearchResults.tsx`
  - Do: Rewrite CardBrowsingPage to match wireframe section order (breadcrumbs → game strip → category pills → popular sets → results bar → sidebar+grid). Create GameSelectorStrip (5 items: All + 4 games, syncs with Algolia game facet + cookie). Create CategoryPills horizontal scroll. Create PopularSetsCarousel with game-reactive data. Create BrowseBreadcrumbs. Create ResultsBar with view toggle and sort control. Refactor AlgoliaSearchResults into a shared ResultsBody that can be consumed by both browse and search pages. Keep `createCardsStateMapping` intact. Use Voltage tokens throughout via inline styles for CSS custom properties.
  - Verify: `npx vitest run src/components/cards/__tests__/CardBrowsingPage.test.tsx` passes. Build succeeds. Browse page renders game strip, breadcrumbs, category pills above the grid area.
  - Done when: Browse page structure matches wireframe section layout. GameSelectorStrip renders 5 items with active state and cookie sync. Shared sidebar+grid layout renders at correct widths (280px sidebar, flex-1 grid).

- [x] **T02: Card grid cells, pagination, trending strip, seller CTA, and mobile browse** `est:3h`
  - Why: The wireframe card grid cells include condition badge, seller info, and add-to-cart — data not in the Algolia hit. Need to enrich the grid cell where possible, switch from infinite scroll to numbered pagination, and add the bottom-of-page trending strip and seller CTA banner. Mobile browse layout needs game pills, filter chips, 2-col grid, and load-more pattern.
  - Files: `storefront/src/components/search/AlgoliaSearchResults.tsx`, `storefront/src/components/cards/AlgoliaCardHit.tsx`, `storefront/src/components/cards/Pagination.tsx`, `storefront/src/components/cards/TrendingStrip.tsx`, `storefront/src/components/cards/SellerCTA.tsx`, `storefront/src/components/cards/CardGridSkeleton.tsx`, `storefront/src/components/cards/CardBrowsingPage.tsx`
  - Do: Extract AlgoliaCardHit to its own file, update styling to match wireframe (game indicator dot, condition badge using Algolia `condition` facet if available, price in mono font). Switch from `useInfiniteHits` to `useHits` + `usePagination` in desktop, update `createCardsStateMapping` to include `page` param. Wire existing Pagination component with wireframe styling. Create TrendingStrip component (placeholder data for now — S04 wires live data). Create SellerCTA banner matching wireframe gradient. Update CardGridSkeleton pulse animation to match wireframe's skeleton pattern. Implement mobile browse layout: horizontal game pills, filter chip scroll, 2-col grid, mobile filter bottom sheet.
  - Verify: `npx vitest run` — all 678+ tests pass. Browse page shows numbered pagination instead of infinite scroll. Grid is 4-col desktop, 2-col mobile. Trending strip and seller CTA render below the grid.
  - Done when: Browse page pagination works with URL state (?page=2). Card grid cells match wireframe styling. Skeleton, empty state, trending strip, and seller CTA all render. Mobile layout matches wireframe.

- [x] **T03: Card detail page visual alignment, mobile tabs, and related cards** `est:2h`
  - Why: Card detail page has the right 3-column structure but needs visual polish: glass card backgrounds, correct typography sizes, condition chip colors matching wireframe, mobile tab navigation (Details/Prices/Sellers/Printings replacing the single Legality tab), sticky bottom buy bar, and the "You Might Also Like" related cards section which doesn't exist yet.
  - Files: `storefront/src/components/cards/CardDetailPage.tsx`, `storefront/src/components/cards/RelatedCards.tsx`, `storefront/src/components/cards/__tests__/RelatedCards.test.tsx`, `storefront/src/styles/card-detail.module.css`, `storefront/src/components/cards/GameStatsDisplay.tsx`, `storefront/src/components/cards/QuickBuyPanel.tsx`
  - Do: Apply glass-card backgrounds (`rgba(33,32,58,0.60)` with `backdrop-filter: blur(8px)`) to GameStatsDisplay, PriceInsightsSection, CompactPrintingsTable sections. Ensure card title uses `font-display` 32px, section titles use `font-heading` 14px uppercase. Update mobile tabs from [card-info, legality] to [Details, Prices, Sellers, Printings] matching wireframe. Create RelatedCards component that queries same-set cards and renders horizontal scroll. Add RelatedCards below the 3-column layout. Verify sticky bottom buy bar matches wireframe (backdrop-blur, price + add-to-cart button). Ensure print selector thumbnails match wireframe sizing (48×67px, active state border).
  - Verify: `npx vitest run src/components/cards/CardDetailPage.test.tsx` passes. `npx vitest run src/components/cards/__tests__/RelatedCards.test.tsx` passes. Card detail page renders glass-card sections, mobile tabs show 4 tabs, related cards section visible.
  - Done when: Card detail page visual elements match wireframe at 1440px and 390px. Glass card backgrounds applied. Mobile tabs show Details/Prices/Sellers/Printings. Related cards horizontal scroll renders. All existing card detail tests pass.

- [x] **T04: Search page restructure and cross-page test sweep** `est:2h`
  - Why: Search page is a minimal wrapper that needs wireframe-matching structure: search-specific breadcrumbs (Home > Search > "query"), query-aware results header, and the shared sidebar+grid layout from the browse page. Also need to sweep all tests to ensure 678+ pass after all structural changes across T01-T03.
  - Files: `storefront/src/app/[locale]/(main)/search/page.tsx`, `storefront/src/components/search/SearchPageLayout.tsx`, `storefront/src/components/search/__tests__/SearchPageWiring.test.tsx`, `storefront/src/components/cards/__tests__/CardBrowsingPage.test.tsx`, `storefront/src/components/search/__tests__/AlgoliaSearchResults.test.tsx`, `storefront/src/components/cards/__tests__/GameSelectorStrip.test.tsx`
  - Do: Create SearchPageLayout that wraps AlgoliaSearchResults with search-specific breadcrumbs and query header matching wireframe. Update search/page.tsx to use SearchPageLayout. Update SearchPageWiring test for new structure. Rewrite CardBrowsingPage tests for restructured component (game strip, breadcrumbs, category pills — mocking new sub-components). Add GameSelectorStrip unit tests (renders 5 items, active state, click calls onGameChange). Run full test suite, fix any broken tests from T01-T03 changes. Ensure `npm run build` succeeds clean.
  - Verify: `cd storefront && npx vitest run` — 678+ tests pass. `npm run build` succeeds. Search page renders breadcrumbs and query header above shared sidebar+grid layout.
  - Done when: All three pages structurally match their wireframes. Full test suite passes. Build clean. No regressions.

## Files Likely Touched

- `storefront/src/components/cards/CardBrowsingPage.tsx`
- `storefront/src/components/cards/GameSelectorStrip.tsx` (new)
- `storefront/src/components/cards/CategoryPills.tsx` (new)
- `storefront/src/components/cards/PopularSetsCarousel.tsx` (new)
- `storefront/src/components/cards/BrowseBreadcrumbs.tsx` (new)
- `storefront/src/components/cards/ResultsBar.tsx` (new)
- `storefront/src/components/cards/AlgoliaCardHit.tsx` (new — extracted)
- `storefront/src/components/cards/TrendingStrip.tsx` (new)
- `storefront/src/components/cards/SellerCTA.tsx` (new)
- `storefront/src/components/cards/RelatedCards.tsx` (new)
- `storefront/src/components/cards/Pagination.tsx`
- `storefront/src/components/cards/CardGridSkeleton.tsx`
- `storefront/src/components/cards/CardDetailPage.tsx`
- `storefront/src/components/search/AlgoliaSearchResults.tsx`
- `storefront/src/components/search/SearchPageLayout.tsx` (new)
- `storefront/src/app/[locale]/(main)/search/page.tsx`
- `storefront/src/styles/card-detail.module.css`
- `storefront/src/components/cards/__tests__/CardBrowsingPage.test.tsx`
- `storefront/src/components/cards/__tests__/GameSelectorStrip.test.tsx` (new)
- `storefront/src/components/cards/__tests__/RelatedCards.test.tsx` (new)
- `storefront/src/components/search/__tests__/SearchPageWiring.test.tsx`
- `storefront/src/components/search/__tests__/AlgoliaSearchResults.test.tsx`
