# T07: Implement optimizer listings BFF

**Slice:** S01
**Status:** complete
**Estimate:** 2h

## Goal

Build the `POST /api/optimizer/listings` BFF that batches listing fetches for all SKUs (≤ 5 concurrent), merges seller trust scores, runs `optimizeCart()`, and returns partial results when individual SKU fetches fail.

## Files to Touch

- `storefront/src/app/api/optimizer/listings/route.ts` (create/rewrite)
- `storefront/src/app/api/optimizer/__tests__/listings.test.ts` (create)

## What to Do

`POST /api/optimizer/listings` body: `{ skus: string[], mode: OptimizationMode }`

1. **Validate input** — reject if `skus` is empty, `skus.length > 60`, or `mode` is invalid (return 400).
2. **Fetch listings** for all SKUs using `Promise.allSettled` in batches of 5 concurrent: `GET {BACKEND_URL}/store/consumer-seller/listings?catalog_sku=:sku` per SKU.
3. **Fetch trust scores** from customer-backend for unique seller IDs: `GET {CUSTOMER_BACKEND_URL}/api/sellers/:sellerId/trust-score` (batched by unique seller).
4. **Merge** trust scores onto listings.
5. **Run** `optimizeCart(allListings, mode)`.
6. **Return** `{ result: OptimizationResult, partialFailures: string[] }` — include failed SKUs in `partialFailures`, still optimize what's available.

Write tests:
- Happy path returns optimization result
- One SKU fails → partial result + `partialFailures` array populated
- All SKUs fail → 200 with empty result + all SKUs in `partialFailures`
- Invalid mode → 400
- Empty `skus` → 400

## Verification Criteria

- `npm test -- --run src/app/api/optimizer/__tests__/listings` — all pass

## Done When

BFF tests pass including partial failure scenario; concurrency is capped at 5 (verifiable by counting mock call timing in tests).

## Actual Outcome

`route.ts` was already implemented. 8 tests already existed and passed, covering:
- Batched concurrency (≤ 5 concurrent requests)
- Partial failure handling (failed SKUs in `partialFailures`, successful SKUs still optimized)
- Trust score merge onto listings
- Input validation (empty skus → 400, invalid mode → 400)

The `[cart-optimizer] Listing fetch failed for SKU: <sku> (HTTP <status>)` stderr log is present for each failed SKU, providing per-failure observability.
