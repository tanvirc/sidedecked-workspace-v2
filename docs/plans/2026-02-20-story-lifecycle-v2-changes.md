# Story Lifecycle v2 — Change Summary

> ⚠️ HISTORICAL — v2 changes described here are now implemented in `_bmad/bmm/workflows/4-implementation/story-lifecycle/`

**Goal:** Integrate Obra Superpowers skills into the BMAD story-lifecycle workflow

**Draft files:**
- `_bmad/bmm/workflows/4-implementation/story-lifecycle/instructions-v2-draft.xml`
- `_bmad/bmm/workflows/4-implementation/story-lifecycle/workflow-v2-draft.yaml`
- `_bmad/bmm/workflows/4-implementation/dev-story/instructions-v2-draft.xml`
- `_bmad/bmm/workflows/4-implementation/code-review/instructions-v2-draft.xml`

---

## Changes by Recommendation

### 1. Session-Aware Execution (Critical)

**Problem:** 8 phases + 4 sub-workflows in one conversation exhausts context. By Phase 7, earlier outputs are compressed or lost.

**Change:** Added session boundary markers dividing the lifecycle into 3 segments:

| Session | Phases | Artifacts Saved |
|---|---|---|
| Discovery | 1-3 | Implementation plan file (`docs/plans/`) |
| Build | 4-5 | Code on feature branch |
| Ship | 6-8 | Merged PRs on main |

