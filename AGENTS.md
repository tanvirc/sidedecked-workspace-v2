# AGENTS.md - SideDecked Codex Operating Guide

This file is the execution contract for Codex agents in this workspace.

Scope and precedence:
- This root file applies to the whole workspace.
- Repo-local `AGENTS.md` files in `backend/`, `customer-backend/`, `storefront/`, and `vendorpanel/` override root rules for their subtree.
- If rules conflict, follow the most specific file closest to the edited code.

## Core Architecture (Non-Negotiable)

SideDecked is a split-domain system:
- `backend/` uses `mercur-db` for commerce (orders, payments, vendors).
- `customer-backend/` uses `sidedecked-db` for catalog, decks, community, pricing.
- `storefront/` and `vendorpanel/` are UIs and must call APIs only.

Hard boundaries:
- Never connect one backend directly to the other backend database.
- Cross-domain behavior must go through HTTP APIs/events.
- Do not move features to another bounded context without explicit approval.

## Karpathy-Style Execution Loop (Codex-Optimized)

Use this loop on every non-trivial task:
1. Understand objective, constraints, and success criteria before editing.
2. State assumptions explicitly; if ambiguity can cause rework, ask one focused clarification.
3. Inspect existing code paths and mirror local patterns before introducing new structure.
4. Plan small, reversible steps and implement the minimum necessary diff.
5. Validate quickly at nearest scope first, then expand to repo-level checks.
6. Report what changed, what was verified, and remaining risk.

Quality heuristics:
- Prefer simple implementations over broad abstractions.
- Preserve existing conventions unless there is a clear defect.
- Avoid speculative refactors unrelated to the requested outcome.

## Required Workflow

1. Announce next action before tool calls.
2. Use `update_plan` for multi-step work.
3. Search with `rg`, read in focused chunks, implement surgically.
4. Validate with the nearest tests/checks.
5. Summarize outcomes and any follow-up verification.

## BMAD v6 Full Planning Path (Root-Orchestrated)

Installation contract:
- BMAD is installed at workspace root in `_bmad/` (version `6.0.0-Beta.8`).
- Installation scope is root-only. Do not install separate BMAD copies in `backend/`, `customer-backend/`, `storefront/`, or `vendorpanel/`.
- BMAD output directories are `_bmad-output/planning-artifacts/` and `_bmad-output/implementation-artifacts/`.

When BMAD path is mandatory:
- New specification work in `docs/specifications/`.
- Cross-repo or architecture-affecting initiatives.
- Work that changes API contracts, data boundaries, or domain ownership.

When abbreviated path is allowed:
- Narrow bug fixes or low-risk scoped changes inside one bounded context, if rationale is stated before implementation.

### Project Agent Roster

Required project roles:
- `@sidedecked-router` (project-specific): first gate for every non-trivial request; selects bounded context, target repo, and allowed integration pattern.
- `@analyst` (BMAD): creates/refines product brief and optional domain/market/technical research.
- `@pm` (BMAD): owns PRD quality, scope, and acceptance criteria integrity.
- `@architect` (BMAD): owns architecture decisions and technical boundary enforcement.
- `@sm` (BMAD): transforms approved planning artifacts into implementation-ready epics/stories.
- `@dev` (BMAD): implements approved stories.
- `@qa` (BMAD): validates test strategy and automation coverage for changed behavior.
- `@po` (project role): readiness gate owner. In this workspace, PO gate is executed using BMAD validation workflows, primarily by `@pm` + `@architect`.
- Custom router definition file: `_bmad/_config/custom/agents/sidedecked-router.md`.

Routing constraints for `@sidedecked-router`:
- Commerce, sellers, checkout, payouts, orders => `backend/`.
- Catalog, decks, community, pricing intelligence => `customer-backend/`.
- Customer UX and storefront journeys => `storefront/`.
- Vendor/admin workflows => `vendorpanel/`.
- Reject any plan that proposes direct DB coupling between `mercur-db` and `sidedecked-db`.

### BMAD Workflow Sequence (Default Full Path)

Use this sequence unless abbreviated path criteria are met:
1. `@sidedecked-router`: route domain/repo and define hard boundaries.
2. `@analyst`: run `create-product-brief` (add `domain-research`, `market-research`, `technical-research` if needed).
3. `@pm`: run `create-prd` (and `edit-prd` when refining).
4. `@architect`: run `create-architecture`.
5. `@pm` (PO gate part 1): run `validate-prd`.
6. `@architect` (PO gate part 2): run `check-implementation-readiness`.
7. `@sm`: run `create-epics-and-stories`, then `create-story` for execution slices.
8. `@dev`: run `dev-story`.
9. `@qa`: run `qa-automate` and/or targeted validation workflows for touched behavior.

### BMAD-to-SideDecked Artifact Mapping

