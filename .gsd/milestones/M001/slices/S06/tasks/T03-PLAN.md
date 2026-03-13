---
estimated_steps: 5
estimated_files: 8
---

# T03: User account wireframes — Orders, Addresses, Settings, Wishlist, Reviews, Messages, Returns, Price Alerts

**Slice:** S06 — Wireframe Generation & Figma Export
**Milestone:** M001

## Description

Create 8 HTML wireframes for user account pages. All share the same layout: UserNavigation sidebar (Orders, Messages, Returns, Addresses, Reviews, Wishlist | Settings) + main content area. No nav activeLink highlighted (user account pages don't correspond to the 5 main nav items). Generate the orders wireframe first as the canonical template, then adapt for the remaining 7. This is the highest-volume task but the shared layout makes it efficient.

## Steps

1. **Create `storefront-user-orders.html` as canonical user-account wireframe.** Standard layout, sd-nav (no activeLink) + footer. 3-column desktop layout: left sidebar (UserNavigation with "Orders" active — 7 items: Orders, Messages, Returns, Addresses, Reviews, Wishlist, then border separator, then Settings), main content area, optional right whitespace. Content: page heading "My Orders", filter tabs (All / Active / Completed / Cancelled), order cards with: order number, date, status badge (Processing/Shipped/Delivered/Cancelled), seller name, item thumbnails row, order total, "View Details" link. Second canvas state: order detail view with full item list, shipping tracking timeline, delivery address, payment info. Mobile: sidebar collapses to horizontal scrollable nav at top. `data-component`: `UserNavigation`, `OrdersPagination`, `OrderDetailsSection`.

2. **Create user-account wireframes that share the sidebar layout.** For each: copy orders wireframe, swap sidebar active item and content area. Mobile variant keeps the horizontal scrollable nav pattern.
   - `storefront-user-addresses.html`: address cards in grid (2-col desktop), each with name, street, city/state/zip, phone, default badge, edit/delete actions. "Add New Address" card with + icon. `data-component`: `Addresses`.
   - `storefront-user-settings.html`: settings grid (2-col desktop). Sections: Profile Details (display name, email, avatar upload), Password (current + new + confirm), Public Profile (bio, social links), User Preferences (theme, currency, language), Game Preferences (favorite games checkboxes with game-colored badges), Notification Preferences (email/push toggles per category). `data-component`: `ProfileDetails`, `ProfilePassword`, `UserPreferences`, `GamePreferences`, `NotificationPreferences`.
   - `storefront-user-wishlist.html`: card grid matching `/cards` page grid layout. Each card shows thumbnail, name, set, current lowest price, "Add to Cart" button, "Remove" icon. Empty state: "Your wishlist is empty" with browse CTA. `data-component`: `Wishlist`.
   - `storefront-user-reviews.html`: tab bar (Reviews to Write / Reviews Written). "To Write" tab: list of purchased items awaiting review with card thumbnail, name, seller, order date, star rating input, "Write Review" button. "Written" tab: past reviews with rating, text, date, seller response. `data-component`: `ReviewsToWrite`.

3. **Create remaining user-account wireframes.**
   - `storefront-user-messages.html`: TalkJS-style inbox layout. Left panel: conversation list with avatar, name, last message preview, timestamp, unread badge. Right panel: active conversation with message bubbles, timestamp, input bar with send button. Mobile: conversation list full-width, tap to enter conversation view. `data-component`: `UserMessagesSection`.
   - `storefront-user-returns.html`: return request list similar to orders. Each return: order ref, items, reason, status badge (Pending/Approved/Completed/Rejected), date. Second canvas state: return request flow — select items to return (checkboxes), reason dropdown, condition description, return method selection (prepaid label / self-ship), submit. `data-component`: `OrderReturnRequests`, `ReturnItemsTab`, `ReturnMethodsTab`.
   - `storefront-user-price-alerts.html`: alert list. Each alert: card thumbnail, card name, set, current price, alert threshold price, alert type badge (Below / Above), toggle active/inactive, delete. "Create Alert" button at top. Empty state: "No price alerts" with browse CTA. `data-component`: `EnhancedPriceAlerts`.

4. **Ensure mobile sidebar consistency.** Verify all 8 wireframes have the same mobile treatment: UserNavigation collapses from vertical sidebar to horizontal scrollable pill/tab bar at top of content area. Active page highlighted.

5. **Run verification.** Execute `verify-wireframes.sh` — should now pass for all existing + T01 + T02 + T03 files.

## Must-Haves

- [ ] All 8 user account wireframe files exist with desktop + mobile frames
- [ ] All 8 show UserNavigation sidebar with correct active item per page
- [ ] No sd-nav activeLink set (user account pages don't highlight main nav)
- [ ] Mobile sidebar collapses to horizontal scrollable nav consistently across all 8
- [ ] Orders and returns wireframes show both list and detail/flow states
- [ ] Settings wireframe shows all 6 setting sections
- [ ] All files have identical `:root` tokens and include capture.js
- [ ] `data-component` attributes on major sections

## Verification

- `ls docs/plans/wireframes/storefront-user-*.html | wc -l` returns 8
- `bash docs/plans/wireframes/verify-wireframes.sh` passes
- `grep "UserNavigation" docs/plans/wireframes/storefront-user-*.html | wc -l` — at least 8 (one per file minimum)
- Spot check: `grep "activeLink" docs/plans/wireframes/storefront-user-orders.html` — should NOT match (no nav link active)

## Inputs

- `docs/plans/wireframes/storefront-homepage.html` — boilerplate reference
- `docs/plans/wireframes/storefront-profile.html` — multi-tab state wireframe pattern
- `storefront/src/components/molecules/UserNavigation/UserNavigation.tsx` — sidebar nav structure (7 items + Settings)
- `storefront/src/components/pricing/EnhancedPriceAlerts.tsx` — price alerts structure
- Cart, checkout, order, return, wishlist, review component files — content structure references

## Expected Output

- 8 HTML wireframe files in `docs/plans/wireframes/storefront-user-*.html`
- All sharing consistent UserNavigation sidebar layout
- Each with page-specific content matching its React component structure
