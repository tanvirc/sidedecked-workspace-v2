# M001: MVP Core Loop

**Vision:** Deliver a launchable TCG marketplace with a pixel-perfect Voltage-themed storefront where users can search cards, build decks, buy missing cards via an optimized multi-vendor cart, and sellers can list cards through a guided wizard. Every storefront page matches its Voltage wireframe exactly on desktop and mobile.

## Success Criteria

- Every storefront page renders pixel-perfect to its Voltage wireframe at 1440px desktop and 390px mobile
- A user can complete the full deck-to-cart flow: search → build deck → mark owned → optimize → checkout
- A seller can list a card via the 3-step wizard with market pricing pre-filled in < 90 seconds
- Google and Discord OAuth work end-to-end with session persistence across both backends
- Cart optimizer returns results in < 2 seconds for 15 missing cards
- Collection auto-updates when purchased cards are received
- All wireframes exported to Figma
- 672+ storefront tests pass, build succeeds, zero lint errors

## Key Risks / Unknowns

- Cart optimizer algorithm — finding globally optimal seller combination with shipping costs is computationally expensive. Need a heuristic that's fast enough and good enough.
- Pixel-perfect alignment at scale — 46 pages is significant visual work. Risk of scope creep in edge-state styling.
- Cross-service cart optimizer — needs real-time data from both backends without direct DB access. Latency budget is tight (< 2s total).
- Google/Discord OAuth — provider implementations must match MedusaJS v2 auth module patterns exactly.

## Proof Strategy

- Cart optimizer performance → retire in S09 by proving < 2s response with 15 cards across 50+ sellers in test data
- Cross-service data freshness → retire in S09 by proving optimizer queries return current inventory and prices
- OAuth integration → retire in S05 by proving Google login creates a user with valid JWT accepted by both backends
- Pixel-perfect fidelity → retire progressively in S02, S03, S04, S05, S07 via visual diff against wireframes

## Verification Classes

- Contract verification: Vitest tests for all new components, Jest tests for backend providers, visual snapshot tests where feasible
- Integration verification: BFF endpoints aggregate both backends correctly, OAuth flow completes across services, cart optimizer queries both backends
- Operational verification: Full user journey works in local dev with all 4 services running
- UAT / human verification: Visual comparison of each page against wireframe at both breakpoints

## Milestone Definition of Done

This milestone is complete only when all are true:

- All 10 slices are complete with passing verification
- Every storefront page matches its Voltage wireframe at 1440px and 390px
- All wireframes (9 existing + ~32 generated) are exported to Figma
- End-to-end flow works: OAuth login → card search → deck build → mark owned → cart optimize → checkout → receipt → collection update
- Seller flow works: OAuth login → seller upgrade → 3-step listing → listing visible on card detail
- All 672+ existing tests pass plus new tests for added features
- Build succeeds and lint is clean across all affected repos

## Requirement Coverage

- Covers: R001, R002, R003, R004, R005, R006, R007, R008, R009, R010, R011, R012, R013, R014, R015, R016, R017, R018, R019, R020, R021, R022, R023, R024, R025
- Partially covers: none
- Leaves for later: R030, R031, R032, R033, R034, R035, R036, R037
- Orphan risks: none

## Slices

- [x] **S01: Voltage Design System Foundation** `risk:medium` `depends:[]`
  > After this: Shared nav, footer, card display, skeleton, and price tag components render with Voltage tokens on any page. Last alert() replaced with sonner toast. Typography and token consistency verified.

- [x] **S02: Card Browse, Detail & Search — Pixel Perfect** `risk:high` `depends:[S01]`
  > After this: `/cards` browse page with sidebar filters, game strip, card grid matches wireframe. `/cards/[id]` detail page with BFF listings matches wireframe. `/search` with faceted Algolia filters matches wireframe. Desktop + mobile verified against wireframes.

