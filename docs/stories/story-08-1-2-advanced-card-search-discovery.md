# Story 8.1.2: Advanced Card Search & Discovery

**Epic**: [epic-08-search-discovery.md](../epics/epic-08-search-discovery.md)
**Status**: in_progress
**Domain**: Both

## User Story

_As a player, I want sophisticated card search capabilities so that I can find specific cards based on various attributes and discover new cards for my collection._

## Acceptance Criteria

- (IMPLEMENTED) Comprehensive card attribute search (name, set, rarity, type, cost, power, toughness, etc.)
- (IMPLEMENTED) Boolean search operators for complex queries (AND, OR, NOT, parentheses)
- (NOT BUILT) Saved search functionality with alert notifications for new matching results
- (IN PROGRESS) Semantic search understanding card abilities and synergies across different wordings (PARTIAL)
- (IMPLEMENTED) Price range filtering with real-time market data integration
- (IMPLEMENTED) Format legality filtering with current ban list and rotation information
- (IMPLEMENTED) Advanced text search within card abilities and flavor text
- (IMPLEMENTED) Card collection status integration (owned, wanted, missing from deck)
- (IMPLEMENTED) Multi-game search with game-specific syntax and terminology support

## Implementation Notes

Card attribute search covers all game-specific fields including MTG mana cost and color identity, Pokemon HP and energy types, Yu-Gi-Oh! ATK/DEF and level, and One Piece cost and power. Boolean operators support complex multi-attribute queries. Price range filtering integrates with live market data. Format legality filtering uses the current ban list from the catalog system. Semantic search for ability synergies is partially implemented.
