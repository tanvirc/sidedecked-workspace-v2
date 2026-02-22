# Role-Based Access Control — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Establish the platform role taxonomy, enrich JWTs with `platform_role`, enforce roles via middleware in both backends, and add SSR auth guards to the storefront.
**Story:** 1-3 — `_bmad-output/implementation-artifacts/story-1-3-role-based-access-control.md`
**Domain:** Authentication (split: mercur-db for role storage, sidedecked-db for enforcement via JWT)
**Repos:** `backend/`, `customer-backend/`, `storefront/`
**Deployment:** `true` — DB migration on mercur-db required; all three repos must deploy together

---

## Requirements Brief (from Phase 2)

**Clarified Acceptance Criteria:**

1. JWT `app_metadata` includes `platform_role: string | null` — null for regular customers, `'admin'` for platform admins
2. Token refresh (`POST /auth/refresh`) re-reads `platform_role` from `customer_profile` in DB — not cached from old JWT
3. `requirePlatformAdmin()` in `backend/` returns HTTP 403 `{ error: 'insufficient_permissions' }` if `platform_role !== 'admin'`
4. `requireVendorPermission(permission)` in `backend/` returns HTTP 403 if vendor JWT `permissions` array lacks the specified permission
5. `requirePlatformAdmin()` in `customer-backend/` returns HTTP 403 if `platform_role !== 'admin'`
6. `customer-backend` `authenticateToken` extracts `platform_role` from JWT into `req.user.platformRole`
7. Storefront Next.js middleware: `/{locale}/user/*` paths redirect to `/{locale}/login?redirect=<path>` if no `_medusa_jwt` cookie is present

**Business Rules:**
- BR1: `platform_role: null` = regular customer (default, no explicit storage needed beyond DB null)
- BR2: `platform_role: 'admin'` = SideDecked platform administrator
- BR3: Platform admin role can only be assigned via direct DB operation (no self-service)
- BR4: JWT must embed `platform_role` from DB on every new token issuance and every refresh
- BR5: `requireVendorPermission()` applies only to business vendor JWTs (seller `actor_type`)
- BR6: Admin route 404 behavior (not revealing admin routes exist) is deferred — no frontend admin routes in this story

---

## Technical Design (from Phase 3)

**Domain routing:**
- `platform_role` storage → `customer_profile` table (mercur-db), single source of truth
- JWT enrichment → `backend/` OAuth callback + refresh routes
- Route enforcement → both `backend/` (MedusaJS middleware helpers) and `customer-backend/` (Express middleware)
- Storefront guard → Next.js middleware for `/[locale]/user/*`
- No column addition to sidedecked-db — role comes from JWT claim only

**JWT `app_metadata` change (additive, backward compatible):**
```typescript
// Added field (null for regular customers)
app_metadata: {
  customer_id: string
  platform_role?: string | null   // NEW
  // seller fields remain unchanged
}
```

**New middleware contract:**
```typescript
// backend/ — MedusaJS MiddlewareFunction
requirePlatformAdmin(): MiddlewareFunction  // 403 if platform_role !== 'admin'
requireVendorPermission(permission: string): MiddlewareFunction  // 403 if permission not in JWT permissions[]

// customer-backend/ — Express RequestHandler
requirePlatformAdmin(): RequestHandler  // 403 if req.user.platformRole !== 'admin'
```

**Migration:** `ALTER TABLE customer_profile ADD COLUMN platform_role VARCHAR(50) NULL` — additive, zero-downtime safe.

---

## Pre-task: Create story file

**Action:** Before Task 1, create `_bmad-output/implementation-artifacts/story-1-3-role-based-access-control.md` with the story, ACs, and tasks below. Update `sprint-status.yaml` to mark `1-3-role-based-access-control: in-progress`.

---

### Task 1: `backend/` — Add `platform_role` to CustomerProfile model + migration

**Files:**
- `backend/apps/backend/src/modules/authentication/models/customer-profile.ts` — add field
- `backend/apps/backend/src/modules/authentication/migrations/Migration20260222_PlatformRole.ts` — new migration

**Steps (TDD cycle):**
1. Write failing test: verify migration adds `platform_role VARCHAR(50) NULL` column to `customer_profile`
2. Run test — confirm failure
3. Add `platform_role: model.text().nullable()` to `CustomerProfile` model definition
4. Create `Migration20260222_PlatformRole.ts` following the MikroORM pattern from `Migration20260222_AddDiscordProvider.ts`:
   ```typescript
   // up(): ALTER TABLE "customer_profile" ADD COLUMN "platform_role" VARCHAR(50) NULL;
   // down(): ALTER TABLE "customer_profile" DROP COLUMN IF EXISTS "platform_role";
   ```
5. Run migration against local DB: `npm run db:migrate --workspace=apps/backend`
6. Run test — confirm pass
7. Commit: `feat(auth): add platform_role column to customer_profile`

---

### Task 2: `backend/` — Enrich JWT with `platform_role` in OAuth callback

