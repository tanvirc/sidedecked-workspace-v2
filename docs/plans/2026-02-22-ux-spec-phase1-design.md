# UX Spec Alignment — Phase 1 Design

**Date:** 2026-02-22
**Scope:** Storefront Phase 1 — Foundation
**Source:** `_bmad-output/planning-artifacts/ux-design-specification.md`
**Timeline:** Week 1-2

---

## Objective

Align the storefront with the UX design specification Phase 1. Establish the shadcn/ui component foundation, eliminate all `alert()`/`confirm()`/`prompt()` browser dialogs, and introduce the three core TCG presentation components (`<RarityBadge>`, `<PriceTag>`, `<CardDisplay>`) that Phase 2 and beyond depend on.

Phase 2 (DeckBuilderShell, CartOptimizer) and Phase 3 (ListingWizard) are explicitly out of scope.

---

## Current State

| Item | Status |
|---|---|
| Midnight Forge design tokens | ✅ Complete — `src/app/colors.css` (light + dark modes) |
| `tailwindcss-animate` | ✅ Installed |
| shadcn/ui init (`components.json`) | ❌ Not initialized |
| Radix UI primitives | ❌ Not installed |
| `sonner` | ❌ Not installed |
| `@headlessui/react` | Present — to be removed |
| `alert()` calls | ❌ 35 remaining (28 in `CardDetailPage.tsx`) |
| `confirm()` / `prompt()` calls | ❌ Unaudited |
| `<RarityBadge>` | ❌ Not created |
| `<PriceTag>` | ❌ Not created (price inlined in many components) |
| `<CardDisplay>` | ❌ Not created (`CardGridItem`, `ListingCard` exist but are not unified) |

---

## Architecture

### New Files

```
src/components/tcg/
  ├── RarityBadge.tsx          — game-contextual rarity pill
  ├── PriceTag.tsx             — consistent price display (3 variants)
  └── CardDisplay.tsx          — universal card renderer (4 variants)

src/components/ui/             — shadcn/ui additions
  ├── sheet.tsx
  ├── dialog.tsx
  ├── alert-dialog.tsx
  ├── tooltip.tsx
  ├── popover.tsx
  ├── dropdown-menu.tsx
  ├── command.tsx
  └── sonner.tsx
```

### Modified Files

```
src/components/cards/
  ├── CardGridItem.tsx         — refactored internally to use CardDisplay + PriceTag + RarityBadge
  └── ListingCard.tsx          — refactored internally to use PriceTag + RarityBadge

src/components/cards/CardDetailPage.tsx   — alert() → toast replacements (28 calls)
src/components/cards/BuySection.tsx       — alert() → toast replacements (3 calls)
src/app/[locale]/debug/page.tsx           — alert() → toast replacement (1 call)
```

---

## Component Specifications

### `<RarityBadge>`

**Location:** `src/components/tcg/RarityBadge.tsx`

**Props:**
```typescript
interface RarityBadgeProps {
  game: 'mtg' | 'pokemon' | 'yugioh' | 'onepiece'
  rarity: string  // normalized lowercase: "common", "uncommon", "rare", "mythic", etc.
  className?: string
}
```

**Behavior:**
- Uses existing `--rarity-*` CSS tokens from `colors.css`
- Text label always visible (never color-only — accessibility requirement)
- Falls back to neutral styling for unknown rarities

**Examples:**
- `<RarityBadge game="mtg" rarity="mythic" />` → orange pill "Mythic Rare"
- `<RarityBadge game="pokemon" rarity="illustration" />` → gold pill "Illustration Rare"

---

### `<PriceTag>`

**Location:** `src/components/tcg/PriceTag.tsx`

**Props:**
```typescript
interface PriceTagProps {
  price: number | null
  sellerCount?: number
  marketAvg?: number
  trend?: 'up' | 'down' | 'stable'
  variant: 'inline' | 'detailed' | 'compact'
  className?: string
}
```

**Variants:**
- `inline` — "$15.99 · 3 sellers" (search results, card grids)
- `detailed` — "$15.99 · from 3 sellers · market avg $17.50 ↓" (card detail page)
- `compact` — "$15.99" (deck builder, tight spaces)

**States:**
- Loading: skeleton pulse animation
- Available: normal display using `--text-price` (gold) for the price amount
- Unavailable: "No sellers" in `--text-tertiary`
- Price drop: green trend arrow (↓) using `--positive`
- Price spike: amber trend arrow (↑) using `--warning`

