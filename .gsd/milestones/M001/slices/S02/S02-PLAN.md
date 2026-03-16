# S02: Auth & Identity

**Goal:** End-to-end auth: register -> verify email -> login -> authenticated API requests to both backend and customer-backend.
**Demo:** Open browser -> /register -> fill form -> check email -> click verify link -> redirected to /login -> log in -> DevTools shows auth cookie -> GET /store/me returns user -> GET customer-backend /profile returns UserProfile.

## Must-Haves

- Email/password registration with Resend email verification
- Login returns a session usable by Medusa JS SDK
- Google OAuth round-trip (register and login paths)
- JWT shared between backend and customer-backend (HMAC-SHA256, same secret)
- UserProfile created in sidedecked-db on first auth (email or OAuth)
- Storefront /login and /register pages render and submit correctly
- `npm run typecheck` passes in all 3 repos

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: yes (OAuth redirect requires browser)

## Verification

- `cd backend && npm run test:unit -- --grep auth` - passes
- `cd customer-backend && npm test -- --grep auth` - passes
- `cd storefront && npm test -- --grep auth` - passes
- Manual: register -> verify email -> login -> check /store/me returns 200

## Observability / Diagnostics

- Runtime signals: `/store/auth` endpoint returns 401 for unauthenticated, 200 with token for authenticated
- Inspection surfaces: `docker compose logs backend` for OAuth callback errors
- Failure visibility: auth errors return structured JSON `{ type: 'auth_error', message: '...' }`
- Redaction constraints: never log passwords, tokens, or OAuth secrets

## Integration Closure

- Upstream surfaces consumed: mercur-db auth tables (S01), Resend API, Google OAuth credentials
- New wiring introduced: JWT_SECRET shared env var, MedusaAuthService axios interceptor in customer-backend
- What remains before milestone is truly usable: card catalog (S03) and UI (S04) needed for full user flow

## Tasks

- [ ] **T01: Email/password auth on backend** `est:2h`
  - Why: Core auth method; must work before OAuth providers
  - Files: `backend/src/medusa-config.ts`, `backend/src/modules/authentication/`
  - Do: Configure `@medusajs/medusa/auth-emailpass` provider. Wire email verification flow using Resend. Ensure POST /store/auth/emailpass/register and /store/auth/emailpass works.
  - Verify: POST register returns 200; verification email received; login returns session token
  - Done when: Register -> email received -> verification link works -> login returns session token

- [ ] **T02: Google OAuth provider** `est:1h`
  - Why: Primary social login; highest user adoption expected
  - Files: `backend/src/medusa-config.ts`
  - Do: Configure `@medusajs/medusa/auth-google` with GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars. Set callback URL.
  - Verify: Browser navigates to /store/auth/google -> redirects to Google -> returns to /api/auth/callback -> session established
  - Done when: Full OAuth round-trip completes; user appears in mercur-db customer table

- [ ] **T03: Discord and Microsoft OAuth providers** `est:1h`
  - Why: Discord is primary community channel; Microsoft for enterprise sellers
  - Files: `backend/src/modules/discord-auth/`, `backend/src/modules/microsoft-auth/`
  - Do: Implement custom auth providers for Discord and Microsoft following Medusa auth provider interface. Both are env-var-gated.
  - Verify: With credentials: full OAuth round-trip. Without credentials: server starts without error.
  - Done when: Both providers registered; Discord works with test credentials; Microsoft degrades gracefully

- [ ] **T04: JWT sharing between backend and customer-backend** `est:1.5h`
  - Why: customer-backend must verify Medusa JWTs to authenticate cross-service requests
  - Files: `customer-backend/src/services/MedusaAuthService.ts`, `customer-backend/src/middleware/auth.ts`
  - Do: Implement MedusaAuthService that (a) verifies incoming JWTs using shared JWT_SECRET, (b) uses a service-account axios interceptor for internal calls. Add auth middleware to Express routes.
  - Verify: `cd customer-backend && npm test -- --grep 'MedusaAuthService'` passes
  - Done when: customer-backend rejects requests without valid JWT; accepts requests from authenticated storefront users

- [ ] **T05: UserProfile creation on first auth** `est:1h`
  - Why: TCG preferences, deck data, and collection all hang off UserProfile in sidedecked-db
  - Files: `customer-backend/src/subscribers/auth-subscriber.ts`, `customer-backend/src/services/UserProfileService.ts`
  - Do: Listen to Medusa `customer.created` event. On first login, upsert a UserProfile row in sidedecked-db keyed by medusa customer_id.
  - Verify: Register new user -> psql sidedecked-db shows UserProfile row with matching medusa_customer_id
  - Done when: Every new Medusa customer has a corresponding UserProfile within 1 second of registration

- [ ] **T06: Storefront auth pages** `est:2h`
  - Why: Users need a polished login/register UI to start the auth flow
  - Files: `storefront/src/app/[locale]/(auth)/login/page.tsx`, `storefront/src/app/[locale]/(auth)/register/page.tsx`, `storefront/src/app/api/auth/callback/route.ts`
  - Do: Login page (email/pass form + Google/Discord OAuth buttons), register page (name/email/pass form), OAuth callback handler. Use Medusa JS SDK. Redirect to / on success.
  - Verify: `cd storefront && npm test -- --grep 'login|register'` passes; manual browser smoke test
  - Done when: Login and register pages render, submit, and redirect correctly

## Files Likely Touched

- `backend/src/medusa-config.ts`
- `backend/src/modules/discord-auth/`
- `backend/src/modules/microsoft-auth/`
- `backend/src/modules/authentication/`
- `customer-backend/src/services/MedusaAuthService.ts`
- `customer-backend/src/middleware/auth.ts`
- `customer-backend/src/subscribers/auth-subscriber.ts`
- `storefront/src/app/[locale]/(auth)/login/page.tsx`
- `storefront/src/app/[locale]/(auth)/register/page.tsx`
- `storefront/src/app/api/auth/callback/route.ts`
