# SideDecked Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Launch a unified SideDecked platform that serves customers, vendors, and administrators across all trading card games.
- Deliver end-to-end commerce capabilities from catalog ingestion to multi-vendor checkout and fulfillment.
- Provide collaborative deck building, community, and social experiences that keep players engaged.
- Empower vendors with pricing intelligence, inventory management, and analytics that drive profitability.

### Background Context
SideDecked is a community-driven trading card marketplace that must simultaneously delight players and professional vendors. The product spans catalog management, real-time marketplace operations, collaborative deck building, and richly social community features. This PRD establishes the greenfield baseline for building an AI-assisted implementation that treats SideDecked as a brand-new launch.

The platform operates on a split-brain architecture with separate commerce (`mercur-db`) and customer experience (`sidedecked-db`) bounded contexts. Deliverables must respect this separation while ensuring seamless user journeys across storefront, vendor panel, backend services, and supporting tooling.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-19 | 0.1.0 | Initial BMAD-aligned PRD synthesized from legacy specifications | Codex |

## Requirements

### Functional
- FR1: Provide secure OAuth2 and email/password authentication for customers, vendors, and administrators.
- FR2: Enforce role-based access control and fine-grained permissions across all services and interfaces.
- FR3: Deliver vendor onboarding with identity verification, business profile collection, and approval workflows.
- FR4: Maintain a universal, multi-game trading card catalog with normalized metadata and localization support.
- FR5: Run automated ETL pipelines to import and refresh card data, rulings, images, and print variations.
- FR6: Allow vendors to publish product listings with pricing, condition, quantity, and fulfillment options.
- FR7: Offer marketplace search, filters, and recommendations across cards, vendors, decks, and community content.
- FR8: Support user wishlists, saved searches, and alerts for restocks or price changes.
- FR9: Provide persistent shopping carts that support multiple vendors, guest users, and quantity management.
- FR10: Execute multi-vendor checkout with shipping, tax, and fee calculations per vendor and jurisdiction.
- FR11: Manage order lifecycle events including fulfillment, shipment tracking, refunds, and customer service escalation.
- FR12: Integrate Stripe Connect (or equivalent) for payment authorization, capture, and disbursement.
- FR13: Handle vendor payouts, commissions, tax forms, and financial reconciliation.
- FR14: Deliver a real-time deck builder with drag-and-drop editing, card search, and auto-save.
- FR15: Validate decks against game-specific rules and formats with clear user feedback.
- FR16: Enable deck sharing, collaboration, comments, and publishing workflows.
- FR17: Provide user collection management with import/export, acquisition history, and valuation insights.
- FR18: Facilitate community profiles, activity feeds, forums, messaging, and event scheduling.
- FR19: Implement notification services (email, push, in-app) with user preference management.
- FR20: Aggregate multi-source pricing data and surface analytics for players and vendors.
- FR21: Deliver price alerts, watchlists, and configurable signals for significant market movements.
- FR22: Offer vendor analytics dashboards covering sales, conversion, inventory health, and pricing guidance.
- FR23: Support inventory ingestion via CSV, APIs, and third-party integrations with two-way synchronization.
- FR24: Maintain audit logging, administration tools, and compliance workflows across all domains.

### Non Functional
- NFR1: Achieve <100ms P95 latency for core API endpoints under production load.
- NFR2: Render key storefront and vendor panel pages within 2 seconds on P95 desktop and mobile devices.
- NFR3: Provide 99.9% uptime across customer-facing services with automated health monitoring.
- NFR4: Preserve strict separation between `mercur-db` and `sidedecked-db` with no cross-database connections.
- NFR5: Satisfy PCI DSS requirements by delegating payment card handling to Stripe and encrypting sensitive data.
- NFR6: Implement structured logging, distributed tracing, and alerting across all services.
- NFR7: Maintain >=80% automated test coverage per repository with enforced TDD workflow.
- NFR8: Meet WCAG 2.1 AA accessibility standards for all customer-facing experiences.
- NFR9: Enforce secure-by-default configurations including MFA for admins, rotating secrets, and zero-trust APIs.
- NFR10: Scale horizontally to support 1M catalog items, 100K concurrent users, and 1M transactions per month.
- NFR11: Provide disaster recovery with <=15 minute RPO and <=1 hour RTO across critical systems.
- NFR12: Support localization, timezone handling, and currency conversion for international expansion.

