---
id: S03
milestone: M001
status: draft
---

# S03: TCG Catalog & ETL Pipeline

## Goal

Card catalog populated from upstream data sources via a repeatable ETL pipeline; images served reliably; Algolia index contains live card data searchable by name, game, and set.

## Why This Slice

Without real card data in the system, the storefront is empty and untestable. The ETL pipeline is the highest-risk slice in M001.

## Scope

### In Scope
- ETL service: ingest card data for at least one game (MTG first)
- Image processing: download card images -> upload to MinIO -> register CDN URLs
- Algolia index: define schema, write card documents, verify searchability
- Admin ETL management API (trigger run, view status, view errors)
- ETLJob entity tracking (start time, end time, records processed, errors)

### Out of Scope
- Price data ingest (M004)
- Real-time inventory sync (M002, after listings exist)
- All 4 games simultaneously (MTG in M001; others follow)

## Constraints

- ETL must be restartable: if interrupted, it resumes without duplicating records
- Image pipeline uses Bull queues (Redis) for concurrency control
- Algolia schema must be frozen before S04 starts UI work
- MinIO is the primary image store; Cloudflare CDN is the delivery layer

## Integration Points

### Consumes
- Card, CardSet, Print, CatalogSKU, ETLJob entities from S01
- Redis for Bull queues from S01
- MinIO object storage (external)
- Algolia account (external)

### Produces
- Populated card catalog in sidedecked-db
- Card images stored in MinIO
- Algolia index with card documents
- Admin ETL API at customer-backend /admin/etl

## Open Questions

- Which upstream API is used for MTG card data? (Scryfall is the standard choice)
- What is the Algolia index naming convention? (sidedecked_cards_dev vs sidedecked_cards_prod)
- Should image processing happen synchronously during ETL or as a separate Bull job?
