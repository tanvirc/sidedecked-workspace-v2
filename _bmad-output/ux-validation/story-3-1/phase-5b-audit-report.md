# Phase 5B UX Validation Audit — Story 3-1: Deck Creation & Management

**Date:** 2026-03-02
**Figma reference:** `k5seLEn5Loi0YJ6UrJvzpr` node `75:2`
**Auditor:** Quinn (QA) + Sally (UX) personas
**Test suite:** 672/672 Vitest unit tests passing | 16 Playwright E2E test cases

---

## Audit 1: CSS Token Compliance

Files audited: `DeckCard.tsx`, `DeckManagementClient.tsx`, `NewDeckModal.tsx`, `DeckManagementPage.tsx`

| File | Finding | Severity |
|---|---|---|
| `DeckCard.tsx` | Game badge colors (`bg-purple-600`, `bg-yellow-400`, `bg-amber-500`, `bg-red-600`) — semantic Tailwind game identity colors, no hex | PASS |
| `DeckCard.tsx` | `ring-green-500` for duplicate highlight — hardcoded Tailwind, not a DS token | LOW |
| `DeckCard.tsx` | `text-red-500` for Delete menu label — should use DS danger token | LOW |
| `DeckManagementClient.tsx` | All layout/surface/interactive tokens use `var(--*)` | PASS |
| `NewDeckModal.tsx` | `text-red-500` for validation error messages — no DS danger token used | LOW |
| `NewDeckModal.tsx` | All layout/surface/interactive tokens use `var(--*)` | PASS |
| `DeckManagementPage.tsx` | No styling | PASS |

**Verdict: PASS** — No hardcoded hex colors. 3 LOW findings for semantic color alignment.

---

## Audit 2: Structural Hierarchy Comparison

Figma wireframe node `75:2` parsed (78,689 characters). Authoritative frame text nodes extracted.

| Wireframe Element | Figma Node | Code Status | Severity |
|---|---|---|---|
| "My Decks" h1 | 75:13 | ✅ Present | PASS |
| "N decks · last updated X ago" subtext | 75:16 | ❌ Missing | LOW |
| "+ New Deck" button | 75:19 | ⚠️ "New Deck" (no `+` prefix) | LOW |
| Game filter pills (All/MTG/Pokemon/YGO/OP) | 75:33-49 | ❌ Not implemented | MEDIUM |
| Deck grid (responsive 1/2/3/4 cols) | 75:56 | ✅ grid-cols-1/2/3/4 | PASS |
| Card accent bar (4px, game color) | 75:58 | ✅ `border-t-4 border-t-{color}` | PASS |
| Card art fan (3 overlapping card images) | 75:77-80 | ❌ Missing (needs card image data) | LOW |
| Deck name (truncated) | 75:61 | ✅ `data-testid="deck-name"` | PASS |
| Kebab button ⋯ | 75:82 | ✅ `aria-label="Deck options"` | PASS |
| Game badge | 75:65 | ✅ `data-testid="game-badge"` | PASS |
| Format label | 75:65 | ✅ `data-testid="format-label"` (separate vs wireframe combined "MTG · Modern") | LOW |
| Card count | 75:69 | ✅ `data-testid="card-count"` | PASS |
| Est. cost "—" | 75:72 | ✅ `data-testid="cost-placeholder"` | PASS |
| "Updated Xd ago" relative timestamp | 75:75 | ❌ Missing (`updatedAt` in DeckDto unused) | LOW |
| Kebab menu: Rename/Change Format/Duplicate/Delete | 75:116-126 | ✅ `data-testid="deck-menu"` | PASS |
| Inline rename input | 75:131 | ✅ Present | PASS |
| Rename hint "Enter to save · Esc to cancel" | 75:134 | ❌ Missing | LOW |
| Inline format panel + Save/Cancel | 75:434-449 | ✅ `data-testid="format-selector"` | PASS |
| Undo toast (5s, Undo action) | 75:165-171 | ✅ Sonner with Undo | PASS |
| Empty state + "Create your first deck" CTA | 75:929-935 | ✅ Present | PASS |
| New Deck modal — 4 game tiles | 75:209-236 | ✅ `data-testid="game-tile-{CODE}"` | PASS |
| New Deck modal — format selector | 75:240 | ✅ Conditional on game selection | PASS |
| New Deck modal — deck name input | 75:255-261 | ✅ Present | PASS |
| New Deck modal — char counter "13/100" | 75:263 | ❌ Missing (Zod validation enforces max, no visual counter) | MEDIUM |
| New Deck modal — Cancel/Create Deck buttons | 75:267-270 | ✅ Present | PASS |
| Mobile — bottom sheet (not dialog) | 75:630 | ❌ Same `<Dialog>` used on mobile | MEDIUM |
| Duplicate highlight ring (green, 3s) | 75:304 | ✅ `ring-green-500` | PASS |
| Duplicate success toast | 75:395 | ⚠️ Generic "Deck duplicated" vs deck-name specific text | LOW |

