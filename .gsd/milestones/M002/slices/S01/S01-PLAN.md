# S01: CSV Inventory Import & Catalog Matching

**Goal:** A business seller uploads a CSV in the vendor panel, the parser detects TCGPlayer/Crystal Commerce/manual format, cards are matched against the catalog with 85/10/5 confidence tiers using pg_trgm, the seller reviews fuzzy matches and resolves unmatched cards, and confirmed cards create real listings in the marketplace.
**Demo:** Upload a multi-format CSV file → format auto-detected → cards matched with confidence tiers → fuzzy matches reviewed and resolved → listings created via consumer-seller products API → listings visible in vendor panel product list.

## Must-Haves

- CSV parser detects TCGPlayer (marker: `TCGplayer Id`), Crystal Commerce (marker: `Category`), and manual (fallback) formats via papaparse (D039)
- Column mapping normalizes all three formats into a common intermediate representation (card name, set name, condition, quantity, price)
- Parser handles edge cases: BOM, trailing commas, quoted fields with newlines, empty rows
- `GET /api/catalog/cards/fuzzy-match` endpoint in customer-backend uses pg_trgm `word_similarity()` (D040) with configurable threshold (initial 0.5)
- GIN trigram index on `cards.normalizedName` for performant fuzzy matching
- Fuzzy match returns candidates with confidence scores in three tiers: auto (≥0.8), fuzzy (0.5–0.79), unmatched (<0.5)
- Backend API routes for bulk import lifecycle: upload → match → results → confirm
- Confirm step creates real listings via existing `POST /vendor/consumer-seller/products` API
- Vendor panel bulk import UI: upload page, matching progress, review page (auto/fuzzy/unmatched tabs), confirm page
- Bulk import route registered in vendor panel router

## Proof Level

- This slice proves: integration (CSV → match → listing creation across two databases)
- Real runtime required: yes (pg_trgm requires PostgreSQL, listing creation requires Medusa)
- Human/UAT required: yes (review UI usability)

## Verification

- `customer-backend/src/tests/routes/catalog-fuzzy-match.test.ts` — fuzzy match endpoint unit tests: similarity scoring, confidence tiers, edge cases (empty query, no matches, exact match)
- `customer-backend/src/tests/services/csv-parser.test.ts` — CSV parser unit tests: format detection (TCGPlayer/Crystal Commerce/manual), column mapping, error handling, BOM handling, empty rows
- `vendorpanel/src/routes/products/product-bulk-import/__tests__/csv-parser.spec.ts` — client-side CSV parser tests: format detection, preview parsing, validation
- `vendorpanel/src/routes/products/product-bulk-import/__tests__/bulk-import-review.spec.tsx` — review UI component tests: tier tabs, match selection, confirm flow
- `cd customer-backend && npm test -- --grep "fuzzy-match"` passes
- `cd customer-backend && npm test -- --grep "csv-parser"` passes
- `cd vendorpanel && npm test -- --grep "csv-parser|bulk-import"` passes

## Observability / Diagnostics

- Runtime signals: Import progress logged with `importId`, row count, match counts per tier, listing creation success/failure counts
- Inspection surfaces: `GET /vendor/consumer-seller/bulk-import/:importId/results` returns current match state; vendor panel review page shows live tier counts
- Failure visibility: Parse errors include row number and column name; match failures include card name and best similarity score; listing creation failures include catalog_sku and error message
- Redaction constraints: none (no PII in card inventory data)

## Integration Closure

- Upstream surfaces consumed: `POST /vendor/consumer-seller/products` (existing, creates listings), catalog entities Card/Print/CatalogSKU in customer-backend, `cards.normalizedName` column with existing B-tree index, pg_trgm extension (already enabled via translation migration)
- New wiring introduced in this slice: GIN trigram index on `cards.normalizedName`, fuzzy-match API endpoint, bulk-import API routes in backend, vendor panel bulk import route + UI
- What remains before the milestone is truly usable end-to-end: S02 (disputes), S03 (price anomaly + trust scores), S04 (enforcement + integration proof)

## Tasks

