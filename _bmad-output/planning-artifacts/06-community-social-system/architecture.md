---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-04-decisions
  - step-05-patterns
  - step-07-validation
  - step-08-complete
inputDocuments:
  - docs/specifications/06-community-social-system.md
---
# Architecture Decisions - Community & Social System

**Author:** CodexSandboxOffline
**Date:** 2026-02-16
**Spec ID:** 06-community-social-system

## Context and Routing Boundaries

- Bounded context: Community identity, messaging, and social interactions
- Primary owner repo: customer-backend
- Participating repos: customer-backend, storefront, backend
- API boundary constraints:
  - Community profiles, messaging, and moderation are exposed by customer-backend APIs
  - Storefront community UX consumes customer-backend APIs
  - Commerce/user trust integrations consume published API/event interfaces
- Data boundary constraints:
  - Community data remains in sidedecked-db
  - Commerce trust signals copied to backend must come via APIs/events
  - No direct commerce DB reads for community workflows

## Architecture Constraints

- Preserve split-domain ownership and prohibit direct database coupling between mercur-db and sidedecked-db.
- Cross-domain behavior must be implemented via HTTP APIs and/or events with explicit contracts.
- Implementation must follow existing patterns for service/controller/repository boundaries in the owning repo.

## Integration Architecture Constraints



## Security and Performance Constraints

### Security



### Performance

