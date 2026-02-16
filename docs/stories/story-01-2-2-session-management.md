# Story 1.2.2: Session Management

**Epic**: [epic-01-authentication-user-management.md](../epics/epic-01-authentication-user-management.md)
**Status**: in_progress
**Domain**: Both

## User Story

_As a logged-in user, I want my session to remain active across browser tabs and persist between visits so that I don't have to constantly re-authenticate._

## Acceptance Criteria

- (IN PROGRESS) JWT access tokens automatically refresh before expiration using refresh tokens (PARTIAL)
- (IMPLEMENTED) Sessions persist across browser tabs and windows
- (IMPLEMENTED) Sessions survive browser restart if refresh token is valid
- (IN PROGRESS) Idle sessions expire after 30 days of inactivity (PARTIAL)
- (NOT BUILT) System logs all authentication events for security monitoring
- (NOT BUILT) Session termination on password/security changes

## Implementation Notes

Session management uses httpOnly cookie-based storage with persistent cookie storage and appropriate expiration settings. Sessions persist across browser tabs via cookie management. The session management UI is available at `/user/settings` with a SessionCard component for each active session. Auto-logout warnings with a modal and countdown timer are specified for 5 minutes before session expiry but not confirmed as built.
