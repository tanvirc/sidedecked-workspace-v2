# T03: Audit and test SearchPageLayout

**Slice:** S02
**Status:** not-started
**Estimate:** 1h

## Goal

Confirm breadcrumbs, results header, and CardSearchGrid composition are locked against the current wireframe structure. Existing wiring tests exist but need verification.

## Files to Touch

- `storefront/src/components/search/__tests__/SearchPageWiring.test.tsx` (extend if needed)
- `storefront/src/components/search/SearchPageLayout.tsx` (audit)

## What to Do

Read `docs/plans/wireframes/storefront-search.html`. Run existing search tests and confirm all pass. Check `SearchPageLayout.tsx` for any structural gaps vs wireframe: breadcrumbs (Home → Search Results → "query"), results header with live hit count, `CardSearchGrid` with sidebar + grid. Add any missing structural assertions. Verify Voltage token compliance.

## Verification Criteria

`npx vitest run --reporter=verbose src/components/search/__tests__/` — all 145 pass (no regressions).

## Done When

Search tests pass, wireframe sections confirmed present.
