# Story 2-2: Storefront Design Foundation & Card Display — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish the Midnight Forge design system (CSS tokens, Tailwind, shadcn/ui, sonner) and build reusable card display components (CardDisplay, CardSkeleton, PriceTag, RarityBadge) that all subsequent Epic 2+ stories depend on.
**Story:** story-2-2-storefront-design-foundation-card-display — `_bmad-output/implementation-artifacts/story-2-2-storefront-design-foundation-card-display.md` (file to be created in Task 1)
**Domain:** Frontend
**Repos:** `storefront/` only
**Deployment:** true — storefront changes require Railway deployment; additive CSS + new components, no breaking changes
**UX Wireframe:** `_bmad-output/planning-artifacts/ux-story-2-2-wireframe.html`

---

## Requirements Brief (from Phase 2)

### Clarified Acceptance Criteria

| # | Original AC | Clarified Implementation Requirement |
|---|---|---|
| AC1 | Midnight Forge palette applied | CSS custom properties in `globals.css` at root level; Tailwind config extended with token references; no hardcoded hex values in any new component; WCAG AA contrast verified |
| AC2 | shadcn/ui initialized with 7 components + sonner | Install + theme all 8 packages with Midnight Forge tokens (not default shadcn styles); `<Toaster>` in root layout |
| AC3 | CardDisplay renders correctly | `'use client'` component; 5:7 aspect-ratio enforced; name overflow-ellipsis; set icon with text fallback; game-specific rarity badge (color + text); hover guarded by `@media (pointer: fine)`; image error fallback; focus ring on `:focus-visible` |
| AC4 | CardSkeleton matches card shape | Server Component; CSS-only shimmer animation; identical dimensions to CardDisplay; `prefers-reduced-motion` respected |
| AC5 | PriceTag renders correctly | Server Component; `amount: number` (integer) + `currency: string` props; formats 1599 → $15.99; `font-feature-settings: 'tnum'`; price=0 → "Free"; price=null → "No listings" |
| AC6 | All alert()/confirm()/prompt() removed | Scan storefront to verify current count; `alert()` → `sonner.toast()`; destructive `confirm()` → `AlertDialog`; `prompt()` → Dialog/inline form |

### Business Rules
- CSS variables are the single source of truth — no hardcoded hex values in any new or migrated code
- Card image always renders at aspect-ratio 5/7 (`aspect-ratio: 5 / 7`) — never stretched
- RarityBadge requires both color dot AND text label — never color alone (NFR40, WCAG 1.4.1)
- PriceTag always formats from integer smallest-currency-unit; never receives or stores floats
- No `alert()`, `confirm()`, or `prompt()` calls in storefront after this story
- Destructive `confirm()` replacements must use `AlertDialog` (explicit confirm button) — not silent toast
- Custom ToastProvider and Custom Modal migrations are OUT OF SCOPE — track as separate cleanup stories
- Component audit scope: update globals.css + tailwind.config token references; do NOT refactor existing component internals beyond alert() migration

### Open Decision — Tav confirmed
**Audit-first approach:** Existing storefront components are audited against the Midnight Forge token system before layering the new system. Task 1 produces the audit report. Tasks 2–9 proceed based on audit findings.

### UX Flows (from Phase 2B)
- CardDisplay: hover (pointer:fine only → gold border glow) · focus (gold outline 2px) · active (scale 0.98, motion-respecting) · image error (card-shaped placeholder, card name visible)
- CardSkeleton: shimmer via opacity animation only — no position/transform animation
- Toast positioning: bottom-right (desktop) / bottom-center mobile with 72px bottom offset for bottom nav clearance; deck builder pages: top-right (desktop)
- AlertDialog: always has Cancel + destructive Confirm; focus returns to trigger on close

---

## Technical Design (from Phase 3)

### Domain Routing
- **Presentation Domain only** — `storefront/` exclusively
- Split-brain check: not applicable — no backend, database, or API changes
- No cross-service communication, no Redis events, no external integrations

### Affected Repos
- `storefront/` — all changes

### No New Entities or Migrations
- Pure frontend story — sidedecked-db and mercur-db untouched

### No API Contract Changes
- No new or modified endpoints in `backend/` or `customer-backend/`

