# S07: Remaining Pages — Visual Alignment — Research

**Date:** 2026-03-14

## Summary

S07's scope is visual alignment of all remaining storefront pages to their S06-generated wireframes. The work spans four page families: **seller** (5 pages, ~4,850 lines across 15 components), **commerce** (3 pages, ~1,550 lines across 9 components), **user-account** (8 pages, ~1,650 lines across 13 components), and **misc** (8+ pages, ~350 lines in dedicated components plus page-level code). Requirements R014, R015, R016 are directly owned; R024 (dark theme consistency) is supported.

The core problem is consistent: components are **functionally correct** but styled with bare Tailwind color classes (`bg-white`, `text-gray-900`, `bg-blue-100 text-blue-800`) instead of Voltage CSS custom properties. There are ~450+ light-mode Tailwind references across 26 components that need conversion. The seller family is the largest effort (ConsumerSellerDashboard alone is 1,017 lines with 40 light-mode references). A secondary concern is layout alignment — user-account pages need a shared sidebar-to-pills responsive layout matching the wireframe, and some page structures don't match wireframe composition (e.g., verify-email should be standalone, not embedded in UserNavigation sidebar).

Key constraint: `sell/list-card` wireframe shows the S08 3-step wizard — S07 should NOT build that. The wireframe itself annotates it as "S08 target design." S07 aligns only the page wrapper/chrome for list-card; the wizard is greenfield for S08.

## Recommendation

**Approach: Family-first batch alignment with shared UserAccountLayout extraction.**

1. **Extract shared `UserAccountLayout`** — The wireframe's 3-column `240px 1fr` grid with `UserNavigation` sidebar (desktop) and horizontal pills (mobile) is duplicated across all 8 user pages. Extract once, reuse across all user-account routes via the existing `user/layout.tsx` (currently just a `-mt-6` wrapper). This is the highest-leverage change.

2. **Batch by family, ordered by risk:**
   - **User-account first** — 8 pages share the same layout; once `UserAccountLayout` works, each page is content-only alignment. Medium complexity, highest reuse.
   - **Commerce second** — 3 pages (cart, checkout, order-confirmed). Cart has the most light-mode violations (EnhancedCartItems: 35). Checkout already has minimal header layout. Order-confirmed is small.
   - **Seller third** — 5 pages with the heaviest components. ConsumerSellerDashboard (1,017 lines) and CustomerToSellerUpgrade (945 lines) need the most work. These are the riskiest because they're large, functional, and tightly coupled to backend APIs.
   - **Misc last** — Community (overhaul to wireframe "Coming Soon"), info pages (already close), categories/collections/products/sellers (mostly using existing Algolia/ProductListing components that are already Voltage-aligned from S02), verify-email (restructure to standalone), reset-password (minor chrome fix).

3. **Token replacement strategy:** Replace bare Tailwind colors with Voltage equivalents using inline `style={{ color: 'var(--text-secondary)' }}` (per D009) or mapped Tailwind classes where they exist (`text-primary`, `bg-card`, `border-border`). Maintain functional behavior — no logic changes, only styling.

4. **Test strategy:** Add structural tests per page family verifying Voltage token compliance (grep for `bg-white|text-gray-|bg-blue-` etc. in component output) and basic rendering (components mount without error with mock data). Target ~3-5 tests per family.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| User account sidebar layout | `UserNavigation` component + `user/layout.tsx` | Already has nav items and Voltage styling; extend with mobile pills |
| Cart seller grouping | `EnhancedCartItems` component | Already groups items by seller with functional CRUD; just restyle |
| Checkout step layout | `(checkout)/layout.tsx` with minimal header | Already correct pattern per wireframe; minor Voltage polish |
| Info page template | `InfoPage` component at `src/components/content/InfoPage.tsx` | Already close to Voltage (uses `bg-surface-1`, `text-brand-primary`); minor alignment |
| Seller dashboard tabs | `ConsumerSellerDashboard` with tab state | Functional tab system works; just restyle to match wireframe |

