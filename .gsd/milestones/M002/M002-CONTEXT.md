---
depends_on:
  - M001
---

# M002: Marketplace Core

**Gathered:** 2026-03-17
**Status:** Ready for planning

## Project Description

With card catalog and auth in place, M002 adds the commerce layer: sellers can list cards, buyers can add listings to cart and checkout, orders are created and payouts flow to sellers.

## Why This Milestone

Without a working marketplace, there are no listings for the deck optimizer to query, no revenue, and no seller supply. The commerce pipeline (list -> cart -> checkout -> pay -> payout) is the platform's core transaction loop.

## User-Visible Outcome

### When this milestone is complete, the user can:
- Register as a seller and upgrade from buyer to seller status
- Create a card listing via the 3-step listing wizard (identify card, set condition, set price)
- Browse marketplace listings on the card detail page
- Add a listing to cart and check out with Stripe
- Receive an order confirmation email
- View order history and status
- As a seller: view and fulfill incoming orders
- As a seller: receive payouts via Stripe Connect

## Completion Class

- Contract complete means: end-to-end transaction - buyer completes checkout -> seller receives order notification -> seller marks fulfilled -> payout processed.

## Final Integrated Acceptance

- Create test seller account -> list a card at $5 -> log in as buyer -> add to cart -> checkout with Stripe test card -> order appears in buyer order history -> seller sees order in dashboard -> seller marks fulfilled -> payout job creates Stripe transfer.

## Risks and Unknowns

- Stripe Connect onboarding: sellers must complete Stripe KYC - test mode works but real onboarding has manual steps
- MercurJS split-order-payment: multi-seller cart splitting is complex; test with single-seller first
- Medusa cart/checkout: standard but multi-variant (condition/foil variants per card) adds complexity

## Relevant Requirements

- R007 - Seller listing wizard (3-step: identify, condition, price)
- R008 - Multi-seller cart with per-seller order splitting
- R009 - Checkout with Stripe Connect split payments
- R010 - Order lifecycle (create -> fulfill -> payout)
- R011 - Vendor panel for admin and seller management

## Scope

### In Scope
- Consumer seller upgrade flow (buyer -> seller)
- 3-step listing wizard: identify card (by catalog_sku), set condition, set price
- Medusa product variants per listing (condition, foil, quantity)
- Marketplace listings on card detail page
- Add to cart, cart page, checkout with Stripe
- Order creation, confirmation email via Resend
- Seller dashboard: incoming orders, fulfillment
- Stripe Connect onboarding for sellers
- Payout pipeline (daily job)
- Vendor panel: seller management, order management

### Out of Scope
- Bulk CSV import (M005)
- Dispute resolution (M005)
- Deck optimizer cart integration (M003)
- Trust scores (M004)

## Technical Constraints

- Use MercurJS modules for all marketplace logic - do not re-implement what MercurJS provides
- Stripe Connect is the only payment provider for M002
- Card listings are Medusa product variants with catalog_sku in metadata

## Integration Points

- Storefront BFF calls backend for cart/checkout/orders via Medusa JS SDK
- customer-backend receives `order.receipt.confirmed` event from Redis to auto-update collection
- Algolia syncs inventory changes from backend MercurJS subscribers

## Open Questions

- How many condition grades? (NM, LP, MP, HP, DMG - 5 grades per print?)
- Does the seller need to pick the exact printing, or just the card name + condition?
- Is Stripe Connect required for M002 or can we use a simpler Stripe setup first?
