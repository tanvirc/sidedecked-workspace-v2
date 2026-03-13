# S02: Card Browse, Detail & Search — Pixel Perfect — Research

**Date:** 2026-03-13

## Summary

S02 owns three requirements: R002 (card browse page), R003 (card detail page), R004 (search page). The existing components are functionally complete — Algolia search works, BFF-sourced card detail renders a 3-column layout, listings display, and print selection operates. The gap is entirely visual: current rendering doesn't match the wireframes' Voltage-themed layouts, spacing, typography, and component structure.

The card browse page (`CardBrowsingPage`) is a thin 33-line wrapper that delegates everything to `AlgoliaSearchResults`. The wireframe expects a much richer page: a 5-card game selector strip, category quick-link pills, a popular sets carousel, breadcrumb bar, results bar with view toggle and sort, a sidebar filter panel, a 4-column card grid (not infinite scroll — paginated), skeleton states, empty state, trending strip, and seller CTA banner. This is the largest gap — the current browse page is structurally different from the wireframe.

The card detail page (`CardDetailPage`, 575 lines) already has the correct 3-column grid layout (`360px | 1fr | 320px`), sticky columns, breadcrumbs, print selector, game stats, price insights, printings table, rulings accordion, quick buy panel, and marketplace listings. It's the closest to its wireframe. The main visual alignment work is matching exact spacing, typography fonts/sizes, glass card backgrounds, condition chip colors, and mobile tab layout (wireframe shows Details/Prices/Sellers/Printings tabs, current code shows only a Legality tab chip).

The search page (`/search`) is another thin wrapper over `AlgoliaSearchResults`. The wireframe is structurally similar to the browse page but adds autocomplete dropdown styling, search-focused breadcrumbs, and query-aware result counts. Since both pages share `AlgoliaSearchResults`, improvements to the shared search infrastructure benefit both.

## Recommendation

**Approach: Visual alignment pass, not rebuild.** The functional layer works — Algolia integration, BFF data flow, cart actions, print switching. The work is creating new wireframe-specified components (GameSelectorStrip, PopularSetsCarousel, CategoryPills, TrendingStrip, SellerCTA) and restyling existing ones (card grid items, sidebar filters, pagination, card detail sections) to match wireframe token values.

Tackle in order of structural change required:
1. **Card browse page** (biggest gap) — restructure `CardBrowsingPage` to match wireframe layout, create new sub-components, switch from infinite scroll to pagination
2. **Card detail page** (smallest gap) — visual tweaks to existing layout, add mobile tab navigation, match glass card styling and spacing
3. **Search page** (medium gap) — restructure to match wireframe, share sidebar filter and card grid components with browse page

The browse and search wireframes share the same sidebar + grid pattern, so build shared components (sidebar filters, card grid cells, results bar) that both consume.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Card search & filtering | `AlgoliaSearchResults` + `react-instantsearch` hooks | Already wired with URL state mapping, facet groups, price presets. Modify rendering, not data layer. |
| Card image display | `CardDisplay` component (466 lines) | Handles blurhash, error fallback, multiple variants. Style the wrapper, don't rebuild image logic. |
| Price display | `PriceTag` component with `.price` CSS class | S01 established this as the single source of truth for price typography. |
| Condition colors | `getConditionChipClasses` from `lib/utils/conditionColors` | Already maps NM/LP/MP/HP/DMG to correct Voltage-themed color pairs. |
| BFF data fetching | `getCardDetailsBFF` in `lib/data/cards` | Server-side BFF aggregation already works for card detail page. |
| Game data constants | `GameSelectorGrid` GAMES array | Has game codes, display names, gradient values matching wireframe tokens. Reuse for GameSelectorStrip. |

## Existing Code and Patterns

