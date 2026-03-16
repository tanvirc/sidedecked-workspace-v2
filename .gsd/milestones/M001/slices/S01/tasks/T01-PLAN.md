# T01: Audit and align Header to sd-nav.js wireframe spec

**Slice:** S01
**Status:** complete
**Estimate:** 2h

## Goal

Ensure `ModernHeader.tsx` precisely matches the glassmorphic sticky nav, 5-link structure, mobile hamburger + bottom bar, and icon layout defined in `sd-nav.js`. This is the shared component rendered on every page — drift here cascades.

## Files to Touch

- `storefront/src/components/organisms/Header/ModernHeader.tsx`
- `storefront/src/components/organisms/Header/__tests__/ModernHeader.test.tsx` (create)

## What to Do

Read `docs/plans/wireframes/sd-nav.js` fully. Compare its nav HTML/CSS against `ModernHeader.tsx`. Fix any structural divergence:
- Nav link order: Cards / Decks / Marketplace / Sell / Community
- Glassmorphic background: `bg: rgba(24,22,42,0.60) backdrop-blur-[16px]`
- Sticky positioning: `top-0 z-[1000]`
- Desktop icon row: search, wishlist, cart, auth avatar
- Mobile: hamburger menu + bottom nav bar with 4 icons

Write tests asserting:
- Nav links present and in order
- Cart count badge renders when `cart` prop has items
- Mobile menu toggle works
- Auth state renders sign-in button when `user` is null and avatar when `user` is set

Use Voltage tokens only — no `bg-white`, `text-gray-*`.

## Verification Criteria

- `npm test -- --run --reporter=verbose src/components/organisms/Header` — all tests pass
- `grep -rn "bg-white\|text-gray" storefront/src/components/organisms/Header/` — zero matches

## Done When

Header tests pass, zero light-mode class leaks, visual structure matches sd-nav.js spec.

## Actual Outcome

`ModernHeader.tsx` was already implemented. `ModernHeader.test.tsx` was created as the only new file in the slice — a 14-test suite covering:
- Nav link order and hrefs
- Cart badge rendering
- Auth states (signed-out / signed-in / seller)
- Mobile hamburger toggle
- Search bars
- Voltage token compliance

The dual-header structure (desktop `hidden lg:flex` + mobile `lg:hidden flex`) means jsdom renders both simultaneously — all tests use `getAllBy*` variants throughout to handle duplicate elements. Voltage token compliance confirmed; zero `bg-white` / `text-gray-*` matches.
