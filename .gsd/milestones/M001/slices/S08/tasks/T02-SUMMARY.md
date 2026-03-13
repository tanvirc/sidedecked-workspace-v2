---
id: T02
parent: S08
milestone: M001
provides:
  - WizardStepCondition — Step 2 container with condition grade selector, photo uploader, description textarea
  - ConditionGradeSelector — horizontal card-based layout with 5 condition options (NM/LP/MP/HP/DMG), radiogroup role, aria-checked
  - PhotoUploader — dual 5:7 aspect-ratio drop zones (front/back) with MinIO upload, preview, remove overlay, drag-and-drop
  - WizardStepPrice — Step 3 container composing market prices, price input, competitive gauge, shipping, confirmation, publish
  - MarketPriceDisplay — fetches low/median/high from catalog pricing API, triptych layout, graceful fallback
  - CompetitiveGauge — gradient bar (green→yellow→red) with positioned marker, warning for significantly below median
  - ShippingSelector — 2-col grid with Standard/Tracked options, selected state
  - ConfirmationSummary — listing summary card with all details before publish
  - Publish flow wired to createSellerListing() with ListingSuccessScreen on success
key_files:
  - storefront/src/components/seller/wizard/WizardStepCondition.tsx
  - storefront/src/components/seller/wizard/ConditionGradeSelector.tsx
  - storefront/src/components/seller/wizard/PhotoUploader.tsx
  - storefront/src/components/seller/wizard/WizardStepPrice.tsx
  - storefront/src/components/seller/wizard/MarketPriceDisplay.tsx
  - storefront/src/components/seller/wizard/CompetitiveGauge.tsx
  - storefront/src/components/seller/wizard/ShippingSelector.tsx
  - storefront/src/components/seller/wizard/ConfirmationSummary.tsx
  - storefront/src/components/seller/wizard/ListingWizard.tsx
  - storefront/src/components/seller/__tests__/ListingWizard.test.tsx
key_decisions:
  - PhotoUploader receives uploadImage as prop (function) rather than importing server action directly — keeps component testable and avoids server/client boundary issues in tests
  - Market price pre-fill only triggers when price is 0 (not yet set) — prevents overwriting user-entered price on re-renders
  - Price stored in cents internally, displayed as dollars in input — conversion at the boundary
  - Publish flow builds catalog_sku as {GAME}-{SET}-{NUMBER}-{LANG}-{CONDITION}-{FINISH} inline rather than via shared utility — matches the pattern from T01 SKU prefill
patterns_established:
  - Wizard step components receive all state + callbacks as props from ListingWizard parent (no context/reducer needed for 3-step flow)
  - Inline responsive CSS via <style> blocks with media queries targeting data-testid selectors for mobile layout changes
observability_surfaces:
  - console.error("[listing-wizard] Image upload failed:") on photo upload failure
  - console.error("[listing-wizard] Market price fetch failed:") on pricing API failure
  - console.error("[listing-wizard] Listing creation failed:") on publish failure
  - data-testid on all interactive elements for test/automation targeting
  - Inline error messages with specific failure reason in wizard card
duration: 35min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Step 2 (Condition + Photos) and Step 3 (Price + Confirm + Publish)

**Built wizard Steps 2 and 3 with condition grade selector, photo upload zones, market price triptych, competitive gauge, shipping selector, confirmation summary, and publish flow wired to createSellerListing() with success screen.**

## What Happened

Built 8 new components and updated ListingWizard to replace the placeholder steps with fully functional Step 2 and Step 3.

Step 2 (`WizardStepCondition`) composes ConditionGradeSelector (horizontal card layout, 5 conditions with placeholder thumbnails, radiogroup/aria-checked accessibility), PhotoUploader (dual 5:7 drop zones with drag-and-drop, immediate upload via uploadListingImage, preview with remove overlay, loading spinner), description textarea, and a photo nudge message when continuing without photos.

Step 3 (`WizardStepPrice`) composes MarketPriceDisplay (fetches from catalog pricing API, 3-col triptych with low/median/high, fallback for no data), price input (dollars displayed, cents stored, pre-filled from median), CompetitiveGauge (gradient bar with positioned marker, warning for >50% below median), ShippingSelector (Standard/Tracked cards), ConfirmationSummary (all listing details), and publish button.

Publish flow builds the CreateListingInput payload with catalog_sku, calls createSellerListing(), renders ListingSuccessScreen on success with router navigation callbacks, shows inline error on failure. "List Another" resets entire wizard state.

Also added comprehensive test coverage for all new components (33 new tests) and mocked next/navigation + server actions.

## Verification

- `npx vitest run src/components/seller/__tests__/ListingWizard.test.tsx` — 60 tests pass (22 from T01 + 38 new)
- `npx vitest run` — 854 total tests pass, zero regressions
- `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/seller/wizard/` — zero matches (Voltage compliant)
- Slice verification checks: all 3 pass

## Diagnostics

- Search for `[listing-wizard]` in console output to find image upload, market price fetch, or listing creation errors
- All wizard elements have `data-testid` attributes for test and browser automation targeting
- Error states render inline in wizard card with specific failure reason
- PhotoUploader shows per-zone upload errors and loading spinners

## Deviations

- Added test coverage for T02 components directly in this task rather than deferring entirely to T03 — the slice plan anticipated T03 as the test task, but mocking infrastructure (next/navigation, server actions) was needed to make the existing T01 integration tests pass after adding useRouter, so tests were written alongside implementation. T03 can focus on integration polish and any remaining coverage gaps.

## Known Issues

- `act()` warnings in test stderr for MarketPriceDisplay state updates in useEffect — these are non-blocking and don't affect test results
- Game code is hardcoded to "MTG" for catalog_sku construction — will need to be derived from card data when multi-game support is added

## Files Created/Modified

- `storefront/src/components/seller/wizard/ConditionGradeSelector.tsx` — horizontal card-based condition selector with 5 options
- `storefront/src/components/seller/wizard/PhotoUploader.tsx` — dual photo upload zones with MinIO integration
- `storefront/src/components/seller/wizard/WizardStepCondition.tsx` — Step 2 container composing condition + photos + description
- `storefront/src/components/seller/wizard/MarketPriceDisplay.tsx` — market price triptych with API fetch and fallback
- `storefront/src/components/seller/wizard/CompetitiveGauge.tsx` — gradient bar with positioned price marker
- `storefront/src/components/seller/wizard/ShippingSelector.tsx` — Standard/Tracked shipping option cards
- `storefront/src/components/seller/wizard/ConfirmationSummary.tsx` — pre-publish listing summary card
- `storefront/src/components/seller/wizard/WizardStepPrice.tsx` — Step 3 container composing all pricing/confirm components
- `storefront/src/components/seller/wizard/ListingWizard.tsx` — updated with publish flow, success screen, real step components
- `storefront/src/components/seller/__tests__/ListingWizard.test.tsx` — added 38 tests for T02 components + mocks
