---
estimated_steps: 5
estimated_files: 9
---

# T04: Vendor panel bulk import UI

**Slice:** S01 — CSV Inventory Import & Catalog Matching
**Milestone:** M002

## Description

Build the vendor panel bulk import UI — a 3-step wizard (Upload → Review → Confirm) that lets business sellers upload CSV files, review fuzzy matches, resolve unmatched cards, and create listings. Uses existing vendor panel components (FileUpload, tables, tabs, badges) and TanStack Query for API communication. Client-side CSV parsing with papaparse gives instant format feedback before server upload.

## Steps

1. Create `lib/csv-parser.ts` — a browser-side CSV parser using papaparse. Implements the same format detection logic as T01's server-side parser (marker column detection for TCGPlayer/Crystal Commerce/manual). Exports `parseCSVPreview(file: File): Promise<{ format, headers, preview: first10Rows[], totalRows, errors[] }>` for instant client feedback. Write unit tests in `__tests__/csv-parser.spec.ts` covering format detection and preview generation.
2. Build `components/csv-upload-step.tsx` — file drop zone using existing `FileUpload` component, accepts `.csv` files. On file select: parse with `parseCSVPreview()`, display detected format (badge), show preview table of first 10 rows with column headers. Show validation errors if any. Include "Upload & Start Matching" button that sends CSV text to `POST /vendor/consumer-seller/bulk-import/upload` and then triggers `POST .../match`. Use `useMutation` from TanStack Query.
3. Build `components/match-review-step.tsx` — polls `GET .../results` (or uses data from match mutation). Three tabs (Auto-matched / Needs Review / Unmatched) with count badges. **Auto tab**: read-only table of automatically matched cards (card name → matched card name, set, similarity %). **Fuzzy tab**: editable table — each row shows the CSV card name, a dropdown of match candidates with similarity scores, and a "confirm match" checkbox. If no candidate fits, seller can type in the search box (calls `GET /api/catalog/cards/search`) to find the right card. **Unmatched tab**: shows cards with no candidates — seller can search manually or skip. "Confirm All & Create Listings" button enabled when all fuzzy matches are resolved (confirmed or skipped).
4. Build `components/confirm-step.tsx` — summary showing counts (X auto-matched, Y manually confirmed, Z skipped). Lists all cards to be listed with card name, set, condition, quantity, price. "Create Listings" button triggers `POST .../confirm` with confirmed card list. Shows progress bar during creation. On completion: success/partial/failure message with counts and any per-card errors.
5. Build the wizard shell in `product-bulk-import.tsx` — step indicator (Upload → Review → Confirm), state management with `useState` for current step and import data. Register route in `route-map.tsx` at path `bulk-import` under `/products` children (after the `create-listing` route). Add breadcrumb: Products > Bulk Import. Write review step component tests in `__tests__/bulk-import-review.spec.tsx` verifying tab rendering, match selection, and confirm button state.

## Must-Haves

- [ ] Client-side CSV parser detects format and shows preview before upload
- [ ] File upload step uses existing FileUpload component
- [ ] Match review has three tabs with count badges (Auto/Fuzzy/Unmatched)
- [ ] Fuzzy tab shows match candidates with similarity % and selection dropdown
- [ ] Unmatched tab has manual card search
- [ ] Confirm step creates listings and shows progress/results
- [ ] Route registered at `/products/bulk-import` in vendor panel router
- [ ] Client CSV parser tests pass
- [ ] Review component tests pass

## Verification

- `cd vendorpanel && npm test -- --testPathPattern="csv-parser|bulk-import"` — all tests pass
- `cd vendorpanel && npx tsc --noEmit` — compiles cleanly
- Route renders when navigating to `/products/bulk-import` in dev mode

## Inputs

- T03's backend bulk-import API routes (upload, match, results, confirm)
- T02's fuzzy-match API for manual card search in unmatched tab
- Existing vendor panel components: `FileUpload` (vendorpanel/src/components/common/file-upload), `@medusajs/ui` for Table, Tabs, Badge, Button, ProgressBar
- Existing vendor panel test patterns (see `product-create-listing/__tests__/bulk-listing.spec.tsx`)
- Existing route registration pattern in `route-map.tsx` (line ~228, products section)
- D037: CSV import lives in vendor panel, not storefront

## Expected Output

- `vendorpanel/src/routes/products/product-bulk-import/index.ts` — route export
- `vendorpanel/src/routes/products/product-bulk-import/product-bulk-import.tsx` — wizard shell
- `vendorpanel/src/routes/products/product-bulk-import/components/csv-upload-step.tsx`
- `vendorpanel/src/routes/products/product-bulk-import/components/match-review-step.tsx`
- `vendorpanel/src/routes/products/product-bulk-import/components/confirm-step.tsx`
- `vendorpanel/src/routes/products/product-bulk-import/lib/csv-parser.ts`
- `vendorpanel/src/routes/products/product-bulk-import/__tests__/csv-parser.spec.ts`
- `vendorpanel/src/routes/products/product-bulk-import/__tests__/bulk-import-review.spec.tsx`
- `vendorpanel/src/providers/router-provider/route-map.tsx` — route added
