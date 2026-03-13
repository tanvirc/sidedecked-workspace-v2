---
estimated_steps: 5
estimated_files: 6
---

# T01: ListingWizard shell, progress indicator, and Step 1 (Identify)

**Slice:** S08 — 3-Step Seller Listing Wizard
**Milestone:** M001

## Description

Build the wizard state machine, 3-step progress indicator, and Step 1 (Identify) — card search with debounced catalog API queries, search results dropdown, and printing grid selector. Update the `list-card` page to render the wizard instead of the old flat form. Handle the pre-fill flow when arriving from card detail page with `?sku=` query param.

## Steps

1. Create `storefront/src/components/seller/wizard/ListingWizard.tsx` — parent component owning wizard state via `useState`. State shape: `currentStep` (1/2/3), `selectedCard` (card object from search), `selectedPrint` (print variant), `condition` (ConditionCode, default NM), `language` (default EN), `photos` (uploaded URL array), `description` (string), `price` (number in cents), `shippingMethod` (string). Renders `WizardProgress` + current step component. Accepts `prefillSku?: string` prop. When `prefillSku` provided, fetch card data from `/api/catalog/sku/:sku` on mount, populate `selectedCard` + `selectedPrint`, and start at step 2.

2. Create `storefront/src/components/seller/wizard/WizardProgress.tsx` — renders 3 step indicators with connectors matching wireframe. Props: `currentStep` (1/2/3), `completedSteps` (number[]). Each step shows: dot (36px circle with step number or checkmark), label ("Identify" / "Condition + Photos" / "Price + Confirm"). States: `--active` (brand-primary bg, white text, glow shadow), `--done` (positive bg, white checkmark), `--pending` (surface-3 bg, tertiary text). Connectors: 80px bars between dots, `--done` when preceding step complete. Mobile: shorter connectors (40px), abbreviated labels ("Condition" / "Price"). All Voltage inline styles.

3. Create `storefront/src/components/seller/wizard/CardSearchInput.tsx` — text input with 300ms debounce. On input change, fetch `${NEXT_PUBLIC_CUSTOMER_BACKEND_URL}/api/catalog/cards/search?q=${query}`. Render search results dropdown below input: each result shows card thumbnail (36×50px), card name, set + rarity. Clicking a result calls `onCardSelect(card)`. Loading state during fetch. Empty state "No cards found" when results empty. Error state with message on API failure. Dropdown closes on selection or clicking outside.

4. Create `storefront/src/components/seller/wizard/PrintingGrid.tsx` — 2-column grid (1-column on mobile) of printing options. Each option: set icon placeholder (28×28px), set name, set code + collector number in mono font. Selected state: brand-primary border, subtle purple bg. Props: `prints` array, `selectedPrint`, `onSelect`. Only renders after a card is selected.

5. Create `storefront/src/components/seller/wizard/WizardStepIdentify.tsx` — composes CardSearchInput + PrintingGrid inside a wizard-card container (bg-surface-1, border-default, 16px radius, 32px padding). Title "Find Your Card", description text. Wizard actions at bottom: empty left side, "Continue →" button (btn-primary btn-lg) disabled until a printing is selected. Calls `onContinue()` which advances wizard to step 2. Update `storefront/src/app/[locale]/(main)/sell/list-card/page.tsx` to render `ListingWizard` instead of `CardListingForm`, passing `searchParams.sku` as `prefillSku`.

## Must-Haves

- [ ] Wizard state machine with step navigation (forward via Continue, will support Back in T02)
- [ ] WizardProgress renders correctly for all 3 step states (active/done/pending) with connectors
- [ ] Card search debounces at 300ms, fetches from customer-backend catalog API
- [ ] Search results dropdown with card thumbnails, name, set info
- [ ] Printing grid with selected state, gating Continue button
- [ ] Pre-fill from `?sku=` skips to Step 2 with card data populated
- [ ] Page updated to render ListingWizard instead of CardListingForm
- [ ] All styling via Voltage CSS custom properties (D009), responsive for mobile

## Verification

- Render `ListingWizard` in test → progress indicator shows 3 steps with Step 1 active
- Type in search → debounced fetch fires → results render
- Select card → prints populate → select print → Continue enabled
- Click Continue → step advances to 2, progress updates
- Render with `prefillSku` → starts at Step 2
- No `bg-white`, `bg-gray-`, `text-gray-` in any wizard component source

## Inputs

- `docs/plans/wireframes/storefront-sell-list-card.html` — wireframe design target (Step 1 desktop + mobile)
- `storefront/src/components/seller/CardListingForm.tsx` — existing flat form with API patterns to extract from
- `storefront/src/lib/data/seller-dashboard.ts` — `createSellerListing`, `uploadListingImage` functions
- `storefront/src/components/seller/ConditionGuide.tsx` — `ConditionCode` type export
- S01 summary: Voltage tokens via inline styles (D009), `.price` CSS class for price displays
- S05 summary: Auth pages at `/login`, seller session mechanism works

## Expected Output

- `storefront/src/components/seller/wizard/ListingWizard.tsx` — wizard parent with state machine
- `storefront/src/components/seller/wizard/WizardProgress.tsx` — 3-step progress indicator
- `storefront/src/components/seller/wizard/WizardStepIdentify.tsx` — Step 1 container
- `storefront/src/components/seller/wizard/CardSearchInput.tsx` — debounced card search with dropdown
- `storefront/src/components/seller/wizard/PrintingGrid.tsx` — printing variant selector grid
- `storefront/src/app/[locale]/(main)/sell/list-card/page.tsx` — updated to render ListingWizard
