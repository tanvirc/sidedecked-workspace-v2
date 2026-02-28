# Story 2-5: Card Detail Page — Wireframe Compliance Remediation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring the story 2-5 card detail page implementation into full compliance with the v5.1 wireframe — specifically condition chip per-condition color coding, mobile context label, and qty chip label format.
**Story:** 2-5-card-detail-page-bff-endpoint — `_bmad-output/implementation-artifacts/story-2-5-card-detail-page-bff-endpoint.md`
**Domain:** Frontend
**Repos:** storefront/
**Deployment:** true — storefront/ UI changes affect user-facing production pages
**UX Wireframe:** `_bmad-output/planning-artifacts/ux-story-2-5-card-detail-page-bff-endpoint-wireframe.html` (v5.1)

---

## Requirements Brief (from Phase 2)

**Compliance-driven re-work.** All ACs are already implemented. This plan closes three wireframe compliance gaps discovered under the new strengthened story lifecycle compliance gates:

1. **Condition chips must use per-condition color coding** (AC3 — condition display)
   - Wireframe: NM=green (`#4ADE80`), LP=yellow-green (`#A3E635`), MP=yellow (`--warning`), HP=red (`--negative`)
   - Both the desktop QuickBuyPanel and the mobile Row 3 condition chips must reflect this
   - Disabled (out-of-stock) chips must retain their condition color at 30% opacity (not uniform gray)

2. **Mobile Row 3 must include a context label** (AC6/AC6a — Quick Buy panel updates on print switch)
   - Wireframe label: `"NM · MKM '24 Foil"` — dynamically reflects `selectedCondition` + `getPrintRef(selectedPrint)`
   - Located in `.mobile-action-zone` column alongside the secondary Deck/Collect buttons
   - Text: `{selectedCondition} · {getPrintRef(selectedPrint) || ""}` (omit separator if no print ref)

3. **Mobile qty chips must use `×` prefix** (AC6 — Quick Buy interaction)
   - Wireframe: `×1`, `×2`, `×3`, `×4`
   - Current: `1`, `2`, `3`, `4+`
   - Fix: `×1`, `×2`, `×3`, `×4` (cap label changes from `4+` to `×4`)

**Business rules:**
- Color is enhancement only — condition text labels (NM/LP/MP/HP) remain the accessible label
- No new ACs introduced — all fixes are within existing story scope
- Minimal-change: touch only what is needed to pass compliance

---

## Technical Design (from Phase 3)

**Domain:** Frontend — `storefront/` only. No backend, database, or API changes.

**Affected files:**
- `storefront/src/components/cards/QuickBuyPanel.tsx` — condition chip color map (Tasks 1 + 2)
- `storefront/src/components/cards/CardDetailPage.tsx` — mobile bar condition chips + context label + qty chips (Tasks 3 + 4 + 5)

**Component strategy:** All REFACTOR — no components replaced.

**Color map (implement as const in each file):**
```typescript
const CONDITION_COLORS: Record<string, { border: string; text: string; bg: string }> = {
  NM: { border: 'border-green-500/30', text: 'text-green-400', bg: 'bg-green-500/10' },
  LP: { border: 'border-lime-400/30',  text: 'text-lime-400',  bg: 'bg-lime-400/10'  },
  MP: { border: 'border-yellow-400/30',text: 'text-yellow-400',bg: 'bg-yellow-400/10'},
  HP: { border: 'border-red-500/30',   text: 'text-red-400',   bg: 'bg-red-500/10'   },
}
```
Selected state: `bg + border + text` at full opacity.
Unselected state: `border + text` at reduced opacity (dim but color-coded).
Disabled state: all three classes at `opacity-30` with `border-dashed cursor-not-allowed`.

---

### Task 1: Write failing tests for condition chip color compliance in QuickBuyPanel

**Files:**
- `storefront/src/components/cards/QuickBuyPanel.test.tsx` — add/update assertions

**Steps (TDD):**
1. Read the existing `QuickBuyPanel.test.tsx` to understand current test structure
2. Add test: "NM chip renders with green color classes when selected"
3. Add test: "LP chip renders with lime color classes when unselected"
4. Add test: "HP chip renders with red color classes and dashed border when disabled"
5. Run `npm test -- --testPathPattern=QuickBuyPanel` — confirm tests FAIL (amber classes expected, green found)
6. Commit the failing tests: `test(storefront): add condition chip color compliance tests`

---

### Task 2: Implement per-condition color map in QuickBuyPanel

**Files:**
- `storefront/src/components/cards/QuickBuyPanel.tsx`

