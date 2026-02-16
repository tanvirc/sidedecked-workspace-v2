# Story 5.1.3: Deck Zone Management

**Epic**: [epic-05-deck-building.md](../epics/epic-05-deck-building.md)
**Status**: in_progress
**Domain**: Customer Experience (customer-backend/)

## User Story

_As a deck builder, I want to manage different deck zones so that I can properly organize my deck according to game rules._

## Acceptance Criteria

- (IMPLEMENTED) Zone-specific card management (main deck, sideboard, command zone, extra deck, maybe board)
- (IMPLEMENTED) Visual separation of zones with clear labeling and card counts
- (IMPLEMENTED) Zone-specific card limits and validation rules
- (IMPLEMENTED) Drag-and-drop between zones with automatic validation
- (IMPLEMENTED) Zone statistics and analysis (mana curve per zone, card type distribution)
- (IMPLEMENTED) Quick actions for moving cards between zones
- (IMPLEMENTED) Zone-based filtering and search within the deck
- (IMPLEMENTED) Collapsible zone views for focused editing
- (IN PROGRESS) Zone printing and export options for tournament preparation (PARTIAL)
- (IMPLEMENTED) Mobile-optimized zone switching and management

## Implementation Notes

The ZoneManager component uses a tabbed interface for zone switching. Game-specific zones include MTG (Main Deck, Sideboard, Command Zone, Maybe Board), Pokémon (Deck), Yu-Gi-Oh! (Main Deck, Extra Deck, Side Deck), and One Piece (Leader, Deck). Drag-and-drop zone transfer is implemented with automatic validation. Zone statistics show mana curves and card type distributions per zone. Zone export for tournament preparation exists partially.
