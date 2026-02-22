---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-02-22'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/prd-validation-report.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - docs/architecture/01-system-overview.md
  - docs/architecture/02-architectural-principles.md
  - docs/architecture/03-domain-models.md
  - docs/architecture/04-architectural-patterns.md
  - docs/architecture/05-data-architecture.md
  - docs/architecture/06-integration-architecture.md
  - docs/standards/code-standards.md
  - docs/standards/documentation-standards.md
  - docs/standards/testing-standards.md
  - docs/standards/commit-standards.md
  - docs/API-REFERENCE.md
  - docs/CLOUDFLARE-CDN-SETUP.md
  - docs/DEPLOYMENT-GUIDE.md
  - docs/TCG-CATALOG-IMPLEMENTATION.md
  - docs/USER-DECK-GUIDE.md
  - docs/production-deployment-guide.md
  - docs/storefront-sitemap.md
workflowType: 'architecture'
project_name: 'sidedecked'
user_name: 'Tav'
date: '2026-02-22'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

61 functional requirements spanning 7 domains:

| Domain | Key Architectural Implications |
|---|---|
| **Authentication & User Management** | Shared JWT across two backends, OAuth2 providers, role-based access (buyer/seller/vendor/admin) |
| **Product Catalog & Search** | Universal TCG schema with game-specific JSONB extensions, Algolia indexing from both databases, SKU format: `{GAME}-{SET}-{NUMBER}-{LANG}-{CONDITION}-{FINISH}` |
| **Deck Building & Management** | Real-time card search, zone-based deck structure, game-specific validation rules, import/export formats |
| **Cart & Checkout** | Deck-to-cart optimizer — cross-database queries matching deck cards to multi-vendor inventory with price/shipping optimization, Stripe Connect split payments |
| **Vendor Management** | MercurJS multi-vendor with storefronts, commission tiers, inventory management, analytics dashboards |
| **Community Features** | User profiles, deck sharing, social interactions — all in sidedecked-db |
| **Admin/Platform Management** | Cross-service admin operations, vendor approval workflows, platform analytics |

**Non-Functional Requirements:**

| NFR | Target | Architectural Impact |
|---|---|---|
| API Response Time | < 100ms P95 | Multi-layer caching (L1 in-memory, L2 Redis, L3 CDN), query optimization |
| DB Query Time | < 50ms | Indexed queries, materialized views, connection pooling (max 10 on Railway) |
| Time to Interactive | < 2s | SSR with Next.js App Router, code splitting, edge caching |
| Concurrent Users | 100 at launch | Horizontal scaling readiness, stateless services |
| Test Coverage | > 80% | TDD workflow, Vitest + Jest + Playwright |
| TypeScript | Strict mode | End-to-end type safety across all services |

**Scale & Complexity:**

- Primary domain: Full-stack multi-vendor TCG marketplace
- Complexity level: **High**
- Estimated architectural components: 5 services (backend, customer-backend, storefront, vendorpanel, workers) + 6 external integrations (Stripe, Algolia, Redis, MinIO, Resend, PostgreSQL x2)

### Technical Constraints & Dependencies

| Constraint | Source | Impact |
|---|---|---|
| Split-brain database | Core architecture decision | All cross-domain communication via APIs/events only — no direct DB joins |
| MercurJS (Medusa v2 fork) | Backend framework choice | Commerce patterns locked to Medusa conventions (TransactionBaseService, atomicPhase_, specific request types) |
| Railway deployment | Infrastructure choice | DB pool max 10, resource-aware scaling, single-region initial deployment |
| Node.js v20+ | Runtime requirement | ESM modules, native fetch, performance APIs |
| OAuth provider conflict | PRD vs UX mismatch | PRD specifies Google/GitHub; UX specifies Google/Discord/Apple — needs resolution |
| 4 TCG games at MVP | Product scope | Universal schema must handle MTG, Pokémon, Yu-Gi-Oh!, One Piece with game-specific extensions |

### Cross-Cutting Concerns Identified

| Concern | Affected Components | Strategy |
|---|---|---|
| **Authentication** | All services | Shared JWT secret, OAuth2 flow, role-based middleware on each service |
| **Data Consistency** | backend ↔ customer-backend | Event-driven sync via Redis pub/sub, eventual consistency model |
| **Search** | storefront, customer-backend, backend | Algolia as unified index, dual-source indexing pipeline |
| **Caching** | All services | L1 in-memory (per-process), L2 Redis (shared), L3 CDN (Cloudflare) |
| **Error Handling** | Cross-service calls | Circuit breaker pattern, graceful degradation, structured error responses |
| **Observability** | All services | Structured logging, health checks, performance monitoring |
| **Security** | All services | Input validation at boundaries, parameterized queries, CORS, rate limiting |

## Starter Template Evaluation

### Primary Technology Domain

Full-stack multi-vendor TCG marketplace — 4 independent service repositories with established starters already in use.

### Existing Foundations (Already Established)