- [x] **S03: Deck Builder, Browser & Viewer — Pixel Perfect** `risk:high` `depends:[S01]`
  > After this: `/decks` browser shows public decks matching wireframe. Deck builder with DnD (desktop) and touch-to-add (mobile) matches wireframe. Deck viewer matches wireframe. All game-specific zones render correctly.

- [x] **S04: Homepage — Pixel Perfect + Live Data** `risk:medium` `depends:[S01,S02]`
  > After this: Homepage matches wireframe with live trending strip showing real card prices, game selector with real listing counts from customer-backend, trust section, seller CTA. Desktop + mobile.

- [x] **S05: Auth, Profile & OAuth Providers** `risk:medium` `depends:[S01]`
  > After this: Auth pages match wireframe. User can sign in via Google or Discord OAuth, get a JWT valid on both backends, and see their profile page matching wireframe. Session persists across browser restarts.

- [x] **S06: Wireframe Generation & Figma Export** `risk:medium` `depends:[S01]`
  > After this: HTML wireframes exist for all ~32 remaining storefront pages (cart, checkout, sell pages, user account pages, order pages, etc.) following Voltage patterns with sd-nav.js. All wireframes (41 total) exported to Figma.

- [x] **S07: Remaining Pages — Visual Alignment** `risk:medium` `depends:[S01,S06]`
  > After this: Seller pages, user account pages, commerce pages, and all other storefront pages align to their generated wireframes on desktop + mobile. Every page in the storefront renders consistently with Voltage tokens.

- [x] **S08: 3-Step Seller Listing Wizard** `risk:high` `depends:[S01,S05]`
  > After this: An individual seller can list a card via Identify → Condition + Photos → Price + Confirm flow. Market pricing pre-filled, game-specific grading guides shown, photos uploaded to MinIO. Listing appears on card detail page.

- [x] **S09: Cart Optimizer & Deck-to-Cart Flow** `risk:high` `depends:[S02,S03,S08]`
  > After this: User can mark cards as owned in deck builder, tap "Buy Missing Cards", see optimizer find best seller combinations (cheapest/fewest/best-value with shipping), and add optimized selection to cart. Full flow to multi-vendor checkout works.

- [ ] **S10: Integration & Polish** `risk:low` `depends:[S09]`
  > After this: Collection auto-updates on receipt confirmation. All pages re-verified against wireframes. End-to-end flow proven: search → deck → optimize → checkout → receipt → collection update. Milestone acceptance scenarios pass.

## Boundary Map

### S01 → S02, S03, S04, S05, S06, S07, S08, S09, S10

Produces:
- `storefront/src/components/ui/` — Verified Voltage-styled shadcn/ui primitives (Sheet, Command, Dialog, sonner)
- `storefront/src/app/colors.css` — Audited and locked Voltage token set (dark mode verified)
- `storefront/src/app/globals.css` — Typography scale classes (display, heading, label) matching wireframes
- Shared `ModernHeader` nav component matching `sd-nav.js` wireframe spec exactly
- Shared `Footer` component matching wireframe
- `CardDisplay` component — card image (2.5:3.5 ratio), name, set, rarity badge with game-specific color + text
- `PriceTag` component — tabular figures, gold color, smallest-currency-unit integers
- Card skeleton loading placeholder (2.5:3.5 aspect ratio)
- sonner toast replacing all alert()/confirm()/prompt() calls (0 remaining)

Consumes:
- nothing (first slice)

### S02 → S04, S09

Produces:
- Pixel-perfect `CardBrowsingPage` with `GameSelectorStrip`, `FilterPanel`, `CardGrid`, `Pagination`
- Pixel-perfect `CardDetailPage` with `MarketplaceListingsSection`, `BuySection`, `PrintSelector`
- Pixel-perfect search page with `AlgoliaSearchResults`, `FacetedFilters`, `SortControl`
- Trending card data patterns reusable for homepage trending strip

Consumes from S01:
- Voltage tokens, CardDisplay, PriceTag, skeleton, nav, footer

### S03 → S09

