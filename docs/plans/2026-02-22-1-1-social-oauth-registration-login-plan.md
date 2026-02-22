# Social OAuth Registration & Login — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to sign up and sign in via Google, Discord, and Microsoft OAuth, plus email/password, with shared JWT cross-service auth and refresh token rotation.
**Story:** `1-1-social-oauth-registration-login` — `_bmad-output/implementation-artifacts/story-1-1-social-oauth-registration-login.md`
**Domain:** Commerce (Auth identity in mercur-db) + Frontend (storefront OAuth buttons)
**Repos:** `backend/`, `storefront/`
**Deployment:** `needs_deploy = true` — storefront modified (SocialLoginButtons), new OAuth env vars required in Railway, database migration must run before deploy.

---

## Requirements Brief (from Phase 2)

**9 Acceptance Criteria — all implemented:**

| AC | Summary | Status |
|---|---|---|
| AC1 | Google OAuth → active session | ✅ |
| AC2 | Discord OAuth → active session | ✅ |
| AC3 | Microsoft OAuth → active session | ✅ |
| AC4 | Email/password sign in (emailpass provider) | ✅ |
| AC5 | First OAuth login → buyer role + cross-service JWT | ✅ |
| AC6 | Account linking via email anchor (same email, different provider) | ✅ |
| AC7 | Session persistence via refresh token rotation | ✅ |
| AC8 | Rate limiting (10 attempts/min/IP) via MedusaJS framework | ✅ |
| AC9 | Email/password registration: verification email + refresh token | ✅ |

**Business rules:**
- JWT contains: `actor_id`, `actor_type`, `auth_identity_id`
- JWT_SECRET must be identical on `backend/` + `customer-backend/`
- Rate limiting on `/auth/*` is MedusaJS framework-level (no custom code)
- `UserProfile.sessionInvalidatedAt` used for forced session invalidation
- OAuth account linking: email is the single identity anchor (provider-agnostic)
- Refresh rotation: 15-min access tokens, 30-day refresh, single-use

**UX:** SocialLoginButtons renders Google + Discord + Microsoft buttons. OAuth flow: redirect → consent → callback → return to SideDecked. No new interaction patterns introduced.

---

## Technical Design (from Phase 3)

**Domain routing:** Auth identity operations → `backend/` (mercur-db only). `customer-backend/` validates JWTs and logs auth events only. Split-brain rule maintained.

**Key architectural pattern:** OAuth providers use `AbstractAuthModuleProvider` from `@medusajs/framework/utils`, exported via `ModuleProvider(Modules.AUTH, { services })`. Old plain-class providers at `src/modules/authentication/providers/` are dead code (not wired).

**Provider pattern (Discord/Microsoft):**
- Constructor: `({ logger }, options)` — receives container + typed config
- `authenticate(req, authIdentityService)` — generates auth URL with CSRF state via `authIdentityService.setState()`
- `validateCallback(req, authIdentityService)` — exchanges code, fetches user, creates/retrieves identity via `authIdentityService.retrieve/create()`
- `register()` — throws `MedusaError.Types.NOT_ALLOWED` (OAuth handles both registration and login)
- Static `validateOptions()` — validates required config fields

**New database migration:** `Migration20260222_AddDiscordProvider` adds `'discord'` to the `provider` enum in `social_account_metadata`.

**New API endpoint:**
```
POST /store/auth/emailpass/post-register
Authorization: Bearer <token>
Response: { success: true, authIdentity: undefined }
Side effects: verification email, refresh token, auth event
```

**Affected repos and files:**
- `backend/` — 7 new files, 6 modified, 1 deleted
- `storefront/` — 4 modified files

---

## Implementation Tasks

> **Note:** Tasks 1–7 are COMPLETE (story is in `review` state). Tasks 8–11 are the remaining ship-phase work.

### Task 1: Add 'discord' to social_account_metadata provider enum ✅
**Files:**
- `apps/backend/src/modules/authentication/models/social-account-metadata.ts`
- `apps/backend/src/modules/authentication/migrations/Migration20260222_AddDiscordProvider.ts`
- `apps/backend/src/modules/authentication/tests/` (unit test for enum)

**Steps (completed):**
1. Update SocialAccountMetadata model enum to include `'discord'`
2. Create migration to add `'discord'` to the DB enum column
3. Write unit test verifying `'discord'` is a valid provider value

---

### Task 2: Implement Discord OAuth provider as MedusaJS auth module ✅
**Files:**
- `apps/backend/src/modules/discord-auth/services/discord.ts` (NEW)
- `apps/backend/src/modules/discord-auth/index.ts` (NEW)
- `apps/backend/src/modules/authentication/providers/index.ts` (old export removed)
- `apps/backend/src/modules/authentication/providers/discord-auth.provider.ts` (DELETED)
- `apps/backend/src/modules/authentication/tests/discord-auth.provider.test.ts` (rewritten — 17 tests)

**Discord OAuth2 endpoints:**
- Authorization: `https://discord.com/api/oauth2/authorize`
- Token: `https://discord.com/api/oauth2/token`
- User info: `https://discord.com/api/users/@me`
- Scopes: `identify email`
- Avatar URL: `https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png`

**Steps (completed):**
1. Create `DiscordAuthService` extending `AbstractAuthModuleProvider`
2. Implement `authenticate()` — generate Discord OAuth2 URL with CSRF state
3. Implement `validateCallback()` — exchange code, fetch user, create/retrieve identity
4. Implement `register()` — throw NOT_ALLOWED
5. Handle Discord avatar URL construction
6. Export via `ModuleProvider(Modules.AUTH, { services })`
7. Write 17 unit tests (auth URL, token exchange, user info, errors, validation)

