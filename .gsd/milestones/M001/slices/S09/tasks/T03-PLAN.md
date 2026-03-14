---
estimated_steps: 5
estimated_files: 8
---

# T03: Build CartOptimizerPanel UI and wire deck-to-cart flow end-to-end

**Slice:** S09 — Cart Optimizer & Deck-to-Cart Flow
**Milestone:** M001

## Description

The UI layer that makes the optimizer actionable, plus the wiring that connects "Buy Missing Cards" → optimizer → cart. Builds the optimizer panel (Sheet on mobile, side panel on desktop), mode toggle, seller group cards with per-card override, add-to-cart with partial failure handling, and staleness indicator. Wires the button in both DeckViewerHeader and DeckBuilderLayout.

## Steps

1. Build `OptimizerModeToggle` in `storefront/src/components/optimizer/OptimizerModeToggle.tsx`:
   - Three buttons: Cheapest (DollarSign icon), Fewest Sellers (Package icon), Best Value (Sparkles icon)
   - Active mode uses `brand-primary` background, inactive uses `bg-surface-2`
   - Calls `onModeChange(mode)` prop on click
   - Voltage-compliant inline styles (no bare Tailwind colors)

2. Build `SellerGroupCard` in `storefront/src/components/optimizer/SellerGroupCard.tsx`:
   - Renders one seller group: seller name, star rating, review count
   - Per-card rows: card name, condition badge (reuse CONDITION_STYLES pattern from AlgoliaCardHit), price
   - Each card row has a "swap" button that opens a dropdown showing alternative sellers for that card (from `listingsByCard`) — selecting an alternative calls `onOverride(catalogSku, newListingId)`
   - Subtotal + shipping line at bottom of group
   - Voltage surface card styling (`bg-surface-2`, `border-stroke`)

3. Build `CartOptimizerPanel` in `storefront/src/components/optimizer/CartOptimizerPanel.tsx`:
   - Props: `missingCards: MissingCard[]`, `open: boolean`, `onClose: () => void`
   - On open: calls `POST /api/optimizer/listings` with unique catalogSkus from missingCards
   - On listings response: runs `optimizeCart()` with current mode, renders results
   - Renders: loading skeleton during fetch → `OptimizerModeToggle` → `SellerGroupCard` per seller group → unavailable cards section (if any) → total cost with savings callout → staleness indicator (timestamp, "Refresh" button after 5 min) → "Add to Cart" button
   - Mode toggle re-runs `optimizeCart()` client-side (no re-fetch — listings are cached)
   - Per-card override: replaces the assignment for that card, re-computes totals
   - "Add to Cart": sequential `addToCart()` calls. Track success/failure per item. On completion, show toast: all succeeded → "Added N cards to cart" (success toast); partial → "Added X/Y cards. {failedCard} from {seller} unavailable" (warning toast); all failed → error toast. Close panel on full success.
   - Mobile: use `Sheet` with `side="bottom"` and max-height 85vh
   - Desktop: use `Sheet` with `side="right"` and width 420px
   - Voltage-compliant: `data-testid` on all major sections

4. Wire "Buy Missing Cards" buttons:
   - `DeckViewerHeader.tsx`: Add "Buy Missing Cards" button next to existing "Buy All Cards". Show "Buy Missing" when the deck has any cards (it receives missingCards as prop from parent). Opens `CartOptimizerPanel` with the deck's cards as missing (viewer doesn't have owned-state — all cards are "missing" by default, user can override in builder).
   - `DeckBuilderLayout.tsx`: Add "Buy Missing" button in the toolbar area. Uses `getMissingCards()` from DeckBuilderContext. Button disabled when no missing cards. Opens `CartOptimizerPanel`.
   - Both buttons use `brand-secondary` (orange) background matching existing "Buy All Cards" pattern.

5. Write tests in `storefront/src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx`:
   - Panel renders loading state then results after fetch
   - Mode toggle switches optimization results without re-fetching
   - Seller groups render with correct card count and totals
   - Per-card override replaces seller and updates totals
   - Add-to-cart calls addToCart for each selected listing
   - Partial failure shows warning with failed card names
   - Staleness: results older than 5 min show refresh button
   - Unavailable cards section renders when some cards have no listings
   - Panel closes on full add-to-cart success
   - Voltage compliance: no bare Tailwind color classes in optimizer component files

## Must-Haves

- [ ] `CartOptimizerPanel` with Sheet (mobile bottom) / Sheet (desktop right) rendering
- [ ] `OptimizerModeToggle` with three modes, re-runs algorithm client-side
- [ ] `SellerGroupCard` with per-card swap-seller override
- [ ] Add-to-cart with partial-success error reporting via toast
- [ ] Staleness indicator with refresh after 5 minutes
- [ ] "Buy Missing Cards" wired in DeckViewerHeader and DeckBuilderLayout
- [ ] Voltage-compliant — zero bare Tailwind color classes
- [ ] Comprehensive tests covering rendering, mode switching, override, add-to-cart, and failure handling
- [ ] All 854+ tests pass, production build succeeds

## Verification

- `npx vitest run src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx` — all tests pass
- `grep -rn "bg-white\|bg-gray-\|text-gray-\|border-gray-" storefront/src/components/optimizer/` — zero matches
- `cd storefront && npx vitest run` — all tests pass (854+ baseline + new)
- `cd storefront && npm run build` — production build succeeds

## Observability Impact

- Signals added: `console.error("[cart-optimizer] Add to cart failed for variant:")` on per-item cart failure; `console.warn("[cart-optimizer] Results stale, timestamp:")` when panel detects staleness
- How a future agent inspects this: `data-testid="optimizer-panel"`, `data-testid="mode-toggle"`, `data-testid="seller-group-{id}"`, `data-testid="add-to-cart-btn"`, `data-testid="staleness-indicator"` — all queryable in browser console
- Failure state exposed: toast messages report exact card names and seller names that failed during add-to-cart

## Inputs

- `storefront/src/lib/optimizer/optimizeCart.ts` — algorithm from T02
- `storefront/src/lib/optimizer/types.ts` — shared types from T01
- `storefront/src/contexts/DeckBuilderContext.tsx` — `getMissingCards()` from T01
- `storefront/src/components/ui/sheet.tsx` — Sheet primitive for mobile/desktop panels
- `storefront/src/lib/data/cart.ts` — `addToCart()` server action
- `storefront/src/components/decks/DeckViewerHeader.tsx` — existing "Buy All Cards" button location
- `storefront/src/components/deck-builder/DeckBuilderLayout.tsx` — toolbar area
- S03 Summary — `DeckViewerHeader` has `totalValue` conditional, `ShoppingCart` icon pattern
- S09 Research — pitfall about partial addToCart failure, dual-context panel usage

## Expected Output

- `storefront/src/components/optimizer/CartOptimizerPanel.tsx` — main optimizer panel component
- `storefront/src/components/optimizer/SellerGroupCard.tsx` — seller group card component
- `storefront/src/components/optimizer/OptimizerModeToggle.tsx` — mode toggle component
- `storefront/src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx` — comprehensive tests
- `storefront/src/components/decks/DeckViewerHeader.tsx` — modified with "Buy Missing Cards" button
- `storefront/src/components/deck-builder/DeckBuilderLayout.tsx` — modified with "Buy Missing" in toolbar
