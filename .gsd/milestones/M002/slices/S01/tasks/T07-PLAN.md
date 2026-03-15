---
estimated_steps: 9
estimated_files: 5
---

# T07: Vendor Panel — Confirm Step + Listing Creation Progress

**Slice:** S01 — CSV Inventory Import & Catalog Matching
**Milestone:** M002

## Why

The confirm step closes the UI loop — it sends the seller's selections to the backend for listing creation and shows real-time progress and results. Without this, the wizard is a dead end. This task also wires all three steps together into the complete `ProgressTabs` flow and handles all error states the seller might encounter.

## What

- Confirm step with pre-submission summary and listing creation progress
- Results summary showing created/failed/skipped counts with details
- Full wizard flow wired end-to-end: upload → match (auto-triggered) → review → confirm → results
- Error state handling for all failure modes

## Steps

1. Read the existing product creation success UX for patterns:
   - `vendorpanel/src/routes/products/product-create-listing/product-create-listing.tsx` — how success is handled after creation (toast, redirect)
2. Build the confirm step at `vendorpanel/src/routes/products/product-bulk-import/components/confirm-step/confirm-step.tsx`:
   - Pre-submission summary view:
     - Cards to create: N (auto-matched + fuzzy resolved + manually matched)
     - Cards skipped: N
     - Breakdown by match type (auto/fuzzy/manual)
   - Default condition and price controls:
     - If CSV included condition data: show as pre-filled, allow override
     - If CSV didn't include condition: require seller to select default condition (NM/LP/MP/HP/DMG)
     - If CSV included price: show as pre-filled, allow override
     - If CSV didn't include price: require seller to enter default price
     - Per-card override option (expandable section) for sellers who want different prices per card
   - "Create Listings" button — calls `useBulkImportConfirm` mutation
   - Build the payload: for each confirmed card, include `{ inputName, catalogSku, cardName, setName, collectorNumber, imageUrl, condition, price, quantity, language, finish }`
   - During creation: show progress bar/indicator (based on backend response or polling `useBulkImportStatus`)
   - Disable "Create Listings" button during processing to prevent double-submit
3. Build the results summary at `vendorpanel/src/routes/products/product-bulk-import/components/confirm-step/results-summary.tsx`:
   - Success banner: "N listings created successfully"
   - Summary cards: Created (green), Failed (red), Skipped (gray) with counts
   - Failed items: expandable list showing card name + error message
   - Success state: "View your listings" link → navigate to products list
   - Partial failure state: "N listings created, M failed" with retry guidance
   - Complete failure state: "No listings could be created" with error details
4. Wire the complete wizard flow in `product-bulk-import.tsx`:
   - Upload step: file → client-side parse → upload to backend → receive importId
   - Auto-trigger match: after upload success, call `useBulkImportMatch` mutation automatically
   - Show matching progress/loading while match runs (use `useBulkImportStatus` polling or mutation pending state)
   - Review step: activated when match completes → seller reviews/confirms/searches
   - Confirm step: seller sees summary → clicks confirm → sees progress → sees results
   - Tab navigation: Upload → Review (auto after match) → Confirm (manual "Continue")
   - Tab state: completed/in-progress/not-started based on wizard progress
5. Implement error states throughout the wizard:
   - Upload errors: malformed CSV → "This file could not be parsed as a CSV. Please check the file format."
   - Upload errors: >5,000 rows → "CSV exceeds the maximum of 5,000 cards. Please split your file."
   - Upload errors: empty CSV → "No card data found in this file."
   - Match errors: customer-backend unreachable → "Matching service is temporarily unavailable. Please try again."
   - Match errors: all cards unmatched → show review step with warning banner (not an error — proceed to manual matching)
   - Confirm errors: server error → "Listing creation failed. Your import data is preserved — try again."
   - Active import warning: if seller has existing import → "You have an import in progress. Starting a new import will discard it."
6. Add toast notifications for key transitions:
   - Upload success: `toast.success("CSV uploaded: {N} cards detected ({format} format)")`
   - Match complete: `toast.success("Matching complete: {auto} auto-matched, {fuzzy} need review, {unmatched} unmatched")`
   - Confirm complete: `toast.success("Created {N} listings!")` or `toast.warning("Created {N} listings, {M} failed")`
7. Ensure the form resets on wizard close/completion (RouteFocusModal onClose)
8. Run typecheck and build: `cd vendorpanel && npm run typecheck && npm run build`
9. Visual spot-check: if dev server available, verify full wizard flow renders correctly

## Files

- `vendorpanel/src/routes/products/product-bulk-import/components/confirm-step/confirm-step.tsx` — new: confirm + progress
- `vendorpanel/src/routes/products/product-bulk-import/components/confirm-step/results-summary.tsx` — new: results display
- `vendorpanel/src/routes/products/product-bulk-import/product-bulk-import.tsx` — update: wire all steps, error states, auto-trigger match
- `vendorpanel/src/routes/products/product-bulk-import/constants.ts` — update: confirm step types

## Verification

- `cd vendorpanel && npm run typecheck` — no type errors
- `cd vendorpanel && npm run build` — builds cleanly
- Visual: full wizard flow navigable Upload → Review → Confirm → Results

## Done When

- Confirm step shows pre-submission summary with card counts and condition/price controls
- "Create Listings" button triggers confirm mutation and shows progress
- Results summary shows created/failed/skipped counts with details
- Full wizard flow works: upload → auto-match → review → confirm → results
- Error states display user-friendly messages for all failure modes (malformed CSV, >5000 rows, match failure, partial confirm failure)
- Toast notifications fire for key transitions
- `npm run typecheck && npm run build` succeeds
