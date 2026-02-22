# Story 1-1: Social OAuth Registration & Login

Status: in-progress

## Story

As a user,
I want to sign up and sign in using Google, Discord, or Microsoft OAuth, or via email/password,
so that I can access SideDecked without friction using my preferred authentication method.

## Acceptance Criteria

1. **Given** I am on the login page **When** I click "Continue with Google" **Then** I am redirected to Google's OAuth consent screen, authenticated, and returned to SideDecked with an active session
2. **Given** I am on the login page **When** I click "Continue with Discord" **Then** I am redirected to Discord's OAuth consent screen, authenticated, and returned to SideDecked with an active session
3. **Given** I am on the login page **When** I click "Continue with Microsoft" **Then** I am redirected to Microsoft's OAuth consent screen, authenticated, and returned to SideDecked with an active session
4. **Given** I am on the login page **When** I enter my email and password and click "Sign In" **Then** I am authenticated via MedusaJS emailpass provider and receive an active session
5. **Given** I successfully authenticate via OAuth for the first time **When** the OAuth flow completes **Then** a customer account is created with the default "buyer" role and a JWT valid across both backend services
6. **Given** I authenticate via OAuth with an email that already exists from a different provider **When** the flow completes **Then** the social account is linked to my existing customer record (email is the identity anchor)
7. **Given** I am authenticated **When** I close and reopen my browser **Then** my session persists via refresh token rotation and I remain logged in
8. **Given** I attempt to sign in more than 10 times within a minute from the same IP **When** the rate limit is reached **Then** further attempts are blocked with an appropriate error message
9. **Given** I am a new user without an existing account **When** I enter first name, last name, email, and password and click "Create Account" **Then** a customer account is created via MedusaJS emailpass provider, a verification email is sent to my email address, a refresh token is issued, and I receive an active session

## Tasks / Subtasks

- [x] Task 1: Add 'discord' to social_account_metadata provider enum (AC: 2, 5, 6)
  - [x] 1.1: Update SocialAccountMetadata model enum to include 'discord'
  - [x] 1.2: Create database migration to add 'discord' to the provider enum column
  - [x] 1.3: Write unit test verifying 'discord' is a valid provider value
- [x] Task 2: Implement Discord OAuth provider as MedusaJS auth module (AC: 2, 5)
  - [x] 2.1: Create DiscordAuthService extending AbstractAuthModuleProvider
  - [x] 2.2: Implement authenticate() — generate Discord OAuth2 authorization URL with CSRF state
  - [x] 2.3: Implement validateCallback() — exchange code for token, fetch user info from Discord API
  - [x] 2.4: Implement register() — throw NOT_ALLOWED (delegates to authenticate)
  - [x] 2.5: Handle Discord avatar URL construction (cdn.discordapp.com/avatars/{id}/{hash}.png)
  - [x] 2.6: Export as ModuleProvider(Modules.AUTH, { services }) from discord-auth/index.ts
  - [x] 2.7: Write comprehensive unit tests (17 tests: auth URL, token exchange, user info, error handling, validation)
- [x] Task 3: Wire Discord and Microsoft providers into medusa-config.ts (AC: 2, 3)
  - [x] 3.1: Create MicrosoftAuthService extending AbstractAuthModuleProvider (proper module)
  - [x] 3.2: Register Discord provider in auth module providers array
  - [x] 3.3: Register Microsoft provider in auth module providers array
  - [x] 3.4: Add DISCORD_* environment variables to .env.template
  - [x] 3.5: Verify MICROSOFT_* environment variables already in .env.template
- [x] Task 4: Update storefront OAUTH_PROVIDERS configuration (AC: 1, 2, 3, 4)
  - [x] 4.1: Add Discord to OAUTH_PROVIDERS in storefront/src/lib/oauth.ts
  - [x] 4.2: Add Discord SVG icon to SocialLoginButtons component
  - [x] 4.3: Add 'discord' to OAuthProvider type union
  - [x] 4.4: Add 'discord' to providers array in SocialLoginButtons
