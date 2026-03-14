---
estimated_steps: 4
estimated_files: 3
---

# T02: Implement greedy cart optimizer algorithm with three modes

**Slice:** S09 — Cart Optimizer & Deck-to-Cart Flow
**Milestone:** M001

## Description

The core differentiator algorithm. A pure function that takes missing cards and their available listings, then finds the optimal seller combination for three modes: cheapest total cost, fewest number of sellers, and best value (balanced). Uses a greedy heuristic per D004 — sort cards by listing scarcity, then greedily assign each card to the seller minimizing incremental cost. Shipping is a per-seller fixed cost, amortized across that seller's cards.

## Steps

1. Implement `optimizeCart()` in `storefront/src/lib/optimizer/optimizeCart.ts`:
   - Signature: `optimizeCart(missingCards: MissingCard[], listingsByCard: Record<string, BackendListing[]>, mode: OptimizationMode): OptimizationResult`
   - **Pre-processing:** Deduplicate `missingCards` by `catalogSku`, summing quantities. Filter out cards with no listings (add to `unavailableCards` in result). Sort remaining by listing count ascending (scarcity-first).
   - **Shipping cost derivation:** Helper `getShippingCost(listing: BackendListing): number` — returns `listing.shippingCost` if defined, else derives from `shippingMethod`: "standard" → 399, "tracked" → 599, default → 399 (all cents).
   - **Greedy assignment (cheapest mode):** For each card in scarcity order, evaluate all available listings. For each listing, compute marginal cost = `listing.price * quantity` + (if seller not yet in result, `getShippingCost(listing)`, else 0). Pick the listing with lowest marginal cost. Track assigned sellers and their accumulated items.
   - **Greedy assignment (fewest-sellers mode):** Prefer sellers already in the result set. Among those, pick cheapest. If no existing seller has the card, add the seller with the cheapest total (price + shipping). Break ties by price.
   - **Greedy assignment (best-value mode):** Weighted score: `0.7 * normalizedCost + 0.3 * normalizedSellerCount`. Use cheapest mode as base, then try consolidating to fewer sellers if the cost increase is < 15%.
   - **Quantity handling:** A listing's `quantity` field limits how many copies of that card can be sourced from that seller. If a card needs 4 copies and the cheapest listing has quantity 2, split across sellers.
   - **Result assembly:** Group assignments by seller → `SellerGroup[]`. Each group has seller info, assigned cards with chosen listing details, subtotal, shipping cost. Compute `totalCost`, `totalWithoutOptimization` (sum of cheapest-per-card without shipping optimization), and `savings`.

2. Implement helper functions:
   - `deriveShippingCost(shippingMethod: string, shippingCost?: number): number` — extracted for reuse in UI
   - `formatOptimizationSummary(result: OptimizationResult): string` — human-readable summary for diagnostics

3. Update `types.ts` if any type refinements are needed during implementation (e.g., `UnavailableCard` type for cards with no listings).

4. Write exhaustive tests in `storefront/src/lib/optimizer/__tests__/optimizeCart.test.ts`:
   - **Cheapest mode:** 3 cards across 3 sellers, verify picks cheapest combination including shipping amortization
   - **Fewest-sellers mode:** same data, verify consolidates to fewer sellers even if marginally more expensive
   - **Best-value mode:** verify balanced result between cheapest and fewest
   - **Shipping amortization:** seller A has 2 cards, seller B has 1 of the same — verify shipping only charged once per seller
   - **Scarcity ordering:** card with only 1 listing assigned first (before that listing is "used up" by another card's assignment)
   - **Quantity splitting:** card needs 4 copies, best seller has 2, verify splits across 2 sellers
   - **No listings for a card:** card appears in `unavailableCards`, not in seller groups
   - **Single seller has everything:** all cards assigned to one seller, one shipping charge
   - **Empty input:** returns empty result, no errors
   - **All same price:** tiebreaker by seller ID for deterministic results
   - **Shipping cost derivation:** standard → 399, tracked → 599, explicit value → used, unknown method → 399
   - **Performance:** 15 cards × 10 sellers per card completes in < 50ms (generous budget, algorithm should be < 10ms)

## Must-Haves

- [ ] `optimizeCart()` pure function with 3 modes producing correct results
- [ ] Shipping cost amortized per-seller (not per-card)
- [ ] Scarcity-first card ordering in greedy assignment
- [ ] Quantity-aware splitting across sellers when single seller can't fulfill
- [ ] `unavailableCards` reported for cards with no listings
- [ ] Savings calculation comparing optimized total vs naive per-card cheapest
- [ ] Deterministic results (stable sort/tiebreakers)
- [ ] 12+ test cases covering all modes and edge cases

## Verification

- `npx vitest run src/lib/optimizer/__tests__/optimizeCart.test.ts` — all tests pass
- `cd storefront && npx vitest run` — all 854+ tests pass
- Performance assertion in tests: 15×10 matrix completes in < 50ms

## Inputs

- `storefront/src/lib/optimizer/types.ts` — shared types from T01
- `storefront/src/types/bff.ts` — `BackendListing` interface
- S09 Research — D004 greedy heuristic decision, shipping cost derivation rules, performance budget
- S09 Research — pitfall about shipping amortization (per-seller fixed cost, not per-card)

## Expected Output

- `storefront/src/lib/optimizer/optimizeCart.ts` — pure optimizer function with 3 modes + helpers
- `storefront/src/lib/optimizer/__tests__/optimizeCart.test.ts` — exhaustive test suite
- `storefront/src/lib/optimizer/types.ts` — any type refinements
