# Story 9.1 — Corrective Plan: Token Compliance + Prototype Alignment

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 16 broken Tailwind token classes across 5 homepage components and align 3 prototype divergences (H1 gold spans, subtitle paragraph, seller signal text).
**Story:** 9-1 — `_bmad-output/implementation-artifacts/story-9-1-anonymous-homepage-hero-trust-foundation.md`
**Domain:** Frontend
**Repos:** storefront/
**Deployment:** true
**UX Wireframe:** `_bmad-output/planning-artifacts/ux-9-1-anonymous-homepage-hero-trust-foundation-wireframe.html`
**Replaces:** `docs/plans/2026-02-28-9-1-anonymous-homepage-hero-trust-foundation-plan.md` (original plan — DO NOT USE)

---

## Root Cause Summary

The original implementation used Tailwind v4 `@theme inline` token names (e.g. `text-text-primary`, `bg-surface-2`) in a Tailwind **v3.4.1** project. The `@theme inline` block in `globals.css` is v4 syntax and is completely **ignored** by v3. All classes derived from that block generate no CSS output → transparent backgrounds, invisible text, invisible borders.

Additionally, three visual elements diverged from the prototype:
1. H1 game names not wrapped in gold accent spans
2. Subtitle is embedded rather than a separate `<p>` tag
3. Seller signal prefix text wrong ("Looking to sell?" → "Got cards to sell?")

---

## Verified Token Mapping (from tailwind.config.ts + colors.css)

| Broken class (v4-style, no output) | Correct class (v3, generates CSS) | Source |
|---|---|---|
| `text-text-primary` | `text-primary` | `textColor.primary` |
| `text-text-secondary` | `text-secondary` | `textColor.secondary` |
| `text-text-tertiary` | `text-tertiary` | `textColor.tertiary` |
| `bg-surface-2` | `bg-bg-surface-2` | `colors['bg-surface-2']` |
| `border-border-default` | `border-border` | `colors.border` |
| `text-accent` (foreground use) | `text-accent-primary` | `colors['accent-primary']` |
| `border-accent-border` | inline style `var(--accent-border)` | CSS var, no Tailwind key |
| `text-accent-hover` | `hover:text-accent-primary` | no `accent-hover` key |
| `bg-accent/10` | inline style `rgba(212,168,67,0.10)` | opacity modifier on RGBA var breaks |
| `hover:bg-accent/[0.18]` | inline style on `:hover` | same issue |
| `from-accent/[0.06]` | inline style gradient | same issue |
| `to-accent/[0.02]` | inline style gradient | same issue |

---

## Files to Modify

```
storefront/src/components/homepage/HeroSection.tsx        — H1 spans, subtitle paragraph
storefront/src/components/homepage/TrustStrip.tsx         — bg, border, text tokens
storefront/src/components/homepage/TrustStatsCard.tsx     — bg, border, text, accent tokens
storefront/src/components/homepage/SellerOpportunityCard.tsx — gradient, border, bg, hover tokens
storefront/src/components/homepage/SellerSignal.tsx       — text-accent, hover, seller signal text
```

Tests to update (currently passing against broken implementation):
```
storefront/src/components/homepage/__tests__/HeroSection.test.tsx
storefront/src/components/homepage/__tests__/TrustStrip.test.tsx
storefront/src/components/homepage/__tests__/TrustStatsCard.test.tsx
storefront/src/components/homepage/__tests__/SellerOpportunityCard.test.tsx
storefront/src/components/homepage/__tests__/SellerSignal.test.tsx
```

---

## Tasks

### Task 1: Write failing tests for all corrective changes
**Files:** all `__tests__/*.test.tsx` files listed above
**Steps:**
1. Read the current test files to understand what's already tested
2. Add/update tests for each corrective change:

