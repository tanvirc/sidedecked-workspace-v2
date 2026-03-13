---
id: T01
parent: S04
milestone: M001
provides:
  - pixel-accurate homepage component padding matching wireframe at 1440px and 390px
key_files:
  - storefront/src/components/homepage/HeroSection.tsx
  - storefront/src/components/homepage/SellerCTABanner.tsx
key_decisions:
  - none
patterns_established:
  - none
observability_surfaces:
  - none
duration: 15m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Align all homepage components to wireframe pixel values

**Fixed HeroSection mobile bottom padding (48→40px) and SellerCTABanner section padding (missing top + wrong desktop bottom) to match wireframe.**

## What Happened

Compared all six homepage components against `storefront-homepage.html` wireframe CSS at both 1440px and 390px breakpoints. Most components were already pixel-perfect from S03 work. Found two deviations:

1. **HeroSection** mobile bottom padding was `48px` (from symmetric `py-[48px]`), wireframe specifies `40px`. Split into explicit `pb-[40px] pt-[48px]`.

2. **SellerCTABanner** section wrapper had no top padding and wrong desktop bottom padding. Wireframe wraps the CTA in a `.section` (64px 48px) with `padding-bottom: 80px` desktop / `48px` mobile. Added `pt-[40px] sm:pt-[64px]` and changed `sm:pb-[64px]` → `sm:pb-[80px]`.

GameSelectorGrid, GameTile, TrustSection, and TrendingStrip were already aligned — no changes needed.

## Verification

- `cd storefront && npx vitest run src/components/homepage/` — 6 files, 46 tests passed ✅
- `cd storefront && npx vitest run` — 76 files, 794 tests passed ✅
- `cd storefront && npm run build` — production build succeeded ✅

## Diagnostics

None — pure CSS class changes with no runtime behavior.

## Deviations

No task plan file existed; worked directly from slice plan must-haves and wireframe comparison.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/components/homepage/HeroSection.tsx` — fixed mobile bottom padding from 48px to 40px, split py into explicit pt/pb
- `storefront/src/components/homepage/SellerCTABanner.tsx` — added section top padding (40px mobile / 64px desktop) and fixed desktop bottom padding (64px → 80px)
