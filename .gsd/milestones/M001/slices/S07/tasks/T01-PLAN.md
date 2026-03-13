---
estimated_steps: 6
estimated_files: 6
---

# T01: Extract UserAccountLayout and align user-account pages

**Slice:** S07 — Remaining Pages — Visual Alignment
**Milestone:** M001

## Description

Extract the shared `UserAccountLayout` from the current 7-line `user/layout.tsx` wrapper into a responsive 2-column grid with `UserNavigation` sidebar (desktop) and horizontal pill nav (mobile), matching the wireframe's user-account layout family. Then convert all light-mode Tailwind references in user-account components (EnhancedPriceAlerts: 34 refs, ReturnItemsTab: 4 refs, verify-email: 2 refs) to Voltage tokens. Restructure verify-email to render as a standalone centered card without the sidebar.

## Steps

1. Read the wireframe `storefront-user-orders.html` to understand the sidebar layout structure, mobile pill nav, and responsive breakpoints.
2. Read `UserNavigation.tsx` to understand current nav items and styling — plan mobile pill variant.
3. Rewrite `user/layout.tsx` to render a 2-column CSS grid (`grid-template-columns: 240px 1fr` at `md+`, single column below). Include `UserNavigation` sidebar hidden below `md`, and a horizontal pill nav (scrollable row of nav links matching sidebar items) visible only below `md`.
4. Restructure `verify-email/page.tsx` to render as a standalone centered card without `UserNavigation` sidebar. Remove the `grid grid-cols-1 md:grid-cols-4` wrapper and UserNavigation import. Render a centered card with Voltage tokens. Convert `text-gray-600` and `text-gray-500` to Voltage equivalents.
5. Convert 34 light-mode Tailwind color references in `EnhancedPriceAlerts.tsx` to Voltage tokens using inline `style={{ color: 'var(--text-secondary)' }}` for custom tokens or mapped Tailwind classes (`bg-card`, `text-primary`, `border-border`) where they map correctly. No logic changes.
6. Convert 4 light-mode references in `ReturnItemsTab.tsx` to Voltage tokens. Spot-check other user page components for stray light-mode classes.

## Must-Haves

- [ ] `user/layout.tsx` renders 240px sidebar + content grid at `md+`, single column with pill nav below `md`
- [ ] `UserNavigation` visible in sidebar on desktop, hidden on mobile
- [ ] Horizontal pill nav visible on mobile, hidden on desktop, with same nav items as sidebar
- [ ] `verify-email` page renders as standalone centered card (no sidebar)
- [ ] Zero bare light-mode Tailwind color classes in `EnhancedPriceAlerts.tsx`
- [ ] Zero bare light-mode Tailwind color classes in `ReturnItemsTab.tsx`
- [ ] All existing tests pass

## Verification

- `npx vitest run` — all 794+ tests pass
- `grep -rn "bg-white\|text-gray-[0-9]\|bg-gray-[0-9]\|border-gray-[0-9]" src/components/pricing/EnhancedPriceAlerts.tsx src/components/sections/OrderReturnSection/ReturnItemsTab.tsx src/app/[locale]/(main)/user/verify-email/page.tsx` — zero matches
- `user/layout.tsx` contains `grid` or `grid-cols` responsive layout code

## Inputs

- `docs/plans/wireframes/storefront-user-orders.html` — canonical wireframe for user-account sidebar layout
- `docs/plans/wireframes/storefront-verify-email.html` — standalone centered card layout
- `docs/plans/wireframes/storefront-user-price-alerts.html` — alignment target for EnhancedPriceAlerts
- `src/app/[locale]/(main)/user/layout.tsx` — current 7-line wrapper to rewrite
- `src/components/molecules/UserNavigation/UserNavigation.tsx` — nav items and current styling
- S01 Summary — Voltage token patterns, D009 inline style convention

## Expected Output

- `src/app/[locale]/(main)/user/layout.tsx` — rewritten with responsive 2-column grid + mobile pill nav
- `src/components/molecules/UserNavigation/UserNavigation.tsx` — possibly updated with mobile variant
- `src/components/pricing/EnhancedPriceAlerts.tsx` — all 34 light-mode refs converted to Voltage tokens
- `src/components/sections/OrderReturnSection/ReturnItemsTab.tsx` — 4 light-mode refs converted
- `src/app/[locale]/(main)/user/verify-email/page.tsx` — restructured as standalone centered card