### Browse Page
- `storefront/src/components/cards/CardBrowsingPage.tsx` (33 lines) — Thin wrapper, delegates to `AlgoliaSearchResults`. **Needs complete restructure** to match wireframe: add game strip, category pills, sets carousel, breadcrumbs, results bar, sidebar+grid layout, pagination (replacing infinite scroll), trending strip, seller CTA.
- `storefront/src/app/[locale]/(main)/cards/page.tsx` — Server component that reads game pref from cookie, passes to `CardBrowsingPage`. Cookie-based game persistence aligns with wireframe annotation "persists via cookie".
- `storefront/src/components/search/AlgoliaSearchResults.tsx` (282 lines) — Renders inline search bar, filter chips, sort control, sidebar filters, infinite-scroll card grid. Both browse and search pages use this. The inline `AlgoliaCardHit` component renders cards close to wireframe but needs styling adjustments.
- `storefront/src/components/search/SearchFilters.tsx` (184 lines) — Desktop sidebar + mobile Sheet filter. Uses `FacetGroup` for each facet. Structure matches wireframe sidebar pattern but needs visual alignment.
- `storefront/src/components/search/FacetGroup.tsx` (104 lines) — Individual facet section with collapse, search-in-filter, checkboxes. Maps to wireframe's `.filter-section` pattern.
- `storefront/src/components/cards/Pagination.tsx` (154 lines) — Pagination component exists but isn't used (infinite scroll instead). Wireframe expects numbered pagination — need to wire this in.
- `storefront/src/components/cards/CardGrid.tsx` (231 lines) — Grid with virtualization. May need simplification for wireframe's simpler 4-column layout with pagination.
- `storefront/src/components/cards/CardGridSkeleton.tsx` — Skeleton component exists, needs visual match to wireframe's pulse animation pattern.

### Card Detail Page
- `storefront/src/components/cards/CardDetailPage.tsx` (575 lines) — 3-column grid layout matches wireframe. Components: CompactPrintSelector, GameStatsDisplay, PriceInsightsSection, CompactPrintingsTable, RulingsAccordion, QuickBuyPanel, QuickSellerList. Mobile has sticky bottom action bar.
- `storefront/src/styles/card-detail.module.css` — Mobile optimizations, touch targets, animation styles. Already has glass-card-like patterns.
- `storefront/src/components/cards/QuickBuyPanel.tsx` (351 lines) — Condition selector, price display, quantity stepper, add-to-cart. Structurally matches wireframe's right column buy panel.
- `storefront/src/components/cards/QuickSellerList.tsx` (159 lines) — Seller listings with rating, condition badge, price, buy button. Matches wireframe's `<MarketplaceListingsSection>`.
- `storefront/src/components/cards/GameStatsDisplay.tsx` (264 lines) — Card details, oracle text, flavor text, legality. Matches wireframe's glass card stats block.
- `storefront/src/components/cards/PriceInsightsSection.tsx` (132 lines) — Price hero, sparkline placeholder, low/median/high stats. Matches wireframe's price insights section.
- `storefront/src/components/cards/CompactPrintingsTable.tsx` — Printings table with active row highlight. Matches wireframe's printings table.
- `storefront/src/components/cards/RulingsAccordion.tsx` (55 lines) — Rulings with expand/collapse. Matches wireframe's accordion.

### Search Page
- `storefront/src/app/[locale]/(main)/search/page.tsx` — Minimal wrapper. Needs restructure to match wireframe (breadcrumbs, results bar, sidebar+grid layout).
- `storefront/src/components/search/SearchCommandPalette.tsx` — Command palette for Ctrl+K search. The wireframe's autocomplete dropdown is shown as part of the nav bar's expanded search, which is a separate concern from the search results page.

### Shared Components (from S01)
- `storefront/src/components/homepage/GameSelectorGrid.tsx` — 4-game grid with codes, gradients, overlays matching Voltage tokens. Reuse GAMES data for the browse page's GameSelectorStrip, but strip has 5 items (includes "All Games").
- `storefront/src/components/tcg/PriceTag.tsx` — Uses `.price` CSS class. All price displays should use this.
- `storefront/src/components/tcg/CardDisplay.tsx` (466 lines) — Multi-variant card display (gallery/grid/list/compact). Used by CardGridItem.
- `storefront/src/components/tcg/GameBadge.tsx` — Game indicator badge.
- `storefront/src/components/tcg/RarityBadge.tsx` — Rarity badge with game-specific colors.

### Data Layer
- `storefront/src/types/bff.ts` — `BackendListing` type with seller rating/review count. `CardDetailBFFResponse` with card, listings, availability.
- `storefront/src/lib/algolia.ts` — Algolia client config, index names (CARDS_INDEX, price sort indices).
- `storefront/src/lib/data/cards.ts` — Card data fetching, BFF integration, image URL helpers.

## Constraints

