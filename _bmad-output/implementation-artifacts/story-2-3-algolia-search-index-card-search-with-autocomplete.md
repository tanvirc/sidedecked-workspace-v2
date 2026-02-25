# Story 2-3: Algolia Search Index & Card Search with Autocomplete

**Epic:** Epic 2 — Card Catalog & Discovery
**Status:** done
**Story Key:** story-2-3-algolia-search-index-card-search-with-autocomplete
**Plan:** docs/plans/2026-02-26-2-3-algolia-search-plan.md

---

## Story

As a user,
I want to search for cards with instant autocomplete across all four games,
So that I can find specific cards in under a second.

---

## Acceptance Criteria

**AC1** `(IMPLEMENTED)`
**Given** the catalog is populated
**When** the Algolia sync job runs
**Then** all prints are indexed in Algolia with game, set, rarity, format legality, and pricing facets

**AC2** `(IMPLEMENTED)`
**Given** I focus the search bar
**When** I type 2+ characters
**Then** autocomplete suggestions appear in < 200ms with card names, set context, and game badge

**AC3** `(IMPLEMENTED)`
**Given** I type a search query
**When** results load
**Then** cards are displayed in a responsive grid (2 columns mobile, 3 tablet, 4-5 desktop) using the CardDisplay component

**AC4** `(IMPLEMENTED)`
**Given** I press Enter or tap "View All Results"
**When** the full results page loads
**Then** I see all matching cards with PriceTag showing lowest available price and seller count

**AC5** `(IMPLEMENTED)`
**Given** I misspell a card name
**When** zero results would be returned
**Then** Algolia provides fuzzy match suggestions ("Did you mean...?")

---

## Implementation Notes

_To be filled during implementation._

---

## Dev Notes

_To be filled during implementation._