Produces:
- Pixel-perfect `DeckBrowsingPage` with `DeckGrid`, `DeckFilters`, `DeckCard`
- Pixel-perfect `DeckBuilderLayout` with `DeckZone`, `DeckStats`, `EmbeddedCardBrowser`, `MobileDeckBuilder`
- Pixel-perfect `DeckViewPage` with card images, stats, cost estimate, import CTA
- "I own this" toggle state management in `DeckBuilderContext`
- "Buy Missing Cards" button wired to trigger optimizer (S09 will implement the optimizer itself)

Consumes from S01:
- Voltage tokens, CardDisplay, PriceTag, Sheet (mobile bottom sheet), nav, footer

### S04 → none (leaf)

Produces:
- Pixel-perfect homepage with all sections matching wireframe
- `TrendingStrip` wired to live card price data from customer-backend API
- `GameSelectorGrid` wired to real listing counts
- `GET /api/cards/trending` or equivalent data endpoint

Consumes from S01:
- Voltage tokens, CardDisplay, PriceTag, nav, footer
Consumes from S02:
- Trending card data patterns, card display components

### S05 → S08

Produces:
- Pixel-perfect auth pages (login, register, OAuth callback)
- Pixel-perfect profile/settings page
- `google-auth.provider.ts` in backend auth module
- `discord-auth.provider.ts` in backend auth module
- Working OAuth flow: storefront → backend → Google/Discord → callback → JWT issued → session persisted

Consumes from S01:
- Voltage tokens, nav, footer, form styling

### S06 → S07

Produces:
- ~32 HTML wireframe files in `docs/plans/wireframes/` following Voltage patterns
- Wireframes grouped by page family: commerce (cart, checkout, order-confirmed), seller (sell, list-card, upgrade, payouts, reputation), user-account (orders, addresses, settings, wishlist, reviews, messages, returns, price-alerts, verify-email), misc (categories, collections, marketplace, community, terms, reset-password, sellers/[handle])
- All 41 wireframes exported to Figma via MCP

Consumes from S01:
- Voltage token reference, sd-nav.js patterns, shared component visual language

### S07 → none (leaf)

Produces:
- All remaining storefront pages aligned to their S06-generated wireframes
- Verified Voltage consistency across entire storefront

Consumes from S01:
- Voltage tokens, shared components
Consumes from S06:
- Generated wireframes as alignment targets

### S08 → S09

Produces:
- `ListingWizard` component with 3-step flow (Identify → Condition + Photos → Price + Confirm)
- `ConditionGradeSelector` with game-specific visual grading guides
- `PricingSection` with market price pre-fill from `MarketDataService`
- `PhotoUploader` for front/back card photos to MinIO
- `POST /store/consumer-seller/listings` integration for listing creation
- Live listings appearing on card detail page via BFF

Consumes from S01:
- Voltage tokens, Sheet, Dialog, form styling
Consumes from S05:
- Authenticated seller session, seller upgrade flow

### S09 → S10

Produces:
- `CartOptimizerService` — algorithm that finds optimal seller combinations given a set of missing cards
- `CartOptimizerPanel` — UI component (Sheet on mobile, side panel on desktop) with progressive results
- Mode toggle: cheapest / fewest sellers / best value
- Per-card seller/condition override
- "Buy Missing Cards" → optimizer → cart → checkout integration
- `POST /api/deck/[id]/optimize` or equivalent orchestration endpoint

Consumes from S02:
- Card data display patterns, listing data structures
Consumes from S03:
- Deck builder "I own this" state, missing cards list
Consumes from S08:
- Live listings exist for the optimizer to query

### S10 → none (leaf)

Produces:
- Collection auto-update on receipt: `order.receipt.confirmed` Redis event → customer-backend updates `CollectionCard` ownership
- Final visual audit results — all pages re-verified
- End-to-end acceptance proof

Consumes from S09:
- Complete cart optimizer + checkout flow
Consumes from S03:
- Deck builder collection state management
