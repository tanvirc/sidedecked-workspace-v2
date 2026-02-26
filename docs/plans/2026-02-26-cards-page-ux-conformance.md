# Cards Page UX Conformance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `/au/cards` conform to the UX wireframes and spec defined in `ux-2-3-wireframe.html` and `ux-2-4-wireframe.html`.

**Architecture:** The Algolia-native components (`AlgoliaSearchResults`, `SearchFilters`, `ActiveFilterChips`, `SortControl`, `FacetGroup`, `PricePresets`) are already built in `storefront/src/components/search/` but are NOT wired into `CardBrowsingPage`. The page still uses the old custom-API approach (`CardFilters`, `ListingFilters`, `SearchControls`). This plan replaces the old wiring and fixes remaining styling gaps.

**Tech Stack:** Next.js 15, React 19, Algolia InstantSearch (`react-instantsearch`, `react-instantsearch-nextjs`), Tailwind 3, CSS custom properties (`--bg-surface-*`, `--interactive`, etc.)

---

## Gap Analysis (Live vs Spec)

| Gap | Severity | File to Fix |
|-----|----------|-------------|
| `CardBrowsingPage` uses old custom-API filters/sort, not Algolia-native components | **Critical** | `CardBrowsingPage.tsx` |
| `ActiveFilterChips` missing sticky row styling, no "No filters active" empty state | High | `search/ActiveFilterChips.tsx` |
| Game facet missing colored 8×8 dots (MTG purple, Pokémon yellow, etc.) | High | `search/SearchFilters.tsx` + `FacetGroup.tsx` |
| Condition facet missing NM/LP/MP/HP/DMG color-coded badges | High | `search/SearchFilters.tsx` + `FacetGroup.tsx` |
| URL routing uses Algolia's verbose default format, not clean params per spec | High | `search/AlgoliaSearchResults.tsx` |
| `SortControl` missing gold arrow indicator + active sort chip | Medium | `search/SortControl.tsx` |
| Missing Language filter in sidebar | Medium | `search/SearchFilters.tsx` |
| Footer copyright shows "© 2024" | Low | footer component |

---

## Task 1: Replace old filters/sort in `CardBrowsingPage` with `AlgoliaSearchResults`

**Files:**
- Modify: `storefront/src/components/cards/CardBrowsingPage.tsx`
- Reference: `storefront/src/components/search/AlgoliaSearchResults.tsx`

**Context:** `CardBrowsingPage` renders a 3-column layout: left sidebar (`CardFilters` + `ListingFilters`) + main content (`SearchControls` + `CardGrid`) + right sidebar (`SearchAnalytics` + `MyDecksWidget`). The Algolia-native `AlgoliaSearchResults` component already contains its own sidebar + content columns matching spec. We need to embed it while preserving the right sidebar.

**Step 1: Read the current layout structure**

```bash
# Read the key layout section of CardBrowsingPage
```
Read `storefront/src/components/cards/CardBrowsingPage.tsx` lines 1–80 to find the grid layout structure.

**Step 2: Write the failing test**

In `storefront/src/components/cards/__tests__/CardBrowsingPage.test.tsx`, add:

```tsx
it("renders AlgoliaSearchResults instead of CardFilters", () => {
  render(<CardBrowsingPage ... />)
  expect(screen.queryByTestId("old-card-filters")).not.toBeInTheDocument()
  expect(document.querySelector('[data-testid="algolia-results"]')).toBeInTheDocument()
})
```

**Step 3: Run to verify it fails**

```bash
cd storefront && npm test -- --run CardBrowsingPage
```
Expected: FAIL (old-card-filters test).

**Step 4: Refactor CardBrowsingPage layout**

Replace the 3-column grid section that contains `CardFilters` + `ListingFilters` + `SearchControls` + `CardGrid` with `AlgoliaSearchResults`. Keep `MyDecksWidget` and `SearchAnalytics` in the right column.

