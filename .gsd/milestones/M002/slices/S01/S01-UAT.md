# S01: Seller Onboarding & Listing Wizard - UAT

**Milestone:** M002
**Written:** 2026-03-17

## UAT Type

- UAT mode: live-runtime
- Why this mode is sufficient: Stripe Connect onboarding requires real browser interaction; listing creation requires live Medusa + Algolia.

## Preconditions

- M001 complete (auth, catalog, ETL, search)
- `.env` has: STRIPE_SECRET_KEY (test mode), STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- At least one card in catalog (e.g., Lightning Bolt)

## Smoke Test

1. Log in as a buyer account
2. Navigate to /sell/upgrade -> submit upgrade request
3. In vendor panel, approve the seller request
4. Navigate to /sell/list-card -> complete 3-step wizard for Lightning Bolt NM $2.50 qty:1
5. Navigate to /cards/[lightning_bolt_id] -> verify listing appears under Marketplace section

## Test Cases

### 1. Upgrade request flow
1. POST /store/consumer-seller/upgrade as buyer
2. **Expected:** Returns {status: 'pending'}
3. Admin approves in vendor panel
4. GET /store/me -> platform_role field
5. **Expected:** platform_role = 'seller'

### 2. Stripe Connect onboarding
1. As approved seller, navigate to /sell/upgrade -> "Connect Stripe"
2. Complete Stripe test onboarding
3. **Expected:** Redirected back to /sell with "Stripe connected" status

### 3. Listing wizard end-to-end
1. Navigate to /sell/list-card
2. Step 1: Search "Lightning Bolt" -> select result
3. Step 2: Select NM condition, non-foil
4. Step 3: Enter $2.50 price, qty 1 -> Submit
5. **Expected:** Confirmation screen; listing appears in GET /store/consumer-seller/listings

### 4. Listing visible on card detail
1. Navigate to /cards/[lightning_bolt_id]
2. **Expected:** Marketplace listings section shows the listing with correct price, condition, seller name

### 5. Algolia sync
1. After listing creation, query Algolia for the catalog_sku
2. **Expected:** Document shows available_quantity >= 1

## Failure Signals

- Upgrade request returns 500 or doesn't change platform_role
- Stripe onboarding page never loads
- Listing wizard submits but no variant appears in Medusa products
- Card detail page shows no listings after creation
- Algolia document not updated after listing

## Requirements Proved By This UAT

- R007 - 3-step listing wizard functional
