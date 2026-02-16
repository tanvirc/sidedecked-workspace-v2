# Story 4.2: Payment Capture & Escrow Handling

## Goal
Manage payment intents, escrow, and dispute flows tied to order state.

## Context
Epic 4: Payments & Compliance

## Dependencies
- story-04-01-stripe-connect-onboarding.md

## Acceptance Criteria
1. Create Stripe PaymentIntents with line-item splits per vendor and platform commission.
2. Hold funds in escrow until shipment confirmation or SLA expiry triggers automatic capture.
3. Track refunds, partial refunds, and disputes with webhook-driven state updates.

## Implementation Tasks
- Implement payment intent creation with transfer groups and application fees per vendor.
- Add escrow management that delays capture until fulfillment events or timers expire.
- Handle Stripe webhooks updating order, payout, and dispute states reliably.

## Validation Plan
- Run Stripe webhook simulations covering success, refund, and dispute scenarios.
- Verify escrow captures release funds on shipment confirmation and expire gracefully on timeout.

