---
id: S03
milestone: M002
status: draft
---

# S03: Order Lifecycle & Payout Pipeline

## Goal

Sellers can view and fulfill incoming orders in the storefront seller dashboard; daily payout job creates Stripe transfers for fulfilled orders.

## Why This Slice

The order-to-payout pipeline closes the seller loop. Without it, sellers have no incentive to use the platform.

## Scope

### In Scope
- Seller dashboard: incoming orders list, order detail, mark as fulfilled
- Buyer: order history page and order detail page
- Order status notifications: seller notified by email on new order
- Daily payout job: creates Stripe Connect transfers for orders in fulfilled state
- Payout dashboard for sellers in storefront
- Basic return request flow (buyer initiates, seller approves/denies)

### Out of Scope
- Dispute resolution (M005)
- Photo evidence for returns (M005)

## Constraints

- Payout job runs daily at 00:00 UTC via Medusa scheduled job
- Only fulfilled orders are included in payout calculation

## Integration Points

### Consumes
- Orders from M002/S02
- Seller Stripe account_ids from M002/S01

### Produces
- Fulfilled orders with tracking info
- Stripe transfers (payout records)
- Seller payout history
- Buyer order history
