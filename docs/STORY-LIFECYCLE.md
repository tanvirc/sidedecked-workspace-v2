# BMAD BMM Story Lifecycle

The story lifecycle is the end-to-end workflow that takes a story from backlog to production. It runs across three sessions — Discovery, Build, and Ship — each handled in a separate Claude Code conversation. The workflow is orchestrated by BMAD BMM agents; the human's role is to confirm gates between phases and sessions.

The canonical implementation lives in `_bmad/bmm/workflows/4-implementation/story-lifecycle/`. This document is the human-readable reference.

---

## Status Transition Model

| Status | Meaning |
|--------|---------|
| `backlog` | Defined in epics, not yet prepared for dev |
| `ready-for-dev` | Story file created, full context loaded, ready to implement |
| `in-progress` | Developer actively implementing |
| `review` | Implementation complete, awaiting code review |
| `done` | Merged to main |

---

## Lifecycle Flowchart

```
PRE-DISCOVERY SETUP
─────────────────────────────────────────────────────────────────

  ┌─ sprint-status.yaml exists? ──┐
  NO                             YES
  │                               │
  ▼                               │
  sprint-planning (SM Bob)        │
  └───────────────────────────────┘
                  │
                  ▼
  ┌─ backlog story available? ─────┐
  NO                              YES
  │                                │
  ▼                                ▼
[no stories — done]       create-story (SM Bob)
                                   │
                                   ▼
                     story [status: ready-for-dev]
                                   │
                                   ▼

╔═══════════════════════════════════════════════════════════╗
║                  SESSION 1: DISCOVERY                     ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Phase 1 · Story Prioritization         Agents: SM + PM   ║
║  Output: confirmed story key                              ║
║                        │                                  ║
║                        ▼                                  ║
║  Phase 2 · Requirements + UX      Agents: BA + PM + UX    ║
║  Output: Requirements Brief [BA-signed READY]             ║
║                        │                                  ║
║             ┌─ UI story? ──┐                              ║
║           YES             NO                              ║
║             │               │                             ║
║             ▼               │                             ║
║  Phase 2B · UX Wireframe    │   Agent: Sally (UX)         ║
║  Output: ux-{story-key}-wireframe.html                    ║
║             │               │                             ║
║             └───────────────┘                             ║
║                        │                                  ║
║                        ▼                                  ║
║  Phase 3 · Technical Design + Plan  Agents: Winston + BA  ║
║  Output: docs/plans/{date}-{story-key}-plan.md            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
                        │
                        ▼

╔═══════════════════════════════════════════════════════════╗
║                   SESSION 2: BUILD                        ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Phase 4 · TDD Implementation        Agent: Amelia (Dev)  ║
║  Output: feature branch, all tasks done                   ║
║                        │                                  ║
║                        ▼                                  ║
║  Phase 5 · Integration + E2E QA      Agent: Quinn (QA)    ║
║  Output: QA report                                        ║
║                        │                                  ║
║       ┌─ UX wireframe in story? ──┐                       ║
║      YES                         NO                       ║
║       │                           │                       ║
║       ▼                           │                       ║
║  Phase 5B · Post-Build            │  Agents: Sally + Quinn║
║  UX Validation                    │                       ║
║  Output: ux-validation-report.md  │                       ║
║       │                           │                       ║
║       └───────────────────────────┘                       ║
║                        │                                  ║
╚════════════════════════╪══════════════════════════════════╝
                         │
                         ▼

╔═══════════════════════════════════════════════════════════╗
║                   SESSION 3: SHIP                         ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║       ┌─ needs_deploy in plan? ──┐                        ║
║      YES                        NO                        ║
║       │                          │                        ║
║       ▼                          │                        ║
║  Phase 6 · Production            │   Agent: DevOps        ║
║  Deployment                      │                        ║
║  Output: deployment report       │                        ║
║       │                          │                        ║
║       └──────────────────────────┘                        ║
║                        │                                  ║
║                        ▼                                  ║
║  Phase 7 · Documentation        Agents: Paige (TW) + BA   ║
║  Output: CHANGELOG, arch docs, story AC markers           ║
║                        │                                  ║
║                        ▼                                  ║
║  Phase 8 · PR Review + Merge   Agents: Reviewers + SM Bob ║
║  Output: merged to main, story: done                      ║
║                        │                                  ║
║       ┌─ epic complete? ──┐                               ║
║      YES                 NO                               ║
║       │                   │                               ║
║       ▼                   │                               ║
║  Phase 9 · Retrospective  │   Agents: all agents          ║
║  Output: epic-{n}-retro-{date}.md                         ║
║       │                   │                               ║
║       └───────────────────┘                               ║
║                        │                                  ║
║                        ▼                                  ║
║                     [Done]                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## Phase Reference

| Phase | Session | Agent(s) | Entry Condition | Key Steps | Output Artifact | Exit Condition |
|-------|---------|----------|-----------------|-----------|-----------------|----------------|
| 1 · Story Prioritization | Discovery | SM + PM | sprint-status.yaml with backlog story | Rank by readiness, business value, dependencies | Confirmed story key | User approves story selection |
| 2 · Requirements + UX | Discovery | BA + PM + UX Designer | Confirmed story key | AC gap analysis, business rules, edge cases, traceability mapping | Requirements Brief (BA-signed READY) | BA signs off READY |
| 2B · UX Wireframe | Discovery (conditional) | Sally — UX Designer | Story touches `storefront/` or `vendorpanel/` | UI scope assessment, HTML wireframe generation, 5-agent party review, elicitation refinement | `_bmad-output/planning-artifacts/ux-{story-key}-wireframe.html` | Party review APPROVED |
| 3 · Technical Design + Plan | Discovery | Winston — Architect + BA | Requirements Brief (+ wireframe if 2B ran) | Domain classification, split-brain compliance check, impacted modules/APIs, AC-to-design traceability, `needs_deploy` flag | `docs/plans/{date}-{story-key}-plan.md` | User approves plan |
| 4 · TDD Implementation | Build | Amelia — Dev | Approved implementation plan | Failing test → minimal code → pass → refactor, quality gate (`lint + typecheck + build + test`) | Feature branch commits, all story tasks marked done | Quality gate passes, coverage >80% |
| 5 · Integration + E2E QA | Build | Quinn — QA | Feature branch | Cross-service API contracts, integration tests across repo boundaries, E2E user flows, boundary edge cases | QA report, updated branch commits | Quinn signs off |
| 5B · Post-Build UX Validation | Build (conditional) | Sally + Quinn | Story has `## UX Design Reference` section | CSS token compliance audit, JSX vs wireframe hierarchy check, Playwright computed-style + a11y tests (375px + 1280px) | `_bmad-output/ux-validation/{story-key}/ux-validation-report.md` | Sally's verdict APPROVED |
| 6 · Production Deployment | Ship (conditional) | DevOps | `needs_deploy: true` in plan (re-validated against changed files) | Railway commands per affected repo, collect service status/URLs, smoke tests | Deployment report (or explicit skip justification) | All services healthy |
| 7 · Documentation | Ship | Paige — Tech Writer + BA | Feature complete (post-deploy if applicable) | `CHANGELOG.md` update, architecture docs, story AC markers set to `IMPLEMENTED`, sprint status to `done` | Documentation update report | All docs updated with evidence |
| 8 · PR Review + Merge | Ship | Code Reviewer + SM Bob | Documentation complete | Stage 1: spec compliance review (`bmad-bmm-code-review`); Stage 2: code quality review; handle human comments; merge | Merged PRs, story status: `done` | PRs merged to main |
| 9 · Retrospective | Ship (conditional) | All agents | Epic fully complete | Wins, blockers, process improvements, action items | `_bmad-output/implementation-artifacts/epic-{n}-retro-{date}.md` | Retro doc saved |

