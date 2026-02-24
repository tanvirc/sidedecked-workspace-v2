# TCG Catalog ETL Pipeline Seeding — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Seed the SideDecked catalog with real card data for all 4 TCG games via idempotent, failure-safe ETL pipelines backed by verified test coverage.
**Story:** `2-1-tcg-catalog-etl-pipeline-seeding` — no story file yet (backlog state; story defined in `_bmad-output/planning-artifacts/epics.md`, Epic 2, Story 2.1)
**Domain:** Customer Experience — `customer-backend/` only (`sidedecked-db`)
**Repos:** `customer-backend/`
**Deployment:** `needs_deploy = false` — backend-only; no storefront/vendorpanel changes; new admin endpoints are additive (no consumers yet).
**UX Wireframe:** N/A — no UI scope for this story.

---

## Requirements Brief (from Phase 2)

**6 Acceptance Criteria:**

| AC | Summary | Implementation Target |
|---|---|---|
| AC1 | MTG ETL via Scryfall: cards, sets, prints with game-specific JSONB | `ScryfallTransformer` + tested |
| AC2 | Pokemon ETL via Pokemon TCG API with game-specific JSONB | `PokemonTransformer` + tested |
| AC3 | Yu-Gi-Oh! ETL via YGOPRODeck API with game-specific JSONB | `YugiohTransformer` + tested |
| AC4 | One Piece ETL via community API with game-specific JSONB | `OnePieceTransformer` + tested |
| AC5 | CatalogSKU format: `{GAME}-{SET}-{NUMBER}-{LANG}-{CONDITION}-{FINISH}` | `formatSKU()` helper tested |
| AC6 | ETL failure: atomic batch updates with rollback, no data corruption | `ETLService` batch + rollback tested |

**Business Rules:**
- BR1: ETL is idempotent — re-runs upsert (no duplicates) via `ON CONFLICT DO UPDATE`
- BR2: External API calls are mocked in all tests — no real network calls in test suite
- BR3: ETL atomicity: `queryRunner.startTransaction()` / `commitTransaction()` / `rollbackTransaction()` per batch
- BR4: Scryfall rate limit: 10 req/s; Pokemon TCG API: requires API key (`POKEMON_TCG_API_KEY` env var); YGOPRODeck: free, no auth; OP community API: free, no auth
- BR5: Image URLs stored as references (not downloaded); no MinIO usage in catalog ETL
- BR6: CatalogSKU includes condition — one SKU row per card × set × language × condition × finish combination

**Edge Cases requiring test coverage:**
- EC1: ETL mid-batch failure → rollback leaves DB in last-good-batch state
- EC2: Re-run on already-populated DB → upsert semantics, row counts match (no duplicates)
- EC3: Invalid/malformed API response data → transformer returns null/skips without crashing
- EC4: `formatSKU()` with special characters in set codes → normalized correctly

**UX:** No UI scope. Admin-triggerable via new API endpoint only.

---

## Technical Design (from Phase 3)

**Domain routing:** Entirely `customer-backend/` → `sidedecked-db`. No mercur-db involvement.

**Key finding:** The ETL infrastructure is substantially built. All four transformers, `ETLService`, all entities, migrations, and the `master-etl.ts` CLI script already exist. This story's implementation is:
1. Write comprehensive unit tests (currently zero test coverage on ETL components)
2. Add admin API endpoints to trigger ETL and check job status

**Existing infrastructure (do NOT recreate):**
- `packages/tcg-catalog/src/services/ETLService.ts` — job lifecycle, circuit breakers, batch upserts
- `packages/tcg-catalog/src/transformers/` — all 4 transformers (Scryfall, Pokemon, Yugioh, OnePiece)
- `packages/tcg-catalog/src/utils/Helpers.ts` — `formatSKU()`, `generateOracleHash()`, `generatePrintHash()`
- `src/entities/` — `Card`, `Print`, `CardSet`, `CatalogSKU`, `ETLJob`, `Game` entities
- `src/scripts/master-etl.ts` — working CLI ETL runner

