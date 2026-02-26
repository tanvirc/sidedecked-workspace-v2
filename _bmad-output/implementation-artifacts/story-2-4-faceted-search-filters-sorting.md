# Story 2-4: Faceted Search Filters & Sorting

**Epic:** Epic 2 — Card Catalog & Discovery
**Status:** ready-for-dev
**Story Key:** story-2-4-faceted-search-filters-sorting
**Plan:** docs/plans/2026-02-26-2-4-faceted-search-filters-sorting-plan.md

---

## Story

As a user searching for cards,
I want to filter by game, set, rarity, condition, price range, format legality, and seller location, and sort results,
So that I can narrow down exactly the cards I need.

---

## Acceptance Criteria

**AC1**
**Given** I am on the search results page
**When** filters are displayed
**Then** each facet shows real-time count of matching results (e.g., "MTG (2,340)", "Near Mint (890)")

**AC2**
**Given** I select a game filter
**When** results update
**Then** only cards from that game are shown and other facets update their counts accordingly

**AC3**
**Given** I apply multiple filters (e.g., game: MTG, set: Dominaria United, rarity: Mythic Rare)
**When** results update
**Then** results reflect all combined filters and I can clear individual filters or "Clear All"

**AC4**
**Given** I want to sort results
**When** I select a sort option
**Then** results re-order by price (low-high, high-low), seller rating, or relevance (default)

**AC5**
**Given** I am on mobile
**When** I tap the filter icon
**Then** filters appear in a bottom sheet with apply/clear actions

---

## Implementation Notes

_To be filled during implementation._

---

## Dev Notes

_To be filled during implementation._
