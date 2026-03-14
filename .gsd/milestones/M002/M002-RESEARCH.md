# M002: Seller Scale & Trust — Research

**Date:** 2026-03-14

## Summary

M002 covers six workstreams: CSV bulk import with catalog matching, price anomaly detection, buyer dispute resolution with photo evidence, seller trust score display, business seller application review, and automated seller enforcement. The good news is that **roughly 60% of the backend infrastructure already exists** — a full dispute module (MercurJS `@mercurjs/dispute` with evidence, messages, timeline models), dispute workflows (initiate, render-decision, process-appeal, send-message), store/vendor/admin dispute API routes, a 593-line TrustScoreService with 8-factor weighted scoring, SellerRating entity with all required fields, SellerReviewService, and a file upload route using MedusaJS's `uploadFilesWorkflow`. What's missing is the CSV import pipeline, fuzzy matching infrastructure (no pg_trgm usage anywhere), price anomaly detection logic, dispute photo upload integration, trust score display in the storefront, enforcement automation, and all the UIs for these features.

The **primary recommendation is to prove the CSV import → catalog matching pipeline first**, because it's the highest-risk greenfield work (format detection, fuzzy matching calibration, split-brain listing creation) and is the supply-side bootstrap weapon. Trust and disputes should follow because they build on existing infrastructure. Price anomaly detection is low-risk middleware that can slot in once CSV import creates listing volume. Enforcement is a background job that can come last.

The split-brain architecture is the dominant constraint: CSV import parses files in either the vendor panel or backend, but catalog matching must query `sidedecked-db` (customer-backend) for card/print/SKU data, and listing creation must write to `mercur-db` (backend) via the existing consumer-seller products API. This cross-system orchestration is the hardest part of M002 and should be proven in the first slice.

## Recommendation

**Prove in this order:**

1. **CSV parsing + catalog matching** (highest risk, no prior art) — Build the parser with format detection, wire pg_trgm fuzzy matching in customer-backend, prove 85/10/5 tiers work on test data
2. **Fuzzy match review UI + listing creation** (split-brain integration) — Prove the full pipeline: CSV → match → review → create listings across both databases
3. **Dispute photo evidence** (extend existing infrastructure) — Add photo upload to existing dispute creation flow, build side-by-side comparison UI
4. **Price anomaly detection** (pure middleware) — Hook into listing creation pipeline, query PriceHistory for 30-day averages
5. **Trust score display + enforcement** (extend existing services) — Surface trust scores in storefront, build enforcement background job
6. **Business seller applications** (admin workflow) — Application submission, admin review queue, role upgrade

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| CSV parsing | `papaparse` (browser+Node) or `csv-parse` (Node) | Battle-tested edge cases: BOM, mixed encodings, unescaped quotes, CR/LF. TCGPlayer exports are notoriously inconsistent. |
| Fuzzy text matching | PostgreSQL `pg_trgm` extension | Already available in Postgres. Trigram similarity is O(n) with GIN indexes. No external service needed. Threshold tuning with `similarity()` and `word_similarity()`. |
| File upload processing | MedusaJS `uploadFilesWorkflow` | Already used in `consumer-seller/uploads/route.ts` and `vendor/uploads/route.ts`. Handles MinIO storage, returns public URLs. |
| Dispute module | `@mercurjs/dispute` package | Full data model (Dispute, DisputeEvidence, DisputeMessage, DisputeTimeline), service layer, enums (status, category, decision). Already wired into backend workflows. |
| Trust score calculation | `TrustScoreService` in customer-backend | 593 lines with 8-factor weighted formula (rating 25%, performance 20%, volume 15%, verification 15%, dispute 10%, experience 5%, consistency 5%, recency 5%). Tier system (Bronze→Diamond). History tracking. |
| Background job scheduling | `bull` queue (already in customer-backend) | `Queue` imported in `customer-backend/src/config/infrastructure.ts`. Use for enforcement cron checks and trust score recalculation. |
| Redis pub/sub | Existing `getRedisClient()`/`getRedisSubscriber()` | Already used for `order.receipt.confirmed` channel. Add channels for `dispute.opened`, `dispute.resolved`, `seller.trust.updated`, `listing.flagged`. |
| Stripe refunds | MedusaJS core refund flows | Stripe Connect is already integrated. Refund on dispute resolution should use existing payment provider. |

## Existing Code and Patterns

