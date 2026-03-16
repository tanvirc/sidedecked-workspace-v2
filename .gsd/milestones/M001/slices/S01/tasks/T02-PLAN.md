# T02: Audit and align Footer to wireframe spec

**Slice:** S01
**Status:** complete
**Estimate:** 1h

## Goal

Ensure `Footer.tsx` precisely matches the wireframe spec — gradient wordmark, nav link columns, social icons — and uses Voltage tokens exclusively. Footer renders on every page so light-mode class leaks or structural drift affects all pages simultaneously.

## Files to Touch

- `storefront/src/components/organisms/Footer/Footer.tsx`
- `storefront/src/components/organisms/Footer/__tests__/Footer.test.tsx` (create if absent)

## What to Do

Read the footer section of `docs/plans/wireframes/storefront-homepage.html`. Compare against `Footer.tsx`. Wire in:
- Gradient wordmark: `linear-gradient(135deg, var(--brand-primary), #A78BFA)`
- Nav link columns matching wireframe column structure
- Social icon row (Discord, Twitter, GitHub) with `--bg-surface-2` backgrounds

Write tests asserting:
- Copyright year renders
- Nav links present
- Social links have correct `href` and `aria-label`
- All colors use Voltage CSS custom properties

## Verification Criteria

- `npm test -- --run src/components/organisms/Footer` — pass
- `grep -rn "bg-white\|text-gray\|border-gray" storefront/src/components/organisms/Footer/` — zero matches

## Done When

Footer tests pass, zero light-mode leaks.

## Actual Outcome

`Footer.tsx` was already implemented. 6 tests already existed and passed, covering:
- Gradient wordmark
- 5 nav links with correct `/en/` prefixed hrefs
- 3 social links (Discord, Twitter, GitHub)
- Copyright year
- Absence of `bg-primary` class (Voltage compliance)

No changes to `Footer.tsx` were required. Zero `bg-white` / `text-gray-*` / `border-gray-*` matches confirmed.
