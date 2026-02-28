# UX Validation Report — Story 2-5: Card Detail Page v5.1

**Date:** 2026-02-28
**Validator:** Sally (UX Designer) + Quinn (QA)
**Wireframe:** `_bmad-output/planning-artifacts/ux-story-2-5-card-detail-page-bff-endpoint-wireframe.html` (v5.1)

---

## Audit 1: CSS Token Compliance

**Status: PASS (with advisory)**

| Finding | File | Severity | Notes |
|---|---|---|---|
| `text-gray-600 dark:text-gray-400` in `getRarityColor` | `CardDetailPage.tsx:149` | MEDIUM | Should be `text-secondary`. Affects "uncommon" rarity label only. |
| `text-amber-400`, `border-amber-400` throughout | All new components | LOW | Pre-existing codebase pattern (also in `CardSummary.tsx`, `CommunityStatsCard.tsx`). Tailwind amber-400 resolves to the same hex as `--primary` (#D4A843) in dark mode. Not a design system breach in practice, but `bg-action` / `text-action` / `border-action` would be semantically cleaner. |
| `getRarityColor` duplicated in `CardDetailPage.tsx` vs `CompactPrintingsTable.tsx` | Both files | LOW | Same logic exists in two places with different token usage. Should be a shared utility. |

**No HIGH severity violations found.** The amber-400 bypass is widespread in the codebase predating story 2-5 and resolves to the same token value. The gray-600 is MEDIUM and should be addressed.

---

## Audit 2: Structural Hierarchy

**Status: PASS (revised 2026-03-01 — compliance remediation complete)**

### Audit 2a: Original checks (Feb 28)

| Check | Expected (wireframe) | Actual (implementation) | Result |
|---|---|---|---|
| Desktop grid | `260px 1fr 268px` | `lg:grid-cols-[260px_1fr_268px]` | ✓ |
| Left col sticky | `top: header height` | `lg:sticky lg:top-[68px]` | ✓ |
| Right col sticky | `top: header height` | `lg:sticky lg:top-[68px]` | ✓ |
| Left col: card image | Full-bleed in column | `BlurHashImage` with rounded corners | ✓ |
| Left col: oracle text | Shown below image | Present in left col | ✓ |
| Center col: CompactPrintingsTable | Print browser with filter strip | Filter strip (All/Foil/Non-foil + Price↑/Year↓) | ✓ |
| Center col: MarketplaceListingsSection | Listings table | Present | ✓ |
| Center col: FormatLegalityGrid | Legality (tab-controlled mobile) | Tab-controlled via `role="tab"` chips | ✓ |
| Right col: condition chips | `disabled` attribute on zero-stock | `disabled={isDisabled}` on button elements | ✓ |
| Right col: qty stepper | Capped at listing.quantity | `disabled={qty >= maxQty}` | ✓ |
| Mobile: sticky bottom bar | Fixed bottom with Add to Cart | `fixed bottom-0` bar with `min-h-[44px]` | ✓ |
| Mobile: tab chips | `role="tab"` | `role="tab"` with `aria-selected` | ✓ |
| BuySection | REMOVED in v5.1 | Not rendered | ✓ |

### Audit 2b: Compliance-remediation checks (2026-03-01)

Three gaps discovered under strengthened story lifecycle compliance gates — all now **PASS**:

| Gap | Check | Expected (wireframe) | Actual after fix | Result |
|---|---|---|---|---|
| 1 | QuickBuyPanel condition chips — color coding | NM=green, LP=lime, MP=yellow, HP=red | `CONDITION_COLORS` map applied; selected/unselected/disabled states per-condition | ✓ PASS |
| 2 | Mobile Row 3 condition chips — color coding | Same per-condition colors | `CONDITION_COLORS` map applied in `CardDetailPage.tsx` mobile bar | ✓ PASS |
| 3 | Mobile Row 3 context label — structural position | Label in `.mobile-action-zone` column above secondary buttons | Context label moved out of `mobile-cond-zone` into `data-testid="mobile-action-zone"` flex-col | ✓ PASS |
| 4 | Mobile qty chips — label format | `×1`, `×2`, `×3`, `×4` | ``×${n}`` applied for all 4 chips | ✓ PASS |
| 5 | Disabled chips — condition color at 30% opacity | Retain condition hue at 30% opacity | All three color classes applied + `opacity-30 border-dashed cursor-not-allowed` | ✓ PASS |

**Full quality gate result (2026-03-01):** lint PASS (warnings only, pre-existing) · typecheck PASS · build PASS · tests 523/523 PASS

---

## Audit 3: Playwright Compliance Tests

**Status: DEFERRED (Playwright not installed)**

Playwright test spec written to: `storefront/e2e/story-2-5-ux-compliance.spec.ts`

Covers:
- Desktop 3-column grid verification (1280px)
- Mobile single-column + tab chips (375px)
- CSS token computed-style assertion on Add to Cart button
- Condition chip `disabled` attribute verification
- Mobile tab chip `role="tab"` + `aria-selected`
- Print-switching skeleton appearance
- Accessibility tree snapshot

To activate: `npm install -D @playwright/test && npx playwright install`

---

## Audit 4: Overall Verdict

**APPROVED — wireframe compliance remediation complete (2026-03-01)**

The v5.1 three-column layout is structurally correct and matches the wireframe. All five compliance gaps discovered under the strengthened story lifecycle gates have been resolved. Full quality gate passes: lint (warnings only, pre-existing) · typecheck · build · 523/523 tests.

**Advisory (non-blocking):**
1. Replace `text-gray-600 dark:text-gray-400` with `text-secondary` in `CardDetailPage.tsx` (MEDIUM)
2. Extract shared `getRarityColor` utility to eliminate duplication (LOW, follow-up story)
3. Install Playwright and run UX compliance spec when E2E harness sprint runs (deferred)

**No blockers to Phase 5B (Post-Build UX Validation) or deployment.**
