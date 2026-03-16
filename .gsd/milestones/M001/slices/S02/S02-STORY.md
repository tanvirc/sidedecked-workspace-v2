---
story_key: s02
title: Card Browse, Detail, Search + Deck Builder
status: planned
requirement_ids: [R002, R003, R004, R005, R006, R007, R008, R009, R010, R011, R012, R013]
affected_repos: [storefront]
story_type: feature
ui_story: true
split_brain_risk: false
needs_deploy: false
party_gates:
  readiness: pending
  design_plan: pending
approvals:
  selected: false
  plan_frozen: false
  external_actions: false
review:
  spec_pass: pending
  quality_pass: pending
links:
  context: S02-CONTEXT.md
  research: S02-RESEARCH.md
  plan: S02-PLAN.md
  uat: S02-UAT.md
  summary: S02-SUMMARY.md
---

## Story

S02 locks test coverage and contract verification for the card discovery surface and the deck builder, establishing the slice boundary that S03–S06 build on. No new runtime wiring is introduced — all implementations already exist; this slice audits their structure against wireframes, fills test gaps, and proves the contracts hold under test isolation.

Deliverables: `CardBrowsingPage` (Algolia-backed browse with full wireframe section coverage), `CardDetailPage` (4-tab mobile dual-render, graceful BFF degradation, print selector), `SearchPageLayout` (Algolia InstantSearchNext + breadcrumbs + CardSearchGrid), `DeckBuilderLayout` (3-panel, "Buy Missing Cards" → CartOptimizerPanel wiring), `DeckSurface` and `DeckZone` (type grouping, collapse/expand, quantity controls, mocked DnD), `MobileDeckBuilder` (tab bar, tap-to-add path, sticky buy bar), `DeckBrowsingPage` and `DeckViewPage` (page structure + ManaCurveChart + buy button). All verified by `npm test`, `npm run typecheck`, and `npm run build` passing clean.

## Acceptance Criteria

1. `CardBrowsingPage` renders all wireframe sections — `GameSelectorStrip`, `CategoryPills`, `PopularSetsCarousel`, `BrowseBreadcrumbs`, `ResultsBar`, numbered pagination, `TrendingStrip`, `SellerCTA` — and is wrapped in Algolia `InstantSearchNext`. Asserted by test checking data-testid or text presence for each section.

2. `CardDetailPage` renders card image with alt text, game attributes section, `MarketplaceListingsSection` with a listings prop, `CompactPrintSelector`, `RelatedCards`, desktop sections, and mobile 4-tab nav. Asserted by test rendering with a mock card prop.

3. `CardDetailPage` shows a graceful degradation banner when `listingsUnavailable: true` is passed. Asserted by test rendering with `listingsUnavailable` prop and querying for the banner text.

4. `SearchPageLayout` renders breadcrumbs (Home → Search Results → query), a results header with hit count, and `CardSearchGrid` — wrapped in Algolia `InstantSearchNext`. All 145+ existing search tests pass with zero regressions.

5. `DeckBuilderLayout` renders "Buy Missing Cards" button when `getMissingCards()` returns a non-empty array, and clicking it passes `isOpen=true` to `CartOptimizerPanel`. Asserted by mocking context, clicking button, and asserting panel prop.

6. `DeckZone` collapses and expands its card list when the collapse header is clicked. Zone header changes to amber/red variant when a `validationErrors` prop is set. Asserted with `userEvent.click` and RTL queries.

7. `DeckZone` quantity increment/decrement calls `updateCardQuantity(sku, zone, qty ± 1)` and the remove button calls `removeCard`. Asserted via mock context spy assertions.

8. `MobileDeckBuilder` renders a 3-tab bar (Deck / Search / Stats), and tapping a search result calls `addCard(card, 'main', 1)` — the tap-to-add path. Asserted by simulating tab switch and result tap.

9. `MobileDeckBuilder` renders the "Buy Missing" sticky bar when `getMissingCards()` returns non-empty; `DndProvider` is never rendered in `MobileDeckBuilder`. Asserted by querying for sticky bar and asserting DndProvider absence.

10. `DeckBrowsingPage` renders hero, `DeckGameTabs`, deck grid items, and pagination. `DeckViewPage` renders card-fan hero, Visual/List/Stats tabs, `ManaCurveChart` in Stats tab, and "Buy Missing Cards" button. Asserted by existing + extended tests.

11. `grep -rn "bg-white\|text-gray-900\|text-black\b\|bg-gray-[0-9]" --include="*.tsx" --exclude-dir="__tests__" storefront/src/components/cards/ storefront/src/components/deck-builder/ storefront/src/components/decks/` returns zero matches.

## Constraints

- All new and extended tests use **Vitest + Testing Library** — no Jest, no Playwright, no ad-hoc DOM scripting
- No bare light-mode Tailwind classes (`bg-white`, `text-gray-900`, `text-black`, `bg-gray-N`) in any S02 component or test file
- No real runtime required — all BFF calls and Algolia providers are mocked; tests must pass with no external services running
- `react-dnd` mocked via `vi.mock('react-dnd', ...)` in all deck-builder tests; no real DndProvider in unit tests
- `npm run typecheck` must exit 0 after all changes
- `npm run build` must exit 0 after all changes
- Child components in deck-builder layout tests are mocked as simple stubs with `data-testid` — isolation over integration in unit tests

## Definition of Done

All of the following must be true before S02 closes:

- `npm test -- --run` — all test files pass, including T01–T07 new and extended files
- `npm run typecheck` — zero errors
- `npm run build` — clean build, zero errors or warnings that weren't present before S02
- `grep -rn "bg-white\|text-gray-900\|text-black\b\|bg-gray-[0-9]" --include="*.tsx" --exclude-dir="__tests__" storefront/src/components/cards/ storefront/src/components/deck-builder/ storefront/src/components/decks/` — zero matches
- All 8 tasks marked `[x]` in S02-PLAN.md
- Changes committed to the `gsd/M001/S02` branch in the storefront sub-repo

## Open Questions

None — plan is fully specified. Wireframes are in `docs/plans/wireframes/`. All implementation files already exist. Test patterns are established. No external dependencies to resolve before execution.

## Affected Repos

`storefront` only. No changes to `backend`, `customer-backend`, or `discord-bot`.

## UI Story

Yes. Card browse, card detail, search, deck builder, mobile deck builder, deck browsing, and deck view are all UI components. This slice exercises their rendered structure, interaction behaviour, and state wiring under test isolation.
