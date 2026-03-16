# S02: Auth & Identity - UAT

**Milestone:** M001
**Written:** 2026-03-17

## UAT Type

- UAT mode: live-runtime
- Why this mode is sufficient: OAuth redirect flows and email verification require real network and real browser interaction.

## Preconditions

- S01 complete (databases running, migrations applied)
- `.env` populated with: RESEND_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET (same value in backend and customer-backend)
- All services running

## Smoke Test

1. Navigate to http://localhost:3000/register
2. Fill name, email, password -> Submit
3. Check email inbox -> click verify link
4. Navigate to /login -> log in -> redirected to /
5. Open DevTools -> Cookies -> confirm auth session cookie present

## Test Cases

### 1. Email/password registration end-to-end
1. POST to `/store/auth/emailpass/register` with new email
2. Check Resend dashboard for outbound email; click verification link
3. POST to `/store/auth/emailpass` with same credentials
4. **Expected:** 200 with session token; user appears in mercur-db

### 2. Google OAuth login
1. Navigate to /login -> click "Continue with Google"
2. Complete Google OAuth flow with test account
3. **Expected:** Redirected back to /, session established, UserProfile created in sidedecked-db

### 3. JWT accepted by customer-backend
1. Log in via email/pass -> extract session token
2. GET `localhost:7000/api/decks` with `Authorization: Bearer <token>`
3. **Expected:** 200 (or empty array), not 401

### 4. Unauthenticated requests rejected
1. GET `localhost:7000/api/decks` with no Authorization header
2. **Expected:** 401 Unauthorized

### 5. UserProfile auto-created
1. Register a new user
2. `psql $CUSTOMER_DATABASE_URL -c "SELECT id, medusa_customer_id FROM user_profile ORDER BY created_at DESC LIMIT 1;"`
3. **Expected:** Row exists with matching medusa_customer_id

## Edge Cases

- Duplicate registration: registering with an existing email returns 409, not 500
- OAuth with existing email: user is linked, not duplicated

## Failure Signals

- Email verification link leads to 404 or 500
- Google OAuth redirects to error page
- customer-backend returns 401 for valid JWT
- UserProfile not created after registration

## Requirements Proved By This UAT

- R002 - email/password authentication works end-to-end
- R003 - Google OAuth works end-to-end
- R006 - JWT sharing pattern between backend and customer-backend proven

## Not Proven By This UAT

- Discord/Microsoft OAuth (env-var-gated, tested separately)
- Two-factor auth (deferred)
- User profile editing (M004)

## Notes for Tester

- Use a real email address for email verification test
- Google OAuth requires the callback URL to be registered in Google Cloud Console
