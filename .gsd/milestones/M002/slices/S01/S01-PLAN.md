# S01: CSV Inventory Import & Catalog Matching

**Goal:** A business seller uploads a TCGPlayer/Crystal Commerce/manual CSV in the vendor panel and gets real marketplace listings created — with batch fuzzy matching against the card catalog, confidence-tiered review, and skip-and-report for partial failures.
**Demo:** Upload a 2,400-row TCGPlayer CSV → see format auto-detected → watch batch matching classify cards into auto/fuzzy/unmatched tiers → review fuzzy matches with radio selection → confirm → real Medusa products created via `createProductsWorkflow` with correct `catalog_sku` metadata.

## Must-Haves

- CSV parser detecting TCGPlayer, Crystal Commerce, and manual formats via marker columns
- Batch fuzzy match endpoint using `word_similarity()` + GIN trigram index on `cards.normalizedName`
- Backend bulk import routes (upload, match, results, confirm) with in-memory state
- Vendor panel three-step wizard (upload → review → confirm) with tabbed review
- Listing creation via `createProductsWorkflow` (same pattern as `/store/consumer-seller/listings`)
- 2,400-row TCGPlayer CSV test fixture processing end-to-end

## Proof Level

- This slice proves: integration (cross-service data flow through split-brain boundary)
- Real runtime required: yes (all three services + both databases)
- Human/UAT required: yes (review step UX requires seller interaction)

## Verification

- `cd customer-backend && npm test -- --testPathPattern="csv-parser"` — parser unit tests pass
- `cd customer-backend && npm test -- --testPathPattern="fuzzy-match"` — batch fuzzy match unit tests pass
- `cd customer-backend && npm run typecheck && npm run build` — no type/build errors
- `cd backend && npm run typecheck && npm run build` — no type/build errors with new bulk import routes
- `cd vendorpanel && npm run typecheck && npm run build` — no type/build errors with new wizard UI
- Integration procedure: all three services running → upload 2,400-row CSV → match → review → confirm → verify products exist in mercur-db

## Observability / Diagnostics

- Runtime signals: import state transitions logged (uploaded → matching → matched → confirming → completed/partial), batch match timing per chunk
- Inspection surfaces: `GET /vendor/consumer-seller/bulk-import/:importId/results` returns full state with counts per tier, `GET /vendor/consumer-seller/bulk-import/:importId/status` returns current phase
- Failure visibility: per-card error in confirm results `{sku, error, status: 'failed'}`, summary counts `{created, failed, skipped}`
- Redaction constraints: no seller PII in logs beyond seller ID

## Integration Closure

- Upstream surfaces consumed: `createProductsWorkflow` (MedusaJS core-flows), `cards.normalizedName` column (sidedecked-db), `CatalogSKU.sku` (cross-service bridge), `authenticateServiceKey` middleware (customer-backend), `fetchConsumerSellerByCustomerId` (backend seller resolution)
- New wiring introduced: backend → customer-backend HTTP calls for batch fuzzy match, vendor panel → backend bulk import REST API, `createProductsWorkflow` called from vendor route (new path)
- What remains before the milestone is truly usable end-to-end: S02 (price suggestions), S03 (trust/anomaly), S04 (integration proof) — but S01 is independently demoable

## Tasks

- [ ] **T01: CSV parser service + test fixtures in customer-backend** `est:120m`
  - Why: The CSV parser is the entry point for all import data. It has no DB dependency, making it safe to build first with pure unit tests. The test fixtures generated here are reused by every downstream task.
  - Files: `customer-backend/src/services/CsvParserService.ts`, `customer-backend/src/tests/services/csv-parser.test.ts`, `customer-backend/src/tests/fixtures/tcgplayer-2400.csv`, `customer-backend/src/tests/fixtures/tcgplayer-20.csv`, `customer-backend/src/tests/fixtures/crystal-commerce-20.csv`, `customer-backend/src/tests/fixtures/manual-20.csv`, `customer-backend/package.json`
  - Do: Install `papaparse` + `@types/papaparse`. Build `CsvParserService` with format detection (marker columns: `TCGplayer Id` → TCGPlayer, `Category` → Crystal Commerce, fallback → manual), column mapping to normalized internal representation, row validation, 5,000-row limit enforcement. Generate synthetic TCGPlayer CSV fixture (2,400 rows) using card name patterns with 80/10/10 auto/fuzzy/unmatched distribution. Generate small 20-row fixtures for each format. Unit tests cover: all 3 format detections, BOM handling, trailing commas, quoted fields with newlines, empty rows, zero-row CSV, duplicate names, >5,000 row rejection, Unicode card names.
  - Verify: `cd customer-backend && npm test -- --testPathPattern="csv-parser"` passes all tests
  - Done when: CsvParserService parses all 3 formats correctly, test fixtures committed, all edge case tests green

