# M002: Seller Scale & Trust

## Goal
Give business sellers tools to list inventory at scale and give buyers confidence through transparent trust signals and dispute resolution.

## Slices

- [ ] **S01: CSV Bulk Import** `risk:high` `depends:[]`
  > Vendor panel bulk import flow with papaparse format detection (TCGPlayer, Crystal Commerce, manual), pg_trgm `word_similarity()` fuzzy matching (0.5 threshold), fuzzy match review UI (85/10/5 auto/review/unmatched tiers), and confirmed matches flowing to live listing creation. In-memory Map import state (single-session, no persistence needed for MVP).

- [ ] **S02: Dispute Resolution** `risk:high` `depends:[S01]`
  > Extend `@mercurjs/dispute` module with reason categories and photo evidence fields. Separate evidence upload route `POST /store/disputes/:id/evidence` (≤5 files, <10MB each). Storefront buyer dispute filing flow. Admin dispute queue with side-by-side listing photo vs evidence photo comparison. Full/partial refund or dismissal via Stripe with both parties notified.

- [ ] **S03: Price Anomaly Detection & Trust Scores** `risk:medium` `depends:[S01]`
  > Price anomaly service flagging listings >50% below 30-day market average. MarketPrice fallback when PriceHistory has <3 data points. "Under Review" listing status. Admin flagged listing queue. TrustScoreService real data wiring (replace mock `getPerformanceMetrics()` with real backend API calls). Bull queue cron every 30 minutes for batch recalculation. "New Seller" badge for <5 transactions. Bronze/Silver/Gold/Diamond tier display.

- [ ] **S04: Automated Enforcement & Integration** `risk:medium` `depends:[S02, S03]`
  > Enforcement rules: 3 unfulfilled orders >7 days → auto-restrict seller. Dispute resolution → priority trust score recalculation for affected seller. Trust score display wired on card detail page seller rows and listing cards. Admin enforcement log. End-to-end proof: dispute filed → resolved → trust score updated → listing status reflects.
