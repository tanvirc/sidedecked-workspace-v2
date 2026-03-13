# M002: Seller Scale & Trust — Context

**Gathered:** 2026-03-13
**Status:** Future milestone — plan when M001 completes

## Project Description

Scale the seller side of the marketplace with bulk inventory import, automated trust/safety systems, and dispute resolution. Makes the marketplace safe enough for real money at volume.

## Why This Milestone

M001 proves the core buyer loop. M002 proves the seller loop scales — one vendor uploading 2,400 cards via CSV is the supply-side bootstrap weapon. Trust and safety features (price anomaly detection, disputes, trust scores, automated enforcement) are required before real money flows at scale.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Upload a CSV inventory file (TCGPlayer, Crystal Commerce, manual formats) and have cards auto-matched to the catalog with 85% auto / 10% fuzzy / 5% unmatched tiers
- Review and resolve fuzzy-matched and unmatched cards from CSV import
- See seller trust scores on listings and card detail pages
- Open a dispute on a received order with photo evidence
- See price anomaly warnings before listings with suspiciously low prices go live
- (Admin) Review and resolve disputes with side-by-side photo comparison
- (Admin) Review and approve/reject business seller applications
- (Admin) See auto-deactivated listings from unreliable sellers

### Entry point / environment

- Entry point: Storefront (`/sell/`), Vendor panel, Admin panel
- Environment: local dev → staging → production
- Live dependencies: Stripe Connect (refunds for disputes), MinIO (dispute photos), Redis (trust score events)

## Completion Class

- Contract complete means: CSV parsing handles all 3 formats, matching algorithm achieves 85% auto-match on test data, trust score formula produces expected values
- Integration complete means: CSV import → catalog matching → listing creation end-to-end, dispute → refund → trust score update end-to-end
- Operational complete means: 2,400 card CSV imports in < 5 minutes, trust scores update within 1 hour of transaction events

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A business seller can upload a 2,400 card CSV, resolve fuzzy matches, and see listings go live
- A buyer can open a dispute with photos, an admin resolves it, and the seller's trust score adjusts
- A listing priced >50% below market is automatically flagged and held for admin review
- A seller with 3+ unfulfilled orders in 30 days has listings auto-deactivated

## Risks and Unknowns

- CSV format detection — TCGPlayer, Crystal Commerce, and manual CSVs have different column layouts. Parser needs to be format-agnostic.
- pg_trgm fuzzy matching tuning — 0.7 threshold may be too aggressive or too lenient. Needs real inventory data to calibrate.
- Trust score formula fairness — weighting disputes vs. volume vs. fulfillment speed. Could inadvertently penalize new sellers.

## Existing Codebase / Prior Art

- `customer-backend/src/services/TrustScoreService.ts` — 593 lines, trust score calculation exists
- `customer-backend/src/services/SellerReviewService.ts` — 519 lines, seller review management
- `customer-backend/src/routes/sellers.ts` — 981 lines, seller routes including reviews
- `backend/apps/backend/src/api/admin/disputes/` — dispute admin routes exist
- `backend/apps/backend/src/api/store/disputes/` — dispute store routes exist
- `_bmad-output/planning-artifacts/epics.md` — Epic 4 (Stories 4.5-4.7), Epic 7 (Stories 7.1-7.6)

## Relevant Requirements

- R031 — CSV bulk import for vendors
- R032 — Price anomaly detection
- R033 — Dispute resolution with photo evidence
- R034 — Seller trust score calculation
- R030 — Apple OAuth provider (opportunistic inclusion)

## Scope

### In Scope
- CSV inventory import with multi-format detection
- Catalog matching with 85/10/5 confidence tiers
- Fuzzy match review UI
- Price anomaly detection (>50% below 30-day average)
- Buyer dispute opening with photo evidence
- Admin dispute resolution with photo comparison and refunds
- Seller trust score calculation and display
- Business seller application review
- Automated seller enforcement (3+ unfulfilled orders → deactivation)
- Apple OAuth provider (if Developer Program enrolled)

### Out of Scope / Non-Goals
- Multi-channel inventory sync (M003)
- Advanced fraud detection (M005)
- ML-powered risk scoring (M005)
- Automated repricing for sellers (M005)

## Technical Constraints

- Split-brain: CSV import creates listings in mercur-db but must reference catalog SKUs in sidedecked-db
- pg_trgm extension required on sidedecked-db for fuzzy matching
- Dispute photo storage in MinIO must handle concurrent uploads
- Trust score updates must not block user-facing requests (background job)

## Integration Points

- **Stripe Connect** — Refund processing for disputes
- **MinIO** — Photo upload for dispute evidence
- **Redis pub/sub** — Events: `dispute.opened`, `dispute.resolved`, `seller.trust.updated`, `listing.flagged`
- **customer-backend catalog API** — Card matching for CSV import
