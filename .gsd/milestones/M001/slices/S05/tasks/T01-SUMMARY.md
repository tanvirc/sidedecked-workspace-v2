---
id: T01
parent: S05
milestone: M001
provides:
  - (auth) route group with no-nav/footer layout
  - AuthPage split-screen component (55/45 desktop, full-screen mobile)
  - AuthBrandPanel with wordmark, tagline, floating cards, game dots, gradient animation
  - Login page at /login with existing form logic and OAuth buttons
  - Register page at /register with existing form logic and PasswordValidator
  - /user page redirects unauthenticated users to /login with preserved error params
key_files:
  - storefront/src/app/[locale]/(auth)/layout.tsx
  - storefront/src/components/auth/AuthPage.tsx
  - storefront/src/components/auth/AuthBrandPanel.tsx
  - storefront/src/app/[locale]/(auth)/login/page.tsx
  - storefront/src/app/[locale]/(auth)/login/LoginFormContent.tsx
  - storefront/src/app/[locale]/(auth)/register/page.tsx
  - storefront/src/app/[locale]/(auth)/register/RegisterFormContent.tsx
  - storefront/src/app/[locale]/(main)/user/page.tsx
key_decisions:
  - LoginFormContent and RegisterFormContent are client components co-located with their route pages (not in components/auth/) since they're page-specific form orchestrators
  - OAuth error display logic moved from /user LoginFormWithErrors into LoginFormContent, preserving all error type handling
  - AuthBrandPanel gradient-sweep animation uses dangerouslySetInnerHTML style tag for keyframes (CSS modules not used in this codebase)
patterns_established:
  - (auth) route group pattern for full-bleed auth pages without nav/footer
  - AuthPage as a composable shell — accepts mode, heading, subtext, children
observability_surfaces:
  - none
duration: 25min
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T01: Build cinematic split-screen auth pages in (auth) route group

**Built split-screen auth layout with brand showcase panel at 55% width (floating card silhouettes, game dots, gradient-sweep animation) and form panel at 45%, with mobile full-screen fallback. Login and register pages reuse existing schemas and actions.**

## What Happened

Created `(auth)` route group with minimal layout (region check, no Header/Footer). Built `AuthBrandPanel` — the left 55% of the split — with SideDecked wordmark (48px, font-display, text-shadow glow), tagline, three floating card silhouettes (positioned/rotated per wireframe with purple/orange/blue color coding), trust bar with four game dots (MTG/Pokemon/YGO/OP), and an 8s gradient-sweep CSS animation.

Built `AuthPage` as the composable split-screen shell. Desktop: flex row with `AuthBrandPanel` at 55% and form panel at 45% (`bg-surface-1`, `border-l border-default`, centered content `max-w-[400px]`). Mobile: brand panel hidden (`hidden md:flex`), replaced by compact SideDecked logo with glow + tagline at top of full-screen form.

Login page (`/login`): server component checks `retrieveCustomer()` and redirects to `/user` if authenticated. Renders `LoginFormContent` client component that reuses `loginFormSchema`, `SocialLoginButtons`, existing `login()` action, and `LabeledInput`. Preserves OAuth error display (all error types from the old `LoginFormWithErrors`). Includes "Sign up" link to `/register`.

Register page (`/register`): same auth-check pattern. `RegisterFormContent` reuses `registerFormSchema`, `PasswordValidator`, `SocialLoginButtons`, `signup()` action. Includes "Sign in" link to `/login`.

Updated `/user` page: removed inline `LoginForm` rendering and `LoginFormWithErrors`. Now redirects unauthenticated users to `/login`, preserving OAuth error params as query string. Authenticated view kept as-is (will be replaced by ProfilePage in T03).

## Verification

- `npx vitest run src/components/auth/__tests__/AuthPage.test.tsx` — **22 tests pass** (brand panel wordmark/tagline/game dots/trust text/mobile hiding, AuthPage split-screen structure/heading/children/data-mode/mobile logo/55-45 widths, LoginFormContent OAuth buttons/email-password fields/sign-up link/sign-in button, RegisterFormContent OAuth buttons/name fields/password validator/sign-in link/create-account button, Voltage token compliance via file scan)
- `npx vitest run` — **760 tests pass**, 0 failures (no regressions)
- `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/auth/AuthPage.tsx storefront/src/components/auth/AuthBrandPanel.tsx` — zero matches (R024 compliant)

### Slice-level verification status (T01 of 3):
- ✅ `npx vitest run` — 760 tests pass (>738 baseline)
- ✅ `npx vitest run src/components/auth/__tests__/AuthPage.test.tsx` — 22 tests pass
- ⬜ `npx vitest run src/components/auth/__tests__/AuthGateDialog.test.tsx` — T02
- ⬜ `npx vitest run src/components/profile/__tests__/ProfilePage.test.tsx` — T03
- ⬜ `grep -rn` R024 check across auth/ + profile/ — partial (auth/ passes, profile/ is T03)

## Diagnostics

None — static UI components with no runtime state or API surface beyond existing form actions.

## Deviations

- Task plan listed `LoginFormContent` and `RegisterFormContent` as part of `AuthPage` component. Implemented them as separate co-located files with their route pages (`(auth)/login/LoginFormContent.tsx`, `(auth)/register/RegisterFormContent.tsx`) since they're page-specific form orchestrators with route-level imports.

## Known Issues

- `PasswordValidator` component uses `text-red-700` and `text-green-700` internally (pre-existing, not introduced by this task). This is a Voltage compliance issue in an upstream component that should be addressed separately.

## Files Created/Modified

- `storefront/src/app/[locale]/(auth)/layout.tsx` — new route group layout without Header/Footer
- `storefront/src/app/[locale]/(auth)/login/page.tsx` — login page with auth check + AuthPage shell
- `storefront/src/app/[locale]/(auth)/login/LoginFormContent.tsx` — client component with login form logic
- `storefront/src/app/[locale]/(auth)/register/page.tsx` — register page with auth check + AuthPage shell
- `storefront/src/app/[locale]/(auth)/register/RegisterFormContent.tsx` — client component with register form logic
- `storefront/src/components/auth/AuthPage.tsx` — split-screen layout component
- `storefront/src/components/auth/AuthBrandPanel.tsx` — brand showcase panel with cards, dots, animation
- `storefront/src/components/auth/__tests__/AuthPage.test.tsx` — 22 tests for layout, content, compliance
- `storefront/src/app/[locale]/(main)/user/page.tsx` — updated to redirect unauthenticated to /login
