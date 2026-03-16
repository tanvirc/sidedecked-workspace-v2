---
id: S02
milestone: M002
status: draft
---

# S02: Cart, Checkout & Order Creation

## Goal

A buyer adds a card listing to cart, checks out with Stripe, and receives an order confirmation email. Order is created in Medusa with correct line items and payment intent.

## Why This Slice

Cart and checkout are the highest-risk slice in M002 - multi-seller order splitting, Stripe payment intent creation, and Medusa checkout flow are all complex. This is also the slice that generates revenue.

## Scope

### In Scope
- Cart page: add/remove listings, quantity update, cart summary with per-seller grouping
- Checkout: address, shipping, payment (Stripe), order review, confirm
- Multi-seller order splitting (MercurJS split-order-payment)
- Order confirmation email via Resend
- Redis `order.receipt.confirmed` event published on order completion

### Out of Scope
- Deck optimizer cart (M003)
- Returns and disputes (M005)
- Apple Pay / Google Pay (future)

## Constraints

- Use Medusa JS SDK for all cart/checkout API calls from storefront
- Multi-seller splitting is handled by @mercurjs/split-order-payment - do not build custom logic
- Stripe test mode only for M002

## Integration Points

### Consumes
- Listings (product variants) from M002/S01
- Auth session from M001/S02
- Seller Stripe Connect account_ids from M002/S01

### Produces
- Medusa order records per seller (split orders)
- Redis order.receipt.confirmed event -> customer-backend collection subscriber
- Order confirmation email via Resend

## Open Questions

- Should shipping be calculated per-seller or flat rate per order?
- What is the order status flow? (created -> paid -> processing -> shipped -> delivered)
