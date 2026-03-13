---
id: S03
parent: M001
milestone: M001
provides:
  - DeckBrowsingPage restructured with hero, featured carousel, game tabs, 3-col grid, pagination, community stats banner
  - DeckGridCard with card-fan preview, game accent bar, author row, stats, social counts
  - DeckViewPage with tabbed layout (Visual/List/Stats), hero header, ManaCurveChart, type/color distributions, pricing summary
  - DeckBuilderLayout with glassmorphic toolbar, collapsible zone headers, wireframe-sized thumbnails
  - MobileDeckBuilder with glassmorphic header, game-colored badges, styled bottom navigation
  - ManaCurveChart standalone reusable CSS-only bar chart component
requires:
  - slice: S01
    provides: Voltage tokens (colors.css, globals.css), CardDisplay, PriceTag, Footer, ModernHeader, Sheet
affects:
  - S09
key_files:
  - storefront/src/components/decks/DeckBrowsingPage.tsx
  - storefront/src/components/decks/DeckBrowserHero.tsx
  - storefront/src/components/decks/FeaturedDecksCarousel.tsx
  - storefront/src/components/decks/DeckGameTabs.tsx
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
  - storefront/src/components/decks/__tests__/DeckBrowsingPage.test.tsx
  - storefront/src/components/decks/__tests__/DeckGameTabs.test.tsx
  - storefront/src/components/decks/__tests__/DeckViewPage.test.tsx
key_decisions:
  - D017: DeckSurface uses native tab bar instead of Radix Tabs — matches viewer tab pattern
  - D018: DeckZone collapse state is local per-zone — avoids context coupling for UI-only concern
  - D019: DeckStatsPanel computes independently of DeckBuilderContext — viewer is read-only
  - D020: Game tabs replace game filter checkboxes for deck browsing — matches wireframe
patterns_established:
  - Card-fan preview pattern: 3 fanned gradient rectangles (48×67px) at -10°/-2°/6° rotation
  - Glassmorphic toolbar: rgba(24,22,42,0.85) + backdrop-blur(16px) + grouped controls with 1px border separators
  - Viewer tab pattern: sticky glassmorphic bar with brand-primary active indicator
  - Zone header pattern: uppercase 12px label + mono count badge + collapse chevron
  - Card type grouping: TYPE_ORDER constant for consistent ordering
  - Game color mapping: CSS custom properties (--game-mtg, --game-pokemon, etc.)
observability_surfaces:
  - data-testid="deck-browser-hero" on browser hero section
  - data-testid="featured-decks-carousel" on featured carousel
  - data-testid="deck-game-tabs" on game tab container
  - data-testid="deck-game-tab-{CODE}" on individual game tabs
  - data-testid="deck-grid" on grid container
  - data-testid="deck-grid-card" on each grid card
  - data-testid="community-stats-banner" on stats banner
  - data-testid="deck-view-page" on viewer container
  - data-testid="deck-viewer-header" on viewer hero
  - data-testid="deck-viewer-tabs" on viewer tab bar
  - data-testid="tab-visual", "tab-list", "tab-stats" on individual tabs
  - data-testid="deck-visual-view", "deck-list-view", "deck-stats-panel" on tab content
  - data-testid="mana-curve-chart" on ManaCurveChart
  - data-testid="sideboard-toggle" on sideboard expand/collapse
  - data-testid="builder-toolbar" on builder header toolbar
  - data-testid="zone-header-{zone}" on each builder zone header
  - data-testid="deck-surface" on deck surface container
drill_down_paths:
  - .gsd/milestones/M001/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T03-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T04-SUMMARY.md
duration: ~5h across 4 tasks
verification_result: passed
completed_at: 2026-03-14
---

# S03: Deck Builder, Browser & Viewer — Pixel Perfect

**All three deck-facing storefront pages restructured and polished to match their Voltage wireframes — browser with hero/carousel/game tabs/3-col grid, viewer with tabbed Visual/List/Stats layout, builder with glassmorphic toolbar and collapsible zones. 794 tests pass, production build clean.**

## What Happened

Four tasks took the three deck pages from functional flat layouts to wireframe-matching pixel-perfect structure:

