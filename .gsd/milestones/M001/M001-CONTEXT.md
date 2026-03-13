# M001: MVP Core Loop — Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

## Project Description

SideDecked is a multi-game TCG marketplace with a split-brain architecture. M001 delivers the minimum viable product: a pixel-perfect Voltage-themed storefront where users can browse cards, build decks, buy missing cards via an optimized multi-vendor cart, and sellers can list cards through a guided wizard. Every storefront page must match its Voltage wireframe exactly.

## Why This Milestone

The platform has substantial backend infrastructure and frontend scaffolding, but two critical gaps prevent launch: (1) the storefront doesn't match the Voltage wireframe designs, creating a visually inconsistent experience that undermines marketplace trust, and (2) the core differentiating features (cart optimizer, listing wizard) don't exist yet. M001 closes both gaps to create a launchable product that proves deck-to-cart conversion drives transactions.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Browse cards on a pixel-perfect Voltage-themed storefront that matches wireframe designs on desktop and mobile
- Search cards with Algolia autocomplete, faceted filters, and game-specific sorting
- View card detail pages with BFF-aggregated data, seller listings, and trust signals
- Build decks with DnD (desktop) or touch (mobile), manage game-specific zones, validate format legality
- Mark cards as owned, see cost estimates for missing cards
- Tap "Buy Missing Cards" and see the cart optimizer find the cheapest/fewest/best-value combination of sellers
- Complete multi-vendor checkout in a single Stripe transaction
- Sign in with Google or Discord OAuth
- List cards for sale via a 3-step wizard with game-specific grading guides and market pricing
- See their collection auto-update when purchased cards are received

### Entry point / environment

- Entry point: `http://localhost:3000` (storefront)
- Environment: local dev with all 4 services running
- Live dependencies involved: PostgreSQL x2, Redis, Algolia, Stripe Connect (test mode)

## Completion Class

- Contract complete means: All 672+ storefront tests pass, all pages render without error, card components match wireframe token values
- Integration complete means: BFF endpoints aggregate both backends, cart optimizer queries both databases, OAuth flow completes end-to-end across both backends
- Operational complete means: Full user journey works in local dev: search → deck build → optimize → checkout → receipt confirmation → collection update

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A user can sign in via Google OAuth, build an MTG deck, mark 30 of 60 cards as owned, tap "Buy Missing Cards", see optimization results from multiple sellers, add to cart, and complete checkout
- A seller can sign in, upgrade to seller role, list a card via the 3-step wizard with game-specific grading guide, and see the listing appear on the card detail page
- Every storefront page renders pixel-perfect to its Voltage wireframe on both 1440px desktop and 390px mobile viewports
- All wireframes have been exported to Figma

## Risks and Unknowns

- Cart optimizer algorithm complexity — finding the globally optimal seller combination with shipping is NP-hard. Need a good-enough heuristic that runs in < 2s for 15 cards.
- Cross-service data freshness — optimizer needs real-time inventory from backend and card data from customer-backend. Stale data = overselling risk.
- Wireframe generation at scale — 32 pages need wireframes. Must follow Voltage patterns exactly without design drift.
- Google/Discord OAuth — provider implementations don't exist yet. MedusaJS v2 auth module has specific conventions that must be followed (existing Apple/Facebook/Microsoft providers are reference).
- Pixel-perfect alignment effort — 46 pages is a lot of visual work. Risk of diminishing returns on minor pixel differences.

## Existing Codebase / Prior Art

- `storefront/src/app/colors.css` — Voltage design tokens (light + dark mode), already comprehensive
- `storefront/src/app/globals.css` — Typography classes (display, heading, label scales), nav utilities
- `docs/plans/wireframes/sd-nav.js` — Shared nav component for wireframes, authoritative nav design
- `docs/plans/wireframes/storefront-*.html` — 9 existing wireframes (homepage, cards, card-detail, search, deck-browser, deck-builder, deck-viewer, auth, profile)
- `storefront/src/components/cards/` — 46 card components (14,691 lines), CardBrowsingPage, CardDetailPage, search components
- `storefront/src/components/deck-builder/` — 15 deck builder components (5,900 lines), DnD + touch support
- `storefront/src/components/decks/` — 10 deck management components (2,165 lines)
- `storefront/src/components/search/` — 11 search components with Algolia integration and tests
- `storefront/src/components/homepage/` — HeroSection, GameSelectorGrid, TrustSection, SellerCTABanner
- `storefront/src/components/ui/` — shadcn/ui components (Sheet, Command, Dialog, AlertDialog, Tooltip, Popover, DropdownMenu, sonner)
- `backend/apps/backend/src/modules/authentication/providers/` — Apple, Facebook, Microsoft auth providers (reference for Google/Discord)
- `backend/apps/backend/src/api/store/consumer-seller/` — Seller listing, order, payout routes
- `customer-backend/src/services/MarketDataService.ts` — Market pricing data (560 lines)
- `customer-backend/src/services/DeckValidationService.ts` — Format validation (639 lines)
- `customer-backend/src/routes/catalog.ts` — Card catalog API (1,496 lines)

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R001–R025 — All active M001 requirements. See `.gsd/REQUIREMENTS.md` for full details.

