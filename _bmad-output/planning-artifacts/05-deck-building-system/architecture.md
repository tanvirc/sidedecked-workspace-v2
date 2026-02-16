---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-04-decisions
  - step-05-patterns
  - step-07-validation
  - step-08-complete
inputDocuments:
  - docs/specifications/05-deck-building-system.md
---
# Architecture Decisions - Deck Building System

**Author:** CodexSandboxOffline
**Date:** 2026-02-16
**Spec ID:** 05-deck-building-system

## Context and Routing Boundaries

- Bounded context: Deck construction, validation, and sharing
- Primary owner repo: customer-backend
- Participating repos: customer-backend, storefront, backend
- API boundary constraints:
  - Deck CRUD, validation, and collaboration APIs remain in customer-backend
  - Storefront deck builder consumes deck APIs only
  - Commerce listing generation from decks uses explicit backend-to-customer-backend API contracts
- Data boundary constraints:
  - Deck entities and social metadata remain in sidedecked-db
  - Commerce order/listing state remains in mercur-db
  - No direct deck-table reads from commerce services

## Architecture Constraints

- Preserve split-domain ownership and prohibit direct database coupling between mercur-db and sidedecked-db.
- Cross-domain behavior must be implemented via HTTP APIs and/or events with explicit contracts.
- Implementation must follow existing patterns for service/controller/repository boundaries in the owning repo.

## Integration Architecture Constraints



## Security and Performance Constraints

### Security



### Performance

