---
estimated_steps: 7
estimated_files: 8
---

# T01: Build cinematic split-screen auth pages in (auth) route group

**Slice:** S05 — Auth, Profile & OAuth Providers
**Milestone:** M001

## Description

Replace the current centered-card auth layout (inside `(main)` with nav/footer) with a cinematic split-screen layout per the `storefront-auth.html` wireframe. Create a new `(auth)` route group that opts out of ModernHeader and Footer. Build the `AuthPage` split-screen component and wire it to existing form logic, schemas, and `SocialLoginButtons`.

## Steps

1. **Create `(auth)` route group with minimal layout** — `storefront/src/app/[locale]/(auth)/layout.tsx`. No Header/Footer. Just a div wrapper. This ensures auth pages are full-bleed.

2. **Build `AuthBrandPanel` component** — Left 55% of desktop split-screen. Contains: gradient background (radial purple + orange), SideDecked wordmark (48px `font-display` uppercase), tagline ("The marketplace for competitive players"), 3 floating card silhouettes (positioned/rotated per wireframe), trust bar with game dots (MTG/Pokemon/YGO/OP), gradient-sweep CSS animation (8s loop via `@keyframes`). Hidden on mobile (`hidden md:flex`).

3. **Build `AuthPage` split-screen component** — Accepts `children` (the form content) and a `mode` prop ("login" | "register"). Desktop: flex row, `AuthBrandPanel` at 55% width, form panel at 45% width (`bg-surface-1`, `border-l border-default`, centered content with `max-w-[400px]`). Mobile: full-screen, SideDecked logo at top (28px wordmark with glow), tagline, then form content. Include `auth-form__heading` and `auth-form__subtext` as props or children.

4. **Create login page** — `storefront/src/app/[locale]/(auth)/login/page.tsx`. Server component that checks `retrieveCustomer()` → redirect to `/user` if authenticated. Otherwise renders `AuthPage mode="login"` with `LoginFormContent` (client component). `LoginFormContent` reuses `loginFormSchema`, `SocialLoginButtons`, existing `login()` action, `LabeledInput`. Preserve OAuth error display from current `LoginFormWithErrors`. Add "Don't have an account? Sign up" link pointing to `/register`.

5. **Create register page** — `storefront/src/app/[locale]/(auth)/register/page.tsx`. Same auth-check pattern. Renders `AuthPage mode="register"` with `RegisterFormContent` (client component). Reuses `registerFormSchema`, `SocialLoginButtons`, `PasswordValidator`, `signup()` action. Add "Already have an account? Sign in" link to `/login`.

6. **Update `/user` page** — When unauthenticated, redirect to `/login` instead of rendering `LoginForm` inline. When authenticated, keep the current welcome view (will be replaced in T03 with ProfilePage). Preserve `searchParams` error handling by passing errors as query params to `/login`.

7. **Write tests** — `storefront/src/components/auth/__tests__/AuthPage.test.tsx`. Test: split-screen renders brand panel + form panel, brand panel shows wordmark and game dots, mobile hides brand panel (test `hidden md:flex` class), login form renders OAuth buttons + email/password fields, register form renders name fields + password strength indicator, "Sign up" / "Sign in" toggle links exist with correct hrefs, Voltage tokens used (no `bg-white`, `bg-gray-*`, `text-gray-*`).

## Must-Haves

- [ ] `(auth)` route group exists with layout that has no Header/Footer
- [ ] `AuthPage` renders 55/45 split-screen on desktop with brand panel and form panel
- [ ] `AuthBrandPanel` shows wordmark, tagline, floating card silhouettes, game dots, gradient-sweep animation
- [ ] Mobile auth is full-screen with logo header, no brand panel
- [ ] Login page at `/login` uses existing `loginFormSchema` and `SocialLoginButtons`
- [ ] Register page at `/register` uses existing `registerFormSchema` and `PasswordValidator`
- [ ] `/user` redirects to `/login` when unauthenticated (preserving error params)
- [ ] All styling uses Voltage tokens — zero Tailwind gray classes in new components
- [ ] Tests pass for auth page layout structure

## Verification

- `cd storefront && npx vitest run src/components/auth/__tests__/AuthPage.test.tsx` — all tests pass
- `cd storefront && npx vitest run` — 738+ tests pass (no regressions)
- `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/auth/AuthPage.tsx storefront/src/components/auth/AuthBrandPanel.tsx` — zero matches

## Inputs

- `docs/plans/wireframes/storefront-auth.html` — authoritative design target (States 1 + 2, desktop + mobile)
- `storefront/src/components/molecules/LoginForm/LoginForm.tsx` — existing form logic to extract and reuse
- `storefront/src/components/molecules/RegisterForm/RegisterForm.tsx` — existing form logic to extract and reuse
- `storefront/src/components/molecules/SocialLoginButtons/SocialLoginButtons.tsx` — OAuth button component (reuse as-is or restyle)
- `storefront/src/components/molecules/LoginForm/schema.ts` — `loginFormSchema` (reuse)
- `storefront/src/components/molecules/RegisterForm/schema.ts` — `registerFormSchema` (reuse)
- `storefront/src/lib/data/customer.ts` — `retrieveCustomer()` for auth check
- `storefront/src/app/[locale]/(main)/user/page.tsx` — current dual-purpose page to update

## Expected Output

- `storefront/src/app/[locale]/(auth)/layout.tsx` — minimal layout without nav/footer
- `storefront/src/app/[locale]/(auth)/login/page.tsx` — login page with AuthPage split-screen
- `storefront/src/app/[locale]/(auth)/register/page.tsx` — register page with AuthPage split-screen
- `storefront/src/components/auth/AuthPage.tsx` — split-screen layout component
- `storefront/src/components/auth/AuthBrandPanel.tsx` — brand showcase panel
- `storefront/src/components/auth/__tests__/AuthPage.test.tsx` — layout and content tests
- `storefront/src/app/[locale]/(main)/user/page.tsx` — updated to redirect unauthenticated to `/login`
