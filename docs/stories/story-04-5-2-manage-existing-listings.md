# Story 4.5.2: Manage Existing Listings

**Epic**: [epic-04-vendor-management.md](../epics/epic-04-vendor-management.md)
**Status**: review
**Domain**: Both
**Feature Branch**: `feature/story-4-5-2`

## User Story

_As a vendor, I want to edit, pause, or delete my product listings so that I can manage my inventory effectively._

## Acceptance Criteria

- (IMPLEMENTED) **AC1**: Vendors can view all listings in the existing product list page with TCG-specific filters (game code filter with MTG/POKEMON/YUGIOH/OPTCG) and new columns (Game badge, Condition from variant metadata)
- (IMPLEMENTED) **AC2**: Edit functionality via existing RouteDrawer-based product edit modal (already present in codebase), accessible from row action menu
- (IMPLEMENTED) **AC3**: Bulk operations: row selection with checkboxes, CommandBar with bulk pause (sets selected to draft) and bulk delete (with confirmation dialog)
- (IMPLEMENTED) **AC4**: Pause/unpause listings via row action menu using useUpdateProductStatus hook (pause=draft, unpause=proposed) with toast confirmation
- (IMPLEMENTED) **AC5**: Delete listings with confirmation dialog showing listing name and "cannot be undone" warning
- (IMPLEMENTED) **AC7**: Listing status indicators using ProductStatusCell with color-coded status: published=green, draft=grey, proposed=orange, rejected=red
- (IMPLEMENTED) **AC9**: Quick actions in each row: pause/unpause (context-dependent), edit, delete via ActionMenu

## Deferred (out of scope)

- ~~AC6 (Performance metrics)~~ - Deferred to Epic 4.1.x analytics stories
- ~~AC8 (Change history)~~ - Deferred to future audit infrastructure story

## Dev Notes

### Architecture Context
- **Split-brain**: Products in mercur-db (backend/). Card catalog in sidedecked-db (customer-backend/). No direct DB connections.
- **Pause mechanism**: Set product status to `draft` (removes from storefront). Unpause sets to `proposed` (triggers re-approval if REQUIRE_PRODUCT_APPROVAL enabled).
- **No new API endpoints**: Uses existing vendor product API: `POST /vendor/products/{id}` (update), `POST /vendor/products/{id}/status` (status change), `DELETE /vendor/products/{id}` (delete).
- **No new DB entities**: Uses existing Medusa product model with statuses: draft, proposed, published, rejected.

### Vendorpanel Patterns
- Test framework: Vitest 3.0.5 + React Testing Library + jsdom
- Existing tests in `src/routes/products/product-create-listing/__tests__/`
- Mutation hooks: `useMutation` with `queryClient.invalidateQueries` pattern
- Table: `_DataTable` with `@tanstack/react-table`, columns from `use-product-table-columns.tsx`
- Filters: `use-product-table-filters.tsx` with multi-select pattern
- Actions: `ActionMenu` component with grouped actions, `usePrompt()` for confirmation
- Modals: `RouteFocusModal` for create-listing wizard pattern
- No inline editing exists — all edits use separate routes/modals

### Key Files
- `src/hooks/api/products.tsx` — product API hooks (useProducts, useCreateProduct, useDeleteProduct, useUpdateProduct)
- `src/hooks/table/columns/use-product-table-columns.tsx` — table column definitions
- `src/hooks/table/filters/use-product-table-filters.tsx` — table filter definitions
- `src/routes/products/product-list/components/product-list-table/product-list-table.tsx` — product list table component
- `src/routes/products/product-create-listing/` — TCG listing creation wizard (reuse for edit)
- `src/providers/router-provider/route-map.tsx` — route definitions

## Tasks

### Task 1: Add useUpdateProductStatus hook (AC4) - DONE
- [x] 1.1: Added `useUpdateProductStatus(id)` hook to `src/hooks/api/products.tsx`
- [x] 1.2: Tests in `src/hooks/api/__tests__/products.spec.ts` (2 tests)

### Task 2: Enhance product table columns with TCG data (AC1, AC7) - DONE
- [x] 2.1: Created `ConditionCell` in `src/components/table/table-cells/product/condition-cell/`
- [x] 2.2: Created `GameBadgeCell` in `src/components/table/table-cells/product/game-badge-cell/`
- [x] 2.3: ProductStatusCell already has color-coded status (green/grey/orange/red) — no changes needed
- [x] 2.4: Added Game and Condition columns to `use-product-table-columns.tsx`
- [x] 2.5: Tests in `src/components/table/table-cells/product/__tests__/tcg-cells.spec.tsx` (10 tests)

