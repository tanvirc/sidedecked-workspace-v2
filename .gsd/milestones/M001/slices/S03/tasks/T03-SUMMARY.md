---
id: T03
parent: S03
milestone: M001
provides:
  - DeckViewPage restructured with header hero, 3-tab navigation (Visual/List/Stats), and tab content panels
  - DeckViewerHeader component with card-fan gradient bg, game/format badges, author row, social stats, action buttons
  - DeckVisualView component with card image grid grouped by type, quantity badges, collapsible sideboard
  - DeckListView component with table format, type-grouped rows, mana cost, price columns, total row
  - DeckStatsPanel component with ManaCurveChart, color distribution stacked bar, type distribution bars, pricing summary
  - ManaCurveChart CSS-only bar chart component (reusable)
key_files:
  - storefront/src/components/decks/DeckViewPage.tsx
  - storefront/src/components/decks/DeckViewerHeader.tsx
  - storefront/src/components/decks/DeckVisualView.tsx
  - storefront/src/components/decks/DeckListView.tsx
  - storefront/src/components/decks/DeckStatsPanel.tsx
  - storefront/src/components/decks/ManaCurveChart.tsx
  - storefront/src/components/decks/__tests__/DeckViewPage.test.tsx
key_decisions:
  - DeckStatsPanel computes stats from cards if deck.stats is missing — standalone from DeckBuilderContext (no useDeckBuilder dependency for viewer)
  - Tab switching is client-side state, not hash-based routing (simpler for now, can add hash later)
  - Sideboard defaults to collapsed in visual view (matching wireframe)
  - ManaCurveChart extracted as standalone component for reuse
patterns_established:
  - Viewer tab pattern — sticky glassmorphic tab bar with brand-primary active indicator, same visual language as browse page game tabs
  - Card type grouping — TYPE_ORDER constant for consistent ordering (Creatures, Planeswalkers, Instants, Sorceries, Enchantments, Artifacts, Lands, Other)
  - StatCard wrapper pattern — consistent card styling for stats sections (bg-surface-1, border-default, uppercase title)
observability_surfaces:
  - data-testid="deck-view-page" on container
  - data-testid="deck-viewer-header" on hero section
  - data-testid="deck-viewer-tabs" on tab navigation
  - data-testid="tab-visual", data-testid="tab-list", data-testid="tab-stats" on individual tabs
  - data-testid="deck-visual-view", data-testid="deck-list-view", data-testid="deck-stats-panel" on tab content
  - data-testid="mana-curve-chart" on ManaCurveChart
  - data-testid="sideboard-toggle" on sideboard expand/collapse
duration: 1.5h
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T03: Deck viewer page tabs, visual view, list view, and stats panel

**DeckViewPage restructured from flat layout to wireframe-matching tabbed layout with hero header, Visual/List/Stats tabs, mana curve chart, type/color distributions, and pricing summary.**

## What Happened

Rewrote DeckViewPage from a flat header + stats grid + decklist layout into the wireframe structure:

1. **DeckViewerHeader** — Gradient background with radial glow, game/format badge row, display-font deck name (44px responsive), author row with avatar + timestamp, description, tags. Right side has social stats (likes/copies/views) with share button, action buttons column (Copy Deck, Buy All, Edit if owner, Export, Like).

2. **Tab navigation** — Sticky glassmorphic bar (blur + 80% opacity bg) with Visual/List/Stats tabs. Active tab shows brand-primary text + 2px bottom indicator. Matches wireframe tab-nav styling.

3. **DeckVisualView** — Cards displayed as image grid grouped by type category. Cards with images show the image, cards without show gradient placeholder with name (matching wireframe's colored card backgrounds per type). Quantity badges in brand-primary. Sideboard section with collapsible toggle (default collapsed). 2-col on mobile, flex-wrap on desktop.

4. **DeckListView** — Table with Qty/Card Name/Mana Cost/Type/Price columns. Type group header rows in brand-primary on surface-1 bg. Total row with 2px brand-primary top border. Sideboard section below main deck.

5. **DeckStatsPanel** — 2-column grid with ManaCurveChart (CSS bar chart with gradient bars), color distribution (horizontal stacked bar with legend), type distribution (horizontal bars with labels), and right column for win rate/tournament results/meta position/format legality when available. Falls back to quick stats when rich meta data is absent. Pricing summary card at bottom.

6. **ManaCurveChart** — Standalone CSS-only bar chart with 0-6+ buckets, gradient fill bars, count labels above, CMC labels below, average CMC display. Reuses computation logic from deck-builder DeckStats but without DeckBuilderContext dependency.

## Verification

- `npx vitest run src/components/decks/__tests__/DeckViewPage.test.tsx` — 9 tests pass (page container, header rendering, tab navigation, default visual view, tab switching to list/stats, back to visual, like toggle, data-testid presence)
- `npx vitest run` — 742 tests pass (baseline was 733, +9 new viewer tests)
- `npm run build` — production build succeeds

### Slice-level verification status:
- ✅ `npx vitest run` — 742 tests pass (>719 baseline)
- ✅ `npx vitest run src/components/decks/__tests__/DeckViewPage.test.tsx` — viewer tests pass
- ✅ `npm run build` — succeeds
- ⬜ Visual: deck viewer at 1440px matches wireframe — needs visual UAT (T04 will do final sweep)
- ⬜ Visual: deck builder at 1440px matches wireframe — T04 scope

## Diagnostics

- Tab content visibility is driven by `activeTab` state — inspect which tab is active by checking which `data-testid="deck-*-view"` element is in DOM
- Stats computation falls back to card-level calculation when `deck.stats` fields are empty — watch for missing `type_line` or `colors` on card objects
- ManaCurveChart handles empty data gracefully (0-height bars with "0" count labels)

## Deviations

- Task plan called for "mobile tab pattern from S02 (dual-render on desktop, tab-controlled on mobile)" — used simpler single-render tab switching since the viewer doesn't need dual-render (all three views work the same on desktop and mobile). The tab bar uses horizontal scroll on mobile matching the wireframe.
- Pricing tab and Comments tab from wireframe not implemented — these are separate features requiring API endpoints that don't exist yet. The three tabs (Visual/List/Stats) cover the core task scope.

## Known Issues

- Card images won't show in visual view until real deck data includes `image_uris` — currently shows gradient placeholders which match the wireframe's card representation
- Pricing column in list view shows "—" until card pricing data is available from the API
- Win rate, tournament results, meta position, and format legality sections in stats panel only render when the deck object includes those fields — currently not populated by the API

## Files Created/Modified

- `storefront/src/components/decks/DeckViewPage.tsx` — Rewritten: tab-based layout composing header + visual/list/stats views
- `storefront/src/components/decks/DeckViewerHeader.tsx` — New: hero header with gradient bg, badges, author, social stats, action buttons
- `storefront/src/components/decks/DeckVisualView.tsx` — New: card image grid grouped by type with collapsible sideboard
- `storefront/src/components/decks/DeckListView.tsx` — New: table-format decklist with type groups, mana cost, pricing
- `storefront/src/components/decks/DeckStatsPanel.tsx` — New: mana curve, color/type distributions, meta info, pricing summary
- `storefront/src/components/decks/ManaCurveChart.tsx` — New: CSS-only bar chart for mana curve visualization
- `storefront/src/components/decks/__tests__/DeckViewPage.test.tsx` — New: 9 tests for page structure, tab switching, like toggle
