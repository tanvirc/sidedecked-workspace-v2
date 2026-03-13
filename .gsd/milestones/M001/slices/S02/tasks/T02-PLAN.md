---
estimated_steps: 6
estimated_files: 7
---

# T02: Card grid cells, pagination, trending strip, seller CTA, and mobile browse

**Slice:** S02 — Card Browse, Detail & Search — Pixel Perfect
**Milestone:** M001

## Description

The wireframe card grid cells include condition badge, seller info, and an "Add to Cart" button — richer than the current `AlgoliaCardHit` which only shows game badge, name, set, and price. The wireframe also specifies numbered pagination (not infinite scroll), a trending cards strip with price movement indicators, and a seller CTA gradient banner at the bottom. This task delivers the grid cell polish, the pagination switch, the below-grid sections, and the mobile browse layout.

## Steps

1. **Extract and restyle `AlgoliaCardHit`** — Move from inline in AlgoliaSearchResults to `storefront/src/components/cards/AlgoliaCardHit.tsx`. Update styling to match wireframe card cell: game indicator dot+text overlay on image (top-left, pill bg), card name (font-heading 14px semibold), set name (12px secondary), condition badge (colored pill: NM green, LP yellow, MP orange, HP red — using `getConditionChipClasses`), price (mono 16px brand-primary), seller name + stars row (11px tertiary), "Add to Cart" button (32px height, surface-2 bg, border). Use Algolia hit `condition` field if available; gracefully omit if not in index. Card item gets `border-radius: 14px`, surface-1 bg, 12px padding matching wireframe `.card-item`.

2. **Switch from infinite scroll to numbered pagination** — Replace `useInfiniteHits` with `useHits` + `usePagination` from react-instantsearch in `CardSearchGrid`. Update `createCardsStateMapping` to include `page` parameter in URL state. Style existing `Pagination.tsx` component to match wireframe: prev/next arrows, numbered page buttons (34×34px, brand-primary active state), ellipsis dots, "Showing X-Y of Z results" text above pagination. Pagination renders below the card grid inside the grid area.

3. **Update `CardGridSkeleton`** — Match wireframe skeleton pattern: dashed border-strong border, skeleton-pulse animation (linear gradient sweep on surface-2/surface-3), image placeholder (5:7 aspect), 3 text lines (full, 80%, 60% width). Animation uses `1.8s ease-in-out infinite`.

4. **Create `TrendingStrip` component** — Horizontal scroll of trending cards with price movement indicators. Section label "TRENDING NOW" in uppercase tertiary 11px tracking-wide. Each card: 180px wide, 5:7 image, name (heading 13px), set (12px tertiary), price (mono 14px positive-green) + movement badge (up/down with colored bg). For MVP, render with placeholder/mock data — S04 will wire to live pricing API. Component accepts `cards` prop so it can be wired later.

5. **Create `SellerCTA` component** — Full-width gradient banner matching wireframe: `linear-gradient(135deg, brand-primary, brand-secondary)`, rounded-[20px], 56px top/bottom padding. Title in font-display 44px white. Subtitle 16px white/85%. White CTA button (15px heading font, 14px padding, 12px radius). Radial-gradient decorative circle at top-right. Links to `/sell`.

6. **Implement mobile browse layout** — Mobile game selector as horizontal scroll of pill buttons (12px heading text, dot + game name, active state with brand-primary border). Mobile category pills (12px, horizontal scroll). Mobile filter chips bar (horizontal scroll, "Sort" and "Filters" chips). Mobile results bar (count + sort). Mobile card grid: 2-col, 10px gap, 12px horizontal padding. Mobile card cells: smaller padding (8px), smaller text (12px name, 14px price). Mobile load-more button (full width, surface-2 bg, heading 14px semibold). Responsive breakpoints: 4-col → 3-col @ 1024px → 2-col @ 640px.

## Must-Haves

- [ ] Card grid cells match wireframe layout (game indicator, name, set, condition badge, price, seller info, add-to-cart button)
- [ ] Numbered pagination with page numbers, prev/next arrows, active state — URL updates with ?page=N
- [ ] `useInfiniteHits` replaced with `useHits` + `usePagination` in the shared grid component
- [ ] URL state mapping includes `page` parameter without breaking existing routing
- [ ] CardGridSkeleton matches wireframe pulse animation pattern
- [ ] TrendingStrip renders with placeholder data, accepts cards prop for future wiring
- [ ] SellerCTA gradient banner matches wireframe
- [ ] Mobile browse: 2-col grid, game pills, filter chips, load-more button
- [ ] Empty state matches wireframe (icon, title, message, suggestion, clear button)

## Verification

- `npx vitest run` — 678+ tests pass, no regressions
- Browse page at 1440px shows numbered pagination below 4-col card grid
- Browse page URL updates with `?page=2` when clicking page 2
- TrendingStrip and SellerCTA render below pagination area
- Mobile at 390px shows 2-col grid with game pill selector and filter chips

## Inputs

- `storefront/src/components/search/CardSearchGrid.tsx` — shared grid from T01
- `storefront/src/components/cards/Pagination.tsx` — existing pagination component (154 lines) to restyle
- `storefront/src/components/search/AlgoliaSearchResults.tsx` — refactored in T01
- `storefront/src/lib/utils/conditionColors.ts` — `getConditionChipClasses` for condition badge colors
- `docs/plans/wireframes/storefront-cards.html` — wireframe card cells, pagination, trending, CTA, mobile layout

## Expected Output

- `storefront/src/components/cards/AlgoliaCardHit.tsx` — extracted and restyled card grid cell
- `storefront/src/components/cards/Pagination.tsx` — restyled with wireframe pagination pattern
- `storefront/src/components/cards/TrendingStrip.tsx` — new trending cards horizontal scroll
- `storefront/src/components/cards/SellerCTA.tsx` — new gradient CTA banner
- `storefront/src/components/cards/CardGridSkeleton.tsx` — updated skeleton animation
- `storefront/src/components/search/CardSearchGrid.tsx` — updated with pagination replacing infinite scroll
- `storefront/src/components/cards/CardBrowsingPage.tsx` — updated with TrendingStrip and SellerCTA sections
