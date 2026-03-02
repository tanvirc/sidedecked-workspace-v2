# Deck Creation & Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow authenticated TCG players to create, edit, save, delete, and duplicate decks for any supported game and format.
**Story:** 3-1-deck-creation-management — `_bmad-output/implementation-artifacts/story-3-1-deck-creation-management.md`
**Domain:** Customer Experience
**Repos:** customer-backend/, storefront/
**Deployment:** true — new API endpoints + storefront page changes
**UX Wireframe:** `_bmad-output/planning-artifacts/ux-3-1-deck-creation-management-wireframe.html`
**Figma Reference:** N/A (Figma capture not yet done)
**Figma File Key:** k5seLEn5Loi0YJ6UrJvzpr
**Figma Node ID:** N/A

---

## Requirements Brief (from Phase 2)

### Acceptance Criteria

**AC1 — Create Deck:**
- Auth required. "New Deck" button on `/decks` opens a Dialog modal.
- Modal: 4 static game selector tiles (MTG, Pokemon, Yu-Gi-Oh!, One Piece); game-specific format dropdown (hardcoded per game); deck name input.
- Validation: non-empty, max 100 chars.
- On submit: deck saved → modal closes → new deck appears at top of list with 0 cards.

**AC2 — List Decks:**
- `/decks` shows all authenticated user's decks as cards.
- Each card: deck name, game badge (MTG=purple, Pokemon=yellow, YGO=gold, One Piece=red), format, card count, cost placeholder "—".
- Empty state: "Create your first deck" CTA button opens New Deck modal.

**AC3 — Edit/Delete:**
- Kebab menu: Rename (inline edit), Change Format (inline select panel), Delete.
- Rename: `<input>` with current name; Enter or blur = save; Escape = cancel.
- Change Format: same game only; game field immutable after creation.
- Delete: 5-second undo toast — deck hidden immediately (optimistic); `DELETE /api/decks/:id` fires after 5s delay from frontend via `setTimeout`. Undo cancels timer and restores deck to list.

**AC4 — Duplicate:**
- POST `/api/decks/:id/duplicate` → new deck with "(Copy)" appended to name, all DeckCard rows copied.
- Duplicated deck appears at top of list with green highlight border.
- Success toast confirms. Empty deck duplication is valid.

### Business Rules
- BR1: Users can only CRUD their own decks (ownership check on all mutations).
- BR5: All mutations require authenticated session.
- Game is immutable after deck creation; format is changeable within the same game.

### Hardcoded Format Lists
```
MTG:       Standard, Modern, Pioneer, Legacy, Vintage, Commander, Pauper
Pokemon:   Standard, Expanded
Yu-Gi-Oh!: Advanced, Traditional
One Piece: Standard
```

---

## Technical Design (from Phase 3)

### Domain Routing
Customer Experience → `customer-backend/` (sidedecked-db) + `storefront/`

### Existing Code (all REFACTOR — more complete than expected)
- `customer-backend/src/entities/Deck.ts` — exists; `name` needs varchar(100) + migration
- `customer-backend/src/entities/DeckCard.ts` — exists; used in duplicate logic
- `customer-backend/src/routes/decks.ts` — exists; missing `GET /api/decks`, `PATCH /:id`, `POST /:id/duplicate`; DELETE has no auth + uses hard-remove (BR1 bug)
- `storefront/src/app/[locale]/(main)/decks/page.tsx` — renders `DeckBrowsingPage` (Story 3-6 premature code); must switch to `DeckManagementPage`
- `storefront/src/components/deck-builder/DeckListPage.tsx` — partial match; superseded by DeckManagementPage
- `storefront/src/components/deck-builder/CreateDeckModal.tsx` — superseded by NewDeckModal (static tiles + hardcoded formats)
- `storefront/src/components/homepage/GameTile.tsx` — reuse/adapt for game selector tiles

### New API Routes (customer-backend)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | /api/decks | required | Return authenticated user's own decks, ordered by updatedAt desc |
| PATCH | /api/decks/:id | required + owner | Update name and/or formatCode (reject gameId — game is immutable) |
| POST | /api/decks/:id/duplicate | required + owner | Copy deck + all DeckCard rows; append "(Copy)" to name |
| DELETE | /api/decks/:id | **FIXED: add auth + owner** | Soft-delete via TypeORM `softDelete()` (was hard-remove with no auth) |

