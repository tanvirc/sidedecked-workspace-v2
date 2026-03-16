# M001: Platform Foundation

**Vision:** Authenticated users can browse and search a live multi-game TCG card catalog.

## Success Criteria

- User can register and log in via email/password and at least one OAuth provider
- Card catalog has >=1000 cards populated via ETL for at least one game
- Algolia search returns relevant results with faceted filtering
- Card detail page renders printings, market price, and seller listings from live data
- All unit tests pass; no P0 console errors in browser

## Key Risks / Unknowns

- ETL pipeline data quality - card images must be reliably served
- OAuth credential availability - may block full OAuth smoke test
- Algolia schema design - changes later are expensive

## Proof Strategy

- ETL risk -> retire in S03 by running a full ingest for one game and confirming Algolia has results
- Algolia schema risk -> retire in S03 by defining the schema up front and freezing it before S04 UI work
- OAuth risk -> retire in S02 by completing email/pass first, then treating each OAuth provider as an independent integration test

## Verification Classes

- Contract verification: unit tests (Vitest, Jest) for services and entities
- Integration verification: BFF API endpoints return expected shapes from live local stack
- Operational verification: ETL job runs without errors, Algolia index populated
- UAT / human verification: manual smoke test of register -> search -> card detail

## Milestone Definition of Done

- All 4 slices complete and verified
- End-to-end smoke test: new user registers -> searches a card -> views detail page
- No open P0 bugs
- REQUIREMENTS.md: R001-R006 advanced

## Requirement Coverage

- Covers: R001, R002, R003, R004, R005, R006
- Partially covers: R007 (seller listings visible on card detail, but no purchase flow)
- Leaves for later: R008-R042

## Slices

- [ ] **S01: Database Schemas & Core Entities** `risk:medium` `depends:[]`
  > After this: both PostgreSQL databases are running with full schemas; seed data loaded; TypeORM migrations clean.

- [ ] **S02: Auth & Identity** `risk:low` `depends:[S01]`
  > After this: users can register, verify email, and log in via email/password and OAuth providers; JWT shared between backend and customer-backend.

- [ ] **S03: TCG Catalog & ETL Pipeline** `risk:high` `depends:[S01]`
  > After this: card catalog is populated from upstream data sources; images served via CDN/MinIO; Algolia index has live card data.

- [ ] **S04: Card Browse, Search & Detail UI** `risk:low` `depends:[S02,S03]`
  > After this: storefront renders card search with facets, card detail page with printings and market price, all from live backend data.

## Boundary Map

### S01 -> S02

Produces:
- mercur-db schema + migrations (Medusa + MercurJS modules)
- sidedecked-db schema + TypeORM entities (Card, CardSet, Print, CatalogSKU, UserProfile, etc.)
- Docker Compose stack running both databases and Redis

Consumed by S02:
- customer table and auth tables in mercur-db
- user_profile entity in sidedecked-db

### S01 -> S03

Produces:
- Card, CardSet, Print, CatalogSKU entities and migrations
- ETLJob entity for tracking pipeline runs

Consumed by S03:
- All card catalog entities for ETL writes

### S02 + S03 -> S04

Produces:
- Working auth (login/register UI + API)
- Live Algolia card index
- Card/CatalogSKU data in sidedecked-db

Consumed by S04:
- Auth tokens for authenticated pages
- Algolia index for search UI
- customer-backend catalog API for card detail BFF
