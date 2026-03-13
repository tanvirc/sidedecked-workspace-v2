---
id: S07
parent: M001
milestone: M001
provides:
  - Zero bare light-mode Tailwind color classes across all S07-scoped components (~250 refs converted)
  - Responsive UserAccountLayout in user/layout.tsx (240px sidebar desktop, horizontal pills mobile)
  - Standalone centered verify-email page (excluded from sidebar via pathname check)
  - Community page rebuilt to wireframe "Coming Soon" hero + emoji feature grid + Discord CTA
  - Voltage token consistency across seller, commerce, user-account, and misc page families
requires:
  - slice: S01
    provides: Voltage tokens, shared components (nav, footer, CardDisplay, PriceTag)
  - slice: S06
    provides: Generated wireframes as alignment targets for all remaining pages
affects:
  - none (leaf slice)
key_files:
  - storefront/src/app/[locale]/(main)/user/layout.tsx
  - storefront/src/components/molecules/UserNavigation/UserNavigation.tsx
  - storefront/src/components/pricing/EnhancedPriceAlerts.tsx
  - storefront/src/app/[locale]/(main)/user/verify-email/page.tsx
  - storefront/src/components/sections/Cart/EnhancedCartItems.tsx
  - storefront/src/components/sections/Cart/InventoryValidator.tsx
  - storefront/src/components/seller/ConsumerSellerDashboard.tsx
  - storefront/src/components/seller/CustomerToSellerUpgrade.tsx
  - storefront/src/components/seller/ReputationDashboard.tsx
  - storefront/src/components/seller/VerificationStatus.tsx
  - storefront/src/app/[locale]/(main)/community/page.tsx
key_decisions:
  - D026: UserAccountLayout extracted in user/layout.tsx — 240px sidebar + horizontal pill nav, verify-email excluded via STANDALONE_PATHS
  - D027: S07 aligns list-card page wrapper only — wizard internals are S08 scope
  - Extends D009: rgba() + CSS custom properties used consistently for all semantic badges, tier colors, and status indicators across ~250 conversions
patterns_established:
  - Colored semantic badges use inline style with rgba() backgrounds + CSS custom property text colors (e.g. rgba(239,68,68,0.12) + var(--negative))
  - TIER_COLORS maps converted from Tailwind class string maps to inline style value maps (bgStyle/textStyle/barStyle) — applies to ConsumerSellerDashboard, ReputationDashboard, TrustHistoryChart, SellerResponseBadge
  - Tab active/inactive states use border-action/text-action for active and border-transparent/text-secondary for inactive
  - Toggle switch knobs use bg-card instead of bg-white for dark mode
  - Star ratings use var(--warning) filled / var(--border-default) empty
  - User layout uses STANDALONE_PATHS array to opt out specific routes from sidebar/pills
  - getStatusStyle/getStatusColor helpers return React.CSSProperties for Voltage token compatibility
observability_surfaces:
  - None — styling-only changes, no runtime behavior
drill_down_paths:
  - .gsd/milestones/M001/slices/S07/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S07/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S07/tasks/T03-SUMMARY.md
  - .gsd/milestones/M001/slices/S07/tasks/T04-SUMMARY.md
  - .gsd/milestones/M001/slices/S07/tasks/T05-SUMMARY.md
duration: ~2h
verification_result: passed
completed_at: 2026-03-14
---

# S07: Remaining Pages — Visual Alignment

**Converted ~250 bare light-mode Tailwind color refs to Voltage tokens across all seller, commerce, user-account, and misc storefront pages. Extracted responsive UserAccountLayout, rebuilt community page to wireframe, zero light-mode violations remain in S07 scope.**

## What Happened

Worked through five tasks covering four page families:

**T01 — User account pages:** Rewrote `user/layout.tsx` from a 7-line passthrough to a responsive layout with 240px sidebar (UserNavigation, hidden below md) and horizontal scrollable pill nav (visible below md). Exported `navigationItems` from UserNavigation so both sidebar and pills render the same items. Restructured verify-email as a standalone centered card (excluded from sidebar via STANDALONE_PATHS). Converted 34 light-mode refs in EnhancedPriceAlerts and 3 in ReturnItemsTab.

