# Epic 03: TCG Catalog & Data Fabric

> **Status**: Not Started · **Bounded Context**: Catalog/Pricing · **Primary Repos**: `customer-backend`

## Epic Goal
Build the unified trading card catalog, ETL pipelines, and pricing datasets that power search, browsing, and analytics across SideDecked experiences.

## Dependencies
- External APIs: Scryfall, TCGPlayer, PKMNPrice (per provider contracts).
- Storage buckets for media assets (MinIO/S3) and CDN configuration.
- Algolia or equivalent search index (Epic 08).

## Assumptions
- ETL jobs orchestrated via BullMQ workers with retry and dead-letter queues.
- Raw data staged in `sidedecked-db` schema before normalization.
- Media assets resized and optimized via pipeline jobs.

## Stories

### Story 3.1: Card Ingestion Pipeline
**Status**: Not Started  
**Story**: As a platform operator, I want nightly ingestion jobs so that the catalog stays current across games.

**Acceptance Criteria**
1. Scheduled ETL fetches per game pull and deduplicate cards, prints, and sets.
2. Normalization maps rarities, legality, languages, and attributes to SideDecked schema.
3. Pipeline writes audit logs and metrics for job duration, rows processed, and failures.
4. Failed runs trigger alerts and can be replayed from last checkpoint.

### Story 3.2: Media & Asset Processing
**Status**: Not Started  
**Story**: As a storefront user, I want crisp images and set symbols so that browsing feels premium.

**Acceptance Criteria**
1. Image pipeline downloads, optimizes, and stores card images in MinIO with responsive sizes.
2. Placeholder blurhash metadata generated for progressive loading in storefront.
3. Set icons and symbols normalized and exposed via CDN endpoints.
4. Broken image detection with fallback assets and monitoring.

### Story 3.3: Pricing Feed Aggregation
**Status**: Not Started  
**Story**: As a customer, I want up-to-date pricing so that I make informed buying decisions.

**Acceptance Criteria**
1. Pricing ETL aggregates vendor marketplace data and external price guides.
2. Rolling averages, trend deltas, and confidence scores computed per card/condition.
3. Price history stored for at least 365 days for analytics.
4. Data published as events for pricing intelligence (Epic 07).

### Story 3.4: Catalog API & Caching
**Status**: Not Started  
**Story**: As a storefront developer, I want a typed catalog API so that UI can retrieve card data efficiently.

**Acceptance Criteria**
1. REST/GraphQL endpoints expose cards, prints, sets, and facets with pagination.
2. Responses cached with per-game TTL and cache invalidation tied to ETL completion.
3. API includes filtering by game, rarity, price range, vendor availability.
4. Integration tests cover end-to-end fetch from API to normalized data.

## Risks & Mitigations
- **API rate limits**: Implement incremental backoff and provider-specific quotas.
- **Data drift**: Version schema migrations and maintain ETL validation suites.

## QA Strategy
- Unit tests for normalization functions and schema transforms.
- Integration tests with mocked provider payloads.
- Data quality checks verifying sample outputs before publishing.

## Change Log
| Date       | Version | Description                              | Author            |
|------------|---------|------------------------------------------|-------------------|
| 2025-09-12 | 1.0.0   | BMAD epic created, legacy spec archived  | Product Team      |
