---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation', 'epic-09-step-01-requirements', 'epic-09-step-02-design', 'epic-09-step-03-stories', 'epic-09-step-04-validation']
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/design-thinking-2026-02-28.md
  - _bmad-output/planning-artifacts/homepage-redesign-prototype-v1.html
---

# sidedecked - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for sidedecked, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can sign up and sign in via social OAuth providers (Google, Discord, Apple)
FR2: Users can maintain a profile with display name, avatar, and shipping address
FR3: Users can hold one of multiple roles with access scoped per role: buyers, individual sellers, business sellers, admins
FR4: Authenticated sessions persist across browser sessions and work seamlessly across all platform services
FR5: Unauthenticated users can browse cards, search, and view public decks without signing in
FR6: The platform maintains a universal card catalog spanning MTG, Pokemon, Yu-Gi-Oh!, and One Piece with game-specific attributes
FR7: Users can search for cards with instant autocomplete suggestions across all games
FR8: Users can filter search results by game, set, rarity, condition, price range, format legality, and seller location
FR9: Users can view a card detail page aggregating catalog data, market pricing, and all active listings
FR10: The catalog is populated and kept current via automated ETL pipelines from external data sources for all four games
FR11: Card detail pages are indexable by search engines with structured product data and Open Graph metadata
FR12: (Growth) Users can save cards to a wishlist for future purchase consideration
FR13: (MVP) Users can view their recently viewed cards
FR14: Users can sort search results and listings by price, seller rating, or relevance
FR15: Users can create, edit, save, and delete decks for any supported game and format
FR16: Users can add cards to a deck via search with real-time format legality validation
FR17: Users can toggle an "I own this" indicator on any card in their deck to track which cards they already have
FR18: Users can view a deck summary showing total cards, cards owned, cards needed, and estimated cost of missing cards
FR19: Users can share a deck via a public URL that renders with card images and social sharing metadata without requiring authentication to view
FR20: Users can import a shared public deck into their own deck collection
FR21: Users' collection status automatically updates when purchased cards are delivered and receipt is confirmed
FR22: (MVP) Users can duplicate an existing deck to create a variant
FR23: Deck builder supports game-specific deck zones (mainboard, sideboard, extra deck as applicable per game)
FR24: Users can browse and discover publicly shared decks without a direct link
FR25: Users can add listings to a shopping cart from card detail pages, search results, or deck builder
FR26: Users can trigger a cart optimizer from a deck that finds the best combination of sellers for missing cards, presenting options optimized for cheapest total, fewest packages, or best value
FR27: The cart optimizer factors in per-seller shipping costs when calculating optimal purchasing combinations
FR28: Users can complete checkout for a multi-vendor cart in a single transaction with saved payment and shipping information
FR29: Multi-vendor orders create independent sub-orders per seller with separate tracking
FR30: Users can view order status, tracking information, and confirm receipt of shipments
FR31: Users receive toast notifications for key events with no alert() dialogs
FR32: Listings track available quantity that decrements automatically on purchase
FR33: Individual sellers can list a card for sale through a guided multi-step flow that pre-fills market pricing
FR34: The listing flow provides game-specific visual grading guides with photo examples for each condition level
FR35: Sellers can upload photos of their card (front and back) during the listing process
FR36: Business sellers can upload a CSV inventory file and have cards automatically matched to the catalog with confidence tiers (auto-match, fuzzy review, unmatched)
FR37: Business sellers can review and resolve fuzzy-matched and unmatched cards from their CSV import
FR38: Sellers can view and manage their active listings, including editing price and condition
FR39: Sellers receive notifications when their listings are purchased and can manage order fulfillment
FR40: Business sellers can update prices in bulk via pricing rules or CSV re-import
FR41: Sellers can configure shipping rates, methods, and regional availability for their listings
FR42: Sellers can provide shipment tracking information (carrier and tracking number) when fulfilling orders
FR43: (Growth) Sellers can view listing performance metrics: views, unique viewers, cart-adds, cart-add rate, sales count, and revenue per listing
FR44: Sellers can onboard to the payment system via Stripe Connect with identity verification
FR45: The platform collects commission on each transaction and distributes the seller's portion via automated payouts
FR46: The platform collects seller tax information during onboarding for 1099-K reporting compliance
FR47: The platform calculates and collects applicable sales tax on behalf of sellers in marketplace facilitator jurisdictions
FR48: The platform automatically detects and flags listings priced >50% below the 30-day average market price before they go live
FR49: Buyers can open a dispute on a received order with photo evidence of condition discrepancy
FR50: Admins can resolve disputes by comparing seller listing photos against buyer-submitted photos and issuing full or partial refunds
FR51: Sellers accumulate a trust score based on transaction history, dispute outcomes, and fulfillment reliability
FR52: Admins can review and approve or reject new business seller applications
FR53: (MVP) Listings from sellers who fail to fulfill orders are automatically deactivated after 3+ unfulfilled orders within 30 days
FR54: (MVP) Admins can suspend or ban seller accounts and cancel their active listings
FR55: All prices displayed to users must originate from real listing data or verified market sources
FR56: Admins can view a queue of flagged listings (price anomalies, reported content) for review
FR57: Admins can manage the card catalog, including triggering ETL updates and manually adding cards for new set releases
FR58: The platform runs automated financial reconciliation between order records and payment processor data
FR59: (MVP) The platform maintains referential integrity between catalog entries and product listings across both backends
FR60: (MVP) The platform sends transactional email notifications for key events
FR61: (Growth) Admins can view key platform metrics (GMV, active sellers, order volume, conversion rates)

### NonFunctional Requirements

NFR1: API response time < 100ms P95 for all backend endpoints
NFR2: Database queries < 50ms for both PostgreSQL databases
NFR3: Time to Interactive (TTI) < 2 seconds for storefront pages; FCP < 1.2s; LCP < 2.5s; CLS < 0.1
NFR4: Search query response < 200ms (Algolia-powered)
NFR5: Cart optimizer execution < 2 seconds for 15 missing cards, < 5 seconds for 60 missing cards
NFR6: Initial JavaScript bundle < 200KB gzipped
NFR7: Card image load (above fold) < 500ms with CDN and responsive srcset
NFR8: Platform supports 100 concurrent users at launch with no degradation
NFR9: Background jobs (ETL, price anomaly scan, reconciliation) must not impact user-facing performance
NFR10: All data transmitted over TLS 1.2+ — no unencrypted HTTP in production
NFR11: JWT tokens signed with RS256, expiry < 24 hours, refresh token rotation
NFR12: OAuth2 secrets, Stripe API keys, and database credentials stored in environment variables only
NFR13: Stripe Connect handles all payment card data — platform never stores raw card numbers (PCI DSS via Stripe)
NFR14: Webhook endpoints verify Stripe signature headers before processing
NFR15: Admin API routes require admin role verification via server-side middleware
NFR16: User-uploaded images validated for file type, size (< 10MB), and sanitized before storage
NFR17: Rate limiting on authentication endpoints (max 10 attempts per IP per minute)
NFR18: Rate limiting on search API (max 100 requests per user per minute)
NFR19: CSRF protection on all state-changing requests
NFR20: SQL injection prevention via parameterized queries and ORM query builders
NFR21: XSS prevention via framework default output escaping and Content Security Policy headers
NFR22: Launch scalability: 100 concurrent users, 50 sellers, ~50,000 listings; 6-month: 1,000 users, 500 sellers, ~500,000 listings
NFR23: Database connection pooling: max 10 connections per service on Railway
NFR24: Redis caching for frequently accessed data with TTL-based invalidation
NFR25: Algolia index supports up to 1M records
NFR26: Stateless application servers for horizontal scaling
NFR27: Platform uptime target: 99.5%
NFR28: Cross-service API reliability > 99.5% success rate
NFR29: Circuit breaker pattern on all cross-service calls with graceful degradation
NFR30: BFF endpoint degrades gracefully: show catalog data even if listing data temporarily unavailable
NFR31: Stripe webhook processing with idempotency keys to prevent duplicate processing
NFR32: Database backups: daily automated with 7-day retention
NFR33: Zero-downtime deployments via rolling updates
NFR34: ETL pipeline failures must not corrupt existing catalog data — atomic batch updates with rollback
NFR35: WCAG 2.1 AA compliance across all storefront pages
NFR36: All interactive elements reachable via keyboard
NFR37: Deck builder keyboard-accessible (no drag-and-drop dependency)
NFR38: Card images include descriptive alt text
NFR39: Dynamic content changes announced via aria-live regions
NFR40: Condition badges use both color and text labels (not color-alone)
NFR41: Minimum 4.5:1 contrast ratio for all text content
NFR42: Focus indicators visible on all interactive elements
NFR43: prefers-reduced-motion respected for all animations
NFR44: Form inputs have associated labels; error messages programmatically linked
NFR45: 80%+ test coverage, zero lint errors, TypeScript strict mode
NFR46: All external API calls include timeout (5s), retry (3x exponential backoff), and circuit breaker
NFR47: Integration degradation strategies defined for Stripe, Algolia, TCG APIs, Resend, MinIO, and cross-service

### Additional Requirements

**From Architecture:**
- No starter template needed — all four repositories already exist with established foundations
- OAuth providers resolved to Google + Discord + Apple (Discord for TCG community, Apple for iOS)
- Shared JWT secret across both backends for seamless cross-service auth
- Data validation: Zod (backend, storefront, vendorpanel), express-validator (customer-backend)
- API documentation: MedusaJS built-in (backend) + OpenAPI/Swagger (customer-backend)
- Cross-service communication via Redis pub/sub events + REST API calls
- CrossServiceEvent interface with version field required for all Redis events
- Implementation patterns: co-located tests, MedusaError exclusively in backend, MSW for cross-service test mocking
- Naming conventions locked: snake_case DB, camelCase JSONB keys, kebab-case API endpoints
- Money stored as integer smallest-currency-unit with currency field — never floats
- Monitoring: Sentry + Railway Observability (Sentry not yet installed)
- Discord OAuth provider not yet implemented (gap)
- OpenAPI docs for customer-backend not yet implemented (gap)

