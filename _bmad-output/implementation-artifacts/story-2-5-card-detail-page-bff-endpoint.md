# Story 2.5: Card Detail Page (BFF Endpoint)

**Epic:** Epic 2 — Card Catalog & Discovery
**Status:** done
**Story Key:** story-2-5-card-detail-page-bff-endpoint

---

## Story

As a user viewing a specific card,
I want to see all information aggregated: catalog data, market pricing, and all active listings,
So that I can make an informed purchase decision from a single page.

---

## Acceptance Criteria

**AC1** ✅ IMPLEMENTED
**Given** I navigate to a card detail page
**When** the BFF endpoint responds
**Then** data is aggregated from both customer-backend (catalog, pricing) and backend (active listings, seller info) into a single response

**AC2** ✅ IMPLEMENTED
**Given** the card detail page renders
**When** I view the page
**Then** I see card image (full-bleed), game-specific attributes, set info, format legality, and all active listings sorted by price + condition

**AC3** ✅ IMPLEMENTED
**Given** listings are displayed
**When** I view seller rows
**Then** each shows seller name, trust signal ("99.2% positive · 412 sales"), condition, price, shipping estimate, and "Add to Cart" button

**AC4** ✅ IMPLEMENTED
**Given** the backend (listings) is temporarily unavailable
**When** the BFF endpoint degrades
**Then** catalog data still renders with a notice: "Seller listings temporarily unavailable" (circuit breaker graceful degradation)

**AC5** ✅ IMPLEMENTED
**Given** the card has multiple printings
**When** I view the card detail page
**Then** other printings are shown with links to their respective detail pages

---

## Tasks / Subtasks

### Task 1: Create the storefront BFF API route for card detail aggregation [AC1, AC4]

Create `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\app\api\cards\[id]\route.ts` — a Next.js 15 API route handler that:

1. Calls `GET http://localhost:7000/api/cards/:id/details` for catalog data (card, prints, sets, legality)
2. Calls `GET http://localhost:9001/store/products?filters[metadata][catalog_sku]=<sku>` for active listings from the backend
3. Merges the two responses into a single `CardDetailBFFResponse` shape
4. Implements a circuit breaker: if the backend (listings) call fails or times out, still return catalog data with `listingsUnavailable: true` in the response body
5. Returns `{ success: true, data: CardDetailBFFResponse }` on success, or `{ success: false, error: { code, message } }` on complete failure

Sub-tasks:
- 1a. Define `CardDetailBFFResponse` TypeScript interface in `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\types\bff.ts`
- 1b. Create `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\lib\services\cardDetailBFF.ts` — service function that performs the dual fetch with circuit breaker, timeout, and graceful degradation
- 1c. Create the route handler at `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\app\api\cards\[id]\route.ts` that calls the service

### Task 2: Wire the storefront card detail page to use the BFF endpoint [AC1, AC2]

`C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\app\[locale]\(main)\cards\[id]\page.tsx` currently calls `getCardDetails()` from `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\lib\data\cards.ts`, which only fetches catalog data from customer-backend.

Update `getCardDetails()` in `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\lib\data\cards.ts` (or create a new `getCardDetailsBFF()` function in the same file) to:
1. Call the new BFF endpoint at `/api/cards/:id` (internal Next.js route)
2. Return the merged `CardDetailBFFResponse` including listings data
3. Pass the full BFF response into `CardDetailPage` component

Sub-tasks:
- 2a. Add `getCardDetailsBFF()` to `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\lib\data\cards.ts` that calls `/api/cards/:id`
- 2b. Update `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\app\[locale]\(main)\cards\[id]\page.tsx` to use `getCardDetailsBFF()` instead of `getCardDetails()`
- 2c. Update `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\components\cards\CardDetailPage.tsx` Props interface to accept optional `listings` array and `listingsUnavailable` flag from BFF response

### Task 3: Replace mock listings in MarketplaceListingsTable with real BFF data [AC2, AC3]

`C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\components\cards\MarketplaceListingsTable.tsx` currently uses hardcoded `mockListings` data (see `loadMarketplaceListings()` function).

