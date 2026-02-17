# Story Lifecycle Workflow

## Overview

`/bmad-bmm-story-lifecycle` runs a full story from prioritization to deployment and documentation, coordinating all BMAD agents in sequence. It pauses between each phase and waits for your approval before continuing.

**Invoke with:**
```
/bmad-bmm-story-lifecycle
```

---

## Phases

| # | Agents | Output | To proceed |
|---|---|---|---|
| 1 | SM + PM | Recommended next story with priority rationale | Type the story key, or a different one |
| 2 | BA + PM + UX Designer | Requirements + UX brief with clarified acceptance criteria | `CONFIRM` |
| 3 | Architect | Technical design note: domain routing, affected files, API contracts, migrations | `CONFIRM` |
| 4 | Dev | Implemented story + unit tests (committed + pushed) | `CONFIRM` after quality gate passes |
| 5 | QA | QA report: coverage percentages and quality gate results (committed + pushed) | `CONFIRM` |
| 6 | DevOps | Railway preview deployment + smoke test (committed + pushed) | `CONFIRM` |
| 7 | Tech Writer | Updated CHANGELOG.md, architecture docs, story file marked done, PR created | `CONFIRM` |

> **Note:** From Phase 4 onwards, each phase commits and pushes its changes to the feature branch before pausing for confirmation. This ensures no work is lost between phases.

---

## Phase Details

### Phase 1 — Story Prioritization (SM + PM)

Bob (Scrum Master) and John (Product Manager) review `sprint-status.yaml` and all epic files, then jointly recommend the highest-priority next story. They present distinct SM (sprint readiness) and PM (business value) perspectives before agreeing on a recommendation.

**You respond with:** the story key to confirm (e.g. `story-04-3-vendor-kyc`), or a different story key to override.

> **Tip:** If you already know which story to work on, just type its key immediately — you don't need to read the recommendation.

---

### Phase 2 — Requirements + UX (BA + PM + UX Designer)

Mary (Business Analyst), John (PM), and the UX Designer load the confirmed story file and analyse it from three angles:

- **BA:** gaps in acceptance criteria, missing business rules, edge cases
- **PM:** scope alignment with parent epic goals and user personas
- **UX Designer:** interaction flows, component suggestions, accessibility notes (UI-facing criteria only)

Output is a consolidated Requirements + UX Brief. Any open questions requiring your decision are surfaced here before coding begins.

---

### Phase 3 — Technical Design (Architect)

Winston (Architect) reviews the story, the Requirements + UX Brief, and all architecture docs. Enforces the split-brain rule:

| Domain | Routes to | Database |
|---|---|---|
| Orders, payments, vendors | `backend/` | mercur-db |
| Cards, decks, community, pricing | `customer-backend/` | sidedecked-db |
| Storefront or vendor UI | `storefront/` or `vendorpanel/` | — |

Output is a Technical Design Note covering: affected files, new entities/migrations, API contract changes, integration touchpoints (Stripe, Algolia, Redis, MinIO, Resend), and any architectural risks.

---

### Phase 4 — Development (Dev)

Amelia (Developer) adopts TDD. The existing `dev-story` workflow is invoked for implementation.

Before confirming, verify manually:
- All acceptance criteria marked `(IMPLEMENTED)` in the story file
- Quality gate passes: `npm run lint && npm run typecheck && npm run build && npm test`
- Test coverage above 80% on changed modules
- Changes committed and pushed to the feature branch

---

### Phase 5 — QA (QA)

Quinn (QA) runs the `qa-automate` workflow and validates:
- Coverage percentage per changed module (must be >80%)
- All quality gates pass in the affected repo(s)

Any failures are reported with file and line references. QA-related changes (test additions/fixes) are committed and pushed to the feature branch.

---

### Phase 6 — Deployment (DevOps)

Rex (DevOps Automation Engineer) deploys the feature branch to a Railway preview environment:
- Identifies affected services (backend, customer-backend, storefront, vendorpanel)
- Deploys using Railway CLI (`railway up --detach`)
- Monitors logs and fixes deployment failures
- Runs smoke tests against the preview URL
- Commits any deployment config fixes to the feature branch

---

### Phase 7 — Documentation + PR (Tech Writer)

The Tech Writer updates all impacted documentation:
- `CHANGELOG.md` — new entry under the current version/date
- Architecture docs — if new patterns, components, or integrations were introduced
- Story file — all acceptance criteria set to `(IMPLEMENTED)`
- `sprint-status.yaml` — story status set to `done`

Then creates a pull request to merge the feature branch to main, including the Railway preview URL.

---

## Context Loaded Automatically

| Source | Content |
|---|---|
| `_bmad-output/planning-artifacts/epic-*.md` | All epic files (for Phase 1 prioritization) |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | Current story states (for Phase 1) |
| `docs/architecture/*.md` | Architecture docs (for Phase 3) |

---

## Workflow Files

```
_bmad/bmm/workflows/4-implementation/story-lifecycle/
├── workflow.yaml       # BMAD config: context loading, variable resolution
└── instructions.xml    # 17 steps across 7 phases

.claude/commands/
└── bmad-bmm-story-lifecycle.md   # Slash command entry point
```

---

## Related Commands

| Command | When to use instead |
|---|---|
| `/bmad-bmm-dev-story` | Skip straight to Dev phase (story already defined) |
| `/bmad-bmm-code-review` | Adversarial review after Dev phase |
| `/bmad-bmm-quick-spec` → `/bmad-bmm-dev-story` | Bug fixes and small features |
| `/bmad-agent-bmm-devops` | Standalone DevOps agent for deployment tasks |
| `/bmad-agent-bmad-master` | Ad-hoc cross-agent coordination |
