# BMAD Adoption Plan

## Purpose
This guide explains how to install and operationalize the BMAD Method across the SideDecked monorepo as part of the brownfield-to-greenfield migration.

## Installation Steps
1. Ensure Node.js 20+ and npm 10+ are installed locally.
2. From the repository root, run `npx bmad-method install` and select the `OpenCode` (or relevant IDE) integration when prompted.
3. Commit the generated `.bmad-core/` assets and configuration files to source control.
4. Repeat the install inside each package (`backend/`, `customer-backend/`, `storefront/`, `vendorpanel/`) if separate BMAD teams are required. Otherwise, reference the shared root configuration.
5. Verify `opencode.jsonc` (or equivalent IDE instruction file) includes BMAD instructions for the orchestrator and team agents.
6. Run `npx bmad-method flatten` when needed to produce a flattened repository view for web-based planning sessions.

## Repository Checklist
- [ ] `docs/prd.md` committed and versioned as the authoritative product requirements document.
- [ ] Architecture doc (`docs/architecture.md`) generated via BMAD Architect agent.
- [ ] Sharded epics stored under `docs/epics/` with acceptance criteria synchronized.
- [ ] Story files under `docs/stories/` ready for SM/Dev/QA cycles.
- [ ] QA gates defined in `docs/qa/gates/` for high-risk areas.
- [ ] BMAD CLI commands (`npx bmad-method plan`, `npx bmad-method flatten`, `npx bmad-method upgrade`) documented in README.

## Brownfield Alignment Notes
- Use the BMAD *document-project* task to capture current system architecture before creating new epics.
- Attach existing documentation from `docs/specifications/` as supplemental context when sharding epics.
- Treat each repository as a bounded context: never cross-reference tables between `mercur-db` and `sidedecked-db` stories.
- Update `module-status.json` after each story to ensure acceptance criteria tags stay synchronized with BMAD status.

## Next Actions
- Run the PM agent with the new PRD to produce sharded epics and story files.
- Run the Architect agent to generate `docs/architecture.md` aligned with the split-brain strategy.
- Schedule QA to define test charters and quality gates before implementation work begins.
