# S05: Auth, Profile & OAuth Providers — Research

**Date:** 2026-03-13

## Summary

The auth and profile slice has far more existing infrastructure than expected. Both OAuth providers (Google and Discord) are already implemented as MedusaJS auth modules — Google via the built-in `@medusajs/medusa/auth-google`, Discord via a custom `src/modules/discord-auth/` module. The full OAuth flow (storefront → backend → provider → callback → JWT + refresh token → redirect → cookie storage) is wired end-to-end with token rotation, session invalidation, and deferred-auth patterns. The customer-backend validates the same JWT using a shared `JWT_SECRET`, so "JWT valid on both backends" already works.

The real work in this slice is visual: the current auth pages (`LoginForm`, `RegisterForm`) render as centered card forms — the wireframe demands a cinematic split-screen layout (55% brand showcase / 45% form panel on desktop, full-screen on mobile). The profile page wireframe specifies a hero banner with avatar, game badges, tabbed content (Collection/Decks/Activity/Settings), and stat chips — the current settings page is a simpler form-based layout. The `AuthGateDialog` (deferred auth modal) needs to match the wireframe's glassmorphic modal card with gradient icon, not the current plain shadcn Dialog.

The backend provider work is minimal: verify Google and Discord providers work with current env config, potentially add a test for Google auth. The storefront visual work is substantial but well-scoped — 3 main components to build/rewrite (AuthPage split-screen, AuthGateDialog/BottomSheet, ProfilePage).

## Recommendation

Approach this as primarily a **visual alignment** slice with **backend verification**:

1. **Verify backend OAuth** — Confirm `@medusajs/auth-google` and Discord auth module are correctly registered and functional. Write a Google auth provider test mirroring the Discord test pattern. No new provider code needed.
2. **Rewrite auth pages** — Replace `LoginForm`/`RegisterForm` centered card layout with `AuthPage` split-screen component matching wireframe. Desktop: 55/45 split with brand showcase panel (floating card silhouettes, game dots, tagline) and form panel. Mobile: full-screen with SideDecked logo header. Login/signup toggle with slide animation.
3. **Rewrite AuthGateDialog** — Replace plain shadcn Dialog with wireframe's glassmorphic modal card (desktop) and bottom sheet (mobile). Gradient icon, bold heading, OAuth buttons with wireframe sizing.
4. **Build profile page** — The wireframe shows a hero banner + tabbed layout (Collection/Decks/Activity/Settings). Current settings page components (ProfileDetails, PublicProfile, UserPreferences, SecuritySettings) can be composed into the Settings tab. Collection/Decks/Activity tabs are display-only with placeholder data for now.
5. **Session persistence verification** — Confirm JWT + refresh token cookies persist across browser restarts (15m access, 30d refresh with rotation).

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Google OAuth provider | `@medusajs/medusa/auth-google` (built-in) | Already configured in medusa-config.ts. Handles authorization URL generation, token exchange, ID token verification via Google's public keys. |
| Discord OAuth provider | `src/modules/discord-auth/` (custom module) | Already built following MedusaJS `AbstractAuthModuleProvider` pattern. Has tests. |
| OAuth flow orchestration | `storefront/src/lib/actions/oauth.ts` + `backend/.../[auth_provider]/callback/route.ts` | Full flow already wired: initiate → redirect → callback → JWT + refresh → cookie → storefront redirect. |
| JWT refresh/rotation | `backend/.../auth/refresh/route.ts` + `SocialAccountManagementService` | Refresh token rotation with replay detection already implemented. |
| Deferred auth intent | `storefront/src/lib/deferred-intent.ts` + `DeferredActionExecutor` | Intent save/load/clear with TTL and flash cookie for hard-protected routes. |
| Form validation | `react-hook-form` + `zod` (existing `loginFormSchema`, `registerFormSchema`) | Already used in LoginForm/RegisterForm. Keep schemas. |
| Password strength | `PasswordValidator` component | Already renders strength indicator matching wireframe's 4-segment bar. |

## Existing Code and Patterns

