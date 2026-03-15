# S01: CSV Inventory Import & Catalog Matching — Research

## Technical Research

### A. Consumer-Seller Products API (CRITICAL)

**File inspected:** `backend/apps/backend/src/api/vendor/consumer-seller/products/route.ts`

**Confirmed: The vendor consumer-seller products endpoint is a non-functional stub.** It returns mock/hardcoded data with `mockProduct` and `mockVariant` objects built from `Date.now()` and `Math.random()`. It has three explicit TODO comments:
- "Implement proper seller authentication middleware"
- "Fetch card data from customer-backend using catalog_sku"
- "Store in actual Medusa product tables"

The endpoint does not call any MedusaJS workflow, does not write to any database, and does not create real products. It just `console.log`s mock objects and returns them as JSON.

**However, a WORKING listing creation endpoint already exists at a different path:**

**File:** `backend/apps/backend/src/api/store/consumer-seller/listings/route.ts`

This endpoint (`POST /store/consumer-seller/listings`) is a fully functional implementation that:
1. Authenticates via `req.auth_context.actor_id`
2. Resolves the seller via `fetchConsumerSellerByCustomerId()` using the query graph
3. Calls `createProductsWorkflow` from `@medusajs/medusa/core-flows` — the official MedusaJS product creation workflow
4. Creates a product with proper structure: title, handle, options (Condition), variants with prices, images, metadata including `catalog_sku`
5. Links to the seller via `additional_data: { seller_id: seller.id }`
6. Returns the created product and variant IDs

**Key fields the working endpoint accepts (from `StoreCreateConsumerSellerListing` Zod validator):**
- `catalog_sku` (string, required) — cross-reference to sidedecked-db
- `condition` (enum: NM, LP, MP, HP, DMG, required)
- `language` (string, default "EN")
- `finish` (string, default "NORMAL")
- `price` (integer, positive — in cents, required)
- `quantity` (integer, 1-10, default 1)
- `title` (string, required)
- `description` (string, optional)
- `images` (array of URLs, max 6)
- `shipping_method` (enum: standard, priority, free_over_25)
- `status` (enum: published, draft, default "published")

**Existing product creation patterns in backend:**
- `importSellerProductsWorkflow` (`backend/apps/backend/src/workflows/seller/workflows/import-seller-products.ts`) — uses `parseProductCsvStep` + `createProductsWorkflow.runAsStep()` + creates product requests. This is the existing MedusaJS CSV import flow for business vendors.
- `POST /vendor/products` — uses `createProductRequestWorkflow` (goes through a request/approval flow before product creation).
- `POST /store/consumer-seller/listings` — directly calls `createProductsWorkflow` without a request step (consumer sellers publish directly or as draft).

**Decision-critical finding:** The stub at `/vendor/consumer-seller/products` is irrelevant. The working endpoint at `/store/consumer-seller/listings` is the real listing creation path. However, it's under `/store/` not `/vendor/`. The bulk import will run from the vendor panel, so we either:
1. Call the `/store/consumer-seller/listings` endpoint from the backend's bulk import confirm step (internal cross-route call within the same backend)
2. Create a new `/vendor/consumer-seller/bulk-import/confirm` route that directly calls `createProductsWorkflow` with the same pattern

Option 2 is cleaner — the bulk import confirm route should call `createProductsWorkflow` directly, using the same pattern as the store listings endpoint. No need to go through HTTP to another route on the same server.

### B. Catalog Data Model

**File: `customer-backend/src/entities/Card.ts`**
- `normalizedName` column: `varchar(500)`, searchable lowercased version of card name
- Entity has B-tree indexes: `idx_cards_search` on `(normalizedName, primaryType)` and `idx_cards_game_name` on `(gameId, normalizedName)`
- **No GIN trigram index exists on `cards.normalizedName`** — only regular B-tree. This must be created.
- Card → Print (OneToMany), Card → CardTranslation (OneToMany)
- Card has `name`, `normalizedName`, `oracleId`, `oracleHash`, `gameId`, `primaryType`, game-specific attributes

