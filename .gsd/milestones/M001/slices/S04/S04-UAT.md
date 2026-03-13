# S04: Homepage — Pixel Perfect + Live Data — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven + human-experience)
- Why this mode is sufficient: Structural alignment verified by 46 automated tests. Visual fidelity requires human comparison against wireframe at target breakpoints.

## Preconditions

- `cd storefront && npm run dev` running on localhost
- Browser available at 1440px and 390px viewports
- Wireframe `docs/plans/wireframes/storefront-homepage.html` open for side-by-side comparison

## Smoke Test

Load homepage at localhost. All six sections render top to bottom: Hero → GameSelectorGrid → TrendingStrip → TrustSection → SellerCTABanner → Footer. No blank sections, no layout jumps.

## Test Cases

### 1. Hero section padding — desktop (1440px)

1. Open homepage at 1440px viewport width
2. Open wireframe `storefront-homepage.html` at same width
3. Compare Hero section: top padding (80px), horizontal padding (48px), bottom padding (64px)
4. Check subtitle margin-bottom (40px), game tabs margin-bottom (36px), stats pill margin-bottom (36px)
5. **Expected:** Padding and margins match wireframe values exactly

### 2. Hero section padding — mobile (390px)

1. Resize to 390px width
2. Compare Hero section: top padding (48px), horizontal padding (20px), bottom padding (40px)
3. **Expected:** All mobile padding values match wireframe

### 3. GameSelectorGrid layout — desktop

1. At 1440px, verify GameSelectorGrid section has 64px vertical / 48px horizontal padding
2. Verify 4 game tiles display in a grid that breaks at md (768px) not sm (640px)
3. **Expected:** Grid layout and padding match wireframe

### 4. GameTile overlay padding

1. At 1440px, check game tile overlay padding is 24px
2. At 390px, check overlay padding is 16px
3. **Expected:** Both breakpoints match wireframe

### 5. TrendingStrip renders with cards

1. At 1440px, verify TrendingStrip renders with 🔥 prefix, 48px horizontal padding, ~180px card widths
2. At 390px, verify 20px horizontal padding, ~140px card widths
3. Verify 8 cards visible with real card images (not broken images)
4. **Expected:** Cards render with correct sizing and real images from curated fallback

### 6. TrustSection padding

1. At 1440px, verify section padding 64px/48px, trust card padding 36px/28px
2. At 390px, verify section padding 40px/20px, trust card padding 24px/20px
3. **Expected:** Padding matches wireframe at both breakpoints

### 7. SellerCTABanner padding

1. At 1440px, verify outer margin 0/48px, inner padding 56px/48px
2. At 390px, verify outer margin 0/20px, inner padding 40px/24px
3. **Expected:** CTA banner spacing matches wireframe

## Edge Cases

### TrendingStrip with no API data

1. With customer-backend not running (or `/api/pricing/trending` returning empty), load homepage
2. **Expected:** TrendingStrip renders 8 curated placeholder cards with real images — never blank

### Viewport between breakpoints (768px)

1. Resize viewport to exactly 768px
2. **Expected:** GameSelectorGrid transitions from 1-column to grid layout at this breakpoint

## Failure Signals

- Any section missing or collapsed to zero height
- Broken image icons in TrendingStrip
- Padding/margin values visibly different from wireframe at either breakpoint
- GameSelectorGrid breaking to grid layout before 768px
- TrendingStrip showing no cards when API is unavailable

## Requirements Proved By This UAT

- R008 — Homepage pixel-perfect with live data: visual comparison at both breakpoints proves wireframe fidelity
- R022 — Trending strip wired to live data: curated fallback renders; live data flows when API is available

## Not Proven By This UAT

- Live trending data from a running customer-backend (curated fallback is verified, not live API response)
- GameSelectorGrid listing counts from a running customer-backend (wired but not exercised without backend)
- Performance under load (trending API response time)

## Notes for Tester

- TrendingStrip will show curated placeholder cards unless customer-backend is running with the `/api/pricing/trending` endpoint implemented. This is expected — the fallback is the designed behavior for pre-launch.
- GameSelectorGrid may show 0 listing counts without customer-backend running. The wiring is correct; counts populate when the API responds.
- The visual comparison is the primary purpose of this UAT — automated tests verify structure, but only human eyes verify the page *looks right* against the wireframe.
