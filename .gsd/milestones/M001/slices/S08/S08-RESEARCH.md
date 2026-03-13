# S08: 3-Step Seller Listing Wizard — Research

**Date:** 2026-03-14

## Summary

S08 replaces the existing single-page `CardListingForm` (a flat form with all fields visible at once) with a 3-step wizard matching the `storefront-sell-list-card.html` wireframe. The wireframe specifies three distinct steps: **Identify** (card search + printing selector), **Condition + Photos** (game-specific grading, front/back photo upload to MinIO), and **Price + Confirm** (market pricing pre-fill, competitive gauge, shipping config, listing summary).

The backend is already fully built. The `POST /store/consumer-seller/listings` endpoint accepts all necessary fields (catalog_sku, condition, language, finish, price, quantity, title, description, images, shipping_method, status) and creates a MedusaJS product via `createProductsWorkflow`. The `POST /store/consumer-seller/uploads` endpoint handles file uploads via `uploadFilesWorkflow`. Both endpoints work with the existing `seller-dashboard.ts` data functions (`createSellerListing`, `uploadListingImage`). The card detail BFF pipeline (`/store/cards/listings?catalog_sku=...`) already queries by variant metadata `catalog_sku`, so listings created via the wizard will appear on card detail pages automatically.

The primary work is **purely frontend**: decomposing the flat form into a wizard with step navigation, building the wireframe-matching UI components (progress indicator, search results dropdown, printing grid, condition grid with visual thumbnails, dual photo upload zones, market price cards, competitive gauge, shipping options, and confirmation summary), and wiring card search for Step 1.

## Recommendation

Build a new `ListingWizard` component that owns the 3-step state machine. Each step is a separate component (`WizardStepIdentify`, `WizardStepCondition`, `WizardStepPrice`) receiving wizard state via props/callbacks. Reuse the existing `seller-dashboard.ts` data functions for submission and uploads — don't rebuild the backend integration layer.

For card search in Step 1, use the customer-backend `/api/catalog/cards/search?q=...` endpoint directly rather than Algolia. Reason: (1) the wizard needs card ID + prints + set data which the catalog API already returns, (2) Algolia search is optimized for browsing with facets, not for identifying a specific card for listing, (3) the existing `CardListingForm` already follows this pattern (fetches from `NEXT_PUBLIC_CUSTOMER_BACKEND_URL`). When a card is selected, fetch its prints from `/api/cards/:id/details` to populate the printing selector.

For market pricing in Step 3, use the existing `/api/catalog/sku/:gameCode/:setCode/:collectorNumber/prices` endpoint which returns per-condition prices with low/market/high ranges — exactly what the wireframe's market price cards need.

The existing `ConditionGuide` component can be evolved into the wireframe's `ConditionGradeSelector` (horizontal card-based layout with visual thumbnails instead of the current vertical list). The existing `ListingSuccessScreen` can be reused with minor Voltage styling adjustments.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Listing creation API call | `createSellerListing()` in `seller-dashboard.ts` | Already handles auth headers, SDK client, error handling. Accepts all fields the wizard needs. |
| Image upload | `uploadListingImage()` in `seller-dashboard.ts` | Already handles FormData, auth, and returns MinIO URL. |
| Condition codes/types | `ConditionGuide` + `ConditionCode` type in `seller/ConditionGuide.tsx` | Condition codes, labels, descriptions, and color mapping already defined. Extend rather than rebuild. |
| Success screen | `ListingSuccessScreen` in `seller/ListingSuccessScreen.tsx` | Shows listing summary, "View Listing" / "List Another" / "Close" actions. Already Voltage-styled. |
| Fee structure | `FeeCalculator` in `seller/FeeCalculator.tsx` | Platform fee + Stripe fee breakdown. Could embed in Step 3 confirmation. |
| Card search API | `GET /api/catalog/cards/search?q=...` in customer-backend | Returns card with game, prints, sets, images. Already used by CardListingForm. |
| Market pricing API | `GET /api/catalog/sku/:game/:set/:num/prices` in customer-backend | Returns per-condition prices with market/low/high ranges. Designed for listing form use. |
| SKU data API | `GET /api/catalog/sku/:sku` in customer-backend | Returns full card + pricing data by SKU. Used for pre-fill when arriving from "Sell This Card". |
| Backend validators | `StoreCreateConsumerSellerListing` Zod schema | Defines the exact contract: required fields, value ranges, enum values. |

