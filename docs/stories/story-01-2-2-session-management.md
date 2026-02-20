# Story 1.2.2: Session Management

**Epic**: [epic-01-authentication-user-management.md](../epics/epic-01-authentication-user-management.md)
**Status**: in_progress
**Domain**: Both

## User Story

_As a logged-in user, I want my session to remain active across browser tabs and persist between visits so that I don't have to constantly re-authenticate._

## Acceptance Criteria

- (IMPLEMENTED) JWT access tokens automatically refresh before expiration using refresh tokens
- (IMPLEMENTED) Sessions persist across browser tabs and windows
- (IMPLEMENTED) Sessions survive browser restart if refresh token is valid
- (IMPLEMENTED) Idle sessions expire after 30 days of inactivity
- (IMPLEMENTED) System logs all authentication events for security monitoring
- (IMPLEMENTED) Session termination on password/security changes

## Tasks/Subtasks

### Task 1: Refresh Token Model & Migration (backend/)
- [x] 1.1 Create `RefreshToken` entity in `backend/apps/backend/src/modules/authentication/models/`
- [x] 1.2 Create database migration for `refresh_tokens` table with indexes
- [x] 1.3 Add refresh token service methods: `generateRefreshToken()`, `validateAndRotateRefreshToken()`, `revokeRefreshToken()`, `revokeAllRefreshTokensForCustomer()`

### Task 2: Token Generation in OAuth Callback (backend/)
- [x] 2.1 Reduce access token TTL to 15 minutes in OAuth callback
- [x] 2.2 Generate refresh token (UUID v4) alongside access token; hash with SHA-256; store in DB
- [x] 2.3 Pass refresh token to storefront via redirect URL query parameter
- [x] 2.4 Add auth event emission (LOGIN) to callback

### Task 3: Token Refresh Endpoint (backend/)
- [x] 3.1 Create `POST /auth/refresh` endpoint
- [x] 3.2 Validate refresh token cookie against DB (hash comparison, not revoked, not expired)
- [x] 3.3 Implement single-use rotation: mark old token revoked, generate new pair
- [x] 3.4 Return new tokens via Set-Cookie headers (access: 15 min, refresh: 30 days)
- [x] 3.5 Return 401 and clear cookies for invalid/expired/revoked refresh tokens

### Task 4: Session Revocation on Security Changes (backend/)
- [x] 4.1 Create `POST /auth/revoke-sessions` endpoint with `except_current` option
- [x] 4.2 Add `sessionInvalidatedAt` field to UserProfile entity (customer-backend)
- [x] 4.3 Password change handler — deferred (no handler exists yet, part of story 1-2-1)
- [x] 4.4 Modify 2FA enable/disable handlers to revoke other sessions
- [x] 4.5 Modify email change handler to revoke other sessions

### Task 5: Auth Event Entity & Logging API (customer-backend/)
- [x] 5.1 Create `AuthEvent` entity with event_type, customer_id, ip_address, user_agent, metadata
- [x] 5.2 Create migration for `auth_events` table with `(customer_id, created_at DESC)` index
- [x] 5.3 Create `POST /api/auth-events` route with X-Service-Key authentication
- [x] 5.4 Define `AuthEventType` enum: LOGIN, LOGOUT, TOKEN_REFRESH, SESSION_TERMINATED, PASSWORD_CHANGED, TWO_FA_TOGGLED, EMAIL_CHANGED

### Task 6: Auth Middleware Enhancement (customer-backend/)
- [x] 6.1 Update `authenticateToken` middleware to check JWT `iat` against `sessionInvalidatedAt`
- [x] 6.2 Create `authenticateServiceKey` middleware for service-to-service auth

### Task 7: Backend Auth Event Emission (backend/)
- [x] 7.1 Create `auth-event-emitter.ts` — fire-and-forget POST utility
- [x] 7.2 Emit LOGIN event from OAuth callback
- [x] 7.3 Emit TOKEN_REFRESH event from refresh endpoint
- [x] 7.4 Emit SESSION_TERMINATED event from revoke-sessions endpoint
- [x] 7.5 Emit TWO_FA_TOGGLED and EMAIL_CHANGED events from respective handlers

### Task 8: Storefront Token Refresh Interceptor (storefront/)
- [x] 8.1 Add `_medusa_refresh` cookie helpers to cookies.ts (get/set/remove/removeAll)
- [x] 8.2 Update auth callback to store both access + refresh cookies
- [x] 8.3 Create `token-refresh.ts` with `refreshAccessToken()` and `authenticatedFetch()`
- [x] 8.4 Server-side refresh: on 401 response, attempt token refresh and retry request
- [x] 8.5 On refresh failure, clear all auth cookies

### Task 9: Idle Session Tracking (storefront/)
- [x] 9.1 Create `idle-tracker.ts` — track last activity timestamp in localStorage
- [x] 9.2 On page focus/visibility change, check if idle > 30 days → logout
- [x] 9.3 Hook idle session check into `Providers` via `IdleSessionGuard` component

## Dev Notes