**New API contracts:**
```
POST /api/admin/etl/trigger
Auth: Bearer JWT (admin role required via existing adminAuthMiddleware)
Body: { games: string[], jobType?: 'full_sync' | 'incremental_sync', limit?: number }
Response 202: { jobIds: string[], message: string }
Response 400: { error: string } (invalid game codes)
Response 403: (non-admin)

GET /api/admin/etl/jobs
Auth: Bearer JWT (admin role required)
Query: ?game=MTG&limit=10&status=completed
Response 200: { jobs: ETLJob[], total: number }
```

**New files:**
- `src/routes/admin-etl.ts` — new route file for admin ETL endpoints
- `src/tests/routes/admin-etl.test.ts` — route integration tests
- `packages/tcg-catalog/src/__tests__/transformers/ScryfallTransformer.test.ts`
- `packages/tcg-catalog/src/__tests__/transformers/PokemonTransformer.test.ts`
- `packages/tcg-catalog/src/__tests__/transformers/YugiohTransformer.test.ts`
- `packages/tcg-catalog/src/__tests__/transformers/OnePieceTransformer.test.ts`
- `packages/tcg-catalog/src/__tests__/utils/Helpers.test.ts`
- `packages/tcg-catalog/src/__tests__/services/ETLService.test.ts`

**Modified files:**
- `src/routes/index.ts` — register `/api/admin/etl` route
- `src/tests/routes/catalog-sku.test.ts` — extend if SKU endpoint tests already cover some ACs

**No new migrations required.** Schema is complete.

**Integration touchpoints:** Scryfall bulk endpoint, Pokemon TCG API, YGOPRODeck, OP community API — all mocked in tests via Jest `jest.mock()` / `nock` / MSW.

---

## Task 1: Unit tests for `formatSKU()` and hash helpers (AC5)

**Why first:** The SKU format is the foundation of the catalog — verify it before testing anything that generates SKUs.

**Files:**
- `packages/tcg-catalog/src/__tests__/utils/Helpers.test.ts` — **create new**
- `packages/tcg-catalog/src/utils/Helpers.ts` — read-only reference

**TDD Steps:**
1. Read `Helpers.ts` completely to understand `formatSKU()`, `generateOracleHash()`, `generatePrintHash()`, `chunkArray()`
2. Write failing tests:
   - `formatSKU('MTG', 'NEO', '001', 'EN', 'NM', 'FOIL')` → `'MTG-NEO-001-EN-NM-FOIL'`
   - `formatSKU('POKEMON', 'CRZ', '025', 'JP', 'LP', 'NORMAL')` → `'POKEMON-CRZ-025-JP-LP-NORMAL'`
   - `formatSKU('YUGIOH', 'ROTD', '045', 'EN', 'NM', '1ST')` → `'YUGIOH-ROTD-045-EN-NM-1ST'`
   - `formatSKU('OPTCG', 'OP01', '001', 'EN', 'NM', 'NORMAL')` → `'OPTCG-OP01-001-EN-NM-NORMAL'`
   - Special character normalization in set codes
   - `generateOracleHash()` produces stable, deterministic output for same inputs
   - `generatePrintHash()` produces different values for different print combos
   - `chunkArray([1,2,3,4,5], 2)` → `[[1,2],[3,4],[5]]`
3. Run tests — confirm they FAIL (or pass if impl is already correct)
4. Fix any SKU formatting bugs found; if tests pass, proceed
5. Run `npm run lint && npm run typecheck` in `customer-backend/`
6. Commit: `test(etl): add unit tests for SKU generation and catalog helpers`

---

## Task 2: Unit tests for `ScryfallTransformer` (AC1)

**Files:**
- `packages/tcg-catalog/src/__tests__/transformers/ScryfallTransformer.test.ts` — **create new**
- `packages/tcg-catalog/src/transformers/ScryfallTransformer.ts` — read-only reference