The new layout in `CardBrowsingContent`:
```tsx
// BEFORE (remove these imports and usages):
// import { CardFilters } from "./CardFilters"
// import { ListingFilters } from "./ListingFilters"
// import { SearchControls } from "./SearchControls"
// import { CardGrid } from "./CardGrid"

// ADD this import:
import { AlgoliaSearchResults } from "@/components/search/AlgoliaSearchResults"

// REPLACE the old 3-col grid with:
<div className="flex gap-6 items-start">
  {/* Algolia search: owns its own sidebar (240px) + results (flex-1) */}
  <AlgoliaSearchResults initialQuery={initialQuery} data-testid="algolia-results" />

  {/* Right sidebar: analytics + deck builder */}
  <aside className="hidden xl:flex flex-col gap-6 w-72 flex-shrink-0 sticky top-24">
    <SearchAnalytics gameCode={gameCode} />
    <MyDecksWidget games={selectedGames} collapsed />
  </aside>
</div>
```

Pass `initialQuery` from the URL `q` param (already parsed in `page.tsx`).

**Step 5: Run test to verify it passes**

```bash
cd storefront && npm test -- --run CardBrowsingPage
```
Expected: PASS.

**Step 6: Commit**

```bash
git add storefront/src/components/cards/CardBrowsingPage.tsx storefront/src/components/cards/__tests__/CardBrowsingPage.test.tsx
git commit -m "feat(storefront): wire AlgoliaSearchResults into cards page"
```

---

## Task 2: Fix `ActiveFilterChips` — sticky row with empty state

**Files:**
- Modify: `storefront/src/components/search/ActiveFilterChips.tsx`
- Reference spec: chip row has `--bg-surface-1` background, 1px `--border-subtle` border-bottom, min-height 44px, "No filters active" italic text when empty, "Clear All" button in red when active.

**Step 1: Write failing test**

In `storefront/src/components/search/__tests__/ActiveFilterChips.test.tsx` (create if not exists):

```tsx
import { renderWithInstantSearch } from "../../../test/helpers/renderWithInstantSearch"
import { ActiveFilterChips } from "../ActiveFilterChips"

it("shows empty-state message when no filters active", () => {
  renderWithInstantSearch(<ActiveFilterChips />)
  expect(screen.getByText("No filters active — showing all results")).toBeInTheDocument()
})

it("shows chip row wrapper when filters active", () => {
  // Mock useCurrentRefinements to return an item
  renderWithInstantSearch(<ActiveFilterChips />, { refinements: [{ attribute: "game", label: "Pokémon" }] })
  expect(screen.getByRole("list")).toBeInTheDocument()
})
```

**Step 2: Run to verify it fails**

```bash
cd storefront && npm test -- --run ActiveFilterChips
```

**Step 3: Update `ActiveFilterChips.tsx`**