### Dispute System (Backend — `mercur-db`)
- `backend/packages/modules/dispute/src/models/dispute.ts` — Full dispute model with status machine (open → awaiting_vendor → under_review → decided → appealed → closed), Stripe integration fields
- `backend/packages/modules/dispute/src/models/dispute-evidence.ts` — Evidence model with `file_url`, `file_key`, `file_type`, `category` (photo/receipt/screenshot/other), `uploader_role` (buyer/vendor)
- `backend/packages/modules/dispute/src/models/dispute-message.ts` — Message model for buyer/vendor/mediator communication
- `backend/packages/modules/dispute/src/models/dispute-timeline.ts` — Timeline events for audit trail
- `backend/apps/backend/src/workflows/dispute/` — 4 workflows: `initiate-dispute`, `render-decision`, `process-appeal`, `send-message`
- `backend/apps/backend/src/workflows/dispute/steps/validate-dispute-eligibility.ts` — 30-day window check, order ownership, prevents duplicate disputes
- `backend/apps/backend/src/api/store/disputes/` — Buyer-facing: list own disputes, create dispute, view detail, send messages, file appeal
- `backend/apps/backend/src/api/admin/disputes/` — Admin-facing: list all, assign mediator, render decision
- `backend/apps/backend/src/api/vendor/disputes/` — Vendor-facing: view, respond, send messages

**Gap:** Dispute creation validator (`StoreCreateDispute`) requires `order_id`, `category`, `description` but has no `evidence` field — photo upload must be a separate step after dispute creation, or the validator must be extended. The DisputeEvidence model exists but no route creates evidence records yet.

### Trust & Seller Rating (Customer-Backend — `sidedecked-db`)
- `customer-backend/src/services/TrustScoreService.ts` — 593 lines, fully implemented trust score calculation with 8 weighted factors. **Key finding:** `getPerformanceMetrics()` returns **mock data** for response_time_hours (6), shipping_time_days (3), return_rate (2.5%), repeat_customer_rate (0.3), growth_rate (0.1). This must be wired to real order data from MedusaJS via API call.
- `customer-backend/src/services/SellerReviewService.ts` — 519 lines, review CRUD, rating aggregation, moderation
- `customer-backend/src/entities/SellerRating.ts` — 252 lines, comprehensive entity: trust_score (0-1000), seller_tier enum, verification flags, monthly_performance JSONB, risk_level
- `customer-backend/src/entities/TrustScoreHistory.ts` — History tracking entity
- `customer-backend/src/routes/sellers.ts` — 981 lines, 15 routes including trust batch, trust analysis, reputation, trust history, verification

**Gap:** TrustScoreService.getPerformanceMetrics() is mocked. Trust scores are computed but not exposed to the storefront for display on listings/card detail pages.

### Catalog & SKU System (Customer-Backend — `sidedecked-db`)
- `customer-backend/src/entities/Card.ts` — 185 lines, multi-game card entity with `normalizedName`, `oracleId`, `tsvector` searchVector column
- `customer-backend/src/entities/Print.ts` — 196 lines, card printing with set, collector number, external IDs (tcgplayerId, cardmarketId, scryfallId)
- `customer-backend/src/entities/CatalogSKU.ts` — 139 lines, universal SKU format: `{GAME}-{SET}-{NUMBER}-{LANG}-{CONDITION}-{FINISH}[-{GRADE}]`
- `customer-backend/src/entities/CardSet.ts` — Set entity with code and game relation
- `customer-backend/src/routes/catalog.ts` — Card search uses `ILIKE` for text matching. No trigram/fuzzy search.
- `customer-backend/src/entities/MarketPrice.ts` — Market price per SKU with source, condition, price, last_scraped
- `customer-backend/src/entities/PriceHistory.ts` — Price history with 30-day averages, useful for anomaly detection

**Gap:** No pg_trgm extension usage. No fuzzy matching API. No bulk import endpoint. Card search is `ILIKE` only — works for exact typing but not for CSV import where names may differ ("Black Lotus" vs "Black Lotus (Alpha)" vs "Black Lotus | Alpha Edition").

### File Upload (Backend — `mercur-db`)
- `backend/apps/backend/src/api/store/consumer-seller/uploads/route.ts` — Consumer seller upload route using `uploadFilesWorkflow`, handles multipart/form-data
- `backend/apps/backend/src/api/vendor/uploads/route.ts` — Vendor upload route, same pattern

**Reusable pattern:** Both use `uploadFilesWorkflow` from `@medusajs/core-flows`. New dispute evidence upload should follow this pattern.

### Listing Creation (Backend — `mercur-db`)
- `backend/apps/backend/src/api/vendor/consumer-seller/products/route.ts` — Creates listing from `catalog_sku`, `condition`, `price`, `quantity`, `images`, `notes`. This is the target API for CSV import listing creation.

### Redis Infrastructure
- `customer-backend/src/config/infrastructure.ts` — `getRedisClient()` and `getRedisSubscriber()` with Railway-compatible config (family: 0, URL query param stripping)
- `backend/apps/backend/src/subscribers/collection-auto-update.ts` — Pattern for backend→Redis pub/sub→customer-backend subscriber chain
- `customer-backend/src/subscribers/collection-subscriber.ts` — Pattern for customer-backend Redis subscriber