**From UX Design:**
- "Midnight Forge" visual foundation: dark-first theme with gold (Arcane Gold) for CTAs/value and blue (Mystic Blue) for navigation/interactive
- Design system: shadcn/ui (Radix primitives) + Tailwind CSS + custom TCG components (3-layer architecture)
- shadcn/ui components needed: Sheet, Command, Dialog, AlertDialog, Tooltip, Popover, DropdownMenu, sonner
- Toast notifications via sonner replacing all alert()/confirm()/prompt() calls (37 alert() calls in 11 files)
- Custom Modal (28 files) needs migration to shadcn/ui Dialog + Sheet
- Custom ToastProvider (21 files) needs migration to sonner
- Mobile-first responsive design: bottom nav on mobile, top nav on tablet+
- Touch-first deck builder: tap-to-add via bottom sheet (no hover dependency)
- Game-adaptive card templates: re-prioritize card fields per game
- Card detail page is the "gravitational center" — all journeys converge there
- BFF aggregation endpoint required for card detail page (both backends)
- Cart optimizer presentation: bottom sheet (mobile) / side panel (desktop) with progressive results
- 3-step listing wizard (not 8-section form): Identify -> Condition + Photos -> Price + Confirm
- Market price pre-filled in listing flow with competitive indicator
- Seller shipping configuration integrated into listing wizard Step 3
- Three-step escrow visualization for order tracking (Payment Secured -> Seller Ships -> Buyer Confirms)
- Public deck discovery page (/decks) with trending, filtering, and social elements
- Wishlist page with price change tracking and notification toggles
- Dispute opening flow with photo evidence upload and side-by-side comparison
- Seller order fulfillment with inline tracking entry and game-specific packing guidance
- Progressive disclosure search via Command palette (cmdk)
- Onboarding: game selection -> optional collection import -> personalized experience
- Deferred auth: browse/search without sign-in, auth gate only on write actions
- Game-contextual condition defaults (MTG: any playable NM/LP, Pokemon: NM)
- Typography: Inter (body) + Geist Sans (display) + Geist Mono (code)
- Game-specific rarity color tokens (MTG, Pokemon, Yu-Gi-Oh!, One Piece)
- MTG mana color tokens for filters and deck builder
- Card-shaped skeleton loading placeholders (2.5:3.5 ratio)
- Dense list view for vendor/seller dashboard
- Input-adaptive density: @media (pointer: fine) for mouse, (pointer: coarse) for touch
- Skip links, screen reader support, focus management per WCAG guidelines
- Image loading: next/image with blur placeholder, WebP/AVIF, LQIP, responsive sizes
- Network-aware behavior: detect slow connections, reduce grid columns, defer non-critical images

### FR Coverage Map

FR1: Epic 1 — OAuth registration/login (Google, Discord, Apple)
FR2: Epic 1 — User profile management (display name, avatar, shipping address)
FR3: Epic 1 — Role-based access control (buyer, seller, vendor, admin)
FR4: Epic 1 — Session persistence across browser sessions and services
FR5: Epic 1 — Unauthenticated browsing of cards, search, public decks
FR6: Epic 2 — Universal card catalog with game-specific attributes
FR7: Epic 2 — Card search with instant autocomplete
FR8: Epic 2 — Faceted search filters (game, set, rarity, condition, price, format, location)
FR9: Epic 2 — Card detail page aggregating catalog + market pricing + listings (BFF)
FR10: Epic 2 — Automated ETL pipelines for all four games (catalog seeding)
FR11: Epic 2 — SEO: structured data, Open Graph metadata, indexable pages
FR12: Epic 2 — (Growth) Wishlist for future purchase consideration
FR13: Epic 2 — Recently viewed cards
FR14: Epic 2 — Sort results by price, seller rating, or relevance
FR15: Epic 3 — Create, edit, save, delete decks for any game/format
FR16: Epic 3 — Add cards via search with real-time format legality validation
FR17: Epic 3 — "I own this" toggle for collection tracking
FR18: Epic 3 — Deck summary: total, owned, needed, estimated cost
FR19: Epic 3 — Public deck sharing with card images and OG metadata
FR20: Epic 3 — Import shared public decks
FR21: Epic 3 — Auto-update collection on purchase receipt confirmation
FR22: Epic 3 — Duplicate existing deck
FR23: Epic 3 — Game-specific deck zones (mainboard, sideboard, extra deck)
FR24: Epic 3 — Browse and discover publicly shared decks
FR25: Epic 5 — Add listings to cart from card detail, search, or deck builder
FR26: Epic 5 — Cart optimizer: cheapest total, fewest packages, best value
FR27: Epic 5 — Shipping-aware cart optimization
FR28: Epic 5 — Multi-vendor single-transaction checkout
FR29: Epic 5 — Independent sub-orders per seller with separate tracking
FR30: Epic 5 — Order status, tracking, receipt confirmation
FR31: Epic 5 — Toast notifications for all key events (no alert() dialogs)
FR32: Epic 5 — Listing quantity decrement on purchase
FR33: Epic 4 — Guided multi-step listing flow with market pricing
FR34: Epic 4 — Game-specific visual grading guides with photo examples
FR35: Epic 4 — Card photo upload (front and back)
FR36: Epic 4 — CSV inventory import with catalog matching (auto/fuzzy/unmatched)
FR37: Epic 4 — Fuzzy match review and resolution UI
FR38: Epic 4 — Manage active listings (edit price, condition)
FR39: Epic 4 — Sale notifications and order fulfillment management
FR40: Epic 4 — Bulk price updates via rules or CSV re-import
FR41: Epic 4 — Shipping rate/method/region configuration
FR42: Epic 4 — Shipment tracking entry (carrier + tracking number)
FR43: Epic 4 — (Growth) Listing performance metrics
FR44: Epic 6 — Stripe Connect onboarding with identity verification
FR45: Epic 6 — Commission collection and automated seller payouts
FR46: Epic 6 — Seller tax information collection (1099-K)
FR47: Epic 6 — Sales tax calculation and collection (marketplace facilitator)
FR48: Epic 7 — Price anomaly detection (>50% below market)
FR49: Epic 7 — Buyer dispute opening with photo evidence
FR50: Epic 7 — Admin dispute resolution with photo comparison + refunds
FR51: Epic 7 — Seller trust score accumulation
FR52: Epic 7 — Business seller application review (approve/reject)
FR53: Epic 7 — Auto-deactivation after 3+ unfulfilled orders in 30 days
FR54: Epic 7 — Admin suspend/ban sellers and cancel listings
FR55: Epic 7 — All prices from real data or verified market sources
FR56: Epic 8 — Flagged listing review queue
FR57: Epic 8 — Catalog management (ETL triggers, manual card entry)
FR58: Epic 8 — Automated financial reconciliation
FR59: Epic 8 — Referential integrity across both backends
FR60: Epic 8 — Transactional email notifications
FR61: Epic 8 — (Growth) Platform metrics dashboard
HPR-FR1:  Epic 9 — Four-mode homepage architecture (single URL)
HPR-FR2:  Epic 9 — A-static trust strip with config-driven data source
HPR-FR3:  Epic 9 — Personalised three-tile strip (Suspense, server component)
HPR-FR4:  Epic 9 — BFF endpoint GET /api/homepage/context
HPR-FR5:  Epic 9 — Mobile strip collapse to highest-priority tile
HPR-FR6:  Epic 9 — Newcomer orientation banner (sd_first_visit cookie)
HPR-FR7:  Epic 9 — Game selector grid with listing counts + game preference cookie
HPR-FR8:  Epic 9 — Trending Now (3 cards, live prices, 5min TTL)
HPR-FR9:  Epic 9 — Deck of the Day (community deck, build cost, available count)
HPR-FR10: Epic 9 — Format Alert (authenticated, ban list changes, 24h TTL)
HPR-FR11: Epic 9 — Seller signal (anonymous only, Become a seller →)
FR5 (also): Epic 9 — Anonymous homepage is the primary browsing surface
FR7 (also): Epic 9 — Search bar is the primary above-fold interactive element
FR12 (also): Epic 9 — Watchlist hits surface in personalised strip tile
FR24 (also): Epic 9 — Deck of the Day is the homepage expression of deck discovery

## Epic List

### Epic 1: Authentication & User Profiles
Users can register via social OAuth (Google, Discord, Apple), login, manage their profiles, and have role-based access scoped across all platform services. Unauthenticated users can browse freely.
**FRs covered:** FR1, FR2, FR3, FR4, FR5
**Dependencies:** None — foundational epic
**Implementation notes:** Discord OAuth provider not yet implemented (architecture gap). Shared JWT secret across both backends. Deferred auth pattern — auth gate only on write actions.

### Epic 2: Card Catalog & Discovery
The platform seeds its catalog via automated ETL pipelines from external data sources (Scryfall, Pokemon TCG API, etc.) for all four TCG games. Users can then search with instant autocomplete, filter by game/set/rarity/condition/price/format, view rich card detail pages aggregating both backends, and browse recently viewed cards. Card pages are SEO-optimized with structured data and OG metadata.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11, FR12 (Growth), FR13, FR14
**Dependencies:** Epic 1 (auth for personalized features like recently viewed, wishlists)
**Implementation notes:** ETL pipeline seeding (FR10) is the first priority — without catalog data, nothing else works. Existing `customer-backend/src/scripts/master-etl.ts` is the foundation. BFF aggregation endpoint required for card detail page (both backends). Progressive disclosure search via Command palette (cmdk). Game-adaptive card templates. Midnight Forge design system and shadcn/ui foundation established in this epic's first stories.

### Epic 3: Deck Building & Collection
Users can create decks for any supported game and format, add cards via search with real-time format legality validation, manage game-specific zones (mainboard, sideboard, extra deck), toggle "I own this" to track their collection, view deck summaries with cost estimates, share decks publicly, import shared decks, duplicate decks, and browse community decks.
**FRs covered:** FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24
**Dependencies:** Epic 2 (card catalog for card search and data)
**Implementation notes:** Touch-first mobile deck builder with tap-to-add via bottom sheet (no hover dependency). Desktop uses drag-and-drop. DeckBuilderShell, DeckStats, and game-specific validation. Public deck discovery page (/decks) with trending and filtering. Collection auto-update on purchase (FR21) requires Epic 4 integration.

### Epic 4: Seller Listing & Fulfillment
Buyers can upgrade to individual sellers. Individual sellers can list cards via a guided 3-step flow (Identify → Condition + Photos → Price + Confirm) with market pricing pre-filled and game-specific grading guides. Business sellers can import inventory via CSV with catalog matching (85% auto / 10% fuzzy / 5% unmatched). All sellers can manage listings, configure shipping, fulfill orders with tracking, and update pricing.
**FRs covered:** FR33, FR34, FR35, FR36, FR37, FR38, FR39, FR40, FR41, FR42, FR43 (Growth)
**Dependencies:** Epic 1 (auth + seller role), Epic 2 (catalog for card matching)
**Implementation notes:** Individual seller upgrade flow as first story. 3-step listing wizard (not 8-section form). Market price with competitive indicator. Game-contextual condition defaults. Shipping config integrated into Step 3. Seller order fulfillment with inline tracking entry and packing guidance. Dense list view for seller dashboard. Sellers must create listings before Epic 5 (Commerce) has inventory to sell.

