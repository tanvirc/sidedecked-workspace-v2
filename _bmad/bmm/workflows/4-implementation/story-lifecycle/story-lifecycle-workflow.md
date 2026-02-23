# Story Lifecycle Workflow

This document summarizes the current `story-lifecycle` workflow implemented in:

- `_bmad/bmm/workflows/4-implementation/story-lifecycle/workflow.yaml`
- `_bmad/bmm/workflows/4-implementation/story-lifecycle/instructions.xml`

## Sessions

1. Discovery: Phases 1, 2, 2B, 3
2. Build: Phases 4, 5
3. Ship: Phases 6, 7, 8

## Phase Map

### Phase 1 - Story Prioritization

- Agents: `sm` + `pm`
- Goal: Recommend the next highest-priority story based on readiness, business value, and dependencies.
- Output: Confirmed story key.

### Phase 2 - Requirements and UX Clarification

- Required leads: `analyst` (BA) + `pm`
- Conditional contributor: `ux-designer` for UI-facing criteria
- BA is responsible for:
  - AC gap analysis
  - Business rules and edge cases
  - AC traceability mapping (original AC -> clarified AC -> status)
  - Sign-off recommendation (`READY` or `BLOCKED`)
- Output: Consolidated Requirements + UX Brief with BA traceability status.

### Phase 2B - UX Wireframe and Validation (Conditional)

- Trigger: Story affects `storefront/` or `vendorpanel/`
- Step 5: UI scope assessment by `ux-designer`
- Step 6: HTML wireframe generation by `ux-designer`
  - Output path: `_bmad-output/planning-artifacts/ux-{story-key}-wireframe.html`
- Step 7: Party mode review with exactly 5 agents:
  - `ux-designer`, `pm`, `analyst`, `architect`, `dev`
- Step 8: Advanced elicitation refinement and final wireframe save

### Phase 3 - Technical Design and Plan

- Agents: `architect` + BA traceability co-review via `analyst`
- Goals:
  - Domain classification and split-brain compliance
  - Impacted modules/files and API contracts
  - Integration points and risks
  - AC-to-design traceability validation
  - Deployment classification (`needs_deploy`)
- Output artifact:
  - `docs/plans/{date}-{story-key}-plan.md`

### Phase 4 - Development (TDD)

- Agent: `dev`
- Required skill: `superpowers:test-driven-development`
- Also enforced: evidence-based verification and systematic debugging on failures.
- Output: Feature branch commits in affected repos with quality-gate evidence.

### Phase 5 - Integration and E2E QA

- Agent: `qa`
- Required BMM skill: `bmad-bmm-qa-generate-e2e-tests`
- Optional deep-rigor TEA skills for high-risk flows:
  - `bmad-tea-testarch-test-design`
  - `bmad-tea-testarch-automate`
  - `bmad-tea-testarch-trace`
- Focus:
  - Cross-service API contracts
  - Integration tests across repo boundaries
  - E2E user flows for UI stories
  - Boundary edge cases (auth, timeouts, external integrations)
- Output: QA report and updated branch commits (if needed).

### Phase 6 - Deployment (Conditional)

- Agent: `devops`
- Gate:
  - Read `needs_deploy` from plan
  - Re-validate against actual changed files/repos before deploy/skip
- Execution:
  - Railway commands run inside each affected child repo (`backend/`, `customer-backend/`, `storefront/`, `vendorpanel/`)
  - Collect per-service status/URLs and smoke test outcomes
- Output: Deployment report or explicit skip justification.

### Phase 7 - Documentation

- Primary agent: `tech-writer`
- BA consistency pass: `analyst` perspective for business-rule and AC wording checks
- Required updates:
  - `CHANGELOG.md`
  - Architecture docs (or explicit no-change rationale)
  - Story AC markers (`IMPLEMENTED`)
  - Sprint status (`done`)
- Output: Documentation update report with evidence.

### Phase 8 - PR Creation, Review, and Merge

- Step 21: Create PRs for repos with commits
- Step 22: Two-stage review with explicit BMM review skill usage
  - Stage 1 (spec compliance): `bmad-bmm-code-review` with BA interpretation support
  - Stage 2 (code quality): `bmad-bmm-code-review` in fresh reviewer context
- Step 23: Handle human PR comments and merge resolved PRs
- Output: PR summary, review report, merge summary.

## Global Guardrails

- Agent files are loaded for domain expertise and quality principles.
- Standalone agent menu/greeting/wait loops are not executed inside this orchestrated workflow.
- Every phase gate requires fresh command output evidence before completion claims.
- Never skip phases and never continue across phase boundaries without explicit user confirmation.
