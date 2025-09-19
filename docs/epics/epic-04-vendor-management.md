# Epic 04: Vendor Management System

> **Status**: Not Started · **Bounded Context**: Commerce/Vendor · **Primary Repos**: `backend`, `vendorpanel`

## Epic Goal
Empower professional vendors and individual sellers with onboarding, inventory automation, analytics, and workflow tooling to operate effectively on SideDecked.

## Dependencies
- Authentication role upgrade and approvals (Epic 01).
- Inventory synchronization to storefront (Epic 09).
- Pricing insights from catalog pipeline (Epic 03 & 07).

## Assumptions
- Vendorpanel React app consumes secure APIs from backend service.
- CSV ingest runs through background workers with validation and transformation.
- Vendor automation engine leverages rules stored in database with event triggers.

## Stories

### Story 4.1: Vendor Onboarding & Compliance
**Status**: Not Started  
**Story**: As a prospective vendor, I want to complete compliance steps so that I can sell on SideDecked.

**Acceptance Criteria**
1. Onboarding wizard captures business docs, payout details, tax info, and storefront preferences.
2. Admin approval workflow with status tracking and notifications.
3. Stripe Connect account linkage required before activation.
4. Audit logs and KYC status stored for regulatory checks.

### Story 4.2: Inventory Import & Validation
**Status**: Not Started  
**Story**: As a vendor, I want to upload inventory via CSV/API so that my listings stay current.

**Acceptance Criteria**
1. Upload endpoint accepts CSV with schema validation and error feedback before import.
2. Transformation mapping resolves SKUs to catalog card ids, returning unresolved items for review.
3. Bulk upsert operations run in transactional batches with rollback on failure.
4. Success and error notifications surfaced in vendor panel with downloadable reports.

### Story 4.3: Vendor Analytics Dashboard
**Status**: Not Started  
**Story**: As a vendor, I want analytics on sales and inventory so that I can optimize pricing and stock.

**Acceptance Criteria**
1. Dashboard shows GMV, net revenue, sell-through, top performing SKUs over selectable windows.
2. Inventory alerts for low stock, stale listings, and pricing anomalies (with thresholds).
3. Exportable CSV reports and scheduled email digests.
4. Metrics backed by aggregated tables refreshed nightly.

### Story 4.4: Automation Rules Engine
**Status**: Not Started  
**Story**: As a vendor, I want automation rules so that routine tasks execute without manual work.

**Acceptance Criteria**
1. Rules builder allows conditions (inventory levels, market price deltas) and actions (price update, restock request).
2. Jobs execute via background workers with execution history per rule.
3. Conflicting rule detection and throttling guardrails in place.
4. Vendors receive notifications when automation actions run.

## Risks & Mitigations
- **Data integrity**: Staging tables and preview diff before inventory commit.
- **Automation runaway**: Rate limit actions and provide kill switch per rule.

## QA Strategy
- Unit tests for CSV parsing, rule evaluation, analytics calculations.
- Integration tests for vendor panel flows using Playwright/MSW.
- Load tests on bulk import endpoints to validate throughput.

## Change Log
| Date       | Version | Description                              | Author            |
|------------|---------|------------------------------------------|-------------------|
| 2025-09-12 | 1.0.0   | BMAD epic created, legacy spec archived  | Product Team      |