## Existing Code and Patterns

- `storefront/src/app/[locale]/(main)/sell/list-card/page.tsx` — 33-line page stub. Server component that checks auth and renders `CardListingForm`. Will be updated to render `ListingWizard` instead.
- `storefront/src/components/seller/CardListingForm.tsx` — 340-line flat form (all-in-one). Contains all the state management and API calls but wrong UX shape. Source of field definitions, validation logic, and API integration patterns to extract from.
- `storefront/src/components/seller/ConditionGuide.tsx` — Condition selector with full and compact modes. Uses inline styles for Voltage token colors (rgba-based). Already has `role="radiogroup"` accessibility. Needs redesign to match wireframe's horizontal card-based layout with visual thumbnails.
- `storefront/src/components/seller/ListingSuccessScreen.tsx` — Post-listing success view. Already Voltage-styled (`bg-surface-1`, `text-positive`, etc.). Can be used as-is or lightly modified.
- `storefront/src/components/seller/FeeCalculator.tsx` — Fee breakdown component. Fetches fee structure from backend. Could embed in Step 3.
- `storefront/src/lib/data/seller-dashboard.ts` — Server actions for listing CRUD, image upload, dashboard stats. All the backend integration we need.
- `storefront/src/components/sellers/SellThisCardButton.tsx` — 250+ line inline listing form in a modal. Contains duplicate logic of `CardListingForm`. Has `fetchMarketPrice` pattern. Wizard should replace this flow too.
- `storefront/src/components/cards/BuySection.tsx` — Has "Sell This Card" button that calls `onSellCard` (navigates to `/sell/list-card`). Will need to pass card data as query params or state.
- `storefront/src/components/search/SearchCommandPalette.tsx` — Algolia-powered search with autocomplete. Pattern reference for search UI, but wizard should use catalog API instead.
- `docs/plans/wireframes/storefront-sell-list-card.html` — **Authoritative design target**. Shows desktop (3 steps × 1440px) and mobile (Step 1 × 390px). Key visual elements: wizard progress dots with connectors, `wizard-card` containers, search results dropdown, printing grid, condition grid with thumbnails, dual photo zones, market price triptych, competitive gauge bar, shipping option cards, confirmation summary.

## Constraints

- **Backend contract is fixed.** The `POST /store/consumer-seller/listings` endpoint expects exactly: `catalog_sku`, `condition`, `language`, `finish`, `price` (cents), `quantity`, `title`, `description`, `images` (URL array), `shipping_method`, `status`. The wizard must build this payload from its 3-step flow.
- **`catalog_sku` format** is `{GAME}-{SET}-{NUMBER}-{LANG}-{CONDITION}-{FINISH}` (e.g., `MTG-MH2-138-EN-NM-NORMAL`). The wizard must construct this from the user's selections.
- **Images are uploaded to MinIO** via the backend's `uploadFilesWorkflow`. The `uploadListingImage` function already handles this. Max 6 images per listing (validator constraint). Front + back = 2 images for individual sellers.
- **Price is in cents.** The wizard's price input shows dollars but must convert to cents for the API.
- **Seller auth is required.** The page already checks `retrieveCustomer()` and redirects unauthenticated users. The wizard should also check seller status (upgraded) before proceeding.
- **Voltage tokens via inline styles** (D009). All new components must use CSS custom properties, not Tailwind color utilities for custom tokens.
- **Wireframe shows both desktop and mobile.** Desktop: 720px max-width wizard container, horizontal step progress. Mobile: same steps with stacked layouts, single-column printing grid, single-column market prices, stacked wizard actions.
- **The `sell/list-card` page wrapper was already Voltage-aligned in S07** (D027). Only the page container/heading were aligned; wizard internals are greenfield S08 work.

## Common Pitfalls

