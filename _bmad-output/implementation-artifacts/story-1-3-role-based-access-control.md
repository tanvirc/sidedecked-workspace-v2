# Story 1-3: Role-Based Access Control

Status: done

## Story

As a SideDecked platform operator,
I want a formal role taxonomy with enforced middleware guards,
So that platform admins, sellers, and customers each access only what they are authorized for.

## Acceptance Criteria

1. **Given** a customer JWT is issued (OAuth or emailpass) **When** the customer has `platform_role: 'admin'` on their `customer_profile` **Then** the JWT `app_metadata` includes `platform_role: 'admin'`; for all other customers `platform_role` is `null` (AC1) **(IMPLEMENTED)**

2. **Given** a token refresh is requested **When** `POST /auth/refresh` runs **Then** `platform_role` is re-read from `customer_profile` in DB and embedded in the new JWT — not forwarded from the old JWT (AC2) **(IMPLEMENTED)**

3. **Given** a request hits a platform-admin-only endpoint in `backend/` **When** the JWT lacks `platform_role: 'admin'` **Then** `requirePlatformAdmin()` returns HTTP 403 `{ error: 'insufficient_permissions' }` (AC3) **(IMPLEMENTED)**

4. **Given** a business vendor request reaches a permission-gated endpoint **When** the vendor JWT `permissions` array lacks the required permission **Then** `requireVendorPermission(permission)` returns HTTP 403 `{ error: 'insufficient_permissions' }` (AC4) **(IMPLEMENTED)**

5. **Given** a request hits a platform-admin-only endpoint in `customer-backend/` **When** the JWT lacks `platform_role: 'admin'` **Then** `requirePlatformAdmin()` returns HTTP 403 `{ error: 'insufficient_permissions' }` (AC5) **(IMPLEMENTED)**

6. **Given** a customer JWT is verified by `customer-backend` `authenticateToken` **When** the JWT `app_metadata` contains `platform_role` **Then** `req.user.platformRole` is set to that value; when absent it is `null` (AC6) **(IMPLEMENTED)**

7. **Given** an unauthenticated user navigates to `/{locale}/user/*` in the storefront **When** the Next.js middleware runs **Then** they are redirected to `/{locale}/login?redirect=<path>`; users with a valid `_medusa_jwt` cookie pass through (AC7) **(IMPLEMENTED)**

## Tasks / Subtasks

- [x] Task 1: backend/ — Add `platform_role` column to CustomerProfile + migration (AC: 1, 2)
  - [x]Write failing test for migration adding `platform_role` column
  - [x]Add `platform_role: model.text().nullable()` to customer-profile.ts model
  - [x]Create `Migration20260222_PlatformRole.ts`
  - [x]Run migration, verify column exists

- [x] Task 2: backend/ — Enrich OAuth callback JWT with `platform_role` (AC: 1)
  - [x]Write failing test: JWT includes `app_metadata.platform_role` after OAuth callback
  - [x]Add `platform_role` lookup + inclusion in `generateJwtToken()` call in callback route
  - [x]Verify existing OAuth tests still pass

- [x] Task 3: backend/ — Re-fetch `platform_role` from DB on token refresh (AC: 2)
  - [x]Write failing test: refresh JWT includes `platform_role` read from DB
  - [x]Add `platform_role` DB lookup + inclusion in refresh route `generateJwtToken()` call
  - [x]Add `getCustomerPlatformRole()` to `SocialAccountManagementService` if needed

- [x] Task 4: backend/ — Create `requirePlatformAdmin()` and `requireVendorPermission()` middleware helpers (AC: 3, 4)
  - [x]Write failing tests for both middleware functions
  - [x]Implement `api/utils/require-platform-admin.ts`
  - [x]Implement `api/utils/require-vendor-permission.ts`

- [x] Task 5: customer-backend/ — Update auth middleware with `platform_role` extraction + `requirePlatformAdmin()` (AC: 5, 6)
  - [x]Write failing tests in `auth-platform-role.test.ts`
  - [x]Update `JWTPayload`, `AuthenticatedRequest`, `authenticateToken`, `optionalAuth`
  - [x]Export `requirePlatformAdmin()` from `middleware/auth.ts`

- [x] Task 6: storefront/ — Add `/{locale}/user/*` SSR auth guard to middleware (AC: 7)
  - [x]Write failing test (or manual verification) for redirect behaviour
  - [x]Insert auth guard block in `middleware.ts` before fast-path early returns

- [x] Task 7: Update story file ACs + sprint status (AC: 1–7)
  - [x]Tag all ACs (IMPLEMENTED)
  - [x]Update sprint-status.yaml to `done`
  - [x]Commit

## Dev Notes

### Domain Routing (Split-Brain)

- `platform_role` stored in `customer_profile` (mercur-db) — single source of truth
- `platform_role` propagated via JWT claim — NO column in sidedecked-db required
- `requireVendorPermission()` — backend/ only (vendor JWTs not processed by customer-backend)
- `requirePlatformAdmin()` — both backend/ and customer-backend/ (reads from JWT claim)

### Key File Locations