- [ ] **T01: CSV parser with format detection and column mapping** `est:2h`
  - Why: Foundation for the entire import pipeline. Pure parsing logic that can be tested without any database. Must handle three CSV formats and produce a normalized intermediate representation.
  - Files: `customer-backend/src/services/CSVParserService.ts`, `customer-backend/src/tests/services/csv-parser.test.ts`
  - Do: Build CSVParserService using papaparse (D039). Implement format detection via marker columns (`TCGplayer Id` → TCGPlayer, `Category` → Crystal Commerce, fallback → manual). Map each format's columns to a common `ParsedCard` shape (cardName, setName, condition, quantity, price, collectorNumber, language, finish). Handle BOM, trailing commas, quoted newlines, empty rows. Export types for `ParsedCard`, `ParseResult`, `CSVFormat`. Write comprehensive unit tests covering all three formats, edge cases, and error paths.
  - Verify: `cd customer-backend && npm test -- --testPathPattern="csv-parser"` — all tests pass
  - Done when: CSVParserService correctly detects format for TCGPlayer/Crystal Commerce/manual CSVs, produces `ParsedCard[]` with correct column mapping, and handles all edge cases with descriptive errors

- [ ] **T02: Fuzzy matching API endpoint with pg_trgm** `est:2h`
  - Why: The matching engine that connects CSV card names to catalog entries. Uses pg_trgm `word_similarity()` per D040 with confidence tiers. Needs a GIN index migration on `cards.normalizedName` for performance.
  - Files: `customer-backend/src/routes/catalog-fuzzy-match.ts`, `customer-backend/src/migrations/1778000000000-AddNormalizedNameTrigramIndex.ts`, `customer-backend/src/tests/routes/catalog-fuzzy-match.test.ts`, `customer-backend/src/index.ts`
  - Do: Create migration adding GIN trigram index on `cards.normalizedName` (pg_trgm extension already exists). Build `GET /api/catalog/cards/fuzzy-match` route accepting `name` (required), `setName` (optional), `gameCode` (optional), `limit` (default 5) query params. Query uses `word_similarity(normalizedName, :query)` with configurable threshold from env `FUZZY_MATCH_THRESHOLD` (default 0.5). Return candidates with `{cardId, cardName, setName, setCode, collectorNumber, printId, similarity, confidence}` where confidence is `auto` (≥0.8), `fuzzy` (0.5–0.79), or `none` (<0.5). When `setName` is provided, boost matches where print's set name matches. Register route in customer-backend app. Write unit tests mocking DB.
  - Verify: `cd customer-backend && npm test -- --testPathPattern="catalog-fuzzy-match"` — all tests pass
  - Done when: Endpoint returns ranked card matches with similarity scores and confidence tiers; set name matching boosts relevant results; migration creates GIN index

- [ ] **T03: Backend bulk-import API routes** `est:2h`
  - Why: Orchestration layer that manages the import lifecycle (upload → parse → match → confirm → create listings). Stores import state in-memory per session, calls customer-backend for matching, and creates listings via existing consumer-seller products API.
  - Files: `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/route.ts`, `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/match/route.ts`, `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/results/route.ts`, `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/confirm/route.ts`, `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/store.ts`
  - Do: Build four API routes following existing Medusa route patterns: (1) `POST /vendor/consumer-seller/bulk-import/upload` — accepts CSV text body, parses via CSVParserService logic (inline, since this is Medusa not Express), returns `{importId, format, rowCount, preview[]}`. (2) `POST .../match` — for each parsed row, calls customer-backend `GET /api/catalog/cards/fuzzy-match`, aggregates results into auto/fuzzy/unmatched buckets. (3) `GET .../results` — returns current match state with counts and card lists per tier. (4) `POST .../confirm` — accepts `{confirmed: [{parsedIndex, cardId, printId, catalogSku}]}`, creates listings by calling `POST /vendor/consumer-seller/products` for each confirmed card. Use an in-memory Map keyed by importId to store import state (sufficient for MVP; Redis-backed in production). Import state includes: parsed rows, match results, confirmation status, creation results.
  - Verify: Routes respond with correct shapes; confirm step calls consumer-seller products API; error states handled
  - Done when: Full import lifecycle works through API calls: upload returns importId → match populates tiers → results returns match data → confirm creates listings

