# M002: Seller Scale & Trust

**Vision:** Scale the seller side of the marketplace with bulk CSV inventory import, trust/safety systems (price anomaly detection, disputes with photo evidence, trust scores, automated enforcement), and admin tools — making the marketplace safe enough for real money at volume.

## Success Criteria

- A business seller can upload a 2,400-card CSV (TCGPlayer, Crystal Commerce, or manual format), review fuzzy matches, and see listings go live in the storefront
- A buyer can open a dispute with photo evidence on a received order, an admin resolves it with side-by-side photo comparison, and a Stripe refund is issued when the buyer wins
- A listing priced >50% below 30-day market average is automatically flagged and held from search until admin review
- Seller trust scores are visible on listing cards and card detail pages, with "New Seller" badge for sellers with < 5 transactions
- A seller with 3+ unfulfilled orders (> 7 days old without shipping confirmation) in 30 days has listings auto-deactivated
- An admin can review and approve/reject business seller applications, granting access to CSV import tools

## Key Risks / Unknowns

- **CSV format detection across TCGPlayer / Crystal Commerce / manual** — Overlapping column names make format detection ambiguous. Must use format-specific marker columns. No prior art in the codebase.
- **pg_trgm fuzzy matching calibration** — The 0.7 threshold is unvalidated. `similarity()` vs `word_similarity()` choice affects match quality. Needs real inventory data to tune. No trigram usage exists anywhere in the codebase.
- **Split-brain listing creation** — CSV import matches cards in `sidedecked-db` but creates listings in `mercur-db` via the consumer-seller products API. Partial batch failures create orphaned state. No idempotency exists.
- **TrustScoreService mocked performance data** — Lines 430-441 return hardcoded values. Trust scores are meaningless until `getPerformanceMetrics()` calls backend for real order/shipping data. Cross-system API call adds latency and auth complexity.
- **Dispute → Stripe refund gap** — `render-decision` workflow marks disputes as decided but doesn't process refunds. Need to integrate with MedusaJS payment refund flows.

## Proof Strategy

- CSV format detection + fuzzy matching calibration → retire in S01 by shipping a working CSV upload → match → review → listing creation pipeline that processes a 2,400-card TCGPlayer CSV end-to-end
- Split-brain listing creation → retire in S01 by proving CSV-matched cards create real listings in `mercur-db` referencing catalog SKUs from `sidedecked-db`
- Dispute → refund gap → retire in S02 by shipping admin dispute resolution that triggers Stripe refund on buyer-wins decisions
- TrustScoreService mock data → retire in S03 by wiring real performance metrics from backend API and displaying computed trust scores in the storefront

## Verification Classes

- Contract verification: Unit tests for CSV parser (format detection, column mapping, error handling), catalog matching (similarity thresholds, confidence tiers), price anomaly detection (threshold math, fallback logic), trust score computation, enforcement rules. Integration tests for dispute workflows with evidence.
- Integration verification: CSV upload → catalog match → listing creation across both databases. Dispute creation → evidence upload → admin resolution → Stripe refund → trust score update. Collection auto-update pipeline for trust score recalculation via Redis pub/sub.
- Operational verification: 2,400-card CSV import completes in < 5 minutes. Trust scores recalculate within 1 hour via background job. Enforcement cron correctly identifies unfulfilled orders > 7 days.
- UAT / human verification: CSV import review UI usability (fuzzy match selection, unmatched card search). Dispute photo comparison readability. Trust score badge clarity on listing cards.

## Milestone Definition of Done

This milestone is complete only when all are true:

- All 4 slice deliverables are complete with passing tests
- A 2,400-card CSV (TCGPlayer format) is uploaded, parsed, matched (85%+ auto, ~10% fuzzy, ~5% unmatched), fuzzy matches reviewed, and listings created in the live system
- A buyer dispute with photo evidence is opened, admin resolves with refund, seller trust score adjusts — proven end-to-end with all services running
- A listing priced >50% below market is automatically held and visible in admin flagged queue
- Trust scores display on card detail page seller rows and listing cards in the storefront
- Enforcement background job deactivates listings for sellers with 3+ unfulfilled orders (> 7 days) in 30 days
- Business seller application → admin review → approval → CSV import access is proven end-to-end
- Final integrated acceptance scenarios pass with all services (backend, customer-backend, storefront, vendorpanel) running together

