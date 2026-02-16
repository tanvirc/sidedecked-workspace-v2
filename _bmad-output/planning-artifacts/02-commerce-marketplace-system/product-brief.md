---
stepsCompleted:
  - step-01-init
  - step-02-vision
  - step-03-users
  - step-04-metrics
  - step-05-scope
  - step-06-complete
inputDocuments:
  - docs/specifications/02-commerce-marketplace-system.md
date: 2026-02-16
author: CodexSandboxOffline
---
# Product Brief: Commerce & Marketplace System

## Routed Context

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

## Product Vision Summary

The Commerce & Marketplace System handles all transactional aspects of the SideDecked marketplace, built on MercurJS/Medusa v2. It manages product listings, shopping cart functionality, multi-vendor checkout, order processing, and fulfillment. This system enables the core business model by facilitating secure transactions between card collectors and sellers while maintaining platform quality through reviews and seller management.

## Scope Notes

- This specification is the source-of-truth PRD for the bounded context above.
- Functional requirements are represented by epic/story decomposition and acceptance criteria in Step 7.
- Non-functional requirements are captured in Technical, Security, Performance, and Testing sections below.
- Acceptance criteria statuses must remain machine-parseable for scripts/check-acceptance-criteria.js.