### Storefront Customer Backend Client
Add to `storefront/src/lib/api/customer-backend.ts`:
- `getUserDecks()` → `GET /api/decks`
- `createDeck(body)` → `POST /api/decks`
- `patchDeck(id, body)` → `PATCH /api/decks/:id`
- `deleteDeck(id)` → `DELETE /api/decks/:id`
- `duplicateDeck(id)` → `POST /api/decks/:id/duplicate`

### New Storefront Components
- `storefront/src/components/decks/DeckManagementPage.tsx` — server wrapper; fetches decks, renders client child
- `storefront/src/components/decks/DeckManagementClient.tsx` — client component; list state, soft-delete timer management, empty state
- `storefront/src/components/decks/DeckCard.tsx` — standalone card; game badge, kebab menu, inline rename, inline change-format, cost placeholder
- `storefront/src/components/decks/NewDeckModal.tsx` — Dialog; static 4-tile game selector + hardcoded format dropdown + Zod validation

### Component Strategy (from Phase 2B Party Mode)
| Wireframe Component | Existing Code File | Strategy | Notes |
|---|---|---|---|
| /decks page route | `storefront/src/app/[locale]/(main)/decks/page.tsx` | REFACTOR | Change import from DeckBrowsingPage → DeckManagementPage |
| Deck list grid | `storefront/src/components/deck-builder/DeckListPage.tsx` | REPLACE → DeckManagementPage | Missing: inline rename, change format, soft-delete undo, duplicate |
| Deck card tile | Inlined in DeckListPage | EXTRACT → DeckCard.tsx | Extract to standalone testable component |
| Create deck modal | `storefront/src/components/deck-builder/CreateDeckModal.tsx` | REPLACE → NewDeckModal.tsx | Dynamic game loader → static tiles; dynamic formats → hardcoded |
| Game selector tiles | `storefront/src/components/homepage/GameTile.tsx` | REFACTOR | Add `selectable` prop variant |
| Empty state | Inlined in DeckListPage | EXTRACT into DeckManagementClient | Needs "Create your first deck" CTA button that opens modal |
| Soft-delete undo toast | None | BUILD-NEW in DeckManagementClient | setTimeout + sonner toast + Undo handler |
| Inline rename | None | BUILD-NEW in DeckCard | `<input>` with Enter/Escape/blur handlers |
| Change Format panel | None | BUILD-NEW in DeckCard | Inline selector panel; same-game format options only |
| Duplicate flow | None | BUILD-NEW in DeckManagementClient | POST duplicate API → prepend to list + success toast |

### Migration
- Generate: `customer-backend/src/migrations/{timestamp}-NarrowDeckNameTo100.ts`
- Change: `ALTER TABLE deck ALTER COLUMN name TYPE varchar(100);`

### Deployment
`needs_deploy = true` — new API endpoints that storefront consumes + new storefront page.

---

### Task 1: Narrow Deck.name to varchar(100) and generate migration

**Files:**
- `customer-backend/src/entities/Deck.ts` — MODIFY (name column length)
- `customer-backend/src/entities/DeckCard.ts` — READ (understand structure for Task 2 duplicate logic)
- `customer-backend/src/migrations/{timestamp}-NarrowDeckNameTo100.ts` — GENERATE

**Steps:**
1. Read `customer-backend/src/entities/Deck.ts` in full — confirm current `name` column definition and all existing fields
2. Read `customer-backend/src/entities/DeckCard.ts` in full — understand fields needed for duplicate in Task 2
3. **Write failing test** in `customer-backend/src/tests/routes/decks.test.ts`:
   - `POST /api/decks` with name of 101 chars returns 422
4. Verify test fails (entity currently allows 255 chars, no length validation)
5. In `Deck.ts`: change `@Column({ type: 'varchar', length: 255 })` → `@Column({ type: 'varchar', length: 100 })` on `name`
6. Add name-length validation in the route (or entity transformer) so the API returns 422 for names > 100 chars
7. Generate migration: `cd customer-backend && npm run migration:generate -- -n NarrowDeckNameTo100`
8. Review the generated SQL — confirm it narrows varchar length
9. Run migration: `npm run migration:run`
10. Verify test passes
11. Commit: `feat(3-1): narrow Deck.name to varchar(100) with migration`