### Component Architecture
```
Server Components (no 'use client'):
  CardSkeleton    — CSS-only animation, no state
  RarityBadge     — pure presentational, game + rarity → badge
  SetIcon         — pure presentational, icon SVG or text fallback
  PriceTag        — pure formatter, amount (int) + currency → display string

Client Components ('use client' required):
  CardDisplay     — hover/focus/active states, onError handler for image
```

### Tailwind Version — MUST VERIFY FIRST
Check `storefront/package.json` before implementing tokens:
- **v3**: extend in `tailwind.config.ts` under `theme.extend.colors` referencing `var(--token-name)`
- **v4**: CSS-first config — tokens defined in `globals.css` with `@theme { --color-* }` block

### Font Loading Strategy
```typescript
// storefront/src/app/layout.tsx
import { Inter } from 'next/font/google'
// Geist Sans + Geist Mono: use @vercel/font or next/font/local
// Apply as CSS variables: --font-body, --font-display, --font-mono
// display: 'swap' on all fonts — prevents FOIT, critical for LCP (NFR3)
```

### Deployment Classification
`needs_deploy = true` — storefront changes require Railway deployment; low risk (additive only)

---

## Task 1: Component Audit + Story File Creation

**Goal:** Inventory existing storefront components against Midnight Forge tokens; create story file; verify alert() count.

**Files:**
- Create: `_bmad-output/implementation-artifacts/story-2-2-storefront-design-foundation-card-display.md`
- Read: `storefront/package.json` (verify Tailwind version)
- Scan: `storefront/src/` (grep for hardcoded colors and alert() calls)

**Steps (no TDD required — audit task):**

1. Create the story file at `_bmad-output/implementation-artifacts/story-2-2-storefront-design-foundation-card-display.md` with all ACs from this plan marked `(NOT BUILT)`.

2. Verify Tailwind version: read `storefront/package.json` and record `tailwindcss` version.

3. Run component audit — grep for hardcoded values in storefront:
   ```bash
   # Count hardcoded hex colors
   grep -rn "#[0-9A-Fa-f]\{3,6\}" storefront/src --include="*.tsx" --include="*.ts" --include="*.css" | grep -v "globals.css" | grep -v ".test." | wc -l

   # Find alert/confirm/prompt calls — get actual count
   grep -rn "alert(\|confirm(\|prompt(" storefront/src --include="*.tsx" --include="*.ts"
   ```

4. Record findings: Tailwind version, hex count, alert() file list with line numbers.

5. Commit: `chore(storefront): add story 2-2 file and component audit findings`

---

## Task 2: Install Dependencies

**Goal:** Add all required packages to the storefront.

**Files:**
- Modify: `storefront/package.json`

**Steps:**

1. Write failing test first — a test that imports `sonner` and verifies `toast` is a function:
   ```typescript
   // storefront/src/__tests__/dependencies.test.ts
   import { toast } from 'sonner'
   it('sonner exports toast function', () => {
     expect(typeof toast).toBe('function')
   })
   ```
   Run test → confirm it FAILS (module not found).

2. Install packages:
   ```bash
   cd storefront
   npm install sonner
   npm install @vercel/font   # or: npx shadcn@latest init handles most deps
   npx shadcn@latest init     # follow prompts: use CSS variables, Tailwind, TypeScript
   npx shadcn@latest add sheet command dialog alert-dialog tooltip popover dropdown-menu
   ```

3. Run test → confirm it PASSES.

4. Verify all 7 shadcn components are present in `storefront/src/components/ui/`.

5. Run quality gate: `npm run lint && npm run typecheck`

6. Commit: `chore(storefront): install shadcn/ui, sonner, and font dependencies`

---

## Task 3: CSS Token System + Tailwind Configuration

**Goal:** Establish Midnight Forge CSS custom properties as the single source of truth.

**Files:**
- Modify: `storefront/src/styles/globals.css` (or `storefront/src/app/globals.css`)
- Modify: `storefront/tailwind.config.ts`

**Steps:**

