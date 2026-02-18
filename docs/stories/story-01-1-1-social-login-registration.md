# Story 1.1.1: Social Login Registration

**Epic**: [epic-01-authentication-user-management.md](../epics/epic-01-authentication-user-management.md)
**Status**: completed
**Domain**: Both

## User Story

_As a new user, I want to register using my Google, Microsoft, Facebook, Apple or GitHub account so that I can quickly create an account without filling out forms._

## Acceptance Criteria

- (IMPLEMENTED) User can click "Sign Up with Google", "Sign Up with GitHub", "Sign Up with Microsoft", "Sign Up with Facebook", or "Sign Up with Apple" buttons
- (IMPLEMENTED) System redirects to OAuth2 provider authorization page
- (IMPLEMENTED) User grants permissions and is redirected back to SideDecked
- (IMPLEMENTED) System creates new user account with information from OAuth2 provider
- (IN PROGRESS) User is automatically logged in and redirected to seller onboarding flow (SELLER ONBOARDING ONLY)
- (IMPLEMENTED) System stores OAuth2 provider ID and refresh tokens securely
- (IMPLEMENTED) User profile is pre-populated with name, email from OAuth2 provider
- (IMPLEMENTED) System handles OAuth2 errors gracefully with error display and retry options

## Implementation Notes

The registration page is located at `/user/register`. The SocialLoginButtons component supports five providers (Google, GitHub, Microsoft, Facebook, Apple) with full-width buttons using provider brand colors and SVG icons. OAuth2 PKCE security is implemented for all providers. The two-container layout separates the registration form from the "Already have account?" section. Mobile uses a full-screen modal instead of a desktop modal.