Planning outputs must map to workspace source-of-truth files:
- Product brief/research can live in `_bmad-output/planning-artifacts/`.
- PRD and story acceptance criteria must be synchronized into `docs/specifications/<spec-id>.md`.
- Architecture decisions must be synchronized to `docs/architecture/` (and ADRs in `docs/architecture/adr/` when relevant).
- Story breakdown must align with the active spec selected by `module-status.json`.

Status and gate integration:
- Before planning a new unit, select the active spec with `node scripts/next-spec.js`.
- Do not mark a spec complete until acceptance criteria pass via `node scripts/check-acceptance-criteria.js --id <spec-id>`.
- Move status with `node scripts/mark-spec.js --id <spec-id> --status in_progress|completed` only after BMAD gate outputs are synchronized to repo docs.

Definition of ready for implementation:
- Bounded context and target repo are explicit.
- Affected APIs and data boundaries are explicit.
- Acceptance criteria are parseable by `scripts/check-acceptance-criteria.js`.
- Validation plan includes repo-local lint/type/build/tests as applicable.

Version pin and upgrade rule:
- BMAD is pinned to `v6 beta` in this workspace.
- Any BMAD upgrade must preserve split-domain boundaries and this AGENTS routing contract.

## Mandatory Engineering Rules

- No placeholders, stubbed production logic, or fake success paths.
- TDD where a harness exists; keep changed-module coverage at `>=80%` when measurable.
- TypeScript strict mode, zero lint/type errors, and passing build/tests before completion.
- Follow existing service/controller/repository/event patterns.
- Keep logging and error handling actionable.

Medusa/MercurJS forbidden patterns:
- `MedusaRequest` (use `MedusaStoreRequest`).
- Bare module path strings (use `{ resolve: "..." }` object format).
- `authIdentity: null` (use `undefined`).
- Lambda defaults where literal defaults are expected.

## Work Selection and Acceptance Gate

Source of truth: `module-status.json`.

Selection order:
1. Continue `current_specification` unless completed.
2. Otherwise use lowest-numbered `in_progress`.
3. Otherwise use lowest-numbered `not_started`.

Acceptance rule:
- Do not advance story/spec until all criteria for current unit are implemented.
- Status mapping in spec files:
  - `IMPLEMENTED` or `COMPLETED` => complete
  - `IN PROGRESS` or `PARTIAL` => in progress
  - `NOT BUILT`, `NOT STARTED`, `TODO` => not started

Helper commands:
- `node scripts/next-spec.js`
- `node scripts/check-acceptance-criteria.js --id <spec-id>`
- `node scripts/check-acceptance-criteria.js --id <spec-id> --next-story`
- `node scripts/mark-spec.js --id <spec-id> --status in_progress`
- `node scripts/mark-spec.js --id <spec-id> --status completed`

## Context Loading Protocol

Always read first for architecture-sensitive work:
- `docs/architecture/01-system-overview.md`
- `docs/architecture/02-architectural-principles.md`
- `docs/standards/code-standards.md`
- `docs/standards/testing-standards.md`

Then load task-specific architecture requirements:

| Task Type | Required Documentation |
|-----------|------------------------|
| New feature | `docs/architecture/03-domain-models.md`, `docs/architecture/04-architectural-patterns.md`, relevant spec in `docs/specifications/` |
| Bug fix | `docs/architecture/04-architectural-patterns.md`, relevant repo architecture doc, relevant standards doc in `docs/standards/` |
| API change | `docs/architecture/06-integration-architecture.md`, `docs/API-REFERENCE.md`, relevant repo architecture doc |
| Database/schema change | `docs/architecture/05-data-architecture.md`, `docs/architecture/03-domain-models.md`, affected repo migration patterns |
| Authentication/security | `docs/architecture/07-authentication-architecture.md`, `docs/architecture/06-integration-architecture.md`, `SECURITY.md` |
| UI flow/component change | `docs/architecture/01-system-overview.md`, relevant UI architecture doc (`storefront/docs/ARCHITECTURE.md` or `vendorpanel/docs/ARCHITECTURE.md`) |
| Performance/caching work | `docs/architecture/01-system-overview.md`, `docs/architecture/05-data-architecture.md`, `docs/architecture/06-integration-architecture.md` |

Pre-implementation gate:
- Identify bounded context and target repo.
- Confirm required docs for task type were reviewed.
- State affected APIs, data boundaries, and validation plan.

## Repo Routing Map

Choose the right repo before implementation:
- Commerce, sellers, checkout, payouts, orders => `backend/`
- Catalog, decks, community, pricing intelligence => `customer-backend/`
- Customer UI/UX flows => `storefront/`
- Vendor/admin UI workflows => `vendorpanel/`

## Validation and Delivery

Before completion:
- Run closest relevant checks in the edited repo.
- If available, run `lint`, `typecheck`, `build`, and tests.
- Update docs/changelog when behavior, APIs, or setup changed.

Commits:
- Conventional format `type(scope): description`.
- No AI/assistant/automation attribution text in commit messages.
- Keep commits scoped to the repo actually changed.
