---
estimated_steps: 12
estimated_files: 10
---

# T05: Vendor Panel — CSV Upload Step with Client-Side Parsing

**Slice:** S01 — CSV Inventory Import & Catalog Matching
**Milestone:** M002

## Why

The upload step is the first UI the seller interacts with and sets up the entire wizard shell. Client-side CSV parsing with papaparse gives instant format detection and row count preview without a server round-trip, then uploads to the backend for server-side validation. This task also creates the TanStack Query hooks and route scaffolding that T06 and T07 depend on.

## What

- Bulk import route with `RouteFocusModal` + `ProgressTabs` wizard shell
- Upload step with drag-and-drop, client-side format detection, row count preview
- TanStack Query hooks for all bulk import API calls
- Extended `customerBackendFetch` with POST support (for future use)
- Bulk import upload function in client.ts

## Steps

1. Read existing wizard patterns for reference:
   - `vendorpanel/src/routes/products/product-create-listing/product-create-listing.tsx` — ProgressTabs + RouteFocusModal + react-hook-form pattern
   - `vendorpanel/src/routes/products/product-import/` — existing CSV import UI
   - `vendorpanel/src/components/common/file-upload/file-upload.tsx` — FileUpload component API
   - `vendorpanel/src/hooks/api/catalog.tsx` — TanStack Query hook patterns
   - `vendorpanel/src/lib/client/client.ts` — `importProductsQuery` for upload pattern
2. Install `papaparse` + `@types/papaparse` in `vendorpanel/package.json`
3. Add bulk import route to the vendorpanel router:
   - Route path: `/products/bulk-import`
   - Add to route config in the products route group (find the router configuration file)
4. Create constants and types at `vendorpanel/src/routes/products/product-bulk-import/constants.ts`:
   - `BulkImportFormSchema` (Zod) — wizard-level form state including file, parsed data, match results, confirmed items
   - `BulkImportFormType` — inferred from schema
   - `BULK_IMPORT_DEFAULTS` — initial form values
   - Tab enum: `Upload`, `Review`, `Confirm`
   - Types: `ParsedCardRow`, `MatchResult`, `ConfirmItem` (matching backend response shapes)
5. Create the wizard shell at `vendorpanel/src/routes/products/product-bulk-import/product-bulk-import.tsx`:
   - `RouteFocusModal` wrapping `ProgressTabs` with 3 tabs: Upload → Review → Confirm
   - `react-hook-form` with `zodResolver` for wizard state
   - Tab state management (same pattern as product-create-listing)
   - Forward/back navigation between tabs
   - `KeyboundForm` for keyboard shortcuts
6. Build upload step component at `vendorpanel/src/routes/products/product-bulk-import/components/upload-step/upload-step.tsx`:
   - Reuse existing `FileUpload` component with accept `.csv` only
   - On file drop/select:
     - Read file content with `FileReader`
     - Parse with papaparse client-side (`Papa.parse(content, { header: true, skipEmptyLines: true })`)
     - Detect format: check headers for `TCGplayer Id` → TCGPlayer, `Category` → Crystal Commerce, else manual
     - Count rows and validate ≤ 5,000 (show error if exceeded)
     - Show preview: detected format badge, row count, first 5 rows in a mini-table
   - "Continue" button: upload file to backend
   - Error states: invalid file type, empty file, >5,000 rows, parse errors
7. Create bulk import upload function in `vendorpanel/src/lib/client/client.ts`:
   ```typescript
   export const bulkImportUploadQuery = async (file: File) => {
     const formData = new FormData()
     formData.append('file', file)
     
     const bearer = typeof window !== "undefined" 
       ? await window.localStorage.getItem("medusa_auth_token") || "" : ""
     
     const response = await fetch(`${backendUrl}/vendor/consumer-seller/bulk-import/upload`, {
       method: 'POST',
       body: formData,
       headers: {
         authorization: `Bearer ${bearer}`,
         'x-publishable-api-key': publishableApiKey,
       },
     })
     
     if (!response.ok) throw new Error((await response.json()).message || 'Upload failed')
     return response.json()
   }
   ```
8. Create TanStack Query hooks at `vendorpanel/src/hooks/api/bulk-import.tsx`:
   - `useBulkImportUpload()` — mutation wrapping `bulkImportUploadQuery`
   - `useBulkImportMatch(importId)` — mutation: `POST .../match`
   - `useBulkImportResults(importId, { page, limit, tier })` — query: `GET .../results`
   - `useBulkImportStatus(importId)` — query: `GET .../status` (with polling option)
   - `useBulkImportConfirm(importId)` — mutation: `POST .../confirm`
   - Follow the pattern from existing hooks (query keys, error handling, invalidation)
   - Add query keys to `src/lib/query-key-factory.ts` if it exists, or use inline keys
9. Extend `vendorpanel/src/lib/client/customer-backend.ts` with POST support:
   ```typescript
   export async function customerBackendPost<T = unknown>(
     path: string,
     body: unknown
   ): Promise<T> {
     const url = `${customerBackendUrl}${path}`
     const response = await fetch(url, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(body),
     })
     if (!response.ok) throw new Error(`Customer backend error: ${response.status}`)
     return response.json()
   }
   ```
10. Wire the upload step into the wizard: on successful upload, store `importId` in form state, auto-trigger match mutation, advance to Review tab after match completes
11. Run typecheck and build: `cd vendorpanel && npm run typecheck && npm run build`
12. Visually verify (if dev server available): navigate to `/products/bulk-import`, see wizard with upload step

## Files

- `vendorpanel/package.json` — add papaparse + @types/papaparse
- `vendorpanel/src/routes/products/product-bulk-import/product-bulk-import.tsx` — new: wizard shell
- `vendorpanel/src/routes/products/product-bulk-import/constants.ts` — new: types, schema, defaults
- `vendorpanel/src/routes/products/product-bulk-import/components/upload-step/upload-step.tsx` — new: upload component
- `vendorpanel/src/hooks/api/bulk-import.tsx` — new: TanStack Query hooks
- `vendorpanel/src/lib/client/client.ts` — add `bulkImportUploadQuery`
- `vendorpanel/src/lib/client/customer-backend.ts` — add POST support
- Router config file — add `/products/bulk-import` route

## Verification

- `cd vendorpanel && npm run typecheck` — no type errors
- `cd vendorpanel && npm run build` — builds cleanly
- Visual: `/products/bulk-import` renders wizard with upload step, file drop zone, format detection preview

## Done When

- Bulk import wizard renders at `/products/bulk-import` with `ProgressTabs` (Upload/Review/Confirm)
- Upload step accepts CSV via drag-and-drop, detects format client-side, shows row count and preview
- 5,000-row limit enforced client-side with error message
- File uploads to backend via FormData POST
- All 5 TanStack Query hooks created and typed
- `customerBackendPost` utility available
- `npm run typecheck && npm run build` succeeds
