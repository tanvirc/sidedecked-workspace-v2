---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-04-decisions
  - step-05-patterns
  - step-07-validation
  - step-08-complete
inputDocuments:
  - docs/specifications/08-search-discovery-system.md
---
# Architecture Decisions - Search & Discovery System

**Author:** CodexSandboxOffline
**Date:** 2026-02-16
**Spec ID:** 08-search-discovery-system

## Context and Routing Boundaries

- Bounded context: Federated search and discovery across catalog, community, and marketplace
- Primary owner repo: customer-backend
- Participating repos: customer-backend, backend, storefront, vendorpanel
- API boundary constraints:
  - Search index orchestration lives behind search APIs, not direct UI index access
  - Commerce and community sources are federated through API adapters
  - Personalization and recommendations are delivered by API contracts
- Data boundary constraints:
  - Index build pipelines pull from each bounded context using authorized APIs
  - No direct sidedecked-db to mercur-db reads for federated indexing
  - Search documents carry denormalized views and source-of-truth pointers only

## Architecture Constraints

- Preserve split-domain ownership and prohibit direct database coupling between mercur-db and sidedecked-db.
- Cross-domain behavior must be implemented via HTTP APIs and/or events with explicit contracts.
- Implementation must follow existing patterns for service/controller/repository boundaries in the owning repo.

## Integration Architecture Constraints



## Security and Performance Constraints

### Security



### Performance

