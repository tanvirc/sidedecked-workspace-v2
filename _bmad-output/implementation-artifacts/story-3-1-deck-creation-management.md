# Story 3.1: Deck Creation & Management

**Epic:** Epic 3 — Deck Building & Collection
**Story key:** 3-1-deck-creation-management
**Status:** ready-for-dev

## User Story

As a TCG player,
I want to create, edit, save, delete, and duplicate decks for any supported game and format,
So that I can manage my deck collection across all games I play.

## Acceptance Criteria

**AC1:** Given I am authenticated, When I click "New Deck" on `/decks`, Then a Modal (Dialog) opens with a game selector (4 tiles: MTG, Pokemon, Yu-Gi-Oh!, One Piece), a game-specific format dropdown, and a deck name input (non-empty, max 100 chars). On submit the deck is saved to my collection, the modal closes, and the new deck appears in my deck list with 0 cards.

**AC2:** Given I navigate to `/decks`, Then I see all my decks as cards showing: deck name, game badge (colour per game: MTG purple, Pokemon yellow, YGO gold, One Piece red), format, card count, and estimated cost placeholder ("—"). When I have no decks, an empty state with a "Create your first deck" prompt is shown.

**AC3:** Given I have an existing deck, When I open its kebab menu, I can rename it (inline edit: save on Enter/blur, cancel on Escape) and change its format (same game only — game cannot be changed post-creation). When I select "Delete", the deck is hidden immediately and a 5-second undo toast appears. If I do not click "Undo" within 5 seconds, the deck is permanently deleted. If I click "Undo", the deck is restored instantly with no data loss.

**AC4:** Given I open a deck's kebab menu and select "Duplicate", Then a copy is created with "(Copy)" appended to the name, preserving all existing cards and ownership toggles. A toast confirms the duplication. Duplicating an empty deck is valid.

## Clarifications (Phase 2 — 2026-03-02)

- Game-specific format lists (hardcoded):
  - MTG: Standard, Modern, Pioneer, Legacy, Vintage, Commander, Pauper
  - Pokemon: Standard, Expanded
  - Yu-Gi-Oh!: Advanced, Traditional
  - One Piece: Standard
- Game cannot be changed after deck creation (format can be changed within same game only)
- Deck name: non-empty, max 100 chars
- Estimated cost: "—" placeholder — deferred to Story 3-4 (Deck Stats & Summary)
- Delete: soft-delete with 5-second undo toast, then hard-delete (no server soft-delete flag needed — implement as delayed DELETE call)
- Creation surface: Dialog modal over `/decks` page (not a dedicated route)
- Duplication: copy is created immediately; empty deck duplication is valid
- BR1: Users can only CRUD their own decks
- BR5: All mutations require authenticated session (unauthenticated → deferred-auth per Story 1-4)

## Tasks

- [ ] Task 1: Create `Deck` entity in customer-backend with fields: id, userId, name, game, format, cardCount (computed), createdAt [AC1, AC2]
- [ ] Task 2: Add CRUD API routes to customer-backend: POST /api/decks, GET /api/decks (user-scoped), PATCH /api/decks/:id, DELETE /api/decks/:id, POST /api/decks/:id/duplicate [AC1–AC4]
- [ ] Task 3: Create `/decks` page in storefront with deck list grid and empty state [AC2]
- [ ] Task 4: Create `DeckCard` component — shows name, game badge, format, card count, cost placeholder, kebab menu [AC2, AC3, AC4]
- [ ] Task 5: Create `NewDeckModal` (Dialog) with game selector tiles (reuse/adapt GameTile), format dropdown, name input, and validation [AC1]
- [ ] Task 6: Implement rename flow — inline edit on deck name in DeckCard [AC3]
- [ ] Task 7: Implement soft-delete with 5-second undo toast — delayed DELETE call to API [AC3]
- [ ] Task 8: Implement duplicate flow — POST /api/decks/:id/duplicate, add to list with toast [AC4]
- [ ] Task 9: Tests (unit + integration) and quality gate [All ACs]

## Dev Agent Record

### File List

*(to be filled during implementation)*

### Change Log

| Date | Author | Type | Notes |
|---|---|---|---|
| 2026-03-02 | SM/BA/PM/UX | requirements | Story file created; Phase 2 clarifications applied |

## UX Design Reference

Wireframe: `_bmad-output/planning-artifacts/ux-3-1-deck-creation-management-wireframe.html`
Figma File Key: k5seLEn5Loi0YJ6UrJvzpr
Figma Node ID: *(captured 2026-03-02 — open Figma file, click the Story 3-1 page, get node ID from URL `?node-id=X-Y` → convert to `X:Y`)*
Figma File URL: https://www.figma.com/design/k5seLEn5Loi0YJ6UrJvzpr