### MinIO Infrastructure
- `customer-backend/src/config/infrastructure.ts` — `getMinioClient()` with SSL detection, port parsing, endpoint normalization

## Constraints

- **Split-brain listing creation:** CSV import creates listings in mercur-db but must reference catalog SKUs from sidedecked-db. The consumer-seller products API accepts `catalog_sku` as a string — no foreign key enforcement, just string matching. Mismatches produce orphaned listings.
- **pg_trgm requires DB migration:** The `pg_trgm` extension must be enabled via `CREATE EXTENSION IF NOT EXISTS pg_trgm;` on sidedecked-db. Also needs a GIN index on `cards.normalizedName` using `gin_trgm_ops`. This is a one-time migration.
- **TrustScoreService has mocked performance data:** Lines 430-441 return hardcoded values. Before trust scores can be meaningful, `getPerformanceMetrics()` must call the MedusaJS backend API to get actual order/shipping/response data. This is a cross-system API call (customer-backend → backend).
- **Dispute evidence model exists but has no creation route:** The DisputeEvidence model has `file_url`, `file_key`, `category: "photo"` — but no API route creates evidence records. Either extend the `initiateDisputeWorkflow` to accept file references, or add a `POST /store/disputes/:id/evidence` route.
- **Dispute creation doesn't accept evidence:** `StoreCreateDispute` validator only accepts `order_id`, `category`, `description`. No `evidence` or `photos` field. The UX requires photo upload as part of dispute creation, so either: (a) upload first via `/uploads`, then pass URLs in dispute creation, or (b) add an evidence upload route post-creation.
- **No vendor panel bulk import UI:** The vendor panel (`vendorpanel/`) has file upload components (`vendorpanel/src/components/common/file-upload/`) but no CSV import feature. The CSV import could live in either the vendor panel or the storefront's sell section.
- **Card search uses ILIKE, not pg_trgm:** The existing card search in catalog.ts is `ILIKE %query%` which won't work for fuzzy matching CSV imports. Need a new endpoint or extend existing search with trigram similarity.
- **Price anomaly needs sufficient price history data:** PriceHistory entity exists but needs actual data. If the table is empty, all listings pass anomaly detection vacuously. Need a fallback strategy (e.g., use MarketPrice.price from external sources).
- **Bull queue dependency:** customer-backend imports `Queue from 'bull'` in infrastructure.ts. Use this for enforcement cron jobs and trust score batch recalculation.

## Common Pitfalls

- **CSV format detection false positives** — TCGPlayer and Crystal Commerce CSVs can have overlapping column names (both might have "Name", "Condition", "Price"). Detection must check for format-specific marker columns (TCGPlayer has "TCGplayer Id", Crystal Commerce has "Category"). Test with real exports, not synthetic data.
- **pg_trgm threshold too aggressive** — A 0.7 similarity threshold may reject valid matches like "Lightning Bolt (Beta)" vs "Lightning Bolt". Start conservative (0.5) and tune upward. Use `word_similarity()` not just `similarity()` for partial name matches where one string is a substring of another.
- **Split-brain consistency on failure** — If CSV matching succeeds but listing creation fails partway through a batch, some cards are created and others aren't. Need idempotent listing creation (check for existing SKU before creating) and batch status tracking.
- **Trust score penalizing new sellers** — The TrustScoreService gives 0 for rating_score when `total_reviews === 0` and default 50 for consistency_score with insufficient data. New sellers will score ~100-150 (Bronze tier). Consider a "New Seller" badge that bypasses the numeric score display for sellers with < 5 transactions (Story 7.4 already specifies this).
- **Dispute photo storage size** — Buyer photos of damaged cards can be 5-10MB each. The existing upload route doesn't set size limits. Add validation (< 10MB per file, < 5 files per dispute) to prevent storage abuse.
- **Enforcement false positives** — "3+ unfulfilled orders in 30 days" could hit a seller who received 3 orders on the same day and hasn't shipped yet (within normal processing time). Define "unfulfilled" precisely: order age > 7 days without shipping confirmation.
- **Race condition on price anomaly check** — If a seller lists a card and the market price updates simultaneously, the anomaly check might use stale data. Use the most recent PriceHistory record, not a cached value.

## Open Risks