Replace mock data with real listings passed from the BFF response:
1. Add an optional `listings` prop and `listingsUnavailable` prop to `MarketplaceListingsTableProps`
2. When `listings` prop is provided, use it instead of fetching mock data
3. When `listingsUnavailable` is true, render the "Seller listings temporarily unavailable" notice (see AC4)
4. Ensure each listing row shows: seller name, trust signal ("99.2% positive · 412 sales"), condition, price, shipping estimate, "Add to Cart" button
5. Default sort: price ascending, then condition (NM → LP → MP → HP → DMG)

Sub-tasks:
- 3a. Add `listings?: BackendListing[]` and `listingsUnavailable?: boolean` props to `MarketplaceListingsTableProps`
- 3b. Remove the `mockListings` hardcoded array entirely from `loadMarketplaceListings()`
- 3c. Map backend product/variant shape (`id`, `title`, `variants[0].prices[0].amount`, `metadata.condition`, `metadata.seller_type`, `seller.businessName`, seller trust data) to `MarketplaceListing` interface
- 3d. Add "Seller listings temporarily unavailable" notice UI to `MarketplaceListingsSection.tsx` for the degraded state

### Task 4: Expose backend listings endpoint queryable by catalog_sku [AC1, AC3]

The backend already stores `metadata.catalog_sku` on products (see `POST /store/consumer-seller/listings`). A public endpoint for fetching active listings by catalog SKU is needed for the BFF to query.

Check if `GET /store/products?filters[metadata][catalog_sku]=<sku>` is already exposed. If not, create `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\backend\apps\backend\src\api\store\products\route.ts` or add a query filter to the existing MedusaJS product query to support `catalog_sku` filtering.

The response must include seller info (vendor/seller name, rating, trust signals) per listing. Check if `seller_rating` and `seller_trust_level` data is available on vendor records.

Sub-tasks:
- 4a. Verify or create public `GET /store/products` endpoint in backend with `catalog_sku` metadata filter support
- 4b. Ensure the product list response includes: `id`, `title`, `variants[0].prices[0].amount`, `metadata.condition`, `metadata.language`, `metadata.shipping_method`, `seller.businessName`, `seller.id`, and any available trust/rating data
- 4c. If seller trust score is not on the backend product response, note this as requiring a follow-up story to join SellerRating from customer-backend via the BFF layer

### Task 5: Multiple printings navigation links [AC5]

The `getCardDetails()` response from customer-backend already returns `prints` and `sets` arrays. The `CompactPrintingsTable` component at `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\components\cards\CompactPrintingsTable.tsx` exists.

Ensure that:
1. Each printing row in `CompactPrintingsTable` links to `/[locale]/cards/[printId]` (the detail page for that specific print/card)
2. The current print is visually distinguished (highlighted row or "current" badge)
3. The component receives `currentPrintId` prop to determine which row is selected

Sub-tasks:
- 5a. Update `CompactPrintingsTable` to accept `currentPrintId?: string` prop and render it as selected
- 5b. Verify each row links to `/cards/:id` using the `print.id` as the card page identifier (since the current URL is `/cards/[id]` where `id` is the card UUID)

### Task 6: Write tests for the BFF route and service [AC1, AC4]

Co-locate tests with their source files:

- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\app\api\cards\[id]\route.test.ts` — test the API route: successful aggregation, listings unavailable (circuit breaker open), catalog fetch failure (404 response)
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\lib\services\cardDetailBFF.test.ts` — test the service: dual fetch, timeout handling, graceful degradation when backend returns 500
- Mock both backends using MSW (already in storefront test setup): mock `http://localhost:7000/api/cards/:id/details` and `http://localhost:9001/store/products`

Coverage target: >80% on new files.

---

## Dev Notes

### BFF Pattern: Where Does the BFF Live?

Per `docs/architecture/06-integration-architecture.md` (Architecture Boundaries table):

> **Storefront BFF** | storefront API routes | storefront client | Next.js API routes

