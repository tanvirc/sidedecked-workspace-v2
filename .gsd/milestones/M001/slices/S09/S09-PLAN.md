# S09: Cart Optimizer & Deck-to-Cart Flow

**Goal:** User can mark cards as owned in the deck builder, tap "Buy Missing Cards," see the optimizer find best seller combinations across three modes, override per-card selections, and add the optimized set to cart for multi-vendor checkout.

**Demo:** From a deck with 15+ cards, mark some as owned, tap "Buy Missing Cards." Optimizer panel opens, shows seller groups with subtotals and shipping. Toggle between cheapest/fewest/best-value modes. Override one card's seller. Tap "Add to Cart" — items appear in cart. Proceed to existing multi-vendor checkout.

## Must-Haves

- `ownedCards` state in DeckBuilderContext with `toggleOwned()` and `getMissingCards()`, persisted per-deck in localStorage
- `POST /api/optimizer/listings` BFF endpoint that parallelizes listing fetches (concurrency ≤ 5) and trust batch, returns `Record<catalogSku, BackendListing[]>`
- `optimizeCart()` pure function implementing greedy heuristic for three modes: cheapest, fewest-sellers, best-value
- Shipping cost derived from `shippingMethod` string (standard=$3.99, tracked=$5.99) when `shippingCost` is not populated
- `CartOptimizerPanel` — Sheet on mobile, side panel on desktop — with mode toggle, seller groups, per-card override, add-to-cart
- "Buy Missing Cards" wired in both DeckViewerHeader and DeckBuilderLayout
- Sequential `addToCart()` calls with partial-success error handling
- < 2s optimizer response for 15 cards (algorithm + network); < 5s for 60 cards
- Card deduplication: query listings once per unique `catalogSku`, allocate quantity
- Results staleness indicator after 5 minutes with refresh button

## Proof Level

- This slice proves: operational — the full deck-to-cart flow works with real data structures and BFF pipeline
- Real runtime required: yes (BFF endpoint, listings API, cart server actions)
- Human/UAT required: yes (visual verification of optimizer panel at 1440px and 390px)

## Verification

- `npx vitest run src/lib/optimizer/__tests__/optimizeCart.test.ts` — algorithm correctness across all 3 modes, shipping amortization, deduplication, edge cases (no listings, single seller, all owned)
- `npx vitest run src/contexts/__tests__/DeckBuilderOwnership.test.tsx` — owned state toggle, localStorage persistence, getMissingCards computation
- `npx vitest run src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx` — panel rendering, mode switching, seller groups, per-card override, add-to-cart flow, partial failure handling, staleness indicator
- `npx vitest run src/app/api/optimizer/__tests__/listings.test.ts` — BFF endpoint parallelization, concurrency limiting, trust merge, error handling
- `cd storefront && npx vitest run` — all tests pass (854+ baseline)
- `cd storefront && npm run build` — production build succeeds

## Observability / Diagnostics

- Runtime signals: `console.error("[cart-optimizer]")` prefix on all error paths (BFF fetch, algorithm, add-to-cart); `console.warn("[cart-optimizer] Results stale")` when results > 5 minutes old
- Inspection surfaces: optimizer panel shows "Results from X minutes ago" timestamp; add-to-cart reports "Added N/M cards" with per-card failure detail
- Failure visibility: BFF endpoint returns `{ listings, errors: string[] }` so partial failures (some SKUs failed) are visible to the UI; add-to-cart accumulates successes/failures and reports both counts
- Redaction constraints: none (no secrets in optimizer flow)

## Integration Closure

- Upstream surfaces consumed:
  - `storefront/src/contexts/DeckBuilderContext.tsx` — deck card state, zone iteration
  - `storefront/src/lib/services/cardDetailBFF.ts` — `fetchListingsWithFallback()` pattern, `mergeListingsWithTrust()` helper, `BackendListing` type
  - `storefront/src/lib/data/cart.ts` — `addToCart()` server action
  - `storefront/src/types/bff.ts` — `BackendListing` interface
  - `storefront/src/types/deck.ts` — `DeckCard` type with `catalogSku`
  - `storefront/src/components/ui/sheet.tsx` — mobile bottom sheet
  - `storefront/src/components/decks/DeckViewerHeader.tsx` — "Buy All Cards" button location
  - `storefront/src/components/deck-builder/DeckBuilderLayout.tsx` — builder toolbar
- New wiring introduced in this slice:
  - `POST /api/optimizer/listings` BFF route
  - `optimizeCart()` pure function in `storefront/src/lib/optimizer/`
  - `CartOptimizerPanel` component in `storefront/src/components/optimizer/`
  - "Buy Missing Cards" button integration in DeckViewerHeader and DeckBuilderLayout
  - `ownedCards` state added to DeckBuilderContext
- What remains before the milestone is truly usable end-to-end: S10 (collection auto-update on receipt, final visual audit, end-to-end acceptance proof)

## Tasks

