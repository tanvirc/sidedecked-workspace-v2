---
id: T01
parent: S02
milestone: M001
provides:
  - GameSelectorStrip component (5-item grid with Algolia game facet sync + cookie sync)
  - CategoryPills horizontal scroll component with active state
  - PopularSetsCarousel with per-game hardcoded set data
  - BrowseBreadcrumbs component (Home > Browse Cards)
  - ResultsBar with ActiveFilterChips, results count, view toggle, SortControl
  - CardSearchGrid shared sidebar+grid extracted from AlgoliaSearchResults
  - BrowsePageGameTracker headless component for game state observation
  - CardBrowsingPage rewritten with full wireframe section layout
  - Browse page tests (11) and GameSelectorStrip tests (12)
key_files:
  - storefront/src/components/cards/GameSelectorStrip.tsx
  - storefront/src/components/cards/CategoryPills.tsx
  - storefront/src/components/cards/PopularSetsCarousel.tsx
  - storefront/src/components/cards/BrowseBreadcrumbs.tsx
  - storefront/src/components/cards/ResultsBar.tsx
  - storefront/src/components/cards/BrowsePageGameTracker.tsx
  - storefront/src/components/cards/CardBrowsingPage.tsx
  - storefront/src/components/search/CardSearchGrid.tsx
  - storefront/src/components/search/AlgoliaSearchResults.tsx
key_decisions:
  - CardBrowsingPage now owns its own InstantSearchNext provider rather than delegating to AlgoliaSearchResults — browse page needs direct Algolia hook access for GameSelectorStrip and ResultsBar
  - BrowsePageGameTracker uses useRefinementList to observe game facet changes and report to parent via callback — avoids prop drilling from GameSelectorStrip to PopularSetsCarousel
  - CategoryPills MVP uses local state only — Algolia facet integration deferred until backend facets (is_new_release, is_trending, etc.) are available
  - GameSelectorStrip handles clearing existing refinements before applying new one via iterating items — useRefinementList doesn't have a clearAll
patterns_established:
  - Composable page layout pattern: each page (browse, search) composes its own chrome around shared CardSearchGrid
  - GameSelectorStrip exports GAME_STRIP_ITEMS data array for reuse by other components
  - Headless tracker pattern (BrowsePageGameTracker) for cross-component state derived from Algolia hooks
observability_surfaces:
  - GameSelectorStrip aria-pressed reflects active game state from Algolia facets
  - data-testid attributes on all major sections for test targeting and debugging
duration: short
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T01: Restructure browse page with wireframe layout and shared components

**Browse page restructured from 33-line wrapper to full wireframe layout with 6 new components, CardSearchGrid extracted as shared sidebar+grid, 693 tests passing (15 new).**

## What Happened

Rewrote `CardBrowsingPage` from a simple `AlgoliaSearchResults` wrapper to a fully composed page matching the wireframe section order: BrowseBreadcrumbs → GameSelectorStrip → CategoryPills → PopularSetsCarousel → ResultsBar → CardSearchGrid → placeholder divs for TrendingStrip and SellerCTA (T02 scope).

Created 6 new components:

- **GameSelectorStrip**: 5-item horizontal grid (All Games + 4 TCGs). Desktop renders a 5-column grid with gradient backgrounds, game-colored borders + glow shadows on active state. Mobile renders a scrollable pill row with dot indicators. Syncs with Algolia `game` facet via `useRefinementList` and persists selection to `sd_game_pref` cookie. Clearing to "All Games" removes the cookie. Card counts come from Algolia facet counts.

- **CategoryPills**: Horizontal scroll of 7 category pills matching wireframe. Active pill gets purple bg+border. MVP uses local state — actual Algolia facet filtering deferred until backend facets exist.

- **PopularSetsCarousel**: Horizontal scroll of set cards (200px wide, surface-1 bg). Game-reactive — receives gameCode prop and renders appropriate sets from hardcoded `POPULAR_SETS` data. Each card shows set code icon, name, card count with hover translateY effect.

- **BrowseBreadcrumbs**: Simple breadcrumb bar (Home > Browse Cards) with wireframe styling — 12px text, tertiary color, surface-1 bg, bottom border. Accepts `currentLabel` prop for reuse by search page.

- **ResultsBar**: Flex row with ActiveFilterChips + results count (left) and view toggle + sort dropdown (right). View toggle is a two-button segmented control — active button gets brand-primary bg. Uses `useStats` for hit count.

