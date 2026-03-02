# Card Detail Page Figma Alignment — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align the storefront Card Detail page layout and components with the Figma wireframe (source of truth)
**Story:** 2-5-card-detail-page-bff-endpoint — `_bmad-output/implementation-artifacts/story-2-5-card-detail-page-bff-endpoint.md`
**Domain:** Frontend
**Repos:** storefront
**Deployment:** false — storefront-only UI restructuring; next regular deploy picks up changes
**UX Wireframe:** `_bmad-output/planning-artifacts/ux-story-2-5-card-detail-page-bff-endpoint-wireframe.html`
**Figma Reference:** https://www.figma.com/design/k5seLEn5Loi0YJ6UrJvzpr?node-id=46:32
**Figma File Key:** k5seLEn5Loi0YJ6UrJvzpr
**Figma Node ID:** 46:32

## Requirements Brief (from Phase 2)

This is a **revisit** of story 2-5. All ACs are already functionally implemented. The scope is purely visual/structural alignment with the new Figma wireframe.

**Clarified scope:**
- Restructure 3-column layout to match Figma section placement
- Build 2 new components (CompactPrintSelector, QuickSellerList)
- Refactor 4 existing components (CompactPrintingsTable, QuickBuyPanel, PriceInsightsSection, GameStatsDisplay)
- Consolidate duplicate Format Legality sections
- No backend, API, or database changes

**ACs requiring visual verification:** AC2, AC3, AC5, AC6, AC6a

## Technical Design (from Phase 3)

**Domain:** Frontend — storefront/ only
**Split-brain:** Not applicable
**New entities:** None
**API changes:** None
**Deployment:** Not needed (needs_deploy = false)

### Figma vs Implementation — Section Placement Map

```
FIGMA LAYOUT:                          CURRENT LAYOUT:
┌─────────┬──────────────┬──────────┐  ┌─────────┬──────────────┬──────────┐
│ Card    │ Card Header  │ Quick    │  │ Card    │ Card Header  │ Action   │
│ Image   │ Card Details │ Buy      │  │ Image   │ Quick Stats  │ Panel:   │
│         │ Oracle Text  │ Panel    │  │ Oracle  │ Game Stats   │ QuickBuy │
│ Select  │ Format Legal │ (gold)   │  │ Text    │ Print Browser│ Save     │
│ Printing│ Price Insight│ Sellers  │  │ P/T     │ Listings     │ Price    │
│ (pills) │ Printings Tbl│ Summary  │  │ chips   │ Legality     │ Insights │
│         │ Rulings      │          │  │         │ Rulings      │          │
└─────────┴──────────────┴──────────┘  └─────────┴──────────────┴──────────┘
```

### Component Strategy

| Component | Strategy | File |
|---|---|---|
| CompactPrintSelector | BUILD-NEW | `CompactPrintSelector.tsx` |
| QuickSellerList | BUILD-NEW | `QuickSellerList.tsx` |
| CompactPrintingsTable | REFACTOR (table format) | existing |
| QuickBuyPanel | REFACTOR (chips top, gold border) | existing |
| PriceInsightsSection | REFACTOR (move to center) | existing |
| GameStatsDisplay | REFACTOR (key-value rows) | existing |
| FormatLegalityGrid | REMOVE from page | existing (keep file) |

---

### Task 1: Build CompactPrintSelector component
**Files:**
- CREATE: `storefront/src/components/cards/CompactPrintSelector.tsx`
- CREATE: `storefront/src/components/cards/CompactPrintSelector.test.tsx`

**Steps:** TDD cycle
1. Write failing test: renders compact pill buttons for each print with set code labels
2. Write failing test: calls `onPrintSelect` when a pill is clicked
3. Write failing test: highlights selected print with amber accent
4. Write failing test: shows overflow indicator when >6 prints, horizontal scroll
5. Write failing test: `role="radiogroup"` + `role="radio"` + `aria-checked` accessibility
6. Implement CompactPrintSelector: horizontal scrollable row of set-code pills (e.g., "3ED", "A25", "M11")
7. Props: `prints: Print[]`, `selectedPrint?: Print`, `onPrintSelect: (print: Print) => void`
8. Max 6 visible + "N more" overflow indicator. Horizontal scroll on overflow.
9. Verify all tests pass, commit

---

### Task 2: Build QuickSellerList component
**Files:**
- CREATE: `storefront/src/components/cards/QuickSellerList.tsx`
- CREATE: `storefront/src/components/cards/QuickSellerList.test.tsx`

**Steps:** TDD cycle
1. Write failing test: renders up to 4 seller rows with name, rating stars, condition badge, price, Buy button
2. Write failing test: shows "Available from N sellers" header with "Best Price" sort indicator
3. Write failing test: shows "View all N listings" link that scrolls to `#marketplace-listings`
4. Write failing test: empty state shows "No sellers" message
5. Write failing test: calls `onAddToCart` when Buy button is clicked
6. Implement QuickSellerList: compact seller summary for right column
7. Props: `listings: BackendListing[]`, `listingsUnavailable: boolean`, `onAddToCart: (listing, qty) => void`
8. Sort by price ascending, show cheapest 4 sellers
9. Verify all tests pass, commit

---

### Task 3: Refactor CompactPrintingsTable to table format
**Files:**
- MODIFY: `storefront/src/components/cards/CompactPrintingsTable.tsx`
- MODIFY: `storefront/src/components/cards/CompactPrintingsTable.test.tsx`

