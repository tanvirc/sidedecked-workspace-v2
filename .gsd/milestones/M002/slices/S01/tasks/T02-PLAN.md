---
estimated_steps: 14
estimated_files: 7
---

# T02: GIN Trigram Index Migration + Batch Fuzzy Match Endpoint in customer-backend

**Slice:** S01 — CSV Inventory Import & Catalog Matching
**Milestone:** M002

## Why

The batch fuzzy match endpoint is the riskiest piece in the entire slice — it introduces a new SQL pattern (`unnest()` + `LATERAL JOIN` + `word_similarity()`) against a new GIN trigram index that doesn't exist yet. Building and testing this early (task 2) means we fail fast if pg_trgm performance or accuracy doesn't meet expectations. Every downstream task depends on this endpoint's contract.

## What

- TypeORM migration creating GIN trigram index on `cards.normalizedName`
- `FuzzyMatchService` with batch matching logic and tier classification
- `POST /api/catalog/cards/fuzzy-match/batch` route protected by `authenticateServiceKey`
- Unit tests for service logic and route

## Steps

1. Read the existing migration pattern at `customer-backend/src/migrations/1776700000000-AddCardTranslationsAndCollectibility.ts` to match the TypeORM migration style
2. Create migration `customer-backend/src/migrations/1777300000000-AddCardNameTrigramIndex.ts`:
   ```sql
   -- up
   CREATE INDEX IF NOT EXISTS "idx_cards_normalized_name_trgm"
   ON "cards" USING gin("normalizedName" gin_trgm_ops);
   
   -- down
   DROP INDEX IF EXISTS "idx_cards_normalized_name_trgm";
   ```
3. Define the batch fuzzy match types (in `customer-backend/src/types/fuzzy-match.ts`):
   ```typescript
   interface FuzzyMatchRequest {
     names: string[]  // max 500
   }
   
   interface FuzzyMatchCandidate {
     cardId: string
     cardName: string
     normalizedName: string
     gameCode: string
     similarity: number
     prints: Array<{
       printId: string
       setCode: string
       setName: string
       collectorNumber: string
       rarity: string
       imageNormal: string | null
       catalogSkus: Array<{
         sku: string
         conditionCode: string
         languageCode: string
         finishCode: string
         marketPrice: number | null
       }>
     }>
   }
   
   interface FuzzyMatchResult {
     inputName: string
     matches: FuzzyMatchCandidate[]
     bestMatch: FuzzyMatchCandidate | null
     tier: 'auto' | 'fuzzy' | 'unmatched'
   }
   
   interface BatchFuzzyMatchResponse {
     results: FuzzyMatchResult[]
     meta: { total: number, auto: number, fuzzy: number, unmatched: number }
   }
   ```
4. Build `FuzzyMatchService` at `customer-backend/src/services/FuzzyMatchService.ts`:
   - Constructor takes `DataSource` (TypeORM) dependency
   - `batchMatch(names: string[], options?: { threshold?: number, limit?: number }): Promise<FuzzyMatchResult[]>`
   - Default threshold: 0.5 (from `config`), default candidate limit: 5
   - Core SQL query using raw query runner:
     ```sql
     SELECT input.name AS input_name,
            c.id AS card_id, c.name AS card_name, c."normalizedName",
            g.code AS game_code,
            word_similarity(lower(input.name), c."normalizedName") AS score
     FROM unnest($1::text[]) AS input(name)
     CROSS JOIN LATERAL (
       SELECT c.*, g.code
       FROM cards c
       JOIN games g ON g.id = c."gameId"
       WHERE c."normalizedName" % lower(input.name)
       ORDER BY word_similarity(lower(input.name), c."normalizedName") DESC
       LIMIT $2
     ) c
     ```
   - After getting base card matches, fetch related prints + CatalogSKUs in a second query using the matched card IDs (avoid N+1)
   - Tier classification: score ≥ 0.8 → `auto`, score 0.5–0.79 → `fuzzy`, no matches or all below 0.5 → `unmatched`
   - For `auto` tier: `bestMatch` = highest scoring candidate
   - For `fuzzy` tier: `bestMatch` = highest scoring candidate (pre-selected in UI)
   - For `unmatched` tier: `bestMatch` = null
5. Handle edge cases in service:
   - Empty names array → return empty results
   - Names that match nothing (no `%` operator hits) → tier `unmatched`
   - Exact match (score = 1.0) → tier `auto`
   - Input name normalization: lowercase + trim whitespace before querying
6. Add route to `customer-backend/src/routes/catalog.ts`:
   - `POST /api/catalog/cards/fuzzy-match/batch`
   - Protected by `authenticateServiceKey` middleware (existing pattern from search routes)
   - Request body validation: `names` must be array of strings, max length 500
   - Response: `BatchFuzzyMatchResponse`
7. Alternatively, create a new route file `customer-backend/src/routes/fuzzy-match.ts` and register it in `routes/index.ts` — follow whichever pattern is cleaner given the existing catalog.ts size
8. Write unit tests at `customer-backend/src/tests/services/fuzzy-match.test.ts`:
   - Mock the DataSource query runner
   - Test tier classification with various similarity scores
   - Test empty input array returns empty results
   - Test all-unmatched scenario (no DB hits)
   - Test exact match scenario (score 1.0 → auto tier)
   - Test mixed results (some auto, some fuzzy, some unmatched)
   - Test candidate limit enforcement (max 5 per name)
   - Test input name normalization (uppercase → lowercase, whitespace trimmed)
9. Write route tests at `customer-backend/src/tests/routes/fuzzy-match-batch.test.ts`:
   - Test SERVICE_API_KEY required (401 without, 200 with)
   - Test request validation (missing `names`, `names` not array, `names` > 500 items)
   - Test successful batch response structure
   - Mock the FuzzyMatchService for route-level tests
10. Set the `word_similarity_threshold` in `customer-backend/src/config/env.ts` as a configurable value (default 0.5)
11. Run tests: `cd customer-backend && npm test -- --testPathPattern="fuzzy-match"`
12. Run typecheck and build: `cd customer-backend && npm run typecheck && npm run build`

## Files

- `customer-backend/src/migrations/1777300000000-AddCardNameTrigramIndex.ts` — new: GIN index migration
- `customer-backend/src/services/FuzzyMatchService.ts` — new: batch matching service
- `customer-backend/src/types/fuzzy-match.ts` — new: request/response types
- `customer-backend/src/routes/catalog.ts` (or `src/routes/fuzzy-match.ts`) — add batch endpoint
- `customer-backend/src/routes/index.ts` — register new route if separate file
- `customer-backend/src/config/env.ts` — add FUZZY_MATCH_THRESHOLD config
- `customer-backend/src/tests/services/fuzzy-match.test.ts` — new: service unit tests
- `customer-backend/src/tests/routes/fuzzy-match-batch.test.ts` — new: route tests

## Verification

- `cd customer-backend && npm test -- --testPathPattern="fuzzy-match"` — all tests pass
- `cd customer-backend && npm run typecheck` — no type errors
- `cd customer-backend && npm run build` — builds cleanly
- Migration applies cleanly on a local sidedecked-db: `cd customer-backend && npm run migration:run`

## Done When

- GIN trigram index migration exists and applies without error
- `FuzzyMatchService.batchMatch()` returns correctly structured results with tier classification
- Batch endpoint accepts up to 500 names and returns enriched match results with card/print/CatalogSKU data
- `authenticateServiceKey` middleware protects the endpoint
- Thresholds are configurable (not hardcoded)
- All unit and route tests pass
- `npm run typecheck && npm run build` succeeds
