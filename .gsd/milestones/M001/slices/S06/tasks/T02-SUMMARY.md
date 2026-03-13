---
id: T02
parent: S06
milestone: M001
provides:
  - 5 seller wireframes (dashboard, list-card wizard, upgrade, payouts, reputation)
  - Complete seller flow wireframe coverage with desktop + mobile frames
key_files:
  - docs/plans/wireframes/storefront-sell-dashboard.html
  - docs/plans/wireframes/storefront-sell-list-card.html
  - docs/plans/wireframes/storefront-sell-upgrade.html
  - docs/plans/wireframes/storefront-sell-payouts.html
  - docs/plans/wireframes/storefront-sell-reputation.html
key_decisions:
  - Payouts wireframe includes two desktop states (balance+history and settings) matching the actual PayoutDashboard and settings page split in the storefront
  - Reputation wireframe uses conic-gradient CSS for the trust score gauge ring, matching the circular gauge specified in the task plan
patterns_established:
  - Seller wireframes use breadcrumb navigation (Dashboard / Payouts, Dashboard / Reputation) mirroring the existing component link structure
  - Multi-state wireframes use state-separator dividers between desktop frame variants (same pattern as T01 checkout and the dashboard listings tab)
observability_surfaces:
  - Open any wireframe in a browser to visually verify. Run `bash docs/plans/wireframes/verify-wireframes.sh` to check consistency across all wireframes.
duration: ~20 min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Seller wireframes — Dashboard, List-Card wizard, Upgrade, Payouts, Reputation

**Created 5 seller wireframes covering dashboard (2 tab states), 3-step listing wizard, upgrade flow (benefits + form), payouts (balance + settings), and reputation (trust score + reviews) — all with desktop + mobile frames and passing 5/5 consistency checks.**

## What Happened

Found 3 of 5 wireframes already existed from a prior run (dashboard, list-card, upgrade) with full content and correct structure. Created the 2 missing wireframes:

- **storefront-sell-payouts.html** — Two desktop states: (1) balance cards (available/pending/total earned) + qualification progress meters + payout history table with status badges, and (2) payout settings with Stripe Connect account display, payout schedule, minimum threshold input, and reserve policy. Mobile frame stacks balance cards vertically with condensed history table.

- **storefront-sell-reputation.html** — Trust score hero with conic-gradient circular gauge (780/1000), 8-factor breakdown grid (Rating, Sales Volume, Performance, Verification, Experience, Dispute Rate, Consistency, Recent Activity), tier progress bar (Silver → Gold), stats row (Overall Rating, Response Rate, Ship Accuracy), and recent reviews list with buyer avatars, star ratings, review text, and seller responses. Mobile adapts to single-column layout with compact gauge.

All 5 files use `activeLink: 'Sell'` in sd-nav init, include `data-component` attributes mapping to React component names, share identical `:root` token blocks, and include capture.js.

## Verification

- `ls docs/plans/wireframes/storefront-sell-*.html | wc -l` → **5** ✓
- `grep -l "activeLink: 'Sell'" docs/plans/wireframes/storefront-sell-*.html | wc -l` → **5** ✓
- `grep "ListingWizard" docs/plans/wireframes/storefront-sell-list-card.html` → confirms wizard component name ✓
- `bash docs/plans/wireframes/verify-wireframes.sh` → **5 passed, 0 failed** ✓

### Slice-level checks (intermediate — 17 of 33 target wireframes):
- Total wireframes: 17 (need 33 at slice end)
- capture.js in all: 17/17 ✓
- sd-nav.js where expected: 15/17 (checkout + auth excluded) ✓
- Token consistency: all pass ✓

## Diagnostics

Open any `storefront-sell-*.html` file in a browser to visually inspect. Run `verify-wireframes.sh` for automated consistency checks.

## Deviations

None. The 3 pre-existing wireframes (dashboard, list-card, upgrade) were already complete and correct, so only 2 files needed creation.

## Known Issues

None.

## Files Created/Modified

- `docs/plans/wireframes/storefront-sell-payouts.html` — New: seller payouts wireframe with balance/history + settings states, desktop + mobile
- `docs/plans/wireframes/storefront-sell-reputation.html` — New: seller reputation wireframe with trust score gauge, factor breakdown, tier progress, reviews, desktop + mobile
