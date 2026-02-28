# Story 9.1: Anonymous Homepage — Hero & Trust Foundation

**Epic:** Epic 9 — Storefront Homepage Redesign
**Story key:** 9-1-anonymous-homepage-hero-trust-foundation
**Status:** implemented

## User Story

As an anonymous visitor,
I want to land on a homepage that immediately proves the marketplace is real and shows me how to start,
So that I can evaluate SideDecked and begin searching within 10 seconds without doubting its legitimacy.

## Acceptance Criteria

**AC1:** Given I visit `/` without being authenticated, When the page loads, Then the page is server-rendered (no client-side flash of content) **And** an `<h1>` orientation sentence is visible above the fold: "The marketplace for MTG, Pokemon, Yu-Gi-Oh! and One Piece singles. Buy individual cards from verified sellers — no booster packs required." **And** a search bar is the largest interactive element above the fold **And** the search bar placeholder reads "Search cards, sets, sellers..."

**AC2:** Given the page has rendered, When I view the area below the search bar, Then an A-static trust strip is visible: "[card_count] cards · [seller_count] verified sellers · Buyers protected" **And** the trust strip data values are sourced from a server-side config (not hardcoded in the component) **And** a seller signal link is visible below the trust strip: "Become a seller →"

**AC3:** Given I am authenticated when visiting `/`, When the page loads, Then the seller signal link is not rendered.

**AC4:** Given the page is loaded on a mobile viewport (390px), When I view the layout, Then all elements are single-column and touch-target compliant (minimum 44x44px) **And** the search bar is reachable with one thumb.

**AC5:** Given the page is loaded on desktop (1280px+), When I view the layout, Then a two-column hero is rendered: left column (H1 + search + trust strip + seller signal), right column (trust stats card + seller opportunity card).

**AC6:** Given the page has fully loaded, When measured via Lighthouse or equivalent, Then LCP <= 2.5s and CLS < 0.1.

## Tasks

- [x] Task 1: Replace full homepage — remove GamesBentoGrid, HomeClient, HomeProductSection, community section; implement server-rendered RSC with H1 orientation sentence and search bar above fold [AC1]
- [x] Task 2: Create `lib/site-config.ts` with trust strip constants; implement A-static trust strip component [AC2]
- [x] Task 3: Implement auth-aware seller signal link — server-side auth check via cookies, degrade to showing link on auth error [AC3]
- [x] Task 4: Implement mobile layout — single-column, 44x44px touch targets, thumb-reachable search bar [AC4]
- [x] Task 5: Implement desktop two-column hero layout (left: H1+search+trust+signal; right: static stats card + seller opportunity card) [AC5]
- [x] Task 6: Performance validation — LCP <= 2.5s, CLS < 0.1; reserved height on right column [AC6]
- [x] Task 7: Tests (unit + integration) and quality gate [All ACs]

## UX Design Reference

Prototype: `_bmad-output/planning-artifacts/homepage-redesign-prototype-v1.html`
Wireframe: `_bmad-output/planning-artifacts/ux-9-1-anonymous-homepage-hero-trust-foundation-wireframe.html` (to be produced in Phase 2B)