### Epic 5: Commerce & Cart Optimization
Users can add cards to a shopping cart from anywhere (card detail, search results, deck builder), trigger the cart optimizer to find the best combination of sellers for missing deck cards (cheapest total, fewest packages, best value) with shipping-aware calculations, complete multi-vendor checkout in a single transaction, and track orders with receipt confirmation.
**FRs covered:** FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32
**Dependencies:** Epic 2 (catalog), Epic 4 (seller listings must exist), Epic 6 (Stripe Connect for payment processing)
**Implementation notes:** Cart optimizer is the killer feature — bottom sheet (mobile) / side panel (desktop) with progressive results. Three-step escrow visualization for order tracking. Toast notifications via sonner (FR31) — alert() migration. Multi-vendor orders create independent sub-orders per seller.

### Epic 6: Payments & Seller Onboarding
Sellers onboard to Stripe Connect with identity verification, the platform collects commission on each transaction and distributes seller portions via automated payouts, seller tax information is collected for 1099-K compliance, and sales tax is calculated and collected in marketplace facilitator jurisdictions.
**FRs covered:** FR44, FR45, FR46, FR47
**Dependencies:** Epic 5 (seller listings generate transactions)
**Implementation notes:** Stripe Connect Custom/Express accounts. Webhook signature verification. Idempotency keys for payout processing. Tax calculation service (Stripe Tax / TaxJar / Avalara).

### Epic 7: Marketplace Trust & Safety
The platform automatically detects price anomalies before listings go live, buyers can open disputes with photo evidence, admins resolve disputes by comparing seller vs. buyer photos, sellers accumulate trust scores, admins review business seller applications, and the system auto-deactivates listings from unreliable sellers.
**FRs covered:** FR48, FR49, FR50, FR51, FR52, FR53, FR54, FR55
**Dependencies:** Epic 4 (orders for disputes), Epic 5 (listings for anomaly detection), Epic 6 (payments for refunds)
**Implementation notes:** Dispute flow with photo upload and side-by-side comparison. Trust score based on transaction history, disputes, fulfillment. Price anomaly threshold: >50% below 30-day average. All displayed prices must be from real data (FR55).

### Epic 8: Platform Administration & Operations
Admins can review flagged listings, manage the card catalog (trigger ETL updates, manually add cards), run automated financial reconciliation, monitor referential integrity across both backends, and send transactional email notifications for key platform events.
**FRs covered:** FR56, FR57, FR58, FR59, FR60, FR61 (Growth)
**Dependencies:** All previous epics (admin operations span the entire platform)
**Implementation notes:** Admin via MedusaJS admin API for MVP. Transactional emails via Resend. Financial reconciliation between order records and Stripe data. Referential integrity monitoring between catalog (sidedecked-db) and product listings (mercur-db).

### Epic 9: Storefront Homepage Redesign
Every visitor experiences a homepage matched to their mode the moment they land. Anonymous visitors can evaluate the marketplace in under 10 seconds. Returning users restore their context in under 3 taps. Seller evaluators see a clear entry point without scrolling. Newcomers receive orientation before any marketplace content. The homepage becomes the first working demonstration of SideDecked's core differentiator — a platform that knows you.
**FRs covered:** HPR-FR1, HPR-FR2, HPR-FR3, HPR-FR4, HPR-FR5, HPR-FR6, HPR-FR7, HPR-FR8, HPR-FR9, HPR-FR10, HPR-FR11, FR5 (also), FR7 (also), FR12 (also), FR24 (also)
**Dependencies:** Epic 1 (auth detection for personalised strip and format alert), Epic 2 (card catalog for game listing counts and trending cards), Epic 3 (deck data for personalised strip tile and Deck of the Day)
**Implementation notes:** Six stories in dependency order: anonymous hero foundation → game selector → BFF endpoint → personalised strip → newcomer banner → serendipity layer. Stories 9.5 and 9.6 are parallel-capable after 9.3. Design system: Midnight Forge tokens, Rajdhani display font, DM Sans body, DM Mono prices. Prototype: `_bmad-output/planning-artifacts/homepage-redesign-prototype-v1.html`. Test guide: `_bmad-output/planning-artifacts/ux-a3-usability-test-guide.html`.

## Epic 1: Authentication & User Profiles

Users can register via social OAuth (Google, Discord, Apple), login, manage their profiles, and have role-based access scoped across all platform services. Unauthenticated users can browse freely.

### Story 1.1: Social OAuth Registration & Login

As a user,
I want to sign up and sign in using my Google or Discord account,
So that I can access SideDecked without creating a separate password.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I click "Sign in with Google"
**Then** I am redirected to Google's OAuth consent screen, authenticated, and returned to SideDecked with an active session

**Given** I am on the login page
**When** I click "Sign in with Discord"
**Then** I am redirected to Discord's OAuth consent screen, authenticated, and returned to SideDecked with an active session

**Given** I successfully authenticate via OAuth for the first time
**When** the OAuth flow completes
**Then** a user account is created with the default "buyer" role and a JWT valid across both backend services

**Given** I am authenticated
**When** I close and reopen my browser
**Then** my session persists via refresh token rotation and I remain logged in

**Given** I attempt to sign in more than 10 times within a minute from the same IP
**When** the rate limit is reached
**Then** further attempts are blocked with an appropriate error message

### Story 1.2: User Profile Management

As a registered user,
I want to manage my display name, avatar, and shipping address,
So that sellers can ship to me and other users can identify me on the platform.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I navigate to my profile settings
**Then** I can view and edit my display name, avatar, and shipping address

**Given** I am a new user after first OAuth login
**When** I land on the platform
**Then** I am prompted to set a display name and select my preferred TCG games (multi-select: MTG, Pokemon, Yu-Gi-Oh!, One Piece)

**Given** I save profile changes
**When** the update succeeds
**Then** my profile is persisted and I receive a toast confirmation

**Given** I leave required fields empty
**When** I attempt to save
**Then** inline validation errors appear with clear guidance

### Story 1.3: Role-Based Access Control

As a platform operator,
I want users' access scoped to their role (buyer, individual seller, business seller, admin),
So that each user sees only the features relevant to their permissions.

**Acceptance Criteria:**

**Given** I am a buyer (default role)
**When** I navigate the platform
**Then** I can browse, search, purchase, and build decks but cannot access seller dashboards or admin routes

**Given** I am an individual seller
**When** I access the platform
**Then** I have buyer capabilities plus listing, fulfillment, and seller dashboard access

**Given** I am a business seller
**When** I access the platform
**Then** I have seller capabilities plus CSV import, bulk pricing, and vendor analytics

**Given** I am an admin
**When** I access admin routes
**Then** I have full platform access including moderation, catalog management, and dispute resolution

**Given** any user attempts to access a route above their role level
**When** the server-side middleware checks their JWT claims
**Then** a 403 Forbidden response is returned and the user is redirected appropriately

### Story 1.4: Unauthenticated Browsing & Deferred Auth

As a visitor who hasn't signed up,
I want to browse cards, search, and view public decks without creating an account,
So that I can evaluate the platform before committing.

**Acceptance Criteria:**

**Given** I am not signed in
**When** I visit the storefront
**Then** I can browse card listings, use search with autocomplete, and view public deck pages

**Given** I am not signed in
**When** I attempt a write action (add to cart, add to deck, list a card)
**Then** a gentle auth prompt appears with OAuth options (Google/Discord) and my intended action is preserved and completed after successful login

**Given** I am not signed in
**When** I open a shared deck link
**Then** I can view the full deck with card images, stats, and cost estimate, with an "Import to My Decks" CTA that triggers auth on click

**Given** I complete OAuth after being prompted by a write action
**When** authentication succeeds
**Then** I am returned to my original context and my intended action completes automatically

## Epic 2: Card Catalog & Discovery

The platform seeds its catalog via automated ETL pipelines from external data sources for all four TCG games. Users can then search with instant autocomplete, filter by game/set/rarity/condition/price/format, view rich card detail pages aggregating both backends, and browse recently viewed cards.

### Story 2.1: TCG Catalog ETL Pipeline Seeding

As a platform operator,
I want the card catalog populated with data from all four TCG games via automated ETL,
So that users have real cards to search, browse, and build decks with.

**Acceptance Criteria:**

**Given** the ETL pipeline is triggered for MTG
**When** processing completes
**Then** cards, sets, and prints are populated from Scryfall with game-specific JSONB attributes (manaCost, colorIdentity, power, toughness, typeLine)

**Given** the ETL pipeline is triggered for Pokemon
**When** processing completes
**Then** cards are populated with Pokemon-specific attributes (hp, retreatCost, weakness, stage, evolvesFrom)

**Given** the ETL pipeline is triggered for Yu-Gi-Oh!
**When** processing completes
**Then** cards are populated with Yu-Gi-Oh!-specific attributes (attackPoints, defensePoints, level, attribute, monsterType)

**Given** the ETL pipeline is triggered for One Piece
**When** processing completes
**Then** cards are populated with One Piece-specific attributes (power, cost, counterValue, color, attribute)

**Given** each card is imported
**When** a CatalogSKU is generated
**Then** it follows the format `{GAME}-{SET}-{NUMBER}-{LANG}-{CONDITION}-{FINISH}`

**Given** the ETL pipeline fails mid-execution
**When** the failure is detected
**Then** existing catalog data is not corrupted (atomic batch updates with rollback) and the failure is logged

### Story 2.2: Storefront Design Foundation & Card Display

As a user browsing SideDecked,
I want the storefront to render cards beautifully with game-specific styling,
So that I can visually identify cards, rarities, and prices at a glance.

**Acceptance Criteria:**

**Given** the storefront is loaded
**When** any page renders
**Then** the Midnight Forge dark-first palette is applied (CSS variable tokens for surfaces, Arcane Gold accents, Mystic Blue interactive)

**Given** shadcn/ui is initialized
**When** components are rendered
**Then** Sheet, Command, Dialog, AlertDialog, Tooltip, Popover, DropdownMenu, and sonner are available and styled with Midnight Forge tokens

**Given** a card is rendered in any context (search, detail, deck builder)
**When** the CardDisplay component renders
**Then** it shows card image (2.5:3.5 ratio, never stretched), name, set icon, and game-specific rarity badge with color + text label

