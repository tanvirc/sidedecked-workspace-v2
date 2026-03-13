---
id: S05
parent: M001
milestone: M001
provides:
  - "(auth) route group with full-bleed layout (no Header/Footer)"
  - "AuthPage split-screen component (55% brand panel / 45% form panel)"
  - "AuthBrandPanel with wordmark, floating card silhouettes, game dots, gradient-sweep 8s CSS animation"
  - "Login page at /login with LoginFormContent (reuses loginFormSchema, SocialLoginButtons)"
  - "Register page at /register with RegisterFormContent (reuses registerFormSchema, PasswordValidator)"
  - "/user redirects unauthenticated users to /login with OAuth error params preserved"
  - "Glassmorphic AuthGateDialog desktop modal (Radix DialogPrimitive, 480px, gradient bg, gradient icon)"
  - "AuthBottomSheet mobile component (slide-up, handle bar, branded OAuth buttons)"
  - "ProfileHero with radial gradient, avatar (gradient border, initials), game badges, stat chips"
  - "ProfileTabs with URL hash routing (Collection/Decks/Activity/Settings)"
  - "ProfilePage composition shell at /user for authenticated users"
  - "Empty state placeholders for Collection/Decks/Activity tabs"
  - "Google OAuth provider verified registered in medusa-config.ts"
  - "Discord OAuth provider verified registered in medusa-config.ts"
requires:
  - slice: S01
    provides: "Voltage tokens, nav, footer, form styling, shadcn/ui primitives"
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
  - storefront/src/components/profile/ProfilePage.tsx
  - storefront/src/components/profile/ProfileHero.tsx
  - storefront/src/components/profile/ProfileTabs.tsx
  - storefront/src/components/profile/tabs/CollectionTabContent.tsx
  - storefront/src/components/profile/tabs/DecksTabContent.tsx
  - storefront/src/components/profile/tabs/ActivityTabContent.tsx
  - storefront/src/components/auth/__tests__/AuthPage.test.tsx
  - storefront/src/components/auth/__tests__/AuthGateDialog.test.tsx
  - storefront/src/components/profile/__tests__/ProfilePage.test.tsx
  - storefront/src/app/[locale]/(main)/user/page.tsx
key_decisions:
  - "D021: Auth pages use separate (auth) route group without Header/Footer"
  - "D022: Profile tab state via URL hash + hashchange listener"
  - "D023: Commit child repo changes to slice branch during task execution"
  - "AuthGateDialog uses Radix DialogPrimitive directly — project DialogContent wrapper conflicts with glassmorphic design"
  - "CSS-based responsive switching (hidden/md:block) instead of useMediaQuery JS hook — avoids hydration mismatches"
  - "Google OAuth bg-white is intentional per brand guidelines, not a Voltage violation"
  - "AuthBrandPanel injects gradient-sweep CSS keyframes via dangerouslySetInnerHTML style tag"
patterns_established:
  - "(auth) route group pattern: minimal layout with region check, no Header/Footer, bg-base wrapper"
  - "AuthPage split-screen shell: accepts mode/heading/subtext props with children for form content"
  - "FormContent pattern: client component co-located with route page, wraps FormProvider + form inner component"
  - "Bottom sheet pattern: CSS transform slide-up animation (translateY) with backdrop"
  - "Glassmorphic modal pattern: gradient background, border-strong, heavy shadow, gradient icon"
  - "Hash-based tab switching: useEffect hashchange listener for client-side tab routing"
  - "Empty state pattern: centered icon + heading + description for future tab content"
observability_surfaces:
  - "data-testid attributes on all profile elements for testing and browser automation"
drill_down_paths:
  - .gsd/milestones/M001/slices/S05/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S05/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S05/tasks/T03-SUMMARY.md
duration: 3 tasks across 2 context windows
verification_result: passed
completed_at: 2026-03-14
---

# S05: Auth, Profile & OAuth Providers

**Cinematic split-screen auth pages, glassmorphic AuthGateDialog, profile page with hero banner and 4-tab hash-routed layout, and Google/Discord OAuth providers verified registered — 60 new tests, 794 total passing.**

## What Happened

