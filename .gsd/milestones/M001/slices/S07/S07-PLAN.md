# S07: Remaining Pages — Visual Alignment

**Goal:** Every remaining storefront page aligns to its S06-generated wireframe using Voltage tokens consistently on desktop and mobile.
**Demo:** All seller, user-account, commerce, and misc pages render with Voltage dark theme tokens — zero bare light-mode Tailwind color classes (`bg-white`, `text-gray-*`, `bg-blue-*`, etc.) in S07-scoped components. Shared `UserAccountLayout` provides sidebar-to-pills responsive layout for all user pages.

## Must-Haves

- All ~450+ bare light-mode Tailwind color references in S07-scoped components converted to Voltage tokens (CSS custom properties via inline style per D009, or Tailwind semantic classes like `bg-card`, `text-primary`, `border-border` where they map correctly)
- `UserAccountLayout` extracted in `user/layout.tsx` with 240px sidebar grid (desktop) and horizontal pills (mobile)
- Verify-email page restructured to standalone centered card without UserNavigation sidebar
- Community page rebuilt to match wireframe "Coming Soon" hero + feature preview grid structure
- Seller pages (dashboard, upgrade, payouts, reputation) visually aligned to wireframes
- Commerce pages (cart, checkout, order-confirmed) visually aligned to wireframes
- `sell/list-card` page wrapper aligned (S08 owns the wizard itself)
- All 794+ existing tests continue passing
- No logic, prop, state, or API changes — styling and layout only

## Verification

- `cd storefront && npx vitest run` — all 794+ tests pass (no regressions)
- `grep -rn "bg-white\|text-gray-[0-9]\|bg-gray-[0-9]\|border-gray-[0-9]\|bg-blue-[0-9]\|text-blue-[0-9]\|bg-green-[0-9]\|text-green-[0-9]\|bg-red-[0-9]\|text-red-[0-9]\|bg-yellow-[0-9]\|text-yellow-[0-9]" storefront/src/components/seller/ storefront/src/components/sections/Cart/ storefront/src/components/pricing/EnhancedPriceAlerts.tsx storefront/src/app/[locale]/(main)/community/page.tsx storefront/src/app/[locale]/(main)/user/verify-email/page.tsx` — zero matches
- `cd storefront && npx next build` — build succeeds with no errors

## Tasks

- [x] **T01: Extract UserAccountLayout and align user-account pages** `est:2h`
  - Why: 8 user pages share the same sidebar-to-pills layout from the wireframe. Extracting `UserAccountLayout` once provides the responsive grid for all user routes. Most user pages have 0 light-mode refs (already clean). EnhancedPriceAlerts (34 refs) and verify-email (structural change) are the only significant work items.
  - Files: `src/app/[locale]/(main)/user/layout.tsx`, `src/components/molecules/UserNavigation/UserNavigation.tsx`, `src/components/pricing/EnhancedPriceAlerts.tsx`, `src/app/[locale]/(main)/user/verify-email/page.tsx`, `src/components/sections/OrderReturnSection/ReturnItemsTab.tsx`
  - Do: (1) Rewrite `user/layout.tsx` to render a 2-column grid (`grid-cols-[240px_1fr]` on desktop, single column on mobile) with `<UserNavigation />` in the sidebar that hides below `md` breakpoint, and horizontal pill nav visible below `md`. (2) Add mobile pill variant to `UserNavigation` or create sibling `UserNavPills` component — tab links matching nav items, visible only on mobile. (3) Restructure verify-email to render as standalone centered card without UserNavigation — either move to a separate route group or conditionally skip the sidebar in `user/layout.tsx` (simplest: verify-email page renders outside the sidebar grid). (4) Convert 34 light-mode refs in `EnhancedPriceAlerts.tsx` to Voltage tokens. (5) Convert 4 refs in `ReturnItemsTab.tsx`. (6) Check remaining user pages for stray light-mode classes and fix. No logic changes.
  - Verify: `npx vitest run` all tests pass; `grep -rn "bg-white\|text-gray-[0-9]\|bg-gray-[0-9]" src/components/pricing/EnhancedPriceAlerts.tsx src/components/sections/OrderReturnSection/ReturnItemsTab.tsx src/app/[locale]/(main)/user/verify-email/page.tsx` returns zero
  - Done when: All 8 user-account pages render inside `UserAccountLayout` with sidebar grid (desktop) and pills (mobile), verify-email renders standalone, all user-family light-mode refs eliminated

