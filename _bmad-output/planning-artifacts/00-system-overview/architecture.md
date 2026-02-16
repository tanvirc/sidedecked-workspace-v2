---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-04-decisions
  - step-05-patterns
  - step-07-validation
  - step-08-complete
inputDocuments:
  - docs/specifications/00-system-overview.md
---
# Architecture Decisions - SideDecked BMAD Specification Index

**Author:** CodexSandboxOffline
**Date:** 2026-02-16
**Spec ID:** 00-system-overview

## Boundary Decisions

- Commerce authority remains in backend/mercur-db.
- Catalog/decks/community/pricing authority remains in customer-backend/sidedecked-db.
- storefront and vendorpanel are API consumers only.
- Direct cross-database coupling is prohibited.

## Workflow Decisions

- BMAD default sequence is mandatory for architecture-affecting or cross-repo work.
- PRD and architecture readiness gates are required before implementation slicing.

