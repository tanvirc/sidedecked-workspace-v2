---
id: S06
parent: M001
milestone: M001
provides:
  - 24 new HTML wireframes covering all remaining storefront pages (33 total)
  - verify-wireframes.sh reusable consistency gate (5 checks)
  - Figma export log documenting auth blocker and 33 pending wireframes
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
  - D024 — Wireframes grouped by layout family (commerce → seller → user-account → misc) for template-first batch generation
  - D025 — Figma export decoupled from wireframe generation; HTML wireframes remain authoritative per D003
patterns_established:
  - Copy-from-existing-boilerplate pattern — identical :root tokens, capture.js, canvas/frame CSS from homepage wireframe ensures zero token drift
  - Layout family templates — commerce (standard + checkout exception), seller (dashboard tabs), user-account (sidebar nav), misc (auth-adjacent minimal chrome)
  - Multi-state wireframes use state-separator dividers between desktop frame variants
  - Auth-adjacent pages (auth, checkout, verify-email, reset-password) excluded from sd-nav — 29 of 33 files have sd-nav
observability_surfaces:
  - `bash docs/plans/wireframes/verify-wireframes.sh` — 5-check consistency gate across all 33 wireframes
drill_down_paths:
  - .gsd/milestones/M001/slices/S06/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S06/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S06/tasks/T03-SUMMARY.md
  - .gsd/milestones/M001/slices/S06/tasks/T04-SUMMARY.md
  - .gsd/milestones/M001/slices/S06/tasks/T05-SUMMARY.md
duration: ~4h
verification_result: passed
completed_at: 2026-03-14
---

# S06: Wireframe Generation & Figma Export

**24 new HTML wireframes created (33 total), all passing 5/5 consistency checks. Figma export blocked on MCP auth — HTML wireframes remain authoritative per D003.**

## What Happened

Generated 24 new HTML wireframes across 4 layout families, using boilerplate copied from existing wireframes to ensure identical `:root` token blocks, capture.js inclusion, and canvas/frame CSS.

**T01 — Commerce (3 files):** Cart (multi-seller grouped items, promo code, summary sidebar), checkout (minimal header with back-to-cart, no sd-nav/footer, stepped sections), order-confirmed (success state with check icon, order summary). Created `verify-wireframes.sh` as a reusable 5-check consistency gate.

**T02 — Seller (5 files):** Dashboard (4-tab layout with stats, listing table, tier progress), list-card (3-step wizard: Identify → Condition+Photos → Price+Confirm targeting S08 implementation), upgrade (benefits CTA + form), payouts (balance cards + payout history + Stripe Connect settings), reputation (trust score gauge with conic-gradient, 8-factor breakdown, tier progress, reviews).

**T03 — User account (8 files):** All share UserNavigation sidebar (7 items + Settings separator) that collapses to horizontal scrollable pill nav on mobile. Orders (list + detail with shipping timeline), addresses (card grid with CRUD), settings (6 sections), wishlist (card grid), reviews (tabs: to write / written), messages (TalkJS-style inbox), returns (list + return flow), price-alerts (threshold list with toggles).

**T04 — Misc (8 files):** Verify-email and reset-password (auth-adjacent, no sd-nav), categories (index grid + detail with sidebar filters), collections (banner + product grid), products (full PDP with TCG enrichment), community (Coming Soon with feature preview grid + Discord CTA), info-pages (covers 6 routes via InfoPage template with About/FAQ variants), seller-storefront (cover image + avatar + tabs).

**T05 — Figma export:** mcporter auth failed with 405 (SSE/HTTP transport mismatch with Figma MCP endpoint). Created export log documenting blocker, per-file status for all 33 wireframes, and resolution paths. R013 satisfied by HTML wireframes; R025 blocked on auth resolution.

## Verification

- `ls docs/plans/wireframes/storefront-*.html | wc -l` → **33** ✅
- `grep -l "capture.js" docs/plans/wireframes/storefront-*.html | wc -l` → **33** ✅
- `grep -l "sd-nav.js" docs/plans/wireframes/storefront-*.html | wc -l` → **29** ✅ (4 excluded: checkout, auth, verify-email, reset-password)
- Token consistency: all 33 share identical `--brand-primary: #8B5CF6`, `--bg-base`, `--text-primary` ✅
- `bash docs/plans/wireframes/verify-wireframes.sh` → **5/5 PASS** ✅
- Figma export log exists with status for all 33 wireframes ✅

## Requirements Advanced

- R013 (Wireframe creation) — All 33 wireframes exist with consistent tokens, capture.js, and correct sd-nav presence
- R025 (Figma export) — All 33 wireframes ready for export; blocked on Figma MCP auth

## Requirements Validated

