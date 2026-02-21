---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
classification:
  projectType: Web Application (multi-service web platform)
  domain: E-Commerce / Marketplace
  complexity: High
  projectContext: brownfield
inputDocuments:
  - docs/architecture/01-system-overview.md
  - docs/architecture/02-architectural-principles.md
  - docs/architecture/03-domain-models.md
  - docs/architecture/04-architectural-patterns.md
  - docs/architecture/05-data-architecture.md
  - docs/architecture/06-integration-architecture.md
  - docs/epics/epic-01-authentication-user-management.md
  - docs/epics/epic-02-commerce-marketplace.md
  - docs/epics/epic-04-vendor-management.md
  - docs/epics/epic-06-community-social.md
  - docs/epics/epic-07-pricing-intelligence.md
  - docs/epics/epic-08-search-discovery.md
  - docs/epics/epic-09-inventory-management.md
  - docs/epics/epic-10-payment-processing.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - docs/standards/code-standards.md
  - docs/standards/documentation-standards.md
  - docs/standards/testing-standards.md
  - docs/standards/commit-standards.md
  - docs/API-REFERENCE.md
  - docs/DEPLOYMENT-GUIDE.md
  - docs/CLOUDFLARE-CDN-SETUP.md
  - docs/TCG-CATALOG-IMPLEMENTATION.md
  - docs/USER-DECK-GUIDE.md
  - docs/storefront-sitemap.md
  - docs/production-deployment-guide.md
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 26
  uxDesign: 1
workflowType: 'prd'
---

# Product Requirements Document - sidedecked

**Author:** Tav
**Date:** 2026-02-22

## Executive Summary

SideDecked is a community-driven multi-game TCG marketplace serving Magic: The Gathering, Pokemon, Yu-Gi-Oh!, and One Piece communities. Built on a split-brain architecture (MedusaJS/MercurJS commerce backend + Node.js customer backend), with a Next.js 14 storefront and React vendor panel. The platform differentiates from pure commerce competitors (TCGPlayer, CardMarket) by integrating deck building, pricing intelligence, and community features directly into the marketplace experience — enabling the killer feature: "Build your deck, buy the missing cards from the cheapest sellers in one tap."

**Project Type:** Web Application (multi-service web platform)
**Domain:** E-Commerce / Marketplace
**Complexity:** High
**Project Context:** Brownfield (extensive architecture, partially implemented features, 8 epics with 100+ stories)

## Success Criteria

### User Success

- A player can build a deck, mark owned cards, and purchase missing cards from the cheapest sellers in under 2 minutes
- A seller can list a card in 3-4 focused steps with market pricing guidance pre-filled
- Every price shown is real, every seller is verified, every action gets toast feedback (no alert() dialogs)
- Deck-to-cart conversion > 10% (launch), > 15% (6 months)
- Time from "Buy Missing Cards" to checkout < 120 seconds for returning users
- Cart optimization shows savings > 80% of eligible cases

### Business Success

**3-Month Targets:**
- 50+ active sellers with real inventory
- $10K+ monthly GMV (Gross Merchandise Value)
- Deck-to-cart conversion > 10%
- First sale within 7 days for new sellers
- NPS/recommendation intent baseline established

**12-Month Targets:**
- 500+ active sellers
- $100K+ monthly GMV
- 25%+ of purchases originate from deck builder
- 40%+ deck-to-cart repeat usage within 30 days

**Primary Morning Metric:** GMV (outcome) + Deck-to-purchase conversion (leading indicator)

### Technical Success

- API response time < 100ms P95
- Database queries < 50ms
- Page load (TTI) < 2 seconds
- Search queries < 200ms
- Cross-service API reliability > 99.5%
- Cart optimization < 2 seconds for 15-card decks
- 80%+ test coverage, zero lint errors
- Zero data inconsistency between catalog SKUs and product listings

### Measurable Outcomes

| Metric | Launch Target | 6-Month Target |
|---|---|---|
| Deck-to-cart conversion | > 10% | > 15% |
| Deck-influenced purchase rate | > 25% | > 35% |
| Buy Missing Cards to checkout (returning users) | < 120 seconds | < 90 seconds |
| Cart optimization shows savings | > 80% eligible | > 90% eligible |
| Repeat deck-to-cart usage (within 30 days) | > 40% | > 60% |
| Active sellers | 50+ | 500+ |
| Monthly GMV | $10K+ | $100K+ |

## User Journeys

### Journey 1: Alex the Player — "Build, Own, Buy"

**Opening Scene:** Alex is preparing for a Modern format tournament this weekend. He opens SideDecked on his phone during his lunch break and taps into the deck builder.

**Rising Action:** Alex selects "Modern" format and starts building a Burn deck. He searches "Lightning Bolt" — Algolia autocomplete surfaces it before he finishes typing. He drags it into the mainboard (touch-optimized, no hover-dependent controls). As he adds cards, the format validator confirms legality in real-time: green checkmarks for legal, amber warnings for restricted, red flags for banned.

He toggles "I own this" on 28 of the 60 cards — tapping the card thumbnail flips a subtle owned/needed badge. The deck builder sidebar now shows: **32 cards needed, ~$47.80 estimated**.

