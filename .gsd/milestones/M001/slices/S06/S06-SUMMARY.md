---
id: S06
parent: M001
milestone: M001
provides:
  - 24 new HTML wireframes covering all remaining storefront pages (33 total)
  - Reusable verify-wireframes.sh script with 5 automated consistency checks
  - Figma export log documenting auth blocker and resolution paths
requires:
  - slice: S01
    provides: Voltage token reference, sd-nav.js patterns, shared component visual language
affects:
  - S07
key_files:
  - docs/plans/wireframes/storefront-cart.html
  - docs/plans/wireframes/storefront-checkout.html
  - docs/plans/wireframes/storefront-order-confirmed.html
  - docs/plans/wireframes/storefront-sell-dashboard.html
  - docs/plans/wireframes/storefront-sell-list-card.html
  - docs/plans/wireframes/storefront-sell-upgrade.html
  - docs/plans/wireframes/storefront-sell-payouts.html
  - docs/plans/wireframes/storefront-sell-reputation.html
  - docs/plans/wireframes/storefront-user-orders.html
  - docs/plans/wireframes/storefront-user-addresses.html
  - docs/plans/wireframes/storefront-user-settings.html
  - docs/plans/wireframes/storefront-user-wishlist.html
  - docs/plans/wireframes/storefront-user-reviews.html
  - docs/plans/wireframes/storefront-user-messages.html
  - docs/plans/wireframes/storefront-user-returns.html
  - docs/plans/wireframes/storefront-user-price-alerts.html
  - docs/plans/wireframes/storefront-verify-email.html
  - docs/plans/wireframes/storefront-categories.html
  - docs/plans/wireframes/storefront-collections.html
  - docs/plans/wireframes/storefront-community.html
  - docs/plans/wireframes/storefront-info-pages.html
  - docs/plans/wireframes/storefront-seller-storefront.html
  - docs/plans/wireframes/storefront-reset-password.html
  - docs/plans/wireframes/storefront-products.html
  - docs/plans/wireframes/verify-wireframes.sh
  - .gsd/milestones/M001/slices/S06/figma-export-log.md
key_decisions:
  - D024 — Wireframe generation grouped by layout family (commerce → seller → user-account → misc) to maximize copy-and-adapt efficiency
  - D025 — Figma export decoupled from wireframe generation, gated on user auth action
  - Checkout wireframe uses minimal header (back-to-cart + centered logo) with no sd-nav or footer, matching storefront (checkout) route group layout
  - Auth-adjacent wireframes (verify-email, reset-password) use centered card + logo layout without sd-nav or footer
  - Info-pages wireframe covers 6 routes in a single file with 2 state variants (sections vs FAQ accordion)
  - List-card wireframe shows the S08 target 3-step wizard (Identify → Condition+Photos → Price+Confirm)
patterns_established:
  - Copy :root tokens, canvas CSS, frame wrappers, footer, and sd-nav init verbatim from storefront-homepage.html for each new wireframe
  - Layout family grouping reduces 24 unique wireframes to ~6 layout variants with content swaps
  - User account wireframes share 3-column layout with UserNavigation sidebar collapsing to horizontal pill nav on mobile
  - Seller wireframes share dashboard tab layout with activeLink set to 'Sell'
  - Multi-state wireframes use state-separator dividers between desktop frame variants
  - data-component attributes map directly to React component names from source code
observability_surfaces:
  - bash docs/plans/wireframes/verify-wireframes.sh — 5-check automated consistency validation across all 33 wireframes
drill_down_paths:
  - .gsd/milestones/M001/slices/S06/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S06/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S06/tasks/T03-SUMMARY.md
  - .gsd/milestones/M001/slices/S06/tasks/T04-SUMMARY.md
  - .gsd/milestones/M001/slices/S06/tasks/T05-SUMMARY.md
duration: ~4.5h across 5 tasks
verification_result: passed
completed_at: 2026-03-14
---

# S06: Wireframe Generation & Figma Export

**Created 24 new HTML wireframes (33 total) covering all storefront pages with Voltage tokens, responsive desktop+mobile frames, and data-component React mappings. Figma export blocked by MCP auth — documented with resolution paths.**

## What Happened

