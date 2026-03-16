# M003: Deck Builder & Optimizer

**Vision:** Build a deck, mark what you own, buy the rest from the cheapest sellers in one tap.

## Success Criteria

- User can create a deck and add cards from catalog search
- Deck displays organized by zone (creatures, spells, lands, sideboard)
- Owned-cards toggle persists and syncs to collection
- Optimizer computes cheapest seller combination for missing cards in <=3s
- Optimizer result fills cart; checkout completes successfully
- Public deck discovery shows community decks with copy action
- Format validation warns on illegal cards for the selected format

## Key Risks / Unknowns

- Optimizer algorithm: set cover is NP-hard at scale; must design efficient heuristic for <=200 cards <= 5 sellers
- owned-cards sync: cold-start gap on new device; must not show wrong owned state
- Listing availability: optimizer may fetch stale listings if Algolia not fresh

## Proof Strategy

- Optimizer algorithm risk -> retire in S02 by implementing greedy heuristic and benchmarking against 200-card deck
- owned-cards sync risk -> retire in S01 by proving sync round-trip in isolation before optimizer uses it
- Listing freshness risk -> retire in S02 by confirming BFF fetches from Medusa (not Algolia) for final optimizer results

## Verification Classes

- Contract verification: unit tests for optimizer algorithm, deck CRUD, format validation
- Integration verification: optimizer BFF route returns valid seller groups for a test deck
- Operational verification: optimizer completes in <=3s for 200-card deck
- UAT / human verification: manual end-to-end from deck creation to optimized checkout

## Milestone Definition of Done

- All 3 slices complete
- End-to-end: create deck -> optimizer -> checkout
- Optimizer performance: <=3s for 200 missing cards
- No P0 bugs in deck builder or optimizer

## Requirement Coverage

- Covers: R013, R014, R015, R016, R017, R018, R019
- Leaves for later: R020+ (trust, community, admin features)

## Slices

- [ ] **S01: Deck Builder Core** `risk:medium` `depends:[]`
  > After this: users can create decks, add cards, organize by zone, mark owned cards, and view public decks.

- [ ] **S02: Deck-to-Cart Optimizer** `risk:high` `depends:[S01]`
  > After this: the optimizer computes cheapest seller combination for missing cards and fills the cart.

- [ ] **S03: Format Validation & Public Decks** `risk:low` `depends:[S01]`
  > After this: deck format validation warns on illegal cards; public deck discovery and copy are functional.

## Boundary Map

### S01 -> S02

Produces:
- Deck CRUD API (/api/decks) in customer-backend
- DeckBuilderContext with getMissingCards() and owned-cards sync
- Deck UI: zones, add/remove card, owned toggle

Consumed by S02:
- getMissingCards() returns card list for optimizer
- Deck ID for linking optimizer results to cart

### S01 -> S03

Produces:
- Deck entity with game/format fields
- Public deck listing API

Consumed by S03:
- Format field for validation
- Public flag for deck discovery

### S02 depends on M002/S01

Consumed from M002:
- Listing variants with catalog_sku linkage (needed for optimizer to find prices)
- Cart API for filling after optimization
