# M001: MVP Core Loop

**Vision:** A launchable TCG marketplace where players browse cards, build decks, and buy missing cards from the cheapest sellers in one tap — with sellers able to list cards in under 90 seconds.

## Success Criteria

- A user can open `/cards`, search with Algolia autocomplete, filter by game/set/condition, and tap through to a card detail page with real listing data
- A user can build an MTG deck in `/decks/builder/new`, mark 30 of 60 cards as owned, tap "Buy Missing Cards", see seller combinations with prices, and add them to cart
- A seller can sign in, upgrade to seller role, and list a card via the 3-step wizard with market price pre-filled in under 90 seconds
- A user can sign in via Google or Discord OAuth, completing the full round-trip (redirect → callback → session → storefront)
- Every storefront page renders with the Voltage dark theme — no light-mode-only components, no bare `bg-white`/`text-gray-900` classes
- All pages match their wireframe in `docs/plans/wireframes/` on desktop (1440px) and mobile (390px)
- Zero `alert()`/`confirm()`/`prompt()` calls in the storefront

## Key Risks / Unknowns

- **Cart optimizer algorithm** — Optimal seller combination with shipping is NP-hard. Greedy heuristic may produce suboptimal results on real seller data. If heuristic results are obviously wrong in practice, the UI breaks trust with users before they've tried it.
- **Cross-service BFF reliability** — Card detail and optimizer both aggregate data from two backends simultaneously. One service being slow or down should degrade gracefully, not 500.
- **OAuth multi-service flow** — Google/Discord OAuth spans storefront → backend auth module → callback route → JWT → customer-backend session. Any mismatch in redirect URIs, JWT secret, or cookie domain silently breaks auth.
- **Mobile deck builder** — HTML5Backend DnD does nothing on touch devices. The core creative experience is broken on the most common device type without an explicit tap-to-add mobile path.
- **Voltage token coverage** — 35 pages × many components. Any light-mode Tailwind class that slips through breaks dark theme consistency site-wide.

## Proof Strategy

- Cart optimizer NP-hardness → retire in S01 by proving the greedy algorithm produces correct results on a 15-card × 10-seller test set, executes in < 50ms, and the BFF endpoint returns the merged result under load
- OAuth multi-service flow → retire in S04 by proving a full Google OAuth round-trip completes end-to-end in a running environment (storefront → backend → callback → JWT → authenticated session)
- Mobile deck builder → retire in S02 by proving the tap-to-add bottom sheet works on a 390px viewport in the browser (not just passing a test)
- BFF reliability → retire in S01 by proving the card detail BFF returns catalog data with a graceful degradation message when the listings API times out

## Verification Classes

- Contract verification: Vitest + Testing Library per slice; `npm run lint && npm run typecheck && npm run build && npm test` before slice close
- Integration verification: BFF endpoints exercise both backends simultaneously; Redis pub/sub subscriber tested with a real ioredis connection
- Operational verification: OAuth round-trip in a running environment; cart optimizer BFF under real listing query load
- UAT / human verification: Visual comparison of every page against its wireframe at 1440px and 390px; deck-to-cart user journey walkthrough in local dev

## Milestone Definition of Done

This milestone is complete only when all are true:

- All slice deliverables are complete and their slice branches squash-merged to main
- Card browse → card detail → add to cart works end-to-end with live Algolia + live backend data
- Deck builder → "Buy Missing Cards" → optimizer → add to cart works end-to-end in local dev
- Seller listing wizard creates a live listing visible on the card detail page
- Google OAuth and Discord OAuth both complete the full round-trip in a running environment
- Every page passes visual UAT against its wireframe on both 1440px and 390px viewports
- `npm run lint && npm run typecheck && npm run build && npm test` passes in storefront, backend, and customer-backend
- Zero `alert()`/`confirm()`/`prompt()` calls — verified by grep

## Requirement Coverage

- Covers: R001, R002, R003, R004, R005, R006, R007, R008, R009, R010, R011, R012, R013, R017, R018, R019, R020, R021, R022, R023, R024
- Partially covers: R025 (wireframe HTML created; Figma export blocked on MCP transport mismatch)
- Leaves for later: R031 (CSV bulk import → M002), R032 (price anomaly detection → M002), R033 (dispute resolution → M002), R034 (trust scores wired to real data → M002)
- Orphan risks: Figma MCP transport — export may require Claude Desktop or direct REST API call; not blocking launch

## Slices

- [ ] **S01: Design Foundation + Cart Optimizer Algorithm** `risk:high` `depends:[]`
  > After this: The cart optimizer algorithm is proven correct on a 15-card × 10-seller fixture, the BFF endpoint returns merged results with graceful degradation, Voltage shared components (Header, Footer, PriceTag, skeletons) are locked and tested, and the card detail BFF aggregates both backends.

- [ ] **S02: Card Browse, Detail, Search + Deck Builder** `risk:high` `depends:[S01]`
  > After this: A user can browse `/cards` with Algolia facets and pagination, view a card detail page with listings and seller trust signals, search via `/search`, and build a deck in the deck builder with DnD (desktop) and tap-to-add bottom sheet (mobile) — all matching wireframes; owned-cards toggle and "Buy Missing Cards" button are wired.

- [ ] **S03: Homepage + Remaining Page Alignment** `risk:medium` `depends:[S01]`
  > After this: Every storefront page renders with Voltage dark theme tokens — homepage with live game listing counts and trending strip, all seller pages, all user account pages, and all commerce pages (cart/checkout/confirmation) aligned to their wireframes; zero bare light-mode Tailwind classes remain.

- [ ] **S04: Auth, Profile + OAuth Providers** `risk:high` `depends:[S01]`
  > After this: Auth pages render as cinematic split-screen matching wireframe, profile page with 4-tab layout is complete, Google and Discord OAuth providers are implemented and structurally verified, and the live OAuth round-trip is confirmed with real credentials in a running environment.

