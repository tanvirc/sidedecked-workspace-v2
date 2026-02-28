# Story 2.5: Card Detail Page (BFF Endpoint)

**Epic:** Epic 2 — Card Catalog & Discovery
**Story key:** 2-5-card-detail-page-bff-endpoint
**Status:** in-progress

## User Story

As a user viewing a specific card,
I want to see all information aggregated: catalog data, market pricing, and all active listings,
So that I can make an informed purchase decision from a single page.

## Acceptance Criteria

**AC1:** Given I navigate to a card detail page, When the BFF endpoint responds, Then data is aggregated from both customer-backend (catalog, pricing) and backend (active listings, seller info) into a single response.

**AC2:** Given the card detail page renders, When I view the page, Then I see card image (full-bleed), game-specific attributes, set info, format legality, and all active listings sorted by price + condition.

**AC3:** Given listings are displayed, When I view seller rows, Then each shows seller name, trust signal ("99.2% positive · 412 sales"), condition, price, shipping estimate, and "Add to Cart" button.

**AC4:** Given the backend (listings) is temporarily unavailable, When the BFF endpoint degrades, Then catalog data still renders with a notice: "Seller listings temporarily unavailable" (circuit breaker graceful degradation).

**AC5:** Given the card has multiple printings, When I view the card detail page, Then other printings are shown in a horizontally scrollable print browser with set name, year, and cheapest in-stock price per print.

**AC6 (NEW):** Given I am on the card detail page, When I select a print from the print browser, Then: (1) the card image updates to that print's art, (2) the Quick Buy panel updates to the cheapest in-stock price for that print with condition chips (only in-stock conditions active) and a quantity stepper, and (3) the listings section re-fetches for that print's catalogSku. The Quick Buy panel is sticky in the left column on desktop and a sticky bottom bar on mobile.

**AC6a — Edge cases:**
- Print with zero stock: Quick Buy shows "No listings for this print" with auth-aware "Notify me" stub (not an error state)
- Condition with no stock: condition chip is disabled, not just visually dimmed
- Quantity capped at available quantity with inline "Only N left" label
- Race condition on rapid print switching: last-settled response wins; Quick Buy shows skeleton during re-fetch

## Tasks

- [ ] Task 1: Define BFF TypeScript interfaces [AC1, AC3]
- [ ] Task 2: Create BFF service with circuit breaker [AC1, AC4]
- [ ] Task 3: Create BFF API route handler [AC1]
- [ ] Task 4: Verify/create backend listings and trust endpoints [AC1, AC3]
- [ ] Task 5: Wire page.tsx and data layer to BFF [AC1, AC2]
- [ ] Task 6: Update CardDetailPage and listings components [AC2, AC3, AC4, AC5]
- [ ] Task 6b: Build PrintBrowser component and QuickBuyPanel component [AC5, AC6, AC6a]
- [ ] Task 7: Validation and quality gate [All ACs]
