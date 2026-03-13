---
estimated_steps: 5
estimated_files: 5
---

# T05: Align misc pages and run final Voltage compliance sweep

**Slice:** S07 — Remaining Pages — Visual Alignment
**Milestone:** M001

## Description

Rebuild the community page to match the wireframe "Coming Soon" hero + feature preview grid. Spot-check remaining misc pages (info, categories, collections, products, seller-storefront, reset-password) for Voltage compliance. Then run a final comprehensive sweep across ALL S07-scoped components confirming zero bare light-mode Tailwind color classes, all tests pass, and build succeeds.

## Steps

1. Read wireframe `storefront-community.html` to understand the "Coming Soon" layout — hero section with headline/subtext, email signup form, feature preview grid with emoji icons.
2. Rebuild `community/page.tsx` to match the wireframe structure. Current page (201 lines) has 6 feature cards, stats, and email signup with different layout. Rewrite to wireframe's "Coming Soon" hero + feature grid. Use Voltage tokens throughout. Keep it presentational — no backend wiring needed.
3. Spot-check `InfoPage.tsx` (already uses `bg-surface-1`, `text-brand-primary` — likely clean), `reset-password/page.tsx` (19 lines, minimal chrome), and category/collection/product/seller-storefront pages. These mostly consume components already aligned in S02 (Algolia, ProductListing). Fix any stray light-mode refs found.
4. Run comprehensive grep across ALL S07-scoped files — every component directory and page file listed in the research's Page-to-Wireframe Mapping. Fix any remaining violations found.
5. Run full test suite (`npx vitest run`) and verify build (`npx next build`) to confirm no regressions. Commit all storefront changes to `gsd/M001/S07` branch per D023.

## Must-Haves

- [ ] Community page rebuilt to match wireframe "Coming Soon" hero + feature preview grid
- [ ] InfoPage, reset-password, and other misc pages checked for Voltage compliance
- [ ] Final grep across ALL S07-scoped components returns zero bare light-mode Tailwind color classes
- [ ] All 794+ existing tests pass
- [ ] Build succeeds
- [ ] All storefront changes committed to `gsd/M001/S07` branch

## Verification

- `npx vitest run` — all 794+ tests pass
- `cd storefront && npx next build` — build succeeds
- Comprehensive grep across all S07 scope returns zero light-mode violations:
  ```
  grep -rn "bg-white\|text-gray-[0-9]\|bg-gray-[0-9]\|border-gray-[0-9]\|bg-blue-[0-9]\|text-blue-[0-9]\|bg-green-[0-9]\|text-green-[0-9]\|bg-red-[0-9]\|text-red-[0-9]\|bg-yellow-[0-9]\|text-yellow-[0-9]" \
    src/components/seller/ \
    src/components/sections/Cart/ \
    src/components/sections/OrderConfirmedSection/ \
    src/components/pricing/EnhancedPriceAlerts.tsx \
    src/components/sections/OrderReturnSection/ReturnItemsTab.tsx \
    src/app/[locale]/(main)/community/page.tsx \
    src/app/[locale]/(main)/user/verify-email/page.tsx
  ```

## Inputs

- `docs/plans/wireframes/storefront-community.html` — community wireframe
- `docs/plans/wireframes/storefront-info-pages.html` — info pages wireframe
- T01–T04 completed — all user-account, commerce, and seller components aligned

## Expected Output

- `src/app/[locale]/(main)/community/page.tsx` — rebuilt to wireframe "Coming Soon" layout
- `src/components/content/InfoPage.tsx` — verified or minimally adjusted
- `src/app/[locale]/(reset-password)/reset-password/page.tsx` — verified or minimally adjusted
- All S07-scoped components pass Voltage compliance check
- Storefront changes committed to `gsd/M001/S07` branch