## Existing Code and Patterns

### Seller Family
- `src/components/seller/ConsumerSellerDashboard.tsx` (1,017 lines) — Full dashboard with overview/listings/sales/profile tabs. 40 light-mode references. Heavy component — most visual alignment work in S07.
- `src/components/seller/CustomerToSellerUpgrade.tsx` (945 lines) — Multi-section upgrade flow with benefits, requirements, form. 51 light-mode references.
- `src/components/seller/ReputationDashboard.tsx` (502 lines) — Trust score gauge, factor breakdown, reviews. 26 light-mode references.
- `src/components/seller/PayoutDashboard.tsx` (219 lines), `PayoutHistory.tsx` (161 lines), `PayoutSetupBanner.tsx` (119 lines), `PayoutSettingsPage.tsx` (227 lines) — Payout management. Minor light-mode issues.
- `src/components/seller/BalanceCards.tsx` (77 lines) — Clean, minimal alignment needed.

### Commerce Family
- `src/components/sections/Cart/EnhancedCartItems.tsx` (306 lines) — Seller-grouped cart items with quantity controls. 35 light-mode references. Biggest cart alignment job.
- `src/components/sections/Cart/Cart.tsx` (56 lines) — Cart shell with grid layout. Uses `bg-blue-50 border-blue-200` for multi-seller info callout.
- `src/components/sections/Cart/InventoryValidator.tsx` (291 lines) — Validation UI. 20 light-mode references.
- `src/components/sections/CartShippingMethodsSection/CartShippingMethodsSection.tsx` (352 lines) — Largest checkout section. Check for Voltage compliance.
- `src/components/sections/OrderConfirmedSection/OrderConfirmedSection.tsx` (50 lines) — Small, 1 light-mode reference.

### User-Account Family
- `src/components/molecules/UserNavigation/UserNavigation.tsx` (56 lines) — Sidebar nav with Voltage tokens. **Missing mobile pills variant.** Missing Price Alerts nav item (but wireframe also omits it — matches).
- `src/app/[locale]/(main)/user/layout.tsx` (7 lines) — Just `-mt-6` wrapper. Needs to become `UserAccountLayout` with sidebar grid.
- `src/components/pricing/EnhancedPriceAlerts.tsx` (508 lines) — 34 light-mode references. Largest user-account component.
- `src/components/organisms/Addressess/Addresses.tsx` (174 lines) — Note: directory misspelled "Addressess". Keep as-is to avoid import breakage.
- `src/components/sections/OrderReturnSection/ReturnItemsTab.tsx` (144 lines) — 4 light-mode references.

### Misc Family
- `src/app/[locale]/(main)/community/page.tsx` (201 lines) — Uses Tailwind semantic classes (`bg-card`, `text-primary`) which map to CSS vars already. But wireframe structure is different (Coming Soon hero with feature preview grid). Needs structural alignment.
- `src/components/content/InfoPage.tsx` (76 lines) — Already uses Voltage tokens (`bg-surface-1`, `text-brand-primary`, `border-default`). Close to wireframe.
- `src/app/[locale]/(main)/user/verify-email/page.tsx` (53 lines) — Currently embedded in UserNavigation sidebar layout. Wireframe shows standalone centered card without nav. Needs restructuring — possibly moving to its own route group or removing UserNav wrapper.
- `src/app/[locale]/(reset-password)/reset-password/page.tsx` (19 lines) — Already has own layout. Minor Voltage chrome alignment.

## Constraints

