---
estimated_steps: 4
estimated_files: 3
---

# T03: Test coverage and polish

**Slice:** S08 — 3-Step Seller Listing Wizard
**Milestone:** M001

## Description

Write comprehensive tests for the listing wizard covering all 3 steps, step navigation, async behavior (search debounce, API calls, image upload), pre-fill flow, publish action, and Voltage compliance. Fix any issues discovered during testing.

## Steps

1. Create `storefront/src/components/seller/__tests__/ListingWizard.test.tsx`. Set up mocks: mock `fetch` for catalog search API (`/api/catalog/cards/search`), SKU data API (`/api/catalog/sku/`), and pricing API (`/api/catalog/sku/.../prices`). Mock `seller-dashboard.ts` module (`createSellerListing` returns success result, `uploadListingImage` returns a URL). Mock `next/navigation` (`useRouter`, `useSearchParams`). Import `ListingWizard` and render utilities.

2. Write wizard structure and Step 1 tests: (a) renders 3-step progress indicator with Step 1 active, (b) shows search input and empty state, (c) typing in search fires debounced fetch after 300ms (use `vi.advanceTimersByTime`), (d) search results render with card name and set info, (e) selecting a card shows printing grid, (f) Continue button disabled until printing selected, (g) Continue button enabled after printing selection, (h) clicking Continue advances to Step 2 with progress updated, (i) pre-fill via `prefillSku` prop fetches SKU data and starts at Step 2.

3. Write Step 2 and Step 3 tests: (a) Step 2 renders condition grid with 5 options and NM selected by default, (b) clicking condition option updates selection, (c) photo upload zones render with front/back labels, (d) Back button returns to Step 1 preserving search state, (e) Continue advances to Step 3, (f) Step 3 renders market price cards (low/median/high) from mocked API, (g) Step 3 shows fallback when pricing API returns no data, (h) price input pre-fills with median value, (i) competitive gauge renders with marker, (j) shipping options render with Standard selected by default, (k) confirmation summary shows correct card/set/condition/price/shipping, (l) clicking Publish calls `createSellerListing` with correct payload (catalog_sku format, price in cents, condition, images array, shipping), (m) success screen renders after successful publish.

4. Write Voltage compliance test: scan all `storefront/src/components/seller/wizard/*.tsx` source files for forbidden Tailwind color classes (`bg-white`, `bg-gray-`, `text-gray-`, `border-gray-`). Assert zero matches. Run full test suite `npx vitest run` and confirm 794+ total tests pass with zero regressions. Fix any issues found.

## Must-Haves

- [ ] Test file covers wizard progress indicator rendering and state transitions
- [ ] Test file covers Step 1 search debounce, result selection, printing grid gating
- [ ] Test file covers Step 2 condition selection, photo zones rendering
- [ ] Test file covers Step 3 market prices, gauge, shipping, confirmation, publish flow
- [ ] Test file covers pre-fill via SKU prop
- [ ] Voltage compliance scan passes (zero forbidden color classes)
- [ ] Full test suite passes with 794+ total tests

## Verification

- `cd storefront && npx vitest run src/components/seller/__tests__/ListingWizard.test.tsx` — all tests pass
- `cd storefront && npx vitest run` — 794+ total tests, zero failures
- `grep -rn "bg-white\|bg-gray-\|text-gray-\|border-gray-" storefront/src/components/seller/wizard/` — zero matches

## Inputs

- `storefront/src/components/seller/wizard/*.tsx` — all wizard components from T01 and T02
- `storefront/src/components/seller/__tests__/ConditionGuide.test.tsx` — existing test patterns for seller components
- `storefront/src/components/auth/__tests__/AuthPage.test.tsx` — Voltage compliance scan pattern from S05
- `storefront/src/lib/data/seller-dashboard.ts` — functions to mock (createSellerListing, uploadListingImage)

## Expected Output

- `storefront/src/components/seller/__tests__/ListingWizard.test.tsx` — comprehensive wizard test file with 15+ test cases
- `storefront/src/components/seller/wizard/*.tsx` — any bug fixes discovered during testing