**T01 — Deck browser restructure.** DeckBrowsingPage rewritten from a simple search+filter+grid into the wireframe section order: DeckBrowserHero (radial gradient, display headline, glassmorphic search bar with Ctrl+K hint) → FeaturedDecksCarousel (horizontal scroll with 480px card-fan featured deck cards, game badges, stats, social counts, placeholder data) → DeckGameTabs (5 game-colored tabs with active border-bottom replacing the old checkbox filters) → filter row + grid + pagination + CommunityStatsBanner.

**T02 — Deck grid cards.** DeckGridCard created with 4px game-colored accent bar, card-fan preview (3 fanned 48×67px gradient rectangles), deck name, game dot + format, author row, 2-line description, stats row (card count mono, price brand-primary, win rate color-coded), social row. DeckGrid refactored to 3-col (was 4-col), responsive 3→2→1 columns. Matching skeleton/error/empty states.

**T03 — Deck viewer tabbed layout.** DeckViewPage rewritten with DeckViewerHeader (gradient hero, card-fan visual, game/format badges, author row, social stats, action buttons) and 3-tab navigation (Visual/List/Stats). DeckVisualView renders card image grid grouped by type with collapsible sideboard. DeckListView renders table with type groups, mana cost, price columns. DeckStatsPanel has ManaCurveChart (CSS-only bar chart), color distribution stacked bar, type distribution bars, pricing summary. Stats computed standalone from card array — no DeckBuilderContext dependency.

**T04 — Builder polish.** DeckBuilderLayout toolbar restyled as glassmorphic bar with grouped undo/redo, import/export, accent save button. DeckSurface tabs replaced Radix with native styled buttons matching viewer tab pattern. DeckZone got collapsible headers with uppercase labels, mono count badges, chevron toggle. MobileDeckBuilder got glassmorphic header, game-colored badges, styled bottom navigation. All 794 tests pass, build clean.

## Verification

- `cd storefront && npx vitest run` — **794 tests pass** (76 files, 0 failures — exceeds 719 baseline)
- `cd storefront && npx vitest run src/components/decks/__tests__/DeckBrowsingPage.test.tsx` — 10 tests pass
- `cd storefront && npx vitest run src/components/decks/__tests__/DeckViewPage.test.tsx` — 9 tests pass
- `cd storefront && npm run build` — production build succeeds
- All data-testid observability surfaces confirmed present in source
- Visual UAT pending human comparison at 1440px and 390px breakpoints

## Requirements Advanced

- R005 (Deck browser page pixel-perfect) — Browser page restructured with hero, featured carousel, game tabs, 3-col grid with card-fan cards, pagination, stats banner matching wireframe
- R006 (Deck builder pixel-perfect) — Builder polished with glassmorphic toolbar, collapsible zones with count badges, wireframe-sized thumbnails, styled mobile bottom nav
- R007 (Deck viewer pixel-perfect) — Viewer restructured with hero header, Visual/List/Stats tabs, ManaCurveChart, distributions, pricing summary

## Requirements Validated

- None — visual UAT (human comparison against wireframes) still pending for all three requirements

## New Requirements Surfaced

- None

## Requirements Invalidated or Re-scoped

- None

## Deviations

