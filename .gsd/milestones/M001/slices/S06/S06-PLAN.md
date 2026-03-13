# S06: Wireframe Generation & Figma Export

**Goal:** HTML wireframes exist for all 24 remaining storefront pages following Voltage patterns with sd-nav.js, and all 33 wireframes (9 existing + 24 new) are ready for Figma export.
**Demo:** Open any of the 24 new wireframe HTML files in a browser — each shows side-by-side desktop (1440px) and mobile (390px) frames with Voltage tokens, sd-nav.js navigation, and page content matching the existing React component structure. All 33 wireframes share identical `:root` token blocks.

## Must-Haves

- 24 new HTML wireframe files in `docs/plans/wireframes/` covering all routes from the page inventory
- Every wireframe includes: Figma capture.js, Google Fonts, identical Voltage `:root` tokens, canvas layout with desktop + mobile frames
- Every wireframe with standard layout includes sd-nav.js with correct `activeLink` and mobile variant
- Every wireframe with standard layout includes the footer matching existing wireframe pattern
- Checkout wireframe uses minimal header (back-to-cart + logo), no footer — matching `(checkout)` layout
- Auth-related wireframes (reset-password, verify-email) use appropriate layout chrome
- Sell/list-card wireframe shows the S08 target 3-step wizard (Identify → Condition+Photos → Price+Confirm), not the current CardListingForm
- Community wireframe shows "Coming Soon" state (R036 deferred)
- `data-component` attributes on major sections mapping to React component names
- Figma export attempted for all 33 wireframes via MCP (blocked by user auth action)

## Verification

- `ls docs/plans/wireframes/storefront-*.html | wc -l` returns 33 (9 existing + 24 new)
- Every new wireframe opens in a browser showing both desktop and mobile frames without errors
- Token consistency check: all 33 wireframes share identical `:root` CSS variable blocks
- `grep -l "capture.js" docs/plans/wireframes/storefront-*.html | wc -l` returns 33
- `grep -l "sd-nav.js" docs/plans/wireframes/storefront-*.html | wc -l` returns at least 30 (checkout/auth-related excluded)
- Verification script: `bash docs/plans/wireframes/verify-wireframes.sh` passes all checks

## Tasks

- [x] **T01: Commerce wireframes — Cart, Checkout, Order Confirmed** `est:2h`
  - Why: Commerce pages are the revenue funnel and have distinct layout variations (checkout has minimal header, no footer). Starting here establishes patterns for standard layout AND the checkout layout exception. Also creates a verification script reusable for all subsequent tasks.
  - Files: `docs/plans/wireframes/storefront-cart.html`, `docs/plans/wireframes/storefront-checkout.html`, `docs/plans/wireframes/storefront-order-confirmed.html`, `docs/plans/wireframes/verify-wireframes.sh`
  - Do: Copy boilerplate (`:root` tokens, canvas CSS, frame wrappers) from storefront-homepage.html. Cart: multi-seller grouped items, promo code, cart summary, sd-nav standard. Checkout: 2-column (address→shipping→payment left, order review right), minimal header (back-to-cart + logo), no sd-nav, no footer. Order confirmed: success state with order summary, confetti/check icon, sd-nav standard. Create `verify-wireframes.sh` that checks file count, capture.js presence, token consistency across all wireframes.
  - Verify: `bash docs/plans/wireframes/verify-wireframes.sh` passes; all 3 files render in browser with both frames
  - Done when: 3 commerce wireframe files exist, verification script passes for all wireframes (existing + new)

- [x] **T02: Seller wireframes — Dashboard, List-Card wizard, Upgrade, Payouts, Reputation** `est:2h`
  - Why: Seller pages are the supply-side experience (R014 alignment target). The list-card wireframe is especially important as it defines the S08 wizard target before implementation.
  - Files: `docs/plans/wireframes/storefront-sell-dashboard.html`, `docs/plans/wireframes/storefront-sell-list-card.html`, `docs/plans/wireframes/storefront-sell-upgrade.html`, `docs/plans/wireframes/storefront-sell-payouts.html`, `docs/plans/wireframes/storefront-sell-reputation.html`
  - Do: All use sd-nav with `activeLink: 'Sell'`. Dashboard: 4-tab layout (overview/listings/sales/profile) with stat cards, listing table, tier progress bar. List-card: 3-step wizard (Identify with card search → Condition+Photos with game-specific grading guide and photo upload zones → Price+Confirm with market price pre-fill and competitive indicator). Upgrade: benefits CTA section + upgrade form. Payouts: balance cards, payout history table, Stripe Connect. Reputation: trust score gauge, review list, tier progress.
  - Verify: `bash docs/plans/wireframes/verify-wireframes.sh` passes; all 5 files render with Sell nav active
  - Done when: 5 seller wireframe files exist with correct sd-nav activeLink, list-card shows 3-step wizard

