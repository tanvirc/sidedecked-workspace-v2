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
