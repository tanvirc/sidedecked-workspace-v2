---
estimated_steps: 4
estimated_files: 6
---

# T03: Align seller dashboard and payout pages

**Slice:** S07 — Remaining Pages — Visual Alignment
**Milestone:** M001

## Description

Convert light-mode Tailwind references in the seller dashboard and payout components to Voltage tokens. `ConsumerSellerDashboard.tsx` (1,017 lines, 40 refs) is the riskiest edit — it mixes styling with tab state, data display, and delete actions. Must carefully preserve all conditional className patterns. Payout components (PayoutDashboard, PayoutHistory, PayoutSetupBanner, BalanceCards, PayoutSettingsPage) add ~8 more refs.

## Steps

1. Read the wireframe `storefront-sell-dashboard.html` to understand the target tab layout and stat card styling. Read `storefront-sell-payouts.html` for payout layout.
2. Convert 40 light-mode refs in `ConsumerSellerDashboard.tsx`. This component has 4 tabs (Overview, Listings, Sales, Profile) with active/inactive state styling. Replace bare color classes while preserving all ternary/conditional className logic. Active tab indicators should use Voltage accent colors (`var(--brand-primary)`), inactive states use `var(--text-tertiary)` / `var(--bg-surface-2)`. Status badges (`bg-green-*`, `bg-red-*`, `bg-yellow-*`) get Voltage semantic equivalents.
3. Convert refs in `PayoutDashboard.tsx`, `PayoutHistory.tsx`, `PayoutSetupBanner.tsx`. Check `BalanceCards.tsx` (77 lines, minimal work expected).
4. Convert refs in `PayoutSettingsPage.tsx`. Verify all payout page components are free of bare light-mode classes.

## Must-Haves

- [ ] Zero bare light-mode Tailwind color classes in `ConsumerSellerDashboard.tsx`
- [ ] Zero bare light-mode Tailwind color classes in all Payout*.tsx components
- [ ] Zero bare light-mode Tailwind color classes in `BalanceCards.tsx`
- [ ] All tab active/inactive states use Voltage tokens
- [ ] All conditional className patterns preserved (no logic changes)
- [ ] All existing tests pass

## Verification

- `npx vitest run` — all 794+ tests pass
- `grep -rn "bg-white\|text-gray-[0-9]\|bg-gray-[0-9]\|bg-blue-[0-9]\|border-gray-[0-9]\|text-blue-[0-9]\|bg-green-[0-9]\|text-green-[0-9]\|bg-red-[0-9]\|text-red-[0-9]\|bg-yellow-[0-9]\|text-yellow-[0-9]" src/components/seller/ConsumerSellerDashboard.tsx src/components/seller/Payout*.tsx src/components/seller/BalanceCards.tsx` — zero matches

## Inputs

- `docs/plans/wireframes/storefront-sell-dashboard.html` — seller dashboard wireframe
- `docs/plans/wireframes/storefront-sell-payouts.html` — payouts wireframe
- `src/components/seller/ConsumerSellerDashboard.tsx` — 1,017-line component with 40 light-mode refs
- T01/T02 completed — Voltage conversion patterns established

## Expected Output

- `src/components/seller/ConsumerSellerDashboard.tsx` — 40 light-mode refs converted, all conditional styling preserved
- `src/components/seller/PayoutDashboard.tsx` — light-mode refs converted
- `src/components/seller/PayoutHistory.tsx` — light-mode refs converted
- `src/components/seller/PayoutSetupBanner.tsx` — light-mode refs converted
- `src/components/seller/BalanceCards.tsx` — checked and aligned
- `src/components/seller/PayoutSettingsPage.tsx` — light-mode refs converted
