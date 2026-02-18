# Story 3.1.1: Card Information Management

**Epic**: [epic-03-tcg-catalog.md](../epics/epic-03-tcg-catalog.md)
**Status**: done
**Domain**: Customer Experience (customer-backend/)

## User Story

_As a system administrator, I want to maintain accurate card information across all supported TCG games so that users can find reliable data for any card._

## Acceptance Criteria

- (IMPLEMENTED) Support for Magic: The Gathering, Pokémon, Yu-Gi-Oh!, and One Piece card games
- (IMPLEMENTED) Each card entry includes: name, mana cost/energy, type, subtype, rarity, rules text, flavor text, artist, power/toughness (when applicable)
- (IMPLEMENTED) Set information: set name, set code, release date, card number in set, total cards in set
- (IMPLEMENTED) Print variations: first edition, unlimited, promotional, alternate art, foil treatments
- (IMPLEMENTED) Multi-language support for card names and text (English, Japanese, German, French, Spanish, Italian, Portuguese, Chinese, Korean)
- (IMPLEMENTED) Unique identification system for each card print with standardized SKU format
- (IMPLEMENTED) Card legality information for different competitive formats (Standard, Modern, Legacy, etc.)
- (IMPLEMENTED) Collectibility data: popularity scores, investment potential, market demand indicators
- (IMPLEMENTED) Related card linking (reprints, alternate versions, transformation cards, token cards)
- (IMPLEMENTED) Version control for card data with complete change history

## Implementation Notes

The Card entity is in `Card.ts` with comprehensive field structure. The `master-etl.ts` supports multiple game imports. The `CardSet.ts` entity holds complete set metadata. The `Print.ts` entity handles print-specific data including foil and variant information. Card legality is determined via `isCardLegal` function in cards.ts. The `oracleId` and `oracleHash` fields in Card.ts provide unique identification. ETL job tracking provides version history.

### Multi-language Support (story-03-1-1)

- `CardTranslation` entity (`src/entities/CardTranslation.ts`) with unique constraint on (cardId, languageCode)
- Trigram index (`idx_card_translations_name_trgm`) for fuzzy search on translated names
- ETL pipeline upserts translations during card processing via `orUpdate` on conflict
- Search endpoint supports `?lang=xx` parameter to search across translations
- Card detail and card details endpoints return `translations[]` array

### Collectibility Data (story-03-1-1)

- Card entity extended with `demandScore`, `scarcityIndicator`, `investmentPotential`, `collectibilityUpdatedAt`
- `CollectibilityService` (`src/services/CollectibilityService.ts`) computes metrics daily via JobScheduler
- Demand score: weighted composite (views, searches, cart adds, purchases, wishlist) normalized to 0-100 per game using percentile ranking
- Scarcity: 6 tiers (abundant/common/uncommon/scarce/rare/ultra_rare) based on print count with rarity boost
- Investment potential: `(demand*0.4) + (scarcity*0.3) + (priceTrend*0.3)`
- Card detail and details endpoints return `collectibility{}` object