- [x] **T01: Add "I own this" state to DeckBuilderContext and build BFF batch listings endpoint** `est:1h30m`
  - Why: Both are infrastructure the optimizer depends on. The owned-cards state feeds `getMissingCards()` which provides the input to the optimizer. The BFF endpoint provides the listing data the algorithm operates on. Neither is useful without the other, but both must exist before T02 can build the algorithm.
  - Files: `storefront/src/contexts/DeckBuilderContext.tsx`, `storefront/src/app/api/optimizer/listings/route.ts`, `storefront/src/contexts/__tests__/DeckBuilderOwnership.test.tsx`, `storefront/src/app/api/optimizer/__tests__/listings.test.ts`, `storefront/src/lib/optimizer/types.ts`
  - Do: Add `ownedCards: Set<string>` state to DeckBuilderContext with `toggleOwned(catalogSku)`, `isOwned(catalogSku)`, and `getMissingCards()` (returns `{ catalogSku, cardName, quantity }[]` for unowned cards across all zones). Persist per-deck in localStorage keyed by deck ID. Create `POST /api/optimizer/listings` that accepts `{ catalogSkus: string[] }`, parallelizes `GET /store/cards/listings?catalog_sku=X` with concurrency limit of 5 (use `Promise` batching — no external deps), fetches trust batch, merges with `mergeListingsWithTrust` pattern, returns `{ listings: Record<string, BackendListing[]>, errors: string[] }`. Define shared types in `types.ts`.
  - Verify: `npx vitest run src/contexts/__tests__/DeckBuilderOwnership.test.tsx` and `npx vitest run src/app/api/optimizer/__tests__/listings.test.ts`
  - Done when: owned-state toggles persist in localStorage, `getMissingCards()` correctly excludes owned cards, BFF endpoint parallelizes fetches with ≤5 concurrency and returns merged listings with trust data

- [x] **T02: Implement greedy cart optimizer algorithm with three modes** `est:1h30m`
  - Why: The core differentiator — the algorithm that finds optimal seller combinations. Isolated as a pure function so it can be exhaustively tested without UI or network concerns. Highest-risk work in the slice.
  - Files: `storefront/src/lib/optimizer/optimizeCart.ts`, `storefront/src/lib/optimizer/types.ts`, `storefront/src/lib/optimizer/__tests__/optimizeCart.test.ts`
  - Do: Implement `optimizeCart(missingCards, listingsByCard, mode)` as a pure function. Three modes: `cheapest` (minimize total cost including shipping), `fewest-sellers` (minimize number of sellers, break ties by cost), `best-value` (balance cost and seller count — weighted score). Greedy heuristic per D004: deduplicate cards by catalogSku with summed quantities, sort by listing scarcity (fewest available listings first), greedily assign each card to the seller that minimizes incremental cost (price + amortized shipping — shipping is per-seller fixed cost, not per-card). Derive shipping cost from `shippingMethod` when `shippingCost` is null (standard=399, tracked=599 cents). Return `OptimizationResult` with seller groups, per-card assignments, totals, and savings estimate. Handle edge cases: no listings for a card, single seller has everything, all cards owned (empty input), quantity > 1 for same SKU.
  - Verify: `npx vitest run src/lib/optimizer/__tests__/optimizeCart.test.ts` — tests cover all 3 modes, shipping amortization, scarcity ordering, deduplication, edge cases
  - Done when: algorithm returns correct results for all three modes with shipping factored correctly, handles edge cases gracefully, executes in < 10ms for 15 cards (unit test timing assertion)

- [x] **T03: Build CartOptimizerPanel UI and wire deck-to-cart flow end-to-end** `est:2h`
  - Why: Completes R019 (optimizer UI) and R020 (deck-to-cart flow) by building the panel that presents results and wiring "Buy Missing Cards" buttons in both the deck viewer and builder. This is where all the pieces connect.
  - Files: `storefront/src/components/optimizer/CartOptimizerPanel.tsx`, `storefront/src/components/optimizer/SellerGroupCard.tsx`, `storefront/src/components/optimizer/OptimizerModeToggle.tsx`, `storefront/src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx`, `storefront/src/components/decks/DeckViewerHeader.tsx`, `storefront/src/components/deck-builder/DeckBuilderLayout.tsx`
  - Do: Build `CartOptimizerPanel` using Sheet (mobile via `side="bottom"`) and fixed side panel (desktop). Contains: `OptimizerModeToggle` (3 buttons: cheapest/fewest/best-value), `SellerGroupCard` (seller name, rating, per-card rows with condition/price, swap-seller dropdown for override, subtotal + shipping), total with savings callout, staleness indicator ("Results from X min ago" + Refresh after 5 min), "Add to Cart" button. Add-to-cart calls `addToCart()` sequentially for each selected listing, reports partial success ("Added 14/15 — Lightning Bolt NM out of stock"). Wire "Buy Missing Cards" button in `DeckViewerHeader` (replace or augment "Buy All Cards" when deck has owned state) and in `DeckBuilderLayout` toolbar. Panel receives `missingCards` as prop — standalone, not coupled to DeckBuilderContext. Voltage-compliant (no bare Tailwind color classes).
  - Verify: `npx vitest run src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx` and `cd storefront && npm run build`
  - Done when: optimizer panel renders with mode toggle and seller groups, per-card override works, add-to-cart with partial failure handling works, "Buy Missing Cards" buttons wired in viewer and builder, all 854+ tests pass, build succeeds

## Files Likely Touched

- `storefront/src/contexts/DeckBuilderContext.tsx`
- `storefront/src/lib/optimizer/types.ts`
- `storefront/src/lib/optimizer/optimizeCart.ts`
- `storefront/src/app/api/optimizer/listings/route.ts`
- `storefront/src/components/optimizer/CartOptimizerPanel.tsx`
- `storefront/src/components/optimizer/SellerGroupCard.tsx`
- `storefront/src/components/optimizer/OptimizerModeToggle.tsx`
- `storefront/src/components/decks/DeckViewerHeader.tsx`
- `storefront/src/components/deck-builder/DeckBuilderLayout.tsx`
- `storefront/src/contexts/__tests__/DeckBuilderOwnership.test.tsx`
- `storefront/src/lib/optimizer/__tests__/optimizeCart.test.ts`
- `storefront/src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx`
- `storefront/src/app/api/optimizer/__tests__/listings.test.ts`