The BFF lives in the **storefront** as a Next.js 15 API route (`app/api/cards/[id]/route.ts`). This is the correct placement — storefront API routes aggregate data from multiple backends and serve the storefront client. It is NOT in customer-backend, which would mix concerns.

The storefront client (Server Components) calls the Next.js BFF route. The BFF route makes two parallel server-side HTTP calls: one to customer-backend (:7000) and one to backend (:9001).

### How the Two Backends Communicate

The BFF calls are server-to-server (internal) during SSR:

```
Storefront page (Server Component)
  → GET /api/cards/:id  (internal Next.js API route)
    → GET http://localhost:7000/api/cards/:id/details  (customer-backend, catalog data)
    → GET http://localhost:9001/store/products?...     (backend, active listings)
  ← merged CardDetailBFFResponse
```

Per architecture rules:
- The customer-backend call uses `NEXT_PUBLIC_CUSTOMER_BACKEND_URL` (default `http://localhost:7000`)
- The backend call uses `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (default `http://localhost:9001`)
- Both calls run in `Promise.allSettled()` — listings failure does not prevent catalog from rendering

### Existing Customer-Backend Endpoint

The endpoint `GET /api/cards/:id/details` already exists in `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\customer-backend\src\routes\catalog.ts` at line 713. It returns:
- Card identity: `id`, `name`, `gameId`, `gameCode`, `gameName`
- Universal attributes: `oracleText`, `flavorText`, `manaCost`, `manaValue`, `colors`, `powerValue`, `defenseValue`, `hp`, `primaryType`, `subtypes`, `supertypes`, `keywords`
- Game-specific attributes per game (see JSONB Internal Key patterns below)
- `prints[]` — array of Print objects with `id`, `rarity`, `artist`, `number`, `language`, `finish`, `images`, `set`, and format legality flags
- `sets[]` — deduplicated set objects from prints
- `legality` — format legality from first print
- `translations[]` — card name/text translations

This endpoint is already called via `customerBackendAPI.getCardDetails(cardId)` in `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\lib\api\customer-backend.ts` line 328.

### Existing Backend Listings Endpoint

Products (listings) in the backend store `catalog_sku` in `metadata`. The `POST /store/consumer-seller/listings` flow sets `metadata.catalog_sku` on products (confirmed at `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\backend\apps\backend\src\api\store\consumer-seller\listings\route.ts` lines 256-261).

To query products by `catalog_sku`, the BFF should call:
```
GET http://localhost:9001/store/products?metadata[catalog_sku]=<sku>&status=published
```

If MedusaJS's built-in query graph does not support `metadata` filtering directly on the public store route, the BFF may need to call the admin query with service API key, or a custom store route may need to be added.

Seller trust data (rating, review count) is stored in `sidedecked-db` (customer-backend `SellerRating`, `SellerReview` entities, `TrustScoreService`). The backend (mercur-db) has vendor/seller identity (`businessName`, `id`) but not trust scores. The BFF can fetch seller trust from customer-backend using `GET /api/sellers/:id/trust` if that endpoint exists, or this trust join can be a follow-up story with the BFF returning only what the backend provides initially.

### Circuit Breaker Implementation

The circuit breaker wraps the backend (listings) call only. Catalog data from customer-backend must always succeed — if it fails, return 404 or 500 as appropriate.

```typescript
// C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\lib\services\cardDetailBFF.ts

const BACKEND_TIMEOUT_MS = 3000 // 3 second timeout for listings

async function fetchListingsWithFallback(catalogSku: string): Promise<{
  listings: BackendListing[]
  unavailable: boolean
}> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS)

    const response = await fetch(
      `${BACKEND_URL}/store/products?metadata[catalog_sku]=${encodeURIComponent(catalogSku)}&status=published`,
      { signal: controller.signal, next: { revalidate: 30 } }
    )
    clearTimeout(timeoutId)

    if (!response.ok) {
      return { listings: [], unavailable: true }
    }

    const data = await response.json()
    return { listings: data.products || [], unavailable: false }
  } catch (error) {
    // AbortError (timeout) or network error — degrade gracefully
    return { listings: [], unavailable: true }
  }
}
```

