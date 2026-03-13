---
id: T05
parent: S06
milestone: M001
provides:
  - Figma export log documenting auth blocker and 33 pending wireframes
  - Clear next-steps for completing Figma export when auth is resolved
key_files:
  - .gsd/milestones/M001/slices/S06/figma-export-log.md
key_decisions:
  - Figma MCP auth blocked by mcporter SSE/HTTP transport incompatibility (405 error); R025 documented as blocked while R013 remains fully satisfied by HTML wireframes
patterns_established:
  - none
observability_surfaces:
  - none
duration: 15m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T05: Figma export via MCP

**Documented Figma MCP auth blocker; created export log with status for all 33 wireframes and clear next-steps for completing R025.**

## What Happened

Checked Figma MCP auth status via `mcporter list` — server shows "auth required". Attempted `mcporter auth figma` which triggered an OAuth browser flow but failed with a 405 (Method Not Allowed) error from Figma's MCP endpoint. The root cause is a transport-level incompatibility: mcporter uses SSE-based auth but Figma's HTTP MCP endpoint returns 405 for SSE requests.

Since auth could not be completed, created `figma-export-log.md` documenting:
- Auth status and error details
- Per-file export status for all 33 wireframes (all pending)
- Blocker explanation (R025 blocked, R013 satisfied by HTML wireframes per D003)
- Step-by-step instructions for completing the export later

This is NOT a plan-invalidating blocker — the task plan explicitly anticipated auth unavailability and defined the documentation path as a valid completion. R013 (wireframe creation) is fully satisfied by the 33 HTML wireframe files. R025 (Figma export) requires resolving the mcporter/Figma MCP transport issue or using an alternative client.

## Verification

- `figma-export-log.md` exists with status for all 33 wireframes: ✅
- Auth blocker clearly documented with error details and next steps: ✅
- Slice verification script passes 5/5: ✅
  - `ls docs/plans/wireframes/storefront-*.html | wc -l` → 33
  - capture.js present in all wireframes
  - `:root` token consistency confirmed
  - sd-nav.js presence correct (present where expected, absent for checkout/auth)
  - Key tokens (`--bg-base`, `--text-primary`) consistent across all 33

## Diagnostics

Review `.gsd/milestones/M001/slices/S06/figma-export-log.md` for full export status and next-steps.

## Deviations

User chose "Authenticate now" but mcporter auth failed with 405 error. Proceeded with documented-blocker path per task plan's Step 4.

## Known Issues

- R025 (Figma export) remains blocked on Figma MCP auth. Three resolution paths documented in the export log: update mcporter, use Claude Desktop/Cursor with native Figma MCP, or use Figma REST API directly.

## Files Created/Modified

- `.gsd/milestones/M001/slices/S06/figma-export-log.md` — Export status log with auth blocker details and 33-file status table
