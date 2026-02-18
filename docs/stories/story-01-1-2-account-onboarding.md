# Story 1.1.2: Account Onboarding

**Epic**: [epic-01-authentication-user-management.md](../epics/epic-01-authentication-user-management.md)
**Status**: complete
**Domain**: Both

## User Story

_As a newly registered user, I want to complete my profile setup so that I can personalize my experience and choose my role._

## Acceptance Criteria

- (IN PROGRESS) New users are directed to a 3-step onboarding process immediately after registration (SELLER ONBOARDING ONLY)
- (IMPLEMENTED) Step 1: Profile Information (display name, bio, location, avatar upload)
- (IMPLEMENTED) Step 2: Role Selection (Customer, Individual Seller, or Both)
- (IMPLEMENTED) Step 3: Preferences (TCG games of interest, notification preferences, privacy settings)
- (IMPLEMENTED) Users can skip optional fields but must complete required fields
- (IMPLEMENTED) System validates all inputs and provides clear error messages
- (IMPLEMENTED) Users can navigate back/forward through onboarding steps
- (IMPLEMENTED) Onboarding can be completed later from profile settings

## Implementation Notes

The seller onboarding flow lives in `CustomerToSellerUpgrade` at `/sell/upgrade` (5 steps: profile, seller type, preferences, terms, activate). Profile fields (display name, bio, location, avatar) are stored in `UserProfile` via `PUT /api/customers/:id/profile` and `POST /api/customers/:id/profile/avatar`. Preferences (TCG games, notifications, privacy) are stored via `PUT /api/customers/:id/preferences`. Both sections are also editable from `/user/settings` via `PublicProfile` and `UserPreferences` components. An amber banner appears in settings if display name is not yet set.
