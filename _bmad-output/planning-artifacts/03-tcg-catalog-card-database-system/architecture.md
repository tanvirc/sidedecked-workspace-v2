---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-04-decisions
  - step-05-patterns
  - step-07-validation
  - step-08-complete
inputDocuments:
  - docs/specifications/03-tcg-catalog-card-database-system.md
---
# Architecture Decisions - TCG Catalog & Card Database System

**Author:** CodexSandboxOffline
**Date:** 2026-02-16
**Spec ID:** 03-tcg-catalog-card-database-system

## Context and Routing Boundaries

- Bounded context: Universal TCG catalog and ETL pipelines
- Primary owner repo: customer-backend
- Participating repos: customer-backend, storefront, backend
- API boundary constraints:
  - Catalog ingestion, search metadata, and card normalization live in customer-backend APIs
  - Commerce systems consume canonical catalog data through API contracts
  - Storefront reads card/search data through customer-backend APIs
- Data boundary constraints:
  - Card, print, set, and ETL state remains in sidedecked-db
  - Commerce repositories store only references needed for listings
  - No direct mercur-db access from customer-backend services

## Architecture Constraints

- Preserve split-domain ownership and prohibit direct database coupling between mercur-db and sidedecked-db.
- Cross-domain behavior must be implemented via HTTP APIs and/or events with explicit contracts.
- Implementation must follow existing patterns for service/controller/repository boundaries in the owning repo.

## Integration Architecture Constraints



## Security and Performance Constraints

### Security



### Performance

