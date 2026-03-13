---
id: T01
parent: S03
milestone: M001
provides:
  - DeckBrowserHero with radial gradient bg, display headline, glassmorphic search bar, Ctrl+K hint
  - FeaturedDecksCarousel with 3 placeholder featured deck cards showing card-fan art, game badges, author, stats, social
  - DeckGameTabs with 5 game tabs (All/MTG/Pokémon/Yu-Gi-Oh!/One Piece) with game-colored active states
  - DeckBrowsingPage rewritten with wireframe section order (hero → featured → game tabs + filters → grid → pagination → stats banner)
  - Community stats banner with placeholder data (4-col grid with mono numbers)
  - Inline pagination with numbered page buttons and prev/next
key_files:
  - storefront/src/components/decks/DeckBrowserHero.tsx
  - storefront/src/components/decks/FeaturedDecksCarousel.tsx
  - storefront/src/components/decks/DeckGameTabs.tsx
  - storefront/src/components/decks/DeckBrowsingPage.tsx
key_decisions:
  - DeckGameTabs replaces DeckFilters game checkboxes for game selection — tabs match wireframe's underlined tab pattern with game-specific colors
  - FeaturedDecksCarousel uses FEATURED_DECKS_PLACEHOLDER data — no "featured" API endpoint exists
  - Community stats banner uses hardcoded placeholder numbers — no API for aggregate stats
  - Grid limit changed from 20 to 18 (3-col × 6 rows matches wireframe)
patterns_established:
  - Game-colored tab pattern with border-bottom active indicator (different from GameSelectorStrip grid pattern in S02)
  - Featured card with card-fan art (3 fanned gradient rectangles) — reusable pattern for deck viewer header
  - FEATURED_DECKS_PLACEHOLDER export for reuse
observability_surfaces:
  - data-testid on hero, featured carousel, game tabs, filter section, grid section, community stats banner, pagination
  - Game tab active state via inline style color matching game CSS variable
duration: 45min
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T01: Deck browser hero, featured carousel, game tabs, and page restructure

**DeckBrowsingPage restructured from flat filters+grid layout to full wireframe layout with hero, featured carousel, game tabs, inline pagination, and community stats banner. 733 tests pass (14 new).**

## What Happened

Created 3 new components and rewrote DeckBrowsingPage:

- **DeckBrowserHero**: Radial gradient background with display-font headline ("Deck Discovery"), subtext, and glassmorphic search bar with `Ctrl K` keyboard hint. Mobile-responsive with smaller font sizes.

- **FeaturedDecksCarousel**: Horizontal scroll of 480px featured deck cards (300px on mobile). Each card has game-gradient top section with card-fan art (3 fanned gradient rectangles), Featured badge, game badge, deck name (heading 20px), format chip, author row with avatar + verified checkmark, stats (card count · achievement · price), and social counts (likes/copies/views). Uses `FEATURED_DECKS_PLACEHOLDER` data with 3 decks (MTG/Pokémon/Yu-Gi-Oh!). Carousel arrows on desktop, hidden on mobile.

- **DeckGameTabs**: 5 tabs (All, MTG, Pokémon, Yu-Gi-Oh!, One Piece) with game-colored active border-bottom and text color. Replaces the old DeckFilters game checkbox approach. Horizontal scroll on mobile.

Rewrote `DeckBrowsingPage` to compose sections in wireframe order: DeckBrowserHero → FeaturedDecksCarousel → filter section (DeckGameTabs + filter row + create button) → deck grid → pagination → community stats banner. Kept all existing data fetching logic. Game tab changes update filters via `activeGameTab` state that drives `setFilters`. Grid page limit changed to 18 (3-col × 6 rows).

Inline pagination renders numbered page buttons with `var(--brand-primary)` active state, prev/next buttons, up to 7 page numbers visible.

Community stats banner: 4-col grid showing placeholder numbers (12,847 Decks Built / 3,421 Active Brewers / 847K Cards Indexed / 4 Games Supported) in mono font.

## Verification

- `npx vitest run src/components/decks/__tests__/DeckBrowsingPage.test.tsx` — 9 tests pass
- `npx vitest run src/components/decks/__tests__/DeckGameTabs.test.tsx` — 5 tests pass
- `npx vitest run` — 733 tests pass (72 files, zero regressions)
- `npm run build` — production build succeeds
- `npx tsc --noEmit` — zero TypeScript errors

## Deviations

- Removed old header section (h1 "Deck Browser" + feature pills + search bar + view toggle) — replaced entirely by hero + featured carousel + game tabs. These elements don't appear in the wireframe.
- Pagination built inline in DeckBrowsingPage rather than as separate DeckPagination component — the T02 plan will decide whether to extract or keep inline.
- DeckSearchControls kept in the filter row for sort — wireframe shows a "Most Popular" dropdown in that position.

## Files Created/Modified

- `storefront/src/components/decks/DeckBrowserHero.tsx` — hero section with gradient, headline, search bar
- `storefront/src/components/decks/FeaturedDecksCarousel.tsx` — featured deck carousel with card-fan cards
- `storefront/src/components/decks/DeckGameTabs.tsx` — 5-tab game selector with game-colored active states
- `storefront/src/components/decks/DeckBrowsingPage.tsx` — rewritten with full wireframe layout
- `storefront/src/components/decks/__tests__/DeckBrowsingPage.test.tsx` — 9 tests for page structure
- `storefront/src/components/decks/__tests__/DeckGameTabs.test.tsx` — 5 tests for game tabs
