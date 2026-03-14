---
estimated_steps: 4
estimated_files: 4
---

# T05: Integration wiring and cross-system verification

**Slice:** S01 — CSV Inventory Import & Catalog Matching
**Milestone:** M002

## Description

Prove the full CSV import pipeline works as a connected system. Extend existing test files with integration-style tests using realistic card names, verify cross-component behavior, and write the integration verification document that describes how to manually validate the end-to-end flow with running services.

## Steps

1. Extend `catalog-fuzzy-match.test.ts` with integration-style test cases: exact match ("Lightning Bolt" → similarity ~1.0, confidence "auto"), typo match ("Lightening Bolt" → similarity ~0.7, confidence "fuzzy"), partial match ("Charizard VMAX" against "Charizard VMAX - 074/073" → boosted by name similarity), no match ("XYZZY Nonexistent Card" → empty results), set-name boosting ("Lightning Bolt" + setName "Alpha" ranks Alpha printing higher than "Foundations" printing). These tests mock `AppDataSource.query()` with realistic return shapes.
2. Extend `bulk-import-review.spec.tsx` with tests: renders auto tab with correct count badge, fuzzy tab shows candidate dropdown with similarity percentage, selecting a candidate enables confirm checkbox, unmatched tab shows "No matches found" message with search input, switching tabs preserves selections, "Confirm All" button disabled when unresolved fuzzy matches exist, enabled when all fuzzy matches are confirmed or skipped.
3. Write `S01-VERIFICATION.md` documenting the manual integration test procedure for human verification: (a) Prerequisites — all services running (backend on :9000, customer-backend on :3001, vendorpanel on :5173, PostgreSQL, Redis, MinIO). (b) Prepare test CSV — sample TCGPlayer CSV with ~20 rows including known cards, misspelled names, and nonexistent cards. (c) Upload step — navigate to `/products/bulk-import`, upload CSV, verify format detected as "TCGPlayer", preview shows 10 rows. (d) Match step — click "Upload & Start Matching", wait for matching to complete, verify Auto tab shows ~17 cards (85%), Fuzzy tab shows ~2 cards (10%), Unmatched tab shows ~1 card (5%). (e) Review step — in Fuzzy tab, select correct candidate for each card, in Unmatched tab search for card manually. (f) Confirm step — click "Confirm All & Create Listings", verify progress bar completes, verify listings appear in Products list page. (g) Include a sample 20-row TCGPlayer CSV in the verification doc for reproducibility.
4. Run full test suites in both repos to verify no regressions: `cd customer-backend && npm test` and `cd vendorpanel && npm test`. Fix any failures. Verify TypeScript compilation in all three repos: `cd customer-backend && npx tsc --noEmit`, `cd vendorpanel && npx tsc --noEmit`, `cd backend && npx tsc --noEmit`.

## Must-Haves

- [ ] Fuzzy-match tests cover realistic card name scenarios (exact, typo, partial, no match, set boost)
- [ ] Review component tests verify tab behavior, selection state, and confirm button logic
- [ ] S01-VERIFICATION.md documents step-by-step manual integration test procedure
- [ ] Sample TCGPlayer CSV included in verification doc
- [ ] All tests pass in customer-backend and vendorpanel
- [ ] No TypeScript compilation errors in any repo

## Verification

- `cd customer-backend && npm test` — all tests pass (existing + new)
- `cd vendorpanel && npm test` — all tests pass (existing + new)
- `S01-VERIFICATION.md` exists and is complete

## Inputs

- T02's `catalog-fuzzy-match.test.ts` — extend with additional test cases
- T04's `bulk-import-review.spec.tsx` — extend with additional component tests
- All artifacts from T01–T04

## Expected Output

- `customer-backend/src/tests/routes/catalog-fuzzy-match.test.ts` — extended with ≥5 integration-style test cases
- `vendorpanel/src/routes/products/product-bulk-import/__tests__/bulk-import-review.spec.tsx` — extended with ≥6 component tests
- `.gsd/milestones/M002/slices/S01/S01-VERIFICATION.md` — manual integration test procedure
