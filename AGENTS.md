# AGENTS.md - SideDecked Implementation Guide for Codex CLI

## Purpose

This document defines how Codex CLI agents work in the SideDecked workspace. It combines project architecture, implementation rules, and Codex‑specific operating practices so that every change is deliberate, verifiable, and production‑ready.

---

## Codex BMAD Quick Start

- **Install/refresh agents**: Run `npx bmad-method install -f -i codex -d .` (local) or `npx bmad-method install -f -i codex-web -d .` (if you need committed assets for Codex Web). Re-run whenever `.bmad-core` changes.
- **Verify bundles**: `npx bmad-method list:agents` confirms the agent set; use `npx bmad-method validate` before shipping major updates.
- **Launch Codex**: Start Codex CLI from the repo root and address agents explicitly (e.g., “As dev, implement Story 01.1 tasks”). The BMAD commands (`*help`, `*agent`, `*task`) stay available after activation.

### Codex Agent Directory

| Agent ID | Title | High-Value Use Cases | Source Path |
| --- | --- | --- | --- |
| `analyst` | Business Analyst | Market research, discovery framing, competitive analysis | `.bmad-core/agents/analyst.md` |
| `architect` | Architect | System design, architecture documentation, integration planning | `.bmad-core/agents/architect.md` |
| `bmad-master` | BMad Master Task Executor | Cross-domain expertise, one-off automation, KB guidance | `.bmad-core/agents/bmad-master.md` |
| `bmad-orchestrator` | BMad Master Orchestrator | Workflow coordination, agent selection, multi-agent guidance | `.bmad-core/agents/bmad-orchestrator.md` |
| `dev` | Full Stack Developer | Implementation, debugging, refactoring, standards enforcement | `.bmad-core/agents/dev.md` |
| `pm` | Product Manager | PRDs, product strategy, roadmap prioritization | `.bmad-core/agents/pm.md` |
| `po` | Product Owner | Backlog curation, story refinement, acceptance criteria | `.bmad-core/agents/po.md` |
| `qa` | Test Architect & Quality Advisor | Quality gates, risk assessment, test architecture reviews | `.bmad-core/agents/qa.md` |
| `sm` | Scrum Master | Story drafting, epic orchestration, agile rituals | `.bmad-core/agents/sm.md` |
| `ux-expert` | UX Expert | UX research, wireframes, front-end experience optimization | `.bmad-core/agents/ux-expert.md` |

### Agents Index (Codex CLI Loader)

```yaml
agents:
  - id: analyst
    path: .bmad-core/agents/analyst.md
  - id: architect
    path: .bmad-core/agents/architect.md
  - id: bmad-master
    path: .bmad-core/agents/bmad-master.md
  - id: bmad-orchestrator
    path: .bmad-core/agents/bmad-orchestrator.md
  - id: dev
    path: .bmad-core/agents/dev.md
  - id: pm
    path: .bmad-core/agents/pm.md
  - id: po
    path: .bmad-core/agents/po.md
  - id: qa
    path: .bmad-core/agents/qa.md
  - id: sm
    path: .bmad-core/agents/sm.md
  - id: ux-expert
    path: .bmad-core/agents/ux-expert.md
```

---

## Codex Operating Rules (MANDATORY)

- Preamble: Before any tool call, send a 1–2 sentence note describing what you will do next. Group related actions.
- Plans: Use `update_plan` for multi‑step or ambiguous work. Keep steps concise (5–7 words). Exactly one step `in_progress` at a time. Skip plans for trivial single‑step work.
- Shell usage: Prefer `rg` for search and `rg --files` for discovery. Read files in max 250‑line chunks. Avoid commands that emit >10KB or >256 lines at once.
- File references: Use clickable paths (e.g., `src/app.ts:42`). Do not include ranges. Avoid non‑file URIs.
- Response style: Be concise and action‑oriented. Use short headers where helpful and single‑line bullets. Wrap code, paths, and commands in backticks.
- Approvals/sandboxing: If sandboxed or network‑restricted, call out what you need and why. In non‑interactive modes, proactively validate your work.
- Safety: No destructive actions (e.g., `rm -rf`, rewriting history) unless explicitly requested. Avoid changing unrelated code.