- [x] **T02: Align commerce pages — cart, checkout, order-confirmed** `est:1.5h`
  - Why: Cart components have ~56 light-mode Tailwind references (mostly in `EnhancedCartItems` and `InventoryValidator`). Checkout is mostly clean. Order-confirmed has 1 ref. These are the revenue funnel pages.
  - Files: `src/components/sections/Cart/EnhancedCartItems.tsx`, `src/components/sections/Cart/Cart.tsx`, `src/components/sections/Cart/InventoryValidator.tsx`, `src/components/sections/OrderConfirmedSection/OrderConfirmedSection.tsx`, `src/components/sections/CartShippingMethodsSection/CartShippingMethodsSection.tsx`
  - Do: (1) Convert 35 light-mode refs in `EnhancedCartItems.tsx` to Voltage tokens — replace `bg-white` → `bg-card`, `text-gray-*` → inline `var(--text-secondary)` or `var(--text-tertiary)`, `bg-blue-*` → `var(--bg-surface-2)` or semantic Voltage equivalents, `border-gray-*` → `border-border`. (2) Fix Cart.tsx `bg-blue-50 border-blue-200` multi-seller callout to Voltage tokens. (3) Convert 20 refs in `InventoryValidator.tsx`. (4) Fix 1 ref in `OrderConfirmedSection.tsx`. (5) Spot-check checkout components for any remaining light-mode classes. (6) Verify wireframe layout alignment — cart uses seller-grouped items with summary sidebar. No logic changes.
  - Verify: `npx vitest run` all tests pass; `grep -rn "bg-white\|text-gray-[0-9]\|bg-gray-[0-9]\|bg-blue-[0-9]\|border-gray-[0-9]" src/components/sections/Cart/ src/components/sections/OrderConfirmedSection/` returns zero
  - Done when: All commerce page components have zero bare light-mode Tailwind color classes

- [x] **T03: Align seller dashboard and payout pages** `est:2h`
  - Why: ConsumerSellerDashboard (1,017 lines, 40 light-mode refs) is the largest single component in S07. Payout components add ~8 more refs. These are the core seller experience pages.
  - Files: `src/components/seller/ConsumerSellerDashboard.tsx`, `src/components/seller/PayoutDashboard.tsx`, `src/components/seller/PayoutHistory.tsx`, `src/components/seller/PayoutSetupBanner.tsx`, `src/components/seller/BalanceCards.tsx`, `src/components/seller/PayoutSettingsPage.tsx`
  - Do: (1) Convert 40 light-mode refs in `ConsumerSellerDashboard.tsx` — this is the riskiest edit because the component mixes styling with functional state (tab switching, data display, delete actions). Carefully identify `className` conditionals that depend on old class values (e.g., active tab highlighting) and update both sides. (2) Convert refs in `PayoutDashboard.tsx`, `PayoutHistory.tsx`, `PayoutSetupBanner.tsx`, `BalanceCards.tsx`, `PayoutSettingsPage.tsx`. (3) Check tab/state-dependent styling patterns — active states should use Voltage accent colors, inactive should use `--text-tertiary` / `--bg-surface-2`. No logic changes.
  - Verify: `npx vitest run` all tests pass; `grep -rn "bg-white\|text-gray-[0-9]\|bg-gray-[0-9]\|bg-blue-[0-9]\|border-gray-[0-9]\|text-blue-[0-9]\|bg-green-[0-9]\|text-green-[0-9]" src/components/seller/ConsumerSellerDashboard.tsx src/components/seller/Payout*.tsx src/components/seller/BalanceCards.tsx` returns zero
  - Done when: Seller dashboard and all payout components have zero bare light-mode Tailwind color classes

