# Epic 05: Deck Building System

> **Status**: Not Started · **Bounded Context**: Deck/Community · **Primary Repos**: `storefront`, `customer-backend`

## Epic Goal
Provide collectors with a multi-game deck builder that supports validation, collection sync, social sharing, and export workflows.

## Dependencies
- Catalog data and legality rules (Epic 03).
- Community publishing and moderation (Epic 06).
- Authentication for user-owned decks (Epic 01).

## Assumptions
- Deck data stored in `sidedecked-db` with per-game schema variations handled via JSONB.
- Real-time validation powered by rulesets maintained in catalog service.
- Storefront deck builder uses drag-and-drop UI with virtualization for large card lists.

## Stories

### Story 5.1: Deck Builder Interface
**Status**: Not Started  
**Story**: As a player, I want an interactive deck builder so that I can assemble decks quickly.

**Acceptance Criteria**
1. Workspace supports drag-and-drop, search, filters, and keyboard shortcuts.
2. Multiple game modes available (MTG, Pokémon, Yu-Gi-Oh!, One Piece) with dynamic rulesets.
3. Mana curve / energy / attribute summaries update in real time.
4. Autosave to drafts with offline fallback for connectivity interruptions.

### Story 5.2: Validation & Rules Engine
**Status**: Not Started  
**Story**: As a player, I want legality checks so that my deck meets tournament requirements.

**Acceptance Criteria**
1. Validation rules loaded per game/format and evaluated on every change.
2. Violations surfaced inline with actionable guidance.
3. Export to PDF/Text includes validation summary and key metrics.
4. API endpoints available for external deck import via code strings.

### Story 5.3: Collection Sync & Wishlist
**Status**: Not Started  
**Story**: As a user, I want my deck to reflect owned cards so that I can plan purchases.

**Acceptance Criteria**
1. Users can mark cards as owned/traded/wishlist per quantity.
2. Deck view indicates gaps and links to marketplace listings.
3. Bulk import from CSV or vendor inventory to mark ownership.
4. Collection data stored per account with version history.

### Story 5.4: Sharing & Collaboration
**Status**: Not Started  
**Story**: As a community member, I want to share and discuss decks so that I can collaborate.

**Acceptance Criteria**
1. Public deck pages with slug URLs, metadata, and commenting enabled.
2. Access controls for private, team, or public visibility.
3. Versioning system with change log and restore points.
4. Embed/export options (MTG Arena, Pokemon TCG Live) provided.

## Risks & Mitigations
- **Performance**: Virtualize deck lists and minimize re-renders for large card counts.
- **Validation drift**: Schedule updates when official rules change; run regression suite.

## QA Strategy
- Jest/RTL tests for deck UI interactions and state reducers.
- Integration tests for validation API using real rules fixtures.
- Playwright tests for share/publish flows.

## Change Log
| Date       | Version | Description                              | Author            |
|------------|---------|------------------------------------------|-------------------|
| 2025-09-12 | 1.0.0   | BMAD epic created, legacy spec archived  | Product Team      |
