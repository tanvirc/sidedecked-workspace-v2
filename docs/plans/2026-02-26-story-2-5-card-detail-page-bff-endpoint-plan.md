# Story 2.5: Card Detail Page (BFF Endpoint) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Wire the card detail page to a BFF endpoint that aggregates catalog data, active listings, and trust scores from two backends into a single response, with circuit-breaker graceful degradation.

**Story:** `story-2-5-card-detail-page-bff-endpoint` — `_bmad-output/implementation-artifacts/story-2-5-card-detail-page-bff-endpoint.md`

**Domain:** Frontend (storefront) + customer-backend (batch trust endpoint)

**Repos:** storefront/, customer-backend/ (verify/add batch trust), backend/ (verify metadata filter)

**Deployment:** `true` — new storefront API route and component changes are user-facing; customer-backend may need redeployment for batch trust endpoint

**UX Wireframe:** `_bmad-output/planning-artifacts/ux-story-2-5-card-detail-page-bff-endpoint-wireframe.html`

---

## Requirements Brief (from Phase 2)

**Clarified acceptance criteria:**
- **AC1:** BFF at `storefront/src/app/api/cards/[id]/route.ts` aggregates three parallel calls via `Promise.allSettled`: catalog (customer-backend:7000), listings (backend:9001), trust batch (customer-backend:7000). Catalog failure = hard error (404). Listings/trust failure = graceful degrade.
- **AC2:** Card image (full-bleed, `onError` → placeholder), game-specific attributes via `GameStatsDisplay`, set info, format legality via `FormatLegalityGrid`, listings sorted price-asc then NM→LP→MP→HP→DMG.
- **AC3:** Seller rows show name, trust signal `"99.2% positive · 412 sales"` (if trust data available — omit line entirely if unavailable), condition chip, price, shipping estimate, "Add to Cart" button (enabled, triggers `sonner` toast — Epic 5 stub).
- **AC4:** Backend (listings) timeout/error → `listingsUnavailable: true` in BFF response → `MarketplaceListingsSection` shows: "Seller listings are temporarily unavailable — check back in a few minutes." with retry CTA.
- **AC5:** `CompactPrintingsTable` receives `currentPrintId` prop → highlights selected print row. Print selection is client-side state only (URL unchanged). `selectedPrint` change triggers listings re-fetch via `useEffect`.

**Business rules:**
- Empty listings (`listings: []`, `listingsUnavailable: false`) → distinct empty state UI, NOT the degraded banner
- Auth-aware empty state: authenticated → disabled "Notify me" stub; unauthenticated → "Sign in to get notified"
- Trust enrichment uses single batch call, NOT N individual calls
- Listings paginate at 20 rows client-side when `listings.length > 20`
- `catalogSku` constructed from `${game.code}-${set.code}-${print.collectorNumber}` after catalog fetch
- `LISTINGS_TIMEOUT_MS` must be injectable for tests: `process.env.NODE_ENV === 'test' ? 100 : 3000`

---

## Technical Design (from Phase 3)

**BFF placement:** storefront Next.js 15 API route — confirmed by `docs/architecture/06-integration-architecture.md` "Storefront BFF" boundary.

**Data flow:**
```
page.tsx (Server, ISR revalidate:30)
  → GET /api/cards/[id]  (BFF route, internal)
    → Promise.allSettled([
        GET customer-backend:7000/api/cards/:id/details      (revalidate:300)
        GET backend:9001/store/products?metadata[catalog_sku]=:sku  (revalidate:30)
        POST customer-backend:7000/api/sellers/trust/batch   (revalidate:30)
      ])
  ← CardDetailBFFResponse { card, listings, listingsUnavailable, trustScores }
→ CardDetailPage (Client Component) receives merged props
```

**Domain routing:** storefront only accesses both backends via HTTP from BFF — zero direct DB connections.

