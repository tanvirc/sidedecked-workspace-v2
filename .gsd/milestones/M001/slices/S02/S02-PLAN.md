# S02: Card Browse, Detail, Search + Deck Builder

**Goal:** Lock test coverage for the card discovery surface (browse, detail, search) and the deck builder (DeckSurface, DeckZone, DeckBuilderLayout, MobileDeckBuilder, owned-cards toggle, "Buy Missing Cards" wiring) so the slice boundary contracts are exercised and regressions are detectable.
**Demo:** `npm test` shows card browse, card detail, search, deck builder layout, DeckSurface, DeckZone (collapse/expand, card counts), MobileDeckBuilder (tap-to-add, tab switching), owned-cards toggle, and "Buy Missing Cards" button wiring all passing. `npm run typecheck && npm run build` clean.

## Must-Haves

- `CardBrowsingPage` renders correct Algolia-backed structure: GameSelectorStrip, CategoryPills, PopularSetsCarousel, BrowseBreadcrumbs, ResultsBar, numbered pagination, TrendingStrip, SellerCTA — matching `storefront-cards.html` wireframe structure
- `CardDetailPage` renders card image, game attributes, listings section (with `MarketplaceListingsSection`), print selector, 4-tab mobile layout, and graceful degradation banner when `listingsUnavailable: true`
- `SearchPageLayout` wraps Algolia `InstantSearchNext`, renders breadcrumbs + results header + `CardSearchGrid` — matching `storefront-search.html` wireframe
- `DeckBuilderLayout` renders 3-panel layout (search collapsed/expanded, deck surface, stats), "Buy Missing Cards" button visible when `getMissingCards()` returns non-empty, opens `CartOptimizerPanel` on click
- `DeckSurface` renders cards grouped by type with correct counts, tab bar (Zones/List), zone headers with collapse toggle
- `DeckZone` renders card rows with quantity controls, collapse/expand with count badge, drop target (mocked DnD)
- `MobileDeckBuilder` renders tab bar (Deck/Search/Stats), tap-to-add via search panel, "Buy Missing Cards" sticky bar
- `DeckBrowsingPage` renders hero, game tabs, 3-col deck grid, pagination, community stats
- `DeckViewPage` renders card-fan hero, Visual/List/Stats tabs, `ManaCurveChart`, pricing summary, "Buy Missing Cards" button
- Owned-cards toggle: `toggleOwned()` updates localStorage, `getMissingCards()` excludes owned SKUs — already covered by DeckBuilderOwnership tests; verify they pass
- Zero bare light-mode Tailwind classes in any S02 component

## Proof Level

- This slice proves: contract
- Real runtime required: no
- Human/UAT required: no

## Verification

- `npm test -- --run` — all test files pass
- `npm run typecheck` — zero errors
- `npm run build` — clean build
- `grep -rn "bg-white\|text-gray-900\|text-black\b\|bg-gray-[0-9]" storefront/src/components/cards/ storefront/src/components/deck-builder/ storefront/src/components/decks/` — zero matches

## Observability / Diagnostics

- Runtime signals: `DeckBuilderContext` logs `[deck-builder] syncServerOwnedCards: merged N SKUs` on collection sync
- Failure visibility: `getMissingCards()` returns empty array (not throws) when deck is null — tests should assert this edge case

## Integration Closure

- Upstream surfaces consumed: S01 `CardGridSkeleton`, `PriceTag`, `optimizeCart()`, `POST /api/optimizer/listings` BFF, `GET /api/cards/[id]` BFF
- New wiring introduced in this slice: `CartOptimizerPanel` opened from `DeckBuilderLayout` "Buy Missing Cards" button; `CartOptimizerPanel` opened from `DeckViewerHeader`; `DeckBuilderContext.getMissingCards()` feeds optimizer
- What remains before the milestone is truly usable end-to-end: auth (S04 — needed for write actions), listing wizard (S05 — needed for inventory), full runtime wiring (S06)

## Tasks

- [x] **T01: Audit and test CardBrowsingPage structure** `est:2h`
  - Why: CardBrowsingPage is the primary card discovery surface. Wireframe alignment and component structure must be locked before S03 adds homepage complexity.
  - Files: `storefront/src/components/cards/__tests__/CardBrowsingPage.test.tsx` (extend), `storefront/src/components/cards/CardBrowsingPage.tsx` (read-only audit)
  - Do: Read `docs/plans/wireframes/storefront-cards.html` and compare against `CardBrowsingPage.tsx`. Verify tests cover: GameSelectorStrip renders with game options, CategoryPills renders, PopularSetsCarousel renders, BrowseBreadcrumbs renders "Cards" breadcrumb, ResultsBar renders with hit count, TrendingStrip renders (placeholder or live), SellerCTA renders, pagination renders, Algolia `InstantSearchNext` wraps the page. Check for light-mode class leaks and fix any found. Add missing tests.
  - Verify: `npx vitest run --reporter=verbose src/components/cards/__tests__/CardBrowsingPage.test.tsx` — all pass.
  - Done when: Browse page tests cover all wireframe sections, zero light-mode class leaks.

