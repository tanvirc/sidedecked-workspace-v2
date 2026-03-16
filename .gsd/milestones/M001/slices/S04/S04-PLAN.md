# S04: Card Browse, Search & Detail UI

**Goal:** Storefront search + card detail pages render live data from all three layers.
**Demo:** Open /search -> type "Pikachu" -> see card grid -> click a card -> detail page shows image, printings table, current market price.

## Must-Haves

- /search page renders Algolia search results with facets (game, set, rarity)
- Card grid shows card image (CDN URL), name, lowest price
- /cards/[id] detail page renders: card image, card text, printings table, marketplace listings
- BFF GET /api/cards/[id] aggregates catalog from customer-backend + listings from backend
- Image loading: CDN URL -> MinIO fallback -> placeholder skeleton
- Error boundary on detail page: if customer-backend is down, shows graceful error
- `cd storefront && npm test` passes with >= 80% component coverage

## Proof Level

- This slice proves: final-assembly (M001 vertical slice complete)
- Real runtime required: yes
- Human/UAT required: yes (visual verification of layout)

## Verification

- `cd storefront && npm test` - all tests pass
- `cd storefront && npm run typecheck` - exits 0
- Manual: /search -> search "Lightning Bolt" -> click result -> detail page shows correct data
- Lighthouse performance score >= 75 on /cards/[id]

## Observability / Diagnostics

- Runtime signals: BFF route logs upstream call latency and status codes
- Inspection surfaces: /api/cards/[id] response includes `_meta.sources` object with upstream statuses
- Failure visibility: error boundary renders with error code; `_meta.sources.catalog_status` shows 503 if customer-backend is down
- Redaction constraints: no user tokens in BFF logs

## Integration Closure

- Upstream surfaces consumed: Algolia JS client, Medusa JS SDK (listings), customer-backend catalog API
- New wiring introduced: BFF aggregation pattern (circuit-breaker + parallel fetch)
- What remains: M002 (cart/listings) needed for full purchase flow

## Tasks

- [ ] **T01: BFF aggregation route for card detail** `est:2h`
  - Why: Card detail page needs data from two separate backends - BFF is the only clean way in Next.js App Router
  - Files: `storefront/src/app/api/cards/[id]/route.ts`
  - Do: GET /api/cards/[id] fetches catalog data from customer-backend and listing data from Medusa backend in parallel (<=5 concurrent). Return merged response with `_meta.sources`. Circuit-breaker: partial failure returns partial data with status annotation.
  - Verify: `curl localhost:3000/api/cards/csk_lightning_bolt` returns merged JSON with `_meta.sources`
  - Done when: BFF returns merged data; partial failure does not crash the route

- [ ] **T02: Card detail page (3-column desktop layout)** `est:3h`
  - Why: This is the primary product page - must be visually correct and accessible
  - Files: `storefront/src/app/[locale]/(main)/cards/[id]/page.tsx`, `storefront/src/components/card/CardDisplay.tsx`, `storefront/src/components/card/CompactPrintingsTable.tsx`
  - Do: 3-column layout: (1) card image with CDN+fallback loading, (2) card details (name, text, type, rarity), (3) printings table showing set/condition/price/seller. Use React Suspense for listings column.
  - Verify: `npm test -- --grep 'CardDetailPage'` passes; manual visual check at 1440px and 390px
  - Done when: Page renders in <= 2s; all 3 columns show live data; mobile layout stacks correctly

- [ ] **T03: Search page with Algolia facets** `est:3h`
  - Why: Search is the primary discovery path; facets are required by R004
  - Files: `storefront/src/app/[locale]/(main)/search/page.tsx`, `storefront/src/components/search/AlgoliaSearchResults.tsx`, `storefront/src/components/search/SearchFilters.tsx`
  - Do: Search page using Algolia InstantSearch React. Facets: game_code, set_name, rarity. Results as CardGrid. Pagination or infinite scroll.
  - Verify: `npm test -- --grep 'search'` passes; manual: search "Pikachu" returns Pokemon cards
  - Done when: Search returns relevant results; facets filter correctly; URL state is shareable

- [ ] **T04: CDN + MinIO image fallback pattern** `est:1h`
  - Why: Card images may not be in CDN cache; MinIO must be tried before showing placeholder
  - Files: `storefront/src/components/card/CardImage.tsx`
  - Do: CardImage component with 3-level fallback: (1) CDN URL, (2) MinIO direct URL on error, (3) card-back placeholder SVG on second error. Use Next.js Image with custom loader.
  - Verify: `npm test -- --grep 'CardImage'` passes with mocked load/error states
  - Done when: Three-level fallback works; no broken image icons in card grid

## Files Likely Touched

- `storefront/src/app/api/cards/[id]/route.ts`
- `storefront/src/app/[locale]/(main)/cards/[id]/page.tsx`
- `storefront/src/app/[locale]/(main)/search/page.tsx`
- `storefront/src/components/card/CardDisplay.tsx`
- `storefront/src/components/card/CardImage.tsx`
- `storefront/src/components/card/CompactPrintingsTable.tsx`
- `storefront/src/components/search/AlgoliaSearchResults.tsx`
- `storefront/src/components/search/SearchFilters.tsx`
