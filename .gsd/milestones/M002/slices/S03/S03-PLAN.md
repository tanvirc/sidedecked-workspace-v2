# S03: Order Lifecycle & Payout Pipeline

**Goal:** Sellers can view and fulfill orders; payout job creates Stripe transfers for completed orders.
**Demo:** New order arrives -> seller sees it in /sell dashboard -> marks as fulfilled with tracking number -> next payout job run -> Stripe transfer created -> seller sees payout in /sell/payouts.

## Must-Haves

- Seller dashboard at /sell shows pending orders with line items and buyer info
- Seller can mark order as fulfilled and add tracking number
- Buyer sees order history at /user/orders with current status
- Order status emails: seller gets "new order" email, buyer gets "order shipped" email
- Daily payout job runs via Medusa scheduled job and creates Stripe transfers
- Seller payout history visible at /sell/payouts
- Basic return request flow (buyer initiates, seller sees in dashboard)

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `cd backend && npm run test:unit -- --grep 'payout|order-lifecycle'` passes
- `cd storefront && npm test -- --grep 'order|payout'` passes
- Manual: complete order -> seller fulfills -> payout job runs -> Stripe transfer in test dashboard

## Observability / Diagnostics

- Runtime signals: payout job logs count of orders processed and total payout amount
- Inspection surfaces: GET /store/consumer-seller/payouts returns payout history
- Failure visibility: payout job failure logged with order_id and Stripe error code
- Redaction constraints: no bank account details in logs

## Integration Closure

- Upstream surfaces consumed: Medusa order events, @mercurjs/payout, Stripe Connect transfers API
- New wiring introduced: scheduled payout job (daily), seller order notification subscriber
- What remains: vendor panel (S04) for admin order management

## Tasks

- [ ] **T01: Seller order dashboard** `est:2.5h`
  - Why: Sellers must see and manage their orders
  - Files: `storefront/src/app/[locale]/(main)/sell/page.tsx`, `storefront/src/components/seller/ConsumerSellerDashboard.tsx`
  - Do: Dashboard shows: pending orders, active listings, recent payouts summary. Order list: card name, condition, buyer city, price, status. Click to expand order detail with buyer address and fulfill button.
  - Verify: `npm test -- --grep 'ConsumerSellerDashboard'` passes; manual check shows test orders
  - Done when: Seller sees all their orders; can mark fulfilled with tracking

- [ ] **T02: Buyer order history** `est:1.5h`
  - Why: Buyers need to track their purchases
  - Files: `storefront/src/app/[locale]/(main)/user/orders/page.tsx`
  - Do: Order history list with status badge. Click to order detail: line items with card images, tracking number when available, return request button.
  - Verify: Complete test order -> appears in /user/orders with correct status
  - Done when: Order history shows correct orders; tracking number visible after seller fulfills

- [ ] **T03: Daily payout job** `est:2h`
  - Why: Sellers must receive money - payout is the core incentive
  - Files: `backend/src/jobs/daily-payouts.ts`
  - Do: Medusa scheduled job running daily at 00:00 UTC. Query fulfilled orders not yet paid out. For each order: create Stripe Connect transfer from platform account to seller account_id. Mark order as payout_processed. Log summary.
  - Verify: Manually trigger job -> Stripe test dashboard shows transfer -> order payout_processed=true
  - Done when: Test job creates correct Stripe transfers; failures logged without crashing

- [ ] **T04: Order notification emails** `est:1h`
  - Why: Email is the primary notification channel for order events
  - Files: `backend/src/subscribers/order-notifications.ts`
  - Do: Subscribe to: order.placed -> email seller (new order). order.fulfillment.created -> email buyer (shipped, tracking). order.return-requested -> email seller.
  - Verify: Complete order flow -> check Resend dashboard for correct emails at each stage
  - Done when: All 3 notification emails send correctly

- [ ] **T05: Basic return request flow** `est:1.5h`
  - Why: Buyers must be able to request returns for wrong/damaged items
  - Files: `backend/src/api/store/returns/`, `storefront/src/app/[locale]/(main)/user/returns/`
  - Do: POST /store/returns (buyer initiates: order_id, reason, items). Seller sees return request in dashboard. Seller can approve (triggers refund) or deny. Buyer sees return status.
  - Verify: Buyer creates return request -> seller sees it -> seller approves -> Stripe refund created
  - Done when: Return request flow works end-to-end; Stripe refund triggered on approval

## Files Likely Touched

- `backend/src/jobs/daily-payouts.ts`
- `backend/src/subscribers/order-notifications.ts`
- `backend/src/api/store/returns/`
- `storefront/src/app/[locale]/(main)/sell/page.tsx`
- `storefront/src/app/[locale]/(main)/user/orders/page.tsx`
- `storefront/src/app/[locale]/(main)/user/returns/`
- `storefront/src/components/seller/ConsumerSellerDashboard.tsx`
