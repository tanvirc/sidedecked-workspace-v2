---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-04-decisions
  - step-05-patterns
  - step-07-validation
  - step-08-complete
inputDocuments:
  - docs/specifications/10-payment-processing-system.md
---
# Architecture Decisions - Payment Processing System

**Author:** CodexSandboxOffline
**Date:** 2026-02-16
**Spec ID:** 10-payment-processing-system

## Context and Routing Boundaries

- Bounded context: Payment processing, payouts, reconciliation, and compliance
- Primary owner repo: backend
- Participating repos: backend, storefront, vendorpanel
- API boundary constraints:
  - Payment intent, capture, refund, and payout orchestration remain in backend
  - Storefront and vendorpanel invoke payment workflows through backend APIs only
  - Compliance and fraud services integrate through dedicated provider adapters
- Data boundary constraints:
  - Financial ledgers and transaction state remain in mercur-db
  - Customer analytics mirrors require event replication rather than shared writes
  - No direct payment data writes from UI repositories

## Architecture Constraints

- Preserve split-domain ownership and prohibit direct database coupling between mercur-db and sidedecked-db.
- Cross-domain behavior must be implemented via HTTP APIs and/or events with explicit contracts.
- Implementation must follow existing patterns for service/controller/repository boundaries in the owning repo.

## Integration Architecture Constraints



## Security and Performance Constraints

### Security



### Performance