---

### Task 2: Fix and extend customer-backend deck API routes

**Files:**
- `customer-backend/src/routes/decks.ts` — REFACTOR
- `customer-backend/src/tests/routes/decks.test.ts` — CREATE (new test file)

**Steps:**

**2a — Fix `DELETE /api/decks/:id` (BR1 security bug):**
1. Read `customer-backend/src/routes/decks.ts` in full — understand existing routes and auth middleware patterns (study other authenticated routes for the `authenticateToken` import path)
2. Read one existing test file (e.g., `customer-backend/src/tests/routes/customers.test.ts`) — understand mock setup patterns
3. **Write failing tests** in `customer-backend/src/tests/routes/decks.test.ts`:
   - `DELETE /api/decks/:id` with no auth token → 401
   - `DELETE /api/decks/:id` with valid token but different userId → 403
   - `DELETE /api/decks/:id` with valid token + ownership → 200, deck not returned in subsequent GET
4. Verify tests fail (no auth currently)
5. In `decks.ts`: add `authenticateToken` middleware to DELETE route; add ownership check (`if (deck.userId !== req.user.id) return res.status(403)`); replace `deckRepository.remove(deck)` with `deckRepository.softDelete(deck.id)`
6. Verify tests pass

**2b — Add `GET /api/decks` (auth-scoped):**
1. **Write failing tests:**
   - `GET /api/decks` with no auth → 401
   - `GET /api/decks` with auth → 200, returns only the requesting user's decks ordered by updatedAt desc
   - `GET /api/decks` with auth → does NOT return soft-deleted decks