- **CSV format variety is unbounded** — TCGPlayer and Crystal Commerce are documented, but sellers may export from other tools (Deckbox, Manabox, Delver Lens, TCGplayer Pro). The "manual" format catch-all needs clear column requirements documented for sellers.
- **pg_trgm calibration needs real data** — We can't tune the 0.7 threshold without real seller CSV data. Consider shipping with a configurable threshold and a "calibrate from import results" admin tool.
- **TrustScoreService cross-system performance data** — Getting real performance metrics requires customer-backend calling backend's API. Network latency + auth adds complexity. Consider caching performance data in sidedecked-db via Redis event-driven sync.
- **Dispute refund via Stripe** — The `render-decision` workflow marks a dispute as decided but doesn't process refunds. Need to integrate with MedusaJS payment refund workflows when decision is `buyer_wins` or `partial`.
- **Admin panel for disputes/applications** — No admin UI exists for dispute resolution or business seller application review. These likely need MedusaJS admin dashboard extensions or a separate admin section in the vendor panel.
- **Vendor panel or storefront for CSV import?** — The vendor panel is the natural home for business seller tools, but M001/S08's listing wizard is in the storefront (`/sell/`). CSV import location needs a decision.

## Requirements Gap Analysis

### Table Stakes (Missing from R031-R034)
- **R031 doesn't specify CSV size limit** — 2,400 cards in context, but should there be a hard limit? 10,000? What about memory limits for browser-side parsing?
- **R031 doesn't specify duplicate handling within a CSV** — Same card listed twice with different conditions/prices. Merge? Reject? Create both?
- **R033 doesn't specify evidence upload size/count limits** — Could become a storage cost issue at scale.
- **R034 doesn't specify trust score update frequency** — "Within 1 hour" per context, but real-time vs. batch?

### Candidate Requirements (advisory, not auto-binding)
- **CR-M002-01: Dispute evidence upload route** — Add `POST /store/disputes/:id/evidence` for photo upload after dispute creation. Required for R033 photo evidence.
- **CR-M002-02: Price anomaly fallback when no price history exists** — Use MarketPrice (external source data) when PriceHistory is empty for a SKU. Otherwise anomaly detection is vacuous.
- **CR-M002-03: TrustScoreService real performance data integration** — Wire getPerformanceMetrics() to actual order data instead of mock values. Without this, trust scores are unreliable.
- **CR-M002-04: CSV import location decision** — Vendor panel vs. storefront `/sell/` section. Affects which repo gets the bulk of the work.
- **CR-M002-05: Admin UI for dispute resolution and business seller applications** — No admin interface exists. Needs MedusaJS admin extensions or vendor panel admin section.
- **CR-M002-06: Seller enforcement "unfulfilled" definition** — Define precisely: order age > N days without shipping confirmation, to avoid false positives on recently-placed orders.
- **CR-M002-07: Dispute→refund workflow integration** — Extend render-decision workflow to trigger Stripe refund when decision is buyer_wins or partial.

### Out of Scope Confirmed
- Multi-channel inventory sync (M003)
- ML-powered risk scoring (M005)
- Automated repricing (M005)
- Apple OAuth (R030 — deferred, opportunistic)

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| MedusaJS | `medusajs/medusa-agent-skills@building-with-medusa` (784 installs) | available — recommended for workflow/module patterns |
| MedusaJS Admin | `medusajs/medusa-agent-skills@building-admin-dashboard-customizations` (745 installs) | available — useful for admin dispute/application UIs |
| Stripe | `stripe/ai@stripe-best-practices` (1.4K installs) | available — useful for refund integration |
| Stripe | `wshobson/agents@stripe-integration` (4.7K installs) | available — highest install count |
| TypeORM | `mindrally/skills@typeorm` (283 installs) | available — useful for migration/entity patterns |
| CSV parsing | `404kidwiz/claude-supercode-skills@csv-data-wrangler` (131 installs) | available — low install count, likely not essential |

**Recommended installs:** `medusajs/medusa-agent-skills@building-with-medusa` (core framework patterns) and `stripe/ai@stripe-best-practices` (refund integration). The MedusaJS admin skill is relevant if dispute/application admin UIs are built as MedusaJS admin extensions.

## Sources

- Dispute module schema and workflows examined directly from `backend/packages/modules/dispute/src/models/` and `backend/apps/backend/src/workflows/dispute/`
- TrustScoreService implementation reviewed at `customer-backend/src/services/TrustScoreService.ts` — confirmed mock performance data at lines 430-441
- Catalog entities (Card, Print, CatalogSKU, MarketPrice, PriceHistory) examined at `customer-backend/src/entities/`
- File upload pattern confirmed from `backend/apps/backend/src/api/store/consumer-seller/uploads/route.ts`
- Redis pub/sub pattern confirmed from `backend/apps/backend/src/subscribers/collection-auto-update.ts` and `customer-backend/src/subscribers/collection-subscriber.ts`
- Epic stories 4.5-4.7 and 7.1-7.6 reviewed from `_bmad-output/planning-artifacts/epics.md` (lines 952-1483)
- Consumer-seller product listing API examined at `backend/apps/backend/src/api/vendor/consumer-seller/products/route.ts`
- Card search implementation reviewed at `customer-backend/src/routes/catalog.ts` — confirmed ILIKE-only, no pg_trgm
