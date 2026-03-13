---
id: T01
parent: S08
milestone: M001
provides:
  - ListingWizard parent component with 3-step state machine (currentStep, card/print/condition/photos/price/shipping state)
  - WizardProgress 3-step indicator with active/done/pending states and connectors matching wireframe
  - CardSearchInput with 300ms debounced fetch against customer-backend catalog API, search results dropdown
  - PrintingGrid 2-column grid (1-column mobile) with brand-primary selected state
  - WizardStepIdentify composing search + printing grid with Continue gating
  - Pre-fill flow from ?sku= query param fetching card data and starting at Step 2
  - Page updated to render ListingWizard instead of CardListingForm
  - 27 passing tests covering all T01 components
key_files:
  - storefront/src/components/seller/wizard/ListingWizard.tsx
  - storefront/src/components/seller/wizard/WizardProgress.tsx
  - storefront/src/components/seller/wizard/WizardStepIdentify.tsx
  - storefront/src/components/seller/wizard/CardSearchInput.tsx
  - storefront/src/components/seller/wizard/PrintingGrid.tsx
  - storefront/src/app/[locale]/(main)/sell/list-card/page.tsx
  - storefront/src/components/seller/__tests__/ListingWizard.test.tsx
key_decisions:
  - Wizard state managed via single useState<WizardState> object in ListingWizard parent, individual step components receive props + callbacks (no context/reducer needed for 3-step flow)
  - Mobile responsive labels handled via paired full/short spans with CSS media query display toggle (no JS breakpoint detection)
  - CardSearchInput maps API responses flexibly to handle both camelCase and snake_case field names from catalog API
patterns_established:
  - Wizard components use Voltage CSS custom properties via inline styles exclusively (D009)
  - data-testid attributes on all interactive wizard elements for test targeting
  - Console errors prefixed with [listing-wizard] for runtime diagnostics
  - Step placeholder shells rendered for steps 2/3 with Back/Continue navigation — T02 replaces these with real content
observability_surfaces:
  - console.error with [listing-wizard] prefix on card search API failure and SKU prefill failure
  - data-testid attributes on wizard-progress, wizard-step-dot-{1,2,3}, wizard-connector-{1,2}, wizard-step-identify, card-search-input, card-search-field, card-search-results, card-search-result-item, card-search-error, card-search-empty, printing-grid, printing-option, wizard-continue-btn, wizard-back-btn, wizard-loading, wizard-prefill-error, wizard-step-condition, wizard-step-price, listing-wizard
duration: 30min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: ListingWizard shell, progress indicator, and Step 1 (Identify)

**Built wizard state machine, 3-step progress indicator, and Step 1 (Identify) with debounced card search, printing grid selector, and SKU pre-fill flow. Replaced old CardListingForm on list-card page.**

## What Happened

Created five wizard components in `storefront/src/components/seller/wizard/`:

1. **ListingWizard.tsx** — Parent component owning all wizard state via `useState<WizardState>`. Manages step navigation (forward via Continue, back via Back buttons). Handles `prefillSku` prop by fetching card data from `/api/catalog/sku/:sku` on mount, populating selectedCard + selectedPrint, and starting at step 2. Shows loading and error states for prefill.

2. **WizardProgress.tsx** — 3-step progress indicator with 36px circle dots and 80px connector bars (40px on mobile). Three visual states: active (brand-primary bg, white text, glow shadow), done (positive bg, white checkmark), pending (surface-3 bg, tertiary text). Connector bars turn positive when preceding step completes. Mobile shows abbreviated labels ("Condition" instead of "Condition + Photos").

3. **CardSearchInput.tsx** — Text input with 300ms debounce. Fetches from `/api/catalog/cards/search?q=`. Renders dropdown with card thumbnail (36×50px), card name, set + rarity. Handles loading, error ("No cards found" empty state), and outside-click-to-close behaviors. Flexible response mapping handles both camelCase and snake_case API field names.

4. **PrintingGrid.tsx** — 2-column grid (1-column on mobile) showing set icon placeholder (28×28px), set name, set code + collector number in mono font. Selected state: brand-primary border, subtle purple background.

5. **WizardStepIdentify.tsx** — Composes CardSearchInput + PrintingGrid inside a wizard-card container (bg-surface-1, border-default, 16px radius, 32px padding). Title "Find Your Card" with description text. Continue button disabled until both card and printing are selected.

Updated `page.tsx` to render `ListingWizard` instead of `CardListingForm`, passing `searchParams.sku` as `prefillSku`. Steps 2 and 3 render placeholder shells with Back/Continue navigation — T02 will replace these with real content.

## Verification

- `cd storefront && npx vitest run src/components/seller/__tests__/ListingWizard.test.tsx` — **27 tests pass** covering WizardProgress (6), CardSearchInput (6), PrintingGrid (4), WizardStepIdentify (6), ListingWizard integration (4), Voltage compliance (1)
- `cd storefront && npx vitest run` — **821 total tests pass**, zero failures (exceeds 794+ threshold)
- `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/seller/wizard/` — zero matches (Voltage compliance confirmed)

### Slice-level verification status (T01 of 3):
- ✅ 3-step progress indicator rendering
- ✅ Step navigation (forward via Continue, back buttons present)
- ✅ Card search with debounce
- ✅ Printing selection gating Continue
- ✅ Pre-fill via SKU prop
- ✅ Voltage token compliance
- ⬜ Condition selector (T02)
- ⬜ Photo upload zones (T02)
- ⬜ Market price display with fallback (T02)
- ⬜ Price input with competitive gauge (T02)
- ⬜ Confirmation summary (T02)
- ⬜ Publish flow (T02)

## Diagnostics

- Search for `[listing-wizard]` in console output to find card search and SKU prefill errors
- All wizard elements have `data-testid` attributes for test and browser automation targeting
- Error states render inline with specific messages (search error, prefill error)

## Deviations

None. Implementation follows the task plan exactly.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/components/seller/wizard/ListingWizard.tsx` — created: wizard parent with state machine and step rendering
- `storefront/src/components/seller/wizard/WizardProgress.tsx` — created: 3-step progress indicator with active/done/pending states
- `storefront/src/components/seller/wizard/WizardStepIdentify.tsx` — created: Step 1 container composing search + printing grid
- `storefront/src/components/seller/wizard/CardSearchInput.tsx` — created: debounced card search with results dropdown
- `storefront/src/components/seller/wizard/PrintingGrid.tsx` — created: printing variant selector grid
- `storefront/src/app/[locale]/(main)/sell/list-card/page.tsx` — modified: renders ListingWizard instead of CardListingForm, passes searchParams.sku
- `storefront/src/components/seller/__tests__/ListingWizard.test.tsx` — created: 27 tests covering all T01 components
