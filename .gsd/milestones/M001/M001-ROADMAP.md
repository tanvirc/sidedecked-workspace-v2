# M001: MVP Core Loop

## Goal
A working marketplace where a player can discover cards, build a deck, buy missing cards from optimal sellers, and track their collection — with a seller able to list cards and get paid.

## Slices

- [ ] **S01: Infrastructure & Design System** `risk:high` `depends:[]`
  > Voltage tokens, globals.css, typography, shared Nav/Footer/skeleton/PriceTag/CardGrid components. Test infra (Vitest + Testing Library). Lint/typecheck/build quality gates per repo. Foundation for everything downstream.

- [ ] **S02: Card Catalog Backend** `risk:high` `depends:[S01]`
  > TypeORM entities (Card, CardPrinting, Set, Game, MarketPrice, PriceHistory), Scryfall ETL pipeline, catalog REST API (search, GET by ID, sets, prints), and Algolia indexing pipeline. All card data must be queryable before storefront work.

- [ ] **S03: Auth & User Accounts** `risk:high` `depends:[S01]`
  > Backend auth module (email/password JWT + refresh tokens), Google OAuth, Discord OAuth. Storefront auth pages in `(auth)` route group with cinematic split-screen layout. Profile page + UserAccountLayout with 8 sub-pages. Session persists across both backends via shared JWT secret.

- [ ] **S04: Card Discovery (Storefront)** `risk:medium` `depends:[S01, S02, S03]`
  > Card browse `/cards` with GameSelectorStrip, CategoryPills, PopularSetsCarousel, sidebar filters, CardGrid, and pagination. Card detail `/cards/[id]` with BFF endpoint, listings table, print selector, glass-card sections, and 4-tab mobile nav. Search page `/search` with Algolia InstantSearch, autocomplete, faceted filters, and sort controls.

- [ ] **S05: Deck Experience** `risk:medium` `depends:[S01, S02, S03]`
  > TypeORM entities (Deck, DeckCard, CollectionCard, UserProfile). Deck CRUD API + share endpoint. Deck browser `/decks` with hero, featured carousel, game tabs, and grid cards. Deck builder with desktop DnD + mobile touch, collapsible zones, game-specific zones, and "I own this" toggle. Deck viewer with Visual/List/Stats tabs, ManaCurveChart, and pricing summary.

- [ ] **S06: Seller Onboarding & Listing Wizard** `risk:high` `depends:[S01, S02, S03]`
  > Consumer-to-seller upgrade flow with Stripe Connect onboarding. Backend listing module. 3-step listing wizard (Identify → Condition + Photos → Price + Confirm) with MinIO photo upload and market price pre-fill. Seller dashboard `/sell` with inventory list, status badges, payouts page, and reputation skeleton.

- [ ] **S07: Commerce (Cart & Checkout)** `risk:high` `depends:[S01, S03, S06]`
  > Multi-vendor cart state. Cart page `/cart` with seller-grouped items, per-vendor subtotals, and inventory validation. Checkout flow `/checkout` with address, Stripe payment, and shipping method selection. Order confirmation page. Stripe payment intent creation + capture. Order history at `/user/orders`.

- [ ] **S08: Cart Optimizer** `risk:medium` `depends:[S01, S05, S06, S07]`
  > Optimizer algorithm with 3 modes (cheapest / fewest-sellers / best-value, 0.7 cost + 0.3 seller weighting, 15% cost tolerance), shipping amortization, scarcity-first ordering, and per-card quantity splitting. BFF endpoint `POST /api/optimizer/listings` with ≤5 concurrency batch SKU lookup. Optimizer UI panel with mode toggle, SellerGroupCard, per-card swap override. "Buy Missing Cards" button wired in DeckViewerHeader + DeckBuilderLayout.

- [ ] **S09: Collection Auto-Sync** `risk:medium` `depends:[S03, S05, S07]`
  > Backend subscriber on `delivery.created` → Redis `order.receipt.confirmed`. Customer-backend subscriber upserts CollectionCard rows. BFF endpoint `GET /api/collection/owned`. DeckBuilderContext `syncServerOwnedCards()` merges server-owned into local owned state. Separate ioredis client for subscriber mode.

- [ ] **S10: Homepage & Live Data Wiring** `risk:low` `depends:[S01, S02, S04, S05, S06]`
  > Homepage `/` with all 6 sections pixel-aligned (hero, GameSelectorGrid with live listing counts, TrendingStrip with live data + 8-card curated fallback, trust section, seller CTA banner). `fetchGameListingCounts()` + `fetchTrendingCards()` with 5-min cache. Trust score display on card detail seller rows. Visual UAT gates at 1440px and 390px.
