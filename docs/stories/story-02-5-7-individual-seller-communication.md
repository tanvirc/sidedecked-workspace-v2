# Story 2.5.7: Individual Seller Communication

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: not_started
**Domain**: Commerce (backend/)

## User Story

_As an individual seller, I want to communicate effectively with buyers so that I can provide good customer service and resolve issues._

## Acceptance Criteria

- (NOT BUILT) Built-in messaging system for buyer-seller communication
- (NOT BUILT) Mobile-optimized messaging interface for on-the-go responses
- (NOT BUILT) Notification system for new messages (email, push, in-app)
- (NOT BUILT) Message templates for common responses (shipping updates, thank you notes)
- (NOT BUILT) Photo sharing capability within messages for condition clarification
- (NOT BUILT) Order context integration (messages linked to specific purchases)
- (NOT BUILT) Response time tracking with performance implications
- (NOT BUILT) Professional communication guidelines and tips for individuals
- (NOT BUILT) Escalation path to platform customer support for complex issues
- (NOT BUILT) Message history preservation for reference and dispute resolution
- (NOT BUILT) Bulk messaging for shipping updates to multiple buyers
- (NOT BUILT) Integration with order management (messages from order details)
- (NOT BUILT) Translation support for international buyer communication
- (NOT BUILT) Spam and harassment protection for seller safety
- (NOT BUILT) Quick responses for common questions (shipping time, return policy)

## Implementation Notes

The message center would be at `/sell/messages`. The ChatInterface uses a conversational bubble design (similar to messaging apps) with order context in the header. Pre-written quick response templates cover shipping confirmation, thank you notes, condition clarification, and delay notifications. The response time badge displayed on seller profiles reflects average response performance.