| Service | Foundation | Current State |
|---|---|---|
| **backend** | MercurJS (MedusaJS v2 fork) | Multi-vendor commerce platform with plugins, modules, and marketplace extensions |
| **customer-backend** | Node.js + TypeORM (NestJS-style) | Monorepo with packages for cards, decks, pricing, community |
| **storefront** | Next.js 14 (App Router) | SSR/CSR hybrid with shadcn/ui + Tailwind, "Midnight Forge" theme |
| **vendorpanel** | React 18 + Vite | SPA with vendor management dashboard |

### Architectural Decisions Provided by Foundations

**Language & Runtime:**
- TypeScript strict mode across all services
- Node.js v20+ (ESM modules, native fetch)
- No mixed JavaScript — all TS end-to-end

**Styling Solution:**
- Tailwind CSS + shadcn/ui component library
- CSS variables for theming (dark-first "Midnight Forge")
- Game-specific rarity token colors via JSONB extensions

**Build Tooling:**
- Next.js built-in (storefront) — Turbopack dev, Webpack prod
- Vite (vendorpanel) — fast HMR, Rollup production builds
- MedusaJS CLI (backend) — module compilation, migration tooling
- TypeORM CLI (customer-backend) — migration generation and execution

**Testing Framework:**
- Vitest + Jest (unit/integration)
- React Testing Library (components)
- MSW (API mocking)
- Playwright (E2E)
- 80%+ coverage requirement enforced

**Code Organization:**
- Backend: MedusaJS module structure (services, routes, entities, subscribers)
- Customer-backend: Domain-driven packages (cards, decks, pricing, community)
- Storefront: Next.js App Router conventions (app/, components/, lib/, hooks/)
- Vendorpanel: Feature-based folders with shared components

**Development Experience:**
- Hot reloading on all services
- Docker Compose for local PostgreSQL + Redis
- ESLint + Prettier with shared configs
- Quality gate: `lint + typecheck + build + test` before every commit

### Starter Options Considered

Since the project has established foundations, no new starter selection is needed. The architectural evaluation confirms the existing choices align with project requirements:

| Requirement | Foundation Coverage |
|---|---|
| Multi-vendor commerce | MercurJS (purpose-built) |
| Universal TCG catalog | TypeORM with JSONB extensions (flexible schema) |
| SSR + SEO | Next.js 14 App Router (built-in) |
| Real-time features | WebSocket support via both backends |
| Multi-layer caching | Redis (L2) + in-memory (L1) + Cloudflare CDN (L3) |
| Split payments | Stripe Connect (via MercurJS integration) |
| Search | Algolia (dedicated service) |

**Note:** No project initialization story needed — repositories already exist. First implementation stories focus on feature development within established structures.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. OAuth providers: Google + Discord + Apple
2. State management patterns (per-service, already established)
3. Data validation strategy (per-service, already established)

**Important Decisions (Shape Architecture):**
4. API documentation: Hybrid approach
5. Monitoring: Sentry + Railway built-in

**Deferred Decisions (Post-MVP):**
- Apple Sign-In implementation (requires Apple Developer Program enrollment, can launch with Google + Discord first)
- Advanced APM (Datadog or similar if Sentry proves insufficient at scale)

### Authentication & Security

| Decision | Choice | Rationale |
|---|---|---|
| OAuth Providers | Google + Discord + Apple | Google for mainstream, Discord for TCG community hub, Apple for iOS compliance |
| Auth Method | OAuth2 + JWT (shared secret) | Already established — single JWT validated by both backends |
| Authorization | Role-based (buyer/seller/vendor/admin) | Middleware per service, roles in JWT claims |

**Resolves PRD vs UX conflict:** Adopting Google + Discord + Apple (UX spec). GitHub dropped — TCG community users are on Discord, not GitHub.

### Data Architecture

| Decision | Choice | Version | Rationale |
|---|---|---|---|
| Databases | PostgreSQL x2 (split-brain) | 15+ | Already established — mercur-db + sidedecked-db |
| Commerce ORM | MedusaJS built-in (MikroORM) | — | Locked to MercurJS framework |
| Customer ORM | TypeORM | — | Already established |
| Migration Strategy | Framework-native per service | — | MedusaJS CLI (backend), TypeORM CLI (customer-backend) |
| Caching | Multi-layer L1/L2/L3 | — | In-memory → Redis → Cloudflare CDN |

### Data Validation

| Service | Library | Version | Pattern |
|---|---|---|---|
| Backend | Zod | ^3.25 | Schema-based API validators (`validators.ts` per route) |
| Customer-backend | express-validator | ^7.0 | Middleware-based route validation |
| Storefront | Zod + @hookform/resolvers | ^3.24 / ^3.10 | Schema-first form validation (`schema.ts` per form) |
| Vendorpanel | Zod + @hookform/resolvers | 3.22 / 3.4 | Schema-first form validation (`schemas.ts` per route) |

**Rationale:** Each service uses what fits its framework conventions. Zod dominates for TypeScript type inference; express-validator fits customer-backend's Express middleware pattern.

### API & Communication Patterns

