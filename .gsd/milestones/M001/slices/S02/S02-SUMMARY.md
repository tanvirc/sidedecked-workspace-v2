---
id: S02
parent: M001
milestone: M001
provides:
  - Pixel-perfect CardBrowsingPage with GameSelectorStrip, CategoryPills, PopularSetsCarousel, BrowseBreadcrumbs, ResultsBar, numbered pagination, TrendingStrip, SellerCTA
  - CardSearchGrid shared sidebar+grid layout consumed by both browse and search pages
  - AlgoliaCardHit enriched card cells with game indicator, condition badge, seller info, add-to-cart
  - Numbered pagination (useHits + usePagination) replacing infinite scroll, page param in URL state
  - Card detail glass-card blur on info sections, 4-tab mobile navigation (Details/Prices/Sellers/Printings), RelatedCards horizontal scroll
  - SearchPageLayout with search-specific breadcrumbs, query-aware results header, shared CardSearchGrid
  - CardGridSkeleton with dashed border and shimmer animation
  - TrendingStrip component with placeholder data (S04 wires live data)
  - SellerCTA gradient banner linking to /sell
requires:
  - slice: S01
    provides: Voltage tokens (colors.css, globals.css), CardDisplay, PriceTag, RarityBadge, GameBadge, Footer, ModernHeader
affects:
  - S04
  - S09
key_files:
  - storefront/src/components/cards/CardBrowsingPage.tsx
  - storefront/src/components/cards/GameSelectorStrip.tsx
  - storefront/src/components/cards/CategoryPills.tsx
  - storefront/src/components/cards/PopularSetsCarousel.tsx
  - storefront/src/components/cards/BrowseBreadcrumbs.tsx
  - storefront/src/components/cards/ResultsBar.tsx
  - storefront/src/components/cards/BrowsePageGameTracker.tsx
  - storefront/src/components/cards/AlgoliaCardHit.tsx
  - storefront/src/components/cards/TrendingStrip.tsx
  - storefront/src/components/cards/SellerCTA.tsx
  - storefront/src/components/cards/RelatedCards.tsx
  - storefront/src/components/cards/CardDetailPage.tsx
  - storefront/src/components/cards/CardGridSkeleton.tsx
  - storefront/src/components/search/CardSearchGrid.tsx
  - storefront/src/components/search/SearchPageLayout.tsx
  - storefront/src/components/search/AlgoliaSearchResults.tsx
  - storefront/src/app/[locale]/(main)/search/page.tsx
  - storefront/src/styles/card-detail.module.css
key_decisions:
  - "D011: Numbered pagination (usePagination + useHits) replacing infinite scroll — URL-addressable pages, better SEO"
  - "D012: CardSearchGrid extracted as shared sidebar+grid consumed by both browse and search pages"
  - "D013: TrendingStrip renders placeholder data in S02; S04 wires live pricing"
  - "D014: Popular sets hardcoded per game — no API endpoint exists for dynamic ranking"
  - "D015: Card detail mobile tabs use dual-render pattern — desktop hidden md:block, mobile md:hidden with tab-controlled content"
  - "D016: SearchPageLayout owns its own InstantSearchNext provider, same pattern as CardBrowsingPage"
patterns_established:
  - Composable page layout: each page (browse, search) composes its own chrome around shared CardSearchGrid
  - GameSelectorStrip exports GAME_STRIP_ITEMS for reuse; syncs with Algolia game facet + cookie
  - Headless tracker pattern (BrowsePageGameTracker) for cross-component state derived from Algolia hooks
  - Card cell pattern: game indicator pill, condition badge (CONDITION_STYLES map), seller+stars row, add-to-cart
  - Mobile tab pattern: activeTab state drives conditional rendering in md:hidden; desktop always shows all sections
  - Glass card CSS module classes (.glassCard, .glassCardStrong) for reuse across detail pages
observability_surfaces:
  - data-testid attributes on all major sections (browse-breadcrumbs, game-strip-desktop/mobile, category-pills, popular-sets-carousel, results-bar, card-search-grid, pagination, trending-strip, seller-cta, mobile-tabs, related-cards)
  - GameSelectorStrip aria-pressed reflects active game from Algolia facets
  - URL params reflect all filter + page state via createCardsStateMapping()
  - Algolia useInstantSearch().status drives skeleton visibility
  - Mobile tab active state via aria-selected="true"
drill_down_paths:
  - .gsd/milestones/M001/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T03-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T04-SUMMARY.md
duration: ~4h across 4 tasks
verification_result: passed
completed_at: 2026-03-13
---

# S02: Card Browse, Detail & Search — Pixel Perfect

**All three card-facing pages (`/cards`, `/cards/[id]`, `/search`) restructured to match Voltage wireframes with 16 new/modified components, shared CardSearchGrid, numbered pagination, glass-card blur, mobile 4-tab nav, and 719 tests passing.**

## What Happened

