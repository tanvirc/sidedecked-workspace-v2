# Story 4.1: Stripe Connect Vendor Onboarding

## Goal
Allow vendors to configure payouts through embedded Stripe Connect flows.

## Context
Epic 4: Payments & Compliance

## Dependencies
- story-01-03-onboarding-profile-management.md

## Acceptance Criteria
1. Launch Stripe Connect embedded onboarding, capture required capabilities, and store status updates.
2. Surface pending verification tasks, required documents, and KYC status via admin dashboard.
3. Notify vendors of errors or incomplete onboarding steps with actionable retry links.

## Implementation Tasks
- Integrate Stripe Connect onboarding modal and persist account capabilities and status updates.
- Build admin dashboard components listing pending verifications and required documents.
- Implement notification hooks for failed onboarding steps and provide retry mechanisms.

## Validation Plan
- Use Stripe test accounts to complete onboarding scenarios and verify status updates.
- Confirm admin dashboard renders pending tasks and notifications trigger on failure events.