---

## Key Artifact Paths

| Artifact | Path |
|----------|------|
| Sprint status | `_bmad-output/implementation-artifacts/sprint-status.yaml` |
| Story files | `_bmad-output/implementation-artifacts/story-{epic}-{num}-{slug}.md` |
| Implementation plans | `docs/plans/{date}-{story-key}-plan.md` |
| UX wireframes | `_bmad-output/planning-artifacts/ux-{story-key}-wireframe.html` |
| UX validation reports | `_bmad-output/ux-validation/{story-key}/ux-validation-report.md` |
| Retrospectives | `_bmad-output/implementation-artifacts/epic-{n}-retro-{date}.md` |
| Epics | `_bmad-output/planning-artifacts/epics.md` |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` |

---

## Story File Key Sections

Each story file (`story-{epic}-{num}-{slug}.md`) contains:

| Section | Purpose |
|---------|---------|
| **Status** | Current lifecycle status (`backlog` → `ready-for-dev` → `in-progress` → `review` → `done`) |
| **Story** | User story statement and business context |
| **Acceptance Criteria** | Verifiable AC items; marked `IMPLEMENTED` after Phase 7 |
| **Tasks / Subtasks** | Checkbox list consumed by Phase 4; all must be `[x]` before Phase 5 |
| **Dev Notes** | Architecture constraints, split-brain rules, API contracts |
| **UX Design Reference** | Path to wireframe HTML (triggers Phase 2B and 5B gates) |
| **Dev Agent Record** | Debug log, completion notes, file list (written by Amelia in Phase 4) |
| **Code Review Record** | Findings and resolutions from Phase 8 two-stage review |

---

## Slash Command Quick Reference

| Command | Session / Phase | Purpose |
|---------|----------------|---------|
| `/bmad-bmm-sprint-planning` | Pre-Discovery | Initialize `sprint-status.yaml` from epics |
| `/bmad-bmm-sprint-status` | Any | Summarize current sprint progress and surface risks |
| `/bmad-mmm-create-story` | Session 1 — Phases 1–3 | Full Discovery: prioritize, clarify requirements, optional wireframe, implementation plan |
| `/bmad-bmm-dev-story` | Session 2 — Phases 4–5B | Full Build: TDD implementation + QA integration + optional UX validation |
| `/bmad-bmm-code-review` | Session 3 — Phase 8 | Adversarial two-stage PR review |
| `/bmad-bmm-retrospective` | Session 3 — Phase 9 | Epic retrospective (trigger only when epic is fully done) |
| `/bmad-bmm-correct-course` | Any | Mid-implementation course correction when plan or requirements drift |

For the full agent roster, see [CLAUDE.md](../CLAUDE.md#bmad-agents).
