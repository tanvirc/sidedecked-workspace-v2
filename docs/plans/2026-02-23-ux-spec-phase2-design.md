# UX Spec Alignment — Phase 2 Design

**Date:** 2026-02-23
**Scope:** Storefront Phase 2 — Route-First with BMAD Elicitation
**Source:** `_bmad-output/planning-artifacts/ux-design-specification.md`
**Depends on:** Phase 1 complete (shadcn/ui, TCG components, alert elimination — merged PR #20)

---

## Objective

Align every storefront route with the UX design specification using a route-first approach. Each route goes through a BMAD elicitation session (UX Designer + PM + Architect + Analyst) before implementation begins, ensuring components reflect actual user needs and not just the written spec.

CartOptimizer is explicitly out of scope (backend API not yet available). The "Buy Missing Cards" button is built in DeckBuilderShell but routes to a placeholder.

---

## Process Per Route

For each route, in order:

1. **BMAD elicitation session** — UX Designer leads. PM prioritizes. Architect flags technical constraints. Analyst surfaces research gaps. Output: per-route brief with finalized component list, interaction decisions, and success criteria.
2. **Design alignment checkpoint** — brief reviewed against UX spec before any code is written.
3. **TDD implementation** — components built from the brief. Failing test → minimal code → pass → refactor. 80% coverage required.
4. **Route verification** — lint + typecheck + build + test all pass before moving to next route.

---

## Route Order

### Tier 1 — First Impressions, Identity & Seller Onboarding

| # | Route | Key Components | Elicitation Focus |
|---|---|---|---|
| 1 | `/` — Home | Hero, featured sets, trending decks, game picker | "Finally a place that gets TCG players" — card art as hero, real data not mocked community |
| 2 | `/user/register` + OAuth | OAuth buttons, game selector, onboarding flow | One-tap sign-up, game selection as first onboarding step, no email/password forms |
| 3 | `/settings/profile` + `/user/settings` | Profile form, game preferences, notification settings | Personalization: game context persists everywhere downstream |
| 4 | `/sell/upgrade` — Become a Seller | Upgrade wizard, requirements, earnings preview | Anxiety → guided confidence → relief. What it takes, what you earn, how trust is built |

### Tier 2 — Core Product Surfaces

| # | Route | Key Components | Elicitation Focus |
|---|---|---|---|
| 5 | `/cards/[id]` — Card Detail | `<SellerRow>`, `<ConditionSelector>` | Gravitational center. Buyer confidence: seller trust signals, condition guidance |
| 6 | `/cards` + `/search` | `<FacetedSearch>` (Algolia) | Progressive disclosure: casual search vs. power-user syntax. Real-time facet counts |
| 7 | `/decks/[deckId]/edit` — Deck Builder | `<DeckBuilderShell>`, `<DeckStats>` | The defining experience: mobile touch controls, missing cards badge, multi-game stats |
| 8 | `/sell/list-card` — Listing Wizard | `<ListingWizard>`, `<ConditionSelector>` (seller mode), `<MarketPriceDisplay>` | 3-step wizard not 8-section form. Market price pre-filled. "Under 60 seconds" |

### Tier 3 — Supporting Flows

| # | Route | Key Components | Elicitation Focus |
|---|---|---|---|
| 9 | `/user/wishlist` | Wishlist grid, price change indicators, notify toggle | "2 cards dropped since last visit" — price-aware, actionable |
| 10 | `/decks` — Browse Decks | Deck cards, trending section, format filter | Card Gallery + Social Feed. Missing card count for authenticated users |
| 11 | `/decks/[deckId]` — Deck View | Deck showcase, Clone CTA, community reactions | Public deck: visual thumbnail, card list, format legality, share affordance |
| 12 | `/sellers/[handle]` — Seller Profile | `<SellerTrust>`, listings grid, reviews | Specificity over badges: "99.2% · 412 sales · Ships from Toronto" |
| 13 | `/user/orders/[id]` — Order Detail | Escrow visualization timeline | StockX-style pipeline: Payment Secured → Seller Ships → Buyer Confirms |

### Tier 4 — Account, Commerce & Power User

| # | Route | Key Components | Elicitation Focus |
|---|---|---|---|
| 14 | `/cart` | Cart groups by seller, running total, shipping estimate | Per-seller grouping, all costs visible before checkout |
| 15 | `/checkout` | Step indicator, payment form, per-seller breakdown | 3 steps (Review → Pay → Done), no surprise costs |
| 16 | `/sell` — Seller Dashboard | Dense list view, "Ship Now" inline expansion | Command Center direction: dense tables, batch ops, actionable order queue |
| 17 | `/sell/reputation` | Reputation metrics, improvement paths | Actionable: not just a score — "here's how to improve each metric" |
| 18 | `/community` | Activity feed, deck shares, reactions | Real data only. No placeholder avatars or hardcoded activity |
| 19 | `/user/orders/[id]/return` | Dispute wizard, photo upload, timeline | Issue type → evidence → status timeline |
| 20 | `/marketplace` | Price-first grid, condition filters, seller trust inline | Marketplace Grid direction: buy intent, fast comparison |

---

## New Components Per Route

### Route 1 — Home (`/`)
- Hero section with full-bleed card art on Midnight Forge background, gold CTA
- `<GamePicker>` — game filter pill group (MTG / Pokemon / YGO / One Piece), persisted to user context
- Featured sets carousel — real data from customer-backend
- Trending decks section — real view/import counts, no hardcoded content
- "New arrivals" card grid — `<CardDisplay variant="gallery">`

### Route 2 — Registration + OAuth
- OAuth button group (Google / Discord / Apple) — one-tap, no email/password
- `<GamePicker>` onboarding step — multi-select, required before proceeding
- Collection import prompt — Moxfield / Archidekt / CSV / Skip
- Personalized welcome state

### Route 3 — Profile & Settings
- Game preferences (multi-select, editable post-onboarding)
- Notification preferences (price drops, wishlist alerts, deck updates)
- Saved address for shipping cost calculation
- Avatar + display name

### Route 4 — Become a Seller (`/sell/upgrade`)
- Requirements checklist with inline status
- Earnings preview with real commission rates
- Progress indicator: "Step X of Y"
- Trust-building content: what happens after upgrade, how reviews work

### Route 5 — Card Detail (`/cards/[id]`)
- **`<SellerRow>`** — single seller listing: name, "99.2% · 412 sales", condition, price, shipping estimate, "Add to Cart"
- **`<ConditionSelector>`** — buyer mode (multi-select filter): NM / LP / MP / HP / DMG with game-contextual defaults (MTG: NM+LP, Pokemon: NM)
- Replace existing `ListingCard` usage with `<SellerRow>` on card detail
- Seller list sorted by: price, then trust score

### Route 6 — Search & Browse (`/cards`, `/search`)
- **`<FacetedSearch>`** — Algolia-powered: simple search box → smart suggestions → advanced toggle
- Real-time facet counts: Game · Set · Rarity · Condition · Price range
- Progressive disclosure: "charizard" works instantly, advanced syntax available but not required
- View mode toggle: gallery / grid / list (persisted to user preference)

### Route 7 — Deck Builder (`/decks/[deckId]/edit`)
- **`<DeckBuilderShell>`** — spec-compliant split panel: search left, decklist right (desktop); tab navigation (mobile)
- **`<DeckStats>`** — multi-game: mana curve (MTG), energy distribution (Pokemon), attribute breakdown (YGO), card type counts, format legality, total price
- "Buy Missing Cards" badge in header — shows missing count + price estimate — routes to placeholder until CartOptimizer backend is ready
- Touch controls always visible on mobile (not hover-gated)
- `owned` state on `<CardDisplay>` — green border glow for cards in user's collection

### Route 8 — Listing Wizard (`/sell/list-card`)
- **`<ListingWizard>`** — 3-step: Identify → Condition + Photos → Price + Confirm
- **`<ConditionSelector>`** — seller mode (single select): condition with photo examples inline
- **`<MarketPriceDisplay>`** — market price pre-filled, range shown, recent sales, competitive indicator
- Progress bar across all 3 steps
- "~5 minutes to complete" time estimate at start

### Routes 9–20
Components identified during elicitation sessions per route — not pre-specified here to preserve elicitation integrity.

---

## Deferred to Phase 3

- `<CartOptimizer>` — backend API not ready
- `<HolographicCard>` — growth design
- `<ActivityFeedItem>` + social graph — community phase
- Price history charts — requires pricing history table + daily rollups
- OG image generation — server-side rendering pipeline

---

## Technical Constraints

- No new backend dependencies for Tier 1–2 routes — all data comes from existing customer-backend + MedusaJS APIs
- Algolia already integrated — `<FacetedSearch>` wraps existing integration
- `react-dnd` stays for deck builder — shadcn has no DnD equivalent
- CartOptimizer button exists but is non-functional — no fake loading or fabricated results

---

## Success Criteria

Each route is done when:
- [ ] BMAD elicitation brief written and signed off
- [ ] All new components have unit tests (>80% coverage)
- [ ] Zero `alert()` / `confirm()` / hover-gated interactions
- [ ] Zero mock/hardcoded data in production paths
- [ ] `npm run lint && npm run typecheck && npm run build && npm test` all pass
- [ ] Visual QA: dark mode + light mode both correct
- [ ] Mobile: all interactions work without hover (44px min touch targets)