- [x] **T02: Audit and test CardDetailPage structure** `est:2h`
  - Why: CardDetailPage is the gravitational center — every user journey converges here. The BFF degradation banner, 4-tab mobile layout, and print selector must be verified.
  - Files: `storefront/src/components/cards/CardDetailPage.test.tsx` (extend), `storefront/src/components/cards/CardDetailPage.tsx` (audit)
  - Do: Read `docs/plans/wireframes/storefront-card-detail.html`. Confirm tests cover: card image renders with alt text, game attributes section renders, `MarketplaceListingsSection` renders with listings prop, degradation banner shows when `listingsUnavailable: true` (via `MarketplaceListingsSection`), print selector (`CompactPrintSelector`) renders, `RelatedCards` renders, desktop sections visible, mobile 4-tab nav present. Fix any light-mode class leaks in `CardDetailPage.tsx`. If `CardDetailSkeleton` is used in the loading state, verify it exists or create it (see S01 follow-up).
  - Verify: `npx vitest run --reporter=verbose src/components/cards/CardDetailPage.test.tsx` — all pass.
  - Done when: Detail page tests cover image, attributes, listings section, degradation, print selector; zero light-mode leaks.

- [x] **T03: Audit and test SearchPageLayout** `est:1h`
  - Why: Search page wiring tests exist (SearchPageWiring.test.tsx) but need verification against the current wireframe structure. Confirm breadcrumbs, results header, CardSearchGrid composition are all locked.
  - Files: `storefront/src/components/search/__tests__/SearchPageWiring.test.tsx` (extend if needed), `storefront/src/components/search/SearchPageLayout.tsx` (audit)
  - Do: Read `docs/plans/wireframes/storefront-search.html`. Run existing search tests and confirm all pass. Check `SearchPageLayout.tsx` for any structural gaps vs wireframe: breadcrumbs (Home → Search Results → "query"), results header with live hit count, `CardSearchGrid` with sidebar + grid. Add any missing structural assertions. Verify Voltage token compliance.
  - Verify: `npx vitest run --reporter=verbose src/components/search/__tests__/` — all 145 pass (no regressions).
  - Done when: Search tests pass, wireframe sections confirmed present.

- [x] **T04: Write DeckBuilderLayout tests** `est:2h`
  - Why: No `__tests__` directory exists for `deck-builder/`. `DeckBuilderLayout` is the top-level composer — it wires DeckSurface, DeckSearchPanel, DeckStats, MobileDeckBuilder, and CartOptimizerPanel. The "Buy Missing Cards" button opening the optimizer is the critical path that must be tested.
  - Files: `storefront/src/components/deck-builder/__tests__/DeckBuilderLayout.test.tsx` (create)
  - Do: Mock `DeckBuilderContext` to return a deck with known cards and getMissingCards() returning 3 items. Mock `react-dnd` (`vi.mock('react-dnd', ...)`). Mock child components (DeckSurface, DeckSearchPanel, DeckStats, MobileDeckBuilder, CartOptimizerPanel) as simple stubs with data-testid. Write tests: (1) renders deck name in header, (2) renders Save button enabled when `isDirty`, (3) "Buy Missing Cards" button visible when `getMissingCards()` returns non-empty, (4) clicking "Buy Missing Cards" opens CartOptimizerPanel (passes `isOpen=true`), (5) missing cards count badge shows correct number, (6) search panel collapses/expands on toggle, (7) MobileDeckBuilder rendered on mobile breakpoint (check data-testid visible). No light-mode classes.
  - Verify: `npx vitest run --reporter=verbose src/components/deck-builder/__tests__/DeckBuilderLayout.test.tsx` — all pass.
  - Done when: 7+ tests covering layout, "Buy Missing Cards" flow, and panel toggle — all passing.