- **Algolia is the search engine.** Both browse and search pages must use `react-instantsearch` hooks. The wireframe sidebar filters (Game, Set, Rarity, Condition, Price Range, Format, Seller Location) need to map to Algolia facets. Not all wireframe facets may exist in the Algolia index (Format, Seller Location may be missing).
- **Inline styles for Voltage tokens.** D009 established using `style={{ color: 'var(--text-tertiary)' }}` for CSS custom properties since Tailwind doesn't have utility classes for them.
- **Import conventions.** `@/` path alias, double quotes, no semicolons (project convention from `_bmad-output/project-context.md` reference).
- **Card grid responsiveness.** Wireframe specifies: desktop 4-col → 3-col @ 1024px → 2-col @ 640px. Mobile is always 2-col. Current code uses responsive classes up to 8-col. Needs simplification.
- **Pagination vs infinite scroll.** Wireframe shows numbered pagination with page buttons (1, 2, 3, …, 110). Current code uses infinite scroll via `useInfiniteHits`. This is a meaningful UX change — need to switch to `usePagination` hook from react-instantsearch.
- **678 tests must continue passing.** Any structural changes to components that have tests must not break existing test expectations.
- **BFF endpoint working.** Card detail data comes from `/api/cards/:id` which aggregates catalog + listings. No changes needed to data layer.
- **Cookie-based game preference.** The `sd_game_pref` cookie already persists game selection, matching wireframe annotation.

## Common Pitfalls

- **Breaking Algolia URL state.** The `createCardsStateMapping` function carefully maps URL params to Algolia state. Switching from `useInfiniteHits` to `usePagination` + `useHits` requires updating this mapping to include `page` parameter without breaking existing routes.
- **Virtualized grid removal.** `CardGrid` uses `VirtualizedGrid` for performance. With pagination (20-48 items per page), virtualization is unnecessary and adds complexity. But `CardGrid` is used by the deck builder's embedded card browser too — changes must not break that.
- **Mobile filter Sheet state.** `SearchFilters` uses the shadcn Sheet for mobile filters. The wireframe shows a custom bottom sheet with handle, sections, radio buttons, and Apply/Clear actions — a different visual pattern than the current Sheet content.
- **Game selector strip cookie sync.** The game strip selection should both reflect and update the `sd_game_pref` cookie, and also sync with Algolia's `game` facet refinement. Two-way binding between UI strip and Algolia state is tricky.
- **Skeleton timing.** Wireframe annotation says skeletons show "during filter changes". Current code only shows skeleton on initial load. Need to show during any loading state without causing flash-of-skeleton for fast responses.
- **Related cards section on detail page.** Wireframe shows "You Might Also Like" section with horizontal scroll of related cards. Current code doesn't have this — it's a new component that needs a data source (possibly Algolia's `relatedProducts` or a simple same-set query).

## Open Risks

- **Algolia facet availability.** Wireframe shows Format and Seller Location filters. These facets may not exist in the Algolia index. Need to verify during implementation — if missing, either add them to the index configuration or omit those filter sections.
- **Popular sets data source.** Wireframe shows "Popular Sets (MTG)" carousel that changes per game. This needs an API or static data source. May need a BFF endpoint or hardcoded popular sets per game for MVP.
- **Trending strip data.** The browse page wireframe includes a trending strip identical to the homepage's. This connects to S04's scope (R022). For S02, we can create the `TrendingStrip` component with mock/placeholder data and let S04 wire it to live data. Or share the component.
- **Card grid cell wireframe vs current.** The wireframe card cell includes: game indicator dot+text, card image, name, set, condition badge, price, seller name + stars, and "Add to Cart" button. Current `AlgoliaCardHit` shows: game badge, name, set, price tag (via PriceTag). Missing: condition badge, seller info, add-to-cart button. These may not be available in the Algolia hit data — condition and seller are listing-level data, not card-level.
- **Test refactoring.** `CardBrowsingPage.test.tsx` has tests that assert `AlgoliaSearchResults` renders as a direct child. Restructuring the browse page will require updating these tests.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Algolia InstantSearch | `sickn33/antigravity-awesome-skills@algolia-search` | available (282 installs) |
| Algolia InstantSearch | `davila7/claude-code-templates@algolia-search` | available (116 installs) |
| Next.js App Router | `wshobson/agents@nextjs-app-router-patterns` | available (8.1K installs) |
| Tailwind CSS | `josiahsiegel/claude-plugin-marketplace@tailwindcss-advanced-layouts` | available (2.3K installs) |
| Frontend Design | `frontend-design` | installed |

## Sources

- `docs/plans/wireframes/storefront-cards.html` — Card browse wireframe with desktop (1440px) and mobile (390px) frames showing full page structure
- `docs/plans/wireframes/storefront-card-detail.html` — Card detail wireframe with 3-column desktop layout and mobile tabbed layout with sticky buy bar
- `docs/plans/wireframes/storefront-search.html` — Search results wireframe with autocomplete dropdown, sidebar filters, and grid layout
- `storefront/src/components/cards/` — 46 card components totaling ~14,691 lines
- `storefront/src/components/search/` — 11 search components with 9 test files (591 lines of component code)
- S01 summary — footer, PriceTag, and design system foundation