### Task 3: Enhance product table filters (AC1) - DONE
- [x] 3.1: Added `game_code` filter to `use-product-table-filters.tsx` with MTG/POKEMON/YUGIOH/OPTCG options
- [x] 3.2: Added `checkGameCodeMatch` helper with tests in `src/hooks/api/helpers/__tests__/productFilters.spec.ts` (6 tests)
- [x] 3.3: Wired game_code through query hook, products hook, and product-list-table

### Task 4: Add pause/unpause action to product list (AC4, AC9) - DONE
- [x] 4.1: Added Pause/Unpause actions to ProductActions based on product status
- [x] 4.2: Toast notifications on status change with product name

### Task 5: Delete confirmation (AC5) - DONE
- [x] 5.1: Existing delete confirmation already shows product name and "cannot be undone" warning

### Task 6: Edit listing (AC2) - DONE (existing)
- [x] 6.1: Existing `product-edit/` route with RouteDrawer-based edit form already handles this
- [x] 6.2: Edit action in row menu already links to `/products/{id}/edit`

### Task 7: Bulk operations (AC3) - DONE
- [x] 7.1: Enabled row selection with checkbox column in product table
- [x] 7.2: Used built-in CommandBar (from DataTableRoot) instead of custom BulkActionsBar
- [x] 7.3: Bulk pause iterates selected IDs, calls status API, invalidates queries
- [x] 7.4: Bulk delete with confirmation dialog, iterates selected IDs

### Task 8: Quality gate - DONE
- [x] 8.1: All ACs marked (IMPLEMENTED)
- [x] 8.2: Build passes, typecheck has only pre-existing errors (JSX in .ts file)
- [x] 8.3: All 60 tests pass (7 test files)

## Dev Agent Record

### Implementation Plan
TDD approach: RED (failing tests) → GREEN (minimal code) → REFACTOR for each task.

### Debug Log
- RTL cleanup not automatic in Vitest jsdom — added explicit `afterEach(() => cleanup())` to TCG cell tests
- i18n validation test checks translations against `$schema.json` — all new keys added to both files
- ESLint not configured in vendorpanel (no config file) — skipped lint check
- Typecheck has 3 pre-existing errors in `product-additional-attributes/helpers.ts` (JSX in .ts file) — not related to this story

### Completion Notes
- All 7 acceptance criteria implemented
- 60 tests pass across 7 test files (18 new tests added)
- Build passes successfully
- No new API endpoints required — used existing vendor product APIs
- Leveraged existing DataTableRoot CommandBar for bulk operations
- Leveraged existing product-edit RouteDrawer for edit functionality

## File List

**Created:**
- `src/hooks/api/__tests__/products.spec.ts` — useUpdateProductStatus tests
- `src/hooks/api/helpers/__tests__/productFilters.spec.ts` — checkGameCodeMatch tests
- `src/components/table/table-cells/product/__tests__/tcg-cells.spec.tsx` — ConditionCell + GameBadgeCell tests
- `src/components/table/table-cells/product/condition-cell/condition-cell.tsx` — Condition cell component
- `src/components/table/table-cells/product/condition-cell/index.ts` — barrel export
- `src/components/table/table-cells/product/game-badge-cell/game-badge-cell.tsx` — Game badge cell component
- `src/components/table/table-cells/product/game-badge-cell/index.ts` — barrel export

**Modified:**
- `src/hooks/api/products.tsx` — added useUpdateProductStatus hook, gameCode filter support
- `src/hooks/api/helpers/productFilters.ts` — added checkGameCodeMatch helper
- `src/hooks/table/columns/use-product-table-columns.tsx` — added Game + Condition columns
- `src/hooks/table/filters/use-product-table-filters.tsx` — added game_code filter
- `src/hooks/table/query/use-product-table-query.tsx` — added game_code URL param
- `src/routes/products/product-list/components/product-list-table/product-list-table.tsx` — pause/unpause actions, bulk ops, row selection
- `src/i18n/translations/en.json` — added pause/unpause/bulk/game/condition keys
- `src/i18n/translations/$schema.json` — added matching schema entries

## Change Log

- Task 1: Added `useUpdateProductStatus` hook + tests (2 tests)
- Task 2: Created ConditionCell + GameBadgeCell + wired to columns + tests (10 tests)
- Task 3: Added game_code filter through full stack + checkGameCodeMatch helper + tests (6 tests)
- Task 4: Added pause/unpause to ProductActions with toast notifications
- Task 5: Delete confirmation already adequate (shows title + warning)
- Task 6: Edit already exists via product-edit RouteDrawer
- Task 7: Added row selection + CommandBar bulk pause/delete
- Task 8: All ACs marked IMPLEMENTED, quality gate passed
