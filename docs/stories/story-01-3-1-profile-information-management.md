# Story 1.3.1: Profile Information Management

**Epic**: [epic-01-authentication-user-management.md](../epics/epic-01-authentication-user-management.md)
**Status**: in_progress
**Domain**: Both

## User Story

_As a user, I want to manage my profile information so that other users can learn about me and I can personalize my experience._

## Acceptance Criteria

- (IMPLEMENTED) Users can edit display name, bio, location, and contact preferences
- (NOT BUILT) Avatar upload with image cropping and resizing (max 5MB, JPG/PNG)
- (NOT BUILT) Profile privacy settings (public, friends only, private)
- (NOT BUILT) Users can link multiple social media accounts (optional)
- (IN PROGRESS) Profile shows join date, reputation score, and activity metrics (PARTIAL)
- (NOT BUILT) Users can add personal website and social links
- (NOT BUILT) Profile changes are logged for security monitoring
- (NOT BUILT) Public profiles are discoverable through search

## Implementation Notes

The profile settings page is located at `/user/settings`. The ProfileDetailsForm component at `storefront/src/components/molecules/ProfileDetailsForm/ProfileDetailsForm.tsx` handles first name, last name, phone, and email editing. The full avatar upload with cropping, privacy settings, social media linking, and public profile discoverability are not yet implemented.
