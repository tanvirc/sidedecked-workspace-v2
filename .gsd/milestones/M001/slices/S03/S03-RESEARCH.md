# S03: Deck Builder, Browser & Viewer — Research

**Date:** 2026-03-13

## Summary

Three deck pages need visual alignment to their Voltage wireframes. The existing code is functional but visually divergent: DeckBrowsingPage is a simple filters+grid layout vs the wireframe's hero+featured carousel+game tabs+3-col grid+stats banner. DeckViewPage is a basic list view vs the wireframe's visual/list/stats tab layout with mana curves and pricing. DeckBuilderLayout has the right split-panel structure but needs wireframe polish.

The code volume is significant (~8000 lines across 25 files) but most of the work is visual alignment, not logic rewrites. The deck builder's DnD/touch/keyboard shortcuts are already working — the task is applying wireframe styling, not reimplementing functionality.

## Recommendation

Align pages in risk order: deck browser (most visual divergence), deck viewer (new tab structure), deck builder (least divergence — structural polish). Keep existing logic intact; change presentation layer only. Create new sub-components where the wireframe demands sections that don't exist (hero, featured carousel, community stats, visual card grid, mana curve chart).

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| DnD in deck builder | react-dnd + HTML5Backend already wired | Working and tested |
| Card data fetching in browser | Existing fetch to /api/decks/public and /api/decks/user | API contracts stable |
| Deck validation | DeckValidationPanel + deck-validation.ts | 395+lines of game-specific rules |
| Customer auth state | useCustomer hook | Used across all deck pages |
| Card display | CardDisplay, PriceTag from S01 | Voltage-consistent card rendering |

## Existing Code and Patterns

- `storefront/src/components/decks/DeckBrowsingPage.tsx` (390 lines) — Functional but flat layout. Needs hero section, featured carousel, game tabs replacing game filter, 3-col grid, stats banner. Data fetching logic is solid — keep it.
- `storefront/src/components/decks/DeckGrid.tsx` (250 lines) — Contains inline DeckCard. Current card uses cover image + stats. Wireframe wants card-fan previews, game accent bar, author row, description snippet, social stats.
- `storefront/src/components/decks/DeckCard.tsx` (225 lines) — Management card with rename/delete/format-change. This is for "My Decks" — different from the browse grid card. Keep for deck management.
- `storefront/src/components/decks/DeckViewPage.tsx` (326 lines) — Basic list layout. Wireframe has 3 tabs (Visual/List/Stats) + pricing tab, mana curve, color distribution, type distribution. Substantial new UI.
- `storefront/src/components/deck-builder/DeckBuilderLayout.tsx` (336 lines) — Split panel with DnD. Structure is close to wireframe. Needs header polish, panel styling, and wireframe-matching transitions.
- `storefront/src/components/deck-builder/MobileDeckBuilder.tsx` (687 lines) — Mobile bottom-sheet deck builder. Needs visual alignment but logic is solid.
- `storefront/src/components/deck-builder/DeckSurface.tsx` (225 lines) — Renders deck zones. Needs wireframe styling (zone headers, card thumbnails).
- `storefront/src/components/deck-builder/DeckStats.tsx` (291 lines) — Mana curve, color dist already computed. Can reuse logic for viewer stats panel.

## Constraints

- DeckBuilderContext is the central state manager — all deck builder changes must work within its interface
- Card data from customer-backend uses DeckDto type — deck browser card shapes must match
- react-dnd HTML5Backend is desktop-only — MobileDeckBuilder uses touch events separately
- Existing 719 tests must not regress
- GameSelectorStrip from S02 uses Algolia facets — deck browser game tabs use local API filtering, different mechanism

## Common Pitfalls

- **Mixing DeckCard (management) with DeckGridCard (browse)** — They serve different purposes. DeckCard has rename/delete actions. Browse grid card is read-only with visual preview. Keep them separate.
- **Over-scoping the deck builder visual changes** — The builder's DnD + state management is complex. Visual polish only — don't restructure the context or drag logic.
- **Mana curve chart complexity** — The wireframe shows a proper bar chart. Keep it simple with CSS-only bars (no charting library). DeckStats already computes the data.

## Open Risks

- DeckViewPage tab structure (Visual/List/Stats) requires significant new UI — the visual view with card images in a masonry-like grid is new
- Featured decks carousel on browser page needs data — no "featured" flag exists in the API. Use static placeholder data like TrendingStrip in S02.
- Community stats banner (total decks, brewers, cards, games supported) needs API data or placeholder

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| react-dnd | existing in codebase | installed |
| Voltage design tokens | S01 foundation | installed |

## Sources

- Wireframe: `docs/plans/wireframes/storefront-deck-browser.html` — hero, featured carousel, game tabs, 3-col grid, pagination, stats banner
- Wireframe: `docs/plans/wireframes/storefront-deck-builder.html` — split panel, header toolbar, zone layout, mobile bottom sheet
- Wireframe: `docs/plans/wireframes/storefront-deck-viewer.html` — visual/list/stats tabs, mana curve, pricing, card fan header
