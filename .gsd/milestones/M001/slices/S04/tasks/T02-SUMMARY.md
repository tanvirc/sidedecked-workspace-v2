---
id: T02
parent: S04
milestone: M001
provides:
  - fetchTrendingCards() API client function with 5-min revalidation and timeout
  - TRENDING_PLACEHOLDER curated fallback with real card images (8 cards across 4 games)
  - TrendingStrip renders placeholder when no live data, never returns null
  - Homepage page.tsx fetches trending data in parallel and renders TrendingStrip
key_files:
  - storefront/src/lib/api/customer-backend.ts
  - storefront/src/components/homepage/TrendingStrip.tsx
  - storefront/src/app/[locale]/(main)/page.tsx
  - storefront/src/components/homepage/__tests__/TrendingStrip.test.tsx
  - storefront/src/app/[locale]/(main)/__tests__/page.test.tsx
key_decisions:
  - Exported TrendingCard interface and TRENDING_PLACEHOLDER from TrendingStrip.tsx so tests can verify placeholder count and game coverage
  - fetchTrendingCards maps flexible API field names (card_name/name, set_name/set, catalog_sku/id, image_url/imageUrl) for resilience
  - Returns undefined (not empty array) from fetchTrendingCards when API returns no data, keeping the signal clean for fallback
  - Curated placeholder includes real image URLs from Scryfall, pokemontcg.io, ygoprodeck.com, onepiece-cardgame.com
patterns_established:
  - none
observability_surfaces:
  - fetchTrendingCards returns undefined on error/empty — component renders curated fallback visibly so empty trending state is always user-visible
duration: 15m
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T02: Wire TrendingStrip to live data with curated fallback and integrate into homepage

**Added `fetchTrendingCards()` API client, 8-card curated fallback with real images in TrendingStrip, and wired both into the homepage's parallel data fetch.**

## What Happened

Added `fetchTrendingCards()` to `customer-backend.ts` following the `fetchGameListingCounts()` pattern: `GET /api/pricing/trending?limit=10`, 5-min revalidation, 5-second timeout, returns `TrendingCardData[] | undefined`. The function maps the API's `trending_cards` array to the component interface with flexible field name handling.

Added `TRENDING_PLACEHOLDER` — 8 curated cards (2 per game: MTG, Pokémon, Yu-Gi-Oh!, One Piece) with realistic prices and real card image URLs from authoritative TCG image CDNs. TrendingStrip now renders this fallback when `cards` is undefined or empty instead of returning null. Added `data-testid="trending-strip"`.

Wired into `page.tsx`: imported `fetchTrendingCards` and `TrendingStrip`, added to the existing `Promise.all` (4th element), passes result to `<TrendingStrip cards={trendingCards} />`.

Updated the homepage page test to mock `fetchTrendingCards` and `TrendingStrip`, preventing test failures caused by the unmocked import.

## Verification

- `npx vitest run src/components/homepage/__tests__/TrendingStrip.test.tsx` — 11 tests pass
- `npx vitest run src/components/homepage/` — 46 tests pass
- `npx vitest run` — 738 tests pass, 0 failures
- `npm run build` — production build succeeds
- Visual verification in browser at localhost:3002 — all 8 trending cards render with real images

## Diagnostics

When the customer-backend `/api/pricing/trending` stub starts returning real data, TrendingStrip will automatically show live cards instead of the curated fallback. No code changes needed.

## Deviations

Updated `storefront/src/app/[locale]/(main)/__tests__/page.test.tsx` to mock the new imports — not explicitly in the task plan but necessary to keep the existing page tests passing.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/lib/api/customer-backend.ts` — Added `TrendingCardData` interface and `fetchTrendingCards()` function
- `storefront/src/components/homepage/TrendingStrip.tsx` — Added exported `TRENDING_PLACEHOLDER` with real image URLs, fallback logic, `data-testid`, exported `TrendingCard` interface
- `storefront/src/app/[locale]/(main)/page.tsx` — Imported and wired `fetchTrendingCards` + `TrendingStrip` into parallel fetch and render
- `storefront/src/components/homepage/__tests__/TrendingStrip.test.tsx` — Rewrote tests: placeholder fallback, empty array fallback, provided cards override, data-testid, placeholder coverage
- `storefront/src/app/[locale]/(main)/__tests__/page.test.tsx` — Added mocks for `fetchTrendingCards` and `TrendingStrip` component
