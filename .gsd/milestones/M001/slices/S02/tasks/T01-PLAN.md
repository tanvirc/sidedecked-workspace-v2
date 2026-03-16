# T01: Audit and test CardBrowsingPage structure

**Slice:** S02
**Status:** not-started
**Estimate:** 2h

## Goal

Lock the primary card discovery surface against the wireframe. CardBrowsingPage component structure must be verified and tested before S03 adds homepage complexity.

## Files to Touch

- `storefront/src/components/cards/__tests__/CardBrowsingPage.test.tsx` (extend)
- `storefront/src/components/cards/CardBrowsingPage.tsx` (read-only audit)

## What to Do

Read `docs/plans/wireframes/storefront-cards.html` and compare against `CardBrowsingPage.tsx`. Verify tests cover: GameSelectorStrip renders with game options, CategoryPills renders, PopularSetsCarousel renders, BrowseBreadcrumbs renders "Cards" breadcrumb, ResultsBar renders with hit count, TrendingStrip renders (placeholder or live), SellerCTA renders, pagination renders, Algolia `InstantSearchNext` wraps the page. Check for light-mode class leaks and fix any found. Add missing tests.

## Verification Criteria

`npx vitest run --reporter=verbose src/components/cards/__tests__/CardBrowsingPage.test.tsx` — all pass.

## Done When

Browse page tests cover all wireframe sections, zero light-mode class leaks.
