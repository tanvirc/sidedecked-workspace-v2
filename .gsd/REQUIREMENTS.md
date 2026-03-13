# Requirements

This file is the explicit capability and coverage contract for the SideDecked project.

## Active

### R001 — Voltage design system foundation
- Class: core-capability
- Status: active
- Description: Shared nav, footer, card display components, typography classes, Voltage tokens, and skeleton loading states render consistently across all storefront pages in dark mode.
- Why it matters: Every page depends on these shared primitives. Without a locked foundation, downstream alignment work compounds inconsistency.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: unmapped
- Notes: Voltage tokens already exist in colors.css. shadcn/ui initialized. Need to verify nav/footer match wireframe sd-nav.js exactly.

### R002 — Card browse page pixel-perfect
- Class: primary-user-loop
- Status: active
- Description: Card browse page (`/cards`) matches the `storefront-cards.html` wireframe pixel-perfectly on desktop (1440px) and mobile (390px) — sidebar filters, game selector strip, popular sets carousel, card grid, pagination, skeleton states, empty state.
- Why it matters: Primary card discovery surface. Sam the Searcher's entry point.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: M001/S01
- Validation: structural alignment verified by 719 tests (S02); visual UAT pending human comparison against wireframe at 1440px and 390px
- Notes: CardBrowsingPage fully restructured with GameSelectorStrip, CategoryPills, PopularSetsCarousel, BrowseBreadcrumbs, ResultsBar, numbered pagination, TrendingStrip, SellerCTA. CategoryPills visual-only (no backend facets yet). TrendingStrip uses placeholder data (S04 wires live).

### R003 — Card detail page pixel-perfect
- Class: primary-user-loop
- Status: active
- Description: Card detail page (`/cards/[id]`) matches the `storefront-card-detail.html` wireframe — card image, game-specific attributes, listings table with seller trust signals, print selector, BFF-sourced data, graceful degradation.
- Why it matters: Card detail is the "gravitational center" — all user journeys converge here. Where purchase decisions happen.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: M001/S01
- Validation: structural alignment verified by tests (S02); glass-card blur, 4-tab mobile nav, RelatedCards section added; visual UAT pending
- Notes: BFF endpoint working. Glass-card blur applied to info sections. Mobile tabs expanded from 1 to 4 (Details/Prices/Sellers/Printings). RelatedCards renders fallback until server data source wired.

### R004 — Search page pixel-perfect
- Class: primary-user-loop
- Status: active
- Description: Search page (`/search`) matches the `storefront-search.html` wireframe — Algolia-powered results, faceted filters, autocomplete, sort controls, responsive grid.
- Why it matters: Direct search is the secondary discovery path after browse.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: M001/S01
- Validation: structural alignment verified by 14 SearchPageLayout tests (S02); breadcrumbs, query-aware results header, shared sidebar+grid; visual UAT pending
- Notes: SearchPageLayout created with breadcrumbs (Home > Search Results > "query"), results header with live hit count, shared CardSearchGrid. Autocomplete pre-existed.

### R005 — Deck browser page pixel-perfect
- Class: differentiator
- Status: active
- Description: Deck browser page (`/decks`) matches the `storefront-deck-browser.html` wireframe — public deck discovery grid, game/format filters, trending decks, deck cards with stats, import CTA.
- Why it matters: Community-to-commerce loop starts with deck discovery. Jordan's entry point.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: M001/S01
- Validation: structural alignment verified by 9 DeckBrowsingPage tests (S03); hero, featured carousel, game tabs, 3-col grid with card-fan cards, pagination, community stats banner all match wireframe layout; visual UAT pending human comparison at 1440px and 390px
- Notes: DeckBrowsingPage fully restructured with DeckBrowserHero, FeaturedDecksCarousel, DeckGameTabs, DeckGridCard (card-fan preview, accent bar, stats), inline pagination, CommunityStatsBanner. Featured carousel and stats use placeholder data. Game tabs replace old DeckFilters checkboxes.

