---
estimated_steps: 12
estimated_files: 6
---

# T08: Cross-Repo Integration Wiring + End-to-End Verification

**Slice:** S01 — CSV Inventory Import & Catalog Matching
**Milestone:** M002

## Why

Each prior task was built and verified in isolation (unit tests, typecheck, build). This final task wires the full pipeline across all three services and verifies the 2,400-card CSV processes end-to-end. It also runs all quality gates to ensure no regressions. Integration issues (CORS, auth headers, URL config, data shape mismatches) only surface when real services talk to each other.

## What

- Cross-service wiring verification and fixes
- GIN trigram index migration on local sidedecked-db
- End-to-end test with 2,400-row CSV through full pipeline
- All quality gates passing across all three repos
- Integration test procedure documented in S01-UAT.md

## Steps

1. **Verify environment configuration:**
   - Backend has `CUSTOMER_BACKEND_URL` pointing to customer-backend (default `http://localhost:7000`)
   - Backend has `SERVICE_API_KEY` matching customer-backend's config
   - Vendorpanel has `__BACKEND_URL__` pointing to backend (default `http://localhost:9000`)
   - Vendorpanel has `__CUSTOMER_BACKEND_URL__` pointing to customer-backend (for direct catalog search calls)
   - Check CORS: backend VENDOR_CORS must allow vendorpanel origin (`http://localhost:5173`)

2. **Run customer-backend migration:**
   - `cd customer-backend && npm run migration:run`
   - Verify the GIN trigram index exists: `SELECT indexname FROM pg_indexes WHERE indexname = 'idx_cards_normalized_name_trgm';`
   - Verify `pg_trgm` extension: `SELECT * FROM pg_extension WHERE extname = 'pg_trgm';`

3. **Start all three services:**
   - `cd customer-backend && npm run dev` (port 7000)
   - `cd backend && npm run dev` (port 9000)
   - `cd vendorpanel && npm run dev` (port 5173)

4. **Verify backend → customer-backend connectivity:**
   - Curl the batch fuzzy match endpoint directly with SERVICE_API_KEY:
     ```bash
     curl -X POST http://localhost:7000/api/catalog/cards/fuzzy-match/batch \
       -H "Content-Type: application/json" \
       -H "X-Service-Key: <key>" \
       -d '{"names": ["Lightning Bolt", "Counterspell"]}'
     ```
   - Verify response structure matches expected `BatchFuzzyMatchResponse` shape
   - If errors: fix URL config, auth headers, or response format

5. **Verify vendorpanel → backend connectivity:**
   - Navigate to `http://localhost:5173/products/bulk-import` in browser
   - Verify wizard renders
   - If CORS errors: update backend VENDOR_CORS

6. **End-to-end test with test fixture:**
   - Upload `customer-backend/src/tests/fixtures/tcgplayer-2400.csv` through the vendor panel UI
   - Verify: format detected as TCGPlayer, row count shown as 2,400
   - Verify: upload succeeds, importId returned
   - Verify: match auto-triggers, results classified into tiers
   - Verify: review step shows correct counts per tab
   - Test fuzzy tab: select a candidate via radio button
   - Test unmatched tab: search for a card and assign
   - Confirm: verify listings created in mercur-db
   - Check mercur-db: `SELECT count(*) FROM product WHERE metadata->>'catalog_sku' IS NOT NULL;`

7. **Fix integration issues as found:**
   - Data shape mismatches between backend response and vendorpanel expectations
   - Auth header propagation (bearer token from vendor panel, SERVICE_API_KEY from backend to customer-backend)
   - Pagination parameter naming consistency
   - Error response format consistency

8. **Run all quality gates:**
   ```bash
   cd customer-backend && npm run lint && npm run typecheck && npm run build && npm test
   cd ../backend && npm run lint && npm run typecheck && npm run build
   cd ../vendorpanel && npm run lint && npm run typecheck && npm run build
   ```
   - Fix any lint errors, type errors, or test regressions
   - Note: backend test suite (`npm run test:unit`) should run if unit tests exist for bulk import routes

9. **Document integration test procedure in S01-UAT.md:**
   - Prerequisites: databases seeded with card catalog data, pg_trgm extension enabled, all three services running
   - Step-by-step: upload CSV → verify format detection → verify match results → review tabs → confirm → verify listings
   - Expected outcomes: ~85% auto-match, ~10% fuzzy, ~5% unmatched (depends on catalog data)
   - Verification queries for mercur-db (product count, metadata check)
   - Known limitations: in-memory state lost on restart, 5,000-row limit

10. **Performance spot-check:**
    - Time the match step for 2,400 cards — should complete in < 30 seconds
    - If slow: check GIN index is being used (`EXPLAIN ANALYZE` on the fuzzy match query)
    - Time the confirm step for a batch of 100 cards — extrapolate for full 2,400

11. **Verify no regressions:**
    - Run existing test suites in all repos
    - Verify existing vendor panel routes still work (products, orders, etc.)
    - Verify existing customer-backend endpoints still respond

12. **Final verification:**
    - The full pipeline works: upload → match → review → confirm → real products in mercur-db
    - All quality gates pass with zero failures
    - S01-UAT.md documented with reproducible test procedure

## Files

- `.gsd/milestones/M002/slices/S01/S01-UAT.md` — new: integration test procedure
- `vendorpanel/src/lib/client/customer-backend.ts` — potential fixes for URL/auth
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/` — potential integration fixes
- Backend `.env` or config — verify CUSTOMER_BACKEND_URL, SERVICE_API_KEY
- Vendorpanel Vite config — verify __BACKEND_URL__, __CUSTOMER_BACKEND_URL__

## Verification

- `cd customer-backend && npm run lint && npm run typecheck && npm run build && npm test` — all pass
- `cd backend && npm run lint && npm run typecheck && npm run build` — all pass
- `cd vendorpanel && npm run lint && npm run typecheck && npm run build` — all pass
- 2,400-row CSV processes end-to-end with real products created in mercur-db

## Done When

- GIN trigram index migration applied on local sidedecked-db
- Backend successfully calls customer-backend batch fuzzy match with SERVICE_API_KEY
- Vendor panel successfully uploads CSV, triggers match, shows review, creates listings
- 2,400-row TCGPlayer CSV completes the full pipeline
- All quality gates pass across all three repos with zero regressions
- S01-UAT.md documents the complete integration test procedure
- Performance is acceptable: match step < 30 seconds for 2,400 cards
