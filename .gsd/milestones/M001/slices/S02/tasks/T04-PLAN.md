# T04: Write DeckBuilderLayout tests

**Slice:** S02
**Status:** not-started
**Estimate:** 2h

## Goal

Test the top-level deck builder composer — DeckBuilderLayout wires DeckSurface, DeckSearchPanel, DeckStats, MobileDeckBuilder, and CartOptimizerPanel. The "Buy Missing Cards" button opening the optimizer is the critical path that must be tested.

## Files to Touch

- `storefront/src/components/deck-builder/__tests__/DeckBuilderLayout.test.tsx` (create)

## What to Do

Mock `DeckBuilderContext` to return a deck with known cards and getMissingCards() returning 3 items. Mock `react-dnd` (`vi.mock('react-dnd', ...)`). Mock child components (DeckSurface, DeckSearchPanel, DeckStats, MobileDeckBuilder, CartOptimizerPanel) as simple stubs with data-testid. Write tests: (1) renders deck name in header, (2) renders Save button enabled when `isDirty`, (3) "Buy Missing Cards" button visible when `getMissingCards()` returns non-empty, (4) clicking "Buy Missing Cards" opens CartOptimizerPanel (passes `isOpen=true`), (5) missing cards count badge shows correct number, (6) search panel collapses/expands on toggle, (7) MobileDeckBuilder rendered on mobile breakpoint (check data-testid visible). No light-mode classes.

## Verification Criteria

`npx vitest run --reporter=verbose src/components/deck-builder/__tests__/DeckBuilderLayout.test.tsx` — all pass.

## Done When

7+ tests covering layout, "Buy Missing Cards" flow, and panel toggle — all passing.
