# S06: Wireframe Generation & Figma Export — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S06 produces static HTML wireframe files — no runtime, no server, no user interaction. Verification is file existence, structural consistency, and visual inspection in a browser.

## Preconditions

- A web browser capable of opening local HTML files
- Terminal access to run `bash docs/plans/wireframes/verify-wireframes.sh`
- No servers or databases required

## Smoke Test

Run `bash docs/plans/wireframes/verify-wireframes.sh` — all 5 checks should pass. Then open `docs/plans/wireframes/storefront-cart.html` in a browser and confirm both desktop (1440px) and mobile (390px) frames render with Voltage dark theme styling.

## Test Cases

### 1. Full wireframe count

1. Run `ls docs/plans/wireframes/storefront-*.html | wc -l`
2. **Expected:** 33

### 2. Automated consistency checks

1. Run `bash docs/plans/wireframes/verify-wireframes.sh`
2. **Expected:** 5/5 checks pass (file count, capture.js, brand-primary token, sd-nav presence, key token consistency)

### 3. Commerce wireframes render correctly

1. Open `storefront-cart.html` in browser
2. Verify desktop frame shows multi-seller grouped cart items with summary sidebar
3. Verify mobile frame stacks items and summary vertically
4. Open `storefront-checkout.html` — verify minimal header (no nav, no footer), 2-column layout with address/shipping/payment steps
5. Open `storefront-order-confirmed.html` — verify success state with green check and order summary
6. **Expected:** All 3 render with both frames, Voltage dark theme, correct layout patterns

### 4. Seller wireframes with correct nav state

1. Open `storefront-sell-dashboard.html` in browser
2. Verify "Sell" is highlighted in the top navigation
3. Verify dashboard shows stat cards and tab layout
4. Open `storefront-sell-list-card.html` — verify 3-step wizard (Identify → Condition+Photos → Price+Confirm)
5. Check remaining seller wireframes (upgrade, payouts, reputation) — all should show "Sell" nav active
6. **Expected:** All 5 seller wireframes have `activeLink: 'Sell'`, list-card shows wizard steps

### 5. User account wireframes share sidebar layout

1. Open `storefront-user-orders.html` in browser
2. Verify left sidebar has UserNavigation with 7 items (Orders, Messages, Returns, Addresses, Reviews, Wishlist) + Settings separator
3. Verify "Orders" is highlighted in sidebar
4. Check desktop frame shows order list with status badges
5. Open `storefront-user-settings.html` — verify Settings is highlighted, 6 sections visible
6. Spot-check 2 more user wireframes (e.g., messages, wishlist) for consistent sidebar
7. **Expected:** All 8 user wireframes share identical sidebar navigation with correct active states

### 6. Auth-adjacent wireframes have no navigation

1. Open `storefront-verify-email.html` — verify no sd-nav header, centered logo, verifying/verified states
2. Open `storefront-reset-password.html` — verify no sd-nav header, centered form layout
3. Run `grep -L "sd-nav.js" docs/plans/wireframes/storefront-checkout.html docs/plans/wireframes/storefront-auth.html docs/plans/wireframes/storefront-verify-email.html docs/plans/wireframes/storefront-reset-password.html | wc -l`
4. **Expected:** 4 files correctly exclude sd-nav.js

### 7. Community wireframe shows Coming Soon

1. Open `storefront-community.html` in browser
2. Verify hero section shows "Coming Soon" messaging
3. Verify feature preview grid shows 6 planned features
4. **Expected:** Community page renders as a teaser, not functional content

### 8. Info pages wireframe covers multiple routes

1. Open `storefront-info-pages.html` in browser
2. Verify header card with eyebrow, title, description, navigation pills
3. Verify two states visible: About-style sections and FAQ accordion
4. **Expected:** Single wireframe template covers /about, /faq, /terms, /privacy, /contact, /terms/seller

### 9. Token consistency across all wireframes

1. Run `grep "brand-primary: #8B5CF6" docs/plans/wireframes/storefront-*.html | wc -l`
2. **Expected:** 33 (all wireframes share identical Voltage tokens)

### 10. data-component attributes present

1. Run `grep -l "data-component" docs/plans/wireframes/storefront-cart.html docs/plans/wireframes/storefront-sell-list-card.html docs/plans/wireframes/storefront-user-orders.html`
2. **Expected:** All 3 files listed (and all new wireframes have data-component attributes)

## Edge Cases

### Checkout has no footer

1. Open `storefront-checkout.html`
2. Scroll to bottom of desktop frame
3. **Expected:** No footer section — checkout wireframe ends after "Place Order" button and order review

### Wireframe with multiple states

1. Open `storefront-user-orders.html`
2. Look for state-separator divider between desktop frames
3. **Expected:** Two desktop frame states visible: order list view and order detail view

## Failure Signals

- `verify-wireframes.sh` reports any FAIL → token drift or missing files
- Any wireframe opens with broken layout (missing CSS, no dark theme) → boilerplate copy error
- sd-nav.js missing from a standard page → incorrect exclusion
- sd-nav.js present on checkout/auth/verify-email/reset-password → incorrect inclusion
- `data-component` attributes missing → wireframe won't map to React components for S07

## Requirements Proved By This UAT

- R013 — All storefront pages have authoritative wireframe targets (33 HTML files with consistent tokens, responsive frames, and React component mappings)

## Not Proven By This UAT

- R025 — Figma export remains blocked on MCP auth. This UAT validates the HTML wireframes but cannot verify Figma import fidelity.
- Visual pixel-perfection — wireframes define the target; actual page alignment is S07's scope
- Responsive behavior — wireframes show static desktop + mobile frames, not live responsive CSS

## Notes for Tester

- Every wireframe has two embedded iframes (desktop 1440px and mobile 390px) side by side. Both should be visible without scrolling horizontally on a wide monitor.
- The Figma capture.js script in each file is for the Figma HTML-to-Design plugin — it won't affect browser viewing.
- sd-nav.js loads from a relative path — if you move wireframe files out of `docs/plans/wireframes/`, the nav won't render.
- The seller list-card wireframe is particularly important to inspect — it defines the S08 wizard UI target.
