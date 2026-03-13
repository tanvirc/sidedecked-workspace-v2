---
id: T03
parent: S08
milestone: M001
provides:
  - Comprehensive test coverage for the 3-step listing wizard (60 tests across 14 describe blocks)
key_files:
  - storefront/src/components/seller/__tests__/ListingWizard.test.tsx
key_decisions:
  - Fixed act() warnings in WizardStepPrice tests by awaiting MarketPriceDisplay async settlement — prevents false positives from unfinished state updates leaking between tests
patterns_established:
  - WizardStepPrice tests await MarketPriceDisplay fetch completion via waitFor to avoid act() warnings from child async effects
observability_surfaces:
  - none (test-only task)
duration: 15m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T03: Test coverage and polish

**60 wizard tests pass across all 3 steps, step navigation, async behavior, publish flow, pre-fill, and Voltage compliance. Full suite at 854 tests with zero regressions.**

## What Happened

The test file already existed from T01/T02 with comprehensive coverage (60 tests). Ran the suite, found all tests passing but with React act() warnings from WizardStepPrice tests that rendered MarketPriceDisplay without awaiting its async fetch settlement. Fixed by adding `waitFor` calls at the end of each WizardStepPrice test to let the MarketPriceDisplay effect resolve cleanly. Also removed unnecessary `vi.useFakeTimers` from the WizardStepCondition `onContinue` test that didn't need it.

## Verification

- `cd storefront && npx vitest run src/components/seller/__tests__/ListingWizard.test.tsx` — **60 tests pass**, zero act() warnings
- `cd storefront && npx vitest run` — **854 total tests pass**, zero failures
- `grep -rn "bg-white\|bg-gray-\|text-gray-\|border-gray-" storefront/src/components/seller/wizard/` — **zero matches** (Voltage compliance)

### Slice-level verification (all pass — final task):
- ✅ Wizard tests pass covering: progress indicator, step navigation, card search with debounce, printing selection gating, condition selector, photo zones, market price display with fallback, price input with competitive gauge, confirmation summary, publish flow, pre-fill via SKU prop, Voltage token compliance
- ✅ 854 total tests pass (exceeds 794 threshold)
- ✅ Zero forbidden Tailwind color classes in wizard sources

## Diagnostics

None — test-only task. Tests exercise the `[listing-wizard]` console.error paths (card search failure, SKU prefill failure, market price fetch failure) which appear in stderr as expected diagnostic output.

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/components/seller/__tests__/ListingWizard.test.tsx` — Fixed act() warnings in WizardStepPrice tests and removed unnecessary fake timer usage in WizardStepCondition test