- [ ] **T02: GIN trigram index migration + batch fuzzy match endpoint in customer-backend** `est:120m`
  - Why: The batch fuzzy match endpoint is the riskiest piece — it involves a new SQL pattern (`unnest()` + `LATERAL JOIN` + `word_similarity()`) against a new GIN index. Building and testing it early de-risks the entire slice.
  - Files: `customer-backend/src/migrations/1777300000000-AddCardNameTrigramIndex.ts`, `customer-backend/src/routes/catalog.ts`, `customer-backend/src/services/FuzzyMatchService.ts`, `customer-backend/src/tests/services/fuzzy-match.test.ts`, `customer-backend/src/tests/routes/fuzzy-match-batch.test.ts`
  - Do: Create TypeORM migration for GIN trigram index on `cards."normalizedName"` using `gin_trgm_ops`. Build `FuzzyMatchService` with batch matching: accepts array of card names, runs `unnest()` + `LATERAL JOIN` query with `%` operator for GIN pre-filtering + `word_similarity()` for scoring, returns top 5 candidates per name. Classify into tiers: auto (≥0.8), fuzzy (0.5–0.79), unmatched (<0.5). Thresholds configurable via `config`. Add `POST /api/catalog/cards/fuzzy-match/batch` route protected by `authenticateServiceKey`. Accept up to 500 names per request. Return enriched results including card ID, name, game code, print details (set, number, rarity, image), and CatalogSKU details (sku, condition, price). Unit tests with mocked DB for service logic + tier classification. Route tests with mocked service.
  - Verify: `cd customer-backend && npm test -- --testPathPattern="fuzzy-match"` passes, `cd customer-backend && npm run typecheck && npm run build` succeeds
  - Done when: Migration applies cleanly, batch endpoint returns correctly structured results with tier classification, SERVICE_API_KEY auth enforced, all tests green

- [ ] **T03: Backend bulk import routes — upload, match, results** `est:120m`
  - Why: The backend orchestrates the import flow — receiving the CSV upload, chunking names to customer-backend for matching, and storing results in-memory. This must exist before the vendor panel UI can be built.
  - Files: `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/upload/route.ts`, `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/match/route.ts`, `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/results/route.ts`, `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/status/route.ts`, `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/validators.ts`, `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/middlewares.ts`, `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/import-state.ts`, `backend/apps/backend/src/api/vendor/middlewares.ts`
  - Do: Build in-memory import state manager (`Map<string, ImportState>` with 30-minute TTL, single active import per seller). `POST .../upload` — accept multipart CSV via multer, parse with papaparse server-side, validate row count ≤5,000, store parsed rows, return `{importId, rowCount, format}`. `POST .../match` — chunk parsed card names into batches of 500, call customer-backend `POST /api/catalog/cards/fuzzy-match/batch` for each chunk (sync, sequential), aggregate results with tier classification, store in import state. `GET .../results` — return classified match results with pagination (25 per page), grouped by tier (auto/fuzzy/unmatched counts). `GET .../status` — return current import phase and counts. Register middleware in vendor middlewares (auth + seller approved). Install `papaparse` + `@types/papaparse` in backend. Add Zod validators for all request/response shapes.
  - Verify: `cd backend && npm run typecheck && npm run build` succeeds, routes are registered and reachable
  - Done when: All four routes respond correctly with mock/real data, in-memory state management works with TTL and single-import-per-seller enforcement, middleware registered

- [ ] **T04: Backend bulk import confirm route — listing creation via createProductsWorkflow** `est:90m`
  - Why: The confirm route is the split-brain boundary — it reads match results (sourced from sidedecked-db) and creates real Medusa products (in mercur-db). This is separated from T03 because it depends on understanding the `createProductsWorkflow` pattern and has its own failure handling (skip-and-report).
  - Files: `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/confirm/route.ts`, `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/confirm/validators.ts`, `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/import-state.ts` (update)
  - Do: Build `POST .../confirm` route. Accept `{confirmedItems: [{inputName, catalogSku, condition, price, quantity, ...}]}`. Resolve seller via `fetchConsumerSellerByCustomerId` (same pattern as `/store/consumer-seller/listings`). Iterate confirmed items and call `createProductsWorkflow` for each — build product input with: title from card name, handle from title, `catalog_sku` in metadata, condition as product option, price from seller input, images from print data, `seller_id` in `additional_data`. Process in sequential batches of 10 with skip-and-report: success → `{sku, productId, status: 'created'}`, failure → `{sku, error, status: 'failed'}`, skip → `{sku, status: 'skipped'}`. Update import state with results summary `{created, failed, skipped}`. Return full results.
  - Verify: `cd backend && npm run typecheck && npm run build` succeeds
  - Done when: Confirm route creates real products via `createProductsWorkflow` with correct structure, partial failures are recorded and reported, import state updated to `completed`

