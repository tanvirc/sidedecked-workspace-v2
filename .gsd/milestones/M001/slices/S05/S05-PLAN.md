# S05: Auth, Profile & OAuth Providers

**Goal:** Auth pages, AuthGateDialog, and profile page match their wireframes. Google and Discord OAuth verified functional. Session persists via JWT + refresh token cookies.
**Demo:** Auth pages render as cinematic split-screen (desktop) / full-screen (mobile) without nav/footer. AuthGateDialog renders as glassmorphic modal (desktop) / bottom sheet (mobile). Profile page shows hero banner with avatar, game badges, stat chips, and 4 tabs (Collection/Decks/Activity/Settings). OAuth providers are verified registered and tested.

## Must-Haves

- Auth pages use `(auth)` route group — no ModernHeader/Footer, full-bleed split-screen layout
- Desktop auth: 55% brand showcase panel (floating card silhouettes, game dots, tagline, gradient-sweep CSS animation) / 45% form panel on `bg-surface-1`
- Mobile auth: full-screen with SideDecked logo header, no brand panel
- Login/signup forms reuse existing `loginFormSchema`/`registerFormSchema` and `SocialLoginButtons`
- AuthGateDialog: glassmorphic modal card with gradient icon, bold heading, OAuth buttons (desktop) / bottom sheet with handle bar (mobile)
- Profile page: hero banner with radial gradient, avatar with status indicator, display name, username, joined date, bio, game badges, stat chips, action buttons
- Profile tabs: Collection, Decks, Activity, Settings — using URL hash for deep linking
- Settings tab composes existing `ProfileDetails`, `PublicProfile`, `UserPreferences`, `Addresses`, `ProfilePassword`, `SecuritySettings`
- Collection/Decks/Activity tabs render with placeholder empty states
- Google and Discord OAuth providers verified registered in `medusa-config.ts` and callback route functional
- All new components use Voltage tokens exclusively (R024)

## Proof Level

- This slice proves: integration (OAuth providers registered + visual alignment)
- Real runtime required: no (OAuth env vars needed for live test, visual verified via test assertions)
- Human/UAT required: yes (visual comparison of auth and profile pages against wireframes at 1440px and 390px)

## Verification

- `cd storefront && npx vitest run` — 738+ tests pass (existing baseline preserved + new tests)
- `cd storefront && npx vitest run src/components/auth/__tests__/AuthPage.test.tsx` — auth split-screen layout tests
- `cd storefront && npx vitest run src/components/auth/__tests__/AuthGateDialog.test.tsx` — rewritten AuthGateDialog tests
- `cd storefront && npx vitest run src/components/profile/__tests__/ProfilePage.test.tsx` — profile page hero + tabs tests
- `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/auth/ storefront/src/components/profile/` — zero matches (R024)

## Integration Closure

- Upstream surfaces consumed: `storefront/src/lib/actions/oauth.ts` (OAuth initiation), `storefront/src/lib/oauth.ts` (provider config), `storefront/src/lib/deferred-intent.ts` (deferred auth), `storefront/src/lib/data/customer.ts` (retrieveCustomer, getCustomerProfile), existing form schemas, existing settings components
- New wiring introduced in this slice: `(auth)` route group with layout, `AuthPage` component, rewritten `AuthGateDialog`, `ProfilePage` with tabbed layout
- What remains before the milestone is truly usable end-to-end: S08 (seller listing wizard depends on auth session), S09 (cart optimizer), S10 (integration)

## Tasks

- [x] **T01: Build cinematic split-screen auth pages in (auth) route group** `est:2h`
  - Why: Auth pages currently render as centered cards inside `(main)` layout with nav/footer. Wireframe demands full-bleed split-screen without nav/footer. This is the core visual work for R009.
  - Files: `storefront/src/app/[locale]/(auth)/layout.tsx`, `storefront/src/app/[locale]/(auth)/login/page.tsx`, `storefront/src/app/[locale]/(auth)/register/page.tsx`, `storefront/src/components/auth/AuthPage.tsx`, `storefront/src/components/auth/AuthBrandPanel.tsx`, `storefront/src/components/auth/__tests__/AuthPage.test.tsx`, `storefront/src/app/[locale]/(main)/user/page.tsx`
  - Do: Create `(auth)` route group with minimal layout (no Header/Footer). Build `AuthPage` split-screen component with `AuthBrandPanel` (55% width, floating card silhouettes, game dots, trust text, gradient-sweep 8s CSS animation) and form panel (45% width, `bg-surface-1`). Desktop: split-screen. Mobile (`md:` breakpoint): full-screen with SideDecked logo, no brand panel. Login page composes `AuthPage` with login form (reuse `loginFormSchema`, `SocialLoginButtons`, existing submit logic). Register page composes `AuthPage` with register form (reuse `registerFormSchema`, `PasswordValidator`). Update `/user` page to redirect to `/login` when unauthenticated instead of showing `LoginForm` inline. Preserve OAuth error display. Keep existing `/user/register` redirecting authenticated users. All styling via Voltage tokens — no Tailwind grays.
  - Verify: `npx vitest run src/components/auth/__tests__/AuthPage.test.tsx` passes; auth pages render without nav/footer; login/register forms submit correctly; mobile layout is full-screen
  - Done when: Auth pages at `/login` and `/register` render split-screen on desktop, full-screen on mobile, with no ModernHeader/Footer, matching wireframe structure

