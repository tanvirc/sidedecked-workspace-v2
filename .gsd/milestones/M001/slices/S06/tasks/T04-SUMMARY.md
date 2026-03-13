---
id: T04
parent: S06
milestone: M001
provides:
  - 8 misc wireframes completing full set of 24 new wireframes (33 total)
  - Updated verify-wireframes.sh with 33-file threshold
  - R013 satisfied — all storefront pages have authoritative wireframe targets
key_files:
  - docs/plans/wireframes/storefront-verify-email.html
  - docs/plans/wireframes/storefront-reset-password.html
  - docs/plans/wireframes/storefront-categories.html
  - docs/plans/wireframes/storefront-collections.html
  - docs/plans/wireframes/storefront-products.html
  - docs/plans/wireframes/storefront-community.html
  - docs/plans/wireframes/storefront-info-pages.html
  - docs/plans/wireframes/storefront-seller-storefront.html
  - docs/plans/wireframes/verify-wireframes.sh
key_decisions:
  - verify-email and reset-password use minimal auth-adjacent chrome (no sd-nav, no footer) with centered logo + card layout, matching the auth wireframe pattern
  - info-pages wireframe covers 6 routes (/about, /faq, /terms, /privacy, /contact, /terms/seller) in a single file with 2 state variants (About sections vs FAQ accordion), matching InfoPage component's single-template design
  - Seller storefront uses Products/Reviews tab states in separate canvas sections, consistent with T02 multi-state pattern
patterns_established:
  - Auth-adjacent wireframes (verify-email, reset-password) use centered card + logo layout with subtle radial gradient background, no sd-nav or footer
  - FAQ variant of InfoPage uses accordion-style faq-item elements with open/closed states
  - Seller storefront header uses cover-image + overlapping avatar pattern with stat chips
observability_surfaces:
  - none
duration: ~20min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T04: Misc wireframes — Verify Email, Categories, Collections, Community, Info Pages, Seller Storefront, Reset Password, Products

**Created 8 misc wireframes completing the full 33-wireframe set (9 existing + 24 new), with all consistency checks passing 5/5.**

## What Happened

Built all 8 remaining wireframes across 5 categories:

1. **Auth-adjacent** (verify-email, reset-password): Minimal chrome with no sd-nav. Verify-email has verifying spinner + verified success states. Reset-password has request form + new password form + auth error states — all with desktop + mobile frames.

2. **Product/commerce browse** (categories, collections, products): Categories has an index grid + detail page with sidebar filters, matching AlgoliaProductsListing. Collections has a banner header + filtered product grid. Products is a full PDP with image gallery, variant selector, quantity control, add-to-cart, TCG enrichment card, and related products row.

3. **Community**: Coming Soon design matching the existing community page — hero with icon, feature preview grid (6 cards: Player Profiles, Discussion Forums, Local Events, Trading Groups, Tournament Calendar, Deck Sharing), stats section, and Discord CTA banner.

4. **Info pages**: Single wireframe covering all 6 info routes via the InfoPage component template — header card with eyebrow/title/description/navigation pills, content sections. Two states: About (paragraph sections) and FAQ (expandable accordion items).

5. **Seller storefront**: Cover image + overlapping avatar, seller name with trust badge, stat chips (Total Sales, Items Listed, Response Rate, Avg Ship Time), Products tab with listing grid, Reviews tab with buyer review cards.

Updated `verify-wireframes.sh` to require >= 33 files and added verify-email/reset-password to the sd-nav exclusion list.

## Verification

- `ls docs/plans/wireframes/storefront-*.html | wc -l` → **33** ✅
- `bash docs/plans/wireframes/verify-wireframes.sh` → **5/5 checks passed** ✅
- `grep "capture.js" docs/plans/wireframes/storefront-*.html | wc -l` → **33** ✅
- `grep "brand-primary: #8B5CF6" docs/plans/wireframes/storefront-*.html | wc -l` → **33** ✅
- verify-email and reset-password correctly exclude sd-nav.js ✅
- Categories and products have `activeLink: 'Marketplace'` ✅
- Community has `activeLink: 'Community'` ✅
- All 8 new files have `data-component` attributes on major sections ✅
- Visual browser verification of verify-email (spinner + centered logo), community (hero + feature grid + Discord CTA), seller storefront (cover + avatar + stats + tabs), and info-pages (About header + pills + sections) ✅

### Slice-level verification (all passing — this is the final task):
- `ls docs/plans/wireframes/storefront-*.html | wc -l` → 33 ✅
- Token consistency: all 33 share identical `:root` CSS blocks ✅
- `grep -l "capture.js" docs/plans/wireframes/storefront-*.html | wc -l` → 33 ✅
- `grep -l "sd-nav.js" docs/plans/wireframes/storefront-*.html | wc -l` → 29 (≥ 30 expected — 4 excluded: checkout, auth, verify-email, reset-password) ⚠️
- `bash docs/plans/wireframes/verify-wireframes.sh` → passes all checks ✅

Note: sd-nav count is 29 instead of 30. The slice plan said "at least 30" but 4 files correctly exclude sd-nav (checkout, auth, verify-email, reset-password). This is correct behavior per the wireframe designs — verify-email and reset-password are auth-adjacent routes that don't use the main navigation.

## Diagnostics

Open any `storefront-*.html` file in a browser to visually inspect. Run `bash docs/plans/wireframes/verify-wireframes.sh` for automated consistency checks.

## Deviations

- sd-nav count is 29 (not 30) because verify-email and reset-password are correctly excluded as auth-adjacent pages. The slice plan's estimate of "at least 30" assumed only 2 exclusions (checkout, auth) but the actual design required 4 exclusions.

## Known Issues

None.

## Files Created/Modified

- `docs/plans/wireframes/storefront-verify-email.html` — Verify email wireframe (2 states: verifying/verified, no sd-nav)
- `docs/plans/wireframes/storefront-reset-password.html` — Reset password wireframe (3 states: request/form/error, no sd-nav)
- `docs/plans/wireframes/storefront-categories.html` — Categories wireframe (2 states: index grid/detail with filters)
- `docs/plans/wireframes/storefront-collections.html` — Collections wireframe (banner + filtered product grid)
- `docs/plans/wireframes/storefront-products.html` — Product detail page wireframe (gallery, info, enrichment, related)
- `docs/plans/wireframes/storefront-community.html` — Community wireframe (coming soon hero + features + Discord CTA)
- `docs/plans/wireframes/storefront-info-pages.html` — Info pages wireframe (2 states: About sections/FAQ accordion)
- `docs/plans/wireframes/storefront-seller-storefront.html` — Seller storefront wireframe (2 states: products/reviews tabs)
- `docs/plans/wireframes/verify-wireframes.sh` — Updated threshold to 33 files, added verify-email/reset-password to nav exclusions
