# M001 — Research

**Date:** 2026-03-16

## Summary

M001 delivers the MVP core loop: a pixel-perfect Voltage-themed storefront where users browse cards, build decks, buy missing cards via an optimized multi-vendor cart, and sellers list cards via a guided wizard. The platform has a substantial head start — working API backends, card catalog routes, deck validation, market pricing services, Algolia search integration, and 35 HTML wireframes covering the full site. The storefront scaffolding exists (Next.js 15, Tailwind, shadcn/ui, Voltage CSS tokens) but pages are visually unaligned to wireframes and the three differentiating features (cart optimizer, listing wizard, collection auto-update) do not exist yet.

The two hardest problems in this milestone are (1) the cart optimizer, which is technically interesting (optimal seller combination under shipping cost constraints is NP-hard — need a heuristic that's good enough and fast enough) and (2) end-to-end OAuth, which crosses multiple service boundaries and has no precedent in the codebase for Google/Discord specifically. Both should be proven early. The remaining work is surface area — applying Voltage tokens across many pages — which is reliable but large.

Recommended execution order: lock the design foundation first (shared nav, footer, tokens), then prove the hardest feature (cart optimizer algorithm + BFF), then build the high-priority user-facing pages (card browse/detail/search, deck builder, homepage), then auth/OAuth, then remaining pages, then the listing wizard, then wire everything into the final integrated flow.

## Recommendation

Build in risk order: prove the cart optimizer algorithm works before building any UI around it (S01). Lock the Voltage design foundation in the same slice so all subsequent UI work has a stable surface. Attack card discovery and deck builder next since they're the platform's gravitational center. Auth/OAuth third — unblocks all write-path testing. Listing wizard and remaining page alignment last since they're well-understood surface area with existing API backing.

The deck-to-cart end-to-end integration slice should be the final slice — it assembles all prior work and proves the value proposition in a running environment.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Card search autocomplete | `react-instantsearch` 7.15.3 + Algolia | Already integrated in storefront; full faceting, pagination, autocomplete built-in |
| OAuth provider shape | `backend/apps/backend/src/modules/authentication/providers/apple-auth.provider.ts` | Reference implementation for `authenticate()` + `generateAuthorizationUrl()` contract; follow exactly for Google/Discord |
| UI primitives | `shadcn/ui` components (Sheet, Dialog, DropdownMenu, Command, Tooltip, Popover, sonner) | Already installed; don't build modals, sheets, or toasts from scratch |
| Deck format validation | `customer-backend/src/services/DeckValidationService.ts` (639 lines) | Full per-game format legality logic exists; call the API, don't re-implement |
| Market pricing | `customer-backend/src/services/MarketDataService.ts` (560 lines) | getMarketPrice(), getTrend(), getRecentSales() — use for listing wizard pre-fill |
| Card catalog lookup | `customer-backend/src/routes/catalog.ts` (1,496 lines) | `GET /api/catalog/cards/search`, `GET /api/catalog/cards/:id` — full card data including prints, sets |
| Seller listings/orders | `backend/apps/backend/src/api/store/consumer-seller/` | Existing routes for listing creation, order management, payout |
| Cart / checkout | `backend/apps/backend/src/api/store/carts/` | MedusaJS cart + multi-vendor checkout already wired |
| Redis pub/sub | `ioredis` 5.3.2 (already dep in customer-backend) | Use for `order.receipt.confirmed` event; dedicated subscriber client required per ioredis docs |
| Design tokens | `storefront/src/app/colors.css` + `storefront/src/app/globals.css` | Voltage tokens fully defined; use CSS custom properties via inline style for non-Tailwind tokens |
| Wireframe nav | `docs/plans/wireframes/sd-nav.js` | Single source of truth for nav HTML/CSS; React Header must match exactly |

## Existing Code and Patterns

- `storefront/src/app/colors.css` — All Voltage CSS custom properties (brand, surfaces, text, interactive, semantic, game-specific). Light mode `:root` + dark mode `.dark`. Use inline `style={{ color: 'var(--text-secondary)' }}` for tokens not in Tailwind config.
- `storefront/src/app/globals.css` — Typography utility classes (`.display-xl` → `.display-sm`, `.heading-*`, `.label-*`, `.price`). Use `.price` for all monetary figures — tabular figures, DM Mono, `--text-price` color. Never replicate these with Tailwind.
- `docs/plans/wireframes/sd-nav.js` — Authoritative nav design: glassmorphic sticky nav, desktop (logo + 5 links + search/wishlist/cart/auth icons), mobile (hamburger + bottom bar). React Header must match this pixel-perfectly.
- `docs/plans/wireframes/storefront-*.html` — 35 wireframes covering every page. The `:root` token block in each wireframe is the reference. Pages that don't have a wireframe yet need one generated before implementation.
- `backend/apps/backend/src/modules/authentication/providers/apple-auth.provider.ts` — OAuth provider contract: `static identifier`, constructor takes `(container, config)`, implements `authenticate(data, authContext)` returning `AuthenticationResponse`. Follow for Google + Discord providers.
- `customer-backend/src/routes/catalog.ts` — Card search: `GET /api/catalog/cards/search?q=&game=&set=&page=`. Card detail: `GET /api/catalog/cards/:id`. Returns `{ id, name, game, setCode, prints: [...], attributes: {...} }`.
- `customer-backend/src/routes/decks.ts` (943 lines) — Full deck CRUD: create, get, update, delete, add/remove cards, format validation endpoint.
- `customer-backend/src/services/TrustScoreService.ts` (593 lines) — `calculateTrustScore(sellerId)` returns `{ score, tier, breakdown }`. Wired to mock data; needs real performance metrics from backend API.
- `backend/apps/backend/src/api/store/carts/` — MedusaJS cart: `POST /store/carts`, `POST /store/carts/:id/line-items`, `POST /store/carts/:id/complete`. Multi-vendor handled internally by MercurJS.

## Constraints

- **Split-brain databases** — `mercur-db` (backend) and `sidedecked-db` (customer-backend) must never be accessed cross-service via direct DB connection. All cross-service data goes through HTTP APIs or Redis pub/sub.
- **Railway DB pool max 10** — Optimizer listing queries must be batched, not fanned out per-card unbounded.
- **MedusaJS auth module conventions** — OAuth providers must follow apple-auth.provider.ts shape exactly. Deviate and the auth module silently fails to register the provider.
- **Storefront import conventions** — `@/` path alias, double quotes, no semicolons. Violating these breaks ESLint and the build.
- **shadcn/ui + Tailwind** — All new UI must use existing design system primitives. No new CSS libraries, no inline Tailwind that duplicates existing component patterns.
- **Wireframes are authoritative** — `docs/plans/wireframes/` HTML files are the design source of truth. Pixel-perfect means matching token values, spacing, and layout — not approximate.
- **Storefront sub-repo has its own `.git`** — Changes must be committed inside `storefront/` on the slice branch; parent repo auto-commit does not capture storefront source.
- **ioredis subscriber clients** — A client in subscribe mode cannot issue regular commands. Separate `getRedisSubscriber()` client required for pub/sub listeners.
- **Next.js 15 App Router** — All new pages use App Router (`app/` directory). No `pages/` additions. Server components by default; client components only where browser APIs or interactivity required.

## Common Pitfalls

- **Infinite scroll vs. pagination** — Wireframes specify numbered pagination for card browse/search, not infinite scroll. `usePagination` + `useHits` from react-instantsearch, not `useInfiniteHits`.
- **Tailwind for Voltage tokens** — Tailwind config does not include Voltage custom properties. Don't write `text-text-secondary` — use `style={{ color: 'var(--text-secondary)' }}`.
- **OAuth callback URL** — MedusaJS expects the callback at `/auth/{provider}/callback` (or configured route). Storefront and backend callback URLs must match OAuth app configuration exactly, or the redirect silently breaks.
- **Cart optimizer NP-hardness** — Finding the globally optimal seller combination is NP-hard. Don't attempt ILP for MVP. Greedy heuristic: sort cards by scarcity (fewest listings first), assign each to cheapest available seller, accumulate shipping. Fast, deterministic, good enough.
- **Mobile DnD** — HTML5Backend doesn't work on touch devices. Deck builder needs TouchBackend for mobile or a tap-to-add pattern as the primary mobile interaction. Don't ship a builder that silently does nothing on mobile.
- **BFF dual-source failure modes** — Card detail BFF aggregates catalog data (customer-backend) + listing data (backend). Listings being unavailable should degrade gracefully — show the card with "No listings available", not a 500.
- **alert() dialogs** — Zero `alert()`/`confirm()`/`prompt()` allowed. All feedback uses sonner toasts from the existing `useToast()` hook or `toast()` from sonner directly.
- **Light-mode Tailwind classes** — Any component using `bg-white`, `text-gray-900`, `border-gray-200` etc. without dark-mode equivalents will break Voltage dark theme. Always use CSS custom properties or dark-mode-aware Tailwind tokens.

## Open Risks

- **Cart optimizer performance at scale** — Greedy heuristic is fast for MVP (< 500 sellers), but must be verified against actual query time when listing data comes from a live backend API response rather than test fixtures. Target < 2s for 15 cards.
- **Google/Discord OAuth credentials** — Provider code can be implemented and unit-tested structurally, but live end-to-end OAuth requires credentials configured as env vars. Live acceptance test is blocked until credentials are provided.
- **Figma MCP transport** — mcporter (the local MCP proxy) uses SSE/HTTP transport. html-to-design Figma plugin likely requires a different transport. Wireframe HTML → Figma export may require manual action or Claude Desktop with native MCP support.
- **Wireframe coverage gaps** — 35 wireframes exist. Pages not covered (if any) need wireframes generated following Voltage patterns before visual alignment can happen.
- **Touch deck builder UX** — The tap-to-add mobile interaction is unintuitive without the same DnD feedback as desktop. May need a bottom-sheet card search + explicit "Add to zone" affordance. Needs UAT.