| Decision | Choice | Rationale |
|---|---|---|
| API Style | REST (both backends) | MedusaJS convention + established customer-backend routes |
| API Documentation | Hybrid — MedusaJS built-in docs (commerce) + OpenAPI/Swagger (customer-backend) | Each backend documented with its native tooling |
| Error Handling | Structured JSON responses + circuit breaker (cross-service) | Already established pattern |
| Rate Limiting | Per-service middleware | Protect both backends independently |
| Cross-service Communication | Redis pub/sub events + REST API calls | Event-driven sync for eventual consistency |

### Frontend Architecture

| Decision | Service | Choice | Rationale |
|---|---|---|---|
| State Management | Storefront | React Context + custom hooks + Server Components | Minimal dependencies, server-first data fetching, context-per-concern |
| State Management | Vendorpanel | TanStack Query v5 + React Context + react-hook-form | Query key factory, 50+ API hooks, SPA needs client-side caching |
| Component Library | Both | shadcn/ui + Tailwind CSS | Shared design system, "Midnight Forge" theme |
| Routing | Storefront | Next.js App Router | File-based routing with RSC |
| Routing | Vendorpanel | react-router-dom v6 | Client-side SPA routing |
| Forms | Both | react-hook-form + Zod | Consistent form handling across frontends |

**Note:** Storefront and vendorpanel intentionally use different state management — storefront is SSR-heavy (Server Components do the data fetching), vendorpanel is a traditional SPA (TanStack Query caches API responses client-side).

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| Hosting | Railway | Already established, single-region initial deployment |
| CDN | Cloudflare | Static assets + edge caching |
| CI/CD | GitHub Actions | Quality gate: lint → typecheck → build → test |
| Monitoring | Sentry + Railway Observability | Error tracking + performance monitoring (Sentry free tier), logs + metrics (Railway built-in) |
| Storage | MinIO (S3-compatible) | Card images, user uploads |
| Email | Resend | Transactional emails |

### Decision Impact Analysis

**Implementation Sequence:**
1. Authentication (OAuth providers) — blocks all user-facing features
2. Data architecture (schemas, migrations) — blocks domain features
3. API patterns (routes, validation, error handling) — blocks frontend integration
4. Frontend state management — blocks UI feature development
5. Infrastructure (monitoring, CDN) — can be added incrementally

**Cross-Component Dependencies:**
- JWT secret must be identical on backend + customer-backend
- Sentry DSN configured per service (4 separate projects recommended)
- Algolia indexing depends on both databases being operational
- Deck-to-cart optimizer depends on both backends + Redis for real-time inventory

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 5 categories with 20+ areas where AI agents could make different choices. Patterns below lock down each one.

### Naming Patterns

**Database Naming Conventions:**

| Element | Convention | Example |
|---|---|---|
| Tables | snake_case, plural | `cards`, `deck_cards`, `card_sets` |
| Columns | snake_case | `created_at`, `game_id`, `oracle_text` |
| Foreign keys | `{referenced_table_singular}_id` | `card_id`, `vendor_id` |
| Indexes | `idx_{table}_{columns}` | `idx_cards_game_id`, `idx_prints_set_number` |
| JSONB fields | snake_case column name, **camelCase all internal keys** | Column: `game_data`, internal: `{"manaCost": "3U"}` |
| Enums | SCREAMING_SNAKE in DB, PascalCase in TS | DB: `'NEAR_MINT'`, TS: `Condition.NearMint` |

**JSONB Internal Key Examples (per game):**

```json
// MTG
{"manaCost": "3UU", "colorIdentity": ["U"], "power": "4", "toughness": "5", "typeLine": "Creature — Dragon"}

// Pokémon
{"hp": 120, "retreatCost": 2, "weakness": "Lightning", "stage": "Stage 2", "evolvesFrom": "Charmeleon"}

// Yu-Gi-Oh!
{"attackPoints": 2500, "defensePoints": 2100, "level": 7, "attribute": "DARK", "monsterType": "Spellcaster"}

// One Piece
{"power": 6000, "cost": 5, "counterValue": 1000, "color": "Purple", "attribute": "Strike"}
```

**API Naming Conventions:**

| Element | Convention | Example |
|---|---|---|
| Endpoints | plural nouns, kebab-case | `/store/consumer-seller/payouts` |
| Route params | `:snake_case` | `/products/:product_id` |
| Query params | snake_case | `?sort_by=price&page_size=20` |
| Headers | X-Kebab-Case (custom) | `X-Request-Id`, `X-Vendor-Id` |
| Backend (MedusaJS) | Follow MedusaJS conventions exactly | `/store/products`, `/admin/orders` |
| Customer-backend | `/api/v1/{resource}` pattern | `/api/v1/cards`, `/api/v1/decks` |

**Code Naming Conventions:**

| Element | Convention | Example |
|---|---|---|
| Variables/functions | camelCase | `getUserProfile`, `deckCards` |
| Types/interfaces | PascalCase | `CardSearchResult`, `DeckBuilderState` |
| Components | PascalCase | `CardGrid`, `DeckBuilderToolbar` |
| Files (components) | PascalCase | `CardGrid.tsx`, `DeckBuilder.tsx` |
| Files (utilities) | camelCase | `formatPrice.ts`, `cardSearch.ts` |
| Files (hooks) | camelCase, `use` prefix | `useCardSearch.ts`, `useDeckBuilder.ts` |
| Constants | SCREAMING_SNAKE | `MAX_DECK_SIZE`, `API_BASE_URL` |
| Context files | PascalCase + Context | `CardSearchContext.tsx` |
| Schema files | `schema.ts` (singular, everywhere) | Storefront: `schema.ts`, Vendorpanel: `schema.ts` |

