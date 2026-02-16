# Story 2.4.1: Customer Reviews

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: in_progress
**Domain**: Commerce (backend/)

## User Story

_As a customer, I want to leave reviews for purchased items so that I can share my experience with other buyers._

## Acceptance Criteria

- (NOT BUILT) Review invitation email sent after delivery confirmation (7-day delay)
- (IMPLEMENTED) Review form with rating (1-5 stars) and written feedback
- (IN PROGRESS) Separate ratings for item condition, shipping speed, and vendor communication (PARTIAL)
- (NOT BUILT) Photo upload to show received item condition
- (NOT BUILT) Review moderation system to prevent fake or inappropriate reviews
- (NOT BUILT) Edit window for reviews (30 days after submission)
- (NOT BUILT) Helpful/unhelpful voting on reviews by other users
- (IN PROGRESS) Verified purchase badge on reviews (PARTIAL)
- (IMPLEMENTED) Review aggregation in vendor profiles and item listings
- (NOT BUILT) Email notifications to vendors for new reviews

## Implementation Notes

The review interface uses a ReviewsToWrite component and the `/user/reviews` page. Reviews are tracked in relation to orders. Review aggregation is integrated with order and seller systems. The multi-criteria rating for item condition, shipping speed, and vendor communication exists in the component structure but full implementation needs verification.
