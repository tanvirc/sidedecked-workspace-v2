# Story 2.5.2: Consumer Seller Onboarding

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: not_started
**Domain**: Commerce (backend/)

## User Story

_As a collector, I want a simple upgrade process to become an individual seller so that I can start selling my cards quickly._

## Acceptance Criteria

- (NOT BUILT) Simplified 3-step upgrade flow (seller type → terms → completion)
- (NOT BUILT) Clear selection between "Individual Seller" vs "Business Seller" paths
- (NOT BUILT) Individual seller benefits clearly communicated (no fees, simple setup)
- (NOT BUILT) Terms and conditions specific to individual selling responsibilities
- (NOT BUILT) Email verification confirmation integrated into flow
- (NOT BUILT) Initial trust score assignment (60 points for new individual sellers)
- (NOT BUILT) Welcome message with immediate next steps after completion
- (NOT BUILT) Automatic redirect to consumer seller dashboard upon success
- (NOT BUILT) Mobile-optimized upgrade experience for phone users
- (NOT BUILT) Skip complex business verification requirements for individuals
- (NOT BUILT) Integration with existing customer account (no separate registration)
- (NOT BUILT) Progress indicator showing current step and completion status

## Implementation Notes

The simplified consumer seller onboarding is a separate, lighter flow from the full business seller onboarding at `/sell/upgrade`. It would feature a clean 3-step process: Choose Seller Type → Accept Terms → Complete Setup. Individual sellers would bypass complex business verification, requiring only email verification and basic terms acceptance. A trust score of 60 points would be assigned on completion.
