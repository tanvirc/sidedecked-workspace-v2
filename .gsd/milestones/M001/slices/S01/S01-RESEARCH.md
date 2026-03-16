# S01: Design Foundation + Cart Optimizer Algorithm — Research

**Slice:** S01  
**Milestone:** M001  
**Gate type:** Design/Plan retrospective gate (post-completion)  
**Gate status:** CONFIRMED PASSED  
**Date:** 2026-03-16

---

## Technical Landscape

What existed at slice completion — all were pre-existing implementations verified by S01's test and audit pass.

### UI Components (`storefront/src/components/`)

| Component | Location | What it does |
|---|---|---|
| `ModernHeader` | `organisms/Header/ModernHeader.tsx` | Glassmorphic sticky nav, 5 links, icon row, mobile hamburger + bottom bar |
| `Footer` | `organisms/Footer/Footer.tsx` | Gradient wordmark, nav columns, 3 social icons, copyright year |
| `PriceTag` | `tcg/PriceTag.tsx` | Three display variants (compact/inline/detailed); `.price` CSS class for tabular DM Mono figures |
| `CardGridSkeleton` | `cards/CardGridSkeleton.tsx` | Configurable count of shimmer skeleton tiles with dashed borders |

All components use Voltage CSS custom properties (`var(--token)` inline or CSS class). No light-mode Tailwind classes (`bg-white`, `text-gray-*`, `bg-gray-*`).

### BFF Routes (`storefront/src/app/api/`)

| Route | Pattern | Key behavior |
|---|---|---|
| `GET /api/cards/[id]` | Dual-source `Promise.allSettled` | Catalog hard dep (404 on miss); listings soft dep (200 + `listingsUnavailable: true` on failure) |
| `POST /api/optimizer/listings` | Batch-5 `Promise.allSettled` | Validates ≤60 SKUs, fetches in groups of 5, partial failures → `partialFailures[]`, optimizer runs on available data |

### Optimizer (`storefront/src/lib/optimizer/`)

| File | Role |
|---|---|
| `types.ts` | `Listing`, `SellerGroup`, `OptimizationResult`, `OptimizationMode` |
| `optimizeCart.ts` | Pure greedy function — scarcity sort → mode-specific picker → shipping amortization → savings delta |

**Proven:** < 1 ms for 15-card × 10-seller fixture. Three modes: `cheapest`, `fewest-sellers`, `best-value` (15% cost-premium threshold).

### Test Coverage

85 tests across 8 files. One new file created (`ModernHeader.test.tsx`); all others pre-existed.

| File | Tests | Scope |
|---|---|---|
| `ModernHeader.test.tsx` | 14 | Nav links, cart badge, auth states, mobile toggle |
| `Footer.test.tsx` | 6 | Nav links, social icons, copyright |
| `PriceTag.test.tsx` | 9 | All 3 variants, null price, trends |
| `CardGridSkeleton.test.tsx` | 7 | Count prop, layout, animation |
| `cardDetailBFF.test.ts` | 13 | Degradation, trust merge, condition sort |
| `route.test.ts` (card detail) | 5 | Happy path, 404, 5xx, timeout |
| `optimizeCart.test.ts` | 22 | 3 modes, edge cases, perf |
| `listings.test.ts` (optimizer BFF) | 8 | Batching, partial failure, validation |

---

## Design/Plan Gate — Panel Transcript

**Date:** 2026-03-16  
**Slice:** S01 — Design Foundation + Cart Optimizer Algorithm  
**Panel purpose:** Retrospective evaluation of whether the approach decisions made at plan time held up against actual implementation and test results.

---

### Sally — UX/Design

Evaluating: visual design decisions, component structure, Voltage token compliance.

