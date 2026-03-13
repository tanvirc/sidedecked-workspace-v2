---
id: T03
parent: S07
milestone: M001
provides:
  - Zero bare light-mode Tailwind color classes in ConsumerSellerDashboard.tsx (40 refs converted)
  - Zero bare light-mode Tailwind color classes in all 5 Payout*.tsx and BalanceCards.tsx components (7 refs converted)
key_files:
  - storefront/src/components/seller/ConsumerSellerDashboard.tsx
  - storefront/src/components/seller/PayoutDashboard.tsx
  - storefront/src/components/seller/PayoutSetupBanner.tsx
  - storefront/src/components/seller/PayoutSettingsPage.tsx
key_decisions:
  - Used var(--brand-secondary,#a855f7) with fallback for purple/diamond tier since no dedicated purple CSS custom property exists in the Voltage theme
patterns_established:
  - TIER_COLORS map uses rgba() tinted backgrounds with CSS custom property text colors — same approach as T01/T02 semantic badges
  - Tab active/inactive states use border-action/text-action for active and border-transparent/text-secondary with hover:border-[var(--border-hover)] for inactive
observability_surfaces:
  - None — styling-only changes, no runtime behavior
duration: 20m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T03: Align seller dashboard and payout pages

**Converted 47 bare light-mode Tailwind color refs across ConsumerSellerDashboard and 5 payout components to Voltage tokens.**

## What Happened

Converted all bare light-mode Tailwind color classes in the 6 scoped files. ConsumerSellerDashboard.tsx had 40 refs spanning TIER_COLORS map, getListingStatusColor function, skeleton loaders, stat card icons, tab hover states, activity dots, listing status dots, order status badges, review star colors, and the tier progress bar. All conditional className ternaries preserved — only the class values changed, not the logic.

PayoutDashboard had 3 refs (error icon, qualification checkmark, progress bar complete state). PayoutSetupBanner had 2 (Stripe icon, error text). PayoutSettingsPage had 2 (success/error message colors). PayoutHistory and BalanceCards were already clean.

## Verification

- `grep -rn "bg-white\|text-gray-[0-9]\|bg-gray-[0-9]\|bg-blue-[0-9]\|border-gray-[0-9]\|text-blue-[0-9]\|bg-green-[0-9]\|text-green-[0-9]\|bg-red-[0-9]\|text-red-[0-9]\|bg-yellow-[0-9]\|text-yellow-[0-9]" ConsumerSellerDashboard.tsx Payout*.tsx BalanceCards.tsx` — **zero matches**
- `npx vitest run` — **794 tests passed**, zero failures
- Slice-level grep across `storefront/src/components/seller/` still has matches in files scoped to T04 (CustomerToSellerUpgrade, ReputationDashboard, etc.) — expected, those are next task

## Diagnostics

None — styling-only changes, no runtime behavior.

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/components/seller/ConsumerSellerDashboard.tsx` — 40 light-mode refs converted to Voltage tokens (TIER_COLORS, getListingStatusColor, skeletons, stat cards, tabs, badges, stars)
- `storefront/src/components/seller/PayoutDashboard.tsx` — 3 refs converted (error icon, checkmark, progress bar)
- `storefront/src/components/seller/PayoutSetupBanner.tsx` — 2 refs converted (Stripe icon, error text)
- `storefront/src/components/seller/PayoutSettingsPage.tsx` — 2 refs converted (success/error message colors)
- `storefront/src/components/seller/PayoutHistory.tsx` — verified clean, no changes needed
- `storefront/src/components/seller/BalanceCards.tsx` — verified clean, no changes needed
