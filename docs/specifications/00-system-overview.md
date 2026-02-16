---
workflowType: bmad-specification-index
workflowVersion: 6.0.0-Beta.8
indexScope: docs/specifications
currentSpecification: 04-vendor-management-system
stepsCompleted:
  - sidedecked-router.route
  - analyst.create-product-brief
  - pm.create-prd
  - architect.create-architecture
  - pm.validate-prd
  - architect.check-implementation-readiness
  - sm.create-epics-and-stories
---
# SideDecked BMAD Specification Index

## Purpose

This document is the root orchestration index for BMAD-driven specifications in docs/specifications. It standardizes routing, planning, architecture, readiness, story decomposition, and implementation validation across all platform domains.

## Workflow Contract

1. @sidedecked-router: Select bounded context and enforce split-domain boundaries.
2. @analyst: Create/update product brief artifacts.
3. @pm: Create and validate PRD artifacts.
4. @architect: Produce architecture and implementation-readiness outputs.
5. @sm: Decompose approved scope into epics and stories.
6. @dev: Implement approved stories in the routed repository.
7. @qa: Validate acceptance criteria and automation coverage.

## Active Spec Selection Rules

Use module-status.json as source of truth:

1. Continue current_specification unless complete.
2. Otherwise choose the lowest-numbered in_progress spec.
3. Otherwise choose the lowest-numbered not_started spec.

- Current active specification: 04-vendor-management-system
- Command: node scripts/next-spec.js

## Specification Ledger

| Spec ID | Status | Primary Owner | Bounded Context | Document |
|---|---|---|---|---|
| 01-authentication-user-management-system | completed | backend | Authentication and user identity management | docs/specifications/01-authentication-user-management-system.md |
| 02-commerce-marketplace-system | completed | backend | Commerce operations and marketplace transactions | docs/specifications/02-commerce-marketplace-system.md |
| 03-tcg-catalog-card-database-system | completed | customer-backend | Universal TCG catalog and ETL pipelines | docs/specifications/03-tcg-catalog-card-database-system.md |
| 04-vendor-management-system | in_progress | backend | Vendor operations, analytics, and fulfillment workflows | docs/specifications/04-vendor-management-system.md |
| 05-deck-building-system | completed | customer-backend | Deck construction, validation, and sharing | docs/specifications/05-deck-building-system.md |
| 06-community-social-system | not_started | customer-backend | Community identity, messaging, and social interactions | docs/specifications/06-community-social-system.md |
| 07-pricing-intelligence-system | not_started | customer-backend | Pricing ingestion, analytics, and alerting | docs/specifications/07-pricing-intelligence-system.md |
| 08-search-discovery-system | not_started | customer-backend | Federated search and discovery across catalog, community, and marketplace | docs/specifications/08-search-discovery-system.md |
| 09-inventory-management-system | not_started | backend | Inventory tracking, procurement, and fulfillment stock controls | docs/specifications/09-inventory-management-system.md |
| 10-payment-processing-system | not_started | backend | Payment processing, payouts, reconciliation, and compliance | docs/specifications/10-payment-processing-system.md |

## Gate and Validation Commands

- Select next spec: node scripts/next-spec.js
- Check acceptance: node scripts/check-acceptance-criteria.js --id <spec-id>
- Check next incomplete story: node scripts/check-acceptance-criteria.js --id <spec-id> --next-story
- Mark progress: node scripts/mark-spec.js --id <spec-id> --status in_progress
- Mark complete: node scripts/mark-spec.js --id <spec-id> --status completed

## Boundary Guardrails

- Commerce authority: backend with mercur-db.
- Catalog/decks/community/pricing authority: customer-backend with sidedecked-db.
- storefront and vendorpanel consume APIs only.
- Direct database coupling between mercur-db and sidedecked-db is forbidden.

## Document Structure Standard

Every spec document (01 to 10) follows this BMAD layout:

- Step 1: Routing Decision (@sidedecked-router)
- Step 2: Product Brief Summary (@analyst)
- Step 3: PRD Baseline (@pm)
- Step 4: Architecture Constraints (@architect)
- Step 5: PO Gate - PRD Validation (@pm)
- Step 6: PO Gate - Implementation Readiness (@architect)
- Step 7: Epics and Stories (@sm)
- Step 8: Delivery and QA Plan (@dev + @qa)

## Notes

- Detailed BMAD artifacts should be generated into _bmad-output/planning-artifacts/<spec-id>/ and synchronized back into these specification files.
- Acceptance criteria statuses inside story sections must remain machine-parseable for automation scripts.