**T01** rewrote `CardBrowsingPage` from a 33-line `AlgoliaSearchResults` wrapper into a fully composed page matching the wireframe section order. Created 6 new components: `GameSelectorStrip` (5-item grid syncing with Algolia game facet + cookie), `CategoryPills` (horizontal scroll with active state, local filtering only — backend facets not yet available), `PopularSetsCarousel` (game-reactive set cards from hardcoded data), `BrowseBreadcrumbs`, `ResultsBar` (filter chips + count + view toggle + sort), and `BrowsePageGameTracker` (headless Algolia facet observer bridging game state between siblings). Extracted `CardSearchGrid` from `AlgoliaSearchResults` as the shared sidebar (280px) + card grid (flex-1) layout consumed by both browse and search pages.

**T02** extracted `AlgoliaCardHit` with enriched card cells: game indicator pill overlay, condition badge (NM/LP/MP/HP/DMG with color-coded backgrounds), seller + star rating row, mono-font price, and add-to-cart button. Replaced `useInfiniteHits` with `useHits` + `usePagination` for numbered pagination with URL state (`?page=N`). Created `TrendingStrip` (horizontal scroll with placeholder data — S04 wires live pricing) and `SellerCTA` (gradient banner linking to /sell). Updated `CardGridSkeleton` with dashed border and shimmer animation. Responsive grid: 4-col → 3-col @ 1024px → 2-col @ 640px.

**T03** applied `backdrop-filter: blur(8px)` to three card detail info sections (GameStatsDisplay, PriceInsightsSection, CompactPrintingsTable), expanded mobile tabs from 1 (Legality) to 4 (Details/Prices/Sellers/Printings) with dual-render pattern, and created `RelatedCards` horizontal scroll component with same-set link fallback. Fixed pre-existing build error where `CardGrid.tsx` passed unsupported `viewMode` prop to `CardGridSkeleton`.

**T04** created `SearchPageLayout` with search-specific breadcrumbs (Home > Search Results > "query"), query-aware results header using `useStats` for live hit count, and shared `CardSearchGrid`. Updated `search/page.tsx` to delegate to the new layout.

## Verification

- `cd storefront && npx vitest run` — **719 tests pass** across 70 files (678 baseline + 41 new)
- `cd storefront && npx vitest run src/components/cards/__tests__/CardBrowsingPage.test.tsx` — 11 pass
- `cd storefront && npx vitest run src/components/cards/__tests__/GameSelectorStrip.test.tsx` — 12 pass
- `cd storefront && npx vitest run src/components/cards/__tests__/RelatedCards.test.tsx` — 9 pass
- `cd storefront && npx vitest run src/components/search/__tests__/SearchPageWiring.test.tsx` — 14 pass
- `cd storefront && npm run build` — production build succeeds (zero errors)
- All `data-testid` attributes verified present via test assertions

## Requirements Advanced

- R002 (Card browse page pixel-perfect) — Browse page restructured with all wireframe sections: GameSelectorStrip, CategoryPills, PopularSetsCarousel, breadcrumbs, results bar, sidebar+grid, pagination, TrendingStrip, SellerCTA. Structural alignment complete; human visual verification pending.
- R003 (Card detail page pixel-perfect) — Glass-card blur applied, mobile 4-tab navigation implemented, RelatedCards section added. Structural alignment complete; human visual verification pending.
- R004 (Search page pixel-perfect) — Search-specific breadcrumbs, query-aware results header, shared sidebar+grid layout. Structural alignment complete; human visual verification pending.

## Requirements Validated

- None — visual comparison against wireframes at 1440px and 390px breakpoints requires human UAT before marking validated.

## New Requirements Surfaced

- None

## Requirements Invalidated or Re-scoped

- None

## Deviations

- `BrowsePageGameTracker` headless component added (not in plan) — needed to bridge game selection state from Algolia facets to PopularSetsCarousel without tight coupling.
- `CategoryPills` uses local state only — backend doesn't have `is_new_release`, `is_trending` facets yet. Visual state matches wireframe.
- Mobile browse uses same numbered pagination as desktop — plan mentioned mobile-specific load-more button, but pagination works well at all breakpoints.
- Old standalone `Pagination.tsx` not restyled — only used by deck builder's `CardBrowseInterface`. New pagination uses Algolia `usePagination` directly.
- `SearchAnalytics` and `MyDecksWidget` removed from browse page — wireframe doesn't include them in the new layout.
- Fixed pre-existing `CardGrid.tsx` bug passing unsupported `viewMode` prop to `CardGridSkeleton`.

## Known Limitations

- CategoryPills don't filter results — waiting on backend Algolia facets (`is_new_release`, `is_trending`, etc.)
- Popular sets data is hardcoded per game — no API endpoint for dynamic ranking (D014)
- TrendingStrip shows placeholder data — live pricing wired in S04
- RelatedCards component renders only when `relatedCards` prop is passed — no server-side data source wired yet; defaults to same-set link fallback
- Mobile filter bottom sheet not explicitly reimplemented — relies on existing SearchFilters responsive logic
- Visual pixel-perfect verification deferred to human UAT

## Follow-ups

- S04 wires TrendingStrip to live pricing API from customer-backend
- S09 wires card grid "Add to Cart" to real cart flow
- Backend Algolia index may need `condition` field for condition badges to render on browse grid
- RelatedCards needs server-side data source (same-set Algolia query or BFF endpoint)

