# Test Automation Summary — Story 2-5: Card Detail Page (BFF Endpoint)

**Date:** 2026-02-28
**Scope:** Integration and E2E test assessment for story `2-5-card-detail-page-bff-endpoint`
**Framework:** Vitest 4.0.18 + @testing-library/react

---

## Generated / Verified Tests

### API / Service Tests (integration-level, Vitest node environment)

- [x] `src/lib/services/cardDetailBFF.test.ts` — 14 tests: cross-service aggregation (customer-backend + backend)
  - Happy path: card + listings + merged trust data returned
  - Trust data merged correctly per seller
  - Listings sorted by price-asc then condition priority (NM > LP > MP > HP > DMG)
  - `catalogSku` built from `game.code + set.code + print.number`
  - `catalogSkuOverride` used when print-switching param supplied
  - Circuit breaker: AbortError → `listingsUnavailable: true`, catalog still present
  - Circuit breaker: backend 500 → `listingsUnavailable: true`, catalog still present
  - Empty listings array (not 500): `listingsUnavailable: false`
  - Catalog 404 → throws `CardNotFoundError` (hard failure, no degradation)
  - Trust batch failure → listings returned without trust fields (graceful degradation)
  - Partial trust data → trust merged for known sellers, absent for unknown
  - Trust batch deduplication: one request per unique seller ID
  - Trust batch skipped entirely when no listings returned

- [x] `src/app/api/cards/[id]/route.test.ts` — 5 tests: BFF HTTP route handler
  - 200 + `CardDetailBFFResponse` shape on success
  - `catalogSku` query param forwarded to service
  - No `catalogSku` param → service called with `undefined`
  - `CardNotFoundError` → 404 + `{ success: false, error: { code: "NOT_FOUND" } }`
  - Unexpected error → 500 + `{ success: false, error: { code: "INTERNAL_ERROR" } }`

### Unit Tests (component-level, Vitest jsdom environment)

- [x] `QuickBuyPanel.test.tsx` — 17 tests
- [x] `SaveSection.test.tsx` — 6 tests
- [x] `PriceInsightsSection.test.tsx` — 6 tests
- [x] `RulingsAccordion.test.tsx` — 6 tests
- [x] `CompactPrintingsTable.test.tsx` — 13 tests
- [x] `MarketplaceListingsTable.test.tsx` — 18 tests
- [x] `CardDetailPage.test.tsx` — 17 tests

### E2E Tests

No Playwright is installed in the storefront. E2E coverage is deferred to a future sprint when
the Playwright test harness is set up. The critical user flows (print selection → re-fetch →
QuickBuy update; Add to Cart → toast) are covered at the component integration level via
@testing-library/react tests that exercise the full component tree.

---

## Coverage

| Area | Tests | Coverage |
|---|---|---|
| BFF cross-service aggregation | 14 | All AC1/AC4 paths covered |
| BFF route HTTP semantics | 5 | All status codes + params |
| QuickBuyPanel (AC6/AC6a) | 17 | Condition chips, qty stepper, skeleton, zero stock, auth |
| CompactPrintingsTable (AC5) | 13 | Filter/sort/keyboard/overflow |
| MarketplaceListingsTable (AC2/AC3) | 18 | Sortable headers, best price, pagination |
| CardDetailPage layout (AC2) | 17 | 3-col grid, columns, tab chips, initial refetch state |
| SaveSection / PriceInsights / Rulings | 18 | Supporting right-col components |

**Total: 500 tests — 499 pass, 1 pre-existing failure (AlgoliaSearchResults on main)**

---

## Cross-Service Boundary Assessment

Story 2-5 crosses two service boundaries:

1. **storefront → customer-backend** (`/api/cards/{id}`): covered by `cardDetailBFF.test.ts` mocking `fetch` calls.
2. **storefront → backend** (`/store/cards/listings`, `/api/sellers/trust/batch`): covered by circuit breaker tests including AbortError, 500, empty array, and trust failure scenarios.

No additional integration tests required at this time.

## Next Steps

- Set up Playwright when E2E harness sprint runs
- Add E2E smoke test for card detail page user flow (print select → listings update → add to cart)
- Address pre-existing `AlgoliaSearchResults` test failure (separate story/ticket)