```tsx
"use client"

import { useCurrentRefinements } from "react-instantsearch"

const CONDITION_LABELS: Record<string, string> = {
  NM:  "Near Mint",
  LP:  "Lightly Played",
  MP:  "Moderately Played",
  HP:  "Heavily Played",
  DMG: "Damaged",
}

function resolveLabel(label: string): string {
  return CONDITION_LABELS[label] ?? label
}

export function ActiveFilterChips() {
  const { items } = useCurrentRefinements()

  const clearAll = () => {
    for (const item of items) {
      for (const refinement of item.refinements) {
        item.refine(refinement)
      }
    }
  }

  const chipRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    background: "var(--bg-surface-1, #13141A)",
    borderBottom: "1px solid var(--border-subtle, rgba(255,255,255,0.06))",
    minHeight: 44,
    overflowX: "auto",
    scrollbarWidth: "none",
  }

  if (items.length === 0) {
    return (
      <div style={chipRowStyle}>
        <span style={{ fontSize: 12, color: "var(--text-tertiary, #4F5568)", fontStyle: "italic" }}>
          No filters active — showing all results
        </span>
      </div>
    )
  }

  return (
    <div style={chipRowStyle}>
      <ul
        role="list"
        style={{ display: "flex", alignItems: "center", gap: 6, listStyle: "none", margin: 0, padding: 0, flexShrink: 0, flexWrap: "wrap" }}
      >
        {items.flatMap((item) =>
          item.refinements.map((refinement) => {
            const displayLabel = resolveLabel(refinement.label)
            return (
              <li key={`${item.attribute}:${refinement.value}`}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(124,140,255,0.12)",
                    border: "1px solid rgba(124,140,255,0.3)",
                    color: "var(--interactive, #7C8CFF)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayLabel}
                  <button
                    aria-label={`Remove ${displayLabel} filter`}
                    onClick={() => item.refine(refinement)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--interactive, #7C8CFF)",
                      fontSize: 14,
                      lineHeight: 1,
                      padding: 0,
                      marginLeft: 2,
                      opacity: 0.7,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                  >
                    ×
                  </button>
                </span>
              </li>
            )
          })
        )}
      </ul>

      <button
        onClick={clearAll}
        style={{
          marginLeft: "auto",
          flexShrink: 0,
          fontSize: 12,
          fontWeight: 500,
          padding: "4px 12px",
          borderRadius: 999,
          border: "1px solid rgba(239,83,80,0.3)",
          color: "var(--negative, #EF5350)",
          background: "transparent",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Clear All
      </button>
    </div>
  )
}
```

**Step 4: Run tests**

```bash
cd storefront && npm test -- --run ActiveFilterChips
```
Expected: PASS.

**Step 5: Commit**

```bash
git add storefront/src/components/search/ActiveFilterChips.tsx storefront/src/components/search/__tests__/ActiveFilterChips.test.tsx
git commit -m "fix(storefront): style ActiveFilterChips to match spec"
```

---

## Task 3: Add game color dots and condition badges to `SearchFilters` / `FacetGroup`

**Files:**
- Modify: `storefront/src/components/search/SearchFilters.tsx`
- Reference: `FacetGroup` already accepts `renderLabel?: (value: string) => React.ReactNode`

**Spec colors:**
- MTG: `#A855F7` | Pokémon: `#FBBF24` | Yu-Gi-Oh!: `#60A5FA` | One Piece: `#34D399`
- NM: `#4ADE80` (green) | LP: rgba(74,222,128,0.7) | MP: `#FBBF24` | HP: `#EF5350` | DMG: rgba(239,83,80,0.6)

**Step 1: Write failing test**

In `storefront/src/components/search/__tests__/SearchFilters.test.tsx`:

```tsx
it("renders colored dot for MTG game option", () => {
  renderWithInstantSearch(<SearchFilters activeFilterCount={0} />)
  // Expand Game facet
  fireEvent.click(screen.getByText("Game"))
  const dot = document.querySelector('[data-game-dot="MTG"]')
  expect(dot).toBeInTheDocument()
  expect(dot).toHaveStyle({ background: "#A855F7" })
})

it("renders NM badge with green color", () => {
  renderWithInstantSearch(<SearchFilters activeFilterCount={0} />)
  fireEvent.click(screen.getByText("Condition"))
  expect(screen.getByText("NM")).toHaveStyle({ color: "#4ADE80" })
})
```

**Step 2: Run to verify fails**

```bash
cd storefront && npm test -- --run SearchFilters
```

**Step 3: Update `SearchFilters.tsx` to use `renderLabel`**

Add these helper functions and update `FilterPanelContents`:

