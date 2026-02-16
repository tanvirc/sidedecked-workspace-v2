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

## Specification Status

Current work: **04-vendor-management-system** (in progress)

| # | Specification | Status |
|---|---|---|
| 01 | Authentication & User Management | ✅ Complete |
| 02 | Commerce & Marketplace | ✅ Complete |
| 03 | TCG Catalog & Card Database | ✅ Complete |
| 04 | Vendor Management System | 🔄 In Progress |
| 05 | Deck Building System | ✅ Complete |
| 06 | Community & Social | ⏳ Not Started |
| 07 | Pricing Intelligence | ⏳ Not Started |
| 08 | Search & Discovery | ⏳ Not Started |
| 09 | Inventory Management | ⏳ Not Started |
| 10 | Payment Processing | ⏳ Not Started |

Spec files: `docs/specifications/XX-*.md`

When starting a spec: mark `in_progress` in `module-status.json` + TaskCreate.
When completing a spec: verify docs updated → update `module-status.json` → mark complete.

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
