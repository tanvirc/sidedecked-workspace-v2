# Story 5.1.2: Format-Specific Validation

**Epic**: [epic-05-deck-building.md](../epics/epic-05-deck-building.md)
**Status**: in_progress
**Domain**: Customer Experience (customer-backend/)

## User Story

_As a competitive player, I want my deck to be validated against specific format rules so that I can ensure it's legal for tournaments._

## Acceptance Criteria

- (IMPLEMENTED) Comprehensive format support (Standard, Modern, Legacy, Commander, etc.)
- (IMPLEMENTED) Real-time validation with immediate feedback on illegal cards or quantities
- (IMPLEMENTED) Ban list integration with automatic updates from official sources
- (IMPLEMENTED) Restricted list handling for formats with limited cards
- (IMPLEMENTED) Minimum deck size requirements with visual indicators
- (IMPLEMENTED) Maximum copies per card enforcement based on format rules
- (IN PROGRESS) Format-specific rules explanation and documentation (PARTIAL)
- (IMPLEMENTED) Rotation tracking for rotating formats with warnings for rotating cards
- (IN PROGRESS) Custom format support for local tournament and casual play rules (PARTIAL)

## Implementation Notes

The deck validation system provides real-time feedback using a traffic light system (Green: legal, Yellow: warnings, Red: illegal). Ban list integration uses automatic updates from official sources with format legality tracked in card data. Rotation tracking warns about cards leaving the format. Format documentation exists in basic form but detailed explanations and custom format creation need verification.