- [ ] **T05: Vendor panel — CSV upload step with client-side parsing** `est:90m`
  - Why: The upload step is the first UI the seller interacts with. Client-side CSV parsing with papaparse gives instant format detection and row count preview without a server round-trip, then uploads to the backend for server-side validation.
  - Files: `vendorpanel/src/routes/products/product-bulk-import/product-bulk-import.tsx`, `vendorpanel/src/routes/products/product-bulk-import/constants.ts`, `vendorpanel/src/routes/products/product-bulk-import/components/upload-step/upload-step.tsx`, `vendorpanel/src/hooks/api/bulk-import.tsx`, `vendorpanel/src/lib/client/customer-backend.ts` (extend with POST support), `vendorpanel/src/lib/client/client.ts` (add bulk import upload), `vendorpanel/package.json`
  - Do: Install `papaparse` + `@types/papaparse` in vendorpanel. Create bulk import route at `/products/bulk-import` with `RouteFocusModal` + `ProgressTabs` (Upload → Review → Confirm) following `product-create-listing` pattern. Build upload step: drag-and-drop CSV file upload using existing `FileUpload` component, client-side papaparse parse for format detection + row count + preview (first 5 rows), 5,000-row client-side enforcement, display detected format and row count. On "Continue": upload file to `POST /vendor/consumer-seller/bulk-import/upload` via `importProductsQuery`-style fetch with FormData. Create TanStack Query hooks: `useBulkImportUpload` (mutation), `useBulkImportMatch` (mutation), `useBulkImportResults` (query), `useBulkImportConfirm` (mutation). Add route to vendorpanel router.
  - Verify: `cd vendorpanel && npm run typecheck && npm run build` succeeds
  - Done when: Upload step renders with drag-and-drop, detects CSV format client-side, shows preview, uploads to backend, ProgressTabs navigate correctly, TanStack Query hooks created

- [ ] **T06: Vendor panel — review step with tabbed match results** `est:120m`
  - Why: The review step is the most complex UI — three tabs (auto/fuzzy/unmatched) with different interaction patterns. This is where the seller makes decisions about ambiguous matches.
  - Files: `vendorpanel/src/routes/products/product-bulk-import/components/review-step/review-step.tsx`, `vendorpanel/src/routes/products/product-bulk-import/components/review-step/auto-match-tab.tsx`, `vendorpanel/src/routes/products/product-bulk-import/components/review-step/fuzzy-match-tab.tsx`, `vendorpanel/src/routes/products/product-bulk-import/components/review-step/unmatched-tab.tsx`, `vendorpanel/src/routes/products/product-bulk-import/components/review-step/match-card-row.tsx`
  - Do: Build review step triggered after match completes. Fetch results via `useBulkImportResults` hook with pagination (25 per page). Three tabs using Medusa UI `Tabs` component with counts: "Auto-matched (N)" / "Review (N)" / "Unmatched (N)". Auto-match tab: table of pre-approved matches with card name, matched catalog card, set, similarity %, small image. "Approve all" bulk action button (pre-checked). Fuzzy tab: each row shows seller's card name + top 5 candidates with radio buttons for selection. Candidates display: card name, set name, collector number, image thumbnail, similarity %. "None of these" radio option moves card to unmatched. Paginated at 25 per page. Unmatched tab: each row shows seller's card name + inline search using existing `useCardSearch` hook. Search results can be selected to assign a match, or card can be skipped. "Skip all unmatched" bulk action. Store all selections in react-hook-form state.
  - Verify: `cd vendorpanel && npm run typecheck && npm run build` succeeds
  - Done when: All three tabs render with correct data, fuzzy tab radio selection works, unmatched tab search works, pagination works, selection state is tracked in form

- [ ] **T07: Vendor panel — confirm step + listing creation progress** `est:90m`
  - Why: The confirm step sends the seller's selections to the backend for listing creation and shows progress/results. This closes the UI loop.
  - Files: `vendorpanel/src/routes/products/product-bulk-import/components/confirm-step/confirm-step.tsx`, `vendorpanel/src/routes/products/product-bulk-import/components/confirm-step/results-summary.tsx`, `vendorpanel/src/routes/products/product-bulk-import/product-bulk-import.tsx` (wire all steps)
  - Do: Build confirm step showing summary before submission: N cards to create, N skipped, condition/price defaults. Seller sets default condition and price (or per-card overrides from CSV data). On confirm: call `POST .../confirm` via `useBulkImportConfirm` mutation. Show progress indicator during creation. Display results summary: created (N), failed (N with error details), skipped (N). Success state shows link to products list. Error state allows viewing failed items. Wire all three steps together in the `ProgressTabs` flow: upload → automatically trigger match → show review → confirm → results. Handle error states: malformed CSV message, matching failure message, partial confirm failure summary.
  - Verify: `cd vendorpanel && npm run typecheck && npm run build` succeeds
  - Done when: Full wizard flow works upload → review → confirm → results, error states display correctly, progress indicator shows during creation, results summary shows created/failed/skipped counts