**Accessibility:** `aria-label="$15.99, from 3 sellers, price trending down"`

---

### `<CardDisplay>`

**Location:** `src/components/tcg/CardDisplay.tsx`

**Props:**
```typescript
interface CardDisplayProps {
  card: Card
  searchResult?: SearchResult
  variant: 'gallery' | 'grid' | 'list' | 'compact'
  price?: number | null
  sellerCount?: number
  priceTrend?: 'up' | 'down' | 'stable'
  isSelected?: boolean
  showSelection?: boolean
  onSelect?: () => void
  onClick?: () => void
  className?: string
}
```

**Variants:**
- `gallery` — large art, hover overlay with name/type/price. No price always-visible.
- `grid` — medium image, card name, set icon, rarity badge, price visible at all times. Used in search results and browse pages.
- `list` — horizontal row: small image, name + set + rarity in column, price on right. Dense data layout.
- `compact` — thumbnail image with name only. Deck builder column.

**States (all variants):**
- Default
- Hover: 1.02x scale + border glow (`--interactive-subtle`)
- Loading: skeleton pulse (image + name placeholder)
- Unavailable: grayscale image + "No listings" overlay
- Selected: green border glow (`--positive`)

**Implementation notes:**
- Preserves all image loading/retry/error-fallback logic from `CardGridItem`
- Preserves `useCardHover` integration for desktop hover popup
- Preserves `useResponsiveImageSize` / `useImageSizesAttribute` from `ImageContext`
- `gallery` and `grid` variants: touch device shows tap → bottom sheet (Phase 2 wires this up; Phase 1 just renders the card)

**Accessibility:** `role="article"`, card name as `alt` text, keyboard focusable, Enter to navigate

---

## Migration Strategy

### `CardGridItem` (refactor)

`CardGridItem` retains its exact external API (same props, same behavior). Internally it delegates rendering to `<CardDisplay variant="grid">` and uses `<RarityBadge>` and `<PriceTag>` for consistent display. All image loading/retry/hover logic moves into `CardDisplay` or stays as shared utilities.

### `ListingCard` (refactor)

`ListingCard` retains its exact external API. Internally it uses `<PriceTag variant="inline">` for price display and `<RarityBadge>` for the rarity field.

---

## Alert Replacement Strategy

### Mapping

| Type | Replacement | sonner API | Duration |
|---|---|---|---|
| User action failure | `toast.error("...")` | `toast.error()` | Persistent |
| Success confirmation | `toast.success("...")` | `toast.success()` | 3s |
| Informational | `toast.info("...")` | `toast.info()` | 4s |
| Destructive confirm | `<AlertDialog>` | shadcn/ui | User-dismissed |

### Tone (per spec "friend test")

- "Failed to add to cart — try again" not "Error: ADD_TO_CART_FAILED"
- "Link copied" not "Link copied to clipboard!"
- "Price alert set for $X" → "Price alert set — we'll notify you when this card drops below $X"

---

## shadcn/ui Setup

**Init:** `npx shadcn@latest init` — auto-detects existing `colors.css` tokens, `tailwind.config.ts`, `@/` alias. Generates `components.json`. Zero visual changes.

**Components to install:**
```bash
npx shadcn@latest add sheet dialog alert-dialog tooltip popover dropdown-menu command sonner
```

**Remove:** `npm uninstall @headlessui/react` — replaced by Radix primitives in shadcn/ui components.

**Existing partial shadcn/ui components** (`progress.tsx`, `scroll-area.tsx`, `separator.tsx`, `tabs.tsx`) — keep as-is, they already follow shadcn conventions.

---

## Success Criteria

- [ ] `components.json` exists, `npx shadcn@latest add <x>` works
- [ ] `sonner` renders toasts correctly in dark + light modes
- [ ] Zero `alert()` / `confirm()` / `prompt()` calls in `src/`
- [ ] `<RarityBadge>` renders all 4 games' rarity tiers with correct colors
- [ ] `<PriceTag>` renders all 3 variants with correct token usage
- [ ] `<CardDisplay>` renders all 4 variants; image loading/hover behavior unchanged
- [ ] `CardGridItem` passes all existing usages (grep for all import sites, verify pages render)
- [ ] `ListingCard` passes all existing usages
- [ ] `npm run lint && npm run typecheck && npm run build` all pass