**Given** a card is loading
**When** the skeleton placeholder renders
**Then** it matches the card shape (2.5:3.5 aspect ratio, rounded corners)

**Given** a price is displayed
**When** the PriceTag component renders
**Then** prices use Inter with tabular figures (`font-feature-settings: 'tnum'`), gold color (`--text-price`), and money stored as smallest-currency-unit integers

**Given** any existing `alert()` or `confirm()` call is encountered
**When** the toast migration is applied
**Then** all 37 alert() calls across 11 files are replaced with sonner toast notifications

### Story 2.3: Algolia Search Index & Card Search with Autocomplete

As a user,
I want to search for cards with instant autocomplete across all four games,
So that I can find specific cards in under a second.

**Acceptance Criteria:**

**Given** the catalog is populated
**When** the Algolia sync job runs
**Then** all cards are indexed in Algolia with game, set, rarity, format legality, and pricing facets

**Given** I focus the search bar
**When** I type 2+ characters
**Then** autocomplete suggestions appear in < 200ms with card names, set context, and game badge

**Given** I type a search query
**When** results load
**Then** cards are displayed in a responsive grid (2 columns mobile, 3 tablet, 4-5 desktop) using the CardDisplay component

**Given** I press Enter or tap "View All Results"
**When** the full results page loads
**Then** I see all matching cards with PriceTag showing lowest available price and seller count

**Given** I misspell a card name
**When** zero results would be returned
**Then** Algolia provides fuzzy match suggestions ("Did you mean...?")

### Story 2.4: Faceted Search Filters & Sorting

As a user searching for cards,
I want to filter by game, set, rarity, condition, price range, format legality, and seller location, and sort results,
So that I can narrow down exactly the cards I need.

**Acceptance Criteria:**

**Given** I am on the search results page
**When** filters are displayed
**Then** each facet shows real-time count of matching results (e.g., "MTG (2,340)", "Near Mint (890)")

**Given** I select a game filter
**When** results update
**Then** only cards from that game are shown and other facets update their counts accordingly

**Given** I apply multiple filters (e.g., game: MTG, set: Dominaria United, rarity: Mythic Rare)
**When** results update
**Then** results reflect all combined filters and I can clear individual filters or "Clear All"

**Given** I want to sort results
**When** I select a sort option
**Then** results re-order by price (low-high, high-low), seller rating, or relevance (default)

**Given** I am on mobile
**When** I tap the filter icon
**Then** filters appear in a bottom sheet with apply/clear actions

### Story 2.5: Card Detail Page (BFF Endpoint)

As a user viewing a specific card,
I want to see all information aggregated: catalog data, market pricing, and all active listings,
So that I can make an informed purchase decision from a single page.

**Acceptance Criteria:**

**Given** I navigate to a card detail page
**When** the BFF endpoint responds
**Then** data is aggregated from both customer-backend (catalog, pricing) and backend (active listings, seller info) into a single response

**Given** the card detail page renders
**When** I view the page
**Then** I see card image (full-bleed), game-specific attributes, set info, format legality, and all active listings sorted by price + condition

**Given** listings are displayed
**When** I view seller rows
**Then** each shows seller name, trust signal ("99.2% positive · 412 sales"), condition, price, shipping estimate, and "Add to Cart" button

**Given** the backend (listings) is temporarily unavailable
**When** the BFF endpoint degrades
**Then** catalog data still renders with a notice: "Seller listings temporarily unavailable" (circuit breaker graceful degradation)

**Given** the card has multiple printings
**When** I view the card detail page
**Then** other printings are shown with links to their respective detail pages

### Story 2.6: Card Detail SEO & Social Metadata

As a platform operator,
I want card detail pages to be indexable by search engines and shareable on social media,
So that cards rank in Google and shared links render rich previews.

**Acceptance Criteria:**

**Given** a search engine crawls a card detail page
**When** the page is rendered via SSR
**Then** it includes JSON-LD structured data (Product schema) with name, image, price range, availability, and AggregateOffer

**Given** a card link is shared on Discord, Twitter, or other platforms
**When** the social preview renders
**Then** Open Graph tags display the card image, card name, price range, and SideDecked branding

**Given** a card exists in multiple printings
**When** each printing has its own URL (`/cards/[game]/[slug]`)
**Then** canonical URLs prevent duplicate content across printings

**Given** the sitemap is generated
**When** a daily cron runs
**Then** a dynamic XML sitemap includes all cards with active listings, prioritized by listing count

### Story 2.7: Recently Viewed Cards

As a returning user,
I want to see cards I recently viewed,
So that I can quickly return to cards I was considering.

**Acceptance Criteria:**

**Given** I am authenticated and view a card detail page
**When** the page loads
**Then** the card is added to my recently viewed list (max 50, FIFO)

**Given** I navigate to the recently viewed section
**When** the list renders
**Then** I see cards I viewed in reverse chronological order with CardDisplay, PriceTag, and game badge

**Given** I am not authenticated
**When** I browse cards
**Then** recently viewed is tracked in local storage and synced to my account on login

### Story 2.8: Wishlist & Price Tracking (Growth)

As a user interested in specific cards,
I want to save cards to a wishlist and track their price changes,
So that I can buy when the price drops or when the card becomes available.

**Acceptance Criteria:**

**Given** I am on a card detail page
**When** I click "Add to Wishlist"
**Then** the card is saved with the current price and I receive a toast confirmation

**Given** I navigate to my wishlist page (`/wishlist`)
**When** the page renders
**Then** I see wishlisted cards with: current price, price when wishlisted, price change indicator (green down / red up / grey stable), and notification toggle

**Given** a wishlisted card's price drops
**When** the notification toggle is enabled
**Then** I receive a notification about the price change

**Given** I want to remove a card from my wishlist
**When** I swipe left (mobile) or click remove
**Then** the card is removed with a 5-second undo toast

## Epic 3: Deck Building & Collection

Users can create decks for any supported game and format, add cards via search with real-time format legality validation, manage game-specific zones, toggle "I own this" to track their collection, view deck summaries with cost estimates, share decks publicly, import shared decks, duplicate decks, and browse community decks.

### Story 3.1: Deck Creation & Management

As a TCG player,
I want to create, edit, save, delete, and duplicate decks for any supported game and format,
So that I can manage my deck collection across all games I play.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I create a new deck
**Then** I can select a game (MTG, Pokemon, Yu-Gi-Oh!, One Piece) and format, name the deck, and it is saved to my collection

**Given** I have existing decks
**When** I view my deck list
**Then** I see all my decks with name, game badge, format, card count, and estimated cost

**Given** I want to modify a deck
**When** I edit a deck
**Then** I can rename it, change format, and delete it with confirmation (AlertDialog for irreversible delete)

**Given** I want to create a variant
**When** I duplicate a deck
**Then** a copy is created with "(Copy)" appended to the name, preserving all cards and ownership status

### Story 3.2: Deck Builder — Card Search & Adding

As a deck builder,
I want to search for cards and add them to my deck with real-time format validation,
So that I can build a tournament-legal deck efficiently.

**Acceptance Criteria:**

**Given** I am in the deck builder
**When** I search for a card
**Then** results appear via Algolia with game-filtered autocomplete and I can add cards to the deck

**Given** I am on desktop
**When** I drag a card from search results to my decklist
**Then** the card is added to the appropriate zone with a ghost preview during drag

**Given** I am on mobile
**When** I tap a card in search results
**Then** a bottom sheet (Sheet component) appears with card image, stats, quantity controls, zone selector, and "Add to Deck" button

**Given** I add a card that violates format rules (banned, over copy limit)
**When** validation runs in real-time
**Then** the violation is shown with a specific message (amber for restricted, red for banned) and the card is still addable with a warning

**Given** I add cards to a deck
**When** the deck is valid for the selected format
**Then** a green "Format Legal" indicator is displayed

### Story 3.3: Game-Specific Deck Zones

As a deck builder,
I want game-specific deck zones (mainboard, sideboard, extra deck),
So that my deck structure matches the rules of my game.

**Acceptance Criteria:**

**Given** I am building an MTG deck
**When** the deck builder renders
**Then** I see Mainboard (60+ cards) and Sideboard (up to 15 cards) zones

**Given** I am building a Yu-Gi-Oh! deck
**When** the deck builder renders
**Then** I see Main Deck (40-60), Extra Deck (up to 15), and Side Deck (up to 15) zones

**Given** I am building a Pokemon deck
**When** the deck builder renders
**Then** I see a single Deck zone (exactly 60 cards) with card type constraints (Pokemon, Trainer, Energy)

**Given** I am building a One Piece deck
**When** the deck builder renders
**Then** I see Leader (1 card) and Main Deck (50 cards) zones

**Given** I move a card between zones
**When** the move completes
**Then** the card appears in the target zone and deck stats update in real-time

### Story 3.4: Deck Stats & Summary

As a deck builder,
I want to see real-time deck statistics including cards owned, cards needed, and estimated cost,
So that I know my deck's status and what it will cost to complete.

**Acceptance Criteria:**

**Given** I am in the deck builder
**When** the DeckStats panel renders
**Then** I see game-specific stats: mana curve (MTG), energy distribution (Pokemon), attribute breakdown (Yu-Gi-Oh!), and card type counts

**Given** I have toggled "I own this" on some cards
**When** the deck summary updates
**Then** it shows total cards, cards owned, cards needed, and estimated cost of missing cards based on lowest available prices

**Given** I toggle "I own this" on a card
**When** the toggle updates
**Then** the card's ownership state persists across sessions and the summary recalculates immediately

**Given** I own some but not all copies of a card (e.g., need 4, own 2)
**When** I set partial ownership
**Then** the quantity picker shows "Need 4, own 2, buy 2" and only the missing quantity is counted in the cost estimate

**Given** I am on mobile
**When** the deck builder renders
**Then** DeckStats appears as a collapsible compact bar showing card count + missing count + estimated cost

### Story 3.5: Public Deck Sharing

As a deck builder,
I want to share my deck via a public URL with card images and social metadata,
So that other players can view, discuss, and import my deck.

**Acceptance Criteria:**

**Given** I set a deck to public
**When** the public URL is generated
**Then** the deck is viewable at `/decks/[id]` without authentication, showing full decklist with card images, stats, and cost estimate

**Given** a deck link is shared on Discord, Twitter, or Reddit
**When** the social preview renders
**Then** Open Graph tags display a card art collage, deck name, card count, and game badge

**Given** a viewer opens a public deck
**When** they click "Import to My Decks"
**Then** a copy of the deck is added to their collection (auth required, triggering deferred auth if needed)