### R006 — Deck builder pixel-perfect
- Class: differentiator
- Status: active
- Description: Deck builder (`/decks/builder/new`, `/decks/[id]/edit`) matches the `storefront-deck-builder.html` wireframe — desktop DnD with HTML5Backend, mobile touch with tap-to-add bottom sheet, game-specific zones, format validation, "I own this" toggle, deck stats, embedded card search.
- Why it matters: Core differentiator. Alex the Player's primary tool. Feeds the cart optimizer.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: M001/S01
- Validation: structural alignment verified by build success and 742 tests (S03); glassmorphic toolbar, collapsible zones with count badges, wireframe-sized thumbnails, styled mobile bottom nav all match wireframe styling; visual UAT pending (requires auth + running backend)
- Notes: DeckBuilderLayout polished with glassmorphic toolbar, DeckSurface uses native tab bar (Radix Tabs removed), DeckZone has collapsible headers with mono count badges, MobileDeckBuilder has glassmorphic header + game-colored badges. "I own this" toggle state management deferred to S09.

### R007 — Deck viewer/editor pixel-perfect
- Class: differentiator
- Status: active
- Description: Deck viewer (`/decks/[id]`) matches the `storefront-deck-viewer.html` wireframe — view mode with card images, stats, cost estimate, public sharing OG tags, import CTA. Edit mode reuses deck builder.
- Why it matters: Public deck viewing drives viral acquisition. Shared deck links are shopping lists.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: M001/S01
- Validation: structural alignment verified by 9 DeckViewPage tests (S03); hero header with card-fan, Visual/List/Stats tabs, ManaCurveChart, type/color distributions, pricing summary all match wireframe layout; visual UAT pending human comparison at 1440px and 390px
- Notes: DeckViewPage fully restructured with DeckViewerHeader, tab navigation, DeckVisualView (image grid by type), DeckListView (table format), DeckStatsPanel (mana curve, distributions). ManaCurveChart is standalone reusable. Pricing/Comments tabs deferred (no API). Stats computed independently of DeckBuilderContext.

### R008 — Homepage pixel-perfect with live data
- Class: launchability
- Status: active
- Description: Homepage matches `storefront-homepage.html` wireframe — hero section, game selector grid with live listing counts, trending strip with real card data, trust section, seller CTA banner. Responsive desktop + mobile.
- Why it matters: First impression for every visitor. Must prove marketplace is real in < 10 seconds.
- Source: user
- Primary owning slice: M001/S04
- Supporting slices: M001/S01, M001/S02
- Validation: unmapped
- Notes: HeroSection, GameSelectorGrid, TrustSection, SellerCTABanner components exist. Trending strip slot exists but unwired.

### R009 — Auth pages pixel-perfect
- Class: launchability
- Status: active
- Description: Auth pages (login, register, OAuth callback) match `storefront-auth.html` wireframe with Voltage styling.
- Why it matters: Auth is the gate to all write actions. Must feel trustworthy.
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: M001/S01
- Validation: unmapped
- Notes: Auth pages exist with deferred-auth pattern working.

### R010 — Profile page pixel-perfect
- Class: continuity
- Status: active
- Description: Profile/settings page matches `storefront-profile.html` wireframe.
- Why it matters: Users need to manage display name, avatar, shipping address, game preferences.
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: M001/S01
- Validation: unmapped
- Notes: Profile page exists at settings/profile.

### R011 — Google OAuth provider
- Class: launchability
- Status: active
- Description: Users can sign up and sign in via Google OAuth. Provider implemented in backend auth module, JWT issued, session persists across both backends.
- Why it matters: Google is the primary mainstream auth option. Blocks all authenticated features for most users.
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: unmapped
- Notes: Social auth route exists, references 'google' provider, but no google-auth.provider.ts file exists. Apple/Facebook/Microsoft providers exist as reference.

### R012 — Discord OAuth provider
- Class: launchability
- Status: active
- Description: Users can sign up and sign in via Discord OAuth. Provider implemented in backend auth module.
- Why it matters: Discord is the TCG community hub. Core audience lives there.
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: unmapped
- Notes: Migration for Discord exists (Migration20260222_AddDiscordProvider.ts) but no provider implementation file.

### R013 — Wireframe creation for remaining pages
- Class: quality-attribute
- Status: active
- Description: HTML wireframes created for all ~32 storefront pages that don't have one (cart, checkout, sell pages, user account pages, order pages, etc.) following Voltage patterns and sd-nav.js shared component.
- Why it matters: Can't align pages pixel-perfect without an authoritative design target.
- Source: user
- Primary owning slice: M001/S06
- Supporting slices: M001/S01
- Validation: unmapped
- Notes: 9 wireframes exist. ~32 pages need wireframes. Group by page family for efficiency.

