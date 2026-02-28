# Story 2.5: Card Detail Page (BFF Endpoint) — Implementation Plan v2 (v5.1 Layout)

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

> **Supersedes:** `docs/plans/2026-02-26-story-2-5-card-detail-page-bff-endpoint-plan.md`
> **Reason for redo:** Wireframe updated to v5.1 (3-column layout, new component structure) via multi-persona elicitation.

**Goal:** Wire the card detail page to a BFF endpoint that aggregates catalog data, active listings, and trust scores, then render them in a v5.1 3-column layout with a dedicated QuickBuyPanel, print browser filter strip, and legality/rulings in the center column.

**Story:** `story-2-5-card-detail-page-bff-endpoint` — `_bmad-output/implementation-artifacts/story-2-5-card-detail-page-bff-endpoint.md`

**Domain:** Frontend (storefront/) + customer-backend/ (batch trust) + backend/ (listings endpoint verification)

**Repos:** storefront/, customer-backend/ (verify/add batch trust), backend/ (verify listings endpoint)

**Deployment:** `true` — new storefront API route, new UI components, and layout changes are all user-facing.

**UX Wireframe:** `_bmad-output/planning-artifacts/ux-story-2-5-card-detail-page-bff-endpoint-wireframe.html` (v5.1)

---

## Requirements Brief (from Phase 2)

**Clarified acceptance criteria:**
- **AC1:** BFF at `storefront/src/app/api/cards/[id]/route.ts` aggregates three parallel calls via `Promise.allSettled`: catalog (customer-backend:7000), listings (backend:9001), trust batch (customer-backend:7000). Catalog failure = hard 404. Listings/trust failure = graceful degrade.
- **AC2:** v5.1 layout: left col (card image + oracle text + flavor text), center col (card identity → quick stats with colored legality pills → print browser → listings → legality grid → rulings accordion), right col (QuickBuyPanel → SaveSection → PriceInsightsSection). Listings sorted price-asc then NM→LP→MP→HP→DMG.
- **AC3:** Seller rows show name, trust signal "99.2% positive · 412 sales" (omit line if unavailable), condition chip, price, shipping estimate, "Add to Cart" button (enabled, triggers `sonner` toast — Epic 5 stub). QuickBuyPanel shows cheapest matching seller.
- **AC4:** Backend timeout/error → `listingsUnavailable: true` → `MarketplaceListingsSection` shows "Seller listings are temporarily unavailable — check back in a few minutes." with retry CTA.
- **AC5:** `CompactPrintingsTable` gets filter strip (All / Foil / Non-foil / Treatment▼ / Sort: Price↑ / Year↓) + artist name on second row per print. `currentPrintId` prop highlights selected row. Print selection is client-side state. Print change triggers QuickBuyPanel re-fetch.
- **AC6:** When user selects a print: (1) card image updates, (2) QuickBuyPanel updates to cheapest in-stock price for that print with condition chips (only in-stock active) and qty stepper, (3) listings section re-fetches for that print's catalogSku via `/api/cards/:id?catalogSku=:sku`. Last-settled response wins; QuickBuyPanel shows skeleton during re-fetch.
- **AC6a edge cases:** Zero stock print → "No listings for this print" + auth-aware "Notify me" stub. Disabled condition chips (not just visually dimmed — `disabled` attribute). Qty capped at `listing.quantity` with "Only N left" label. Race condition on rapid print switching → `AbortController` cancels prior in-flight fetch.

**Business rules:**
- Empty listings (`listings: []`, `listingsUnavailable: false`) → distinct empty state UI in `MarketplaceListingsSection`, NOT the degraded banner
- Auth-aware empty state: authenticated → disabled "Notify me" stub; unauthenticated → "Sign in to get notified"
- Trust enrichment uses single batch call, NOT N individual calls
- `LISTINGS_TIMEOUT_MS` injectable for tests: `process.env.NODE_ENV === 'test' ? 100 : 3000`
- `catalogSku` constructed from `${game.code}-${set.code}-${print.collectorNumber}`
- Listings paginate at 20 rows client-side when `listings.length > 20`
- QuickBuyPanel condition chips: disabled (not dimmed) when condition has zero stock across all listings for selected print
- Qty stepper: max = `listing.quantity` of cheapest listing for selected condition; show "Only N left" when available qty ≤ 4

