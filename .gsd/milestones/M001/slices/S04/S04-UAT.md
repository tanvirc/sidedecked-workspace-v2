# S04: Homepage — Pixel Perfect + Live Data — UAT

**Milestone:** M001
**Written:** 2026-03-13

## UAT Type

- UAT mode: mixed
- Why this mode is sufficient: Structural alignment verified by 46 automated tests and successful build. Visual fidelity requires human comparison against wireframe at both breakpoints.

## Preconditions

- `cd storefront && npm run dev` running (or production build served)
- Browser available at storefront URL (typically http://localhost:3002)
- No customer-backend required — trending strip renders curated fallback with real card images

## Smoke Test

Navigate to homepage. All six sections visible: Hero → GameSelectorGrid → TrendingStrip (with 🔥 emoji and card images) → TrustSection → SellerCTABanner. No blank gaps or missing sections.

## Test Cases

### 1. Hero section matches wireframe at 1440px

1. Open homepage at 1440px viewport width
2. Compare Hero section against `docs/plans/wireframes/storefront-homepage.html` hero
3. **Expected:** Padding 80px top / 64px bottom / 48px sides. Subtitle has 40px bottom margin. Game tabs and stats pill each have 36px bottom margin.

### 2. GameSelectorGrid matches wireframe at 1440px

1. Scroll to game selector section at 1440px
2. Compare grid layout against wireframe
3. **Expected:** 4-column grid. Section padding 64px vertical / 48px horizontal. Each game tile overlay has 24px padding.

### 3. TrendingStrip renders with card images

1. Scroll to trending section
2. **Expected:** "🔥 Trending Now" label visible. 8 cards showing with real card art (Ragavan, Bowmasters, Charizard ex, Mew ex, Ash Blossom, Accesscode Talker, Luffy, Shanks). Cards are 180px wide at desktop. Section padding 48px horizontal.

### 4. TrustSection matches wireframe at 1440px

1. Scroll to trust section
2. **Expected:** Three trust cards visible. Section padding 64px vertical / 48px horizontal. Card padding 36px vertical / 28px horizontal.

### 5. SellerCTABanner matches wireframe at 1440px

1. Scroll to seller CTA at bottom
2. **Expected:** Banner with 48px outer horizontal margin, 56px vertical / 48px horizontal inner padding.

### 6. Mobile layout at 390px

1. Resize viewport to 390px width
2. Scroll through all sections
3. **Expected:** Hero padding 48px top / 40px bottom / 20px sides. GameSelectorGrid collapses to 2-column below 768px. TrendingStrip cards are 140px wide with 20px horizontal padding. Trust cards stack vertically with 40px vertical / 20px horizontal section padding. SellerCTA has 20px outer margin, 40px vertical / 24px horizontal inner padding.

### 7. GameSelectorGrid breakpoint at 768px

1. Resize viewport to 767px, then 768px
2. **Expected:** At 767px: 2-column grid. At 768px: 4-column grid. Transition happens at md breakpoint (768px), not sm (640px).

## Edge Cases

### TrendingStrip with no API data

1. With customer-backend offline (normal dev state), load homepage
2. **Expected:** TrendingStrip renders 8 curated placeholder cards with real card images. No error state, no empty section, no console errors.

## Failure Signals

- Any section missing or rendering blank
- Trending cards showing SVG placeholder icons instead of real card images
- GameSelectorGrid showing 4 columns at mobile widths (below 768px)
- TrendingStrip showing 0 cards or an error message
- Mismatched padding/spacing compared to wireframe

## Requirements Proved By This UAT

- R008 — Homepage pixel-perfect with live data: structural alignment verified by 46 tests + build. Visual UAT confirms wireframe fidelity.
- R022 — Trending strip wired to live data: API client exists and curated fallback renders with real images.

## Not Proven By This UAT

- Live trending data from customer-backend `/api/pricing/trending` — endpoint not yet implemented; only curated fallback is verified
- GameSelectorGrid live listing counts — depends on customer-backend being running with data

## Notes for Tester

- The TrendingStrip shows curated fallback data with real card images by design. This is correct behavior until customer-backend's trending endpoint is implemented.
- GameSelectorGrid listing counts show "0 listings" when customer-backend is offline. Expected.