- **Wizard state loss on navigation.** If a user clicks browser back during the wizard, all state is lost. Use `useState` in the parent `ListingWizard` component (not URL-based steps) to avoid complexity. The wizard is a single-page-app experience within the page. Don't fight the router.
- **Search debouncing.** The card search in Step 1 must debounce input to avoid hammering the catalog API on every keystroke. Use 300ms debounce. The existing `CardListingForm` does no debouncing — this is a gap.
- **Image upload before form submission.** Photos are uploaded in Step 2 but the listing isn't created until Step 3. Upload images immediately on selection in Step 2, store the returned URLs, and include them in the final submission payload. Don't defer upload to submission time — it would make Step 3 "Publish" feel slow.
- **Market price pre-fill requires game/set/number.** The `/api/catalog/sku/:game/:set/:num/prices` endpoint needs all three. If the user hasn't selected a printing yet (no set/number), Step 3 can't pre-fill prices. The wizard should enforce printing selection in Step 1 before allowing "Continue".
- **Condition thumbnails are game-specific** per Story 4.3, but no actual condition photo assets exist. Use placeholder thumbnails (same as wireframe's `condition-thumb` empty boxes) for MVP. The structure should support real images per game when they're created.
- **Duplicate SellThisCardButton components.** There are two versions: `components/cards/SellThisCardButton.tsx` and `components/sellers/SellThisCardButton.tsx`. Both contain inline listing logic. The wizard should replace both flows — "Sell This Card" from a card detail page should navigate to `/sell/list-card?cardId=X` with pre-fill.
- **Price below market warning** (Story 4.4: >50% below average). The competitive gauge bar handles this visually, but also add a text warning for accessibility.

## Open Risks

- **No real market pricing data may exist.** If the catalog has no `MarketPrice` records for the card being listed, the pricing section in Step 3 will have nothing to pre-fill. Need a graceful fallback: show "No market data available — set your own price" instead of empty cards.
- **Customer-backend card search may not be running** in dev. The wizard's Step 1 depends on the catalog API being available. If it's down, the entire wizard is blocked. Need error handling and a clear message.
- **Mobile wireframe only shows Step 1.** Steps 2 and 3 mobile layouts are inferred from the CSS overrides in the wireframe (`.mobile-frame` rules for `condition-grid`, `photo-uploads`, `market-prices`, `shipping-options`, `wizard-actions`). Follow these rules exactly.
- **"Sell This Card" pre-fill flow** needs design decision: when user clicks "Sell This Card" on a card detail page, should it navigate to the wizard with card pre-filled (skip Step 1) or pre-fill Step 1 and let user confirm? Story 4.2 says "skip directly to Step 2" when arriving from card detail. This means the wizard needs a `prefillCard` prop that, when provided, starts at Step 2.
- **No game-specific condition photo examples exist** (Story 4.3 specifies MTG-specific wear patterns, YGO-specific patterns, etc.). For MVP, use generic condition descriptions with placeholder thumbnails. Flag for future enhancement.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| MedusaJS | `medusajs/medusa-agent-skills@building-with-medusa` (781 installs) | available — relevant for understanding product creation workflow if backend changes needed |
| MedusaJS | `medusajs/medusa-agent-skills@storefront-best-practices` (690 installs) | available — relevant for storefront data fetching patterns |
| Next.js | already in available_skills list (bmad agents) | installed (via BMAD) |

Note: Backend work is not expected for S08 (existing endpoints are sufficient), so MedusaJS skills are optional. The primary work is frontend component building.

## Sources

- `docs/plans/wireframes/storefront-sell-list-card.html` — wireframe design target (3 desktop frames + 1 mobile frame)
- `_bmad-output/planning-artifacts/epics.md` — Stories 4.2, 4.3, 4.4 for acceptance criteria
- `backend/apps/backend/src/api/store/consumer-seller/validators.ts` — backend contract (Zod schema)
- `backend/apps/backend/src/api/store/consumer-seller/listings/route.ts` — listing creation endpoint (POST)
- `backend/apps/backend/src/api/store/consumer-seller/uploads/route.ts` — image upload endpoint
- `backend/apps/backend/src/api/store/cards/listings/route.ts` — public listings query by catalog_sku (confirms BFF pipeline)
- `customer-backend/src/routes/catalog.ts` — card search API + SKU pricing API
- `storefront/src/components/seller/CardListingForm.tsx` — existing flat form to decompose
- `storefront/src/components/seller/ConditionGuide.tsx` — existing condition selector to evolve
- `storefront/src/lib/data/seller-dashboard.ts` — existing data functions to reuse
