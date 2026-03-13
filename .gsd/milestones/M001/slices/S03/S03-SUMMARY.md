---
id: S03
parent: M001
milestone: M001
provides:
  - DeckBrowsingPage restructured with hero section, featured decks carousel, game tabs, 3-col deck grid with card-fan previews, numbered pagination, community stats banner
  - DeckViewPage restructured with hero header, 3-tab navigation (Visual/List/Stats), mana curve chart, type/color distribution bars, pricing summary
  - DeckBuilderLayout polished with glassmorphic toolbar, styled card browser panel, collapsible zone headers with count badges, wireframe-sized card thumbnails
  - MobileDeckBuilder polished with glassmorphic header, game-colored badges, styled bottom navigation
  - 18 new tests (9 browse page + 9 viewer page), 742 total passing
requires:
  - slice: S01
    provides: Voltage tokens (colors.css, globals.css), CardDisplay, PriceTag, Footer, ModernHeader, Sheet
affects:
  - S09 (consumes deck builder "I own this" state, "Buy Missing Cards" button, missing cards list)
key_files:
  - storefront/src/components/decks/DeckBrowserHero.tsx
  - storefront/src/components/decks/FeaturedDecksCarousel.tsx
  - storefront/src/components/decks/DeckGameTabs.tsx
  - storefront/src/components/decks/DeckBrowsingPage.tsx
  - storefront/src/components/decks/DeckGridCard.tsx
  - storefront/src/components/decks/DeckGrid.tsx
  - storefront/src/components/decks/DeckViewPage.tsx
  - storefront/src/components/decks/DeckViewerHeader.tsx
  - storefront/src/components/decks/DeckVisualView.tsx
  - storefront/src/components/decks/DeckListView.tsx
  - storefront/src/components/decks/DeckStatsPanel.tsx
  - storefront/src/components/decks/ManaCurveChart.tsx
  - storefront/src/components/deck-builder/DeckBuilderLayout.tsx
  - storefront/src/components/deck-builder/DeckSurface.tsx
  - storefront/src/components/deck-builder/DeckZone.tsx
  - storefront/src/components/deck-builder/MobileDeckBuilder.tsx
key_decisions:
  - D017: DeckSurface uses native tab bar instead of Radix Tabs — matches wireframe glassmorphic visual language
  - D018: DeckZone collapse state is local per-zone — avoids coupling in DeckBuilderContext
  - DeckStatsPanel computes stats from cards independently of DeckBuilderContext — viewer page is standalone
  - Game tabs replace DeckFilters game checkboxes — wireframe's underlined tab pattern with game-specific colors
  - Featured carousel and community stats use placeholder data — no backend API exists for these yet
patterns_established:
  - Card-fan preview pattern: 3 fanned gradient rectangles (48×67px) at -10°/-2°/6° rotation — used in DeckGridCard, FeaturedDecksCarousel, DeckViewerHeader
  - Game-colored accent bar: 4px colored strip at top of cards — used in DeckGridCard
  - Glassmorphic toolbar: rgba(24,22,42,0.85) + backdrop-blur(16px) + grouped controls with 1px dividers
  - Viewer tab pattern: sticky glassmorphic tab bar with brand-primary active indicator
  - Zone header pattern: uppercase 12px label + mono count badge + collapse chevron
  - TYPE_ORDER constant for consistent card type ordering across visual/list/stats views
  - StatCard wrapper for consistent stats section styling (bg-surface-1, border-default, uppercase title)
observability_surfaces:
  - data-testid="deck-browser-hero", "featured-decks-carousel", "deck-game-tabs", "community-stats-banner" on browse page sections
  - data-testid="deck-view-page", "deck-viewer-header", "deck-viewer-tabs" on viewer page
  - data-testid="tab-visual", "tab-list", "tab-stats" on viewer tab buttons
  - data-testid="deck-visual-view", "deck-list-view", "deck-stats-panel" on viewer tab content
  - data-testid="mana-curve-chart" on ManaCurveChart
  - data-testid="builder-toolbar" on builder header toolbar
  - data-testid="zone-header-{zone}" on each collapsible zone in builder
  - data-testid="deck-grid", "deck-grid-card", "deck-card-stats", "deck-grid-loading" on grid elements
drill_down_paths:
  - .gsd/milestones/M001/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T03-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T04-SUMMARY.md
