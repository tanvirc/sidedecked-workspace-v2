# S02 Context: Card Browse, Detail, Search + Deck Builder

## Purpose

Lock test coverage and slice-boundary contracts for the card discovery surface (browse, detail, search) and the deck builder (DeckBuilderLayout, DeckSurface, DeckZone, MobileDeckBuilder, DeckBrowsingPage, DeckViewPage) before S03–S06 depend on these surfaces.

S01 proved the optimizer algorithm and locked shared components (Header, Footer, PriceTag, skeletons, BFF endpoints). S02 proves the UI contract layer above that foundation. S06 — the final end-to-end integration — consumes deck builder state, owned-cards wiring, and `CartOptimizerPanel` directly; if those contracts are undefined or untested, S06 has no stable surface to integrate against.

## Implementation Status

**Not started.** Plan frozen, gates passed, ready to execute. Active slice per `STATE.md`. Begin with T01 (CardBrowsingPage audit + tests).

## Architecture Notes

### Card Browse — `CardBrowsingPage`

Wraps Algolia `InstantSearchNext`. Renders a fixed wireframe section order: `GameSelectorStrip` (multi-game toggle) → `CategoryPills` (type filter) → `PopularSetsCarousel` (horizontal scroll) → `BrowseBreadcrumbs` → `ResultsBar` (live hit count) → card grid → numbered pagination → `TrendingStrip` (placeholder or live) → `SellerCTA`. Wireframe source: `docs/plans/wireframes/storefront-cards.html`. Tests mock the Algolia provider; `InstantSearchNext` is wrapped so tests don't require a real Algolia index.

### Card Detail — `CardDetailPage` (D015)

Dual-render for desktop/mobile. Desktop sections: `hidden md:block`. Mobile 4-tab nav: `md:hidden`. Tabs: Info / Listings / Prints / Similar. Graceful degradation: `MarketplaceListingsSection` receives a `listingsUnavailable: boolean` prop; when `true`, renders a banner instead of the listings table — no 500, no crash. Print selector is `CompactPrintSelector`. BFF source is the S01 `GET /api/cards/[id]` endpoint. Wireframe source: `docs/plans/wireframes/storefront-card-detail.html`.

### Search — `SearchPageLayout`

Wraps Algolia `InstantSearchNext`. Structure: breadcrumbs (Home → Search Results → `{query}`) → results header with live hit count → `CardSearchGrid` (sidebar filters + grid). Existing `SearchPageWiring.test.tsx` covers 145 assertions — must not regress. Wireframe source: `docs/plans/wireframes/storefront-search.html`.

### Deck Builder — `DeckBuilderLayout`, `DeckSurface`, `DeckZone`, `MobileDeckBuilder`

State is owned by `DeckBuilderContext` (React context). DnD uses `react-dnd` with `HTML5Backend` on desktop. Mobile path uses tap-to-add (no DnD) — `MobileDeckBuilder` explicitly must not render `DndProvider`.

**`DeckBuilderLayout`** — 3-panel composer: left = `DeckSearchPanel` (collapsible), center = `DeckSurface`, right = `DeckStats`. "Buy Missing Cards" button shown when `getMissingCards()` returns non-empty; clicking opens `CartOptimizerPanel` (`isOpen=true`). `MobileDeckBuilder` rendered at mobile breakpoint.

**`DeckSurface`** — Cards grouped by type (Creature/Instant/Land/etc.). Tab bar switches between Zones view and List view (D017: native tab bar, not Radix Tabs). Total card count in header.

**`DeckZone`** (D018: collapse state is `useState` local, not context) — Renders zone title + card count badge. Clicking collapse header toggles card list visibility. Quantity increment/decrement calls `updateCardQuantity(sku, zone, qty)` on context. Remove button calls `removeCard`. Zone header turns amber/red on `validationErrors` prop (over-limit).

**`MobileDeckBuilder`** — 3-tab bar: Deck / Search / Stats. Deck tab shows card list grouped by type. Search tab shows search input + results; tapping a result calls `addCard(card, 'main', 1)` — this is the tap-to-add path. Stats tab renders mana curve/stats. "Buy Missing" sticky bar renders when `getMissingCards()` returns non-empty.

### Deck Browsing + View — `DeckBrowsingPage`, `DeckViewPage`

`DeckBrowsingPage` at `/decks`: hero section, `DeckGameTabs`, 3-col deck grid, pagination, community stats. Wireframe: `docs/plans/wireframes/storefront-deck-browser.html`.

`DeckViewPage` at `/decks/[id]`: card-fan hero (rendered cards from zone data), Visual/List/Stats tab layout, `ManaCurveChart` in Stats tab, pricing summary, "Buy Missing Cards" button in header (opens `CartOptimizerPanel`). Wireframe: `docs/plans/wireframes/storefront-deck-viewer.html`.

### Test Pattern

- Mock `next/navigation` (`useRouter`, `useSearchParams`, `usePathname`)
- Mock Algolia providers (`InstantSearchNext`, `useHits`, `useSearchBox`) with lightweight stubs
- Mock `react-dnd` in all deck-builder tests: `vi.mock('react-dnd', () => ({ useDrop: () => [{ isOver: false }, vi.fn()], useDrag: () => [{ isDragging: false }, vi.fn(), vi.fn()] }))`
- Mock `DeckBuilderContext` via `vi.mock` returning controlled state
- Mock child components (DeckSurface, DeckSearchPanel, DeckStats, MobileDeckBuilder, CartOptimizerPanel) as simple stubs with `data-testid` in layout-level tests to isolate unit under test
- Voltage compliance: grep for bare light-mode classes before committing

