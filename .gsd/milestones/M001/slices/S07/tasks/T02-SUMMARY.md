---
id: T02
parent: S07
milestone: M001
provides:
  - Zero bare light-mode Tailwind color classes in Cart, OrderConfirmed, and checkout commerce components
key_files:
  - storefront/src/components/sections/Cart/EnhancedCartItems.tsx
  - storefront/src/components/sections/Cart/Cart.tsx
  - storefront/src/components/sections/Cart/InventoryValidator.tsx
  - storefront/src/components/sections/OrderConfirmedSection/OrderConfirmedSection.tsx
key_decisions:
  - Used rgba() backgrounds with CSS custom property text colors for semantic status badges (positive/negative/warning) — consistent with T01 pattern from EnhancedPriceAlerts
patterns_established:
  - Inventory status indicators use rgba tinted backgrounds (e.g. rgba(239,68,68,0.08)) with var(--negative/positive/warning) text — preserves semantic meaning in dark mode without needing separate dark variants
observability_surfaces:
  - none
duration: 20min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Align commerce pages — cart, checkout, order-confirmed

**Converted ~57 bare light-mode Tailwind color refs across 4 commerce components to Voltage tokens.**

## What Happened

Converted all light-mode Tailwind color classes in the commerce page components:

- **EnhancedCartItems.tsx** (~35 refs): `bg-white` → `bg-card`, `text-gray-*` → `var(--text-primary/secondary/tertiary)`, `bg-gray-*` → `var(--bg-surface-2)`, `bg-blue-*` → `var(--bg-surface-2)`, `bg-yellow-*`/`bg-purple-*` → rgba() + semantic tokens, `text-red-*` → `var(--negative)`, `text-green-*` → `var(--positive)`, `border-gray-*` → `border-border`, `hover:bg-gray-100` → `hover:opacity-80`
- **Cart.tsx** (3 refs): Multi-seller callout `bg-blue-50 border-blue-200 text-blue-800` → `var(--bg-surface-2)` + `border-border` + `var(--text-secondary)`
- **InventoryValidator.tsx** (~20 refs): Loading, success, warning, and error status sections all converted. Green/yellow/red semantic backgrounds use rgba tints with `var(--positive/warning/negative)` text. Spinners, links, and footer border all tokenized.
- **OrderConfirmedSection.tsx** (1 ref): `bg-white` → `bg-card`

Spot-checked all checkout-adjacent sections (CartAddressSection, CartPaymentSection, CartReview, CartShippingMethodsSection, OrderDetailsSection, OrderReturnRequests, OrderReturnSection) — all clean except ReturnItemsTab which has 1 `text-red-700` outside T02 scope.

## Verification

- `grep -rn "bg-white|text-gray-[0-9]|..." src/components/sections/Cart/ src/components/sections/OrderConfirmedSection/` → **zero matches** ✅
- `npx vitest run` → **794 tests passed** ✅
- Slice-level grep: Cart and OrderConfirmed sections clean; seller components still have refs (T03/T04 scope) — expected intermediate state

## Diagnostics

None — styling-only changes, no runtime behavior.

## Deviations

None.

## Known Issues

- `src/components/sections/OrderReturnSection/ReturnItemsTab.tsx` has 1 `text-red-700` ref — outside T02 commerce scope, noted for T05 sweep.

## Files Created/Modified

- `storefront/src/components/sections/Cart/EnhancedCartItems.tsx` — 35 light-mode refs converted to Voltage tokens
- `storefront/src/components/sections/Cart/Cart.tsx` — Multi-seller callout restyled with Voltage tokens
- `storefront/src/components/sections/Cart/InventoryValidator.tsx` — 20 light-mode refs converted, semantic status colors preserved via rgba tints
- `storefront/src/components/sections/OrderConfirmedSection/OrderConfirmedSection.tsx` — 1 bg-white converted to bg-card
