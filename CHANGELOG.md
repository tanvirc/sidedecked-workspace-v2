# Changelog
All notable changes to the SideDecked project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [Unreleased]
### Changed
- **Voltage Design System**: Full replacement of "Midnight Forge" (bronze-gold/dark) with "Voltage" (Electric Violet + Neon Coral) across the storefront
  - `colors.css`: complete token rewrite — new brand palette (`--brand-primary: #8B5CF6`, `--brand-secondary: #FF7849`), Voltage dark surfaces (`#09090F` root → `#38365C` active), light mode surfaces, recalibrated rarity tokens (WCAG AA on new `--bg-surface-1`), updated game colors for new base
  - `globals.css`: updated type scale with font-family declarations (Barlow Condensed for display/heading-xl/lg, Barlow for heading-md/sm/xs); added `.display-lg` (72px); updated `.price` to use `var(--font-mono-stats)`; `.accent-cta-btn` now uses brand CSS variables; added `.card-glow` hover effect and `@keyframes brand-pulse` / `gradient-sweep`
  - `tailwind.config.ts`: replaced `rajdhani` font alias with `barlow-condensed` + `barlow`; added `heading` alias mapped to `--font-heading`
  - `layout.tsx`: replaced `Rajdhani` Google Font import with `Barlow_Condensed` (wt 500–800) + `Barlow` (wt 400–600)
  - `CardDisplay.tsx`: Gallery and Grid variants now use `.card-glow` for `0 0 24px rgba(139,92,246,0.4)` hover effect

### Added
- **Game Selector Grid (Story 9.2)**: Homepage game tile grid letting visitors tap a TCG to land on the card browse page pre-filtered by game, with preference persisted via cookie
  - `GameSelectorGrid` (RSC) and `GameTile` (`"use client"` island): 2×2 mobile / 4-column desktop grid of card-back tiles (MTG, Pokémon, Yu-Gi-Oh!, One Piece) with game-colour overlays, Rajdhani uppercase game names, and DM Mono listing counts; `aspect-ratio: 5/7` on all breakpoints; active scale, hover translate, focus-visible outline, and `prefers-reduced-motion` suppression
  - `GET /api/catalog/listing-counts` (customer-backend): returns live listing counts per game code from `catalog_skus`, Redis-cached with 30s TTL; responds 503 when DB unavailable so tiles still render without counts (AC3 graceful omission)
  - `fetchGameListingCounts()` (storefront): fetch wrapper with `revalidate: 30`; returns `undefined` on error for graceful omission
  - `sd_game_pref` cookie: written client-side on tile tap (SameSite=Lax, 30-day expiry); read server-side in `/cards/page.tsx` to pre-filter Algolia via `initialUiState.refinementList.game`; URL `?game=` param takes precedence over cookie (AC5)
  - Keyboard: `Tab` focus + `Enter` identical to tile tap — cookie write + navigation (AC6)
  - Playwright E2E spec (`e2e/story-9-2-game-selector-grid.spec.ts`): 17 tests covering all ACs with mobile/desktop viewport screenshots