2. Verify tests fail (route doesn't exist)
3. Add route: `router.get('/', authenticateToken, async (req, res) => { const decks = await deckRepository.find({ where: { userId: req.user.id }, order: { updatedAt: 'DESC' } }); res.json({ decks }); })`
4. Verify tests pass

**2c — Add `PATCH /api/decks/:id` (rename + change format):**
1. **Write failing tests:**
   - `PATCH /api/decks/:id` with no auth → 401
   - `PATCH /api/decks/:id` by non-owner → 403
   - `PATCH /api/decks/:id` with `{ name: '' }` → 422
   - `PATCH /api/decks/:id` with name of 101 chars → 422
   - `PATCH /api/decks/:id` with `{ formatCode: 'Modern' }` on MTG deck by owner → 200, formatCode updated
   - `PATCH /api/decks/:id` with `{ name: 'New Name' }` by owner → 200, deck name updated
   - `PATCH /api/decks/:id` with `{ gameId: '...' }` → 422 (game is immutable)
2. Verify tests fail
3. Implement PATCH route: auth + ownership + validate (reject gameId, validate name length, validate formatCode belongs to deck's game); update and save deck
4. Verify tests pass

**2d — Add `POST /api/decks/:id/duplicate`:**
1. **Write failing tests:**
   - `POST /api/decks/:id/duplicate` with no auth → 401
   - `POST /api/decks/:id/duplicate` by non-owner → 403
   - `POST /api/decks/:id/duplicate` by owner on deck with cards → 201, new deck with `"${name} (Copy)"`, same gameId/formatCode, DeckCard rows copied with new deckId
   - `POST /api/decks/:id/duplicate` on empty deck → 201, valid
2. Verify tests fail
3. Implement: load source deck + DeckCards; create new Deck with `name: \`${source.name} (Copy)\``; save; bulk-insert DeckCard copies with `deckId: newDeck.id`; return new deck + HTTP 201
4. Verify all tests in this file pass
5. Run quality gate: `cd customer-backend && npm run lint && npm run typecheck && npm run build && npm test`
6. Commit: `feat(3-1): add and fix deck CRUD API routes (GET, PATCH, DELETE, duplicate)`

---

### Task 3: Update /decks page to render DeckManagementPage

**Files:**
- `storefront/src/app/[locale]/(main)/decks/page.tsx` — REFACTOR (swap import)
- `storefront/src/components/decks/DeckManagementPage.tsx` — BUILD-NEW (skeleton; completed in Tasks 4–8)
- `storefront/src/components/decks/DeckManagementClient.tsx` — BUILD-NEW (client shell; completed in Tasks 4–8)
- `storefront/src/lib/api/customer-backend.ts` — MODIFY (add `getUserDecks()`)
- `storefront/src/components/decks/__tests__/DeckManagementPage.test.tsx` — BUILD-NEW

**Steps:**
1. Read `storefront/src/app/[locale]/(main)/decks/page.tsx` in full — note current DeckBrowsingPage import
2. Read `storefront/src/lib/api/customer-backend.ts` first 80 lines — understand existing client function patterns
3. Read `storefront/src/components/deck-builder/DeckListPage.tsx` in full — extract any logic worth keeping
4. **Write failing tests** in `storefront/src/components/decks/__tests__/DeckManagementPage.test.tsx`:
   - Renders "My Decks" heading
   - Renders empty state with "Create your first deck" button when decks array is empty
   - Renders deck list when decks returned
5. Verify tests fail
6. Create `storefront/src/components/decks/DeckManagementClient.tsx` (`"use client"`):
   - Accepts `initialDecks` prop (array of Deck objects)
   - Renders "My Decks" heading + "New Deck" button
   - Renders `DeckCard` for each deck (stub — full implementation in Tasks 4–8)
   - Empty state: "No decks yet" with "Create your first deck" button
7. Create `storefront/src/components/decks/DeckManagementPage.tsx` (Server Component):
   - Fetches current user's auth token (use existing auth pattern from other server components)
   - Calls `getUserDecks()` → passes `initialDecks` to `<DeckManagementClient>`
8. Add `getUserDecks()` to `customer-backend.ts` client
9. Update `decks/page.tsx`: replace DeckBrowsingPage import with `<DeckManagementPage />`
10. Verify tests pass
11. Commit: `feat(3-1): wire /decks page to DeckManagementPage server component`

---

### Task 4: Create DeckCard component

**Files:**
- `storefront/src/components/decks/DeckCard.tsx` — BUILD-NEW
- `storefront/src/components/decks/__tests__/DeckCard.test.tsx` — BUILD-NEW
- `storefront/src/components/homepage/GameTile.tsx` — READ (for game color patterns)

**Steps:**
1. Read `storefront/src/components/homepage/GameTile.tsx` — understand game-specific color CSS vars and tile structure
2. **Write failing tests:**
   - Renders deck name
   - Renders game badge with correct color class per game (MTG=purple, Pokemon=yellow, YGO=gold, One Piece=red)
   - Renders format label and card count
   - Renders "—" as cost placeholder
   - Renders kebab `⋯` button; clicking it shows dropdown with: Rename, Change Format, Duplicate, Delete
   - Clicking outside kebab closes dropdown
3. Verify tests fail
4. Build `DeckCard.tsx` (`"use client"`):
   - 4px top border with game-specific CSS var accent
   - Game badge chip with background color per game
   - Static display for deck name (rename mode swaps this with `<input>` — Task 6)
   - Format, card count (`{count} cards`), cost (`—`)
   - Kebab `⋯` button → popover/dropdown with items: Rename / Change Format / Duplicate / Delete
   - Props: `deck: DeckDto`, `onRename`, `onChangeFormat`, `onDuplicate`, `onDelete`
5. Verify tests pass
6. Wire up `DeckCard` in `DeckManagementClient` (replace stub from Task 3)
7. Commit: `feat(3-1): add DeckCard component with game badge and kebab menu`

---

### Task 5: Create NewDeckModal

**Files:**
- `storefront/src/components/decks/NewDeckModal.tsx` — BUILD-NEW
- `storefront/src/components/decks/__tests__/NewDeckModal.test.tsx` — BUILD-NEW
- `storefront/src/lib/api/customer-backend.ts` — MODIFY (add `createDeck()`)

**Steps:**
1. Read `storefront/src/components/deck-builder/CreateDeckModal.tsx` — note what to adopt vs discard
2. Read `storefront/src/components/homepage/GameTile.tsx` — understand selectable tile variant
3. Search for existing Dialog/modal component in `storefront/src/components/ui/` — use existing primitive
4. **Write failing tests:**
   - Renders 4 game tiles: MTG, Pokemon, Yu-Gi-Oh!, One Piece
   - Selecting MTG shows format options: Standard, Modern, Pioneer, Legacy, Vintage, Commander, Pauper
   - Selecting Pokemon shows: Standard, Expanded
   - Submitting with empty name shows validation error "Name is required"
   - Submitting with name > 100 chars shows validation error "Max 100 characters"
   - Submitting without selecting a game shows validation error
   - Submitting with valid name + game + format calls `createDeck()` and closes modal on success
5. Verify tests fail
6. Build `NewDeckModal.tsx` (`"use client"`):
   - Dialog wrapper using existing UI primitive
   - Static game tiles (4): fetch game list from API on mount to get UUIDs; map by game code/name to determine gameId for each tile
   - Hardcoded GAME_FORMATS constant:
     ```ts
     const GAME_FORMATS: Record<string, string[]> = {
       MTG: ['Standard', 'Modern', 'Pioneer', 'Legacy', 'Vintage', 'Commander', 'Pauper'],
       POKEMON: ['Standard', 'Expanded'],
       YGO: ['Advanced', 'Traditional'],
       ONE_PIECE: ['Standard'],
     }
     ```
   - Format dropdown only shown after game is selected; options from GAME_FORMATS[selectedGameCode]
   - Deck name `<input>` with react-hook-form + Zod schema:
     ```ts
     z.object({ gameId: z.string().uuid(), formatCode: z.string().min(1), name: z.string().min(1).max(100) })
     ```
   - On submit: `createDeck()` → on success: close modal + call `onDeckCreated(newDeck)` → parent prepends to list
7. Add `createDeck(body: { gameId: string; formatCode: string; name: string })` to `customer-backend.ts`
8. Wire "New Deck" button in `DeckManagementClient` to open `<NewDeckModal>` and handle `onDeckCreated`
9. Verify tests pass
10. Commit: `feat(3-1): add NewDeckModal with static game tiles and hardcoded format lists`

---

### Task 6: Implement inline rename flow in DeckCard

**Files:**
- `storefront/src/components/decks/DeckCard.tsx` — MODIFY
- `storefront/src/components/decks/__tests__/DeckCard.test.tsx` — MODIFY
- `storefront/src/components/decks/DeckManagementClient.tsx` — MODIFY (wire onRename → API)
- `storefront/src/lib/api/customer-backend.ts` — MODIFY (add `patchDeck()`)

**Steps:**
1. **Write failing tests** in `DeckCard.test.tsx`:
   - Clicking "Rename" in kebab replaces deck name text with `<input>` containing current name
   - Pressing Escape cancels: input disappears, original name shown, `onRename` not called
   - Pressing Enter with valid name calls `onRename(newName)` and exits edit mode
   - Blurring input with valid name calls `onRename(newName)` and exits edit mode
   - Pressing Enter with empty name: does NOT call `onRename`, stays in edit mode
   - Pressing Enter with name > 100 chars: does NOT call `onRename`, stays in edit mode
2. Verify tests fail
3. In `DeckCard.tsx`: add `isRenaming: boolean` state; on "Rename" click → `setIsRenaming(true)` + close kebab; when `isRenaming`, render `<input defaultValue={deck.name} autoFocus>` in place of name; handle `onKeyDown` (Enter → validate + save/noop; Escape → cancel) and `onBlur` (→ validate + save/noop)
4. In `DeckManagementClient`: implement `handleRename(id, name)` → call `patchDeck(id, { name })` → update local deck in list
5. Add `patchDeck(id, body: { name?: string; formatCode?: string })` to `customer-backend.ts`
6. Verify tests pass
7. Commit: `feat(3-1): implement inline rename flow in DeckCard`

---

### Task 7: Implement soft-delete with 5-second undo toast

**Files:**
- `storefront/src/components/decks/DeckManagementClient.tsx` — MODIFY
- `storefront/src/components/decks/__tests__/DeckManagementClient.test.tsx` — BUILD-NEW
- `storefront/src/lib/api/customer-backend.ts` — MODIFY (add `deleteDeck()`)

**Steps:**
1. **Write failing tests** using `vi.useFakeTimers()`:
   - Clicking Delete on a DeckCard removes it from the rendered list immediately (before timer fires)
   - A sonner toast appears with "Deck deleted" and an "Undo" action
   - Advancing timer by 4999ms: `deleteDeck()` API NOT yet called
   - Advancing timer to 5000ms: `deleteDeck(id)` IS called with the deck's id
   - Clicking "Undo" before 5s: deck is restored to list, `deleteDeck()` is never called
2. Verify tests fail
3. In `DeckManagementClient`:
   - On `handleDelete(id)`:
     - Remove deck from local `decks` state immediately (optimistic)
     - Store `{ deck, timerId }` in a `pendingDeletes` ref (Map keyed by id)
     - `const timerId = setTimeout(() => { deleteDeck(id); pendingDeletes.current.delete(id); }, 5000)`
     - `toast('Deck deleted', { action: { label: 'Undo', onClick: () => handleUndo(id) } })`
   - `handleUndo(id)`:
     - Look up pending delete in ref
     - `clearTimeout(timerId)`; restore deck to `decks` state; `pendingDeletes.current.delete(id)`
     - Dismiss toast (sonner `toast.dismiss(toastId)`)
4. Add `deleteDeck(id: string)` to `customer-backend.ts`
5. Verify tests pass
6. Commit: `feat(3-1): implement soft-delete with 5-second undo toast`

---

### Task 8: Implement duplicate flow

**Files:**
- `storefront/src/components/decks/DeckManagementClient.tsx` — MODIFY
- `storefront/src/components/decks/__tests__/DeckManagementClient.test.tsx` — MODIFY
- `storefront/src/lib/api/customer-backend.ts` — MODIFY (add `duplicateDeck()`)

**Steps:**
1. **Write failing tests:**
   - Clicking "Duplicate" in kebab calls `duplicateDeck(id)` API
   - The returned deck (name ends in "(Copy)") appears at the TOP of the deck list
   - A sonner success toast "Deck duplicated" appears
   - The duplicated deck card has a green highlight style for 3 seconds (use `vi.useFakeTimers()` to verify it clears)
2. Verify tests fail
3. In `DeckManagementClient`:
   - Implement `handleDuplicate(id)`:
     - Call `duplicateDeck(id)`
     - Prepend returned deck to `decks` state with a `justDuplicated: true` flag (or store id in a `highlightedIds` state)
     - `toast.success('Deck duplicated')`
     - Clear highlight after 3 seconds
4. In `DeckCard.tsx`: accept optional `highlighted?: boolean` prop; apply green border style when true
5. Add `duplicateDeck(id: string)` to `customer-backend.ts`
6. Verify tests pass
7. Commit: `feat(3-1): implement deck duplication with success toast and highlight`

---

### Task 9: Tests, coverage, and quality gate

**Files:**
- `customer-backend/src/tests/routes/decks.test.ts` — audit + fill gaps
- `storefront/src/components/decks/__tests__/*.test.tsx` — audit + fill gaps
- `_bmad-output/implementation-artifacts/story-3-1-deck-creation-management.md` — UPDATE Dev Agent Record

**Steps:**

**9a — customer-backend:**
1. Run: `cd customer-backend && npm test -- --testPathPattern=decks`
2. Fix any failing tests
3. Run coverage: `npm run test:coverage` — verify decks.ts and Deck.ts hit >80%
4. Run full quality gate: `npm run lint && npm run typecheck && npm run build && npm test`
5. Fix any lint or type errors

**9b — storefront:**
1. Run: `cd storefront && npm test` — run all tests
2. Fix any failing tests
3. Run coverage: `npm run test:coverage` — verify new deck components hit >80%
4. Run full quality gate: `npm run lint && npm run typecheck && npm run build && npm test`
5. Fix any lint or type errors

**9c — Update story file:**
1. Open `_bmad-output/implementation-artifacts/story-3-1-deck-creation-management.md`
2. Fill in Dev Agent Record → File List with all files created/modified
3. Update all task checkboxes to `[x]`
4. Add change log entry: `| 2026-03-02 | Dev | implementation | Story 3-1 implemented |`

**9d — Final commit:**
- Commit: `feat(3-1): complete deck creation & management (story 3-1)`
