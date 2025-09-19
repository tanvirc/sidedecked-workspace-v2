# BMAD Core Review Playbook

This guide helps SideDecked teams evaluate the `.bmad-core/` installation, select the agent set we will standardize on, and decide whether any optional packs should be removed.

## 1. Inventory the Installation
- Core agents live in `.bmad-core/agents/` (Analyst, PM, Architect, SM, Dev, QA, UX Expert, PO, Orchestrator).
- Task automation and checklists are in `.bmad-core/tasks/` and `.bmad-core/checklists/`.
- Templates (PRD, architecture, stories, QA gates) are under `.bmad-core/templates/`.
- Web bundles / optional packs are not enabled by default; if a future install adds any `.bmad-*` directories, document them here.

> ✅ Action: Each functional lead reviews the agent file matching their role to confirm terminology, escalation paths, and local customization needs.

## 2. Decide Which Agents to Standardize
Recommended defaults for SideDecked:
- **Planning**: Analyst → PM → Architect (core planning trio)
- **Execution**: SM → Dev → QA (story lifecycle)
- **Support**: UX Expert (front-end heavy epics), PO (alignment), Orchestrator (workspace overview)

Optional agents (e.g., brainstorm facilitators) can remain unused unless explicitly requested. Capture any deviations in `docs/architecture/00-operating-model.md` (create if missing).

> ✅ Action: During the next squad sync, confirm which agents each team will operate and assign human owners for oversight.

## 3. Prune Unused Packs (If Desired)
- The core installation currently includes only `.bmad-core`. If future upgrades add expansion packs (e.g., `.bmad-creative-writing`), remove them by deleting the directory and updating `.bmad-core/install-manifest.yaml`.
- Keep notes on removed packs in this document so reinstallations remain consistent.

> ✅ Action: When pruning, run `npx bmad-method install` afterward to ensure manifests stay consistent.

## 4. Operationalize the Workflow
- Document agent invocation commands in team runbooks (e.g., `npx bmad-method run sm --epic epic-01` once supported).
- Ensure Codex CLI instructions reference BMAD usage (already added to `CONTRIBUTING.md`).
- Schedule a dry-run where the SM agent generates a story and Dev/QA agents execute the checklist end-to-end.

## Decisions & Updates
| Date       | Owner      | Decision | Notes |
|------------|------------|----------|-------|
| 2025-09-12 | Platform   | Draft    | Initial review playbook created. |

Append additional rows as the team agrees on agent responsibilities or removes packs.
