# SideDecked Architecture Baseline (BMAD)

> **Architecture Owner**: Platform Engineering · **Status**: Draft · **Last Updated**: 2025-09-12

## System Context
- **Backend (`backend/`)**: MercurJS commerce services connected to `mercur-db`.
- **Customer Backend (`customer-backend/`)**: Catalog, pricing, community APIs backed by `sidedecked-db`.
- **Storefront (`storefront/`)**: Next.js 14 customer UI consuming both API surfaces.
- **Vendor Panel (`vendorpanel/`)**: React vendor/admin UI targeting commerce services.
- **Shared Infrastructure**: Docker Compose, PostgreSQL instances, Redis, MinIO, MailHog, Stripe, Algolia, TalkJS.

## Architectural Principles
1. **Split-Brain**: Enforce hard separation between commerce and customer experience domains.
2. **API-First**: All flows exposed via REST/GraphQL APIs with OpenAPI definitions prior to UI work.
3. **Performance by Design**: Target p95 < 100ms API latency, LCP < 2s for storefront, virtualization for large lists.
4. **Security**: OAuth2 + JWT, RBAC by role (customer, vendor, admin). Stripe Connect for payments, GDPR-compliant data handling.
5. **Observability**: Structured logging, metrics, and tracing propagated via middleware in each service.
6. **Automation**: BMAD workflows for planning, development, QA; pipeline gating on coverage thresholds.

## Domain Boundaries
| Domain              | Repo              | Database        | Core Responsibilities                            |
|---------------------|-------------------|-----------------|---------------------------------------------------|
| Authentication      | backend, storefront | mercur-db, external | Identity, sessions, role management              |
| Commerce            | backend            | mercur-db       | Products, carts, checkout, orders, payouts        |
| Catalog & Pricing   | customer-backend   | sidedecked-db   | Card catalog, ETL, price intelligence             |
| Community & Decks   | customer-backend   | sidedecked-db   | Deck builder, social features                     |
| Storefront UX       | storefront         | N/A             | Customer flows, discovery, conversion             |
| Vendor Tools        | vendorpanel        | mercur-db       | Inventory, analytics, automations                 |

## Data & Integration Flows
- **Asynchronous ETL**: Customer backend ingests card data from Scryfall/TCG APIs, publishes pricing events.
- **Synchronous APIs**: Storefront consumes GraphQL/REST from both backends via typed client modules (`storefront/src/lib/api`).
- **Events & Webhooks**: Stripe webhooks handled in backend; Algolia indexing triggered by catalog events.
- **Caching**: Redis used for sessions, pricing caches, rate limiting; per-epic caching strategies defined in epic docs.

## Service Topology
```
+-------------+        +-----------------+        +---------------------+
| Storefront  | <----> | Customer Backend | <----> | sidedecked-db       |
| (Next.js)   |        | (Node/TypeScript)|        | Pricing, Catalog    |
+-------------+        +-----------------+        +---------------------+
      |                        ^
      v                        |
+-------------+        +-----------------+        +---------------------+
| VendorPanel | <----> | Commerce Backend| <----> | mercur-db           |
| (React)     |        | (MercurJS/Medusa)|       | Orders, Inventory   |
+-------------+        +-----------------+        +---------------------+
```

## Storefront Focus Areas (Priority per user directive)
- **Routing & Rendering**: App Router with SSR for SEO-critical pages; streaming for catalog pages.
- **Data Layer**: Typed fetchers located under `storefront/src/lib/api`. All calls must map to BMAD story acceptance criteria.
- **State Management**: React context modules (`auth`, `cart`, `deckBuilder`) with hydration-safe patterns.
- **UI Infrastructure**: Component library in `storefront/src/components/ui`, responsive design tokens defined in `storefront/src/styles`.
- **Testing**: Playwright E2E for checkout and deck flows, Jest/RTL for components, MSW for API mocks.

## Operational Requirements
- **Deployment**: CI/CD pipelines per repository; migrations executed via `backend` and `customer-backend` scripts.
- **Secrets Management**: `.env` templates per repo; secrets stored in cloud secret manager for production.
- **Observability Stack**: OpenTelemetry instrumentation per service, aggregated logs via ELK/Datadog (to be defined per epic).
- **BMAD Integration**: `.bmad-core` provides agents; story documents stored in `docs/stories`. Agents must be referenced in repo-specific READMEs for onboarding.

## Architecture Questions Outstanding
1. Confirm final API shape (REST vs GraphQL) for cross-domain interactions in storefront.
2. Validate approach for deck-building real-time collaboration (web sockets vs polling).
3. Determine search indexing cadence for Algolia vs internal caching.
4. Align payment reconciliation flows between Stripe Connect and vendor payouts.

## Change Log
| Date       | Version | Description                              | Author            |
|------------|---------|------------------------------------------|-------------------|
| 2025-09-12 | 1.0.0   | Initial BMAD architecture baseline        | Platform Team     |