### Backend (minimal changes expected)
- `backend/apps/backend/medusa-config.ts` — Google (`@medusajs/medusa/auth-google`) and Discord (`./src/modules/discord-auth`) both registered with env var configs (`GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL`, `DISCORD_CLIENT_ID/SECRET/CALLBACK_URL`). **No changes needed.**
- `backend/apps/backend/src/modules/discord-auth/services/discord.ts` — Custom `AbstractAuthModuleProvider` with `authenticate()` (generates auth URL with state), `validateCallback()` (exchanges code, fetches user info, creates/retrieves auth identity). **Reference pattern for any future providers.**
- `backend/apps/backend/src/api/auth/customer/[auth_provider]/callback/route.ts` — Generic OAuth callback handler. Validates callback → finds/creates customer → auto-verifies email → generates refresh token → generates JWT with `platform_role` → redirects to storefront with access token. **Works for any registered provider.**
- `backend/apps/backend/src/modules/authentication/providers/apple-auth.provider.ts` — Old-style standalone provider. **Not the pattern to follow** — Discord module pattern is correct for MedusaJS v2.
- `backend/apps/backend/src/modules/authentication/services/social-account-management.service.ts` — Refresh token generation/rotation/revocation, platform role lookup, social account CRUD. **Fully implemented.**

### Storefront Auth (rewrite/restyle needed)
- `storefront/src/components/molecules/LoginForm/LoginForm.tsx` — Current centered card layout with OAuth buttons, email/password form, forgot password link, sign-up toggle. **Layout must be replaced with split-screen; form logic and schemas are reusable.**
- `storefront/src/components/molecules/RegisterForm/RegisterForm.tsx` — Same centered layout with display name, email, password + strength indicator. **Same: layout replace, logic keep.**
- `storefront/src/components/molecules/SocialLoginButtons/SocialLoginButtons.tsx` — OAuth button component with Google, Discord, Microsoft icons and provider-specific styling. Already close to wireframe but sizing/radius differs. **Restyle to wireframe specs (h-12 → h-[48px], rounded-[14px]).**
- `storefront/src/components/auth/AuthGateDialog.tsx` — Plain shadcn Dialog with text-only OAuth buttons. **Needs complete rewrite to match wireframe's glassmorphic modal card (desktop) and bottom sheet (mobile).**
- `storefront/src/lib/actions/oauth.ts` — Server actions for OAuth initiation, callback handling, social account linking. **No changes needed.**
- `storefront/src/lib/oauth.ts` — Re-exports + provider config (names, icons, colors, auth URLs). **No changes needed.**
- `storefront/src/app/auth/callback/route.ts` — Storefront callback handler. Sets JWT cookie, reads `_sd_return_url` for post-auth redirect, open redirect protection. **No changes needed. Has 10 tests.**
- `storefront/src/app/auth/error/page.tsx` — Simple error display page. **May need Voltage styling alignment but is functional.**

### Storefront Profile/Settings (significant visual work)
- `storefront/src/app/[locale]/(main)/user/page.tsx` — Shows LoginForm if unauthenticated, simple welcome message with UserNavigation sidebar if authenticated. **Needs rewrite to wireframe's profile hero + tabbed layout.**
- `storefront/src/app/[locale]/(main)/user/settings/page.tsx` — Settings page with ProfileDetails, PublicProfile, UserPreferences, Addresses, ProfilePassword, SecuritySettings. Uses UserNavigation sidebar. **These components can be composed into the Settings tab of the new profile page.**
- `storefront/src/components/molecules/UserNavigation/UserNavigation.tsx` — Sidebar nav for user pages. **Will be replaced by the profile page's tab navigation per wireframe.**
- `storefront/src/components/molecules/SecuritySettings/SecuritySettings.tsx` — 2FA setup, trusted devices, connected accounts (linked social providers). **Reusable in Settings tab.**
- `storefront/src/app/[locale]/(main)/settings/profile/page.tsx` — Just a redirect to `/user/settings`. **Keep as-is.**

### Cross-Backend Auth
- `customer-backend/src/middleware/auth.ts` — JWT verification using shared `JWT_SECRET`. Validates `actor_type === 'customer'`, checks session invalidation against `UserProfile.sessionInvalidatedAt`. **Already works with JWT issued by backend.**
- `customer-backend/src/config/env.ts` — `JWT_SECRET` from env. Must match `backend/medusa-config.ts` `jwtSecret`. **No changes needed, just env alignment.**

## Constraints