Generated 24 HTML wireframes across 4 layout families, using the 9 existing wireframes as boilerplate source:

**T01 — Commerce (3 files):** Cart with multi-seller grouped items and promo code, checkout with minimal header (no nav/footer) and 3-step progress indicator, order-confirmed with success state and CTAs. Created `verify-wireframes.sh` with 5 automated checks (file count, capture.js, token consistency, sd-nav presence, key token values).

**T02 — Seller (5 files):** Dashboard with 4-tab layout and stat cards, list-card with 3-step wizard (Identify → Condition+Photos → Price+Confirm) matching S08 target, upgrade with benefits CTA, payouts with balance cards and Stripe Connect settings, reputation with conic-gradient trust score gauge and review list. All use `activeLink: 'Sell'`.

**T03 — User Account (8 files):** Orders (canonical template) with filter tabs and detail view, then adapted for addresses (card grid), settings (6 sections), wishlist (card grid), reviews (to-write/written tabs), messages (TalkJS-style inbox), returns (list + flow), price-alerts (threshold toggles). All share UserNavigation sidebar collapsing to horizontal pill nav on mobile.

**T04 — Misc (8 files):** Verify-email and reset-password with auth-adjacent minimal chrome, categories and products with marketplace nav, collections with banner header, community with "Coming Soon" hero and feature preview grid, info-pages covering 6 routes in one file (About sections + FAQ accordion), seller-storefront with cover image and product/review tabs.

**T05 — Figma Export:** MCP auth failed with 405 (SSE/HTTP transport mismatch). Documented blocker in `figma-export-log.md` with per-file status table and 3 resolution paths. R013 (wireframe creation) fully satisfied. R025 (Figma export) blocked pending auth resolution.

## Verification

All slice-level checks passed:

- `ls docs/plans/wireframes/storefront-*.html | wc -l` → **33** ✅
- `grep -l "capture.js" ... | wc -l` → **33** ✅
- Token consistency: all 33 share identical `:root` CSS variable blocks ✅
- `grep -l "sd-nav.js" ... | wc -l` → **29** (4 correctly excluded: checkout, auth, verify-email, reset-password) ✅
- `bash docs/plans/wireframes/verify-wireframes.sh` → **5/5 passed, 0 failed** ✅
- Figma export log exists with status for all 33 wireframes ✅
- `data-component` attributes present in all new wireframes ✅

## Requirements Advanced

- R013 — All 24 remaining storefront pages now have authoritative HTML wireframe targets (33 total). Every wireframe includes desktop (1440px) + mobile (390px) frames, Voltage tokens, capture.js, and data-component React mappings.
- R025 — Figma export attempted but blocked by MCP auth. Wireframes include capture.js and are ready for export when auth is resolved. Documented in figma-export-log.md.

## Requirements Validated

- R013 — **Validated.** 33 wireframes exist covering all storefront routes. `verify-wireframes.sh` confirms token consistency, capture.js presence, and sd-nav correctness. Every page family has an authoritative alignment target.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- R025 — Re-scoped: blocked on Figma MCP auth (mcporter SSE/HTTP transport incompatibility). Three resolution paths documented. HTML wireframes remain authoritative per D003.

## Deviations

- sd-nav count is 29 instead of the plan's estimated 30. The plan assumed 3 exclusions (checkout, auth, one other) but the actual design required 4 exclusions (checkout, auth, verify-email, reset-password) — both auth-adjacent pages correctly omit navigation chrome.

## Known Limitations

- Figma export (R025) remains blocked on MCP auth resolution. Wireframes are ready for export (all include capture.js) but require one of: updated mcporter with HTTP MCP support, Claude Desktop/Cursor with native Figma MCP, or direct Figma REST API usage.
- Community wireframe shows "Coming Soon" state only — R036 (community features) is deferred to M004.

## Follow-ups

- Resolve Figma MCP auth to complete R025 export (3 paths documented in figma-export-log.md)
- S07 consumes all 24 new wireframes as visual alignment targets

## Files Created/Modified