---

## Project Architecture Overview

SideDecked is a community‑driven TCG marketplace built on a split‑brain architecture with four repositories:

```
backend/            # MercurJS Commerce (mercur-db)
customer-backend/   # Customer APIs & services (sidedecked-db)
storefront/         # Next.js customer UI
vendorpanel/        # React vendor/admin UI
```

Database separation (critical):

- `mercur-db`: commerce operations only (orders, payments, vendors)
- `sidedecked-db`: customer experience only (cards, decks, community, pricing)

Do not mix data models or connect directly across databases. Cross‑context communication happens via APIs/events.

Primary tech:

- Backend: Node.js, MercurJS/Medusa v2 patterns, TypeScript, TypeORM
- Frontend: Next.js 14 + React
- Infra: PostgreSQL, Redis, Stripe, Algolia

---

## Pre‑Implementation Protocol (STOP GATE)

Complete these steps before writing code:

1) Load core context
- `cat AGENTS.md` (this document)
- `cat docs/standards/code-standards.md`
- `cat docs/standards/testing-standards.md`
- `cat docs/architecture/02-architectural-principles.md`

2) Read task‑specific architecture docs
- New feature: `docs/architecture/03-domain-models.md`, `docs/architecture/04-architectural-patterns.md`
- API change: `docs/architecture/06-integration-architecture.md`
- Database change: `docs/architecture/05-data-architecture.md`
- Authentication: `docs/architecture/07-authentication-architecture.md`

3) Verification checklist
- [ ] Correct bounded context identified
- [ ] Correct database selected (mercur-db vs sidedecked-db)
- [ ] Similar implementations reviewed
- [ ] Testing plan defined (TDD, >80% coverage)
- [ ] Documentation updates identified (README/CHANGELOG/architecture)

4) Domain validation questions
- Bounded context: Commerce (mercur-db) | Catalog | Deck | Community | Pricing (sidedecked-db)
- Integration: Internal APIs | External services | Events | Cross‑service via APIs
- Security: Public | Customer | Vendor | Admin | OAuth/JWT requirements
- Performance: Query/caching strategy | p95 targets | real‑time needs

Do not proceed until you can answer all items with confidence.

---

## Codex Work Cadence

- Announce next action (preamble). Example: “I’ll open the API routes to locate the handler.”
- For multi‑step tasks, create/maintain a short plan with `update_plan`. Mark steps complete as you progress.
- Explore with `rg` and targeted file reads (≤250 lines at a time).
- Implement with `apply_patch`. Keep diffs surgical and consistent with existing style.
- Validate: Run targeted checks/tests where available. If tests exist, start from the closest scope you changed.
- Summarize outcome concisely, including next logical steps or validations the user may run.

---

## Implementation Standards

- Working code: No placeholders, mocks, or “TODO” implementations in production code.
- TDD: Write tests first where a test harness exists; maintain >80% coverage for changed modules.
- Patterns: Follow repository patterns for services, controllers, repositories, events.
- Medusa/MercurJS specifics:
  - Use `MedusaStoreRequest`/`MedusaResponse` correctly
  - Use object module resolution: `{ resolve: './src/modules/auth' }`
  - Avoid forbidden patterns like `authIdentity: null` (prefer `undefined`), or `() => new Date()` defaults
- Performance: Aim for p95 API < 100ms; optimize queries (<50ms) and apply caching where specified.
- Logging & errors: Add actionable error handling and logs for failure cases.

Forbidden:

- AI/automation mentions in code, docs, or commits (“Generated by …”, “Co‑Authored‑By: …”).
- Cross‑database coupling or direct connections between mercur-db and sidedecked-db.
- Destructive changes outside requested scope.

---

## Validation & Quality Gates

Local/dev scripts vary per repo; generally:

- Lint/typecheck/build/tests must pass before considering work complete.
- Coverage: >80% on changed modules if coverage tooling exists.
- Documentation: Update README/CHANGELOG/architecture docs when behavior or APIs change.

Quick examples:

```
# Build and test current package/repo
npm run typecheck && npm run build && npm test

# Coverage (if configured)
npm run test:coverage
```

---

## Commits

