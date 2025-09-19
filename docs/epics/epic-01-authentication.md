# Epic 01: Authentication & User Management System

> **Status**: Not Started · **Bounded Context**: Authentication · **Primary Repos**: `backend`, `storefront`

## Epic Goal
Deliver secure identity, onboarding, and session management for all SideDecked user roles, enabling OAuth social login, email verification, multi-factor enforcement, and profile administration from day one.

## Dependencies
- Stripe customer creation for marketplace checkout (Epic 02)
- Notification infrastructure for email and SMS (Epic 06)
- RBAC policy definitions shared with vendor panel (Epic 04)

## Assumptions
- OAuth providers: Google, GitHub, Microsoft, Facebook, Apple
- JWT access tokens (15 minutes) + refresh tokens (30 days) stored with rotation
- Medusa/MercurJS transaction helpers available in backend

## Stories

### Story 1.1: Social Login Registration
**Status**: Not Started  
**Story**: As a new user, I want to register with my preferred OAuth provider so that I can join SideDecked without manual forms.

**Acceptance Criteria**
1. OAuth buttons expose Google, GitHub, Microsoft, Facebook, Apple with PKCE and state validation.
2. Successful callback creates a new account with provider metadata persisted (id, email, tokens).
3. Error states display provider-specific messaging with retry option and analytics tracking.
4. Registration automatically generates Stripe customer profile stub for future checkout.

**UX Notes**
- Registration modal at `/user/register`.  
- Provider buttons sized 48px, full width, provider-branded colors.  
- Mobile layout uses full-screen modal with stacked buttons.

### Story 1.2: Guided Account Onboarding
**Status**: Not Started  
**Story**: As a newly registered user, I want a guided onboarding flow so that I can configure my profile and choose customer or vendor journeys.

**Acceptance Criteria**
1. Three-step wizard: Profile → Role Selection → Preferences with ability to backtrack.
2. Required inputs validated (display name, region, vendor business info) before progression.
3. Preference capture stores interested TCGs and notification toggles in customer backend.
4. Users can skip optional steps and resume from settings later.

**UX Notes**
- Based on `storefront/src/components/onboarding/*` with updates for customer-specific fields.  
- Wizard progress indicator persists across reloads (local storage or API).

### Story 1.3: Email Verification Lifecycle
**Status**: Not Started  
**Story**: As a user, I want to verify my email so that I can unlock marketplace and social capabilities securely.

**Acceptance Criteria**
1. Registration triggers transactional email with secure token (24h expiry) generated server-side.
2. Verification link marks email verified and lifts restrictions (cart checkout, community posting).
3. Unverified users see persistent banner plus disabled CTAs with tooltip messaging.
4. Resend verification limited by rate controls; audit logged per attempt.

**UX Notes**
- Banner located in global layout; verification pages at `/user/verify-email` and `/user/verify-email/[token]`.

### Story 2.1: Social Login Authentication
**Status**: Not Started  
**Story**: As a returning user, I want to sign in with my social provider so that I can access my account quickly.

**Acceptance Criteria**
1. Login modal surfaces same providers with PKCE, linking to existing accounts when provider id matches.
2. Failed attempts produce structured errors (`auth.provider_mismatch`, `auth.account_disabled`).
3. Successful login issues access + refresh tokens with rotation (invalidate reused refresh).
4. Login attaches device metadata for session management dashboard.

### Story 2.2: Session Lifecycle & MFA
**Status**: Not Started  
**Story**: As a security-conscious user, I want resilient session management so that my account remains protected.

**Acceptance Criteria**
1. Refresh token rotation enforced with single valid token per device; reuse triggers session invalidation.
2. Optional TOTP MFA configurable from profile and enforced on sensitive actions (vendor payouts).
3. Session dashboard lists active devices with ability to revoke remotely.
4. Backend enforces rate limiting (e.g., 5 login attempts per 10 minutes per IP/provider).

### Story 3.1: Profile & Role Management
**Status**: Not Started  
**Story**: As a user, I want to manage my profile, roles, and linked providers so that my account stays current.

**Acceptance Criteria**
1. Profile settings allow editing display name, avatar, bio, and location with validation.
2. Users can connect/disconnect social providers while ensuring at least one login method remains.
3. Role upgrades (customer → vendor) trigger vendor onboarding and approval workflow.
4. Audit logs capture profile changes with actor, timestamp, and diff summary.

## Risks & Mitigations
- **OAuth provider limits**: Mitigate with exponential backoff and circuit breaker per provider.
- **Email deliverability**: Use dedicated transactional provider, monitor bounce/complaint metrics.

## QA Strategy
- Unit tests for OAuth state handling, token issuance, and refresh rotation.
- Integration tests covering registration, onboarding, verification flows via MSW/Playwright.
- Security regression suite for MFA and session revocation.

## Change Log
| Date       | Version | Description                              | Author            |
|------------|---------|------------------------------------------|-------------------|
| 2025-09-12 | 1.0.0   | BMAD epic created, legacy spec archived  | Product Team      |
