---
id: S08
parent: M001
milestone: M001
provides:
  - ListingWizard — 3-step seller listing wizard (Identify → Condition + Photos → Price + Confirm) matching wireframe
  - WizardProgress — 3-step indicator with active/done/pending states and connectors
  - CardSearchInput — 300ms debounced search against customer-backend catalog API with results dropdown
  - PrintingGrid — 2-column grid printing selector with brand-primary selected state
  - ConditionGradeSelector — horizontal card-based layout with 5 conditions (NM/LP/MP/HP/DMG), radiogroup accessibility
  - PhotoUploader — dual 5:7 drop zones with drag-and-drop, MinIO upload, preview, remove overlay
  - MarketPriceDisplay — low/median/high triptych from catalog pricing API with graceful fallback
  - CompetitiveGauge — gradient bar with positioned marker and below-median warning
  - ShippingSelector — Standard/Tracked option cards
  - ConfirmationSummary — pre-publish listing summary
  - Publish flow wired to createSellerListing() with ListingSuccessScreen on success
  - Pre-fill flow from ?sku= query param skipping to Step 2
  - 60 tests covering all wizard components
requires:
  - slice: S01
    provides: Voltage CSS custom properties, shadcn/ui primitives (Sheet, Dialog), form styling
  - slice: S05
    provides: Authenticated seller session, seller upgrade flow
affects:
  - S09
key_files:
  - storefront/src/components/seller/wizard/ListingWizard.tsx
  - storefront/src/components/seller/wizard/WizardProgress.tsx
  - storefront/src/components/seller/wizard/WizardStepIdentify.tsx
  - storefront/src/components/seller/wizard/CardSearchInput.tsx
  - storefront/src/components/seller/wizard/PrintingGrid.tsx
  - storefront/src/components/seller/wizard/WizardStepCondition.tsx
  - storefront/src/components/seller/wizard/ConditionGradeSelector.tsx
  - storefront/src/components/seller/wizard/PhotoUploader.tsx
  - storefront/src/components/seller/wizard/WizardStepPrice.tsx
  - storefront/src/components/seller/wizard/MarketPriceDisplay.tsx
  - storefront/src/components/seller/wizard/CompetitiveGauge.tsx
  - storefront/src/components/seller/wizard/ShippingSelector.tsx
  - storefront/src/components/seller/wizard/ConfirmationSummary.tsx
  - storefront/src/app/[locale]/(main)/sell/list-card/page.tsx
  - storefront/src/components/seller/__tests__/ListingWizard.test.tsx
key_decisions:
  - D028 — Wizard components in seller/wizard/ subdirectory (13 files too many for flat seller/)
  - D029 — Card search uses customer-backend catalog API, not Algolia (needs card ID + prints + set data for SKU)
  - D030 — Wizard state via useState in parent, not URL-based steps (prevents back-button state loss)
  - PhotoUploader receives uploadImage as prop for testability — avoids server/client boundary issues
  - Price stored in cents internally, displayed as dollars in input — conversion at boundary
patterns_established:
  - Wizard step components receive all state + callbacks as props from ListingWizard parent (no context/reducer for 3-step flow)
  - Inline responsive CSS via <style> blocks with media queries targeting data-testid selectors
  - Console errors prefixed with [listing-wizard] for runtime diagnostics
  - data-testid attributes on all interactive wizard elements
observability_surfaces:
  - console.error("[listing-wizard] Card search failed:") on search API failure
  - console.error("[listing-wizard] SKU prefill failed:") on prefill fetch failure
  - console.error("[listing-wizard] Image upload failed:") on photo upload failure
  - console.error("[listing-wizard] Market price fetch failed:") on pricing API failure
  - console.error("[listing-wizard] Listing creation failed:") on publish failure
  - data-testid attributes on all wizard elements for browser automation and test targeting
drill_down_paths:
  - .gsd/milestones/M001/slices/S08/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S08/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S08/tasks/T03-SUMMARY.md
duration: 1h20m
verification_result: passed
completed_at: 2026-03-14
---

# S08: 3-Step Seller Listing Wizard

**Full 3-step listing wizard built: card search with debounced catalog API → condition grading with photo upload to MinIO → market-priced listing with competitive gauge. 13 components, 60 tests, Voltage-compliant, wired to createSellerListing() with success screen.**

## What Happened

Built the seller listing wizard as 13 components in `storefront/src/components/seller/wizard/`. The wizard replaces the old `CardListingForm` stub on `/sell/list-card`.

**T01** established the wizard state machine in `ListingWizard.tsx` — a single `useState<WizardState>` object managing card, print, condition, photos, price, and shipping across 3 steps. Built `WizardProgress` (3 dots with connectors, active/done/pending visual states), `CardSearchInput` (300ms debounced fetch against `/api/catalog/cards/search`, dropdown with thumbnails), and `PrintingGrid` (2-col grid with brand-primary selected state). Updated `page.tsx` to render the wizard. Pre-fill via `?sku=` fetches card data and starts at Step 2.

**T02** built Steps 2 and 3. Step 2: `ConditionGradeSelector` (5 conditions in horizontal card layout with radiogroup accessibility), `PhotoUploader` (dual 5:7 drop zones with drag-and-drop, immediate MinIO upload via `uploadListingImage`, preview with remove overlay), description textarea. Step 3: `MarketPriceDisplay` (fetches low/median/high from catalog pricing API, triptych layout, "Set your own price" fallback), price input (dollars displayed, cents stored, pre-filled from median), `CompetitiveGauge` (gradient bar with positioned marker, warning for >50% below median), `ShippingSelector` (Standard/Tracked cards), `ConfirmationSummary`. Publish builds `catalog_sku` as `{GAME}-{SET}-{NUMBER}-{LANG}-{CONDITION}-{FINISH}`, calls `createSellerListing()`, renders `ListingSuccessScreen` on success. "List Another" resets state.