duration: 3.75h
verification_result: passed
completed_at: 2026-03-13
---

# S03: Deck Builder, Browser & Viewer — Pixel Perfect

**All three deck-facing storefront pages restructured and polished to match their Voltage wireframes — DeckBrowsingPage with hero/carousel/game-tabs/3-col-grid, DeckViewPage with tabbed Visual/List/Stats layout and mana curve chart, DeckBuilderLayout with glassmorphic toolbar and collapsible zones. 742 tests pass, build clean.**

## What Happened

Rewrote the deck browser page from a flat filters+grid layout into a rich wireframe-matching page: hero section with radial gradient and glassmorphic search bar, featured decks carousel with card-fan art, game tabs (All/MTG/Pokémon/Yu-Gi-Oh!/One Piece) with game-colored active states, 3-column grid of DeckGridCards (card-fan preview, game accent bar, author, stats, social counts), numbered pagination, and community stats banner. Grid is responsive (3→2→1 columns). Featured carousel and stats banner use placeholder data.

Rewrote the deck viewer page from a flat layout to tabbed structure: hero header with card-fan gradient, game/format badges, author row, social stats, and action buttons. Three tabs — Visual (card images grouped by type with collapsible sideboard), List (table with type-grouped rows, mana cost, price columns), Stats (ManaCurveChart CSS bar chart, color distribution stacked bar, type distribution bars, pricing summary). Stats computation is standalone from DeckBuilderContext.

Polished the deck builder: glassmorphic toolbar with grouped undo/redo and accent save button, styled card browser panel with inset shadow, DeckSurface with native two-tab bar (Zones/List) matching viewer tab pattern, DeckZone with collapsible headers (uppercase labels, mono count badges, chevron toggle), wireframe-sized card thumbnails. MobileDeckBuilder got glassmorphic header, game-colored badges via color-mix(), styled bottom navigation.

## Verification

- `npx vitest run` — **742 tests pass** (73 files, 0 failures, baseline was 719+)
- `npx vitest run src/components/decks/__tests__/DeckBrowsingPage.test.tsx` — 9 tests pass
- `npx vitest run src/components/decks/__tests__/DeckViewPage.test.tsx` — 9 tests pass
- `npm run build` — production build succeeds, no type errors
- All data-testid observability surfaces confirmed present in source
- Visual UAT deferred to human review (deck builder requires auth + running backend)

## Requirements Advanced

- R005 (Deck browser pixel-perfect) — DeckBrowsingPage restructured with hero, featured carousel, game tabs, 3-col grid, pagination, stats banner matching wireframe. Structural alignment verified by 9 tests. Visual UAT pending human comparison.
- R006 (Deck builder pixel-perfect) — DeckBuilderLayout, DeckSurface, DeckZone, MobileDeckBuilder polished with glassmorphic toolbar, collapsible zones, wireframe-sized thumbnails. Build confirms compilation. Visual UAT pending (requires auth).
- R007 (Deck viewer pixel-perfect) — DeckViewPage restructured with hero header, Visual/List/Stats tabs, ManaCurveChart, type/color distributions. 9 tests pass. Visual UAT pending.

## Requirements Validated

- none — visual UAT (human comparison against wireframes at 1440px and 390px) still pending for R005, R006, R007

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- DeckBrowsingPage old header (h1 "Deck Browser" + feature pills + search bar + view toggle) removed entirely — not present in wireframe, replaced by hero + featured carousel.
- Pagination built inline in DeckBrowsingPage rather than as separate DeckPagination component — the component boundary wasn't justified for the amount of markup.
- Viewer uses simpler single-render tab switching instead of the dual-render pattern from S02 — all three views work identically on desktop and mobile, so dual-render added complexity without benefit.
- Pricing tab and Comments tab from wireframe not implemented — these require API endpoints that don't exist yet.
- Radix Tabs removed from DeckSurface — replaced with native styled tab bar matching the viewer's glassmorphic pattern (D017).

## Known Limitations

- Card images in visual view show gradient placeholders until real deck data includes `image_uris` — matching wireframe's card representation.
- Pricing column in list view shows "—" until card pricing data flows from the API.
- Win rate, tournament results, meta position, and format legality in stats panel only render when the deck object includes those fields — currently not populated.
- Featured decks carousel uses hardcoded placeholder data — no "featured decks" API endpoint exists.
- Community stats banner uses hardcoded numbers — no aggregate stats API exists.
- `color-mix()` CSS in MobileDeckBuilder game badge may not work in Safari <16.4 (fallback values present).
- Deck builder visual UAT requires running backend + auth session — not verifiable in isolated dev.

