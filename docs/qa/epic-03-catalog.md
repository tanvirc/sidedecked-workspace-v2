# QA Gate – Epic 03 TCG Catalog & Data Fabric

- **Gate Status**: Pending
- **QA Owner**: Quinn (Test Architect)

## Entry Criteria
- Story 03.1 ETL pipeline deployed to staging with feature flag off.
- Sample datasets for each game prepared for validation.

## Exit Criteria
- Data quality checks covering card counts, deduplication, attribute mapping per game.
- ETL alerting tested with simulated failure and verified notifications.
- Media pipeline smoke test ensuring image optimization outputs expected sizes.

## Coverage Strategy
- Unit: normalization functions, schema transformers.
- Integration: end-to-end ETL run using recorded payloads.
- Regression: nightly data diff report comparing new vs previous ingest.

## Outstanding Risks
- Upstream API rate limits may cause partial ingest—monitor via runbook.
- Placeholder blurhash generator performance to be validated.

## Artifacts & Evidence
- ETL run logs archived under `customer-backend/logs/etl/`.
- Data validation reports stored in `customer-backend/reports/catalog/`.
