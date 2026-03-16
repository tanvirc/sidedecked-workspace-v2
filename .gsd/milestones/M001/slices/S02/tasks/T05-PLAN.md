# T05: Write DeckSurface and DeckZone tests

**Slice:** S02
**Status:** not-started
**Estimate:** 2h

## Goal

Test the most interaction-heavy components in S02: DeckSurface groups cards by type, DeckZone handles collapse/expand, quantity controls, and DnD drop target. No tests exist for either.

## Files to Touch

- `storefront/src/components/deck-builder/__tests__/DeckSurface.test.tsx` (create)
- `storefront/src/components/deck-builder/__tests__/DeckZone.test.tsx` (create)

## What to Do

Mock `react-dnd` — `vi.mock('react-dnd', () => ({ useDrop: () => [{ isOver: false }, vi.fn()], useDrag: () => [{ isDragging: false }, vi.fn(), vi.fn()] }))`. Mock `DeckBuilderContext`. **DeckSurface tests**: renders cards grouped by type (Creature/Instant/Land shown when cards of those types present), tab toggle switches between Zones and List views, total card count renders correctly. **DeckZone tests**: renders zone title and card count badge, clicking collapse header hides/shows card list (test with `userEvent.click`), quantity increment calls `updateCardQuantity(sku, zone, qty+1)`, quantity decrement calls `updateCardQuantity`, remove button calls `removeCard`, zone header turns amber/red based on validation errors prop. No light-mode classes in either component.

## Verification Criteria

`npx vitest run --reporter=verbose src/components/deck-builder/__tests__/` — all pass.

## Done When

DeckSurface tests cover type grouping + tab switching; DeckZone tests cover collapse, quantity controls, and validation state.
