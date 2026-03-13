# S03: Deck Builder, Browser & Viewer — Pixel Perfect

**Goal:** All three deck-facing storefront pages (`/decks`, `/decks/[id]`, `/decks/builder/new` + `/decks/[id]/edit`) match their respective Voltage wireframes on desktop (1440px) and mobile (390px).
**Demo:** Visually compare each page side-by-side with its wireframe at both breakpoints. Hero section, featured carousel, game tabs, 3-col deck grid, card-fan previews, pagination, and stats banner on browser page. Visual/List/Stats tabs, mana curve, pricing on viewer page. Polished split-panel builder with wireframe toolbar. 719+ tests pass.

## Must-Haves

- Deck browser page matches `storefront-deck-browser.html` wireframe: hero section with search, featured decks carousel, game tabs filter bar, 3-column deck grid with card-fan previews + game accent bar + author + stats + social, numbered pagination, community stats banner, mobile 1-col grid with horizontal game tabs scroll
- Deck viewer page matches `storefront-deck-viewer.html` wireframe: deck header with card-fan visual, 3-tab content (Visual/List/Stats), visual view with card image grid grouped by zone, list view with table format, stats panel with mana curve + color distribution + type distribution, pricing summary, mobile tab navigation
- Deck builder page matches `storefront-deck-builder.html` wireframe: polished header toolbar, styled card browser panel, styled deck surface with zone headers, mobile bottom sheet visual alignment
- All existing 719+ tests pass; new tests added for deck browser restructure and viewer tabs
- Mobile layouts match mobile wireframe frames at 390px

## Proof Level

- This slice proves: operational — pages render correctly in local dev against wireframes
- Real runtime required: yes (deck API endpoints for browser, DnD for builder)
- Human/UAT required: yes (visual comparison against wireframes at both breakpoints)

## Verification

- `cd storefront && npx vitest run` — 719+ tests pass (baseline preserved plus new tests)
- `cd storefront && npx vitest run src/components/decks/__tests__/DeckBrowsingPage.test.tsx` — browser page tests pass
- `cd storefront && npx vitest run src/components/decks/__tests__/DeckViewPage.test.tsx` — viewer page tests pass
- `cd storefront && npm run build` — production build succeeds
- Visual: deck browser at 1440px matches wireframe (hero, featured carousel, game tabs, 3-col grid, pagination, stats banner)
- Visual: deck viewer at 1440px matches wireframe (header, visual/list/stats tabs, mana curve, pricing)
- Visual: deck builder at 1440px matches wireframe (toolbar, split panel, zone styling)

## Observability / Diagnostics

- Runtime signals: deck loading state drives skeleton visibility in browser grid
- Inspection surfaces: data-testid attributes on hero, featured carousel, game tabs, deck grid, pagination, stats banner, viewer tabs, builder toolbar
- Failure visibility: error state in DeckGrid renders with message; empty state components render when zero decks
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: S01 Voltage tokens (`colors.css`, `globals.css`), `CardDisplay`, `PriceTag`, `Footer`, `ModernHeader`
- New wiring introduced in this slice: viewer tab structure (Visual/List/Stats), deck browser hero+featured carousel, mana curve CSS chart
- What remains before the milestone is truly usable end-to-end: S09 wires "Buy Missing Cards" button to cart optimizer, S09 wires "I own this" toggle state management

## Tasks