The full BFF uses `Promise.allSettled()`:

```typescript
const [catalogResult, listingsResult] = await Promise.allSettled([
  fetchCardCatalog(cardId),
  fetchListingsWithFallback(catalogSku)
])

if (catalogResult.status === 'rejected') {
  return NextResponse.json(
    { success: false, error: { code: 'NOT_FOUND', message: 'Card not found' } },
    { status: 404 }
  )
}

const catalog = catalogResult.value
const listings = listingsResult.status === 'fulfilled' ? listingsResult.value : { listings: [], unavailable: true }
```

### Multiple Printings

The card detail URL is `/[locale]/cards/[id]` where `id` is the card's UUID from customer-backend. A card can have multiple `Print` objects, each belonging to a different `CardSet`.

The `CompactPrintingsTable` component (`C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\components\cards\CompactPrintingsTable.tsx`) already exists and renders print rows. Each print row should link to `/cards/:cardId` where `cardId` is the Card oracle UUID. The `selectedPrint` state in `CardDetailPage` determines which print's image is shown.

To navigate to a different printing: the URL stays as `/cards/:cardId` but the card entity has multiple prints. The correct model is to use a `?print=:printId` query param to select a specific print, or alternatively the prints table links to the same card page with the print pre-selected. Review the existing `selectedPrint` state in `CardDetailPage.tsx` (line 42) when implementing.

### Game-Specific Attribute Structure

The `gameCode` field on the card determines which attributes to display. The `GameStatsDisplay` component at `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\components\cards\GameStatsDisplay.tsx` already handles this.

Per architecture `_bmad-output/planning-artifacts/architecture.md` (JSONB Internal Key Examples):

```typescript
// MTG: manaCost, colorIdentity, powerValue/defenseValue, primaryType
// Pokemon: hp, retreatCost, energyTypes, evolutionStage (hp from card entity, retreatCost from gameData)
// Yu-Gi-Oh!: attackValue, defenseValueYugioh, levelRank, attribute
// One Piece: power (card.power), cost (card.cost), counterValue, donCost
```

The customer-backend `/api/cards/:id/details` response already returns all these fields directly on the card object (not nested in a `gameData` JSONB wrapper at the API response level). See catalog.ts lines 742-794.

### URL Pattern

Current: `/[locale]/cards/[id]` where `id` is the Card UUID

The `[id]` route param is a UUID v4 identifying the `Card` entity in sidedecked-db. This is already working in `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\app\[locale]\(main)\cards\[id]\page.tsx`.

### ISR Decision for Card Pages

Card detail pages should use ISR (Incremental Static Regeneration) with `revalidate: 60` seconds for the catalog data (rarely changes) and `revalidate: 30` seconds for listings data (inventory changes frequently).

The BFF API route should use `next: { revalidate: 30 }` on the listings fetch and `next: { revalidate: 300 }` on the catalog fetch. The page itself uses `export const revalidate = 30` in the route segment config.

Since `CardDetailPage` is a client component (`"use client"`) at `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\components\cards\CardDetailPage.tsx` line 1, the page server component (`page.tsx`) fetches data server-side and passes it as props — the ISR revalidation applies at the server component level.

### TypeScript Interfaces

Define in `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\types\bff.ts`:

```typescript
export interface BackendListing {
  id: string
  title: string
  catalogSku: string
  condition: 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'
  language: string
  finish: string
  price: number         // integer, cents
  currency: string      // 'usd'
  quantity: number
  shippingMethod: string
  sellerId: string
  sellerName: string
  sellerType: 'consumer' | 'business'
  // Trust signal data — may be null if backend does not include it
  sellerRating?: number        // e.g. 99.2
  sellerReviewCount?: number   // e.g. 412
  shippingCost?: number        // integer, cents
  shippingLocation?: string    // city, state/country
}

export interface CardDetailBFFResponse {
  // Catalog data from customer-backend
  card: Card & {
    prints: Print[]
    sets: CardSet[]
    legality: Record<string, boolean>
  }
  // Listings from backend — empty array when unavailable
  listings: BackendListing[]
  // Degradation flag — true when backend (listings) call failed or timed out
  listingsUnavailable: boolean
}
```