```tsx
const GAME_DOTS: Record<string, string> = {
  MTG:     "#A855F7",
  POKEMON: "#FBBF24",
  YUGIOH:  "#60A5FA",
  OPTCG:   "#34D399",
}

const CONDITION_BADGES: Record<string, { color: string; bg: string }> = {
  NM:  { color: "#4ADE80",                   bg: "rgba(74,222,128,0.15)" },
  LP:  { color: "rgba(74,222,128,0.7)",       bg: "rgba(74,222,128,0.08)" },
  MP:  { color: "#FBBF24",                   bg: "rgba(251,191,36,0.12)" },
  HP:  { color: "#EF5350",                   bg: "rgba(239,83,80,0.12)" },
  DMG: { color: "rgba(239,83,80,0.6)",       bg: "rgba(239,83,80,0.08)" },
}

function GameLabel({ value }: { value: string }) {
  const color = GAME_DOTS[value]
  const name = { MTG: "MTG", POKEMON: "Pokémon", YUGIOH: "Yu-Gi-Oh!", OPTCG: "One Piece" }[value] ?? value
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {color && (
        <span
          data-game-dot={value}
          style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }}
        />
      )}
      {name}
    </span>
  )
}

function ConditionLabel({ value }: { value: string }) {
  const badge = CONDITION_BADGES[value]
  const fullNames: Record<string, string> = {
    NM: "Near Mint", LP: "Lightly Played", MP: "Moderately Played",
    HP: "Heavily Played", DMG: "Damaged",
  }
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {badge && (
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
          background: badge.bg, color: badge.color,
        }}>
          {value}
        </span>
      )}
      {fullNames[value] ?? value}
    </span>
  )
}
```

Then update `FilterPanelContents`:
```tsx
function FilterPanelContents() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <FacetGroup attribute="game"      title="Game"      defaultOpen renderLabel={(v) => <GameLabel value={v} />} />
      <FacetGroup attribute="condition" title="Condition"  defaultOpen renderLabel={(v) => <ConditionLabel value={v} />} />
      <div style={{ padding: "8px 16px 4px", fontSize: 11, color: "var(--text-secondary, #8B93A6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Price Range
      </div>
      <PricePresets attribute="lowest_price" />
      <FacetGroup attribute="set_name" title="Set" />
      <FacetGroup attribute="rarity"   title="Rarity" />
      <FacetGroup attribute="language" title="Language" />
    </div>
  )
}
```

**Step 4: Run tests**

```bash
cd storefront && npm test -- --run SearchFilters
```
Expected: PASS.

**Step 5: Commit**

```bash
git add storefront/src/components/search/SearchFilters.tsx storefront/src/components/search/__tests__/SearchFilters.test.tsx
git commit -m "fix(storefront): add game dots and condition badges to filter sidebar"
```

---

## Task 4: Fix URL routing — clean params per spec

**Files:**
- Modify: `storefront/src/components/search/AlgoliaSearchResults.tsx`

**Spec URL format:** `?q=charizard&game=pokemon&condition=NM&sort=price-asc`
**Current format:** Algolia default verbose format via `singleIndex(CARDS_INDEX)`

**Step 1: Check lib/algolia.ts for index constants**

Read `storefront/src/lib/algolia.ts` to confirm `CARDS_INDEX`, `CARDS_INDEX_PRICE_ASC`, `CARDS_INDEX_PRICE_DESC` constants.

**Step 2: Write failing test**

In `storefront/src/components/search/__tests__/AlgoliaSearchResults.test.tsx`:

```tsx
it("uses clean URL param format", () => {
  // Check that routing stateMapping maps 'game' facet to ?game= param
  const { router } = renderAlgoliaResults({ query: "pikachu" })
  // After selecting Pokémon facet, URL should be ?q=pikachu&game=POKEMON
  // (Test the stateMapping function directly)
  const { stateToRoute, routeToState } = createCardsStateMapping()
  const route = stateToRoute({ [CARDS_INDEX]: { query: "pikachu", refinementList: { game: ["POKEMON"] } } })
  expect(route).toEqual({ q: "pikachu", game: ["POKEMON"] })
})
```

**Step 3: Create `createCardsStateMapping()` helper and update `AlgoliaSearchResults`**

In `AlgoliaSearchResults.tsx`, replace `singleIndex(CARDS_INDEX)` with a custom `stateMapping`:

