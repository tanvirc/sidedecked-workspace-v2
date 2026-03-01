# Story 9.2: Game Selector Grid

**Epic:** Epic 9 — Storefront Homepage Redesign
**Story key:** 9-2-game-selector-grid
**Status:** done

## User Story

As a visitor (anonymous or authenticated),
I want to tap a game tile to narrow the marketplace to my TCG and have that preference remembered,
So that I don't have to re-select my game on every visit.

## Acceptance Criteria

**AC1:** Given I am on the homepage, When I view the section below the trust strip, Then a 2x2 grid (mobile) or 4-column row (desktop) of game tiles is visible **And** each tile shows the actual card-back image from `/public/images/card-backs/` with a game-colour overlay (MTG: purple, Pokemon: yellow, YGO: gold, One Piece: red) **And** each tile displays the game name in Rajdhani uppercase font and live listing count in DM Mono **And** tile aspect ratio is 5:7 on all breakpoints. (IMPLEMENTED)

**AC2:** Given the listing counts are displayed, When the customer-backend listing count service is available, Then each count reflects current live inventory for that game, Redis-cached with 30s TTL. (IMPLEMENTED)

**AC3:** Given the listing count service is unavailable, When the tile renders, Then the listing count is omitted (tile still renders without count; no error shown). (IMPLEMENTED)

**AC4:** Given I tap the Pokemon tile, When the tap is registered, Then a `sd_game_pref=POKEMON` cookie is set (SameSite=Lax, 30-day expiry) **And** the user is navigated to `/cards?game=POKEMON` with the Pokemon game filter pre-selected. There is no selected state on the tile — navigation is immediate. (IMPLEMENTED)

**AC5:** Given I navigate to `/cards` without an explicit `?game=` URL param (e.g., via nav link), When the page renders server-side with `sd_game_pref=POKEMON` cookie present, Then the Pokémon game filter is pre-applied via Algolia `initialUiState`. The homepage tiles show no visual pre-highlight state. (IMPLEMENTED)

**AC6:** Given I navigate to a game tile using keyboard (Tab), When I press Enter, Then the game preference is applied identically to a tap interaction (cookie set + navigate to `/cards` with game filter pre-selected). (IMPLEMENTED)

## Clarifications (Phase 2 — 2026-03-01)

- Tile tap primary action: navigate to `/cards` with game filter pre-selected (not a placeholder-only update)
- No selected state on tiles — click immediately navigates; no visual selection indicator on homepage
- Placeholder update on homepage search bar: NOT in scope for this story
- GamePreferenceContext cross-component state: NOT required
- AC5 revised: cookie persists preference for /cards pre-filtering; no homepage tile pre-highlight
- Game codes (cookie values): MTG, POKEMON, YUGIOH, OPTCG — must match Game.code / Algolia refinement values exactly; no mapping layer needed
- EC5 (deselection): not applicable — tile click always navigates
- Listing count endpoint needs to be added to customer-backend (no existing route)

## Tasks

- [x] Task 1: Add `/public/images/card-backs/` assets for MTG, Pokemon, YGO, and One Piece (or verify they exist) [AC1]
- [x] Task 2: Create `GameSelectorGrid` server component — 2x2 mobile / 4-col desktop grid with card-back image tiles, game-colour overlays, Rajdhani game name, DM Mono listing count, 5:7 aspect ratio [AC1]
- [x] Task 3: Add game-scoped listing count API route to customer-backend (GET /api/catalog/listing-counts) with Redis 30s TTL [AC2]
- [x] Task 4: Wire listing count fetch in GameSelectorGrid — graceful omission when endpoint unavailable or returns error [AC3]
- [x] Task 5: Implement game tile interaction — set sd_game_pref cookie (SameSite=Lax, 30-day expiry) and navigate to /cards with game filter pre-selected; no selected state on tile [AC4]
- [x] Task 6: Wire /cards page to read sd_game_pref cookie and pass game code as initialGame to Algolia initialUiState [AC5]
- [x] Task 7: Implement keyboard accessibility — Tab focus, Enter identical to tap (cookie + navigate) [AC6]
- [x] Task 8: Tests (unit + integration) and quality gate [All ACs]

## Dev Agent Record

### File List

