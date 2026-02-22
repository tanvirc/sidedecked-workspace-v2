# Story 2-2: Storefront Design Foundation & Card Display

**Epic:** Epic 2 — TCG Card Catalog & Search
**Status:** review
**Story Key:** story-2-2-storefront-design-foundation-card-display
**Plan:** docs/plans/2026-02-23-story-2-2-storefront-design-foundation-plan.md

---

## Story

As a TCG collector visiting SideDecked,
I want to see cards displayed in a visually rich, game-appropriate design system,
So that I can quickly identify cards, rarities, and prices and trust the platform's quality.

---

## Acceptance Criteria

**AC1** (IMPLEMENTED)
**Given** the storefront app loads
**When** any page renders
**Then** the Midnight Forge design token system is active — dark/light palette CSS variables in `colors.css`, all tokens mapped to Tailwind utilities in `tailwind.config.ts`, rarity tokens for MTG/Pokemon/Yu-Gi-Oh/One Piece present

**AC2** (IMPLEMENTED)
**Given** the storefront is initialized
**When** UI components render
**Then** shadcn/ui (Radix UI primitives) is initialized with Midnight Forge tokens: Sheet, Command, Dialog, AlertDialog, Tooltip, Popover, DropdownMenu, Sonner all present in `src/components/ui/`

**AC3** (IMPLEMENTED)
**Given** a TCG card object
**When** rendered as `<CardDisplay card={card} variant="grid" />`
**Then** the component renders the card name, image (via BlurHashImage), rarity badge, and price tag in 4 variants (grid, list, compact, gallery); image error states gracefully fall back; selection mode supported; accessibility: `role="article"`, aria-labels on checkboxes; `@media (pointer: fine)` guards hover states

**AC4** (IMPLEMENTED)
**Given** cards are loading
**When** the grid renders before data arrives
**Then** `CardGridSkeleton` renders animated placeholder items using Midnight Forge tokens (`bg-card`, `bg-muted`) in both grid and list modes, respecting the responsive column grid

**AC5** (IMPLEMENTED)
**Given** a card price as a float
**When** rendered as `<PriceTag price={15.99} variant="inline" sellerCount={3} />`
**Then** price displays formatted ($15.99), seller count shows ("3 sellers"), trend indicators (↑/↓) use semantic color tokens, compact variant omits seller count, null price renders "No sellers"; `role="group"` with descriptive `aria-label`

**AC6** (IMPLEMENTED)
**Given** any storefront page
**When** user interaction requires confirmation
**Then** zero native `alert()`, `confirm()`, or `prompt()` calls exist in the codebase — all dialogs use shadcn/ui AlertDialog or sonner toasts

---

## Implementation Notes

### Audit findings (Task 1)
- Tailwind: v3.4.17 (confirmed — use `theme.extend` in `tailwind.config.ts`)
- Next.js: v15.5.12 (architecture docs state 14 — doc is outdated)
- Font loading: Inter + GeistSans + GeistMono already configured in `src/app/layout.tsx`
- Token system: fully implemented in `src/app/colors.css` + `tailwind.config.ts`
- shadcn/ui: all required components already installed
- alert() calls: 0 (AC6 pre-satisfied)
- Toaster: already in `src/app/providers.tsx` (`position="bottom-right" richColors`)

### Components
- `src/components/tcg/CardDisplay.tsx` — 4 variants, BlurHashImage, retry-on-error
- `src/components/tcg/PriceTag.tsx` — inline/detailed/compact, trend indicators, CSS var colors
- `src/components/tcg/RarityBadge.tsx` — 4 games, `color-mix()` backgrounds, fallback
- `src/components/cards/CardGridSkeleton.tsx` — responsive via `useGridColumns` hook

### Tests
- `src/components/tcg/__tests__/CardDisplay.test.tsx` — 24 tests
- `src/components/tcg/__tests__/PriceTag.test.tsx` — 9 tests
- `src/components/tcg/__tests__/RarityBadge.test.tsx` — 7 tests
- `src/components/cards/__tests__/CardGridSkeleton.test.tsx` — 5 tests (added this story)
- All 212 storefront tests pass

---

## Dev Notes

- `RarityIcon.tsx` in `src/components/cards/` is a legacy component using hardcoded Tailwind color classes and emoji symbols. It is superseded by `src/components/tcg/RarityBadge.tsx` which uses Midnight Forge CSS variable tokens. Do not use `RarityIcon.tsx` for new code.
- `@theme inline` block in `colors.css` is Tailwind v4 syntax — in v3 it is ignored by PostCSS (browsers treat it as an unknown at-rule). Actual Tailwind utility mapping is done via `tailwind.config.ts`. Do not remove the `@theme inline` block as it documents intent for future v4 migration.