**Given** a public deck contains cards that have been removed from the catalog
**When** the deck loads
**Then** placeholders appear for removed cards with "Card unavailable — suggest replacement?"

### Story 3.6: Public Deck Discovery

As a TCG player,
I want to browse and discover publicly shared decks without a direct link,
So that I can find popular decks for my game and format.

**Acceptance Criteria:**

**Given** I navigate to `/decks`
**When** the page renders
**Then** I see a grid of public decks with: deck name, game badge, format badge, card count, creator avatar + name, and estimated cost

**Given** the deck discovery page loads
**When** the featured section renders
**Then** "Trending Decks This Week" is displayed at the top, sorted by imports + views

**Given** I want to find specific decks
**When** I apply filters
**Then** I can filter by game, format, price range, card count, and recency, and sort by trending, newest, most imported, or cheapest

**Given** I tap a deck card
**When** the deck view page loads
**Then** I see the full decklist with card images, stats, and an "Import to My Decks" CTA

**Given** deck results appear in universal search
**When** I search for a term
**Then** matching decks appear under a "Decks" tab alongside Cards and Listings results

### Story 3.7: Collection Auto-Update on Purchase

As a deck builder who buys cards through SideDecked,
I want my collection to automatically update when purchased cards are delivered,
So that my deck builder reflects what I actually own without manual entry.

**Acceptance Criteria:**

**Given** I purchased cards through the cart optimizer for a specific deck
**When** I confirm receipt of the shipment
**Then** the purchased cards are automatically marked as "owned" in all decks that contain them

**Given** my collection updates
**When** I open the deck builder
**Then** previously "needed" cards now show as "owned" with a subtle visual indicator (green glow)

**Given** the collection auto-update runs
**When** the deck summary recalculates
**Then** the missing card count and estimated cost decrease to reflect the new ownership

## Epic 4: Seller Listing & Fulfillment

Buyers can upgrade to individual sellers. Individual sellers can list cards via a guided 3-step flow with market pricing pre-filled and game-specific grading guides. Business sellers can import inventory via CSV with catalog matching. All sellers can manage listings, configure shipping, fulfill orders with tracking, and update pricing.

### Story 4.1: Individual Seller Upgrade

As a buyer,
I want to upgrade my account to an individual seller,
So that I can list cards for sale on the marketplace.

**Acceptance Criteria:**

**Given** I am an authenticated buyer
**When** I click "Start Selling" (from storefront nav, card detail "Sell this card", or profile settings)
**Then** I see a guided onboarding flow explaining what selling involves and what's needed

**Given** I am in the seller upgrade flow
**When** I complete the required steps (accept seller terms, confirm shipping address, select preferred games)
**Then** my account role is upgraded to "individual seller" and I land on my empty seller dashboard

**Given** I am a newly upgraded seller
**When** my seller dashboard loads
**Then** I see a welcome state with "List Your First Card" CTA and a brief guide on how listing works

**Given** I am an individual seller
**When** Stripe Connect onboarding is required for payouts
**Then** I am guided to complete Stripe Connect Express setup (handled in Epic 6) but can list cards before completing it

**Given** I have not completed Stripe Connect
**When** I list a card
**Then** a persistent banner reminds me: "Complete payout setup to receive payments when your cards sell"

### Story 4.2: Guided Card Listing — Card Identification

As an individual seller,
I want to find the exact card I'm selling via search with set/printing selection,
So that my listing is accurately linked to the correct catalog entry.

**Acceptance Criteria:**

**Given** I start the listing flow (from "List a Card" or "Sell this card" on a card detail page)
**When** Step 1 renders
**Then** I see a search field with Algolia autocomplete for card name, with results showing card image and set selector

**Given** I search for a card
**When** I select a result
**Then** I can choose the exact printing: set, language, and foil/non-foil variant

**Given** I arrived from a card detail page ("Sell this card")
**When** Step 1 loads
**Then** the card is pre-filled and I skip directly to Step 2

**Given** my card is not found in the catalog
**When** search returns no results
**Then** I see "Can't find this card? Request it to be added" with a game/set context form

**Given** the listing wizard is active
**When** a step indicator renders
**Then** it shows 3 steps (horizontal on desktop, vertical on mobile) with the current step highlighted in gold

### Story 4.3: Guided Card Listing — Condition & Photos

As an individual seller,
I want game-specific grading guidance with photo examples and the ability to upload card photos,
So that buyers trust my condition assessment and my listing sells.

**Acceptance Criteria:**

**Given** I am on Step 2 (Condition + Photos)
**When** the condition selector renders
**Then** I see game-contextual condition options (NM, LP, MP, HP, DMG) with photo examples specific to my card's game

**Given** I am listing an MTG card
**When** condition photo examples render
**Then** they show MTG-specific wear patterns (edge whitening, surface scratches, foil clouding)

**Given** I am listing a Yu-Gi-Oh! card
**When** condition photo examples render
**Then** they show Yu-Gi-Oh!-specific patterns (different card stock wear, foil types)

**Given** I upload card photos
**When** the upload completes
**Then** front and back photos are stored in MinIO, validated for file type and size (< 10MB), and previewed inline

**Given** I skip photo upload
**When** I proceed without photos
**Then** a gentle nudge appears: "Listings with photos sell 3x faster" but I can continue

### Story 4.4: Guided Card Listing — Pricing & Confirmation

As an individual seller,
I want market pricing pre-filled with context so I can set a competitive price,
So that I feel confident about my pricing and my card sells quickly.

**Acceptance Criteria:**

**Given** I am on Step 3 (Price + Confirm)
**When** the pricing section renders
**Then** market price is pre-filled showing: suggested price, range (low-high), and recent sales with dates

**Given** I adjust the price
**When** I enter a custom price
**Then** a competitive indicator updates: "Priced to sell! Below average" or "Priced above market — may take longer to sell"

**Given** I set a price significantly below market (>50% below average)
**When** the price is entered
**Then** a warning appears: "This price is significantly below market. Are you sure?"

**Given** the shipping section renders on Step 3
**When** I configure shipping
**Then** I see shipping method (Standard Mail / Tracked Package), rate (pre-filled with market range), ships-from (auto-filled from profile), and ships-to (Domestic / International checkboxes)

**Given** I am a returning seller
**When** Step 3 loads
**Then** my last-used shipping configuration is pre-filled with a "Use same shipping as last listing" toggle

**Given** I click "List Card"
**When** the listing is submitted
**Then** the listing goes live, I see "Your listing is live!" with a shareable public link, a "Share on Discord/Twitter" CTA, and a "List Another Card" button

### Story 4.5: CSV Inventory Import & Catalog Matching

As a business seller,
I want to upload my inventory via CSV and have cards automatically matched to the catalog,
So that I can list thousands of cards without entering each one individually.

**Acceptance Criteria:**

**Given** I am a business seller in the vendor panel
**When** I upload a CSV inventory file
**Then** the parser auto-detects common formats (TCGPlayer, Crystal Commerce, manual) and maps columns

**Given** the CSV is processed
**When** catalog matching runs
**Then** results are categorized into three tiers: auto-matched (~85%, high-confidence exact SKU or pg_trgm > 0.7), fuzzy review (~10%, multiple potential matches), and unmatched (~5%, no catalog match)

**Given** auto-matched cards
**When** they are displayed
**Then** they show the matched catalog card with image side-by-side with the CSV row data

**Given** duplicate listings are detected in the CSV
**When** duplicates are flagged
**Then** a warning appears with merge options

**Given** the CSV has format mismatches or errors
**When** validation runs
**Then** errors are highlighted inline per row with specific messages (e.g., "Invalid condition: 'Excellent' — use NM, LP, MP, HP, or DMG")

### Story 4.6: Fuzzy Match Review & Resolution

As a business seller,
I want to review and resolve fuzzy-matched and unmatched cards from my CSV import,
So that all my inventory is accurately linked to the catalog.

**Acceptance Criteria:**

**Given** fuzzy-matched cards exist from my CSV import
**When** I open the review interface
**Then** each fuzzy match shows my CSV row alongside 2-3 potential catalog matches with images, and I can select the correct one or mark as "not found"

**Given** unmatched cards exist
**When** I view them
**Then** I can manually search the catalog to link them, or flag them for catalog team review

**Given** I resolve all fuzzy matches
**When** I confirm the batch
**Then** all resolved listings go live and I see a summary: "X listings live, Y flagged for review"

### Story 4.7: Listing Management & Pricing

As a seller,
I want to view and manage my active listings, edit prices, and update inventory,
So that my storefront stays current and competitive.

**Acceptance Criteria:**

**Given** I open my seller dashboard
**When** the listings tab renders
**Then** I see my active listings in a dense list view with: card image, name, condition, price, quantity, and status

**Given** I want to edit a listing
**When** I click edit on a listing row
**Then** I can update price, condition, quantity, and photos inline without navigating away

**Given** I am a business seller
**When** I want to update prices in bulk
**Then** I can apply pricing rules (e.g., "Match market low -5%" with a floor) or re-import a CSV with updated prices

**Given** I am on mobile
**When** I view my listings
**Then** the view adapts to a card-based layout with key info (name, price, quantity, status) and tap-to-edit

### Story 4.8: Seller Order Fulfillment & Tracking

As a seller who received an order,
I want to manage fulfillment and provide tracking information,
So that buyers can track their shipments and I build a good reputation.

**Acceptance Criteria:**

**Given** I receive an order
**When** I view the order in my seller dashboard
**Then** I see buyer name (not full address until shipment), card(s) purchased, condition, shipping method, and earnings after commission, with a "Ship Now" CTA

**Given** I tap "Ship Now"
**When** the inline fulfillment section expands
**Then** I see carrier selector (USPS, UPS, FedEx, Other), tracking number input with format validation, and a confirm button

**Given** I am a first-time seller
**When** the fulfillment section renders
**Then** a collapsible "How to ship TCG cards safely" section appears with game-specific packing tips (toploaders for holos, penny sleeves for commons)

**Given** I confirm shipment with tracking
**When** the fulfillment is saved
**Then** the order status changes to "Shipped", the buyer is notified with tracking info, and I see a toast: "Tracking added. Buyer notified."

**Given** I am on mobile at the post office
**When** I need to enter tracking
**Then** large tap targets are available and I can scan a barcode via camera input for the tracking number

## Epic 5: Commerce & Cart Optimization