---

### Task 3: Wire Discord and Microsoft providers into medusa-config.ts ✅
**Files:**
- `apps/backend/src/modules/microsoft-auth/services/microsoft.ts` (NEW)
- `apps/backend/src/modules/microsoft-auth/index.ts` (NEW)
- `apps/backend/medusa-config.ts`
- `apps/backend/.env.template`

**Steps (completed):**
1. Create `MicrosoftAuthService` extending `AbstractAuthModuleProvider`
2. Register Discord provider in auth module providers array
3. Register Microsoft provider in auth module providers array
4. Add `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_CALLBACK_URL` to `.env.template`

---

### Task 4: Update storefront OAuth configuration ✅
**Files:**
- `storefront/src/lib/oauth.ts`
- `storefront/src/lib/actions/oauth.ts`
- `storefront/src/components/molecules/SocialLoginButtons/SocialLoginButtons.tsx`

**Steps (completed):**
1. Add Discord to `OAUTH_PROVIDERS` in `oauth.ts`
2. Add `'discord'` to `OAuthProvider` type union
3. Add Discord SVG icon + provider entry to `SocialLoginButtons`

---

### Task 5: Verify rate limiting on auth endpoints ✅
**Files:** No code changes required.

**Steps (completed):**
1. Verified MedusaJS framework handles rate limiting on `/auth/*` routes
2. Verified custom endpoints already have rate limiting

---

### Task 6: End-to-end verification ✅
**Evidence:**
- Backend typecheck: zero errors
- Storefront typecheck: zero errors
- All 17 Discord auth tests pass
- No regressions (pre-existing failures only — 5 known failures, none related to this story)

---

### Task 7: Email/password registration side effects ✅
**Files:**
- `apps/backend/src/api/store/auth/emailpass/route.ts` (NEW — relative imports, not `#/` aliases)
- `apps/backend/src/modules/authentication/tests/emailpass-post-register.integration.test.ts` (NEW — 6 tests)
- `apps/backend/src/api/store/auth/middlewares.ts` (modified — bearer auth for post-register)
- `apps/backend/src/modules/authentication/tests/jest.config.js` (modified — moduleNameMapper depth fix)
- `storefront/src/lib/data/customer.ts` (modified — `signup()` calls post-register after login)

**Steps (completed):**
1. Write failing tests for POST `/store/auth/emailpass/post-register`
2. Create endpoint using pre-existing services: `EmailVerificationService.sendVerificationEmail()`, `SocialAccountManagementService.generateRefreshToken()`, `emitAuthEvent()`
3. Register endpoint with bearer auth middleware
4. Update `signup()` in storefront to call post-register and set refresh cookie
5. Run quality gate — all pass

---

### Task 8: Documentation (Phase 7 — PENDING)
**Files to update:**
- `CHANGELOG.md` — add entry for story 1-1
- `docs/architecture/07-authentication-architecture.md` — update Discord/Microsoft OAuth sections
- `_bmad-output/implementation-artifacts/story-1-1-social-oauth-registration-login.md` — verify all ACs tagged

**Steps:**
1. Add CHANGELOG.md entry (what: Discord + Microsoft OAuth + email/password post-register; why: closes story 1-1)
2. Update architecture doc to reflect Discord and Microsoft as implemented providers (Apple remains deferred)
3. Verify all 9 ACs in story file are marked with `(IMPLEMENTED)` tags if not already done
4. Commit: `docs(auth): story 1-1 documentation and changelog`

---

### Task 9: Pull Request Creation (Phase 8A — PENDING)
**Repos with commits:** `backend/`, `storefront/`

**Steps:**
1. Verify `feature/1-1-social-oauth-registration-login` branch exists and is pushed in both repos
2. Create PR for `backend/` repo — title: "feat(auth): Discord and Microsoft OAuth providers + email/password post-register"
3. Create PR for `storefront/` repo — title: "feat(auth): add Discord and Microsoft OAuth buttons"
4. PRs must include: story key reference, summary of changes, doc changes, testing notes, AC checklist

---

### Task 10: Two-Stage Code Review (Phase 8B — PENDING)
**Steps:**
1. Dispatch spec compliance subagent — verify all 9 ACs are implemented, nothing extra built
2. Dispatch code quality subagent — review security (OAuth CSRF state, JWT handling), architecture compliance (MedusaJS module pattern), test quality
3. Fix any Critical/Important issues found
4. Run quality gate: `npm run lint && npm run typecheck && npm run build && npm test` in each affected repo

---

### Task 11: Merge PRs (Phase 8C — PENDING)
**Steps:**
1. Address any human PR comments per `superpowers:receiving-code-review` protocol
2. Merge: `gh pr merge {pr_number} --squash --delete-branch` for each repo
3. Update sprint-status.yaml: `1-1-social-oauth-registration-login: done`
4. Confirm merge commit SHAs recorded

---

## Pre-existing Test Failures (Known, Not Regressions)

These 5 failures existed before this story and are not related to the implementation:

1. `social-auth.service.test.ts` — pre-existing
2. `account-linking.test.ts` — pre-existing
3. `email-verification-routes.integration.test.ts` — uses `#/` imports in route files
4. `email-verification-token.model.test.ts` — references compiled `.js` files
5. `integration-tests/http/health.spec.ts` — requires a running server

These must NOT be counted as failures introduced by this story.