## User Interface Design Goals

### Overall UX Vision
Create a cohesive, modern experience that balances high-velocity marketplace interactions with deep community engagement. The UI should feel performant, responsive, and grounded in SideDecked's trading card aesthetic while remaining approachable to new players and power sellers alike.

### Key Interaction Paradigms
- Multi-step onboarding that adapts to customer, vendor, and admin personas.
- Marketplace browsing with rapid filtering, comparison, and add-to-cart actions.
- Real-time collaborative deck building with instant validation feedback.
- Vendor workflows optimized for bulk inventory updates and analytics review.
- Community hubs that surface activity feeds, discussions, events, and messaging.
- Alert and notification management woven directly into relevant user flows.

### Core Screens and Views
- Marketplace landing page with featured cards, decks, and vendors.
- Card detail and vendor listing pages with availability and pricing options.
- Shopping cart and three-step checkout flow.
- Vendor onboarding and compliance dashboard.
- Deck builder workspace and deck detail view.
- Collection manager with valuation summary.
- Community hub with forums, events, and messaging.
- Pricing intelligence dashboard with alerts and analytics.

### Accessibility
Adhere to WCAG 2.1 AA using semantic HTML, focus management, keyboard navigation, and sufficient color contrast. Provide text alternatives for imagery, meaningful loading states, and clear error messaging across all flows.

### Branding
Leverage the SideDecked design system with a vibrant, card-inspired palette, typographic hierarchy, and component tokens shared across apps. Maintain consistent iconography, motion, and layout rhythm across storefront and vendor panel while allowing role-specific accents.

### Target Device and Platforms
Deliver a responsive web experience optimized for desktop, tablet, and mobile. Storefront and community flows must be fully usable on mobile; vendor panel prioritizes desktop but must degrade gracefully on tablets for lightweight operations.

## Technical Assumptions

### Tech Stack Preferences
- Monorepo managed with TurboRepo and npm workspaces spanning `backend/`, `customer-backend/`, `storefront/`, and `vendorpanel/`.
- TypeScript 5.x with strict mode enforced across all packages.
- Next.js 14 for storefront and vendor panel with App Router, React Server Components, and Tailwind CSS.
- MercurJS/Medusa v2 for commerce backend in `backend/`.
- NestJS + TypeORM for customer-backend domain services.
- PostgreSQL 15 for `mercur-db` and `sidedecked-db`, plus Redis for caching and job queues.
- Algolia (primary) with Elasticsearch fallback for search indexing and recommendations.
- Stripe Connect for payments, EasyPost for shipping rate calculation, Resend for transactional email.

### Deployment Baseline
- Vercel for storefront deployment with edge caching and image optimization.
- AWS (ECS/Fargate or Lambda) for backend services with AWS RDS Postgres, ElastiCache Redis, and S3/Cloudflare R2 for asset storage.
- GitHub Actions CI with required checks, semantic-release for versioning, and Terraform for infrastructure as code.
- Feature environments provisioned via preview deployments per pull request.

### Testing Strategy
- Jest + Testing Library for unit tests across frontend and backend.
- Playwright for end-to-end customer journeys; Pact or contract tests for cross-service integrations.
- Data seeding and snapshot fixtures for deterministic catalog and deck scenarios.
- Scheduled performance tests simulating peak shopping and pricing workloads.

