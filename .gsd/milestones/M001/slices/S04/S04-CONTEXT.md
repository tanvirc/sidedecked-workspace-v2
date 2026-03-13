---
id: S04
milestone: M001
status: ready
---

# S04: Homepage — Pixel Perfect + Live Data — Context

## Goal

Deliver a pixel-perfect homepage matching the Voltage wireframe at 1440px and 390px, with live data for the trending strip (most recently listed cards from customer-backend), live listing counts on game tiles, and live stats in the hero pill — all wired to real APIs.

## Why this Slice

The homepage is the storefront's front door and the first thing users and potential sellers see. S01 delivered the design system foundation and S02 delivered trending strip and card display patterns that S04 reuses. Completing the homepage now means the primary landing experience is polished before downstream slices (S05 auth, S08 listing wizard) add user flows that link back to it. S04 is a leaf node — nothing depends on it — so it can run in parallel with other slices after S01+S02.

## Scope

### In Scope

- Pixel-perfect alignment of all homepage sections to the wireframe at 1440px desktop and 390px mobile
- Hero section: heading, subtitle, search bar, game filter tabs, stats pill, CTA buttons — all matching wireframe
- Game selector grid wired to live listing counts from `GET /api/catalog/listing-counts` (already working)
- Trending strip wired to live "most recently listed" cards from customer-backend API
- Trust section matching wireframe (card counts, verified sellers, buyer protection)
- Seller CTA banner: visible for unauthenticated users and authenticated non-seller users; hidden for users who are registered sellers
- Hero stats pill wired to live data: card count from catalog API, seller count from backend
- Hero game tabs navigate to `/cards?game=<CODE>` on tap
- Trending strip shows all games mixed (no per-user game preference filtering)
- No price movement badges on homepage trending strip — just card image, name, set, price (matches wireframe)
- Desktop and mobile responsive behavior matching wireframe breakpoints

### Out of Scope

- Price movement / volatility badges on trending cards (wireframe doesn't show them on homepage)
- Per-user game preference filtering of trending strip (preferences API doesn't exist yet; fall back to all games)
- Building a user game preferences API or data model
- Real "trending by price movement" algorithm — use most recently listed as proxy until PriceHistoryService is implemented
- Implementing the `PriceHistoryService.getTrendingCards()` stub (that's backend work beyond this slice)
- Changes to the browse page's TrendingStrip (S02 owns that component)
- Any changes to nav or footer (S01 owns those)
- Light mode styling (dark mode only per Voltage spec)

## Constraints

- Wireframe is authoritative: `docs/plans/wireframes/storefront-homepage.html` is the source of truth for layout, spacing, typography, and colors
- Two TrendingStrip components exist: `homepage/TrendingStrip.tsx` and `cards/TrendingStrip.tsx` (S02). The homepage version is the one to use/modify for S04. Do not break the S02 browse page version.
- Stats pill live data: hero stats must come from real API calls, not static config. This means server-side data fetching in the page component (already an async RSC). Acceptable to cache/revalidate to avoid per-request latency.
- `fetchGameListingCounts()` already exists and works — reuse it, don't duplicate
- Split-brain architecture: trending card data comes from customer-backend, seller counts may come from the Medusa backend. No direct cross-DB access.
- D008: Price typography uses `.price` CSS class from globals.css
- D009: Voltage tokens applied via inline `style` for CSS custom properties not covered by Tailwind
- All new components must use Voltage design tokens exclusively — no hardcoded colors

## Integration Points

### Consumes

- `docs/plans/wireframes/storefront-homepage.html` — Authoritative wireframe for layout, spacing, and visual targets
- `storefront/src/components/homepage/*` — Existing homepage components (HeroSection, GameSelectorGrid, GameTile, TrustSection, SellerCTABanner, TrendingStrip)
- `storefront/src/app/[locale]/(main)/page.tsx` — Homepage RSC page that composes all sections
- `storefront/src/lib/api/customer-backend.ts` — `fetchGameListingCounts()` for game tile counts
- `customer-backend/src/routes/catalog.ts` — `GET /api/catalog/listing-counts` for game-scoped counts
- `customer-backend/src/routes/pricing.ts` — `GET /api/pricing/trending` (stub — will need a "recently listed" alternative)
- `storefront/src/lib/site-config.ts` — `getSiteConfig()` currently provides static hero stats (to be replaced with live data)
- S01 shared components: Footer, ModernHeader, PriceTag, CardDisplay
- S02 patterns: card display patterns, TrendingCard type shape

### Produces

- Pixel-perfect homepage matching wireframe at both breakpoints
- `GET /api/catalog/recently-listed` or equivalent endpoint for trending strip data (if no suitable endpoint exists)
- Live hero stats fetched from APIs (card count, seller count, avg rating)
- Seller CTA visibility logic: hidden for registered sellers, shown for everyone else

## Open Questions

- **Recently listed API endpoint** — Does an endpoint for "most recently listed cards" already exist in customer-backend, or does S04 need to create one? Current thinking: check `catalog.ts` routes during research; if nothing exists, create a lightweight query endpoint.
- **Seller status check** — How does the storefront determine if an authenticated user is a registered seller? Current thinking: the `retrieveCustomer()` call may return seller role info, or a separate check may be needed. Investigate during research.
- **Live seller count source** — Which backend provides the seller count? Current thinking: likely Medusa backend since sellers are managed there. Need to find or create an endpoint.
- **Avg seller rating source** — Where does the average seller rating come from? Current thinking: may not have a real source yet. If not, keep the static config value as a fallback and note it as a known limitation.
