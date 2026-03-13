---
id: T05
parent: S07
milestone: M001
provides:
  - Community page rebuilt to match wireframe "Coming Soon" hero + feature preview grid + Discord CTA
  - Zero bare light-mode Tailwind color classes across all S07-scoped components (final sweep)
  - All 794 tests passing, build succeeds
key_files:
  - storefront/src/app/[locale]/(main)/community/page.tsx
  - storefront/src/components/seller/CardListingForm.tsx
  - storefront/src/components/seller/ConditionGuide.tsx
  - storefront/src/components/seller/FeeCalculator.tsx
  - storefront/src/components/seller/ListingSuccessScreen.tsx
  - storefront/src/components/seller/SellerResponseBadge/SellerResponseBadge.tsx
  - storefront/src/components/sections/OrderReturnSection/ReturnItemsTab.tsx
key_decisions:
  - ConditionGuide converted from Tailwind color class maps to inline style maps (borderColor/bgColor/ringColor) since rgba graded condition colors cannot be expressed as static Tailwind utility classes with CSS custom properties
  - SellerResponseBadge tier config converted from Tailwind class maps (bg-yellow-100 dark:bg-yellow-900/30) to inline style value maps — same pattern as T03/T04 tier colors
patterns_established:
  - Ring/focus highlight for interactive condition buttons uses inline boxShadow instead of Tailwind ring-* classes when color needs to be dynamic
observability_surfaces:
  - None — styling-only changes, no runtime behavior
duration: ~15min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T05: Align misc pages and run final Voltage compliance sweep

**Rebuilt community page to wireframe layout, fixed 5 remaining S07 components with bare light-mode refs, confirmed zero violations across all scoped files.**

## What Happened

Read the community wireframe — structure is hero (icon + title + description + "Launching Soon" badge) → 6 emoji feature cards in 3-col grid → stats card → Discord CTA. Current page had the same conceptual sections but used SVG icons, different feature names, and "Browse Cards / View Sellers" buttons instead of Discord CTA.

Rebuilt community/page.tsx to match wireframe exactly: emoji-based feature cards with gradient icon backgrounds, "Launching Soon" badge, stats section, and Discord CTA with branded #5865F2 button. Used Voltage tokens throughout (bg-surface-1, text-primary, text-secondary, text-action, etc.). Mobile layout collapses feature grid to single column with horizontal card layout.

Spot-checked InfoPage.tsx (already clean — bg-surface-1, text-brand-primary, border-default), reset-password/page.tsx (minimal — just Card + form), and categories/collections/products/seller-storefront pages (all clean, consume already-aligned components).

Ran comprehensive grep across all S07-scoped files — found violations in 5 components missed by T01–T04: CardListingForm.tsx (4 refs), ConditionGuide.tsx (8 refs), FeeCalculator.tsx (3 refs), ListingSuccessScreen.tsx (15 refs), SellerResponseBadge.tsx (6 refs), ReturnItemsTab.tsx (1 ref). Fixed all — total 37 additional refs converted.

## Verification

- `grep -rn "bg-white|text-gray-[0-9]|bg-gray-[0-9]|border-gray-[0-9]|bg-blue-[0-9]|text-blue-[0-9]|bg-green-[0-9]|text-green-[0-9]|bg-red-[0-9]|text-red-[0-9]|bg-yellow-[0-9]|text-yellow-[0-9]"` across all S07-scoped dirs — **zero matches**
- `npx vitest run` — **794 tests passed** (76 test files)
- `npx next build` — **build succeeds**

All three slice-level verification checks pass.

## Diagnostics

None — styling-only changes, no runtime behavior.

## Deviations

Updated ConditionGuide.test.tsx to check `style.boxShadow` instead of className `ring-2` — necessary because ring was converted from Tailwind class to inline boxShadow for dynamic color support.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/app/[locale]/(main)/community/page.tsx` — rebuilt to wireframe "Coming Soon" layout with hero, emoji feature grid, stats, Discord CTA
- `storefront/src/components/seller/CardListingForm.tsx` — converted 4 bare red-* refs to Voltage tokens (text-negative, rgba bg)
- `storefront/src/components/seller/ConditionGuide.tsx` — full rewrite: color maps converted from Tailwind classes to inline rgba styles
- `storefront/src/components/seller/FeeCalculator.tsx` — converted 3 red/green refs to text-negative/text-positive
- `storefront/src/components/seller/ListingSuccessScreen.tsx` — converted 15 gray/green refs to Voltage tokens
- `storefront/src/components/seller/SellerResponseBadge/SellerResponseBadge.tsx` — tier config converted from Tailwind class maps to inline style value maps
- `storefront/src/components/sections/OrderReturnSection/ReturnItemsTab.tsx` — converted 1 text-red-700 to text-negative
- `storefront/src/components/seller/__tests__/ConditionGuide.test.tsx` — updated ring assertion to check boxShadow style
