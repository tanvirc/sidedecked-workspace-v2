# T07: Audit DeckBrowsingPage and DeckViewPage tests

**Slice:** S02
**Status:** not-started
**Estimate:** 1h

## Goal

Confirm wireframe alignment and Voltage compliance hold after S01 pattern locks. Both pages have test files in `decks/__tests__/` but need a verification pass.

## Files to Touch

- `storefront/src/components/decks/__tests__/DeckBrowsingPage.test.tsx` (extend if needed)
- `storefront/src/components/decks/__tests__/DeckViewPage.test.tsx` (extend if needed)

## What to Do

Run existing tests. Read `storefront-deck-browser.html` and `storefront-deck-viewer.html` wireframes. Add any missing assertions: DeckBrowsingPage — hero renders, DeckGameTabs renders, deck grid items render, pagination present; DeckViewPage — hero with card-fan renders, Visual/List/Stats tabs present, ManaCurveChart renders in Stats tab, "Buy Missing Cards" button renders in header. Grep both for light-mode leaks and fix any found.

## Verification Criteria

`npx vitest run --reporter=verbose src/components/decks/__tests__/` — all pass.

## Done When

Both page tests pass with wireframe sections confirmed, zero light-mode leaks.
