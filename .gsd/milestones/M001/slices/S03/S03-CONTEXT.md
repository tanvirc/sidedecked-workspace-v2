---
id: S03
milestone: M001
status: in_progress
---

# S03: Deck Builder, Browser & Viewer — Pixel Perfect — Context

## Goal

All three deck-facing storefront pages (`/decks` browser, `/decks/[id]` viewer, deck builder) match their Voltage wireframes pixel-perfectly on desktop and mobile, with undo/redo and import/export toolbar buttons wired to existing DeckBuilderContext methods.

## Why this Slice

Deck pages are among the 5 highest-priority pages for visual fidelity (D005). S03 depends only on S01 (complete). S09 (cart optimizer) depends on S03 for the "I own this" toggle and missing cards list, so completing S03 unblocks the deck-to-cart flow.

## Scope

### In Scope

- Full wireframe rewrite of deck browser page (hero, featured carousel, game tabs, 3-col grid, pagination, stats banner)
- Full wireframe rewrite of deck viewer page (header with card-fan, Visual/List/Stats tabs, mana curve, distributions, pricing)
- Deck builder visual polish to match wireframe (toolbar, card browser panel, zone headers, mobile bottom sheet)
- Wire undo/redo/import/export toolbar buttons to existing `DeckBuilderContext` methods (not just styled — functional)
- Client-side stats computation for mana curve, color distribution, type distribution (from deck card data, no API)
- All 3 tabs visible on empty decks with appropriate empty states
- Desktop (1440px) and mobile (390px) layouts matching wireframe frames
- Tests for new/restructured components, 733+ tests pass (current baseline)

### Out of Scope

- "Buy Missing Cards" button implementation (S09 scope — button can be present but non-functional)
- "I own this" toggle state management (S09 scope)
- Live deck data from API for featured decks carousel (uses placeholder data)
- Community stats banner real data (placeholder numbers)
- Deck sharing/social features beyond visual rendering of counts
- Card search within deck builder (existing Algolia integration unchanged)

## Constraints

- Wireframes are authoritative (D003): `storefront-deck-browser.html`, `storefront-deck-builder.html`, `storefront-deck-viewer.html`
- Inline `style` for Voltage CSS custom properties (D009)
- Deck builder undo/redo/import/export methods already exist in `DeckBuilderContext` — wire to toolbar, don't reimplement
- Stats computation reuses logic patterns from existing `DeckStats.tsx` — don't duplicate calculation code

## Integration Points

### Consumes

- `storefront/src/app/colors.css` — Voltage tokens (from S01)
- `storefront/src/app/globals.css` — Typography scale, `.price` class (from S01)
- `storefront/src/contexts/DeckBuilderContext.tsx` — undo, redo, importDeck, exportDeck methods
- `storefront/src/components/deck-builder/DeckStats.tsx` — existing stats computation patterns
- `docs/plans/wireframes/storefront-deck-browser.html` — browser wireframe
- `docs/plans/wireframes/storefront-deck-builder.html` — builder wireframe
- `docs/plans/wireframes/storefront-deck-viewer.html` — viewer wireframe

### Produces

- Pixel-perfect deck browser with hero, featured carousel, game tabs, 3-col DeckGridCard grid, pagination, stats banner
- Pixel-perfect deck viewer with card-fan header, Visual/List/Stats tabs, ManaCurveChart, distribution bars, pricing summary
- Polished deck builder with functional undo/redo/import/export toolbar, wireframe-matching zone headers and card browser panel
- `DeckGridCard` reusable component with card-fan preview, game accent bar, stats
- `DeckGameTabs` reusable game filter tabs with game-colored active states
- Client-side stats computation (mana curve, color/type distributions) for viewer

## Open Questions

- Import/export format support — `DeckBuilderContext.importDeck(format, data)` accepts a format string. Need to verify which formats are implemented (MTGO, Arena, plain text?) and whether the toolbar should offer a format picker or default to one format.
