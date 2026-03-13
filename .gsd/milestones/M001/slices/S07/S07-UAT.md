# S07: Remaining Pages — Visual Alignment — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven verification + human-experience visual check)
- Why this mode is sufficient: Automated grep confirms zero bare light-mode Tailwind classes (the slice's primary deliverable). Human visual comparison against wireframes is needed to confirm the tokens produce the correct visual result at both breakpoints.

## Preconditions

- Storefront running locally (`cd storefront && npm run dev`)
- Authenticated session (for user-account and seller pages)
- Customer-backend running (for seller dashboard data)

## Smoke Test

Open `/user/orders` on desktop — should show UserNavigation sidebar on the left (240px) with main content area on the right. Resize to mobile width — sidebar should disappear and horizontal pill nav should appear above content. All colors should be dark theme (no white backgrounds, no light gray text).

## Test Cases

### 1. UserAccountLayout responsive behavior

1. Navigate to `/user/orders` at 1440px width
2. **Expected:** 240px sidebar with UserNavigation links on the left, main content on the right
3. Resize browser to 390px width
4. **Expected:** Sidebar hidden, horizontal scrollable pill nav appears above content with same navigation items
5. Navigate to `/user/settings`, `/user/addresses`, `/user/wishlist` — all should show same layout

### 2. Verify-email standalone rendering

1. Navigate to `/user/verify-email` (or trigger email verification flow)
2. **Expected:** Centered card on full-width page, no sidebar, no pill nav. Radial gradient background. Dark theme colors.

### 3. Cart page Voltage compliance

1. Add items to cart, navigate to `/cart`
2. **Expected:** Seller-grouped cart items with dark card backgrounds (`bg-card`), no white backgrounds. Multi-seller callout (if applicable) uses dark surface colors. Quantity controls, remove buttons, and price displays all use Voltage tokens.
3. Trigger inventory validation warning (e.g., item near out-of-stock)
4. **Expected:** Warning indicators use rgba-tinted backgrounds (subtle colored backgrounds, not bright solid colors)

### 4. Seller dashboard Voltage compliance

1. Navigate to `/sell` (as authenticated seller)
2. **Expected:** Dashboard tabs (Listings/Orders/Analytics) use Voltage active/inactive states. Stat cards use dark backgrounds. Tier badge uses appropriate tier color with rgba background. Listing status dots, order badges, and review stars all use Voltage semantic colors.

### 5. Seller upgrade page

1. Navigate to seller upgrade page (as non-seller user)
2. **Expected:** Step progress indicators, benefits section, seller type cards, toggle switches, status badges all render in dark theme. No white backgrounds or light gray text visible.

### 6. Reputation dashboard

1. Navigate to reputation/trust page (as seller)
2. **Expected:** Trust score gauge renders with tier-appropriate color. Factor breakdown bars use Voltage colors. Review list and verification status all dark-themed.

### 7. Payout pages

1. Navigate to payout dashboard and settings
2. **Expected:** Balance cards, payout history table, setup banner, and settings form all use dark theme. Progress bars and status indicators use Voltage semantic colors.

### 8. Community page wireframe match

1. Navigate to `/community`
2. **Expected:** "Coming Soon" hero section with headline, "Launching Soon" badge, and description text. 6 emoji feature cards in 3-column grid (single column on mobile). Stats section. Discord CTA button with Discord brand purple (#5865F2).

### 9. Order confirmed page

1. Complete a checkout or navigate to order confirmation page
2. **Expected:** Confirmation card uses `bg-card`, no white backgrounds

### 10. Price alerts page

1. Navigate to `/user/price-alerts` (or equivalent)
2. **Expected:** Alert cards, status badges, notification indicators, and action buttons all use Voltage tokens. No bright colored backgrounds — status colors use rgba tints.

## Edge Cases

### Mobile pill nav overflow

1. Resize to 320px width on any user-account page
2. **Expected:** Pill nav is horizontally scrollable, no items are cut off or overlapping

### Seller dashboard with no data

1. Navigate to seller dashboard as new seller with no listings
2. **Expected:** Empty states use Voltage colors, skeleton loaders use `var(--bg-surface-3)` not `bg-gray-200`

## Failure Signals

- Any white (`#ffffff` or `bg-white`) background visible on any S07-scoped page
- Light gray text (`text-gray-*`) visible against dark backgrounds
- Bright blue, green, red, or yellow solid backgrounds instead of rgba-tinted versions
- UserNavigation sidebar appearing on mobile or pills appearing on desktop
- Verify-email page showing the sidebar layout

## Requirements Proved By This UAT

- R014 — Seller pages render with Voltage tokens, matching wireframe layout
- R015 — User account pages render inside UserAccountLayout with consistent dark theme
- R016 — Commerce pages (cart, checkout, order-confirmed) render with Voltage tokens
- R024 — (partial) Voltage dark theme consistency across all S07-scoped pages

## Not Proven By This UAT

- Pixel-level accuracy against wireframes at exact 1440px and 390px (requires side-by-side comparison tooling or human judgment)
- Pages outside S07 scope (card browse/detail/search from S02, deck pages from S03, homepage from S04, auth pages from S05) — those were verified in their respective slices
- Functional behavior — S07 is styling-only, no logic changes were made

## Notes for Tester

- This is a styling-only slice. If anything behaves differently (buttons not working, data not loading), that's a regression unrelated to S07.
- Focus on color consistency — the primary goal was eliminating all bare light-mode Tailwind color classes. Every surface should feel "dark theme native."
- Community page is intentionally a "Coming Soon" placeholder — there are no real community features behind it (R036 deferred).
- The sell/list-card page should show just a wrapper/heading — the wizard itself is S08 scope.