## Requirement Coverage

- Covers: R031 (CSV bulk import), R032 (price anomaly detection), R033 (dispute resolution with photo evidence), R034 (seller trust score calculation)
- Partially covers: none
- Leaves for later: R030 (Apple OAuth — deferred, requires Developer Program enrollment), R035 (price history charts — M003), R036 (community — M004), R037 (ML pricing — M005)
- Orphan risks: none — all Active requirements relevant to M002 are mapped

### Requirement → Slice Mapping

| Req | Description | Primary Owner | Supporting |
|-----|-------------|---------------|-----------|
| R031 | CSV bulk import for vendors | S01 | — |
| R032 | Price anomaly detection | S03 | S04 (admin flagged queue) |
| R033 | Dispute resolution with photo evidence | S02 | S04 (integration proof) |
| R034 | Seller trust score calculation | S03 | S04 (enforcement adjusts scores) |

### Candidate Requirements Adopted

| ID | Description | Adopted In |
|----|-------------|-----------|
| CR-M002-01 | Dispute evidence upload route | S02 |
| CR-M002-02 | Price anomaly fallback (MarketPrice when no PriceHistory) | S03 |
| CR-M002-03 | TrustScoreService real performance data | S03 |
| CR-M002-04 | CSV import location: vendor panel | S01 (D037) |
| CR-M002-05 | Admin UI for disputes and business seller applications | S02 (disputes), S04 (applications) |
| CR-M002-06 | Enforcement "unfulfilled" = order age > 7 days without shipping | S04 (D038) |
| CR-M002-07 | Dispute → refund workflow integration | S02 |

## Slices

- [ ] **S01: CSV Inventory Import & Catalog Matching** `risk:high` `depends:[]`
  > After this: A business seller uploads a CSV in the vendor panel, the parser detects TCGPlayer/Crystal Commerce/manual format, cards are matched against the catalog with 85/10/5 confidence tiers using pg_trgm, the seller reviews fuzzy matches and resolves unmatched cards, and confirmed cards create real listings in the marketplace — proven with tests and a working UI against running services.

- [ ] **S02: Dispute Resolution with Photo Evidence** `risk:medium` `depends:[]`
  > After this: A buyer opens a dispute on a received order with photo uploads, the seller is notified, an admin reviews with side-by-side photo comparison of listing vs. evidence photos, renders a decision, and a Stripe refund is processed when the buyer wins — proven with tests, working storefront dispute UI, and working admin dispute resolution UI.

- [ ] **S03: Price Anomaly Detection & Trust Score Display** `risk:medium` `depends:[]`
  > After this: A listing priced >50% below market average is automatically held with "Under Review" status visible to the seller, trust scores computed from real order data display on card detail page seller rows and listing cards with "New Seller" badge for < 5 transactions — proven with tests and visible in the storefront.

- [ ] **S04: Enforcement, Business Applications & Integration** `risk:low` `depends:[S01,S02,S03]`
  > After this: Sellers with 3+ unfulfilled orders (> 7 days) in 30 days are auto-deactivated with notification, business seller applications go through admin review with role upgrade on approval, and the complete M002 system is proven end-to-end: CSV import → listing creation → price anomaly check → trust score display → dispute → refund → trust score adjustment → enforcement — all services running together.

## Boundary Map

### S01 → S02

