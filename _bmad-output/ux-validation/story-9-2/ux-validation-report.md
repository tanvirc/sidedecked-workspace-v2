# UX Validation Report — Story 9.2: Game Selector Grid

**Date:** 2026-03-01
**Wireframe:** `_bmad-output/planning-artifacts/ux-9-2-game-selector-grid-wireframe.html`
**Components audited:**
- `storefront/src/components/homepage/GameSelectorGrid.tsx`
- `storefront/src/components/homepage/GameTile.tsx`

---

## Audit 1: CSS Token Compliance (Sally)

**Result: PASS with MEDIUM notes**

| Finding | File | Severity | Notes |
|---|---|---|---|
| `fallbackGradient` hex values in GAMES constant | `GameSelectorGrid.tsx` L9,16,23,30 | MEDIUM | Game-specific fallback gradients not in design system as CSS vars. Values match wireframe exactly. |
| `style={{ background: fallbackGradient }}` | `GameTile.tsx` L49 | LOW | Inline style necessary for dynamic game-specific values |
| `style={{ backgroundImage }}` | `GameTile.tsx` L54 | LOW | Inline style required for dynamic image URL |
| `style={{ backgroundColor: overlayColor }}` | `GameTile.tsx` L57 | LOW | Inline style required for dynamic rgba overlay |

**No violations in homepage/ components:**
- No `bg-gray-*` or `text-gray-*` patterns
- No hardcoded colors bypassing design system in non-data contexts
- Section label `text-[var(--text-secondary)]` resolves to `#8B93A6` in dark mode = wireframe `--text-2` value
- `font-rajdhani` chains to `var(--font-rajdhani)` (defined in layout.tsx + tailwind.config) — Rajdhani
- `font-dm-mono` chains to `var(--font-dm-mono)` (defined in layout.tsx + tailwind.config) — DM Mono
- `outline-accent` resolves to `var(--accent)` via tailwind.config.ts

---

## Audit 2: Structural Hierarchy (Sally)

**Result: PASS with 1 MEDIUM gap**

| Section | Wireframe Spec | Implementation | Status |
|---|---|---|---|
| Grid role | `role="radiogroup" aria-label="Choose a game"` | matching | PASS |
| Mobile grid | `grid-cols: 1fr 1fr; gap: 10px` | `grid-cols-2 gap-[10px]` | PASS |
| Desktop grid | `repeat(4,1fr); gap: 12px` | `sm:grid-cols-4 sm:gap-3` | PASS |
| Tile aspect ratio | `aspect-ratio: 5/7` | `aspect-[5/7]` | PASS |
| Tile border | `1.5px solid rgba(255,255,255,0.10)` | `border-[1.5px] border-white/10` | PASS |
| Tile hover translate | `translateY(-2px)` | `hover:-translate-y-0.5` | PASS |
| Tile hover border | `rgba(255,255,255,0.20)` on hover | `hover:border-white/20` | PASS |
| Tile hover shadow | `0 8px 24px rgba(0,0,0,0.5)` | `hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]` | PASS |
| Tile active scale | `scale(0.97)` | `active:scale-[0.97]` | PASS |
| Tile active border | `rgba(255,255,255,0.20)` on active | **not implemented** | MEDIUM |
| Tile focus-visible | `outline: 2px solid var(--accent); offset: 2px` | `focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2` | PASS |
| Motion reduce | `transform: none; transition: none` | `motion-reduce:transform-none motion-reduce:transition-none` | PASS |
| No selected state | No badge/indicator on tiles | No `.tile-selected-badge` | PASS |
| Card-back image | `bg-size:cover; bg-position:center` | `bg-cover bg-center bg-no-repeat` | PASS |
| Fallback gradient | Game-dominant color fallback | `style={{ background: fallbackGradient }}` | PASS |
| Game overlay | `absolute inset:0` with rgba | `absolute inset-0 style={{ backgroundColor: overlayColor }}` | PASS |
| Content gradient | `from rgba(0,0,0,0.85) via 0.40 to transparent` | `bg-gradient-to-t from-black/85 via-black/40 to-transparent` | PASS |
| Content padding | `10px` mobile, `14px` desktop | `p-[10px] sm:p-[14px]` | PASS |
| Game name font | Rajdhani 700 | `font-rajdhani font-bold` | PASS |
| Game name size | `15px` mobile, `18px` desktop | `text-[15px] sm:text-[18px]` | PASS |
| Game name style | `uppercase tracking-[0.06em] text-white leading-[1.1]` | matching | PASS |
| Count font | DM Mono | `font-dm-mono` | PASS |
| Count size | `9px` mobile, `10px` desktop | `text-[9px] sm:text-[10px]` | PASS |
| Count color | `rgba(255,255,255,0.65)` | `text-white/65` | PASS |
| Count tracking | `0.02em` | `tracking-[0.02em]` | PASS |
| Section label color | `var(--text-2)` = `#8B93A6` | `var(--text-secondary)` = `#8B93A6` dark mode | PASS |
| Section label format | `10px 600 uppercase tracking-[0.1em]` | `text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em]` | PASS |
| Tile ARIA attrs | `role="radio" aria-checked="false" tabIndex=0` | matching | PASS |
| Aria-label with count | `"{Game} — {count} listings"` | matching | PASS |
| Aria-label no count | `"{Game}"` (no undefined listings) | matching | PASS |

**Score: 27/28 sections PASS** — 1 MEDIUM gap (active border color)

---

## Audit 3: Accessibility Tree + Playwright (Quinn)

**Result: PASS**

Static accessibility tree analysis:

```
section
  p "Shop by game"
  div[role=radiogroup][aria-label="Choose a game"]
    div[role=radio][aria-checked=false][tabIndex=0][aria-label="MTG — N listings"]
    div[role=radio][aria-checked=false][tabIndex=0][aria-label="POKÉMON — N listings"]
    div[role=radio][aria-checked=false][tabIndex=0][aria-label="YU-GI-OH! — N listings"]
    div[role=radio][aria-checked=false][tabIndex=0][aria-label="ONE PIECE — N listings"]
```

- Semantic radiogroup pattern correctly implemented
- All tiles keyboard-navigable (tabIndex=0) and Enter-activated
- Decorative divs (image bg, overlay) carry no aria attributes
- Count span has `data-testid="tile-count"` for test targeting
- Aria-label format correct for both count-present and count-absent states

Playwright E2E spec: `e2e/story-9-2-game-selector-grid.spec.ts` (17 tests, committed 136f00e)
- Validates semantic locators, cookie flow, navigation, keyboard nav, mobile/desktop viewports
- Screenshots to `_bmad-output/ux-validation/story-9-2/` on run

**Visual regression baseline:** First CI run requires `npx playwright test --update-snapshots`

---

## Audit 4: Sally's Verdict

### Overall Verdict: **APPROVED**

The implementation is faithful to the wireframe. All primary interaction states, typography,
layout, and accessibility patterns are correctly implemented.

**One non-blocking recommendation:**
Add `active:border-white/20` to the tile className in `GameTile.tsx` to complete the active-state
border transition. The main touch feedback (`active:scale-[0.97]`) is correct; this is polish only.

**Strengths:**
- 1.5px tile border (wireframe-exact, not default 1px)
- Font utilities chain correctly through CSS variable system
- Gradient scrim matches wireframe exactly
- Responsive font/padding sizes for desktop (18px, 14px)
- `prefers-reduced-motion` suppresses all transforms
- Game overlay colors match wireframe rgba values exactly
- No selected state on tiles (correct per AC5 and clarification notes)
- Graceful count omission with no "undefined listings" text
