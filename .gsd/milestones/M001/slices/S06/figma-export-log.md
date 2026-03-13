# Figma Export Log

**Date:** 2026-03-14
**Task:** T05 — Figma export via MCP (Slice S06, Milestone M001)

## Auth Status

**Status:** ❌ Auth blocked — mcporter OAuth flow fails

The Figma MCP server (`https://mcp.figma.com/mcp`) is configured as an HTTP-type MCP endpoint
in `~/.claude.json`. When `mcporter auth figma` is run, it attempts an SSE-based OAuth browser
flow but receives a **405 (Method Not Allowed)** response from Figma's server.

```
Error: Failed to authorize 'figma': SSE error: Non-200 status code (405)
```

This is a transport-level incompatibility between mcporter's SSE auth implementation and Figma's
HTTP-based MCP endpoint — not a user credential issue.

## Export Results

| # | Wireframe File | Status | Notes |
|---|----------------|--------|-------|
| 1 | storefront-auth.html | ⏳ Pending | Auth blocked |
| 2 | storefront-card-detail.html | ⏳ Pending | Auth blocked |
| 3 | storefront-cards.html | ⏳ Pending | Auth blocked |
| 4 | storefront-cart.html | ⏳ Pending | Auth blocked |
| 5 | storefront-categories.html | ⏳ Pending | Auth blocked |
| 6 | storefront-checkout.html | ⏳ Pending | Auth blocked |
| 7 | storefront-collections.html | ⏳ Pending | Auth blocked |
| 8 | storefront-community.html | ⏳ Pending | Auth blocked |
| 9 | storefront-deck-browser.html | ⏳ Pending | Auth blocked |
| 10 | storefront-deck-builder.html | ⏳ Pending | Auth blocked |
| 11 | storefront-deck-viewer.html | ⏳ Pending | Auth blocked |
| 12 | storefront-homepage.html | ⏳ Pending | Auth blocked |
| 13 | storefront-info-pages.html | ⏳ Pending | Auth blocked |
| 14 | storefront-order-confirmed.html | ⏳ Pending | Auth blocked |
| 15 | storefront-products.html | ⏳ Pending | Auth blocked |
| 16 | storefront-profile.html | ⏳ Pending | Auth blocked |
| 17 | storefront-reset-password.html | ⏳ Pending | Auth blocked |
| 18 | storefront-search.html | ⏳ Pending | Auth blocked |
| 19 | storefront-sell-dashboard.html | ⏳ Pending | Auth blocked |
| 20 | storefront-seller-storefront.html | ⏳ Pending | Auth blocked |
| 21 | storefront-sell-list-card.html | ⏳ Pending | Auth blocked |
| 22 | storefront-sell-payouts.html | ⏳ Pending | Auth blocked |
| 23 | storefront-sell-reputation.html | ⏳ Pending | Auth blocked |
| 24 | storefront-sell-upgrade.html | ⏳ Pending | Auth blocked |
| 25 | storefront-user-addresses.html | ⏳ Pending | Auth blocked |
| 26 | storefront-user-messages.html | ⏳ Pending | Auth blocked |
| 27 | storefront-user-orders.html | ⏳ Pending | Auth blocked |
| 28 | storefront-user-price-alerts.html | ⏳ Pending | Auth blocked |
| 29 | storefront-user-returns.html | ⏳ Pending | Auth blocked |
| 30 | storefront-user-reviews.html | ⏳ Pending | Auth blocked |
| 31 | storefront-user-settings.html | ⏳ Pending | Auth blocked |
| 32 | storefront-user-wishlist.html | ⏳ Pending | Auth blocked |
| 33 | storefront-verify-email.html | ⏳ Pending | Auth blocked |

## Summary

- **Total wireframes:** 33
- **Exported:** 0
- **Pending (auth blocked):** 33
- **Failed:** 0

## Blocker Details

**R025 (Figma export) is blocked** on Figma MCP authentication.

**R013 (wireframe creation) is fully satisfied** by the 33 HTML wireframe files in
`docs/plans/wireframes/`. Per D003, HTML wireframes are the authoritative design source —
Figma is the export target, not the source of truth.

## How to Complete Export Later

1. **Resolve mcporter/Figma MCP auth:** The 405 error suggests mcporter's SSE transport
   doesn't match Figma's HTTP MCP endpoint. Options:
   - Update mcporter to a version that supports HTTP-based MCP OAuth
   - Use Claude Desktop or Cursor (which have native Figma MCP support) to run the export
   - Authenticate manually via Figma's Dev Mode and use the Figma REST API directly

2. **Once authenticated, run the export:** Use the Figma MCP `html_to_figma` tool to process
   each of the 33 wireframe files, grouped by family:
   - **Commerce (3):** cart, checkout, order-confirmed
   - **Seller (5):** dashboard, list-card, upgrade, payouts, reputation
   - **User Account (8):** orders, addresses, settings, wishlist, reviews, messages, returns, price-alerts
   - **Existing (9):** homepage, cards, card-detail, search, deck-browser, deck-builder, deck-viewer, auth, profile
   - **Misc (8):** verify-email, categories, collections, community, info-pages, seller-storefront, reset-password, products

3. **Update this log** with per-file success/failure status after export completes.
