# Epic 06: Community & Social System

> **Status**: Not Started · **Bounded Context**: Community · **Primary Repos**: `customer-backend`, `storefront`

## Epic Goal
Launch social experiences including activity feeds, discussions, moderation, and notifications that keep players engaged around decks and marketplace activity.

## Dependencies
- Authentication roles and permissions (Epic 01).
- Deck publishing (Epic 05) and reviews (Epic 02).
- Notification delivery channels (email, push) configured.

## Assumptions
- Activity feed stored via event sourcing table with fan-out for followers.
- Comments and likes moderated via policy engine with escalation workflow.
- Notification service integrated with TalkJS or equivalent.

## Stories

### Story 6.1: Activity Feed & Notifications
**Status**: Not Started  
**Story**: As a user, I want an activity feed so that I can stay updated on decks, prices, and community events.

**Acceptance Criteria**
1. Feed aggregates events (new decks, price alerts, vendor promotions) personalized per user.
2. Users can subscribe/unsubscribe to feed categories and receive email/push alerts.
3. Real-time updates delivered via SSE or WebSocket for live sessions.
4. Feed items clickable to relevant resources with tracking.

### Story 6.2: Discussion Threads & Comments
**Status**: Not Started  
**Story**: As a community member, I want to comment and react so that I can collaborate.

**Acceptance Criteria**
1. Nested comment threads with reactions (like, insightful, report) per item.
2. Markdown or rich-text editor with sanitization and preview.
3. Moderation queue for reports with workflow for moderators.
4. Notifications triggered for mentions and replies.

### Story 6.3: Reputation & Badges
**Status**: Not Started  
**Story**: As a user, I want recognition for contributions so that I stay motivated.

**Acceptance Criteria**
1. Reputation points awarded for verified purchases, helpful comments, deck popularity.
2. Badge system with unlock criteria and display on profiles.
3. Anti-abuse checks to prevent farming (rate limits, anomaly detection).
4. Leaderboards by game with filterable time ranges.

## Risks & Mitigations
- **Moderation load**: Provide tooling for triage, escalate severe cases to admins.
- **Realtime complexity**: Start with SSE fallback to polling if necessary.

## QA Strategy
- Unit tests for feed aggregation and filtering.
- Integration tests for comment creation with sanitizer.
- Load tests for high-volume activity bursts.

## Change Log
| Date       | Version | Description                              | Author            |
|------------|---------|------------------------------------------|-------------------|
| 2025-09-12 | 1.0.0   | BMAD epic created, legacy spec archived  | Product Team      |
