---
depends_on:
  - M001
  - M002
---

# M003: Deck Builder & Optimizer

**Gathered:** 2026-03-17
**Status:** Ready for planning

## Project Description

The deck builder is the core differentiator of SideDecked. Users build decks, mark cards they own, and the optimizer finds the cheapest seller combination to fulfill missing cards in a single checkout.

## Why This Milestone

M001 (catalog) and M002 (marketplace) are prerequisites. The optimizer needs real listings to query and a real cart to fill. Without the optimizer, SideDecked is just another TCG marketplace.

## User-Visible Outcome

### When this milestone is complete, the user can:
- Create a deck and add cards from the catalog by search or card detail page
- Mark cards they already own (excluded from purchase)
- View the deck organized by zone (creatures, spells, lands, sideboard)
- Run the deck optimizer: see the cheapest seller combination for missing cards
- Add optimized cart to checkout with one tap
- View public decks from other users and copy them

## Completion Class

- Contract complete means: create deck -> mark owned cards -> run optimizer -> complete checkout. The optimizer must produce a valid cart cheaper than naive single-seller purchase.

## Final Integrated Acceptance

- Create a 60-card MTG deck -> mark 20 cards as owned -> run optimizer -> optimizer shows 3 seller groups with combined total < single-seller total -> add to cart -> checkout completes.

## Risks and Unknowns

- Optimizer algorithm complexity: finding cheapest seller combination across N missing cards is a set cover problem. Need to cap sellers at <=5 and cards at <=200 for performance.
- owned-cards cold-start: localStorage per-deck, synced from collection via GET /api/collection/owned. Cold-start gap on new device must not lose data.
- Mobile deck builder UX: drag-and-drop for desktop, tap-to-zone for mobile - different interaction models.

## Relevant Requirements

- R013 - Deck builder CRUD (create, name, format, add/remove cards)
- R014 - Owned cards tracking (mark owned, persist in collection)
- R015 - Deck zones (by type: creatures, spells, lands, sideboard)
- R016 - Deck format validation (Standard, Modern, Commander, etc.)
- R017 - Deck-to-cart optimizer (cheapest seller combination)
- R018 - Optimizer mode toggle (cheapest / fewest sellers / fastest ship)
- R019 - Public deck discovery and copy

## Scope

### In Scope
- Deck CRUD API (customer-backend)
- Deck builder UI: zones, card search, owned-cards toggle
- DeckBuilderContext: owned-cards state, getMissingCards(), syncServerOwnedCards()
- Optimizer algorithm: greedy set cover with <=5 sellers
- Optimizer UI: SellerGroupCard, OptimizerModeToggle, CartOptimizerPanel
- BFF route: GET /api/optimizer/listings (batch-fetches listings for missing cards)
- Public deck list and deck detail pages
- Deck format validation (DeckValidationService in customer-backend)

### Out of Scope
- Price history for cards in deck (M004)
- Deck sharing via Discord (M006)
- Sideboard editor beyond basic add/remove (future)

## Technical Constraints

- Optimizer must complete in <=3s for a 60-card deck with <=200 missing cards
- owned-cards state stored in localStorage per-deck, synced from collection on load
- BFF optimizer route must cap at <=5 concurrent upstream requests

## Open Questions

- Which optimization modes ship in M003? (cheapest only, or all 3 toggles?)
- Is the optimizer server-side or client-side? (client-side with BFF data fetch is simpler)
- Deck format validation: block on invalid or warn only?