Each boundary recommends (but doesn't force) starting a fresh session. Artifacts are saved to disk at each boundary so the next session needs no conversation context.

**Files changed:** `instructions-v2-draft.xml` (critical section, step 7 gate, step 12 gate), `workflow-v2-draft.yaml` (sessions section)

### 2. TDD Skill Reference Replaces Inline Description

**Problem:** dev-story workflow re-describes TDD in ~50 lines. The superpowers TDD skill is more rigorous (iron law, anti-patterns, rationalizations).

**Change:** Phase 4 (step 10) adds a `<critical>` block requiring `superpowers:test-driven-development`. The iron law is stated explicitly: "No production code without a failing test first. Write code before the test? Delete it."

The dev-story sub-workflow is still invoked (it handles story discovery, sprint-status, task sequencing) but TDD discipline comes from the superpowers skill.

**Files changed:** `instructions-v2-draft.xml` step 10

### 3. Systematic Debugging as Failure Recovery

**Problem:** When any phase encounters failures, the current workflow says "HALT." No recovery path.

**Change:** Added `<on-failure>` blocks to Phase 4 (step 10) and Phase 6 (step 14) referencing `superpowers:systematic-debugging`. The protocol: read errors, reproduce, trace data flow, single hypothesis, one fix at a time. After 3 failed attempts, stop and discuss architecture.

Also added to the `<critical>` section as a global policy.

**Files changed:** `instructions-v2-draft.xml` critical section, steps 10 and 14

### 4. Evidence-Based Verification at Every Gate

**Problem:** Phase gates list checkboxes but don't require fresh evidence. An LLM can check boxes without running commands.

**Change:** Every gate now includes an explicit action to run verification commands and show output BEFORE the `<ask>` element. The `<critical>` section adds `superpowers:verification-before-completion` as a global policy.

Example (Phase 4 gate):
```xml
<action>Run verification commands and show FRESH output before claiming completion:
  - For each affected repo: npm run lint && npm run typecheck && npm run build && npm test
  - For each affected repo: npm run test:coverage
  Evidence MUST appear in this message.
</action>
```

**Files changed:** `instructions-v2-draft.xml` critical section, steps 10, 12, 16

### 5. Two-Stage Subagent Code Review

**Problem:** Phase 8 loads the same Dev agent in "adversarial mode" to review its own code. Self-review is inherently biased — the same context that wrote the code reviews it.

**Change:** Replaced single-agent adversarial review with two-stage subagent pattern:

1. **Spec Compliance Review** (fresh subagent) — Does code match story ACs? Nothing extra (YAGNI), nothing missing.
2. **Code Quality Review** (fresh subagent) — Clean code, security, performance, architecture compliance.

Fresh subagents don't share the implementer's context. If a stage fails, fixes are made and the stage re-runs until it passes.

For human PR comments, the workflow now references `superpowers:receiving-code-review`: verify before implementing, push back if wrong, no performative agreement.

**Files changed:** `instructions-v2-draft.xml` steps 18-19

**Note:** The existing `code-review/instructions.xml` sub-workflow is NOT invoked in v2. Its PR comment handling logic (steps 6-8) is preserved in step 19 of the lifecycle, but the adversarial self-review (steps 1-5) is replaced by the two-stage subagent approach.

### 6. Phase 5 (QA) Refocused on Integration/E2E

**Problem:** Phase 4 already runs TDD with >80% coverage. Phase 5 repeats the same quality gates.

**Change:** Phase 5 is refocused on what unit TDD cannot cover:
- Cross-service API contract validation
- Integration tests across repo boundaries
- E2E user flow tests for UI-facing stories
- Edge cases at system boundaries

If a story is purely internal with no cross-service impact, Phase 5 can document justification and confirm Phase 4 coverage is sufficient.

**Files changed:** `instructions-v2-draft.xml` steps 11-12

### 7. Phase 3 Saves Implementation Plan to File

**Problem:** Phase 3 produces a Technical Design Note as ephemeral conversation output. By Phase 4, it may be compressed or lost.

**Change:** Added step 7 which converts the Technical Design Note + Requirements Brief into a structured implementation plan file saved to `docs/plans/{date}-{story-key}-plan.md`. This file:
- Embeds both the Requirements Brief and Technical Design
- Structures tasks in TDD format (failing test, implement, verify)
- References `superpowers:executing-plans` for the implementer
- Persists across sessions

**Files changed:** `instructions-v2-draft.xml` step 7, `workflow-v2-draft.yaml` (plan_dir variable)

### 8. Phase 6 (Deployment) Made Conditional

**Problem:** Railway preview is mandated for every story, even backend-only or docs-only changes.

**Change:** Phase 3 now sets `{{needs_preview_deploy}}` based on domain classification:
- `true` if story touches storefront/ or vendorpanel/
- `true` if story adds new API endpoints that consumers depend on
- `false` for backend-only, migration-only, or docs-only changes

Phase 6 checks this flag. If false, it outputs justification and skips. User can override with DEPLOY.

**Files changed:** `instructions-v2-draft.xml` steps 6, 13, 14

### 9. PR Creation Separated from Code Review

**Problem:** Previously Phase 7 (Tech Writer) handled both docs AND PR creation, then Phase 8 handled review AND merge. Responsibilities were muddled.

**Change:** PR creation is now step 17 (its own step with its own gate), followed by two-stage code review in step 18, followed by PR comment handling and merge in step 19. Clear separation: create → review → merge.

The Tech Writer (steps 15-16) now focuses purely on documentation.

**Files changed:** `instructions-v2-draft.xml` steps 15-19

### 10. Superpowers References in workflow.yaml

**Change:** Added a `superpowers` section to workflow.yaml documenting which skills are referenced by the workflow. These are for documentation — actual invocation happens at runtime through Claude Code's skill system.

Also added a `sessions` section documenting the 3 logical sessions.

**Files changed:** `workflow-v2-draft.yaml`

---

### 11. dev-story Sub-Workflow: Superpowers TDD Integration

**Problem:** The dev-story `instructions.xml` has its own inline TDD description in step 5 (red-green-refactor). This is softer than the superpowers TDD skill and creates two competing TDD definitions.

**Change:** Updated dev-story with three superpowers references in the critical section:
- `superpowers:test-driven-development` — Iron law governs step 5
- `superpowers:verification-before-completion` — Evidence required at steps 7, 8, 9
- `superpowers:systematic-debugging` — Failure recovery in step 5

Step 5 (TDD cycle) now has explicit RED/GREEN/REFACTOR phases with:
- Checks for "test passes immediately" (wrong test) and "test errors" (fix error, not skip)
- `<on-failure>` block referencing systematic debugging
- No more vague "confirm tests fail" — specific failure mode handling

Steps 7 and 9 now require FRESH command output before any completion claims.

Step 10 tip updated: recommends running code-review in a **fresh session** (not just a different LLM).

**Files changed:** `dev-story/instructions-v2-draft.xml` (critical section, steps 5, 7, 8, 9, 10)

### 12. code-review Sub-Workflow: Two-Stage Subagent Pattern

**Problem:** The code-review workflow uses single-agent adversarial self-review (steps 1-5). The same context that implemented the code reviews it — inherent bias. The "find 3-10 issues minimum" mandate can produce forced/artificial findings.

**Change:** Replaced steps 1-5 with a two-stage subagent review:

**Stage 1 — Spec Compliance (step 2-3):**
- Fresh subagent verifies each AC is actually implemented
- Verifies each [x] task is actually done (cross-references git reality)
- Checks YAGNI: no code beyond what the story requires
- Result: PASS or FAIL with specific gaps
- If FAIL: fix and re-run until PASS

**Stage 2 — Code Quality (step 4-5):**
- Fresh subagent reviews security, performance, architecture, test quality, maintainability
- Does NOT repeat spec compliance (already verified)
- Result: APPROVED, CHANGES_NEEDED, or BLOCKED with severity breakdown
- If CHANGES_NEEDED: fix Critical/Important and re-run

**Key improvement:** Removed the "find 3-10 issues minimum" mandate. Real issues are found based on actual code problems, not a quota. Fresh context prevents the bias of self-review.

**PR comment handling (steps 7-9):** Now references `superpowers:receiving-code-review`:
- Verify suggestions against codebase reality before implementing
- Push back with technical reasoning if suggestion is wrong
- YAGNI check on suggestions (grep for actual usage)
- No performative agreement ("Great point!", "You're right!")
- Added "Pushbacks" column to PR resolution summary

**Files changed:** `code-review/instructions-v2-draft.xml` (complete rewrite of steps 1-5, updated steps 7-9)

### 13. Subagent Dispatch Format Decision

**Decision:** Keep dispatch instructions abstract (describe WHAT and WITH WHAT context) rather than hardcoding Claude Code Task tool syntax.

**Rationale:**
- BMAD workflows should be portable across LLM environments
- The XML describes the review contract (context provided, directive, output format)
- Runtime implementation (Task tool in Claude Code, equivalent in other tools) is an execution detail
- The `<critical>` section notes: "In Claude Code, dispatch via the Task tool. In other environments, use the equivalent isolation mechanism."

This keeps the workflow specification clean while providing enough detail for any orchestrator to implement the dispatch correctly.

---

## What Was NOT Changed

- **Phase 1-2 (SM+PM prioritization, BA+PM+UX requirements)** — These work well as-is. The multi-agent perspective synthesis is a BMAD strength.
- **story-docs sub-workflow** — Still invoked in Phase 7. Documentation standards and the doc update process are well-defined.
- **Sprint-status tracking** — All the sprint-status.yaml read/write logic is unchanged (handled by dev-story and code-review sub-workflows).
- **Agent persona files** — No changes to any agent .md or .customize.yaml files.
- **Feature branch strategy** — Still creates `feature/{story-key}` in root + child repos.
- **dev-story structure** — Steps 1-4, 6, 8 (story discovery, context loading, review continuation, sprint-status, task marking) preserved exactly. Only steps 5, 7, 9, 10 and the critical section updated.
- **code-review PR handling** — Steps 7-9 (discover comments, address comments, merge PRs) preserved with minor enhancements. Only the review methodology (steps 1-6) was replaced.

---

## Migration Path

To adopt v2:

1. Review the draft files alongside the originals
2. If approved, rename in each affected workflow directory:

**story-lifecycle/**
```
instructions.xml       → instructions-v1.xml
instructions-v2-draft.xml → instructions.xml
workflow.yaml          → workflow-v1.yaml
workflow-v2-draft.yaml → workflow.yaml
```

**dev-story/**
```
instructions.xml       → instructions-v1.xml
instructions-v2-draft.xml → instructions.xml
```

**code-review/**
```
instructions.xml       → instructions-v1.xml
instructions-v2-draft.xml → instructions.xml
```

3. Test with next story lifecycle run
4. Delete `-v1` backups once satisfied

---

## Open Questions (Resolved)

1. **dev-story TDD alignment** — RESOLVED: Yes. Updated with superpowers:test-driven-development, verification-before-completion, and systematic-debugging. See recommendation 11.

2. **code-review sub-workflow** — RESOLVED: Yes. Updated to two-stage subagent pattern for both standalone and lifecycle use. See recommendation 12.

3. **Subagent dispatch mechanism** — RESOLVED: Keep abstract. Describe WHAT to dispatch and WITH WHAT context. Let runtime determine HOW (Task tool in Claude Code, equivalent elsewhere). See recommendation 13.
