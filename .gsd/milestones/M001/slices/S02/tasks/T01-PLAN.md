---
estimated_steps: 7
estimated_files: 8
---

# T01: Restructure browse page with wireframe layout and shared components

**Slice:** S02 — Card Browse, Detail & Search — Pixel Perfect
**Milestone:** M001

## Description

The browse page (`CardBrowsingPage`) is a 33-line wrapper that delegates everything to `AlgoliaSearchResults`. The wireframe expects a rich, structured page with multiple sections stacked vertically: breadcrumbs → game selector strip → category pills → popular sets carousel → results bar → sidebar+grid layout. This task creates the new page structure and the sub-components that sit above the search results area.

The `AlgoliaSearchResults` component currently owns the full search experience (search bar, filter chips, sort, sidebar, grid). This task refactors it so that the browse page can compose its own layout around a shared `CardSearchGrid` that provides sidebar+grid without the inline search bar. The search page (T04) will also consume this shared piece.

## Steps

1. **Create `GameSelectorStrip` component** — 5-item horizontal grid (All Games + MTG + Pokémon + Yu-Gi-Oh! + One Piece). Reuse GAMES data from `GameSelectorGrid`. Each item shows gradient bg, overlay, game name, listing count. Active state has game-colored border + glow. Clicking updates the Algolia `game` facet refinement and sets the `sd_game_pref` cookie. Active state reflects both URL param and cookie. Renders as scrollable pill row on mobile.

2. **Create `CategoryPills` component** — Horizontal scroll of category quick-link pills ("All", "New Releases", "Trending", "Under $5", "Staples", "Format Legal", "Foils & Special"). Active pill has purple bg+border. These are filter shortcuts that map to Algolia refinements or numeric ranges. For MVP, clicking filters or navigates — exact behavior depends on available Algolia facets.

3. **Create `PopularSetsCarousel` component** — Horizontal scroll of set cards. Label says "Popular Sets (Game)" where Game changes with GameSelectorStrip. Each set card shows set code icon, set name, card count. Receives game code prop and renders appropriate sets. Data source: hardcoded popular sets per game for MVP (wireframe shows static set data). Cards are 200px wide, surface-1 bg, border, hover translateY.

4. **Create `BrowseBreadcrumbs` component** — Simple breadcrumb bar: `Home > Browse Cards`. Styled per wireframe: 12px text, tertiary color, surface-1 bg, bottom border. Reusable pattern — search page will use a variant.

5. **Create `ResultsBar` component** — Flex row: left side has active filter chips + results count, right side has view toggle (grid/list) + sort dropdown. View toggle: two buttons in a segmented control, active button gets brand-primary bg. Sort dropdown reuses existing `SortControl` logic. Results count uses `useStats` for hit count. This replaces the inline chips+sort row from AlgoliaSearchResults.

6. **Refactor `AlgoliaSearchResults` into composable pieces** — Extract the sidebar+grid layout into a shared `CardSearchGrid` component that can be rendered inside either the browse page or search page. `CardSearchGrid` contains: `SearchFilters` sidebar (280px, left), card hit grid (flex-1, right), skeleton/empty states, and load-more/pagination. The `AlgoliaSearchResults` wrapper remains as the `InstantSearchNext` + `Configure` provider. Browse page and search page each compose their own chrome around `CardSearchGrid`.

7. **Rewrite `CardBrowsingPage`** — Compose the full page: nav (inherited), BrowseBreadcrumbs, GameSelectorStrip, CategoryPills, PopularSetsCarousel, ResultsBar, CardSearchGrid (sidebar+grid), remainder sections (trending, CTA — placeholder divs for T02). Wrap in `InstantSearchNext` with routing. Mobile layout: game pills as horizontal scroll, categories hidden or collapsed, no popular sets carousel, filter chips as horizontal scroll bar.

## Must-Haves

- [ ] GameSelectorStrip renders 5 items with correct gradients matching wireframe
- [ ] Clicking a game in GameSelectorStrip updates Algolia game facet and sd_game_pref cookie
- [ ] Active game has colored border + glow shadow matching wireframe's `.active--{game}` pattern
- [ ] CategoryPills horizontal scroll with active state
- [ ] PopularSetsCarousel renders game-specific sets, updates when game changes
- [ ] BrowseBreadcrumbs shows Home > Browse Cards with wireframe styling
- [ ] ResultsBar shows filter chips, results count, view toggle, and sort dropdown
- [ ] Browse page section order matches wireframe: breadcrumbs → game strip → categories → popular sets → results bar → sidebar+grid
- [ ] Sidebar is 280px with surface-1 bg and right border, grid area is flex-1
- [ ] All Voltage tokens used via inline styles or existing Tailwind utilities — no hardcoded hex colors

## Verification

- `npx vitest run src/components/cards/__tests__/CardBrowsingPage.test.tsx` — updated tests pass
- `npx vitest run` — no regressions across full suite
- `npm run build` — build succeeds
- Visual: browse page at 1440px renders game strip, breadcrumbs, category pills, popular sets above the sidebar+grid area

## Inputs

- `storefront/src/components/cards/CardBrowsingPage.tsx` — current 33-line wrapper to be rewritten
- `storefront/src/components/search/AlgoliaSearchResults.tsx` — current monolithic search component to be refactored
- `storefront/src/components/homepage/GameSelectorGrid.tsx` — GAMES data to reuse for GameSelectorStrip
- `docs/plans/wireframes/storefront-cards.html` — authoritative visual target
- S01 summary — Voltage tokens, inline style pattern for CSS custom properties

## Expected Output

- `storefront/src/components/cards/GameSelectorStrip.tsx` — new component with game data, cookie sync, Algolia facet sync
- `storefront/src/components/cards/CategoryPills.tsx` — new horizontal scroll pill component
- `storefront/src/components/cards/PopularSetsCarousel.tsx` — new set carousel with per-game data
- `storefront/src/components/cards/BrowseBreadcrumbs.tsx` — new breadcrumb component
- `storefront/src/components/cards/ResultsBar.tsx` — new results bar with view toggle + sort
- `storefront/src/components/search/CardSearchGrid.tsx` — extracted shared sidebar+grid layout
- `storefront/src/components/cards/CardBrowsingPage.tsx` — rewritten with full wireframe structure
- `storefront/src/components/search/AlgoliaSearchResults.tsx` — refactored to use CardSearchGrid