- [x] **T05: Write DeckSurface and DeckZone tests** `est:2h`
  - Why: DeckSurface groups cards by type, DeckZone handles collapse/expand, quantity controls, and DnD drop target. No tests exist for either. These are the most interaction-heavy components in S02.
  - Files: `storefront/src/components/deck-builder/__tests__/DeckSurface.test.tsx` (create), `storefront/src/components/deck-builder/__tests__/DeckZone.test.tsx` (create)
  - Do: Mock `react-dnd` — `vi.mock('react-dnd', () => ({ useDrop: () => [{ isOver: false }, vi.fn()], useDrag: () => [{ isDragging: false }, vi.fn(), vi.fn()] }))`. Mock `DeckBuilderContext`. **DeckSurface tests**: renders cards grouped by type (Creature/Instant/Land shown when cards of those types present), tab toggle switches between Zones and List views, total card count renders correctly. **DeckZone tests**: renders zone title and card count badge, clicking collapse header hides/shows card list (test with `userEvent.click`), quantity increment calls `updateCardQuantity(sku, zone, qty+1)`, quantity decrement calls `updateCardQuantity`, remove button calls `removeCard`, zone header turns amber/red based on validation errors prop. No light-mode classes in either component.
  - Verify: `npx vitest run --reporter=verbose src/components/deck-builder/__tests__/` — all pass.
  - Done when: DeckSurface tests cover type grouping + tab switching; DeckZone tests cover collapse, quantity controls, and validation state.

- [x] **T06: Write MobileDeckBuilder tests** `est:2h`
  - Why: Mobile deck builder is the primary interaction surface for mobile users. Tap-to-add (not DnD) is the mobile UX. No tests exist. This is the unproven mobile path from the roadmap.
  - Files: `storefront/src/components/deck-builder/__tests__/MobileDeckBuilder.test.tsx` (create)
  - Do: Mock `DeckBuilderContext`, `CardSearchContext`, `CardSearchProvider`, `CardHoverProvider`. Mock child search components. Write tests: (1) renders 3-tab bar (Deck/Search/Stats), (2) Deck tab shows card list grouped by type, (3) tapping Search tab shows search input, (4) tapping a search result calls `addCard(card, 'main', 1)` — this is the tap-to-add path, (5) "Buy Missing" sticky bar renders when `getMissingCards()` returns non-empty, (6) stats tab renders mana curve or stats section, (7) `MobileDeckBuilder` never renders DnD `DndProvider` (mobile uses tap-to-add, not drag).
  - Verify: `npx vitest run --reporter=verbose src/components/deck-builder/__tests__/MobileDeckBuilder.test.tsx` — all pass.
  - Done when: 7 tests covering tab switching, tap-to-add path, buy bar — all passing.

- [x] **T07: Audit DeckBrowsingPage and DeckViewPage tests** `est:1h`
  - Why: Both have test files in `decks/__tests__/` but need a pass to confirm wireframe alignment and Voltage compliance hold after S01 pattern locks.
  - Files: `storefront/src/components/decks/__tests__/DeckBrowsingPage.test.tsx` (extend if needed), `storefront/src/components/decks/__tests__/DeckViewPage.test.tsx` (extend if needed)
  - Do: Run existing tests. Read `storefront-deck-browser.html` and `storefront-deck-viewer.html` wireframes. Add any missing assertions: DeckBrowsingPage — hero renders, DeckGameTabs renders, deck grid items render, pagination present; DeckViewPage — hero with card-fan renders, Visual/List/Stats tabs present, ManaCurveChart renders in Stats tab, "Buy Missing Cards" button renders in header. Grep both for light-mode leaks and fix any found.
  - Verify: `npx vitest run --reporter=verbose src/components/decks/__tests__/` — all pass.
  - Done when: Both page tests pass with wireframe sections confirmed, zero light-mode leaks.

- [x] **T08: Full quality gate + commit** `est:30m`
  - Why: Ensure S02 ships clean — all tests pass, typecheck clean, build succeeds, no light-mode class regressions across the full cards/deck-builder/decks surface.
  - Files: no new files
  - Do: Run `npm run typecheck` and fix any type errors introduced during S02. Run `npm run build` and fix any build errors. Run `npm test -- --run` and confirm all tests pass. Run light-mode grep across `src/components/cards/`, `src/components/deck-builder/`, `src/components/decks/` and fix any matches. Commit all changes to `gsd/M001/S01` branch (storefront sub-repo).
  - Verify: `npm run typecheck` exits 0. `npm run build` exits 0. `npm test -- --run` all pass. Grep returns zero light-mode matches.
  - Done when: Quality gate green across all three checks. Changes committed to slice branch.

## Files Likely Touched

- `storefront/src/components/cards/__tests__/CardBrowsingPage.test.tsx`
- `storefront/src/components/cards/CardDetailPage.test.tsx`
- `storefront/src/components/search/__tests__/SearchPageWiring.test.tsx`
- `storefront/src/components/deck-builder/__tests__/DeckBuilderLayout.test.tsx` (new)
- `storefront/src/components/deck-builder/__tests__/DeckSurface.test.tsx` (new)
- `storefront/src/components/deck-builder/__tests__/DeckZone.test.tsx` (new)
- `storefront/src/components/deck-builder/__tests__/MobileDeckBuilder.test.tsx` (new)
- `storefront/src/components/decks/__tests__/DeckBrowsingPage.test.tsx`
- `storefront/src/components/decks/__tests__/DeckViewPage.test.tsx`
