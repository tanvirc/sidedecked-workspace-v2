# Story 3.4.1: Advanced Card Search

**Epic**: [epic-03-tcg-catalog.md](../epics/epic-03-tcg-catalog.md)
**Status**: in_progress
**Domain**: Customer Experience (customer-backend/)

## User Story

_As a user, I want to search for cards using complex criteria so that I can find exactly what I'm looking for._

## Acceptance Criteria

- (IMPLEMENTED) Text search across card names, types, rules text, and flavor text
- (IMPLEMENTED) Advanced filtering by game, set, rarity, mana cost, power/toughness, card type
- (IMPLEMENTED) Boolean search operators (AND, OR, NOT) for complex queries
- (IMPLEMENTED) Range searches for numerical values (mana cost, power, toughness, price)
- (IMPLEMENTED) Wildcard and regex support for flexible name matching
- (NOT BUILT) Saved search functionality with email alerts for new matches
- (IMPLEMENTED) Search result sorting by relevance, price, release date, alphabetical
- (IMPLEMENTED) Search autocomplete with intelligent suggestions
- (IMPLEMENTED) Search analytics and popular search term tracking

## Implementation Notes

The advanced card search integrates with the catalog and supports full text search across names, types, rules text, and flavor text. Game-specific attribute filtering (mana cost, power/toughness for MTG; HP, energy for Pokemon; ATK/DEF for Yu-Gi-Oh!) is supported. Boolean operators, range queries, and regex are available. Autocomplete provides intelligent suggestions as users type. Search analytics track popular terms for optimization. Saved search with email alerts is not yet built.
