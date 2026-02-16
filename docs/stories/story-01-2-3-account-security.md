# Story 1.2.3: Account Security

**Epic**: [epic-01-authentication-user-management.md](../epics/epic-01-authentication-user-management.md)
**Status**: not_started
**Domain**: Both

## User Story

_As a user, I want to secure my account with optional two-factor authentication so that I can protect my valuable card collection and transactions._

## Acceptance Criteria

- (NOT BUILT) Users can enable 2FA using authenticator apps (TOTP)
- (NOT BUILT) System generates QR code and backup codes for 2FA setup
- (NOT BUILT) 2FA is required for sensitive actions (large purchases, account changes)
- (NOT BUILT) Users can disable 2FA using backup codes or current 2FA token
- (NOT BUILT) System stores 2FA settings securely and encrypted
- (NOT BUILT) Clear instructions and help documentation for 2FA setup
- (NOT BUILT) 2FA bypass for trusted devices (optional, 30-day expiration)

## Implementation Notes

The 2FA setup would be accessible from `/user/settings` in the Security section. The 4-step setup flow covers: authenticator app recommendations, QR code display with manual entry option, verification code confirmation, and backup codes display with download option. Compatible apps include Google Authenticator, Authy, and similar TOTP apps. TrustedDevicesManager would list trusted devices with device info, trust expiry, and per-device revocation.