**Import Path Conventions:**

| Service | Convention | Example |
|---|---|---|
| Storefront | `@/` path alias | `import { CardGrid } from '@/components/cards/CardGrid'` |
| Vendorpanel | Relative imports | `import { CardGrid } from '../../components/CardGrid'` |
| Backend | MedusaJS module imports | `import { MedusaError } from '@medusajs/framework/utils'` |
| Customer-backend | Relative imports | `import { CardService } from '../services/CardService'` |

### Structure Patterns

**Project Organization (per service):**

| Service | Test Location | Organization | Shared Code |
|---|---|---|---|
| Backend | Co-located `*.spec.ts` | MedusaJS module structure | `src/shared/` |
| Customer-backend | Co-located `*.test.ts` | Domain packages (`src/packages/`) | `src/common/` |
| Storefront | Co-located `*.test.tsx` | Next.js App Router (`app/`, `components/`, `lib/`, `hooks/`) | `src/lib/` |
| Vendorpanel | Co-located `*.test.tsx` | Feature-based routes (`src/routes/`) | `src/components/common/` |

**Config & Environment:**

| File | Location | Purpose |
|---|---|---|
| `.env` | Service root | Local dev only, never committed |
| `.env.example` | Service root | Template with all required vars |
| `tsconfig.json` | Service root | TypeScript config |
| `vitest.config.ts` / `jest.config.ts` | Service root | Test runner config |

### Format Patterns

**API Response Formats:**

| Service | Success | Error | Rationale |
|---|---|---|---|
| Backend (MedusaJS) | MedusaJS native: `{ product: {...} }` | `MedusaError` from `@medusajs/framework/utils` | Don't fight the framework |
| Customer-backend | `{ success: true, data: {...} }` | `{ success: false, error: { message: "...", code: "VALIDATION_ERROR" } }` | Express convention |

**Backend Error Handling:** Always use `MedusaError` exclusively — never invent custom error classes.

```typescript
// ✅ CORRECT
import { MedusaError } from '@medusajs/framework/utils'
throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product not found")

// ❌ WRONG: Custom error class in backend
class ProductNotFoundError extends Error {}
throw new ProductNotFoundError("Product not found")
```

**Error Codes (customer-backend):**

```
VALIDATION_ERROR    — Invalid input
NOT_FOUND           — Resource doesn't exist
UNAUTHORIZED        — Missing or invalid auth
FORBIDDEN           — Insufficient permissions
CONFLICT            — Duplicate or state conflict
INTERNAL_ERROR      — Unexpected server error
SERVICE_UNAVAILABLE — Downstream service down (circuit breaker open)
```

**Data Exchange Formats:**

| Format | Convention | Example |
|---|---|---|
| Dates in JSON | ISO 8601 strings (UTC) | `"2026-02-22T14:30:00.000Z"` |
| Dates in DB | `timestamptz` | Stored as UTC |
| Dates in UI | Localized via `Intl.DateTimeFormat` | `"Feb 22, 2026"` |
| Money | Integer in smallest currency unit | `{ amount: 1299, currency: "usd" }` — never floats |
| Multi-currency | Smallest unit per currency; `currency` field determines interpretation | USD: `1299` = $12.99, JPY: `1299` = ¥1,299 |
| IDs | Framework-native format | MedusaJS: `prod_01H...`, customer-backend: UUID v4 |
| Booleans | `true`/`false` | Never `1`/`0` or `"yes"`/`"no"` |
| Nulls | Omit field or explicit `null` | Never empty string `""` for absent values |
| Arrays | Always array, even if empty | `{ cards: [] }` — never `null` for empty collections |

### Communication Patterns

**Redis Event Naming (cross-service sync):**

| Convention | dot.notation matching MedusaJS subscriber style |
|---|---|
| Format | `{domain}.{entity}.{action}` |
| Examples | `inventory.updated`, `product.price.changed`, `order.completed`, `catalog.card.imported` |

**Event Payload Standard:**

```typescript
interface CrossServiceEvent<T = unknown> {
  event: string           // e.g. "inventory.updated"
  version: number         // start at 1, increment on breaking payload changes
  data: T                 // event-specific payload
  timestamp: string       // ISO 8601
  source: 'backend' | 'customer-backend'
  correlation_id?: string // for tracing related events
}
```

**Event Versioning Rule:** When an event payload shape changes in a breaking way, increment `version` and support both old and new versions during a migration window. Non-breaking additions (new optional fields) do not require a version bump.

**State Management Patterns:**

