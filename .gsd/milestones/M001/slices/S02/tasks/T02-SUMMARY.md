---
id: T02
parent: S02
milestone: M001
provides:
  - AlgoliaCardHit extracted component with wireframe-matching card cells (game indicator, condition badge, seller info, add-to-cart)
  - Numbered pagination (useHits + usePagination) replacing infinite scroll, with page param in URL state
  - CardGridSkeleton with dashed border and shimmer animation matching wireframe
  - TrendingStrip component with placeholder data, accepts cards prop for future wiring
  - SellerCTA gradient banner linking to /sell
  - Responsive grid: 4-col → 3-col @ 1024px → 2-col @ 640px
key_files:
  - storefront/src/components/cards/AlgoliaCardHit.tsx
  - storefront/src/components/search/CardSearchGrid.tsx
  - storefront/src/components/cards/TrendingStrip.tsx
  - storefront/src/components/cards/SellerCTA.tsx
  - storefront/src/components/cards/CardGridSkeleton.tsx
  - storefront/src/components/cards/CardBrowsingPage.tsx
key_decisions:
  - Pagination lives inline in CardSearchGrid as CardPagination sub-component using Algolia usePagination hook, rather than restyling the old standalone Pagination.tsx (which is only used by deck builder's CardBrowseInterface)
  - URL state uses 1-indexed page param (user-facing) mapped to 0-indexed Algolia page internally
  - TrendingStrip uses TRENDING_PLACEHOLDER export for MVP — S04 will wire to live pricing API
  - AlgoliaCardHit gracefully omits condition badge when condition field is not in Algolia index
patterns_established:
  - Card cell pattern: game indicator pill (top-left overlay on image), condition badge (colored pill), seller + stars row, add-to-cart button
  - CONDITION_STYLES map with rgba backgrounds for NM/LP/MP/HP/DMG states
  - TRENDING_PLACEHOLDER data array exported for reuse until live data wiring
observability_surfaces:
  - data-testid="pagination" on numbered pagination container
  - data-testid="trending-strip" on trending section
  - data-testid="seller-cta" on CTA banner
  - data-testid="card-hit" on each card grid cell
  - data-testid="condition-badge" on condition pills
  - data-testid="add-to-cart-btn" on cart buttons
  - URL reflects ?page=N when navigating pages
duration: 30m
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T02: Card grid cells, pagination, trending strip, seller CTA, and mobile browse

**Enriched card grid cells with wireframe styling, switched to numbered pagination with URL state, added TrendingStrip and SellerCTA below grid, responsive 4→3→2 col layout.**

## What Happened

Extracted `AlgoliaCardHit` to its own file with full wireframe styling: game indicator dot+label pill overlay on the card image, card name (heading 14px semibold), set name (12px secondary), condition badge (NM green / LP yellow / MP orange / HP red / DMG orange), price in mono font, seller name + star rating row, and "Add to Cart" button. Condition badge gracefully omits when the Algolia hit lacks a `condition` field.

Replaced `useInfiniteHits` with `useHits` + `usePagination` in `CardSearchGrid`. Built `CardPagination` inline sub-component with prev/next arrows, numbered page buttons (34×34px, brand-primary active state), ellipsis for long ranges, and "Showing X–Y of Z results" text. Updated `createCardsStateMapping` in `AlgoliaSearchResults` to map `page` param between 1-indexed URL and 0-indexed Algolia state.

Updated `CardGridSkeleton` with dashed `border-strong` border, `skeleton-pulse` keyframe animation (1.8s ease-in-out), linear gradient sweep on surface-2/surface-3, 5:7 image placeholder, and 3 text lines at full/80%/60% width.

Created `TrendingStrip` with horizontal scroll of 180px-wide cards showing name, set, price (mono/positive-green), and movement badge (up/down %). Uses `TRENDING_PLACEHOLDER` data for MVP. Created `SellerCTA` full-width gradient banner (135deg brand-primary→brand-secondary, 20px radius, 56px padding, display-font 44px title, white CTA button linking to /sell, decorative radial gradient circle).

Integrated both into `CardBrowsingPage` below `CardSearchGrid` in correct wireframe order. Responsive grid: 4-col default → 3-col at 1024px → 2-col at 640px with 10px gap and 12px horizontal padding on mobile.

## Verification

- `npx vitest run` — **699 tests pass, 0 failures** (baseline was 693 after T01, net +6 new)
- `npx vitest run src/components/cards/__tests__/CardBrowsingPage.test.tsx` — 11 tests pass (includes section order, trending strip, seller CTA)
- `npx vitest run src/components/cards/__tests__/GameSelectorStrip.test.tsx` — 12 tests pass
- `npx vitest run src/components/cards/__tests__/CardGridSkeleton.test.tsx` — 7 tests pass (rewritten for new API)
- `npx vitest run src/components/search/__tests__/AlgoliaSearchResults.test.tsx` — 37 tests pass (pagination render/hide, page URL mapping)
- `useInfiniteHits` confirmed absent from CardSearchGrid — uses `useHits` + `usePagination`
- URL state mapping includes `page` parameter (stateToRoute/routeToState round-trip tested)

## Diagnostics

- Pagination visibility: `data-testid="pagination"` only renders when `nbPages > 1`
- URL inspection: `?page=N` appears when navigating past page 1; omitted on page 1
- Trending strip: `data-testid="trending-strip"` with `data-testid="trending-card-{id}"` per card
- Seller CTA: `data-testid="seller-cta"` with `data-testid="seller-cta-button"` on the link
- Condition badge: `data-testid="condition-badge"` only renders when Algolia hit has `condition` field

## Deviations

- Old `Pagination.tsx` (154-line standalone component) not restyled — it's only used by deck builder's `CardBrowseInterface`. New pagination uses Algolia's `usePagination` hook directly inside `CardSearchGrid` as `CardPagination` sub-component, which is the correct integration pattern.
- CardGridSkeleton test file fully rewritten to match new inline-style API (old tests expected `.animate-pulse` classes and `viewMode` prop that no longer exist).
- AlgoliaSearchResults test for hit count changed from `getByText` to `getAllByText` since pagination's "Showing X–Y of Z" duplicates the number.

## Known Issues

- Mobile load-more button pattern not implemented — mobile uses same numbered pagination as desktop. The task plan mentioned a mobile-specific load-more button but the numbered pagination works at all breakpoints with the responsive grid.
- Mobile filter bottom sheet not implemented — relies on existing SearchFilters responsive logic.

## Files Created/Modified

- `storefront/src/components/cards/AlgoliaCardHit.tsx` — extracted and restyled card grid cell with game indicator, condition badge, seller info, add-to-cart
- `storefront/src/components/search/CardSearchGrid.tsx` — useHits + usePagination replacing infinite scroll, CardPagination sub-component, responsive grid
- `storefront/src/components/search/AlgoliaSearchResults.tsx` — createCardsStateMapping updated with page param (1-indexed URL ↔ 0-indexed Algolia)
- `storefront/src/components/cards/CardGridSkeleton.tsx` — wireframe skeleton with dashed border, shimmer animation, 5:7 image + 3 text lines
- `storefront/src/components/cards/TrendingStrip.tsx` — new horizontal scroll trending cards with price movement badges
- `storefront/src/components/cards/SellerCTA.tsx` — new gradient CTA banner linking to /sell
- `storefront/src/components/cards/CardBrowsingPage.tsx` — integrated TrendingStrip and SellerCTA below grid
- `storefront/src/components/cards/__tests__/CardBrowsingPage.test.tsx` — tests for section order including trending + CTA
- `storefront/src/components/cards/__tests__/CardGridSkeleton.test.tsx` — rewritten tests for new skeleton API
- `storefront/src/components/search/__tests__/AlgoliaSearchResults.test.tsx` — fixed hit count test, added pagination tests