## Files Created/Modified

- `storefront/src/components/cards/GameSelectorStrip.tsx` — 5-item game selector with Algolia facet sync, cookie sync, desktop grid + mobile pills
- `storefront/src/components/cards/CategoryPills.tsx` — horizontal scroll category pills with active state
- `storefront/src/components/cards/PopularSetsCarousel.tsx` — game-reactive set carousel with hardcoded popular sets
- `storefront/src/components/cards/BrowseBreadcrumbs.tsx` — breadcrumb bar (Home > Browse Cards)
- `storefront/src/components/cards/ResultsBar.tsx` — filter chips + count + view toggle + sort dropdown
- `storefront/src/components/cards/BrowsePageGameTracker.tsx` — headless Algolia game facet observer
- `storefront/src/components/cards/CardBrowsingPage.tsx` — rewritten with full wireframe layout
- `storefront/src/components/cards/AlgoliaCardHit.tsx` — extracted card cell with game indicator, condition badge, seller info, add-to-cart
- `storefront/src/components/cards/TrendingStrip.tsx` — horizontal scroll trending cards with placeholder data
- `storefront/src/components/cards/SellerCTA.tsx` — gradient CTA banner linking to /sell
- `storefront/src/components/cards/CardGridSkeleton.tsx` — wireframe skeleton with dashed border, shimmer animation
- `storefront/src/components/cards/RelatedCards.tsx` — horizontal scroll related cards with same-set fallback
- `storefront/src/components/cards/CardDetailPage.tsx` — 4-tab mobile navigation, dual-render, RelatedCards integration
- `storefront/src/components/cards/GameStatsDisplay.tsx` — added backdrop-filter blur, fixed border/letter-spacing
- `storefront/src/components/cards/PriceInsightsSection.tsx` — added backdrop-filter blur, fixed border/letter-spacing
- `storefront/src/components/cards/CompactPrintingsTable.tsx` — added backdrop-filter blur, fixed border/letter-spacing
- `storefront/src/components/cards/CardGrid.tsx` — removed unsupported viewMode prop (bug fix)
- `storefront/src/components/search/CardSearchGrid.tsx` — extracted shared sidebar+grid with usePagination
- `storefront/src/components/search/AlgoliaSearchResults.tsx` — delegates to CardSearchGrid, page param in URL mapping
- `storefront/src/components/search/SearchPageLayout.tsx` — search page layout with breadcrumbs, results header
- `storefront/src/app/[locale]/(main)/search/page.tsx` — simplified to render SearchPageLayout
- `storefront/src/styles/card-detail.module.css` — glass card, mobile tab, related card CSS module classes
- `storefront/src/components/cards/__tests__/CardBrowsingPage.test.tsx` — 11 tests for restructured browse page
- `storefront/src/components/cards/__tests__/GameSelectorStrip.test.tsx` — 12 tests for game selector
- `storefront/src/components/cards/__tests__/RelatedCards.test.tsx` — 9 tests for related cards
- `storefront/src/components/cards/__tests__/CardGridSkeleton.test.tsx` — rewritten for new skeleton API
- `storefront/src/components/search/__tests__/AlgoliaSearchResults.test.tsx` — pagination tests, page URL mapping
- `storefront/src/components/search/__tests__/SearchPageWiring.test.tsx` — 14 tests for SearchPageLayout

## Forward Intelligence

### What the next slice should know
- `CardSearchGrid` is the shared layout primitive — any page needing sidebar filters + card grid should compose around it with its own `InstantSearchNext` provider
- `TrendingStrip` accepts a `cards` prop — S04 just needs to fetch from the pricing API and pass data in
- `AlgoliaCardHit` condition badge only renders when the Algolia hit has a `condition` field — if the index doesn't include it, badges silently omit
- `createCardsStateMapping()` now maps `page` (1-indexed URL ↔ 0-indexed Algolia) in addition to all existing params

### What's fragile
- `CategoryPills` is visual-only — it doesn't actually filter. If someone adds Algolia facet integration, the local state pattern needs to be replaced with `useRefinementList`
- Dual-render pattern on card detail mobile tabs means components mount twice in JSDOM tests — tests must use `getAllByTestId` instead of `getByTestId`
- `PopularSetsCarousel` has hardcoded `POPULAR_SETS` data — adding a new game requires editing the constant

### Authoritative diagnostics
- `data-testid` attributes on all major sections make test assertions and browser inspection reliable
- URL params (`?game=MTG&page=2&sort=price-asc`) reflect complete filter state — inspect URL to verify Algolia state sync
- `useInstantSearch().status` drives skeleton visibility — check Algolia status for loading issues

### What assumptions changed
- Original plan assumed AlgoliaSearchResults would be refactored in-place — instead, CardSearchGrid was extracted as a new shared component, and AlgoliaSearchResults delegates to it. Both patterns coexist cleanly.
- Plan assumed mobile browse would use a different load-more pattern — numbered pagination works fine at all breakpoints, so mobile-specific load-more was not needed.
