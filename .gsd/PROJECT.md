# Project

## What This Is

SideDecked is a community-driven multi-game TCG marketplace (Magic: The Gathering, Pokémon, Yu-Gi-Oh!, One Piece) built on a split-brain architecture — MedusaJS/MercurJS commerce backend (`mercur-db`) and Express/TypeORM customer backend (`sidedecked-db`), with a Next.js 15 storefront and React/Vite vendor panel. The platform differentiates by integrating deck building, pricing intelligence, and community features directly into the marketplace — enabling "Build your deck, buy the missing cards from the cheapest sellers in one tap."

## Core Value

The deck-to-cart pipeline: a player builds a deck, marks cards they own, and buys the missing cards from the optimal combination of sellers in a single checkout. No competitor integrates deck building with multi-vendor cart optimization this directly.

## Current State

**Brownfield — 4 repositories with substantial existing code:**

- **backend/** — MercurJS with 19 custom modules, 25+ workflow domains, 40+ subscribers, auth module (missing Google/Discord providers), Stripe Connect integration, consumer-seller API routes
- **customer-backend/** — 31 TypeORM entities, 6300+ lines of routes (catalog, decks, sellers, pricing, collections), ETL pipeline (303 lines), services for deck validation, trust scoring, market data, Algolia indexing
- **storefront/** — 46 page files, 14,691 lines in card components, 5,900 lines in deck builder components, Algolia search integration, BFF endpoint for card detail, 794 passing tests across 76 files. Design system implemented (Voltage tokens, shadcn/ui, sonner). Card browse/detail/search pages aligned to wireframes (S02). Deck browser/viewer/builder pages aligned to wireframes (S03). Homepage pixel-aligned with live trending data wiring and curated fallback with real card images (S04). Auth pages rebuilt as cinematic split-screen in (auth) route group with glassmorphic AuthGateDialog — 37 auth tests (S05). Profile page rebuilt with hero banner, game badges, and 4-tab hash-routed layout — 23 profile tests (S05).
- **vendorpanel/** — React 18 + Vite SPA with 50+ TanStack Query hooks, Medusa UI components, 40+ routes

**What works:** Card detail BFF, Algolia search with autocomplete/facets, deck CRUD, deck builder with DnD/touch, social auth routes (but missing Google/Discord providers), Stripe Connect seller onboarding, consumer-seller listings/orders/payouts, storefront tests passing.

**What doesn't exist yet:** Cart optimizer algorithm/UI, 3-step listing wizard, live OAuth end-to-end test (providers registered but credentials not configured). All 33 wireframes exist as authoritative alignment targets (S06 complete). All remaining pages visually aligned to Voltage tokens (S07 complete). Figma export blocked on MCP auth.

## Architecture / Key Patterns

- **Split-brain databases** — `mercur-db` (commerce) and `sidedecked-db` (TCG domain). Never cross directly; API calls + Redis pub/sub only.
- **Cross-service auth** — Shared JWT secret validated by both backends
- **Design system** — "Voltage" dark-first theme with violet (`#8B5CF6`) + coral (`#FF7849`). Barlow Condensed display, Inter body, DM Mono prices. shadcn/ui + Tailwind CSS.
- **Import patterns** — Storefront: `@/` path alias, double quotes, no semicolons. Backend: `#/` alias, single quotes, no semicolons. Customer-backend: `@sidedecked/*` aliases, CommonJS.
- **Testing** — Storefront: Vitest + Testing Library. Backend: Jest + SWC. Customer-backend: Jest + ts-jest.
- **Quality gate** — `npm run lint && npm run typecheck && npm run build && npm test` per repo.

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [ ] M001: MVP Core Loop — Pixel-perfect Voltage storefront + cart optimizer + listing wizard + OAuth providers. Prove deck-to-cart conversion drives transactions.
- [ ] M002: Seller Scale & Trust — CSV bulk import, price anomaly detection, dispute resolution, trust scores, automated enforcement.
- [ ] M003: Growth & Analytics — Vendor dashboards, price history, collection management, community profiles, saved searches, admin dashboard.
- [ ] M004: Community & Engagement — Groups, forums, events, messaging, deck comments, community-to-commerce loop.
- [ ] M005: Intelligence & Scale — ML pricing, visual card recognition, automated repricing, multi-currency, semantic search.
