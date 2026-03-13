---
id: T03
parent: S06
milestone: M001
provides:
  - 8 user account wireframes (orders, addresses, settings, wishlist, reviews, messages, returns, price-alerts)
  - Complete user account flow wireframe coverage with desktop + mobile frames and shared UserNavigation sidebar
key_files:
  - docs/plans/wireframes/storefront-user-orders.html
  - docs/plans/wireframes/storefront-user-addresses.html
  - docs/plans/wireframes/storefront-user-settings.html
  - docs/plans/wireframes/storefront-user-wishlist.html
  - docs/plans/wireframes/storefront-user-reviews.html
  - docs/plans/wireframes/storefront-user-messages.html
  - docs/plans/wireframes/storefront-user-returns.html
  - docs/plans/wireframes/storefront-user-price-alerts.html
key_decisions:
  - Price Alerts wireframe has no active sidebar item because UserNavigation.tsx does not include a Price Alerts link — it is accessed via a different route, so the sidebar renders with no active highlight
  - Orders wireframe used as canonical template for all 8, with shared UserNavigation sidebar (7 items + Settings separator) then content area adapted per page
patterns_established:
  - User account wireframes share 3-column layout with UserNavigation sidebar (Orders, Messages, Returns, Addresses, Reviews, Wishlist | Settings separator) that collapses to horizontal scrollable pill nav on mobile
  - Multi-state wireframes (orders list→detail, returns list→flow) use state-separator dividers between desktop frame variants, consistent with T01/T02 pattern
observability_surfaces:
  - none
duration: ~1.5h
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T03: User account wireframes — Orders, Addresses, Settings, Wishlist, Reviews, Messages, Returns, Price Alerts

**Created 8 user account wireframes with shared UserNavigation sidebar layout, desktop + mobile frames, and page-specific content matching React component structures — all passing 5/5 consistency checks.**

## What Happened

Built `storefront-user-orders.html` as the canonical user account wireframe with UserNavigation sidebar (7 items + Settings separator), no sd-nav activeLink, filter tabs (All/Active/Completed/Cancelled), order cards with status badges, and a second canvas state for order detail view with shipping timeline, delivery address, and payment info. Mobile frame collapses sidebar to horizontal scrollable pill nav.

Adapted the orders template for the remaining 7 wireframes:
- **Addresses**: 2-column card grid with name/street/city/phone, default badge, edit/delete actions, "Add New Address" card
- **Settings**: 6 sections — Profile Details (name, email, avatar upload), Password (current/new/confirm), Public Profile (bio, social links), User Preferences (theme, currency, language), Game Preferences (game-colored badge checkboxes for Magic, Pokémon, Yu-Gi-Oh!, One Piece), Notification Preferences (email/push toggles per category)
- **Wishlist**: Card grid with thumbnail, name, set, lowest price, Add to Cart, Remove; empty state with browse CTA
- **Reviews**: Tab bar (Reviews to Write / Reviews Written) with star rating inputs and seller response display
- **Messages**: TalkJS-style inbox with conversation list (avatar, name, preview, timestamp, unread badge) and active conversation panel with message bubbles
- **Returns**: Return request list with status badges + second canvas state for return flow (item selection, reason, condition, return method)
- **Price Alerts**: Alert list with card thumbnail, threshold price, alert type badge (Below/Above), active toggle, delete; empty state with browse CTA

All 8 wireframes share identical `:root` tokens, include capture.js, use sd-nav.js with no activeLink, and have `data-component` attributes on major sections.

## Verification

- `ls docs/plans/wireframes/storefront-user-*.html | wc -l` → **8** ✅
- `bash docs/plans/wireframes/verify-wireframes.sh` → **5/5 passed** ✅
- `grep -l "UserNavigation" docs/plans/wireframes/storefront-user-*.html | wc -l` → **8** ✅
- `grep "activeLink" docs/plans/wireframes/storefront-user-orders.html` → **0 matches** ✅
- All 8 files have desktop + mobile frames ✅
- All 8 have mobile horizontal scrollable nav (overflow-x: auto + flex nowrap) ✅
- Orders and returns show both list and detail/flow states (state-separator verified) ✅
- Settings wireframe shows all 6 sections (26 section heading matches) ✅
- All 8 files have data-component attributes (3–8 per file) ✅
- Visual browser verification: orders (list + detail views), settings (all 6 sections) confirmed rendering correctly

**Slice-level checks (25/33 wireframes so far — T04 will complete the remaining 8):**
- `ls docs/plans/wireframes/storefront-*.html | wc -l` → 25 (partial, 33 expected after T04)
- `grep -l "capture.js" docs/plans/wireframes/storefront-*.html | wc -l` → 25 ✅
- `grep -l "sd-nav.js" docs/plans/wireframes/storefront-user-*.html | wc -l` → 8 ✅
- verify-wireframes.sh passes all 5 checks ✅

## Diagnostics

Open any `storefront-user-*.html` file in a browser to visually inspect. Run `bash docs/plans/wireframes/verify-wireframes.sh` for automated consistency checks.

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `docs/plans/wireframes/storefront-user-orders.html` — Canonical user account wireframe: order list with filter tabs, status badges, pagination + order detail view with shipping timeline
- `docs/plans/wireframes/storefront-user-addresses.html` — Address card grid with add/edit/delete actions
- `docs/plans/wireframes/storefront-user-settings.html` — 6 settings sections: profile, password, public profile, user prefs, game prefs, notification prefs
- `docs/plans/wireframes/storefront-user-wishlist.html` — Card grid with pricing and cart actions, empty state
- `docs/plans/wireframes/storefront-user-reviews.html` — Tab bar (to write / written) with star ratings and seller responses
- `docs/plans/wireframes/storefront-user-messages.html` — TalkJS-style inbox with conversation list and message panel
- `docs/plans/wireframes/storefront-user-returns.html` — Return request list + return flow with item selection, reason, method
- `docs/plans/wireframes/storefront-user-price-alerts.html` — Alert list with thresholds, type badges, toggles, empty state