### Additional Technical Assumptions and Requests
- Event-driven integration using SNS/SQS (or Medusa workflows) for cross-domain updates.
- Enforce API-first principles with OpenAPI 3 specifications and generated clients.
- Maintain a centralized secrets management approach using AWS Secrets Manager.
- Provide observability dashboards (Datadog or Grafana) shared with operations and vendor success teams.

## Scope

### In Scope
- Establishing foundational architecture, infrastructure automation, and CI/CD guardrails.
- Implementing commerce, catalog, search, payment, community, and vendor workflows defined in FRs.
- Delivering responsive storefront and vendor panel UI experiences.
- Producing shared design tokens, component libraries, and documentation for ongoing development.
- Instrumenting analytics, monitoring, and admin tooling required for launch readiness.

### Out of Scope
- Native mobile applications (to be considered post-launch).
- Non-TCG product verticals or digital goods marketplaces.
- Advanced machine learning models beyond the initial pricing intelligence roadmap.
- Third-party marketplace integrations (eBay, TCGPlayer) beyond documented APIs.
- Physical event logistics (venue booking, ticketing) outside community calendar features.

## Dependencies
- Scryfall, PokeAPI, and YGOPRODeck for card data and rulings.
- Stripe Connect for payments, payouts, tax forms, and compliance.
- EasyPost (or equivalent) for shipping rates, labels, and carrier integrations.
- Cloudflare R2/S3 for media asset storage and CDN delivery.
- Algolia/Elasticsearch for search indexing and personalization.
- Resend (or SES) for transactional email and notification delivery.
- Auth0 (if required) or native OAuth providers for social login federation.

## Risks and Mitigation
- **Third-party API limits:** External data sources and payment providers may throttle requests - _Mitigation:_ implement caching, backoff, and observability around upstream rate limits.
- **Data quality drift:** Catalog imports could introduce inconsistent attributes - _Mitigation:_ enforce validation schemas, staging imports, and manual review tooling.
- **Compliance overhead:** Payment onboarding and tax handling are complex - _Mitigation:_ lean on Stripe managed features, automate document collection, and schedule periodic compliance reviews.
- **Realtime performance:** Deck builder and messaging require low latency - _Mitigation:_ use WebSocket infrastructure with load testing, fallbacks, and optimistic UI patterns.
- **Cross-domain coupling:** Violating split-brain boundaries could create outages - _Mitigation:_ document APIs, enforce repository ownership, and add automated linting to catch cross-database access.

## Release & Milestones
1. **Phase 1 - Platform Foundation:** Monorepo setup, CI/CD, authentication, and baseline catalog scaffolding.
2. **Phase 2 - Commerce Launch:** Marketplace listings, cart, checkout, payments, and vendor onboarding.
3. **Phase 3 - Community & Decks:** Deck builder, collection management, community hub, and messaging.
4. **Phase 4 - Intelligence & Search:** Pricing analytics, alerts, advanced search, and recommendation features.
5. **Phase 5 - Vendor Operations:** Inventory automation, analytics dashboards, and operational refinements.

## Epic List
- Epic 1: Foundation & Authentication - Bootstrap the platform and secure identity flows.
- Epic 2: Catalog Platform - Build the authoritative card database and media pipelines.
- Epic 3: Marketplace & Cart - Deliver browsing, cart, and checkout experiences.
- Epic 4: Payments & Compliance - Handle payment capture, disbursement, and regulatory needs.
- Epic 5: Deck Building & Collections - Empower players to build, validate, and share decks.
- Epic 6: Community & Engagement - Launch social features, messaging, and events.
- Epic 7: Pricing Intelligence - Provide analytics, trends, and alerting.
- Epic 8: Vendor Operations & Inventory - Equip vendors with inventory and analytics tooling.

## Epic 1: Foundation & Authentication

**Goal:** Establish the SideDecked monorepo, shared tooling, and secure authentication flows so that all subsequent work starts from a stable, testable platform.

### Story 1.1: Project Workspace & CI Bootstrap
As a platform engineer, I want a monorepo workspace with automated quality checks so that every service starts from a consistent foundation.