### R014 — Seller pages visual alignment
- Class: primary-user-loop
- Status: active
- Description: Seller pages (sell dashboard, list-card, upgrade, payouts, reputation) align to their generated wireframes.
- Why it matters: Maya the Seller's entire experience. Must feel polished to retain sellers.
- Source: user
- Primary owning slice: M001/S07
- Supporting slices: M001/S01, M001/S06
- Validation: unmapped
- Notes: Pages exist with functional code. Need visual alignment.

### R015 — User account pages visual alignment
- Class: continuity
- Status: active
- Description: User account pages (orders, addresses, settings, wishlist, reviews, messages, returns, price alerts) align to their generated wireframes.
- Why it matters: Post-purchase experience. Users check orders, manage addresses, track returns.
- Source: user
- Primary owning slice: M001/S07
- Supporting slices: M001/S01, M001/S06
- Validation: unmapped
- Notes: 15+ user pages exist.

### R016 — Commerce pages visual alignment
- Class: primary-user-loop
- Status: active
- Description: Commerce pages (cart, checkout, order confirmation) align to their generated wireframes.
- Why it matters: Revenue funnel. Cart → checkout → confirmation must be seamless.
- Source: user
- Primary owning slice: M001/S07
- Supporting slices: M001/S01, M001/S06
- Validation: unmapped
- Notes: Cart and checkout pages exist with functional Medusa integration.

### R017 — 3-step seller listing wizard
- Class: primary-user-loop
- Status: active
- Description: Individual seller can list a card via 3-step guided flow: Identify (search + set/printing selection) → Condition + Photos (game-specific grading guides, MinIO upload) → Price + Confirm (market pricing pre-fill, competitive indicator, shipping config). Listing goes live on submission.
- Why it matters: Long-tail supply. Every card Maya lists is inventory the platform needs. Must be < 90 seconds per card.
- Source: user
- Primary owning slice: M001/S08
- Supporting slices: M001/S01, M001/S05
- Validation: unmapped
- Notes: sell/list-card page is a 33-line stub. Greenfield feature build.

### R018 — Cart optimizer algorithm
- Class: differentiator
- Status: active
- Description: Given a set of missing cards from a deck, find the optimal combination of sellers minimizing total cost (cheapest), package count (fewest sellers), or balanced value (best). Factor in per-seller shipping costs. Execute in < 2s for 15 cards, < 5s for 60 cards.
- Why it matters: The killer feature. No competitor does this. Deck-to-cart conversion is the primary morning metric.
- Source: user
- Primary owning slice: M001/S09
- Supporting slices: none
- Validation: unmapped
- Notes: Greenfield. inventory-optimization.ts exists in storefront but is not the cart optimizer. Algorithm needs to query both backends (cards from customer-backend, listings/pricing from backend).

### R019 — Cart optimizer UI
- Class: differentiator
- Status: active
- Description: Cart optimizer presents results in bottom sheet (mobile) / side panel (desktop) with progressive loading. Shows cards grouped by seller, per-seller subtotal + shipping, total with savings callout. Mode toggle between cheapest/fewest/best-value. Per-card override to swap seller/condition.
- Why it matters: The optimizer is useless if the UI doesn't make the results actionable and trustworthy.
- Source: user
- Primary owning slice: M001/S09
- Supporting slices: M001/S01, M001/S03
- Validation: unmapped
- Notes: Greenfield UI. Uses Sheet (mobile) and side panel pattern from Voltage design system.

### R020 — Deck-to-cart flow
- Class: differentiator
- Status: active
- Description: End-to-end flow: user marks cards as owned in deck builder → taps "Buy Missing Cards" → optimizer runs → user selects optimization mode → cards added to cart → multi-vendor checkout completes.
- Why it matters: This is the complete value proposition in one flow. If this doesn't work, the platform has no differentiator.
- Source: user
- Primary owning slice: M001/S09
- Supporting slices: M001/S02, M001/S03, M001/S08
- Validation: unmapped
- Notes: Each piece exists in isolation. This slice wires them together end-to-end.