- [ ] **T08: Cross-repo integration wiring + end-to-end verification** `est:90m`
  - Why: Each task so far was built and verified in isolation. This task wires the full pipeline across all three services and verifies the 2,400-card CSV processes end-to-end. It also runs all quality gates.
  - Files: `vendorpanel/src/lib/client/customer-backend.ts` (verify POST support), `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/` (any integration fixes), `.gsd/milestones/M002/slices/S01/S01-UAT.md` (integration test procedure)
  - Do: Start all three services locally. Verify backend can reach customer-backend fuzzy match endpoint with SERVICE_API_KEY. Run the GIN trigram index migration on local sidedecked-db. Upload the 2,400-row test fixture CSV through the vendor panel UI. Verify format detection, match execution, tier classification, review UI population, confirm step creating real products. Fix any integration issues: CORS, auth headers, URL configuration, data shape mismatches. Document the integration test procedure in S01-UAT.md. Run all quality gates: `cd customer-backend && npm run lint && npm run typecheck && npm run build && npm test`, `cd backend && npm run lint && npm run typecheck && npm run build`, `cd vendorpanel && npm run lint && npm run typecheck && npm run build`.
  - Verify: All quality gates pass across all three repos. 2,400-row CSV completes the full pipeline with products created in mercur-db.
  - Done when: Full pipeline works end-to-end with real services, all quality gates pass with no regressions, integration test procedure documented in S01-UAT.md

## Files Likely Touched

**customer-backend/**
- `package.json` — add papaparse dependency
- `src/services/CsvParserService.ts` — new: CSV parsing + format detection
- `src/services/FuzzyMatchService.ts` — new: batch fuzzy match logic
- `src/routes/catalog.ts` — add batch fuzzy match route
- `src/migrations/1777300000000-AddCardNameTrigramIndex.ts` — new: GIN trigram index
- `src/tests/services/csv-parser.test.ts` — new: parser unit tests
- `src/tests/services/fuzzy-match.test.ts` — new: match service unit tests
- `src/tests/routes/fuzzy-match-batch.test.ts` — new: route tests
- `src/tests/fixtures/tcgplayer-2400.csv` — new: large test fixture
- `src/tests/fixtures/tcgplayer-20.csv` — new: small test fixture
- `src/tests/fixtures/crystal-commerce-20.csv` — new: small test fixture
- `src/tests/fixtures/manual-20.csv` — new: small test fixture

**backend/**
- `apps/backend/package.json` — add papaparse dependency
- `apps/backend/src/api/vendor/consumer-seller/bulk-import/upload/route.ts` — new
- `apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/match/route.ts` — new
- `apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/results/route.ts` — new
- `apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/status/route.ts` — new
- `apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/confirm/route.ts` — new
- `apps/backend/src/api/vendor/consumer-seller/bulk-import/validators.ts` — new
- `apps/backend/src/api/vendor/consumer-seller/bulk-import/middlewares.ts` — new
- `apps/backend/src/api/vendor/consumer-seller/bulk-import/import-state.ts` — new
- `apps/backend/src/api/vendor/middlewares.ts` — add bulk import middleware registration

**vendorpanel/**
- `package.json` — add papaparse dependency
- `src/routes/products/product-bulk-import/product-bulk-import.tsx` — new: wizard shell
- `src/routes/products/product-bulk-import/constants.ts` — new: schemas + defaults
- `src/routes/products/product-bulk-import/components/upload-step/upload-step.tsx` — new
- `src/routes/products/product-bulk-import/components/review-step/review-step.tsx` — new
- `src/routes/products/product-bulk-import/components/review-step/auto-match-tab.tsx` — new
- `src/routes/products/product-bulk-import/components/review-step/fuzzy-match-tab.tsx` — new
- `src/routes/products/product-bulk-import/components/review-step/unmatched-tab.tsx` — new
- `src/routes/products/product-bulk-import/components/review-step/match-card-row.tsx` — new
- `src/routes/products/product-bulk-import/components/confirm-step/confirm-step.tsx` — new
- `src/routes/products/product-bulk-import/components/confirm-step/results-summary.tsx` — new
- `src/hooks/api/bulk-import.tsx` — new: TanStack Query hooks
- `src/lib/client/customer-backend.ts` — extend with POST support
- `src/lib/client/client.ts` — add bulk import upload function
