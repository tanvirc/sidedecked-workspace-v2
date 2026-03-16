# M002: Marketplace Core

**Vision:** A seller can list a card and a buyer can purchase it in a single end-to-end transaction.

## Success Criteria

- Consumer seller upgrade flow complete (buyer -> verified seller)
- Listing wizard creates a Medusa product variant with catalog_sku linked
- Card detail page shows live marketplace listings from Medusa backend
- Buyer can add listing to cart and complete checkout with Stripe test card
- Order created in Medusa; seller receives email notification
- Seller can view and fulfill orders in storefront seller dashboard
- Payout job runs and creates Stripe transfer for fulfilled orders
- Vendor panel shows orders, sellers, and payouts for admin

## Key Risks / Unknowns

- Stripe Connect KYC - may block full seller onboarding test in dev
- Multi-seller cart splitting - most complex MercurJS integration
- Medusa product variant shape for card listings (condition x foil matrix)

## Proof Strategy

- Cart splitting risk -> retire in S02 by testing single-seller checkout first, then multi-seller
- Stripe Connect risk -> retire in S01 by completing Stripe test-mode onboarding
- Variant shape risk -> retire in S01 by defining and testing the condition x foil variant matrix

## Verification Classes

- Contract verification: unit tests for listing wizard, cart service, payout job
- Integration verification: end-to-end checkout with Stripe test card in local stack
- Operational verification: payout job logs in Docker, Algolia inventory sync
- UAT / human verification: full purchase transaction in browser

## Milestone Definition of Done

- All 4 slices complete
- Full purchase transaction smoke test passes
- Payout job runs in Docker without error
- No P0 bugs in checkout or order flow

## Requirement Coverage

- Covers: R007, R008, R009, R010, R011
- Partially covers: R012 (seller messaging exists but TalkJS integration verified in M004)
- Leaves for later: R013+ (deck optimizer, trust, community)

## Slices

- [ ] **S01: Seller Onboarding & Listing Wizard** `risk:medium` `depends:[]`
  > After this: a seller can register, connect Stripe, and create a card listing via the 3-step wizard.

- [ ] **S02: Cart, Checkout & Order Creation** `risk:high` `depends:[S01]`
  > After this: a buyer can add a listing to cart, check out with Stripe, and receive an order confirmation.

- [ ] **S03: Order Lifecycle & Payout Pipeline** `risk:medium` `depends:[S02]`
  > After this: sellers can view and fulfill orders; daily payout job creates Stripe transfers for fulfilled orders.

- [ ] **S04: Vendor Panel Integration** `risk:low` `depends:[S01,S02,S03]`
  > After this: admin can manage sellers, products, orders, and payouts via the vendor panel.

## Boundary Map

### S01 -> S02

Produces:
- Medusa product variants representing card listings (with catalog_sku in metadata)
- Seller account linked to Stripe Connect account_id
- `/store/consumer-seller/listings` API functional

Consumed by S02:
- Cart line items reference listing variant_id
- Stripe Connect account_id needed for payment intent creation

### S02 -> S03

Produces:
- Order records in Medusa (order_id, line items, payment intent)
- Redis `order.receipt.confirmed` event published

Consumed by S03:
- Order data for fulfillment UI and payout calculation

### S01+S02+S03 -> S04

Produces:
- Sellers, listings, orders, payouts data in Medusa

Consumed by S04:
- Vendor panel reads all of the above via Medusa admin API
