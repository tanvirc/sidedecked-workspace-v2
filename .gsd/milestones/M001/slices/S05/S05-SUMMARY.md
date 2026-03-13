---
id: S05
parent: M001
milestone: M001
provides:
  - (auth) route group with full-bleed split-screen layout (no nav/footer)
  - AuthPage component — 55/45 desktop split, full-screen mobile
  - AuthBrandPanel — wordmark, tagline, floating card silhouettes, game dots, gradient-sweep animation
  - Login page at /login with existing form logic, OAuth buttons, error handling
  - Register page at /register with PasswordValidator and OAuth buttons
  - Glassmorphic AuthGateDialog (desktop modal + mobile bottom sheet)
  - AuthBottomSheet for mobile deferred auth with slide-up animation
  - ProfileHero — avatar, display name, username, joined date, bio, game badges, stat chips
  - ProfileTabs — 4 tabs (Collection/Decks/Activity/Settings) with URL hash routing
  - ProfilePage composing hero + tabs + settings components
  - Backend OAuth provider verification (Google + Discord registered in medusa-config.ts)
requires:
  - slice: S01
    provides: Voltage tokens, nav/footer components, form styling, shadcn/ui primitives
affects:
  - S08
key_files:
  - storefront/src/app/[locale]/(auth)/layout.tsx
  - storefront/src/app/[locale]/(auth)/login/page.tsx
  - storefront/src/app/[locale]/(auth)/login/LoginFormContent.tsx
  - storefront/src/app/[locale]/(auth)/register/page.tsx
  - storefront/src/app/[locale]/(auth)/register/RegisterFormContent.tsx
  - storefront/src/components/auth/AuthPage.tsx
  - storefront/src/components/auth/AuthBrandPanel.tsx
  - storefront/src/components/auth/AuthGateDialog.tsx
  - storefront/src/components/auth/AuthBottomSheet.tsx
  - storefront/src/components/profile/ProfileHero.tsx
  - storefront/src/components/profile/ProfileTabs.tsx
  - storefront/src/components/profile/ProfilePage.tsx
  - storefront/src/components/profile/tabs/CollectionTabContent.tsx
  - storefront/src/components/profile/tabs/DecksTabContent.tsx
  - storefront/src/components/profile/tabs/ActivityTabContent.tsx
  - storefront/src/components/profile/__tests__/ProfilePage.test.tsx
  - storefront/src/components/auth/__tests__/AuthPage.test.tsx
  - storefront/src/components/auth/__tests__/AuthGateDialog.test.tsx
  - storefront/src/app/[locale]/(main)/user/page.tsx
key_decisions:
  - D021 — Auth pages use separate (auth) route group without Header/Footer for full-bleed split-screen
  - D022 — Profile tab state via URL hash with hashchange listener for deep-linkable tabs
  - Used Radix DialogPrimitive directly for AuthGateDialog instead of project DialogContent wrapper (wrapper conflicts with glassmorphic design)
  - CSS-based responsive switching throughout (hidden/md:block) instead of useMediaQuery JS hooks — avoids hydration mismatches
  - Google OAuth button uses bg-white intentionally per brand guidelines
patterns_established:
  - (auth) route group pattern for full-bleed auth pages without nav/footer
  - AuthPage as composable shell — accepts mode, heading, subtext, children
  - Bottom sheet pattern with CSS transform slide-up animation (translateY) and backdrop
  - Glassmorphic modal pattern using gradient background, border-strong, heavy shadow
  - Hash-based tab switching with useEffect hashchange listener
  - Empty state pattern for future tab content (centered icon + heading + description)
observability_surfaces:
  - data-testid attributes on all profile components for testing and browser automation
drill_down_paths:
  - .gsd/milestones/M001/slices/S05/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S05/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S05/tasks/T03-SUMMARY.md
duration: 3 tasks across 1 session
verification_result: passed
completed_at: 2026-03-13
---

# S05: Auth, Profile & OAuth Providers

**Auth pages render as cinematic split-screen (desktop) / full-screen (mobile) without nav/footer. AuthGateDialog is a glassmorphic modal + bottom sheet. Profile page shows hero banner with avatar, game badges, stat chips, and 4 hash-routed tabs. Google and Discord OAuth providers verified registered.**

## What Happened