- **BrowsePageGameTracker**: Headless component that observes Algolia game facet refinements and reports active game code to parent via callback. Bridges GameSelectorStrip → PopularSetsCarousel without prop drilling.

Extracted **CardSearchGrid** from `AlgoliaSearchResults` — contains the sidebar (280px `SearchFilters`) + card hit grid (flex-1) + skeleton/empty states + load-more button. `AlgoliaSearchResults` now delegates to `CardSearchGrid` for its grid area, maintaining backward compatibility for the search page.

`CardBrowsingPage` now owns its own `InstantSearchNext` provider so it can use Algolia hooks directly in its sub-components.

## Verification

- `npx vitest run src/components/cards/__tests__/CardBrowsingPage.test.tsx` — **11 tests pass** (section order, component rendering, data-testid presence, no hardcoded colors)
- `npx vitest run src/components/cards/__tests__/GameSelectorStrip.test.tsx` — **12 tests pass** (5 items render, active state, cookie sync, refine calls, gradient uniqueness, border colors)
- `npx vitest run` — **693 tests pass across 69 files** (678 baseline + 15 new, zero regressions)
- `npm run build` — production build succeeds

### Slice-level verification status (T01 of 4):
- ✅ `npx vitest run` — 693 tests pass (exceeds 678+ baseline)
- ✅ `npx vitest run src/components/cards/__tests__/CardBrowsingPage.test.tsx` — passes
- ✅ `npx vitest run src/components/cards/__tests__/GameSelectorStrip.test.tsx` — passes
- ⏳ `npx vitest run src/components/cards/__tests__/RelatedCards.test.tsx` — T03 scope
- ✅ `npm run build` — succeeds
- ⏳ Visual verification — browser tools unavailable; layout correctness validated via test assertions on section order and component presence

## Diagnostics

- All major page sections have `data-testid` attributes: `browse-breadcrumbs`, `game-strip-desktop`, `game-strip-mobile`, `category-pills`, `popular-sets-carousel`, `results-bar`, `card-search-grid`, `view-toggle`
- GameSelectorStrip items have `data-testid="game-strip-{code}"` and `aria-pressed` for active state inspection
- Algolia search status drives skeleton visibility via `useInstantSearch().status`
- URL params reflect all filter state via `createCardsStateMapping()`

## Deviations

- Added `BrowsePageGameTracker` headless component not in original plan — needed to bridge game selection state from Algolia facets to PopularSetsCarousel without tight coupling between siblings
- `CategoryPills` uses local state instead of Algolia facets — backend doesn't have `is_new_release`, `is_trending` etc. facets yet. Visual state matches wireframe correctly.
- Removed `SearchAnalytics` and `MyDecksWidget` from browse page right sidebar — wireframe doesn't include them and the new layout doesn't have a right sidebar

## Known Issues

- CategoryPills don't actually filter results yet — waiting on backend Algolia facets
- Popular sets data is hardcoded — no API endpoint for popular/trending sets (documented in D014)
- Visual pixel-perfect verification not performed — browser tools unavailable in this environment. Section order and structure verified via tests.

## Files Created/Modified

- `storefront/src/components/cards/GameSelectorStrip.tsx` — New: 5-item game selector with Algolia facet sync, cookie sync, desktop grid + mobile pills
- `storefront/src/components/cards/CategoryPills.tsx` — New: horizontal scroll category pills with active state
- `storefront/src/components/cards/PopularSetsCarousel.tsx` — New: game-reactive set carousel with hardcoded popular sets
- `storefront/src/components/cards/BrowseBreadcrumbs.tsx` — New: breadcrumb bar (Home > Browse Cards)
- `storefront/src/components/cards/ResultsBar.tsx` — New: filter chips + count + view toggle + sort dropdown
- `storefront/src/components/cards/BrowsePageGameTracker.tsx` — New: headless Algolia game facet observer
- `storefront/src/components/cards/CardBrowsingPage.tsx` — Rewritten: full wireframe layout composing all new components
- `storefront/src/components/search/CardSearchGrid.tsx` — New: extracted shared sidebar+grid from AlgoliaSearchResults
- `storefront/src/components/search/AlgoliaSearchResults.tsx` — Refactored: delegates to CardSearchGrid for grid area
- `storefront/src/components/cards/__tests__/CardBrowsingPage.test.tsx` — Rewritten: 11 tests for restructured page
- `storefront/src/components/cards/__tests__/GameSelectorStrip.test.tsx` — New: 12 tests for game selector
