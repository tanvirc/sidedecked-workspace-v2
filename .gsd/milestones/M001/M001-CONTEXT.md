# M001: Platform Foundation

**Gathered:** 2026-03-17
**Status:** Ready for planning

## Project Description

SideDecked is a multi-game TCG marketplace. Before any commerce or deck features can exist, the platform needs its data stores, auth system, card catalog, and search infrastructure in place.

## Why This Milestone

All subsequent milestones depend on: authenticated users, browsable card data, and a working search index. Nothing ships to users until these foundations are in place.

## User-Visible Outcome

### When this milestone is complete, the user can:
- Register, log in, and authenticate via email/password or OAuth (Google, Discord)
- Browse cards by game, set, and rarity
- Search for cards by name with faceted filtering
- View a card detail page with printings, current market price, and seller listings

## Completion Class

- Contract complete means: auth round-trip works end-to-end, card catalog is populated via ETL, Algolia search returns real results, card detail page renders live data from both backends.

## Final Integrated Acceptance

- New user can register -> email verified -> logged in -> search "Black Lotus" -> open card detail -> see printings and a seller listing.

## Risks and Unknowns

- ETL data quality: card image CDN (Cloudflare + MinIO fallback) must reliably serve images
- OAuth providers require live credentials (Google, Discord, Microsoft) - env-var-gated
- Algolia index schema must be agreed before ETL writes data to it

## Relevant Requirements

- R001 - Multi-game card catalog (MTG, Pokemon, Yu-Gi-Oh!, One Piece)
- R002 - Email/password authentication
- R003 - OAuth authentication (Google, Discord)
- R004 - Card search with faceted filtering (Algolia)
- R005 - Card detail page with printings and market price
- R006 - Session management and JWT sharing between services

## Scope

### In Scope
- Both database schemas (mercur-db + sidedecked-db)
- Auth stack (email, Google, Discord, Microsoft OAuth)
- TCG card catalog ETL pipeline (multi-game ingest, image processing)
- Algolia search index for cards
- Card browse, search, and detail UI in storefront

### Out of Scope
- Commerce (cart, checkout, orders) - M002
- Deck builder - M003
- Trust scores and reviews - M004
- Community features - M006

## Technical Constraints

- Backend uses MedusaJS v2 with MercurJS marketplace modules on Node.js
- Customer-backend uses Express + TypeORM (PostgreSQL) + Bull queues (Redis)
- Storefront is Next.js 15 App Router with React 19, Vitest for tests
- Redis is shared between backend (pub/sub) and customer-backend (Bull queues)

## Integration Points

- Storefront BFF routes aggregate catalog data from customer-backend and listing data from backend
- Customer-backend MedusaAuthService shares JWT secret with backend for internal calls

## Open Questions

- Which card games ship in v1 ETL? (MTG only, or all 4 simultaneously?)
- Is Cloudflare CDN pre-configured, or is MinIO direct the initial image source?