## Scope

### In Scope

- Pixel-perfect Voltage alignment for all 46 storefront pages (9 existing wireframes + 32 generated)
- Figma export of all wireframes via MCP
- Google + Discord OAuth provider implementation
- Cart optimizer algorithm (cheapest/fewest/best-value with shipping)
- Cart optimizer UI (bottom sheet mobile, side panel desktop)
- 3-step seller listing wizard with game-specific grading
- Deck-to-cart end-to-end flow
- Collection auto-update on receipt confirmation
- Trending strip wiring to live data
- Final alert() → sonner migration

### Out of Scope / Non-Goals

- Apple OAuth (deferred — needs Developer Program)
- CSV bulk import for vendors (M002)
- Price anomaly detection (M002)
- Dispute resolution (M002)
- Seller trust score calculation (M002)
- Price history charts (M003)
- Community features (M004)
- ML features (M005)
- Multi-currency / international payments
- Vendor panel changes (vendorpanel/ is not in M001 scope)
- Backend admin UI changes
- Performance optimization beyond existing targets

## Technical Constraints

- Split-brain database: cart optimizer must query both backends via API, never direct DB cross-access
- Railway DB pool max 10: optimizer queries must be efficient, batched where possible
- MedusaJS auth module conventions: OAuth providers must follow the pattern in existing apple-auth.provider.ts
- Storefront import pattern: `@/` path alias, double quotes, no semicolons
- shadcn/ui + Tailwind: all new components must use existing design system primitives
- Wireframes must include `sd-nav.js` shared nav and follow Voltage token naming exactly

## Integration Points

- **Algolia** — Search index for card browse, deck builder card search, search page. Already integrated.
- **Stripe Connect** — Checkout payment processing, seller payouts. Already integrated in test mode.
- **Customer-backend API** — Card catalog, deck data, pricing, format validation. Routes exist.
- **Backend API** — Listings, cart, orders, auth, seller management. Routes exist.
- **Redis** — Cross-service events for collection auto-update (order.receipt.confirmed → collection.ownership.updated)
- **MinIO** — Card photo storage for listing wizard uploads
- **Figma MCP** — HTML wireframe export to Figma designs

## Open Questions

- Figma MCP auth — needs to be configured before S06 can export. May need user to provide Figma API token.
- Cart optimizer algorithm choice — greedy heuristic vs. ILP solver vs. hybrid. Greedy is simplest and likely sufficient for MVP volumes. Will decide during S09 planning.
- Wireframe coverage for edge states — do the ~32 generated wireframes need to cover empty states, error states, and loading states, or just the primary happy path? Assuming happy path + key empty state per page.

## Per-Slice Doc Reading Guide

Before starting each slice, read these files in addition to the slice plan:

### S01 (Design Foundation)
- `docs/plans/wireframes/sd-nav.js` — authoritative nav design
- `storefront/src/app/colors.css` — existing Voltage tokens
- `storefront/src/app/globals.css` — typography classes
- `_bmad-output/planning-artifacts/ux-design-specification.md` — full UX design spec

### S02 (Card Browse, Detail, Search)
- `docs/plans/wireframes/storefront-cards.html` — card browse wireframe
- `docs/plans/wireframes/storefront-card-detail.html` — card detail wireframe
- `docs/plans/wireframes/storefront-search.html` — search wireframe
- `_bmad-output/project-context.md` — TypeScript/framework rules

### S03 (Deck Builder, Browser, Viewer)
- `docs/plans/wireframes/storefront-deck-builder.html` — deck builder wireframe
- `docs/plans/wireframes/storefront-deck-browser.html` — deck browser wireframe
- `docs/plans/wireframes/storefront-deck-viewer.html` — deck viewer wireframe
- `storefront/src/contexts/DeckBuilderContext.tsx` — existing deck builder state

### S04 (Homepage)
- `docs/plans/wireframes/storefront-homepage.html` — homepage wireframe

### S05 (Auth & Profile)
- `docs/plans/wireframes/storefront-auth.html` — auth wireframe
- `docs/plans/wireframes/storefront-profile.html` — profile wireframe
- `backend/apps/backend/src/modules/authentication/providers/apple-auth.provider.ts` — reference OAuth provider

### S06 (Wireframe Generation)
- All 9 existing wireframes — pattern reference
- `docs/plans/wireframes/sd-nav.js` — shared nav component

### S07 (Remaining Pages)
- Generated wireframes from S06

### S08 (Listing Wizard)
- `_bmad-output/planning-artifacts/epics.md` — Stories 4.2, 4.3, 4.4 for listing flow spec
- `customer-backend/src/services/MarketDataService.ts` — market pricing API
- `customer-backend/src/routes/catalog.ts` — card search for listing identification

### S09 (Cart Optimizer)
- `_bmad-output/planning-artifacts/prd.md` — Alex the Player journey for UX expectations
- `_bmad-output/planning-artifacts/epics.md` — Stories 5.1, 5.2 for optimizer spec
- `backend/apps/backend/src/api/store/carts/` — existing cart API

### S10 (Integration & Polish)
- All prior slice summaries