1. Write failing test — a test that reads the computed CSS variables and verifies they exist (or a snapshot test of the CSS file content):
   ```typescript
   // storefront/src/__tests__/tokens.test.ts
   import fs from 'fs'
   it('globals.css defines --accent-gold token', () => {
     const css = fs.readFileSync('src/styles/globals.css', 'utf-8')
     expect(css).toContain('--accent-gold:')
     expect(css).toContain('--bg-base:')
     expect(css).toContain('--text-price:')
   })
   it('globals.css defines rarity tokens for all 4 games', () => {
     const css = fs.readFileSync('src/styles/globals.css', 'utf-8')
     expect(css).toContain('--mtg-mythic:')
     expect(css).toContain('--pkm-holo-rare:')
     expect(css).toContain('--ygo-ultra-rare:')
     expect(css).toContain('--op-super-rare:')
   })
   ```
   Run → FAIL (tokens not yet defined).

2. Add Midnight Forge tokens to `globals.css` `:root` block. Reference wireframe Section 1 for all exact values:
   - Surfaces: `--bg-base` through `--bg-surface-4`
   - Accent gold: `--accent-gold`, `--accent-gold-hover`, `--accent-gold-muted`
   - Interactive (Mystic Blue): `--interactive`, `--interactive-hover`, `--interactive-muted`
   - Semantic: `--positive`, `--negative`, `--warning`, `--info`
   - Text: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-price`, `--text-link`
   - Borders: `--border-subtle`, `--border-default`, `--border-focus`
   - MTG rarity: `--mtg-common`, `--mtg-uncommon`, `--mtg-rare`, `--mtg-mythic`
   - Pokemon rarity: `--pkm-common`, `--pkm-uncommon`, `--pkm-rare`, `--pkm-holo-rare`, `--pkm-ex`
   - Yu-Gi-Oh! rarity: `--ygo-common`, `--ygo-rare`, `--ygo-super-rare`, `--ygo-ultra-rare`
   - One Piece rarity: `--op-common`, `--op-uncommon`, `--op-rare`, `--op-super-rare`
   - Spacing scale: `--sp-1` through `--sp-8`
   - Radii: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
   - Font families: `--font-body`, `--font-display`, `--font-mono`
   - Card aspect: `--card-aspect: 5 / 7`
   - Shadows: `--shadow-card`, `--shadow-elevated`

3. Update `tailwind.config.ts` — extend theme to reference all tokens via `var()`. Apply correct syntax for the Tailwind version identified in Task 1.

4. Override shadcn/ui CSS variables in `globals.css` to map shadcn's `--primary`, `--background`, etc. to Midnight Forge tokens so shadcn components inherit the design system automatically.

5. Run test → PASS.

6. Run `npm run lint && npm run typecheck && npm run build`.

7. Commit: `feat(storefront): add Midnight Forge CSS token system and Tailwind configuration`

---

## Task 4: Font Loading

**Goal:** Load Inter, Geist Sans, Geist Mono via next/font with display:swap.

**Files:**
- Modify: `storefront/src/app/layout.tsx`

**Steps:**

1. Write failing test:
   ```typescript
   // storefront/src/__tests__/layout.test.tsx
   import { render } from '@testing-library/react'
   import RootLayout from '@/app/layout'
   it('layout applies font CSS variables to html element', () => {
     // Snapshot or check that font variable class is applied
     const { container } = render(<RootLayout><div /></RootLayout>)
     // Font variable should be present on html or body
     expect(document.documentElement.className).toMatch(/font-/)
   })
   ```
   Run → FAIL.

2. Add font loading to `layout.tsx`:
   ```typescript
   import { Inter } from 'next/font/google'
   // Geist via @vercel/font or next/font/local
   const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
   // Apply inter.variable to <html> className
   ```

3. Update `globals.css`: `--font-body: var(--font-inter);`

4. Run test → PASS.

5. Run `npm run lint && npm run typecheck && npm run build`.

6. Commit: `feat(storefront): configure next/font loading for Inter, Geist Sans, Geist Mono`

---

## Task 5: Theme shadcn/ui Components

**Goal:** Override shadcn/ui component CSS variables to use Midnight Forge tokens.

**Files:**
- Modify: `storefront/src/styles/globals.css`
- Modify: shadcn component files in `storefront/src/components/ui/` as needed

**Steps:**

1. Write visual regression test (snapshot) for at least one shadcn component to catch regressions:
   ```typescript
   // storefront/src/__tests__/ui/dialog.test.tsx
   import { render } from '@testing-library/react'
   import { Dialog, DialogContent } from '@/components/ui/dialog'
   it('Dialog renders with Midnight Forge classes', () => {
     const { container } = render(
       <Dialog open><DialogContent>Test</DialogContent></Dialog>
     )
     expect(container).toMatchSnapshot()
   })
   ```
   Run → FAIL (no snapshot yet — first run creates it; verify visually).

2. In `globals.css`, map shadcn CSS variable overrides:
   - `--background` → `var(--bg-base)`
   - `--foreground` → `var(--text-primary)`
   - `--primary` → `var(--accent-gold)`
   - `--primary-foreground` → `var(--bg-base)`
   - `--secondary` → `var(--bg-surface-3)`
   - `--muted` → `var(--bg-surface-2)`
   - `--border` → `var(--border-default)`
   - `--ring` → `var(--accent-gold)` (focus rings)
   - `--destructive` → `var(--negative)`

3. Run test → PASS (snapshot created — review visually).

4. Verify all 7 installed shadcn components render correctly with Midnight Forge theme by opening in browser.

5. Run `npm run lint && npm run typecheck && npm run build`.

6. Commit: `feat(storefront): theme shadcn/ui components with Midnight Forge design tokens`

---

## Task 6: Build RarityBadge + SetIcon

**Goal:** Build the two smallest display-only components first (Server Components, pure props).

**Files:**
- Create: `storefront/src/components/card/RarityBadge.tsx`
- Create: `storefront/src/components/card/SetIcon.tsx`
- Create: `storefront/src/__tests__/card/RarityBadge.test.tsx`
- Create: `storefront/src/__tests__/card/SetIcon.test.tsx`

**Steps:**

1. Write failing tests:
   ```typescript
   // RarityBadge.test.tsx
   import { render, screen } from '@testing-library/react'
   import { RarityBadge } from '@/components/card/RarityBadge'

   it('renders MTG Mythic Rare badge with color dot and text', () => {
     render(<RarityBadge game="MTG" rarity="mythic" />)
     expect(screen.getByText('Mythic Rare')).toBeInTheDocument()
     // Verify both text AND color indicator present (not color-alone)
   })
   it('renders fallback badge for unknown game', () => {
     render(<RarityBadge game="UNKNOWN" rarity="ultra" />)
     expect(screen.getByText('Unknown')).toBeInTheDocument()
   })
   it('renders all 4 MTG rarities without throwing', () => {
     const rarities = ['common', 'uncommon', 'rare', 'mythic']
     rarities.forEach(rarity => {
       expect(() => render(<RarityBadge game="MTG" rarity={rarity} />)).not.toThrow()
     })
   })
   it('renders all 4 game types without throwing', () => {
     const games = ['MTG', 'POKEMON', 'YUGIOH', 'OPTCG']
     games.forEach(game => {
       expect(() => render(<RarityBadge game={game} rarity="rare" />)).not.toThrow()
     })
   })
   ```
   Run → FAIL (component doesn't exist).

2. Implement `RarityBadge.tsx` — Server Component. Token map for all 4 games. Fallback to neutral grey "Unknown" for unrecognized game/rarity. Each badge renders a color dot span + text label span.

3. Implement `SetIcon.tsx` — Server Component. Accepts `setCode: string` and optional `setIconUrl?: string`. If `setIconUrl` provided, renders img with alt text. If not, renders a text fallback badge showing the set code (up to 4 chars). Never renders blank.

4. Run tests → PASS.

5. Run `npm run lint && npm run typecheck`.

6. Commit: `feat(storefront): add RarityBadge and SetIcon server components`

---

## Task 7: Build PriceTag

**Goal:** Build the price display component with integer formatting and all edge case variants.

**Files:**
- Create: `storefront/src/components/ui/PriceTag.tsx`
- Create: `storefront/src/__tests__/ui/PriceTag.test.tsx`

**Steps:**

1. Write failing tests:
   ```typescript
   import { render, screen } from '@testing-library/react'
   import { PriceTag } from '@/components/ui/PriceTag'

   it('formats integer amount to currency display', () => {
     render(<PriceTag amount={1599} currency="USD" />)
     expect(screen.getByText('$15.99')).toBeInTheDocument()
   })
   it('formats large amount with comma separator', () => {
     render(<PriceTag amount={124950} currency="USD" />)
     expect(screen.getByText('$1,249.50')).toBeInTheDocument()
   })
   it('renders "Free" when amount is 0', () => {
     render(<PriceTag amount={0} currency="USD" />)
     expect(screen.getByText('Free')).toBeInTheDocument()
   })
   it('renders "No listings" when amount is null', () => {
     render(<PriceTag amount={null} currency="USD" />)
     expect(screen.getByText('No listings')).toBeInTheDocument()
   })
   it('renders optional context string when provided', () => {
     render(<PriceTag amount={1599} currency="USD" context="3 sellers · lowest NM" />)
     expect(screen.getByText('3 sellers · lowest NM')).toBeInTheDocument()
   })
   it('applies Geist Mono font class and tnum feature', () => {
     const { container } = render(<PriceTag amount={1599} currency="USD" />)
     // Verify font-mono class or style applied
     expect(container.firstChild).toHaveClass(/font-mono|price-tag/)
   })
   ```
   Run → FAIL.

2. Implement `PriceTag.tsx` — Server Component:
   - Props: `amount: number | null, currency: string, context?: string`
   - Format: `(amount / 100).toLocaleString('en-US', { style: 'currency', currency })`
   - `amount === 0` → "Free" with `--positive` color class
   - `amount === null` → "No listings" with `--text-tertiary` color class
   - Apply `font-mono` + `font-feature-settings: 'tnum'` via CSS class
   - Apply `--text-price` color token via class

3. Run tests → PASS.

4. Run `npm run lint && npm run typecheck`.

5. Commit: `feat(storefront): add PriceTag server component with integer currency formatting`

---

## Task 8: Build CardSkeleton

**Goal:** Build the loading placeholder as a Server Component with CLS-safe dimensions.

**Files:**
- Create: `storefront/src/components/card/CardSkeleton.tsx`
- Create: `storefront/src/__tests__/card/CardSkeleton.test.tsx`

**Steps:**

1. Write failing tests:
   ```typescript
   import { render } from '@testing-library/react'
   import { CardSkeleton } from '@/components/card/CardSkeleton'

   it('renders without throwing', () => {
     expect(() => render(<CardSkeleton />)).not.toThrow()
   })
   it('has image area with 5:7 aspect ratio class', () => {
     const { container } = render(<CardSkeleton />)
     const imageArea = container.querySelector('[data-testid="skeleton-image"]')
     expect(imageArea).toBeInTheDocument()
     expect(imageArea).toHaveClass(/aspect-\[5\/7\]|aspect-card/)
   })
   it('has min-width applied', () => {
     const { container } = render(<CardSkeleton />)
     // Verify min-width is set (via class or inline style)
     expect(container.firstChild).toHaveStyle({ minWidth: '100px' })
   })
   ```
   Run → FAIL.

2. Implement `CardSkeleton.tsx` — Server Component (no `'use client'`):
   - Image placeholder: `aspect-ratio: 5/7`, `min-width: 100px`, shimmer animation class
   - Two skeleton lines below (name + rarity area)
   - CSS shimmer: `@keyframes shimmer { 0%,100% { opacity: 0.4 } 50% { opacity: 0.8 } }` defined in globals.css
   - `@media (prefers-reduced-motion) { animation: none }` for the shimmer class
   - `data-testid="skeleton-image"` on image area

3. Run tests → PASS.

4. Run `npm run lint && npm run typecheck`.

5. Commit: `feat(storefront): add CardSkeleton server component with CLS-safe dimensions`

---

## Task 9: Build CardDisplay

**Goal:** Build the primary card display Client Component — the most-used component in the codebase.

**Files:**
- Create: `storefront/src/components/card/CardDisplay.tsx`
- Create: `storefront/src/__tests__/card/CardDisplay.test.tsx`
- Create: `storefront/src/components/card/index.ts`

**Steps:**

1. Write failing tests:
   ```typescript
   import { render, screen } from '@testing-library/react'
   import { CardDisplay } from '@/components/card/CardDisplay'

   const baseProps = {
     name: 'Black Lotus',
     imageUrl: 'https://example.com/black-lotus.jpg',
     setCode: 'LEA',
     game: 'MTG',
     rarity: 'mythic',
   }

   it('renders card name', () => {
     render(<CardDisplay {...baseProps} />)
     expect(screen.getByText('Black Lotus')).toBeInTheDocument()
   })
   it('renders image with correct alt text', () => {
     render(<CardDisplay {...baseProps} />)
     const img = screen.getByRole('img')
     expect(img).toHaveAttribute('alt', expect.stringContaining('Black Lotus'))
   })
   it('renders RarityBadge', () => {
     render(<CardDisplay {...baseProps} />)
     expect(screen.getByText('Mythic Rare')).toBeInTheDocument()
   })
   it('shows image error fallback when image fails', async () => {
     render(<CardDisplay {...baseProps} imageUrl="broken-url" />)
     const img = screen.getByRole('img')
     // Simulate error
     fireEvent.error(img)
     expect(screen.getByText(/image unavailable/i)).toBeInTheDocument()
   })
   it('has tabindex 0 for keyboard navigation', () => {
     render(<CardDisplay {...baseProps} />)
     const card = screen.getByRole('button') // or the root div
     expect(card).toHaveAttribute('tabindex', '0')
   })
   it('truncates long names with ellipsis', () => {
     render(<CardDisplay {...baseProps} name="Saddled Wingmare, Champion of the Eternal Flame" />)
     const nameEl = screen.getByText(/Saddled Wingmare/)
     expect(nameEl).toHaveStyle({ textOverflow: 'ellipsis' })
   })
   it('applies min-width: 100px', () => {
     const { container } = render(<CardDisplay {...baseProps} />)
     expect(container.firstChild).toHaveStyle({ minWidth: '100px' })
   })
   it('renders optional PriceTag when price props provided', () => {
     render(<CardDisplay {...baseProps} price={1599} currency="USD" />)
     expect(screen.getByText('$15.99')).toBeInTheDocument()
   })
   ```
   Run → FAIL.

2. Implement `CardDisplay.tsx` — Client Component (`'use client'`):
   - Props: `name, imageUrl, setCode, setIconUrl?, game, rarity, price?, currency?, context?, onClick?, className?`
   - Image: use `next/image` with `onError` handler → show error fallback div
   - Image container: `aspect-ratio: 5/7`, `min-width: 100px`, `overflow: hidden`
   - Card footer: `overflow: hidden`, `flex-wrap: nowrap`
   - Name: `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`
   - Hover: wrapped in `@media (pointer: fine)` CSS — handled via CSS class, not JS
   - Focus: `:focus-visible` ring using `--border-focus` token
   - Active: `transform: scale(0.98)` — CSS class respecting `prefers-reduced-motion`
   - Keyboard: `tabindex={0}`, `aria-label="{name}, {setCode}, {rarity}"`
   - Composes: `RarityBadge`, `SetIcon`, `PriceTag`
   - `data-testid="card-display"`

3. Create `storefront/src/components/card/index.ts` barrel export:
   ```typescript
   export { CardDisplay } from './CardDisplay'
   export { CardSkeleton } from './CardSkeleton'
   export { RarityBadge } from './RarityBadge'
   export { SetIcon } from './SetIcon'
   ```

4. Run tests → PASS.

5. Run `npm run lint && npm run typecheck && npm run build`.

6. Mark AC3 and AC4 as `(IMPLEMENTED)` in story file.

7. Commit: `feat(storefront): add CardDisplay client component with all states and a11y`

---

## Task 10: Toast System + Alert() Migration

**Goal:** Install Toaster in root layout; replace all alert()/confirm()/prompt() calls in storefront.

**Files:**
- Modify: `storefront/src/app/layout.tsx` (add `<Toaster>`)
- Modify: 11+ files identified in Task 1 audit

**Steps:**

1. Write failing tests:
   ```typescript
   // storefront/src/__tests__/layout.test.tsx
   import { render } from '@testing-library/react'
   import RootLayout from '@/app/layout'

   it('renders Toaster component in layout', () => {
     const { container } = render(<RootLayout><div /></RootLayout>)
     // Toaster renders a div with aria-live or sonner-specific attribute
     expect(container.querySelector('[data-sonner-toaster]')).toBeInTheDocument()
   })
   ```
   ```typescript
   // storefront/src/__tests__/alert-migration.test.ts
   import { execSync } from 'child_process'

   it('no alert() calls remain in storefront/src', () => {
     const result = execSync(
       'grep -rn "alert(" storefront/src --include="*.tsx" --include="*.ts" | grep -v ".test." | grep -v "node_modules"',
       { encoding: 'utf-8', cwd: process.cwd() }
     ).trim()
     expect(result).toBe('')
   })
   it('no confirm() calls remain in storefront/src', () => {
     const result = execSync(
       'grep -rn "confirm(" storefront/src --include="*.tsx" --include="*.ts" | grep -v ".test." | grep -v "node_modules"',
       { encoding: 'utf-8', cwd: process.cwd() }
     ).trim()
     expect(result).toBe('')
   })
   ```
   Run → FAIL (`alert()` calls exist).

2. Add `<Toaster>` to `storefront/src/app/layout.tsx`:
   ```tsx
   import { Toaster } from 'sonner'
   // In layout JSX, after children:
   <Toaster
     position="bottom-right"
     offset={72}  // clear bottom nav on mobile (use CSS media query for positioning)
     toastOptions={{ /* Midnight Forge theme overrides */ }}
   />
   ```

3. For each file in the Task 1 alert() audit:
   - `alert("message")` → `toast("message")` or `toast.error("message")`
   - `confirm("Are you sure?")` guarding destructive action → replace with `AlertDialog` pattern (or extract to existing pattern if one exists)
   - `prompt("Enter value")` → Dialog with input or inline form
   - Add `import { toast } from 'sonner'` at top of each migrated file
   - One file at a time; run lint after each

4. Run tests → PASS (grep returns empty).

5. Run `npm run lint && npm run typecheck && npm run build && npm test`.

6. Run coverage: `npm run test:coverage` — verify >80% on new files.

7. Mark AC2 and AC6 as `(IMPLEMENTED)` in story file; mark AC1, AC5 as `(IMPLEMENTED)`.

8. Commit: `feat(storefront): add Toaster to layout and migrate all alert()/confirm() calls to sonner`

---

## Task 11: Quality Gate + Story Completion

**Goal:** Run full quality gate, verify all ACs implemented, update story file.

**Files:**
- Modify: `_bmad-output/implementation-artifacts/story-2-2-storefront-design-foundation-card-display.md`
- Modify: `_bmad-output/implementation-artifacts/sprint-status.yaml`

**Steps:**

1. Run full quality gate in `storefront/`:
   ```bash
   cd storefront
   npm run lint && npm run typecheck && npm run build && npm test
   npm run test:coverage
   ```
   All must PASS. Coverage must be >80% on new files. Show output as evidence.

2. Verify all ACs in story file are marked `(IMPLEMENTED)`:
   ```bash
   grep -c "(IMPLEMENTED)" _bmad-output/implementation-artifacts/story-2-2-storefront-design-foundation-card-display.md
   # Must equal the total AC count
   grep -c "(NOT BUILT)" _bmad-output/implementation-artifacts/story-2-2-storefront-design-foundation-card-display.md
   # Must equal 0
   ```

3. Update `sprint-status.yaml`:
   - `2-2-storefront-design-foundation-card-display: in-progress` → `review`
   - `epic-2: backlog` → `in-progress`

4. Commit: `docs(story-2-2): mark all ACs implemented and set status to review`

---

## Integration Notes (No Cross-Service Impact)

Story 2-2 is pure frontend with no cross-service boundaries. Phase 5 (QA integration testing) will confirm:
- No cross-service API contracts affected
- No integration tests required beyond storefront unit + component tests
- QA validates: visual rendering in browser, keyboard navigation, screen reader announcements, prefers-reduced-motion behavior

## Success Criteria

- [ ] `npm run lint && npm run typecheck && npm run build && npm test` all pass in `storefront/`
- [ ] Test coverage >80% on all new component files
- [ ] All 6 ACs marked `(IMPLEMENTED)` in story file
- [ ] Zero `alert()`, `confirm()`, `prompt()` calls in `storefront/src`
- [ ] Zero hardcoded hex colors in new component files
- [ ] CardDisplay renders at 5:7 aspect ratio, never stretched
- [ ] All rarity badges have both color dot and text label
- [ ] Hover state guarded by `@media (pointer: fine)`
- [ ] `<Toaster>` present in root layout with 72px bottom offset
- [ ] sprint-status.yaml updated: story-2-2 → review, epic-2 → in-progress