#### Acceptance Criteria
1. Workspace initializes packages for `backend/`, `customer-backend/`, `storefront/`, and `vendorpanel/` with shared TypeScript, ESLint, and Prettier configurations.
2. GitHub Actions (or equivalent) pipeline runs lint, typecheck, unit tests, and coverage gates on each push and pull request.
3. A developer bootstrap script provisions environment variables, local databases, and seeded demo data for all services.

### Story 1.2: OAuth2 Sign-In & Session Management
As a customer, I want to authenticate with my social account so that I can access SideDecked securely without creating a new password.

#### Acceptance Criteria
1. Storefront and vendor panel expose Google and GitHub login via the backend authentication service using OAuth2 PKCE.
2. The backend issues access and refresh tokens with rotation, stores them in httpOnly cookies, and enforces session expiration policies.
3. Role-based guards protect APIs and UI routes for customer, vendor, and admin personas with automated tests covering access rules.

### Story 1.3: Onboarding & Profile Management
As a new vendor, I want guided onboarding so that I can complete my profile and meet compliance requirements.

#### Acceptance Criteria
1. Post-registration flow collects display name, location, avatar, preferred games, and desired role with server-side validation.
2. Vendor onboarding captures business details (tax IDs, banking, documents) and routes submissions for admin approval.
3. Profile APIs and UI allow users to edit preferences, manage connected OAuth providers, and view onboarding status.

## Epic 2: Catalog Platform

**Goal:** Create the authoritative card catalog, import pipeline, and media handling required to power marketplace, deck, and pricing features.

### Story 2.1: Canonical Card Schema & Storage
As a catalog engineer, I want a normalized card schema so that all trading card games are represented consistently.

#### Acceptance Criteria
1. `sidedecked-db` contains normalized entities for cards, prints, rulings, and game-specific metadata with necessary indexes.
2. Schema supports multi-language names, legalities, and tagging for formats, rarities, and card types.
3. Migration seeds initial reference data (games, sets) and exposes CRUD APIs guarded by admin roles.

### Story 2.2: Automated Scryfall Import Pipeline
As an operator, I want automated imports so that the catalog stays current without manual effort.

#### Acceptance Criteria
1. Scheduled workflow retrieves bulk card data, incremental updates, and rulings from Scryfall (and other sources where applicable).
2. ETL pipeline deduplicates records, maps data into canonical schema, and logs anomalies for review.
3. Import runs produce metrics and alerts surfaced through monitoring dashboards with retry semantics on failure.

### Story 2.3: Media Asset Processing
As a customer, I want crisp card images so that browsing the catalog feels premium.

#### Acceptance Criteria
1. Media pipeline downloads card art, crops variants, generates responsive sizes, and stores assets in Cloudflare R2/S3.
2. CDN URLs and asset metadata are persisted alongside catalog records with cache-control headers optimized for storefront usage.
3. Fallback placeholders render gracefully when images are missing or marked restricted.

## Epic 3: Marketplace & Cart

**Goal:** Enable customers to explore the catalog, manage carts across vendors, and complete purchases confidently.

### Story 3.1: Marketplace Browsing & Search
As a customer, I want powerful search tools so that I can quickly find the cards I need.

#### Acceptance Criteria
1. Storefront lists products with filters for game, set, condition, price range, vendor rating, and availability.
2. Search service indexes catalog and vendor inventory, returning results within 200ms and supporting typo tolerance.
3. Product detail pages display vendor offers, shipping estimates, and add-to-cart actions with analytics instrumentation.

### Story 3.2: Multi-Vendor Cart Management
As a shopper, I want a single cart across vendors so that checkout stays frictionless.

#### Acceptance Criteria
1. Cart API groups items by vendor, tracks quantities, condition, and per-vendor subtotals for guest and authenticated users.
2. Cart updates validate inventory availability and lock quantities to prevent oversells.
3. UI persists cart state across sessions, supports save-for-later, and displays mobile-friendly interactions.