- Conventional commits: `type(scope): description`
- Keep commits scoped to the repo you are changing (this workspace hosts multiple repos).
- Do not reference AI/automation. Follow `docs/standards/commit-standards.md`.

Example:

```
feat(auth): implement JWT refresh rotation

- Add 30‑day refresh tokens and rotation
- Rate limit refresh endpoint
- Add integration tests for token lifecycle
```

---

## File/Answer Formatting (for Codex CLI)

- Headers: Short, Title Case, prefixed with `**` when used.
- Bullets: `- ` with a bolded keyword followed by a colon and a concise description.
- Monospace: Wrap commands, paths, and identifiers in backticks.
- File references: Use clickable paths like `src/server/index.ts:42`. Do not include ranges.
- Brevity: Favor concise, scannable responses; add structure only when it adds clarity.

---

## Shell Guidance

- Prefer `rg` for fast search; fall back to platform tools if unavailable.
- Read files in chunks (≤250 lines). Large outputs are truncated.
- On Windows PowerShell, avoid `&&`; run commands separately or with `;` where supported.
- Be explicit about working directory and context when it matters.

---

## Quick Reference

- Architecture: `docs/architecture/`
- Epics: `docs/epics/`
- Standards: `docs/standards/`
- Templates: `docs/templates/`

---

## Module Selection & Acceptance Criteria

- Source of truth: `docs/epics/` (BMAD-managed)
- Continue current: If `current_specification` exists and is not `completed`, continue working on it.
- Otherwise pick next: lowest-numbered spec with `in_progress`, else lowest-numbered `not_started`.
- Acceptance criteria gate: Do not move to the next story, epic, or spec until all acceptance criteria for the current unit are implemented.
  - Spec files encode status per criterion via tags like `(IMPLEMENTED)`, `(IN PROGRESS)`, `(NOT BUILT)`.
  - Treated equivalences: `IMPLEMENTED|COMPLETED` → completed; `IN PROGRESS|IN_PROGRESS|PARTIAL` → in_progress; `NOT BUILT|NOT STARTED|NOT_STARTED|TODO` → not_started.

Helper commands:

- Print next spec id by rule:
  - `node scripts/next-spec.js`

- Check acceptance criteria completion for a spec:
  - `node scripts/check-acceptance-criteria.js --id 04-vendor-management-system`
  - Exit code 0 = all implemented, 2 = incomplete

- Find next story within a spec that still has incomplete criteria:
  - `node scripts/check-acceptance-criteria.js --id 04-vendor-management-system --next-story`
  - Outputs `User Story X.Y: Title` (prefixed with its Epic) or `ALL_STORIES_COMPLETED`

- Mark a spec status (guards on completion):
  - `node scripts/mark-spec.js --id 04-vendor-management-system --status in_progress`
  - `node scripts/mark-spec.js --id 04-vendor-management-system --status completed`
    - Will refuse completion if any acceptance criteria are incomplete (use `--force` to override).

Operational flow:

1) Select work: `node scripts/next-spec.js`
2) Within selected spec, pick first incomplete story: `node scripts/check-acceptance-criteria.js --id <id> --next-story`
3) Implement story fully; ensure all its acceptance criteria read `(IMPLEMENTED)`
4) Repeat for all stories in the epic; then for all epics in the spec
5) When all criteria are implemented, mark the spec `completed`:
   - `node scripts/mark-spec.js --id <id> --status completed`

Notes:

- Do not cross databases: Commerce routes to `backend/`; Catalog/Deck/Community/Pricing route to `customer-backend/`; UI changes route to `storefront/` or `vendorpanel/`.
- If selection is ambiguous, prefer items with clear acceptance criteria and highest downstream impact.

---

## Example Mini‑Playbook

1) Context
- Preamble: “Scanning repo for route definitions.”
- `rg -n "GET /api/cards|cards" storefront/src customer-backend/src`

2) Plan (non‑trivial change)
- `update_plan`: “Add endpoint”, “Write service”, “Add tests”, “Wire UI”

3) Implement
- `apply_patch` to add service/controller and route
- Add tests using existing harness and fixtures

4) Validate
- Build, typecheck, and run nearest tests first
- Summarize results and propose next verifications

---