**Files:**
- `backend/apps/backend/src/api/auth/customer/[auth_provider]/callback/route.ts`

**Context:** JWT is generated at line ~165 in this file. Currently `app_metadata: { customer_id: customer.id }`. Need to look up `customer_profile.platform_role` for this customer and add it.

**Steps (TDD cycle):**
1. Write failing test: OAuth callback JWT includes `app_metadata.platform_role` (null for new customer, `'admin'` for seeded admin customer)
2. Run test — confirm failure
3. In the callback route, after resolving the customer, look up the `CustomerProfile` for that customer using the authentication module service:
   - Call `authModuleService` (already resolved as `SocialAccountManagementService`) or use `req.scope.resolve(AUTHENTICATION_MODULE)` to find profile by `customer_id`
   - Extract `platform_role` (default null if no profile found)
4. Add `platform_role` to `app_metadata` in `generateJwtToken()` call:
   ```typescript
   app_metadata: {
     customer_id: customer.id,
     platform_role: customerProfile?.platform_role ?? null
   }
   ```
5. Run test — confirm pass
6. Verify: `npm run lint && npm run typecheck` in backend/
7. Commit: `feat(auth): include platform_role in OAuth JWT app_metadata`

---

### Task 3: `backend/` — Enrich JWT with `platform_role` in token refresh

**Files:**
- `backend/apps/backend/src/api/auth/refresh/route.ts`

**Context:** JWT is generated at line ~58 in this file. `app_metadata` currently only has `customer_id`. Must re-fetch `platform_role` from DB on every refresh (not forward from old JWT — old JWT is not available at refresh time in this route).

**Steps (TDD cycle):**
1. Write failing test: `POST /auth/refresh` returns a new JWT with `app_metadata.platform_role` correctly set (null for regular customer; `'admin'` for admin customer)
2. Run test — confirm failure
3. In the refresh route, after `validateAndRotateRefreshToken()` resolves `customerId`, look up `CustomerProfile` to read `platform_role`:
   ```typescript
   // After: const { rawToken: newRefreshToken, customerId } = await authModuleService.validateAndRotateRefreshToken(...)
   const authModuleForProfile = req.scope.resolve(AUTHENTICATION_MODULE)
   const platformRole = await authModuleForProfile.getCustomerPlatformRole(customerId)
   // OR: direct query via MedusaJS module service
   ```
   - If the authentication module service doesn't yet expose `getCustomerPlatformRole()`, add a thin method to `SocialAccountManagementService` that queries `CustomerProfile` by `customer_id` and returns `platform_role`
4. Add `platform_role: platformRole` to `generateJwtToken()` app_metadata
5. Run test — confirm pass
6. Commit: `feat(auth): re-fetch platform_role from DB on token refresh`

---

### Task 4: `backend/` — Create `requirePlatformAdmin()` middleware helper

**Files:**
- `backend/apps/backend/src/api/utils/require-platform-admin.ts` — new file
- `backend/apps/backend/src/api/utils/require-vendor-permission.ts` — new file

**Steps (TDD cycle):**
1. Write failing tests:
   - `requirePlatformAdmin()`: passes through when JWT has `platform_role: 'admin'`; returns 403 with `{ error: 'insufficient_permissions' }` when `platform_role` is null or missing
   - `requireVendorPermission('inventory')`: passes through when vendor JWT has `'inventory'` in `permissions[]`; returns 403 when missing
2. Run tests — confirm failure
3. Implement `require-platform-admin.ts`:
   ```typescript
   import { MedusaStoreRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'

   export const requirePlatformAdmin = () =>
     (req: MedusaStoreRequest, res: MedusaResponse, next: MedusaNextFunction) => {
       const platformRole = req.auth_context?.app_metadata?.platform_role
       if (platformRole !== 'admin') {
         return res.status(403).json({ error: 'insufficient_permissions' })
       }
       return next()
     }
   ```
4. Implement `require-vendor-permission.ts`:
   ```typescript
   export const requireVendorPermission = (permission: string) =>
     (req: MedusaStoreRequest, res: MedusaResponse, next: MedusaNextFunction) => {
       const permissions: string[] = req.auth_context?.app_metadata?.permissions ?? []
       if (!permissions.includes(permission)) {
         return res.status(403).json({ error: 'insufficient_permissions' })
       }
       return next()
     }
   ```
5. Run tests — confirm pass
6. `npm run lint && npm run typecheck && npm run test:unit --workspace=apps/backend`
7. Commit: `feat(auth): add requirePlatformAdmin and requireVendorPermission middleware helpers`

---

### Task 5: `customer-backend/` — Update auth middleware with `platform_role`

**Files:**
- `customer-backend/src/middleware/auth.ts`
- `customer-backend/src/tests/middleware/auth-platform-role.test.ts` — new test file

**Context:** `JWTPayload.app_metadata` currently only has `customer_id?: string`. `AuthenticatedRequest.user` has no `platformRole`. `authenticateToken` sets `req.user` without `platformRole`.

