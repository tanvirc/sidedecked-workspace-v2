---
id: T01
parent: S04
milestone: M001
provides:
  - pixel-exact Tailwind classes on all six homepage components matching wireframe
key_files:
  - storefront/src/components/homepage/HeroSection.tsx
  - storefront/src/components/homepage/GameSelectorGrid.tsx
  - storefront/src/components/homepage/GameTile.tsx
  - storefront/src/components/homepage/TrendingStrip.tsx
  - storefront/src/components/homepage/TrustSection.tsx
  - storefront/src/components/homepage/SellerCTABanner.tsx
  - storefront/src/components/homepage/__tests__/TrendingStrip.test.tsx
key_decisions:
  - Used Tailwind arbitrary values (py-[48px], mb-9, etc.) where scale values don't match wireframe pixels
  - Shifted GameTile responsive breakpoints from sm: to md: to stay consistent with GameSelectorGrid's md:grid-cols-4
  - Replaced inline style={{ width: 180 }} on TrendingStrip cards with responsive Tailwind w-[140px] sm:w-[180px]
patterns_established:
  - none
observability_surfaces:
  - none
duration: 15m
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T01: Align all homepage components to wireframe pixel values

**Updated Tailwind classes across all six homepage components to match `storefront-homepage.html` wireframe pixel values exactly.**

## What Happened

Walked through each component and surgically replaced approximate Tailwind scale values with exact pixel values from the wireframe:

- **HeroSection**: Section padding `py-[48px] px-5 / sm:py-[80px] sm:pb-[64px] sm:px-12`. Subtitle `mb-10` (40px). Game tabs and stats pill both `mb-9` (36px).
- **GameSelectorGrid**: Section padding `py-[40px] / sm:py-[64px]`. Grid breakpoint changed from `sm:grid-cols-4` to `md:grid-cols-4` (768px threshold).
- **GameTile**: Overlay padding and text breakpoints shifted from `sm:` to `md:` to align with grid breakpoint.
- **TrendingStrip**: Section padding `py-[32px] / sm:py-[48px]`. Added 🔥 emoji prefix to label. Card width responsive `w-[140px] sm:w-[180px]`. Gap `gap-[14px] sm:gap-5`.
- **TrustSection**: Section padding `py-[40px] / sm:py-[64px]`. Card padding `p-[24px] px-5 / sm:p-[36px] sm:px-7`.
- **SellerCTABanner**: Outer `pb-[48px] sm:pb-[64px]`. Inner `py-[40px] / sm:py-[56px]`.

Updated TrendingStrip test to use regex matcher for "Trending Now" text (now prefixed with emoji).

## Verification

- `npx vitest run src/components/homepage/` — 46/46 tests pass (6 test files)
- `npm run build` — production build succeeds

## Diagnostics

None — pure CSS-class changes with no runtime behavior changes.

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/components/homepage/HeroSection.tsx` — padding/margin classes aligned to wireframe
- `storefront/src/components/homepage/GameSelectorGrid.tsx` — section padding and grid breakpoint to md:
- `storefront/src/components/homepage/GameTile.tsx` — overlay padding/text breakpoints to md:
- `storefront/src/components/homepage/TrendingStrip.tsx` — padding, emoji prefix, responsive card widths, gap
- `storefront/src/components/homepage/TrustSection.tsx` — section and card padding aligned
- `storefront/src/components/homepage/SellerCTABanner.tsx` — outer and inner padding aligned
- `storefront/src/components/homepage/__tests__/TrendingStrip.test.tsx` — label assertion updated for emoji prefix