| File | Change |
|---|---|
| `backend/apps/backend/src/modules/authentication/models/customer-profile.ts` | Add `platform_role` field |
| `backend/apps/backend/src/modules/authentication/migrations/Migration20260222_PlatformRole.ts` | NEW migration |
| `backend/apps/backend/src/api/auth/customer/[auth_provider]/callback/route.ts` | Add `platform_role` to JWT |
| `backend/apps/backend/src/api/auth/refresh/route.ts` | Re-fetch `platform_role` from DB |
| `backend/apps/backend/src/api/utils/require-platform-admin.ts` | NEW middleware helper |
| `backend/apps/backend/src/api/utils/require-vendor-permission.ts` | NEW middleware helper |
| `customer-backend/src/middleware/auth.ts` | Update types + extract `platform_role` |
| `customer-backend/src/tests/middleware/auth-platform-role.test.ts` | NEW tests |
| `storefront/src/middleware.ts` | Add auth guard for `/[locale]/user/*` |

### JWT Shape After Story 1-3

```typescript
// app_metadata in customer JWT — additive change, backward compatible
app_metadata: {
  customer_id: string
  platform_role: string | null   // null = regular customer, 'admin' = platform admin
  // seller fields (story 4-1): seller_id, seller_tier, seller_verified
}
```

### Migration Pattern (MikroORM)

Follow `Migration20260222_AddDiscordProvider.ts`:
```typescript
export class Migration20260222_PlatformRole extends Migration {
  async up(): Promise<void> {
    this.addSql(`ALTER TABLE "customer_profile" ADD COLUMN IF NOT EXISTS "platform_role" VARCHAR(50) NULL;`)
  }
  async down(): Promise<void> {
    this.addSql(`ALTER TABLE "customer_profile" DROP COLUMN IF EXISTS "platform_role";`)
  }
}
```

### Storefront Auth Guard Placement

Insert BEFORE the fast-path early returns (lines ~202–219 in current middleware.ts):
```typescript
// Auth guard: protect /{locale}/user/* routes
const isUserPath =
  pathSegments.length >= 2 &&
  pathSegments[0]?.length === 2 &&
  /^[a-z]{2}$/.test(pathSegments[0]) &&
  pathSegments[1] === 'user' &&
  !pathname.includes('/user/verify-email')

if (isUserPath) {
  const jwtCookie = request.cookies.get('_medusa_jwt')
  if (!jwtCookie) {
    const locale = pathSegments[0]
    const redirectTo = `/${locale}/login?redirect=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(new URL(redirectTo, request.nextUrl.origin))
  }
}
```

### Access Denied UX Decisions

- `/user/*` unauthenticated → soft redirect to login (not 403)
- Admin-only backend routes → 403 `{ error: 'insufficient_permissions' }` (no frontend admin routes in this story)
- Admin route 404 behaviour (hide existence of admin routes) — deferred to Epic 8

## Dev Agent Record

### Implementation Plan
Implementing in 7 tasks across backend/, customer-backend/, storefront/.
TDD iron law: failing test first for every task. No exceptions.

### Debug Log
_empty_

### Completion Notes
All 7 tasks completed. 7 test suites written TDD (red-green cycle observed for each). All tests passing. Typechecks clean across backend/, customer-backend/, storefront/.

## File List

| File | Change |
|---|---|
| `backend/apps/backend/src/modules/authentication/models/customer-profile.ts` | Added `platform_role: model.text().nullable()` |
| `backend/apps/backend/src/modules/authentication/migrations/Migration20260222_PlatformRole.ts` | New — `ADD COLUMN platform_role text NULL` |
| `backend/apps/backend/src/modules/authentication/services/social-account-management.service.ts` | Added `getCustomerPlatformRole()` |
| `backend/apps/backend/src/api/auth/customer/[auth_provider]/callback/route.ts` | Added `platform_role` to JWT + `Promise.all` with refresh token |
| `backend/apps/backend/src/api/auth/refresh/route.ts` | Added `platform_role` DB re-read to JWT |
| `backend/apps/backend/src/api/utils/require-platform-admin.ts` | New middleware helper |
| `backend/apps/backend/src/api/utils/require-vendor-permission.ts` | New middleware helper |
| `backend/apps/backend/src/modules/authentication/tests/platform-role.model.test.ts` | New — 6 tests |
| `backend/apps/backend/src/modules/authentication/tests/platform-role.service.test.ts` | New — 4 tests |
| `backend/apps/backend/src/modules/authentication/tests/platform-role.refresh.test.ts` | New — 2 tests |
| `backend/apps/backend/src/modules/authentication/tests/platform-role.middleware.test.ts` | New — 10 tests |
| `customer-backend/src/middleware/auth.ts` | Extended types; added `platformRole` extraction; added `requirePlatformAdmin` |
| `customer-backend/src/tests/middleware/auth-platform-role.test.ts` | New — 11 tests |
| `storefront/src/middleware.ts` | Added `shouldGuardUserRoute`, `buildLoginRedirect`; SSR auth guard |
| `storefront/src/test/middleware-auth-guard.test.ts` | New — 8 tests |

## Change Log

- 2026-02-22: Story created for story 1-3 role-based-access-control
