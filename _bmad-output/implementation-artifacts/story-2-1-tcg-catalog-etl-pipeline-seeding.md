# Story 2-1: TCG Catalog ETL Pipeline Seeding

**Epic:** Epic 2 - Card Catalog & Discovery
**Status:** done
**Story Key:** story-2-1-tcg-catalog-etl-pipeline-seeding

---

## Story

As a platform operator,
I want the card catalog populated with data from all four TCG games via automated ETL,
So that users have real cards to search, browse, and build decks with.

---

## Acceptance Criteria

**AC1** (IMPLEMENTED)
**Given** the ETL pipeline is triggered for MTG
**When** processing completes
**Then** cards, sets, and prints are populated from Scryfall with game-specific JSONB attributes (`manaCost`, `colorIdentity`, `power`, `toughness`, `typeLine`)

**AC2** (IMPLEMENTED)
**Given** the ETL pipeline is triggered for Pokemon
**When** processing completes
**Then** cards are populated with Pokemon-specific attributes (`hp`, `retreatCost`, `weakness`, `stage`, `evolvesFrom`)

**AC3** (IMPLEMENTED)
**Given** the ETL pipeline is triggered for Yu-Gi-Oh!
**When** processing completes
**Then** cards are populated with Yu-Gi-Oh!-specific attributes (`attackPoints`, `defensePoints`, `level`, `attribute`, `monsterType`)

**AC4** (IMPLEMENTED)
**Given** the ETL pipeline is triggered for One Piece
**When** processing completes
**Then** cards are populated with One Piece-specific attributes (`power`, `cost`, `counterValue`, `color`, `attribute`)

**AC5** (IMPLEMENTED)
**Given** each card is imported
**When** a CatalogSKU is generated
**Then** it follows `{GAME}-{SET}-{NUMBER}-{LANG}-{CONDITION}-{FINISH}` with normalized tokens

**AC6** (IMPLEMENTED)
**Given** the ETL pipeline fails mid-execution
**When** the failure is detected
**Then** existing catalog data is not corrupted (atomic updates with rollback) and the failure is logged

---

## Clarifications Confirmed In Phase 2

- Transaction boundary is per game (transactional per game).
- Duplicate/conflict resolution is deterministic:
  - prefer the record with highest completeness score (required fields present),
  - tie-break by latest source `updated_at`,
  - final tie-break by smallest stable source identifier.
- SKU normalization is required and enforced:
  - uppercase all tokens,
  - transliterate to ASCII,
  - replace non-alphanumeric sequences with `-`,
  - collapse repeated `-`,
  - trim leading/trailing `-`,
  - use `UNK` when a token is missing.
- ETL execution mode is seed plus weekly scheduled runs.
