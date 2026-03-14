---
estimated_steps: 5
estimated_files: 3
---

# T03: E2E acceptance checklist, visual audit log, and milestone closeout

**Slice:** S10 — Integration & Polish
**Milestone:** M001

## Description

Create the verification artifacts that prove M001's success criteria are met. This task produces two documents: (1) an acceptance checklist mapping each M001 success criterion to concrete evidence (test counts, code grep results, feature existence proofs), and (2) a visual audit log listing every storefront page route with its wireframe reference and Voltage compliance status. Also updates R021 validation status in REQUIREMENTS.md and runs the final test/build gate.

No new feature code — this is documentation and verification only.

## Steps

1. **Run final storefront test suite and build**
   - `cd storefront && npx vitest run` — record total pass/fail count
   - `cd storefront && npm run build` — confirm success
   - These numbers go into the acceptance checklist.

2. **Create acceptance-checklist.md**
   - Map each of the 7 M001 success criteria (from M001-ROADMAP.md "Success Criteria" section) to evidence:
     - Pixel-perfect rendering → grep results from S01-S09 showing zero bare light-mode classes, component test counts per page family
     - Deck-to-cart flow → S09 test counts (55 tests across 4 suites), feature existence proof (Buy Missing Cards wired in DeckViewerHeader + DeckBuilderLayout)
     - Seller listing wizard → S08 test counts (60 tests), 3-step flow component existence
     - OAuth → S05 verification (provider registration in medusa-config.ts, callback routes exist)
     - Cart optimizer < 2s → S09 performance proof (< 1ms for 15 cards in optimizeCart tests)
     - Collection auto-update → S10 T01+T02 tests (subscriber pipeline + BFF + sync)
     - Test count → final vitest run total (907+ pass)
   - Note blocked items: Figma export (R025 — MCP auth 405), visual UAT (requires human comparison)

3. **Create visual-audit-log.md**
   - List all storefront page routes (from the app directory structure)
   - For each route, note: wireframe reference (if exists), Voltage compliance verification method (grep results from S01-S09), status (verified/pending-UAT/no-wireframe)
   - Group by page family: core (browse, detail, search), decks (browser, builder, viewer), auth (login, register), homepage, seller pages, user account pages, commerce pages, misc pages

4. **Update REQUIREMENTS.md**
   - R021: Update validation from "unmapped" to reflect implemented pipeline (backend subscriber → Redis → customer-backend subscriber → storefront BFF + sync). Note test counts.
   - R024: Update validation notes to reflect full storefront verification across all slices.
   - Verify R025 status accurately reflects blocked state.

5. **Commit storefront changes from T01-T02**
   - Per D023: `cd storefront && git add -A && git commit -m "feat(S10): collection auto-update pipeline + sync"` on the slice branch.
   - Same for backend: `cd backend && git add -A && git commit -m "feat(S10): collection auto-update subscriber"` if T01 made backend changes.
   - Same for customer-backend: `cd customer-backend && git add -A && git commit -m "feat(S10): collection subscriber + Redis subscriber client"` if T01 made changes.

## Must-Haves

- [ ] acceptance-checklist.md covers all 7 M001 success criteria with concrete evidence
- [ ] visual-audit-log.md lists all storefront page routes with wireframe references
- [ ] R021 validation updated in REQUIREMENTS.md
- [ ] Final storefront test suite passes (907+)
- [ ] Final storefront build succeeds
- [ ] Child repo changes committed per D023

## Verification

- `acceptance-checklist.md` exists and covers all 7 criteria
- `visual-audit-log.md` exists and lists all page routes
- `grep "R021" .gsd/REQUIREMENTS.md` shows updated validation
- `cd storefront && npx vitest run` — 907+ pass
- `cd storefront && npm run build` — succeeds

## Inputs

- M001-ROADMAP.md "Success Criteria" section — the 7 criteria to map
- S01-S09 summaries — test counts and verification evidence from each slice
- `storefront/src/app/` directory structure — all page routes
- `docs/plans/wireframes/` — wireframe file list

## Observability Impact

This task produces documentation artifacts only — no runtime code changes. The signals it creates are:
- **Acceptance checklist:** Future agents inspect `.gsd/milestones/M001/slices/S10/acceptance-checklist.md` to verify which M001 success criteria are met vs. blocked. Each criterion row includes the verification method and evidence source.
- **Visual audit log:** Future agents inspect `.gsd/milestones/M001/slices/S10/visual-audit-log.md` to identify which storefront pages have been verified against wireframes and which remain pending UAT.
- **Requirements update:** `grep "R021" .gsd/REQUIREMENTS.md` shows pipeline validation status instead of "unmapped". R024 notes full storefront coverage.
- **Failure visibility:** If acceptance-checklist.md is missing or incomplete, the milestone cannot be closed — the checklist is the proof artifact.

## Expected Output

- `.gsd/milestones/M001/slices/S10/acceptance-checklist.md` — M001 success criteria verification
- `.gsd/milestones/M001/slices/S10/visual-audit-log.md` — per-page Voltage compliance log
- `.gsd/REQUIREMENTS.md` — R021 validation updated