### Story 3.3: Checkout Flow & Order Creation
As a customer, I want a guided checkout so that I can confirm shipping, payment, and review before purchase.

#### Acceptance Criteria
1. Checkout wizard collects shipping address, shipping method per vendor, and payment method with real-time validation.
2. Taxes, fees, and shipping costs calculate per vendor and jurisdiction with clear breakdown in the review step.
3. Successful checkout creates an aggregate order plus vendor sub-orders, sends confirmation notifications, and redirects to the order detail page.

## Epic 4: Payments & Compliance

**Goal:** Integrate payments, disbursement, and compliance operations to keep money movement secure and auditable.

### Story 4.1: Stripe Connect Vendor Onboarding
As a vendor, I want seamless payout setup so that I can get paid without leaving SideDecked.

#### Acceptance Criteria
1. Vendor onboarding launches the Stripe Connect embedded flow, captures required capabilities, and stores status updates.
2. Admin dashboard surfaces pending verification tasks, document requirements, and KYC statuses per vendor.
3. Errors and incomplete onboarding steps trigger notifications to vendors with retry links.

### Story 4.2: Payment Capture & Escrow Handling
As a platform operator, I want secure payment capture so that funds are held until orders are fulfilled.

#### Acceptance Criteria
1. Checkout creates Stripe PaymentIntents with line-item splits by vendor and platform commission.
2. Funds remain in escrow until the vendor confirms shipment or SLA expiry triggers automatic capture.
3. Refunds, partial refunds, and disputes are tracked with webhook-driven state updates in the commerce backend.

### Story 4.3: Payout Scheduling & Reconciliation
As a finance analyst, I want transparent payouts so that accounting stays accurate.

#### Acceptance Criteria
1. Payout engine schedules vendor transfers based on configurable cadence, minimum thresholds, and reserve policies.
2. Ledger records every charge, fee, commission, and payout in `mercur-db` with audit trail.
3. Vendors access payout histories, downloadable statements, and reporting exports through the vendor panel.

## Epic 5: Deck Building & Collections

**Goal:** Deliver best-in-class tools for players to build decks, manage collections, and collaborate with the community.

### Story 5.1: Deck Builder Workspace
As a player, I want an interactive builder so that I can assemble decks quickly.

#### Acceptance Criteria
1. Deck builder UI supports drag-and-drop from search results, card previews, and sorting by role within the deck.
2. Deck state auto-saves to the user profile with version history and undo/redo.
3. Users can export decks to shareable URLs, text list, and MTG Arena or other standard formats.

### Story 5.2: Format Validation Engine
As a competitive player, I want validation so that my deck meets rules before tournaments.

#### Acceptance Criteria
1. Validation service enforces game and format rules (card counts, banned lists, legality) with extensible rule definitions.
2. Deck builder surfaces validation results in real time with actionable messages linked to offending cards.
3. Public API exposes validation endpoints for third-party tools with rate limiting and documentation.

### Story 5.3: Collection Management & Sync
As a collector, I want to track inventory so that I know what to trade or buy.

#### Acceptance Criteria
1. Users record owned cards with quantity, condition, acquisition cost, and storage location.
2. Deck builder highlights cards already owned, needed, or missing via collection integration.
3. Import/export supports CSV uploads with validation and duplicate handling plus scheduled sync for premium features.

## Epic 6: Community & Engagement

**Goal:** Build social features that keep users connected, informed, and collaborating around trading cards.

### Story 6.1: Profile & Activity Feed
As a community member, I want profiles and activity feeds so that I can discover interesting players and vendors.

#### Acceptance Criteria
1. Public profiles display bio, badges, decks, listings, recent activity, and privacy-controlled sections.
2. Activity feed aggregates deck updates, purchases, event RSVPs, and forum posts with filtering options.
3. Users can follow or unfollow others, influencing a personalized feed and notifications.