**File: `customer-backend/src/entities/CardTranslation.ts`**
- `translatedNormalizedName` column: `varchar(500)`, the translation target
- Unique constraint on `(cardId, languageCode)`
- Relation: ManyToOne → Card (cascade delete)
- Fields: `languageCode`, `translatedName`, `translatedNormalizedName`, `translatedText`, `translatedFlavorText`, `source`

**File: `customer-backend/src/entities/Print.ts`**
- Links Card to CardSet with print-specific attributes (rarity, collectorNumber, finish, variation, images, etc.)
- Has `tcgplayerId`, `scryfallId`, `cardmarketId` — external IDs for price tracking
- Has image URLs: `imageSmall`, `imageNormal`, `imageLarge`, `imageArtCrop`, `imageBorderCrop`, `blurhash`
- OneToMany → CatalogSKU

**File: `customer-backend/src/entities/CatalogSKU.ts`**
- Universal SKU format: `{GAME}-{SET}-{NUMBER}-{LANG}-{CONDITION}-{FINISH}[-{GRADE}]`
- Components: `gameCode`, `setCode`, `collectorNumber`, `languageCode`, `conditionCode`, `finishCode`
- Market data: `lowestPrice`, `marketPrice`, `highestPrice`, `averagePrice`, `priceTrend`
- ManyToOne → Print

**Migration: `customer-backend/src/migrations/1776700000000-AddCardTranslationsAndCollectibility.ts`**
- Creates `card_translations` table
- Creates `pg_trgm` extension (`CREATE EXTENSION IF NOT EXISTS pg_trgm`)
- Creates GIN trigram index: `idx_card_translations_name_trgm` on `card_translations."translatedNormalizedName"` using `gin_trgm_ops`
- Adds collectibility columns to cards table
- **No GIN index on `cards.normalizedName`** — only on `card_translations.translatedNormalizedName`

**Data contract for listing creation (cross-service interface):**

From customer-backend (fuzzy match result), the backend needs:
1. `card.name` — for the listing title
2. `card.id` — for metadata cross-reference
3. `card.gameId` / `game.code` — for SKU construction and metadata
4. `print.id` — to identify the specific printing
5. `print.set.code`, `print.set.name` — for SKU and display
6. `print.collectorNumber` — for SKU construction
7. `print.imageNormal` — for listing thumbnail
8. `print.rarity` — for metadata
9. `catalogSku.sku` — the actual catalog_sku string for the listing (e.g., `MTG-DMU-001-EN-NM-NORMAL`)

The CatalogSKU entity is the bridge. A matched card + condition + language + finish maps to a specific CatalogSKU.sku, which is what gets stored in the listing's metadata.

### C. Existing Import/Upload Patterns

**Vendorpanel file upload:**
- `vendorpanel/src/components/common/file-upload/file-upload.tsx` — generic drag-and-drop file upload component with `FileUpload` and `FileType` interfaces. Supports multiple formats, drag events, file preview.
- `vendorpanel/src/routes/products/product-import/` — existing Medusa product import UI using `UploadImport` component. Uses `RouteDrawer` pattern, handles CSV only (`text/csv`), shows import summary.
- `vendorpanel/src/routes/products/product-import/components/upload-import.tsx` — CSV-specific wrapper around `FileUpload` with format validation.

**Vendorpanel data fetching:**
- `vendorpanel/src/hooks/api/catalog.tsx` — existing TanStack Query hooks for catalog operations: `useCardSearch`, `useCatalogSku`. Uses `customerBackendFetch` utility.
- `vendorpanel/src/lib/client/customer-backend.ts` — simple fetch wrapper to customer-backend (`__CUSTOMER_BACKEND_URL__`). GET-only currently, but trivially extensible.
- `vendorpanel/src/hooks/api/` — 45+ existing TanStack Query hooks following consistent patterns.

**Vendorpanel wizard pattern:**
- `vendorpanel/src/routes/products/product-create-listing/` — existing multi-step wizard with ProgressTabs (Card → Details → Images → Review). Uses `RouteFocusModal`, `react-hook-form` + Zod, tab state management. This is the exact pattern for the bulk import wizard.
- Card selector uses `useCardSearch` hook with debounced search against customer-backend `/cards/search` endpoint.