**TDD Steps:**
1. Read `ScryfallTransformer.ts` completely — understand `transformCard()`, `transformPrint()`, `generateSKUs()` methods and their expected output shapes
2. Create fixture: small representative Scryfall API response objects (normal card, DFC, token, land)
3. Write failing tests covering:
   - `transformCard(scryfallCard)` → correct `Card` fields: `oracleId`, `name`, `normalizedName`, `primaryType`, `subtypes`, `oracleText`, `manaCost`, `manaValue`, `colors`, `colorIdentity`, `powerValue`, `defenseValue`, `gameData.layout`
   - `transformPrint(scryfallCard)` → correct `Print` fields: `number`, `rarity`, `artist`, `language`, `imageNormal`, `scryfallId`, format legality flags
   - `generateSKUs(scryfallCard)` → produces array of `CatalogSKU` objects with correct `sku` format per AC5
   - DFC (double-faced card) handling — `card_faces` array processed correctly
   - Null/undefined fields handled gracefully (no crash on missing optional fields)
4. Run tests — confirm FAIL or surface real bugs
5. Fix any transformer bugs found
6. Run `npm run lint && npm run typecheck`
7. Commit: `test(etl): add unit tests for ScryfallTransformer`

---

## Task 3: Unit tests for `PokemonTransformer` (AC2)

**Files:**
- `packages/tcg-catalog/src/__tests__/transformers/PokemonTransformer.test.ts` — **create new**
- `packages/tcg-catalog/src/transformers/PokemonTransformer.ts` — read-only reference

**TDD Steps:**
1. Read `PokemonTransformer.ts` completely
2. Create fixture: representative Pokemon TCG API card objects (basic Pokemon, evolved, Trainer, Energy)
3. Write failing tests covering:
   - `transformCard()` → `hp`, `retreatCost`, `energyTypes`, `evolvesFrom`, `gameData.attacks`, `gameData.weaknesses`, `gameData.resistances`
   - `transformPrint()` → `pokemon_tcg_id`, `rarity`, `imageNormal` from API image URLs
   - `generateSKUs()` → correct SKU format for Pokemon cards
   - Energy card and Trainer card edge cases (different field shapes)
4. Run tests → fix any bugs → re-run
5. `npm run lint && npm run typecheck`
6. Commit: `test(etl): add unit tests for PokemonTransformer`

---

## Task 4: Unit tests for `YugiohTransformer` (AC3)

**Files:**
- `packages/tcg-catalog/src/__tests__/transformers/YugiohTransformer.test.ts` — **create new**
- `packages/tcg-catalog/src/transformers/YugiohTransformer.ts` — read-only reference

**TDD Steps:**
1. Read `YugiohTransformer.ts` completely
2. Create fixture: representative YGOPRODeck API card objects (Effect Monster, Spell, Trap, Fusion/Extra Deck)
3. Write failing tests covering:
   - `transformCard()` → `attribute`, `level`, `attackValue`, `defenseValue`, `gameData.monster_type`, `gameData.card_type`, `gameData.archetype`
   - Extra Deck card types (Fusion, Synchro, XYZ, Link) — `level` vs `rank` vs link rating
   - `generateSKUs()` → correct format including `1ST` edition finish handling
   - Spell/Trap cards (no ATK/DEF) handled without crashing
4. Run tests → fix bugs → re-run
5. `npm run lint && npm run typecheck`
6. Commit: `test(etl): add unit tests for YugiohTransformer`

---

## Task 5: Unit tests for `OnePieceTransformer` (AC4)

**Files:**
- `packages/tcg-catalog/src/__tests__/transformers/OnePieceTransformer.test.ts` — **create new**
- `packages/tcg-catalog/src/transformers/OnePieceTransformer.ts` — read-only reference

**TDD Steps:**
1. Read `OnePieceTransformer.ts` completely
2. Create fixture: representative OP card objects (Leader, Character, Event, Stage)
3. Write failing tests covering:
   - `transformCard()` → `cost`, `power`, `counter`, `gameData.color`, `gameData.attribute`, `gameData.effect`
   - Leader card type (has `life` field, different structure)
   - `generateSKUs()` → correct format for OPTCG cards
4. Run tests → fix bugs → re-run
5. `npm run lint && npm run typecheck`
6. Commit: `test(etl): add unit tests for OnePieceTransformer`

---

## Task 6: Unit tests for `ETLService` — batch atomicity and failure recovery (AC6)

**Files:**
- `packages/tcg-catalog/src/__tests__/services/ETLService.test.ts` — **create new**
- `packages/tcg-catalog/src/services/ETLService.ts` — read-only reference