| Service | Pattern | Rule |
|---|---|---|
| Storefront | Immutable updates via `useState`/`useReducer` | Never mutate state directly; spread or reducer returns new object |
| Vendorpanel | TanStack Query cache + Context | Server state via queries; UI state via context; never mix |
| Both | Loading states are local to the operation | Use `isLoading` from hooks, not global loading state (except overlay) |

### Process Patterns

**Error Handling:**

| Layer | Pattern |
|---|---|
| API route (backend) | Use `MedusaError` types exclusively |
| API route (customer-backend) | Catch, log structured error, return `{ success: false, error: {...} }` |
| Service | Throw typed errors (`MedusaError` in backend, custom error codes in customer-backend) |
| Cross-service call | Circuit breaker wraps call; fallback on open circuit |
| Frontend API call | Try/catch, show toast on error, log to Sentry |
| React component | Error boundary at route level, graceful fallback UI |

**Loading State Patterns:**

| Pattern | Implementation |
|---|---|
| Server Components (storefront) | `loading.tsx` file in route segment |
| Client data fetching (storefront) | `isLoading` from custom hooks, skeleton UI |
| TanStack Query (vendorpanel) | `isPending`/`isFetching` from query hooks |
| Form submission (both) | `isSubmitting` from react-hook-form |
| Long operations | `LoadingProvider` overlay with auto-clear timeout |

**Cross-Service Testing Rule:**

When testing features that cross the database boundary (e.g., deck-to-cart), **mock the other service's HTTP responses using MSW**. Never import code from the other service's codebase. Each service's test suite must be fully self-contained.

```typescript
// ✅ CORRECT: Mock other service via MSW
import { http, HttpResponse } from 'msw'
server.use(
  http.get('http://localhost:9001/store/products/:id', () =>
    HttpResponse.json({ product: mockProduct })
  )
)

// ❌ WRONG: Importing from other service
import { ProductService } from '../../../backend/src/services/ProductService'
```

### Enforcement Guidelines

**All AI Agents MUST:**

1. Follow the naming conventions table exactly — no exceptions, no "improvements"
2. Use the correct API response format for the service being modified (MedusaJS native vs customer-backend wrapper)
3. Write ISO 8601 dates, smallest-currency-unit integers for money, never floats for currency
4. Co-locate tests next to source files, never in a separate `__tests__/` directory
5. Use the `CrossServiceEvent` interface (with `version` field) for all Redis pub/sub events
6. Match existing file naming patterns in the service — check adjacent files before creating new ones
7. Run `lint + typecheck + build + test` quality gate before considering work complete
8. Use `@/` imports in storefront, relative imports in vendorpanel — never mix
9. Use `MedusaError` exclusively for backend errors — never custom error classes
10. Mock cross-service HTTP calls via MSW in tests — never import across service boundaries

**Code Review Checklist (patterns not enforceable by linting):**

Reviewers must manually verify:
- [ ] Event names use dot.notation (`inventory.updated`, not `INVENTORY_UPDATED`)
- [ ] Money stored as integer smallest-currency-unit with `currency` field
- [ ] JSONB internal keys are camelCase
- [ ] Customer-backend responses use `{ success, data/error }` wrapper
- [ ] Cross-service tests mock via MSW, no cross-service imports
- [ ] Schema files named `schema.ts` (singular)
- [ ] `CrossServiceEvent` includes `version` field

**Anti-Patterns (Never Do):**

```typescript
// ❌ WRONG: camelCase DB column
@Column({ name: 'userId' })   // Must be 'user_id'

// ❌ WRONG: Float for money
{ price: 12.99 }              // Must be { amount: 1299, currency: "usd" }

// ❌ WRONG: Mixing response formats
// In customer-backend, returning MedusaJS-style:
res.json({ card: data })      // Must be { success: true, data: card }

// ❌ WRONG: Empty string for null
{ middle_name: "" }            // Must be { middle_name: null } or omit

// ❌ WRONG: SCREAMING_SNAKE event names
channel.publish("INVENTORY_UPDATED")  // Must be "inventory.updated"

// ❌ WRONG: Separate test directory
__tests__/CardGrid.test.tsx    // Must be co-located: CardGrid.test.tsx

// ❌ WRONG: Custom error class in backend
class NotFoundError extends Error {}  // Must use MedusaError.Types.NOT_FOUND

// ❌ WRONG: Testing the mock, not the code
jest.mock('../cardSearch')
expect(mockCardSearch).toHaveBeenCalled()  // Proves nothing about behavior

// ❌ WRONG: Importing across service boundaries in tests
import { CardService } from '../../../customer-backend/src/services'
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
sidedecked-workspace-v2/                    # Monorepo workspace root
├── CLAUDE.md                                # AI agent instructions
├── _bmad/                                   # BMAD workflow engine
├── _bmad-output/                            # Planning & implementation artifacts
├── docs/                                    # Architecture, standards, guides
│   ├── architecture/                        # 01-07 architecture docs
│   ├── standards/                           # Code, testing, commit, doc standards
│   ├── epics/                               # Epic definitions
│   └── stories/                             # Story definitions
├── scripts/                                 # Workspace-level scripts
│
├── backend/                                 # MercurJS (MedusaJS v2) — mercur-db
├── customer-backend/                        # Node.js + TypeORM — sidedecked-db
├── storefront/                              # Next.js 14 (App Router)
└── vendorpanel/                             # React 18 + Vite
```

