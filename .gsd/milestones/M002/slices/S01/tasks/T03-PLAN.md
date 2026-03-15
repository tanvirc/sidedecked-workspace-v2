---
estimated_steps: 13
estimated_files: 12
---

# T03: Backend Bulk Import Routes — Upload, Match, Results, Status

**Slice:** S01 — CSV Inventory Import & Catalog Matching
**Milestone:** M002

## Why

The backend is the orchestration layer — it receives CSV uploads from the vendor panel, delegates matching to customer-backend, and stores import state in-memory. The vendor panel UI (T05–T07) cannot be built without these routes existing. This task builds all four read/query routes; the confirm route (which creates listings) is separated into T04 because it has distinct complexity around `createProductsWorkflow`.

## What

- In-memory import state manager with TTL and single-import-per-seller enforcement
- `POST .../upload` — multipart CSV upload with server-side parsing
- `POST .../match` — chunk names and call customer-backend batch fuzzy match
- `GET .../results` — return classified match results with pagination
- `GET .../status` — return current import phase
- MedusaJS v2 route conventions: validators, middleware, route config

## Steps

1. Read the existing vendor route patterns:
   - `backend/apps/backend/src/api/vendor/products/middlewares.ts` for multer + validator patterns
   - `backend/apps/backend/src/api/vendor/middlewares.ts` for middleware registration
   - `backend/apps/backend/src/api/store/consumer-seller/listings/route.ts` for seller resolution pattern
2. Install `papaparse` + `@types/papaparse` in `backend/apps/backend/package.json`
3. Create the import state manager at `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/import-state.ts`:
   - `ImportState` type: `{ importId, sellerId, phase, format, parsedRows, matchResults, confirmResults, createdAt, expiresAt }`
   - Phase enum: `uploaded | matching | matched | confirming | completed | failed`
   - `ImportStateManager` class with `Map<string, ImportState>`:
     - `create(sellerId): ImportState` — generate UUID importId, enforce single-active-per-seller (discard old if exists), set 30-minute TTL
     - `get(importId): ImportState | undefined` — check TTL, return undefined if expired
     - `getBySeller(sellerId): ImportState | undefined` — look up active import for seller
     - `update(importId, partial): void` — merge updates
     - `cleanup(): void` — remove expired entries (call periodically or on access)
   - Singleton instance exported for use across routes
4. Create Zod validators at `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/validators.ts`:
   - `BulkImportUploadSchema` — file validated at middleware level (multer)
   - `BulkImportMatchSchema` — empty body (importId from URL params)
   - `BulkImportResultsQuerySchema` — `{ page?: number, limit?: number, tier?: 'auto' | 'fuzzy' | 'unmatched' }`
5. Create middleware at `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/middlewares.ts`:
   - Upload route: `multer({ storage: memoryStorage() }).single('file')` for CSV upload
   - All routes: inherit `/vendor/*` auth (seller bearer/session)
6. Register the bulk import middleware in `backend/apps/backend/src/api/vendor/middlewares.ts`:
   - Import and spread `vendorBulkImportMiddlewares` into the `vendorMiddlewares` array
7. Build `POST .../upload/route.ts`:
   - Route config: `export const POST` with MedusaJS pattern
   - Extract file from `req.file` (multer)
   - Parse CSV content with papaparse server-side (using `CsvParserService`-compatible logic — or inline since it's simple parsing)
   - Validate row count ≤ 5,000
   - Resolve seller from auth context (pattern from existing vendor routes)
   - Create import state entry via `ImportStateManager.create(sellerId)`
   - Store parsed rows in import state
   - Return `{ importId, rowCount, format, message }`
8. Build `POST .../[importId]/match/route.ts`:
   - Verify import exists and belongs to authenticated seller
   - Verify phase is `uploaded` (not already matching/matched)
   - Update phase to `matching`
   - Extract card names from parsed rows
   - Chunk names into batches of 500
   - For each chunk: `POST` to customer-backend `http://<CUSTOMER_BACKEND_URL>/api/catalog/cards/fuzzy-match/batch` with `X-Service-Key` header (using `CUSTOMER_BACKEND_URL` and `SERVICE_API_KEY` from env/config)
   - Use `fetch` or `axios` for the HTTP call — match existing backend patterns
   - Aggregate all batch results
   - Classify and store in import state
   - Update phase to `matched`
   - Return `{ importId, status: 'matched', counts: { total, auto, fuzzy, unmatched } }`
9. Build `GET .../[importId]/results/route.ts`:
   - Verify import exists and belongs to seller
   - Accept query params: `page` (default 1), `limit` (default 25), `tier` (optional filter)
   - Return paginated results from import state, grouped by tier
   - Include counts per tier in response metadata
   - Return `{ results, counts: { auto, fuzzy, unmatched, total }, pagination: { page, limit, totalPages } }`
10. Build `GET .../[importId]/status/route.ts`:
    - Verify import exists and belongs to seller
    - Return `{ importId, phase, format, rowCount, counts, createdAt }`
11. Ensure `CUSTOMER_BACKEND_URL` and `SERVICE_API_KEY` are accessible in the backend's environment config. Check existing env patterns in `backend/apps/backend/.env.template` or MedusaJS config.
12. Run typecheck and build: `cd backend && npm run typecheck && npm run build`
13. Smoke test: start backend, make a curl request to upload route with a test CSV

## Files

- `backend/apps/backend/package.json` — add papaparse + @types/papaparse
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/import-state.ts` — new: state manager
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/validators.ts` — new: Zod schemas
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/middlewares.ts` — new: multer + auth
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/upload/route.ts` — new: upload endpoint
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/match/route.ts` — new: match endpoint
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/results/route.ts` — new: results endpoint
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/status/route.ts` — new: status endpoint
- `backend/apps/backend/src/api/vendor/middlewares.ts` — add bulk import middleware registration

## Verification

- `cd backend && npm run typecheck` — no type errors
- `cd backend && npm run build` — builds cleanly
- Routes are registered: start backend and verify 404 → proper responses for bulk import paths

## Done When

- All four routes respond correctly: upload returns importId, match triggers customer-backend calls and classifies, results returns paginated tier data, status returns phase
- In-memory state manager enforces single-active-per-seller and 30-minute TTL
- Middleware registered for auth and multer file upload
- 5,000-row limit enforced on upload
- `npm run typecheck && npm run build` succeeds with no errors
