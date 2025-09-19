# QA Gate – Epic 05 Deck Building

- **Gate Status**: Pending
- **QA Owner**: Quinn (Test Architect)

## Entry Criteria
- Story 05.1 deck builder interface functional in staging.
- Validation ruleset fixtures available for MTG, Pokémon, Yu-Gi-Oh!, One Piece.

## Exit Criteria
- Automated tests covering drag-and-drop interactions, deck metrics, autosave.
- Cross-browser verification (Chrome, Firefox, Safari) for deck builder UI.
- Real-time validation results confirmed against official rules docs.

## Coverage Strategy
- Unit: deck metrics calculation, rules engine adapters.
- Integration: autosave/resume flows, multi-game switching.
- E2E: Build deck, validate, export summary, share link.

## Outstanding Risks
- Performance for large decks; profiling required with virtualization.
- Collaboration features (future stories) may introduce concurrency concerns.

## Artifacts & Evidence
- Performance profiling notes to be stored under `storefront/docs/perf/deck-builder.md`.
- Validation fixture repository tracked in `customer-backend/fixtures/deck-rules/`.
