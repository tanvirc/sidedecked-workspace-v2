# SideDecked Fullstack Architecture Document

## Introduction
This document outlines the complete fullstack architecture for SideDecked, integrating backend commerce services, customer experience services, and the dual front-ends (storefront and vendor panel). It translates the PRD into actionable implementation guidance for AI agents and human engineers working inside the monorepo.

### Starter Template or Existing Project
SideDecked is a mature brownfield codebase transitioning to BMAD. We retain the existing monorepo but treat all implementation as greenfield under the new workflow. No external starter template is in use.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-19 | 0.1.0 | Initial BMAD-aligned architecture synthesized from legacy docs | Codex |

## High Level Architecture

### Technical Summary
- Split-brain design with MercurJS commerce services operating in ackend/ against mercur-db, and customer experience modules in customer-backend/ against sidedecked-db.
- Storefront (Next.js 14) and vendor panel (React/Next.js 14) share design tokens while targeting different personas.
- Event-driven interoperability via SNS/SQS (or Medusa workflows) keeps domains synchronized without cross-database coupling.
- Infrastructure spans Vercel for storefront, AWS ECS/Fargate (or Lambda) for services, RDS PostgreSQL, Redis, Cloudflare R2, Stripe Connect, Algolia, and EasyPost.
- Observability relies on Datadog (metrics + traces) and structured JSON logging streamed through OpenTelemetry collectors.

### Platform and Infrastructure Choice
**Platform:** Hybrid (Vercel + AWS)
**Key Services:**
- Vercel (Next.js deploy, edge caching, ISR)
- AWS ECS/Fargate for containerized Node services
- AWS RDS PostgreSQL (multi-AZ) for mercur-db, sidedecked-db
- AWS ElastiCache Redis for queues, caching, rate limiting
- AWS S3 or Cloudflare R2 for media assets (card art, uploads)
- AWS SNS/SQS for asynchronous events
- AWS CloudWatch + Datadog forwarders for logs/metrics
- Stripe Connect (payments/payouts), EasyPost (shipping), Resend (email)
**Deployment Host and Regions:** Primary region us-east-1 with active/passive failover to us-west-2; Vercel edge network for global CDN coverage.

### Repository Structure
- Root managed with Turborepo + npm workspaces.
- ackend/: MercurJS/Medusa services, cart/checkout, vendor payouts.
- customer-backend/: Deck builder, catalog ingestion, community services, pricing intelligence.
- storefront/: Next.js 14 App Router for customer UI.
- endorpanel/: Next.js 14 App Router tailored for vendors/admins.
- packages/: Shared libraries (design system, API clients, domain contracts).
- .bmad-core/: BMAD configs, agents, workflows (ignored from git per installer instructions).

### Environments & Deployment Flow
1. Feature/Story environments via Vercel previews + ephemeral ECS services triggered from PR branches.
2. develop (integration) with nightly data refresh and load testing gates.
3. staging (release candidate) with anonymized production data subsets and full regression suites.
4. production (multi-AZ) with blue/green deploys coordinated by GitHub Actions workflows.

Promotion pipeline: PR merge ?? develop (auto deploy) ?? manual promotion to staging (requires QA gate) ?? automated canary in production with 5% traffic before full rollout.

### Security & Compliance
- OAuth2 + JWT with refresh tokens; enforce MFA for admins and vendor operators.
- Use AWS Secrets Manager for runtime secrets, rotate every 90 days.
- Tokenize PII and restrict access via attribute-based access control (ABAC).
- PCI DSS handled by Stripe; SideDecked never stores raw card details.
- Audit logging for authentication events, payouts, inventory overrides, moderation actions.

### Architectural Patterns
- Hexagonal architecture for services with adapters separating infrastructure concerns.
- Command/Query segregation for API handlers (reads optimized via views, writes via transactions).
- Event sourcing for critical financial flows (orders, payouts) with immutable ledgers.
- CQRS-aligned read models (Algolia/Elasticsearch) for search-heavy workloads.
- Circuit breaker + retry policies for all third-party integrations.

## Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.x | Typed React development | Strict typing aligns with quality gates |
| Frontend Framework | Next.js | 14 (App Router) | Storefront & vendor panel | Server Components + ISR for performance |
| UI Component Library | Tailwind CSS + Radix UI | Latest stable | Shared design system | Rapid theming + accessibility primitives |
| State Management | Zustand + React Query | Latest | Client state, data fetching | Lightweight stores, caching, suspense support |
| Backend Language | TypeScript | 5.x | Services & workflows | Shared language across repos |
| Backend Framework | MercurJS/Medusa v2 (ackend/), NestJS 10 (customer-backend/) | Latest stable | Commerce & experience services | Aligns with domain responsibilities |
| API Style | REST (OpenAPI 3) + gRPC-lite for internal streaming | n/a | Inter-service communication | REST for external, gRPC for high-frequency internal events |
| Database | PostgreSQL 15 (RDS) | 15 | mercur-db, sidedecked-db | Mature, supports JSONB and advanced indexing |
| Cache | Redis 7 (ElastiCache) | 7 | Sessions, queues, caching | Low latency, pub/sub |
| File Storage | Cloudflare R2 / AWS S3 | n/a | Card art, uploads | Cost-effective global distribution |
| Authentication | OAuth2 (Google, GitHub), Auth0 optional | n/a | Identity federation | Offloads security concerns |
| Frontend Testing | Jest + Testing Library + Playwright | Latest | Unit & E2E coverage | Proven tooling |
| Backend Testing | Jest + Supertest + Pact | Latest | Unit, integration, contract | Ensures API contracts |
| E2E Testing | Playwright + synthetic monitoring | Latest | Cross-app regression | Headless runs + synthetic probes |
| Build Tool | Turborepo | Latest | Task orchestration | Caching & parallelization |
| Bundler | Webpack (Next.js) + esbuild for packages | Latest | Build pipeline | Performance |
| IaC Tool | Terraform + Terragrunt | Latest | Infra provisioning | Shared modules |
| CI/CD | GitHub Actions + Vercel CI hooks | n/a | Automation | Integrated with GitHub |
| Monitoring | Datadog | n/a | Metrics + traces | Unified observability |
| Logging | OpenTelemetry -> Datadog/S3 | n/a | Structured logs | Vendor-neutral tracing |
| CSS Framework | Tailwind CSS | Latest | Styling | Utility classes speed delivery |

## Data Models

### Domain Overview
- Commerce domain (orders, payments, vendors, inventory) bound to mercur-db.
- Customer experience domain (cards, decks, community, pricing) bound to sidedecked-db.
- Shared identifiers (User, Vendor) referenced via APIs; never join across databases.

### Entity Highlights
- Card: canonical record with JSONB game_data for per-game attributes.
- CardPrint: links card to specific set/printing, tracks SKU metadata.
- Deck: stores composition, format metadata, collaboration settings.
- Order: parent order referencing one or more VendorOrder child records.
- VendorInventory: per vendor SKU, quantity, pricing, last sync timestamp.
- PriceSnapshot: historical pricing per card, source, condition, currency.
- CommunityThread & Message: social interactions with moderation fields.

### Storage Strategy
- PostgreSQL with partitioning for high-volume tables (orders, price snapshots).
- Read replicas for analytics workloads; use ban on cross-database queries enforced by linting.
- Algolia indices: cards, listings, decks, endors, community.
- Redis streams for event fan-out (price change alerts, inventory updates).

### Event Streams
- catalog.card.updated
- commerce.order.placed
- commerce.payout.processed
- pricing.snapshot.created
- community.message.posted
- inventory.sync.completed

Events carry minimal payload + resource URL for fetching full context.

## Backend Architecture

### Service Map
- AuthService (backend): OAuth flows, session mgmt, role enforcement.
- CheckoutService (backend): cart validation, payment intents, order orchestration.
- VendorService (backend): onboarding, payouts, tax compliance.
- CatalogService (customer-backend): card schema, ETL ingestion.
- DeckService (customer-backend): builder, validation, collection integration.
- CommunityService (customer-backend): forums, messaging, notifications.
- PricingService (customer-backend): data ingestion, analytics, alerts.

### API Layer
- Gateway via Medusa routers + NestJS controllers; all documented with OpenAPI 3.
- Rate limiting per route using Redis tokens; WAF rules at CloudFront layer.
- GraphQL read-only endpoint for deck builder to fetch aggregated card data quickly.