**papaparse dependency:** Not found in any `package.json`. Must be added to both `customer-backend/package.json` (server-side parsing/validation) and `vendorpanel/package.json` (client-side preview/format detection).

### D. MedusaJS Route Patterns

**Vendor route authentication (from `backend/apps/backend/src/api/vendor/middlewares.ts`):**
- `/vendor/*` routes use `authenticate('seller', ['bearer', 'session'])` middleware
- Seller routes require `checkSellerApproved` middleware
- Routes under `/vendor/consumer-seller/` currently have NO specific middleware registration — they'd inherit the global `/vendor/*` auth but aren't explicitly listed in the middleware array.
- Consumer-seller routes need to be added to the middleware spread or have their own middleware file.

**Vendor product route pattern (from `backend/apps/backend/src/api/vendor/products/middlewares.ts`):**
- Uses `multer` for file uploads (memory storage)
- Uses `validateAndTransformBody` / `validateAndTransformQuery` from MedusaJS framework
- Uses `filterBySellerId()` for ownership checks
- Uses `checkConfigurationRule` for feature flags

**File upload in backend:**
- `multer` with `memoryStorage()` is already used in vendor products middleware for imports
- The existing import flow uses `parseProductCsvStep` which expects file content as a string

### E. Fuzzy Matching Feasibility

**Existing search endpoint:** `GET /api/catalog/cards/search` in customer-backend uses `ILIKE` pattern matching (`%query%`) — not trigram similarity. This is a basic substring search, not fuzzy matching.

**Existing commerce integration matching:** `POST /api/commerce/match-product` in customer-backend does SKU-exact match first, then falls back to `ILIKE` fuzzy match by product name. No `word_similarity()` usage.

**Trigram infrastructure:**
- `pg_trgm` extension: enabled via migration on sidedecked-db
- GIN trigram index: exists only on `card_translations.translatedNormalizedName`
- No GIN index on `cards.normalizedName` — needs a new migration

**Cards table size:** Unknown at runtime (no production access), but the entity structure supports multi-game catalogs (MTG, Pokemon, Yu-Gi-Oh!, One Piece). Estimated scale: MTG alone has ~30,000 unique cards × multiple printings. Across all games, likely 50,000-100,000 card rows. With GIN index, `word_similarity()` queries should perform well at this scale.

**Batch endpoint feasibility:** The existing `/api/catalog/cards/search` handles one query at a time. A batch fuzzy match endpoint (`POST /api/catalog/cards/fuzzy-match/batch`) is straightforward to implement — accept an array of card names, run `word_similarity()` queries against the GIN-indexed column, return results grouped by input name. Can be done in a single database round-trip using `LATERAL JOIN` or `unnest()` for optimal performance.

---

## Design Decisions

### Condition 1: Consumer-Seller Products API Scope

**Decision:** The stub at `/vendor/consumer-seller/products` is NOT the right path. The working listing creation endpoint at `/store/consumer-seller/listings` proves the pattern. The bulk import confirm route (`POST /vendor/consumer-seller/bulk-import/:importId/confirm`) will call `createProductsWorkflow` directly using the same pattern, not call the stub endpoint.

