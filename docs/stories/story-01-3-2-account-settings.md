# Story 1.3.2: Account Settings

**Epic**: [epic-01-authentication-user-management.md](../epics/epic-01-authentication-user-management.md)
**Status**: in_progress
**Domain**: Both

## User Story

_As a user, I want to manage my account settings so that I can control notifications, privacy, and security preferences._

## Acceptance Criteria

- (NOT BUILT) Notification preferences for email, in-app, and mobile push
- (NOT BUILT) Privacy controls for profile visibility, activity sharing, and data collection
- (IN PROGRESS) Security settings for 2FA, session management, and login notifications (PARTIAL)
- (NOT BUILT) Email preferences for marketing, product updates, and transactional emails
- (NOT BUILT) Data export functionality for user data (GDPR compliance)
- (NOT BUILT) Account deactivation and deletion options with clear consequences

## Implementation Notes

The account settings page is located at `/user/settings`. The ProfilePasswordForm component at `storefront/src/components/molecules/ProfilePasswordForm/ProfilePasswordForm.tsx` provides a password change form (current password, new password, confirm). A 4-column responsive grid layout with a left sidebar (UserNavigation) and main content area is specified. Full notification preferences, privacy controls, GDPR export, and account deletion are not yet implemented.