### R021 — Collection auto-update on receipt
- Class: continuity
- Status: active
- Description: When a buyer confirms receipt of a shipment containing cards purchased for a specific deck, those cards are automatically marked as "owned" in all decks that contain them. Deck stats (missing count, estimated cost) recalculate.
- Why it matters: Closes the loop. Builds trust in "I own this" data. Users won't toggle ownership manually if the platform doesn't maintain it.
- Source: user
- Primary owning slice: M001/S10
- Supporting slices: M001/S03, M001/S09
- Validation: unmapped
- Notes: Requires cross-service event: backend (order receipt confirmed) → customer-backend (update collection ownership).

### R022 — Trending strip wired to live data
- Class: launchability
- Status: active
- Description: Homepage trending strip displays real trending cards with live prices from customer-backend, cached with 5min TTL.
- Why it matters: Empty trending section undermines marketplace credibility.
- Source: inferred
- Primary owning slice: M001/S04
- Supporting slices: M001/S02
- Validation: unmapped
- Notes: TrendingStrip component slot exists on homepage. Needs API endpoint and data wiring.

### R023 — Toast migration complete
- Class: quality-attribute
- Status: validated
- Description: Zero alert()/confirm()/prompt() calls remain in storefront. All replaced with sonner toasts.
- Why it matters: UX hygiene. alert() dialogs are jarring and block the thread.
- Source: inferred
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: `grep -rn "window\.alert\|window\.confirm\|window\.prompt" storefront/src/` returns zero matches (verified S01)
- Notes: Confirmed zero calls remaining as of S01 completion.

### R024 — Voltage dark theme consistency
- Class: quality-attribute
- Status: active
- Description: All storefront pages render with Voltage dark theme tokens consistently — no light-mode-only components, no mismatched colors, no unstyled defaults.
- Why it matters: Visual consistency is table stakes for marketplace trust.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: all
- Validation: unmapped
- Notes: Dark mode tokens exist in colors.css .dark block. Some components may still reference light-mode defaults.

### R025 — Figma export of all wireframes
- Class: operability
- Status: active
- Description: All HTML wireframes (existing 9 + generated ~32) exported to Figma via MCP html-to-design tool.
- Why it matters: Figma is the shared design source of truth for ongoing work.
- Source: user
- Primary owning slice: M001/S06
- Supporting slices: none
- Validation: unmapped
- Notes: Wireframes include Figma capture.js script. Figma MCP needs auth setup.

## Deferred

### R030 — Apple OAuth provider
- Class: launchability
- Status: deferred
- Description: Users can sign in via Apple Sign-In.
- Why it matters: Required for iOS App Store compliance if native app is built.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred — requires Apple Developer Program enrollment. Provider file exists (apple-auth.provider.ts) but may need completion. Launch with Google + Discord first.

### R031 — CSV bulk import for vendors
- Class: primary-user-loop
- Status: deferred
- Description: Business sellers can upload CSV inventory files with 85/10/5 catalog matching.
- Why it matters: Supply-side bootstrap. One vendor = 2,400 cards.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred to M002. Depends on listing wizard (M001/S08) establishing listing patterns.

### R032 — Price anomaly detection
- Class: compliance/security
- Status: deferred
- Description: Listings priced >50% below 30-day market average auto-flagged before going live.
- Why it matters: Marketplace trust. Prevents scams and pricing errors.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred to M002. Needs sufficient listing volume to calculate meaningful averages.

### R033 — Dispute resolution with photo evidence
- Class: compliance/security
- Status: deferred
- Description: Buyers can open disputes with photo evidence, admins resolve with side-by-side comparison.
- Why it matters: Consumer protection is a marketplace obligation.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred to M002. Dispute routes exist in backend.

### R034 — Seller trust score calculation
- Class: continuity
- Status: deferred
- Description: Sellers accumulate trust scores from transaction history, disputes, fulfillment.
- Why it matters: Buyer confidence in choosing sellers.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred to M002. TrustScoreService exists in customer-backend (593 lines).

### R035 — Price history charts
- Class: primary-user-loop
- Status: deferred
- Description: Card detail page shows 7/30/90 day price history charts.
- Why it matters: Informed purchase decisions. Sam checks if price is trending up/down.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred to M003. PriceHistoryService exists (399 lines).

