# S08: 3-Step Seller Listing Wizard — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven structural + live-runtime visual)
- Why this mode is sufficient: Wizard is structurally verified by 60 tests covering all interactions and Voltage compliance. Live-runtime UAT needed for visual comparison against wireframe at both breakpoints and end-to-end listing creation with real backend.

## Preconditions

- `cd storefront && npm run dev` running on localhost:3000
- `customer-backend` running (for card search API + catalog pricing)
- `backend` running (for listing creation + image upload to MinIO)
- MinIO running (for photo upload)
- User authenticated as a seller (seller upgrade completed)

## Smoke Test

Navigate to `/sell/list-card`. The 3-step wizard should render with Step 1 active (Identify), showing a card search input and "Find Your Card" heading. The progress indicator shows 3 dots with connectors.

## Test Cases

### 1. Step 1 — Card Search and Printing Selection

1. Navigate to `/sell/list-card`
2. Type a card name in the search input (e.g., "Lightning Bolt")
3. Wait ~300ms for debounced search results to appear
4. Click a card from the results dropdown
5. Printing grid appears with available printings
6. Select a printing (border turns brand-primary)
7. Click "Continue"
8. **Expected:** Wizard advances to Step 2. Progress indicator shows Step 1 as done (checkmark), Step 2 as active.

### 2. Step 2 — Condition and Photos

1. Five condition options visible (NM, LP, MP, HP, DMG) in horizontal card layout
2. Select a condition (e.g., NM)
3. Two photo upload zones visible (Front, Back) with 5:7 aspect ratio
4. Drag or click to upload a photo to the Front zone
5. Photo uploads immediately and preview replaces drop zone
6. Click "Continue" without adding back photo
7. **Expected:** Nudge message about missing photos appears. Wizard still advances to Step 3. Progress shows Steps 1-2 done, Step 3 active.

### 3. Step 3 — Price and Publish

1. Market price triptych shows Low/Median/High (or "Set your own price" fallback)
2. Price input pre-filled with median price (displayed as dollars)
3. Competitive gauge shows positioned marker on gradient bar
4. Change price significantly below median
5. **Expected:** Warning text appears about price being significantly below median
6. Select shipping option (Standard or Tracked)
7. Confirmation summary card shows all listing details
8. Click "Publish Listing"
9. **Expected:** Listing created, success screen appears with listing confirmation

### 4. Pre-fill from Card Detail

1. Navigate to `/sell/list-card?sku=MTG-SOM-123-EN`
2. **Expected:** Wizard loads card data, skips to Step 2 with card and printing pre-populated. Loading spinner shown during fetch.

### 5. List Another Flow

1. After successful publish, click "List Another Card" on success screen
2. **Expected:** Wizard resets to Step 1 with all state cleared

## Edge Cases

### Search with no results

1. Type a nonsensical string in the card search input
2. **Expected:** "No cards found" empty state in dropdown. No errors thrown.

### Search API failure

1. Disconnect customer-backend, type a search query
2. **Expected:** Error message displayed inline in search dropdown. Console shows `[listing-wizard] Card search failed:` with error details.

### Photo upload failure

1. Disconnect MinIO, attempt to upload a photo
2. **Expected:** Upload spinner shows, then error message appears on the photo zone. Console shows `[listing-wizard] Image upload failed:`.

### Listing creation failure

1. Disconnect backend, click "Publish Listing" on Step 3
2. **Expected:** Inline error message in wizard card. Console shows `[listing-wizard] Listing creation failed:`. Wizard stays on Step 3 (not reset).

### No market data available

1. List a card that has no pricing data in the catalog
2. **Expected:** "No market data available" fallback with "Set your own price" message. Price input is empty (no pre-fill). Competitive gauge hidden.

## Failure Signals

- Wizard does not render on `/sell/list-card` — check page.tsx imports ListingWizard, not old CardListingForm
- Search input does not trigger results — check customer-backend is running, `/api/catalog/cards/search` endpoint accessible
- Photos do not upload — check MinIO is running and accessible, `uploadListingImage` action configured
- Publish fails silently — check console for `[listing-wizard] Listing creation failed:` error
- Light-mode colors visible — Voltage compliance violation, check for bare Tailwind color classes

## Requirements Proved By This UAT

- R017 (3-step seller listing wizard) — Full wizard flow from identify through publish, market pricing pre-fill, photo upload, competitive gauge, pre-fill via SKU
- R024 (Voltage dark theme consistency) — partial: wizard components only

## Not Proven By This UAT

- R017 < 90 seconds completion time — not formally timed, but wizard flow is straightforward (3 steps, minimal required inputs)
- Listing visibility on card detail page — requires BFF pipeline to include the created listing in card detail responses (existing infrastructure, not new to S08)
- Multi-game listing — game code hardcoded to "MTG"; Pokémon/Yu-Gi-Oh!/One Piece not tested

## Notes for Tester

- The wizard uses Voltage CSS custom properties via inline styles (D009). If colors look wrong, check that `colors.css` is loaded and `.dark` class is on the root element.
- Condition grade thumbnails are placeholders (colored rectangles) — real grading guide images would be a polish improvement.
- Market price API endpoint may not exist in customer-backend yet — the fallback "Set your own price" state is the expected experience in that case.
- Compare against `docs/plans/wireframes/storefront-sell-list-card.html` at both 1440px (desktop) and 390px (mobile) viewport widths.