- **D009 (Voltage tokens via inline style):** Tailwind lacks utility classes for custom Voltage tokens. Use `style={{ color: 'var(--text-tertiary)' }}` for tokens like `--text-tertiary`, `--bg-surface-2`, `--border-default`.
- **D023 (Commit child repo changes):** Must commit storefront changes to `gsd/M001/S07` branch after each task.
- **No logic changes:** S07 is visual-only. Don't change component props, state management, API calls, or behavior. Only styling/layout.
- **S08 boundary:** `sell/list-card` page shows 3-step wizard in wireframe but that's S08 scope. S07 aligns only the page wrapper, not the wizard itself. The wireframe annotation confirms: "S08 target design."
- **S05 Profile page:** `/user` (profile) was rebuilt in S05 with Voltage tokens. Not in S07 scope — already aligned.
- **Existing test baseline:** 794 tests across 76 files. Must not break any.
- **Misspelled directory `Addressess`:** Don't rename to avoid import breakage across the codebase.
- **TalkJS dependency:** UserNavigation imports `useUnreads` from `@talkjs/react`. Tests must mock this.

## Common Pitfalls

- **Breaking functional behavior during restyling** — Large components like ConsumerSellerDashboard (1,017 lines) mix styling with logic. Surgical find-and-replace on class names, verify no `className` conditionals depend on the old values (e.g., `deleting ? 'opacity-50' : ''` patterns are fine, but `isActive ? 'bg-blue-500' : 'bg-gray-200'` needs both sides updated).
- **Tailwind `bg-card` is already correct** — Some components use `bg-card`, `text-primary`, `text-secondary` which map to CSS variables via `tailwind.config.ts`. Don't "fix" these — they're already Voltage-compatible. The targets are bare color classes: `bg-white`, `text-gray-*`, `bg-blue-*`, `border-gray-*`.
- **Mobile layout mismatch for user pages** — Current code uses `md:grid-cols-4` responsive grid. Wireframe uses `240px 1fr` with hidden sidebar + visible pills on mobile. Must implement both transitions, not just restyle the grid.
- **Verify-email page structural change** — Current page includes `UserNavigation` sidebar. Wireframe shows standalone centered card. Need to decide: move to `(auth)` route group, use conditional layout in user layout, or just remove UserNav from this specific page. Simplest: remove UserNav wrapper from verify-email page and render standalone.
- **Checkout already in separate route group** — Don't add nav/footer to checkout. It correctly uses `(checkout)` layout with minimal header. Wireframe confirms.

## Open Risks

- **Component coupling in seller pages** — ConsumerSellerDashboard imports from `@/lib/data/seller-dashboard` which likely has server-side data fetching. Tests will need comprehensive mocking. If test setup is too complex for 1,017-line component, may need to test at a higher level (page render with mock data).
- **Pricing components are M003 scope** — `MarketAnalysis.tsx` (56 light-mode refs), `PriceComparison.tsx` (49 refs), `PriceAlerts.tsx` (45 refs), `PriceHistoryChart.tsx` (3 refs) are in `src/components/pricing/`. Only `EnhancedPriceAlerts` is directly referenced by user-account wireframe. The others are M003 (price history charts, R035). Align `EnhancedPriceAlerts` only; leave others for M003.
- **Community page "Coming Soon" redesign** — Current implementation has 6 feature cards, stats, email signup. Wireframe also has Coming Soon hero + feature grid but with different structure (emoji icons, fewer features). Need to match wireframe exactly or keep functional parity with Voltage styling. Recommend matching wireframe structure.
- **UserNavigation items may diverge from wireframe** — Wireframe shows exactly: Orders, Messages, Returns, Addresses, Reviews, Wishlist, [separator], Settings. Current code matches (minus Price Alerts in wireframe). But some pages like reviews/written have sub-routes not in the nav. These are fine — nav items don't need to cover every route.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Frontend design / UI | `frontend-design` | **installed** (in `~/.gsd/agent/skills/`) |
| Next.js App Router | `wshobson/agents@nextjs-app-router-patterns` | available — 8.2K installs |
| shadcn/ui | `shadcn/ui@shadcn` | available — 15.3K installs |
| Tailwind CSS | `josiahsiegel/claude-plugin-marketplace@tailwindcss-advanced-layouts` | available — 2.3K installs |

