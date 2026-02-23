# Story Lifecycle Workflow

## Overview

`/bmad-bmm-story-lifecycle` runs a full story from prioritization through merge using BMAD v6.0.2 flow control.

It is session-aware (Discovery, Build, Ship), pauses at each phase gate, and requires explicit confirmation before continuing.

Invoke with:

```bash
/bmad-bmm-story-lifecycle
```

## Phases

| # | Phase | Agents | Output | Gate |
|---|---|---|---|---|
| 1 | Story Prioritization | SM + PM | Recommended next story with rationale | Story key |
| 2 | Requirements and UX Brief | BA + PM + UX Designer | Clarified ACs, business rules, UX notes | `CONFIRM` |
| 2B (conditional) | UI Wireframe Validation | UX Designer + Party Mode (UX/PM/BA/Architect) | HTML wireframe + consolidated feedback | `SKIP` or `CONFIRM` |
| 3 | Technical Design and Plan | Architect | Technical design note + saved implementation plan | `CONFIRM` |
| 4 | Development (TDD) | Dev | Implemented code and unit tests on feature branches | `CONFIRM` |
| 5 | Integration and E2E QA | QA | QA report with integration/E2E scope and quality gates | `CONFIRM` |
| 6 (conditional) | Production Deployment | DevOps | Railway production deployment report | `CONFIRM` |
| 7 | Documentation | Tech Writer | Updated changelog/docs/story/sprint status | `CONFIRM` |
| 8 | PR, Review, Merge | Dev + Reviewers | PRs created, reviewed, comment-resolved, merged | `CONFIRM` |

## Key Improvements

- Removed broken Phase 7 dependency on a non-existent `story-docs` workflow.
- Added explicit runtime variables for durable context handoff:
  - `{{story_file_path}}`
  - `{{plan_file_path}}`
- Replaced generic quality gates with repo-specific commands.
- Aligned deployment phase to Railway production for single-environment Railway setups.
- Kept two-stage review (spec compliance, then code quality) before merge.

## Quality Gates Used

Run only in repos affected by the story:

- `backend/`: `npm run lint && npm run typecheck && npm run build && npm run test:unit`
- `customer-backend/`: `npm run lint && npm run typecheck && npm run build && npm test`
- `storefront/`: `npm run lint && npm run typecheck && npm run build && npm test`
- `vendorpanel/`: `npm run lint && npm run typecheck && npm run build && npm test`

Coverage target remains 80%+ for changed areas.

## Saved Artifacts

- Implementation plan: `docs/plans/{date}-{story-key}-plan.md`
- Optional wireframe: `_bmad-output/planning-artifacts/ux-{story-key}-wireframe.html`
- Feature branches and commits in each affected repo
- QA report and deployment report in conversation output

## Workflow Files

```text
_bmad/bmm/workflows/4-implementation/story-lifecycle/
|- workflow.yaml
`- instructions.xml   # 24 steps across phases 1,2,2B,3,4,5,6,7,8

.claude/commands/
`- bmad-bmm-story-lifecycle.md
```

## Related Commands

- `/bmad-bmm-dev-story`: implement when story and plan are already set.
- `/bmad-bmm-code-review`: run standalone review outside lifecycle orchestration.
- `/bmad-bmm-quick-spec` -> `/bmad-bmm-quick-dev`: use for small scoped changes.
- `/bmad-agent-bmad-master`: ad-hoc cross-agent coordination.