### R036 — Community groups/following/events
- Class: differentiator
- Status: deferred
- Description: Users can create/join community groups, follow other users, organize events.
- Why it matters: Community-to-commerce loop. Jordan's long-term engagement.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred to M004. Forum entities exist in customer-backend.

### R037 — ML price forecasting
- Class: differentiator
- Status: deferred
- Description: Predictive price trends for cards based on historical and market data.
- Why it matters: Advanced differentiator for power users and sellers.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred to M005. Needs substantial transaction data first.

## Out of Scope

### R040 — Multi-currency / international payments
- Class: constraint
- Status: out-of-scope
- Description: Support for currencies other than USD and international payment methods.
- Why it matters: Prevents scope creep into i18n complexity before US market is proven.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: USD only for MVP. Revisit if international expansion is pursued.

### R041 — Visual card recognition (camera)
- Class: differentiator
- Status: out-of-scope
- Description: Camera-based card identification for listing or collection management.
- Why it matters: Prevents premature ML investment.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Vision phase feature. Needs proven marketplace first.

### R042 — AI deck suggestions
- Class: differentiator
- Status: out-of-scope
- Description: AI-powered deck building recommendations.
- Why it matters: Cool but not core. Users know what decks they want to build.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Vision phase feature.

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | core-capability | active | M001/S01 | none | unmapped |
| R002 | primary-user-loop | active | M001/S02 | M001/S01 | unmapped |
| R003 | primary-user-loop | active | M001/S02 | M001/S01 | unmapped |
| R004 | primary-user-loop | active | M001/S02 | M001/S01 | unmapped |
| R005 | differentiator | active | M001/S03 | M001/S01 | unmapped |
| R006 | differentiator | active | M001/S03 | M001/S01 | unmapped |
| R007 | differentiator | active | M001/S03 | M001/S01 | unmapped |
| R008 | launchability | active | M001/S04 | M001/S01, M001/S02 | unmapped |
| R009 | launchability | active | M001/S05 | M001/S01 | unmapped |
| R010 | continuity | active | M001/S05 | M001/S01 | unmapped |
| R011 | launchability | active | M001/S05 | none | unmapped |
| R012 | launchability | active | M001/S05 | none | unmapped |
| R013 | quality-attribute | active | M001/S06 | M001/S01 | unmapped |
| R014 | primary-user-loop | active | M001/S07 | M001/S01, M001/S06 | unmapped |
| R015 | continuity | active | M001/S07 | M001/S01, M001/S06 | unmapped |
| R016 | primary-user-loop | active | M001/S07 | M001/S01, M001/S06 | unmapped |
| R017 | primary-user-loop | active | M001/S08 | M001/S01, M001/S05 | unmapped |
| R018 | differentiator | active | M001/S09 | none | unmapped |
| R019 | differentiator | active | M001/S09 | M001/S01, M001/S03 | unmapped |
| R020 | differentiator | active | M001/S09 | M001/S02, M001/S03, M001/S08 | unmapped |
| R021 | continuity | active | M001/S10 | M001/S03, M001/S09 | unmapped |
| R022 | launchability | active | M001/S04 | M001/S02 | unmapped |
| R023 | quality-attribute | validated | M001/S01 | none | grep confirms zero alert/confirm/prompt calls |
| R024 | quality-attribute | active | M001/S01 | all | unmapped |
| R025 | operability | active | M001/S06 | none | unmapped |
| R030 | launchability | deferred | none | none | unmapped |
| R031 | primary-user-loop | deferred | none | none | unmapped |
| R032 | compliance/security | deferred | none | none | unmapped |
| R033 | compliance/security | deferred | none | none | unmapped |
| R034 | continuity | deferred | none | none | unmapped |
| R035 | primary-user-loop | deferred | none | none | unmapped |
| R036 | differentiator | deferred | none | none | unmapped |
| R037 | differentiator | deferred | none | none | unmapped |
| R040 | constraint | out-of-scope | none | none | n/a |
| R041 | differentiator | out-of-scope | none | none | n/a |
| R042 | differentiator | out-of-scope | none | none | n/a |

## Coverage Summary

- Active requirements: 24
- Mapped to slices: 24
- Validated: 1
- Unmapped active requirements: 0
