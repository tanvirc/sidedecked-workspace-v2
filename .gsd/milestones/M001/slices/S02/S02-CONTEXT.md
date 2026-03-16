---
id: S02
milestone: M001
status: draft
---

# S02: Auth & Identity

## Goal

Users can register, verify email, and authenticate via email/password and at least Google OAuth. JWT is shared securely between backend and customer-backend.

## Why This Slice

Every user-facing feature requires authentication. The JWT-sharing pattern between backend and customer-backend must be proven before any cross-service feature can be built.

## Scope

### In Scope
- Email/password registration with email verification (Resend)
- Session management (Medusa session tokens + JWT)
- Google OAuth (primary live provider)
- Discord OAuth (secondary, env-var-gated)
- Microsoft OAuth (tertiary, env-var-gated)
- JWT secret sharing pattern between backend and customer-backend
- Storefront auth pages: login, register, OAuth callback
- Profile creation in sidedecked-db on first login (UserProfile entity)

### Out of Scope
- Two-factor auth (deferred)
- Apple OAuth (deferred)
- User profile editing UI (M004)

## Constraints

- OAuth credentials are env-var-gated; Google must work with test credentials in local dev
- Email verification uses Resend - requires Resend API key
- JWT_SECRET must be identical in both backend and customer-backend environments

## Integration Points

### Consumes
- mercur-db auth tables from S01
- UserProfile entity in sidedecked-db from S01

### Produces
- Working auth API on backend port 9000
- Session tokens consumable by storefront Medusa JS SDK
- JWT tokens verifiable by customer-backend MedusaAuthService
- Storefront /login and /register pages functional

## Open Questions

- Should Discord OAuth redirect to a different callback URL than Google, or unified /api/auth/callback?
- How is the service-account token for customer-backend -> backend internal calls generated and rotated?