Users can add cards to a shopping cart from anywhere (card detail, search results, deck builder), trigger the cart optimizer to find the best combination of sellers for missing deck cards with shipping-aware calculations, complete multi-vendor checkout in a single transaction, and track orders with receipt confirmation.

### Story 5.1: Shopping Cart Management

As a buyer,
I want to add cards to a shopping cart from card detail pages, search results, or deck builder,
So that I can collect purchases before checkout.

**Acceptance Criteria:**

**Given** I am on a card detail page
**When** I select a seller + condition and click "Add to Cart"
**Then** the card is added to my cart, the cart badge updates, and I receive a toast confirmation with undo option

**Given** I am in search results
**When** I quick-add a card (hover overlay on desktop, long-press on mobile)
**Then** the card is added from the lowest-price seller in the best available condition

**Given** I view my cart
**When** items are displayed
**Then** they are grouped by seller, each showing card image, condition, price, and quantity controls

**Given** I adjust quantity or remove an item
**When** the cart updates
**Then** the change is optimistic (instant UI update) with background sync and a 5-second undo toast for removals

**Given** a listing's quantity reaches zero while it's in my cart
**When** I view my cart
**Then** the unavailable item is highlighted with "Out of stock — remove or find alternative?" and an inline suggestion of the next cheapest seller

### Story 5.2: Cart Optimizer — Deck to Cart

As a deck builder with missing cards,
I want to optimize my purchase across all sellers for the cheapest total, fewest packages, or best value,
So that I get the best deal without manually comparing sellers.

**Acceptance Criteria:**

**Given** I am in the deck builder with missing cards
**When** I tap "Buy Missing Cards"
**Then** a bottom sheet (mobile) or side panel (desktop) opens showing the cart optimizer in progress

**Given** the optimizer is running
**When** results appear progressively
**Then** the first seller match appears in < 1 second, with "Checking N sellers..." animating as more matches resolve

**Given** optimization completes
**When** results are displayed
**Then** I see cards grouped by seller: seller name, card count, subtotal + shipping per seller, total with savings callout ("$26.45 total · saves $8.20")

**Given** I want to toggle optimization mode
**When** I switch between "Lowest Price" and "Fewest Sellers"
**Then** results recalculate and display the new optimal combination

**Given** I want to override a specific card
**When** I tap a card in the optimization results
**Then** I see alternative sellers/conditions for that card and can swap, with the total recalculating in real-time

**Given** a card has no sellers in my preferred condition
**When** the optimizer finds no match
**Then** it shows: "Liliana — no NM sellers. Available in LP from $12.99" with one-tap fallback

**Given** a card has no sellers at all
**When** the optimizer encounters this
**Then** it shows: "3 cards have no sellers. We'll notify you when listed." and proceeds with the remaining cards

### Story 5.3: Multi-Vendor Checkout

As a buyer with a multi-seller cart,
I want to complete checkout in a single transaction with saved payment and shipping info,
So that I don't have to check out separately with each seller.

**Acceptance Criteria:**

**Given** I proceed to checkout with items from multiple sellers
**When** the checkout flow begins
**Then** I see a 3-step flow: Review → Pay → Done, with a step indicator

**Given** I am on the Review step
**When** the order summary renders
**Then** I see per-seller breakdown: cards, subtotal, shipping cost, and handling time, with a total including all shipping

**Given** I am a returning user with saved payment and address
**When** I reach the Pay step
**Then** my saved payment method and shipping address are pre-filled and I can proceed in one tap

**Given** I confirm payment
**When** the transaction processes via Stripe
**Then** a single charge is placed and the platform handles split distribution to sellers

**Given** payment fails
**When** the error occurs
**Then** the order is held for 15 minutes with a retry option and no duplicate charges are created

### Story 5.4: Multi-Vendor Order Creation & Sub-Orders

As a buyer who completed a multi-vendor checkout,
I want independent sub-orders created per seller with separate tracking,
So that I can track each shipment independently.

**Acceptance Criteria:**

**Given** a multi-vendor checkout completes
**When** orders are created
**Then** one sub-order per seller is generated, each with its own order ID and status

**Given** each sub-order is created
**When** the seller is notified
**Then** the seller receives a notification with order details (cards, condition, shipping method, buyer address)

**Given** listing quantities
**When** an order is placed
**Then** purchased quantities are decremented atomically from each listing's available stock

**Given** a listing's quantity would go below zero (race condition)
**When** the order attempts to process
**Then** the affected items are flagged, the buyer is notified, and the remainder of the order proceeds

### Story 5.5: Order Tracking & Receipt Confirmation

As a buyer,
I want to view order status, tracking information, and confirm receipt of shipments,
So that I know where my cards are and can close out orders.

**Acceptance Criteria:**

**Given** I navigate to my orders page
**When** orders are displayed
**Then** each sub-order shows: seller name, cards purchased, status badge, and tracking info (if available)

**Given** a seller adds tracking information
**When** my order status updates
**Then** I see the carrier, tracking number, and a three-step escrow visualization: Payment Secured → Seller Ships → Buyer Confirms

**Given** my shipment is delivered
**When** I open the order
**Then** I see a "Confirm Receipt" button

**Given** I tap "Confirm Receipt"
**When** confirmation processes
**Then** the order status changes to "Completed", the seller's payout is released, and a toast confirms: "Receipt confirmed! Seller has been paid."

**Given** I do not confirm receipt within 14 days of shipment
**When** the auto-confirmation window expires
**Then** the system automatically confirms receipt and releases the seller's payout

### Story 5.6: Toast Notification System

As a user performing actions across the platform,
I want immediate toast feedback for every meaningful action,
So that I always know the result of my actions without disruptive alert dialogs.

**Acceptance Criteria:**

**Given** I perform any cart action (add, remove, quantity change)
**When** the action completes
**Then** a sonner toast appears (success type, 3s auto-dismiss) with the action description and undo option where applicable

**Given** I complete checkout, receive a shipment, or a dispute is resolved
**When** the event triggers
**Then** an appropriate toast appears (success/info) positioned bottom-right on desktop, bottom-center on mobile

**Given** an action fails (network error, out of stock, payment decline)
**When** the error occurs
**Then** a persistent error toast appears with a specific message and recovery action ("Retry" or "Find alternative")

**Given** I am in the deck builder
**When** toasts appear
**Then** they are positioned top-right (desktop) to avoid overlapping the active decklist

**Given** multiple toasts trigger in quick succession
**When** the stack exceeds 3
**Then** the oldest toast is replaced by the newest

## Epic 6: Payments & Seller Onboarding

Sellers onboard to Stripe Connect with identity verification, the platform collects commission on each transaction and distributes seller portions via automated payouts, seller tax information is collected for 1099-K compliance, and sales tax is calculated and collected in marketplace facilitator jurisdictions.

### Story 6.1: Stripe Connect Seller Onboarding

As a seller,
I want to onboard to Stripe Connect with identity verification,
So that I can receive payouts when my cards sell.

**Acceptance Criteria:**

**Given** I am an individual seller who hasn't completed payout setup
**When** I click "Set Up Payouts" (from dashboard banner or settings)
**Then** I am redirected to Stripe Connect Express onboarding with identity verification

**Given** I complete Stripe Connect onboarding
**When** I return to SideDecked
**Then** my account shows "Payouts Active" and I can receive payments from sales

**Given** I am a business seller applying for vendor status
**When** I complete Stripe Connect Business verification
**Then** my account is flagged for admin review (FR52 in Epic 7) with verification status visible

**Given** Stripe requires additional information (e.g., ID document)
**When** the account status is incomplete
**Then** a persistent banner shows: "Action needed: Complete your identity verification to receive payouts" with a link to Stripe's hosted form

**Given** I check my payout status
**When** I navigate to my seller settings
**Then** I see Stripe Connect account status, verification state, and payout schedule

### Story 6.2: Commission Collection & Automated Payouts

As a platform operator,
I want to collect commission on each transaction and distribute seller portions via automated payouts,
So that the marketplace generates revenue and sellers get paid reliably.

**Acceptance Criteria:**

**Given** a buyer completes a purchase
**When** the payment processes via Stripe
**Then** the platform's commission is deducted and the seller's portion is held for payout

**Given** a seller has completed orders with confirmed receipt
**When** the payout schedule triggers
**Then** the seller's accumulated balance is transferred to their bank account via Stripe Connect

**Given** a payout processes
**When** the Stripe webhook fires
**Then** the webhook signature is verified before processing, and the event is handled idempotently (no duplicate payouts)

**Given** a seller views their financial dashboard
**When** the payout history renders
**Then** they see: payout date, amount, commission deducted, orders included, and bank account (last 4 digits)

**Given** a payout fails
**When** Stripe reports the failure
**Then** the seller is notified with the reason and guidance ("Update your bank details" or "Contact support")

### Story 6.3: Seller Tax Information Collection

As a platform operator,
I want to collect seller tax information during onboarding,
So that the platform can issue 1099-K forms to US sellers exceeding IRS thresholds.

**Acceptance Criteria:**

**Given** a seller is onboarding via Stripe Connect
**When** the tax information step renders
**Then** Stripe collects the seller's legal name, address, and tax identification (SSN or EIN) as part of the Connect onboarding flow

**Given** a seller's annual sales exceed $600
**When** the tax year ends
**Then** Stripe Connect generates and delivers the required 1099-K form to the seller and IRS

**Given** a seller has incomplete tax information
**When** they approach the reporting threshold
**Then** a notification prompts them to complete their tax details via Stripe's hosted form

### Story 6.4: Marketplace Sales Tax Collection

As a platform operator,
I want to calculate and collect applicable sales tax on behalf of sellers in marketplace facilitator jurisdictions,
So that the platform complies with state and federal tax regulations.

**Acceptance Criteria:**

**Given** a buyer is checking out
**When** their shipping address is in a marketplace facilitator jurisdiction
**Then** applicable sales tax is calculated and added to the order total, displayed as a separate line item

**Given** tax is calculated
**When** the tax amount renders
**Then** it uses a tax calculation service (Stripe Tax / TaxJar / Avalara) for accurate jurisdiction-specific rates

**Given** the order completes with tax collected
**When** the platform's tax obligation is tracked
**Then** collected tax amounts are recorded per jurisdiction for remittance reporting

**Given** a buyer's address is in a non-facilitator jurisdiction
**When** checkout renders
**Then** no platform-collected tax is added (seller may be responsible)

## Epic 7: Marketplace Trust & Safety

Protect buyers and sellers with price anomaly detection, dispute resolution, seller trust scoring, and automated enforcement — ensuring marketplace integrity and user confidence.

### Story 7.1: Price Anomaly Detection & Flagging

