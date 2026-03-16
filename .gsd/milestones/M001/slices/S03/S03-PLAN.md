# S03: TCG Catalog & ETL Pipeline

**Goal:** MTG card catalog populated in sidedecked-db, images in MinIO, Algolia index searchable.
**Demo:** Run `npm run etl:run -- --game MTG` -> watch ETLJob status -> `GET /api/catalog/cards?game=MTG` returns cards with image URLs -> Algolia dashboard shows card documents.

## Must-Haves

- ETL pipeline runs for MTG without crashing
- >= 1000 MTG cards in sidedecked-db after first run
- Card images stored in MinIO with working CDN URLs
- Algolia index populated with card documents (name, game, set, rarity, catalog_sku)
- ETLJob records track run start/end/count/errors
- Pipeline is idempotent: re-running does not create duplicates
- `GET /api/catalog/cards?game=MTG&limit=20` returns cards with image_url

## Proof Level

- This slice proves: integration
- Real runtime required: yes (external APIs, MinIO, Algolia)
- Human/UAT required: no

## Verification

- `cd customer-backend && npm run etl:run -- --game MTG` exits 0
- `psql $CUSTOMER_DATABASE_URL -c "SELECT count(*) FROM card WHERE game_code = 'MTG'"` returns >= 1000
- `curl localhost:7000/api/catalog/cards?game=MTG&limit=5` returns array with image_url fields
- Algolia dashboard: index `sidedecked_cards` has >= 1000 records

## Observability / Diagnostics

- Runtime signals: ETLJob.status column (pending -> running -> complete/failed)
- Inspection surfaces: `GET /admin/etl/jobs` returns recent ETL run history
- Failure visibility: failed image downloads logged per-card with MinIO path and HTTP status
- Redaction constraints: no PII in ETL logs

## Integration Closure

- Upstream surfaces consumed: Scryfall API, MinIO, Algolia, Redis Bull queues
- New wiring introduced: ETLService, ImageProcessingService, AlgoliaIndexService in customer-backend
- What remains: S04 needs the Algolia index name and card catalog API URL

## Tasks

- [ ] **T01: ETL service core (fetch + parse + store)** `est:4h`
  - Why: The pipeline skeleton must exist before image processing or Algolia sync can be added
  - Files: `customer-backend/src/services/ETLService.ts`, `customer-backend/packages/tcg-catalog/src/services/ETLService.ts`
  - Do: Implement ETLService with methods: fetchCards(game, page), parseCards(raw), upsertCards(cards). Use Scryfall API for MTG. Track progress via ETLJob entity. Make upsert idempotent on catalog_sku.
  - Verify: Unit test with mocked upstream API returns expected Card + Print shapes
  - Done when: `npm test -- --grep ETLService` passes; manual run fetches >= 100 cards

- [ ] **T02: Image processing pipeline** `est:3h`
  - Why: Card images are core to UX; must be reliably stored and served
  - Files: `customer-backend/packages/tcg-catalog/src/services/ImageProcessingService.ts`, `customer-backend/packages/tcg-catalog/src/queues/ImageQueue.ts`
  - Do: Bull queue downloads card images from upstream URL, uploads to MinIO at `/{game}/{set_code}/{catalog_sku}.jpg`, stores MinIO URL in CardImage entity. CDNService wraps MinIO URL with Cloudflare CDN prefix. Handle failures gracefully.
  - Verify: After ETL for one set, all cards have image_url; MinIO bucket shows expected files
  - Done when: >= 95% of cards in a test set have successfully stored images

- [ ] **T03: Algolia index sync** `est:2h`
  - Why: S04 search UI depends on Algolia being populated with the right document shape
  - Files: `customer-backend/src/services/AlgoliaIndexService.ts`, `customer-backend/src/config/algolia.ts`
  - Do: Define Algolia index schema (name, game_code, set_name, rarity, catalog_sku, image_url, is_foil, price_usd). Implement AlgoliaIndexService.syncCards(cards) that upserts documents by objectID = catalog_sku. Configure index settings: searchable attributes, facets (game_code, set_name, rarity).
  - Verify: After ETL run, Algolia has >= 1000 records; search for "Lightning Bolt" returns correct card
  - Done when: Algolia index queryable with expected facets

- [ ] **T04: Admin ETL management API** `est:1.5h`
  - Why: Operators must be able to trigger and monitor ETL runs without database access
  - Files: `customer-backend/src/routes/admin-etl.ts`
  - Do: `POST /admin/etl/run?game=MTG` (trigger ETL, returns job_id), `GET /admin/etl/jobs` (list recent runs), `GET /admin/etl/jobs/:id` (single job detail). Protect with admin-only middleware.
  - Verify: POST to trigger ETL returns `{job_id: '...', status: 'running'}`
  - Done when: Admin can trigger and monitor ETL via API without DB access

## Files Likely Touched

- `customer-backend/src/services/ETLService.ts`
- `customer-backend/src/services/AlgoliaIndexService.ts`
- `customer-backend/src/services/CDNService.ts`
- `customer-backend/packages/tcg-catalog/src/services/ImageProcessingService.ts`
- `customer-backend/packages/tcg-catalog/src/queues/ImageQueue.ts`
- `customer-backend/src/routes/admin-etl.ts`
- `customer-backend/src/config/algolia.ts`