- [x] **T02: Rewrite AuthGateDialog as glassmorphic modal + mobile bottom sheet** `est:1h`
  - Why: Current AuthGateDialog is a plain shadcn Dialog with text-only buttons. Wireframe demands glassmorphic modal card (desktop) with gradient icon and bold heading, and bottom sheet with handle bar (mobile). Also covers backend OAuth provider verification for R011/R012.
  - Files: `storefront/src/components/auth/AuthGateDialog.tsx`, `storefront/src/components/auth/__tests__/AuthGateDialog.test.tsx`, `storefront/src/components/auth/AuthBottomSheet.tsx`
  - Do: Rewrite `AuthGateDialog` to render `AuthBottomSheet` on mobile and glassmorphic Dialog on desktop. Desktop modal: `bg gradient(bg-surface-2 → bg-surface-1)`, `border-strong`, `rounded-[20px]`, close button (32px, `bg-surface-3`), gradient icon (48px, `rounded-[14px]`, purple-orange gradient), `font-display` heading 26px, description with `<strong>` for action context, 3 OAuth buttons (h-44, `rounded-[12px]`), ghost "Continue as guest" button, trigger annotations. Mobile bottom sheet: slides up from bottom, `rounded-t-[20px]`, handle bar (40×4px, `bg-surface-4`), same content at slightly smaller sizing (icon 40px, heading 22px, buttons h-42). Use `SocialLoginButtons` or equivalent for OAuth buttons. Update existing tests to match new component structure. Verify Google auth provider is registered in `medusa-config.ts` and Discord auth module exists with tests — document verification in test file comments.
  - Verify: `npx vitest run src/components/auth/__tests__/AuthGateDialog.test.tsx` passes with updated assertions; modal renders glassmorphic styling; bottom sheet renders handle bar
  - Done when: AuthGateDialog matches wireframe glassmorphic modal (desktop) and bottom sheet (mobile); OAuth providers verified registered

- [x] **T03: Build profile page with hero banner and tabbed layout** `est:2h`
  - Why: Current profile page is a simple sidebar + settings layout. Wireframe demands a hero banner with avatar, tabbed content area (Collection/Decks/Activity/Settings). This is the core visual work for R010.
  - Files: `storefront/src/app/[locale]/(main)/user/page.tsx`, `storefront/src/components/profile/ProfilePage.tsx`, `storefront/src/components/profile/ProfileHero.tsx`, `storefront/src/components/profile/ProfileTabs.tsx`, `storefront/src/components/profile/__tests__/ProfilePage.test.tsx`, `storefront/src/app/[locale]/(main)/user/settings/page.tsx`
  - Do: Build `ProfileHero` component: 280px height, radial gradient background (purple, fading to `bg-base` at bottom), avatar circle (96px, gradient border, initials, online status dot), display name (28px `font-display`), username, joined date with calendar icon, bio, game badges (MTG/Pokemon/YGO pills with game-specific colors). Right side: "Edit Profile" ghost button, share icon button, stat chips (cards/decks/trades/rating with icons). Build `ProfileTabs` component: tab bar with `font-heading` 14px labels (Collection/Decks/Activity/Settings), active tab uses `brand-primary` color + 2px bottom border. Tab state via URL hash (`#collection`, `#settings`, etc.) with `useHash` hook or `window.location.hash`. Settings tab composes existing `ProfileDetails`, `PublicProfile`, `UserPreferences`, `Addresses`, `ProfilePassword`, `SecuritySettings` in a `space-y-6` stack. Collection/Decks/Activity tabs render empty state placeholders (icon + "Your collection will appear here" messaging). Update `/user` page to render `ProfilePage` when authenticated (replacing simple welcome message). Keep `/user/settings` as a standalone page that works independently. Mobile: hero stacks vertically, avatar smaller (72px), stats wrap, tabs scroll horizontally.
  - Verify: `npx vitest run src/components/profile/__tests__/ProfilePage.test.tsx` passes; profile page renders hero with avatar and tabs; settings tab shows existing settings components; tab switching works via hash
  - Done when: Profile page at `/user` renders hero banner + 4 tabs matching wireframe structure, Settings tab composes all existing settings components, Collection/Decks/Activity show placeholder empty states

## Files Likely Touched

- `storefront/src/app/[locale]/(auth)/layout.tsx` — new route group layout (no nav/footer)
- `storefront/src/app/[locale]/(auth)/login/page.tsx` — new login page
- `storefront/src/app/[locale]/(auth)/register/page.tsx` — new register page
- `storefront/src/components/auth/AuthPage.tsx` — split-screen auth layout component
- `storefront/src/components/auth/AuthBrandPanel.tsx` — left panel brand showcase
- `storefront/src/components/auth/AuthGateDialog.tsx` — rewritten glassmorphic modal
- `storefront/src/components/auth/AuthBottomSheet.tsx` — mobile bottom sheet for deferred auth
- `storefront/src/components/auth/__tests__/AuthPage.test.tsx` — auth page tests
- `storefront/src/components/auth/__tests__/AuthGateDialog.test.tsx` — updated tests
- `storefront/src/components/profile/ProfilePage.tsx` — profile with hero + tabs
- `storefront/src/components/profile/ProfileHero.tsx` — hero banner component
- `storefront/src/components/profile/ProfileTabs.tsx` — tabbed content area
- `storefront/src/components/profile/__tests__/ProfilePage.test.tsx` — profile page tests
- `storefront/src/app/[locale]/(main)/user/page.tsx` — updated to use ProfilePage / redirect