**Climax:** Alex taps **"Buy Missing Cards"**. The cart optimizer runs in < 2 seconds, analyzing listings across all sellers. It presents:
- **Option A:** Cheapest total ($43.20) — 4 sellers, $12.60 combined shipping
- **Option B:** Fewest packages ($48.90) — 2 sellers, $7.80 shipping
- **Option C:** Best value ($45.50) — 3 sellers, fastest shipping

Each option shows seller ratings, condition breakdown, and shipping estimates. Alex picks Option A. Cards populate the cart grouped by seller, each with condition photos and seller trust badges.

**Resolution:** Checkout flows through Stripe — saved payment method, shipping address pre-filled from profile. Multi-vendor order creates 4 sub-orders with independent tracking. Toast notification: "Order placed! Track your shipments." Each seller receives their portion of the order instantly.

**Return Visit Epilogue:** Three days later, Alex's shipments arrive. He opens SideDecked, and the order page shows delivery confirmations. He taps "Confirm Receipt" on each. His deck builder automatically updates — the 32 "needed" cards now show as "owned." His collection is current without manual entry. He screenshots the completed deck and shares it to his tournament group.

**Edge Cases & Error Recovery:**
- Card goes out of stock during optimization → toast: "Lightning Bolt (NM) sold out — recalculating..." → auto-substitutes LP at lower price with user confirmation
- Seller delisted between optimize and checkout → affected cards highlighted, alternative sellers suggested inline
- Payment fails → order held for 15 minutes, retry with different method, no duplicate charges

**Capabilities Revealed:** Deck builder, format validation, "I own this" toggle, cart optimizer, multi-vendor checkout, Stripe payments, order tracking, automatic collection update on receipt.

---

### Journey 2: Sam the Searcher — "Find It Fast"

**Opening Scene:** Sam heard about a price spike on a Pokemon card — Charizard ex from Obsidian Flames. She doesn't use the deck builder; she wants to find, compare, and buy right now.

**Rising Action:** Sam lands on SideDecked and types "Charizard ex" into the universal search bar. Algolia returns results in < 200ms with smart categorization: Cards (12), Listings (47), Decks (8). She clicks the card result — the card detail page loads, aggregating data from both backends via the BFF endpoint.

The card detail page shows: high-res image, set info, market price chart (7-day/30-day/90-day), all active listings sorted by price+condition. She filters: **Condition: NM or LP**, **Ships from: US**. 23 listings remain.

**Climax:** Sam compares the top 3 listings. Each shows seller name, trust score, grading photos, shipping speed, and price. She notices one seller is $2 cheaper but has a 3.2 trust score vs. a $2 more seller with 4.8. She picks the trusted seller and taps "Add to Cart."

She spots two more cards she wants from the same seller — adds them. The cart shows consolidated shipping: $3.50 for all three from one seller vs. $10.50 if split. Toast: "Saved $7.00 on shipping by buying from one seller!"

**Resolution:** Single-seller checkout. Fast, simple. Confirmation toast, tracking number within 24 hours. Sam bookmarks SideDecked.

**Edge Cases & Error Recovery:**
- Zero results for exact spelling → "Did you mean...?" with fuzzy matches
- Price changed between search and cart → toast with updated price, option to proceed or remove
- Seller has shipping restrictions to Sam's region → listing hidden from her results automatically

**Capabilities Revealed:** Universal search, card detail BFF page, price history, listing filters, seller trust scores, shipping consolidation, search-first purchase flow.

---

### Journey 3: Maya the C2C Seller — "Turn Collection into Cash"

**Opening Scene:** Maya has 200+ Yu-Gi-Oh! cards from her tournament days. She wants to sell them but has never sold cards online. She signs up via Google OAuth and lands on her empty seller dashboard.

**Rising Action:** Maya taps "List a Card." The guided 3-step flow begins:
1. **Find your card** — She types "Blue-Eyes White Dragon" and selects the specific set/printing from autocomplete. The catalog SKU auto-links.
2. **Describe condition** — The interface shows a visual grading guide specific to Yu-Gi-Oh! (different wear patterns than MTG). Photo examples for each grade: NM shows crisp edges and clean foil, LP shows minor whitening, MP shows visible wear. She uploads a front and back photo. The system suggests "LP" based on her description; she confirms.
3. **Set your price** — Market data pre-fills: average LP price $12.50, low $10.00, high $15.00. A positioning indicator shows where her price falls. She sets $11.50 — toast: "Priced to sell! Below average for this condition."

**Climax:** After listing 15 cards in her first session (each taking ~90 seconds), Maya's seller dashboard shows her active inventory. Within 3 days, she gets her first sale — toast notification + email. The order page walks her through shipping: print label, pack cards (with TCG-specific packing tips — toploaders for holos, penny sleeves for commons), confirm shipment.

**Resolution:** Buyer confirms receipt. Maya earns her first seller rating (5 stars). Her seller trust score begins building. Stripe Connect pays out to her bank account. She lists 50 more cards over the weekend.

**Edge Cases & Error Recovery:**
- Card not found in catalog → manual entry with set/number fields, flagged for catalog team review
- Photo upload fails → retry with compression, works on mobile camera roll and live camera
- Buyer disputes condition → dispute flow with photo comparison (seller's listing photos vs. buyer's received photos)

