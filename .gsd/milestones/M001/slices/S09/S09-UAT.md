# S09: Cart Optimizer & Deck-to-Cart Flow — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven + live-runtime)
- Why this mode is sufficient: Algorithm correctness proven by 22 unit tests. UI behavior proven by 18 component tests. Live runtime needed for visual verification at both breakpoints and end-to-end flow with real backend data.

## Preconditions

- All 4 services running: backend (MedusaJS), customer-backend, storefront (`npm run dev`), vendorpanel
- At least one deck exists with 10+ cards (can use public deck browser or create via builder)
- At least some cards in that deck have active listings in the marketplace (requires seller to have listed cards via wizard)
- User is authenticated (for add-to-cart functionality)

## Smoke Test

Open a deck in the viewer (`/decks/[id]`). Confirm "Buy Missing Cards" button appears. Tap it. Optimizer panel (Sheet) opens showing loading state, then seller groups with card assignments and a total.

## Test Cases

### 1. Owned cards toggle in deck builder

1. Open deck builder (`/decks/builder/new` or `/decks/[id]/edit`)
2. Add several cards to the deck
3. Look for "I own this" toggle on cards (or ownership indicator)
4. Toggle ownership on 3-4 cards
5. Close and reopen the deck builder
6. **Expected:** Previously toggled cards still show as owned (localStorage persistence)

### 2. Buy Missing Cards from deck viewer

1. Open a deck in the viewer (`/decks/[id]`)
2. Tap "Buy Missing Cards" button
3. **Expected:** Optimizer panel opens as a right-side Sheet, shows loading skeleton, then populates with seller groups

### 3. Optimizer mode toggle

1. With optimizer panel open, observe default mode (cheapest)
2. Tap "Fewest Sellers" mode button
3. **Expected:** Results re-render with fewer seller groups (cards consolidated). Total may be higher.
4. Tap "Best Value" mode button
5. **Expected:** Results show a balance — may match either cheapest or fewest depending on price difference

### 4. Per-card seller override

1. With optimizer panel showing results, find a card in a seller group
2. Tap the swap/override button for that card
3. Select a different seller from the dropdown
4. **Expected:** Card moves to the selected seller's group. Group totals recalculate. Overall total updates.

### 5. Add to cart — full success

1. With optimizer results showing, tap "Add to Cart"
2. **Expected:** Success toast appears ("Added N/N cards to cart"). Panel closes. Cart count in nav updates.

### 6. Staleness indicator

1. Open optimizer panel and wait 5+ minutes without refreshing
2. **Expected:** "Results from X min ago" text appears with a "Refresh" button
3. Tap Refresh
4. **Expected:** Panel re-fetches listings and re-runs optimizer

### 7. Buy Missing Cards from deck builder

1. Open deck builder with a saved deck
2. Mark some cards as owned
3. Tap "Buy Missing" button in toolbar
4. **Expected:** Optimizer panel opens with only unowned cards as missing cards

### 8. Mobile layout (390px)

1. Resize browser to 390px width (or use mobile device)
2. Open optimizer panel
3. **Expected:** Panel renders as bottom Sheet (not side panel). Mode toggle, seller groups, and add-to-cart button are all accessible and scrollable.

## Edge Cases

### All cards owned

1. In deck builder, mark all cards as owned
2. "Buy Missing" button should be disabled or absent
3. **Expected:** No optimizer panel opens — nothing to optimize

### No listings available

1. Open optimizer for a deck with obscure cards that have no marketplace listings
2. **Expected:** Panel shows "unavailable cards" section listing cards with no sellers. Remaining cards (if any) still optimized.

### Partial add-to-cart failure

1. If a listing goes out of stock between optimization and add-to-cart
2. **Expected:** Warning toast: "Added X/Y cards — [card name] could not be added." Failed cards are named.

## Failure Signals

- "Buy Missing Cards" button missing from DeckViewerHeader or DeckBuilderLayout
- Optimizer panel never loads (stuck on skeleton) — check browser console for `[cart-optimizer]` errors
- Mode toggle doesn't change results — algorithm may not be receiving mode change
- Add-to-cart silently fails — check console for `[cart-optimizer] Add to cart failed for variant:` errors
- Light-mode colors appear in optimizer panel — Voltage compliance violation

## Requirements Proved By This UAT

- R018 — cart optimizer algorithm produces correct grouped results across all 3 modes with shipping
- R019 — optimizer UI renders panel with mode toggle, seller groups, overrides, staleness, add-to-cart
- R020 — deck-to-cart flow works end-to-end: owned state → missing cards → optimize → cart

## Not Proven By This UAT

- R021 — collection auto-update on receipt (S10 scope)
- Performance under load — < 2s with 15 cards across 50+ sellers in production (needs real data volume)
- Cross-service data freshness — optimizer queries return current inventory (needs live multi-service environment)

## Notes for Tester

- The optimizer panel visual design should be verified against Voltage design language at both 1440px (side Sheet) and 390px (bottom Sheet) breakpoints.
- If no listings exist in the marketplace, the optimizer will show all cards as unavailable — you need seeded listing data to see the full flow.
- The pre-existing `CardSearchInput.tsx` type error was fixed in this slice — if you see build failures in that file, something has regressed.
- Console filtering by `[cart-optimizer]` shows all optimizer-related diagnostic output.
