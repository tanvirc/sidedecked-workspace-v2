# T02: Audit and test CardDetailPage structure

**Slice:** S02
**Status:** not-started
**Estimate:** 2h

## Goal

Verify the BFF degradation banner, 4-tab mobile layout, and print selector on CardDetailPage — the gravitational center where every user journey converges.

## Files to Touch

- `storefront/src/components/cards/CardDetailPage.test.tsx` (extend)
- `storefront/src/components/cards/CardDetailPage.tsx` (audit)

## What to Do

Read `docs/plans/wireframes/storefront-card-detail.html`. Confirm tests cover: card image renders with alt text, game attributes section renders, `MarketplaceListingsSection` renders with listings prop, degradation banner shows when `listingsUnavailable: true` (via `MarketplaceListingsSection`), print selector (`CompactPrintSelector`) renders, `RelatedCards` renders, desktop sections visible, mobile 4-tab nav present. Fix any light-mode class leaks in `CardDetailPage.tsx`. If `CardDetailSkeleton` is used in the loading state, verify it exists or create it (see S01 follow-up).

## Verification Criteria

`npx vitest run --reporter=verbose src/components/cards/CardDetailPage.test.tsx` — all pass.

## Done When

Detail page tests cover image, attributes, listings section, degradation, print selector; zero light-mode leaks.