The installed `frontend-design` skill is the most relevant for this visual alignment work.

## Sources

- All wireframe files in `docs/plans/wireframes/storefront-*.html` — authoritative alignment targets (source: S06)
- `tailwind.config.ts` — confirmed `bg-card` → `var(--card)`, `text-primary` → `var(--primary)` are Voltage-compatible
- `src/app/colors.css` — Voltage token definitions (`:root` + `.dark` blocks)
- S06 Summary — wireframe structure, data-component mappings, layout families
- S01 Summary — Voltage token patterns, `.price` class, inline style convention (D009)

## Page-to-Wireframe Mapping

### Pages in S07 Scope

| Page Route | Wireframe | Key Components | Light-mode Refs | Effort |
|---|---|---|---|---|
| `/sell` | `storefront-sell-dashboard.html` | ConsumerSellerDashboard | 40 | high |
| `/sell/list-card` | `storefront-sell-list-card.html` | CardListingForm (wrapper only) | 5 | low (S08 owns wizard) |
| `/sell/upgrade` | `storefront-sell-upgrade.html` | CustomerToSellerUpgrade | 51 | high |
| `/sell/payouts` | `storefront-sell-payouts.html` | PayoutDashboard, PayoutHistory, BalanceCards, PayoutSetupBanner | 8 | medium |
| `/sell/reputation` | `storefront-sell-reputation.html` | ReputationDashboard, ReviewManagement | 30 | medium |
| `/user/orders` | `storefront-user-orders.html` | UserNavigation, OrderDetailsSection, OrdersPagination | 0 | low (layout) |
| `/user/addresses` | `storefront-user-addresses.html` | Addresses | 0 | low |
| `/user/settings` | `storefront-user-settings.html` | ProfileDetails, ProfilePassword, PublicProfile, UserPreferences | 3 | low-medium |
| `/user/wishlist` | `storefront-user-wishlist.html` | WishlistItem | 0 | low |
| `/user/reviews` | `storefront-user-reviews.html` | ReviewsToWrite | 0 | low |
| `/user/messages` | `storefront-user-messages.html` | UserMessagesSection | 0 | low |
| `/user/returns` | `storefront-user-returns.html` | OrderReturnRequests, ReturnItemsTab | 4 | low |
| `/user/price-alerts` | `storefront-user-price-alerts.html` | EnhancedPriceAlerts | 34 | medium |
| `/cart` | `storefront-cart.html` | Cart, EnhancedCartItems, CartSummary | 58 | high |
| Checkout | `storefront-checkout.html` | CartAddressSection, CartPaymentSection, CartReview, CartShippingMethodsSection | 0 (check) | low-medium |
| Order confirmed | `storefront-order-confirmed.html` | OrderConfirmedSection | 1 | low |
| Categories | `storefront-categories.html` | AlgoliaProductsListing, ProductListing | 0 | low |
| Collections | `storefront-collections.html` | CollectionHeader (new), ProductListing | 0 | low |
| Community | `storefront-community.html` | CommunityPage (rebuild) | 0 (all custom) | medium |
| Info pages | `storefront-info-pages.html` | InfoPage | 0 | low |
| Seller storefront | `storefront-seller-storefront.html` | SellerPageHeader, SellerTabs | 0 | low |
| Products | `storefront-products.html` | ProductDetailsPage | 0 | low |
| Reset password | `storefront-reset-password.html` | ProfilePasswordForm | 0 | low |
| Verify email | `storefront-verify-email.html` | VerifyEmailPage (restructure) | 2 | low-medium |

### Pages NOT in S07 Scope
- `/user` (profile) — S05 already aligned
- `/sell/payouts/settings` — Sub-page of payouts, align with payouts task
- Login, register — S05 already aligned
- Homepage, cards, card-detail, search, deck-builder, deck-browser, deck-viewer — S02/S03/S04 already aligned