**Steps:** TDD cycle
1. Update tests: expect `<table>` with columns SET, YEAR, RARITY, CONDITION, MARKET PRICE
2. Update tests: selected row has amber left-border highlight and radio indicator
3. Update tests: Foil badge appears in MARKET PRICE cell for foil prints
4. Update tests: "View all N printings" footer link when >6 prints
5. Update tests: preserve `role="radio"` + `aria-checked` on each `<tr>` for accessibility
6. Update tests: preserve filter strip (All/Foil/Non-Foil/Borderless) and sort dropdown
7. Refactor component: replace button-list rows with `<table>` structure matching Figma columns
8. Keep existing filter/sort/show-more logic intact
9. Verify all tests pass, commit

---

### Task 4: Refactor QuickBuyPanel — condition chips to top, gold accent
**Files:**
- MODIFY: `storefront/src/components/cards/QuickBuyPanel.tsx`
- MODIFY: `storefront/src/components/cards/QuickBuyPanel.test.tsx`

**Steps:** TDD cycle
1. Update tests: condition chips render ABOVE the price (first content after header)
2. Update tests: "CONDITION" label appears above chips (matching Figma)
3. Update tests: price shows below condition chips with "Near Mint · {set name}" subtitle
4. Update tests: "QUANTITY" label appears above stepper
5. Update tests: Add to Cart button uses gold accent style (`bg-amber-400 text-background`)
6. Update tests: "Save to Wishlist" button with heart icon appears below Add to Cart
7. Refactor component: reorder sections — CONDITION → price → QUANTITY → Add to Cart → Wishlist
8. Move SaveSection content inline into QuickBuyPanel (remove separate SaveSection render in CardDetailPage)
9. Add gold accent border to action panel wrapper: `border-amber-400/50`
10. Verify all tests pass, commit

---

### Task 5: Refactor GameStatsDisplay to key-value row format
**Files:**
- MODIFY: `storefront/src/components/cards/GameStatsDisplay.tsx`

**Steps:** TDD cycle
1. Write failing test: renders as labeled "CARD DETAILS" section
2. Write failing test: MTG card shows Type, Mana Cost, Color as key-value rows (not StatCard grid)
3. Write failing test: key-value rows have label on left, value on right
4. Refactor component: replace StatCard grid with simple key-value `<dl>` list matching Figma "Card Details" surface
5. Keep game-specific stat selection logic intact
6. Verify all tests pass, commit

---

### Task 6: Move PriceInsightsSection to center column and expand
**Files:**
- MODIFY: `storefront/src/components/cards/PriceInsightsSection.tsx`
- MODIFY: `storefront/src/components/cards/PriceInsightsSection.test.tsx`

**Steps:** TDD cycle
1. Update tests: component renders as a standalone surface card (not embedded in action panel)
2. Update tests: shows "PRICE INSIGHTS" header
3. Update tests: displays current price prominently with trend indicator placeholder
4. Update tests: Low/Median/High stats in 3-column grid (already exists)
5. Update tests: shows "TCGPlayer Market: $X.XX" reference line (matches Figma)
6. Refactor: remove `border-t` dependency on parent; add own surface styling
7. Add chart placeholder div (actual chart implementation deferred — out of scope)
8. Verify all tests pass, commit

---

### Task 7: Restructure CardDetailPage 3-column layout
**Files:**
- MODIFY: `storefront/src/components/cards/CardDetailPage.tsx`
- MODIFY: `storefront/src/components/cards/CardDetailPage.test.tsx`

**Steps:** (This is the integration task — depends on Tasks 1-6)
1. Update tests: left column contains card image + CompactPrintSelector (no oracle text)
2. Update tests: center column order is Card Header → Card Details (GameStatsDisplay) → Oracle Text → Format Legality pills → Price Insights → Printings Table → Rulings
3. Update tests: right column contains Quick Buy Panel (with gold border) → QuickSellerList
4. Update tests: FormatLegalityGrid separate section is REMOVED (consolidated into quick-stats pills)
5. Update tests: SaveSection is no longer a separate section (absorbed into QuickBuyPanel)
6. Restructure JSX:
   - LEFT COLUMN: card image + CompactPrintSelector (new)
   - CENTER COLUMN: card identity → GameStatsDisplay → oracle text → format legality pills → PriceInsightsSection → CompactPrintingsTable → MarketplaceListingsSection → RulingsAccordion
   - RIGHT COLUMN: action panel with QuickBuyPanel (refactored) → QuickSellerList (new)
7. Add gold accent border to right column action panel: `border: 1.5px solid var(--border-selected)` or `border-amber-400/50`
8. Wire CompactPrintSelector and CompactPrintingsTable to same `selectedPrint` state
9. Wire QuickSellerList `onAddToCart` to shared `performAddToCart`
10. Wire "View all N listings" to `#marketplace-listings` scroll
11. Keep mobile sticky bar unchanged
12. Verify all tests pass, run full quality gate: `npm run lint && npm run typecheck && npm run build && npm test`
13. Commit

---

### Task 8: Wireframe compliance check and quality gate
**Files:** All modified files from Tasks 1-7

**Steps:**
1. Re-read Figma wireframe screenshot (node 46:32) and compare against implementation
2. For each Figma section, verify code matches:
   - Layout structure (grid columns, sticky behavior)
   - Component format (table vs list, key-value vs card grid)
   - Interactive states (selected/hover/disabled)
   - Design tokens (amber-400 accents, surface backgrounds, border styles)
   - Accessibility (role, aria-label, aria-checked)
   - Mobile bar (unchanged — verify no regressions)
3. Fix any deviations found
4. Run full quality gate in storefront/:
   ```
   npm run lint && npm run typecheck && npm run build && npm test
   ```
5. Report coverage on changed modules (must be >80%)
6. Verify all ACs still marked (IMPLEMENTED) in story file