As a platform operator,
I want listings priced significantly below market average to be automatically flagged before going live,
So that buyers are protected from scams and pricing errors don't undermine marketplace trust.

**Acceptance Criteria:**

**Given** a seller submits a new listing
**When** the listing price is >50% below the 30-day average market price for that card in the same condition
**Then** the listing is held in a "flagged" state and does not appear in search results or the card detail page

**Given** a listing is flagged for price anomaly
**When** an admin reviews the flagged listing queue
**Then** the admin can approve (publish), reject (remove), or request the seller to adjust the price

**Given** a flagged listing is approved by an admin
**When** the approval is confirmed
**Then** the listing goes live and the seller receives a notification that their listing is now active

**Given** a listing is flagged
**When** the seller views their listing management page
**Then** the listing shows a "Under Review" status with an explanation that the price triggered a review

**Given** any price displayed to a user on the platform
**When** the price renders
**Then** the price originates from real listing data or verified external market sources — never synthetic or placeholder values

### Story 7.2: Buyer Dispute Opening

As a buyer,
I want to open a dispute on a received order if the item doesn't match the listing description,
So that I can seek resolution when a card arrives damaged, incorrect, or not as described.

**Acceptance Criteria:**

**Given** a buyer has confirmed receipt of an order
**When** they navigate to the order detail page within 30 days of delivery
**Then** a "Report Issue" button is visible that initiates the dispute flow

**Given** a buyer opens a dispute
**When** they complete the dispute form
**Then** they must select a reason (damaged, wrong card, condition mismatch, missing item), upload at least one photo as evidence, and provide a text description

**Given** a dispute is submitted
**When** the dispute is created
**Then** the seller is notified and the order status updates to "Disputed" visible to both buyer and seller

**Given** a dispute is open
**When** the buyer views their order
**Then** they can see dispute status (Open, Under Review, Resolved) and any admin communications

### Story 7.3: Admin Dispute Resolution

As an admin,
I want tools to review disputes by comparing seller listing photos against buyer evidence,
So that I can make fair rulings and issue appropriate refunds.

**Acceptance Criteria:**

**Given** an admin opens a dispute in the admin panel
**When** the dispute detail renders
**Then** it shows a side-by-side comparison of the seller's original listing photos and the buyer's submitted evidence photos

**Given** an admin reviews a dispute
**When** they make a ruling
**Then** they can issue a full refund, partial refund (with amount), or dismiss the dispute — each with a required reason text

**Given** an admin issues a refund on a dispute
**When** the refund is processed
**Then** the refund is executed via Stripe, both buyer and seller are notified of the outcome, and the dispute is marked as resolved

**Given** an admin resolves a dispute against a seller
**When** the resolution is recorded
**Then** the dispute outcome is factored into the seller's trust score calculation

### Story 7.4: Seller Trust Score

As a buyer,
I want to see a seller's trust score based on their transaction history,
So that I can make informed purchasing decisions based on seller reliability.

**Acceptance Criteria:**

**Given** a seller has completed at least 5 transactions
**When** their trust score is calculated
**Then** it reflects a weighted composite of: order accuracy rate, average shipping speed, dispute rate, and dispute outcomes

**Given** a buyer views a listing or card detail page
**When** seller information renders
**Then** the seller's trust score is displayed as a visual indicator (e.g., 4.7/5 stars or equivalent) alongside their total completed orders

**Given** a seller has fewer than 5 completed transactions
**When** their profile or listing renders
**Then** "New Seller" is displayed instead of a numeric trust score

**Given** a dispute is resolved
**When** the seller's trust score recalculates
**Then** dispute outcomes (upheld vs. dismissed) are weighted more heavily than standard positive transactions

### Story 7.5: Business Seller Application Review

As an admin,
I want to review and approve or reject business seller applications,
So that the marketplace maintains quality standards for business-tier sellers.

**Acceptance Criteria:**

**Given** a user submits a business seller application
**When** the application enters the review queue
**Then** it includes: business name, business type, tax ID, estimated inventory size, and any supporting documentation

**Given** an admin opens a pending business seller application
**When** the review interface renders
**Then** the admin can approve, request additional information, or reject the application with a required reason

**Given** an admin approves a business seller application
**When** the approval is processed
**Then** the user's role is upgraded to business seller, they gain access to bulk CSV import and advanced listing tools, and they receive a notification

**Given** an admin rejects a business seller application
**When** the rejection is processed
**Then** the applicant receives a notification with the rejection reason and can re-apply after addressing the stated concerns

### Story 7.6: Automated Seller Enforcement

As a platform operator,
I want sellers who consistently fail to fulfill orders to be automatically deactivated,
So that the marketplace self-regulates against unreliable sellers without requiring manual intervention.

**Acceptance Criteria:**

**Given** a seller has 3 or more unfulfilled orders within a rolling 30-day window
**When** the enforcement check runs
**Then** all of the seller's active listings are automatically deactivated and the seller receives a notification explaining the reason and how to appeal

**Given** a seller's listings are auto-deactivated
**When** the seller resolves their unfulfilled orders (ships or refunds)
**Then** they can request reactivation, which is reviewed by an admin before listings go live again

**Given** an admin reviews a seller account
**When** they determine the seller should be suspended or banned
**Then** the admin can suspend (temporary, with duration) or ban (permanent) the account, which immediately cancels all active listings and notifies affected buyers with open orders

**Given** a seller is suspended
**When** the suspension period ends
**Then** the seller can log in and reactivate their listings, but their trust score retains the suspension history

## Epic 8: Platform Administration & Operations

Admin tools and background systems that keep the marketplace running — flagged content review, catalog management, financial reconciliation, cross-backend integrity, transactional emails, and platform health metrics.

### Story 8.1: Flagged Listing Review Queue

As an admin,
I want a centralized queue of flagged listings (price anomalies, reported content) for review,
So that I can efficiently act on items requiring attention without searching across the platform.

**Acceptance Criteria:**

**Given** listings are flagged via price anomaly detection, user reports, or policy violations
**When** an admin opens the flagged listing queue
**Then** listings are sorted by flag date with filters for flag type, game, and severity

**Given** an admin reviews a flagged listing
**When** they take action
**Then** they can approve (publish), remove, or send back to the seller with feedback — and the action is logged with timestamp and admin ID

**Given** the flagged queue has pending items
**When** the admin dashboard loads
**Then** a badge shows the count of pending flagged items requiring attention

### Story 8.2: Catalog Management Tools

As an admin,
I want to trigger ETL updates and manually add cards for new set releases,
So that the catalog stays current without requiring developer intervention.

**Acceptance Criteria:**

**Given** an admin navigates to catalog management
**When** they select a game's ETL pipeline
**Then** they can trigger an on-demand ETL run and see status (running, completed, failed) with last-run timestamp

**Given** a new card set is released before the external API has full data
**When** an admin needs to add cards
**Then** they can manually create catalog entries with game, set, card number, name, rarity, and image URL

**Given** an ETL pipeline fails
**When** the failure is recorded
**Then** existing catalog data is not corrupted (atomic batch updates), and the admin receives an alert with error details

### Story 8.3: Automated Financial Reconciliation

As a platform operator,
I want automated reconciliation between order records and Stripe payment data,
So that financial discrepancies are detected early and resolved before they compound.

**Acceptance Criteria:**

**Given** the reconciliation job runs daily
**When** it compares order records against Stripe payment and payout data
**Then** it flags discrepancies: orders without matching payments, payments without matching orders, and amount mismatches

**Given** discrepancies are found
**When** the reconciliation report is generated
**Then** admins can view the report with order ID, expected amount, actual amount, and discrepancy type

**Given** no discrepancies are found
**When** the reconciliation completes
**Then** a "clean" status is recorded for audit trail purposes

### Story 8.4: Cross-Backend Referential Integrity

As a platform operator,
I want referential integrity maintained between catalog entries (sidedecked-db) and product listings (mercur-db),
So that orphaned or broken references don't cause user-facing errors.

**Acceptance Criteria:**

**Given** a scheduled integrity check runs
**When** it scans listings in mercur-db against catalog entries in sidedecked-db
**Then** it identifies orphaned listings (catalog entry deleted or missing) and orphaned catalog references (catalog entry exists but no products reference it)

**Given** orphaned listings are detected
**When** the report is generated
**Then** admins can review and either re-link to the correct catalog entry or deactivate the listing

**Given** a catalog entry is deleted or merged during ETL
**When** listings reference that entry
**Then** the cross-service event system notifies the backend to flag affected listings for review rather than silently breaking

### Story 8.5: Transactional Email Notifications

As a user,
I want to receive email notifications for key platform events,
So that I stay informed about orders, disputes, and account changes without needing to check the platform.

**Acceptance Criteria:**

**Given** a key event occurs (order confirmed, new sale, shipment tracking update, dispute opened/resolved, account role change, seller enforcement action)
**When** the event is processed
**Then** a transactional email is sent via Resend to the relevant user(s)

**Given** a transactional email is sent
**When** the email renders
**Then** it uses a consistent branded template with the SideDecked logo, event-specific content, and a CTA linking to the relevant page

**Given** an email fails to send
**When** the failure is recorded
**Then** the system retries up to 3 times with exponential backoff and logs the failure for admin visibility

### Story 8.6: Platform Metrics Dashboard (Growth)

As an admin,
I want to view key platform metrics,
So that I can monitor marketplace health and make data-driven decisions.

**Acceptance Criteria:**

**Given** an admin navigates to the metrics dashboard
**When** the page loads
**Then** it displays: GMV (gross merchandise value), active seller count, order volume (daily/weekly/monthly), and conversion rate (visitors to purchases)

**Given** the metrics dashboard is loaded
**When** the admin selects a time range
**Then** all metrics update to reflect the selected period with trend indicators (up/down vs. previous period)

**Given** metrics data is aggregated
**When** the dashboard renders
**Then** data is sourced from real order and user records — not estimated or sampled


## Epic 9: Storefront Homepage Redesign

Every visitor experiences a homepage matched to their mode the moment they land. Anonymous visitors can evaluate the marketplace in under 10 seconds. Returning users restore their context in under 3 taps. Seller evaluators see a clear entry point without scrolling. Newcomers receive orientation before any marketplace content. The homepage becomes the first working demonstration of SideDecked's core differentiator — a platform that knows you.

### Story 9.1: Anonymous Homepage — Hero & Trust Foundation

As an anonymous visitor,
I want to land on a homepage that immediately proves the marketplace is real and shows me how to start,
So that I can evaluate SideDecked and begin searching within 10 seconds without doubting its legitimacy.

