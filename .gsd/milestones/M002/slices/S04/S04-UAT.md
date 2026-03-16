# S04: Vendor Panel Integration - UAT

**Milestone:** M002
**Written:** 2026-03-17

## UAT Type

- UAT mode: human-experience
- Why this mode is sufficient: Vendor panel correctness requires human visual verification of data accuracy and workflow completeness.

## Preconditions

- M002/S01+S02+S03 complete
- Vendor panel running: `cd vendorpanel && npm run dev`
- Test data: 2+ sellers, 5+ listings, 3+ orders in various states

## Smoke Test

1. Log in to vendor panel as admin
2. Navigate to Sellers extension
3. **Expected:** Sellers list shows test sellers with correct status

## Test Cases

### 1. Sellers list and approval
1. Navigate to /sellers
2. **Expected:** Pending sellers visible; approve one -> status changes to active
3. Reject another -> status changes to rejected with reason

### 2. Seller detail page
1. Click any active seller
2. **Expected:** Profile, listings table, orders table, Stripe status all populated

### 3. Stripe Connect status
1. Navigate to /stripe-connect extension
2. **Expected:** Each seller shows charges_enabled, payouts_enabled; links to Stripe dashboard

### 4. Orders management
1. Navigate to /orders -> filter by seller A
2. **Expected:** Only seller A's orders shown
3. Click order -> **Expected:** All fields populated including fulfillment status

## Failure Signals

- Sellers list empty when sellers exist in DB
- Approve/reject action fails silently
- Stripe Connect page shows no data
- Orders filter returns incorrect results

## Requirements Proved By This UAT

- R011 - vendor panel for admin and seller management functional

## Notes for Tester

- Run `cd vendorpanel && npm run build` before testing to verify no build errors
