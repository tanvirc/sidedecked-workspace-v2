# AGENTS.md — SideDecked

Cross-tool agent index for Codex CLI, Cursor, Windsurf, and other AI IDEs.
For Claude Code, use slash commands (e.g., `/bmad-agent-bmm-dev`). Agent files: `.claude/commands/`.

---

## Agent Directory

| Agent ID | Title | Use Cases | File |
|---|---|---|---|
| `bmm-analyst` | Business Analyst (Mary) | Market research, discovery, competitive analysis | `.claude/commands/bmad-agent-bmm-analyst.md` |
| `bmm-architect` | Architect (Winston) | System design, architecture docs, integration planning | `.claude/commands/bmad-agent-bmm-architect.md` |
| `bmm-pm` | Product Manager (John) | PRDs, epics, product strategy, roadmap | `.claude/commands/bmad-agent-bmm-pm.md` |
| `bmm-sm` | Scrum Master (Bob) | Story creation, sprint planning, epic orchestration | `.claude/commands/bmad-agent-bmm-sm.md` |
| `bmm-dev` | Developer (Amelia) | TDD implementation, story execution | `.claude/commands/bmad-agent-bmm-dev.md` |
| `bmm-qa` | QA (Quinn) | Test automation, quality gates, coverage | `.claude/commands/bmad-agent-bmm-qa.md` |
| `bmm-ux-designer` | UX Expert | Storefront/vendorpanel UX, wireframes | `.claude/commands/bmad-agent-bmm-ux-designer.md` |
| `bmm-tech-writer` | Tech Writer | Docs, CHANGELOG, architecture updates | `.claude/commands/bmad-agent-bmm-tech-writer.md` |
| `bmad-master` | BMad Master | Cross-agent orchestration, workflow execution | `.claude/commands/bmad-agent-bmad-master.md` |

---

## Pre-Implementation Protocol (MANDATORY)

Complete before writing any code:

**1. Load core context**
```bash
cat AGENTS.md
cat docs/standards/code-standards.md
cat docs/standards/testing-standards.md
cat docs/architecture/02-architectural-principles.md
```

**2. Read task-specific architecture docs**

| Task type | Read first |
|---|---|
| New feature | `docs/architecture/03-domain-models.md`, `04-architectural-patterns.md` |
| API change | `docs/architecture/06-integration-architecture.md` |
| Database change | `docs/architecture/05-data-architecture.md` |
| Authentication | `docs/architecture/07-authentication-architecture.md` |

**3. Verification checklist**
- [ ] Correct bounded context identified
- [ ] Correct database selected (mercur-db vs sidedecked-db)
- [ ] Similar implementations reviewed
- [ ] Testing plan defined (TDD, >80% coverage)
- [ ] Documentation updates identified

**4. Domain routing**

| Domain | Repo | Database |
|---|---|---|
| Commerce (orders, payments, vendors) | `backend/` | `mercur-db` |
| Catalog, Decks, Community, Pricing | `customer-backend/` | `sidedecked-db` |
| Customer UI | `storefront/` | — |
| Vendor UI | `vendorpanel/` | — |

---

## BMAD Full Planning Path

```
1. Create Product Brief    → define problem + MVP scope
2. Create PRD              → full requirements with personas
3. Create Architecture     → technical design decisions
4. Create Epics & Stories  → prioritized work breakdown
5. Sprint Planning         → initialize story tracking
6. Per story: dev-story → code-review
```

Quick path (bugs/small features): `quick-spec` → `dev-story` → `code-review`

---

## Epic Status

| # | Epic | Status |
|---|---|---|
| 01 | Authentication & User Management | completed |
| 02 | Commerce & Marketplace | completed |
| 03 | TCG Catalog & Card Database | completed |
| 04 | Vendor Management System | in_progress |
| 05 | Deck Building System | completed |
| 06 | Community & Social | not_started |
| 07 | Pricing Intelligence | not_started |
| 08 | Search & Discovery | not_started |
| 09 | Inventory Management | not_started |
| 10 | Payment Processing | not_started |

```bash
node scripts/next-spec.js                                              # current work
node scripts/check-acceptance-criteria.js --id epic-04-vendor-management
node scripts/check-acceptance-criteria.js --id epic-04-vendor-management --next-story
node scripts/mark-spec.js --id epic-04-vendor-management --status completed
```

---

## Quality Gates

```bash
# Run in each affected repo before marking any story complete
npm run lint && npm run typecheck && npm run build && npm test

# Coverage must be >80% on changed modules
npm run test:coverage
```

Performance targets: API < 100ms p95 · DB queries < 50ms

---

## Commits

Format: `type(scope): description` — conventional commits, present tense, no period.

**Forbidden everywhere:**
- `Claude`, `Co-Authored-By: Claude`, `Generated with`, robot emojis
- TODO comments — open a GitHub issue instead
