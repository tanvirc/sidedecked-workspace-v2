---
stepsCompleted: [1, 2, 3, 4, 5]
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
