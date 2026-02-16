# Story 6.2: Messaging & Notifications

## Goal
Support direct messaging and unified notification management.

## Context
Epic 6: Community & Engagement

## Dependencies
- story-06-01-profile-activity-feed.md

## Acceptance Criteria
1. Provide real-time direct messaging with read receipts and moderation tooling.
2. Aggregate email, push, and in-app notifications with granular opt-in preferences.
3. Template notifications for order updates, price alerts, deck comments, and policy changes with localization support.

## Implementation Tasks
- Implement WebSocket backed messaging service with moderation controls and read receipts.
- Create notification center UI and APIs for managing channels and preferences.
- Author localized notification templates and integrate with email and push providers.

## Validation Plan
- Run browser tests ensuring messaging updates in real time across multiple sessions.
- Execute notification preference tests verifying opt-ins and template localization.