Created `(auth)` route group with a minimal layout (no Header/Footer) for full-bleed auth pages. Built `AuthBrandPanel` — the left 55% of the desktop split — with SideDecked wordmark (48px font-display with text-shadow glow), tagline, three floating card silhouettes (positioned/rotated with purple/orange/blue color coding), trust bar with four game dots, and an 8s gradient-sweep CSS animation.

`AuthPage` is the composable split-screen shell. Desktop: flex row with brand panel at 55% and form panel at 45% on `bg-surface-1`. Mobile: brand panel hidden, replaced by compact logo with glow + tagline. Login and register pages are server components that check auth state and redirect, delegating form rendering to co-located client components (`LoginFormContent`, `RegisterFormContent`) that reuse existing form schemas, actions, and `SocialLoginButtons`.

Rewrote `AuthGateDialog` using Radix DialogPrimitive directly for the desktop modal: 480px, gradient background, border-strong, heavy shadow with purple glow, gradient lock icon, branded OAuth buttons. Built `AuthBottomSheet` as the mobile counterpart: slides up from bottom with handle bar, same content at mobile sizing. Responsive switching via CSS (`hidden md:block` / `md:hidden`).

Built `ProfilePage` composing `ProfileHero` and `ProfileTabs`. Hero has radial gradient background, avatar with gradient border and initials fallback, online status dot, display name, @username, joined date, bio, game badges using Voltage game color tokens, and stat chips. Desktop shows Edit Profile + Share buttons on the right; mobile stacks with 2×2 stats grid. Tabs use URL hash routing (`#collection`, `#settings`, etc.) with hashchange listener. Settings tab composes all 6 existing settings components. Collection/Decks/Activity render empty state placeholders.

Updated `/user` page to render `ProfilePage` when authenticated (parallel data fetching) and redirect to `/login` when unauthenticated, replacing the old sidebar layout + inline login form.

Verified backend OAuth: Google (`@medusajs/medusa/auth-google`) and Discord (`./src/modules/discord-auth`) both registered in `medusa-config.ts`. Generic callback route handles both providers.

## Verification

- `npx vitest run` — **789 tests pass** (exceeds 738+ baseline, zero regressions)
- `npx vitest run src/components/auth/__tests__/AuthPage.test.tsx` — 22 tests pass (brand panel, split-screen, login/register forms, compliance)
- `npx vitest run src/components/auth/__tests__/AuthGateDialog.test.tsx` — 15 tests pass (glassmorphic modal, bottom sheet, OAuth buttons, close, guest)
- `npx vitest run src/components/profile/__tests__/ProfilePage.test.tsx` — 23 tests pass (hero, tabs, tab content, integration, compliance)
- `grep -rn "bg-white|bg-gray-|text-gray-"` on auth/ and profile/ — only Google OAuth button `bg-white` (brand-required), zero theme violations

## Requirements Advanced

- R009 — Auth pages now render as cinematic split-screen matching wireframe structure at desktop and mobile breakpoints
- R010 — Profile page now renders hero banner with avatar, game badges, stat chips, and 4-tab layout matching wireframe structure
- R011 — Google OAuth provider verified registered in medusa-config.ts; callback route functional
- R012 — Discord OAuth provider verified registered in medusa-config.ts; callback route functional
- R024 — All new auth and profile components use Voltage tokens exclusively (verified by grep + test assertions)

## Requirements Validated

- None fully validated — R009/R010 have structural tests but need visual UAT comparison against wireframes. R011/R012 have provider registration confirmed but need live OAuth flow test with env vars configured.

## New Requirements Surfaced

- None

## Requirements Invalidated or Re-scoped

- None

## Deviations

- `LoginFormContent` and `RegisterFormContent` placed as co-located files with their route pages (`(auth)/login/`, `(auth)/register/`) rather than in `components/auth/` — they're page-specific form orchestrators, not reusable components.
- Used Radix DialogPrimitive directly instead of project's `DialogContent` wrapper for AuthGateDialog — the wrapper's built-in close button and styling conflicts with glassmorphic design.
- Wireframe shows a Wishlist tab on profile — task plan specifies 4 tabs (Collection/Decks/Activity/Settings), so Wishlist omitted per plan.

## Known Limitations