The Voltage token enforcement approach is sound and verifiable. The decision to apply tokens via `style={{ color: 'var(--token)' }}` or token-referencing CSS classes (D009) is the right call given Tailwind has no Voltage utility classes — it forces intent at the call site rather than letting someone reach for `text-gray-900` by habit. The grep audit as a verification mechanism (zero `bg-white`, `text-gray-*`, `bg-gray-*` matches on Header/Footer/PriceTag) is lightweight but sufficient as a structural guarantee; it catches class-based drift, which is the most common failure mode.

The `.price` CSS class decision (D008) is correct. Centralising tabular figure rendering in `globals.css` means every usage context — grid item, table cell, detail page, optimizer result panel — gets consistent DM Mono alignment without per-component repetition. The alternative (inline `fontFamily`/`color` on each variant) would have produced misalignment bugs in any column layout. The DOM inspection approach in tests (confirm class attribute present, not font rendering) is an accepted limitation given jsdom's no-font constraint — this is standard practice, not a gap.

`CardGridSkeleton` with configurable count and dashed border is well-suited for loading states. `CardDetailSkeleton` absence is the one design incompleteness worth naming: the plan listed it as a T04 deliverable, it was not found, and S02 inherits this debt. The deferral is pragmatic (it wasn't needed by anything that shipped in S01) but it needs to land before S02 ships a card detail page.

One note: the Header light-mode glassmorphic branch is untested (mocked to `theme: "dark"` always). For a design token system, this is a meaningful gap — the glassmorphic background formula almost certainly behaves differently in light mode. S02 or an isolated task should add a light-mode render pass.

**Verdict: PASS.** Token compliance verified, `.price` class decision sound, design gaps surfaced and appropriately deferred.

---

### John — QA

Evaluating: test coverage breadth, edge case handling, performance tests.

85 tests across 8 files is a solid baseline for a foundations slice. The coverage spread is well-proportioned — the most complex surfaces (optimizer algorithm, BFF degradation) carry the most tests (22 and 13+5 respectively), while the simpler UI components carry lighter but still meaningful suites (6–14 each).

Edge case handling is thorough where it matters most. The optimizer suite covers: single seller, empty input, zero listings per SKU (`unassignedCards`), all three modes on the 15×10 fixture, and the `best-value` 15% threshold boundary. The BFF suites cover: happy path, catalog 404, listings 5xx, listings timeout, all-SKUs-fail, one-SKU-fail, empty input (400), invalid mode (400). These are the exact failure modes that would surface in production.

The performance test approach — `Date.now()` delta against a 15×10 fixture — is pragmatic. The plan specified < 50 ms; the implementation clears < 1 ms. There's a 50× headroom margin, which means this test is not flaky under any realistic CI timing variance. The plan also specified a 60-card input for performance testing; the actual fixture is 15×10. The 15×10 fixture is a fairer representation of the optimizer's intended input profile (15 distinct SKUs, 10 sellers each), and the result still substantially clears the < 50 ms target.

Two coverage gaps worth noting: (1) Header light-mode branch untested — low priority given dark-mode is primary, but flagged; (2) Header dropdown interaction untested — CSS `:hover` is invisible to jsdom, so dropdown open/close isn't covered. Neither blocks S01 completion; both are documented.

The contract between test and code is clean: the Definition of Done is machine-verifiable (`npm test -- --run` + two greps), there's no subjective judgment involved, and the status line ("all three checks passed as of 2026-03-16") makes the state unambiguous.

**Verdict: PASS.** Coverage breadth is appropriate, edge cases are well-handled, performance has strong headroom. Two known gaps documented and acceptable.

---

### Mary — Frontend

Evaluating: component architecture, BFF pattern, API contract correctness.

Component architecture is well-structured. The four UI components are appropriately isolated — they have no cross-dependencies between them, and each has a clear, single responsibility. The `ModernHeader` isolation approach (mocking `Logo` and `SearchBar` child components in tests) is correct given the slice's scope: S01 is about the Header contract, not the Logo's rendering. This also makes the tests faster and less brittle.

The dual-header DOM pattern (desktop `hidden lg:flex` + mobile `lg:hidden flex`) is a common Next.js/Tailwind pattern for responsive layouts, and the test suite handles it correctly by using `getAllBy*` throughout. Importantly, this pattern is documented as a forward risk for downstream slices — good institutional memory.

The BFF contract has one documented naming deviation: the plan and the `GET /api/cards/[id]` plan spec named the degradation field `listingsError: string`, but the actual implementation uses `listingsUnavailable: boolean`. This is a better API design — a boolean flag is a cleaner signal than a string message for a degradation state that the UI responds to structurally rather than displaying verbatim. The deviation is documented, the field name is consistent throughout the actual codebase, and the tests verify the boolean shape. No contract confusion for consumers.

Price unit separation is well-enforced: PriceTag prop is dollars, `BackendListing.price` is cents, conversion responsibility sits in the BFF. This is documented in both the story constraints and the forward intelligence section. The risk is silent mixing in future components — worth a lint rule or a named type alias (`Dollars` vs `Cents`) in a future task to make the boundary explicit.

The `catalogSku` construction (`game.code + set.code + print.number`) without runtime validation is a structural fragility I'd flag. It's in the Known Limitations, but it's worth elevating: this is the key that links the catalog system to the listings system. If the catalog API shape changes (or if `print.number` can be undefined), the optimizer silently fails to find listings for affected SKUs rather than returning an error.

**Verdict: PASS.** Component architecture clean, BFF patterns sound, naming deviation documented and improvement on the plan. Two structural fragilities noted for S02+ attention.

---

### Winston — Architect

Evaluating: optimizer algorithm design, type correctness, BFF batching approach.

The greedy scarcity-first heuristic (D004) is the right algorithmic choice for this problem. Cart optimization is a bin-packing-adjacent problem where exhaustive search is NP-hard at scale, and the scarcity-first ordering is a well-established approximation: by committing to the most-constrained SKUs first (fewest available listings), you preserve the most flexibility for SKUs with more options. This is equivalent to the "smallest domain first" heuristic in constraint satisfaction — it's correct for the same theoretical reason. The < 1 ms result on 15×10 confirms O(n log n) sort + O(n × m) picker is well within budget for the intended input sizes.

The three-mode design is clean. `cheapest` is straightforward globally-optimal-per-SKU picking. `fewest-sellers` introduces a "consolidation preference" that trades some per-card cost for reduced seller count (and therefore shipping). `best-value` bridges them with a 15% threshold — a pragmatic tuning knob that converts a binary choice into a continuous preference. The 15% value is undocumented as a constant (it's embedded in the algorithm); it should be a named constant (`BEST_VALUE_COST_THRESHOLD = 0.15`) in the types file or at the top of `optimizeCart.ts` to make it tunable and auditable.

Type correctness: the `types.ts` shape (`Listing`, `SellerGroup`, `OptimizationResult`) matches the algorithm's actual data flow. The input shape being `Record<string, BackendListing[]>` (keyed by `catalogSku`) rather than a flat array is correct — the BFF pre-groups by SKU, which is the right separation. The `unassignedCards` field (SKUs with zero listings) is clean signal for both the UI and diagnostic logging.

BFF batching: `Promise.allSettled` in groups of 5 is the right tool for this constraint. Sequential batching caps peak concurrency at exactly 5, which satisfies the Railway connection pool limit. An alternative (p-limit or a semaphore) would allow overlapping batches and higher throughput, but for 60-SKU max input, sequential batching of 5 gives 12 batch rounds at < 1 ms per fetch — well within acceptable latency. The current approach is simpler and equally correct.

The trust score fetch (batched by unique seller IDs after listings resolve) is architecturally sound. Fetching trust scores in a second pass after listings minimises redundant fetches (same seller may appear across multiple SKUs) and keeps the two responsibilities separate.

**Verdict: PASS.** Algorithm design is theoretically grounded and empirically verified. BFF batching approach is correct for the constraints. Two minor hardening items: `BEST_VALUE_COST_THRESHOLD` should be a named constant, and `catalogSku` construction needs runtime validation.

---

### Amelia — PM

Evaluating: plan coverage of requirements, completeness, nothing missed.

S01 addresses four requirement IDs: R001 (design foundation), R018 (optimizer algorithm), R019 (optimizer BFF), R023 (zero alert() calls). All four requirements have clear, verifiable acceptance criteria, and all twelve AC items are confirmed passing. The scope is well-bounded — no requirement dependencies on upstream data that wasn't mocked, no UI pages or user-facing flows that weren't in scope.

The key plan deviation — all implementations pre-existed, S01 was a test and verification pass rather than a build pass — is fully and accurately documented. This doesn't diminish the slice's value: locking correctness with an 85-test suite against pre-existing implementations is real, durable work. The story, context, plan, and summary all tell the same story of what actually happened, which is what matters for downstream planning.

`CardDetailSkeleton` is the one scope miss: T04 listed it as a deliverable, it was not found, and it's deferred to S02. The deferral reasoning is sound (nothing in S01 required it; it only matters when building the card detail page), and the condition for delivery is clearly stated. This is a known and tracked gap, not a silent omission.

The forward intelligence sections (in both CONTEXT and SUMMARY) are unusually thorough — naming conventions, type shapes, field naming deviations, price unit boundaries, test patterns for the dual-header DOM. S02–S05 teams have everything they need to avoid the traps this slice ran into. That kind of institutional memory preservation is PM-relevant: it reduces rework in later slices and keeps the velocity estimate honest.

One requirement-level observation: R023 (zero alert() calls) is a hygiene requirement, not a feature requirement. It's correctly verified by grep, and the one stale alert found was in a `.backup` file (not active source) — acceptable. The requirement is satisfied.

**Verdict: PASS.** Requirements coverage is complete, scope deviation is documented and justified, `CardDetailSkeleton` gap is tracked with clear deferral condition. Forward intelligence is well-documented.

---

## Distilled Findings

### Overall Verdict

**ALL 5 REVIEWERS: PASS. Design/plan gate confirmed.**

| Reviewer | Domain | Verdict | Key Observation |
|---|---|---|---|
| Sally (UX/Design) | Visual design, token compliance | PASS | Token enforcement via grep is lightweight but sufficient; `.price` class decision correct; `CardDetailSkeleton` debt inherited by S02 |
| John (QA) | Test coverage, edge cases, performance | PASS | 85-test suite well-proportioned; performance has 50× headroom; two documented gaps (light-mode, hover dropdowns) acceptable |
| Mary (Frontend) | Component architecture, BFF contracts | PASS | `listingsUnavailable` boolean better than plan's string field; price unit separation clean; `catalogSku` construction fragile |
| Winston (Architect) | Algorithm design, type correctness, batching | PASS | Greedy scarcity-first is theoretically grounded; BFF batching correct; `BEST_VALUE_COST_THRESHOLD` should be a named constant |
| Amelia (PM) | Requirements coverage, completeness | PASS | All 4 requirements met; deviation documented accurately; forward intelligence thorough |

### Gate Status

| Gate | Status |
|---|---|
| `readiness: passed` | ✓ Confirmed |
| `design_plan: passed` | ✓ Confirmed |

### Concerns Raised

None blocking. The following non-blocking items are surfaced for downstream tracking:

1. **`CardDetailSkeleton` absent** — T04 deliverable not found; deferred to S02 with clear trigger condition.
2. **`catalogSku` construction unvalidated** — `game.code + set.code + print.number` concatenation has no runtime schema check; silent failure if catalog API shape changes.
3. **`BEST_VALUE_COST_THRESHOLD` unnamed** — 15% threshold embedded in algorithm rather than a named constant; makes future tuning harder.
4. **Header light-mode branch untested** — `useTheme` mocked to `dark` always; light-mode glassmorphic background branch is uncovered.
5. **Header dropdown interaction untested** — CSS `:hover` invisible to jsdom; requires `userEvent.hover()` or Playwright for full coverage.
6. **Price unit boundary informal** — dollar/cent separation documented but not enforced by types; a named type alias (`Dollars`/`Cents`) would make the contract explicit.

---

## Forward Risks

Risks that slices S02–S05 should actively track.

### FR-01 — CardDetailSkeleton Absence

**Risk:** S02 builds the card detail page. If `CardDetailSkeleton` is needed for the loading state (likely), it must be added in S02 before the page ships. The component is not present in the codebase.  
**Mitigation:** Add `CardDetailSkeleton` to the S02 plan as a concrete task. Don't assume it exists — verify at S02 task planning time.

### FR-02 — catalogSku Construction Fragility

**Risk:** `cardDetailBFF.ts` builds `catalogSku` as `game.code + set.code + print.number`. If the catalog API adds a separator, changes field names, or returns `undefined` for any field, `catalogSku` construction silently produces a wrong or broken key. The optimizer will then fail to find listings for affected SKUs — no error thrown, just `unassignedCards` growing unexpectedly.  
**Mitigation:** Add a Zod parse or explicit field assertion on the catalog response before the concatenation. This is a one-line fix; scope it into the first task that touches `cardDetailBFF.ts`.

### FR-03 — listingsUnavailable Naming Deviation

**Risk:** The plan named the degradation field `listingsError: string`; the actual implementation uses `listingsUnavailable: boolean`. Any S02–S05 code that uses the plan spec as its source of truth for this field will reference the wrong name.  
**Mitigation:** Treat S01-CONTEXT.md and S01-SUMMARY.md as authoritative on field naming (both document `listingsUnavailable: boolean`). Do not use S01-PLAN.md as a type reference.

### FR-04 — Price Unit Mixing

**Risk:** `PriceTag.price` is in dollars; `BackendListing.price` is in cents. The BFF handles conversion. Any new component that reads from the optimizer result or directly from a listing and passes it to `PriceTag` without going through the BFF will display prices 100× too large.  
**Mitigation:** All listing-to-display pipelines must route through the BFF. Consider adding a named TypeScript type alias (`type Dollars = number; type Cents = number`) in `optimizer/types.ts` to make the unit boundary explicit and statically checkable.

### FR-05 — Header Dual-DOM Test Pattern

**Risk:** Both desktop (`hidden lg:flex`) and mobile (`lg:hidden flex`) header markup render simultaneously in jsdom. Any test that uses `getByRole`, `getByText`, or `getByTestId` for an element that appears in both the desktop and mobile header trees will throw "found multiple elements."  
**Mitigation:** Use `getAllBy*` variants for any element duplicated across desktop/mobile. This pattern is documented in S01-CONTEXT.md and S01-SUMMARY.md — forward intelligence is in place; just follow it.

### FR-06 — Header Dropdown Interaction Gap

**Risk:** Header dropdown menus use CSS `:hover` (`group-hover:*`) for visibility. jsdom does not apply CSS, so hover-triggered visibility is not testable via unit tests. If S02+ adds features behind dropdown menus (e.g., user account actions, cart preview), those interactions have no unit test coverage.  
**Mitigation:** Add Playwright E2E coverage for any user flow that passes through a dropdown interaction. Do not attempt to unit-test hover-triggered CSS visibility — use `userEvent.hover()` only if the visibility is toggled via JS state, not pure CSS.

### FR-07 — Optimizer Input Shape

**Risk:** `optimizeCart` takes `listingsByCard: Record<string, BackendListing[]>` (keyed by `catalogSku`), not a flat `Listing[]` array. A consumer that passes a flat array will produce incorrect groupings without a type error if the call site is loosely typed.  
**Mitigation:** Ensure the BFF's pre-grouping step is the only entry point for building this map. Do not call `optimizeCart` directly from UI components — route through the optimizer BFF or a typed adapter layer.