**T01** moved auth pages out of the `(main)` layout into a new `(auth)` route group at `/login` and `/register`. Desktop renders a 55/45 split-screen: `AuthBrandPanel` on the left with SideDecked wordmark, floating card silhouettes with game-specific border colors, game dots, trust text, and an 8-second gradient-sweep CSS animation — form panel on the right on `bg-surface-1`. Mobile is full-screen with a compact logo header and no brand panel. Both pages reuse existing form schemas (`loginFormSchema`/`registerFormSchema`), `SocialLoginButtons`, and `PasswordValidator`. `/user` redirects unauthenticated users to `/login`, preserving OAuth error params.

**T02** replaced the plain shadcn AuthGateDialog with a glassmorphic desktop modal (480px, gradient bg, `border-strong`, `rounded-[20px]`, gradient lock icon, branded OAuth buttons) using Radix DialogPrimitive directly to avoid the project's `DialogContent` wrapper conflicts. Built `AuthBottomSheet` for mobile: fixed bottom, `rounded-t-[20px]`, handle bar, slide-up CSS transition. Responsive switching is pure CSS (`hidden md:block` / `md:hidden`). Verified Google (`@medusajs/medusa/auth-google`) and Discord (`./src/modules/discord-auth`) OAuth providers are registered in `medusa-config.ts` with a generic callback route handling both.

**T03** replaced the sidebar `/user` page with a full-width `ProfilePage`. `ProfileHero` renders a 280px radial-gradient banner with avatar (gradient border, initials fallback, online status dot), display name, @username, joined date, bio, game badges (using Voltage game color tokens), and stat chips. Desktop shows Edit Profile + Share buttons with stats row; mobile stacks with 2×2 stats grid. `ProfileTabs` provides 4 tabs (Collection/Decks/Activity/Settings) with URL hash routing. Settings tab composes all 6 existing settings components. Other tabs show empty state placeholders. Standalone `/user/settings` route preserved.

## Verification

- `npx vitest run src/components/auth/__tests__/AuthPage.test.tsx` — **22 tests pass** (brand panel, split-screen, login/register forms, mobile layout, Voltage compliance, redirect)
- `npx vitest run src/components/auth/__tests__/AuthGateDialog.test.tsx` — **15 tests pass** (glassmorphic modal, gradient icon, OAuth buttons, close button, bottom sheet handle, backdrop)
- `npx vitest run src/components/profile/__tests__/ProfilePage.test.tsx` — **23 tests pass** (hero, avatar, game badges, stat chips, tabs, tab switching, settings composition, empty states, Voltage compliance)
- `npx vitest run` — **794 tests pass** (above 738 baseline, zero regressions)
- `grep -rn "bg-white|bg-gray-|text-gray-"` on auth/profile components — zero matches in component source (only Google OAuth brand `bg-white` and `EmailVerificationBanner` with `dark:` override)

## Requirements Advanced

- R009 — Auth pages now render as cinematic split-screen in `(auth)` route group matching wireframe structure. 22 tests verify layout, content, and Voltage compliance. Visual UAT pending.
- R010 — Profile page rebuilt with hero banner, avatar, game badges, stat chips, and 4-tab hash-routed layout. 23 tests verify structure. Visual UAT pending.
- R011 — Google auth provider (`@medusajs/medusa/auth-google`) verified registered in `medusa-config.ts`. Generic callback route handles provider. Live end-to-end flow requires API credentials.
- R012 — Discord auth provider (`./src/modules/discord-auth`) verified registered in `medusa-config.ts`. Migration exists. Live end-to-end flow requires API credentials.
- R024 — Auth and profile components verified zero hardcoded light-mode colors (Voltage tokens only, except brand-mandated Google button).

## Requirements Validated

- None moved to validated — R009/R010 still need visual UAT comparison at 1440px and 390px. R011/R012 need live OAuth credentials for end-to-end proof.

## New Requirements Surfaced

- None

## Requirements Invalidated or Re-scoped

- None

## Deviations

- AuthGateDialog uses Radix DialogPrimitive directly instead of the project's `DialogContent` wrapper — the wrapper's built-in close button and default styling conflict with the glassmorphic design. Cleaner than fighting the abstraction.
- CSS-based responsive switching instead of `useMediaQuery` JS hook mentioned in plan — strictly better (no hydration mismatch, no extra JS, matches codebase Tailwind patterns).
- Wishlist tab omitted from profile — plan specifies 4 tabs (Collection/Decks/Activity/Settings). Wishlist can be added in a future slice.

