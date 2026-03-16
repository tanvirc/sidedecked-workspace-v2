# S02: Cart, Checkout & Order Creation - UAT

**Milestone:** M002
**Written:** 2026-03-17

## UAT Type

- UAT mode: live-runtime
- Why this mode is sufficient: Stripe payment flow requires real browser interaction; order creation depends on live Medusa + Redis stack.

## Preconditions

- M001 complete, M002/S01 complete (listings exist)
- Stripe test keys configured, Stripe CLI running for webhooks
- At least 2 card listings from 2 different test sellers

## Smoke Test

1. Log in as buyer -> navigate to /cards/[id] -> click "Add to Cart" on a listing
2. Navigate to /cart -> verify line item shows
3. Click "Proceed to Checkout"
4. Fill test address, select shipping method, enter Stripe test card 4242...
5. **Expected:** "Order confirmed" page, order email received

## Test Cases

### 1. Single-seller checkout
1. Cart with 1 listing -> checkout -> complete
2. GET /store/orders -> check latest order
3. **Expected:** 1 order with correct line item, status=created, payment_status=captured

### 2. Multi-seller cart splits
1. Cart with listings from 2 sellers -> checkout -> complete
2. GET /store/order-sets -> check sub-orders
3. **Expected:** 2 sub-orders, each with correct seller_id and line items

### 3. Stripe 3DS authentication
1. Use 3DS test card 4000002500003155; complete 3DS modal
2. **Expected:** Order created successfully after 3DS

### 4. Order confirmation email
1. Complete checkout with real email address
2. **Expected:** Email with order items, total, and order number

### 5. Collection auto-update
1. Complete checkout
2. `psql $CUSTOMER_DATABASE_URL -c "SELECT card_name, added_via FROM collection_card ORDER BY created_at DESC LIMIT 5;"`
3. **Expected:** Purchased cards appear with added_via='order'

## Failure Signals

- Checkout page never reaches payment step
- Stripe payment intent creation fails
- Order not created after successful payment
- Multi-seller cart creates only 1 order instead of split
- Collection not updated after order

## Requirements Proved By This UAT

- R008 - multi-seller cart with order splitting
- R009 - checkout with Stripe Connect
- R010 (partial) - order creation and confirmation