**T02 — Commerce pages:** Converted ~57 refs across EnhancedCartItems (35), Cart.tsx (3), InventoryValidator (20), and OrderConfirmedSection (1). Semantic status indicators (inventory warnings, multi-seller callout) use rgba-tinted backgrounds with CSS custom property text colors.

**T03 — Seller dashboard and payouts:** Converted 47 refs in ConsumerSellerDashboard (the largest single component at 1,017 lines — TIER_COLORS, tab states, status dots, order badges, star ratings, skeleton loaders). Fixed 7 more across PayoutDashboard, PayoutSetupBanner, and PayoutSettingsPage. PayoutHistory and BalanceCards were already clean.

**T04 — Seller upgrade, reputation, and list-card:** Converted 105 refs across CustomerToSellerUpgrade (47), ReputationDashboard (23), ReviewManagement (6), TrustHistoryChart (14), and VerificationStatus (15). TIER_COLORS maps restructured from Tailwind class strings to inline style value maps. sell/list-card page was already Voltage-tokenized.

**T05 — Misc pages and final sweep:** Rebuilt community page to wireframe "Coming Soon" layout with emoji feature cards, stats section, and Discord CTA. Ran comprehensive grep that caught 5 components missed by T01-T04 (CardListingForm, ConditionGuide, FeeCalculator, ListingSuccessScreen, SellerResponseBadge) — fixed 37 additional refs. Updated ConditionGuide test to check boxShadow instead of ring class.

## Verification

- `npx vitest run` — 794 tests passed across 76 test files, zero failures
- `npx next build` — build succeeds with no errors
- `grep -rn` across all S07-scoped dirs (seller/, Cart/, pricing/EnhancedPriceAlerts, community/page, verify-email/page) — zero bare light-mode Tailwind color class matches
- All three slice-level verification checks defined in the plan pass

## Requirements Advanced

- R014 (Seller pages visual alignment) — all seller components converted to Voltage tokens, seller dashboard/upgrade/payouts/reputation pages aligned to wireframes
- R015 (User account pages visual alignment) — UserAccountLayout extracted with responsive sidebar+pills, all user pages render consistently, verify-email standalone
- R016 (Commerce pages visual alignment) — cart, checkout, order-confirmed pages aligned with zero light-mode violations
- R024 (Voltage dark theme consistency) — S07 eliminated the last major pocket of light-mode Tailwind classes in the storefront

## Requirements Validated

- R014 — grep confirms zero bare light-mode refs in seller components; structural alignment to wireframes verified via component structure matching wireframe data-component annotations
- R015 — grep confirms zero bare light-mode refs in user-account components; UserAccountLayout provides wireframe-specified responsive layout
- R016 — grep confirms zero bare light-mode refs in commerce components; layout matches wireframe seller-grouped cart structure

## New Requirements Surfaced

- None

## Requirements Invalidated or Re-scoped

- None

## Deviations

- Used flexbox instead of CSS grid for UserAccountLayout sidebar — achieves same visual result with simpler responsive collapse
- ReturnItemsTab had 3 actionable refs (not 4 estimated) — ring-offset and border were on the same element
- CustomerToSellerUpgrade had 47 refs (not 51 estimated) — some dark: variants were counted separately in initial scan
- sell/list-card page needed no changes — already fully Voltage-tokenized
- T05 caught 5 additional components (37 refs) not identified in T01-T04 scope — CardListingForm, ConditionGuide, FeeCalculator, ListingSuccessScreen, SellerResponseBadge all fixed in sweep
- ConditionGuide.test.tsx updated to check `style.boxShadow` instead of className `ring-2` — necessary after converting ring to inline boxShadow for dynamic color support

## Known Limitations

- Visual alignment is verified structurally (component structure matches wireframe annotations, zero light-mode violations) but not via pixel-level visual diff at 1440px and 390px — human visual UAT still pending
- Community page is "Coming Soon" placeholder per R036 (deferred) — no real community features behind it

