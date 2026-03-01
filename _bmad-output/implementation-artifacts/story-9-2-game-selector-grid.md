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
