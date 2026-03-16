# S02: Cart, Checkout & Order Creation

**Goal:** Complete purchase transaction: add listing to cart -> checkout -> order created.
**Demo:** Add "Lightning Bolt NM $2.50" to cart -> /cart shows line item -> /checkout -> fill test address -> select shipping -> Stripe test card 4242... -> "Order confirmed" page -> order appears in Medusa admin.

## Must-Haves

- Cart page renders current cart with line items, quantities, and totals
- Checkout flow: address -> shipping -> payment -> review -> confirm
- Stripe payment intent created and confirmed
- Medusa order created with correct line items and customer_id
- Multi-seller cart splits into per-seller sub-orders
- Order confirmation email sent via Resend
- Redis `order.receipt.confirmed` published after order creation
- `cd storefront && npm test -- --grep 'cart|checkout'` passes

## Proof Level

- This slice proves: integration
- Real runtime required: yes (Stripe test mode, Resend)
- Human/UAT required: yes (Stripe test card in browser)

## Verification

- `cd backend && npm run test:unit -- --grep 'cart|checkout'` passes
- `cd storefront && npm test -- --grep 'cart|checkout'` passes
- Manual: end-to-end checkout with Stripe test card 4242424242424242

## Observability / Diagnostics

- Runtime signals: Stripe webhook events logged (payment_intent.created, payment_intent.succeeded)
- Inspection surfaces: GET /store/orders returns order with correct line items
- Failure visibility: checkout errors shown as toast with error code; Stripe declines shown inline
- Redaction constraints: no card numbers in logs; Stripe handles PCI data

## Integration Closure

- Upstream surfaces consumed: MercurJS split-order-payment, Stripe Connect, Resend
- New wiring introduced: Redis order.receipt.confirmed event publisher
- What remains: S03 (fulfillment) and S04 (vendor panel) needed for full cycle

## Tasks

- [ ] **T01: Cart page UI** `est:2h`
  - Why: Buyers need to review items before checkout
  - Files: `storefront/src/app/[locale]/(main)/cart/page.tsx`, `storefront/src/components/cart/EnhancedCartItems.tsx`
  - Do: Cart page fetches cart from Medusa JS SDK. Shows line items (card name, condition, seller, quantity, price). Per-seller grouping. Quantity update. Remove item. Cart total. Proceed to Checkout CTA.
  - Verify: `npm test -- --grep 'cart'` passes; manual: add item -> /cart shows correct item
  - Done when: Cart renders live data; quantity changes sync to Medusa; remove works

- [ ] **T02: Checkout flow (address + shipping)** `est:3h`
  - Why: Address and shipping are prerequisites for payment intent creation
  - Files: `storefront/src/app/[locale]/(checkout)/checkout/page.tsx`, `storefront/src/components/cart/CartAddressSection.tsx`, `storefront/src/components/cart/CartShippingMethodsSection.tsx`
  - Do: Multi-step checkout: (1) shipping address form, (2) shipping method selection, (3) payment step. Persist state in URL params.
  - Verify: `npm test -- --grep 'checkout'` passes; fill address -> shipping options load correctly
  - Done when: Address and shipping saved to Medusa cart; payment step accessible

- [ ] **T03: Stripe payment integration** `est:3h`
  - Why: Stripe integration is the most complex step; must handle 3DS, declines, and webhooks
  - Files: `storefront/src/components/cart/CartPaymentSection.tsx`, `backend/src/subscribers/payment-webhooks.ts`
  - Do: Stripe Elements in checkout. POST /store/carts/:id/payment-sessions -> get Stripe payment intent. Stripe.confirmPayment(). Webhook: payment_intent.succeeded -> complete Medusa cart -> create order. Handle 3DS.
  - Verify: Test card 4242... completes; 3DS card 4000002500003155 triggers modal; decline card 4000000000000002 shows error
  - Done when: All 3 Stripe test scenarios work; order created in Medusa on success

- [ ] **T04: Multi-seller order splitting** `est:2h`
  - Why: Most orders span multiple sellers; splitting must work correctly for payouts
  - Files: `backend/src/subscribers/order-placed.ts`
  - Do: On order.placed event, use @mercurjs/split-order-payment to split into per-seller sub-orders. Each sub-order associated with one seller's Stripe Connect account_id. Verify totals.
  - Verify: Cart with listings from 2 sellers -> complete checkout -> 2 sub-orders with correct seller_ids
  - Done when: Multi-seller cart splits correctly; totals verified

- [ ] **T05: Order confirmation and Redis event** `est:1.5h`
  - Why: Order confirmation email closes the buyer loop; Redis event triggers collection auto-update
  - Files: `backend/src/subscribers/order-placed.ts`, `backend/src/subscribers/collection-auto-update.ts`
  - Do: On order.placed: (1) send order confirmation email via Resend. (2) Publish `order.receipt.confirmed` to Redis with {order_id, customer_id, line_items}. customer-backend collection-subscriber updates CollectionCard rows.
  - Verify: Complete checkout -> email received -> psql sidedecked-db shows collection_card rows with added_via='order'
  - Done when: Email sent; collection auto-updated within 5 seconds

## Files Likely Touched

- `storefront/src/app/[locale]/(main)/cart/page.tsx`
- `storefront/src/app/[locale]/(checkout)/checkout/page.tsx`
- `storefront/src/components/cart/*.tsx`
- `backend/src/subscribers/payment-webhooks.ts`
- `backend/src/subscribers/order-placed.ts`
- `backend/src/subscribers/collection-auto-update.ts`
