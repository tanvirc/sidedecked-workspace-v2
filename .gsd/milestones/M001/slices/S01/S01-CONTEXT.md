---
id: S01
milestone: M001
status: ready
---

# S01: Database Schemas & Core Entities

## Goal

Both PostgreSQL databases (mercur-db and sidedecked-db) are running locally via Docker Compose with complete, validated schemas and seed data.

## Why This Slice

Every other slice in M001 and all future milestones depend on the databases being correctly structured. Schema mistakes discovered late are expensive. This slice retires that risk first.

## Scope

### In Scope
- Docker Compose configuration for both databases and Redis
- MedusaJS/MercurJS module registration and initial migrations (mercur-db)
- TypeORM entity definitions and migrations for all TCG domain entities (sidedecked-db)
- Seed data: games (MTG, Pokemon, Yu-Gi-Oh!, One Piece), formats
- Schema validation: foreign keys, indexes, constraints verified

### Out of Scope
- Auth provider configuration (S02)
- ETL card data ingest (S03)
- Application-level services and routes (S02+)

## Constraints

- No direct foreign keys between mercur-db and sidedecked-db - CatalogSKU string is the link
- TypeORM migrations must be reversible (down migrations required)
- MedusaJS migrations are managed by Medusa CLI - do not hand-edit

## Integration Points

### Consumes
- Docker Compose base config in `docker-compose.apps.yml`

### Produces
- `mercur-db` PostgreSQL instance with Medusa + MercurJS schema
- `sidedecked-db` PostgreSQL instance with 31 TypeORM entities
- Redis instance for pub/sub and Bull queues
- Seed data: games table, formats table

## Open Questions

- Should both databases be in the same Docker Compose file or separate?
- What is the naming convention for TypeORM migration timestamps?

---

## Normalization Notes (Phase 1)

**Gathered:** 2026-03-17 by SDLC orchestrator

### Codebase State at Normalization

**customer-backend entities (31 files confirmed on disk):**
Activity, AuthEvent, Card, CardImage, CardSet, CardTranslation, CatalogSKU, Collection, CollectionCard, Conversation, Deck, DeckCard, ETLJob, Format, ForumCategory, ForumPost, ForumTopic, Game, MarketPrice, Message, PriceAlert, PriceHistory, PricePrediction, Print, SellerRating, SellerReview, TrustScoreHistory, UserCollection, UserFollow, UserProfile, Wishlist, WishlistItem

**customer-backend migrations (19 files on disk):**
1. `1755427495483-InitialSchema` — base schema
2. `1755589363792-AddImageProcessingStatusToPrint`
3. `1755735597526-SeedGameFormats` — note: seed in migration
4. `1755735646652-AddAllGameFormatLegality`
5. `1755868920649-CreateSellerRating`
6. `1755961572255-UpdateUserIdFields`
7. `1755962156944-UpdateFormatIdToVarchar`
8. `1756008146433-AddDeckFields`
9. `1756010973291-AddZoneToDeckCards`
10. `1756033233742-EnhanceFormatSystem`
11. `1772800000000-AddProfileFieldsToUserProfile`
12. `1772800100000-AddPreferencesToUserProfile`
13. `1772900000000-CreateTrustScoreHistory`
14. `1772900100000-AddIndividualVerificationFields`
15. `1776700000000-AddCardTranslationsAndCollectibility`
16. `1777000000000-AddSessionInvalidatedAt`
17. `1777000100000-CreateAuthEvents`
18. `1777100000000-ExpandPrintRarityColumn`
19. `1777200000000-NarrowDeckNameTo100`

**backend medusa-config registered modules:**
Core: auth (emailpass, google, discord, microsoft), authentication, email-verification, two-factor-auth, seller-messaging
MercurJS: seller, reviews, marketplace, configuration, order-return-request, dispute, requests, brand, wishlist, split-order-payment, attribute, taxcode

**Docker Compose current state:**
`docker-compose.apps.yml` has a SINGLE `db` container (postgres:16-alpine, database: `app`) — NOT yet split into mercur-db + sidedecked-db. Redis is present. This is the primary gap this slice must close.

### Key Gaps Identified
1. **Docker Compose not split** — single `app` DB must become `mercur-db` + `sidedecked-db`
2. **Migration completeness unknown** — 19 migrations vs 31 entities; need audit to confirm all fields covered
3. **Seed baked into migration** — `SeedGameFormats` migration handles seeds; a separate `npm run seed` script may not exist yet
4. **mercur-db port conflict** — if both DBs expose to host, ports 5432 and 5433 needed
5. **Down migrations** — not confirmed present for all 19 migrations

---

## Readiness Gate Findings (Phase 2 Party Mode)

**Date:** 2026-03-17
**Verdict:** PASSED — Ready to plan

### Panel Flags (implementation-level, not blockers)

| # | Flag | Resolution |
|---|------|------------|
| F1 | `npm run seed` script may not exist as a standalone command — seed data is baked into `SeedGameFormats` migration | Plan must verify or create seed script; AC may need to reference migration instead |
| F2 | `customer-backend/src/data-source.ts` missing from plan's touched files | Add to T01 (DB split) or T03 (entity migrations) task |
| F3 | Exact working directory for `npx medusa db:migrate` — monorepo root (`backend/`) vs app dir (`backend/apps/backend/`) | Plan must specify `cd backend/apps/backend && npx medusa db:migrate` |
| F4 | Port assignments for split DBs — `mercur-db` on 5432, `sidedecked-db` on 5433 (host ports; Docker network uses service names) | Document in T01 Docker Compose task |
| F5 | Migration completeness audit — 19 migrations for 31 entities; fat InitialSchema may cover most, but late-added entities (Forum*, ETLJob, PriceAlert, PricePrediction) may be missing | Add audit step to T03 |
| F6 | Down migrations not currently tested in ACs | Add `migration:revert` spot-check to T03 verification |
| F7 | Docker Compose strategy — update `docker-compose.apps.yml` in-place (not a new file) to avoid breaking CI/existing scripts | Decision recorded: update in-place |