```tsx
import { UiState } from "instantsearch.js"
import { CARDS_INDEX, CARDS_INDEX_PRICE_ASC, CARDS_INDEX_PRICE_DESC } from "@/lib/algolia"

const SORT_TO_PARAM: Record<string, string> = {
  [CARDS_INDEX]:           "relevance",
  [CARDS_INDEX_PRICE_ASC]: "price-asc",
  [CARDS_INDEX_PRICE_DESC]:"price-desc",
}
const PARAM_TO_SORT: Record<string, string> = Object.fromEntries(
  Object.entries(SORT_TO_PARAM).map(([k, v]) => [v, k])
)

export function createCardsStateMapping() {
  return {
    stateToRoute(uiState: UiState) {
      const indexState = uiState[CARDS_INDEX] ?? {}
      const route: Record<string, unknown> = {}
      if (indexState.query) route.q = indexState.query
      const facets = indexState.refinementList ?? {}
      if (facets.game?.length)      route.game      = facets.game
      if (facets.rarity?.length)    route.rarity    = facets.rarity
      if (facets.condition?.length) route.condition = facets.condition
      if (facets.set_name?.length)  route.set       = facets.set_name
      if (facets.language?.length)  route.language  = facets.language
      const numericFacets = indexState.numericMenu ?? {}
      if (numericFacets.lowest_price) route.price = numericFacets.lowest_price
      if (indexState.sortBy && indexState.sortBy !== CARDS_INDEX) {
        route.sort = SORT_TO_PARAM[indexState.sortBy]
      }
      return route
    },
    routeToState(routeState: Record<string, unknown>): UiState {
      const refinementList: Record<string, string[]> = {}
      if (routeState.game)      refinementList.game      = [routeState.game].flat() as string[]
      if (routeState.rarity)    refinementList.rarity    = [routeState.rarity].flat() as string[]
      if (routeState.condition) refinementList.condition = [routeState.condition].flat() as string[]
      if (routeState.set)       refinementList.set_name  = [routeState.set].flat() as string[]
      if (routeState.language)  refinementList.language  = [routeState.language].flat() as string[]
      return {
        [CARDS_INDEX]: {
          query: (routeState.q as string) ?? "",
          refinementList,
          numericMenu: routeState.price ? { lowest_price: routeState.price as string } : undefined,
          sortBy: routeState.sort ? PARAM_TO_SORT[routeState.sort as string] : undefined,
        },
      }
    },
  }
}
```

Then in `AlgoliaSearchResults`:
```tsx
export function AlgoliaSearchResults({ initialQuery }: AlgoliaSearchResultsProps) {
  return (
    <InstantSearchNext
      searchClient={algoliaClient}
      indexName={CARDS_INDEX}
      routing={{ stateMapping: createCardsStateMapping() }}
      initialUiState={{ [CARDS_INDEX]: { query: initialQuery } }}
    >
      <Configure hitsPerPage={20} />
      <ResultsBody initialQuery={initialQuery} />
    </InstantSearchNext>
  )
}
```

**Step 4: Run tests**

```bash
cd storefront && npm test -- --run AlgoliaSearchResults
```
Expected: PASS.

**Step 5: Commit**

```bash
git add storefront/src/components/search/AlgoliaSearchResults.tsx storefront/src/components/search/__tests__/AlgoliaSearchResults.test.tsx
git commit -m "fix(storefront): use clean URL params for Algolia search state"
```

---

## Task 5: Fix `SortControl` styling — active indicator and gold arrow

**Files:**
- Modify: `storefront/src/components/search/SortControl.tsx`

**Spec:** When sort is not "Relevance", show a sort active chip: `↑` or `↓` icon in gold (`--accent-primary: #D4A843`), label text, styled as a pill with `--bg-surface-2` background.

**Step 1: Write failing test**

```tsx
it("shows active sort indicator when Price sort selected", () => {
  renderWithInstantSearch(<SortControl />, { sortBy: CARDS_INDEX_PRICE_ASC })
  expect(screen.getByText("↑")).toBeInTheDocument()
})
```

