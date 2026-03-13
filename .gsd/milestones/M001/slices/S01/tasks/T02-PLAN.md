---
estimated_steps: 5
estimated_files: 2
---

# T02: Add Footer tests and run full verification

**Slice:** S01 — Voltage Design System Foundation
**Milestone:** M001

## Description

The Footer rewrite from T01 needs test coverage — the original Footer had no tests. This task writes Footer tests, runs the full test suite, and performs the token/typography/toast audit that confirms the design system foundation is locked and ready for downstream slices.

## Steps

1. Create `storefront/src/components/organisms/Footer/__tests__/Footer.test.tsx` with tests: (a) renders SideDeckedLogo or gradient logo text, (b) renders all 5 nav links (About, FAQ, Terms, Privacy, Contact) with correct href paths, (c) renders 3 social links with `target="_blank"` and `rel="noopener noreferrer"`, (d) renders copyright text containing current year, (e) does not have `bg-primary` class anywhere in the rendered output, (f) has a border-top separator element. Follow existing test patterns from `storefront/src/components/tcg/__tests__/`.
2. Run `cd storefront && npx vitest run` — confirm all tests pass including new Footer tests. Ensure count is 672+ (no regressions).
3. Audit `storefront/src/app/colors.css`: verify `.dark` block has token parity with `:root` block (no tokens defined in `:root` but missing from `.dark`). Report any gaps.
4. Audit `storefront/src/app/globals.css`: verify typography scale classes exist (text-sm/md/lg/xl, label-sm/md/lg/xl, heading-xs/sm/md/lg/xl, display-sm/md/lg). Verify `.price` class has `font-family: var(--font-mono-stats)` and `font-feature-settings: 'tnum'`.
5. Run `grep -rn "window\.alert\|window\.confirm\|window\.prompt" storefront/src/` to confirm zero remaining browser dialog calls (R023 verification).

## Must-Haves

- [ ] Footer test file exists with 6+ assertions covering structure, links, social icons, copyright, no-bg-primary, border separator
- [ ] Full test suite passes (672+ tests, 0 failures)
- [ ] colors.css dark mode parity confirmed (no gaps)
- [ ] globals.css typography scale classes confirmed present
- [ ] Zero window.alert/confirm/prompt calls confirmed (R023)

## Verification

- `cd storefront && npx vitest run src/components/organisms/Footer` — Footer tests pass
- `cd storefront && npx vitest run` — full suite passes, 672+ tests
- `grep -rn "window\.alert\|window\.confirm\|window\.prompt" storefront/src/` returns zero

## Inputs

- `storefront/src/components/organisms/Footer/Footer.tsx` — T01's rewritten Footer component
- `storefront/src/data/footerLinks.ts` — T01's updated link data
- `storefront/src/components/tcg/__tests__/` — existing test patterns to follow

## Expected Output

- `storefront/src/components/organisms/Footer/__tests__/Footer.test.tsx` — new test file with full Footer coverage