## Follow-ups

- S09 needs to wire "Buy Missing Cards" button to cart optimizer and implement "I own this" toggle state management in DeckBuilderContext.
- Pricing/Comments tabs on viewer can be added when backend API endpoints exist.
- Featured decks carousel should be wired to real data when a curation API or popularity ranking exists.

## Files Created/Modified

- `storefront/src/components/decks/DeckBrowserHero.tsx` — Hero section with radial gradient, display headline, glassmorphic search bar
- `storefront/src/components/decks/FeaturedDecksCarousel.tsx` — Horizontal scroll carousel with card-fan featured deck cards
- `storefront/src/components/decks/DeckGameTabs.tsx` — 5 game tabs with game-colored active states
- `storefront/src/components/decks/DeckBrowsingPage.tsx` — Rewritten with full wireframe layout (hero→featured→tabs→grid→pagination→stats)
- `storefront/src/components/decks/DeckGridCard.tsx` — Wireframe deck card with card-fan, accent bar, stats, social
- `storefront/src/components/decks/DeckGrid.tsx` — Refactored to 3-col grid with DeckGridCard, matching skeletons
- `storefront/src/components/decks/DeckViewPage.tsx` — Rewritten with tab-based layout (Visual/List/Stats)
- `storefront/src/components/decks/DeckViewerHeader.tsx` — Hero header with gradient, badges, author, social stats, action buttons
- `storefront/src/components/decks/DeckVisualView.tsx` — Card image grid grouped by type with collapsible sideboard
- `storefront/src/components/decks/DeckListView.tsx` — Table format decklist with type groups, mana cost, pricing
- `storefront/src/components/decks/DeckStatsPanel.tsx` — Mana curve, color/type distributions, meta info, pricing summary
- `storefront/src/components/decks/ManaCurveChart.tsx` — Standalone CSS-only bar chart for mana curve
- `storefront/src/components/decks/__tests__/DeckBrowsingPage.test.tsx` — 9 tests for browse page structure
- `storefront/src/components/decks/__tests__/DeckViewPage.test.tsx` — 9 tests for viewer page structure and tab switching
- `storefront/src/components/deck-builder/DeckBuilderLayout.tsx` — Glassmorphic toolbar, styled panels, refined collapse toggle
- `storefront/src/components/deck-builder/DeckSurface.tsx` — Native styled tab bar replacing Radix Tabs
- `storefront/src/components/deck-builder/DeckZone.tsx` — Collapsible zone headers, mono count badges, wireframe card grid
- `storefront/src/components/deck-builder/MobileDeckBuilder.tsx` — Glassmorphic header, styled bottom nav, game-colored badges

## Forward Intelligence

### What the next slice should know
- The card-fan pattern (3 fanned gradient rectangles) is used in DeckGridCard, FeaturedDecksCarousel, and DeckViewerHeader — if the pattern needs updates, all three must change.
- DeckStatsPanel computes mana curve and distributions from raw card data independently of DeckBuilderContext. S09 can reuse ManaCurveChart and the computation patterns without importing builder context.
- Game tabs use inline style `borderColor` and `color` set to CSS custom properties (e.g., `var(--game-mtg)`). This pattern differs from S02's GameSelectorStrip which uses grid layout.

### What's fragile
- FeaturedDecksCarousel card-fan art is 3 hardcoded gradient rectangles with fixed rotations — if real card images are used, the positioning CSS needs rework to handle actual images.
- DeckViewPage stats computation assumes cards have `mana_cost`, `type_line`, and `colors` properties. Missing fields produce empty charts but don't error.

### Authoritative diagnostics
- Test data-testid attributes on all three pages are comprehensive and documented in task summaries — use them for any future DOM queries or test assertions.
- 742 passing tests is the new baseline for S03+. Any future slice should pass ≥742.

### What assumptions changed
- Original plan assumed DeckPagination and CommunityStatsBanner as separate component files — pagination was built inline, stats banner was built inline in DeckBrowsingPage. Simpler and sufficient.
- DeckHeader.tsx was listed for T04 changes but was already well-styled — no modifications needed.
