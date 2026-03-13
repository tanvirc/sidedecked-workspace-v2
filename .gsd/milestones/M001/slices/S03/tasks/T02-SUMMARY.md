---
id: T02
parent: S03
milestone: M001
provides:
  - DeckGridCard component with card-fan preview, game accent bar, author row, stats, social counts
  - DeckGrid refactored to 3-column layout with wireframe-matching skeleton, error, and empty states
  - Responsive grid: 3-col → 2-col @ 1024px → 1-col @ 640px
key_files:
  - storefront/src/components/decks/DeckGridCard.tsx
  - storefront/src/components/decks/DeckGrid.tsx
key_decisions:
  - DeckGridCard is read-only for browse; old DeckCard.tsx kept for deck management (rename/delete)
  - Win rate color-coded: green ≥55%, yellow ≥45%, red <45%
  - Description and social row hidden on mobile matching wireframe
patterns_established:
  - Card-fan preview pattern: 3 fanned gradient rectangles (48×67px) at -10°/-2°/6° rotation
  - Game accent bar: 4px tall colored strip at top of card
  - Relative time helper for "Updated Xd ago" text
observability_surfaces:
  - data-testid="deck-grid-card" on each card
  - data-testid="deck-card-stats" on stats row
  - data-testid="deck-grid" on grid container
  - data-testid="deck-grid-loading" on skeleton state
duration: 20min
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T02: Deck grid cards with wireframe styling

**DeckGridCard created with card-fan preview, game accent bar, author row, stats, social counts. DeckGrid refactored to 3-col with matching skeletons. 733 tests pass.**

## What Happened

Created `DeckGridCard` matching the wireframe's deck card: 4px game-colored accent bar at top, card-fan preview (3 fanned 48×67px gradient rectangles at -10°/-2°/6° rotation with decreasing opacity), deck name (heading 16px), game dot + format meta, avatar + author name, 2-line description (desktop only), stats row (card count in mono, price in brand-primary, win rate color-coded), and social row (likes/copies/updated).

Refactored `DeckGrid` to use `DeckGridCard` instead of the old inline DeckCard. Changed grid to 3 columns matching wireframe (was 4-col). Responsive: 3-col → 2-col at 1024px → 1-col at 640px. Rebuilt skeleton state with matching wireframe structure (accent bar, card fan placeholder, text lines). Error and empty states use Voltage tokens.

## Verification

- `npx vitest run` — 733 tests pass (zero regressions)
- `npx tsc --noEmit` — clean

## Files Created/Modified

- `storefront/src/components/decks/DeckGridCard.tsx` — new wireframe-matching deck card with card-fan, accent bar, stats
- `storefront/src/components/decks/DeckGrid.tsx` — refactored to 3-col grid, DeckGridCard, matching skeletons
