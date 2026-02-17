# SideDecked — Claude Code Instructions

## Behavioral Guidelines

Before implementing anything:

- **Think before coding** — state assumptions explicitly; if multiple interpretations exist, present them; ask when unclear
- **Simplicity first** — minimum code that solves the problem; no speculative features, abstractions, or error handling for impossible scenarios
- **Surgical changes** — touch only what the request requires; match existing style; mention but don't delete unrelated dead code
- **Goal-driven execution** — define verifiable success criteria before starting; for multi-step tasks, state a brief plan with verify steps

Bias toward caution over speed. For trivial tasks, use judgment.

---

## Architecture

SideDecked is a split-brain TCG marketplace — **two databases, never directly connected**.

```
sidedecked/
├── backend/           # MedusaJS v2 (MercurJS)   →  mercur-db      (orders, payments, vendors)
├── customer-backend/  # Node.js + TypeORM         →  sidedecked-db  (cards, decks, community, pricing)
├── storefront/        # Next.js 14                →  API consumer
└── vendorpanel/       # React 18 + Vite           →  API consumer
```

Cross-database communication happens **only via APIs** — never direct DB connections.

---

## Rules

**Always:**
- Write tests first (TDD): failing test → minimal code → pass → refactor → 80% coverage
- Use existing frameworks/libraries before writing custom code
- Search the codebase for similar implementations before starting
- Write complete implementations — no `// TODO`, no stub `return null`
- Update README.md, CHANGELOG.md, and relevant architecture docs when completing a spec
- Run `npm run lint && npm run typecheck && npm run build && npm test` before every commit

**Never:**
- Mix mercur-db and sidedecked-db data or create direct connections between them
- Add AI references in code, docs, or commits ("Claude", "Co-Authored-By: Claude", 🤖)
- Leave TODO comments — convert to GitHub issues
- Use mock/stub data in production code
- Skip the quality gate: lint + typecheck + build + test must all pass

---

## Tech Stack

| Component | Use | Never |
|---|---|---|
| Commerce backend | MedusaJS v2 (MercurJS) | Custom commerce |
| Customer backend | Node.js + TypeORM | Prisma, custom ORM |
| Database | PostgreSQL | MongoDB, SQLite |
| Frontend | Next.js 14 + React | Vue, Angular |
| Auth | OAuth2 + JWT | Sessions, custom auth |
| Payments | Stripe Connect | Custom payment |
| Search | Algolia | Elasticsearch |
| Cache | Redis | In-memory cache |
| Storage | MinIO (S3-compatible) | Local filesystem |
| Email | Resend | SMTP, custom email |
| Testing | Vitest + Jest | Mocha |

---

## MedusaJS v2 Patterns

```typescript
// ✅ CORRECT
import { MedusaStoreRequest, MedusaResponse } from '@medusajs/framework/http'
updateEntity({ id: 'entity_id' }, updateData, context)  // object ID
export default ServiceClass                              // default export
model.text().default('literal_value')                   // literal default
{ resolve: './src/modules/auth' }                       // object format
{ success: true, authIdentity: undefined }              // undefined not null

// ❌ FORBIDDEN
MedusaRequest                  // use MedusaStoreRequest
'./modules/auth'               // use { resolve: }
() => new Date()               // use literal values
authIdentity: null             // use undefined
[Service1, Service2]           // single service only
created_at, updated_at        // implicit fields, don't declare
```

---

## Quality Gates

```bash
# Before every commit (run in each affected repo)
npm run lint && npm run typecheck && npm run build && npm test

# Coverage check (must be >80%)
npm run test:coverage
```

Performance targets: API < 100ms p95 · DB queries < 50ms · TypeScript strict · ESLint 0 errors

---

## Commits

Format: `type(scope): description` — conventional commits, present tense, no period.

**Forbidden everywhere (code, docs, commits):**
- AI references: "Claude", "Co-Authored-By: Claude", "Generated with"
- Robot emojis 🤖
- TODO comments (open a GitHub issue instead)