#### Backend (MercurJS — Commerce)

```
backend/apps/backend/
├── medusa-config.ts                         # MedusaJS v2 configuration
├── instrumentation.ts                       # OpenTelemetry setup
├── jest.config.js
├── Dockerfile
├── .env.template
│
└── src/
    ├── api/                                 # File-based API routing
    │   ├── middlewares.ts
    │   ├── admin/                            # Admin API (/admin/*)
    │   │   ├── algolia/, attributes/[id]/, commission/
    │   │   ├── disputes/[id]/, orders/[id]/, products/[id]/
    │   │   ├── requests/[id]/, reviews/[id]/, sellers/{[id],invite}/
    │   │   └── stock-locations/
    │   ├── store/                            # Customer-facing API (/store/*)
    │   │   ├── auth/{2fa,email,email-verification,profile,social}/
    │   │   ├── carts/{[id],multi-seller}/
    │   │   ├── consumer-seller/{dashboard,financial,listings,orders,payouts,...}/
    │   │   ├── disputes/[id]/, reviews/[id]/
    │   │   ├── sellers/{[id],validation}/
    │   │   └── wishlist/[id]/
    │   └── vendor/                          # Vendor API (/vendor/*)
    │       ├── products/{[id],export,import}/
    │       ├── inventory-items/{[id],location-levels}/
    │       ├── orders/[id]/, payouts/, statistics/
    │       └── ... (30+ route groups)
    │
    ├── modules/                             # Custom MedusaJS modules
    │   ├── authentication/                  # OAuth2 providers
    │   ├── email-verification/
    │   ├── seller-messaging/
    │   └── two-factor-auth/
    │
    ├── workflows/                           # Multi-step business workflows (25+ domains)
    ├── subscribers/                         # Event handlers (~40 files)
    ├── services/                            # Business logic
    ├── jobs/                                # Scheduled cron jobs
    ├── links/                               # Module link definitions
    ├── shared/utils/                        # Shared utilities
    └── admin/                               # Admin panel UI customizations
        ├── routes/, components/, hooks/, widgets/
```

#### Customer-Backend (TCG Domain)

```
customer-backend/src/
├── config/                                  # Infrastructure config
│   ├── database.ts, env.ts, infrastructure.ts, logger.ts
│
├── entities/                                # TypeORM models (31 entities, flat)
│   ├── Game.ts, Format.ts                   # Game system
│   ├── Card.ts, CardSet.ts, Print.ts        # Card catalog
│   ├── CatalogSKU.ts                        # Universal SKU
│   ├── Deck.ts, DeckCard.ts                 # Deck building
│   ├── Collection.ts, CollectionCard.ts     # User collections
│   ├── MarketPrice.ts, PriceHistory.ts      # Pricing
│   ├── UserProfile.ts, UserFollow.ts        # Community
│   ├── SellerRating.ts, SellerReview.ts     # Trust
│   ├── Forum*.ts, Conversation.ts, Message.ts
│   └── Activity.ts, AuthEvent.ts, ETLJob.ts
│
├── routes/                                  # Express routes (flat)
│   ├── catalog.ts, decks.ts, collections.ts
│   ├── customers.ts, sellers.ts, pricing.ts
│   ├── formats.ts, wishlist.ts
│   ├── commerce-integration.ts, auth-events.ts
│   └── errors.ts
│
├── services/                                # Business logic (flat)
│   ├── DeckValidationService.ts, InventorySyncService.ts
│   ├── MarketDataService.ts, MedusaAuthService.ts
│   ├── CDNService.ts, CollectibilityService.ts
│   ├── PriceAlertService.ts, PriceHistoryService.ts
│   ├── SellerReviewService.ts, TrustScoreService.ts
│   ├── JobScheduler.ts, ServiceContainer.ts
│
├── middleware/                              # Express middleware
│   ├── auth.ts, service-auth.ts, errorHandler.ts
│   ├── requestLogger.ts, validation.ts
│
├── migrations/                              # TypeORM migrations (15+)
├── workers/image-worker.ts                  # Background image processing
├── scripts/                                 # ETL, seeding, diagnostics
└── tests/{middleware,routes,services}/
```

#### Storefront (Next.js 14)