**Capabilities Revealed:** OAuth signup, guided listing flow, game-specific grading guides with photos, market pricing guidance, seller dashboard, shipping workflow, Stripe Connect payouts, dispute resolution.

---

### Journey 4: Marcus the B2C Vendor — "Scale My Shop"

**Opening Scene:** Marcus runs a local MTG shop and currently lists on TCGPlayer. He wants to add SideDecked as a channel. He signs up as a business seller, completes Stripe Connect business verification, and opens the vendor panel.

**Rising Action:** Marcus exports his TCGPlayer inventory as CSV (2,400 cards). In the vendor panel, he uploads the file. The catalog matching engine processes it:
- **85% auto-matched** (2,040 cards) — exact SKU or high-confidence fuzzy match (pg_trgm > 0.7)
- **10% fuzzy review** (240 cards) — multiple potential matches, Marcus picks the correct one from suggestions
- **5% unmatched** (120 cards) — no catalog match found, flagged for manual entry or catalog team review

The review interface shows matches side-by-side: his CSV row vs. the matched catalog card with image. He resolves the 240 fuzzy matches in about 30 minutes.

**Climax:** 2,280 listings go live. Marcus configures pricing rules: "Match TCGPlayer low -5%" with a floor of cost+15%. The vendor panel dashboard shows real-time metrics: views, favorites, cart-adds, and sales. Within the first week, he gets 12 orders.

His dashboard highlights: "3 cards priced 20%+ above market — consider adjusting" and "Blue-Eyes Alternative (Secret) trending up 15% this week." He adjusts prices and sees cart-add rates improve.

**Resolution:** Marcus sets up a weekly CSV sync workflow. His SideDecked channel grows to 15% of his online revenue within 2 months. The vendor panel's financial reporting shows commission breakdown, payout history, and tax summaries.

**Edge Cases & Error Recovery:**
- CSV format mismatch → parser detects common formats (TCGPlayer, Crystal Commerce, manual), maps columns automatically
- Duplicate listings detected → warning with merge options
- Inventory goes to zero on one channel → real-time inventory sync prevents overselling (Growth feature)

**Capabilities Revealed:** Business seller onboarding, Stripe Connect verification, bulk CSV import, catalog matching (85/10/5 split), pricing rules, vendor analytics dashboard, financial reporting.

---

### Journey 5: Jordan the Community Member — "Find My People"

**MVP Phase:** Jordan discovers SideDecked through a shared deck link on Reddit. She views the public deck — a competitive Pioneer Spirits build. She can see the full decklist, card images, and total cost estimate without signing up. She clicks "Import to My Decks" — prompted to create an account via Google OAuth. After signup, the deck appears in her collection. She modifies it, toggling "I own this" on cards she already has, and uses "Buy Missing Cards" for the rest.

**Growth Phase:** Jordan follows the deck's creator. She browses their other public decks and sees their seller profile — they also sell the singles she needs. She purchases from them, building a direct buyer-seller relationship. She joins a "Pioneer Players" community group, shares her modified deck, and gets feedback from experienced players.

**Vision Phase:** Jordan organizes a local Pioneer night through SideDecked's event system. She creates an event, shares it to her community, and players RSVP. After the event, participants share their decklists, discuss matchups in the forum thread, and buy/sell cards they discovered during the event — closing the community-to-commerce loop.

**Edge Cases & Error Recovery:**
- Shared deck link has deleted cards → deck loads with placeholders: "Card removed from catalog — suggest replacement?"
- Community content reported → moderation queue, content hidden pending review, reporter notified

**Capabilities Revealed:** Public deck sharing, deck import, community profiles, buyer-seller relationships, community groups, event organization, community-to-commerce conversion.

---

### Journey 6: Priya the Admin — "Keep the Marketplace Healthy"

**Opening Scene:** Priya is the platform operations lead. She opens the admin dashboard Monday morning to review weekend activity.

**Rising Action:** The dashboard surfaces automated alerts:
- **Price anomaly detected:** A seller listed a $200 card for $2.00 — likely a decimal error. Auto-flagged before it went live, seller notified with correction suggestion.
- **Trust score drop:** A seller's rating dropped below 3.5 after 3 condition disputes. Automatic listing throttle applied — max 5 new listings/day until resolved.
- **Catalog gap:** 47 new cards from a One Piece set release have no catalog entries. ETL pipeline queued for next run; manual entry option available for high-demand cards.

**Climax:** Priya reviews a dispute between a buyer and seller over card condition. She compares the seller's listing photos against the buyer's received-condition photos. The grading discrepancy is clear — listed as NM, received as MP. She rules in the buyer's favor, issues a partial refund, and the seller's trust score adjusts. The automated system learns from this pattern.

She also reviews the weekly financial reconciliation report — all Stripe payouts match order records, commission calculations verified, no discrepancies.

**Resolution:** Priya approves 3 new business seller applications (Stripe verification passed, inventory minimum met), publishes the catalog update for the new One Piece set, and reviews the platform health dashboard: 99.7% uptime, API P95 at 82ms, zero data inconsistencies between catalog and listings.

**Edge Cases & Error Recovery:**
- Stripe webhook missed → reconciliation job catches discrepancy within 1 hour, auto-retries
- Bulk fraudulent listings detected → automated takedown + seller suspension + buyer notifications
- Database replication lag between services → circuit breaker prevents stale data from reaching users

