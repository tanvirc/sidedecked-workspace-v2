---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-04-decisions
  - step-05-patterns
  - step-07-validation
  - step-08-complete
inputDocuments:
  - docs/specifications/04-vendor-management-system.md
---
# Architecture Decisions - Vendor Management System

**Author:** CodexSandboxOffline
**Date:** 2026-02-16
**Spec ID:** 04-vendor-management-system

## Context and Routing Boundaries

- Bounded context: Vendor operations, analytics, and fulfillment workflows
- Primary owner repo: backend
- Participating repos: backend, vendorpanel, storefront
- API boundary constraints:
  - Vendor onboarding, catalog operations, and fulfillment logic run in backend APIs
  - Vendorpanel drives all vendor workflows as an API client
  - Customer-facing status surfaces in storefront via backend APIs
- Data boundary constraints:
  - Vendor, order, payout, and listing business data remains in mercur-db
  - Any card intelligence uses customer-backend APIs and never direct DB coupling
  - Automation jobs publish events instead of writing across domain databases

## Architecture Constraints

- Preserve split-domain ownership and prohibit direct database coupling between mercur-db and sidedecked-db.
- Cross-domain behavior must be implemented via HTTP APIs and/or events with explicit contracts.
- Implementation must follow existing patterns for service/controller/repository boundaries in the owning repo.

## Integration Architecture Constraints



## Security and Performance Constraints

### Security



### Performance

