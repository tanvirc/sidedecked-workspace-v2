# Story 3.3: Checkout Flow & Order Creation

## Goal
Deliver a guided multi-step checkout that produces aggregate and vendor orders.

## Context
Epic 3: Marketplace & Cart

## Dependencies
- story-03-02-multi-vendor-cart-management.md
- story-04-02-payment-capture-escrow.md

## Acceptance Criteria
1. Collect shipping address, per-vendor shipping method, and payment method with validation.
2. Calculate taxes, fees, and shipping per vendor and jurisdiction with clear review summaries.
3. Create aggregate orders plus vendor sub-orders, send confirmations, and redirect to order detail page upon success.

## Implementation Tasks
- Implement checkout wizard UI with state machine managing address, shipping, payment, and review steps.
- Build backend calculations for tax, shipping, and fees per vendor using jurisdiction data.
- Integrate order creation workflow tying into payment intents, notifications, and order detail routes.

## Validation Plan
- Execute end-to-end checkout test covering mixed-vendor cart and verifying order records.
- Validate generated emails and notifications for order confirmation and failure scenarios.

