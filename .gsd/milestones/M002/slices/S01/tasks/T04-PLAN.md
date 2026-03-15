---
estimated_steps: 10
estimated_files: 5
---

# T04: Backend Bulk Import Confirm Route — Listing Creation via createProductsWorkflow

**Slice:** S01 — CSV Inventory Import & Catalog Matching
**Milestone:** M002

## Why

The confirm route is the split-brain boundary — it reads match results (sourced from sidedecked-db via customer-backend) and creates real Medusa products (in mercur-db via `createProductsWorkflow`). This is separated from T03 because it has distinct complexity: understanding the workflow's input shape, handling partial failures with skip-and-report, and correctly building product data (options, variants, prices, images, metadata). Getting this wrong means bad data in the marketplace.

## What

- `POST .../confirm` route calling `createProductsWorkflow` per confirmed card
- Skip-and-report partial failure handling
- Full product creation with correct structure: title, handle, condition option, variant with price, images, `catalog_sku` metadata, seller linkage

## Steps

1. Read the working listing creation endpoint for the exact `createProductsWorkflow` input shape:
   - `backend/apps/backend/src/api/store/consumer-seller/listings/route.ts` — the proven pattern
   - `backend/apps/backend/src/api/store/consumer-seller/validators.ts` — the `StoreCreateConsumerSellerListing` Zod schema
2. Define the confirm request Zod validator at `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/confirm/validators.ts`:
   ```typescript
   const ConfirmItemSchema = z.object({
     inputName: z.string(),
     catalogSku: z.string(),          // CatalogSKU.sku string
     cardName: z.string(),            // for product title
     setName: z.string().optional(),  // for subtitle/metadata
     collectorNumber: z.string().optional(),
     imageUrl: z.string().url().optional(),
     condition: z.enum(['NM', 'LP', 'MP', 'HP', 'DMG']),
     price: z.number().int().positive(),  // in cents
     quantity: z.number().int().min(1).max(10).default(1),
     language: z.string().default('EN'),
     finish: z.string().default('NORMAL'),
   })
   
   const BulkImportConfirmSchema = z.object({
     confirmedItems: z.array(ConfirmItemSchema).min(1),
   })
   ```
3. Build `POST .../[importId]/confirm/route.ts`:
   - Verify import exists, belongs to seller, and phase is `matched`
   - Update phase to `confirming`
   - Resolve seller via `fetchConsumerSellerByCustomerId(customerId, req.scope)` — same pattern as listings route
   - Resolve required Medusa infrastructure: `query` for linking, `salesChannelId` for default channel, `regionId` for pricing
4. For each confirmed item, build `createProductsWorkflow` input matching the listings route pattern:
   ```typescript
   {
     products: [{
       title: item.cardName,
       handle: toHandle(item.cardName) + `-${item.catalogSku}`,
       status: ProductStatus.PUBLISHED,
       options: [{ title: 'Condition', values: [item.condition] }],
       variants: [{
         title: `${item.cardName} - ${item.condition}`,
         options: { Condition: item.condition },
         manage_inventory: false,
         prices: [{ amount: item.price, currency_code: 'usd' }],
         metadata: {
           catalog_sku: item.catalogSku,
           language: item.language,
           finish: item.finish,
         },
       }],
       images: item.imageUrl ? [{ url: item.imageUrl }] : [],
       metadata: {
         catalog_sku: item.catalogSku,
         set_name: item.setName,
         collector_number: item.collectorNumber,
       },
     }],
     additional_data: { seller_id: seller.id },
   }
   ```
5. Process confirmed items in sequential batches of 10 with skip-and-report:
   - For each item: try `createProductsWorkflow(container).run({ input })` 
   - Success → record `{ inputName, catalogSku, productId, variantId, status: 'created' }`
   - Failure → catch error, record `{ inputName, catalogSku, error: error.message, status: 'failed' }`
   - Log each creation with timing for observability
6. After all items processed, build results summary:
   ```typescript
   {
     importId,
     summary: { created: N, failed: N, skipped: N, total: N },
     details: [ ...individual results ],
   }
   ```
7. Update import state: phase → `completed`, store confirm results
8. Handle edge cases:
   - Empty `confirmedItems` array → return error
   - Import already confirmed → return error (phase check)
   - Seller not found → 404
   - All items fail → still return results with `summary.created: 0`
9. Run typecheck and build: `cd backend && npm run typecheck && npm run build`
10. Verify the route is reachable by checking MedusaJS route registration (file-based routing)

## Files

- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/confirm/route.ts` — new: confirm endpoint
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/[importId]/confirm/validators.ts` — new: confirm Zod schema
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/import-state.ts` — update: add confirm results to ImportState type
- `backend/apps/backend/src/api/vendor/consumer-seller/bulk-import/middlewares.ts` — update: add confirm route middleware if needed

## Verification

- `cd backend && npm run typecheck` — no type errors
- `cd backend && npm run build` — builds cleanly
- Code review: confirm route input matches `createProductsWorkflow` input shape exactly (compare with `/store/consumer-seller/listings/route.ts`)

## Done When

- Confirm route calls `createProductsWorkflow` with the correct product structure (title, handle, options, variants with prices, images, metadata with `catalog_sku`, `seller_id` in additional_data)
- Partial failures are caught per-item and recorded (not thrown to crash the batch)
- Results summary includes `{created, failed, skipped}` counts with per-item details
- Import state updated to `completed` phase with results
- Phase guard prevents double-confirm
- `npm run typecheck && npm run build` succeeds
