# M004: Community & Engagement — Context

**Gathered:** 2026-03-13
**Status:** Future milestone — plan when M003 completes

## Project Description

Build the community layer that closes the community-to-commerce loop — groups, forums, events, messaging, and deck comments. When Jordan shares a deck and players discuss it, that activity directly generates card demand and purchases.

## Why This Milestone

M001-M003 prove commerce works. M004 makes SideDecked a destination, not just a store. The community-to-commerce loop is a moat: TCGPlayer has commerce, Moxfield has community, SideDecked has both integrated. Community features create network effects that make the platform defensible.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Create and join community groups organized around games, formats, or local play
- Post in community forums with deck references that link to cards and listings
- Organize local events with RSVPs and deck sharing
- Comment on public decks and get notifications
- Send direct messages to buyers/sellers via TalkJS integration
- See community activity feed on their profile

### Entry point / environment

- Entry point: Storefront `/community`, `/decks/[id]` (comments), `/events`
- Environment: production
- Live dependencies: TalkJS (messaging), Redis (activity feed), Resend (notification emails)

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A user can create a community group, post a deck link, another user can view it, import it, and buy the missing cards
- Event creation → RSVP → deck sharing after event → card purchases from shared decks
- Direct messaging between buyer and seller about a listing

## Existing Codebase / Prior Art

- `customer-backend/src/entities/ForumCategory.ts`, `ForumPost.ts`, `ForumTopic.ts` — Forum entities exist
- `customer-backend/src/entities/Conversation.ts`, `Message.ts` — Messaging entities exist
- `customer-backend/src/entities/Activity.ts` — Activity tracking entity
- `vendorpanel/src/providers/talkjs-provider/` — TalkJS integration exists in vendor panel

## Relevant Requirements

- R036 — Community groups/following/events

## Scope

### In Scope
- Community groups (create, join, manage)
- Forums with deck references
- Event creation and RSVPs
- Deck comments
- Direct messaging (TalkJS)
- Community activity feed
- Notification system for community events

### Out of Scope / Non-Goals
- AI content moderation (use manual for MVP)
- Video/streaming integration
- Tournament bracket management