**HeroSection.test.tsx — new failing tests:**
- `<h1>` contains `<span>` elements wrapping each game name (MTG, Pokémon, Yu-Gi-Oh!, One Piece)
- `<span>` inside h1 has `style` attribute with `color` value (gold accent)
- Subtitle paragraph exists as a separate `<p>` element (not inside `<h1>`)
- Subtitle text: "Buy individual cards from verified sellers — no booster packs required."

**SellerSignal.test.tsx — new failing tests:**
- Renders text "Got cards to sell?" (not "Looking to sell?")
- Renders "Become a seller" link with `aria-label`
- Arrow `→` is wrapped in `<span aria-hidden="true">`

**TrustStrip.test.tsx — new failing tests (structural):**
- Trust strip icons (emoji) have `aria-hidden="true"`
- "Buyers protected" text present and is NOT a link (no `<a>` tag)
- Seller/card count text uses pluralisation: `sellers` when count > 1

**TrustStatsCard.test.tsx — verify stat values rendered:**
- 4 stat items present (cards, sellers, rating, games)
- Stat value elements have font-mono class

**SellerOpportunityCard.test.tsx — smoke tests pass (no token assertions in unit tests — those are visual)**

3. Run tests — confirm new tests FAIL, existing tests PASS

---

### Task 2: Fix `HeroSection.tsx` — H1 spans and subtitle paragraph

**Read the file first.** Then apply:

1. **H1 game name spans:** Wrap each game name in `<span style={{ color: 'var(--accent)' }}>`:
   ```tsx
   <h1 className="text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">
     The marketplace for{" "}
     <span style={{ color: "var(--accent)" }}>MTG, Pokémon, Yu-Gi-Oh!</span>{" "}
     and{" "}
     <span style={{ color: "var(--accent)" }}>One Piece</span>
     {" "}singles.
   </h1>
   ```
   - Fix outer H1 class: `text-text-primary` → `text-primary`

2. **Subtitle as separate `<p>`:**
   ```tsx
   <p className="mt-2 text-base text-secondary leading-relaxed">
     Buy individual cards from verified sellers — no booster packs required.
   </p>
   ```
   - Remove subtitle text from inside the H1 if it was there

3. Run tests — confirm HeroSection tests now PASS

---

### Task 3: Fix `TrustStrip.tsx` — broken token classes

**Read the file first.** Apply these replacements:

| Old | New |
|---|---|
| `bg-surface-2` | `bg-bg-surface-2` |
| `border-border-default` | `border-border` |
| `text-text-primary` | `text-primary` |
| `text-text-secondary` | `text-secondary` |

Add `aria-hidden="true"` to all emoji icon elements:
```tsx
<span aria-hidden="true">📦</span>
```

Ensure "Buyers protected" is plain text, not an anchor.

Add pluralisation for seller count:
```tsx
{sellerCount} {sellerCount === '1' ? 'verified seller' : 'verified sellers'}
```

Run tests — confirm TrustStrip tests PASS

---

### Task 4: Fix `TrustStatsCard.tsx` — broken token classes

**Read the file first.** Apply:

| Old | New |
|---|---|
| `bg-surface-2` | `bg-bg-surface-2` |
| `border-border-default` | `border-border` |
| `text-text-tertiary` | `text-tertiary` |
| `text-accent` | `text-accent-primary` |

The stat values (card count, seller count, etc.) should use `text-accent-primary font-mono` — `--accent-primary` is `var(--primary)` which is the solid gold, suitable for display text.

Run tests — confirm TrustStatsCard tests PASS

---

### Task 5: Fix `SellerOpportunityCard.tsx` — gradient and border tokens

**Read the file first.** The gradient and border tokens cannot use Tailwind opacity modifiers on RGBA CSS variables. Replace with inline styles:

```tsx
<div
  className="rounded-xl border p-4"
  style={{
    borderColor: 'var(--accent-border)',
    backgroundImage: 'linear-gradient(135deg, rgba(212,168,67,0.06) 0%, rgba(212,168,67,0.02) 100%)',
  }}
>
```

