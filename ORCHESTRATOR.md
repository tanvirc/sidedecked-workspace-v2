# ORCHESTRATOR.md - SideDecked BMAD Phase Orchestrator

This document operationalizes the BMAD Method for SideDecked.

Precedence:
- Follows rules from root `AGENTS.md`.
- Repo-local `AGENTS.md` files remain authoritative for implementation details inside each repo.
- If there is a conflict, the most specific `AGENTS.md` wins.

## Current Program Context

- Workspace shape: split-domain, four repos, two backend databases.
- Active specification tracker: `module-status.json`.
- Current tracked specification at time of writing: `04-vendor-management-system` (`in_progress`).

## BMAD-First Principle

Planning authority:
- BMAD phases and artifacts are the planning system of record.
- Required artifacts are written into `_bmad-output/planning-artifacts/` and `_bmad-output/implementation-artifacts/`.

Legacy compatibility:
- `module-status.json` and `scripts/*spec*.js` remain required for tracking/reporting.
- They do not replace BMAD phase gates.

## SideDecked Agent Topology

Core BMAD roles:
- `analyst`
- `pm`
- `architect`
- `po`
- `sm`
- `dev`
- `qa`

Domain specialist overlays:
- `commerce-specialist` for `backend/` (`mercur-db`)
- `customer-data-specialist` for `customer-backend/` (`sidedecked-db`)
- `storefront-specialist` for `storefront/`
- `vendorpanel-specialist` for `vendorpanel/`

Operating rule:
- BMAD core role owns the phase decision.
- Relevant specialist overlay reviews and signs off on bounded-context correctness before phase closure.

## Full Planning Path and Gates

### Phase 1: Analysis

Owner:
- `analyst`

Commands:
- `/bmad-bmm-create-product-brief`
- `/bmad-bmm-domain-research`
- `/bmad-bmm-market-research`
- `/bmad-bmm-technical-research`

Required outputs:
- Product brief with clear problem statement, users, constraints, and success metrics.
- Research notes covering domain, market, and technical assumptions.

Exit gate:
- Scope is clear enough for PRD authoring.
- Split-domain implications are explicitly identified.

### Phase 2: Planning (PRD)

Owner:
- `pm`

Commands:
- `/bmad-bmm-create-prd`
- `/bmad-bmm-edit-prd`
- `/bmad-bmm-validate-prd`

Required outputs:
- Validated PRD with measurable acceptance outcomes.
- Non-goals and out-of-scope captured.

Exit gate:
- `po` confirms PRD completeness and implementation intent.

### Phase 3: Solutioning

Owner:
- `architect`

Commands:
- `/bmad-bmm-create-architecture`
- `/bmad-bmm-check-implementation-readiness`

Required outputs:
- Architecture specification with interface boundaries.
- Data ownership and integration contract mapping.
- Readiness report listing risks and blockers.

Exit gate:
- No unresolved high-risk architectural blockers.
- Split-brain rules are preserved.

### Phase 4: Storying and Sprint Setup

Owner:
- `sm`

Commands:
- `/bmad-bmm-create-epics-and-stories`
- `/bmad-bmm-create-story`
- `/bmad-bmm-sprint-planning`

Required outputs:
- Story backlog with acceptance criteria per story.
- Sprint-aligned implementation sequence.

Exit gate:
- Story scopes are implementation-ready and testable.
- Each story maps to a clear target repo and domain boundary.

### Phase 5: Implementation and Review

Owner:
- `dev`

Commands:
- `/bmad-bmm-dev-story`
- `/bmad-bmm-code-review`

Required outputs:
- Working implementation with tests and validation evidence.
- Code review findings and resolutions.

Exit gate:
- Lint/type/build/tests pass at relevant scope.
- Acceptance criteria for implemented stories are met.

### Phase 6: QA, Course Correction, Retrospective

Owner:
- `qa`

Commands:
- `/bmad-bmm-qa-automate`
- `/bmad-bmm-correct-course`
- `/bmad-bmm-retrospective`

Required outputs:
- QA validation report and defect/risk list.
- Corrective actions for issues.
- Retrospective notes for process improvement.

Exit gate:
- Residual risk accepted explicitly.
- Story/spec is eligible for completion updates in legacy trackers.

## Mandatory SideDecked Boundary Checks

For every phase touching solution design or implementation:
- Confirm bounded context first: commerce vs catalog/deck/community/pricing.
- Confirm target database:
  - `mercur-db` for `backend/` commerce domain.
  - `sidedecked-db` for `customer-backend/` customer domain.
- UIs (`storefront/`, `vendorpanel/`) must stay API-only.
- Cross-domain behavior must use APIs/events, never direct database access.

## Validation Matrix (Before Completion)

Technical checks:
- Run closest relevant checks first in edited repo.
- Where available: `lint`, `typecheck`, `build`, tests.
- Coverage target: changed modules at `>=80%` where measurable.

Documentation checks:
- Update docs when behavior, API, architecture, or setup changes.
- Keep planning and implementation artifacts in `_bmad-output/`.

Tracker checks:
- Reflect progress in `module-status.json`.
- Keep acceptance criteria status synchronized with actual implementation.

## Legacy Tracker Commands (Reporting Layer)

Selection and progress:
- `node scripts/next-spec.js`
- `node scripts/mark-spec.js --id <spec-id> --status in_progress`
- `node scripts/mark-spec.js --id <spec-id> --status completed`

Acceptance tracking:
- `node scripts/check-acceptance-criteria.js --id <spec-id>`
- `node scripts/check-acceptance-criteria.js --id <spec-id> --next-story`

## Operational Checklist

1. Run BMAD phases in order and satisfy each exit gate.
2. Keep domain boundaries explicit in every artifact and implementation.
3. Run required validations in the touched repo(s).
4. Update `module-status.json` and acceptance markers after validated progress.
5. Record residual risks and follow-up actions.
