# S02: Card Browse, Detail & Search — Pixel Perfect — UAT

**Milestone:** M001
**Written:** 2026-03-13

## UAT Type

- UAT mode: mixed (artifact-driven tests + human visual comparison)
- Why this mode is sufficient: Structural correctness is proven by 719 passing tests. Visual fidelity against wireframes requires human comparison at 1440px and 390px breakpoints — no automated visual diff tooling is configured.

## Preconditions

- Storefront dev server running (`cd storefront && npm run dev`) on localhost:8000
- Algolia credentials configured (search index populated with card data)
- Wireframe files available for reference:
  - `docs/plans/wireframes/storefront-cards.html` (browse page)
  - `docs/plans/wireframes/storefront-card-detail.html` (detail page)
  - `docs/plans/wireframes/storefront-search.html` (search page)

## Smoke Test

Navigate to `/cards` — the browse page should render with a game selector strip at the top (All Games + 4 TCGs), category pills, a popular sets carousel, a results bar with view toggle/sort, a 4-column card grid with sidebar filters, and numbered pagination below the grid. TrendingStrip and SellerCTA banner should appear below the grid area.

## Test Cases

### 1. Browse page wireframe alignment — desktop (1440px)

1. Open `/cards` at 1440px viewport width
2. Compare against `storefront-cards.html` wireframe
3. **Expected:**
   - GameSelectorStrip renders 5 items (All Games, Magic, Pokémon, Yu-Gi-Oh!, One Piece) in a horizontal grid with gradient backgrounds
   - Active game has colored border and glow shadow
   - CategoryPills render horizontally below game strip
   - PopularSetsCarousel shows game-relevant set cards (changes when game selection changes)
   - BrowseBreadcrumbs show "Home > Browse Cards"
   - ResultsBar shows filter chips, results count, view toggle (grid/list), and sort dropdown
   - Sidebar filters panel is 280px wide on the left
   - Card grid is 4 columns with cards showing: game indicator dot, card image, name, set, condition badge, price (mono font), seller + stars, add-to-cart button
   - Numbered pagination below grid (prev/next arrows, page numbers, "Showing X–Y of Z")
   - TrendingStrip horizontal scroll below pagination
   - SellerCTA gradient banner at bottom

### 2. Browse page wireframe alignment — mobile (390px)

1. Open `/cards` at 390px viewport width
2. Compare against mobile frame in `storefront-cards.html` wireframe
3. **Expected:**
   - GameSelectorStrip renders as horizontal scrollable pills
   - Card grid is 2 columns with 10px gap
   - Sidebar filters collapse (accessible via filter sheet/button)
   - Pagination renders correctly at narrow width
   - TrendingStrip and SellerCTA render full-width

### 3. Game selector interaction

1. On `/cards`, click "Magic: The Gathering" in the game strip
2. **Expected:**
   - Magic becomes visually active (colored border, glow)
   - Card grid filters to show only Magic cards
   - PopularSetsCarousel updates to show Magic sets
   - URL does not change game param (cookie-based, not URL-based)
   - Click "All Games" to clear — all cards show, carousel resets

### 4. Pagination URL state

1. On `/cards`, click page 2 in pagination
2. **Expected:** URL updates to `?page=2`, grid shows next page of results
3. Refresh the page
4. **Expected:** Page 2 results persist (URL state round-trips correctly)
5. Click page 1
6. **Expected:** `?page=` param removed from URL (page 1 is default)

### 5. Card detail page wireframe alignment — desktop (1440px)

1. Click any card to navigate to `/cards/[id]`
2. Compare against `storefront-card-detail.html` wireframe
3. **Expected:**
   - 3-column layout: card image (left), game stats + price insights (center), buy panel (right)
   - GameStatsDisplay, PriceInsightsSection, CompactPrintingsTable have glass-card backgrounds (`rgba(33,32,58,0.6)` with `backdrop-filter: blur(8px)`)
   - Card title uses display font at 32px
   - Section titles use heading font at 14px uppercase with 0.06em letter-spacing
   - Print selector thumbnails are 48×67px with active state border
   - "You Might Also Like" related cards section below the 3-column layout (shows same-set link if no related cards data)

### 6. Card detail page — mobile (390px)

1. Open a card detail page at 390px viewport
2. **Expected:**
   - 4 tabs visible: Details, Prices, Sellers, Printings
   - Tapping each tab shows the corresponding content
   - Sellers tab shows QuickBuyPanel + seller list (desktop right column content)
   - Sticky bottom buy bar with backdrop-blur, price, and add-to-cart button

### 7. Search page wireframe alignment — desktop (1440px)

1. Navigate to `/search?q=bolt`
2. Compare against `storefront-search.html` wireframe
3. **Expected:**
   - Breadcrumbs show "Home > Search Results > 'bolt'"
   - Results header shows hit count: "X results for 'bolt'"
   - Same sidebar + card grid layout as browse page
   - Sort control and filter chips present in results header

### 8. Search page with empty query

1. Navigate to `/search` (no query)
2. **Expected:**
   - Breadcrumbs show "Home > Search Results" (no query crumb)
   - Results header shows "Search SideDecked" or similar generic text
   - Grid shows all cards (unfiltered)

## Edge Cases

### Empty results state

1. On `/cards`, apply filters that match zero cards (e.g., an impossible combination)
2. **Expected:** Empty state component renders with actionable message, not a blank grid

### Skeleton loading state

1. Throttle network in DevTools, navigate to `/cards`
2. **Expected:** Card grid skeleton with dashed borders and shimmer animation renders while Algolia loads

### Category pills interaction

1. Click category pills on browse page
2. **Expected:** Active pill gets purple background+border. Note: pills don't filter results yet (visual-only in MVP)

## Failure Signals

- Game strip missing or showing fewer/more than 5 items
- Card grid showing infinite scroll instead of numbered pagination
- Missing glass-card blur on card detail info sections
- Mobile card detail showing 1-2 tabs instead of 4 (Details/Prices/Sellers/Printings)
- Search breadcrumbs missing query text
- Pagination not reflecting in URL
- TrendingStrip or SellerCTA missing below the card grid
- Sidebar not rendering at 280px width on desktop
- Card cells missing game indicator dot, condition badge, or add-to-cart button

## Requirements Proved By This UAT

- R002 (Card browse page pixel-perfect) — visual comparison against `storefront-cards.html` wireframe at 1440px and 390px
- R003 (Card detail page pixel-perfect) — visual comparison against `storefront-card-detail.html` wireframe at 1440px and 390px
- R004 (Search page pixel-perfect) — visual comparison against `storefront-search.html` wireframe at 1440px and 390px

## Not Proven By This UAT

- Live data wiring — TrendingStrip uses placeholder data (S04 scope)
- Add-to-cart flow — buttons render but cart integration is S09 scope
- RelatedCards with real data — component renders fallback (same-set link) until server data source is wired
- CategoryPills actual filtering — visual-only in MVP, backend facets needed
- Condition badge accuracy — depends on Algolia index having `condition` field

## Notes for Tester

- TrendingStrip shows placeholder data with fake prices — this is intentional. S04 will wire live data.
- CategoryPills change visual state when clicked but don't filter the grid — expected behavior for MVP.
- The "Add to Cart" button on card cells renders but doesn't function yet — cart flow is S09.
- If Algolia is not configured, pages will show loading/error state rather than card data.
- Pre-existing `_document` PageNotFoundError in Next.js build output is unrelated to S02 changes.
