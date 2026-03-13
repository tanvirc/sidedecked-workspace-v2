# S05: Auth, Profile & OAuth Providers — UAT

**Milestone:** M001
**Written:** 2026-03-13

## UAT Type

- UAT mode: mixed (artifact-driven structural verification + human-experience visual comparison)
- Why this mode is sufficient: Structural alignment verified by 60 tests across 3 test files. Visual fidelity requires human comparison against wireframes at both breakpoints. OAuth live flow requires env var configuration.

## Preconditions

- Storefront running locally (`npm run dev` in storefront/)
- Backend running with Google/Discord OAuth env vars configured (for OAuth tests only)
- Browser at 1440px width for desktop checks, 390px for mobile checks

## Smoke Test

Navigate to `/login` — should see a cinematic split-screen with brand panel on the left (floating card silhouettes, gradient animation) and login form on the right. No navigation bar or footer visible.

## Test Cases

### 1. Login page — desktop split-screen layout

1. Open browser at 1440px width
2. Navigate to `/login`
3. **Expected:** Full-bleed page with no nav/footer. Left 55% shows SideDecked wordmark, tagline, floating card silhouettes, game dots (MTG/PKM/YGO/OP), gradient-sweep animation. Right 45% shows login form on `bg-surface-1` with email/password fields, "Sign In" button, Google/Discord/Microsoft OAuth buttons, and "Sign up" link.

### 2. Login page — mobile full-screen layout

1. Resize browser to 390px width (or use mobile emulation)
2. Navigate to `/login`
3. **Expected:** Full-screen dark page. SideDecked logo with glow at top, tagline below it. Login form centered. No brand panel visible. OAuth buttons present. "Sign up" link present.

### 3. Register page — desktop split-screen

1. Navigate to `/register` at 1440px
2. **Expected:** Same brand panel as login. Right panel shows first name, last name, email, password fields, `PasswordValidator` strength indicator, OAuth buttons, "Sign in" link.

### 4. Register page — mobile

1. Navigate to `/register` at 390px
2. **Expected:** Same mobile layout as login but with register form fields.

### 5. Unauthenticated redirect from /user

1. Ensure not logged in
2. Navigate to `/user`
3. **Expected:** Redirects to `/login`. No flash of profile page content.

### 6. AuthGateDialog — desktop glassmorphic modal

1. Navigate to any page that triggers deferred auth (e.g., try to save a deck without being logged in)
2. **Expected:** Glassmorphic modal overlay with gradient lock icon (48px), bold heading, description text, 3 branded OAuth buttons (Google white, Discord purple, Microsoft dark), "Continue as Guest" ghost button, custom close button (top-right, 32px circle).

### 7. AuthGateDialog — mobile bottom sheet

1. Same trigger as above but at 390px width
2. **Expected:** Bottom sheet slides up from bottom of screen. Handle bar (40×4px) at top. Same content as desktop but at mobile sizing (icon 40px, heading 22px, buttons h-42).

### 8. Profile page — hero banner (desktop)

1. Log in with a valid account
2. Navigate to `/user` at 1440px
3. **Expected:** Hero banner (280px height) with radial gradient (purple, fading to base). Avatar circle (96px) with gradient border and initials. Display name (28px font-display), @username, "Joined" date with calendar icon, bio. Game badges as colored pills. Right side: "Edit Profile" ghost button, share icon, stat chips (Cards/Decks/Trades/Rating).

### 9. Profile page — hero banner (mobile)

1. View `/user` at 390px
2. **Expected:** Avatar smaller (72px), content stacks vertically, stat chips in 2×2 grid below hero, "Edit Profile" and share buttons below stats.

### 10. Profile page — tab navigation

1. On `/user`, click each tab: Collection, Decks, Activity, Settings
2. **Expected:** URL hash updates (`#collection`, `#decks`, `#activity`, `#settings`). Tab content switches. Active tab shows `brand-primary` color with 2px bottom border.
3. Refresh browser on `#settings` hash
4. **Expected:** Settings tab is active after refresh (hash persists).

### 11. Profile page — Settings tab content

1. Navigate to `/user#settings`
2. **Expected:** All 6 settings sections visible in a stack: Profile Details, Public Profile, User Preferences, Addresses, Password, Security Settings.

### 12. Profile page — empty state tabs

1. Click Collection tab
2. **Expected:** Centered empty state with cards icon and "Your collection will appear here" messaging.
3. Click Decks tab
4. **Expected:** Centered empty state with decks icon and "Your decks will appear here" messaging.
5. Click Activity tab
6. **Expected:** Centered empty state with activity icon and "Your activity will appear here" messaging.

### 13. OAuth flow — Google (requires env vars)

1. Configure Google OAuth env vars in backend
2. Navigate to `/login`, click "Continue with Google"
3. Complete Google sign-in flow
4. **Expected:** Redirected back to storefront with valid session. `/user` shows profile page.

### 14. OAuth flow — Discord (requires env vars)

1. Configure Discord OAuth env vars in backend
2. Navigate to `/login`, click "Continue with Discord"
3. Complete Discord sign-in flow
4. **Expected:** Redirected back to storefront with valid session. `/user` shows profile page.

## Edge Cases

### Already authenticated — login page

1. Log in, then navigate to `/login`
2. **Expected:** Redirected to `/user` (login page not shown to authenticated users).

### Already authenticated — register page

1. Log in, then navigate to `/register`
2. **Expected:** Redirected to `/user`.

### OAuth error display

1. Navigate to `/login?error=authentication_error`
2. **Expected:** Error message displayed on the login form (e.g., "Authentication failed").

### Profile with minimal data

1. Log in with an account that has no bio, no game badges set
2. **Expected:** Profile renders gracefully — bio section absent, no game badges shown, stat chips show 0/—.

## Failure Signals

- Nav bar or footer visible on `/login` or `/register` — route group layout broken
- Brand panel visible on mobile — responsive hiding failed
- Profile tabs don't update URL hash — hashchange listener broken
- Settings tab empty — existing settings components not composed correctly
- Glassmorphic modal looks like plain white dialog — CSS not applied
- Bottom sheet doesn't slide up — animation broken
- OAuth buttons missing — component not rendering SocialLoginButtons

## Requirements Proved By This UAT

- R009 — Auth pages match wireframe structure (split-screen desktop, full-screen mobile, no nav/footer)
- R010 — Profile page matches wireframe structure (hero banner, avatar, game badges, stat chips, 4 tabs)
- R011 — Google OAuth provider registered and callback route functional (test 13)
- R012 — Discord OAuth provider registered and callback route functional (test 14)
- R024 — All new components use Voltage tokens exclusively (grep verification + test assertions)

## Not Proven By This UAT

- Live OAuth end-to-end flow (tests 13/14) requires API credentials — structural registration verified only
- JWT cross-backend validation — requires both backends running with shared JWT secret
- Session persistence across browser restarts — requires live session + cookie inspection
- Profile stat chip accuracy — placeholder values until collection/deck APIs exist

## Notes for Tester

- Google OAuth button uses `bg-white` intentionally — this is per Google brand guidelines, not a theme violation.
- `PasswordValidator` on register page uses `text-red-700`/`text-green-700` — pre-existing Voltage compliance issue, not introduced by this slice.
- OAuth tests (13/14) can be skipped if env vars aren't configured — structural verification covers provider registration.
- Profile empty state tabs are intentionally placeholder — real content comes with future API work.
- The `/user/settings` standalone page still works independently of the profile page.