- [ ] **T01: Deck browser hero, featured carousel, game tabs, and page restructure** `est:3h`
  - Why: DeckBrowsingPage is a flat layout with search+filters+grid. Wireframe has a rich hero section with search bar, featured decks carousel with card-fan art, game tabs filter bar (All/MTG/Pokémon/Yu-Gi-Oh!/One Piece with game-colored active states), and the grid below. This restructures the page to match.
  - Files: `storefront/src/components/decks/DeckBrowsingPage.tsx`, `storefront/src/components/decks/DeckBrowserHero.tsx` (new), `storefront/src/components/decks/FeaturedDecksCarousel.tsx` (new), `storefront/src/components/decks/DeckGameTabs.tsx` (new)
  - Do: Create DeckBrowserHero with radial gradient background, display-font headline, subtext, and search bar matching wireframe (glassmorphic input with keyboard shortcut hint). Create FeaturedDecksCarousel with horizontal scroll of 480px featured deck cards — each has card-fan art (3 fanned card placeholders), game badge, featured badge, deck name, format chip, author row, stats (card count, estimated value), social counts. Use placeholder data (no "featured" API). Create DeckGameTabs with All + 4 game tabs, each with game-colored active border-bottom + text color. Rewrite DeckBrowsingPage to compose: hero → featured carousel → game tabs + filter row → grid → pagination → stats banner. Keep existing data fetching logic. Game tabs replace the old DeckFilters game checkboxes for game selection.
  - Verify: `npx vitest run src/components/decks/__tests__/DeckBrowsingPage.test.tsx` passes. Build succeeds. Page renders hero, featured carousel, game tabs above the deck grid.
  - Done when: Browser page structure matches wireframe section layout. Hero renders with search. Featured carousel shows placeholder deck cards with card-fan art. Game tabs show 5 items with game-colored active states.

- [ ] **T02: Deck grid cards, pagination, stats banner, and mobile browser layout** `est:2h`
  - Why: Current DeckGrid uses a 4-col card with cover image. Wireframe uses a 3-col grid with card-fan preview, game-colored accent bar, deck name, game dot + format, author, description snippet, stats row (card count, price, win rate), and social counts. Also need wireframe pagination and community stats banner at the bottom.
  - Files: `storefront/src/components/decks/DeckGrid.tsx`, `storefront/src/components/decks/DeckGridCard.tsx` (new), `storefront/src/components/decks/DeckPagination.tsx` (new), `storefront/src/components/decks/CommunityStatsBanner.tsx` (new), `storefront/src/components/decks/DeckBrowsingPage.tsx`
  - Do: Create DeckGridCard matching wireframe: 4px game-colored accent bar at top, card-fan with 3 mini-card placeholders (48×67px), deck name (heading 16px), game dot + format meta, avatar + author name, 2-line description clamp, stats row (card count, mono price, win rate color-coded), social row (likes, views, copies icons). Replace DeckGrid's inline DeckCard with DeckGridCard. Change grid to 3 columns on desktop. Create DeckPagination matching wireframe (page buttons with brand-primary active, prev/next, showing count). Create CommunityStatsBanner (4-col grid with mono numbers: total decks, brewers, cards indexed, games supported — placeholder data). Wire into DeckBrowsingPage below grid. Mobile: 1-col grid, game tabs horizontal scroll, hide view toggle and description.
  - Verify: `npx vitest run` — all tests pass. Grid is 3-col desktop, 1-col mobile. Deck cards show card-fan, accent bar, stats. Pagination and stats banner render below grid.
  - Done when: Deck grid cards match wireframe styling. 3-col grid on desktop. Pagination works. Community stats banner renders.

- [ ] **T03: Deck viewer page tabs, visual view, list view, and stats panel** `est:3h`
  - Why: DeckViewPage is a flat layout showing header + stats + decklist. Wireframe has a rich header with card-fan visual, then tabbed content: Visual (card images grouped by zone), List (table with type sections, mana cost, quantity), Stats (mana curve bar chart, color distribution bar, type distribution bars, win rate / tournament results). This is the most significant structural change.
  - Files: `storefront/src/components/decks/DeckViewPage.tsx`, `storefront/src/components/decks/DeckViewerHeader.tsx` (new), `storefront/src/components/decks/DeckVisualView.tsx` (new), `storefront/src/components/decks/DeckListView.tsx` (new), `storefront/src/components/decks/DeckStatsPanel.tsx` (new), `storefront/src/components/decks/ManaCurveChart.tsx` (new), `storefront/src/components/decks/__tests__/DeckViewPage.test.tsx` (new)
  - Do: Create DeckViewerHeader with card-fan visual (3 fanned card images from deck), deck name (display 36px), format + game badges, author row, action buttons (Like, Copy, Share, Edit if owner), and social stats. Create tab bar with Visual/List/Stats tabs using the mobile tab pattern from S02 (dual-render on desktop, tab-controlled on mobile). DeckVisualView renders cards as image grid grouped by zone, with zone headers showing count. DeckListView renders a table with type-grouped rows (Creatures, Instants, etc.), quantity, card name, mana cost columns, total row. DeckStatsPanel: ManaCurveChart (CSS-only bar chart using DeckStats computation logic), color distribution horizontal stacked bar, type distribution horizontal bars, legality chips, meta/tier chips. Reuse computation logic from existing DeckStats.tsx. Add pricing summary section with total value.
  - Verify: `npx vitest run src/components/decks/__tests__/DeckViewPage.test.tsx` passes. Viewer renders header with card fan, 3 tabs, visual/list/stats content.
  - Done when: Deck viewer matches wireframe structure. Tab switching works. Mana curve renders. List view shows table format. Stats panel shows distributions.

