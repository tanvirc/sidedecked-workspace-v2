---
estimated_steps: 5
estimated_files: 7
---

# T03: Card detail page visual alignment, mobile tabs, and related cards

**Slice:** S02 — Card Browse, Detail & Search — Pixel Perfect
**Milestone:** M001

## Description

The card detail page already has the correct 3-column grid layout (360px | 1fr | 320px) with the right sub-components (GameStatsDisplay, PriceInsightsSection, CompactPrintingsTable, RulingsAccordion, QuickBuyPanel, QuickSellerList). The gap is visual polish: glass-card backgrounds on info sections, wireframe-precise typography and spacing, mobile tab navigation expanding from 2 tabs to 4 (Details, Prices, Sellers, Printings), and the "You Might Also Like" related cards section which doesn't exist yet.

## Steps

1. **Apply glass-card backgrounds to info sections** — The wireframe uses `rgba(33,32,58,0.60)` with `backdrop-filter: blur(8px)` and `border: 1px solid var(--border-default)` with 16px border-radius on GameStatsDisplay, PriceInsightsSection, and CompactPrintingsTable wrappers. The QuickBuyPanel uses a stronger glass: `rgba(33,32,58,0.75)` with `backdrop-filter: blur(12px)` and `border-strong`. Add these as CSS classes in `card-detail.module.css` (`.glassCard`, `.glassCardStrong`) and apply to the respective sections in CardDetailPage.tsx. Ensure 20px vertical gap between glass cards (`margin-top: 20px` on subsequent cards).

2. **Align typography and spacing to wireframe** — Card title: `font-display` 32px 700 weight (currently may differ). Section titles: `font-heading` 14px 600 weight, uppercase, `letter-spacing: 0.06em`. Game badge: 11px semibold uppercase with game-color bg. Set line: 14px secondary. Mana cost symbols: 24px circles. Stat rows: 13px label/value, 10px padding, bottom border `rgba(44,42,74,0.5)`. Rules text: 14px, left 3px brand-primary border, dark inset bg. Verify these against existing code and correct any that don't match.

3. **Expand mobile tabs from 2 to 4** — Current code has `[card-info, legality]` tabs. Wireframe shows `[Details, Prices, Sellers, Printings]`. Map: Details → GameStatsDisplay + RulingsAccordion, Prices → PriceInsightsSection, Sellers → QuickSellerList/MarketplaceListingsSection, Printings → CompactPrintingsTable. Update the `activeTab` state type and the mobile tab rendering. Tab bar: 13px font, 600 weight, tertiary color default, brand-primary active with 2px bottom border. Ensure sticky bottom buy bar remains below tabs on mobile.

4. **Create `RelatedCards` component** — "You Might Also Like" section rendered below the 3-column layout (full width). Horizontal scroll of related card tiles (150px wide, 210px image height, 10px border-radius, name truncated, mono price). Data source options: (a) Algolia query for same-set cards excluding current card, (b) same-game cards in similar price range, or (c) server-passed related cards. For MVP, accept a `relatedCards` prop array and render them. If no related cards data available, render a simple same-set link instead. Desktop shows up to 8 cards in a scroll row. Mobile shows smaller cards (110px wide, 154px image).

5. **Verify and fix print selector and sticky buy bar** — Print selector thumbnails should be 48×67px, 6px radius, 2px border. Active thumb: brand-primary border + subtle bg tint. Print count text below. Sticky bottom buy bar on mobile: `backdrop-filter: blur(16px)`, surface-1 bg at 92% opacity, border-top, price on left, add-to-cart button on right (brand-primary bg, heading font 14px 700). Verify these match and correct any that don't.

## Must-Haves

- [ ] Glass-card backgrounds on GameStatsDisplay, PriceInsightsSection, CompactPrintingsTable wrappers
- [ ] QuickBuyPanel uses stronger glass variant (0.75 opacity, blur(12px), border-strong)
- [ ] Card title renders in font-display at 32px
- [ ] Mobile tabs show 4 tabs: Details, Prices, Sellers, Printings
- [ ] Each mobile tab renders the correct content section
- [ ] RelatedCards component renders horizontal scroll of related card tiles
- [ ] RelatedCards section appears below the 3-column layout on desktop
- [ ] All existing CardDetailPage tests pass without modification (or with minimal mock updates)

## Verification

- `npx vitest run src/components/cards/CardDetailPage.test.tsx` — all existing tests pass
- `npx vitest run src/components/cards/__tests__/RelatedCards.test.tsx` — new RelatedCards tests pass
- `npx vitest run` — full suite passes
- Card detail page at 1440px shows glass-card sections with blur backgrounds
- Mobile card detail shows 4 tabs and switching between them works
- "You Might Also Like" section visible below main content

## Inputs

- `storefront/src/components/cards/CardDetailPage.tsx` — 575-line component to visually align
- `storefront/src/styles/card-detail.module.css` — existing mobile styles to extend
- `docs/plans/wireframes/storefront-card-detail.html` — authoritative visual target
- `storefront/src/components/cards/CardDetailPage.test.tsx` — existing tests that must keep passing
- S01 summary — `.price` CSS class, Voltage token patterns

## Expected Output

- `storefront/src/components/cards/CardDetailPage.tsx` — updated with glass-card classes, typography fixes, 4 mobile tabs
- `storefront/src/components/cards/RelatedCards.tsx` — new component for "You Might Also Like" section
- `storefront/src/components/cards/__tests__/RelatedCards.test.tsx` — tests for RelatedCards
- `storefront/src/styles/card-detail.module.css` — updated with .glassCard, .glassCardStrong classes, mobile tab styles
- `storefront/src/components/cards/GameStatsDisplay.tsx` — minor styling adjustments if needed
- `storefront/src/components/cards/QuickBuyPanel.tsx` — glass-card-strong applied if not already wrapper-level