## Upstream Dependencies from S01

| Artifact | Source | Used by |
|---|---|---|
| `CardGridSkeleton` | S01 | CardBrowsingPage loading state |
| `PriceTag` | S01 | Listing rows in CardDetailPage, DeckViewPage pricing |
| `optimizeCart()` | S01 | `CartOptimizerPanel` internals |
| `POST /api/optimizer/listings` BFF | S01 | `CartOptimizerPanel` fetch |
| `GET /api/cards/[id]` BFF | S01 | `CardDetailPage` data source |

All S01 surfaces are locked. S02 tests mock the BFF calls — no live S01 runtime needed during test runs.

## Key Decisions Referenced

| Decision | Summary |
|---|---|
| **D015** | Card detail mobile 4-tab dual-render: desktop sections use `hidden md:block`, mobile tab nav uses `md:hidden`. Both DOM subtrees exist simultaneously — tab switching is CSS visibility, not unmount/mount. |
| **D017** | `DeckSurface` uses native `<button>` tab bar, not Radix Tabs. Avoids Radix peer dependency for a simple 2-tab toggle. Tests assert against role=`tab` or data-testid — not Radix-specific selectors. |
| **D018** | `DeckZone` collapse state is local `useState` on the zone component itself. Not lifted to context. Means collapse state is not persisted across unmounts — intentional for simplicity. Tests confirm state resets on remount. |

## Key Files

| File | Status | Task |
|---|---|---|
| `storefront/src/components/cards/__tests__/CardBrowsingPage.test.tsx` | extend | T01 |
| `storefront/src/components/cards/CardBrowsingPage.tsx` | audit (read-only) | T01 |
| `storefront/src/components/cards/CardDetailPage.test.tsx` | extend | T02 |
| `storefront/src/components/cards/CardDetailPage.tsx` | audit + fix leaks | T02 |
| `storefront/src/components/search/__tests__/SearchPageWiring.test.tsx` | extend if needed | T03 |
| `storefront/src/components/search/SearchPageLayout.tsx` | audit | T03 |
| `storefront/src/components/deck-builder/__tests__/DeckBuilderLayout.test.tsx` | **create** | T04 |
| `storefront/src/components/deck-builder/__tests__/DeckSurface.test.tsx` | **create** | T05 |
| `storefront/src/components/deck-builder/__tests__/DeckZone.test.tsx` | **create** | T05 |
| `storefront/src/components/deck-builder/__tests__/MobileDeckBuilder.test.tsx` | **create** | T06 |
| `storefront/src/components/decks/__tests__/DeckBrowsingPage.test.tsx` | extend if needed | T07 |
| `storefront/src/components/decks/__tests__/DeckViewPage.test.tsx` | extend if needed | T07 |

## Known Risks

**HTML5Backend has no touch support.** `react-dnd` with `HTML5Backend` fires no events on touch devices. The desktop drag-and-drop in `DeckSurface`/`DeckZone` is fully broken on mobile. This is known and intentional — `MobileDeckBuilder` provides the tap-to-add path as the mobile-first UX. The risk is:
- If a user opens the deck builder on a tablet in "desktop mode", they get no DnD and no tap-to-add
- The `MobileDeckBuilder` breakpoint cutoff (likely Tailwind `md`) must be tuned to catch tablet-sized viewports

This is out of scope for S02 testing (unit tests can't detect this) but flagged here for S06 UAT.

**`CardDetailSkeleton` may not exist.** T02 notes that if `CardDetailSkeleton` is used in the loading state, it may need to be created (S01 follow-up). The executor should check before assuming it exists.

## Forward Intelligence for S03–S06

**S03 (Homepage + Remaining Pages):** `CardBrowsingPage`'s `TrendingStrip` is stubbed in S02. S03 may need to wire `fetchTrendingCards()` into it — verify the stub is replaceable without touching browse tests.

**S04 (Auth):** No S02 surfaces are auth-gated. Auth integration starts in S05 for the listing wizard. S02 tests run without any auth mocking.

**S05 (Listing Wizard):** `CardDetailPage` renders `MarketplaceListingsSection`. When a seller creates a listing via the S05 wizard, it should appear in this section. The `listingsUnavailable` degradation path must remain intact — S05 should not change how `CardDetailPage` receives its data prop.

**S06 (Deck-to-Cart Integration):** S06 directly consumes:
- `DeckBuilderContext` — specifically `getMissingCards()`, `addCard()`, `toggleOwned()`
- `CartOptimizerPanel` — `isOpen` prop wiring from `DeckBuilderLayout`
- `syncServerOwnedCards()` — merges server-owned SKUs into `useOwnedCards()` state
- `MobileDeckBuilder` tap-to-add path — the `addCard(card, 'main', 1)` call tested in T06

The contracts for all of these are locked by S02 tests. Any S06 change that breaks these test files should be treated as a contract violation.