**UX flows:**
- 3-column desktop grid: `260px 1fr 268px`, left + right columns sticky at `top: 68px`
- Mobile: single column, tab chip row (Card Info / Legality) surfacing oracle text and legality without scroll, sticky bottom action bar (condition chips + Add to Cart + Deck + Collection), min 44px touch targets
- Print browser filter strip: [All ▼] [Foil] [Non-foil] [Treatment ▼] Sort: [Price ↑] [Year ↓]
- Price Insights section: Low / Mid / High from aggregated listings (computed client-side), 30-day trend placeholder (↑/↓ + % label)
- Rulings accordion: collapsible, only rendered if `card.rulings` exists

---

## Technical Design (from Phase 3)

**BFF placement:** storefront Next.js 15 API route — confirmed by `docs/architecture/06-integration-architecture.md` "Storefront BFF" boundary.

**Data flow:**
```
page.tsx (Server Component, revalidate: 30s)
  → GET /api/cards/[id]  (BFF route, internal absolute URL)
    → fetchCardDetailBFF(cardId, catalogSkuOverride?)
      → Promise.allSettled([catalog, listings, trust])
  ← CardDetailBFFResponse { card, listings, listingsUnavailable }
→ CardDetailPage ("use client") receives props
    → QuickBuyPanel computes per-condition data from listings[]
    → On selectedPrint change:
        AbortController cancels prior fetch
        fetch('/api/cards/:id?catalogSku=:sku') → update currentListings
        QuickBuyPanel shows skeleton during fetch
```

**Domain routing:** storefront accesses both backends via HTTP from BFF route only — zero direct DB connections.

**Already implemented (do NOT re-implement):**
- `storefront/src/types/bff.ts` — `BackendListing`, `CardDetailBFFResponse`, `CONDITION_ORDER`
- `storefront/src/lib/services/cardDetailBFF.ts` — `fetchCardDetailBFF`, circuit breaker, trust batch

**Key new/modified files:**
| File | Action |
|---|---|
| `storefront/src/app/api/cards/[id]/route.ts` | CREATE — BFF route handler |
| `storefront/src/app/api/cards/[id]/route.test.ts` | CREATE — route handler tests |
| `storefront/src/lib/data/cards.ts` | MODIFY — add `getCardDetailsBFF()` |
| `storefront/src/components/cards/CardDetailPage.tsx` | MODIFY — v5.1 layout refactor |
| `storefront/src/components/cards/CompactPrintingsTable.tsx` | MODIFY — filter strip + artist name |
| `storefront/src/components/cards/MarketplaceListingsSection.tsx` | MODIFY — remove full-width wrapper, render inside center col |
| `storefront/src/components/cards/MarketplaceListingsTable.tsx` | MODIFY — sortable headers + cheapest row highlight |
| `storefront/src/components/cards/QuickBuyPanel.tsx` | CREATE — real listings data, condition chips, qty stepper, skeleton |
| `storefront/src/components/cards/QuickBuyPanel.test.tsx` | CREATE — component tests |
| `storefront/src/components/cards/SaveSection.tsx` | CREATE — Add to Deck + Add to Collection (Soon badges) |
| `storefront/src/components/cards/PriceInsightsSection.tsx` | CREATE — Low/Mid/High from listings |
| `storefront/src/components/cards/RulingsAccordion.tsx` | CREATE — collapsible rulings (renders only if card.rulings exists) |
| `storefront/src/styles/card-detail.module.css` | MODIFY — 3-col grid + mobile breakpoints |
| `customer-backend/src/routes/sellers.ts` | VERIFY/CREATE — POST /api/sellers/trust/batch |
| `backend/` listings endpoint | VERIFY/CREATE — GET /store/cards/listings?catalog_sku |

