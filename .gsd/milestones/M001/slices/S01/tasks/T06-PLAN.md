# T06: Implement greedy cart optimizer algorithm

**Slice:** S01
**Status:** complete
**Estimate:** 2h

## Goal

Prove the cart optimizer algorithm correct on a multi-seller fixture before any UI is built on top of it. All 3 modes (cheapest / fewest-sellers / best-value) must produce verifiably correct output and complete in < 50ms for a 15-card × 10-seller fixture.

## Files to Touch

- `storefront/src/lib/optimizer/types.ts` (create)
- `storefront/src/lib/optimizer/optimizeCart.ts` (create)
- `storefront/src/lib/optimizer/__tests__/optimizeCart.test.ts` (create)

## What to Do

**Types:**
```ts
Listing { catalogSku, sellerId, sellerName, price, condition, quantity, shippingCost, trustScore }
SellerGroup { sellerId, sellerName, listings: Listing[], subtotal, shipping, total }
OptimizationResult { groups: SellerGroup[], totalCost, estimatedSavings, unavailableSkus: string[] }
OptimizationMode = 'cheapest' | 'fewest-sellers' | 'best-value'
```

**Algorithm** — `optimizeCart(listings, mode): OptimizationResult`:
1. Group listings by `catalogSku`, deduplicate (lowest price per seller per SKU)
2. Sort SKUs by scarcity (fewest listings first)
3. For each SKU in scarcity order:
   - `cheapest` — pick cheapest listing
   - `fewest-sellers` — pick cheapest listing from already-chosen sellers if one exists, else cheapest new seller
   - `best-value` — use `fewest-sellers` logic when cost increase ≤ 15% vs `cheapest`, else use `cheapest`
4. Accumulate per-seller subtotals + shipping (deduplicated — shipping charged once per seller)
5. Compute `estimatedSavings` as delta between worst-case (all separate sellers) and chosen grouping
6. SKUs with zero listings → `unavailableSkus`

**Tests:**
- 15-card × 10-seller fixture, all 3 modes produce expected groupings
- Single seller, all-owned (empty input), no listings edge cases
- Performance: `Date.now()` delta < 50ms for 60-card input

## Verification Criteria

- `npm test -- --run src/lib/optimizer/__tests__/optimizeCart` — all pass

## Done When

All test cases pass including performance check; algorithm handles edge cases without throwing.

## Actual Outcome

`optimizeCart.ts` and `types.ts` were already implemented. 22 tests already existed and passed, covering:
- All 3 modes (cheapest, fewest-sellers, best-value)
- Shipping amortization (once per seller, not per listing)
- Scarcity-first ordering
- Quantity splitting
- Savings calculation
- Determinism
- 15×10 performance: < 1ms (well under 50ms target)

**Implementation notes (forward intelligence):**
- `optimizeCart()` takes `listingsByCard: Record<string, BackendListing[]>` (keyed by `catalogSku`), not a flat array — the BFF transforms the flat listing array into this shape before calling the function.
- Prices in `BackendListing` are in **cents**; PriceTag `price` prop is in **dollars** — do not mix.
- Decision D004 codified: cart optimizer uses greedy heuristic — proven correct and < 1ms for 15×10 fixture.
