# Story 3.1.1: Card Information Management

**Epic**: [epic-03-tcg-catalog.md](../epics/epic-03-tcg-catalog.md)
**Status**: in_progress
**Domain**: Customer Experience (customer-backend/)

## User Story

_As a system administrator, I want to maintain accurate card information across all supported TCG games so that users can find reliable data for any card._

## Acceptance Criteria

- (IMPLEMENTED) Support for Magic: The Gathering, Pokémon, Yu-Gi-Oh!, and One Piece card games
- (IMPLEMENTED) Each card entry includes: name, mana cost/energy, type, subtype, rarity, rules text, flavor text, artist, power/toughness (when applicable)
- (IMPLEMENTED) Set information: set name, set code, release date, card number in set, total cards in set
- (IMPLEMENTED) Print variations: first edition, unlimited, promotional, alternate art, foil treatments
- (IN PROGRESS) Multi-language support for card names and text (English, Japanese, German, French, Spanish, Italian, Portuguese, Chinese, Korean) (PARTIAL)
- (IMPLEMENTED) Unique identification system for each card print with standardized SKU format
- (IMPLEMENTED) Card legality information for different competitive formats (Standard, Modern, Legacy, etc.)
- (IN PROGRESS) Collectibility data: popularity scores, investment potential, market demand indicators (PARTIAL)
- (IMPLEMENTED) Related card linking (reprints, alternate versions, transformation cards, token cards)
- (IMPLEMENTED) Version control for card data with complete change history

## Implementation Notes

The Card entity is in `Card.ts` with comprehensive field structure. The `master-etl.ts` supports multiple game imports. The `CardSet.ts` entity holds complete set metadata. The `Print.ts` entity handles print-specific data including foil and variant information. Card legality is determined via `isCardLegal` function in cards.ts. The `oracleId` and `oracleHash` fields in Card.ts provide unique identification. ETL job tracking provides version history.
