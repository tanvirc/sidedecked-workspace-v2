# S01: Seller Onboarding & Listing Wizard

**Goal:** Seller creates a card listing end-to-end via the 3-step wizard.
**Demo:** Log in as seller -> /sell/list-card -> search "Lightning Bolt" -> select NM condition -> set $2.50 price, qty 3 -> submit -> listing appears on /cards/[id] page under marketplace listings.

## Must-Haves

- Consumer seller upgrade API and UI (POST /store/consumer-seller/upgrade)
- Stripe Connect Express account creation and onboarding link
- 3-step listing wizard: all 3 steps functional, validation on each step
- Listing creates a Medusa product variant with catalog_sku in metadata
- Algolia sync fires on listing creation
- `cd storefront && npm test -- --grep 'listing|wizard'` passes

## Proof Level

- This slice proves: integration
- Real runtime required: yes (Stripe test mode, Medusa API)
- Human/UAT required: yes (Stripe Connect onboarding requires browser)

## Verification

- `cd backend && npm run test:unit -- --grep 'listing'` passes
- `cd storefront && npm test -- --grep 'wizard'` passes
- Manual: complete listing creation end-to-end, verify Algolia record updated

## Observability / Diagnostics

- Runtime signals: Medusa product.created event logged; Algolia sync subscriber logs product_id
- Inspection surfaces: `/store/consumer-seller/listings` returns seller's listings
- Failure visibility: wizard step validation errors shown inline
- Redaction constraints: Stripe account_id not logged in application logs

## Integration Closure

- Upstream surfaces consumed: Medusa auth, MercurJS seller module, Stripe Connect API, Algolia sync subscriber
- New wiring introduced: catalog_sku -> variant metadata linking pattern
- What remains: S02 (cart/checkout) needed for listings to be purchasable

## Tasks

- [ ] **T01: Consumer seller upgrade flow** `est:2h`
  - Why: Sellers start as buyers - upgrade must be approved before listing is allowed
  - Files: `backend/src/api/store/consumer-seller/upgrade/route.ts`, `storefront/src/app/[locale]/(main)/sell/upgrade/page.tsx`
  - Do: POST /store/consumer-seller/upgrade (creates seller request). Admin approval route. On approval, set platform_role='seller'. Upgrade page shows status (pending/approved).
  - Verify: POST upgrade -> status shows pending -> admin approve -> GET /store/me shows seller role
  - Done when: Full upgrade flow works; unapproved sellers cannot access listing creation

- [ ] **T02: Stripe Connect seller onboarding** `est:2h`
  - Why: Sellers must connect Stripe before they can receive payouts
  - Files: `backend/src/api/store/consumer-seller/stripe-connect/route.ts`, `vendorpanel/src/extensions/stripe-connect/`
  - Do: POST /store/consumer-seller/stripe-connect -> creates Stripe Express account -> returns onboarding URL. GET status route. Handle account.updated webhook.
  - Verify: Stripe test mode: create account -> complete onboarding -> account status active
  - Done when: Seller has Stripe account_id stored; payout-enabled flag set after onboarding

- [ ] **T03: Listing wizard backend API** `est:3h`
  - Why: Listing creation must create Medusa product+variant correctly
  - Files: `backend/src/api/store/consumer-seller/listings/route.ts`
  - Do: POST /store/consumer-seller/listings creates: Medusa Product with title=card_name+set, ProductVariant with options: condition (NM/LP/MP/HP/DMG), is_foil (true/false), InventoryItem with quantity, metadata.catalog_sku. Validate: seller must be approved, catalog_sku must exist in sidedecked-db.
  - Verify: `cd backend && npm run test:unit -- --grep 'listing creation'` passes; GET /store/cards/[catalog_sku]/listings returns new listing
  - Done when: Listing visible in Medusa with correct variant shape; catalog_sku linked

- [ ] **T04: 3-step listing wizard UI** `est:4h`
  - Why: Consumer sellers need a simple, guided UX - not a raw product form
  - Files: `storefront/src/app/[locale]/(main)/sell/list-card/page.tsx`, `storefront/src/components/seller/ListingWizard.tsx`, `storefront/src/components/seller/WizardStepIdentify.tsx`, `storefront/src/components/seller/WizardStepCondition.tsx`, `storefront/src/components/seller/WizardStepPrice.tsx`
  - Do: Step 1: Algolia search to find card (shows card image + name). Step 2: condition picker (5 grades) + foil toggle. Step 3: price input (with market price reference), quantity input, submit. Progress indicator. Confirmation screen on success.
  - Verify: `npm test -- --grep 'ListingWizard'` passes covering all 3 steps and validation
  - Done when: Full 3-step flow works; form validation blocks invalid inputs

- [ ] **T05: Algolia inventory sync on listing** `est:1h`
  - Why: Card detail page listings come from Algolia - inventory must sync immediately
  - Files: `backend/src/subscribers/algolia-inventory-sync.ts`
  - Do: Subscribe to Medusa `product-variant.created` event. Update Algolia document with available_quantity, price_min, seller_count.
  - Verify: Create listing -> wait 2s -> Algolia index shows available_quantity > 0
  - Done when: Algolia document updated within 5 seconds of listing creation

## Files Likely Touched

- `backend/src/api/store/consumer-seller/`
- `backend/src/subscribers/algolia-inventory-sync.ts`
- `storefront/src/app/[locale]/(main)/sell/list-card/page.tsx`
- `storefront/src/app/[locale]/(main)/sell/upgrade/page.tsx`
- `storefront/src/components/seller/ListingWizard.tsx`
- `storefront/src/components/seller/WizardStep*.tsx`
- `vendorpanel/src/extensions/stripe-connect/`
