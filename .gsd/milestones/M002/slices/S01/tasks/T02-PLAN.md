---
estimated_steps: 5
estimated_files: 4
---

# T02: Fuzzy matching API endpoint with pg_trgm

**Slice:** S01 — CSV Inventory Import & Catalog Matching
**Milestone:** M002

## Description

Build the `GET /api/catalog/cards/fuzzy-match` endpoint in customer-backend that uses PostgreSQL's `word_similarity()` function (D040) to match incoming card names against the catalog. Creates a GIN trigram index migration on `cards.normalizedName` for performance. Returns ranked match candidates with similarity scores classified into confidence tiers (auto ≥0.8, fuzzy 0.5–0.79, unmatched <0.5).

## Steps

1. Create migration `1778000000000-AddNormalizedNameTrigramIndex.ts` that adds a GIN trigram index on `cards."normalizedName"` using `gin_trgm_ops`. The pg_trgm extension already exists (created in `1776700000000-AddCardTranslationsAndCollectibility`), so do NOT re-create it. Just add the index: `CREATE INDEX "idx_cards_normalized_name_trgm" ON "cards" USING gin("normalizedName" gin_trgm_ops)`.
2. Build `catalog-fuzzy-match.ts` route. Accept query params: `name` (required — the card name to match), `setName` (optional — boost matches from this set), `gameCode` (optional — filter to game), `limit` (default 5, max 20). Normalize the input name (lowercase, trim). Query: `SELECT c.id, c.name, c."normalizedName", p.id as "printId", p."collectorNumber", cs.name as "setName", cs.code as "setCode", word_similarity(c."normalizedName", :query) as similarity FROM cards c LEFT JOIN prints p ON p."cardId" = c.id LEFT JOIN card_sets cs ON p."setId" = cs.id WHERE word_similarity(c."normalizedName", :query) >= :threshold AND c."deletedAt" IS NULL ORDER BY similarity DESC LIMIT :limit`. Threshold from `process.env.FUZZY_MATCH_THRESHOLD || '0.5'`.
3. Add set-name boosting: when `setName` is provided, add `word_similarity(cs.name, :setName)` as `setMatchScore` and adjust ordering to `ORDER BY (similarity * 0.7 + setMatchScore * 0.3) DESC` so cards from matching sets rank higher. When no setName, order purely by similarity.
4. Classify results into confidence tiers: `auto` (similarity ≥ 0.8), `fuzzy` (0.5 ≤ similarity < 0.8), `none` (below threshold, won't appear since filtered by WHERE clause). Return response: `{ matches: [{ cardId, cardName, normalizedName, printId, collectorNumber, setName, setCode, similarity, confidence }], query: name, threshold }`.
5. Register route in `customer-backend/src/index.ts` (add `app.use('/api/catalog/cards', fuzzyMatchRouter)` or similar, following existing catalog route registration pattern). Write unit tests in `catalog-fuzzy-match.test.ts` mocking `AppDataSource.query()` — test: valid match response shape, confidence tier classification, set-name boosting, empty results, missing `name` param returns 400, gameCode filtering.

## Must-Haves

- [ ] Migration creates GIN trigram index on `cards.normalizedName`
- [ ] Endpoint accepts `name`, `setName`, `gameCode`, `limit` query params
- [ ] Uses `word_similarity()` per D040 decision
- [ ] Threshold configurable via env var (default 0.5)
- [ ] Results classified into `auto` (≥0.8) and `fuzzy` (0.5–0.79) confidence tiers
- [ ] Set-name boosting adjusts ranking when setName provided
- [ ] Route registered in customer-backend app
- [ ] Unit tests pass

## Verification

- `cd customer-backend && npm test -- --testPathPattern="catalog-fuzzy-match"` — all tests pass
- `cd customer-backend && npx tsc --noEmit` — compiles cleanly

## Observability Impact

- Signals added/changed: Endpoint logs query, threshold, and match count at debug level
- How a future agent inspects this: `curl localhost:3001/api/catalog/cards/fuzzy-match?name=Lightning+Bolt` returns match candidates with similarity scores
- Failure state exposed: 400 response with error message when `name` param missing; 500 with error code on database query failure

## Inputs

- D040 decision: `word_similarity()` with 0.5 initial threshold
- Existing `cards.normalizedName` column (Card entity, line 47)
- pg_trgm extension already enabled (migration `1776700000000`)
- Existing catalog route pattern in `customer-backend/src/routes/catalog.ts`
- Existing test pattern in `customer-backend/src/tests/routes/catalog-sku.test.ts` (mocked AppDataSource)

## Expected Output

- `customer-backend/src/migrations/1778000000000-AddNormalizedNameTrigramIndex.ts` — GIN index migration
- `customer-backend/src/routes/catalog-fuzzy-match.ts` — fuzzy match endpoint
- `customer-backend/src/tests/routes/catalog-fuzzy-match.test.ts` — ≥8 test cases
- `customer-backend/src/index.ts` — route registration added
