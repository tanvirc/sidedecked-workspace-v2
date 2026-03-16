# T03: Audit and lock PriceTag component

**Slice:** S01
**Status:** complete
**Estimate:** 1h

## Goal

Confirm `PriceTag` uses the `.price` CSS class (not `font-mono` Tailwind) for tabular figures and applies `--text-price` color via CSS — ensuring price columns align consistently across card grids, detail pages, listings tables, and the optimizer panel.

## Files to Touch

- `storefront/src/components/tcg/PriceTag.tsx`
- `storefront/src/components/tcg/__tests__/PriceTag.test.tsx`

## What to Do

Confirm `PriceTag` applies `className="price ..."` (from `globals.css`) to all price figures — not `font-mono` Tailwind class. Confirm `--text-price` color is applied via the `.price` class in CSS, not inline.

Add/extend tests for:
- Compact variant renders `$12.99` with `.price` class present in DOM
- Inline variant shows seller count
- Detailed variant shows market avg
- `null` price renders "No sellers"
- `trend="down"` renders green arrow

Confirm `price` prop accepts dollar value (not cents).

## Verification Criteria

- `npm test -- --run src/components/tcg/PriceTag` — all pass

## Done When

Tests pass, `.price` class confirmed on all price spans, no inline `fontFamily` or `color` overrides for the numeric figure itself.

## Actual Outcome

`PriceTag.tsx` was already implemented. 9 tests already existed and passed, covering:
- All 3 variants (compact, inline, detailed)
- Null price rendering ("No sellers")
- Seller count display
- Market average display
- Trend indicators (up/down arrow direction and color)
- Accessibility `aria-label`

`.price` CSS class confirmed present on all price spans. No changes to `PriceTag.tsx` were required. Decision D008 codified: PriceTag uses `.price` CSS class from `globals.css` — not inline `font-family`.