**Capabilities Revealed:** Admin dashboard, automated price anomaly detection, trust score management, dispute resolution with photo evidence, catalog management, financial reconciliation, platform health monitoring, seller approval workflow.

---

### Journey Requirements Summary

| Journey | MVP Capabilities Required | Growth Capabilities | Vision Capabilities |
|---|---|---|---|
| Alex (Player) | Deck builder, "I own this", cart optimizer, multi-vendor checkout, collection auto-update | Price alerts, wishlist | AI deck suggestions |
| Sam (Searcher) | Universal search, card detail BFF, listing filters, seller trust | Price history charts, saved searches | Visual card search |
| Maya (C2C Seller) | Guided listing, game-specific grading, market pricing, Stripe payouts | Bulk listing from collection, analytics | Automated repricing |
| Marcus (B2C Vendor) | CSV import, catalog matching, vendor dashboard, pricing rules | Multi-channel sync, advanced analytics | ML demand forecasting |
| Jordan (Community) | Public decks, deck import, basic profiles | Community groups, following, deck sharing | Events, forums, trade |
| Priya (Admin) | Price anomaly alerts, dispute resolution, catalog management, reconciliation | Advanced fraud detection, automated moderation | ML-powered risk scoring |

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Platform MVP — prove that deck-to-cart conversion drives marketplace transactions. The two-sided marketplace chicken-and-egg is solved by sequencing: vendor CSV import bootstraps supply (one Marcus = 2,400 cards), guided listing grows the long tail (Maya lists the obscure cards Marcus doesn't stock).

**Launch Gate:** 50+ active sellers with real inventory before public launch. Without sufficient inventory density, the cart optimizer produces meaningless results and the core value proposition fails.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Alex (Player) — Full deck-to-cart-to-checkout flow
- Sam (Searcher) — Search-first purchase flow
- Maya (C2C Seller) — Guided 3-step listing
- Marcus (B2C Vendor) — CSV import with catalog matching
- Jordan (Community) — Public deck viewing and import only
- Priya (Admin) — Minimum viable admin via MedusaJS admin API

**Must-Have Capabilities:**

| Capability | Rationale | Estimate |
|---|---|---|
| Authentication (OAuth2 + JWT) | Gate for all user actions | Epic 1 (in progress) |
| Shopping cart + multi-vendor checkout | Core commerce flow | Epic 2 (completed) |
| Algolia search + filters + autocomplete | Card discovery (Sam's journey) | ~13 pts |
| TCG Catalog ETL (4 games) | Foundation for all card data | Existing |
| Deck builder + "I own this" + format validation | Core differentiator (Alex's journey) | ~21 pts |
| Cart optimizer (cheapest/fewest/best value) | Killer feature | ~13 pts |
| Stripe Connect + seller onboarding | Payment infrastructure | Epic 10 (in progress) |
| Vendor CSV import + catalog matching (85/10/5) | Supply-side bootstrap (Marcus) | ~13 pts |
| Guided 3-step listing + market pricing | Long-tail supply (Maya) | ~8 pts |
| Public deck sharing + OG tags + import CTA | Viral acquisition loop (Jordan MVP) | ~7 pts |
| Admin: price anomaly detection (MedusaJS admin) | Marketplace trust | ~5 pts |
| Admin: dispute resolution (MedusaJS admin) | Consumer protection | ~5 pts |
| Admin: seller approval queue (MedusaJS admin) | Platform governance | ~3 pts |
| Toast notifications (sonner) | UX hygiene — no alert() dialogs | ~3 pts |
| Card detail BFF endpoint | Aggregates both backends for key page | ~5 pts |

### Post-MVP Features

**Phase 2 — Growth:**
- Vendor performance dashboards + sales analytics (Epic 4)
- Price history charts + price alerts (Epic 7)
- Multi-channel inventory sync (Epic 9)
- C2C bulk listing from collection
- Escrow visualization (3-step order tracking)
- Collection management (CSV import from TCGPlayer/Moxfield)
- Community groups + following + deck comments
- Saved searches + search personalization
- Advanced admin dashboard (standalone)
- Financial reporting + automated reconciliation

**Phase 3 — Vision:**
- Community forums + direct messaging + events (Epic 6)
- ML price forecasting + predictive portfolio management
- Visual card recognition (camera-based)
- Multi-currency / international payments
- Semantic natural language search
- AI-powered content recommendations
- Automated repricing for sellers
- ML-powered fraud detection + risk scoring

### Risk Mitigation Strategy

**Technical Risks:**
- *BFF endpoint bridges both backends* — Build first, test cross-service reliability early. Circuit breaker pattern already architectured.
- *Cart optimizer performance at scale* — Target < 2s for 15 cards. Profile with realistic seller/listing density before launch.
- *Catalog matching accuracy* — 85% auto-match target requires robust pg_trgm tuning. Build review UI for the 10% fuzzy matches.
- *Data consistency (split-brain)* — Catalog SKU in customer-backend must stay in sync with product listings in commerce backend. Event-driven sync with reconciliation jobs.

**Market Risks:**
- *Insufficient seller inventory at launch* — Mitigate with targeted B2C vendor recruitment (10 shops x 2,400 cards = 24,000 listings). CSV import is the bootstrap weapon.
- *Deck-to-cart doesn't convert* — Validate with beta users before public launch. If conversion < 5%, iterate on optimizer UX before scaling.
- *Buyers don't trust seller grading* — Game-specific grading guides with photos + dispute resolution builds trust incrementally.
- *"I own this" adoption requires trust* — Users won't toggle cards if they fear data loss. Automatic collection update on order receipt builds trust incrementally.

**Domain Risks:**
- *Counterfeit cards* — Condition photo requirements for high-value listings (>$50), seller trust scores weighted by dispute history, buyer photo verification on receipt.
- *Price manipulation* — Automated detection of anomalous pricing (>50% below market), listing throttling for new/low-trust sellers, admin review queue.
- *Seller abandonment* — Seller inactivity detection (no order fulfillment >72 hours), automatic listing deactivation after repeated shipping failures, buyer notification and automatic refund.

**Resource Risks:**
- *Minimum team:* 2 full-stack devs + 1 designer. One dev owns backend (both services), one owns storefront + vendor panel.
- *Absolute minimum launch:* Drop guided listing (Maya) from MVP, keep CSV import only. Reduces MVP by ~8 points but sacrifices long-tail inventory.
- *If behind schedule:* Public deck sharing (~7 pts) is the last thing to cut — high value but lowest dependency risk.

## Functional Requirements

### Identity & Access

- **FR1:** Users can sign up and sign in via social OAuth providers (Google, Discord, Apple)
- **FR2:** Users can maintain a profile with display name, avatar, and shipping address
- **FR3:** Users can hold one of multiple roles with access scoped per role: buyers (browse, purchase, deck builder, wishlist), individual sellers (+ listing, fulfillment, seller dashboard), business sellers (+ CSV import, bulk pricing, vendor analytics), admins (+ moderation, catalog management, dispute resolution, seller approval)
- **FR4:** Authenticated sessions persist across browser sessions and work seamlessly across all platform services
- **FR5:** Unauthenticated users can browse cards, search, and view public decks without signing in

### Card Catalog & Discovery

- **FR6:** The platform maintains a universal card catalog spanning MTG, Pokemon, Yu-Gi-Oh!, and One Piece with game-specific attributes
- **FR7:** Users can search for cards with instant autocomplete suggestions across all games
- **FR8:** Users can filter search results by game, set, rarity, condition, price range, format legality, and seller location
- **FR9:** Users can view a card detail page aggregating catalog data, market pricing, and all active listings
- **FR10:** The catalog is populated and kept current via automated ETL pipelines from external data sources for all four games
- **FR11:** Card detail pages are indexable by search engines with structured product data and Open Graph metadata
- *(Growth)* **FR12:** Users can save cards to a wishlist for future purchase consideration
- *(MVP)* **FR13:** Users can view their recently viewed cards
- **FR14:** Users can sort search results and listings by price, seller rating, or relevance

### Deck Building & Collection

- **FR15:** Users can create, edit, save, and delete decks for any supported game and format
- **FR16:** Users can add cards to a deck via search with real-time format legality validation
- **FR17:** Users can toggle an "I own this" indicator on any card in their deck to track which cards they already have
- **FR18:** Users can view a deck summary showing total cards, cards owned, cards needed, and estimated cost of missing cards
- **FR19:** Users can share a deck via a public URL that renders with card images and social sharing metadata without requiring authentication to view
- **FR20:** Users can import a shared public deck into their own deck collection
- **FR21:** Users' collection status automatically updates when purchased cards are delivered and receipt is confirmed
- *(MVP)* **FR22:** Users can duplicate an existing deck to create a variant
- **FR23:** Deck builder supports game-specific deck zones (mainboard, sideboard, extra deck as applicable per game)
- **FR24:** Users can browse and discover publicly shared decks without a direct link

### Commerce & Checkout

- **FR25:** Users can add listings to a shopping cart from card detail pages, search results, or deck builder
- **FR26:** Users can trigger a cart optimizer from a deck that finds the best combination of sellers for missing cards, presenting options optimized for cheapest total, fewest packages, or best value
- **FR27:** The cart optimizer factors in per-seller shipping costs when calculating optimal purchasing combinations
- **FR28:** Users can complete checkout for a multi-vendor cart in a single transaction with saved payment and shipping information
- **FR29:** Multi-vendor orders create independent sub-orders per seller with separate tracking
- **FR30:** Users can view order status, tracking information, and confirm receipt of shipments
- **FR31:** Users receive toast notifications for: cart add/remove, checkout complete, order shipped, order delivered, dispute opened, dispute resolved, payout completed, listing sold, and price change on watched cards — with no alert() dialogs
- **FR32:** Listings track available quantity that decrements automatically on purchase

### Seller Experience

- **FR33:** Individual sellers can list a card for sale through a guided multi-step flow that pre-fills market pricing
- **FR34:** The listing flow provides game-specific visual grading guides with photo examples for each condition level
- **FR35:** Sellers can upload photos of their card (front and back) during the listing process
- **FR36:** Business sellers can upload a CSV inventory file and have cards automatically matched to the catalog with confidence tiers (auto-match, fuzzy review, unmatched)
- **FR37:** Business sellers can review and resolve fuzzy-matched and unmatched cards from their CSV import
- **FR38:** Sellers can view and manage their active listings, including editing price and condition
- **FR39:** Sellers receive notifications when their listings are purchased and can manage order fulfillment
- **FR40:** Business sellers can update prices in bulk via pricing rules or CSV re-import
- **FR41:** Sellers can configure shipping rates, methods, and regional availability for their listings
- **FR42:** Sellers can provide shipment tracking information (carrier and tracking number) when fulfilling orders
- *(Growth)* **FR43:** Sellers can view listing performance metrics: views, unique viewers, cart-adds, cart-add rate, sales count, and revenue per listing

### Payment & Financial

- **FR44:** Sellers can onboard to the payment system via Stripe Connect with identity verification
- **FR45:** The platform collects commission on each transaction and distributes the seller's portion via automated payouts
- **FR46:** The platform collects seller tax information during onboarding for 1099-K reporting compliance
- **FR47:** The platform calculates and collects applicable sales tax on behalf of sellers in marketplace facilitator jurisdictions

### Marketplace Trust & Safety

- **FR48:** The platform automatically detects and flags listings priced >50% below the 30-day average market price for the same card and condition before they go live
- **FR49:** Buyers can open a dispute on a received order with photo evidence of condition discrepancy
- **FR50:** Admins can resolve disputes by comparing seller listing photos against buyer-submitted photos and issuing full or partial refunds
- **FR51:** Sellers accumulate a trust score based on transaction history, dispute outcomes, and fulfillment reliability
- **FR52:** Admins can review and approve or reject new business seller applications
- *(MVP)* **FR53:** Listings from sellers who fail to fulfill orders are automatically deactivated after 3 or more unfulfilled orders within a 30-day period
- *(MVP)* **FR54:** Admins can suspend or ban seller accounts and cancel their active listings
- **FR55:** All prices displayed to users must originate from real listing data or verified market sources — no hardcoded, placeholder, or mock pricing in production

### Platform Administration

- **FR56:** Admins can view a queue of flagged listings (price anomalies, reported content) for review
- **FR57:** Admins can manage the card catalog, including triggering ETL updates and manually adding cards for new set releases
- **FR58:** The platform runs automated financial reconciliation between order records and payment processor data
- *(MVP)* **FR59:** The platform maintains referential integrity between catalog entries and product listings across both backends, with automated detection and alerting of orphaned or mismatched records
- *(MVP)* **FR60:** The platform sends transactional email notifications for key events (order confirmation, shipping updates, dispute status, payout completion)
- *(Growth)* **FR61:** Admins can view key platform metrics (GMV, active sellers, order volume, conversion rates)

## Domain-Specific Requirements

### Compliance & Regulatory

- **Payment Processing (PCI DSS)** — Stripe Connect handles card data (PCI Level 1). Platform never stores raw card numbers. Platform responsibilities: secure API key management, TLS everywhere, webhook signature verification.
- **Marketplace Operator Obligations** — As a multi-vendor marketplace, SideDecked must issue 1099-K forms to US sellers exceeding IRS thresholds ($600+/year). Stripe Connect handles reporting, but platform must collect seller tax information during onboarding.
- **Consumer Protection** — Buyer protection policy required: dispute window (14 days from delivery), condition mismatch claims with photo evidence, refund processing via Stripe. Must comply with FTC guidelines on marketplace seller accountability.
- **Sales Tax (Marketplace Facilitator)** — In states with marketplace facilitator laws, SideDecked is responsible for collecting and remitting sales tax on behalf of sellers. Stripe Tax or a tax calculation service (TaxJar/Avalara) required for automated compliance.

### Technical Constraints

- **TCG Data Licensing** — Card images, names, and game mechanics are IP of Wizards of the Coast (MTG), The Pokemon Company, Konami (Yu-Gi-Oh!), and Bandai (One Piece). Must comply with each publisher's fan content/API policies. Scryfall API is free for non-commercial card data with attribution; Pokemon TCG API has rate limits; Yu-Gi-Oh! and One Piece data may require scraping with legal review.
- **Price Data Sourcing** — Market pricing aggregated from external sources must comply with those sources' terms of service. No scraping TCGPlayer pricing without permission. Use only authorized data feeds or derive pricing from on-platform transaction data.
- **Real-Time Inventory Accuracy** — Multi-vendor marketplaces must prevent overselling. Inventory holds during checkout (TTL-based), optimistic locking on quantity updates, and cross-channel sync for vendors selling on multiple platforms.

### Integration Requirements

- **Stripe Connect** — Custom/Express accounts for sellers, destination charges for split payments, Connect webhooks for payout events, account verification status tracking.
- **Algolia** — Search index sync with both databases, faceted search across game-specific attributes, personalization with user search history.
- **TCG Data APIs** — ETL pipelines for 4 game catalogs, rate limiting compliance, graceful degradation when upstream APIs are unavailable.
- **Email (Resend)** — Transactional emails for orders, shipping, disputes. CAN-SPAM compliance for marketing emails (opt-in only).

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Deck-to-Cart Optimization (Primary Innovation)**
No competitor integrates a deck builder directly with a multi-vendor marketplace cart optimizer. TCGPlayer has a cart optimizer but it's separate from deck building. Moxfield has excellent deck building but links out to external stores. SideDecked combines both — "Build your deck, mark what you own, buy the rest from the cheapest sellers in one tap." This is a novel combination of two existing capabilities that creates a fundamentally different user experience.

**2. Collection-Aware Commerce ("I Own This" Toggle)**
The simple act of toggling owned cards in the deck builder creates a persistent collection state that transforms the purchase decision. Instead of "buy this deck" (60 cards), it's "buy these 32 cards I'm missing" — radically reducing friction and cost. No competitor bridges personal collection state into the purchase flow this directly.

**3. Community-to-Commerce Loop**
Shared decks become shopping lists. When a user shares a deck, every viewer can one-click import it and buy the missing cards. Deck popularity drives card demand visibility for sellers. This creates a network effect where community activity directly generates commerce — something competitors treat as separate concerns.

**4. Cross-Seller Cart Optimization with Shipping Intelligence**
The cart optimizer doesn't just find the cheapest price per card — it factors in combined shipping to find the globally optimal purchase across multiple sellers. Presenting "cheapest total," "fewest packages," and "best value" options gives buyers genuine agency over the cost/convenience tradeoff.

### Validation Approach

| Innovation | Validation Method | Success Signal |
|---|---|---|
| Deck-to-cart | Deck-to-cart conversion rate | >10% at launch |
| Collection-aware commerce | % of deck purchases using "I own this" | >50% of deck-originated purchases |
| Community-to-commerce | Purchases originating from shared deck links | >5% of total orders within 6 months |
| Cart optimization | Users selecting non-cheapest option | >30% pick "fewest packages" or "best value" |

## Web Application Specific Requirements

### Project-Type Overview

SideDecked is a Next.js 14 hybrid web application (SSR + CSR) serving as the primary consumer interface for a multi-vendor TCG marketplace. The storefront uses App Router with server-rendered pages for SEO-critical paths (card detail, search, seller profiles) and client-side transitions for interactive experiences (deck builder, checkout, cart optimizer). The vendor panel is a separate React 18 + Vite SPA (no SEO requirements).

### Browser & Device Matrix

| Browser | Support Level | Notes |
|---|---|---|
| Chrome (latest 2) | Full | Primary development target |
| Firefox (latest 2) | Full | |
| Safari (latest 2) | Full | Critical for iOS users |
| Edge (latest 2) | Full | Chromium-based |
| Samsung Internet | Basic | Android market share |
| IE 11 | None | Not supported |

**Device Strategy:** Mobile-first responsive. Touch-primary input with mouse/keyboard progressive enhancement. CSS-first layouts (no JS for core responsive behavior). Breakpoints: 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide).

### Responsive Design

- **Mobile (375-767px):** Single-column layouts. Bottom navigation. Touch-optimized deck builder with tap-to-add (no drag-and-drop). Card images sized for viewport. Sticky cart summary.
- **Tablet (768-1023px):** Two-column card grid. Side panel for deck builder. Swipe gestures for card galleries.
- **Desktop (1024px+):** Three-column layouts where appropriate. Full deck builder with drag-and-drop. Hover states for card previews. Keyboard shortcuts for power users.
- **Deck Builder Adaptation:** Desktop uses react-dnd HTML5Backend; mobile uses TouchBackend with tap-to-add fallback. Quantity controls always visible (not hover-dependent).

### Performance Strategy

Performance targets are defined in the Non-Functional Requirements section. Key implementation strategies: Next.js Image optimization for card images (WebP/AVIF with fallback). Route-based code splitting. Algolia InstantSearch for zero-latency search. Redis caching for price/inventory data. Prefetch shipping estimates from saved address before checkout.

### SEO Strategy

- **Server-Rendered Pages:** Card detail (`/cards/[game]/[slug]`), search results (`/search`), deck lists (`/decks/[id]`), seller profiles (`/sellers/[handle]`), category pages (`/[game]/[set]`)
- **Structured Data:** Product schema (JSON-LD) on card detail pages for Google Shopping. BreadcrumbList for navigation. AggregateOffer for multi-seller pricing.
- **Open Graph / Social:** Deck sharing links render card art collage + deck name + card count. Card detail pages show card image + price range. Seller profiles show rating + inventory count.
- **Sitemap:** Dynamic XML sitemap generated from catalog (4 games x thousands of cards). Prioritize cards with active listings. Regenerated daily via cron.
- **Canonical URLs:** Game-specific card URLs prevent duplicate content across printings.

Accessibility requirements (WCAG 2.1 AA) are defined in the Non-Functional Requirements section.

### Implementation Considerations

- **Rendering Strategy:** Static generation for marketing pages. ISR (Incremental Static Regeneration) for card detail pages (revalidate on inventory change). Server components for data-heavy pages. Client components for interactive features (deck builder, search, checkout).
- **State Management:** React Server Components for server state. Client-side: React Context for cart/auth, URL state for search filters. No global state library needed — Algolia and cart state cover primary needs.
- **Image Pipeline:** Card images served via Cloudflare CDN from MinIO storage. Responsive srcset for mobile/tablet/desktop. Lazy loading below the fold. Blur placeholder from catalog data.
- **Real-Time Data:** MVP uses HTTP polling (30s interval) for inventory/price on active pages. Redis cache invalidation on listing changes. Growth phase: SSE for watched cards/decks.

## Non-Functional Requirements

### Performance

| Metric | Target | Context |
|---|---|---|
| API response time (P95) | < 100ms | All backend endpoints |
| Database queries | < 50ms | Both PostgreSQL databases |
| Time to Interactive (TTI) | < 2 seconds | Storefront pages |
| First Contentful Paint (FCP) | < 1.2 seconds | Core Web Vitals |
| Largest Contentful Paint (LCP) | < 2.5 seconds | Core Web Vitals |
| Cumulative Layout Shift (CLS) | < 0.1 | Core Web Vitals |
| Search query response | < 200ms | Algolia-powered search |
| Cart optimizer execution | < 2 seconds | For decks up to 15 missing cards |
| Cart optimizer execution | < 5 seconds | For decks up to 60 missing cards |
| Initial bundle size | < 200KB gzipped | Storefront JavaScript |
| Card image load (above fold) | < 500ms | With CDN and responsive srcset |

- The platform must support 100 concurrent users at launch with no degradation
- Background jobs (ETL, price anomaly scan, reconciliation) must not impact user-facing performance
- Cart optimizer must remain performant as seller count scales (target: linear, not quadratic, with seller count)

### Security

- All data transmitted over TLS 1.2+ — no unencrypted HTTP in production
- JWT tokens signed with RS256, expiry < 24 hours, refresh token rotation
- OAuth2 secrets, Stripe API keys, and database credentials stored in environment variables, never in code or version control
- Stripe Connect handles all payment card data — the platform never stores, processes, or transmits raw card numbers (PCI DSS compliance via Stripe)
- Webhook endpoints verify Stripe signature headers before processing
- Admin API routes require admin role verification via server-side middleware
- User-uploaded images validated for file type, size (< 10MB), and sanitized before storage in MinIO
- Rate limiting on authentication endpoints (max 10 attempts per IP per minute)
- Rate limiting on search API (max 100 requests per user per minute)
- CSRF protection on all state-changing requests
- SQL injection prevention via parameterized queries and ORM query builders
- XSS prevention via framework default output escaping and Content Security Policy headers

### Scalability

- **Launch:** 100 concurrent users, 50 sellers, ~50,000 listings
- **6-month:** 1,000 concurrent users, 500 sellers, ~500,000 listings
- **12-month:** 5,000 concurrent users, 1,000+ sellers, ~2,000,000 listings
- Card catalog grows with each set release (~200-500 new cards per game per quarter)
- Database connection pooling: max 10 connections per service on Railway
- Redis caching for frequently accessed data (card prices, search facets, seller profiles) with TTL-based invalidation
- Algolia index supports up to 1M records on current plan — monitor and scale
- Image storage (MinIO) scales horizontally — no single-server bottleneck
- Background job queue (ETL, reconciliation) must handle 4-game catalog updates without blocking user-facing operations
- Stateless application servers allow horizontal scaling behind load balancer

### Reliability

- Platform uptime target: 99.5% (allows ~3.6 hours downtime per month)
- Cross-service API reliability: > 99.5% success rate between backend and customer-backend
- Circuit breaker pattern on all cross-service calls — graceful degradation when one backend is unavailable
- BFF endpoint (card detail page) degrades gracefully: show catalog data even if listing data is temporarily unavailable
- Stripe webhook processing: at-least-once delivery with idempotency keys to prevent duplicate processing
- Database backups: daily automated backups with 7-day retention on Railway
- Zero-downtime deployments via rolling updates
- ETL pipeline failures must not corrupt existing catalog data — atomic batch updates with rollback capability

### Accessibility

- WCAG 2.1 AA compliance across all storefront pages
- All interactive elements reachable via keyboard (Tab, Enter, Escape, Arrow keys)
- Deck builder: keyboard-accessible card addition, removal, and zone management (no drag-and-drop dependency)
- Card images include descriptive alt text (card name, set, collector number)
- Dynamic content changes announced via aria-live regions (price updates, cart changes, toast notifications)
- Condition badges use both color and text labels (not color-alone differentiation)
- Minimum 4.5:1 contrast ratio for all text content
- Focus indicators visible on all interactive elements
- prefers-reduced-motion respected for all animations
- Form inputs have associated labels; error messages are programmatically linked to their fields

### Integration Reliability

| Integration | Failure Mode | Degradation Strategy |
|---|---|---|
| Stripe Connect | Payment API unavailable | Queue orders, retry with exponential backoff, show "payment processing" status |
| Algolia | Search index unavailable | Fall back to PostgreSQL full-text search (slower but functional) |
| TCG Data APIs (Scryfall, etc.) | Upstream API down or rate limited | Serve cached catalog data, skip ETL update, retry next cycle |
| Resend (Email) | Email delivery failure | Queue and retry; critical emails (order confirmation) retry up to 3x |
| MinIO (Storage) | Object storage unavailable | Serve cached CDN images; new uploads queued for retry |
| Cross-service (backend ↔ customer-backend) | One service down | Circuit breaker opens after 3 failures; BFF returns partial data with degradation notice |

- All external API calls include timeout (5s default), retry (3x with exponential backoff), and circuit breaker
- Webhook processing is idempotent — duplicate delivery does not cause duplicate side effects
- ETL pipelines use checkpoint-based processing — resume from last successful point on failure
