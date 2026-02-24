# SideDecked Workspace Instructions for GPT Codex

## Scope

This file governs work in the workspace root and all child repositories:

- `backend/`
- `customer-backend/`
- `discord-bot/`
- `storefront/`
- `vendorpanel/`

Child repos can add stricter rules in their own `AGENTS.md`.

## Operating Rules

- Think before coding. State assumptions and resolve ambiguity early.
- Keep changes surgical. Do not refactor unrelated areas.
- Prefer existing patterns and utilities already used in the codebase.
- No placeholders in shipped code (`TODO`, stubs, dead paths).
- Never add AI attribution text in code, commits, or docs.
- For non-trivial changes, use TDD flow: failing test -> minimal fix -> pass -> refactor.

## Architecture Guardrails

SideDecked uses two isolated databases and services:

- `backend` (Medusa/Mercur): `mercur-db`
- `customer-backend` (Express/TypeORM): `sidedecked-db`

Hard rule: no direct DB connections across these systems. Cross-system data must go through APIs.

## Execution Workflow for Codex

1. Identify affected repo(s) before editing.
2. Read this root file and the matching child `AGENTS.md` first.
3. Find similar implementations in the target repo before introducing new patterns.
4. Implement minimal code to satisfy requirements.
5. Run the repo quality gate before finalizing.
6. Update docs/changelog when a spec or behavior changes.

## Quality Gates

Run only in affected repos:

- `backend`: `npm run lint && npm run typecheck && npm run build && npm run test:unit`
- `customer-backend`: `npm run lint && npm run typecheck && npm run build && npm test`
- `discord-bot`: `npm run lint && npm run build && npm test`
- `storefront`: `npm run lint && npm run typecheck && npm run build && npm test`
- `vendorpanel`: `npm run lint && npm run typecheck && npm run build && npm test`

Coverage target: 80%+ for changed areas where coverage is enforced.

## Project Context

For domain and architecture background, use:

- `_bmad-output/project-context.md`
- `docs/architecture/`

