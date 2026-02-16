# Story 1.2.1: Social Login Authentication

**Epic**: [epic-01-authentication-user-management.md](../epics/epic-01-authentication-user-management.md)
**Status**: in_progress
**Domain**: Both

## User Story

_As a returning user, I want to log in using my social account so that I can access my account quickly and securely._

## Acceptance Criteria

- (IMPLEMENTED) Users can click "Sign In with Google" or "Sign In with GitHub" (also supports Microsoft, Facebook, Apple — 5 total providers)
- (IMPLEMENTED) System handles OAuth2 flow with PKCE security
- (IMPLEMENTED) Successful authentication generates JWT access token (15-minute expiration)
- (IMPLEMENTED) System generates JWT refresh token (30-day expiration)
- (IMPLEMENTED) Tokens are stored securely (httpOnly cookies for web, secure storage for mobile)
- (IMPLEMENTED) Users are redirected to intended page or dashboard after login
- (IN PROGRESS) System handles multiple OAuth2 accounts for same email address (PARTIAL)
- (IN PROGRESS) Logout invalidates all tokens and clears secure storage (PARTIAL)

## Implementation Notes

The login page is located at `/user`. The SocialLoginButtons component is in `storefront/src/components/molecules/SocialLoginButtons/SocialLoginButtons.tsx`. OAuth2 handling is in `backend/apps/backend/src/modules/authentication/`. The auth callback is handled at `storefront/src/app/auth/callback/route.ts` with httpOnly, secure, and sameSite cookie settings. The LoginModal uses a center-aligned modal on mobile and full page on desktop.