**Acceptance Criteria:**

**Given** I visit `/` without being authenticated
**When** the page loads
**Then** the page is server-rendered (no client-side flash of content)
**And** an `<h1>` orientation sentence is visible above the fold: "The marketplace for MTG, Pokemon, Yu-Gi-Oh! and One Piece singles. Buy individual cards from verified sellers — no booster packs required."
**And** a search bar is the largest interactive element above the fold
**And** the search bar placeholder reads "Search cards, sets, sellers..."

**Given** the page has rendered
**When** I view the area below the search bar
**Then** an A-static trust strip is visible: "[card_count] cards · [seller_count] verified sellers · Buyers protected"
**And** the trust strip data values are sourced from a server-side config (not hardcoded in the component)
**And** a seller signal link is visible below the trust strip: "Become a seller ->"

**Given** I am authenticated when visiting `/`
**When** the page loads
**Then** the seller signal link is not rendered

**Given** the page is loaded on a mobile viewport (390px)
**When** I view the layout
**Then** all elements are single-column and touch-target compliant (minimum 44x44px)
**And** the search bar is reachable with one thumb

**Given** the page is loaded on desktop (1280px+)
**When** I view the layout
**Then** a two-column hero is rendered: left column (H1 + search + trust strip + seller signal), right column (trust stats card + seller opportunity card)

**Given** the page has fully loaded
**When** measured via Lighthouse or equivalent
**Then** LCP <= 2.5s and CLS < 0.1

---

### Story 9.2: Game Selector Grid

As a visitor (anonymous or authenticated),
I want to tap a game tile to narrow the marketplace to my TCG and have that preference remembered,
So that I don't have to re-select my game on every visit.

**Acceptance Criteria:**

**Given** I am on the homepage
**When** I view the section below the trust strip
**Then** a 2x2 grid (mobile) or 4-column row (desktop) of game tiles is visible
**And** each tile shows the actual card-back image from `/public/images/card-backs/` with a game-colour overlay (MTG: purple, Pokemon: yellow, YGO: gold, One Piece: red)
**And** each tile displays the game name in Rajdhani uppercase font and live listing count in DM Mono
**And** tile aspect ratio is 5:7 on all breakpoints

**Given** the listing counts are displayed
**When** the customer-backend listing count service is available
**Then** each count reflects current live inventory for that game, Redis-cached with 30s TTL

**Given** the listing count service is unavailable
**When** the tile renders
**Then** the listing count is omitted (tile still renders without count; no error shown)

**Given** I tap the Pokemon tile
**When** the tap is registered
**Then** the search bar placeholder updates to "Search Pokemon cards, sets, sellers..."
**And** a `sd_game_pref=pokemon` cookie is set (SameSite=Lax, 30-day expiry)
**And** the Pokemon tile receives a visible selected state (accent-colour border)

**Given** I return to the homepage on a subsequent visit with `sd_game_pref=pokemon` set
**When** the page renders
**Then** the Pokemon tile is pre-highlighted and the search bar shows the Pokemon placeholder

**Given** I navigate to a game tile using keyboard (Tab)
**When** I press Enter
**Then** the game preference is applied identically to a tap interaction

---

### Story 9.3: Homepage Context BFF Endpoint

As a returning authenticated user,
I want a single fast API call to retrieve my deck progress, latest price alert, and watchlist hits,
So that the homepage can restore my context without multiple client-side round trips.

**Acceptance Criteria:**

**Given** I make a `GET /api/homepage/context` request with a valid session JWT
**When** all three upstream services (deck, price alert, watchlist) are available
**Then** the response is 200 OK with the HomepageContext shape: `{ deck?, priceAlert?, watchlist? }`
**And** deck field shape: `{ name: string; total: number; filled: number; missing: string[] }`
**And** priceAlert field shape: `{ cardName: string; delta: number; direction: 'up' | 'down' }`
**And** watchlist field shape: `{ newListingCount: number }`
**And** response time is < 100ms P95

**Given** I make a request without a valid session JWT
**When** the endpoint processes the request
**Then** the response is 401 Unauthorized

**Given** the deck service is unavailable but price alert and watchlist services are available
**When** the endpoint is called
**Then** the response is 200 OK with `deck` undefined and the other two fields populated
**And** no error is thrown or surfaced to the caller

**Given** all three upstream services are unavailable
**When** the endpoint is called
**Then** the response is 200 OK with an empty object (all fields undefined)

**Given** a service call exceeds the timeout threshold
**When** the circuit breaker triggers
**Then** the endpoint falls back gracefully (5s timeout per service, 3x retry with exponential backoff)

**Given** two concurrent requests from the same user session
**When** both are processed
**Then** each response is session-scoped (no cross-user data leakage; no shared Redis cache key)

**Given** the HomepageContext TypeScript type is exported from this route
**When** the type is imported by the personalised strip component
**Then** full type safety is enforced end-to-end with no `any` types

---

### Story 9.4: Authenticated Personalised Strip

As a returning authenticated user,
I want to see my deck progress, latest price alert, and watchlist hits the moment I land on the homepage,
So that I can resume where I left off in under 3 taps without navigating through the site.

**Acceptance Criteria:**

**Given** I am authenticated and visit `/`
**When** the page begins rendering
**Then** a Suspense boundary wraps the personalised strip server component
**And** the anonymous hero (Story 9.1 layout) renders immediately as the Suspense fallback
**And** the Suspense fallback is pixel-identical to the anonymous hero (CLS < 0.1 when strip resolves)

**Given** the BFF endpoint resolves with all three fields populated
**When** the Suspense boundary resolves
**Then** the personalised strip replaces the anonymous hero above the fold
**And** three equal-width tiles are rendered:
- Tile 1 (Deck): deck name, filled/total card count, missing count, "View ->" link to /decks/[id]
- Tile 2 (Price Alert): card name, price delta with up/down indicator, "View ->" link to card detail page
- Tile 3 (Watchlist): new listing count, "View ->" link to /watchlist

**Given** I tap the deck tile
**When** the navigation fires
**Then** I am taken directly to `/decks/[id]` for that deck

**Given** I tap the price alert tile
**When** the navigation fires
**Then** I am taken to the card detail page `/cards/[game]/[slug]`

**Given** I tap the watchlist tile
**When** the navigation fires
**Then** I am taken to `/watchlist`

**Given** the BFF endpoint returns all fields as undefined
**When** the Suspense boundary resolves
**Then** the personalised strip does not render and the anonymous hero remains visible

**Given** I am on a mobile viewport (390px) with all three tiles present
**When** the strip renders
**Then** all three tiles are shown in an equal-width 3-column grid

**Given** I am unauthenticated
**When** the page loads
**Then** the personalised strip server component is never invoked and the anonymous hero is the only hero rendered

---

### Story 9.5: Newcomer Orientation Banner

As a first-time visitor who has never encountered TCG card singles before,
I want to read a plain-English explanation of what SideDecked is before I see any marketplace content,
So that I understand the site's purpose without needing prior TCG knowledge.

**Acceptance Criteria:**

**Given** I visit `/` for the first time (no `sd_first_visit` cookie) and I am unauthenticated
**When** the page renders
**Then** a dismissible banner is visible above the hero
**And** banner content: "New to card singles? Buy individual cards — no booster packs needed. Start with a search ->"
**And** a dismiss button (x) is present and keyboard-accessible

**Given** I click the dismiss button
**When** the dismiss fires
**Then** the `sd_first_visit=dismissed` cookie is set (SameSite=Lax, 365-day expiry)
**And** the banner collapses without a layout shift (CSS height transition, not display:none swap)
**And** prefers-reduced-motion users see the banner removed instantly with no animation

**Given** I focus the search bar input
**When** the focus event fires
**Then** the banner auto-dismisses identically to a manual dismiss click and the cookie is set

**Given** I return to the homepage on any subsequent visit with `sd_first_visit=dismissed` set
**When** the page renders
**Then** the banner is not present in the DOM

**Given** I am authenticated when visiting `/`
**When** the page renders
**Then** the banner is not rendered regardless of cookie state

**Given** I am using keyboard navigation and the banner is visible
**When** I press Escape
**Then** the banner dismisses and focus moves to the search bar

---

### Story 9.6: Serendipity Layer — Trending Now & Deck of the Day

As a visitor browsing without a specific card in mind,
I want to see trending cards with live prices and a featured community deck on the homepage,
So that I can discover cards and decks I didn't know I wanted, and (if authenticated) stay aware of ban list changes affecting my decks.

**Acceptance Criteria:**

**Trending Now section:**

**Given** I am on the homepage (any auth state) and scroll below the game selector grid
**When** the Trending Now section renders
**Then** up to 3 trending cards are displayed, each showing: card name, game, price (lowest listing), and a "View listings ->" CTA
**And** prices are sourced from customer-backend listing service, cached with 5min TTL
**And** card data is sourced from a server-side curation config (not hardcoded in the component)

**Given** I click "View listings ->" on a trending card
**When** the navigation fires
**Then** I am taken to `/cards/[game]/[slug]` for that card

**Given** the curation config contains fewer than 3 cards
**When** the section renders
**Then** only the available cards are shown (minimum 1; section still renders)

**Deck of the Day section:**

**Given** the Deck of the Day config contains a valid deck entry
**When** the section renders
**Then** it displays: deck name, game, format, estimated build cost, available card count on SideDecked, and a "Buy missing cards ->" CTA
**And** estimated build cost is calculated from current lowest-price listings per card in the deck
**And** available card count reflects live inventory from customer-backend, cached 5min TTL

**Given** I click "Buy missing cards ->"
**When** the navigation fires
**Then** I am taken to the cart optimizer pre-seeded with the deck's cards

**Given** the customer-backend is unavailable when rendering this section
**When** the section attempts to fetch data
**Then** the section is omitted from the page entirely (no error state, no skeleton; section simply absent)

**Format Alert — authenticated only:**

**Given** I am authenticated and one or more of my active decks contains cards affected by a recent ban list or rotation change
**When** the homepage renders
**Then** a Format Alert banner is visible: "[N] card(s) in your deck are now banned · Find replacements ->"
**And** the alert data is cached per user with a 24h TTL

**Given** I click "Find replacements ->"
**When** the navigation fires
**Then** I am taken to the affected deck's detail page with the banned cards highlighted

**Given** none of my active decks are affected by recent changes
**When** the homepage renders
**Then** the Format Alert banner is not rendered

**Given** I am unauthenticated
**When** the homepage renders
**Then** the Format Alert banner is never rendered
