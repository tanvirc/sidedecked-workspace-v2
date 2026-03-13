---
id: S09
milestone: M001
status: ready
---

# S09: Cart Optimizer & Deck-to-Cart Flow — Context

## Goal

Deliver the full deck-to-cart flow: user marks cards as owned in deck builder, taps "Buy Missing Cards", sees an optimizer find the best seller combinations across three modes (cheapest / fewest sellers / best value), adds the optimized selection to a real MedusaJS cart, and proceeds through Stripe checkout in test mode.

## Why this Slice

S09 is the core differentiating feature of SideDecked — the cart optimizer turns deck building into purchasing. Without it, the marketplace is a catalog without a conversion mechanism. S09 depends on S02 (card data patterns), S03 (deck builder "I own this" state), and S08 (live listings exist). S10 depends on S09 for the complete checkout flow needed to prove collection auto-update.

## Scope

### In Scope

- **CollectionContext** — A standalone context (separate from DeckBuilderContext) tracking which cards the user owns. Deck builder UI shows "I own this" toggle per card. Collection state persisted. S10 will wire collection auto-update (receipt confirmation) to this context.
- **"Buy Missing Cards" button** — Wired in deck builder (already stubbed in S03). Computes missing cards list from deck cards minus owned cards. Triggers optimizer.
- **Cart optimizer algorithm** — Greedy heuristic (D004) running server-side. Given a set of missing cards with desired conditions, finds optimal seller combinations. Returns complete result in a single response (< 2s target for 15 cards across 50+ sellers).
- **Three optimizer modes** — Cheapest total (minimize price + shipping), Fewest sellers (minimize number of packages), Best value (balanced price + shipping heuristic). User toggles between modes in the optimizer panel; results recalculate.
- **Optimizer UI** — Bottom sheet on mobile (using existing Sheet component), side panel on desktop. Shows skeleton/spinner while computing, then displays results grouped by seller: seller name, card count, per-card details, subtotal + shipping per seller, grand total with savings callout.
- **No-seller handling with notify-me** — Cards with no sellers in preferred condition show fallback to next available condition. Cards with no sellers at all show "No sellers available" with a "Notify me" button that creates a `NEW_LISTING` price alert using the existing `CreatePriceAlertModal` infrastructure.
- **Cart integration** — Optimized cards added to a real MedusaJS cart via existing cart API (`storefront/src/lib/data/cart.ts`). Items grouped by seller using existing `MultiSellerCartService`.
- **Checkout flow** — User proceeds from cart through existing checkout pages (address → shipping → payment → review) to Stripe test-mode payment. Full deck-to-cart-to-buy proof.
- **Orchestration endpoint** — BFF or API endpoint that takes a list of missing cards and returns optimizer results, querying both backends (listings from backend, card catalog data from customer-backend).

### Out of Scope

- **Per-card seller/condition override** — Tapping a card to see alternative sellers and swap is deferred. Optimizer shows the best result per mode; user takes it or leaves it. Override UI adds significant complexity for MVP.
- **Progressive/streaming results** — No SSE or websocket streaming. Single server response with skeleton UI. The < 2s target makes streaming unnecessary.
- **Collection auto-update on receipt** — S10 scope. S09 creates CollectionContext; S10 wires the `order.receipt.confirmed` → collection update flow.
- **Cart page visual alignment** — S07 scope. S09 wires data flow; visual styling of cart/checkout pages is handled separately.
- **Wishlist integration** — Not in M001 scope.
- **Shipping rate calculation** — Use seller-configured shipping rates from listings. No real-time carrier rate lookup.

## Constraints

- **Split-brain architecture** — Optimizer must query listings from backend and card/catalog data from customer-backend via API. No direct cross-DB access. Both queries must fit within the < 2s budget.
- **Railway DB pool max 10** — Optimizer queries must be batched, not per-card. Fetch all relevant listings in one or two bulk queries.
- **Greedy heuristic (D004)** — Algorithm is greedy, not ILP/exact solver. Sufficient for MVP seller volumes (< 500 sellers). Revisable if conversion data shows suboptimal results.
- **Existing cart API** — Must use MedusaJS cart operations via `storefront/src/lib/data/cart.ts`. Items added via standard `addToCart` flow, not custom cart manipulation.
- **Existing multi-seller checkout** — `MultiSellerCartService` and `multi-seller-checkout` workflow already exist. S09 feeds items into this pipeline, not around it.
- **Existing price alert infrastructure** — `CreatePriceAlertModal` with `NEW_LISTING` alert type exists. "Notify me" for no-seller cards reuses this, not a new system.

## Integration Points

### Consumes

- `storefront/src/contexts/DeckBuilderContext.tsx` — Deck card list, game/format info. S09 adds "I own this" interaction but ownership lives in CollectionContext.
- `storefront/src/components/deck-builder/DeckBuilderLayout.tsx` — "Buy Missing Cards" button placement (S03 stubbed).
- `storefront/src/lib/data/cart.ts` — Cart operations (addToCart, retrieveCart, etc.)
- `backend/apps/backend/src/api/store/consumer-seller/listings/` — Listing data (prices, conditions, seller info, inventory)
- `backend/apps/backend/src/services/multi-seller-cart.service.ts` — Cart analysis grouped by seller
- `backend/apps/backend/src/workflows/checkout/workflows/multi-seller-checkout.ts` — Checkout workflow
- `customer-backend/src/routes/catalog.ts` — Card catalog data for matching cards to listings
- `storefront/src/components/pricing/CreatePriceAlertModal.tsx` — Reused for "Notify me when listed" on no-seller cards
- `storefront/src/components/ui/Sheet` — Mobile bottom sheet for optimizer panel
- S02 card display patterns — `AlgoliaCardHit`, `CardDisplay`, `PriceTag`, condition badge styling
- S08 — Live listings must exist in the database for the optimizer to query

### Produces

- `CollectionContext` — Standalone context tracking card ownership, consumed by deck builder for "I own this" toggles and by optimizer for missing cards computation. S10 wires receipt confirmation to this.
- `CartOptimizerService` — Server-side greedy algorithm finding optimal seller combinations across three modes
- `CartOptimizerPanel` — UI component (Sheet on mobile, side panel on desktop) displaying optimization results with mode toggle
- Orchestration endpoint — BFF endpoint accepting missing cards list, returning optimizer results
- "Buy Missing Cards" → optimizer → cart → checkout — Full wired flow
- "Notify me" integration for cards with no sellers — Creates NEW_LISTING price alert

## Open Questions

- **Orchestration endpoint location** — Should the optimizer endpoint be a storefront BFF route (Next.js API route querying both backends) or a new backend endpoint? Current thinking: BFF route, since it needs to aggregate data from both backends and the storefront already has this pattern.
- **CollectionContext persistence** — Should ownership data be persisted server-side (customer-backend) or client-side (localStorage + optional server sync)? Current thinking: server-side in customer-backend since S10 needs receipt confirmation to update it, and it should survive device changes.
- **Best value mode heuristic** — How exactly to balance price vs. shipping in "best value" mode. Current thinking: minimize (total price + total shipping) with a penalty for each additional seller (e.g., $2 per seller) to prefer consolidation without ignoring price.
- **Condition preference** — Should the optimizer default to the user's preferred condition (e.g., NM) or always find the cheapest regardless of condition? Current thinking: default to NM, show condition fallback suggestions when NM isn't available for a card.
