# M003: Growth & Analytics

## Goal
Deepen the buyer and seller experience with data visibility, collection tools, and platform admin capabilities.

## Slices

- [ ] **S01: Vendor Analytics Dashboard** `risk:medium` `depends:[]`
  > Vendorpanel analytics tab with sales charts (revenue, order volume, conversion rate, time series), inventory performance (top-selling, slow-moving, out-of-stock alerts), and payout history with pending balance breakdown.

- [ ] **S02: Price Intelligence** `risk:medium` `depends:[S01]`
  > Price history charts on card detail page (7/30/90-day sparklines + full chart). Price alerts — user-configurable threshold per card, email/in-app notification on trigger. Competitive pricing suggestions in listing wizard Step 3 (percentile indicator + suggested competitive price).

- [ ] **S03: Collection Management** `risk:low` `depends:[S01]`
  > Full collection page at `/user/collection` — card list with set/condition/foil filters, sort by value/quantity/name. Bulk management (mark as traded, remove). "Haves" / "Wants" list export for trading forums. Collection stats (total estimated value, cards per game).

- [ ] **S04: Admin Dashboard** `risk:medium` `depends:[S02, S03]`
  > Platform metrics dashboard (DAU, GMV, listing volume, dispute rate, seller conversion). User management (search, view profile, ban, verify, role assignment). Content moderation queue (flagged listings, disputed content). System health panel (Redis queue depths, ETL last-run, Algolia index status).
