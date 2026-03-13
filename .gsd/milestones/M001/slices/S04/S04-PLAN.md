# S04: Homepage — Pixel Perfect + Live Data

**Goal:** Homepage matches the `storefront-homepage.html` wireframe at 1440px and 390px with all six sections rendering, TrendingStrip wired to live trending data (with curated fallback), and GameSelectorGrid already wired to live listing counts.
**Demo:** Homepage renders Hero → GameSelectorGrid (live counts) → TrendingStrip (curated/live cards) → TrustSection → SellerCTABanner with correct padding, typography, and breakpoints matching the wireframe at both breakpoints.

## Must-Haves

- Hero section padding matches wireframe: `80px 48px 64px` desktop, `48px 20px 40px` mobile
- Hero subtitle `margin-bottom: 40px`, game tabs `margin-bottom: 36px`, stats pill `margin-bottom: 36px`
- GameSelectorGrid section padding `64px 48px` desktop / `40px 20px` mobile, grid breakpoint at `md` (768px) not `sm` (640px)
- GameTile overlay padding `24px` desktop / `16px` mobile
- TrendingStrip rendered on homepage with 🔥 emoji prefix, `48px` horizontal padding desktop / `20px` mobile, card width `180px` desktop / `140px` mobile
- `fetchTrendingCards()` function in customer-backend.ts following `fetchGameListingCounts()` pattern with 5-min cache
- Curated `TRENDING_PLACEHOLDER` data with real card images so TrendingStrip always renders even when API returns empty
- TrustSection padding `64px 48px` desktop / `40px 20px` mobile, trust card padding `36px 28px` desktop / `24px 20px` mobile
- SellerCTABanner margin/padding: `0 48px` outer margin, `56px 48px` inner padding desktop; `0 20px` / `40px 24px` mobile
- All existing homepage tests pass plus new tests for trending data integration

## Verification

- `cd storefront && npx vitest run src/components/homepage/` — all homepage component tests pass
- `cd storefront && npx vitest run` — full suite passes (738+ tests)
- `cd storefront && npm run build` — production build succeeds

## Tasks

- [x] **T01: Align all homepage components to wireframe pixel values** `est:45m`
- [ ] **T02: Wire TrendingStrip to live data with curated fallback and integrate into homepage** `est:45m`
- [ ] **T03: Fix orphaned CardDetailPage v5.1 tests** `est:10m`

## Files Likely Touched

- `storefront/src/components/homepage/HeroSection.tsx`
- `storefront/src/components/homepage/GameSelectorGrid.tsx`
- `storefront/src/components/homepage/GameTile.tsx`
- `storefront/src/components/homepage/TrustSection.tsx`
- `storefront/src/components/homepage/SellerCTABanner.tsx`
- `storefront/src/components/homepage/TrendingStrip.tsx`
- `storefront/src/components/homepage/__tests__/TrendingStrip.test.tsx`
- `storefront/src/lib/api/customer-backend.ts`
- `storefront/src/app/[locale]/(main)/page.tsx`
- `storefront/src/app/[locale]/(main)/__tests__/page.test.tsx`
- `storefront/src/components/cards/CardDetailPage.test.tsx`
