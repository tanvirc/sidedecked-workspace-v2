# S04: Vendor Panel Integration

**Goal:** Admin can perform all day-to-day operations via vendor panel without direct DB/API access.
**Demo:** Log in to vendor panel -> Sellers page shows all sellers with status -> click seller -> see listings/orders/Stripe status -> approve a pending seller upgrade request.

## Must-Haves

- Sellers list page shows all sellers with approval status, listing count, and Stripe Connect status
- Seller detail page: profile, active listings, order history, payout summary
- Seller approval workflow: pending requests list, approve/reject action
- Stripe Connect extension: shows payout status per seller
- Orders management: filter by status, view line items, update fulfillment

## Proof Level

- This slice proves: contract
- Real runtime required: yes
- Human/UAT required: yes (visual verification)

## Verification

- `cd vendorpanel && npm run typecheck` passes
- `cd vendorpanel && npm run build` exits 0
- Manual: vendor panel renders all sections with correct data

## Observability / Diagnostics

- Runtime signals: vendor panel API calls logged in browser Network tab
- Failure visibility: TanStack Query error states shown inline with Retry button
- Redaction constraints: no Stripe secret keys in vendor panel env

## Integration Closure

- Upstream surfaces consumed: Medusa admin API, MercurJS seller API
- New wiring introduced: custom sellers extension, stripe-connect extension
- What remains: dispute/moderation UI (M005)

## Tasks

- [ ] **T01: Sellers extension (list + detail + approval)** `est:3h`
  - Why: Core admin seller management
  - Files: `vendorpanel/src/extensions/sellers/`, `vendorpanel/src/hooks/api/sellers.ts`
  - Do: Sellers list page with columns: name, email, status (pending/active/suspended), listing_count, created_at. Detail page: overview, listings table, orders table, payout summary. Approve/reject pending upgrade requests with confirmation dialog.
  - Verify: Manual walkthrough shows correct data for all test sellers
  - Done when: Admin can approve and reject sellers without backend access

- [ ] **T02: Stripe Connect extension** `est:2h`
  - Why: Admin needs visibility into seller payment capabilities
  - Files: `vendorpanel/src/extensions/stripe-connect/`
  - Do: Extension page: seller Stripe account status (charges_enabled, payouts_enabled). Link to Stripe dashboard for each seller. Payout history table.
  - Verify: Manual check shows correct Stripe account status for test sellers
  - Done when: Admin can see Stripe status for every seller

- [ ] **T03: Orders management view** `est:1.5h`
  - Why: Admin needs to monitor and manage orders for support
  - Files: `vendorpanel/src/routes/orders/`
  - Do: Orders list with seller filter, status filter, date range filter. Order detail: line items, buyer address, seller, fulfillment status, tracking. Manual fulfillment status override.
  - Verify: Filter by seller -> shows correct orders; click order -> all fields populated
  - Done when: Admin can find any order and override status when needed

## Files Likely Touched

- `vendorpanel/src/extensions/sellers/`
- `vendorpanel/src/extensions/stripe-connect/`
- `vendorpanel/src/hooks/api/sellers.ts`
- `vendorpanel/src/routes/orders/`
