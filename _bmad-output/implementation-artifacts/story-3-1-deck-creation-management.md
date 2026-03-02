# Story 3.1: Deck Creation & Management

**Epic:** Epic 3 — Deck Building & Collection
**Story key:** 3-1-deck-creation-management
**Status:** done

## User Story

As a TCG player,
I want to create, edit, save, delete, and duplicate decks for any supported game and format,
So that I can manage my deck collection across all games I play.

## Acceptance Criteria

**AC1 (IMPLEMENTED):** Given I am authenticated, When I click "New Deck" on `/decks`, Then a Modal (Dialog) opens with a game selector (4 tiles: MTG, Pokemon, Yu-Gi-Oh!, One Piece), a game-specific format dropdown, and a deck name input (non-empty, max 100 chars). On submit the deck is saved to my collection, the modal closes, and the new deck appears in my deck list with 0 cards.

**AC2 (IMPLEMENTED):** Given I navigate to `/decks`, Then I see all my decks as cards showing: deck name, game badge (colour per game: MTG purple, Pokemon yellow, YGO gold, One Piece red), format, card count, and estimated cost placeholder ("—"). When I have no decks, an empty state with a "Create your first deck" prompt is shown.

**AC3 (IMPLEMENTED):** Given I have an existing deck, When I open its kebab menu, I can rename it (inline edit: save on Enter/blur, cancel on Escape) and change its format (same game only — game cannot be changed post-creation). When I select "Delete", the deck is hidden immediately and a 5-second undo toast appears. If I do not click "Undo" within 5 seconds, the deck is permanently deleted. If I click "Undo", the deck is restored instantly with no data loss.

**AC4 (IMPLEMENTED):** Given I open a deck's kebab menu and select "Duplicate", Then a copy is created with "(Copy)" appended to the name, preserving all existing cards and ownership toggles. A toast confirms the duplication. Duplicating an empty deck is valid.

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

- [x] Task 1: Create `Deck` entity in customer-backend with fields: id, userId, name, game, format, cardCount (computed), createdAt [AC1, AC2]
- [x] Task 2: Add CRUD API routes to customer-backend: POST /api/decks, GET /api/decks (user-scoped), PATCH /api/decks/:id, DELETE /api/decks/:id, POST /api/decks/:id/duplicate [AC1–AC4]
- [x] Task 3: Create `/decks` page in storefront with deck list grid and empty state [AC2]
- [x] Task 4: Create `DeckCard` component — shows name, game badge, format, card count, cost placeholder, kebab menu [AC2, AC3, AC4]
- [x] Task 5: Create `NewDeckModal` (Dialog) with game selector tiles (reuse/adapt GameTile), format dropdown, name input, and validation [AC1]
- [x] Task 6: Implement rename flow — inline edit on deck name in DeckCard [AC3]
- [x] Task 7: Implement soft-delete with 5-second undo toast — delayed DELETE call to API [AC3]
- [x] Task 8: Implement duplicate flow — POST /api/decks/:id/duplicate, add to list with toast [AC4]
- [x] Task 9: Tests (unit + integration) and quality gate [All ACs]

## Dev Agent Record

### File List

**customer-backend:**
- `src/entities/Deck.ts` — modified (varchar(100) on name)
- `src/migrations/1777200000000-NarrowDeckNameTo100.ts` — created
- `src/routes/decks.ts` — modified (GET /, PATCH /:id, POST /:id/duplicate; fixed DELETE; GET / now includes gameCode via game relation)
- `src/tests/routes/decks.test.ts` — created

**storefront:**
- `src/app/[locale]/(main)/decks/page.tsx` — modified (DeckBrowsingPage → DeckManagementPage)
- `src/lib/api/customer-backend.ts` — modified (DeckDto with gameCode, getUserDecks, createDeck, patchDeck, deleteDeck, duplicateDeck)
- `src/components/decks/DeckManagementPage.tsx` — created
- `src/components/decks/DeckManagementClient.tsx` — created
- `src/components/decks/DeckCard.tsx` — created
- `src/components/decks/NewDeckModal.tsx` — created
- `src/components/decks/__tests__/DeckManagementPage.test.tsx` — created
- `src/components/decks/__tests__/DeckCard.test.tsx` — created
- `src/components/decks/__tests__/NewDeckModal.test.tsx` — created
- `src/components/decks/__tests__/DeckManagementClient.test.tsx` — created
- `e2e/story-3-1-deck-management.spec.ts` — created (Phase 5 QA; 16 Playwright test cases)
- `package.json` — modified (added test:e2e, test:e2e:headed, test:e2e:report scripts)

### Review Follow-ups (AI — 2026-03-02)

- [ ] [AI-Review][HIGH] Add `authenticateToken` middleware to `DELETE /:deckId/cards/:cardId` route — pre-existing auth bypass [customer-backend/src/routes/decks.ts:819]
- [ ] [AI-Review][MEDIUM] Remove/replace debug `console.log` statements logging user IDs in production [customer-backend/src/routes/decks.ts:257-262, 366-375, 553-572]
- [ ] [AI-Review][MEDIUM] `DeckManagementPage.tsx` silently swallows 401 — consider redirecting unauthenticated users to auth [storefront/src/components/decks/DeckManagementPage.tsx:10]
- [ ] [AI-Review][MEDIUM] `DELETE /api/decks/:deckId` should return HTTP 204 not 200; update test [customer-backend/src/routes/decks.ts:889, src/tests/routes/decks.test.ts:168]
- [ ] [AI-Review][LOW] `NewDeckModal` shows no loading/error state if `getGames` API fails [storefront/src/components/decks/NewDeckModal.tsx:60-63]
- [ ] [AI-Review][LOW] Add `try/catch` + error toast to `handleRename` and `handleChangeFormat` [storefront/src/components/decks/DeckManagementClient.tsx:30-37]
- [ ] [AI-Review][LOW] `DeckDto.cardCount` should be required `number` not optional [storefront/src/lib/api/customer-backend.ts:1056]
- [ ] [AI-Review][LOW] Two TODO comments in routes/decks.ts violate no-TODO rule — open GitHub issues [customer-backend/src/routes/decks.ts:131, 444]
- [ ] [AI-Review][LOW] Standardise API response shape (add `success` wrapper to GET /api/decks or remove from PATCH/DELETE responses)

### Change Log

| Date | Author | Type | Notes |
|---|---|---|---|
| 2026-03-02 | SM/BA/PM/UX | requirements | Story file created; Phase 2 clarifications applied |
| 2026-03-02 | Dev | implementation | Story 3-1 implemented — all 9 tasks complete, quality gates pass |
| 2026-03-02 | QA/UX | phase-5b-audit | Phase 5B UX validation: PASS — 0 HIGH, 3 MEDIUM (backlog), 10 LOW findings |
| 2026-03-02 | Tech Writer | documentation | CHANGELOG.md, integration-architecture.md, ACs marked (IMPLEMENTED), sprint-status done |
| 2026-03-02 | Code Review | adversarial-review | 1H (pre-existing auth bypass), 4M, 5L — M1 File List fixed; rest logged as action items |

## UX Design Reference

Wireframe: `_bmad-output/planning-artifacts/ux-3-1-deck-creation-management-wireframe.html`
Figma File Key: k5seLEn5Loi0YJ6UrJvzpr
Figma Node ID: `75:2`
Figma URL: https://www.figma.com/design/k5seLEn5Loi0YJ6UrJvzpr?node-id=75-2