- [x] **T03: User account wireframes — Orders, Addresses, Settings, Wishlist, Reviews, Messages, Returns, Price Alerts** `est:2h`
  - Why: 8 pages sharing the same sidebar-nav + content layout (R015 alignment target). Generate one canonical wireframe (orders), then adapt for remaining 7 — maximizing copy-and-adapt efficiency.
  - Files: `docs/plans/wireframes/storefront-user-orders.html`, `docs/plans/wireframes/storefront-user-addresses.html`, `docs/plans/wireframes/storefront-user-settings.html`, `docs/plans/wireframes/storefront-user-wishlist.html`, `docs/plans/wireframes/storefront-user-reviews.html`, `docs/plans/wireframes/storefront-user-messages.html`, `docs/plans/wireframes/storefront-user-returns.html`, `docs/plans/wireframes/storefront-user-price-alerts.html`
  - Do: All share 3-column layout: left sidebar (UserNavigation with 7 items + Settings separator), main content, right sidebar optional. No activeLink highlighted in sd-nav. Orders: order list with status badges + order detail expanded state. Addresses: address cards with add/edit form. Settings: grid of setting sections (profile, password, public profile, preferences, game preferences, notifications). Wishlist: card grid. Reviews: review list with tabs (To Write / Written). Messages: TalkJS-style inbox. Returns: return request list + return flow. Price alerts: alert list with card thumbnails and price thresholds.
  - Verify: `bash docs/plans/wireframes/verify-wireframes.sh` passes; all 8 files show sidebar nav with correct active states
  - Done when: 8 user account wireframe files exist, all with UserNavigation sidebar and no nav activeLink

- [x] **T04: Misc wireframes — Verify Email, Categories, Collections, Community, Info Pages, Seller Storefront, Reset Password, Products** `est:2h`
  - Why: Remaining 8 wireframe files covering misc routes. Mix of simple (verify email, reset password) and medium (categories, products, seller storefront) complexity. Info pages wireframe covers 6 routes in one file.
  - Files: `docs/plans/wireframes/storefront-verify-email.html`, `docs/plans/wireframes/storefront-categories.html`, `docs/plans/wireframes/storefront-collections.html`, `docs/plans/wireframes/storefront-community.html`, `docs/plans/wireframes/storefront-info-pages.html`, `docs/plans/wireframes/storefront-seller-storefront.html`, `docs/plans/wireframes/storefront-reset-password.html`, `docs/plans/wireframes/storefront-products.html`
  - Do: Verify email: simple status page with check icon/spinner, no sd-nav (auth layout). Categories: sidebar filters + product grid (similar to cards page), sd-nav standard. Collections: collection header + product grid. Community: "Coming Soon" hero with feature preview grid. Info pages: InfoPage template with eyebrow + title + description header card, then section cards — covers /about, /faq, /terms, /privacy, /contact, /terms/seller. Seller storefront: seller header (avatar, name, rating, stats) + tabs (Products / Reviews). Reset password: simple form with email/password fields, minimal chrome. Products: Medusa PDP with card enrichment section.
  - Verify: `bash docs/plans/wireframes/verify-wireframes.sh` passes with all 33 files; final token consistency confirmed
  - Done when: All 24 new wireframe files exist (total 33), verification script passes all checks, R013 satisfied

- [x] **T05: Figma export via MCP** `est:1h`
  - Why: R025 requires all wireframes exported to Figma. This is a separate task because it depends on Figma MCP OAuth authentication which requires user action.
  - Files: `docs/plans/wireframes/*.html` (read-only), `.gsd/milestones/M001/slices/S06/figma-export-log.md`
  - Do: Check Figma MCP auth status via `mcporter list`. If not authenticated, prompt user to run `mcporter auth figma`. Once authenticated, use Figma MCP html-to-design tool to export all 33 wireframes. Log success/failure per file in `figma-export-log.md`. If auth cannot be completed, document the blocker and mark R025 as blocked (wireframes still satisfy R013).
  - Verify: Figma export log shows status for all 33 wireframes; if auth blocked, blocker documented
  - Done when: Either all 33 wireframes exported to Figma (R025 satisfied) OR blocker documented with R013 still satisfied by HTML wireframes

## Files Likely Touched

- `docs/plans/wireframes/storefront-cart.html`
- `docs/plans/wireframes/storefront-checkout.html`
- `docs/plans/wireframes/storefront-order-confirmed.html`
- `docs/plans/wireframes/storefront-sell-dashboard.html`
- `docs/plans/wireframes/storefront-sell-list-card.html`
- `docs/plans/wireframes/storefront-sell-upgrade.html`
- `docs/plans/wireframes/storefront-sell-payouts.html`
- `docs/plans/wireframes/storefront-sell-reputation.html`
- `docs/plans/wireframes/storefront-user-orders.html`
- `docs/plans/wireframes/storefront-user-addresses.html`
- `docs/plans/wireframes/storefront-user-settings.html`
- `docs/plans/wireframes/storefront-user-wishlist.html`
- `docs/plans/wireframes/storefront-user-reviews.html`
- `docs/plans/wireframes/storefront-user-messages.html`
- `docs/plans/wireframes/storefront-user-returns.html`
- `docs/plans/wireframes/storefront-user-price-alerts.html`
- `docs/plans/wireframes/storefront-verify-email.html`
- `docs/plans/wireframes/storefront-categories.html`
- `docs/plans/wireframes/storefront-collections.html`
- `docs/plans/wireframes/storefront-community.html`
- `docs/plans/wireframes/storefront-info-pages.html`
- `docs/plans/wireframes/storefront-seller-storefront.html`
- `docs/plans/wireframes/storefront-reset-password.html`
- `docs/plans/wireframes/storefront-products.html`
- `docs/plans/wireframes/verify-wireframes.sh`
- `.gsd/milestones/M001/slices/S06/figma-export-log.md`