**T03** cleaned up test warnings — fixed act() warnings in WizardStepPrice tests by awaiting MarketPriceDisplay async settlement. Removed unnecessary fake timer usage. All 60 tests clean.

## Verification

- `npx vitest run src/components/seller/__tests__/ListingWizard.test.tsx` — **60 tests pass** (WizardProgress 6, CardSearchInput 6, PrintingGrid 4, WizardStepIdentify 6, WizardStepCondition 7, MarketPriceDisplay 4, CompetitiveGauge 3, WizardStepPrice 6, ListingWizard integration 4, ListingWizard publish flow 3, Voltage compliance 1)
- `npx vitest run` — **854 total tests pass**, zero failures (exceeds 794+ threshold)
- `grep -rn "bg-white\|bg-gray-\|text-gray-\|border-gray-" storefront/src/components/seller/wizard/` — **zero matches** (Voltage compliance)
- Observability: `[listing-wizard]` console.error prefix confirmed working on all 5 error paths (search, prefill, upload, pricing, publish)

## Requirements Advanced

- R017 (3-step seller listing wizard) — Full implementation complete. Wizard structurally matches wireframe with all specified interactions: card search with debounce, printing selection, condition grading, photo upload, market price pre-fill, competitive gauge, shipping selector, confirmation summary, publish flow.

## Requirements Validated

- R017 — 60 tests prove wizard flow works: step navigation, card search, printing gating, condition selection, photo zones, market prices with fallback, price input, competitive gauge, confirmation, publish, pre-fill via SKU, Voltage compliance. Structural validation complete.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- T02 wrote 33 new tests alongside implementation rather than deferring all test work to T03. The mocking infrastructure (next/navigation, server actions) was needed to make existing T01 integration tests pass after adding `useRouter` to the publish flow. T03 focused on cleanup rather than greenfield test writing.

## Known Limitations

- Game code is hardcoded to "MTG" for catalog_sku construction — will need to be derived from card data when multi-game listing is tested
- Condition grade selector uses placeholder thumbnails — real grading guide images (from `ConditionGuide`) would improve the UX
- Photo upload depends on MinIO being configured and running — no upload simulation mode for development without MinIO

## Follow-ups

- S09 will consume listings created by this wizard in the cart optimizer
- Multi-game SKU construction should derive game code from card data rather than hardcoding "MTG"

## Files Created/Modified

- `storefront/src/components/seller/wizard/ListingWizard.tsx` — wizard parent with state machine, step rendering, publish flow
- `storefront/src/components/seller/wizard/WizardProgress.tsx` — 3-step progress indicator
- `storefront/src/components/seller/wizard/WizardStepIdentify.tsx` — Step 1 container (search + printing grid)
- `storefront/src/components/seller/wizard/CardSearchInput.tsx` — debounced card search with results dropdown
- `storefront/src/components/seller/wizard/PrintingGrid.tsx` — printing variant selector grid
- `storefront/src/components/seller/wizard/WizardStepCondition.tsx` — Step 2 container (condition + photos + description)
- `storefront/src/components/seller/wizard/ConditionGradeSelector.tsx` — horizontal card-based condition selector
- `storefront/src/components/seller/wizard/PhotoUploader.tsx` — dual photo upload zones with MinIO integration
- `storefront/src/components/seller/wizard/WizardStepPrice.tsx` — Step 3 container (pricing + confirm + publish)
- `storefront/src/components/seller/wizard/MarketPriceDisplay.tsx` — market price triptych with API fetch and fallback
- `storefront/src/components/seller/wizard/CompetitiveGauge.tsx` — gradient bar with positioned price marker
- `storefront/src/components/seller/wizard/ShippingSelector.tsx` — Standard/Tracked shipping option cards
- `storefront/src/components/seller/wizard/ConfirmationSummary.tsx` — pre-publish listing summary card
- `storefront/src/app/[locale]/(main)/sell/list-card/page.tsx` — renders ListingWizard instead of CardListingForm
- `storefront/src/components/seller/__tests__/ListingWizard.test.tsx` — 60 tests covering all wizard components

## Forward Intelligence

### What the next slice should know
- Listings created by the wizard use `createSellerListing()` from `seller-dashboard.ts` — S09's cart optimizer should query listings through the existing BFF pipeline that already serves card detail page listings
- The wizard builds `catalog_sku` as `{GAME}-{SET}-{NUMBER}-{LANG}-{CONDITION}-{FINISH}` — this is the key for matching listings to catalog cards in the optimizer

### What's fragile
- Game code hardcoded to "MTG" in catalog_sku construction — will produce wrong SKUs for Pokémon/Yu-Gi-Oh!/One Piece cards if multi-game listing is tested before this is fixed
- MarketPriceDisplay fetches from `/api/catalog/sku/:gameCode/:setCode/:collectorNumber/prices` — this endpoint may not exist yet in customer-backend, so the fallback path ("Set your own price") is the default experience

### Authoritative diagnostics
- `[listing-wizard]` prefix in console.error — covers all 5 failure paths (search, prefill, upload, pricing, publish)
- `data-testid` attributes on every interactive element — reliable for browser automation in S10 integration testing

### What assumptions changed
- Test count grew from baseline 794 to 854 across S07+S08 — the 794 threshold in the plan is outdated, actual baseline going into S09 is 854