### Story 6.2: Messaging & Notifications
As a customer, I want messaging so that I can coordinate purchases and trades.

#### Acceptance Criteria
1. Real-time messaging supports direct messages between customers and vendors with read receipts and moderation tools.
2. Notification center aggregates email, push, and in-app alerts with granular opt-in preferences.
3. System templates exist for order updates, price alerts, deck comments, and policy changes with localization support.

### Story 6.3: Community Forums & Events
As an organizer, I want forum and event tools so that I can rally the community.

#### Acceptance Criteria
1. Community hub provides forums with topics, threads, replies, and moderation workflows.
2. Events feature supports creation, RSVPs, reminders, and integration with calendar exports.
3. Moderators can flag content, suspend users, and view audit trails for compliance.

## Epic 7: Pricing Intelligence

**Goal:** Deliver analytics and alerting that help players and vendors react to market dynamics.

### Story 7.1: Market Data Aggregation
As a pricing analyst, I want aggregated data so that pricing decisions stay informed.

#### Acceptance Criteria
1. Scheduled jobs ingest pricing feeds from multiple sources (marketplaces, vendor imports, historical datasets).
2. Normalization layer reconciles card identities, currencies, and conditions into a unified model.
3. Historical price series stored with retention policies and surfaced via API.

### Story 7.2: Pricing Analytics Engine
As a vendor, I want actionable insights so that I can optimize pricing.

#### Acceptance Criteria
1. Analytics service calculates fair market value, median price, volatility, and inventory velocity per card.
2. Vendor dashboard visualizes trends, recommended price adjustments, and margin impact.
3. Alerts trigger when anomalies or thresholds are met, notifying relevant users.

### Story 7.3: Price Alert Experience
As a player, I want alerts so that I can act when prices move.

#### Acceptance Criteria
1. Users configure alert rules by card, threshold, direction, and notification channel.
2. Alert engine deduplicates notifications, enforces rate limits, and respects quiet hours.
3. UI displays alert history, allows snoozing or dismissing, and syncs preferences across devices.

## Epic 8: Vendor Operations & Inventory

**Goal:** Equip vendors with the operational tooling needed to keep inventory accurate and business performance visible.

### Story 8.1: Inventory Import & Synchronization
As a vendor, I want fast inventory updates so that my listings stay accurate.

#### Acceptance Criteria
1. Vendors upload CSV or connect APIs to sync inventory with validation for SKU, condition, and quantity.
2. Processing pipeline surfaces errors, partial successes, and suggested fixes with downloadable reports.
3. Successful imports update storefront availability, search index, and pricing intelligence within five minutes.

### Story 8.2: Vendor Analytics Dashboard
As a vendor, I want actionable dashboards so that I can understand performance.

#### Acceptance Criteria
1. Dashboard shows sales, conversion rates, average order value, and top-performing SKUs with date filters.
2. Visualizations support comparison against previous periods and surface actionable insights (low stock, high demand).
3. Exports and scheduled email reports provide CSV snapshots for accounting tools.

### Story 8.3: Inventory Reconciliation & Auditing
As an operator, I want reconciliation tools so that stale listings do not hurt trust.

#### Acceptance Criteria
1. Nightly jobs detect zero-stock or stale listings and queue notifications for vendor review.
2. Admins can trigger audits, view change history, and enforce temporary delisting when inventory is unverified.
3. Audit log captures all manual overrides with user, timestamp, and rationale for compliance.

## Checklist Results Report
Pending - run the BMAD PM checklist once automation is integrated into this repository.

## Next Steps

### UX Expert Prompt
Using `docs/prd.md`, produce the initial front-end specification that details component states, interaction flows, and accessibility considerations for the storefront, vendor panel, and community experiences.

### Architect Prompt
Generate the fullstack architecture document that aligns with this PRD, including deployment topology, service boundaries, data contracts, and sequencing for phased delivery across the split-brain architecture.