**TDD Steps:**
1. Read `ETLService.ts` completely — understand `startETLJob()`, `createETLJob()`, `processBatch()`, circuit breaker state machine
2. Mock `AppDataSource` using `jest.mock()` — mock `createQueryRunner()`, `getRepository()`
3. Write failing tests covering:
   - Job created with `ETLJobStatus.RUNNING` at start
   - Successful batch: `queryRunner.commitTransaction()` called once per batch
   - Failed batch: `queryRunner.rollbackTransaction()` called; job status set to `ETLJobStatus.FAILED`
   - Circuit breaker: after threshold failures, `isCircuitBreakerOpen()` returns true, next call throws immediately
   - Circuit breaker reset: after timeout, circuit resets to CLOSED
   - `ETLResult` shape: `{ success, totalProcessed, cardsCreated, cardsUpdated, printsCreated, skusGenerated, errors }`
   - Idempotency: duplicate card input → `ON CONFLICT DO UPDATE` path called (not INSERT error)
4. Run tests → fix any bugs found → re-run
5. `npm run lint && npm run typecheck`
6. Commit: `test(etl): add unit tests for ETLService batch atomicity and circuit breaker`

---

## Task 7: Admin ETL API route — trigger and status endpoints

**Files:**
- `src/routes/admin-etl.ts` — **create new**
- `src/routes/index.ts` — **modify** to register new route
- `src/tests/routes/admin-etl.test.ts` — **create new** (TDD first)

**TDD Steps:**
1. Read `src/routes/index.ts` to understand route registration pattern
2. Read an existing route test (e.g., `src/tests/routes/catalog-sku.test.ts`) to understand test setup pattern
3. Write failing tests FIRST in `admin-etl.test.ts`:
   - `POST /api/admin/etl/trigger` with valid admin JWT + `{ games: ['MTG'], jobType: 'incremental_sync' }` → 202 + `{ jobIds: [...], message: '...' }`
   - `POST /api/admin/etl/trigger` with non-admin JWT → 403
   - `POST /api/admin/etl/trigger` with invalid game code `{ games: ['INVALID'] }` → 400
   - `POST /api/admin/etl/trigger` with no auth → 401
   - `GET /api/admin/etl/jobs` with admin JWT → 200 + `{ jobs: [], total: 0 }`
   - `GET /api/admin/etl/jobs?game=MTG&limit=5` → filters applied
   - `GET /api/admin/etl/jobs` with non-admin JWT → 403
4. Run tests — confirm all FAIL
5. Implement `src/routes/admin-etl.ts`:
   ```typescript
   POST /api/admin/etl/trigger — validates game codes, calls ETLService.startETLJob() async (non-blocking), returns 202
   GET /api/admin/etl/jobs — queries ETLJob repository with filters, returns paginated results
   ```
   Both endpoints require admin role middleware (use existing `requireRole('admin')` pattern or equivalent).
6. Register route in `src/routes/index.ts`: `router.use('/admin/etl', adminEtlRouter)`
7. Run tests → confirm all pass
8. Run `npm run lint && npm run typecheck && npm run build && npm test`
9. Verify overall test coverage ≥ 80% on changed modules: `npm run test:coverage`
10. Commit: `feat(etl): add admin API endpoints to trigger ETL jobs and query status`

---

## Verification Checklist (before Phase 5)

Run in `customer-backend/`:
```bash
npm run lint && npm run typecheck && npm run build && npm test
npm run test:coverage
```

Evidence required:
- [ ] All 7 task test suites pass
- [ ] `formatSKU()` produces correct format for all 4 games (AC5)
- [ ] `ETLService` rollback test passes (AC6)
- [ ] Admin ETL trigger endpoint returns 202 for valid admin request
- [ ] Admin ETL trigger endpoint returns 403 for non-admin
- [ ] Test coverage ≥ 80% on all modified/created files
- [ ] Zero lint errors, zero typecheck errors, build succeeds
- [ ] Story file ACs marked (IMPLEMENTED) — note: story file must be created first (story is in backlog; Scrum Master to create story file before Dev marks ACs)
