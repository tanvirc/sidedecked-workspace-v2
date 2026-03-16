# S04: Card Browse, Search & Detail UI - UAT

**Milestone:** M001
**Written:** 2026-03-17

## UAT Type

- UAT mode: human-experience
- Why this mode is sufficient: Layout correctness, image loading, and search UX require human visual verification at target viewport sizes.

## Preconditions

- S01 (databases), S02 (auth), S03 (ETL + Algolia) all complete
- Storefront running: `cd storefront && npm run dev`
- At least 1000 MTG cards in Algolia index

## Smoke Test

1. Navigate to http://localhost:3000/search
2. Type "Black Lotus"
3. **Expected:** Card results appear within 500ms
4. Click a card result
5. **Expected:** Card detail page loads with image, text, and price

## Test Cases

### 1. Search page at 1440px (desktop)
1. Set viewport to 1440px wide; navigate to /search
2. **Expected:** Search box centered, facet sidebar on left, card grid fills remaining space (3-4 columns)

### 2. Search page at 390px (mobile)
1. Set viewport to 390px wide; navigate to /search
2. **Expected:** Search box full-width, facets collapse to filter sheet, card grid 2 columns

### 3. Card detail at 1440px
1. Click any card from search results
2. **Expected:** 3-column layout: image left, details center, listings right

### 4. Card detail at 390px
1. Same card, viewport 390px
2. **Expected:** Stacked layout; image top, details below, listings in scrollable section

### 5. Image fallback
1. Block CDN URL in browser DevTools network; reload card detail page
2. **Expected:** Image loads from MinIO fallback URL, no broken icon

### 6. Facet filtering
1. On /search, select "Pokemon" game facet
2. **Expected:** Results update to show only Pokemon cards; URL updates

### 7. Empty search
1. Navigate to /search with empty query
2. **Expected:** Default card discovery grid shows; no error

### 8. No results
1. Search "xyznonexistentcard123"
2. **Expected:** Empty state with suggestions, not a crash

## Failure Signals

- Broken image icons in card grid
- Search returns 0 results for "Lightning Bolt" with MTG selected
- Card detail page shows error boundary instead of content
- Layout broken at mobile viewport

## Requirements Proved By This UAT

- R001 - multi-game card catalog browsable in storefront
- R004 - faceted card search functional
- R005 - card detail page with printings and market price functional

## Not Proven By This UAT

- Purchase flow (M002)
- Deck builder (M003)
- Price history charts (M004)

## Notes for Tester

- Test at exactly 1440px and 390px
- Use Chrome DevTools Network throttling (Slow 3G) to verify skeleton loading
- Verify Lighthouse Performance score >= 75 on /cards/[id]