- [ ] **S05: Listing Wizard + Seller Pages** `risk:medium` `depends:[S01,S04]`
  > After this: A seller can list a card via the 3-step wizard (identify → condition+photos → price+confirm) with market price pre-filled, game-specific grading guides, and MinIO photo upload; the listing goes live and appears on the card detail page; all seller dashboard pages are visually aligned.

- [ ] **S06: Deck-to-Cart Integration** `risk:medium` `depends:[S02,S04,S05]`
  > After this: The full MVP user journey works in local dev — sign in via OAuth, build a deck, mark cards as owned, tap "Buy Missing Cards", see optimizer results, add to cart, complete checkout, confirm receipt, watch owned cards update automatically in the deck builder.

## Boundary Map

### S01 → S02, S03, S04, S05

Produces:
- `Header` component matching sd-nav.js spec (glassmorphic sticky, desktop + mobile hamburger + bottom bar)
- `Footer` component matching wireframe (6-link columns + social icons)
- `PriceTag` component using `.price` CSS class (tabular figures, DM Mono, `--text-price`)
- Skeleton loading components for card grid, card detail, deck list
- `GET /api/cards/[id]` BFF: aggregates catalog data from customer-backend + listings from backend; degrades gracefully if listings unavailable
- `POST /api/optimizer/listings` BFF: batch-fetches listings for a set of catalog SKUs, merges trust data, caps concurrency at 5
- `optimizeCart(listings, mode)` — greedy optimizer function: cheapest / fewest-sellers / best-value, returns `{ groups: SellerGroup[], totalCost, savings }`, < 50ms for 15 cards × 10 sellers

Consumes:
- nothing (first slice)

### S02 → S06

Produces:
- `CardBrowsingPage` at `/cards` — Algolia InstantSearch with sidebar filters, GameSelectorStrip, pagination, TrendingStrip (placeholder), SellerCTA
- `CardDetailPage` at `/cards/[id]` — card image, game attributes, listings table, seller trust signals, mobile 4-tab layout; uses S01 BFF
- `SearchPageLayout` at `/search` — breadcrumbs, results header, shared CardSearchGrid
- `DeckBuilderLayout` at `/decks/builder/new` and `/decks/[id]/edit` — DnD (desktop), tap-to-add bottom sheet (mobile), game-specific zones, format validation
- `DeckBrowsingPage` at `/decks` — public deck grid, game tabs, featured carousel
- `DeckViewPage` at `/decks/[id]` — card images by zone, stats panel, pricing summary, "Buy Missing Cards" button
- `useOwnedCards()` — per-deck owned state in localStorage; `getMissingCards()` returns array of missing catalog SKUs
- `CartOptimizerPanel` — bottom sheet (mobile) / side panel (desktop), mode toggle, seller groups, per-card override, add-to-cart

Consumes:
- S01: Header, Footer, PriceTag, skeletons, card detail BFF, optimizer BFF, `optimizeCart()`

### S03 → S06

Produces:
- Homepage page with live `fetchGameListingCounts()`, `fetchTrendingCards()` (5-min cache, curated fallback)
- All seller pages Voltage-aligned (sell dashboard, upgrade, payouts, reputation)
- All user account pages Voltage-aligned (orders, addresses, settings, wishlist, reviews, messages, returns, price alerts) with `UserAccountLayout` (240px sidebar desktop / pill nav mobile)
- Commerce pages Voltage-aligned (cart, checkout, order confirmation)

Consumes:
- S01: Header, Footer, PriceTag, Voltage token conventions

### S04 → S05, S06

Produces:
- `(auth)` route group at `/login` and `/register` — split-screen, no nav/footer, `AuthGateDialog` (modal desktop / bottom sheet mobile)
- `ProfilePage` at `/user` — hero banner, 4-tab hash-routed layout (Collection/Decks/Activity/Settings)
- `google-auth` provider registered in `medusa-config.ts` — follows apple-auth.provider.ts contract
- `discord-auth` module registered in `medusa-config.ts` — follows apple-auth.provider.ts contract
- Generic OAuth callback route at `/auth/[provider]/callback` handling all providers
- Live Google + Discord OAuth round-trip confirmed in running environment

Consumes:
- S01: Header, Footer, Voltage token conventions

### S05 → S06

Produces:
- `ListingWizard` (3-step) at `/sell/list-card` — card search via catalog API, set/print selection, condition selector with game-specific grading guide, photo upload to MinIO, market price pre-fill from MarketDataService, price input with competitive gauge, confirmation + publish
- Listing creation via `POST /store/consumer-seller/listings` — returns listing ID visible on card detail page

Consumes:
- S01: Header, Footer, PriceTag
- S04: Auth gate (wizard requires seller role)

### S06 (final assembly)

Produces:
- End-to-end deck-to-cart flow: sign in → build deck → mark owned → optimizer → cart → checkout → receipt confirm → collection auto-update
- Backend subscriber: `delivery.created` → extract catalog SKUs → publish `order.receipt.confirmed` to Redis
- Customer-backend subscriber: `order.receipt.confirmed` → upsert `CollectionCard` rows
- `GET /api/collection/owned` BFF: fetch owned catalog SKUs for authenticated user
- `syncServerOwnedCards()` in DeckBuilderContext: merges server-owned SKUs additively into `useOwnedCards()` state

Consumes:
- S01: optimizer BFF, `optimizeCart()`
- S02: deck builder, owned-cards state, CartOptimizerPanel, "Buy Missing Cards" wiring
- S04: authenticated session (JWT + cookie)
- S05: listing wizard creates the inventory that the optimizer queries
