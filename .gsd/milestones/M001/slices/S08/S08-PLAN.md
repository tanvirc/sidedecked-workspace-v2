# S08: 3-Step Seller Listing Wizard

**Goal:** An individual seller can list a card via a 3-step wizard (Identify → Condition + Photos → Price + Confirm) matching the `storefront-sell-list-card.html` wireframe. Market pricing pre-filled, photos uploaded to MinIO, listing appears on card detail page via existing BFF pipeline.
**Demo:** Navigate to `/sell/list-card`, search for a card, select a printing, grade condition, upload photos, see market pricing pre-fill, set price, publish — listing created via `POST /store/consumer-seller/listings`.

## Must-Haves

- 3-step wizard with progress indicator (dots + connectors) matching wireframe
- Step 1: card search against customer-backend catalog API with 300ms debounce, search results dropdown, printing grid selector
- Step 2: condition grade selector in horizontal card-based layout with placeholder thumbnails, dual photo upload zones (front/back) with immediate MinIO upload and inline preview, optional description textarea
- Step 3: market price triptych (low/median/high) from catalog pricing API, price input with competitive gauge bar, shipping option cards, confirmation summary card
- Publish wired to `createSellerListing()` from `seller-dashboard.ts`, success screen via existing `ListingSuccessScreen`
- Pre-fill flow: arriving from card detail with `?sku=` skips to Step 2 with card data pre-populated
- Voltage tokens via inline styles (D009), responsive desktop (720px max-width) + mobile layouts matching wireframe CSS rules
- Graceful fallbacks: no market data → "Set your own price", API errors → clear error messages
- Price stored in cents, `catalog_sku` constructed as `{GAME}-{SET}-{NUMBER}-{LANG}-{CONDITION}-{FINISH}`

## Proof Level

- This slice proves: operational
- Real runtime required: yes (customer-backend for card search + pricing, backend for listing creation + image upload)
- Human/UAT required: yes (visual comparison against wireframe at 1440px and 390px)

## Verification

- `cd storefront && npx vitest run src/components/seller/__tests__/ListingWizard.test.tsx` — wizard tests pass covering: 3-step progress indicator rendering, step navigation (forward/back), card search with debounce, printing selection gating Continue, condition selector, photo upload zones, market price display with fallback, price input with competitive gauge, confirmation summary, publish flow, pre-fill via SKU prop, Voltage token compliance (zero forbidden Tailwind color classes)
- `cd storefront && npx vitest run` — 794+ total tests pass (zero regressions)
- `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/seller/ListingWizard/ storefront/src/components/seller/wizard/` — zero matches (Voltage compliance)

## Observability / Diagnostics

- Runtime signals: console.error on card search API failure, image upload failure, listing creation failure — all with `[listing-wizard]` prefix
- Inspection surfaces: `data-testid` attributes on all wizard elements (wizard progress, step containers, search input, printing grid, condition grid, photo zones, price input, gauge, confirm card, publish button)
- Failure visibility: error state displayed inline in wizard card with specific message (search error, upload error, submission error)

## Integration Closure

- Upstream surfaces consumed: `seller-dashboard.ts` (createSellerListing, uploadListingImage), customer-backend catalog API (card search, SKU pricing), `ConditionGuide` types (ConditionCode), `ListingSuccessScreen`
- New wiring introduced in this slice: `ListingWizard` component replaces `CardListingForm` on `/sell/list-card` page, `?sku=` query param enables pre-fill from card detail page
- What remains before the milestone is truly usable end-to-end: S09 (cart optimizer consumes listings), S10 (integration polish)

## Tasks

