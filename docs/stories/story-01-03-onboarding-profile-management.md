# Story 1.3: Onboarding & Profile Management

## Goal
Guide new users through profile completion and vendor compliance onboarding.

## Context
Epic 1: Foundation & Authentication

## Dependencies
- story-01-02-oauth2-session-management.md

## Acceptance Criteria
1. Collect display name, location, avatar, preferred games, and desired role with server-side validation post registration.
2. Capture vendor business details (tax identifiers, banking, documents) and queue submissions for admin approval.
3. Expose profile APIs and UI for editing preferences, managing linked OAuth providers, and viewing onboarding status.

## Implementation Tasks
- Implement multi-step onboarding UI with validation and persistence for profile data.
- Create vendor compliance endpoints storing business documents and routing approvals to admin dashboard.
- Expose profile management views with settings for connected providers, preferences, and onboarding status.

## Validation Plan
- Run Cypress or Playwright journey covering onboarding steps for customer and vendor paths.
- Verify admin approval queue receives vendor submissions with required metadata.

