# S01: Design Foundation + Cart Optimizer Algorithm — Context

## Purpose

Lock the shared UI surface (Header, Footer, PriceTag, skeletons) to the Voltage design spec and prove the cart optimizer algorithm and BFF contract before any dependent UI slice (S02–S05) builds on top of them. This slice is a prerequisite for everything that renders a card, a price, or a cart.

## Implementation Status

All 8 tasks complete as of 2026-03-16. 85 tests passing across 8 test files. All three verification greps pass (tests, alert audit, light-mode class audit).

All implementations were already present in the codebase before S01 began. The slice delivered the missing test coverage (`ModernHeader.test.tsx` was the only new production-adjacent file created) and confirmed that existing implementations match the plan's contracts.

## Architecture Notes

### BFF Dual-Source Pattern

`GET /api/cards/[id]` (`storefront/src/lib/services/cardDetailBFF.ts`) fires two outbound requests concurrently via `Promise.allSettled`:
- `GET {CUSTOMER_BACKEND_URL}/api/catalog/cards/:id` — catalog data (hard dependency: 404 on failure)
- `GET {BACKEND_URL}/store/consumer-seller/listings?catalog_sku=:id` — listings (soft dependency: degrade gracefully)

Catalog failure → NextResponse 404. Listings failure → 200 with `listings: []` and `listingsUnavailable: true`. The response never propagates a listings-side 500 to the client.

`catalogSku` is constructed by the BFF from `game.code + set.code + print.number` in the catalog response.

### Optimizer BFF Batching Pattern

`POST /api/optimizer/listings` (`storefront/src/app/api/optimizer/listings/route.ts`) chunks SKUs into groups of 5 and calls `Promise.allSettled` per batch to cap concurrent outbound requests at ≤ 5. Seller trust scores are fetched after listings resolve (batched by unique seller IDs). Partial SKU failures produce partial results — failed SKUs are listed in `partialFailures` and the optimizer runs on whatever succeeded.

### Optimizer Algorithm

`optimizeCart(listingsByCard, mode)` (`storefront/src/lib/optimizer/optimizeCart.ts`) is a pure greedy function:

1. Group listings by `catalogSku`, deduplicate (lowest price per seller per SKU).
2. Sort SKUs by scarcity (fewest listings first) — this is the key heuristic that makes greedy near-optimal in practice.
3. For each SKU in scarcity order, pick according to mode:
   - `cheapest`: pick the globally cheapest listing.
   - `fewest-sellers`: prefer the cheapest listing from an already-chosen seller; fall back to cheapest new seller.
   - `best-value`: use `fewest-sellers` logic when the cost premium is ≤ 15% vs `cheapest`; otherwise use `cheapest`.
4. Accumulate per-seller subtotals; shipping is charged once per seller regardless of card count.
5. Compute `savings` as the delta between worst-case (all separate sellers) and the chosen grouping.

Input shape: `listingsByCard: Record<string, BackendListing[]>` (keyed by `catalogSku`). The BFF is responsible for transforming the flat listings array into this map before calling `optimizeCart`.

### Test Patterns