**Key new files:**
- `storefront/src/types/bff.ts` — `BackendListing`, `CardDetailBFFResponse` interfaces
- `storefront/src/lib/services/cardDetailBFF.ts` — BFF service with circuit breaker
- `storefront/src/app/api/cards/[id]/route.ts` — Next.js 15 route handler
- `customer-backend/src/routes/sellers.ts` — `POST /api/sellers/trust/batch` (if not exists)

**Known risks:**
1. MedusaJS `GET /store/products?metadata[catalog_sku]=...` — may need custom route if metadata filtering unsupported. Verify first in Task 4.
2. Batch trust endpoint may not exist yet in customer-backend — Task 4c creates it if absent.

---

## Task 1: Define BFF TypeScript interfaces [AC1, AC3]

**Files:**
- CREATE `storefront/src/types/bff.ts`

**Steps (TDD):**
1. Write test: `storefront/src/types/bff.test.ts` — type assertion tests confirming `CardDetailBFFResponse` shape (use `satisfies` operator). Verify fail.
2. Create `storefront/src/types/bff.ts`:
   ```typescript
   export interface BackendListing {
     id: string
     catalogSku: string
     condition: 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'
     language: string
     finish: string
     price: number          // integer, cents
     currency: string       // 'usd'
     quantity: number
     shippingMethod: string
     sellerId: string
     sellerName: string
     sellerType: 'consumer' | 'business'
     sellerRating?: number       // e.g. 99.2 — undefined if trust unavailable
     sellerReviewCount?: number  // e.g. 412 — undefined if trust unavailable
     shippingCost?: number       // integer, cents
     shippingLocation?: string
   }

   export interface CardDetailBFFResponse {
     card: Card & {
       prints: Print[]
       sets: CardSet[]
       legality: Record<string, boolean>
     }
     listings: BackendListing[]
     listingsUnavailable: boolean
   }
   ```
3. Run tests. Verify pass.
4. Commit: `feat(storefront): add BFF TypeScript interfaces for card detail`

---

## Task 2: Create BFF service with circuit breaker [AC1, AC4]

**Files:**
- CREATE `storefront/src/lib/services/cardDetailBFF.ts`
- CREATE `storefront/src/lib/services/cardDetailBFF.test.ts`

**Steps (TDD):**
1. Write test file first — using Vitest + MSW. Tests must cover:
   - Successful aggregation: catalog + listings + trust all return data
   - Listings timeout: backend times out → `listingsUnavailable: true`, catalog data present
   - Backend 500 error: → `listingsUnavailable: true`
   - Catalog 404: → throws `CardNotFoundError`
   - Trust batch failure: → listings present but `sellerRating`/`sellerReviewCount` undefined
   - Batch trust call uses deduplicated seller IDs (not N calls)
   MSW handlers: mock `http://localhost:7000/api/cards/:id/details`, `http://localhost:9001/store/products`, `http://localhost:7000/api/sellers/trust/batch`
2. Verify all tests fail.
3. Implement `cardDetailBFF.ts`:
   ```typescript
   const LISTINGS_TIMEOUT_MS = process.env.NODE_ENV === 'test' ? 100 : 3000

   export async function fetchCardDetailBFF(cardId: string, catalogSkuOverride?: string): Promise<CardDetailBFFResponse>
   // Internal helpers:
   async function fetchCatalog(cardId: string): Promise<CatalogData>
   async function fetchListingsWithFallback(catalogSku: string): Promise<{ listings: BackendListing[], unavailable: boolean }>
   async function fetchTrustBatch(sellerIds: string[]): Promise<Record<string, TrustData>>
   function buildCatalogSku(card: CatalogData): string  // ${game.code}-${set.code}-${print.collectorNumber}
   function mergeListingsWithTrust(listings: RawListing[], trust: Record<string, TrustData>): BackendListing[]
   function sortListings(listings: BackendListing[]): BackendListing[]  // price asc, then NM>LP>MP>HP>DMG
   ```
