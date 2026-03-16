# S03: TCG Catalog & ETL Pipeline - UAT

**Milestone:** M001
**Written:** 2026-03-17

## UAT Type

- UAT mode: live-runtime
- Why this mode is sufficient: ETL correctness requires running against real APIs and real infrastructure (MinIO, Algolia).

## Preconditions

- S01 complete (databases, Redis running)
- `.env` has: ALGOLIA_APP_ID, ALGOLIA_API_KEY, MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY
- MinIO bucket `sidedecked-images` exists and is publicly readable

## Smoke Test

1. `cd customer-backend && npm run etl:run -- --game MTG --limit 100`
2. Wait for completion
3. `curl localhost:7000/api/catalog/cards?game=MTG&limit=5` - verify cards returned with image_url
4. Check Algolia dashboard - verify >= 100 records in index

## Test Cases

### 1. ETL run completes without errors
1. Run: `npm run etl:run -- --game MTG`
2. `GET /admin/etl/jobs?limit=1` - check latest job
3. **Expected:** status=complete, error_count=0 (or <1%), records_processed >= 1000

### 2. Card data correct
1. `psql $CUSTOMER_DATABASE_URL -c "SELECT name, catalog_sku, game_code FROM card WHERE name = 'Lightning Bolt' LIMIT 3;"`
2. **Expected:** Rows with correct MTG game_code and non-null catalog_sku

### 3. Images served via CDN
1. `psql $CUSTOMER_DATABASE_URL -c "SELECT image_url FROM card_image LIMIT 5;"`
2. `curl -I <image_url>`
3. **Expected:** HTTP 200 with Content-Type: image/jpeg

### 4. Algolia search works
1. Algolia dashboard -> index -> search "Lightning Bolt"
2. **Expected:** Hit with correct objectID (catalog_sku), game_code=MTG, image_url populated

### 5. ETL is idempotent
1. Run ETL twice with --limit 100
2. `SELECT count(*) FROM card WHERE game_code = 'MTG'`
3. **Expected:** Count after second run equals count after first run

## Failure Signals

- ETLJob status=failed with non-zero error_count
- Cards in DB with null catalog_sku
- Image URLs returning 404
- Algolia index empty or missing facet attributes

## Requirements Proved By This UAT

- R001 - multi-game card catalog infrastructure proven for MTG
- R004 (partial) - Algolia index populated with correct schema for search UI

## Not Proven By This UAT

- Other games (Pokemon, Yu-Gi-Oh!, One Piece) - follow same pattern post-M001
- Price data in Algolia - M004
- Search UI - S04

## Notes for Tester

- First ETL run will be slow (image downloads). Use --limit 100 for initial validation.
- Check MinIO console at localhost:9001 to verify bucket structure
