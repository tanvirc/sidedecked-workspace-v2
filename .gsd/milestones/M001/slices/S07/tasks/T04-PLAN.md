---
estimated_steps: 5
estimated_files: 6
---

# T04: Align seller upgrade, reputation, and list-card wrapper

**Slice:** S07 — Remaining Pages — Visual Alignment
**Milestone:** M001

## Description

Convert light-mode Tailwind references in the remaining seller components. `CustomerToSellerUpgrade.tsx` (945 lines, 51 refs) has the highest concentration of violations — it's a multi-section upgrade flow with benefits, requirements, and a form. `ReputationDashboard.tsx` (502 lines, 26 refs) has trust score gauge, factor breakdown, and reviews. `ReviewManagement.tsx`, `TrustHistoryChart.tsx`, and `VerificationStatus.tsx` need checking. The `sell/list-card` page wrapper gets minimal Voltage chrome alignment — the wizard itself is S08 scope.

## Steps

1. Read wireframes `storefront-sell-upgrade.html` and `storefront-sell-reputation.html` to understand target layouts.
2. Convert 51 light-mode refs in `CustomerToSellerUpgrade.tsx`. This component has benefits list, requirements checklist, and upgrade form. Status indicators (`bg-green-*` for met requirements, `bg-red-*` for unmet) need Voltage semantic equivalents. Benefits cards, section backgrounds, and text colors all need conversion.
3. Convert 26 light-mode refs in `ReputationDashboard.tsx`. Trust score gauge colors, factor bars, and review list items need Voltage tokens. Convert refs in `ReviewManagement.tsx` and `TrustHistoryChart.tsx`.
4. Check `VerificationStatus.tsx` (298 lines) for light-mode violations and fix.
5. Check `sell/list-card/page.tsx` wrapper — align chrome only (heading, container styling). Do NOT build the wizard (S08 scope per wireframe annotation). Check `FeeCalculator.tsx`, `ConditionGuide.tsx`, `ListingSuccessScreen.tsx` for light-mode refs if they are page-level chrome (not wizard internals).

## Must-Haves

- [ ] Zero bare light-mode Tailwind color classes in `CustomerToSellerUpgrade.tsx`
- [ ] Zero bare light-mode Tailwind color classes in `ReputationDashboard.tsx`
- [ ] Zero bare light-mode Tailwind color classes in `ReviewManagement.tsx` and `TrustHistoryChart.tsx`
- [ ] `VerificationStatus.tsx` checked and cleaned
- [ ] `sell/list-card` page wrapper uses Voltage tokens (wizard internals untouched — S08 scope)
- [ ] All existing tests pass

## Verification

- `npx vitest run` — all 794+ tests pass
- `grep -rn "bg-white\|text-gray-[0-9]\|bg-gray-[0-9]\|bg-blue-[0-9]\|text-blue-[0-9]\|bg-green-[0-9]\|text-green-[0-9]\|bg-red-[0-9]\|text-red-[0-9]\|bg-yellow-[0-9]\|text-yellow-[0-9]" src/components/seller/CustomerToSellerUpgrade.tsx src/components/seller/ReputationDashboard.tsx src/components/seller/ReviewManagement.tsx src/components/seller/TrustHistoryChart.tsx src/components/seller/VerificationStatus.tsx` — zero matches

## Inputs

- `docs/plans/wireframes/storefront-sell-upgrade.html` — upgrade wireframe
- `docs/plans/wireframes/storefront-sell-reputation.html` — reputation wireframe
- `docs/plans/wireframes/storefront-sell-list-card.html` — list-card wireframe (S08 target, wrapper only for S07)
- T03 completed — seller dashboard and payouts aligned

## Expected Output

- `src/components/seller/CustomerToSellerUpgrade.tsx` — 51 light-mode refs converted
- `src/components/seller/ReputationDashboard.tsx` — 26 light-mode refs converted
- `src/components/seller/ReviewManagement.tsx` — light-mode refs converted
- `src/components/seller/TrustHistoryChart.tsx` — light-mode refs converted
- `src/components/seller/VerificationStatus.tsx` — checked and cleaned
- `src/app/[locale]/(main)/sell/list-card/page.tsx` — wrapper chrome aligned to Voltage