- DeckViewPage uses single-render tab switching instead of dual-render pattern (S02's mobile approach). All three views work the same on desktop and mobile, so dual-render was unnecessary.
- Pricing tab and Comments tab from wireframe not implemented — these require API endpoints that don't exist yet. The three tabs (Visual/List/Stats) cover the core wireframe scope.

## Known Limitations

- Featured carousel uses placeholder data — no "featured deck" API exists yet
- Community stats banner uses placeholder numbers — no aggregate stats endpoint
- Card images in visual view show gradient placeholders until real deck data includes `image_uris`
- Pricing column in list view shows "—" until card pricing data flows from API
- Win rate, tournament results, meta position in stats panel only render when deck object includes those fields (currently unpopulated)
- Deck builder requires authentication and running backend for visual UAT — can't verify in isolated dev
- `color-mix()` CSS in MobileDeckBuilder may not work in Safari <16.4 (fallback values exist)

## Follow-ups

- S09 wires "I own this" toggle state management in DeckBuilderContext
- S09 wires "Buy Missing Cards" button to cart optimizer
- Featured deck API endpoint needed to replace placeholder data in FeaturedDecksCarousel
- Aggregate stats API for CommunityStatsBanner real numbers

## Files Created/Modified

- `storefront/src/components/decks/DeckBrowserHero.tsx` — Hero section with radial gradient, glassmorphic search bar
- `storefront/src/components/decks/FeaturedDecksCarousel.tsx` — Horizontal scroll carousel with card-fan featured deck cards
- `storefront/src/components/decks/DeckGameTabs.tsx` — 5 game-colored filter tabs
- `storefront/src/components/decks/DeckBrowsingPage.tsx` — Restructured to compose all wireframe sections
- `storefront/src/components/decks/DeckGridCard.tsx` — Wireframe-matching deck card with card-fan, accent bar, stats
- `storefront/src/components/decks/DeckGrid.tsx` — Refactored to 3-col grid with DeckGridCard, matching skeletons
- `storefront/src/components/decks/DeckViewPage.tsx` — Rewritten with tab-based layout composing header + 3 views
- `storefront/src/components/decks/DeckViewerHeader.tsx` — Hero header with gradient bg, badges, social stats, actions
- `storefront/src/components/decks/DeckVisualView.tsx` — Card image grid grouped by type with collapsible sideboard
- `storefront/src/components/decks/DeckListView.tsx` — Table-format decklist with type groups, mana cost, pricing
- `storefront/src/components/decks/DeckStatsPanel.tsx` — Mana curve, color/type distributions, meta info, pricing
- `storefront/src/components/decks/ManaCurveChart.tsx` — CSS-only bar chart for mana curve visualization
- `storefront/src/components/deck-builder/DeckBuilderLayout.tsx` — Glassmorphic toolbar, styled panels
- `storefront/src/components/deck-builder/DeckSurface.tsx` — Native tab bar replacing Radix Tabs
- `storefront/src/components/deck-builder/DeckZone.tsx` — Collapsible headers, mono count badges, compact thumbnails
- `storefront/src/components/deck-builder/MobileDeckBuilder.tsx` — Glassmorphic header, styled bottom nav
- `storefront/src/components/decks/__tests__/DeckBrowsingPage.test.tsx` — 10 structural tests
- `storefront/src/components/decks/__tests__/DeckGameTabs.test.tsx` — 6 tab tests
- `storefront/src/components/decks/__tests__/DeckViewPage.test.tsx` — 9 viewer tests

## Forward Intelligence

### What the next slice should know
- Game color CSS custom properties (--game-mtg, --game-pokemon, etc.) are established and reusable across any game-aware component
- ManaCurveChart is standalone and reusable — import from `@/components/decks/ManaCurveChart`
- DeckGameTabs uses canonical codes (ALL, MTG, POKEMON, YUGIOH, OPTCG) matching backend API
- The "Buy Missing Cards" button exists in DeckViewerHeader but is purely visual — S09 wires it

### What's fragile
- DeckStatsPanel computes stats from raw card data when `deck.stats` is missing — depends on cards having `type_line`, `colors`, and `cmc` fields. If card data shape changes, stats computation breaks silently (shows 0/empty instead of error).
- FeaturedDecksCarousel and CommunityStatsBanner use hardcoded placeholder data — must be replaced with API calls when endpoints exist or they'll show stale fake numbers forever.

### Authoritative diagnostics
- `data-testid` attributes cover every major section — use `document.querySelectorAll('[data-testid^="deck-"]')` in browser console to enumerate all deck component sections
- Test files in `__tests__/DeckBrowsingPage.test.tsx` and `__tests__/DeckViewPage.test.tsx` mock child components — if a child changes its export name, the page test will fail immediately

### What assumptions changed
- Assumed Radix Tabs would be used for DeckSurface — native styled buttons were simpler and more consistent with the viewer tab pattern
- Assumed DeckViewPage would use dual-render like S02's card detail — single-render with tab switching was sufficient because all three views work identically on mobile and desktop
