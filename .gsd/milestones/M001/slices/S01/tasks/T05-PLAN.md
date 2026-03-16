# T05: Implement card detail BFF with graceful degradation

**Slice:** S01
**Status:** complete
**Estimate:** 2h

## Goal

Build the `GET /api/cards/[id]` BFF that aggregates catalog data and listing data concurrently, returning catalog data with `listings: []` when the listings backend is unavailable — never a 500.

## Files to Touch

- `storefront/src/app/api/cards/[id]/route.ts` (create/rewrite)
- `storefront/src/app/api/cards/[id]/route.test.ts` (create)

## What to Do

`GET /api/cards/[id]`:

1. Fire both `GET {CUSTOMER_BACKEND_URL}/api/catalog/cards/:id` and `GET {BACKEND_URL}/store/consumer-seller/listings?catalog_sku=:id` concurrently using `Promise.allSettled`.
2. If catalog fetch fails → return `NextResponse.json({ error: "Card not found" }, { status: 404 })`.
3. If listings fetch fails → return `{ card: catalogData, listings: [], listingsError: "Listings temporarily unavailable" }` with status 200.
4. On full success → merge and return `{ card: catalogData, listings: listingsData }`.

Response shape:
```ts
{
  card: { id, name, game, setCode, imageUrl, attributes, prints },
  listings: Array<{ id, sellerId, sellerName, price, condition, quantity, shippingCost, trustScore }>,
  listingsError?: string
}
```

Write tests:
- Happy path returns merged data
- Listings 500 returns card with empty listings + error field
- Catalog 404 returns 404
- Concurrent fetch race (listings slow) still returns within test timeout

## Verification Criteria

- `npm test -- --run src/app/api/cards` — all pass

## Done When

BFF tests pass including the degradation scenario; response always has `card` field when catalog responds 200.

## Actual Outcome

`route.ts` and the service layer were already implemented. Tests already existed — 5 route tests + 13 service tests in `storefront/src/lib/services/cardDetailBFF.ts` — covering:
- Graceful degradation on listing fetch failure
- Trust score merge
- Condition sorting
- Circuit breaker on timeout/500

**Implementation deviation from plan:** The BFF response uses `listingsUnavailable: boolean` rather than `listingsError: string` as the plan specified. The actual service lives in `storefront/src/lib/services/cardDetailBFF.ts`. The `[BFF] /api/cards/[id] error: <message>` stderr log is present for observability on listing fetch failures.