## Known Limitations

- Profile stat chips show placeholder values (0/—) — collection/deck/trade count APIs don't exist yet.
- Collection/Decks/Activity tabs are empty state placeholders — real content depends on future API work.
- OAuth end-to-end flow not live-tested — providers are registered but API credentials (Google Client ID/Secret, Discord Client ID/Secret) must be configured as env vars for live testing.
- Proof Strategy item "OAuth integration → retire in S05 by proving Google login creates a user with valid JWT" is partially met — structural registration verified, live JWT flow deferred to credential configuration.

## Follow-ups

- Configure Google and Discord OAuth credentials to prove live end-to-end flow (could be done as part of S08 or S10 integration).
- Wire real data to profile stat chips when collection/deck count APIs exist.
- Populate Collection/Decks/Activity tab content when those features ship.

## Files Created/Modified

- `storefront/src/app/[locale]/(auth)/layout.tsx` — minimal auth layout (no nav/footer, region check)
- `storefront/src/app/[locale]/(auth)/login/page.tsx` — login page with auth check + AuthPage split-screen
- `storefront/src/app/[locale]/(auth)/login/LoginFormContent.tsx` — client component with login form, OAuth error display
- `storefront/src/app/[locale]/(auth)/register/page.tsx` — register page with auth check + AuthPage split-screen
- `storefront/src/app/[locale]/(auth)/register/RegisterFormContent.tsx` — client component with register form + PasswordValidator
- `storefront/src/components/auth/AuthPage.tsx` — split-screen layout (55% brand / 45% form, mobile header)
- `storefront/src/components/auth/AuthBrandPanel.tsx` — brand panel with wordmark, cards, game dots, gradient animation
- `storefront/src/components/auth/AuthGateDialog.tsx` — rewritten glassmorphic desktop modal (Radix primitives)
- `storefront/src/components/auth/AuthBottomSheet.tsx` — mobile bottom sheet with slide-up animation
- `storefront/src/components/auth/__tests__/AuthPage.test.tsx` — 22 tests
- `storefront/src/components/auth/__tests__/AuthGateDialog.test.tsx` — 15 tests
- `storefront/src/components/profile/ProfilePage.tsx` — composition shell for hero + tabs + settings
- `storefront/src/components/profile/ProfileHero.tsx` — hero banner with avatar, name, badges, stats
- `storefront/src/components/profile/ProfileTabs.tsx` — tabbed layout with URL hash routing
- `storefront/src/components/profile/tabs/CollectionTabContent.tsx` — collection empty state
- `storefront/src/components/profile/tabs/DecksTabContent.tsx` — decks empty state
- `storefront/src/components/profile/tabs/ActivityTabContent.tsx` — activity empty state
- `storefront/src/components/profile/__tests__/ProfilePage.test.tsx` — 23 tests
- `storefront/src/app/[locale]/(main)/user/page.tsx` — updated to render ProfilePage, redirects unauth to /login

## Forward Intelligence

### What the next slice should know
- Auth pages live at `/login` and `/register` in the `(auth)` route group — they have no Header/Footer. The old `/user` inline login is gone; `/user` now renders ProfilePage for authenticated users and redirects to `/login` for unauthenticated.
- S08 depends on authenticated seller session from this slice. The session mechanism works (JWT + cookies), but OAuth providers need credentials configured for live testing.
- The generic callback route at `[auth_provider]/callback/route.ts` handles all OAuth providers — no per-provider callback route needed.

### What's fragile
- `AuthBrandPanel` gradient-sweep animation uses `dangerouslySetInnerHTML` for CSS keyframes — if SSR or CSP policies change, this could break. It's self-contained but worth noting.
- Profile stat chips are hardcoded placeholders — any slice that ships collection/deck APIs should wire these.

### Authoritative diagnostics
- `data-testid` attributes on all profile elements — reliable selectors for browser automation and debugging.
- Auth page test file (`AuthPage.test.tsx`) includes a Voltage compliance scan that greps source files for forbidden color classes — catches regressions automatically.

### What assumptions changed
- Plan assumed OAuth providers might need new implementation — both were already registered in `medusa-config.ts`. The work was verification and visual alignment, not provider coding.
