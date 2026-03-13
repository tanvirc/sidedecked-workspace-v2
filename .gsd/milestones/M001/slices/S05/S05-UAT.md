# S05: Auth, Profile & OAuth Providers — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven + human-experience)
- Why this mode is sufficient: Component tests verify structural alignment (60 tests). Visual comparison against wireframes at 1440px and 390px requires human eyes. OAuth live flow requires API credentials that are not yet configured.

## Preconditions

- `cd storefront && npm run dev` — storefront running on localhost:8000
- Not signed in (clear cookies or use incognito for auth page tests)
- For profile page tests: signed in with a valid account
- For OAuth live tests: Google and Discord API credentials configured in backend `.env`

## Smoke Test

Navigate to `http://localhost:8000/login` — should see cinematic split-screen with brand panel on the left (floating cards, gradient animation) and login form on the right. No nav bar or footer visible.

## Test Cases

### 1. Login page — desktop (1440px)

1. Open `http://localhost:8000/login` at 1440px viewport width
2. **Expected:** 55/45 split-screen. Left panel: radial gradient background (purple/orange), SideDecked wordmark (48px, uppercase), tagline, 3 floating card silhouettes with game-specific border colors, trust bar with 4 game dots, gradient-sweep animation cycling. Right panel: `bg-surface-1`, login form with email/password inputs, "Sign In" button, "Sign up" link, Google/Discord/Microsoft OAuth buttons. No Header or Footer.

### 2. Login page — mobile (390px)

1. Open `http://localhost:8000/login` at 390px viewport width
2. **Expected:** Full-screen layout. SideDecked logo (28px, glow text-shadow) and tagline at top. No brand panel. Login form centered. OAuth buttons visible. No Header or Footer.

### 3. Register page — desktop (1440px)

1. Open `http://localhost:8000/register` at 1440px viewport width
2. **Expected:** Same split-screen as login. Right panel shows register form with first name, last name, email, password, password confirmation, PasswordValidator strength indicator, "Create Account" button, "Sign in" link, OAuth buttons.

### 4. Register page — mobile (390px)

1. Open `http://localhost:8000/register` at 390px viewport width
2. **Expected:** Full-screen layout matching login mobile pattern. Register form centered. PasswordValidator visible below password field.

### 5. AuthGateDialog — desktop

1. Trigger AuthGateDialog (e.g., try to access a protected action while unauthenticated)
2. **Expected:** Glassmorphic modal card: gradient background (surface-2 → surface-1), `rounded-[20px]`, close button (32px, `bg-surface-3`), gradient lock icon (48px), heading in font-display (26px), context description with bold text, 3 branded OAuth buttons (Google white, Discord purple, Microsoft dark), ghost "Continue as Guest" button.

### 6. AuthGateDialog — mobile (390px)

1. Trigger AuthGateDialog on mobile viewport
2. **Expected:** Bottom sheet slides up from bottom: `rounded-t-[20px]`, handle bar (40×4px), gradient lock icon (40px), heading (22px), 3 OAuth buttons, "Continue as Guest" button. Backdrop overlay behind.

### 7. Profile page — desktop (1440px)

1. Sign in and navigate to `http://localhost:8000/user`
2. **Expected:** Hero banner (280px height, radial gradient purple → bg-base). Avatar circle (96px, gradient border, user initials). Display name (28px font-display). @username. Joined date with calendar icon. Game badges (colored pills for games). Right side: Edit Profile ghost button, share icon, stat chips (cards/decks/trades/rating). Below hero: 4 tabs (Collection/Decks/Activity/Settings). Default tab: Collection.

### 8. Profile page — mobile (390px)

1. Sign in and navigate to `http://localhost:8000/user` at 390px
2. **Expected:** Hero stacks vertically. Avatar smaller (72px). Stats wrap in 2×2 grid. Tabs scroll horizontally. Content fills width.

### 9. Profile tab switching

1. On profile page, click "Settings" tab
2. **Expected:** URL updates to `#settings`. Settings tab content shows: ProfileDetails, PublicProfile, UserPreferences, Addresses, ProfilePassword, SecuritySettings stacked.
3. Click "Collection" tab
4. **Expected:** URL updates to `#collection`. Empty state with icon and "Your collection will appear here" messaging.
5. Reload page with `#settings` in URL
6. **Expected:** Settings tab is active on page load (hash state persists).

### 10. Unauthenticated redirect

1. Clear auth cookies, navigate to `http://localhost:8000/user`
2. **Expected:** Redirects to `/login`. No profile page flash.

## Edge Cases

### OAuth error display

1. Navigate to `http://localhost:8000/login?error=access_denied&provider=google&message=User+cancelled`
2. **Expected:** Error banner visible above login form showing provider and error message.

### Authenticated user on auth pages

1. Sign in, then navigate to `http://localhost:8000/login`
2. **Expected:** Redirects to `/user` (no login form shown to authenticated users).

### Direct settings access

1. Navigate to `http://localhost:8000/user/settings`
2. **Expected:** Standalone settings page still works independently of the profile page tab layout.

## Failure Signals

- Nav bar or footer visible on `/login` or `/register` — means `(auth)` route group layout is broken
- No gradient animation on brand panel — CSS keyframes injection failed
- Profile page shows old sidebar layout instead of hero + tabs
- Tab clicks don't update URL hash — hash routing broken
- Settings tab is empty or missing existing settings components
- Any non-brand `bg-white`, `bg-gray-*`, or `text-gray-*` classes in auth/profile HTML — Voltage token violation

## Requirements Proved By This UAT

- R009 — Auth pages match wireframe cinematic split-screen layout (visual proof at both breakpoints)
- R010 — Profile page matches wireframe hero + tabs layout (visual proof at both breakpoints)
- R024 — Auth and profile components use Voltage tokens exclusively (structural + visual)

## Not Proven By This UAT

- R011 — Google OAuth live end-to-end flow (requires API credentials configured)
- R012 — Discord OAuth live end-to-end flow (requires API credentials configured)
- R009/R010 pixel-perfect fidelity — structural alignment is tested, but pixel-precise comparison against wireframe HTML requires side-by-side human review
- Session persistence across browser restarts — requires live backend running with JWT/refresh token configuration

## Notes for Tester

- Profile stat chips show placeholder values (0/—) — this is expected until collection/deck count APIs exist.
- Collection/Decks/Activity tabs show empty state placeholders — this is expected, not a bug.
- Google OAuth button intentionally uses `bg-white` per Google brand guidelines — this is not a Voltage violation.
- The gradient-sweep animation on the brand panel is subtle (8s loop) — watch for a few seconds to confirm it's running.
- Auth wireframe is at `docs/plans/wireframes/storefront-auth.html`. Profile wireframe is at `docs/plans/wireframes/storefront-profile.html`. Compare side-by-side at 1440px and 390px.
