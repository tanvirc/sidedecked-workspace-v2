---
id: T04
parent: S07
milestone: M001
provides:
  - Zero bare light-mode Tailwind color classes in CustomerToSellerUpgrade.tsx (47 refs converted)
  - Zero bare light-mode Tailwind color classes in ReputationDashboard.tsx (23 refs converted)
  - Zero bare light-mode Tailwind color classes in ReviewManagement.tsx (6 refs converted)
  - Zero bare light-mode Tailwind color classes in TrustHistoryChart.tsx (14 refs converted)
  - Zero bare light-mode Tailwind color classes in VerificationStatus.tsx (15 refs converted)
  - sell/list-card page wrapper already uses Voltage tokens (no changes needed)
key_files:
  - src/components/seller/CustomerToSellerUpgrade.tsx
  - src/components/seller/ReputationDashboard.tsx
  - src/components/seller/ReviewManagement.tsx
  - src/components/seller/TrustHistoryChart.tsx
  - src/components/seller/VerificationStatus.tsx
key_decisions:
  - TIER_COLORS maps in ReputationDashboard and TrustHistoryChart converted from Tailwind class maps to inline style value maps (bgStyle/textStyle/barStyle) since the rgba+var pattern cannot be expressed as static Tailwind classes
  - SVG gauge circle in ReputationDashboard uses stroke attribute directly with CSS custom property instead of className — SVG stroke doesn't respond to Tailwind text-color classes reliably when using CSS vars
patterns_established:
  - Toggle switch knobs use bg-card instead of bg-white for proper dark mode rendering
  - Star rating colors use var(--warning) for filled and var(--border-default) for empty — consistent semantic mapping
  - Status icon circles (completed/pending/failed/not_started) use inline style with var(--positive/warning/negative) backgrounds
observability_surfaces:
  - none
duration: ~30min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T04: Align seller upgrade, reputation, and list-card wrapper

**Converted 105 bare light-mode Tailwind color refs across 5 seller components to Voltage tokens.**

## What Happened

Converted all light-mode Tailwind color classes across the remaining seller components:

- **CustomerToSellerUpgrade.tsx** (47 refs): Step progress indicators, benefits icons, seller type cards, toggle switches, status badges (Ready/Verified/Optional), error banners, form validation colors, and bottom benefits section.
- **ReputationDashboard.tsx** (23 refs): TIER_COLORS map restructured from Tailwind class strings to inline style value maps. Loading skeleton, error state, gauge circle, tier progress bar, verify message banner, factor card progress bars, verification row icons, and performance metric cards.
- **ReviewManagement.tsx** (6 refs): Star rating colors, distribution bar backgrounds, and empty state icon.
- **TrustHistoryChart.tsx** (14 refs): TIER_COLOR_STYLES map, trend indicators, highest/lowest score colors, bar chart colors, timeline dots and score change text.
- **VerificationStatus.tsx** (15 refs): Status icon circles, progress bar, required badge, chevron icon, benefit bullet dots, and footer info icon.
- **sell/list-card/page.tsx**: Already uses Voltage tokens — no changes needed.

FeeCalculator, ConditionGuide, ListingSuccessScreen, and CardListingForm were checked and confirmed as wizard internals (S08 scope) — left untouched.

## Verification

- `npx vitest run` — 794 tests passed, 76 test files, 0 failures
- `grep -rn "bg-white|text-gray-[0-9]|bg-gray-[0-9]|bg-blue-[0-9]|text-blue-[0-9]|bg-green-[0-9]|text-green-[0-9]|bg-red-[0-9]|text-red-[0-9]|bg-yellow-[0-9]|text-yellow-[0-9]" CustomerToSellerUpgrade.tsx ReputationDashboard.tsx ReviewManagement.tsx TrustHistoryChart.tsx VerificationStatus.tsx` — zero matches
- Slice-level grep: S07-scoped seller components clean except S08-scope wizard files (CardListingForm, ConditionGuide, FeeCalculator, ListingSuccessScreen)

## Diagnostics

None — styling-only changes, no runtime behavior.

## Deviations

- sell/list-card/page.tsx required no changes — already fully Voltage-tokenized.
- Plan estimated 51 refs in CustomerToSellerUpgrade but actual count was 47 (some had dark: variants counted separately in initial scan).

## Known Issues

None.

## Files Created/Modified

- `src/components/seller/CustomerToSellerUpgrade.tsx` — 47 light-mode refs converted to Voltage tokens
- `src/components/seller/ReputationDashboard.tsx` — 23 light-mode refs converted, TIER_COLORS restructured to inline style map
- `src/components/seller/ReviewManagement.tsx` — 6 light-mode refs converted (stars, bars, empty state)
- `src/components/seller/TrustHistoryChart.tsx` — 14 light-mode refs converted, TIER_COLORS renamed to TIER_COLOR_STYLES
- `src/components/seller/VerificationStatus.tsx` — 15 light-mode refs converted, getStatusColor renamed to getStatusColorStyle
