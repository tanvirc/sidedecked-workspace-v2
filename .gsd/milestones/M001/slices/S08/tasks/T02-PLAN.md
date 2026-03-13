---
estimated_steps: 5
estimated_files: 8
---

# T02: Step 2 (Condition + Photos) and Step 3 (Price + Confirm + Publish)

**Slice:** S08 — 3-Step Seller Listing Wizard
**Milestone:** M001

## Description

Build the remaining two wizard steps. Step 2: condition grade selector redesigned as horizontal card-based layout with placeholder thumbnails, dual photo upload zones with immediate MinIO upload and inline preview, optional description. Step 3: market price fetch and triptych display, price input with competitive gauge, shipping option cards, confirmation summary, and publish action wired to `createSellerListing()` with success screen integration.

## Steps

1. Create `WizardStepCondition.tsx` composing `ConditionGradeSelector` + `PhotoUploader` + description textarea inside wizard-card. Build `ConditionGradeSelector.tsx` — horizontal flex layout (wraps on mobile) with 5 condition cards (NM/LP/MP/HP/DMG). Each card: placeholder thumbnail (40×56px, surface-3 bg), condition code in heading font bold, label in tertiary text. Selected: positive border + subtle green bg. Reuse `ConditionCode` type from existing `ConditionGuide.tsx`. Include `role="radiogroup"` and `aria-checked` for accessibility. Back button navigates to Step 1, Continue to Step 3. Nudge message ("Listings with photos sell 3x faster") when proceeding without photos.

2. Build `PhotoUploader.tsx` — two side-by-side 5:7 aspect-ratio drop zones ("Front of Card" / "Back of Card"). Each zone: dashed border (border-strong), camera/image SVG icon, label, hint text "Drag & drop or click to upload". Hidden `<input type="file" accept="image/*">` triggered on zone click. On file selection: immediately call `uploadListingImage(file)` from `seller-dashboard.ts`, show loading spinner in zone during upload, on success replace zone content with image preview (object-cover in same aspect ratio) with a remove/replace overlay. Store returned MinIO URLs in wizard state. Handle upload errors with toast notification. Drag-and-drop via `onDragOver`/`onDrop` handlers.

3. Build `WizardStepPrice.tsx` composing `MarketPriceDisplay` + price input + `CompetitiveGauge` + `ShippingSelector` + `ConfirmationSummary` inside wizard-card. Create `MarketPriceDisplay.tsx` — on mount, fetch market prices from `${NEXT_PUBLIC_CUSTOMER_BACKEND_URL}/api/catalog/sku/${gameCode}/${setCode}/${collectorNumber}/prices`. Render 3-col grid (1-col mobile) with low/median/high cards. Each card: uppercase label (11px, tertiary), price value in display font (22px), percentile note. Colors: low=positive, median=text-primary (with brand-primary border), high=warning. Fallback: "No market data available — set your own price" when API returns no data. Pre-fill price input with median value.

4. Build `CompetitiveGauge.tsx` — container with label "Competitive Position", gradient bar (linear-gradient green→yellow→red), positioned white marker dot (16px, brand-primary border) calculated from price relative to low/high range. Labels below: "Underpriced / Market Rate / Premium". When price >50% below median, add text warning for accessibility: "This price is significantly below market average." Build `ShippingSelector.tsx` — 2-col grid (1-col mobile) with Standard and Tracked options as clickable cards with selected state (brand-primary border). Build `ConfirmationSummary.tsx` — card with border-strong, title "Listing Summary", rows: Card, Set, Condition, Price (positive color, mono font), Shipping.

5. Wire Publish flow in `ListingWizard.tsx`: on Step 3 "Publish Listing" click, build payload (`catalog_sku` from `${game}-${set}-${number}-${language}-${condition}-${finish}`, `condition`, `language`, `price` in cents, `title` as `"CardName (Condition)"`, `description`, `images` array from uploaded URLs, `shipping_method`, `status: "published"`). Call `createSellerListing(payload)`. Show loading state on button. On success, render `ListingSuccessScreen` with callbacks (onViewListing → `/seller/dashboard/listings`, onListAnother → reset wizard state, onClose → `/sell`). On error, show inline error in wizard card. Wire Back button on Steps 2 and 3 to navigate to previous step, preserving all entered data.

## Must-Haves

- [ ] ConditionGradeSelector renders 5 conditions in horizontal card layout with selected state
- [ ] PhotoUploader has two drop zones (front/back), uploads immediately to MinIO, shows preview
- [ ] MarketPriceDisplay fetches and renders low/median/high triptych, graceful fallback
- [ ] Price input pre-fills with median market price, stores value in cents
- [ ] CompetitiveGauge shows gradient bar with marker positioned by price, warning for >50% below median
- [ ] ShippingSelector renders Standard/Tracked options with selected state
- [ ] ConfirmationSummary shows all listing details before publish
- [ ] Publish calls createSellerListing with correct payload, shows ListingSuccessScreen on success
- [ ] Back buttons preserve state when navigating between steps
- [ ] All Voltage inline styles, responsive per wireframe mobile CSS rules

## Verification

- Step 2 renders condition selector, photo zones, description
- Selecting condition updates wizard state
- Step 3 shows market prices (with mocked API) or fallback
- Price input pre-fills from median, gauge marker moves with price changes
- Publish button creates listing and shows success screen
- Back navigation preserves entered data across steps
- No forbidden Tailwind color classes in any new component

## Observability Impact

- Signals added: `console.error("[listing-wizard] ...")` on image upload failure, market price fetch failure, listing creation failure
- How a future agent inspects this: `data-testid` on condition options, photo zones, price input, gauge marker, confirm rows, publish button
- Failure state exposed: inline error message in wizard card with specific failure reason

## Inputs

- `storefront/src/components/seller/wizard/ListingWizard.tsx` — wizard state machine from T01
- `storefront/src/components/seller/wizard/WizardProgress.tsx` — progress indicator from T01
- `storefront/src/components/seller/ConditionGuide.tsx` — `ConditionCode` type and condition definitions
- `storefront/src/lib/data/seller-dashboard.ts` — `createSellerListing()`, `uploadListingImage()`
- `storefront/src/components/seller/ListingSuccessScreen.tsx` — success screen component
- `docs/plans/wireframes/storefront-sell-list-card.html` — wireframe Steps 2 and 3

## Expected Output

- `storefront/src/components/seller/wizard/WizardStepCondition.tsx` — Step 2 container
- `storefront/src/components/seller/wizard/ConditionGradeSelector.tsx` — horizontal condition card selector
- `storefront/src/components/seller/wizard/PhotoUploader.tsx` — dual photo upload with MinIO integration
- `storefront/src/components/seller/wizard/WizardStepPrice.tsx` — Step 3 container
- `storefront/src/components/seller/wizard/MarketPriceDisplay.tsx` — market price triptych
- `storefront/src/components/seller/wizard/CompetitiveGauge.tsx` — price position gauge bar
- `storefront/src/components/seller/wizard/ShippingSelector.tsx` — shipping method selector
- `storefront/src/components/seller/wizard/ConfirmationSummary.tsx` — pre-publish listing summary
- `storefront/src/components/seller/wizard/ListingWizard.tsx` — updated with publish flow and success state