### Workflows & Jobs
- Scheduled ETL (hourly catalog updates, nightly pricing aggregation) via AWS EventBridge.
- Medusa workflows for order state transitions, refund handling, payout triggers.
- Worker queues (BullMQ) for notification fan-out, image processing, import validation.

### External Integrations
- Stripe webhooks -> backend order state machine.
- EasyPost label purchase -> vendor panel shipping center.
- Resend email templates -> notifications service.
- OAuth providers -> auth service with PKCE + rotating refresh tokens.

### Observability
- OpenTelemetry instrumentation in services with automatic trace propagation via headers.
- Structured logs (json) with correlation ids (equest_id, user_id, order_id).
- Datadog monitors: API latency, checkout success rate, ETL failures, payout delays.

## Frontend Architecture

### App Shell & Routing
- Next.js App Router with layouts per persona.
- Storefront: /, /cards/[slug], /vendors/[id], /cart, /checkout, /decks, /community.
- Vendor panel: /dashboard, /inventory, /analytics, /orders, /payouts, /compliance.
- Automatic static optimization for marketing pages; dynamic routes use server actions + caching.

### State & Data Fetching
- Server Components for initial data, React Query for client revalidation.
- Zustand slices for UI state (modals, notifications, in-progress deck edits).
- Suspense boundaries around high-latency components (pricing charts, search results).

### Component Strategy
- Shared design system @sidedecked/ui with Tailwind tokens.
- Accessibility-first components using Radix primitives.
- Storybook for component documentation (hosted via Chromatic for visual regression).

### API Consumption
- REST clients generated from OpenAPI via openapi-typescript.
- WebSocket hooks for deck collaboration, messaging, live pricing.
- GraphQL client (urql) for deck builder aggregated queries.

### Performance & Accessibility
- Edge caching for catalog pages; revalidate on card update events.
- Image optimization via Next.js Image + Cloudflare CDN.
- Lighthouse automated checks >= 95 performance, >= 90 accessibility on critical flows.
- Form validation with inline error messaging and screen-reader announcements.

## Developer Experience & Delivery

### Local Development
- 
pm install at root, 	urbo run dev --parallel to boot services + apps.
- Docker Compose spins up Postgres (two DBs), Redis, Stripe CLI webhook forwarder.
- Seed scripts populate catalog subset and sample vendors.

### Testing Strategy
- Unit: Jest per package with 80% coverage enforcement via NYC.
- Integration: Supertest for APIs, Medusa harness for commerce flows.
- Contract: Pact between frontend clients and services for critical routes.
- E2E: Playwright suites per persona run in CI nightly + on release candidate.
- Performance: k6 load tests for checkout, search, pricing ingestion.

### CI/CD Pipeline
- GitHub Actions matrix (lint, typecheck, unit) on push.
- On PR: run focused Playwright smoke + schema validations.
- On merge to develop: run integration suites + deploy to preview env.
- Release workflow tags version, triggers Terraform apply, publishes release notes.

### Release Management
- Semantic versioning with release notes auto-generated from Conventional Commits.
- Feature flags via LaunchDarkly (or homemade toggles) for staged rollouts.
- Incident response playbook stored in docs/operations/ (to be created).

## Risks & Mitigations
- **Integration Drift:** Third-party APIs change unexpectedly. _Mitigation:_ Contract tests, monitoring webhooks, vendor SLA reviews.
- **Data Volume Growth:** Catalog & pricing data may exceed RDS performance. _Mitigation:_ Partitioning, archiving cold data to Redshift/S3, autoscaling.
- **Realtime Collaboration Load:** Deck builder WebSockets may spike. _Mitigation:_ Autoscale WebSocket service, fall back to polling, throttle per user.
- **Security Incidents:** Compromised vendor account could manipulate pricing. _Mitigation:_ Require MFA, anomaly detection, rate-limited sensitive endpoints.

## Next Steps
1. Generate per-epic shard documents under docs/epics/ using PRD context.
2. Produce story files with SM prompts under docs/stories/ for BMAD dev workflow.
3. Configure QA gates and risk assessments in docs/qa/ aligned to high-risk flows (checkout, payouts, pricing).