**Deployment:** `needs_deploy = true` — storefront changes are user-facing. customer-backend may need redeployment if batch trust endpoint is created.

---

## Task 1: Verify BFF types (already implemented — confirm only) [AC1]

**Files:**
- READ `storefront/src/types/bff.ts`
- READ `storefront/src/lib/services/cardDetailBFF.ts`

**Steps:**
1. Read both files to confirm they match the Technical Design (interfaces, service, `LISTINGS_TIMEOUT_MS`, `CardNotFoundError`).
2. If any interface is missing a required field (e.g., no `rulings` field on Card — expected, it's optional): note it, do not add speculatively.
3. If both files are correct: mark task done, no code changes.
4. If corrections needed: apply minimal fix, run `npm run typecheck` in storefront/, verify pass.

**No commit needed if no changes were made.**

---

## Task 2: Create BFF API route handler [AC1]

**Files:**
- CREATE `storefront/src/app/api/cards/[id]/route.ts`
- CREATE `storefront/src/app/api/cards/[id]/route.test.ts`

**Steps (TDD):**
1. Write `route.test.ts` first (Vitest, MSW handlers for catalog + listings + trust):
   - `GET /api/cards/abc123` → 200 with `CardDetailBFFResponse` shape
   - `GET /api/cards/abc123?catalogSku=MTG-MKM-242` → calls BFF with SKU override
   - Card not found → 404 `{ success: false, error: { code: 'NOT_FOUND' } }`
   - Unexpected error → 500 `{ success: false, error: { code: 'INTERNAL_ERROR' } }`
2. Run `npm test -- route.test.ts` in storefront/. Verify all fail.
3. Implement `route.ts` using Next.js 15 pattern:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   import { fetchCardDetailBFF, CardNotFoundError } from '@/lib/services/cardDetailBFF'

   export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
     const catalogSku = req.nextUrl.searchParams.get('catalogSku') ?? undefined
     try {
       const data = await fetchCardDetailBFF(params.id, catalogSku)
       return NextResponse.json(data)
     } catch (err) {
       if (err instanceof CardNotFoundError) {
         return NextResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 })
       }
       return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 })
     }
   }
   ```
4. Run tests. Fix until all pass.
5. Run `npm run lint && npm run typecheck` in storefront/.
6. Commit: `feat(storefront): add /api/cards/[id] BFF route handler`

---

## Task 3: Verify/create backend listings and trust endpoints [AC1, AC3]

**Files (conditional):**
- VERIFY `backend/` — `GET /store/cards/listings?catalog_sku=:sku`
- VERIFY/CREATE `customer-backend/src/routes/sellers.ts` — `POST /api/sellers/trust/batch`

**Steps:**
1. **Verify backend listings endpoint:**
   - Search `backend/apps/backend/src/api/store/` for a `cards/listings` route
   - The BFF service calls `${BACKEND_STORE_URL}/store/cards/listings?catalog_sku=${encodedSku}`
   - If route exists and returns `{ data: RawListing[] }`: confirm with a unit test. Done.
   - If NOT found: create `backend/apps/backend/src/api/store/cards/listings/route.ts` — query products by `metadata.catalog_sku`, return in `{ data: [] }` shape
   - Write unit test covering the catalog_sku filter query
2. **Verify/create batch trust endpoint in customer-backend:**
   - Search `customer-backend/src/routes/` for existing sellers/trust endpoint
   - Check if `POST /api/sellers/trust/batch` exists; if not, create it:
     ```typescript
     // POST /api/sellers/trust/batch
     // Body: { sellerIds: string[] }
     // Response: { data: Record<string, { rating: number, reviewCount: number }> }
     router.post('/api/sellers/trust/batch', async (req, res) => {
       const { sellerIds } = req.body
       const uniqueIds = [...new Set(sellerIds as string[])]
       // Query seller rating/review entities for these IDs
       // Return map keyed by sellerId; unknown IDs return empty map (no error)
     })
     ```
   - Write unit test: valid IDs, empty array, unknown IDs (empty map, no error)
3. Run quality gate in each affected repo: `npm run lint && npm run typecheck && npm run build && npm test`
4. Commit: `feat(customer-backend): add POST /api/sellers/trust/batch endpoint` (if created)
   Commit: `feat(backend): add GET /store/cards/listings endpoint` (if created)

---

## Task 4: Wire page.tsx and data layer to BFF [AC1, AC2]

**Files:**
- MODIFY `storefront/src/lib/data/cards.ts` — add `getCardDetailsBFF()`
- MODIFY `storefront/src/app/[locale]/(main)/cards/[id]/page.tsx` — use BFF data
- CREATE/MODIFY `storefront/src/lib/data/cards.test.ts`

**Steps (TDD):**
1. Write tests for `getCardDetailsBFF(cardId)`:
   - Returns `CardDetailBFFResponse` on success
   - Propagates 404 → calls Next.js `notFound()`
   - MSW mocks internal `/api/cards/:id` route
2. Verify tests fail.
3. Add to `storefront/src/lib/data/cards.ts`:
   ```typescript
   export async function getCardDetailsBFF(cardId: string): Promise<CardDetailBFFResponse> {
     const base = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3000'
     const res = await fetch(`${base}/api/cards/${cardId}`, { next: { revalidate: 30 } })
     if (res.status === 404) notFound()
     if (!res.ok) throw new Error(`BFF error: ${res.status}`)
     return res.json()
   }
   ```
4. Update `page.tsx`:
   - Call `getCardDetailsBFF(params.id)` instead of any previous catalog-only fetch
   - Pass `listings` and `listingsUnavailable` props to `CardDetailPage`
   - Add `export const revalidate = 30`
5. Run tests. Fix until pass.
6. Commit: `feat(storefront): wire card detail page to BFF data layer`

---

## Task 5: Create QuickBuyPanel component [AC3, AC6, AC6a]

**Files:**
- CREATE `storefront/src/components/cards/QuickBuyPanel.tsx`
- CREATE `storefront/src/components/cards/QuickBuyPanel.test.tsx`

**Steps (TDD):**
1. Write `QuickBuyPanel.test.tsx` first. Tests must cover:
   - Renders cheapest in-stock price from listings for selected condition
   - Condition chips show stock count badge (e.g., "3 in stock")
   - Condition chip is `disabled` (attribute, not just dimmed) when condition has zero stock
   - Qty stepper: max = cheapest listing's `quantity`, shows "Only N left" when ≤ 4
   - "Add to Cart" button triggers `sonner` toast (stub — Epic 5)
   - Skeleton renders when `isRefetching: true` prop passed
   - Zero stock for ALL conditions: renders "No listings for this print"
   - Authenticated user with zero stock: "Notify me" button is present (disabled stub)
   - Unauthenticated user with zero stock: "Sign in to get notified" link
   - Trust signal rendered when `sellerRating` present: "99.2% positive · 412 sales"
   - Trust signal line omitted entirely when `sellerRating` undefined
   - `aria-label` on Add to Cart with full context (card name, condition, price)
2. Verify all fail.
3. Implement `QuickBuyPanel.tsx`:
   ```typescript
   interface QuickBuyPanelProps {
     listings: BackendListing[]          // [] = no listings for this print
     listingsUnavailable: boolean        // backend degraded
     selectedPrint?: Print
     isRefetching: boolean               // skeleton state during re-fetch
     isAuthenticated: boolean
   }
   ```
   - Compute per-condition data: filter listings by condition, find min-price listing with qty > 0
   - `selectedCondition` state — default to first in-stock condition (NM → LP → MP → HP → DMG)
   - Price hero: cheapest listing for selectedCondition (formatted: "From $2.49")
   - Seller info row: `{sellerName}` + (trust if available: `{rating}% positive · {reviewCount} sales`)
   - Condition chips: stock count badge, `disabled` attribute when no in-stock listings for that condition
   - Qty stepper: `Math.min(qty, maxAvailable)`, shows "Only N left" when maxAvailable ≤ 4
   - Skeleton: when `isRefetching` → show pulsing skeleton for price hero, condition chips, and Add to Cart
   - Zero-stock all-conditions: "No listings for this print" + auth-aware Notify me stub
   - Print reference label: `"{set.code} · #{print.number}"` above price hero
   - Mobile: this component is rendered in the sticky bottom action bar on mobile
4. Run tests. Fix until all pass.
5. Run `npm run lint && npm run typecheck` in storefront/.
6. Commit: `feat(storefront): add QuickBuyPanel component with real listing data`

---

## Task 6: Create SaveSection, PriceInsightsSection, RulingsAccordion [AC2]

**Files:**
- CREATE `storefront/src/components/cards/SaveSection.tsx`
- CREATE `storefront/src/components/cards/PriceInsightsSection.tsx`
- CREATE `storefront/src/components/cards/RulingsAccordion.tsx`

**Steps (TDD):**
1. Write tests for all three components:
   - `SaveSection`: "Add to Deck" button renders with "Soon" badge; "Add to Collection" button renders with "Soon" badge; both are non-functional stubs (no onClick side effects); renders `selectedCondition` label from prop
   - `PriceInsightsSection`: with `listings=[...]` → computes Low, Mid, High correctly; with empty `listings=[]` → shows "No price data yet"; trend indicator renders (placeholder ↑/↓ stub)
   - `RulingsAccordion`: renders nothing when `rulings` prop is undefined or empty array; renders accordion items when `rulings` provided; keyboard accessible (Enter/Space to toggle)
2. Verify all fail.
3. Implement:
   - `SaveSection.tsx`: two secondary buttons with "Soon" chip badge, receive `selectedCondition` prop for display only
   - `PriceInsightsSection.tsx`:
     ```typescript
     interface PriceInsightsProps { listings: BackendListing[] }
     // Compute: low = min price, high = max price, mid = median price (from listings)
     // Trend: placeholder only — "↑ +--% · 30d" in muted color with tooltip "Coming soon"
     ```
   - `RulingsAccordion.tsx`: standard `<details>/<summary>` pattern or CSS-based accordion; only renders if `rulings` prop is non-empty array
4. Run tests. Fix until all pass.
5. Run `npm run lint && npm run typecheck` in storefront/.
6. Commit: `feat(storefront): add SaveSection, PriceInsightsSection, and RulingsAccordion components`

---

## Task 7: Update CompactPrintingsTable [AC5]

**Files:**
- MODIFY `storefront/src/components/cards/CompactPrintingsTable.tsx`

**Steps (TDD):**
1. Write tests:
   - Filter strip renders with [All] [Foil] [Non-foil] [Treatment▼] filter chips and [Price↑] [Year↓] sort controls
   - "Foil" filter: only prints where `print.finish` is not "Normal" shown
   - "Non-foil" filter: only prints where `print.finish === 'Normal'` shown
   - Sort by Year↓: prints ordered by `releaseDate` descending
   - Sort by Price↑: prints ordered by `cheapestPrice` ascending (accept `cheapestPrice?: number` prop per print)
   - Artist name renders on second row: "Artist: J. Murray" (only when `print.artist` present)
   - `currentPrintId` prop highlights the matching row (existing behavior — confirm retained)
   - Keyboard nav: ↑/↓ arrow keys move focus between rows, Enter selects
   - "Show N more prints" overflow: first 5 shown by default, "Show 3 more" button appears if > 5
2. Verify all fail.
3. Implement changes:
   - Add `activeFilter: 'all' | 'foil' | 'nonfoil'` and `treatmentFilter: string` state
   - Add `sortBy: 'default' | 'price-asc' | 'year-desc'` state
   - Add filter strip UI above the print list
   - Add `artist` second-row text inside each print row (below set name)
   - Update row layout to accommodate artist (currently 6-col grid — add artist as second text line, not new col)
   - Add `showAll` state for overflow; default collapsed to 5 items
   - Keyboard nav: `onKeyDown` handler on each row for ↑/↓/Enter
   - Remove tooltip (hover popup already exists — keep it, no change needed)
4. Run tests. Fix until all pass.
5. Run `npm run lint && npm run typecheck` in storefront/.
6. Commit: `feat(storefront): update CompactPrintingsTable with filter strip and artist name`

---

## Task 8: Update MarketplaceListingsTable [AC2, AC3]

**Files:**
- MODIFY `storefront/src/components/cards/MarketplaceListingsTable.tsx`
- MODIFY `storefront/src/components/cards/MarketplaceListingsTable.test.tsx` (if exists)

**Steps (TDD):**
1. Write/update tests:
   - Sortable header click: clicking "Price" sorts ascending; clicking again sorts descending
   - Sortable header click: "Condition" sorts by CONDITION_ORDER; "Rating" sorts by sellerRating descending
   - Cheapest row (lowest price across all listings): highlighted with distinct background + "Best price" badge
   - Pagination: 20 rows shown by default; "Show more" / page controls appear when > 20 listings
   - Real `BackendListing[]` data only — no mock data in component
   - Trust line omitted when `sellerRating` undefined
   - "Add to Cart" button per row triggers `sonner` toast (stub — not disabled)
   - ARIA: each "Add to Cart" has descriptive `aria-label`
2. Verify fail on any currently-missing behavior.
3. Implement:
   - Add `sortColumn: 'price' | 'condition' | 'rating'` and `sortDir: 'asc' | 'desc'` state
   - Sortable column headers with visual sort indicators (↑/↓)
   - Cheapest row detection: `listings.reduce((min, l) => l.price < min.price ? l : min)`
   - Highlight cheapest row: distinct background + "Best price" badge
   - Remove any remaining mock data
4. Run tests. Fix until all pass.
5. Run `npm run lint && npm run typecheck` in storefront/.
6. Commit: `feat(storefront): update MarketplaceListingsTable with sortable headers and cheapest row highlight`

---

## Task 9: CardDetailPage v5.1 layout refactor [AC2, AC4, AC5, AC6, AC6a]

**Files:**
- MODIFY `storefront/src/components/cards/CardDetailPage.tsx`
- MODIFY `storefront/src/styles/card-detail.module.css`

**Steps (TDD):**
1. Write component-level tests:
   - Desktop grid: `grid-cols-[260px_1fr_268px]` class applied on desktop breakpoint
   - Left column renders: card image + oracle text section + flavor text section
   - Center column renders (in order): card identity row → quick stats bar → CompactPrintingsTable → MarketplaceListingsSection → FormatLegalityGrid → RulingsAccordion
   - Quick stats bar: legality shown as colored pills (not comma string) — `●Legal` in green, `✕Banned` in red
   - Right column renders: QuickBuyPanel → SaveSection → PriceInsightsSection (all sticky)
   - `selectedPrint` change triggers listings re-fetch (AbortController pattern)
   - During re-fetch: `isRefetching: true` passed to QuickBuyPanel
   - Race condition: if two re-fetches start rapidly, only last-settled result updates state
   - Mobile: tab chip row renders "Card Info" and "Legality" chips; clicking Legality tab shows FormatLegalityGrid; clicking Card Info shows oracle text
   - Mobile: sticky bottom bar renders with condition chips + Add to Cart + Deck + Collection
   - `BuySection` is NO LONGER rendered — removed
2. Verify all fail.
3. Implement `CardDetailPage.tsx`:
   - Replace `BuySection` with `QuickBuyPanel` (pass `listings`, `listingsUnavailable`, `isRefetching`, `isAuthenticated`)
   - Add `currentListings` state (initialized from BFF `listings` prop)
   - Add `isRefetching` state
   - `useEffect` watching `selectedPrint?.id`:
     ```typescript
     const abortRef = useRef<AbortController | null>(null)
     useEffect(() => {
       if (!selectedPrint || !card.id) return
       if (selectedPrint.id === card.prints?.[0]?.id && currentListings === listings) return
       abortRef.current?.abort()
       const controller = new AbortController()
       abortRef.current = controller
       setIsRefetching(true)
       fetch(`/api/cards/${card.id}?catalogSku=${catalogSku}`, { signal: controller.signal })
         .then(r => r.json())
         .then(data => { if (!controller.signal.aborted) setCurrentListings(data.listings) })
         .catch(() => {}) // AbortError is expected on rapid switching
         .finally(() => { if (!controller.signal.aborted) setIsRefetching(false) })
     }, [selectedPrint?.id])
     ```
   - Add `SaveSection` and `PriceInsightsSection` to right column
   - Add `RulingsAccordion` to center column (only if `card.rulings` exists)
   - Update grid class from `lg:grid-cols-[0.7fr_1fr_1fr]` → `lg:grid-cols-[260px_1fr_268px]`
   - Move oracle text + flavor text to left column (below card image)
   - Center column: remove GameStatsDisplay and FormatLegalityGrid from their current position; add them in correct center-column order
   - Right column: remove DeckSelector and CommunityStatsCard — replaced by SaveSection
   - Add mobile tab chips using `activeTab: 'card-info' | 'legality'` state
   - Update `card-detail.module.css` for new grid, sticky columns at `top: 68px`, mobile breakpoints
4. Remove mock data: `getConditionAvailability`, `getRarityBasePrice`, `getSetMultiplier`, `communityStats`, `listingsCount` — all removed.
5. Run tests. Fix until all pass.
6. Run `npm run lint && npm run typecheck` in storefront/.
7. Commit: `feat(storefront): refactor CardDetailPage to v5.1 three-column layout`

---

## Task 10: Validation and quality gate [All ACs]

**Steps:**
1. Run full quality gate in each affected repo:
   ```bash
   cd storefront && npm run lint && npm run typecheck && npm run build && npm test
   cd customer-backend && npm run lint && npm run typecheck && npm run build && npm test
   cd backend && npm run lint && npm run typecheck && npm run build && npm run test:unit
   ```
2. Run coverage report in storefront:
   ```bash
   cd storefront && npm run test:coverage
   ```
   Coverage must be >80% on all new/modified files.
3. Manual verification (local dev environment):
   - Navigate to `/cards/:id` — confirm 3-col layout, catalog renders, listings appear
   - Click different printing — confirm QuickBuyPanel shows skeleton, then updates with new print's listings
   - Rapid print switching — confirm only last-settled result wins (no flicker to stale data)
   - Stop backend service — confirm degradation banner in center col, catalog/QuickBuyPanel still renders
   - Select condition with no stock — confirm chip is `disabled` (not just visually dimmed)
   - Select a print with zero stock — confirm "No listings for this print" + Notify me stub
   - Mobile: confirm tab chips work, sticky bottom bar shows condition strip + action buttons
   - Confirm no mock data in MarketplaceListingsTable or BuySection (BuySection should not render)
4. Update story file: mark all ACs as `(IMPLEMENTED)`
5. Update sprint-status.yaml: `2-5-card-detail-page-bff-endpoint: done`
6. Final commit: `docs(storefront): mark story 2-5 acceptance criteria as implemented`