**Steps (TDD cycle):**
1. Write failing tests in `auth-platform-role.test.ts`:
   - `authenticateToken` with JWT containing `app_metadata.platform_role: 'admin'` → `req.user.platformRole === 'admin'`
   - `authenticateToken` with JWT containing `app_metadata.platform_role: null` → `req.user.platformRole === null`
   - `authenticateToken` with JWT missing `platform_role` → `req.user.platformRole === null`
   - `requirePlatformAdmin()` with `req.user.platformRole === 'admin'` → calls `next()`
   - `requirePlatformAdmin()` with `req.user.platformRole === null` → 403 `{ error: 'insufficient_permissions' }`
2. Run tests — confirm all fail
3. Update `JWTPayload`:
   ```typescript
   app_metadata?: {
     customer_id?: string
     platform_role?: string | null   // NEW
   }
   ```
4. Update `AuthenticatedRequest.user`:
   ```typescript
   user?: {
     id: string
     email: string
     actor_id: string
     actor_type: string
     auth_identity_id: string
     platformRole: string | null   // NEW
   }
   ```
5. Update `authenticateToken` to extract and set `platformRole`:
   ```typescript
   req.user = {
     // ...existing fields...
     platformRole: decoded.app_metadata?.platform_role ?? null   // NEW
   }
   ```
6. Apply same extraction to `optionalAuth` (parallel change, same pattern)
7. Export `requirePlatformAdmin` from `auth.ts`:
   ```typescript
   export const requirePlatformAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
     if (req.user?.platformRole !== 'admin') {
       return res.status(403).json({ error: 'insufficient_permissions' })
     }
     return next()
   }
   ```
8. Run tests — confirm all pass
9. `npm run lint && npm run typecheck && npm run test`
10. Commit: `feat(auth): extract platform_role from JWT in customer-backend auth middleware`

---

### Task 6: `storefront/` — Add `/[locale]/user/*` SSR auth guard

**Files:**
- `storefront/src/middleware.ts`

**Context:** Storefront uses `[locale]` route groups. Authenticated routes are `/{locale}/user/*`. The middleware has a fast path at lines 202–219 that returns early for URLs with a 2-char locale prefix. The auth guard must be inserted BEFORE the fast path `NextResponse.next()` calls.

**Steps (TDD cycle):**
1. Write failing test (vitest/jest in storefront, or manual verification if no test runner configured):
   - Request to `/us/user/settings` without `_medusa_jwt` cookie → middleware redirects to `/us/login?redirect=%2Fus%2Fuser%2Fsettings`
   - Request to `/us/user/settings` with valid `_medusa_jwt` cookie → middleware passes through
   - Request to `/us/marketplace` without cookie → middleware passes through (no auth required)
2. Implement guard in `middleware.ts`. Insert BEFORE the fast path `return NextResponse.next()` blocks:
   ```typescript
   // Auth guard: protect /{locale}/user/* routes
   const isUserPath = pathSegments.length >= 2 &&
     pathSegments[0]?.length === 2 &&
     /^[a-z]{2}$/.test(pathSegments[0]) &&
     pathSegments[1] === 'user' &&
     pathname !== `/${pathSegments[0]}/user/verify-email` // exclude verify-email (already handled above)

   if (isUserPath) {
     const jwtCookie = request.cookies.get('_medusa_jwt')
     if (!jwtCookie) {
       const locale = pathSegments[0]
       const redirectTo = `/${locale}/login?redirect=${encodeURIComponent(pathname)}`
       logMiddleware('AUTH_GUARD_REDIRECT', fullUrl, { redirectTo })
       return NextResponse.redirect(new URL(redirectTo, request.nextUrl.origin))
     }
   }
   ```
   Place this block after the `/user/verify-email/` skip (line ~186) and before the country code fast path (line ~202).
3. Verify `/auth/` skip still works (already at line ~179, not affected)
4. Run `npm run build` in storefront (no test runner configured per CLAUDE.md)
5. `npm run lint && npm run typecheck`
6. Commit: `feat(auth): add SSR auth guard for /[locale]/user/* in storefront middleware`

---

### Task 7: Create story file + update sprint status

**Files:**
- `_bmad-output/implementation-artifacts/story-1-3-role-based-access-control.md` — create
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — update status to `done`

**Steps:**
1. Create story file with all 7 ACs, tasks 1–6, dev notes (domain routing, split-brain classification)
2. Tag each AC as `(IMPLEMENTED)` after all tasks complete
3. Update `sprint-status.yaml`: `1-3-role-based-access-control: done`
4. Commit: `docs(auth): story 1-3 role-based-access-control complete`

---

## Quality Gate (run in each affected repo before claiming done)

```bash
# backend/
npm run lint --workspace=apps/backend
npm run typecheck --workspace=apps/backend
npm run build --workspace=apps/backend
npm run test:unit --workspace=apps/backend
npm run test:coverage --workspace=apps/backend   # must be >80% on changed modules

# customer-backend/
npm run lint && npm run typecheck && npm run build && npm run test

# storefront/
npm run lint && npm run typecheck && npm run build
```
