---
estimated_steps: 5
estimated_files: 6
---

# T02: Align commerce pages — cart, checkout, order-confirmed

**Slice:** S07 — Remaining Pages — Visual Alignment
**Milestone:** M001

## Description

Convert ~56 bare light-mode Tailwind color references in commerce page components to Voltage tokens. The bulk of the work is in `EnhancedCartItems.tsx` (35 refs) and `InventoryValidator.tsx` (20 refs). Cart.tsx has a `bg-blue-50 border-blue-200` callout to fix. Checkout components are mostly clean. OrderConfirmedSection has 1 ref. No logic changes — styling only.

## Steps

1. Read the wireframe `storefront-cart.html` to understand the target layout — seller-grouped items, promo code section, summary sidebar.
2. Convert 35 light-mode Tailwind refs in `EnhancedCartItems.tsx` to Voltage tokens. Replace `bg-white` → `bg-card`, `text-gray-*` → `var(--text-secondary)` / `var(--text-tertiary)`, `bg-blue-*` → `var(--bg-surface-2)`, `border-gray-*` → `border-border`. Watch for conditional className patterns — update both sides of ternaries.
3. Fix `Cart.tsx` multi-seller callout: replace `bg-blue-50 border-blue-200 text-blue-800` with Voltage equivalents (e.g., info-toned surface using `var(--bg-surface-2)` and `var(--text-secondary)`).
4. Convert 20 light-mode refs in `InventoryValidator.tsx`. Fix status indicators (`bg-red-*`, `bg-green-*`, `bg-yellow-*`) with Voltage semantic tokens.
5. Fix 1 ref in `OrderConfirmedSection.tsx`. Spot-check `CartShippingMethodsSection.tsx` and other checkout components for any remaining light-mode classes.

## Must-Haves

- [ ] Zero bare light-mode Tailwind color classes in `EnhancedCartItems.tsx`
- [ ] Zero bare light-mode Tailwind color classes in `Cart.tsx`
- [ ] Zero bare light-mode Tailwind color classes in `InventoryValidator.tsx`
- [ ] Zero bare light-mode Tailwind color classes in `OrderConfirmedSection.tsx`
- [ ] Checkout components checked for Voltage compliance
- [ ] All existing tests pass

## Verification

- `npx vitest run` — all 794+ tests pass
- `grep -rn "bg-white\|text-gray-[0-9]\|bg-gray-[0-9]\|bg-blue-[0-9]\|border-gray-[0-9]\|text-blue-[0-9]\|bg-green-[0-9]\|text-green-[0-9]\|bg-red-[0-9]\|text-red-[0-9]\|bg-yellow-[0-9]\|text-yellow-[0-9]" src/components/sections/Cart/ src/components/sections/OrderConfirmedSection/` — zero matches

## Inputs

- `docs/plans/wireframes/storefront-cart.html` — cart wireframe alignment target
- `docs/plans/wireframes/storefront-checkout.html` — checkout wireframe (minimal header, no nav/footer)
- `docs/plans/wireframes/storefront-order-confirmed.html` — order confirmation wireframe
- T01 completed — user-account pages aligned (no dependency, but establishes Voltage conversion patterns)

## Expected Output

- `src/components/sections/Cart/EnhancedCartItems.tsx` — 35 light-mode refs converted
- `src/components/sections/Cart/Cart.tsx` — multi-seller callout restyled
- `src/components/sections/Cart/InventoryValidator.tsx` — 20 light-mode refs converted
- `src/components/sections/OrderConfirmedSection/OrderConfirmedSection.tsx` — 1 ref converted
- `src/components/sections/CartShippingMethodsSection/CartShippingMethodsSection.tsx` — checked, fixed if needed