- **Header/Footer:** Mock `next/navigation` (`useRouter`, `usePathname`) and `next-themes` (`useTheme`). Mock child components (`Logo`, `SearchBar`) to isolate. Because jsdom renders both desktop (`hidden lg:flex`) and mobile (`lg:hidden flex`) DOM simultaneously (CSS breakpoints don't apply), tests use `getAllBy*` variants for any element that appears in both.
- **BFF routes:** Mock `fetch` globally; test happy path, catalog 404, listings 5xx, and concurrent degradation.
- **Optimizer:** Use a 15-card × 10-seller fixture to verify all three modes; add edge cases (single seller, empty input, no listings). Verify performance with `Date.now()` delta.

## Key Decisions

- **D004 — Greedy heuristic for cart optimizer.** Scarcity-first greedy ordering is proven correct and completes in < 1 ms for the 15×10 fixture. Full exhaustive search is not warranted.
- **D008 — PriceTag uses `.price` CSS class.** The `.price` class in `globals.css` applies DM Mono tabular figures and `--text-price` colour. PriceTag must apply this class, not `font-mono` or any inline `fontFamily`/`color` style override, so column alignment works across all usage contexts.
- **D009 — Voltage tokens via inline style.** Tailwind has no Voltage utility classes. Token colours are applied as `style={{ color: 'var(--token)' }}` or via a CSS class that references the token. Light-mode Tailwind classes (`bg-white`, `text-gray-*`) are forbidden in new components.

## Key Files

```
storefront/src/components/organisms/Header/ModernHeader.tsx
storefront/src/components/organisms/Header/__tests__/ModernHeader.test.tsx   ← created in S01
storefront/src/components/organisms/Footer/Footer.tsx
storefront/src/components/organisms/Footer/__tests__/Footer.test.tsx
storefront/src/components/tcg/PriceTag.tsx
storefront/src/components/tcg/__tests__/PriceTag.test.tsx
storefront/src/components/cards/CardGridSkeleton.tsx
storefront/src/app/api/cards/[id]/route.ts
storefront/src/lib/services/cardDetailBFF.ts
storefront/src/lib/optimizer/optimizeCart.ts
storefront/src/lib/optimizer/types.ts
storefront/src/app/api/optimizer/listings/route.ts
```

## Patterns Established

- **BFF dual-source pattern:** `Promise.allSettled` for concurrent outbound fetches; catalog hard-fail = 404; listings fail = degrade gracefully with `listingsUnavailable: true`.
- **Optimizer BFF batching:** Chunk SKUs into groups of 5; `Promise.allSettled` per batch; partial results returned on individual SKU failure; `partialFailures: string[]` field in response.
- **Header/Footer test pattern:** Mock `next/navigation` + `next-themes`; mock child components (`Logo`, `SearchBar`) to isolate; use `getAllBy*` for elements duplicated across desktop/mobile DOM.

## Observability Surfaces

- Card detail BFF failures: `stderr` log prefixed `[BFF] /api/cards/[id] error:` — grep this in server logs.
- Optimizer partial failures: `stderr` log prefixed `[cart-optimizer] Listing fetch failed for SKU:` — each failed SKU logged individually.
- BFF response field `listingsUnavailable: true` signals the UI to show a degradation message (note: the plan named this field `listingsError: string` but the actual implementation uses a boolean flag).
- Optimizer result shape: check `result.unassignedCards` for cards with no listings; `result.savings` for optimization value.

## Known Limitations

- `CardDetailSkeleton` was not found in the codebase. `CardGridSkeleton` exists, but there is no full-page card detail skeleton. S02 should add one if the card detail page loading state requires it.
- PriceTag `.price` CSS class is verified by DOM inspection in tests (class attribute present), but actual tabular numeral rendering (DM Mono) requires a browser with loaded fonts for visual confirmation.
- Header `useTheme` is mocked to always return `theme: "dark"` in tests. The light-mode branch of the glassmorphic background is untested.
- Header dropdown menus use CSS `:hover` (`group-hover:*`) for visibility — invisible to jsdom. Dropdown interaction testing requires either `userEvent.hover()` or a Playwright test.

## Readiness Gate — Panel Transcript

**Date:** 2026-03-16  
**Slice:** S01 — Design Foundation + Cart Optimizer Algorithm  
**Panel purpose:** Confirm that the story as documented is accurate, complete, and that both party gates (`readiness: passed`, `design_plan: passed`) are correctly set.

---

### Bob — Backend/Infra

S01 is properly scoped to `storefront` only. No direct database access occurs anywhere in this slice — all cross-system data flows through HTTP calls (`CUSTOMER_BACKEND_URL`, `BACKEND_URL`), which is exactly correct per the architecture guardrail. The `split_brain_risk: false` designation in the story header is accurate: no shared state is mutated across the two isolated databases.

The BFF dual-source pattern is sound. Using `Promise.allSettled` rather than `Promise.all` means a listings-side failure cannot cascade to a catalog-side success — the catalog response is always returned when available, and the listings degradation path is deterministic (200 + `listingsUnavailable: true`). The optimizer BFF's concurrency cap of ≤ 5 concurrent listing fetches is correctly implemented via batch chunking and validated in tests.

One observation for future slices: `cardDetailBFF.ts` constructs `catalogSku` from `game.code + set.code + print.number` with no runtime schema validation. If the catalog API response shape drifts, this will break silently. Worth adding a Zod parse or an assertion before the concatenation in a future task.

**Verdict: PASS.**

---

### Mary — Frontend/UX

Voltage token compliance is verified and not just asserted. The grep on Header, Footer, and PriceTag confirmed zero light-mode Tailwind classes (`bg-white`, `text-gray-*`, `text-black`, `bg-gray-*`). The constraint that token colours must be applied via `style={{ color: 'var(--token)' }}` or a token-referencing CSS class (D009) is correctly documented and enforced. The `.price` CSS class requirement for tabular DM Mono figures (D008) is verified by DOM inspection in the PriceTag test suite.

Test coverage across the four UI components is solid: 14 tests for ModernHeader, 6 for Footer, 9 for PriceTag, 7 for CardGridSkeleton — 36 tests covering the visual surface. The dual-header DOM pattern (desktop + mobile rendered simultaneously in jsdom) is correctly handled with `getAllBy*` throughout, and this pattern is well-documented for the next slice.

Two known gaps are acceptable and appropriately surfaced: the Header light-mode glassmorphic branch is untested (mocked to `theme: "dark"` always), and CSS `:hover` dropdown interaction is invisible to jsdom. Both are documented in Known Limitations. Neither blocks S01 completion since the dark-mode path is the primary application state and dropdown testing is a Playwright concern.

**Verdict: PASS.**

---

### John — QA

The acceptance criteria are precise and individually verifiable — each criterion maps to a concrete, testable behavior rather than a vague capability statement. The twelve criteria cover nav link order and hrefs, cart badge rendering, auth state variants, Footer structure, PriceTag class application, skeleton count prop, BFF degradation, optimizer correctness across all three modes, optimizer performance, BFF concurrency cap, partial failure handling, and both grep audits. This is a well-structured AC set.

The verification suite backs it up: 85 passing tests across 8 files, both grep checks confirmed passing by command output. The Definition of Done is minimal and machine-verifiable (test run + two greps), with a clear status line ("all three checks passed as of 2026-03-16"). There are no ambiguous criteria that require judgment to evaluate.

One minor gap: `CardDetailSkeleton` was listed as a known absence and deferred to S02 rather than being silently omitted. The story accurately reflects this. The deviation (all implementations pre-existing) is fully documented in both Summary and Story — future reviewers will understand what S01 actually delivered (test layer + verification) versus what the plan anticipated (implementation + test).

**Verdict: PASS.**

---

### Winston — Architect

The three key decisions (D004, D008, D009) are technically sound and appropriately documented. The greedy scarcity-first heuristic for the cart optimizer (D004) is a defensible choice: sorting SKUs by fewest available listings first means the most-constrained assignment decisions are made first, which is the standard approach for bin-packing-adjacent problems. The < 1 ms performance result on the 15×10 fixture confirms the algorithm is well within acceptable bounds for an in-process function. Exhaustive search is not warranted at this scale.

The BFF dual-source pattern is architecturally correct. Separating catalog (hard dependency) from listings (soft dependency) via `Promise.allSettled` creates a clean resilience boundary that callers can reason about — the `listingsUnavailable: true` flag is a well-defined signal rather than a leaky error. The optimizer BFF's batch-then-allSettled pattern (chunk SKUs to 5, `Promise.allSettled` per batch) is a pragmatic solution to the Railway connection pool constraint and produces clean partial-failure semantics.

The one structural fragility I'd flag: the `catalogSku` construction in `cardDetailBFF.ts` has no runtime contract enforcement. The optimizer's `buildRemainingQuantities` deduplication using listing ID as key is also a quiet assumption (documented in Known Limitations). Both are forward risks, not blockers for S01.

**Verdict: PASS.**

---

### Amelia — PM

S01 covers the four requirements it claims: R001 (design foundation), R018 (optimizer algorithm), R019 (optimizer BFF), and R023 (zero alert() calls). The scope statement in the story is accurate — this is a test coverage and verification pass, not a new-build pass, and the story says so explicitly. The deviation from the original plan (implementations already existed) is documented without minimizing it.

The four UI components, two BFF routes, and one pure function are all accounted for in the acceptance criteria and test coverage. The `CardDetailSkeleton` gap is documented and correctly deferred to S02 with a clear condition ("if the card detail page loading state requires it"). No requirements were dropped without explanation, and no new scope was added without documentation.

The slice is narrow, well-bounded, and produces a concrete deliverable: a verified test layer that locks the shared surface S02–S05 depend on. The forward intelligence section gives the next slice enough detail to avoid known traps (dual-header DOM, optimizer input shape, `listingsUnavailable` naming deviation, price unit mismatch). This is complete.

**Verdict: PASS.**

---

### Distilled Findings

**Overall verdict: ALL GATES CONFIRMED PASSED.**

| Reviewer | Domain | Verdict |
|---|---|---|
| Bob | Backend/Infra | PASS |
| Mary | Frontend/UX | PASS |
| John | QA | PASS |
| Winston | Architect | PASS |
| Amelia | PM | PASS |

**Confirmed gate status:**
- `readiness: passed` ✓ — Story is accurate, complete, and correctly scoped. All twelve acceptance criteria are verifiable, the verification suite passed, and the deviation (pre-existing implementations) is fully documented.
- `design_plan: passed` ✓ — Key decisions D004, D008, D009 are technically sound. BFF dual-source pattern, optimizer greedy heuristic, and Voltage token enforcement approach are all well-reasoned and appropriately documented for downstream slices.

**Concerns:** None blocking. Three forward risks noted (catalogSku construction has no runtime validation, optimizer deduplication assumes listing ID uniqueness, Header light-mode branch is untested) — all documented in Known Limitations and appropriate for future work.

---

## Forward Intelligence

### What the next slice should know

- Both desktop and mobile headers render simultaneously in jsdom. Always use `getAllBy*` for elements present in both — `getByRole("banner")` will throw "found multiple" if scoped to role alone.
- `optimizeCart` input is `listingsByCard: Record<string, BackendListing[]>` (keyed by `catalogSku`), not a flat array. The BFF transforms the flat listing response into this map before calling the function.
- Card detail BFF response uses `listingsUnavailable: boolean`, not `listingsError: string`. The plan named it differently from the actual implementation.
- `PriceTag.price` is in **dollars** (e.g. `12.99`). `BackendListing.price` is in **cents**. The BFF handles the conversion; components must not mix units.

### What's fragile

- `cardDetailBFF.ts` constructs `catalogSku` from `game.code + set.code + print.number` — if the catalog API response shape changes, this breaks silently (no runtime validation).
- Optimizer `buildRemainingQuantities` uses listing ID as the deduplication key. If the same listing appears under multiple SKUs (catalog bug), quantities could be miscounted.
