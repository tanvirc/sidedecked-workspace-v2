# UX Spec Phase 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align all 20 storefront routes with the UX design specification using route-first BMAD elicitation, building spec-compliant components route by route.

**Architecture:** Each route follows a fixed process — BMAD elicitation session (UX Designer + PM + Architect + Analyst) produces a per-route brief, then TDD implementation builds the components. CartOptimizer is deferred (no backend API). Routes execute in tier order: Tier 1 (identity/onboarding) → Tier 2 (core product) → Tier 3 (supporting flows) → Tier 4 (commerce/power user).

**Tech Stack:** Next.js 14, Tailwind CSS, shadcn/ui (Radix UI), sonner, Algolia, react-dnd, Vitest + @testing-library/react

**Working directory:** `storefront/` for all commands unless stated otherwise.

**Design doc:** `docs/plans/2026-02-23-ux-spec-phase2-design.md`
**UX spec:** `_bmad-output/planning-artifacts/ux-design-specification.md`

---

## Elicitation Process Template

**Every route starts with this process. Do not skip it.**

### What a BMAD elicitation session produces

A per-route brief saved to `docs/plans/briefs/YYYY-MM-DD-route-[name]-brief.md` containing:
- Current state audit (what the page does now, what's mocked, what's broken)
- Finalized component list with props and states
- Interaction decisions (what happens on tap, hover, error, empty state)
- Success criteria (how to know the route is done)
- Out of scope decisions (what we explicitly won't build)

### How to run the session

Invoke the relevant BMAD agents as slash commands. For each route, the required agents are:

```
/bmad-agent-bmm-ux-designer   ← leads the session
/bmad-agent-bmm-pm            ← prioritization and scope
/bmad-agent-bmm-architect     ← technical constraints
/bmad-agent-bmm-analyst       ← user research gaps
```

Tell each agent: "We are doing an advanced elicitation session for [route]. The UX spec is at `_bmad-output/planning-artifacts/ux-design-specification.md`. The current implementation is at [file path]. Identify gaps, challenges, and decisions needed before implementation."

Save the output as the per-route brief before writing any code.

---

## Task 1: Route 1 — Home Page (`/`)

**Files:**
- Read: `src/app/[locale]/(main)/page.tsx`
- Modify: `src/app/[locale]/(main)/page.tsx`
- Create: `src/components/home/GamePicker.tsx`
- Create: `src/components/home/__tests__/GamePicker.test.tsx`
- Create: `src/components/home/HomeHero.tsx`
- Create: `src/components/home/FeaturedSetsSection.tsx`
- Create: `src/components/home/TrendingDecksSection.tsx`

**Step 1: BMAD elicitation session**

Invoke:
```
/bmad-agent-bmm-ux-designer
/bmad-agent-bmm-pm
/bmad-agent-bmm-analyst
```

Key questions to answer in the brief:
- What does the hero CTA link to for unauthenticated users?
- What real data sources exist for "trending decks" and "featured sets" at launch?
- What is the honest cold-start state if there are no decks yet?
- Which games are live at launch — should GamePicker show all 4 or only active ones?
- Does "new arrivals" mean newly listed cards or newly added to catalog?

Save brief to: `docs/plans/briefs/2026-02-23-route-home-brief.md`

**Step 2: Audit current home page**

Read `src/app/[locale]/(main)/page.tsx` fully. Note:
- What data is hardcoded vs fetched?
- What placeholder/mock content exists?
- What components are already in use?

**Step 3: Write failing test for `<GamePicker>`**

Create `src/components/home/__tests__/GamePicker.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GamePicker } from '../GamePicker'

describe('GamePicker', () => {
  it('renders all four game options', () => {
    render(<GamePicker selected={[]} onChange={vi.fn()} />)
    expect(screen.getByText('MTG')).toBeInTheDocument()
    expect(screen.getByText('Pokémon')).toBeInTheDocument()
    expect(screen.getByText('Yu-Gi-Oh!')).toBeInTheDocument()
    expect(screen.getByText('One Piece')).toBeInTheDocument()
  })

  it('marks selected games as active', () => {
    render(<GamePicker selected={['MTG']} onChange={vi.fn()} />)
    expect(screen.getByText('MTG').closest('button')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Pokémon').closest('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange when a game is toggled', () => {
    const onChange = vi.fn()
    render(<GamePicker selected={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('MTG'))
    expect(onChange).toHaveBeenCalledWith(['MTG'])
  })

  it('supports multi-select', () => {
    const onChange = vi.fn()
    render(<GamePicker selected={['MTG']} onChange={onChange} />)
    fireEvent.click(screen.getByText('Pokémon'))
    expect(onChange).toHaveBeenCalledWith(['MTG', 'POKEMON'])
  })

  it('deselects on second click', () => {
    const onChange = vi.fn()
    render(<GamePicker selected={['MTG']} onChange={onChange} />)
    fireEvent.click(screen.getByText('MTG'))
    expect(onChange).toHaveBeenCalledWith([])
  })
})
```

Run: `npm test -- src/components/home/__tests__/GamePicker.test.tsx`
Expected: FAIL — "Cannot find module '../GamePicker'"

**Step 4: Implement `<GamePicker>`**

Create `src/components/home/GamePicker.tsx`:

```tsx
import { cn } from '@/lib/utils'

export type GameCode = 'MTG' | 'POKEMON' | 'YUGIOH' | 'OPTCG'

const GAMES: { code: GameCode; label: string; icon: string }[] = [
  { code: 'MTG', label: 'MTG', icon: '⚡' },
  { code: 'POKEMON', label: 'Pokémon', icon: '🔥' },
  { code: 'YUGIOH', label: 'Yu-Gi-Oh!', icon: '⭐' },
  { code: 'OPTCG', label: 'One Piece', icon: '🏴‍☠️' },
]

interface GamePickerProps {
  selected: GameCode[]
  onChange: (games: GameCode[]) => void
  className?: string
}

export function GamePicker({ selected, onChange, className }: GamePickerProps) {
  const toggle = (code: GameCode) => {
    if (selected.includes(code)) {
      onChange(selected.filter((g) => g !== code))
    } else {
      onChange([...selected, code])
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="group" aria-label="Filter by game">
      {GAMES.map(({ code, label, icon }) => {
        const isActive = selected.includes(code)
        return (
          <button
            key={code}
            onClick={() => toggle(code)}
            aria-pressed={isActive}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--interactive)]',
              isActive
                ? 'bg-[color:var(--accent-primary)] text-[color:var(--text-on-accent)] border-transparent'
                : 'bg-transparent text-[color:var(--text-secondary)] border-[color:var(--border-default)] hover:border-[color:var(--border-strong)]'
            )}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        )
      })}
    </div>
  )
}
```

Run: `npm test -- src/components/home/__tests__/GamePicker.test.tsx`
Expected: All 5 tests PASS.

**Step 5: Audit and replace mocked home page content**

Search for hardcoded/mock data:
```bash
grep -n "TODO\|mock\|placeholder\|hardcoded\|fake\|lorem\|example" src/app/[locale]/(main)/page.tsx
```

For each mock data source found, either:
- Replace with a real API call (if the endpoint exists in customer-backend or MedusaJS)
- Replace with an honest empty/cold-start state (if data doesn't exist yet)

Per spec: no placeholder avatars, no hardcoded activity, no fabricated community data.

**Step 6: Update home page with GamePicker and spec-compliant sections**

Modify `src/app/[locale]/(main)/page.tsx` per the elicitation brief. At minimum:
- Hero section: full-bleed card art background, gold primary CTA, `<GamePicker>` for game filtering
- Featured sets: real data from customer-backend `/api/sets?featured=true&limit=6`
- New arrivals: real listings via `<CardDisplay variant="gallery">`
- Honest empty states for sections with no data yet

**Step 7: Run quality gate**

```bash
npm run typecheck && npm run lint
```
Expected: 0 errors.

**Step 8: Commit**

```bash
git add src/components/home/ src/app/[locale]/\(main\)/page.tsx
git commit -m "feat(storefront): home page UX spec alignment — GamePicker, real data, Midnight Forge hero"
```

---

## Task 2: Route 2 — Registration + OAuth (`/user/register`)

**Files:**
- Read: `src/app/[locale]/(main)/user/register/page.tsx`
- Read: current auth components (search for `OAuth`, `Google`, `Discord` in `src/components/auth/`)
- Modify: registration page and auth components per brief

**Step 1: BMAD elicitation session**

Invoke:
```
/bmad-agent-bmm-ux-designer
/bmad-agent-bmm-pm
/bmad-agent-bmm-architect
```

Key questions:
- Which OAuth providers are live? (spec says Google + Discord + Apple — are all 3 configured?)
- What happens after OAuth — where does the user land?
- Is the game selection onboarding step wired to the user profile, or is it purely local state?
- Collection import (Moxfield/Archidekt/CSV) — is any import API available?
- What's the honest state if an import fails?

Save brief to: `docs/plans/briefs/2026-02-23-route-register-brief.md`

**Step 2: Audit current registration flow**

Read the register page and all auth components it uses. Note what's missing vs. spec:
- Are OAuth buttons present and functional?
- Is there a game selection step post-registration?
- Is email/password form present? (spec says OAuth-only — remove if yes)

**Step 3: Implement per brief**

Follow TDD for each new component the brief identifies. Common components:
- `<OAuthButtonGroup>` — Google / Discord / Apple buttons, stacked, no email/password
- `<GameSelectionStep>` — post-OAuth onboarding, multi-select, wraps `<GamePicker>`
- `<CollectionImportPrompt>` — Moxfield / Archidekt / CSV / Skip, with honest failure states

For each: write failing test → implement → verify passing → commit.

**Step 4: Quality gate + commit**

```bash
npm run typecheck && npm run lint && npm test
git commit -m "feat(storefront): registration UX spec alignment — OAuth-only, game onboarding"
```

---

## Task 3: Route 3 — Profile & Settings (`/settings/profile`, `/user/settings`)

**Files:**
- Read: `src/app/[locale]/(main)/settings/profile/page.tsx`
- Read: `src/app/[locale]/(main)/user/settings/page.tsx`
- Modify: per elicitation brief

**Step 1: BMAD elicitation session**

Invoke:
```
/bmad-agent-bmm-ux-designer
/bmad-agent-bmm-pm
```

Key questions:
- Are `/settings/profile` and `/user/settings` two separate pages or should they merge?
- Where is game preference stored — customer-backend user profile, or MedusaJS customer?
- What notification types exist — which are implemented vs. aspirational?
- Is saved shipping address for the cart optimizer wired to customer-backend?

Save brief to: `docs/plans/briefs/2026-02-23-route-settings-brief.md`

**Step 2: Implement per brief**

Common components (confirm in brief first):
- Game preferences section — multi-select `<GamePicker>` wired to user profile API
- Notification preferences — toggles with real save (not mock)
- Saved address form — used for shipping cost pre-calculation

TDD for each new component. Commit per component.

**Step 3: Quality gate + commit**

```bash
npm run typecheck && npm run lint && npm test
git commit -m "feat(storefront): profile/settings UX spec alignment — game prefs, notifications"
```

---

## Task 4: Route 4 — Become a Seller (`/sell/upgrade`)

**Files:**
- Read: `src/app/[locale]/(main)/sell/upgrade/page.tsx`
- Read: any existing upgrade components in `src/components/seller/`
- Modify: per elicitation brief

**Step 1: BMAD elicitation session**

Invoke:
```
/bmad-agent-bmm-ux-designer
/bmad-agent-bmm-pm
/bmad-agent-bmm-analyst
```

Key questions:
- What are the actual requirements to become a seller? (ID verification, bank account, minimum age, etc.)
- What does the user see after upgrade — immediate access or pending review?
- What commission rates are used? Are they real or aspirational?
- What happens if upgrade fails (payment failure, verification failure)?
- Per spec: "anxiety → guided confidence → relief" — what is the anxiety here?

Save brief to: `docs/plans/briefs/2026-02-23-route-upgrade-brief.md`

**Step 2: Audit current upgrade page**

Note what's mocked, what's broken, what the current UX feels like.

**Step 3: Implement per brief**

Common components:
- Requirements checklist with real inline status checks
- Earnings preview with real commission rates (not aspirational)
- Progress indicator across steps
- Trust content: "What happens after you upgrade"

TDD for each. Commit per component.

**Step 4: Quality gate + commit**

```bash
npm run typecheck && npm run lint && npm test
git commit -m "feat(storefront): seller upgrade UX spec alignment — guided confidence flow"
```

---

## Task 5: Route 5 — Card Detail Page (`/cards/[id]`)

**Files:**
- Read: `src/components/cards/CardDetailPage.tsx` (primary)
- Read: `src/components/cards/ListingCard.tsx` (to be replaced by SellerRow on detail page)
- Read: `src/components/cards/BuySection.tsx`
- Create: `src/components/tcg/SellerRow.tsx`
- Create: `src/components/tcg/__tests__/SellerRow.test.tsx`
- Create: `src/components/tcg/ConditionSelector.tsx`
- Create: `src/components/tcg/__tests__/ConditionSelector.test.tsx`

**Step 1: BMAD elicitation session**

Invoke:
```
/bmad-agent-bmm-ux-designer
/bmad-agent-bmm-pm
/bmad-agent-bmm-architect
/bmad-agent-bmm-analyst
```

Key questions:
- What trust signals are available in the seller data? (rating %, sale count, location)
- How is shipping estimate calculated per seller? Is that data available?
- What are the four actions from card detail (buy, deck, wishlist, sell) — are all wired?
- What is the "Add to Cart" flow — which backend handles it?
- Condition filter on the listing table — single-select or multi-select?
- What does the page look like with 0 sellers? 1 seller? 50+ sellers?

Save brief to: `docs/plans/briefs/2026-02-23-route-card-detail-brief.md`

**Step 2: Write failing tests for `<SellerRow>`**

Create `src/components/tcg/__tests__/SellerRow.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SellerRow } from '../SellerRow'

const mockListing = {
  id: 'listing-1',
  sellerId: 'seller-1',
  sellerName: 'CardShop Pro',
  sellerRating: 99.2,
  sellerSaleCount: 412,
  sellerLocation: 'Toronto, CA',
  condition: 'NM',
  price: 15.99,
  shippingEstimate: 2.99,
  stock: 3,
  isVerified: true,
}

describe('SellerRow', () => {
  it('renders seller name', () => {
    render(<SellerRow listing={mockListing} onAddToCart={vi.fn()} />)
    expect(screen.getByText('CardShop Pro')).toBeInTheDocument()
  })

  it('shows specific trust signals not vague badges', () => {
    render(<SellerRow listing={mockListing} onAddToCart={vi.fn()} />)
    expect(screen.getByText(/99\.2%/)).toBeInTheDocument()
    expect(screen.getByText(/412 sales/)).toBeInTheDocument()
    expect(screen.getByText(/Toronto/)).toBeInTheDocument()
  })

  it('shows condition', () => {
    render(<SellerRow listing={mockListing} onAddToCart={vi.fn()} />)
    expect(screen.getByText('NM')).toBeInTheDocument()
  })

  it('shows price and shipping estimate', () => {
    render(<SellerRow listing={mockListing} onAddToCart={vi.fn()} />)
    expect(screen.getByText(/\$15\.99/)).toBeInTheDocument()
    expect(screen.getByText(/\$2\.99/)).toBeInTheDocument()
  })

  it('calls onAddToCart when button clicked', () => {
    const onAddToCart = vi.fn()
    render(<SellerRow listing={mockListing} onAddToCart={onAddToCart} />)
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(onAddToCart).toHaveBeenCalledWith(mockListing)
  })

  it('disables Add to Cart when out of stock', () => {
    render(<SellerRow listing={{ ...mockListing, stock: 0 }} onAddToCart={vi.fn()} />)
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled()
  })

  it('highlights best-price row', () => {
    const { container } = render(
      <SellerRow listing={mockListing} onAddToCart={vi.fn()} isBestPrice />
    )
    expect(container.firstChild).toHaveClass('is-best-price')
  })

  it('is keyboard focusable', () => {
    render(<SellerRow listing={mockListing} onAddToCart={vi.fn()} />)
    const row = screen.getByRole('row')
    expect(row).toHaveAttribute('tabIndex', '0')
  })
})
```

Run: `npm test -- src/components/tcg/__tests__/SellerRow.test.tsx`
Expected: FAIL — "Cannot find module '../SellerRow'"

**Step 3: Implement `<SellerRow>`**

Create `src/components/tcg/SellerRow.tsx` with:
- Props: `listing`, `onAddToCart`, `isBestPrice?`
- Trust signals: `{rating}% · {saleCount} sales · Ships from {location}`
- Condition badge using existing `GradingBadge` or inline styling
- `<PriceTag variant="compact">` for price, separate shipping estimate text
- "Add to Cart" button (disabled when stock === 0)
- `role="row"`, `tabIndex={0}`, keyboard Enter triggers add-to-cart
- `is-best-price` class adds gold left border glow

Run tests. Expected: all 8 PASS.

**Step 4: Write failing tests for `<ConditionSelector>`**

Create `src/components/tcg/__tests__/ConditionSelector.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ConditionSelector } from '../ConditionSelector'

describe('ConditionSelector — buyer mode', () => {
  it('renders all 5 conditions', () => {
    render(<ConditionSelector mode="buyer" game="MTG" selected={[]} onChange={vi.fn()} />)
    expect(screen.getByText('NM')).toBeInTheDocument()
    expect(screen.getByText('LP')).toBeInTheDocument()
    expect(screen.getByText('MP')).toBeInTheDocument()
    expect(screen.getByText('HP')).toBeInTheDocument()
    expect(screen.getByText('DMG')).toBeInTheDocument()
  })

  it('applies MTG game defaults (NM + LP selected)', () => {
    render(<ConditionSelector mode="buyer" game="MTG" selected={['NM', 'LP']} onChange={vi.fn()} />)
    expect(screen.getByText('NM').closest('button')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('LP').closest('button')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('MP').closest('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('applies Pokemon game defaults (NM only)', () => {
    render(<ConditionSelector mode="buyer" game="POKEMON" selected={['NM']} onChange={vi.fn()} />)
    expect(screen.getByText('NM').closest('button')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('LP').closest('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange on condition toggle', () => {
    const onChange = vi.fn()
    render(<ConditionSelector mode="buyer" game="MTG" selected={['NM']} onChange={onChange} />)
    fireEvent.click(screen.getByText('LP'))
    expect(onChange).toHaveBeenCalledWith(['NM', 'LP'])
  })
})

describe('ConditionSelector — seller mode', () => {
  it('allows only single selection', () => {
    const onChange = vi.fn()
    render(<ConditionSelector mode="seller" game="MTG" selected={['NM']} onChange={onChange} />)
    fireEvent.click(screen.getByText('LP'))
    expect(onChange).toHaveBeenCalledWith(['LP'])
  })

  it('shows condition description tooltip', () => {
    render(<ConditionSelector mode="seller" game="MTG" selected={['NM']} onChange={vi.fn()} />)
    expect(screen.getByText(/Near Mint/i)).toBeInTheDocument()
  })
})
```

Run: `npm test -- src/components/tcg/__tests__/ConditionSelector.test.tsx`
Expected: FAIL — "Cannot find module '../ConditionSelector'"

**Step 5: Implement `<ConditionSelector>`**

Create `src/components/tcg/ConditionSelector.tsx`:
- Props: `mode: 'buyer' | 'seller'`, `game: GameCode`, `selected: string[]`, `onChange`
- `buyer` mode: multi-select pill group
- `seller` mode: single-select with condition description inline
- Condition descriptions: "Near Mint — looks like it just came out of the pack", "Lightly Played — minor wear, still tournament legal", etc.
- Game-contextual defaults are the responsibility of the parent — ConditionSelector just renders what's selected

Run tests. Expected: all 6 PASS.

**Step 6: Wire SellerRow and ConditionSelector into CardDetailPage**

Read `src/components/cards/CardDetailPage.tsx` fully.

Replace the seller listings section: swap `<ListingCard>` with `<SellerRow>`. The first/cheapest listing gets `isBestPrice` prop.

Add `<ConditionSelector mode="buyer">` above the listings table as a filter. When condition changes, filter the visible seller rows.

**Step 7: Quality gate**

```bash
npm run typecheck && npm run lint && npm test
```

**Step 8: Commit**

```bash
git add src/components/tcg/SellerRow.tsx \
        src/components/tcg/ConditionSelector.tsx \
        src/components/tcg/__tests__/SellerRow.test.tsx \
        src/components/tcg/__tests__/ConditionSelector.test.tsx \
        src/components/cards/CardDetailPage.tsx
git commit -m "feat(storefront): card detail UX spec alignment — SellerRow, ConditionSelector"
```

---

## Task 6: Route 6 — Browse & Search (`/cards`, `/search`)

**Files:**
- Read: `src/app/[locale]/(main)/cards/page.tsx`
- Read: `src/app/[locale]/(main)/search/page.tsx`
- Read: `src/components/cards/FacetedFilters.tsx`
- Read: `src/components/cards/SearchBar.tsx`
- Read: `src/components/cards/CardBrowseInterface.tsx`
- Create: `src/components/search/FacetedSearch.tsx`
- Create: `src/components/search/__tests__/FacetedSearch.test.tsx`

**Step 1: BMAD elicitation session**

Invoke:
```
/bmad-agent-bmm-ux-designer
/bmad-agent-bmm-architect
/bmad-agent-bmm-pm
```

Key questions:
- What Algolia indices exist? (cards, listings, decks?)
- What facets are indexed? (game, set, rarity, condition, price range)
- Does the current `FacetedFilters.tsx` use Algolia or custom API?
- Should `/cards` and `/search` be unified or stay separate pages?
- Progressive disclosure: what does "advanced toggle" show that the simple search doesn't?
- What happens when Algolia returns 0 results — suggest alternatives?

Save brief to: `docs/plans/briefs/2026-02-23-route-search-brief.md`

**Step 2: Audit current search components**

Read `FacetedFilters.tsx`, `SearchBar.tsx`, and `CardBrowseInterface.tsx`. Note what's Algolia-wired vs. custom API vs. mocked.

**Step 3: Build `<FacetedSearch>` per brief (TDD)**

Write failing tests first. Then implement progressive disclosure:
- Simple: text input → Algolia InstantSearch results
- Smart suggestions: autocomplete using Algolia's `useSuggestions` or `useSearchBox`
- Advanced toggle: reveals facet panels (game, set, rarity, condition, price range)
- Facet counts: real-time from Algolia, not estimated

**Step 4: Wire into browse and search pages**

Replace or wrap existing `FacetedFilters` + `SearchBar` with `<FacetedSearch>`.

Add view mode toggle (gallery / grid / list) — persisted in localStorage.

**Step 5: Quality gate + commit**

```bash
npm run typecheck && npm run lint && npm test
git commit -m "feat(storefront): search UX spec alignment — FacetedSearch, Algolia progressive disclosure"
```

---

## Task 7: Route 7 — Deck Builder (`/decks/[deckId]/edit`)

**Files:**
- Read: `src/components/deck-builder/DeckBuilderPage.tsx`
- Read: `src/components/deck-builder/MobileDeckBuilder.tsx`
- Read: `src/components/deck-builder/DeckStats.tsx`
- Read: `src/components/deck-builder/DeckBuilderLayout.tsx`
- Read: `src/components/deck-builder/DeckZone.tsx`
- Create: `src/components/tcg/DeckBuilderShell.tsx`
- Modify: `src/components/deck-builder/DeckStats.tsx`

**Step 1: BMAD elicitation session**

Invoke:
```
/bmad-agent-bmm-ux-designer
/bmad-agent-bmm-architect
/bmad-agent-bmm-pm
/bmad-agent-bmm-analyst
```

Key questions:
- "Buy Missing Cards" button: should it show a toast ("coming soon") or open a placeholder panel?
- Missing cards count badge in header: where does ownership data come from? (collection API? local state?)
- DeckStats multi-game: Pokemon energy distribution — is energy data in the card schema?
- Mobile: are touch controls currently hover-gated? (spec says always visible)
- Resizable panels on desktop: does any resizable primitive exist? (shadcn has `Resizable`)
- Format legality: which API endpoint provides format legality per deck?

Save brief to: `docs/plans/briefs/2026-02-23-route-deck-builder-brief.md`

**Step 2: Refactor DeckStats to multi-game (TDD)**

Write failing tests for multi-game DeckStats:

```tsx
describe('DeckStats', () => {
  it('renders mana curve for MTG deck', () => { ... })
  it('renders energy distribution for Pokemon deck', () => { ... })
  it('renders attribute breakdown for YGO deck', () => { ... })
  it('shows format legality badge', () => { ... })
  it('shows total price', () => { ... })
})
```

Modify `src/components/deck-builder/DeckStats.tsx` to support all 4 games. Remove hardcoded MTG-only logic.

**Step 3: Build `<DeckBuilderShell>` (TDD)**

The shell wraps existing components into the spec-compliant layout:
- Desktop: resizable split panel (search left, decklist right) using shadcn `<Resizable>`
- Mobile: tab navigation (Overview / Browse / Deck / Stats)
- Header: deck name, missing count badge ("12 missing · ~$45"), "Buy Missing Cards" button
- "Buy Missing Cards" → toast: "Cart optimizer coming soon — we'll notify you when it's ready"

Write failing tests first, then implement.

**Step 4: Touch controls audit**

Search for hover-gated controls in MobileDeckBuilder and DeckZone:

```bash
grep -n "hover\|onMouseEnter\|onMouseLeave" \
  src/components/deck-builder/MobileDeckBuilder.tsx \
  src/components/deck-builder/DeckZone.tsx
```

Any control that requires hover to discover must be made always-visible on mobile. Fix per brief.

**Step 5: Quality gate + commit**

```bash
npm run typecheck && npm run lint && npm test
git commit -m "feat(storefront): deck builder UX spec alignment — DeckBuilderShell, multi-game DeckStats, touch controls"
```

---

## Task 8: Route 8 — Listing Wizard (`/sell/list-card`)

**Files:**
- Read: `src/app/[locale]/(main)/sell/list-card/page.tsx`
- Read existing listing form components in `src/components/seller/`
- Create: `src/components/seller/ListingWizard.tsx`
- Create: `src/components/seller/__tests__/ListingWizard.test.tsx`
- Create: `src/components/tcg/MarketPriceDisplay.tsx`
- Create: `src/components/tcg/__tests__/MarketPriceDisplay.test.tsx`

**Step 1: BMAD elicitation session**

Invoke:
```
/bmad-agent-bmm-ux-designer
/bmad-agent-bmm-pm
/bmad-agent-bmm-analyst
```

Key questions:
- What does the current listing form look like? How many sections/fields?
- Is market price data available from customer-backend per card+condition?
- Photo upload: is MinIO/S3 wired? What's the upload endpoint?
- Does "Ships from" come from seller profile address?
- What is the actual completion time — is "under 60 seconds" realistic for new sellers?
- What does "listing live" mean — immediate or after review?

Save brief to: `docs/plans/briefs/2026-02-23-route-listing-wizard-brief.md`

**Step 2: Write failing tests for `<ListingWizard>`**

```tsx
describe('ListingWizard', () => {
  it('starts on step 1 (Identify Card)', () => { ... })
  it('shows step progress indicator', () => { ... })
  it('cannot advance to step 2 without card selected', () => { ... })
  it('advances to step 2 (Condition + Photos) after card selected', () => { ... })
  it('cannot advance to step 3 without condition selected', () => { ... })
  it('advances to step 3 (Price + Confirm) after condition selected', () => { ... })
  it('submits on step 3 confirm', () => { ... })
  it('shows success state after submission', () => { ... })
})
```

**Step 3: Implement `<ListingWizard>`**

3 steps with progress bar. Each step is a separate sub-component:
- `ListingWizardStep1`: card search (existing search input), printing selector
- `ListingWizardStep2`: `<ConditionSelector mode="seller">`, photo upload
- `ListingWizardStep3`: `<MarketPriceDisplay>`, price input with competitive indicator, shipping config, confirm

**Step 4: Write failing tests for `<MarketPriceDisplay>`**

```tsx
describe('MarketPriceDisplay', () => {
  it('shows market price range', () => { ... })
  it('shows recent sales', () => { ... })
  it('shows competitive indicator when price is within range', () => { ... })
  it('shows warning when price is significantly below market', () => { ... })
  it('shows loading skeleton when data is loading', () => { ... })
  it('shows first-listing state when no market data exists', () => { ... })
})
```

**Step 5: Implement `<MarketPriceDisplay>`**

Fetches from customer-backend market price endpoint per card ID + condition. Shows:
- Suggested price (pre-fills the listing price input)
- Range: "Low $14.50 · High $18.99"
- Recent sale: "Last sold $15.99 (2 days ago)"
- Competitive indicator: "Your price is competitive" / "Priced above market" / "Below market floor — are you sure?"

**Step 6: Wire into list-card page**

Replace existing form with `<ListingWizard>`.

**Step 7: Quality gate + commit**

```bash
npm run typecheck && npm run lint && npm test
git commit -m "feat(storefront): listing wizard UX spec alignment — 3-step wizard, MarketPriceDisplay"
```

---

## Tasks 9–20: Tier 3 & 4 Routes

Each of the following routes follows the same process as Tasks 1–8:
1. BMAD elicitation session → brief saved to `docs/plans/briefs/`
2. Audit current route implementation
3. TDD implementation per brief
4. Quality gate
5. Commit

The implementation details for each route are determined by the elicitation brief, not pre-specified here.

| Task | Route | Brief file | Agents |
|---|---|---|---|
| 9 | `/user/wishlist` | `2026-02-23-route-wishlist-brief.md` | UX Designer, PM |
| 10 | `/decks` — Browse Decks | `2026-02-23-route-decks-brief.md` | UX Designer, PM, Analyst |
| 11 | `/decks/[deckId]` — Deck View | `2026-02-23-route-deck-view-brief.md` | UX Designer, PM |
| 12 | `/sellers/[handle]` — Seller Profile | `2026-02-23-route-seller-profile-brief.md` | UX Designer, PM, Analyst |
| 13 | `/user/orders/[id]` — Order Detail | `2026-02-23-route-order-detail-brief.md` | UX Designer, Architect |
| 14 | `/cart` | `2026-02-23-route-cart-brief.md` | UX Designer, PM, Architect |
| 15 | `/checkout` | `2026-02-23-route-checkout-brief.md` | UX Designer, Architect |
| 16 | `/sell` — Seller Dashboard | `2026-02-23-route-seller-dashboard-brief.md` | UX Designer, PM |
| 17 | `/sell/reputation` | `2026-02-23-route-reputation-brief.md` | UX Designer, Analyst |
| 18 | `/community` | `2026-02-23-route-community-brief.md` | UX Designer, PM, Analyst |
| 19 | `/user/orders/[id]/return` | `2026-02-23-route-dispute-brief.md` | UX Designer, Architect |
| 20 | `/marketplace` | `2026-02-23-route-marketplace-brief.md` | UX Designer, PM |

---

## Global Quality Gate (after all 20 routes)

Run in `storefront/`:

```bash
# Zero browser dialogs
grep -rn "alert(\|confirm(\|window\.confirm\|prompt(" src/ \
  --include="*.tsx" --include="*.ts" | grep -v "//.*alert("
# Expected: 0 results

# Zero mock data in production paths
grep -rn "TODO\|FIXME\|hardcoded\|mock\|placeholder" src/ \
  --include="*.tsx" --include="*.ts" | grep -v "__tests__" | grep -v "//.*TODO"
# Expected: 0 results (or only in explicitly deferred components)

# Full quality gate
npm run lint && npm run typecheck && npm run build && npm run test:coverage
# Expected: 0 errors, >80% coverage on new components
```

---

## Summary

| Tier | Routes | New Components |
|---|---|---|
| 1 | Home, Register, Profile/Settings, Become a Seller | `<GamePicker>` |
| 2 | Card Detail, Search, Deck Builder, Listing Wizard | `<SellerRow>`, `<ConditionSelector>`, `<FacetedSearch>`, `<DeckBuilderShell>`, `<ListingWizard>`, `<MarketPriceDisplay>` |
| 3–4 | Routes 9–20 | Determined by elicitation briefs |