---

## BMAD Agents

Invoke any agent as a slash command (e.g., `/bmad-agent-bmm-dev`).

| Slash Command | Agent | Role |
|---|---|---|
| `/bmad-agent-bmm-analyst` | Mary — Business Analyst | Market research, discovery, competitive analysis |
| `/bmad-agent-bmm-architect` | Winston — Architect | System design, architecture docs, integration planning |
| `/bmad-agent-bmm-pm` | John — Product Manager | PRDs, epics, product strategy |
| `/bmad-agent-bmm-sm` | Bob — Scrum Master | Story creation, sprint planning, epic orchestration |
| `/bmad-agent-bmm-dev` | Amelia — Developer | TDD implementation, story execution, code review |
| `/bmad-agent-bmm-qa` | Quinn — QA | Test automation, quality gates, coverage analysis |
| `/bmad-agent-bmm-devops` | Rex — DevOps | Railway deployment, CI/CD, infrastructure automation |
| `/bmad-agent-bmm-ux-designer` | UX Expert | Storefront/vendorpanel UX, wireframes |
| `/bmad-agent-bmm-tech-writer` | Tech Writer | Docs, CHANGELOG, architecture updates |
| `/bmad-agent-bmad-master` | BMad Master | Cross-agent orchestration, workflow execution |

Agent customizations (SideDecked context): `_bmad/_config/agents/`

---

## BMAD Full Planning Path

For new epics or complex features, follow this path in order:

```
1. /bmad-bmm-create-product-brief    → define problem + MVP scope
2. /bmad-bmm-create-prd              → full requirements + personas
3. /bmad-bmm-create-architecture     → technical design decisions
4. /bmad-bmm-create-epics-and-stories → prioritized work breakdown
5. /bmad-bmm-sprint-planning         → initialize story tracking
6. Per story: /bmad-bmm-dev-story → /bmad-bmm-code-review
```

For a single story end-to-end (all agents, approval gates between phases): `/bmad-bmm-story-lifecycle`

For bug fixes and small features: `/bmad-bmm-quick-spec` → `/bmad-bmm-dev-story` → `/bmad-bmm-code-review`

BMAD outputs: `_bmad-output/planning-artifacts/` (PRDs, architecture) · `_bmad-output/implementation-artifacts/` (stories, QA)

---

## Epic Status

Status is owned by BMAD — not this file. Use these to check or update it:

- `/bmad-bmm-sprint-planning` — generate/refresh `_bmad-output/implementation-artifacts/sprint-status.yaml` from epic files
- `/bmad-bmm-sprint-status` — summarize current epic/story status and surface risks
- `/bmad-agent-bmm-sm` — Scrum Master menu (create stories, track progress, plan sprints)

Epic source files: `docs/epics/epic-NN-*.md` (each has a `**Status**:` header field)
Story source files: `docs/stories/story-NN-M-*.md` (acceptance criteria tagged with `(NOT BUILT)` / `(IN PROGRESS)` / `(IMPLEMENTED)`)

```bash
node scripts/check-acceptance-criteria.js --id epic-01-authentication-user-management           # show incomplete criteria
node scripts/check-acceptance-criteria.js --id epic-01-authentication-user-management --next-story  # first incomplete story
```

---

## Architecture Docs Reference

Read the relevant doc **before** starting. All in `docs/architecture/`.

| Task Type | Read First |
|---|---|
| New feature | `03-domain-models.md`, `04-architectural-patterns.md` |
| API change | `06-integration-architecture.md` |
| Database change | `05-data-architecture.md` |
| Authentication | `07-authentication-architecture.md` |
| Any feature | `02-architectural-principles.md` |

---

## Development Setup

```bash
# Start all services
cd backend && npm run dev            # :9000
cd customer-backend && npm run dev   # :7000
cd vendorpanel && npm run dev        # :5173
cd storefront && npm run dev         # :3000

# Run migrations
cd backend && npm run db:migrate --workspace=apps/backend
cd customer-backend && npm run migration:run
```