## Follow-ups

- None — S07 is a leaf slice. S08 (listing wizard) and S09 (cart optimizer) are independent downstream work.

## Files Created/Modified

- `storefront/src/app/[locale]/(main)/user/layout.tsx` — rewritten with responsive sidebar + pill nav layout
- `storefront/src/components/molecules/UserNavigation/UserNavigation.tsx` — exported navigationItems array
- `storefront/src/components/pricing/EnhancedPriceAlerts.tsx` — 34 light-mode refs converted
- `storefront/src/components/sections/OrderReturnSection/ReturnItemsTab.tsx` — 4 light-mode refs converted (3 in T01, 1 in T05)
- `storefront/src/app/[locale]/(main)/user/verify-email/page.tsx` — restructured as standalone centered card
- `storefront/src/components/sections/Cart/EnhancedCartItems.tsx` — 35 refs converted
- `storefront/src/components/sections/Cart/Cart.tsx` — multi-seller callout restyled
- `storefront/src/components/sections/Cart/InventoryValidator.tsx` — 20 refs converted
- `storefront/src/components/sections/OrderConfirmedSection/OrderConfirmedSection.tsx` — 1 ref converted
- `storefront/src/components/seller/ConsumerSellerDashboard.tsx` — 40 refs converted
- `storefront/src/components/seller/PayoutDashboard.tsx` — 3 refs converted
- `storefront/src/components/seller/PayoutSetupBanner.tsx` — 2 refs converted
- `storefront/src/components/seller/PayoutSettingsPage.tsx` — 2 refs converted
- `storefront/src/components/seller/CustomerToSellerUpgrade.tsx` — 47 refs converted
- `storefront/src/components/seller/ReputationDashboard.tsx` — 23 refs converted, TIER_COLORS restructured
- `storefront/src/components/seller/ReviewManagement.tsx` — 6 refs converted
- `storefront/src/components/seller/TrustHistoryChart.tsx` — 14 refs converted, TIER_COLORS renamed
- `storefront/src/components/seller/VerificationStatus.tsx` — 15 refs converted
- `storefront/src/components/seller/CardListingForm.tsx` — 4 refs converted
- `storefront/src/components/seller/ConditionGuide.tsx` — 8 refs converted, color maps to inline styles
- `storefront/src/components/seller/FeeCalculator.tsx` — 3 refs converted
- `storefront/src/components/seller/ListingSuccessScreen.tsx` — 15 refs converted
- `storefront/src/components/seller/SellerResponseBadge/SellerResponseBadge.tsx` — 6 refs converted
- `storefront/src/components/seller/__tests__/ConditionGuide.test.tsx` — assertion updated for boxShadow
- `storefront/src/app/[locale]/(main)/community/page.tsx` — rebuilt to wireframe layout

## Forward Intelligence

### What the next slice should know
- All storefront pages now use Voltage tokens consistently. Any new components should follow the D009 pattern (inline `style` with CSS custom properties) for colors not covered by Tailwind semantic classes (bg-card, text-primary, border-border).
- The rgba() + var() pattern for semantic badges is used in ~15 components now — search for `rgba(` in seller/ or Cart/ for examples.

### What's fragile
- ConditionGuide uses inline `boxShadow` for ring highlights instead of Tailwind `ring-*` — if someone adds `ring-2` back, it will conflict with the inline style. The test catches this.
- ConsumerSellerDashboard at 1,017 lines is the largest component touched — all styling is inline style maps now, which makes it harder to scan visually but is the correct D009 pattern.

### Authoritative diagnostics
- `grep -rn "bg-white\|text-gray-[0-9]\|bg-gray-[0-9]" storefront/src/components/seller/ storefront/src/components/sections/Cart/` — this should always return zero. If it returns hits, someone added light-mode classes back.

### What assumptions changed
- Plan estimated ~450 light-mode refs in S07 scope — actual count was ~250. Many files were already clean or had dark: variants that didn't need separate conversion.
- sell/list-card page was already Voltage-tokenized — no work needed despite being in the plan.