Produces:
- `POST /vendor/consumer-seller/bulk-import/upload` route accepting multipart CSV upload, returning `importId` and parsed row count
- `POST /vendor/consumer-seller/bulk-import/:importId/match` route triggering catalog matching via customer-backend API
- `GET /vendor/consumer-seller/bulk-import/:importId/results` route returning matched/fuzzy/unmatched card lists with confidence scores
- `POST /vendor/consumer-seller/bulk-import/:importId/confirm` route creating listings from confirmed matches via existing consumer-seller products API
- `GET /api/catalog/cards/fuzzy-match` endpoint in customer-backend using pg_trgm with `similarity()` and `word_similarity()`, returning match candidates with confidence scores
- pg_trgm extension enabled on `sidedecked-db` with GIN index on `cards.normalizedName`
- CSV parser module supporting TCGPlayer (marker: `TCGplayer Id`), Crystal Commerce (marker: `Category`), and manual (fallback) formats via `papaparse`
- Vendor panel bulk import UI: upload page, matching progress, review page (auto/fuzzy/unmatched tabs), confirm page

Consumes:
- Existing consumer-seller products API (`POST /vendor/consumer-seller/products`) for listing creation
- Existing catalog entities (Card, Print, CatalogSKU) in customer-backend
- Existing `uploadFilesWorkflow` pattern for CSV file handling
- Existing vendor panel file upload components

### S02 → S03

Produces:
- `POST /store/disputes/:id/evidence` route for buyer photo upload using `uploadFilesWorkflow`, creating DisputeEvidence records with `category: "photo"`
- Extended `StoreCreateDispute` validator accepting initial evidence file references
- Storefront dispute creation UI at `/user/orders/:orderId/dispute` with photo upload, reason selection, description
- Admin dispute resolution UI (MedusaJS admin extension or vendor panel admin section) with side-by-side photo viewer, decision form (full/partial refund or dismiss), reason text
- Extended `render-decision` workflow step triggering Stripe refund via MedusaJS payment refund flows when decision is `buyer_wins` or `partial`
- Redis events: `dispute.opened`, `dispute.resolved` published for downstream trust score consumption

Consumes:
- Existing `@mercurjs/dispute` module (Dispute, DisputeEvidence, DisputeMessage, DisputeTimeline models)
- Existing dispute workflows (`initiate-dispute`, `render-decision`, `process-appeal`, `send-message`)
- Existing dispute API routes (store, vendor, admin)
- Existing `uploadFilesWorkflow` pattern
- Existing MinIO infrastructure for file storage

### S03 → S04

Produces:
- Price anomaly detection middleware hooking into listing creation pipeline — checks `PriceHistory` 30-day average (fallback to `MarketPrice`) and holds listings >50% below with `status: "flagged"`
- `listing.flagged` Redis event published when a listing is held
- `TrustScoreService.getPerformanceMetrics()` wired to real order data from backend API instead of mock values
- Trust score display components in storefront: `SellerTrustBadge` on card detail page seller rows and listing cards, "New Seller" badge for < 5 transactions
- `seller.trust.updated` Redis event published on trust score recalculation
- Admin flagged listings queue (extend existing admin routes) showing price-flagged listings with approve/reject/request-adjust actions
- Background job (bull queue) for periodic trust score recalculation

Consumes:
- Existing `TrustScoreService` (customer-backend) — extends, doesn't replace
- Existing `PriceHistory` and `MarketPrice` entities for anomaly detection
- Existing `SellerRating` entity for trust score storage
- Existing bull queue infrastructure in customer-backend
- Redis pub/sub infrastructure for `dispute.resolved` events (from S02)

### S04 (integration)

Produces:
- Enforcement background job (bull queue cron): queries orders > 7 days without shipping confirmation, deactivates all listings for sellers with 3+ unfulfilled in 30-day window, sends seller notification
- `POST /store/seller/business-application` route for business seller application submission
- Admin business application review UI with approve/reject/request-info actions
- Role upgrade workflow: approval → business seller role → CSV import access
- Seller reactivation request flow after enforcement deactivation
- End-to-end integration proof: all M002 features exercised with all services running

Consumes:
- CSV import pipeline (S01)
- Dispute + refund pipeline (S02)
- Price anomaly detection + trust scores (S03)
- All existing backend/customer-backend/storefront/vendorpanel infrastructure
