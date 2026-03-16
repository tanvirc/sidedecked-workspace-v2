# T08: Full quality gate + commit

**Slice:** S02
**Status:** not-started
**Estimate:** 30m

## Goal

Ensure S02 ships clean — all tests pass, typecheck clean, build succeeds, no light-mode class regressions across the full cards/deck-builder/decks surface.

## Files to Touch

No new files.

## What to Do

Run `npm run typecheck` and fix any type errors introduced during S02. Run `npm run build` and fix any build errors. Run `npm test -- --run` and confirm all tests pass. Run light-mode grep across `src/components/cards/`, `src/components/deck-builder/`, `src/components/decks/` and fix any matches. Commit all changes to `gsd/M001/S01` branch (storefront sub-repo).

## Verification Criteria

`npm run typecheck` exits 0. `npm run build` exits 0. `npm test -- --run` all pass. Grep returns zero light-mode matches.

## Done When

Quality gate green across all three checks. Changes committed to slice branch.