### Confirmed Design Decisions (Phase 2)

**Trust Signals (AC3):** The BFF makes THREE parallel calls using `Promise.allSettled`:
1. `customer-backend` → catalog data (card, prints, legality)
2. `backend` → active listings (products by catalog_sku)
3. `customer-backend` → trust scores for each seller in listings (`GET /api/sellers/:sellerId/trust` or equivalent)

If the trust call fails, listings still render — trust fields default to `undefined` (no broken state shown). Never block listing display on trust availability.

**Printings Navigation (AC5):** Client-side state only. Clicking a different printing updates `selectedPrint` state in `CardDetailPage` (already a client component). URL stays `/[locale]/cards/[id]`. No `?print=` query param. The listings section must reactively re-fetch when `selectedPrint` changes (since `catalogSku` is derived from the selected print).

---

### Catalog SKU Construction

The `catalogSku` used to query the backend is constructed in `CardDetailPage.tsx` at line 54:

```typescript
const catalogSku = selectedPrint && card.game?.code && ... ?
  `${card.game.code}-${selectedPrint.set?.code}-${selectedPrint.number || selectedPrint.id}` : ''
```

The BFF receives the `cardId` (UUID) and must construct the catalog SKU after fetching catalog data. The BFF service flow:

1. Fetch card details by UUID → get `card.game.code`, `card.prints[0].set.code`, `card.prints[0].number`
2. Construct `catalogSku = `${game.code}-${set.code}-${print.collectorNumber}``
3. Fetch listings using that `catalogSku`

### Testing Approach

- Use **Vitest** (storefront runner per `storefront/CLAUDE.md`)
- Mock cross-service HTTP calls via **MSW** per `docs/architecture/04-architectural-patterns.md` (Cross-Service Testing Rule)
- Test files co-located with source files
- Coverage threshold: >80%

MSW handlers to create:
```typescript
// Mock customer-backend catalog endpoint
http.get('http://localhost:7000/api/cards/:id/details', ({ params }) =>
  HttpResponse.json(mockCardDetails)
)

// Mock backend listings endpoint
http.get('http://localhost:9001/store/products', () =>
  HttpResponse.json({ products: mockListings })
)

// Mock backend DOWN scenario
http.get('http://localhost:9001/store/products', () =>
  HttpResponse.error()  // Tests circuit breaker / graceful degradation
)
```

---

## Project Structure Notes

Relevant existing files:

- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\app\[locale]\(main)\cards\[id]\page.tsx` — card detail Server Component (currently calls `getCardDetails` directly)
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\components\cards\CardDetailPage.tsx` — client component rendering the full detail UI
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\components\cards\MarketplaceListingsSection.tsx` — listings section container
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\components\cards\MarketplaceListingsTable.tsx` — listings table with sort/filter; currently uses mock data (line 101)
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\components\cards\CompactPrintingsTable.tsx` — multiple printings display
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\components\cards\GameStatsDisplay.tsx` — game-adaptive attributes display
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\components\cards\FormatLegalityGrid.tsx` — format legality pills
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\lib\data\cards.ts` — card data layer, `getCardDetails()` at line 153
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\lib\api\customer-backend.ts` — API client, `getCardDetails()` at line 328
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\types\tcg.ts` — TCG type definitions (Card, Print, CardSet, etc.)

New files to create:
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\app\api\cards\[id]\route.ts` — BFF API route
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\app\api\cards\[id]\route.test.ts` — BFF route tests
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\lib\services\cardDetailBFF.ts` — BFF service (dual fetch + circuit breaker)
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\lib\services\cardDetailBFF.test.ts` — service tests
- `C:\Code\GitHub\tanvirc\sidedecked-workspace-v2\storefront\src\types\bff.ts` — BFF response interfaces

---

## References