```
storefront/src/
├── app/                                     # App Router
│   ├── [locale]/(main)/                     # Main layout
│   │   ├── cards/[id]/, decks/{builder,[deckId]}/
│   │   ├── marketplace/, products/, search/
│   │   ├── sell/{list-card,payouts,reputation,upgrade}/
│   │   ├── sellers/, cart/, community/, categories/, collections/
│   │   └── user/{addresses,orders,reviews,wishlist,settings,...}/
│   ├── [locale]/(checkout)/                 # Checkout flow
│   ├── auth/{callback,error}/               # OAuth callbacks
│   └── api/{auth,customer,decks,formats,logout}/
│
├── components/                              # Atomic design
│   ├── atoms/                               # Button, Badge, Input, ...
│   ├── molecules/                           # LoginForm, RegisterForm, ...
│   ├── organisms/                           # Header, Footer, ProductCard, ...
│   ├── sections/                            # Hero, Cart, ProductListing, ...
│   ├── cells/                               # Navbar, Pagination, ...
│   ├── cards/, decks/, deck-builder/        # TCG-specific
│   ├── search/, seller/, pricing/           # Domain-specific
│   ├── feedback/                            # Toast, Loading providers
│   ├── ui/                                  # shadcn/ui components
│   └── common/
│
├── contexts/                                # State management
│   ├── CardSearchContext.tsx, DeckBuilderContext.tsx, ImageContext.tsx
│
├── hooks/                                   # Custom hooks
├── lib/
│   ├── api/{customer-backend.ts,oauth.ts}   # API clients
│   ├── data/{cards,cart,customer,orders,products,reviews,...}.ts
│   ├── actions/, cache/, helpers/, services/, utils/, validation/
│
├── types/, const/, styles/
└── middleware.ts
```

#### Vendorpanel (React 18 + Vite)

```
vendorpanel/src/
├── app.tsx, main.tsx                        # SPA entry points
│
├── components/
│   ├── common/                              # 30+ reusable components
│   ├── data-grid/, data-table/              # Table systems
│   ├── filtering/                           # Filter components
│   ├── forms/, inputs/                      # Form components
│   ├── layout/{main-layout,shell,pages}/    # Page templates
│   ├── modals/, search/, table/
│
├── routes/                                  # Feature-based (~40 routes)
│   ├── dashboard/, products/, orders/, inventory/
│   ├── customers/, customer-groups/, campaigns/, promotions/
│   ├── price-lists/, categories/, collections/
│   ├── sales-channels/, shipping-profiles/, locations/
│   ├── tax-regions/, regions/, reviews/, messages/
│   ├── stripe-connect/, settings/, profile/
│   ├── login/, register/, reset-password/, invite/
│   └── workflow-executions/
│
├── hooks/
│   ├── api/                                 # 50+ TanStack Query hooks
│   └── table/{columns,filters,query}/
│
├── providers/                               # 7 context providers
│   ├── router-provider/, theme-provider/, search-provider/
│   ├── sidebar-provider/, keybind-provider/, i18n-provider/
│   └── talkjs-provider/
│
├── lib/{client/,data/,query-client.ts,query-key-factory.ts}
├── i18n/, types/, utils/
```

### Architectural Boundaries

**API Boundaries:**

| Boundary | Producer | Consumer | Protocol |
|---|---|---|---|
| Commerce API | backend (:9001) | storefront, vendorpanel | REST (MedusaJS) |
| TCG API | customer-backend (:7000) | storefront | REST (`/api/v1/*`) |
| Cross-service sync | backend ↔ customer-backend | Each other | Redis pub/sub + REST |
| Storefront BFF | storefront API routes | storefront client | Next.js API routes |
| External: Stripe | backend | Stripe API | REST + webhooks |
| External: Algolia | backend + customer-backend | Algolia API | REST (indexing) |
| External: MinIO | customer-backend | MinIO S3 API | S3-compatible |

**Database Boundaries (NEVER cross):**

| Database | Service | Contains |
|---|---|---|
| **mercur-db** | backend only | Orders, products, vendors, payments, inventory, commissions, disputes |
| **sidedecked-db** | customer-backend only | Cards, decks, games, prints, pricing, community, collections, trust scores |

### Requirements to Structure Mapping

| FR Domain | Backend | Customer-Backend | Storefront | Vendorpanel |
|---|---|---|---|---|
| **Auth & Users** | `modules/authentication/`, `api/store/auth/` | `middleware/auth.ts`, `routes/customers.ts` | `app/auth/`, `components/auth/` | `routes/login/`, `components/authentication/` |
| **Product Catalog** | `api/vendor/products/` | `routes/catalog.ts`, `entities/Card*.ts` | `app/.../cards/`, `components/cards/` | `routes/products/` |
| **Deck Building** | — | `routes/decks.ts`, `services/DeckValidationService.ts` | `app/.../decks/`, `contexts/DeckBuilderContext.tsx` | — |
| **Cart & Checkout** | `api/store/carts/`, `workflows/cart/`, `workflows/checkout/` | — | `app/.../cart/`, `app/(checkout)/` | — |
| **Vendor Mgmt** | `api/vendor/`, `workflows/seller/` | `routes/sellers.ts` | `app/.../sell/` | All of `routes/` |
| **Community** | — | `entities/Forum*.ts`, `entities/UserProfile.ts` | `app/.../community/` | — |
| **Admin** | `api/admin/`, `admin/` | — | — | — |

### Integration Points

**Internal Communication:**

```
Storefront ──REST──→ Backend (:9001)         [commerce: products, cart, orders]
Storefront ──REST──→ Customer-Backend (:7000) [TCG: cards, decks, pricing]
Vendorpanel ──REST──→ Backend (:9001)        [vendor: products, orders, payouts]
Backend ──Redis pub/sub──→ Customer-Backend   [inventory.updated, product.price.changed]
Customer-Backend ──Redis pub/sub──→ Backend   [catalog.card.imported, pricing.updated]
Customer-Backend ──REST──→ Backend            [commerce-integration.ts → Medusa API]
```