- OAuth providers are verified *registered* but not tested with live OAuth flow (requires Google/Discord API credentials configured as env vars)
- Profile stat chips show placeholder values (0/—) — collection/deck/trade count APIs don't exist yet
- Collection/Decks/Activity tabs show empty state placeholders — real content depends on future API work
- `PasswordValidator` component uses `text-red-700` / `text-green-700` internally (pre-existing Voltage compliance issue in upstream component, not introduced by this slice)
- `EmailVerificationBanner` has `bg-white` usage (pre-existing, not introduced by this slice)

## Follow-ups

- Wire profile stat chips to real counts when collection/deck APIs exist
- Add Wishlist tab to profile if wireframe intent is confirmed
- Fix `PasswordValidator` Voltage compliance (`text-red-700` → Voltage error token)
- Fix `EmailVerificationBanner` Voltage compliance (`bg-white` → Voltage surface token)
- Live OAuth end-to-end test when API credentials are configured

## Files Created/Modified

- `storefront/src/app/[locale]/(auth)/layout.tsx` — new route group layout without Header/Footer
- `storefront/src/app/[locale]/(auth)/login/page.tsx` — login page with auth check + AuthPage shell
- `storefront/src/app/[locale]/(auth)/login/LoginFormContent.tsx` — client component with login form logic
- `storefront/src/app/[locale]/(auth)/register/page.tsx` — register page with auth check + AuthPage shell
- `storefront/src/app/[locale]/(auth)/register/RegisterFormContent.tsx` — client component with register form logic
- `storefront/src/components/auth/AuthPage.tsx` — split-screen layout component
- `storefront/src/components/auth/AuthBrandPanel.tsx` — brand showcase panel with cards, dots, animation
- `storefront/src/components/auth/AuthGateDialog.tsx` — rewritten glassmorphic desktop modal
- `storefront/src/components/auth/AuthBottomSheet.tsx` — mobile bottom sheet with slide-up animation
- `storefront/src/components/auth/__tests__/AuthPage.test.tsx` — 22 tests
- `storefront/src/components/auth/__tests__/AuthGateDialog.test.tsx` — 15 tests
- `storefront/src/components/profile/ProfileHero.tsx` — hero banner with avatar, name, badges, stats
- `storefront/src/components/profile/ProfileTabs.tsx` — tabbed layout with URL hash routing
- `storefront/src/components/profile/ProfilePage.tsx` — composition shell for hero + tabs + settings
- `storefront/src/components/profile/tabs/CollectionTabContent.tsx` — collection empty state
- `storefront/src/components/profile/tabs/DecksTabContent.tsx` — decks empty state
- `storefront/src/components/profile/tabs/ActivityTabContent.tsx` — activity empty state
- `storefront/src/components/profile/__tests__/ProfilePage.test.tsx` — 23 tests
- `storefront/src/app/[locale]/(main)/user/page.tsx` — updated to render ProfilePage with parallel data fetching

## Forward Intelligence

### What the next slice should know
- Auth pages are at `/login` and `/register` (not `/user` or `/user/register`). The `/user` page now redirects unauthenticated users to `/login` with preserved error params.
- `AuthPage` component is composable — it accepts `mode`, `heading`, `subtext`, and `children`. If seller-specific auth variants are needed, wrap `AuthPage` with different props.
- Profile page is at `/user` and uses hash-based tab routing. The Settings tab composes all existing settings components, so `/user/settings` still works as a standalone page.

### What's fragile
- AuthBrandPanel gradient-sweep animation uses `dangerouslySetInnerHTML` style tag for keyframes — if CSP is ever tightened, this needs to move to a CSS file or CSS module.
- `PasswordValidator` Voltage violations (`text-red-700`/`text-green-700`) will show up in any future comprehensive Voltage audit — it's a pre-existing issue but worth noting.

### Authoritative diagnostics
- `data-testid` attributes on all profile components provide reliable selectors for browser automation and testing.
- Test files are the best entry point for understanding component contracts: `AuthPage.test.tsx` (22 tests), `AuthGateDialog.test.tsx` (15 tests), `ProfilePage.test.tsx` (23 tests).

### What assumptions changed
- Assumed we'd need a `useMediaQuery` hook for responsive auth/dialog switching — CSS-only `hidden/md:block` pattern was sufficient and avoids hydration issues.
- Assumed `DialogContent` wrapper could be styled for glassmorphic design — its built-in close button and defaults made Radix primitives the better choice.
