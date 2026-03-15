---
estimated_steps: 11
estimated_files: 8
---

# T06: Vendor Panel — Review Step with Tabbed Match Results

**Slice:** S01 — CSV Inventory Import & Catalog Matching
**Milestone:** M002

## Why

The review step is the most complex UI in the wizard — three tabs with different interaction patterns (auto-approve, radio selection, inline search). This is where the seller's time is spent, and getting the UX right determines whether bulk import actually saves time vs. manual listing. Separating this from T05 (upload) keeps each task focused on one complex problem.

## What

- Review step component with three tabs: Auto-matched, Fuzzy (Review), Unmatched
- Auto-match tab with bulk "Approve all" action
- Fuzzy tab with top 5 candidates per card and radio selection
- Unmatched tab with inline catalog search and manual assignment
- Pagination at 25 per page per tab

## Steps

1. Read existing UI patterns for reference:
   - `vendorpanel/src/hooks/api/catalog.tsx` — `useCardSearch` hook for the unmatched tab's search feature
   - Medusa UI component library: `Tabs`, `RadioGroup`, `Table`, `Badge`, `Button`, `Input`
   - `vendorpanel/src/routes/products/product-create-listing/components/card-selector/card-selector.tsx` — existing card search/select UX
2. Build the review step container at `vendorpanel/src/routes/products/product-bulk-import/components/review-step/review-step.tsx`:
   - Fetch match results via `useBulkImportResults` hook (from T05)
   - Display tier counts in tab labels: "Auto-matched (2,040)" / "Review (240)" / "Unmatched (120)"
   - Three tabs using Medusa UI `Tabs` component
   - Each tab manages its own pagination state
   - Store all user selections in the parent form state (react-hook-form)
   - "Continue to Confirm" button enabled when all fuzzy matches are resolved (selected or moved to unmatched)
3. Build the auto-match tab at `vendorpanel/src/routes/products/product-bulk-import/components/review-step/auto-match-tab.tsx`:
   - Table display: seller's card name | matched catalog card | set | similarity % | small image
   - All rows pre-approved (checked)
   - "Approve All" button at top (default action — approves all auto-matches in one click)
   - Individual row toggle to "reject" (move to unmatched) if seller disagrees
   - Paginated at 25 per page with page controls
4. Build the reusable match card row component at `vendorpanel/src/routes/products/product-bulk-import/components/review-step/match-card-row.tsx`:
   - Displays: card image thumbnail (48px), card name, set name + collector number, similarity score badge
   - Used by both auto-match and fuzzy tabs to display candidates
5. Build the fuzzy match tab at `vendorpanel/src/routes/products/product-bulk-import/components/review-step/fuzzy-match-tab.tsx`:
   - For each fuzzy-matched card:
     - Header: seller's original card name (from CSV)
     - Up to 5 candidates displayed as a radio group
     - Each candidate: card image, card name, set, collector number, similarity % (using `match-card-row`)
     - Radio selection pre-selects the top candidate (highest similarity)
     - "None of these" radio option → moves card to unmatched tab
   - Paginated at 25 cards per page (each card with its candidates)
   - Selection stored in form state: `{ inputName → selectedCatalogSku }`
6. Build the unmatched tab at `vendorpanel/src/routes/products/product-bulk-import/components/review-step/unmatched-tab.tsx`:
   - For each unmatched card:
     - Display seller's card name
     - "Search" button/input that triggers inline catalog search
     - Search uses existing `useCardSearch` hook (debounced, hits customer-backend `/api/catalog/cards/search`)
     - Search results shown as selectable cards (click to assign match)
     - "Skip" button to explicitly skip this card
   - "Skip All Unmatched" bulk action button
   - Paginated at 25 per page
   - Selection stored in form state: `{ inputName → selectedCatalogSku | 'skipped' }`
7. Wire tab state together:
   - When a fuzzy card is moved to unmatched ("None of these"), it appears in the unmatched tab
   - When an auto-match is rejected, it moves to unmatched
   - When an unmatched card gets a manual match, it's marked resolved
   - Count displays update dynamically
8. Handle loading and empty states:
   - Loading: skeleton rows while results fetch
   - Empty auto-match: "No cards were auto-matched" with explanation
   - Empty fuzzy: "No cards need review — all matches are confident"
   - Empty unmatched: "All cards matched successfully"
   - All unmatched: warning banner "No automatic matches found. Search and assign matches manually or skip."
9. Handle the transition from upload → review:
   - After upload + match complete, the review step receives the importId
   - First render triggers `useBulkImportResults` fetch
   - Show loading state while results load
10. Run typecheck and build: `cd vendorpanel && npm run typecheck && npm run build`
11. Visual spot-check: if dev server available, verify tabs render with mock data

## Files

- `vendorpanel/src/routes/products/product-bulk-import/components/review-step/review-step.tsx` — new: review container with tabs
- `vendorpanel/src/routes/products/product-bulk-import/components/review-step/auto-match-tab.tsx` — new: auto-match table
- `vendorpanel/src/routes/products/product-bulk-import/components/review-step/fuzzy-match-tab.tsx` — new: fuzzy match with radio selection
- `vendorpanel/src/routes/products/product-bulk-import/components/review-step/unmatched-tab.tsx` — new: unmatched with search
- `vendorpanel/src/routes/products/product-bulk-import/components/review-step/match-card-row.tsx` — new: reusable candidate display
- `vendorpanel/src/routes/products/product-bulk-import/constants.ts` — update: add review step types to form schema
- `vendorpanel/src/routes/products/product-bulk-import/product-bulk-import.tsx` — update: wire review step into wizard

## Verification

- `cd vendorpanel && npm run typecheck` — no type errors
- `cd vendorpanel && npm run build` — builds cleanly
- Visual: all three tabs render, fuzzy tab shows radio groups, unmatched tab shows search input

## Done When

- Review step renders three tabs with correct count labels
- Auto-match tab shows pre-approved matches with "Approve All" action
- Fuzzy tab shows top 5 candidates per card with radio selection, pre-selects top match
- Unmatched tab shows inline search using `useCardSearch` hook with select/skip actions
- Pagination works at 25 per page across all tabs
- Cross-tab movement works (reject auto → unmatched, "none of these" fuzzy → unmatched)
- All selection state tracked in react-hook-form
- `npm run typecheck && npm run build` succeeds