---

## Audit 2b: Property Diff Table

| Component | Property | Figma Value | Code Value | Severity | Action |
|---|---|---|---|---|---|
| Page header | Subtext | "3 decks · last updated 2d ago" | Not rendered | LOW | Backlog |
| Page header | CTA label | "+ New Deck" | "New Deck" | LOW | Backlog |
| Filter bar | Game pill filters | All/MTG/Pokemon/YGO/OP | Not implemented | MEDIUM | Backlog issue |
| Deck card | Art fan | 3 overlapping card images | Not present | LOW | Future story |
| Deck card | Timestamp | "Updated 2d ago" | Not rendered | LOW | Backlog |
| Deck card | Format display | "MTG · Modern" combined | Separate `<span>` elements | LOW | Backlog |
| Deck card | Rename hint | "Enter to save · Esc to cancel" | Not shown | LOW | Backlog (accessibility) |
| New Deck modal | Char counter | "13 / 100" | Not shown | MEDIUM | Backlog issue |
| New Deck modal | Format label | "Format (MTG only)" | "Format" (generic) | LOW | Backlog |
| Mobile | Sheet type | Bottom slide-up sheet | `<Dialog>` (center modal) | MEDIUM | Backlog issue |
| Duplicate toast | Message | Deck-name specific | Generic "Deck duplicated" | LOW | Backlog |
| Danger color | Token | DS danger token | `text-red-500` (Tailwind) | LOW | Backlog |
| Highlight ring | Token | DS success token | `ring-green-500` (Tailwind) | LOW | Backlog |

---

## Audit 3 + 4: Accessibility Compliance

| Check | Status | Notes |
|---|---|---|
| Kebab button `aria-label` | ✅ `aria-label="Deck options"` | WCAG 4.1.2 |
| Game tile `aria-label` | ✅ `aria-label="Select {label}"` | WCAG 4.1.2 |
| Rename input role | ✅ Implicit textbox role | WCAG 4.1.2 |
| Inline format `<select>` aria-label | ❌ Missing in DeckCard format panel | LOW |
| Modal error `role="alert"` | ✅ Present in NewDeckModal | WCAG 4.1.3 |
| Dialog ARIA (Radix) | ✅ `role="dialog"`, `aria-modal`, `aria-labelledby` | PASS |
| Keyboard: rename Enter/Esc | ✅ `handleRenameKeyDown` implemented | PASS |
| Focus trap in modal | ✅ Radix Dialog | PASS |
| Badge contrast (purple-600/white) | ✅ ~7:1 (WCAG AA) | PASS |
| Badge contrast (yellow-400/black) | ✅ ~9:1 (WCAG AA) | PASS |

---

## Summary

| Severity | Count | Items |
|---|---|---|
| HIGH (blocker) | 0 | — |
| MEDIUM (backlog) | 3 | Filter bar, char counter, mobile sheet |
| LOW (polish) | 10 | See Audit 2b |

## Verdict: ✅ PASS

No acceptance criteria broken. Story 3-1 ships.

Backlog issues to open:
1. Game filter pills (All/MTG/Pokemon/YGO/OP) on decks page
2. Character counter "X/100" in New Deck modal
3. Mobile bottom sheet instead of center dialog for New Deck flow
