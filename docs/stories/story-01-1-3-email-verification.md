# Story 1.1.3: Email Verification

**Epic**: [epic-01-authentication-user-management.md](../epics/epic-01-authentication-user-management.md)
**Status**: not_started
**Domain**: Both

## User Story

_As a user, I want to verify my email address so that I can receive important notifications and secure my account._

## Acceptance Criteria

- (NOT BUILT) System sends verification email immediately after registration
- (NOT BUILT) Verification email contains secure, time-limited token (24 hours expiration)
- (NOT BUILT) Users can click email link to verify their account
- (NOT BUILT) Users can request new verification email if needed
- (NOT BUILT) Unverified accounts have limited functionality (no purchases, limited social features)
- (NOT BUILT) Clear indication in UI when email is not verified
- (NOT BUILT) Users can change email address (triggers new verification)

## Implementation Notes

The email verification flow would use pages at `/user/verify-email` (verification prompt) and `/user/verify-email/:token` (verification result). An EmailVerificationBanner component would appear across all pages for unverified accounts with a yellow/orange warning banner. The VerificationStatus component would display success (green checkmark) or error (red X) states. Limited functionality would disable purchase buttons and gray out social features with verification prompts.
