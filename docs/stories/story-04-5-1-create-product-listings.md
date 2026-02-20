# Story 4.5.1: Create Product Listings

**Epic**: [epic-04-vendor-management.md](../epics/epic-04-vendor-management.md)
**Status**: done
**Domain**: Both
**Feature Branch**: `feature/story-4-5-1`

## User Story

_As a vendor, I want to create detailed product listings for my cards so that customers can find and purchase them._

## Acceptance Criteria

- (IMPLEMENTED) **AC1**: Vendors can access "Create Card Listing" from vendorpanel product list page
- (IMPLEMENTED) **AC2**: Card selection step searches customer-backend catalog API with card results showing images, set, game badge
- (IMPLEMENTED) **AC3**: On card selection, auto-populate listing details from catalog: card name, set, rarity, game, collector number, default images, market price reference
- (IMPLEMENTED) **AC4**: Listing form includes vendor-editable fields: condition grade (NM/LP/MP/HP/DMG), price with market price comparison, quantity, seller description/notes
- (IMPLEMENTED) **AC5**: Image upload supports vendor's own photos (max 10 images, 5MB each, JPG/PNG/WEBP) alongside catalog-provided default images
- (IMPLEMENTED) **AC6**: Real-time Zod validation of required fields (card selected, condition, price > 0, quantity > 0) with inline error messages
- (IMPLEMENTED) **AC7**: Preview pane shows how listing will appear to customers on storefront
- (IMPLEMENTED) **AC8**: Save as draft functionality using Medusa product `draft` status
- (IMPLEMENTED) **AC9**: Bulk mode: vendor can add multiple condition/price/quantity rows for the same card (each becomes a product variant)
- (IMPLEMENTED) **AC10**: Automatic SKU generation linking to catalog entries (format: `{game}-{set}-{number}-{condition}`)

## Implementation Notes

The listing creation interface is at `/products/create-listing` in vendorpanel (alongside existing `/products/create`). Uses RouteFocusModal + ProgressTabs wizard: Card Selection → Details → Images → Preview → Publish.

Vendorpanel calls customer-backend API directly for card search (`GET /cards/search`). Product creation uses existing `POST /vendor/products` with TCG metadata in variant.metadata. SKU auto-generated as `{catalog_sku}-{condition}-{lang}-{finish}`.

Split-brain: Card catalog in sidedecked-db (customer-backend). Products in mercur-db (backend). No direct DB connection — API integration only.

## Tasks

### Task 1: Backend — Extend product variant schema with optional TCG fields
- [ ] 1.1: Add optional `catalog_sku`, `condition`, `language`, `finish` fields to `CreateProductVariant` Zod schema in validators.ts
- [ ] 1.2: In POST `/vendor/products` route, when `catalog_sku` is provided on a variant, auto-generate SKU as `{catalog_sku}-{condition}-{language}-{finish}` and merge TCG fields into variant.metadata
- [ ] 1.3: Write unit tests for schema validation and SKU generation logic

### Task 2: Vendorpanel — Add customer-backend API client and catalog hooks
- [ ] 2.1: Add `VITE_CUSTOMER_BACKEND_URL` to .env.template and vite config
- [ ] 2.2: Create `src/lib/client/customer-backend.ts` with fetch wrapper for customer-backend API
- [ ] 2.3: Create `src/hooks/api/catalog.tsx` with `useCardSearch(query)` and `useCatalogSku(sku)` hooks using TanStack Query

### Task 3: Vendorpanel — Create CardSelector component (AC2, AC3)
- [ ] 3.1: Create `src/routes/products/product-create-listing/components/card-selector/card-selector.tsx`
- [ ] 3.2: Debounced search input calling `useCardSearch()`, displaying card results with images, set, game badge
- [ ] 3.3: On card selection, populate form fields with catalog data (name, set, rarity, game, images, market price)

### Task 4: Vendorpanel — Create ListingDetailsForm component (AC4, AC6)
- [ ] 4.1: Create `src/routes/products/product-create-listing/components/listing-details-form/listing-details-form.tsx`
- [ ] 4.2: Condition grade dropdown (NM/LP/MP/HP/DMG), price input with market price badge, quantity input, seller notes textarea
- [ ] 4.3: Auto-populated read-only fields: card name, set, rarity, game
- [ ] 4.4: Zod validation: condition required, price > 0, quantity > 0

### Task 5: Vendorpanel — Create ListingImages component (AC5)
- [ ] 5.1: Create `src/routes/products/product-create-listing/components/listing-images/listing-images.tsx`
- [ ] 5.2: Display catalog-provided default images (from card selection)
- [ ] 5.3: Allow vendor to add own photos using existing UploadMediaFormItem component

### Task 6: Vendorpanel — Create ListingPreview component (AC7)
- [ ] 6.1: Create `src/routes/products/product-create-listing/components/listing-preview/listing-preview.tsx`
- [ ] 6.2: Render storefront-style product card preview with card image, name, condition, price, seller info

### Task 7: Vendorpanel — Create BulkListing component (AC9)
- [ ] 7.1: Create `src/routes/products/product-create-listing/components/bulk-listing/bulk-listing.tsx`
- [ ] 7.2: Add/remove rows for same card with different condition/price/quantity
- [ ] 7.3: Each row maps to a product variant on submission

### Task 8: Vendorpanel — Create main wizard page and form schema (AC1, AC8, AC10)
- [ ] 8.1: Create Zod schema `CardListingSchema` in `src/routes/products/product-create-listing/constants.ts`
- [ ] 8.2: Create `src/routes/products/product-create-listing/product-create-listing.tsx` — RouteFocusModal + ProgressTabs wizard
- [ ] 8.3: Submit handler: transform form data → call `useCreateProduct()` with TCG metadata, auto-generated SKU, draft/published status
- [ ] 8.4: SKU auto-generation: `{game}-{set}-{number}-{condition}` format

### Task 9: Vendorpanel — Add route and navigation (AC1)
- [ ] 9.1: Add `create-listing` route to `route-map.tsx` under `/products` path
- [ ] 9.2: Add "Create Card Listing" button to `product-list-table.tsx` alongside existing "Create" button

### Task 10: Quality gate
- [ ] 10.1: Run `npm run lint && npm run typecheck && npm run build` in vendorpanel
- [ ] 10.2: Run `npm run lint && npm run typecheck && npm run build` in backend
- [ ] 10.3: Run tests in all affected repos
