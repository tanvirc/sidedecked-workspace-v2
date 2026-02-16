# Story 3.2.2: Data Normalization & Validation

**Epic**: [epic-03-tcg-catalog.md](../epics/epic-03-tcg-catalog.md)
**Status**: completed
**Domain**: Customer Experience (customer-backend/)

## User Story

_As a system administrator, I want imported data to be standardized and validated so that all card information is consistent and accurate._

## Acceptance Criteria

- (IMPLEMENTED) Automatic data cleaning (standardized naming, consistent formatting)
- (IMPLEMENTED) Validation rules for each game's specific attributes and constraints
- (IMPLEMENTED) Mana cost/energy cost parsing and standardization across games
- (IMPLEMENTED) Card type hierarchy validation (Creature → Beast, Pokémon → Fire type, etc.)
- (IMPLEMENTED) Image URL validation and automatic rehosting to local CDN
- (IMPLEMENTED) Text formatting standardization (symbols, italics, rules text formatting)
- (IMPLEMENTED) Duplicate detection across data sources with merge capabilities

## Implementation Notes

The normalization pipeline handles standardized naming and consistent formatting across all supported games. Game-specific validation rules enforce attribute constraints. Mana/energy cost parsers standardize different notations across MTG, Pokemon, Yu-Gi-Oh!, and One Piece. Type hierarchies are validated per game. Images are automatically rehosted to the local CDN after URL validation. Duplicate detection uses merge capabilities to consolidate matching entries from different sources.