- [x] **T01: ListingWizard shell, progress indicator, and Step 1 (Identify)** `est:2h`
  - Why: Establishes the wizard state machine, step navigation, and the card search + printing selection flow that gates the entire wizard. Most complex async behavior lives here (debounced search, API calls, state transitions).
  - Files: `storefront/src/components/seller/wizard/ListingWizard.tsx`, `storefront/src/components/seller/wizard/WizardProgress.tsx`, `storefront/src/components/seller/wizard/WizardStepIdentify.tsx`, `storefront/src/components/seller/wizard/CardSearchInput.tsx`, `storefront/src/components/seller/wizard/PrintingGrid.tsx`, `storefront/src/app/[locale]/(main)/sell/list-card/page.tsx`
  - Do: (1) Create `ListingWizard` parent component with wizard state machine (`useState` for current step + accumulated data across steps: selectedCard, selectedPrint, condition, photos, price, shipping). (2) Build `WizardProgress` — 3 dots with connectors matching wireframe (active/done/pending states, checkmark for done). (3) Build `WizardStepIdentify` with `CardSearchInput` (debounced 300ms search against `/api/catalog/cards/search?q=`, results dropdown with card thumb + name + set) and `PrintingGrid` (2-col grid of printing options from card's prints array, selected state with brand-primary border). (4) Continue button disabled until a printing is selected. (5) Update `page.tsx` to render `ListingWizard` instead of `CardListingForm`, pass `prefillSku` from searchParams. (6) When `prefillSku` provided, fetch card data via `/api/catalog/sku/:sku`, auto-populate Step 1 and start at Step 2. (7) All styling via Voltage CSS custom properties in inline styles, responsive per wireframe mobile rules.
  - Verify: Component renders, step navigation works, card search returns results, printing selection gates Continue
  - Done when: Step 1 is fully functional with search → select card → select printing → Continue advances to Step 2, pre-fill via SKU works

- [x] **T02: Step 2 (Condition + Photos) and Step 3 (Price + Confirm + Publish)** `est:2h`
  - Why: Builds the remaining two wizard steps, the publish flow, and the success screen integration. These are the data-collection and submission steps that complete the wizard.
  - Files: `storefront/src/components/seller/wizard/WizardStepCondition.tsx`, `storefront/src/components/seller/wizard/ConditionGradeSelector.tsx`, `storefront/src/components/seller/wizard/PhotoUploader.tsx`, `storefront/src/components/seller/wizard/WizardStepPrice.tsx`, `storefront/src/components/seller/wizard/MarketPriceDisplay.tsx`, `storefront/src/components/seller/wizard/CompetitiveGauge.tsx`, `storefront/src/components/seller/wizard/ShippingSelector.tsx`, `storefront/src/components/seller/wizard/ConfirmationSummary.tsx`
  - Do: (1) Build `WizardStepCondition` with `ConditionGradeSelector` — horizontal flex layout with card-style options (placeholder thumbnail, grade code, label), selected state with positive border. Reuse `ConditionCode` type from existing `ConditionGuide`. (2) Build `PhotoUploader` — two 5:7 aspect-ratio drop zones (front/back), click-to-upload via hidden file input, drag-and-drop support, immediate upload via `uploadListingImage()` on file selection, inline preview replacing drop zone content, photo-zone-hint text. Nudge message when proceeding without photos. (3) Optional description textarea. (4) Build `WizardStepPrice` with `MarketPriceDisplay` — fetch from `/api/catalog/sku/:gameCode/:setCode/:collectorNumber/prices`, render low/median/high triptych, fallback "No market data" message. (5) Price input pre-filled with median, dollars displayed/cents stored. (6) `CompetitiveGauge` — gradient bar (green→yellow→red) with positioned marker based on price relative to low/high range. Text warning when price >50% below median. (7) `ShippingSelector` — 2-col grid of shipping option cards (Standard/Tracked) with selected state. (8) `ConfirmationSummary` — card showing card name, set, condition, price, shipping. (9) Publish button calls `createSellerListing()` with assembled payload (catalog_sku built from selections, price in cents, uploaded image URLs). On success, render `ListingSuccessScreen`. On error, show inline error in wizard card. (10) Back buttons navigate to previous steps. All Voltage inline styles, responsive per wireframe mobile rules (single-col market prices, single-col shipping, stacked wizard actions).
  - Verify: Full wizard flow works end-to-end from Step 1 through publish; market prices render or show fallback; gauge updates with price changes; photos upload and preview
  - Done when: Complete 3-step wizard flow works: Identify → Condition + Photos → Price + Confirm → Publish. ListingSuccessScreen renders on success.

- [x] **T03: Test coverage and polish** `est:1.5h`
  - Why: Proves the wizard works correctly via automated tests. Verifies Voltage compliance, step navigation, async behavior mocking, and all wireframe-specified interactions.
  - Files: `storefront/src/components/seller/__tests__/ListingWizard.test.tsx`, `storefront/src/components/seller/wizard/ListingWizard.tsx` (minor fixes from test findings)
  - Do: (1) Write comprehensive test file covering: wizard renders with 3-step progress indicator; Step 1 renders search input and printing grid; card search debounces and shows results; selecting a printing enables Continue; Continue advances to Step 2 with correct progress state; Step 2 renders condition selector and photo upload zones; condition selection updates wizard state; Back button returns to Step 1; Continue from Step 2 advances to Step 3; Step 3 renders market prices (mock API), price input, gauge, shipping, confirmation; price input updates gauge marker position; publish button calls createSellerListing with correct payload; success screen renders after publish; pre-fill via SKU prop starts at Step 2; Voltage compliance scan (grep source for forbidden `bg-white`, `bg-gray-`, `text-gray-` classes). (2) Mock `fetch` for catalog search API, pricing API. Mock `createSellerListing` and `uploadListingImage` from seller-dashboard. (3) Fix any issues discovered during testing. (4) Run full test suite to confirm zero regressions.
  - Verify: `npx vitest run src/components/seller/__tests__/ListingWizard.test.tsx` passes; `npx vitest run` shows 794+ total tests
  - Done when: All wizard tests pass, full suite passes with zero regressions, Voltage compliance verified

## Files Likely Touched

- `storefront/src/components/seller/wizard/ListingWizard.tsx`
- `storefront/src/components/seller/wizard/WizardProgress.tsx`
- `storefront/src/components/seller/wizard/WizardStepIdentify.tsx`
- `storefront/src/components/seller/wizard/CardSearchInput.tsx`
- `storefront/src/components/seller/wizard/PrintingGrid.tsx`
- `storefront/src/components/seller/wizard/WizardStepCondition.tsx`
- `storefront/src/components/seller/wizard/ConditionGradeSelector.tsx`
- `storefront/src/components/seller/wizard/PhotoUploader.tsx`
- `storefront/src/components/seller/wizard/WizardStepPrice.tsx`
- `storefront/src/components/seller/wizard/MarketPriceDisplay.tsx`
- `storefront/src/components/seller/wizard/CompetitiveGauge.tsx`
- `storefront/src/components/seller/wizard/ShippingSelector.tsx`
- `storefront/src/components/seller/wizard/ConfirmationSummary.tsx`
- `storefront/src/app/[locale]/(main)/sell/list-card/page.tsx`
- `storefront/src/components/seller/__tests__/ListingWizard.test.tsx`
