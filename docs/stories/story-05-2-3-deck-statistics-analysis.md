# Story 5.2.3: Deck Statistics & Analysis

**Epic**: [epic-05-deck-building.md](../epics/epic-05-deck-building.md)
**Status**: in_progress
**Domain**: Customer Experience (customer-backend/)

## User Story

_As a deck builder, I want comprehensive deck analysis so that I can optimize my deck's performance._

## Acceptance Criteria

- (IMPLEMENTED) Mana curve visualization with interactive histogram
- (IMPLEMENTED) Card type distribution pie charts and breakdowns
- (IMPLEMENTED) Color distribution and mana base analysis for multi-color decks
- (IN PROGRESS) Draw probability calculator for specific cards and combinations (PARTIAL)
- (NOT BUILT) Opening hand simulator with mulligan decision support
- (NOT BUILT) Deck speed analysis and turn-by-turn play probability
- (NOT BUILT) Synergy detection highlighting card interactions and combos
- (NOT BUILT) Competitive analysis comparing deck to meta decks in format
- (NOT BUILT) Weakness identification suggesting improvements and missing pieces
- (NOT BUILT) Performance prediction based on deck composition and meta analysis

## Implementation Notes

The DeckStats component provides mana curve histograms, card type distribution pie charts, and color distribution analysis for multi-color decks. Basic probability functions exist in the codebase but the draw probability calculator UI needs verification. Advanced simulations including opening hand simulator, synergy detection, and competitive meta analysis are not yet implemented.