- **Google OAuth needs env vars** — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` must be set. Without them, the `@medusajs/auth-google` module will fail on startup or throw at authentication time. Testing requires real credentials or mocking.
- **Discord OAuth needs env vars** — `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_CALLBACK_URL` must be set. Same constraint.
- **Shared JWT_SECRET** — Both backends must use the same `JWT_SECRET` env var for cross-backend JWT validation. Already the pattern, but must be verified during testing.
- **Profile wireframe scope** — The wireframe shows Collection tab with a full card grid, Decks tab with deck cards, Activity tab with feed. These require data from APIs that may not exist yet. Plan to render with placeholder/empty states.
- **Wireframe shows Microsoft OAuth** — The auth wireframe includes Microsoft as a third OAuth button. Microsoft auth module already exists (`src/modules/microsoft-auth/`). Include the button but Microsoft is lower priority than Google + Discord.
- **Split-screen brand panel animation** — Wireframe annotates "gradient-sweep animation, 8s loop" on the brand panel. Implement as a CSS animation — don't add JS animation libraries.
- **No nav on auth pages** — The wireframe's auth pages are full-bleed split-screen without the standard ModernHeader nav. The auth page layout must opt out of the standard `(main)` layout or use a separate layout.

## Common Pitfalls

- **Auth page layout conflict** — Current auth pages are inside `[locale]/(main)` layout which includes ModernHeader and Footer. Wireframe auth pages are full-bleed without nav/footer. Must either use a separate route group or override the layout. The `/user` page currently serves dual purpose (login when unauthenticated, profile when authenticated) — splitting these cleanly is important.
- **OAuth callback redirect chain** — The flow is: Provider → backend callback → storefront `/auth/callback` → `/user`. The backend sets `_medusa_refresh` as an httpOnly cookie on its response. The storefront callback reads the `token` query param and sets `_medusa_jwt`. This two-hop pattern means the refresh token cookie is set by the backend domain, not the storefront domain. In production with different domains, this could fail. For local dev (both on localhost), it works because cookies are shared.
- **Profile page URL structure** — Wireframe shows a public profile page. Current `/user` is authenticated-only. May need `/user/[username]` or similar for public profiles, but this can be deferred. Focus on the authenticated user's own profile view.
- **Tab state management on profile** — The wireframe has 4 tabs. Use URL hash or query param for tab state so deep linking works (e.g., `/user#settings`). Don't use pure client state.

## Open Risks

- **Google OAuth credentials** — Cannot test the Google OAuth flow end-to-end without real `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. The built-in `@medusajs/auth-google` module handles the flow, but we can only verify the config is correct and write integration-like tests that mock the provider responses. User will need to provide credentials for live testing.
- **Discord OAuth credentials** — Same as Google. The Discord module has unit tests that mock fetch, but live flow testing needs real credentials.
- **Profile wireframe complexity** — The profile wireframe is 2382 lines of HTML covering hero banner, tabs, collection grid, deck cards, activity feed, and settings. This is a lot of visual work. Risk of scope creep. Recommend: build the hero + tab shell + Settings tab first, then Collection/Decks/Activity as progressively enhanced tabs with placeholder content.
- **Microsoft provider status** — Microsoft auth is registered and has a custom module, but its priority is below Google and Discord per D001. Include the button in the UI but deprioritize provider testing.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| MedusaJS | `medusajs/medusa-agent-skills@building-with-medusa` | available (775 installs) |
| MedusaJS Storefront | `medusajs/medusa-agent-skills@storefront-best-practices` | available (681 installs) |
| MedusaJS Storefront | `medusajs/medusa-agent-skills@building-storefronts` | available (669 installs) |
| Next.js Auth (generic) | `sickn33/antigravity-awesome-skills@nextjs-supabase-auth` | available but not directly relevant (uses Supabase, not MedusaJS) |

The MedusaJS official skills (`building-with-medusa`, `storefront-best-practices`) are relevant for this project broadly but may not add much for this specific slice since the auth module integration is already complete. Worth considering for future slices.

## Sources

- `@medusajs/auth-google` built-in module — confirmed via `require.resolve` in node_modules, registered in medusa-config.ts
- Discord auth module — full source read at `src/modules/discord-auth/services/discord.ts` (197 lines)
- OAuth callback handler — full source read at `backend/.../[auth_provider]/callback/route.ts` (181 lines)
- Customer-backend auth middleware — full source read at `customer-backend/src/middleware/auth.ts` (shared JWT_SECRET verification)
- Auth wireframe — full source read at `docs/plans/wireframes/storefront-auth.html` (1540 lines, 5 states: login, signup, deferred modal desktop/mobile)
- Profile wireframe — partial read at `docs/plans/wireframes/storefront-profile.html` (2382 lines, hero + tabs + collection/decks/activity/settings)

## Requirements Mapping

| Req | Role | Risk | Notes |
|-----|------|------|-------|
| R009 | **primary** | low | Auth pages exist, need visual rewrite to wireframe split-screen layout |
| R010 | **primary** | medium | Profile page needs significant restructuring to wireframe hero+tabs pattern; current settings components are reusable |
| R011 | **primary** | low | Google OAuth already registered via built-in `@medusajs/auth-google`; needs env vars and verification |
| R012 | **primary** | low | Discord OAuth already implemented as custom module with tests; needs env vars and verification |
| R024 | **supports** | low | New auth/profile components must use Voltage tokens exclusively |
