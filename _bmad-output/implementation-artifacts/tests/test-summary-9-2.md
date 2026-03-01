# Test Automation Summary — Story 9.2: Game Selector Grid

Generated: 2026-03-01

## Generated Tests

### API Tests (customer-backend)

- [x] `src/tests/routes/catalog.listing-counts.test.ts` — `GET /api/catalog/listing-counts` (3 tests)
  - Cache miss → DB query → Redis SET → returns counts
  - Cache hit → returns cached data, no DB call
  - DB failure → 503 SERVICE_UNAVAILABLE

### Unit Tests (storefront)

- [x] `src/lib/api/__tests__/customer-backend.listing-counts.test.ts` — `fetchGameListingCounts()` (3 tests)
- [x] `src/components/homepage/__tests__/GameTile.test.tsx` — GameTile component (10 tests)
- [x] `src/components/homepage/__tests__/GameSelectorGrid.test.tsx` — GameSelectorGrid (6 tests)
- [x] `src/app/[locale]/(main)/__tests__/page.test.tsx` — Homepage page integration (3 new tests)
- [x] `src/app/[locale]/(main)/cards/__tests__/page.test.tsx` — CardsPage cookie+URL param (4 tests)
- [x] `src/components/cards/__tests__/CardBrowsingPage.test.tsx` — initialGame threading (2 new tests)
- [x] `src/components/search/__tests__/AlgoliaSearchResults.test.tsx` — initialUiState game (2 new tests)

### E2E Tests (storefront — Playwright)

- [x] `e2e/story-9-2-game-selector-grid.spec.ts` — Full user flow E2E (17 tests)
  - AC1: Grid renders, 4 tiles, correct game names, "Shop by game" label
  - AC1: Desktop (1280px) and mobile (375px) layout screenshots
  - AC4: Each tile click → correct /cards?game=CODE navigation
  - AC4: sd_game_pref cookie set with correct value, SameSite=Lax, 30-day expiry
  - AC5: Cookie pre-filters /cards without ?game= param
  - AC5: URL param takes priority over cookie
  - AC6: Enter key on focused tile → navigation + cookie
  - AC6: Tiles are Tab-focusable (tabIndex=0)
  - AC3: Homepage renders with 4 tiles regardless of API availability

## Unit Test Totals

| Repo | Tests | Result |
|---|---|---|
| customer-backend | 360 (25 suites) | PASS |
| storefront | 617 (62 files) | PASS |

## Cross-Service Boundaries

| Boundary | Test Coverage |
|---|---|
| storefront → customer-backend API | Unit: fetchGameListingCounts() mocked fetch |
| customer-backend → Redis cache | Unit: Redis mock (cache hit/miss) |
| Browser cookie → Next.js SSR → Algolia | Unit chain + E2E cookie injection |
| Homepage tile click → /cards filter | E2E: AC4+AC5 Playwright tests |

## E2E Execution

```bash
cd storefront
npx playwright test e2e/story-9-2-game-selector-grid.spec.ts
```

Requires storefront running on localhost:3000. Visual regression baselines committed on first CI run.
