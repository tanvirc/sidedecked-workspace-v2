# Epic 2: Catalog Platform

## Objective
Create the authoritative trading card catalog, automated import pipelines, and media handling required to power marketplace, deck, and pricing experiences.

## Outcome
- Normalized schema for multi-game card metadata within `sidedecked-db`.
- Automated ETL pipelines for Scryfall and other data sources with observability.
- Media pipeline delivering responsive card art through CDN-backed storage.

## Stories

### Story 2.1: Canonical Card Schema & Storage
As a catalog engineer, I want a normalized card schema so that all trading card games are represented consistently.

**Acceptance Criteria**
1. Create normalized entities for cards, prints, rulings, and game metadata with indexes in `sidedecked-db`.
2. Support multi-language names, legalities, tags, and format metadata in JSONB fields.
3. Seed migrations for reference data and expose CRUD APIs restricted to admin roles.

### Story 2.2: Automated Scryfall Import Pipeline
As an operator, I want automated imports so that the catalog stays current without manual effort.

**Acceptance Criteria**
1. Scheduled workflow retrieves bulk card data, incremental updates, and rulings from Scryfall (and other sources).
2. ETL pipeline deduplicates records, maps into the canonical schema, and logs anomalies for review.
3. Import runs emit metrics and alerts, with retry semantics for transient failures.

### Story 2.3: Media Asset Processing
As a customer, I want crisp card images so that browsing the catalog feels premium.

**Acceptance Criteria**
1. Media pipeline downloads art, crops variants, generates responsive sizes, and stores assets in Cloudflare R2/S3.
2. Persist CDN URLs and asset metadata with cache-control headers optimized for the storefront.
3. Provide graceful fallbacks when images are missing or restricted.
