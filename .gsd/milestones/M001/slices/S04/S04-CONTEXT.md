---
id: S04
milestone: M001
status: draft
---

# S04: Card Browse, Search & Detail UI

## Goal

Storefront renders card search with faceted filtering, card detail page with printings and market price, all from live backend data. M001 end-to-end smoke test passes.

## Why This Slice

This is the user-visible payoff of M001. It proves the full vertical slice: auth -> catalog -> search -> detail page. It also establishes the BFF aggregation pattern used by every subsequent storefront feature.

## Scope

### In Scope
- Card search page with Algolia integration (SearchBox, facets: game, set, rarity)
- Card grid/list views (card image, name, price)
- Card detail page: 3-column layout (image, printings table, market listings)
- BFF route: GET /api/cards/[id] - aggregates catalog data + backend listings
- CDN + MinIO fallback image loading pattern

### Out of Scope
- Add to cart / Quick Buy panel (M002)
- Add to deck / Add to collection (M003)
- Price history charts (M004)
- Seller trust badges (M004)

## Constraints

- BFF routes must use circuit-breaker pattern for external calls
- Card detail page must render in <= 2s on cold load
- All storefront tests must use Vitest + React Testing Library

## Integration Points

### Consumes
- Algolia index from S03 (card search)
- customer-backend catalog API from S03 (card detail data)
- Auth session from S02 (for personalized features)

### Produces
- /search page functional
- /cards/[id] page functional with live data
- BFF /api/cards/[id] route established as pattern
- storefront 90+ tests covering search and card detail components

## Open Questions

- Should card detail page show seller listings if no auth? (Yes - public data)
- What fallback renders if customer-backend is down? (Skeleton UI with error boundary)