CTA button hover state — replace `hover:bg-accent/[0.18]` with a CSS class or inline approach:
```tsx
// Option A: add to globals.css as a utility class .accent-btn-hover
// Option B: use onMouseEnter/onMouseLeave (AVOID — this is RSC)
// Option C: add to tailwind.config.ts as safelist or use CSS variable
// CORRECT: Use a CSS class defined in globals.css
```

Add to `globals.css` (find the utility classes section):
```css
.accent-cta-btn {
  background-color: var(--accent-dim);
  color: var(--accent-primary);
  border: 1px solid var(--accent-border);
  transition: background-color 0.15s ease;
}
.accent-cta-btn:hover {
  background-color: rgba(212, 168, 67, 0.18);
}
```

Apply `className="accent-cta-btn rounded-lg px-4 py-2 text-sm font-semibold"` to the CTA button.

Run tests — confirm SellerOpportunityCard tests PASS

---

### Task 6: Fix `SellerSignal.tsx` — text and hover tokens + seller signal text

**Read the file first.** Apply:

1. **Seller signal text fix:**
   ```tsx
   // Before: "Looking to sell your cards?"
   // After: "Got cards to sell?"
   ```

2. **Full render output:**
   ```tsx
   <div className="flex min-h-[44px] items-center">
     <span className="text-sm text-secondary">Got cards to sell?</span>{" "}
     <a
       href="/sell"
       aria-label="Become a seller on SideDecked"
       className="ml-1 text-sm font-semibold text-accent-primary hover:text-accent-primary/90 transition-colors"
     >
       Become a seller{" "}
       <span aria-hidden="true">→</span>
     </a>
   </div>
   ```

   Note: `text-accent-primary/90` uses the opacity modifier on `--accent-primary` which is resolved at config time as a hex value — opacity modifiers work on config-registered hex values, not inline CSS vars.

3. Fix: `text-accent` → `text-accent-primary`, `hover:text-accent-hover` → `hover:text-accent-primary/90`

4. Run tests — confirm SellerSignal tests PASS

---

### Task 7: Quality gate + full test run + manual verification

```bash
cd storefront
npm run lint && npm run typecheck && npm run build && npm test
npm run test:coverage
```

Coverage: all modified files must be >80%.

**Manual verification checklist:**
- [ ] `npm run dev` → `localhost:3000` — homepage loads
- [ ] H1 visible above fold with gold game names
- [ ] Subtitle paragraph visible below H1
- [ ] Search bar present with correct placeholder
- [ ] Trust strip shows card count + seller count + "Buyers protected"
- [ ] Anonymous state: "Got cards to sell? Become a seller →" visible
- [ ] Authenticated state: seller signal NOT rendered
- [ ] Mobile 390px: single column, search bar thumb-reachable
- [ ] Desktop 1280px: two-column hero, right panel visible with stats
- [ ] No visible white boxes / transparent cards / invisible text (token fix confirmed)
- [ ] Browser devtools: no `text-text-primary`, `bg-surface-2`, `border-border-default` in DOM class lists

---

## Pre-Coding Verification

Before writing code, confirm these are unchanged from original implementation:
- [ ] `retrieveCustomer()` import: `@/lib/data/customer` ✓
- [ ] `EnhancedSearchBar` import: `@/components/search/EnhancedSearchBar` ✓
- [ ] `getSiteConfig()` import: `@/lib/site-config` ✓ (already created)
- [ ] `tailwind.config.ts`: no new keys needed — all correct tokens already registered ✓
- [ ] `globals.css`: add `.accent-cta-btn` utility class in Task 5 ✓

---

## Non-Goals (Explicitly Out of Scope)

- Changing the two-column layout structure (already correct)
- Modifying `page.tsx` auth pattern (already correct)
- Adding Story 9-2 game tiles (separate story)
- Modifying `lib/site-config.ts` values (env var concern — PM/ops task)
