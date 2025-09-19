# SideDecked Product Requirements Document (PRD)

> **BMAD Baseline** · Greenfield reset completed 2025-09-12 · Owner: Product Team

## Goals
- Deliver a unified multi-repo SideDecked workspace that follows the BMad Method for planning and execution
- Provide collectors and vendors with a seamless trading marketplace experience across web touchpoints
- Establish a consistent operating model for commerce, catalog, community, and pricing domains
- Enable vendor automation, deck building, community engagement, and analytics from day one of development

## Background Context
SideDecked previously relied on bespoke specification documents per domain. To support BMAD-style agent workflows we are resetting the program to a greenfield posture. All prior implementation notes are archived under `docs/specifications/legacy-*` and superseded by this PRD, architecture baseline, and the epic/story shards in `docs/epics` and `docs/stories`. The workspace orchestrates four repositories (`backend/`, `customer-backend/`, `storefront/`, `vendorpanel/`) and shares infrastructure definitions from the mono workspace root.

## Change Log
| Date       | Version | Description                                      | Author            |
|------------|---------|--------------------------------------------------|-------------------|
| 2025-09-12 | 1.0.0   | Migrated to BMAD Method, reset to greenfield     | SideDecked Team   |

## Requirements

### Functional
1. **FR1**: Provide secure authentication, onboarding, and account management for customers, vendors, and administrators.
2. **FR2**: Support multi-vendor commerce with carts, checkout, payments, fulfillment tracking, and returns.
3. **FR3**: Maintain a universal TCG catalog with pricing intelligence, inventory sync, and ETL pipelines.
4. **FR4**: Deliver storefront UX for browsing, buying, deck building, community features, and notifications.
5. **FR5**: Provide vendor tooling for inventory ingestion, analytics, and automation within the vendor panel.
6. **FR6**: Offer community engagement (decks, comments, reviews) and pricing insights surfaced to customers.

### Non Functional
1. **NFR1**: Meet p95 API latency below 100ms per service with observability and error budgets defined per epic.
2. **NFR2**: Maintain data separation between `mercur-db` (commerce) and `sidedecked-db` (customer experience).
3. **NFR3**: Uphold security baselines for OAuth/JWT, PCI scope, and vendor data isolation.
4. **NFR4**: Achieve ≥80% automated test coverage per repository before release acceptance.
5. **NFR5**: Support responsive storefront UX with Core Web Vitals targets (LCP < 2s, CLS < 0.1).
6. **NFR6**: Ensure infrastructure scripts and agents run repeatably in Codespaces and local environments.

## Technical Assumptions
- Languages & Frameworks: TypeScript, Node.js 20+, Next.js 14, React 18, MercurJS/Medusa v2, TypeORM.
- Databases: PostgreSQL instances per bounded context, Redis for caches, MinIO for asset storage.
- Integrations: Stripe Connect, Algolia, TalkJS, Scryfall/TCG APIs, internal service APIs.
- Deployment: Containerized services with CI/CD targeting staging and production environments.
- Tooling: BMAD Method core agents installed at repository root (`.bmad-core`), Codex CLI for IDE workflow.

## Cross-Cutting Constraints
- Treat each service as a bounded context with event/API contracts—never share database tables across contexts.
- Enforce strict TypeScript, ESLint, and Prettier configurations per repository as codified in `/docs/standards`.
- All stories must be executable by autonomous agents using BMAD tasks, including QA and checklist gates.
- Documented observability (metrics, logging, tracing) must be in place before promoting any feature stories to "Done".

## Release Strategy (Epics)
1. **Epic 01 – Authentication & User Management**: Establish identity, roles, onboarding, and session management.
2. **Epic 02 – Commerce & Marketplace**: Implement cart, checkout, order lifecycle, and reviews.
3. **Epic 03 – TCG Catalog & Data Fabric**: Build catalog ingestion, search indexing, and pricing pipelines.
4. **Epic 04 – Vendor Enablement**: Deliver vendor panel onboarding, inventory automation, analytics.
5. **Epic 05 – Deck Building Experience**: Provide deck builder, validation, collection sync, and sharing.
6. **Epic 06 – Community & Social Systems**: Enable discussions, activity feeds, ratings, moderation.
7. **Epic 07 – Pricing Intelligence**: Expose pricing dashboards, alerts, and market insights.
8. **Epic 08 – Search & Discovery**: Build federated search, filters, and personalization layers.
9. **Epic 09 – Inventory Management**: Sync inventory, handle fulfillment states, and audit trails.
10. **Epic 10 – Payments & Settlement**: Implement Stripe Connect flows, payouts, and compliance.

## Success Metrics
- Time-to-story signoff ≤ 2 days with automated BMAD checklists.
- ≥90% of stories executed via BMAD agent workflow with no manual overrides.
- Zero critical incidents attributable to cross-context data leakage post launch.
- Marketplace conversion rate ≥ benchmark defined during GTM planning (tracked post launch).

## Risks & Mitigations
- **Legacy divergence**: Historical specs may drift from BMAD artifacts. → Archived legacy docs and reference links maintained; BMAD epics are the single source of truth.
- **Tooling adoption**: Teams unfamiliar with BMAD. → Provide onboarding instructions in `CONTRIBUTING.md` and `storefront/README.md`.
- **Integration complexity**: Multiple services and third-party APIs. → Document dependency matrices per epic (`docs/epics/*`).

## Next Steps
- Architects to refine `docs/architecture.md` per epic and attach service-specific diagrams.
- Scrum Master to shard epics into story files under `docs/stories/` ahead of sprint 01.
- QA Agent to prepare baseline gates in `docs/qa/` for regression and NFR coverage.
