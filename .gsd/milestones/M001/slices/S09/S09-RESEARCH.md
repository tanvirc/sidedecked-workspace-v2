# S09: Cart Optimizer & Deck-to-Cart Flow — Research

**Date:** 2026-03-14

## Summary

S09 is greenfield across three layers: (1) the optimizer algorithm that finds optimal seller combinations for missing cards, (2) the UI panel that presents results and allows overrides, and (3) the "I own this" state management in the deck builder that feeds the missing cards list. No optimizer code exists anywhere in the codebase. The key infrastructure is solid — listings are queryable by `catalog_sku`, `addToCart` accepts `variantId`, multi-seller cart analysis and checkout routes exist, and the `Sheet` UI primitive is available for the mobile bottom sheet.

The critical constraint is that the backend listings endpoint (`GET /store/cards/listings`) only accepts a single `catalog_sku`. For 15+ missing cards, sequential queries will be necessary unless we add a batch endpoint. At ~100ms per query, 15 sequential calls would take ~1.5s, which is tight against the 2s budget. A BFF batch endpoint in the storefront that parallelizes these calls is the right approach — avoids backend changes and keeps the 2s budget achievable.

No wireframe exists for the optimizer panel — this is pure spec-driven work from the PRD (Alex's journey) and Story 5.2 in the epics. The PRD specifies three optimization modes (cheapest total, fewest sellers, best value), progressive loading, per-card seller overrides, and out-of-stock fallback messaging.

## Requirements Targeted

| ID | Title | Role |
|----|-------|------|
| R018 | Cart optimizer algorithm | Primary owner |
| R019 | Cart optimizer UI | Primary owner |
| R020 | Deck-to-cart flow | Primary owner |

## Recommendation

**Build the optimizer as a client-side algorithm with a BFF batch listings endpoint.** The algorithm runs in the storefront (no server-side service needed for MVP volumes). A new `/api/optimizer/listings` BFF route parallelizes listing fetches across multiple `catalog_sku` values against the backend, returning all listings in one response. The greedy heuristic (D004) is the right call — sort cards by listing scarcity, then greedily assign each card to the seller that minimizes incremental cost (price + amortized shipping).

**Four work areas:**
1. **DeckBuilderContext: "I own this" state** — Add `ownedCards: Set<string>` (by catalogSku) to context, with `toggleOwned(catalogSku)` and `getMissingCards()` computed. Persist per-deck in localStorage.
2. **BFF batch endpoint** — `POST /api/optimizer/listings` accepts `{ catalogSkus: string[] }`, parallelizes calls to backend listings endpoint + trust batch, returns `Record<catalogSku, BackendListing[]>`.
3. **Optimizer algorithm** — Pure function: `optimize(missingCards, listingsByCard, mode) → OptimizationResult`. Three modes: cheapest, fewest-sellers, best-value. Greedy heuristic with shipping cost factoring.
4. **Optimizer UI** — `CartOptimizerPanel` wrapping shadcn `Sheet` (mobile) / side panel (desktop). Mode toggle, seller groups with per-card override, add-to-cart action.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Mobile bottom sheet | `storefront/src/components/ui/sheet.tsx` (shadcn) | Already used in deck builder, matches Voltage patterns |
| Cart line item creation | `addToCart()` in `storefront/src/lib/data/cart.ts` | Server action that handles existing/new items, cache revalidation |
| Seller grouping logic | `CartEnrichmentService.groupItemsBySeller()` in `storefront/src/lib/services/cart-enrichment.ts` | Pattern reference for seller group rendering |
| Listing data shape | `BackendListing` type in `storefront/src/types/bff.ts` | Already defines condition, price, seller, shipping cost |
| Multi-seller checkout | `POST /store/carts/{cartId}/multi-seller/checkout` | Backend route exists and handles payment splits |
| Card detail listing fetch | `fetchListingsWithFallback()` in `storefront/src/lib/services/cardDetailBFF.ts` | Reuse fetch pattern for listings endpoint |
| Trust data fetch | `fetchTrustBatch()` in `storefront/src/lib/services/cardDetailBFF.ts` | Batch seller trust ratings |

## Existing Code and Patterns

- `storefront/src/contexts/DeckBuilderContext.tsx` — Deck state management. Has `addCard`, `removeCard`, card zone management. **Missing:** "I own this" toggle, missing cards computation. S09 must add `ownedCards` state and `toggleOwned`/`getMissingCards` methods.
- `storefront/src/types/deck.ts` — `DeckCard` has `catalogSku: string` (3-part format like `MTG-MKM-242`). This matches the `catalog_sku` used in listings endpoint metadata filter.
- `storefront/src/lib/services/cardDetailBFF.ts` — BFF pattern for fetching listings by single `catalog_sku` from `GET /store/cards/listings`, plus trust batch. The optimizer's BFF endpoint should follow this pattern but accept multiple SKUs.
- `storefront/src/lib/data/cart.ts` — `addToCart({ variantId, quantity, countryCode })` server action. The optimizer will call this for each selected listing. The `variantId` comes from the listing's `id` field.
- `storefront/src/types/bff.ts` — `BackendListing` interface: `id` (variant ID for cart), `catalogSku`, `condition`, `price` (cents), `sellerId`, `sellerName`, `shippingCost` (cents, optional), `shippingMethod`.
- `backend/apps/backend/src/api/store/cards/listings/route.ts` — Single-SKU listings query via metadata JSONB containment. Returns `ListingRow[]` with `id`, `catalog_sku`, `condition`, `price`, `seller_id`, `shipping_method`.
- `backend/apps/backend/src/api/store/cards/listings/utils.ts` — `mapVariantToListing()` extracts condition, language, finish, price, quantity from variant metadata. `seller_type` derived from metadata.
- `storefront/src/components/decks/DeckViewerHeader.tsx` — Has "Buy All Cards" button (brand-secondary orange, ShoppingCart icon). Needs "Buy Missing Cards" that opens the optimizer panel.
- `storefront/src/components/deck-builder/DeckBuilderLayout.tsx` — 414 lines. Builder toolbar area where "I own this" toggle control and "Buy Missing" button will be integrated.
- `storefront/src/lib/services/cart-enrichment.ts` — `EnrichedCart` type with `seller_groups` array. Pattern reference for how seller groups are structured (seller_id, seller_name, items, subtotal).
- `backend/apps/backend/src/api/store/carts/multi-seller/route.ts` — Multi-seller cart analysis and checkout. Cart analysis returns seller groups with subtotals and shipping. Checkout handles Stripe payment splits.

## Constraints

- **Single-SKU listings endpoint.** Backend `GET /store/cards/listings` accepts one `catalog_sku`. Batch queries must be orchestrated in the BFF layer (storefront API route) via parallel fetches.
- **2-second performance budget.** R018 requires <2s for 15 cards. With ~100ms per listing fetch parallelized, the network layer needs <500ms. Algorithm must process in <100ms. Trust batch is one additional call.
- **Split-brain DB rule.** Optimizer queries listings from backend (Medusa) and card data from customer-backend. No direct cross-DB queries. The BFF endpoint handles this orchestration.
- **Railway DB pool limit (10 connections).** Parallel listing queries hitting the backend must not exceed ~5 concurrent to leave headroom. Use concurrency limiter (e.g., `p-limit` or manual batching of 5).
- **Shipping cost data is sparse.** `BackendListing.shippingCost` is optional and currently not populated by the listings endpoint. The `mapVariantToListing` utility doesn't derive shipping cost from `shipping_method`. For MVP, use flat-rate estimates: standard = $3.99, tracked = $5.99 per seller. This matches the listing wizard's `ShippingSelector` options.
- **`addToCart` is a server action** — it runs on the server and takes `{ variantId, quantity, countryCode }`. Adding multiple items requires sequential calls (or a new batch endpoint). For 15 items, sequential `addToCart` calls will add ~2-3s to the "Add to Cart" action. Acceptable for MVP.
- **DeckCard.catalogSku format** — 3-part SKU (`GAME-SET-NUMBER`, e.g., `MTG-MKM-242`). This is the base SKU used to query listings. Listings may have multiple conditions/sellers for the same base SKU. The optimizer picks the best listing per card.

## Common Pitfalls

- **Over-engineering the algorithm.** The globally optimal solution (minimum cost covering all cards with shipping) is a variant of set cover / facility location — NP-hard. A greedy heuristic is correct for MVP (D004). Don't reach for ILP solvers.
- **Stale listing data during optimization.** User optimizes, then takes 10 minutes to decide. Listing goes out of stock. Solution: timestamp the optimization result, show "Results from X minutes ago" after 5 minutes, add "Refresh" button.
- **Forgetting shipping cost amortization.** If seller A has 5 of your 15 cards and charges $3.99 shipping, the marginal cost of adding a 6th card from seller A is $0 shipping. The greedy must factor shipping as a per-seller fixed cost, not per-card.
- **DeckBuilderContext re-render storms.** Adding `ownedCards` as state will cause re-renders on every toggle. Use a `useRef` + `useState` pattern or memoize heavily. The existing context already has many state variables — measure impact.
- **Sequential addToCart calls failing midway.** If adding 15 items to cart and item 8 fails (variant sold out), the first 7 are already added. Need error handling that reports partial success: "Added 14/15 cards. Lightning Bolt (NM from SellerX) is out of stock."
- **Dual-rendering confusion.** The optimizer panel serves two contexts: deck viewer (read-only, "Buy Missing" from header) and deck builder (editable, "Buy Missing" from toolbar). Keep the optimizer panel as a standalone component that receives `missingCards` as a prop — don't couple it to DeckBuilderContext.

## Open Risks

- **No real listings in dev environment.** Testing the optimizer end-to-end requires published listings from the listing wizard (S08). If no test listings exist, the optimizer will return empty results. Mitigate with a seeded test flow or mock listings in tests.
- **`shippingCost` not populated on listings.** The backend `mapVariantToListing` returns `shipping_method` but not `shipping_cost`. The optimizer must derive costs from the method string. If the backend later populates actual costs, the optimizer must prefer them over estimates.
- **Performance with 60 cards (5s budget).** 60 parallel listing fetches with concurrency limit of 5 = 12 batches × ~100ms = ~1.2s network + algorithm time. Should be within 5s budget, but add progressive rendering so partial results show while later batches complete.
- **Card deduplication.** A deck might have 4× Lightning Bolt. The optimizer should query listings once per unique `catalogSku`, then allocate quantity. Don't query the same SKU 4 times.
- **Owned state persistence.** If localStorage is used per-deck, and the user clears browser data, owned state is lost. Acceptable for MVP — note as known limitation. Future: persist to customer-backend.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| MedusaJS | `medusajs/medusa-agent-skills@building-with-medusa` | Available (781 installs) — useful for cart/listing API patterns |
| MedusaJS storefront | `medusajs/medusa-agent-skills@storefront-best-practices` | Available (690 installs) — relevant for server actions + cart |
| Next.js | (not searched — well-known) | n/a |
| React/shadcn | (not searched — well-known) | n/a |

## Architecture Sketch

```
┌─────────────────────────────────────────────────┐
│ Deck Builder / Deck Viewer                      │
│                                                 │
│  ownedCards: Set<catalogSku>                    │
│  missingCards = allCards - ownedCards            │
│                                                 │
│  [Buy Missing Cards] ─────────────────────────┐ │
└────────────────────────────────────────────────┼─┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────┐
│ CartOptimizerPanel (Sheet mobile / panel desktop)│
│                                                 │
│  Mode: [Cheapest] [Fewest] [Best Value]         │
│                                                 │
│  ┌─ Seller Group ────────────────────┐          │
│  │ SellerName ★4.8 (12 reviews)     │          │
│  │  Card1 NM  $2.50                  │          │
│  │  Card2 LP  $1.80  [swap seller]   │          │
│  │  Subtotal: $4.30 + $3.99 ship     │          │
│  └───────────────────────────────────┘          │
│                                                 │
│  Total: $43.20  Saves $8.20                     │
│  [Add to Cart]                                  │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ POST /api/optimizer/listings (BFF)              │
│                                                 │
│  Input: { catalogSkus: string[] }               │
│  Parallel: GET /store/cards/listings?catalog_sku│
│            POST /api/sellers/trust/batch        │
│  Output: Record<sku, BackendListing[]>          │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌──────────────┴──────────────────────────────────┐
│ optimizeCart(missing, listings, mode)            │
│                                                 │
│  Pure function — greedy heuristic               │
│  Factors: price + shipping + condition           │
│  Returns: SellerGroup[] with assignments        │
└─────────────────────────────────────────────────┘
```

## Data Flow

1. User toggles "I own this" on cards → `ownedCards` set updated in DeckBuilderContext, persisted to localStorage
2. User taps "Buy Missing Cards" → `getMissingCards()` computes list of `{ catalogSku, cardName, quantity }` for unowned cards
3. `CartOptimizerPanel` opens, calls `POST /api/optimizer/listings` with unique catalogSkus
4. BFF endpoint parallelizes `GET /store/cards/listings?catalog_sku=X` calls (concurrency: 5), fetches trust batch
5. Results returned: `Record<catalogSku, BackendListing[]>`
6. Client-side `optimizeCart()` runs greedy algorithm with selected mode
7. Results displayed grouped by seller with per-card override capability
8. User taps "Add to Cart" → sequential `addToCart()` calls for each selected listing variant
9. User proceeds to existing checkout flow (multi-seller cart already handled by backend)

## Sources

- PRD Alex's journey (source: `_bmad-output/planning-artifacts/prd.md` lines 110-140)
- Story 5.2: Cart Optimizer spec (source: `_bmad-output/planning-artifacts/epics.md` lines 1084-1119)
- Story 5.1: Cart management spec (source: `_bmad-output/planning-artifacts/epics.md` lines 1056-1083)
- Listings endpoint (source: `backend/apps/backend/src/api/store/cards/listings/route.ts`)
- BFF pattern (source: `storefront/src/lib/services/cardDetailBFF.ts`)
- Cart server actions (source: `storefront/src/lib/data/cart.ts`)
- DeckBuilderContext (source: `storefront/src/contexts/DeckBuilderContext.tsx`)
- D004 decision: Greedy heuristic (source: `.gsd/DECISIONS.md`)
