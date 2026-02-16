---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-04-decisions
  - step-05-patterns
  - step-07-validation
  - step-08-complete
inputDocuments:
  - docs/specifications/02-commerce-marketplace-system.md
---
# Architecture Decisions - Commerce & Marketplace System

**Author:** CodexSandboxOffline
**Date:** 2026-02-16
**Spec ID:** 02-commerce-marketplace-system

## Context and Routing Boundaries

- Bounded context: Commerce operations and marketplace transactions
- Primary owner repo: backend
- Participating repos: backend, storefront, vendorpanel
- API boundary constraints:
  - Checkout, orders, returns, and commerce workflows remain in backend APIs
  - Storefront and vendorpanel are API consumers for commerce workflows
  - Cross-domain catalog lookups use customer-backend APIs where needed
- Data boundary constraints:
  - Transactional commerce data remains in mercur-db
  - Card metadata references are retrieved through API integration, not direct DB reads
  - Payment and order state changes are emitted via domain events for dependent services

## Architecture Constraints

- Preserve split-domain ownership and prohibit direct database coupling between mercur-db and sidedecked-db.
- Cross-domain behavior must be implemented via HTTP APIs and/or events with explicit contracts.
- Implementation must follow existing patterns for service/controller/repository boundaries in the owning repo.

## Integration Architecture Constraints



## Security and Performance Constraints

### Security



### Performance

