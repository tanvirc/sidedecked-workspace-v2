---
estimated_steps: 5
estimated_files: 5
---

# T03: Backend bulk-import API routes

**Slice:** S01 — CSV Inventory Import & Catalog Matching
**Milestone:** M002

## Description

Build the orchestration layer in the Medusa backend that manages the CSV bulk import lifecycle: upload (parse CSV) → match (call customer-backend fuzzy-match API) → results (return match state) → confirm (create listings). Uses an in-memory store keyed by importId. Follows existing Medusa file-based route patterns in `backend/apps/backend/src/api/vendor/`.

## Steps

1. Create `bulk-import/store.ts` — an in-memory import state store. Define types: `ImportState { importId, sellerId, format, parsedCards[], matchResults: { auto[], fuzzy[], unmatched[] }, status: 'uploaded' | 'matching' | 'matched' | 'confirming' | 'completed' | 'failed', createdAt, error? }`. Export `importStore: Map<string, ImportState>` with helper functions `createImport()`, `getImport()`, `updateImport()`. Generate importId with `crypto.randomUUID()`.
2. Create `bulk-import/route.ts` with `POST` handler. Accept JSON body `{ csvText: string }`. Inline the CSV parsing logic (replicating CSVParserService format detection and column mapping — the backend is Medusa/Node, not Express like customer-backend, so we need the logic here too; alternatively import a shared parsing function). Detect format, parse rows, validate, store in importStore. Return `{ importId, format, rowCount, validRows, errors[], preview: first10Rows[] }`. Authenticated via existing vendor middleware.
3. Create `[importId]/match/route.ts` with `POST` handler. Retrieve import state. For each parsed card, call customer-backend `GET /api/catalog/cards/fuzzy-match?name={cardName}&setName={setName}&gameCode={gameCode}` using `fetch()`. Classify results into auto/fuzzy/unmatched buckets based on returned confidence. Use `Promise.allSettled` with concurrency limit (batch of 10) to avoid overwhelming customer-backend. Update import state with match results. Return `{ importId, status: 'matched', counts: { auto, fuzzy, unmatched } }`.
4. Create `[importId]/results/route.ts` with `GET` handler. Return the full match state: `{ importId, status, counts, auto: [{ parsedCard, match }], fuzzy: [{ parsedCard, candidates[] }], unmatched: [{ parsedCard }] }`. Create `[importId]/confirm/route.ts` with `POST` handler. Accept `{ confirmed: [{ parsedIndex, cardId, printId, catalogSku, condition, price, quantity }] }`. For each confirmed card, call the existing `POST /vendor/consumer-seller/products` endpoint (internal API call or direct workflow invocation) with `{ catalog_sku, condition, price, quantity }`. Track success/failure per card. Return `{ importId, status: 'completed', created: count, failed: [{ catalogSku, error }] }`.
5. Ensure all routes check `req.auth_context?.actor_id` for seller authentication. Validate importId exists and belongs to the authenticated seller. Handle edge cases: import not found (404), import already in terminal state (409), customer-backend unreachable (503 with retry hint).

## Must-Haves

- [ ] In-memory import store with typed state management
- [ ] Upload route parses CSV, detects format, stores state, returns importId
- [ ] Match route calls customer-backend fuzzy-match API with concurrency limiting
- [ ] Results route returns full match state with tier counts
- [ ] Confirm route creates listings via consumer-seller products API
- [ ] All routes require seller authentication
- [ ] Error handling for missing imports, terminal states, and API failures

## Verification

- Routes create correct response shapes for each lifecycle step
- Confirm step invokes consumer-seller products API for each confirmed card
- `cd backend && npx tsc --noEmit` — compiles cleanly (route files are type-checked by Medusa's build)

## Observability Impact

- Signals added/changed: Each lifecycle step logs `importId`, seller ID, and transition (uploaded→matching→matched→completed). Match step logs per-batch timing and customer-backend response status.
- How a future agent inspects this: `GET /vendor/consumer-seller/bulk-import/:importId/results` returns full state including counts and any errors
- Failure state exposed: Import state includes `status: 'failed'` with `error` field; confirm results include per-card failure list with catalog_sku and error message

## Inputs

- T01's CSVParserService types and parsing logic (replicated inline for Medusa context)
- T02's fuzzy-match endpoint at `GET /api/catalog/cards/fuzzy-match`
- Existing `POST /vendor/consumer-seller/products` route pattern (see `backend/apps/backend/src/api/vendor/consumer-seller/products/route.ts`)
- Existing vendor route authentication pattern (see `backend/apps/backend/src/api/vendor/consumer-seller/route.ts`)

## Expected Output

- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/store.ts` — import state store
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/route.ts` — upload endpoint
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/match/route.ts` — match endpoint
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/results/route.ts` — results endpoint
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/confirm/route.ts` — confirm endpoint