- [x] **T04: Align seller upgrade, reputation, and list-card wrapper** `est:1.5h`
  - Why: CustomerToSellerUpgrade (945 lines, 51 refs) has the highest concentration of light-mode violations. ReputationDashboard (502 lines, 26 refs) and ReviewManagement (170 lines) complete the seller family. List-card page wrapper needs minor alignment (S08 owns the wizard).
  - Files: `src/components/seller/CustomerToSellerUpgrade.tsx`, `src/components/seller/ReputationDashboard.tsx`, `src/components/seller/ReviewManagement.tsx`, `src/components/seller/TrustHistoryChart.tsx`, `src/components/seller/VerificationStatus.tsx`, `src/app/[locale]/(main)/sell/list-card/page.tsx`
  - Do: (1) Convert 51 light-mode refs in `CustomerToSellerUpgrade.tsx` — multi-section form with benefits, requirements, checkboxes. Replace status indicators (`bg-green-*`, `bg-red-*`) with Voltage semantic tokens. (2) Convert 26 refs in `ReputationDashboard.tsx` — trust score gauge colors, factor breakdown, review list. (3) Align `ReviewManagement.tsx` and `TrustHistoryChart.tsx`. (4) Check `VerificationStatus.tsx` for light-mode refs. (5) Verify `sell/list-card` page wrapper uses Voltage chrome — do NOT build the wizard (S08 scope). No logic changes.
  - Verify: `npx vitest run` all tests pass; `grep -rn "bg-white\|text-gray-[0-9]\|bg-gray-[0-9]\|bg-blue-[0-9]\|text-blue-[0-9]\|bg-green-[0-9]\|text-green-[0-9]\|bg-red-[0-9]\|text-red-[0-9]" src/components/seller/CustomerToSellerUpgrade.tsx src/components/seller/ReputationDashboard.tsx src/components/seller/ReviewManagement.tsx src/components/seller/TrustHistoryChart.tsx src/components/seller/VerificationStatus.tsx` returns zero
  - Done when: All remaining seller components have zero bare light-mode Tailwind color classes; list-card wrapper uses Voltage tokens

- [x] **T05: Align misc pages and final Voltage compliance sweep** `est:1.5h`
  - Why: Community page needs structural rebuild to match wireframe "Coming Soon" layout. Remaining misc pages (categories, collections, info, sellers, products, reset-password) need spot-checks. Final sweep confirms zero light-mode violations across all S07 scope and existing tests still pass.
  - Files: `src/app/[locale]/(main)/community/page.tsx`, `src/components/content/InfoPage.tsx`, `src/app/[locale]/(reset-password)/reset-password/page.tsx`, `src/app/[locale]/(main)/user/verify-email/page.tsx`
  - Do: (1) Rebuild community page to match wireframe — "Coming Soon" hero section with headline, subtext, email signup form, and feature preview grid with emoji icons. Use Voltage tokens throughout. Current page has 201 lines with different structure. (2) Spot-check InfoPage.tsx (already close — uses `bg-surface-1`, `text-brand-primary`). (3) Check reset-password for Voltage alignment. (4) Scan categories, collections, products, seller-storefront pages — these mostly use existing Algolia/ProductListing components already aligned in S02. (5) Run final comprehensive grep across ALL S07-scoped files to confirm zero bare light-mode Tailwind classes. (6) Run full test suite to confirm no regressions. (7) Verify build succeeds.
  - Verify: `npx vitest run` all 794+ tests pass; `cd storefront && npx next build` succeeds; final grep across all S07-scoped components returns zero bare light-mode Tailwind color classes
  - Done when: Every S07-scoped page renders with Voltage tokens; zero bare light-mode Tailwind color classes remain in any scoped component; all tests pass; build succeeds

## Files Likely Touched

- `src/app/[locale]/(main)/user/layout.tsx`
- `src/components/molecules/UserNavigation/UserNavigation.tsx`
- `src/components/pricing/EnhancedPriceAlerts.tsx`
- `src/app/[locale]/(main)/user/verify-email/page.tsx`
- `src/components/sections/OrderReturnSection/ReturnItemsTab.tsx`
- `src/components/sections/Cart/EnhancedCartItems.tsx`
- `src/components/sections/Cart/Cart.tsx`
- `src/components/sections/Cart/InventoryValidator.tsx`
- `src/components/sections/OrderConfirmedSection/OrderConfirmedSection.tsx`
- `src/components/sections/CartShippingMethodsSection/CartShippingMethodsSection.tsx`
- `src/components/seller/ConsumerSellerDashboard.tsx`
- `src/components/seller/CustomerToSellerUpgrade.tsx`
- `src/components/seller/ReputationDashboard.tsx`
- `src/components/seller/ReviewManagement.tsx`
- `src/components/seller/TrustHistoryChart.tsx`
- `src/components/seller/VerificationStatus.tsx`
- `src/components/seller/PayoutDashboard.tsx`
- `src/components/seller/PayoutHistory.tsx`
- `src/components/seller/PayoutSetupBanner.tsx`
- `src/components/seller/BalanceCards.tsx`
- `src/components/seller/PayoutSettingsPage.tsx`
- `src/app/[locale]/(main)/sell/list-card/page.tsx`
- `src/app/[locale]/(main)/community/page.tsx`
- `src/components/content/InfoPage.tsx`
- `src/app/[locale]/(reset-password)/reset-password/page.tsx`