**External Integrations:**

| Service | Integration Point | Direction |
|---|---|---|
| Stripe Connect | `backend/src/services/stripe-connect-express.service.ts` | Bidirectional |
| Algolia | `backend/src/subscribers/algolia-*.ts` | Push (indexing) |
| MinIO (S3) | `customer-backend/src/services/CDNService.ts` | Read/write |
| Resend | Backend notification subscribers | Push (email) |
| Scryfall | `customer-backend/src/scripts/master-etl.ts` | Pull (ETL) |

### Development Workflow

| Service | Command | Port |
|---|---|---|
| Backend | `cd backend && npm run dev` | :9001 |
| Customer-backend | `cd customer-backend && npm run dev` | :7000 |
| Storefront | `cd storefront && npm run dev` | :3000 |
| Vendorpanel | `cd vendorpanel && npm run dev` | :5173 |
| Image worker | `cd customer-backend && npm run worker:images` | — |

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All technology choices verified compatible. No conflicts between frameworks, libraries, or patterns across the 4 services. Split-brain database boundary physically enforced by separate services.

**Pattern Consistency:** Implementation patterns align with technology stack. Each service follows its framework's native conventions while shared concerns (JWT auth, event format, money representation) use consistent cross-service standards.

**Structure Alignment:** Project structure maps directly to architectural decisions. Service boundaries match database boundaries. No shared code between services (correct for split-brain).

### Requirements Coverage Validation

**Functional Requirements:** All 61 FRs across 7 domains have architectural support — mapped to specific services, routes, entities, and components in the Project Structure section.

**Non-Functional Requirements:** All 6 NFRs (API latency, DB performance, TTI, concurrency, test coverage, TypeScript strict) are addressed by specific architectural decisions (caching, SSR, quality gate, etc.).

### Implementation Readiness Validation

**Decision Completeness:** All critical decisions documented with specific technology choices. Versions verified for key dependencies. Rationale provided for each decision.

**Structure Completeness:** Complete project tree documented for all 4 services based on actual codebase inspection. All files, directories, and integration points mapped.

**Pattern Completeness:** 10 enforcement rules, 7 code review checklist items, 9 anti-patterns documented. Naming, structure, format, communication, and process patterns all specified.

### Gap Analysis Results

| Priority | Gap | Resolution |
|---|---|---|
| Important | Discord OAuth provider not implemented | Implementation task — add `discord-auth.provider.ts` to backend auth module |
| Important | Sentry SDK not installed | Implementation task — add `@sentry/*` packages during infrastructure stories |
| Nice-to-have | OpenAPI docs for customer-backend | Add `swagger-jsdoc` + `swagger-ui-express` when implementing API documentation story |
| Nice-to-have | Event catalog reference | Generate from implementation — document all Redis pub/sub events with payload types |

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed (61 FRs, 6 NFRs, 7 domains)
- [x] Scale and complexity assessed (High — 4 services, 2 DBs, 4 game systems)
- [x] Technical constraints identified (split-brain, Railway limits, MedusaJS conventions)
- [x] Cross-cutting concerns mapped (auth, caching, search, events, errors, security)

**Architectural Decisions**
- [x] Critical decisions documented (OAuth providers, state management, validation)
- [x] Technology stack fully specified with versions
- [x] Integration patterns defined (REST, Redis pub/sub, circuit breaker)
- [x] Performance considerations addressed (multi-layer caching, SSR, connection pooling)

**Implementation Patterns**
- [x] Naming conventions established (DB, API, code, events, files)
- [x] Structure patterns defined (per-service organization, test co-location)
- [x] Communication patterns specified (event format with versioning, response wrappers)
- [x] Process patterns documented (error handling, loading states, cross-service testing)

**Project Structure**
- [x] Complete directory structure defined (all 4 services, actual codebase)
- [x] Component boundaries established (API, database, state management)
- [x] Integration points mapped (internal + 5 external services)
- [x] Requirements to structure mapping complete (7 FR domains → specific locations)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Split-brain architecture is physically enforced — impossible to accidentally cross DB boundaries
- Existing codebase with established patterns reduces ambiguity for AI agents
- Comprehensive anti-patterns and enforcement guidelines prevent common mistakes
- Event versioning and cross-service testing rules prevent integration failures

**Areas for Future Enhancement:**
- Event catalog reference document (generate after initial events are implemented)
- OpenAPI documentation for customer-backend
- Performance benchmarking baseline (establish after core features are built)
- Chaos engineering patterns (test circuit breaker behavior under load)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and database boundaries absolutely
- Refer to this document for all architectural questions
- When in doubt, check adjacent files for existing patterns before creating new ones

**First Implementation Priorities:**
1. Discord OAuth provider (`backend/src/modules/authentication/providers/discord-auth.provider.ts`)
2. Sentry SDK integration across all 4 services
3. Feature development per epic/story priority (check `node scripts/next-spec.js`)
