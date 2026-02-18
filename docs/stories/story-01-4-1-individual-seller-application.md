# Story 1.4.1: Individual Seller Application Process

**Epic**: [epic-01-authentication-user-management.md](../epics/epic-01-authentication-user-management.md)
**Status**: in_progress
**Domain**: Both

## User Story

_As a customer, I want to apply to become a Individual Seller so that I can sell my card collection on the platform._

## Acceptance Criteria

- (IMPLEMENTED) Multi-step Individual Seller application form with progress indicator
- (IMPLEMENTED) Required information: legal name, business name (if applicable), tax ID, address
- (IN PROGRESS) Identity verification using government-issued ID upload
- (IMPLEMENTED) Bank account information for payouts (validated via micro-deposits)
- (IN PROGRESS) Agreement to Individual Seller terms, conditions, and fee structure
- (IN PROGRESS) Application status tracking and estimated processing time (PARTIAL)
- (IN PROGRESS) Email notifications for application status changes (PARTIAL)

## Implementation Notes

The application form is at `/sell/upgrade`. The ConsumerSellerOnboarding component at `storefront/src/components/onboarding/ConsumerSellerOnboarding.tsx` implements a 5-step process with progress tracking. Step 1 covers business information, Step 2 handles identity document upload with drag-and-drop functionality, and Step 3 covers financial setup. Document upload supports JPG, PNG, and PDF formats up to 10MB. Bank account verification uses micro-deposits.
