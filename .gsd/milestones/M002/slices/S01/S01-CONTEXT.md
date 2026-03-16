---
id: S01
milestone: M002
status: draft
---

# S01: Seller Onboarding & Listing Wizard

## Goal

A buyer can upgrade to seller status, connect Stripe Connect, and create a card listing via the 3-step wizard (identify card by catalog_sku -> set condition/foil -> set price/quantity).

## Why This Slice

No listings exist in the system until sellers can create them. The listing wizard is the supply-side entry point for the entire marketplace.

## Scope

### In Scope
- Consumer seller upgrade flow: buyer submits upgrade request -> admin approves -> seller status granted
- Stripe Connect onboarding: Express account creation, onboarding link generation
- 3-step listing wizard UI: Step 1 (identify card by search), Step 2 (condition + foil toggle), Step 3 (price + quantity)
- Backend listing creation: Medusa product + variant with catalog_sku metadata
- Algolia inventory sync: listing created -> Algolia product updated with availability

### Out of Scope
- Bulk CSV import (M005)
- Listing edit/delete (M002/S03 or M005)
- Listing analytics (M004)

## Constraints

- Listings are Medusa product variants - use MercurJS marketplace module
- catalog_sku stored in variant metadata to link commerce and catalog layers
- Stripe Connect must be in test mode for M002

## Integration Points

### Consumes
- Auth (M001/S02) - seller must be authenticated
- Card catalog / CatalogSKU lookup (M001/S03) - wizard Step 1 searches catalog
- Algolia index (M001/S03) - for card search in wizard

### Produces
- Medusa product+variant per listing
- Stripe Connect account_id on seller record
- `/store/consumer-seller/listings` route functional
- `/sell/list-card` storefront page functional

## Open Questions

- 5 condition grades (NM/LP/MP/HP/DMG) or 3 (NM/PL/PO)? Industry standard is 5.
- Does the wizard create one variant per listing, or one product with multiple condition variants?
