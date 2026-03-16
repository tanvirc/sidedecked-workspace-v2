# S03: Order Lifecycle & Payout Pipeline - UAT

**Milestone:** M002
**Written:** 2026-03-17

## UAT Type

- UAT mode: live-runtime
- Why this mode is sufficient: Payout pipeline requires real Stripe test transfers; order flow requires live Medusa + Redis.

## Preconditions

- M002/S02 complete (checkout works)
- At least one test order in system
- Stripe CLI running for webhooks

## Smoke Test

1. Create a test order (from S02 smoke test)
2. Log in as seller -> navigate to /sell
3. **Expected:** Order appears in dashboard
4. Click order -> Mark as fulfilled with tracking "USPS123456"
5. Manually trigger payout job
6. Check Stripe test dashboard -> **Expected:** Transfer created

## Test Cases

### 1. Seller sees new order
1. Complete checkout as buyer; log in as seller -> /sell
2. **Expected:** New order appears with buyer city, card name, condition, price

### 2. Fulfill order
1. Click order -> "Mark as Fulfilled" -> enter tracking number
2. GET /store/orders/:id as buyer
3. **Expected:** Order status = 'shipped', tracking_number populated

### 3. Buyer sees order history
1. Log in as buyer -> /user/orders
2. **Expected:** Order shows correct status and tracking number after fulfillment

### 4. Payout job creates Stripe transfer
1. Trigger daily payout job manually
2. Check Stripe dashboard -> Transfers section
3. **Expected:** Transfer created for correct amount (order total minus commission)
4. Check payout job logs: shows orders processed and 0 failures

### 5. Return request flow
1. Buyer at /user/orders -> click order -> "Request Return"
2. Select reason -> submit
3. Seller at /sell -> sees return request; approves
4. **Expected:** Stripe refund created; buyer order shows "Return Approved"

## Failure Signals

- Seller dashboard shows no orders after checkout
- Fulfill button doesn't update order status
- Payout job runs but creates no Stripe transfers
- Return request not visible to seller

## Requirements Proved By This UAT

- R010 - order lifecycle complete (create -> fulfill -> payout)