- `docs/architecture/04-architectural-patterns.md` — Section 7: Fault Tolerance (CircuitBreaker), Section 10: Testing Pattern (MSW cross-service mocking)
- `docs/architecture/06-integration-architecture.md` — Architecture Boundaries table (Storefront BFF row), Section 5: Search Integration (`Promise.allSettled` pattern for resilient multi-source fetching)
- `docs/architecture/03-domain-models.md` — Card Aggregate, Print, GameSpecificData interfaces
- `_bmad-output/planning-artifacts/architecture.md` — API Naming Conventions (`/api/v1/{resource}` for customer-backend), JSONB Internal Key Examples (per-game field names)
- `_bmad-output/planning-artifacts/ux-design-specification.md` — Platform Strategy section ("two backends unified via BFF endpoints for critical pages"), UX Pattern: "Specificity over badges" (trust signal format: "99.2% positive · 412 sales")

---

## UX Design Reference

- **Wireframe:** `_bmad-output/planning-artifacts/ux-story-2-5-card-detail-page-bff-endpoint-wireframe.html`
- **UX Spec:** `_bmad-output/planning-artifacts/ux-design-specification.md`

From `_bmad-output/planning-artifacts/ux-design-specification.md`:

**Card detail page is the gravitational center:**
> "Both loops converge on the card detail page — the gravitational center where catalog browsing, deck builder, buy flow, and sell flow all meet."

**BFF requirement is explicit:**
> "Architecture: Two backends (MedusaJS commerce + Node.js TCG) unified via BFF endpoints for critical pages (card detail page needs single aggregated API call)"

**Trust signal format (AC3):**
> "Specificity over badges (TCGPlayer) — '99.2% positive · 412 sales · Ships from Toronto' not vague trust badges. Every trust signal is a specific, verifiable number."

**Price context format (for the "Add to Cart" row area):**
> "$15.99 · 3 sellers · lowest NM · market avg $17.50" — dot-separated, scannable at a glance

**Degradation UI tone (AC4):**
> "Fail gracefully with empathy — when things break, sound human: 'We couldn't load prices right now — try refreshing, or check back in a few minutes.' Never raw errors, never blame the user."

**Listings degradation notice should use this tone.** Suggested copy for `listingsUnavailable` banner:
```
"Seller listings are temporarily unavailable — check back in a few minutes."
```

**Design system:** "Midnight Forge" Tailwind CSS tokens + shadcn/ui. Use `cn()` for conditional classes. No new design system tokens needed for this story — all existing tokens apply.

**Anti-patterns to avoid:**
- No `alert()` — use `sonner` toast for all user feedback; specifically "Add to Cart" must trigger a toast ("Cart coming soon"), NOT be `disabled`
- No mock/hardcoded data in the final implementation — the entire purpose of this story is replacing the mock listings with real data
- No hover-gated functionality — every interactive element in the listings table must be tappable on mobile
- No N+1 trust calls — trust enrichment MUST use a single batch call `POST /api/sellers/trust/batch { sellerIds: string[] }`, not one call per seller
- If trust data is unavailable for a seller, omit the trust line entirely — do not show placeholder or broken state

**Additional implementation requirements (from wireframe review):**
- Trust enrichment: dedup seller IDs before batch call: `[...new Set(listings.map(l => l.sellerId))]`
- Print-switch listings re-fetch: `useEffect(() => { fetchListings(selectedPrint) }, [selectedPrint?.id])` — only the `MarketplaceListingsSection` re-renders
- BFF route accepts optional `?catalogSku=` param so client-side re-fetches skip the catalog call
- Listings paginate at 20 rows; show pagination controls when `listings.length > 20` (client-side pagination)
- Card image `onError` handler → show card name in placeholder div (no broken image icon)
- Add to Cart: enabled button that calls `toast('Cart coming soon...')` via sonner on click
- ARIA: `aria-label="Add to Cart from [Seller], [Condition], [Price]"` on every Add to Cart button
- Listings section: `aria-live="polite"` so screen readers announce re-fetch
- Condition chip min touch target 44px on mobile (wrap in `min-h-[44px]` flex row)
- Keyboard: printings table rows navigable with ↑/↓, select with Enter

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