- R013 — 33 wireframes exist (9 existing + 24 new), verify-wireframes.sh passes 5/5 checks, all share identical `:root` tokens and include capture.js. Every storefront page has an authoritative wireframe target.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

- sd-nav count is 29 (not the plan's estimate of "at least 30") — verify-email and reset-password are correctly excluded as auth-adjacent pages requiring minimal chrome. The plan assumed 2 exclusions but the actual design required 4 (checkout, auth, verify-email, reset-password).

## Known Limitations

- R025 (Figma export) blocked on mcporter/Figma MCP transport incompatibility (405 error). Three resolution paths documented in `figma-export-log.md`.
- Community wireframe shows "Coming Soon" state — actual community features deferred to R036/M004.

## Follow-ups

- Resolve Figma MCP auth (update mcporter for HTTP MCP, use Claude Desktop/Cursor native Figma MCP, or Figma REST API) to complete R025.

## Files Created/Modified

- `docs/plans/wireframes/storefront-cart.html` — Multi-seller cart wireframe
- `docs/plans/wireframes/storefront-checkout.html` — Checkout wireframe (minimal header, no sd-nav/footer)
- `docs/plans/wireframes/storefront-order-confirmed.html` — Order confirmed success state wireframe
- `docs/plans/wireframes/storefront-sell-dashboard.html` — Seller dashboard wireframe (4-tab layout)
- `docs/plans/wireframes/storefront-sell-list-card.html` — 3-step listing wizard wireframe (S08 target)
- `docs/plans/wireframes/storefront-sell-upgrade.html` — Seller upgrade wireframe
- `docs/plans/wireframes/storefront-sell-payouts.html` — Seller payouts wireframe (balance + settings)
- `docs/plans/wireframes/storefront-sell-reputation.html` — Seller reputation wireframe (trust gauge + reviews)
- `docs/plans/wireframes/storefront-user-orders.html` — User orders wireframe (list + detail)
- `docs/plans/wireframes/storefront-user-addresses.html` — User addresses wireframe (card grid CRUD)
- `docs/plans/wireframes/storefront-user-settings.html` — User settings wireframe (6 sections)
- `docs/plans/wireframes/storefront-user-wishlist.html` — User wishlist wireframe (card grid)
- `docs/plans/wireframes/storefront-user-reviews.html` — User reviews wireframe (tab bar)
- `docs/plans/wireframes/storefront-user-messages.html` — User messages wireframe (TalkJS-style inbox)
- `docs/plans/wireframes/storefront-user-returns.html` — User returns wireframe (list + flow)
- `docs/plans/wireframes/storefront-user-price-alerts.html` — User price alerts wireframe (threshold list)
- `docs/plans/wireframes/storefront-verify-email.html` — Verify email wireframe (no sd-nav)
- `docs/plans/wireframes/storefront-categories.html` — Categories wireframe (index + detail)
- `docs/plans/wireframes/storefront-collections.html` — Collections wireframe (banner + grid)
- `docs/plans/wireframes/storefront-products.html` — Product detail page wireframe
- `docs/plans/wireframes/storefront-community.html` — Community Coming Soon wireframe
- `docs/plans/wireframes/storefront-info-pages.html` — Info pages wireframe (6 routes, 2 variants)
- `docs/plans/wireframes/storefront-seller-storefront.html` — Seller storefront wireframe (products/reviews tabs)
- `docs/plans/wireframes/storefront-reset-password.html` — Reset password wireframe (no sd-nav)
- `docs/plans/wireframes/verify-wireframes.sh` — 5-check consistency verification script
- `.gsd/milestones/M001/slices/S06/figma-export-log.md` — Figma export status log with auth blocker

## Forward Intelligence

### What the next slice should know
- All 33 wireframes are in `docs/plans/wireframes/` and serve as pixel-perfect alignment targets for S07. Each has `data-component` attributes mapping to React component names — use these to identify which storefront components need visual updates.
- Wireframes show desktop (1440px) and mobile (390px) side-by-side. Open in browser to compare against the live storefront.
- User account pages all share the UserNavigation sidebar pattern — implement once as a shared layout, then adapt content per page.

### What's fragile
- Token consistency depends on the copy-from-boilerplate pattern — if any wireframe's `:root` block is edited individually, `verify-wireframes.sh` will catch it but the fix requires manual alignment. Don't edit tokens in individual wireframes.

### Authoritative diagnostics
- `bash docs/plans/wireframes/verify-wireframes.sh` — the single source of truth for wireframe consistency. If this passes, all 33 files are structurally correct.

### What assumptions changed
- Plan estimated 30+ files with sd-nav → actual count is 29 (4 auth-adjacent exclusions instead of 2). Not a problem — the excluded pages genuinely shouldn't have full navigation.