### Fixed
- **Card Detail Page wireframe compliance (Story 2-5 remediation)**: Closed three v5.1 wireframe gaps discovered under strengthened story lifecycle compliance gates
  - `QuickBuyPanel` condition chips now use per-condition color coding — NM=green (#4ADE80), LP=lime (#A3E635), MP=yellow (warning), HP=red (negative) — replacing uniform amber; disabled (out-of-stock) chips retain condition color at 30% opacity with dashed border instead of uniform gray
  - Mobile Row 3 condition chips updated with the same per-condition color map
  - Mobile Row 3 context label (`NM · MKM '24 Foil`) moved from the scrollable condition chip zone into a dedicated action zone column above the secondary Deck/Collect buttons, matching the `.mobile-action-zone` wireframe structure
  - Mobile qty chips changed from `1/2/3/4+` to `×1/×2/×3/×4` per wireframe spec
  - 6 new compliance tests added (3 in `QuickBuyPanel.test.tsx`, 3 in `CardDetailPage.test.tsx`); 523/523 tests passing

### Added
- **Card Detail Page BFF Endpoint (Story 2-5)**: Aggregating BFF endpoint that serves the card detail page with catalog data, marketplace listings, and seller trust signals from both backends in a single API call
  - `GET /api/cards/[id]` (storefront BFF): fetches catalog details from customer-backend, live listings from backend, and seller trust scores via batch lookup; returns unified `CardDetailBFFResponse` with graceful degradation — listings section shows a warning banner if the listings service is unreachable rather than failing the whole page
  - `cardDetailBFF.ts` service layer: circuit-breaker–style error isolation per data source; `CONDITION_ORDER` for canonical sort (NM > LP > MP > HP > DMG); `revalidate = 30` cache policy on the Next.js page
  - `BackendListing` type (`src/types/bff.ts`): canonical interface for listings data flowing from backend through BFF to UI components
  - `MarketplaceListingsTable` now accepts `listings?: BackendListing[]` prop — renders real BFF data with seller trust signal ("X% positive · N sales"), accessible ARIA labels on Add to Cart / Notify buttons, and `PAGE_SIZE = 20` pagination with "Show more" button
  - `MarketplaceListingsSection` accepts `listings` and `listingsUnavailable` props; renders `role="alert"` degradation banner when listings service is down
  - `POST /api/sellers/trust/batch` (customer-backend): bulk trust-score lookup by seller IDs — returns per-seller rating percentage, review count, seller type, and verification status
  - `GET /store/cards/listings?catalog_sku=` (backend): maps Medusa product variant inventory to `BackendListing` shape; filters to `in_stock` variants only
  - 39 tests across 5 suites covering BFF service circuit breaker, API route 200/404/500 paths, component degradation banner, listings prop forwarding, trust signal rendering, ARIA labels, and pagination; BFF route at 100% coverage
  - **v5.1 Card Detail Page layout (redo from architecture phase)**: Replaces the v4 two-column layout with a v5.1 persona-segmented three-column desktop grid (`260px 1fr 268px`)
    - `QuickBuyPanel`: right-column action panel driven by real `BackendListing[]`; per-condition chips with stock counts; `disabled` attribute on zero-stock chips (not just visual dimming, per AC6a); quantity stepper capped at `listing.quantity` with "Only N left" label; `isRefetching` skeleton state during print re-fetches; auth-aware "Notify me" stub for zero-stock prints; Add to Cart with sonner toast
    - `SaveSection`: "Add to Deck" and "Add to Collection" stub buttons with "Soon" badge; displays selected condition
    - `PriceInsightsSection`: computes Low/Mid/High from live listings; "No price data yet" for empty state; trend placeholder
    - `RulingsAccordion`: `<details>/<summary>` accordion; renders null when card has no rulings
    - `CompactPrintingsTable` (enhanced): filter strip (All/Foil/Non-foil + Price↑/Year↓ sort toggles); artist name sub-row; keyboard navigation (↑/↓/Enter); overflow show/hide at 5 items default
    - `MarketplaceListingsTable` (enhanced): null-first sort order (BFF order by default); sortable Condition/Rating/Price column headers with ARIA `columnheader` roles; "Best price" badge on cheapest listing row; condition sort uses `CONDITION_ORDER` (NM first ascending)
    - `CardDetailPage` (refactored): AbortController fetch on print selection cancels prior in-flight request (race-condition safe); mobile tab chips (`role="tab"`, `aria-selected`) switching between oracle text and legality views; mobile fixed bottom action bar with 44px min touch targets; `BuySection` removed
    - 500 tests (499 pass; 1 pre-existing failure on `main` unrelated to this story)
- **TCG Catalog ETL Pipeline Seeding (Story 2-1)**: Hardened multi-game ETL seeding and ongoing sync reliability so discovery runs on consistent real catalog data
  - Canonical game-code normalization routes One Piece aliases (`ONEPIECE`, `ONE-PIECE`, `ONE_PIECE`) to `OPTCG` in ETL service and CLI entrypoints
  - SKU normalization now enforces uppercase ASCII kebab tokens with `UNK` fallback for missing components
  - Duplicate resolution is deterministic via completeness score, then source `updated_at`, then stable source identifier
  - Weekly `weekly-catalog-etl-sync` job now runs incremental ETL for `MTG`, `POKEMON`, `YUGIOH`, and `OPTCG` with per-game failure isolation and structured logging
  - Added QA test coverage for scheduler orchestration, game-code canonicalization, duplicate tie-break behavior, and SKU normalization
- **Storefront Design Foundation & Card Display (Story 2-2)**: Midnight Forge design system fully wired and TCG card display components production-ready
  - `colors.css` (`:root` + `.dark`): full Midnight Forge token set — surface palette (`--bg-base` #0C0D12 dark, #F8FAFC light), Arcane Gold CTAs (`--accent-primary` / `--primary` #D4A843 dark), Mystic Blue interactive (`--interactive` #7C8CFF dark), semantic tokens (positive/negative/warning/info), text hierarchy, typography variables, shadows
  - `tailwind.config.ts`: all Midnight Forge tokens mapped to Tailwind utilities — `bg-bg-base`, `text-foreground`, `border-border`, `text-interactive`, `bg-interactive-subtle`, `text-muted-foreground`, `ring-interactive-subtle`; full rarity token set for MTG/Pokémon/Yu-Gi-Oh/One Piece as `bg-rarity-*`/`text-rarity-*`
  - `CardDisplay` (`src/components/tcg/CardDisplay.tsx`): four variants (grid, list, compact, gallery); token-disciplined (zero hardcoded hex/colour classes); `@media(pointer:fine)` guards on all hover states — prevents sticky hover on touch devices; gallery overlay always visible on coarse pointer (mobile), hover-only on fine pointer (desktop); `aria-label={card.name}` on all article variants; keyboard accessible (tabIndex + Enter/Space) when `onClick` provided; image retry state machine (normal → small → thumbnail → placeholder on sequential failures)
  - `PriceTag` (`src/components/tcg/PriceTag.tsx`): three variants (inline/detailed/compact); `Intl.NumberFormat` for locale-correct price formatting; trend indicators (↑/↓) using semantic colour tokens; `role="group"` with descriptive `aria-label`; null price renders "No sellers"
  - `RarityBadge` (`src/components/tcg/RarityBadge.tsx`): four games (MTG/Pokémon/Yu-Gi-Oh/One Piece); `color-mix(in srgb, ...)` for background and border derivation from single CSS variable; multi-word rarity normalisation ("mythic rare", "illustration_rare", "starlight rare" all resolve correctly via first-word fallback); unknown rarities display capitalised raw value
  - `CardGridSkeleton` (`src/components/cards/CardGridSkeleton.tsx`): responsive grid skeleton using Midnight Forge tokens (`bg-card`, `bg-muted`, `border-border`); adapts column count via `useGridColumns` hook
  - shadcn/ui (Radix UI primitives) initialized with Midnight Forge token overrides: Sheet, Command, Dialog, AlertDialog, Tooltip, Popover, DropdownMenu, Sonner — all in `src/components/ui/`; `<Toaster>` in `providers.tsx` with `position="bottom-right" richColors`
  - Zero native `alert()`/`confirm()`/`prompt()` calls in storefront — all replaced with shadcn/ui AlertDialog or sonner toasts
  - 222 storefront tests passing; `components/tcg` module at 80.95% statement / 86.17% line coverage
- **Role-Based Access Control (Story 1-3)**: Platform role taxonomy with enforced middleware guards across all three services
  - `platform_role` column (`VARCHAR(50) NULL`) added to `customer_profile` (mercur-db) via `Migration20260222_PlatformRole`
  - `getCustomerPlatformRole(customerId)` added to `SocialAccountManagementService` — reads from DB on every login and refresh, never forwards from old token
  - `app_metadata.platform_role` embedded in every customer JWT at login (OAuth callback) and token refresh
  - `requirePlatformAdmin()` middleware helper (backend/): returns 403 `{ error: 'insufficient_permissions' }` when `auth_context.app_metadata.platform_role !== 'admin'`
  - `requireVendorPermission(permission)` middleware helper (backend/): returns 403 when vendor JWT `permissions` array lacks the required permission
  - `requirePlatformAdmin` exported from `customer-backend/src/middleware/auth.ts`; `authenticateToken` and `optionalAuth` updated to extract `platformRole` from JWT into `req.user.platformRole`
  - Storefront `/{locale}/user/*` SSR auth guard: redirects unauthenticated requests to `/{locale}/login?redirect=<path>`
  - 35 tests across 7 suites (all green); new utility files at 100% coverage
  - Auth architecture doc updated to v1.4 with RBAC section and updated JWT shape
- **User Profile Management (Story 1-2)**: First-login onboarding, profile editing, and TCG preferences
  - `OnboardingModal` (`storefront/src/components/profile/OnboardingModal.tsx`): post-OAuth single-step modal shown when `display_name` is null; prompts user to pick TCG games and set a display name; "Skip for now" dismisses without saving; saves to customer-backend `/profile` and `/preferences` endpoints
  - `(main)/layout.tsx` modified to fetch customer profile server-side and conditionally render `OnboardingModal` for authenticated users with no display name
  - `PublicProfile` component: sonner toast on successful profile save; inline validation error when display name is submitted empty
  - `UserPreferences` component: sonner toast on successful preferences save
  - `PUT /api/customers/:id/preferences` (customer-backend): added enum validation — rejects game codes not in `[MTG, POKEMON, YUGIOH, OPTCG]` with 422 response
  - 14 new storefront tests (OnboardingModal: 8, PublicProfile: 4, UserPreferences: 2); 7 new customer-backend tests (preferences: 4, profile: 3); all 60 storefront + 29 customer-backend tests passing
- **Social OAuth Registration & Login (Story 1-1)**: Multi-provider OAuth authentication with email/password registration side effects
  - Discord OAuth provider as MedusaJS auth module (`src/modules/discord-auth/`) — extends `AbstractAuthModuleProvider`, CSRF state via `authIdentityService.setState()`, avatar URL construction from Discord CDN
  - Microsoft OAuth provider as MedusaJS auth module (`src/modules/microsoft-auth/`) — follows same pattern as Discord; old plain-class provider superseded
  - Both providers registered in `medusa-config.ts` auth providers array alongside existing Google and emailpass providers
  - `discord` added to `social_account_metadata` provider enum with database migration (`Migration20260222_AddDiscordProvider`)
  - Discord added to storefront `OAUTH_PROVIDERS` config with Discord icon in `SocialLoginButtons` component
  - `POST /store/auth/emailpass/post-register` — bearer-authenticated endpoint called after emailpass registration: sends verification email, generates refresh token (30-day, SHA-256 hashed), fires `LOGIN` auth event to customer-backend audit log
  - Storefront `signup()` calls post-register endpoint after successful registration and sets refresh cookie
  - 17 Discord auth unit tests + 6 post-register integration tests
- **Create Product Listings (Story 4.5.1)**: TCG card listing wizard for vendor product creation
  - 4-step ProgressTabs wizard in vendorpanel: Select Card → Listing Details → Images → Review
  - Card catalog search via customer-backend API integration (`useCardSearch` hook)
  - Auto-populate card details (name, set, rarity, game, collector number, catalog image)
  - Condition grading (NM/LP/MP/HP/DMG), price with market price comparison, quantity, seller notes
  - Vendor photo upload (max 10 images) alongside catalog-provided default images
  - Real-time Zod validation with inline error messages
  - Storefront-style listing preview with card image, badges, and variant summary
  - Save as draft or submit for review (draft/proposed status)
  - Bulk mode: multiple condition/price/quantity variants per card
  - Auto-generated SKU format: `{game}-{set}-{number}-{lang}-{condition}-{finish}`
  - Backend: Extended `CreateProductVariant` schema with optional TCG fields (`catalog_sku`, `condition`, `language`, `finish`)
  - Backend: `transformTcgVariants` utility for SKU generation and metadata merging
  - 65 unit/component tests (vendorpanel: 41, backend: 24)
- **Individual Seller Communication (Story 2.5.7)**: Seller-buyer messaging tools and response time tracking
  - `seller-messaging` backend module with `SellerMessageTemplate` and `SellerResponseMetric` entities
  - `GET /vendor/message-templates` — 5 default template categories (shipping, thanks, condition, delay, return), auto-seeded on first access
  - `GET /vendor/response-metrics` — seller badge tier and avg response time
  - `GET /store/sellers/:id/response-metrics` — public badge display for storefront
  - `POST /vendor/orders/:id/escalate` — create TalkJS escalation conversation with platform support
  - Nightly cron job `compute-response-metrics` — computes avg first-reply time and badge tier (Lightning <1h, Fast <4h, Responsive <24h)
  - Vendorpanel: "Message Buyer" button on order detail, order-scoped chat drawer with TalkJS, quick response chips, escalation to support
  - Vendorpanel: Message templates sidebar on Messages page, response metrics badge, communication guidelines onboarding banner
  - Storefront: `SellerResponseBadge` component on seller profile pages and order parcels
  - 26 backend unit tests
- **Discord Bug Fix Pipeline**: Automated bug triage and fix system for beta testers
  - Discord bot (`discord-bot/`) monitors `#bugs` channel for free-form bug reports with screenshots
  - Bot creates GitHub issues with `discord-bug` label and tracks threads for status updates
  - GitHub Actions workflow (`.github/workflows/discord-bug-fix.yml`) triggers on labeled issues
  - OpenCode (Gemini 2.5 Pro) runs with superpowers to auto-fix bugs via TDD, creates PR, auto-merges, deploys
  - Bot notifies tester in Discord thread when fix is deployed or when human intervention is needed
  - Webhook endpoint for GitHub Actions to report completion status back to Discord
  - 12 unit tests covering GitHub issue creation and webhook handler
- **Individual Seller Payment & Payout (Story 2.5.6)**: Stripe Connect Express payment processing and payout management for individual sellers
  - `GET/POST /store/consumer-seller/payout-account` — create and retrieve Stripe Connect Express payout accounts
  - `POST /store/consumer-seller/payout-account/onboarding` — initiate Stripe hosted onboarding redirect flow
  - `POST /store/consumer-seller/payout-account/sync` — sync Stripe account status
  - `GET /store/consumer-seller/financial/summary` — balance overview (available, pending, reserve, lifetime, qualification progress)
  - `GET /store/consumer-seller/financial/fees` — fee structure display (10% platform + Stripe processing fees)
  - `GET /store/consumer-seller/payouts` — paginated payout history with status filtering
  - `PATCH /store/consumer-seller/payouts/settings` — payout schedule preference (weekly default, daily for qualified sellers)
  - `fetchConsumerSellerByCustomerId()` utility for customer-authenticated seller lookup
  - Storefront `/sell/payouts` dashboard with balance cards, payout history, and setup banner
  - Storefront `/sell/payouts/settings` page with schedule selector, reserve policy info, and fee calculator
  - "Payouts" quick action link added to existing ConsumerSellerDashboard
  - 24 unit tests (validators, query configs, utility functions)
- **Quick Card Listing (Story 2.5.4)**: One-click listing creation for individual sellers from any card detail page
  - "Sell This Card" button on card detail pages with auto-populated card info (name, set, game, rarity)
  - 5-grade condition selector (NM/LP/MP/HP/DMG) with visual condition guide
  - Market price suggestions based on recent sales data from catalog SKU pricing
  - Photo upload with mobile camera integration (`capture="environment"`)
  - 3 hardcoded shipping options (Standard $3.99, Priority $7.99, Free >$25)
  - Draft/publish workflow with quantity cap of 10 per listing
  - `GET /api/catalog/sku/:sku` and `GET /api/catalog/sku/:gameCode/:setCode/:collectorNumber/prices` in customer-backend
  - `POST /store/consumer-seller/listings` in commerce backend using `createProductsWorkflow` for immediate product creation
  - Zod validation middleware for listing requests
  - `ConditionGuide` and `ListingSuccessScreen` storefront components
  - `createSellerListing()` and `saveListingDraft()` server actions
  - 5 Jest tests for catalog SKU endpoints
- **Consumer Seller Onboarding (Story 2.5.2)**: Simplified upgrade flow for collectors to become individual sellers
  - 5-step storefront wizard (Profile → Seller Type → Preferences → Terms → Activate)
  - `POST /api/customers/:id/upgrade-to-seller` in customer-backend — creates SellerRating with trust_score=60, BRONZE tier, UNVERIFIED status
  - `GET /api/customers/:id/seller-status` — returns current seller status
  - `POST /store/consumer-seller/upgrade` in commerce backend — simplified storefront-facing path that registers seller in MercurJS with immediate activation; architecture defines `/vendor/consumer-seller/upgrade` with identity document collection and `verification_status=pending` (deferred to Story 2.5.3)
  - Individual sellers bypass complex business verification (self-certification flow)
  - Proper error state in UI replaces alert(); auto-redirect to `/sell` on success
  - 15 Jest unit tests covering all happy paths and error cases
- **Dispute Resolution System (Story 2.3.2)**: Backend infrastructure for marketplace dispute mediation
  - `@mercurjs/dispute` module with Dispute, DisputeEvidence, DisputeMessage, DisputeTimeline entities
  - 7 dispute workflow statuses: open → awaiting_vendor → under_review → decided → appealed / stripe_hold → closed
  - Store API routes: initiate dispute, list/view disputes, send messages, submit appeals
  - Vendor API routes: list/view disputes, submit response, send messages
  - Admin API routes: list/view all disputes, assign mediator, render decision
  - MedusaJS workflows: `initiate-dispute`, `render-decision`, `process-appeal`, `send-message`
  - Stripe chargeback integration: `stripe.charge.dispute.created` subscriber pauses internal disputes
  - 30-day eligibility window enforced at workflow layer; vendor_id resolved via seller-order link
  - 7-day appeal window; 1 appeal per dispute; appeal assigned to different mediator
  - Initial DB migration — 4 tables with FK constraints, enum checks, performance indexes
  - 24 unit tests (100% branch coverage, 82.6% statement coverage)
- **Two-Factor Authentication (2FA)**: Opt-in TOTP-based account security
  - Authenticator app setup with QR code and manual key entry
  - 10 single-use SHA-256 hashed backup codes with regeneration
  - Trusted device management with 30-day expiry
  - Sensitive action gating (purchases > $500, email/password change, payment methods)
  - Redis rate limiting (5 attempts per 5 minutes) with HTTP 429
  - Email notifications on 2FA enable/disable via Resend
  - AES-256-GCM encryption for TOTP secrets at rest
  - 4-step setup wizard, challenge modal, and device management UI
  - 7 backend API routes + storefront proxy routes
  - 35 unit tests with 95% statement coverage
- **Email Verification System**: Complete email verification flow for customer accounts
  - Single-use verification tokens with 24-hour expiry and SHA-256 hashing
  - Rate-limited resend functionality (3 per hour per customer)
  - OAuth auto-verification for social login users
  - Email change flow with security notifications
  - Storefront UI components: verification banner, status pages, blocked action modal
  - Backend API routes with Redis rate limiting
  - Complete test coverage (48 tests: 34 backend, 14 storefront)
- Comprehensive documentation structure with standards, architecture, and templates
- Automation scripts for setup, validation, and deployment
- Enhanced workspace organization with split-brain architecture
- Code templates for consistent development patterns
- Vitest test infrastructure for storefront with React Testing Library
### Changed
- Reorganized documentation into structured directories
- Enhanced setup process with automated scripts
- Improved development workflow with validation tools
### Fixed
- Documentation consistency across all repositories
- Development environment setup reliability
## [0.6.0] - 2024-09-11
### Added
- **Deck Building System** 
 COMPLETED
  - Universal deck architecture for all TCG games (MTG, Pok
mon, Yu-Gi-Oh!, One Piece)
  - Format-specific validation engines with real-time error reporting
  - Real-time deck editor with drag-and-drop zone management
  - Collection integration & deck completion analysis
  - Public deck sharing & community features (likes, views, copies)
  - Advanced deck browsing with filtering and search
  - Mobile-responsive deck builder interface
  - Undo/redo system with comprehensive history tracking
  - Auto-save functionality with dirty state management
  - Import/export capabilities for multiple deck formats
  - Cover image management and visual deck representation
  - React Context-based state management with TypeScript validation
### Technical Improvements
- Enhanced deck validation with format-specific rules
- Optimized deck search and filtering performance
- Comprehensive test coverage for deck operations
- Integration with card catalog and collection systems
## [0.5.0] - 2024-09-09
### Added
- **Commerce & Marketplace System** 
 COMPLETED
  - Navigation routes & marketplace links validated
  - Card detail page buttons fully functional
  - Mobile-first consumer seller dashboard & listing interface
  - Trust badges & comprehensive seller verification UI
  - Customer-to-seller upgrade flow with auth preservation
  - Stripe Connect multi-seller payment integration
  - Single card listing interface for consumer sellers
  - Client-side authentication integration across features
  - Enhanced price alert UI and management interface
  - Search autocomplete and suggestions with dedicated search page
  - Real-time inventory optimization with intelligent cache warming
  - Advanced inventory management with auto-adjustment capabilities
  - Global error boundary and toast notification system
  - User feedback system with loading states and success messages
  - Comprehensive error logging and monitoring with debug dashboard
  - Performance optimization with Core Web Vitals monitoring
  - Optimized image loading and virtualized lists for large datasets
  - Cross-system integration testing framework
### Technical Improvements
- Enhanced error monitoring and debugging capabilities
- Performance optimization with Core Web Vitals tracking
- Real-time inventory synchronization
- Advanced caching strategies
- Comprehensive feedback and notification systems
## [0.3.0] - 2024-09-08
### Added
- **TCG Catalog & Card Database System** 
 COMPLETED
  - Universal card database with ETL pipeline
  - Games, cards, prints, sets entities
  - Scryfall, Pokemon, YuGiOh, OnePiece ETL
  - Image processing pipeline operational
  - Advanced search and filtering capabilities
  - Real-time price data integration
  - Multi-game support with unified schema
### Technical Improvements
- Robust ETL pipeline with error handling
- Image optimization and CDN integration
- Database performance optimization
- API rate limiting and caching
## [0.2.0] - 2024-09-07
### Added
- **Authentication & User Management System** 
 COMPLETED
  - OAuth2 social login implementation
  - PKCE security protocols
  - JWT integration with secure token handling
  - Role-based access control (RBAC)
  - Multi-provider authentication support
  - Session management and refresh tokens
### Security
- Enhanced authentication security measures
- PKCE implementation for OAuth flows
- Secure token storage and management
- Role-based permissions system
## [0.1.0] - 2024-09-06
### Added
- **Foundation & Infrastructure Setup** 
 COMPLETED
  - MercurJS v2 base platform integration
  - Split-brain architecture implementation
  - Database setup and migrations
  - Basic API structure
  - Development environment configuration
  - Docker containerization
  - Railway deployment configuration
### Infrastructure
- Multi-repository workspace setup
- GitHub Codespaces configuration
- Automated deployment pipelines
- Development tooling and scripts
## [0.0.1] - 2024-09-01
### Added
- Initial project structure
- Repository setup and configuration
- Basic documentation framework
- Development environment templates
## Release Notes
### Version 0.6.0 - Deck Builder System
This release introduces the comprehensive deck builder system, enabling users to create, manage, and share decks across all supported TCG games. Key highlights include:
- **Universal Compatibility**: Supports MTG, Pok
mon, Yu-Gi-Oh!, and One Piece TCG
- **Real-time Validation**: Format-specific rules with instant feedback
- **Social Features**: Public deck sharing with community engagement
- **Advanced Editor**: Drag-and-drop interface with undo/redo functionality
- **Collection Integration**: Seamless connection with user collections
### Version 0.5.0 - Customer Features
This release focuses on enhancing the customer experience with comprehensive marketplace features:
- **Consumer Seller Tools**: Easy-to-use interface for individual sellers
- **Performance Optimization**: Significant improvements in page load times
- **Error Monitoring**: Comprehensive debugging and error tracking
- **Inventory Management**: Real-time synchronization and optimization
- **Enhanced Search**: Autocomplete and intelligent suggestions
### Version 0.3.0 - TCG Catalog System
This release establishes the foundation for card data management:
- **Universal Database**: Unified schema supporting all major TCG games
- **ETL Pipeline**: Automated data import from official sources
- **Image Processing**: Optimized card image delivery
- **Search & Discovery**: Advanced filtering and search capabilities
## Migration Guides
### Upgrading to v0.6.0
No breaking changes. The deck builder system is additive and doesn't affect existing functionality.
### Upgrading to v0.5.0
**Authentication Updates**: If you have custom authentication implementations, review the new client-side integration patterns.
**API Changes**: Several customer-facing endpoints have been enhanced. Check the API documentation for updated response formats.
### Upgrading to v0.3.0
**Database Schema**: Run the latest migrations to support the new TCG catalog schema:
```bash
cd customer-backend && npm run migration:run
**Environment Variables**: Add the new ETL configuration variables to your environment files.
## Upcoming Releases
### v0.7.0 - Community Features (Planned)
- User profiles with reputation system
- Social networking & following system
- Real-time messaging & trade negotiations
- Forum & discussion boards with moderation
- Events & tournament organization system
### v0.8.0 - Pricing Intelligence (Planned)
- Real-time price scraping from multiple sources
- ML-based price prediction models
- Advanced market analytics & insights
- Investment portfolio tracking
### v0.9.0 - Mobile PWA (Planned)
- Progressive Web App architecture
- Offline functionality for core features
- Push notification system
- Native payment integration
### v1.0.0 - Production Release
- Full feature completeness
- Performance optimization
- Security audit completion
- Production-ready scaling
## Contributing
For information about contributing to this project, please see [CONTRIBUTING.md](CONTRIBUTING.md).
## Support
For support and questions:
 Email: support@sidedecked.com
 Issues: [GitHub Issues](https://github.com/sidedecked/sidedecked-workspace/issues)
 Documentation: [Project Docs](docs/)