- [ ] **T04: Deck builder visual polish, mobile alignment, and cross-page test sweep** `est:2h`
  - Why: DeckBuilderLayout has the right split-panel structure but needs wireframe polish: header toolbar styling, card browser panel background, deck surface zone headers with card count badges, and MobileDeckBuilder visual alignment (bottom sheet appearance, zone selectors). Also need final test sweep to ensure 719+ tests pass across all changes.
  - Files: `storefront/src/components/deck-builder/DeckBuilderLayout.tsx`, `storefront/src/components/deck-builder/DeckHeader.tsx`, `storefront/src/components/deck-builder/DeckSurface.tsx`, `storefront/src/components/deck-builder/DeckZone.tsx`, `storefront/src/components/deck-builder/MobileDeckBuilder.tsx`, `storefront/src/components/decks/__tests__/DeckBrowsingPage.test.tsx` (new)
  - Do: Polish DeckBuilderLayout header: ensure toolbar matches wireframe (glassmorphic header bar, game badge, deck name editable, undo/redo/import/export/save buttons with wireframe sizing). Style card browser panel border and background. Style DeckSurface zone headers to match wireframe (zone name uppercase, card count badge, collapse toggle). Style DeckZone card thumbnails to match wireframe sizing. Polish MobileDeckBuilder bottom sheet visual: zone tab bar, card add animation, stats footer. Write DeckBrowsingPage tests (hero renders, featured carousel renders, game tabs render, grid renders, data-testid presence). Run full test suite. Fix any broken tests from T01-T03.
  - Verify: `cd storefront && npx vitest run` — 719+ tests pass. `npm run build` succeeds. Builder header, panels, and zones match wireframe styling.
  - Done when: All three deck pages structurally match their wireframes. Full test suite passes. Build clean. No regressions.

## Files Likely Touched

- `storefront/src/components/decks/DeckBrowsingPage.tsx`
- `storefront/src/components/decks/DeckBrowserHero.tsx` (new)
- `storefront/src/components/decks/FeaturedDecksCarousel.tsx` (new)
- `storefront/src/components/decks/DeckGameTabs.tsx` (new)
- `storefront/src/components/decks/DeckGridCard.tsx` (new)
- `storefront/src/components/decks/DeckGrid.tsx`
- `storefront/src/components/decks/DeckPagination.tsx` (new)
- `storefront/src/components/decks/CommunityStatsBanner.tsx` (new)
- `storefront/src/components/decks/DeckViewPage.tsx`
- `storefront/src/components/decks/DeckViewerHeader.tsx` (new)
- `storefront/src/components/decks/DeckVisualView.tsx` (new)
- `storefront/src/components/decks/DeckListView.tsx` (new)
- `storefront/src/components/decks/DeckStatsPanel.tsx` (new)
- `storefront/src/components/decks/ManaCurveChart.tsx` (new)
- `storefront/src/components/deck-builder/DeckBuilderLayout.tsx`
- `storefront/src/components/deck-builder/DeckHeader.tsx`
- `storefront/src/components/deck-builder/DeckSurface.tsx`
- `storefront/src/components/deck-builder/DeckZone.tsx`
- `storefront/src/components/deck-builder/MobileDeckBuilder.tsx`
- `storefront/src/components/decks/__tests__/DeckBrowsingPage.test.tsx` (new)
- `storefront/src/components/decks/__tests__/DeckViewPage.test.tsx` (new)