- `docs/plans/wireframes/storefront-cart.html` — Multi-seller cart with grouped items, promo code, summary sidebar
- `docs/plans/wireframes/storefront-checkout.html` — Checkout with minimal header, 3-step progress, no nav/footer
- `docs/plans/wireframes/storefront-order-confirmed.html` — Order confirmed success state with summary and CTAs
- `docs/plans/wireframes/storefront-sell-dashboard.html` — Seller dashboard with 4-tab layout and stat cards
- `docs/plans/wireframes/storefront-sell-list-card.html` — 3-step listing wizard (Identify → Condition+Photos → Price+Confirm)
- `docs/plans/wireframes/storefront-sell-upgrade.html` — Seller upgrade with benefits CTA and upgrade form
- `docs/plans/wireframes/storefront-sell-payouts.html` — Payouts with balance cards, history table, Stripe Connect settings
- `docs/plans/wireframes/storefront-sell-reputation.html` — Reputation with trust score gauge, factor breakdown, reviews
- `docs/plans/wireframes/storefront-user-orders.html` — Orders list with filter tabs and detail view
- `docs/plans/wireframes/storefront-user-addresses.html` — Address card grid with add/edit/delete
- `docs/plans/wireframes/storefront-user-settings.html` — 6 settings sections (profile, password, public, prefs, game, notifications)
- `docs/plans/wireframes/storefront-user-wishlist.html` — Wishlist card grid with pricing and cart actions
- `docs/plans/wireframes/storefront-user-reviews.html` — Reviews with to-write/written tabs
- `docs/plans/wireframes/storefront-user-messages.html` — TalkJS-style inbox with conversation list
- `docs/plans/wireframes/storefront-user-returns.html` — Return request list and return flow
- `docs/plans/wireframes/storefront-user-price-alerts.html` — Alert list with thresholds and toggles
- `docs/plans/wireframes/storefront-verify-email.html` — Verify email with verifying/verified states, no nav
- `docs/plans/wireframes/storefront-categories.html` — Categories index grid and detail with filters
- `docs/plans/wireframes/storefront-collections.html` — Collection banner header and product grid
- `docs/plans/wireframes/storefront-community.html` — Coming Soon hero with feature preview grid
- `docs/plans/wireframes/storefront-info-pages.html` — Info page template covering 6 routes (2 state variants)
- `docs/plans/wireframes/storefront-seller-storefront.html` — Seller storefront with cover image and tabs
- `docs/plans/wireframes/storefront-reset-password.html` — Reset password with 3 states, no nav
- `docs/plans/wireframes/storefront-products.html` — Product detail page with gallery, info, enrichment
- `docs/plans/wireframes/verify-wireframes.sh` — 5-check automated verification script
- `.gsd/milestones/M001/slices/S06/figma-export-log.md` — Export status log with auth blocker details

## Forward Intelligence

### What the next slice should know
- All 33 wireframes are complete and token-consistent. S07 should use them directly as alignment targets without modification.
- Each wireframe has `data-component` attributes mapping to React component names — use these to identify which components need visual work.
- User account pages share a sidebar nav layout that collapses to horizontal pills on mobile — implement this once and reuse across all 8 pages.
- The list-card wireframe defines the S08 wizard target UI — S08 should reference `storefront-sell-list-card.html` for the 3-step flow design.

### What's fragile
- Token consistency across 33 files — if any wireframe's `:root` block is edited independently, `verify-wireframes.sh` will catch the drift. Always copy tokens from the canonical source (storefront-homepage.html).
- sd-nav.js exclusion logic in verify-wireframes.sh — currently hardcoded for 4 files. If new wireframes are added without nav, update the exclusion list.

### Authoritative diagnostics
- `bash docs/plans/wireframes/verify-wireframes.sh` — single command that validates all 33 wireframes for consistency. If this passes, wireframe integrity is confirmed.
- `.gsd/milestones/M001/slices/S06/figma-export-log.md` — current Figma export status and resolution steps.

### What assumptions changed
- Plan estimated "at least 30" sd-nav files, assuming 3 exclusions. Actual is 29 (4 exclusions: checkout, auth, verify-email, reset-password). Auth-adjacent pages correctly omit navigation chrome.
- Plan estimated "~32 remaining pages". Actual is 24 new wireframes (33 total including 9 existing). The count was refined during page inventory analysis.
