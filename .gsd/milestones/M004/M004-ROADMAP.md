# M004: Community & Engagement

## Goal
Build the community layer that turns the platform into a destination, not just a transaction engine.

## Slices

- [ ] **S01: Social Graph** `risk:medium` `depends:[]`
  > Follow/unfollow users. Activity feed for followed users (deck publishes, notable purchases, collection milestones). User discovery page (featured collectors, top sellers by game, rising new sellers).

- [ ] **S02: Deck Community** `risk:low` `depends:[S01]`
  > Deck comments (threaded, paginated). Deck reactions (upvote/bookmark). OG tag generation for deck share links (card fan preview image). Community deck rankings by game + format with vote-based weighting.

- [ ] **S03: Groups & Events** `risk:medium` `depends:[S01]`
  > Community groups (create, join, manage membership, group deck collections). Event scheduling (LGS events, online drafts, sealed events). Group discussion threads. Event RSVP + attendee list.

- [ ] **S04: Direct Messaging** `risk:high` `depends:[S01]`
  > Buyer-seller message thread scoped to order (dispute pre-escalation communication). General user DMs. WebSocket or polling-based real-time delivery. In-app notification badge + email digest (daily unread summary).
