---
id: T01
parent: S05
milestone: M001
provides:
  - "(auth) route group with full-bleed layout (no Header/Footer)"
  - "AuthPage split-screen component (55% brand / 45% form)"
  - "AuthBrandPanel with wordmark, floating cards, game dots, gradient-sweep animation"
  - "Login page at /login with LoginFormContent (reuses loginFormSchema, SocialLoginButtons, OAuth error display)"
  - "Register page at /register with RegisterFormContent (reuses registerFormSchema, PasswordValidator)"
  - "/user redirects unauthenticated users to /login with error params preserved"
key_files:
  - storefront/src/app/[locale]/(auth)/layout.tsx
  - storefront/src/app/[locale]/(auth)/login/page.tsx
  - storefront/src/app/[locale]/(auth)/login/LoginFormContent.tsx
  - storefront/src/app/[locale]/(auth)/register/page.tsx
  - storefront/src/app/[locale]/(auth)/register/RegisterFormContent.tsx
  - storefront/src/components/auth/AuthPage.tsx
  - storefront/src/components/auth/AuthBrandPanel.tsx
  - storefront/src/components/auth/__tests__/AuthPage.test.tsx
  - storefront/src/app/[locale]/(main)/user/page.tsx
key_decisions:
  - "AuthBrandPanel injects gradient-sweep CSS keyframes via dangerouslySetInnerHTML style tag to keep animation self-contained"
  - "LoginFormContent and RegisterFormContent are client components co-located with their route pages under (auth), keeping server page components thin"
  - "OAuth error params (error, provider, message) are handled in /user and redirected to /login as query params for display"
patterns_established:
  - "(auth) route group pattern: minimal layout with region check, no Header/Footer, bg-base wrapper"
  - "AuthPage component pattern: split-screen shell accepts mode/heading/subtext props with children for form content"
  - "FormContent pattern: client component co-located with route page, wraps FormProvider + form inner component"
observability_surfaces:
  - none
duration: 15m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Build cinematic split-screen auth pages in (auth) route group

**Cinematic split-screen auth layout built with AuthBrandPanel (floating cards, game dots, gradient-sweep), login/register pages, and all 22 tests passing.**

## What Happened

All components and pages were already scaffolded from a prior branch setup. Verified the implementation matches the wireframe spec and all must-haves:

- `(auth)` route group exists at `storefront/src/app/[locale]/(auth)/` with a minimal layout — region check only, no Header/Footer, just `min-h-screen bg-base` wrapper.
- `AuthBrandPanel` renders the left 55% on desktop (`hidden md:flex w-[55%]`): radial gradient background (purple + orange), SideDecked wordmark (48px, font-display, uppercase, text-shadow glow), tagline, 3 floating card silhouettes (positioned/rotated per wireframe with game-specific border colors), trust bar with 4 game dots (MTG/Pokemon/YGO/One Piece), gradient-sweep CSS animation (8s loop).
- `AuthPage` renders split-screen on desktop (flex row), full-screen on mobile. Mobile shows SideDecked logo header (28px, glow text-shadow) and tagline above the form, no brand panel. Form panel is `bg-surface-1`, `border-l border-default` on desktop, centered `max-w-[400px]`.
- Login page at `/login`: server component checks `retrieveCustomer()` → redirects to `/user` if authenticated. Renders `LoginFormContent` which reuses `loginFormSchema`, `SocialLoginButtons`, `LabeledInput`, and the existing `login()` action. Displays OAuth error banners from query params. "Sign up" link points to `/register`.
- Register page at `/register`: same auth-check pattern. Renders `RegisterFormContent` which reuses `registerFormSchema`, `PasswordValidator`, `SocialLoginButtons`. "Sign in" link points to `/login`.
- `/user` page already redirects unauthenticated users to `/login`, passing OAuth error params as query strings.

## Verification

- `cd storefront && npx vitest run src/components/auth/__tests__/AuthPage.test.tsx` — **22 tests pass** (AuthBrandPanel: 5, AuthPage: 7, LoginFormContent: 4, RegisterFormContent: 4, Voltage compliance: 1, UserPage redirect: 1)
- `cd storefront && npx vitest run` — **794 tests pass** (all green, well above 738 baseline)
- `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/auth/AuthPage.tsx storefront/src/components/auth/AuthBrandPanel.tsx` — **zero matches** (Voltage token compliance confirmed)

### Slice-level verification status (T01 of T03):
- ✅ `npx vitest run src/components/auth/__tests__/AuthPage.test.tsx` — 22 pass
- ⬜ `npx vitest run src/components/auth/__tests__/AuthGateDialog.test.tsx` — not yet (T02)
- ⬜ `npx vitest run src/components/profile/__tests__/ProfilePage.test.tsx` — not yet (T03)
- ✅ `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/auth/` — zero matches for auth components
- ⬜ Profile components not yet built (T03)

## Diagnostics

None — pure UI component work with no runtime diagnostics needed.

## Deviations

None. All components were already scaffolded on this branch and matched the spec. No code changes were needed.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/app/[locale]/(auth)/layout.tsx` — minimal auth layout (no nav/footer, region check)
- `storefront/src/app/[locale]/(auth)/login/page.tsx` — login page with auth check + AuthPage split-screen
- `storefront/src/app/[locale]/(auth)/login/LoginFormContent.tsx` — client component with login form, OAuth error display
- `storefront/src/app/[locale]/(auth)/register/page.tsx` — register page with auth check + AuthPage split-screen
- `storefront/src/app/[locale]/(auth)/register/RegisterFormContent.tsx` — client component with register form + PasswordValidator
- `storefront/src/components/auth/AuthPage.tsx` — split-screen layout (55% brand / 45% form, mobile header)
- `storefront/src/components/auth/AuthBrandPanel.tsx` — brand panel with wordmark, cards, game dots, gradient animation
- `storefront/src/components/auth/__tests__/AuthPage.test.tsx` — 22 tests covering layout, content, compliance
- `storefront/src/app/[locale]/(main)/user/page.tsx` — redirects unauthenticated to /login with error params
