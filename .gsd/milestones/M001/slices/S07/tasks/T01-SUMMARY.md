---
id: T01
parent: S07
milestone: M001
provides:
  - Responsive UserAccountLayout in user/layout.tsx (240px sidebar + pills mobile)
  - Voltage-tokenized EnhancedPriceAlerts (34 refs converted)
  - Voltage-tokenized ReturnItemsTab (3 refs converted)
  - Standalone centered verify-email page (no sidebar)
key_files:
  - storefront/src/app/[locale]/(main)/user/layout.tsx
  - storefront/src/components/molecules/UserNavigation/UserNavigation.tsx
  - storefront/src/components/pricing/EnhancedPriceAlerts.tsx
  - storefront/src/components/sections/OrderReturnSection/ReturnItemsTab.tsx
  - storefront/src/app/[locale]/(main)/user/verify-email/page.tsx
key_decisions:
  - Used flexbox (w-[240px] + flex-1) instead of CSS grid for sidebar layout — naturally collapses to single column when sidebar hides at mobile without needing responsive grid-template changes
  - Verify-email excluded from sidebar via pathname check in layout rather than route groups — avoids moving files while achieving standalone rendering
  - Exported navigationItems array from UserNavigation so layout can render matching pill nav without duplicating items
patterns_established:
  - User layout uses STANDALONE_PATHS array to opt out specific routes from sidebar/pills
  - Colored semantic badges use inline style with rgba() backgrounds + CSS custom property colors (e.g. rgba(239,68,68,0.12) + var(--negative))
  - getStatusStyle returns React.CSSProperties instead of className strings for Voltage token compatibility
observability_surfaces:
  - none
duration: ~30min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Extract UserAccountLayout and align user-account pages

**Rewrote user/layout.tsx with responsive sidebar+pills layout, converted 37 light-mode refs across 3 components to Voltage tokens, restructured verify-email as standalone centered card.**

## What Happened

Rewrote `user/layout.tsx` from a 7-line passthrough to a responsive layout with: 240px sidebar (UserNavigation, hidden below md), horizontal scrollable pill nav (visible below md), and pathname-based exclusion for standalone pages (verify-email, register). Used flexbox for the desktop 2-column layout.

Exported `navigationItems` from `UserNavigation.tsx` so the layout's pill nav renders the same items (Orders, Messages, Returns, Addresses, Reviews, Wishlist, Settings) with active state matching based on pathname.

Restructured `verify-email/page.tsx` from a sidebar grid layout to a standalone centered card with radial gradient background, matching the wireframe's full-page centered design. Removed UserNavigation import and the `grid grid-cols-1 md:grid-cols-4` wrapper. All text colors converted from `text-gray-600`/`text-gray-500` to Voltage `--text-secondary` and `--text-tertiary`.

Converted all 34 light-mode Tailwind color refs in `EnhancedPriceAlerts.tsx`: icon backgrounds (bg-red-100, bg-green-100, etc.) → rgba() inline styles, text colors (text-red-600, text-gray-400, etc.) → CSS custom properties, skeleton placeholders (bg-gray-200) → var(--bg-surface-3), status badges → getStatusStyle returning CSSProperties, notification badges → inline Voltage styles, action buttons → inline Voltage styles.

Converted 3 light-mode refs in `ReturnItemsTab.tsx`: bg-white → bg-card, hover:bg-gray-50 → hover:bg-component-hover, removed focus-visible:ring-offset-gray-300 and focus-visible:border-gray-300.

## Verification

- `npx vitest run` — 76 test files, 794 tests all pass
- `grep -rn "bg-white|text-gray-[0-9]|bg-gray-[0-9]|border-gray-[0-9]" EnhancedPriceAlerts.tsx ReturnItemsTab.tsx verify-email/page.tsx` — zero matches
- Layout file contains flex + w-[240px] + md:hidden/md:block responsive structure
- Slice-level grep shows remaining hits only in seller/ and Cart/ components (T02-T05 scope)

## Diagnostics

None — styling-only changes, no runtime behavior.

## Deviations

- Used flexbox instead of CSS grid for the sidebar layout. The wireframe specifies `grid-template-columns: 240px 1fr` but flexbox achieves the same visual result while being simpler to make responsive (sidebar hides via `hidden md:block`, content auto-fills).
- ReturnItemsTab had 3 actionable refs (not 4 as estimated in the plan — the ring-offset-gray and border-gray were on the same element).

## Known Issues

None.

## Files Created/Modified

- `storefront/src/app/[locale]/(main)/user/layout.tsx` — rewritten with responsive sidebar + pill nav layout
- `storefront/src/components/molecules/UserNavigation/UserNavigation.tsx` — exported navigationItems array
- `storefront/src/components/pricing/EnhancedPriceAlerts.tsx` — converted 34 light-mode refs to Voltage tokens
- `storefront/src/components/sections/OrderReturnSection/ReturnItemsTab.tsx` — converted 3 light-mode refs to Voltage tokens
- `storefront/src/app/[locale]/(main)/user/verify-email/page.tsx` — restructured as standalone centered card