4. Run tests. Fix until all pass.
5. Run `npm run lint && npm run typecheck` in storefront/.
6. Commit: `feat(storefront): add card detail BFF service with circuit breaker`

---

## Task 3: Create BFF API route handler [AC1]

**Files:**
- CREATE `storefront/src/app/api/cards/[id]/route.ts`
- CREATE `storefront/src/app/api/cards/[id]/route.test.ts`

**Steps (TDD):**
1. Write route handler tests:
   - `GET /api/cards/abc123` → 200 with `CardDetailBFFResponse`
   - `GET /api/cards/abc123?catalogSku=MTG-MKM-242` → calls BFF with SKU override (skip catalog re-fetch)
   - Card not found → 404 `{ success: false, error: { code: 'NOT_FOUND' } }`
   - Unexpected error → 500 `{ success: false, error: { code: 'INTERNAL_ERROR' } }`
2. Verify fail.
3. Implement route using Next.js 15 pattern:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   export async function GET(req: NextRequest, { params }: { params: { id: string } }) { ... }
   ```
   Route reads optional `catalogSku` from `req.nextUrl.searchParams`.
4. Run tests, fix until pass.
5. Commit: `feat(storefront): add /api/cards/[id] BFF route handler`

---

## Task 4: Verify/create backend listings and trust endpoints [AC1, AC3]

**Files (conditional):**
- VERIFY `backend/` — `GET /store/products?metadata[catalog_sku]=:sku` filter support
- CREATE/MODIFY `customer-backend/src/routes/sellers.ts` (or new `trust.ts`) — `POST /api/sellers/trust/batch`

**Steps:**
1. **Verify backend metadata filter:**
   - Check if `GET /store/products` in `backend/apps/backend/src/api/store/products/` supports `metadata[catalog_sku]` filtering
   - If supported natively by MedusaJS query: confirm with a `curl` or unit test. Done.
   - If NOT supported: create `backend/apps/backend/src/api/store/products/route.ts` with custom query using `productModuleService.listProducts({ metadata: { catalog_sku } })`
   - Write unit test covering metadata filter query
2. **Verify/create batch trust endpoint in customer-backend:**
   - Search `customer-backend/src/routes/` for existing sellers endpoint
   - Check if `POST /api/sellers/trust/batch` exists; if not, create it:
     ```typescript
     // POST /api/sellers/trust/batch
     // Body: { sellerIds: string[] }
     // Response: { data: Record<string, { rating: number, reviewCount: number }> }
     router.post('/api/sellers/trust/batch', async (req, res) => {
       const { sellerIds } = req.body
       const uniqueIds = [...new Set(sellerIds)]
       // Query SellerRating / SellerReview entities for these seller IDs
       // Return map keyed by sellerId
     })
     ```
   - Write unit test for batch endpoint: valid IDs, empty array, unknown IDs (return empty map, no error)
3. Run quality gate in each affected repo: `npm run lint && npm run typecheck && npm run build && npm test`
4. Commit: `feat(customer-backend): add POST /api/sellers/trust/batch endpoint` (if created)
   Commit: `feat(backend): add catalog_sku metadata filter to store products route` (if created)

---

## Task 5: Wire page.tsx and data layer to BFF [AC1, AC2]

**Files:**
- MODIFY `storefront/src/lib/data/cards.ts` — add `getCardDetailsBFF()`
- MODIFY `storefront/src/app/[locale]/(main)/cards/[id]/page.tsx` — use BFF data
- ADD tests to `storefront/src/lib/data/cards.test.ts` (if exists) or create it

**Steps (TDD):**
1. Write tests for `getCardDetailsBFF(cardId)`:
   - Returns `CardDetailBFFResponse` on success
   - Propagates 404 correctly (Next.js `notFound()`)
   - MSW mocks `/api/cards/:id` BFF route
2. Verify fail.
3. Add `getCardDetailsBFF(cardId: string): Promise<CardDetailBFFResponse>` to `storefront/src/lib/data/cards.ts`
   - Calls `/api/cards/${cardId}` (internal route — use absolute URL in SSR: `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/api/cards/${cardId}`)
   - On 404: call `notFound()`
4. Update `page.tsx` to call `getCardDetailsBFF()` and pass `listings`, `listingsUnavailable` props to `CardDetailPage`
5. Add `export const revalidate = 30` to `page.tsx` route segment config
6. Run tests. Fix until pass.
7. Commit: `feat(storefront): wire card detail page to BFF data layer`

---

## Task 6: Update CardDetailPage and listings components [AC2, AC3, AC4, AC5]

**Files:**
- MODIFY `storefront/src/components/cards/CardDetailPage.tsx`
- MODIFY `storefront/src/components/cards/MarketplaceListingsSection.tsx`
- MODIFY `storefront/src/components/cards/MarketplaceListingsTable.tsx`
- MODIFY `storefront/src/components/cards/CompactPrintingsTable.tsx`

**Steps (TDD):**
1. Write component tests first (Vitest + React Testing Library):
   - `CardDetailPage` renders listings when `listings` prop provided
   - `CardDetailPage` triggers listings re-fetch when `selectedPrint` changes
   - `MarketplaceListingsSection` renders degradation banner when `listingsUnavailable: true`
   - `MarketplaceListingsSection` renders empty state when `listings.length === 0` and `!listingsUnavailable`
   - `MarketplaceListingsTable` renders correct seller row anatomy (name, trust, condition, price, shipping, Add to Cart)
   - Trust line is omitted when `sellerRating` is `undefined`
   - "Add to Cart" button calls `sonner` toast on click (NOT `disabled`)
   - Listings paginate at 20 rows
   - `CompactPrintingsTable` highlights row matching `currentPrintId`
   - ARIA: Add to Cart buttons have descriptive `aria-label`
2. Verify all fail.
3. Implement changes:
   - `CardDetailPage`: add `listings?: BackendListing[]`, `listingsUnavailable?: boolean` props; `useEffect` watching `selectedPrint?.id` to re-fetch listings via `/api/cards/:id?catalogSku=:sku`
   - `MarketplaceListingsSection`: accept `listingsUnavailable` prop; show degradation banner or empty state accordingly
   - `MarketplaceListingsTable`: accept `listings?: BackendListing[]`; remove `mockListings`; render real data; pagination logic for >20 rows; trust line conditional; Add to Cart → `toast('Cart coming soon...')`; `aria-label` on every button
   - `CompactPrintingsTable`: accept `currentPrintId?: string`; highlight matching row; keyboard nav (↑/↓/Enter)
4. Run tests. Fix until all pass.
5. Run `npm run lint && npm run typecheck` in storefront/.
6. Commit: `feat(storefront): replace mock listings with real BFF data in card detail page`

---

## Task 7: Validation and quality gate [All ACs]

**Steps:**
1. Run full quality gate in each affected repo:
   ```bash
   cd storefront && npm run lint && npm run typecheck && npm run build && npm test
   cd customer-backend && npm run lint && npm run typecheck && npm run build && npm test
   cd backend && npm run lint && npm run typecheck && npm run build && npm run test:unit
   ```
2. Run coverage report:
   ```bash
   cd storefront && npm run test:coverage
   ```
   Coverage must be >80% on all new/modified files.
3. Manual verification (local dev environment):
   - Navigate to `/cards/:id` — confirm catalog renders, listings appear from backend
   - Stop backend service — confirm degradation banner appears, catalog still renders
   - Click different printing — confirm listings re-fetch for new catalogSku
   - Confirm no mock data remains in `MarketplaceListingsTable`
4. Update story file: mark all ACs as `(IMPLEMENTED)`
5. Update sprint-status.yaml: `2-5-card-detail-page-bff-endpoint: done`
6. Final commit: `docs(storefront): mark story 2-5 acceptance criteria as implemented`