**Steps:**
1. Read `QuickBuyPanel.tsx` fully (already in context — condition chips at lines 237–271)
2. Add `CONDITION_COLORS` const above the component
3. Replace the condition chip className logic:
   - Selected: `${colors.bg} ${colors.border} ${colors.text}` (replace `border-amber-400 bg-amber-400/10 text-amber-400`)
   - Unselected: `${colors.border} ${colors.text} opacity-60 hover:opacity-100` (replace `border-border text-foreground hover:border-amber-400/50`)
   - Disabled: add `opacity-30 cursor-not-allowed border-dashed` on top of base condition color (remove current uniform styling)
4. Run `npm test -- --testPathPattern=QuickBuyPanel` — confirm Task 1 tests now PASS
5. Run `npm run lint && npm run typecheck` — must pass
6. Commit: `fix(storefront): apply per-condition color coding to QuickBuyPanel condition chips`

---

### Task 3: Write failing tests for mobile bar compliance in CardDetailPage

**Files:**
- `storefront/src/components/cards/CardDetailPage.test.tsx` — add/update assertions

**Steps (TDD):**
1. Read `CardDetailPage.test.tsx` to understand current test structure
2. Add test: "mobile Row 3 condition chips render with per-condition colors"
3. Add test: "mobile Row 3 renders context label with selectedCondition and print ref"
4. Add test: "mobile qty chips display ×1/×2/×3/×4 labels"
5. Run `npm test -- --testPathPattern=CardDetailPage` — confirm tests FAIL
6. Commit the failing tests: `test(storefront): add mobile bar wireframe compliance tests`

---

### Task 4: Fix mobile Row 3 condition chips + context label in CardDetailPage

**Files:**
- `storefront/src/components/cards/CardDetailPage.tsx`

**Steps:**
1. Read `CardDetailPage.tsx` fully (already in context — mobile Row 3 at lines 576–628)
2. Add `CONDITION_COLORS` const (same as Task 2 — local to file, no shared utility needed)
3. Update the `CONDITION_ORDER_MOBILE` condition chip className to use per-condition colors
4. In Row 3, restructure the right-side div to match wireframe `.mobile-action-zone`:
   ```tsx
   <div className="flex flex-col items-end gap-[3px] flex-shrink-0 ml-2">
     {/* Context label — confirms selected print + condition */}
     <span className="text-[9px] text-muted-foreground text-right whitespace-nowrap italic">
       {selectedCondition}{getPrintRef(selectedPrint) ? ` · ${getPrintRef(selectedPrint)}` : ''}
     </span>
     {/* Secondary buttons row */}
     <div className="flex gap-1">
       <button ...>📚 Deck</button>
       <button ...>♦ Collect</button>
     </div>
   </div>
   ```
5. Run `npm test -- --testPathPattern=CardDetailPage` — confirm Tasks 3 tests PASS
6. Run `npm run lint && npm run typecheck` — must pass
7. Commit: `fix(storefront): add per-condition mobile chips and context label to mobile action bar`

---

### Task 5: Fix mobile qty chip labels

**Files:**
- `storefront/src/components/cards/CardDetailPage.tsx`

**Steps:**
1. Locate the qty chip map (lines 550–566 in CardDetailPage.tsx)
2. Change label from `n === 4 ? "4+" : n` to `` `×${n}` `` for all 4 chips
3. Update `data-testid` from `qty-chip-${n}` — keep as-is (value-independent)
4. Run `npm test -- --testPathPattern=CardDetailPage` — all tests pass
5. Commit: `fix(storefront): update mobile qty chip labels to ×1–×4 per wireframe`

---

### Task 6: Full quality gate + wireframe compliance check

**Files:** All affected files in `storefront/`

**Steps:**
1. Run full quality gate: `npm run lint && npm run typecheck && npm run build && npm test`
2. Run coverage: `npm run test:coverage` — confirm >80% on changed modules
3. Perform wireframe compliance check per Phase 4 gate:
   - Condition chips: NM=green, LP=lime, MP=yellow, HP=red — PASS/FAIL per chip
   - Mobile context label: present and correct — PASS/FAIL
   - Mobile qty chips: `×1/×2/×3/×4` — PASS/FAIL
   - All other previously-passing sections: re-verify no regressions
4. All sections must PASS before proceeding to Phase 5
5. Update `_bmad-output/ux-validation/story-2-5/ux-validation-report.md` with revised Audit 2 results
6. Commit: `fix(storefront): all wireframe compliance gates passing for story 2-5`
