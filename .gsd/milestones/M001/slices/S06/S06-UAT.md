# S06: Wireframe Generation & Figma Export — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S06 produces static HTML wireframe files — no runtime, no services, no compilation. Verification is structural (files exist, tokens match, scripts pass) and visual (open in browser, compare layout).

## Preconditions

- A web browser (any modern browser) to open HTML wireframe files
- Bash shell to run `verify-wireframes.sh`
- No servers or dependencies needed

## Smoke Test

Run `bash docs/plans/wireframes/verify-wireframes.sh` — all 5 checks should pass. Then open any new wireframe (e.g., `storefront-cart.html`) in a browser and confirm desktop + mobile frames render side-by-side with Voltage dark theme.

## Test Cases

### 1. Total wireframe count

1. Run `ls docs/plans/wireframes/storefront-*.html | wc -l`
2. **Expected:** 33

### 2. Verification script passes

1. Run `bash docs/plans/wireframes/verify-wireframes.sh`
2. **Expected:** 5 passed, 0 failed

### 3. Commerce wireframes render correctly

1. Open `storefront-cart.html` in browser
2. Confirm desktop frame shows multi-seller cart with grouped items, promo code, cart summary
3. Confirm mobile frame shows stacked layout
4. Open `storefront-checkout.html` in browser
5. Confirm minimal header (← Back to cart + logo), no navigation bar, no footer
6. Confirm 2-column layout: stepped sections left, order review right
7. Open `storefront-order-confirmed.html` in browser
8. **Expected:** Success state with check icon, order number, and standard navigation

### 4. Seller wireframes with correct nav state

1. Open `storefront-sell-dashboard.html` in browser
2. Confirm "Sell" is highlighted in the navigation bar
3. Confirm 4-tab layout (Overview/Listings/Sales/Profile)
4. Open `storefront-sell-list-card.html` in browser
5. **Expected:** 3-step wizard visible (Identify → Condition+Photos → Price+Confirm)

### 5. User account wireframes share sidebar layout

1. Open `storefront-user-orders.html` in browser
2. Confirm left sidebar with UserNavigation (Orders, Messages, Returns, Addresses, Reviews, Wishlist, Settings)
3. Open `storefront-user-settings.html` in browser
4. Confirm same sidebar with "Settings" highlighted
5. **Expected:** All 8 user-account wireframes share identical sidebar navigation pattern

### 6. Auth-adjacent wireframes exclude navigation

1. Open `storefront-verify-email.html` in browser
2. Confirm no navigation bar, centered card layout with logo
3. Open `storefront-reset-password.html` in browser
4. **Expected:** No navigation bar, minimal chrome with centered form

### 7. Community wireframe shows Coming Soon

1. Open `storefront-community.html` in browser
2. **Expected:** "Coming Soon" hero with feature preview grid and Discord CTA

### 8. Info pages wireframe covers multiple routes

1. Open `storefront-info-pages.html` in browser
2. Confirm header card with navigation pills (About, FAQ, Terms, Privacy, Contact, Seller Terms)
3. **Expected:** Two state variants visible — About (paragraph sections) and FAQ (accordion items)

### 9. Token consistency across all wireframes

1. Run `grep "brand-primary: #8B5CF6" docs/plans/wireframes/storefront-*.html | wc -l`
2. **Expected:** 33

### 10. capture.js present in all wireframes

1. Run `grep -l "capture.js" docs/plans/wireframes/storefront-*.html | wc -l`
2. **Expected:** 33

## Edge Cases

### Wireframe with multiple states

1. Open `storefront-user-orders.html` in browser
2. Scroll past the order list desktop frame
3. **Expected:** A second desktop frame showing order detail view with shipping timeline, separated by a state divider

### Checkout layout exception

1. Open `storefront-checkout.html`
2. Search page source for "sd-nav.js"
3. **Expected:** No match — checkout intentionally excludes the shared navigation script

## Failure Signals

- `verify-wireframes.sh` reports any FAIL — indicates token drift or missing files
- A wireframe opens with white/light background instead of dark — token block missing or wrong
- Navigation bar shows on checkout, verify-email, or reset-password — wrong layout chrome applied
- Any wireframe missing desktop + mobile side-by-side frames — incomplete layout
- `data-component` attributes missing from major sections — won't provide React mapping for S07

## Requirements Proved By This UAT

- R013 — All 33 wireframes exist with consistent Voltage tokens, capture.js, and correct navigation presence/absence. Every storefront page has an authoritative wireframe target.

## Not Proven By This UAT

- R025 — Figma export not completed (blocked on MCP auth). HTML wireframes remain authoritative per D003.
- Visual pixel-perfection of React storefront pages against wireframes — that's S07's scope.

## Notes for Tester

- sd-nav count is 29 (not 30) because 4 pages correctly exclude navigation: checkout, auth, verify-email, reset-password. This is intentional.
- The Figma export blocker is documented in `.gsd/milestones/M001/slices/S06/figma-export-log.md` with three resolution paths.
- Community wireframe shows "Coming Soon" intentionally — R036 (community features) is deferred to M004.