**Impact:** No need to "complete" the stub. The confirm route IS the listing creation path for bulk import. The stub can remain as-is (it's out of scope for S01).

### Condition 2: Cross-Service Data Contract

**Decision:** The fuzzy match batch endpoint returns enriched card data. For each matched card, customer-backend returns:

```typescript
interface FuzzyMatchResult {
  inputName: string          // the seller's card name from CSV
  matches: Array<{
    cardId: string           // cards.id
    cardName: string         // cards.name
    normalizedName: string   // cards.normalizedName
    gameCode: string         // games.code
    similarity: number       // word_similarity() score
    prints: Array<{
      printId: string        // prints.id
      setCode: string        // card_sets.code
      setName: string        // card_sets.name
      collectorNumber: string
      rarity: string
      imageNormal: string | null
      catalogSkus: Array<{
        sku: string          // catalog_skus.sku (the key for listing creation)
        conditionCode: string
        languageCode: string
        finishCode: string
        marketPrice: number | null
      }>
    }>
  }>
  bestMatch: { ... } | null  // top match if score >= threshold
  tier: 'auto' | 'fuzzy' | 'unmatched'
}
```

For listing creation, the backend needs from the match result:
- `catalogSku.sku` → maps to `catalog_sku` in `createProductsWorkflow`
- `card.name` → listing `title`
- `print.setName`, `print.collectorNumber` → listing `subtitle`
- `print.imageNormal` → listing `thumbnail`/`images`
- Seller-provided: `condition`, `price`, `quantity`

### Condition 3: Batch Matching Endpoint

**Decision:** Implement `POST /api/catalog/cards/fuzzy-match/batch` accepting up to 500 card names per request. The backend chunks 2,400 cards into batches of 500 and makes ~5 HTTP calls to customer-backend instead of 2,400.

**Implementation:** Single SQL query per batch using `unnest()` + `LATERAL JOIN`:
```sql
SELECT input.name AS input_name,
       c.id, c.name, c."normalizedName",
       word_similarity(input.name, c."normalizedName") AS score
FROM unnest($1::text[]) AS input(name)
CROSS JOIN LATERAL (
  SELECT c.* FROM cards c
  WHERE c."normalizedName" % input.name
  ORDER BY word_similarity(input.name, c."normalizedName") DESC
  LIMIT 5
) c
```

This uses the `%` operator (which uses the GIN index) for pre-filtering, then `word_similarity()` for scoring. ~5 DB queries for 2,400 cards.

### Condition 4: Matching Target Column

**Decision:** Match against `cards.normalizedName` (English) for MVP. TCGPlayer and Crystal Commerce exports are in English. Multi-language matching via `card_translations.translatedNormalizedName` is a future enhancement.

**Action needed:** New migration to create GIN trigram index on `cards.normalizedName`:
```sql
CREATE INDEX "idx_cards_normalized_name_trgm"
ON "cards" USING gin("normalizedName" gin_trgm_ops);
```

### Condition 5: Import State Storage

**Decision:** In-memory with `Map<string, ImportState>` keyed by `importId`. Rationale:
- Import is a wizard flow — seller stays on page during the whole process
- If server restarts mid-import, seller simply re-uploads (CSV is still on their machine)
- No Redis/DB overhead for MVP
- Add a `maxImportAge` TTL (30 minutes) to prevent memory leaks
- Document this limitation in the UI: "Import progress is not saved. Do not close this page."

### Condition 6: Sync vs. Async Matching

**Decision:** Synchronous with chunked processing. For 2,400 cards with batch endpoint (500/batch), that's 5 HTTP calls. At ~200ms per batch query (GIN-indexed), total match time is ~1-2 seconds. Well within HTTP timeout.

**Fallback:** If match time exceeds 30 seconds (e.g., much larger CSV), the endpoint returns partial results with a `status: 'processing'` and the frontend polls. But this is not expected for the MVP target.

### Condition 7: Max CSV Size

**Decision:** 5,000 rows hard limit. Error message for larger files: "CSV exceeds the maximum of 5,000 cards. Please split your file into smaller batches."

**Enforcement:** Client-side check after papaparse parse (immediate feedback), server-side validation on upload.

### Condition 8: Concurrent Imports

**Decision:** Single active import per seller. If a seller uploads a new CSV while one is in review, the old import is discarded. Rationale:
- Simplifies state management (one `importId` per seller)
- Avoids confusion about which import is active
- Sellers can re-upload anytime — no lost work since CSV is local

### Condition 9: Partial Failure Strategy

**Decision:** Skip-and-report. The confirm endpoint processes listings sequentially (or in small concurrent batches of 5-10). For each listing:
- Success → record `{sku, productId, status: 'created'}`
- Failure → record `{sku, error, status: 'failed'}`
- Skip → record `{sku, status: 'skipped'}` (seller chose to skip)

The response includes a summary: `{created: N, failed: N, skipped: N, details: [...]}`. Failed items can be retried individually in a future enhancement.

### Condition 10: Review Step UX Specifics

**Decision:**
- **Candidates per fuzzy match:** Top 3 candidates (sorted by similarity score descending)
- **Selection mechanism:** Radio buttons within each fuzzy card row. Pre-select the top candidate. "None of these" option to move card to unmatched.
- **Pagination:** Virtualized list (react-window or similar) for performance with large lists. Show count per tab: "Auto-matched (2,040)", "Review (240)", "Unmatched (120)".
- **Unmatched tab search:** Reuse existing `useCardSearch` hook (hits customer-backend `/api/catalog/cards/search`). Inline search per unmatched row — click "Search" button, type to search catalog, select a result.
- **Candidate display:** Card name, set name, collector number, small image thumbnail (from `print.imageNormal`), game badge, similarity score as percentage.
- **Bulk actions:** "Approve all auto-matches" button (pre-checked). "Skip all unmatched" button.

### Condition 11: Test Fixture Data

**Decision:** Generate a synthetic TCGPlayer CSV with 2,400 rows using real card names from the catalog. Script:
1. Query `cards.name` from sidedecked-db (or from a static export)
2. Format as TCGPlayer export columns: `TCGplayer Id`, `Product Line`, `Set Name`, `Product Name`, `Title`, `Number`, `Rarity`, `Condition`, `TCG Market Price`, `TCG Direct Low`, `TCG Low Price`, `TCG Low Price + Shipping`, `Quantity`, `Add to Quantity`, `My Price`
3. Mix in: 80% exact name matches, 10% slightly misspelled names (fuzzy), 10% non-existent names (unmatched)
4. Include edge cases: BOM, quoted fields with commas, Unicode characters, empty rows

---

## Design/Plan Gate — Panel Review

**Date:** 2026-03-16
**Story:** S01 — CSV Inventory Import & Catalog Matching
**Research:** S01-RESEARCH.md (this file)
**Reviewers:** Sally (Tech Lead), John (QA), Mary (Frontend), Winston (Architecture), Amelia (Product)

### Sally (Tech Lead) — Approach Viability

The critical discovery here is that the story referenced a stub endpoint as the listing creation path, but a fully working implementation exists at `/store/consumer-seller/listings`. The research confirms `createProductsWorkflow` from MedusaJS core-flows is the right way to create products, and it's already proven in production code. The design decision to call this workflow directly from the bulk import confirm route — rather than trying to complete the stub or route through HTTP — is sound engineering. You get the same transactional guarantees as the single-listing flow without an extra network hop.

The batch fuzzy match design using `unnest()` + `LATERAL JOIN` with `word_similarity()` is the right SQL pattern for this. The `%` operator leverages the GIN index for pre-filtering, keeping the query plan efficient. Five HTTP calls to customer-backend for 2,400 cards is a massive improvement over 2,400 serial calls. The 500-per-batch size gives room for the query to stay under 50ms per card while keeping the number of round-trips low.

I'm satisfied with the in-memory state decision for MVP. The import wizard is a single-session flow. Adding Redis persistence would add complexity without solving a real user problem — if the server restarts, the seller re-uploads. The 30-minute TTL is a sensible guard against memory leaks.

**Risk areas:** The GIN trigram index migration is new and the `word_similarity()` function hasn't been used in the codebase before. The threshold tuning (0.5 for auto, 0.8 for fuzzy cutoff) is unvalidated. These thresholds should be configurable, not hardcoded — the research recommends this and I agree. We'll need to test with real catalog data to tune them.

**Data model fit:** The CatalogSKU entity is the perfect bridge. The CSV match flow produces a card → print → CatalogSKU chain, and the CatalogSKU.sku string is exactly what the listing creation workflow expects as `catalog_sku`. The data model was designed for this.

**Verdict: PASSED.** The approach is technically viable. The discovery of the working listings endpoint resolves the biggest blocker identified in the readiness gate. The batch matching design and cross-service data contract are well-specified.

### John (QA) — Verification Strategy

The research resolves several of my readiness gate concerns. The cross-service data contract is now specified — I can see exactly what fields flow from customer-backend to backend and what the listing creation expects. The batch endpoint design means I'm testing 5 HTTP calls, not 2,400, which simplifies integration test scenarios.

**Test fixture data:** The plan to generate a synthetic TCGPlayer CSV with 80/10/10 distribution (auto/fuzzy/unmatched) is testable. I want the generation script committed to the repo so it's reproducible. I'd also want a small fixture (20 rows) for unit tests and the full 2,400-row fixture for integration testing.

**Edge cases I want covered:**
- CSV with BOM (byte order mark) — explicitly in acceptance criteria, good
- CSV with only header row (zero data rows) — returns empty results, not an error
- CSV with all duplicate card names — each row should match independently
- Card name with Unicode (Japanese card names from TCGPlayer) — `word_similarity()` should handle this but needs verification
- Partial failure during confirm: the skip-and-report strategy is testable — I can verify the summary counts

**Verification strategy completeness:** The acceptance criteria cover format detection, parsing edge cases, fuzzy match tiers, and API endpoints. The definition of done includes unit tests for parser and match endpoint. What's missing is explicit verification of the error states — what does the seller see when:
1. The CSV is empty (only headers)?
2. Matching returns zero results for all cards?
3. The confirm step fails for card N of 2,400?

These should be documented in the plan's task-level ACs.

**One concern:** The story's AC says "creates real listings via the existing consumer-seller products API" but the design uses `createProductsWorkflow` directly. This is technically a deviation from the AC's letter, though it achieves the same outcome. The AC should be updated to reflect the actual approach: "creates real listings via `createProductsWorkflow`."

**Verdict: PASSED.** The verification strategy is solid. Edge cases are identifiable and testable. The test fixture plan is reproducible. Minor: update the AC to match the actual listing creation approach.

### Mary (Frontend) — UI Approach

The vendorpanel already has the exact patterns I need:
- `ProgressTabs` wizard in `product-create-listing` — three steps with tab state management
- `FileUpload` component with drag-and-drop — already handles CSV format
- `UploadImport` component — CSV-specific upload with error handling
- `useCardSearch` hook — existing catalog search integration
- `customerBackendFetch` — API client to customer-backend

The design decisions for the review step are now specific enough to implement:
- Top 3 candidates per fuzzy match with radio selection — I can use Medusa UI's `RadioGroup` inside a table row
- Virtualized list for large result sets — `react-window` is a standard choice, and we can add it as a dependency
- Inline search for unmatched cards using the existing `useCardSearch` hook — no new search infrastructure needed
- Tab counts ("Auto-matched (2,040)", "Review (240)", "Unmatched (120)") — straightforward from the match results

The "Approve all auto-matches" and "Skip all unmatched" bulk actions simplify the happy path. For a seller with 2,400 cards where 85% auto-match, they upload, click "Approve all," review 240 fuzzy matches, skip unmatched, and confirm. That's a good UX flow.

**Concern:** The research proposes client-side CSV parsing with papaparse for format detection and preview. This means the seller gets immediate feedback on format detection without a server round-trip. But the acceptance criteria only cover server-side parsing. I'd recommend: client-side parsing for format detection + row count preview, server-side parsing for validation and the actual match step. This split is natural with papaparse since it works in both environments.

**Risk:** The `react-window` virtualization adds a dependency that doesn't exist in vendorpanel today. For 240 fuzzy match rows (the typical "Review" tab size), standard rendering with pagination (50 per page) might be sufficient without virtualization. I'd implement pagination first and add virtualization only if performance is an issue.

**Verdict: PASSED.** The UI approach is buildable with existing patterns. The review step UX decisions are specific enough for task estimation. The multi-step wizard, file upload, and catalog search patterns are all proven in the codebase.

### Winston (Architecture) — Cross-Service Integration

The split-brain flow is now fully specified:

1. **Upload:** CSV → backend (multipart upload, stored in-memory as parsed rows)
2. **Match:** Backend chunks parsed names → HTTP POST to customer-backend `/api/catalog/cards/fuzzy-match/batch` → customer-backend queries sidedecked-db with `word_similarity()` → returns enriched match results
3. **Review:** Backend stores match results in-memory → vendorpanel fetches via REST → seller reviews/confirms
4. **Confirm:** Backend iterates confirmed matches → calls `createProductsWorkflow` directly (same Node process) → writes to mercur-db → returns success/failure summary

No direct cross-database queries anywhere in this flow. The only cross-service HTTP call is backend → customer-backend for the fuzzy match batch, which is the correct pattern per project architecture.

**Data consistency concern:** The match results include `catalogSku.sku` from sidedecked-db, which is stored in the listing's metadata in mercur-db. If a CatalogSKU is deleted or modified between match time and confirm time, the listing could reference a stale SKU. For MVP, this is an acceptable risk — the time window between match and confirm is minutes, and SKU deletions are rare. A production hardening step would validate the SKU still exists before creating the listing.

**Seller identity resolution:** The vendor panel uses seller auth (`authenticate('seller', ['bearer', 'session'])`). The bulk import routes need to be under `/vendor/` to inherit this middleware. The confirm step needs the seller ID to pass to `createProductsWorkflow` as `additional_data.seller_id`. The existing pattern (using `fetchSellerByAuthActorId` or `fetchConsumerSellerByCustomerId`) handles this. However, the vendorpanel currently uses bearer/session auth for the backend, not for customer-backend. The customer-backend fuzzy match batch endpoint should be unauthenticated (it's a catalog query, not a seller-specific operation) or protected by `SERVICE_API_KEY` for backend-to-backend calls.

**The batch endpoint on customer-backend should use `SERVICE_API_KEY` auth** (the same pattern used in `authenticateServiceKey` middleware for the search reindex endpoint). This prevents public internet access to a potentially expensive batch query while allowing backend-to-backend calls.

**Verdict: PASSED.** The cross-service integration is architecturally sound. The data flow respects the split-brain boundary. The batch endpoint reduces HTTP overhead to 5 calls. The in-memory state is appropriate for the wizard flow. The stale-SKU risk is documented and acceptable for MVP.

### Amelia (Product) — User Value & Tradeoffs

The user flow is compelling: upload CSV → see instant format detection → watch matching progress → review auto-matched cards (bulk approve) → resolve fuzzy matches (pick the right card from 3 candidates) → skip or search for unmatched → confirm → see listing creation progress. For a seller with 2,400 TCGPlayer cards, this turns hours of manual listing into a 10-minute process.

**The 85/10/5 ratio concern:** The story assumes 85% auto-match, 10% fuzzy, 5% unmatched. This is unvalidated. If the actual ratio is 50/30/20, the review step becomes much more work — 720 fuzzy matches each needing manual review. The configurable threshold (condition 4) is the right mitigation. If we find the auto-match tier is too small, we lower the threshold from 0.8 to 0.75.

**Error states are now specified:**
- Empty CSV (headers only) → "No card data found in the file"
- All unmatched → review step shows full unmatched tab, no auto-matches
- Partial confirm failure → summary with created/failed/skipped counts, seller can see which items failed

**Tradeoff I accept:** Single active import per seller is fine for MVP. Most sellers will complete one import before starting another. The UX should show "You have an import in progress" if they try to start a second one, with a "Start new import" option that discards the old one.

**Tradeoff I want flagged:** The 5,000-row limit is a product constraint, not a technical one. Some sellers may have larger inventories (e.g., game stores with 10,000+ cards across multiple games). We should track import sizes to see if this limit needs raising post-launch.

**Scope concern:** This is still a large slice — three repos, CSV parsing, fuzzy matching, batch endpoint, 4+ backend routes, multi-step wizard UI, listing creation. I counted at least 8 distinct tasks in the design. The planning phase must decompose this carefully. Shipping velocity depends on task boundaries being tight and independently testable.

**Verdict: PASSED.** The approach delivers clear user value. The tradeoffs are documented and acceptable for MVP. The review step UX is now specific enough to avoid scope creep during implementation.

### Panel Summary

| Reviewer | Role | Verdict | Key Point |
|----------|------|---------|-----------|
| Sally | Tech Lead | PASSED | Working listings endpoint found; batch matching design is sound |
| John | QA | PASSED | Test fixtures reproducible; verification strategy complete; update AC |
| Mary | Frontend | PASSED | Existing patterns cover all UI needs; pagination over virtualization |
| Winston | Architecture | PASSED | Split-brain flow clean; SERVICE_API_KEY for batch endpoint |
| Amelia | Product | PASSED | User value clear; scope is large but justified; track import sizes |

**Overall Verdict: PASSED**

---

## Distilled Findings

**Verdict: PASSED** — All five reviewers passed. The approach is technically viable, architecturally sound, and delivers clear user value.

**Critical Discovery:** The consumer-seller products API stub (`/vendor/consumer-seller/products`) is irrelevant. A fully working listing creation endpoint exists at `/store/consumer-seller/listings` using `createProductsWorkflow` from MedusaJS core-flows. The bulk import confirm route will call this workflow directly.

**Key Findings:**
1. `createProductsWorkflow` is the proven product creation path. The bulk import confirm step calls it directly, same pattern as the working `/store/consumer-seller/listings` endpoint.
2. `CatalogSKU.sku` is the cross-service bridge — produced by the match step (sidedecked-db), consumed by listing creation (mercur-db metadata).
3. Batch fuzzy match via `unnest()` + `LATERAL JOIN` + GIN index reduces 2,400 HTTP calls to ~5. New GIN index migration needed on `cards.normalizedName`.
4. Match against `cards.normalizedName` (English-only) for MVP. The `card_translations` GIN index already exists for future multi-language support.
5. In-memory import state with 30-minute TTL. No Redis needed for MVP.
6. Synchronous matching (~1-2 seconds for 2,400 cards with batch endpoint). No background jobs needed.
7. papaparse not installed — needs adding to both `customer-backend` and `vendorpanel`.
8. All vendorpanel patterns needed are already proven: `ProgressTabs` wizard, `FileUpload` component, `useCardSearch` hook, `customerBackendFetch` client.

---

## Design Constraints for Planning

These constraints are binding on the S01 plan:

1. **Listing creation:** Call `createProductsWorkflow` directly from the bulk import confirm route. Do NOT use the stub at `/vendor/consumer-seller/products`. Follow the pattern in `backend/apps/backend/src/api/store/consumer-seller/listings/route.ts`.

2. **Cross-service data contract:** The fuzzy match batch endpoint returns card ID, name, game code, print details (set, number, rarity, image), and CatalogSKU details (sku string, condition, price). The `CatalogSKU.sku` string is the cross-reference key for listing creation.

3. **Batch matching:** `POST /api/catalog/cards/fuzzy-match/batch` accepts up to 500 names per request. Backend chunks and parallelizes. SQL uses GIN-indexed `%` operator for pre-filtering + `word_similarity()` for scoring.

4. **New migration required:** GIN trigram index on `cards."normalizedName"` in customer-backend. The `pg_trgm` extension is already enabled.

5. **Match target:** `cards.normalizedName` only (English). Not `card_translations.translatedNormalizedName`.

6. **State storage:** In-memory `Map<string, ImportState>` with 30-minute TTL. One active import per seller.

7. **Max CSV:** 5,000 rows. Client-side + server-side enforcement.

8. **Thresholds:** Auto ≥ 0.8, fuzzy 0.5–0.79, unmatched < 0.5. Stored in config, not hardcoded.

9. **Partial failures:** Skip-and-report with summary counts `{created, failed, skipped}`.

10. **Frontend patterns:** Use `ProgressTabs`, `FileUpload`, `useCardSearch`, `customerBackendFetch`, `react-hook-form` + Zod, Medusa UI components. Pagination (not virtualization) for review lists.

11. **Customer-backend batch endpoint auth:** Protect with `SERVICE_API_KEY` via `authenticateServiceKey` middleware (existing pattern).

12. **Vendor route middleware:** Bulk import routes under `/vendor/consumer-seller/bulk-import/` need explicit middleware registration in `backend/apps/backend/src/api/vendor/middlewares.ts` or their own middleware file.

13. **Dependencies to install:** `papaparse` + `@types/papaparse` in both `customer-backend` and `vendorpanel`.

14. **Test fixtures:** Generate synthetic TCGPlayer CSV (2,400 rows) with 80/10/10 auto/fuzzy/unmatched distribution. Small fixture (20 rows) for unit tests.

15. **AC update needed:** Change "creates real listings via the existing consumer-seller products API" to "creates real listings via `createProductsWorkflow` (same pattern as `/store/consumer-seller/listings`)."