- [x] Task 5: Verify rate limiting on auth endpoints (AC: 8)
  - [x] 5.1: Verified MedusaJS framework handles rate limiting on /auth/* routes
  - [x] 5.2: Verified custom endpoints (email-verification, 2FA) already have rate limiting
- [x] Task 6: End-to-end verification (AC: 1-8)
  - [x] 6.1: Backend typecheck passes with zero errors
  - [x] 6.2: Storefront typecheck passes with zero errors
  - [x] 6.3: All 17 Discord auth tests pass
  - [x] 6.4: No regressions in backend test suite (pre-existing failures only)
  - [x] 6.5: Sprint-status.yaml updated to reflect story in-progress

- [ ] Task 7: Implement email/password registration post-registration side effects (AC: 9)
  - [ ] 7.1: Write failing tests for POST /store/auth/emailpass/post-register endpoint
  - [ ] 7.2: Create backend endpoint: sends verification email + generates refresh token + fires auth event
  - [ ] 7.3: Register endpoint in storeAuthMiddlewares requiring bearer authentication
  - [ ] 7.4: Update storefront signup() to call post-register endpoint and set refresh cookie
  - [ ] 7.5: Run full quality gate and confirm all tests pass

## Dev Notes

### Architecture Context

- **Split-brain rule**: All auth identity operations stay in mercur-db (backend). Customer-backend only validates JWTs and logs auth events. No direct DB connections between them.
- **JWT cross-service**: JWT_SECRET must be identical on backend + customer-backend. JWTs include actor_id (customer ID), actor_type, auth_identity_id.
- **Refresh token rotation**: Already implemented (Migration20260220). 15-min access tokens + 30-day refresh tokens. Single-use rotation.
- **Session invalidation**: customer-backend checks `UserProfile.sessionInvalidatedAt` against JWT `iat`.

### Key Implementation Decision: MedusaJS Module Pattern

Custom OAuth providers MUST extend `AbstractAuthModuleProvider` from `@medusajs/framework/utils` and be exported via `ModuleProvider(Modules.AUTH, { services })`. The initial approach of plain classes (like the existing Microsoft/Facebook/Apple providers in `src/modules/authentication/providers/`) does NOT work for MedusaJS auth module registration.

New module structure:
- `src/modules/discord-auth/services/discord.ts` — DiscordAuthService
- `src/modules/discord-auth/index.ts` — ModuleProvider export
- `src/modules/microsoft-auth/services/microsoft.ts` — MicrosoftAuthService
- `src/modules/microsoft-auth/index.ts` — ModuleProvider export

### Provider Implementation Pattern

Follows `@medusajs/medusa/auth-google` pattern:
- Constructor: `({ logger }, options)` — receives container and typed config
- `authenticate(req, authIdentityService)` — generates auth URL with CSRF state via `authIdentityService.setState()`
- `validateCallback(req, authIdentityService)` — exchanges code, fetches user, creates/retrieves identity via `authIdentityService.retrieve/create()`
- `register()` — throws NOT_ALLOWED (OAuth handles both registration and login)
- Static `validateOptions()` — validates required config fields

### Discord OAuth2 Endpoints

- Authorization: `https://discord.com/api/oauth2/authorize`
- Token exchange: `https://discord.com/api/oauth2/token`
- User info: `https://discord.com/api/users/@me`
- Scopes: `identify email`
- Avatar URL: `https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png`

### Files Changed

**Backend (new):**
- `src/modules/discord-auth/services/discord.ts` — DiscordAuthService
- `src/modules/discord-auth/index.ts` — Module export
- `src/modules/microsoft-auth/services/microsoft.ts` — MicrosoftAuthService
- `src/modules/microsoft-auth/index.ts` — Module export
- `src/modules/authentication/migrations/Migration20260222_AddDiscordProvider.ts` — DB migration

**Backend (modified):**
- `medusa-config.ts` — Added Discord + Microsoft to auth providers
- `.env.template` — Added DISCORD_* env vars
- `src/modules/authentication/models/social-account-metadata.ts` — Added 'discord' to enum
- `src/modules/authentication/providers/index.ts` — Removed old DiscordAuthProvider export
- `src/modules/authentication/tests/discord-auth.provider.test.ts` — Rewritten for DiscordAuthService (17 tests)

**Backend (removed):**
- `src/modules/authentication/providers/discord-auth.provider.ts` — Old plain-class provider (superseded)

**Storefront (modified):**
- `src/lib/oauth.ts` — Added Discord provider config
- `src/lib/actions/oauth.ts` — Added 'discord' to OAuthProvider type
- `src/components/molecules/SocialLoginButtons/SocialLoginButtons.tsx` — Added Discord icon + provider

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Old plain-class providers (Microsoft, Facebook, Apple) at `src/modules/authentication/providers/` are NOT wired into medusa-config.ts and are effectively dead code. Only the new module-based Microsoft provider is wired.
- Pre-existing test failures in microsoft-auth.provider.test.ts, social-auth.service.test.ts, account-linking.test.ts, email-verification tests — not related to this story.
- Rate limiting on /auth/* routes is handled by MedusaJS framework middleware, not custom code.

### File List

See "Files Changed" section above.
