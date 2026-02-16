# Story 1.1.2: Account Onboarding

**Epic**: [epic-01-authentication-user-management.md](../epics/epic-01-authentication-user-management.md)
**Status**: in_progress
**Domain**: Both

## User Story

_As a newly registered user, I want to complete my profile setup so that I can personalize my experience and choose my role._

## Acceptance Criteria

- (IN PROGRESS) New users are directed to a 3-step onboarding process immediately after registration (SELLER ONBOARDING ONLY)
- (IN PROGRESS) Step 1: Profile Information (display name, bio, location, avatar upload) (BUSINESS INFO IMPLEMENTED)
- (IMPLEMENTED) Step 2: Role Selection (Customer, Individual Seller, or Both)
- (IN PROGRESS) Step 3: Preferences (TCG games of interest, notification preferences, privacy settings) (PARTIAL)
- (IMPLEMENTED) Users can skip optional fields but must complete required fields
- (IMPLEMENTED) System validates all inputs and provides clear error messages
- (IMPLEMENTED) Users can navigate back/forward through onboarding steps
- (NOT BUILT) Onboarding can be completed later from profile settings

## Implementation Notes

The seller onboarding page is located at `/sell/upgrade`. The ConsumerSellerOnboarding component implements a multi-step process with progress tracking. Currently focused on business verification rather than full personal profile onboarding. Step 1 covers business information, Step 2 handles role selection for the customer-to-seller transition, and Step 3 covers business preferences. Personal TCG preferences for general customers are not yet implemented.