**Step 2: Update `SortControl.tsx`**

```tsx
export function SortControl() {
  const { currentRefinement, refine } = useSortBy({ items: SORT_ITEMS })
  const isActive = currentRefinement !== CARDS_INDEX
  const isAsc = currentRefinement === CARDS_INDEX_PRICE_ASC

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <label
        htmlFor={SELECT_ID}
        style={{ fontSize: 12, color: "var(--text-tertiary, #4F5568)", whiteSpace: "nowrap" }}
      >
        Sort:
      </label>
      {isActive && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 999,
          background: "var(--bg-surface-2, #1A1C24)", border: "1px solid rgba(255,255,255,0.10)",
          color: "var(--text-primary, #E8ECF1)",
        }}>
          <span style={{ color: "var(--accent-primary, #D4A843)", fontWeight: 700 }}>
            {isAsc ? "↑" : "↓"}
          </span>
          {isAsc ? "Price: Low to High" : "Price: High to Low"}
        </span>
      )}
      <select
        id={SELECT_ID}
        value={currentRefinement}
        onChange={(e) => refine(e.target.value)}
        style={{
          fontSize: 12,
          background: "var(--bg-surface-2, #1A1C24)",
          color: "var(--text-primary, #E8ECF1)",
          border: "1.5px solid rgba(255,255,255,0.10)",
          borderRadius: 6,
          padding: "5px 8px",
          cursor: "pointer",
        }}
      >
        {SORT_ITEMS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  )
}
```

**Step 3: Run tests**

```bash
cd storefront && npm test -- --run SortControl
```

**Step 4: Commit**

```bash
git add storefront/src/components/search/SortControl.tsx
git commit -m "fix(storefront): add sort active indicator to SortControl"
```

---

## Task 6: Update footer copyright year

**Files:**
- Find the footer component: `storefront/src/components/organisms/Footer/` or similar

**Step 1: Find footer component**

```bash
grep -r "2024 SideDecked" storefront/src --include="*.tsx" -l
```

**Step 2: Update to dynamic year**

Replace the hardcoded year:
```tsx
// BEFORE
© 2024 SideDecked

// AFTER
© {new Date().getFullYear()} SideDecked
```

**Step 3: Run quality gate**

```bash
cd storefront && npm run lint && npm run typecheck
```

**Step 4: Commit**

```bash
git add <footer-file>
git commit -m "fix(storefront): update footer copyright to current year"
```

---

## Task 7: Quality Gate + Verification

**Step 1: Run full quality gate**

```bash
cd storefront && npm run lint && npm run typecheck && npm run build && npm test
```
Expected: 0 errors, 0 type errors, build succeeds, all tests pass.

**Step 2: Check coverage**

```bash
cd storefront && npm run test:coverage
```
Expected: ≥80% coverage on modified files.

**Step 3: Smoke test on staging**

After deployment, verify at `https://www.sidedecked.com/au/cards`:
- [ ] Algolia search results load (not "loading state")
- [ ] Filter chips row visible below search bar
- [ ] "No filters active — showing all results" shown before any filter is applied
- [ ] Game filter shows colored dots (MTG purple, etc.)
- [ ] Condition filter shows NM/LP/MP/HP/DMG badges with correct colors
- [ ] Price filter shows preset buttons (Under £5, £5–£20, etc.), not range inputs
- [ ] Sort options are "Relevance", "Price: Low to High", "Price: High to Low"
- [ ] When sorted by price, gold ↑/↓ active indicator appears
- [ ] URL uses clean params: `?q=charizard&game=POKEMON&condition=NM`
- [ ] Results count shows "**N** results for 'charizard'"
- [ ] Footer shows current year (not 2024)

---

## Execution Order

Tasks are sequential (each builds on the previous):
1 → 2 → 3 → 4 → 5 → 6 → 7

Task 1 is the most impactful — it wires in all the already-built Algolia components. Tasks 2–5 polish the components that Task 1 brings in. Tasks 6–7 are independent cleanups.
