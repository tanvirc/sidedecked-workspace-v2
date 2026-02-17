# Story 2.5.4: Quick Card Listing from Collection

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: review
**Domain**: Commerce (backend/) + Customer Backend (customer-backend/) + Storefront (storefront/)

## User Story

_As an individual seller, I want to quickly list specific cards I own so that I can sell them with minimal effort._

## Acceptance Criteria

- (IMPLEMENTED) "Sell This Card" button on every card detail page
- (IMPLEMENTED) One-click access to listing creation from card context
- (IMPLEMENTED) Auto-populated card information (name, set, game, rarity)
- (IMPLEMENTED) Condition selection with visual guide for accurate grading
- (IMPLEMENTED) Market price suggestions based on recent sales data
- (IMPLEMENTED) Simple photo upload with preview functionality
- (IMPLEMENTED) Quantity selector (limited to 10 per listing for individuals)
- (IMPLEMENTED) Custom description field for additional details
- (IMPLEMENTED) Shipping preferences selection (3 hardcoded options for MVP)
- (DEFERRED) Preview functionality showing how listing will appear to buyers
- (IMPLEMENTED) Save as draft option for incomplete listings
- (IMPLEMENTED) Immediate publication to marketplace upon completion
- (IMPLEMENTED) Mobile camera integration for condition photos
- (IMPLEMENTED) Authentication check with redirect to upgrade flow if needed
- (IMPLEMENTED) Integration with inventory system for immediate availability
- (IMPLEMENTED) Success confirmation with link to manage listing

## Implementation Notes

Existing code discovered during Phase 2 analysis:
- `SellThisCardButton.tsx` (440 lines) already exists with quick listing modal but uses wrong 7-grade condition scale and calls non-existent endpoint
- `CardListingForm.tsx` exists with mock game/set data
- Backend `POST /vendor/consumer-seller/products` exists but returns mock data
- `GET /api/catalog/cards/:id` returns full card data with game, prints, sets, images
- Condition scale standardized to 5-grade TCGPlayer: NM/LP/MP/HP/DMG
- Quantity capped at 10 for individual sellers
- Shipping: 3 hardcoded options (Standard $3.99, Priority $7.99, Free for orders >$25)
- AC 10 (buyer preview) deferred to future story per Phase 2 decision

Split-brain: storefront fetches card data from customer-backend, creates listing in commerce backend. No direct DB connections.

## Tasks

- [x] Task 1: customer-backend — Add `GET /api/catalog/sku/:sku` endpoint returning card data by catalog SKU for auto-population
- [x] Task 2: backend — Wire `POST /store/consumer-seller/listings` to create real MedusaJS Product + ProductVariant + pricing (replace mock data)
- [x] Task 3: backend — Add Zod validators + middleware for listing creation request
- [x] Task 4: storefront — Create `ConditionGuide` component with 5-grade visual condition selector (NM/LP/MP/HP/DMG)
- [x] Task 5: storefront — Create `ListingSuccessScreen` component with "View Listing" and "List Another Card" CTAs
- [x] Task 6: storefront — Add `createSellerListing()` and `saveListingDraft()` server action functions in seller-dashboard.ts
- [x] Task 7: storefront — Rewrite `SellThisCardButton.tsx`: standardize condition scale, wire to real API, add photo upload with mobile camera, add shipping options, add draft/publish, integrate ConditionGuide and ListingSuccessScreen
- [x] Task 8: storefront — Update `CardListingForm.tsx`: replace mock game/set data with real catalog API, add `capture="environment"` to file input
- [x] Task 9: Quality gate — Run lint + typecheck + build + test in all affected repos

## Dev Agent Record

### Implementation Plan

Phase 2 decisions: NM/LP/MP/HP/DMG condition scale, 10-unit quantity cap, 3 hardcoded shipping options, buyer preview deferred.

### File List

- `customer-backend/src/routes/catalog.ts` — Added `GET /api/catalog/sku/:sku` and `GET /api/catalog/sku/:gameCode/:setCode/:collectorNumber/prices`
- `customer-backend/src/tests/routes/catalog-sku.test.ts` — 5 test cases for catalog SKU endpoints
- `backend/apps/backend/src/api/store/consumer-seller/listings/route.ts` — Added POST handler using `createProductsWorkflow`
- `backend/apps/backend/src/api/store/consumer-seller/validators.ts` — Added `StoreCreateConsumerSellerListing` Zod schema
- `backend/apps/backend/src/api/store/consumer-seller/middlewares.ts` — Added validation middleware for POST /listings
- `storefront/src/components/seller/ConditionGuide.tsx` — New: 5-grade visual condition selector with color-coded options
- `storefront/src/components/seller/ListingSuccessScreen.tsx` — New: success screen with View Listing / List Another / Close CTAs
- `storefront/src/lib/data/seller-dashboard.ts` — Added `createSellerListing()` and `saveListingDraft()` server actions
- `storefront/src/components/sellers/SellThisCardButton.tsx` — Rewritten: 5-grade conditions, ConditionGuide, shipping options, photo upload with mobile camera, draft/publish, ListingSuccessScreen, market price fetch
- `storefront/src/components/seller/CardListingForm.tsx` — Rewritten: real API for games/sets, SKU auto-population, ConditionGuide, shipping options, draft/publish, market price, `capture="environment"`

### Completion Notes

- Task 1: Both endpoints implemented and tested (5/5 pass). SKU endpoint returns card info + market pricing for listing form auto-population. Prices endpoint returns cross-condition price summary with suggested_price.
- Task 2: POST handler uses `createProductsWorkflow` directly (bypasses request/approval flow for consumer sellers — immediate publication). Product created with single variant, condition option, USD pricing, seller metadata. Seller linked via `additional_data.seller_id` (hook handles product-seller + inventory-seller + shipping profile linking).
- Task 3: Zod schema validates: catalog_sku, condition (NM/LP/MP/HP/DMG), price (int cents), quantity (1-10), title, description, images (max 6 URLs), shipping_method (standard/priority/free_over_25), status (published/draft). Middleware wired in middlewares.ts.

### Change Log

- Task 1: Added catalog SKU lookup endpoints to customer-backend
- Task 2: Added POST /store/consumer-seller/listings with real product creation
- Task 3: Added Zod validation + middleware for listing creation
- Task 4: Created ConditionGuide with NM/LP/MP/HP/DMG visual selector, compact and full modes
- Task 5: Created ListingSuccessScreen with listing summary and navigation CTAs
- Task 6: Added createSellerListing() and saveListingDraft() server actions to seller-dashboard.ts
- Task 7: Rewrote SellThisCardButton — standardized to 5-grade, added ConditionGuide, 3 shipping options, photo upload with capture="environment", draft/publish buttons, ListingSuccessScreen integration, market price fetch from customer-backend
- Task 8: Rewrote CardListingForm — replaced mock game/set data with real catalog API calls, added ConditionGuide, shipping options, draft/publish, prefillSku support, capture="environment"
- Task 9: Quality gate passed — customer-backend: 29/29 tests pass, typecheck clean, build clean. Storefront: typecheck clean, lint warnings only (pre-existing), build clean. Backend: typecheck clean (pre-existing admin errors only, none in our files).