**storefront/**
- `src/components/homepage/GameSelectorGrid.tsx` — NEW: RSC game tile grid (2×2 mobile / 4-col desktop)
- `src/components/homepage/GameTile.tsx` — NEW: `"use client"` tile island (cookie write + navigation + keyboard)
- `src/app/[locale]/(main)/page.tsx` — MODIFIED: added `GameSelectorGrid` + `fetchGameListingCounts`
- `src/app/[locale]/(main)/cards/page.tsx` — MODIFIED: reads `sd_game_pref` cookie → `initialGame` for Algolia
- `src/components/cards/CardBrowsingPage.tsx` — MODIFIED: passes `initialGame` to `AlgoliaSearchResults`
- `src/components/search/AlgoliaSearchResults.tsx` — MODIFIED: added `initialGame` prop + `refinementList.game` in `initialUiState`
- `src/lib/api/customer-backend.ts` — MODIFIED: added `fetchGameListingCounts()` + `GameListingCounts` type
- `src/lib/api/__tests__/customer-backend.listing-counts.test.ts` — NEW: unit tests for `fetchGameListingCounts`
- `src/components/homepage/__tests__/GameSelectorGrid.test.tsx` — NEW: unit tests
- `src/components/homepage/__tests__/GameTile.test.tsx` — NEW: unit tests (AC3–AC6)
- `e2e/story-9-2-game-selector-grid.spec.ts` — NEW: 17 Playwright E2E tests
- `package.json` — MODIFIED (code review): added `@playwright/test` + `playwright` to devDependencies
- `tailwind.config.ts` — MODIFIED: verified `font-rajdhani`, `font-dm-mono`, `outline-accent` utilities
- `src/app/layout.tsx` — MODIFIED: Rajdhani + DM Mono font imports + CSS variable declarations
- `src/app/globals.css`, `src/app/colors.css` — MODIFIED: design token chain confirmed for `--text-secondary`

**customer-backend/**
- `src/routes/catalog.ts` — MODIFIED: added `GET /api/catalog/listing-counts` with Redis 30s cache
- `src/tests/routes/catalog.listing-counts.test.ts` — NEW: 4 Jest tests (cache hit, cache miss, DB fail, Redis fail)

**Also modified (homepage context — other story components re-tested as part of this story's quality gate):**
- `src/components/homepage/HeroSection.tsx`, `HeroRight.tsx`, `TrustStrip.tsx`, `TrustBar.tsx`, `TrustStatsCard.tsx`, `SellerOpportunityCard.tsx`, `SellerSignal.tsx`, `WhySidedeckedCard.tsx` — test files updated; no logic changes
- `src/components/cards/__tests__/CardBrowsingPage.test.tsx`, `src/components/search/__tests__/AlgoliaSearchResults.test.tsx` — MODIFIED: updated for `initialGame` prop

### Change Log

| Date | Author | Type | Notes |
|---|---|---|---|
| 2026-03-01 | Dev Agent | implementation | Phases 1–4 complete; all 8 tasks done, quality gate PASS |
| 2026-03-01 | QA Agent (Quinn) | test | Phase 5: 17 Playwright E2E specs committed (136f00e) |
| 2026-03-01 | UX Agent (Sally+Quinn) | validation | Phase 5B: UX validation report APPROVED — 27/28 structural checks PASS; `active:border-white/20` flagged as non-blocking |
| 2026-03-01 | Tech Writer (Paige) | docs | Phase 7: CHANGELOG + integration-architecture §12 + sprint-status updated |
| 2026-03-01 | Code Review (AI) | review | 2 HIGH, 5 MEDIUM, 3 LOW findings; all HIGH+MEDIUM fixed (see below) |

### Senior Developer Review (AI)

**Date:** 2026-03-01 | **Outcome:** APPROVED after fixes

**Fixes applied:**
- **[H1]** Added `@playwright/test@^1.51.0` + `playwright@^1.51.0` to `package.json` devDependencies — package was in `node_modules` but unregistered
- **[H2]** Added 2 tests in `GameTile.test.tsx`: `count=0` renders "0 listings" (not suppressed), and `aria-label` with 0 count — covers elicitation requirement
- **[M1]** Added `active:border-white/20` to `GameTile.tsx` className — completes wireframe active-state border spec
- **[M2]** Added test: `redis.get()` throws → 503 returned — covers transient Redis failure path
- **[M5]** Added this Dev Agent Record (was missing — no file list or change log existed)

**Documented (no code change):**
- **[M3]** `sm:py-3` (12px) desktop section padding changed post-Phase-5B by commit `1d71021` ("reduce vertical space and align hero layout for 1280px viewports") — intentional layout alignment; wireframe does not specify desktop padding
- **[M4]** Commit `1c43dd4` message says "85%/70%" but code has `sm:w-[80%]` — misleading commit message; 80% desktop width is the intended final value

**Low issues deferred:**
- **[L1]** `fetchGameListingCounts` has no `AbortSignal.timeout()` — deferred to Story 9.3 (BFF endpoint) where timeout strategy will be applied consistently
- **[L2]** JSX story slot comments (`Story 9.4`, `Story 9.6`) in `page.tsx` — will be converted to GitHub issues
- **[L3]** `--text-secondary` incorrect in light mode — storefront is dark-only; deferred to design system audit

## UX Design Reference

Wireframe: `_bmad-output/planning-artifacts/ux-9-2-game-selector-grid-wireframe.html` (v1 — post party-mode + elicitation)

## Elicitation Notes (Phase 2B — 2026-03-01)

- `:active` state required for touch feedback (scale 0.97) — `:hover` does not fire on mobile
- `prefers-reduced-motion`: suppress transform animations on tile hover/active
- Card-back image fallback: each tile must have `background-color` fallback (game's dominant colour) for image load failure
- Section label "Shop by game": use `text-2` (#8B93A6), not `text-3` (#4F5568)
- `aria-label` format: "{Game Name} — {count} listings" when count available; "{Game Name}" when count omitted (never "undefined listings")
- Listing count = 0: display "0 listings" (do not suppress — 0 is valid data)
- Cookie write is best-effort: navigation fires regardless of cookie success/failure
- Algolia game refinement value mapping must be confirmed in architecture phase (cookie `pokemon` must map to exact Algolia refinement value)
- `initialUiState` + URL routing interaction in AlgoliaSearchResults must be verified before implementation (URL routing takes precedence)