### Architecture
- **Split-brain**: backend/ (mercur-db) handles token lifecycle; customer-backend/ (sidedecked-db) stores auth audit events. No direct DB connections.
- **Token architecture**: Access token = JWT (15 min TTL), Refresh token = opaque UUID (30 day TTL, single-use with rotation)
- **Storage**: Both tokens in httpOnly cookies (sameSite: strict, secure in production)
- **Session termination**: Revoke refresh tokens + set `sessionInvalidatedAt` for immediate invalidation via middleware check

### Key Patterns
- Refresh token hashed with SHA-256 before DB storage (never store plaintext)
- Single-use rotation: old token revoked on each refresh
- Fire-and-forget auth event logging: backend → customer-backend API, failures logged but don't block auth flows
- Service-to-service auth via X-Service-Key header (shared secret from env)
- `authenticateToken` middleware now async — checks `sessionInvalidatedAt` in DB

### Deferred (not in scope)
- Max concurrent sessions limit
- Auto-logout warning modal (5 min before expiry)
- SessionCard UI component (already exists per implementation notes)
- Password change session revocation (depends on story 1-2-1)
- Singleton Promise pattern for client-side multi-tab refresh deduplication (server-side refresh handles this)

## Dev Agent Record

### Implementation Plan
9-task breakdown across backend/, customer-backend/, storefront/ following split-brain architecture.

### Debug Log
- ts-jest not installed → switched to @swc/jest with decorator support
- SWC es2023 target invalid → used es2022
- `@InjectTransactionManager()` decorator needed `{ transactionManager: {} }` in mock context
- Date mock in test-setup.ts broke lodash → removed global Date mock

### Completion Notes
All 9 tasks implemented. All 6 acceptance criteria marked IMPLEMENTED.
Task 4.3 (password change revocation) deferred — no password change handler exists yet (story 1-2-1).
Client-side singleton Promise refresh deduplication deferred in favor of server-side `authenticatedFetch()` pattern.

## File List

### New Files
- `backend/apps/backend/src/modules/authentication/models/refresh-token.ts`
- `backend/apps/backend/src/modules/authentication/migrations/Migration20260220_RefreshTokens.ts`
- `backend/apps/backend/src/modules/authentication/services/auth-event-emitter.ts`
- `backend/apps/backend/src/modules/authentication/tests/refresh-token.service.test.ts`
- `backend/apps/backend/src/api/auth/refresh/route.ts`
- `backend/apps/backend/src/api/auth/revoke-sessions/route.ts`
- `customer-backend/src/entities/AuthEvent.ts`
- `customer-backend/src/migrations/1777000000000-AddSessionInvalidatedAt.ts`
- `customer-backend/src/migrations/1777000100000-CreateAuthEvents.ts`
- `customer-backend/src/middleware/service-auth.ts`
- `customer-backend/src/routes/auth-events.ts`
- `storefront/src/lib/data/token-refresh.ts`
- `storefront/src/lib/data/idle-tracker.ts`

### Modified Files
- `backend/apps/backend/src/modules/authentication/models/index.ts`
- `backend/apps/backend/src/modules/authentication/services/social-account-management.service.ts`
- `backend/apps/backend/src/modules/authentication/tests/jest.config.js`
- `backend/apps/backend/src/modules/authentication/tests/test-setup.ts`
- `backend/apps/backend/src/api/auth/customer/[auth_provider]/callback/route.ts`
- `backend/apps/backend/src/api/store/auth/2fa/verify/route.ts`
- `backend/apps/backend/src/api/store/auth/2fa/disable/route.ts`
- `backend/apps/backend/src/api/store/auth/email/change/route.ts`
- `customer-backend/src/config/database.ts`
- `customer-backend/src/config/env.ts`
- `customer-backend/src/entities/UserProfile.ts`
- `customer-backend/src/middleware/auth.ts`
- `customer-backend/src/routes/index.ts`
- `storefront/src/app/auth/callback/route.ts`
- `storefront/src/lib/data/cookies.ts`
- `storefront/src/lib/data/customer.ts`
- `storefront/src/app/providers.tsx`

## Change Log

- Task 1: Created RefreshToken model, migration, and 4 service methods (12 tests passing)
- Task 2: OAuth callback now generates 15-min access + 30-day refresh tokens
- Task 3: POST /auth/refresh endpoint with token rotation and cookie management
- Task 4: POST /auth/revoke-sessions + revocation on 2FA toggle + email change + sessionInvalidatedAt field
- Task 5: AuthEvent entity, migration, and POST /api/auth-events route with service-to-service auth
- Task 6: authenticateToken middleware checks sessionInvalidatedAt; authenticateServiceKey middleware added
- Task 7: auth-event-emitter utility emits events from OAuth callback, refresh, revoke-sessions, 2FA, and email change
- Task 8: Storefront auth callback stores both tokens; cookies.ts manages refresh token; token-refresh.ts provides server-side refresh
- Task 9: idle-tracker.ts with localStorage activity tracking; IdleSessionGuard in Providers
