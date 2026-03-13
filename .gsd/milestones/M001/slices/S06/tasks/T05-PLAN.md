---
estimated_steps: 4
estimated_files: 2
---

# T05: Figma export via MCP

**Slice:** S06 — Wireframe Generation & Figma Export
**Milestone:** M001

## Description

Export all 33 wireframes to Figma via the MCP html-to-design tool. This task depends on Figma MCP OAuth authentication which requires user action. If auth cannot be completed, document the blocker — the HTML wireframes (R013) are independently valuable regardless of Figma export status.

## Steps

1. **Check Figma MCP auth status.** Run `mcporter list` or equivalent to check if the Figma MCP server is authenticated. If status shows "auth required", prompt the user to run `mcporter auth figma` and wait for confirmation.

2. **If authenticated: batch export all wireframes.** Use the Figma MCP html-to-design tool to process each of the 33 wireframe files. Group exports by family to organize within Figma: Commerce (cart, checkout, order-confirmed), Seller (dashboard, list-card, upgrade, payouts, reputation), User Account (8 files), Existing (homepage, cards, card-detail, search, deck-browser, deck-builder, deck-viewer, auth, profile), Misc (8 files). Log each export attempt's success/failure with the wireframe filename and any error messages.

3. **Create `figma-export-log.md`.** Document the export results: date, auth status, per-file export status (success/fail/skipped), any errors encountered, total exported count. If auth was not available, document it as a known blocker for R025 with instructions for how to complete the export later.

4. **If auth blocked: document and move on.** R013 (wireframe creation) is fully satisfied by the HTML files. R025 (Figma export) is blocked on user auth action. Record this in the export log. The wireframes remain the authoritative design source per D003 — Figma is the export target, not the source of truth.

## Must-Haves

- [ ] Figma MCP auth status checked and documented
- [ ] If auth available: all 33 wireframes exported to Figma
- [ ] If auth blocked: blocker documented with clear next steps
- [ ] `figma-export-log.md` created with per-file status

## Verification

- `figma-export-log.md` exists with status for all 33 wireframes
- If exported: Figma project contains frames matching all wireframe files
- If blocked: log clearly states "auth required" and lists the 33 files pending export

## Inputs

- All 33 wireframe files in `docs/plans/wireframes/storefront-*.html`
- Figma MCP server configuration (mcporter)
- T01–T04 completed successfully

## Expected Output

- `.gsd/milestones/M001/slices/S06/figma-export-log.md` — export status log
- Figma project with all wireframes (if auth available) OR documented blocker (if auth unavailable)