- [ ] **T04: Vendor panel bulk import UI** `est:3h`
  - Why: The user-facing surface that ties the pipeline together. Business sellers need to upload CSVs, review fuzzy matches, resolve unmatched cards, and confirm listings — all in the vendor panel.
  - Files: `vendorpanel/src/routes/products/product-bulk-import/index.ts`, `vendorpanel/src/routes/products/product-bulk-import/product-bulk-import.tsx`, `vendorpanel/src/routes/products/product-bulk-import/components/csv-upload-step.tsx`, `vendorpanel/src/routes/products/product-bulk-import/components/match-review-step.tsx`, `vendorpanel/src/routes/products/product-bulk-import/components/confirm-step.tsx`, `vendorpanel/src/routes/products/product-bulk-import/lib/csv-parser.ts`, `vendorpanel/src/routes/products/product-bulk-import/__tests__/csv-parser.spec.ts`, `vendorpanel/src/routes/products/product-bulk-import/__tests__/bulk-import-review.spec.tsx`, `vendorpanel/src/providers/router-provider/route-map.tsx`
  - Do: (1) Build client-side CSV parser in `lib/csv-parser.ts` using papaparse for browser — detects format, validates columns, returns preview rows. (2) Build 3-step import wizard: **CSVUploadStep** (file drop zone using existing `FileUpload` component, format detection badge, preview table of first 10 rows), **MatchReviewStep** (tabs for Auto/Fuzzy/Unmatched counts, fuzzy tab shows card name + candidates with similarity % + select dropdown, unmatched tab shows card name + manual search input calling `/api/catalog/cards/search`), **ConfirmStep** (summary of confirmed matches, create listings button, progress bar, results). (3) Wire to backend bulk-import API via TanStack Query mutations. (4) Register route at `/products/bulk-import` in route-map.tsx under products path. (5) Write unit tests for client-side CSV parser and component rendering tests for review step.
  - Verify: `cd vendorpanel && npm test -- --testPathPattern="csv-parser|bulk-import"` — all tests pass
  - Done when: Vendor panel has a working `/products/bulk-import` route with upload → review → confirm flow; client CSV parser detects formats; review step shows tier tabs with match candidates; confirm creates listings

- [ ] **T05: Integration wiring and cross-system verification** `est:1h`
  - Why: Proves the full pipeline works end-to-end: CSV upload in vendor panel → format detection → catalog matching via customer-backend fuzzy-match API → listing creation via backend consumer-seller products API. Without this, the individual pieces are unproven together.
  - Files: `customer-backend/src/tests/routes/catalog-fuzzy-match.test.ts` (extend), `vendorpanel/src/routes/products/product-bulk-import/__tests__/bulk-import-review.spec.tsx` (extend), `.gsd/milestones/M002/slices/S01/S01-VERIFICATION.md`
  - Do: (1) Add integration-style tests to the fuzzy-match test file that verify the full request → similarity query → tiered response pipeline with realistic card names (e.g., "Lightning Bolt" exact, "Lightening Bolt" typo, "Charizard VMAX" partial). (2) Add review step tests verifying tier tab switching, fuzzy match selection, and confirm button state. (3) Write S01-VERIFICATION.md documenting the manual integration test procedure: start all services → upload TCGPlayer sample CSV → verify format detected → verify match tiers → select fuzzy matches → confirm → verify listings appear in product list. (4) Verify all test suites pass across both repos.
  - Verify: `cd customer-backend && npm test` and `cd vendorpanel && npm test` — all existing + new tests pass
  - Done when: Verification doc written with step-by-step integration procedure; all automated tests pass; no regressions in existing test suites

## Files Likely Touched

- `customer-backend/src/services/CSVParserService.ts`
- `customer-backend/src/routes/catalog-fuzzy-match.ts`
- `customer-backend/src/migrations/1778000000000-AddNormalizedNameTrigramIndex.ts`
- `customer-backend/src/index.ts`
- `customer-backend/src/tests/services/csv-parser.test.ts`
- `customer-backend/src/tests/routes/catalog-fuzzy-match.test.ts`
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/route.ts`
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/match/route.ts`
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/results/route.ts`
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/confirm/route.ts`
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/store.ts`
- `vendorpanel/src/routes/products/product-bulk-import/index.ts`
- `vendorpanel/src/routes/products/product-bulk-import/product-bulk-import.tsx`
- `vendorpanel/src/routes/products/product-bulk-import/components/csv-upload-step.tsx`
- `vendorpanel/src/routes/products/product-bulk-import/components/match-review-step.tsx`
- `vendorpanel/src/routes/products/product-bulk-import/components/confirm-step.tsx`
- `vendorpanel/src/routes/products/product-bulk-import/lib/csv-parser.ts`
- `vendorpanel/src/routes/products/product-bulk-import/__tests__/csv-parser.spec.ts`
- `vendorpanel/src/routes/products/product-bulk-import/__tests__/bulk-import-review.spec.tsx`
- `vendorpanel/src/providers/router-provider/route-map.tsx`
