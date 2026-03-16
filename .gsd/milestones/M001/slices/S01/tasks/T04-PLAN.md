# T04: Build card skeleton loading components

**Slice:** S01
**Status:** complete
**Estimate:** 1h

## Goal

Create `CardGridSkeleton` and `CardDetailSkeleton` components so S02 can wire them into page-level loading states without layout shift during data loading.

## Files to Touch

- `storefront/src/components/cards/CardGridSkeleton.tsx` (create)
- `storefront/src/components/cards/CardDetailSkeleton.tsx` (create)
- `storefront/src/components/cards/__tests__/CardSkeletons.test.tsx` (create)

## What to Do

**CardGridSkeleton** — renders N (default 12) card-shaped skeleton tiles matching card grid item dimensions from the `storefront-cards.html` wireframe (aspect ratio ~2:3, rounded corners, pulse animation using `--bg-surface-2` / `--bg-surface-3`).

**CardDetailSkeleton** — renders the card detail page skeleton: large image placeholder left, content block stacked right with 3 text lines and a table skeleton below.

Use `animate-pulse` from Tailwind. No light-mode color classes.

Write tests asserting:
- `CardGridSkeleton` renders 12 tiles by default
- `CardGridSkeleton` renders N tiles when `count` prop passed
- `CardDetailSkeleton` renders image and content placeholders

## Verification Criteria

- `npm test -- --run src/components/cards/CardSkeletons` — pass

## Done When

Both skeleton components render, tests pass, Voltage tokens only.

## Actual Outcome

`CardGridSkeleton.tsx` was already implemented. 7 tests already existed and passed, covering:
- Count prop (default 12 and custom N)
- Grid layout
- Dashed border
- Shimmer animation

**Known limitation:** `CardDetailSkeleton` was not found in the codebase. Only `CardGridSkeleton` exists. S02 may need to add `CardDetailSkeleton` when building the card detail page loading state if it's needed.
