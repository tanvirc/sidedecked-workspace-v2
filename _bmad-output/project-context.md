---
project_name: 'sidedecked'
user_name: 'Tav'
date: '2026-02-24'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 78
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Monorepo Structure (5 sub-repos, NOT a single monorepo tool)

| Sub-Repo | Framework | Runtime | DB |
|---|---|---|---|
| `backend/` | MedusaJS v2.8.8-snapshot (MercurJS) | Node 20+ | mercur-db (PostgreSQL) |
| `customer-backend/` | Express 4.18.2 + TypeORM 0.3.17 | Node 20+ | sidedecked-db (PostgreSQL) |
| `storefront/` | Next.js 15.5.12 + React 19 | Node 20+ | — |
| `vendorpanel/` | React 18.2.0 + Vite 5.4.14 | Node 20+ | — |
| `discord-bot/` | discord.js 14.16.0 + Express 4.21.0 | Node 20+ | — |

### Key Dependency Versions (per sub-repo)

**backend/** (Turborepo monorepo internally: `apps/backend` + `packages/modules/*`)
- MedusaJS: 2.8.8-snapshot-20250714090316
- MikroORM: 6.4.3 (PostgreSQL + migrations)
- TypeScript: 5.6.2 (target ES2021, module Node16)
- Jest: 29.7.0 + SWC transpiler
- Stripe: 17.4.0
- Zod: 3.25.76

**customer-backend/** (workspaces: `packages/{shared,tcg-catalog,types}`)
- TypeORM: 0.3.17 (31 entities, migration-first)
- TypeScript: 5.9.2 (target ES2022, module CommonJS)
- Jest: 29.6.4 + ts-jest
- Bull: 4.11.3 (Redis job queues)
- Sharp: 0.32.5 (image processing)
- ioredis: 5.3.2

**storefront/**
- Next.js: 15.5.12 (App Router, Turbopack dev)
- React: 19.0.0
- TypeScript: 5.x (target ES2017, module ESNext, bundler resolution)
- Vitest: 4.0.18 + Testing Library
- Tailwind CSS: 3.4.1 (custom Midnight Forge design tokens)
- Medusa JS SDK: 2.2.0
- Algolia: react-instantsearch 7.15.3

**vendorpanel/**
- React: 18.2.0
- Vite: 5.4.14
- TypeScript: 5.2.2 (target ES2020, module ESNext, bundler resolution)
- Vitest: 3.0.5 + Testing Library
- Tailwind CSS: 3.4.1 (Medusa UI preset — no custom tokens)
- TanStack Query: 5.64.2
- Medusa UI: 4.0.5

**discord-bot/**
- discord.js: 14.16.0
- TypeScript: 5.5.0 (ESM, tsx for dev)
- Vitest: 2.0.0

### Shared External Services
- PostgreSQL: 2 separate databases (split-brain)
- Redis: shared cache + pub/sub + job queues
- Algolia: unified search index
- Stripe Connect: split payments
- MinIO: S3-compatible object storage
- Resend: transactional email
- TalkJS: buyer-seller messaging

## Critical Implementation Rules

### Language-Specific Rules

**TypeScript Configuration Varies Per Sub-Repo — Match the Target:**
- `backend/`: ES2021, Node16 module, `strictNullChecks` (not full `strict`), path alias `#/*` → `src/*`
- `customer-backend/`: ES2022, CommonJS module, full `strict`, decorators required (TypeORM), path aliases `@sidedecked/*`
- `storefront/`: ES2017, ESNext/bundler, full `strict`, path alias `@/*` → `src/*`
- `vendorpanel/`: ES2020, ESNext/bundler, full `strict` + `noUnusedLocals` + `noUnusedParameters`, no path aliases

**Import/Export Patterns:**
- `backend/`: Use `import { X } from '@medusajs/framework/...'` — MedusaJS re-exports. Default exports for services/modules. Path alias: `import X from '#/path'`
- `customer-backend/`: CommonJS-compatible imports. TypeORM decorators (`@Entity`, `@Column`, etc.). Path aliases: `import { X } from '@sidedecked/types'`
- `storefront/`: ESM imports. `"use client"` directive required for client components. `@/` path alias throughout
- `vendorpanel/`: ESM imports. Global defines via Vite (`__BACKEND_URL__`, `__CUSTOMER_BACKEND_URL__`, etc.) — NOT `process.env`

**Prettier Style Divergence (critical — agents WILL get this wrong):**
- `backend/`: single quotes, no semicolons, import sorting via `@trivago/prettier-plugin-sort-imports` (MedusaJS → MercurJS → local)
- `storefront/`: double quotes, no semicolons, trailing comma ES5
- `vendorpanel/`: double quotes, no semicolons, trailing comma ES5
- `customer-backend/`: no .prettierrc found — follow ESLint rules

**Error Handling:**
- `backend/`: MedusaJS throws `MedusaError` — use framework error types, not custom Error classes
- `customer-backend/`: Express error middleware pattern — throw errors, catch in middleware. Circuit breaker via `opossum` for external API calls
- `storefront/`: React Error Boundaries + `sonner` toast notifications for user-facing errors
- `vendorpanel/`: TanStack Query error handling + toast notifications

### Framework-Specific Rules

**MedusaJS v2 / MercurJS (backend/) — Most Error-Prone:**
- Use `MedusaStoreRequest` (NOT `MedusaRequest`) for store API routes
- Module config uses object format: `{ resolve: './src/modules/auth' }` (NOT string `'./modules/auth'`)
- Service classes use `export default ServiceClass` (default export required)
- Model defaults use literal values: `model.text().default('value')` (NOT `() => new Date()`)
- Update entities with object ID: `updateEntity({ id: 'entity_id' }, data, context)` (NOT positional args)
- Use `undefined` not `null` for absent values: `{ authIdentity: undefined }`
- Never declare `created_at` / `updated_at` on models — they are implicit
- Single service per module registration (NOT arrays `[Service1, Service2]`)
- MercurJS modules follow identical structure: `src/index.ts` (Module export), `src/service.ts` (extends MedusaService), MikroORM migrations
- 19 MercurJS modules in `backend/packages/modules/` — all `@mercurjs/*` scoped

**TypeORM (customer-backend/) — Entity Patterns:**
- All entities use decorator pattern: `@Entity('table_name')` with explicit table names
- Primary keys: `@PrimaryGeneratedColumn('uuid')`
- Soft deletes via `@DeleteDateColumn({ name: 'deleted_at' })`
- Timestamps: `@CreateDateColumn({ name: 'created_at' })`, `@UpdateDateColumn({ name: 'updated_at' })`
- Column names use snake_case in DB, camelCase in TypeScript
- `synchronize: false` always — use migrations only (`npm run migration:generate`, `npm run migration:run`)
- Connection pool: max 10 (Railway constraint), min 2, with retry logic

**Next.js 15 App Router (storefront/):**
- Route groups: `[locale]/(main)/`, `[locale]/(checkout)/`, `[locale]/(auth)/` for layout separation
- `"use client"` directive required for any component using hooks, event handlers, or browser APIs
- Server components are the default — keep data fetching in server components
- Medusa SDK (`src/lib/config.ts`) is the single commerce API client
- Customer backend client at `src/lib/api/customer-backend.ts` for TCG/community data
- Design system: custom CSS variable tokens (Midnight Forge) — NOT Medusa UI preset
- Global providers stack in `src/app/providers.tsx` (9 nested providers)
- Image optimization: blurhash placeholders, multi-source remote patterns in `next.config.ts`

**React + Vite SPA (vendorpanel/):**
- Uses Medusa UI component library (`@medusajs/ui`) + Medusa UI Tailwind preset
- TanStack Query for all server state — centralized query keys in `src/lib/query-key-factory.ts`
- react-hook-form + Zod for all forms — resolvers in `@hookform/resolvers`
- Route-based code splitting via `react-router-dom`
- Admin extensions via `@medusajs/admin-vite-plugin`
- Global constants injected by Vite: `__BACKEND_URL__`, `__CUSTOMER_BACKEND_URL__`, `__STOREFRONT_URL__`, etc.
- i18n via `i18next` with browser language detection

### Testing Rules

**Testing Framework Split — Use the Right Runner:**

| Sub-Repo | Runner | Transpiler | Environment | Config |
|---|---|---|---|---|
| `backend/` | Jest 29.7.0 | @swc/jest | node | `backend/apps/backend/jest.config.js` |
| `customer-backend/` | Jest 29.6.4 | ts-jest | node | `customer-backend/jest.config.js` |
| `storefront/` | Vitest 4.0.18 | @vitejs/plugin-react | jsdom | `storefront/vitest.config.ts` |
| `vendorpanel/` | Vitest 3.0.5 | @vitejs/plugin-react | jsdom | vendorpanel (inline or config) |
| `discord-bot/` | Vitest 2.0.0 | tsx | node | `discord-bot/vitest.config.ts` |

**Backend Test Organization (Jest — 3 test types via TEST_TYPE env):**
- `integration:http` → `**/integration-tests/http/*.spec.[jt]s` — full HTTP route tests
- `integration:modules` → `**/src/modules/*/__tests__/**/*.[jt]s` — module-level tests
- `unit` → `**/tests/**/*.unit.spec.[jt]s` or `**/src/**/__tests__/**/*.unit.spec.[jt]s`
- Run with: `npm run test:unit`, `npm run test:integration:http`, `npm run test:integration:modules`
- All use `--runInBand --forceExit` (serial execution, force exit after completion)

**Customer-Backend Test Organization (Jest):**
- Test files in `src/__tests__/**/*.ts` and `src/**/*.test.ts`
- Coverage excludes: migrations, scripts, workers, `.d.ts` files
- Module path aliases mapped in jest config to match `@sidedecked/*` imports

**Storefront Test Organization (Vitest):**
- Setup file: `src/test/setup.ts`
- `server-only` module mocked via alias in vitest config
- Coverage: v8 provider, excludes `node_modules/`, `src/test/`, config files, `__tests__/`, `mockData/`
- Globals enabled — `describe`, `it`, `expect` available without imports

**Coverage Requirement:** >80% across all sub-repos

**TDD Workflow (per CLAUDE.md):** Failing test → minimal code → pass → refactor → verify 80% coverage

### Code Quality & Style Rules

**ESLint Configuration Per Sub-Repo:**
- `backend/`: Flat config (`eslint.config.mjs`) — `@typescript-eslint/no-explicit-any`: warn, `no-unused-vars`: error (ignore `_`, `__`), test files exempt from `no-require-imports`
- `storefront/`: Flat config (`eslint.config.js`) — `next/core-web-vitals` base, `react-hooks/exhaustive-deps`: warn, `@next/next/no-img-element`: warn
- `vendorpanel/`: Flat config (`eslint.config.mjs`) — many TS rules set to warn (not error): `no-explicit-any`, `ban-ts-comment`, `no-unused-expressions`. Unused vars error with `_` prefix ignored
- `customer-backend/`: ESLint with TypeScript plugins (standard config)

**File & Folder Naming:**
- `backend/`: kebab-case for files, PascalCase for classes/models, camelCase for functions/variables
- `customer-backend/`: PascalCase for entity files (`Card.ts`, `Deck.ts`), kebab-case for services/routes
- `storefront/`: PascalCase for components (`CardDisplay.tsx`), kebab-case for routes/utilities
- `vendorpanel/`: kebab-case for files and folders throughout (matches MedusaJS admin convention)

**Code Organization Patterns:**
- `backend/`: `src/api/` (routes), `src/modules/` (custom modules), `src/links/` (cross-module associations), `src/workflows/` (multi-step processes), `src/subscribers/` (event handlers), `src/jobs/` (cron)
- `customer-backend/`: `src/entities/` (TypeORM), `src/services/` (business logic via ServiceContainer singleton), `src/routes/` (Express), `src/workers/` (background jobs), `src/config/` (infrastructure)
- `storefront/`: `src/app/` (App Router pages), `src/components/` (React — organized by domain: `tcg/`, `cards/`, `search/`, `auth/`, `ui/`), `src/hooks/`, `src/lib/`, `src/contexts/`
- `vendorpanel/`: `src/routes/` (page components), `src/components/` (reusable UI), `src/hooks/api/` (45+ TanStack Query hooks), `src/providers/` (context providers), `src/lib/` (utilities)

**Quality Gate — Run Before Every Commit (per affected sub-repo):**
```bash
npm run lint && npm run typecheck && npm run build && npm test
```

### Development Workflow Rules

**Commit Message Format:** `type(scope): description` — conventional commits, present tense, no period
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`
- Scope: sub-repo or feature area (e.g., `backend`, `storefront`, `auth`, `tcg-catalog`)

**Branch Strategy:**
- Main branch: `main`
- Feature branches from `main`
- PR-based workflow with quality gate checks

**Development Servers:**
- `backend/`: `:9000` — `cd backend && npm run dev`
- `customer-backend/`: `:7000` — `cd customer-backend && npm run dev`
- `storefront/`: `:3000` — `cd storefront && npm run dev`
- `vendorpanel/`: `:5173` — `cd vendorpanel && npm run dev`

**Database Migrations:**
- `backend/`: `npm run db:migrate --workspace=apps/backend` (MedusaJS CLI, MikroORM under the hood)
- `customer-backend/`: `npm run migration:run` (TypeORM CLI)
- Never use `synchronize: true` — always generate and run migrations

**BMAD Workflow (project management):**
- Epic files: `docs/epics/epic-NN-*.md` with `**Status**:` field
- Story files: `docs/stories/story-NN-M-*.md` with acceptance criteria tagged `(NOT BUILT)` / `(IN PROGRESS)` / `(IMPLEMENTED)`
- Sprint status: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Planning artifacts: `_bmad-output/planning-artifacts/`

**Deployment:** Railway (resource-constrained — DB pool max 10, single-region)

### Critical Don't-Miss Rules

**Split-Brain Database — THE #1 Rule:**
- `backend/` (MercurJS) → `mercur-db` — orders, payments, vendors, products, carts
- `customer-backend/` → `sidedecked-db` — cards, decks, community, pricing, user profiles
- NEVER create direct DB connections between them — API calls only
- Cross-service auth: shared JWT secret + `SERVICE_API_KEY` for backend-to-backend calls
- Data that exists in both (e.g., product ↔ card mapping): synced via Redis pub/sub, eventual consistency

**Forbidden in ALL Output (code, docs, commits):**
- AI references: "Claude", "Co-Authored-By: Claude", "Generated with", robot emojis
- TODO comments — open a GitHub issue instead
- Mock/stub data in production code
- `console.log` left in production code

**Anti-Patterns to Avoid:**
- `backend/`: Using `MedusaRequest` instead of `MedusaStoreRequest` for store routes
- `backend/`: String module paths (`'./modules/auth'`) instead of object (`{ resolve: './src/modules/auth' }`)
- `backend/`: `null` instead of `undefined` for absent auth values
- `customer-backend/`: `synchronize: true` in TypeORM config
- `customer-backend/`: Direct imports across package boundaries — use `@sidedecked/*` aliases
- `storefront/`: Missing `"use client"` directive on interactive components
- `storefront/`: Using Medusa UI preset colors — use Midnight Forge CSS variable tokens
- `vendorpanel/`: Using `process.env` — use Vite global defines (`__BACKEND_URL__`, etc.)
- All repos: Mixing mercur-db and sidedecked-db data in the same query/service

**Security Rules:**
- Input validation at system boundaries (Zod for backend, express-validator for customer-backend)
- Parameterized queries only — never string-interpolate SQL
- Rate limiting on all public endpoints (`express-rate-limit`)
- CORS configured per service (backend STORE_CORS, ADMIN_CORS, VENDOR_CORS, AUTH_CORS)
- JWT secrets from environment variables — never hardcoded beyond dev defaults
- OAuth2 with PKCE for customer authentication

**Performance Constraints (Railway):**
- DB connection pool: max 10 per service
- API response: < 100ms p95
- DB queries: < 50ms
- Use multi-layer caching: L1 in-memory → L2 Redis → L3 CDN (Cloudflare)
- Algolia for search — never full-table scans for user-facing search
- Image processing via Sharp + blurhash — never serve unoptimized images

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Match code style to the specific sub-repo you are working in

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-02-24
