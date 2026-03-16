# T06: Write MobileDeckBuilder tests

**Slice:** S02
**Status:** not-started
**Estimate:** 2h

## Goal

Test the primary interaction surface for mobile users. Tap-to-add (not DnD) is the mobile UX — this unproven mobile path from the roadmap has no existing tests.

## Files to Touch

- `storefront/src/components/deck-builder/__tests__/MobileDeckBuilder.test.tsx` (create)

## What to Do

Mock `DeckBuilderContext`, `CardSearchContext`, `CardSearchProvider`, `CardHoverProvider`. Mock child search components. Write tests: (1) renders 3-tab bar (Deck/Search/Stats), (2) Deck tab shows card list grouped by type, (3) tapping Search tab shows search input, (4) tapping a search result calls `addCard(card, 'main', 1)` — this is the tap-to-add path, (5) "Buy Missing" sticky bar renders when `getMissingCards()` returns non-empty, (6) stats tab renders mana curve or stats section, (7) `MobileDeckBuilder` never renders DnD `DndProvider` (mobile uses tap-to-add, not drag).

## Verification Criteria

`npx vitest run --reporter=verbose src/components/deck-builder/__tests__/MobileDeckBuilder.test.tsx` — all pass.

## Done When

7 tests covering tab switching, tap-to-add path, buy bar — all passing.
