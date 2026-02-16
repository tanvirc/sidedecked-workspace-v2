# Epic 4: Payments & Compliance

## Objective
Integrate payments, escrow, and compliance operations to keep money movement secure, auditable, and aligned with regulatory obligations.

## Outcome
- Vendor onboarding through Stripe Connect with real-time status visibility.
- Payment capture and escrow orchestration tied to order state changes.
- Automated payout scheduling with transparent ledgers and reconciliation tooling.

## Stories

### Story 4.1: Stripe Connect Vendor Onboarding
As a vendor, I want seamless payout setup so that I can get paid without leaving SideDecked.

**Acceptance Criteria**
1. Vendor onboarding launches Stripe Connect embedded flow, captures required capabilities, and stores status updates.
2. Admin dashboard surfaces pending verification tasks, document requirements, and KYC status per vendor.
3. Errors and incomplete steps trigger notifications with retry links for vendors.

### Story 4.2: Payment Capture & Escrow Handling
As a platform operator, I want secure payment capture so that funds are held until orders are fulfilled.

**Acceptance Criteria**
1. Checkout creates Stripe PaymentIntents with line-item splits per vendor and platform commission.
2. Funds remain in escrow until vendor shipment confirmation or SLA expiry triggers automatic capture.
3. Refunds and disputes update order state via webhooks with full audit history.

### Story 4.3: Payout Scheduling & Reconciliation
As a finance analyst, I want transparent payouts so that accounting stays accurate.

**Acceptance Criteria**
1. Payout engine schedules transfers based on cadence, thresholds, and reserve policies.
2. Ledger records every charge, fee, commission, and payout in `mercur-db` with immutable audit trail.
3. Vendors can view payout histories, download statements, and export reports via vendor panel.
