# Epic 02: Commerce & Marketplace System

> **Status**: Not Started · **Bounded Context**: Commerce · **Primary Repos**: `backend`, `storefront`

## Epic Goal
Implement the core buying experience: carts, multi-vendor checkout, order lifecycle, and post-purchase feedback enabling SideDecked to process real transactions.

## Dependencies
- Authentication sessions (Epic 01)
- Payment processing configuration (Epic 10)
- Inventory updates from vendor ingest (Epic 09)

## Assumptions
- Built on MercurJS/Medusa v2 services with TypeORM entities.
- Stripe Connect handles split payments and vendor payouts.
- Storefront uses Next.js App Router with server actions for checkout.

## Stories

### Story 2.1: Shopping Cart Management
**Status**: Not Started  
**Story**: As a customer, I want to manage a persistent shopping cart so that I can organize purchases across vendors.

**Acceptance Criteria**
1. "Add to cart" works from listings and detail pages with optimistic UI feedback.
2. Cart groups items by vendor, showing subtotals, shipping estimates, and taxes.
3. Quantity adjustments validate inventory and update totals immediately.
4. Items can be removed or saved for later; cart persists across sessions/devices.

### Story 2.2: Multi-Vendor Checkout
**Status**: Not Started  
**Story**: As a customer, I want a unified checkout across vendors so that I can purchase everything at once.

**Acceptance Criteria**
1. Checkout flow collects shipping, billing, and payment details with validation per step.
2. Stripe payment intent created per vendor and confirmed in a single flow.
3. Success page displays consolidated summary and order numbers per vendor.
4. Failure states roll back cart mutations and surface actionable messaging.

### Story 2.3: Order Management & Fulfillment
**Status**: Not Started  
**Story**: As a customer, I want to track my orders so that I understand fulfillment progress.

**Acceptance Criteria**
1. Orders list page shows status (processing, shipped, delivered, cancelled) with timeline events.
2. Backend receives fulfillment updates from vendors and syncs to storefront via webhooks.
3. Customers can request cancellations or returns within policy windows.
4. Email notifications triggered for status changes with templated messaging.

### Story 2.4: Marketplace Reviews & Seller Ratings
**Status**: Not Started  
**Story**: As a buyer, I want to review purchases so that the marketplace remains trustworthy.

**Acceptance Criteria**
1. Post-delivery prompts allow rating seller and product condition.
2. Reviews require completed purchase and idempotent submission per order line.
3. Aggregate ratings appear on seller profiles and product detail pages.
4. Moderation queues available for flagged reviews (integrates with Epic 06 policies).

## Risks & Mitigations
- **Payment complexity**: Build robust rollback handling and Stripe webhook reconciliation.
- **Fulfillment latency**: Buffer with expected shipping windows and SLA monitoring.

## QA Strategy
- MercurJS service tests for cart, order, and payment workflows.
- Playwright end-to-end flows covering cart → checkout → confirmation.
- Contract tests for Stripe and vendor webhook payloads.

## Change Log
| Date       | Version | Description                              | Author            |
|------------|---------|------------------------------------------|-------------------|
| 2025-09-12 | 1.0.0   | BMAD epic created, legacy spec archived  | Product Team      |
