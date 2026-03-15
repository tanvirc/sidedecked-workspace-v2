---
id: S01
milestone: M002
status: draft
---

# S01: CSV Inventory Import & Catalog Matching — Context

## Goal

A business seller uploads a CSV file in the vendor panel and gets real marketplace listings created from it — with automatic catalog matching, confidence-tiered review, and manual resolution for ambiguous or unmatched cards.

## Why this Slice

S01 is the highest-risk slice in M002 and has no dependencies on other slices. It retires two of the milestone's top risks simultaneously: CSV format detection ambiguity and pg_trgm fuzzy matching calibration. It also proves the split-brain listing creation path (matching in sidedecked-db, listing creation in mercur-db) which S04's integration proof depends on. Getting this right first de-risks the rest of the milestone.

## Scope

### In Scope

- CSV parser service supporting TCGPlayer, Crystal Commerce, and manual/SideDecked formats
- Format detection via marker columns (`TCGplayer Id`, `Category`, fallback)
- Fuzzy match endpoint using pg_trgm `word_similarity()` against `cards.normalizedName`
- GIN trigram index migration on `cards.normalizedName`
- Confidence tier classification: auto (≥0.8), fuzzy (0.5–0.79), unmatched (<0.5)
- Backend bulk import API routes (upload, match, results, confirm)
- Vendor panel bulk import wizard UI (upload, review with tabs, confirm)
- Listing creation via existing consumer-seller products API

### Out of Scope

- Price anomaly detection on newly created listings (S03)
- Trust score display on listings (S03)
- Background job infrastructure for large CSV processing (open question — may be synchronous for MVP)
- Retry/resume for interrupted imports
- Inventory quantity tracking or stock management
- Multi-format export or re-export

## Repos Touched

| Repo | Role | Key Changes |
|------|------|-------------|
| **customer-backend** | Matching engine | CSV parser service, fuzzy match endpoint, trigram index migration |
| **backend** | Import orchestration | Bulk import API routes, import state management, listing creation via consumer-seller products API |
| **vendorpanel** | Seller UI | Bulk import wizard: upload step, review page (auto/fuzzy/unmatched tabs), confirm step |

## Split-Brain Considerations

This slice spans both databases. Card matching happens in sidedecked-db where the catalog lives (Card, Print, CatalogSKU entities). Listing creation happens in mercur-db via the consumer-seller products API. The two systems never share a database connection.

Data flow: CSV → backend (upload) → customer-backend (parse + match against sidedecked-db) → backend (store results, present to UI) → backend (confirm → call consumer-seller products API → write to mercur-db).

The confirm step is the critical split-brain boundary. Each listing is created individually via the existing products API. Partial failures are possible — if card 500 of 2,000 fails, the first 499 listings exist in mercur-db but the import is incomplete. The handling strategy for this is an open question.

## Key Technical Dependencies

- **pg_trgm** — PostgreSQL extension, already enabled on sidedecked-db. Provides `word_similarity()` function and GIN index operator class `gin_trgm_ops`. Needs a migration to create the index on `cards.normalizedName`.
- **papaparse** — CSV parsing library (D039). Works in both browser and Node. Used for format detection, column mapping, and row parsing. The vendor panel can use it client-side for instant preview; the backend uses it server-side for validation.
- **Consumer-seller products API** — Existing `POST /vendor/consumer-seller/products` endpoint in backend. This is the only permitted path for creating listings. The bulk import confirm step calls this for each confirmed card.
- **cards.normalizedName** — Column already exists in sidedecked-db. Contains lowercased, whitespace-normalized card names. This is the target column for trigram matching.

## Integration Points

- **customer-backend → backend:** The backend's bulk import routes call customer-backend's `GET /api/catalog/cards/fuzzy-match` endpoint to perform catalog matching. This is a cross-service HTTP call, not a shared database query.
- **backend → mercur-db:** The confirm step uses the existing consumer-seller products API internally to create listings. This writes to mercur-db through MedusaJS workflows.
- **vendorpanel → backend:** The vendor panel UI calls the backend's bulk import API routes. Standard TanStack Query pattern with the existing Medusa JS SDK or custom API client.

## Risks

- **CSV format detection ambiguity** — TCGPlayer and Crystal Commerce exports may have overlapping column names. The marker-column approach (`TCGplayer Id` for TCGPlayer, `Category` for Crystal Commerce) needs validation against real export files. If markers aren't reliable, format detection could misparse entire files.
- **pg_trgm threshold tuning** — The 0.5 initial threshold (D040) is conservative and unvalidated. Too low → too many fuzzy matches overwhelm the review UI. Too high → too many unmatched cards. Needs calibration with real inventory data. Threshold is configurable, not hardcoded.
- **Partial batch failures during confirm** — Creating 2,400 listings individually via the products API has no transactional guarantee across the batch. Network errors, validation failures, or duplicate detection could leave the import in an inconsistent state. Strategy TBD.
- **Large CSV performance** — The match step sends each card name to the fuzzy match endpoint individually. For 2,400 cards, that's 2,400 HTTP calls (or a batch endpoint). Synchronous processing may time out. Background job adds complexity.

## Prior Art in Codebase

- `cards.normalizedName` column exists in sidedecked-db — the fuzzy match target
- pg_trgm extension is enabled on sidedecked-db — no extension installation needed, just the GIN index migration
- Consumer-seller products API exists at `POST /vendor/consumer-seller/products` — proven listing creation path
- Vendor panel has existing file upload components and TanStack Query hooks
- `uploadFilesWorkflow` pattern exists in backend for file handling
- No prior CSV parsing, format detection, or trigram matching code exists anywhere in the codebase

## Open Questions

- Import state storage: in-memory (simple, loses state on restart) vs Redis-backed (durable, adds complexity)?
- Match step execution: synchronous HTTP calls (simple, may time out) vs background job with polling (durable, more infrastructure)?
- Partial failure strategy: skip failures and report (simple) vs transactional rollback (complex, may not be feasible across services)?
- Maximum supported CSV file size and row count?

---

## Readiness Gate — Panel Review

**Date:** 2026-03-16
**Story:** S01 — CSV Inventory Import & Catalog Matching
**Reviewers:** Bob (Backend), Mary (Frontend), John (QA), Winston (Architecture), Amelia (Product)

### Bob (Backend Lead) — CONDITIONAL

The story describes four backend API routes for bulk import (upload, match, results, confirm) under `/vendor/consumer-seller/bulk-import/`. The route structure is clean and follows MedusaJS v2 API conventions already established in the vendor namespace. Multipart CSV upload on the upload route, JSON for the rest — straightforward. However, I have a critical concern about the consumer-seller products API dependency. I inspected `backend/apps/backend/src/api/vendor/consumer-seller/products/route.ts` and it is **a mock stub** — it returns hardcoded data, does not write to Medusa product tables, and has multiple TODO comments including "Implement proper seller authentication middleware" and "Store in actual Medusa product tables." The story says "creates real listings via the existing consumer-seller products API" and constraint says "Must use the existing consumer-seller products API" — but that API does not actually function yet. This is not a minor gap; it's the entire listing creation path. Either S01 must include completing that endpoint as part of its scope, or it must be completed beforehand as a prerequisite.

The match step design concerns me as well. Calling customer-backend's fuzzy match endpoint once per card name means 2,400 HTTP round-trips for the target CSV size. The story doesn't specify a batch endpoint. We need to decide during planning whether to implement `POST /api/catalog/cards/fuzzy-match/batch` accepting an array of names, or accept the single-call approach with concurrency control. The synchronous vs. background job question is a design decision, not a blocker — in-process with chunked responses works fine for MVP.

Import state storage (in-memory vs Redis) is also a design decision. For MVP, in-memory with a warning that state is lost on restart is acceptable — this is a wizard flow, not a long-running background process. I'd resolve this during planning, not block on it.

**Assessment: CONDITIONAL** — The consumer-seller products API must be a real, functioning endpoint before or during S01. This needs to be explicitly scoped. The batch matching question can be resolved during design.

### Mary (Frontend Lead) — CONDITIONAL

The vendor panel scope is well-defined: three-step wizard (upload, review, confirm) with tabbed review for auto/fuzzy/unmatched. The existing `vendorpanel/src/routes/products/product-import/` components give us a file upload pattern to build on, and TanStack Query hooks are well-established in the codebase (45+ existing hooks in `src/hooks/api/`). Medusa UI components, react-hook-form, and Zod validators are all standard patterns. The UI structure is plannable.

My concerns are around the review step UX, which is the most complex part of this frontend. The fuzzy match tab needs to show "the seller's card name alongside catalog candidates for manual selection" — but the story doesn't specify how many candidates per card, whether candidates include card images or just names, or how the seller makes a selection (radio buttons? click-to-select?). For 2,400 cards with potentially 10% fuzzy (240 cards) each showing multiple candidates, the review UI needs pagination or virtualized scrolling. None of this is specified in the acceptance criteria.

The unmatched tab allows "search the catalog and manually assign a match or skip" — this implies a search component inside the import wizard. Does this hit an existing search endpoint (Algolia?) or the fuzzy match endpoint with a lower threshold? The search UX pattern needs clarity.

I also note the story says CSV parsing happens with papaparse both client-side (preview) and server-side (validation). The acceptance criteria only cover server-side parsing. If we're doing client-side parsing for preview, that's additional frontend work that should be explicit in the story. If not, we should clarify that parsing is server-side only with client-side limited to file upload.

**Assessment: CONDITIONAL** — The review step UX needs more specificity before planning can produce accurate task estimates. The candidate display format, selection mechanism, and pagination/virtualization approach should be outlined. These can be resolved during planning with design decisions, not user input.

### John (QA Lead) — CONDITIONAL

The acceptance criteria are mostly testable and specific — format detection by marker columns, BOM handling, similarity tiers with numeric thresholds, API endpoints with clear inputs/outputs. Good. I can write test cases against these. The definition of done includes unit tests for both the parser and the match endpoint, which is appropriate.

My main concern is the end-to-end acceptance criterion: "A 2,400-card TCGPlayer CSV processes successfully through the full pipeline." This is an integration test that requires all three services running simultaneously — customer-backend for matching, backend for the import API and listing creation, and vendorpanel for the UI. The definition of done says "Integration test procedure documented (steps to prove the full pipeline with running services)" — which means manual verification, not automated. That's pragmatic for an integration of this complexity, but I want to make sure we have a real TCGPlayer CSV fixture to test with. Do we have one? The story references 2,400 cards as a target but doesn't mention test data availability.

Edge cases I want to see covered in unit tests: CSV with zero data rows (only headers), CSV with duplicate card names, CSV where every card is unmatched (empty catalog), CSV where every card auto-matches (saturated catalog), card names with Unicode characters (Japanese card names?), and the BOM/trailing comma/quoted newline cases already listed. The acceptance criteria cover some of these but not all. I'd add the zero-row and duplicate cases explicitly.

The partial failure scenario during confirm is a testability concern too. If we skip failures, we need a way to verify which listings were created and which failed. The results endpoint should report this state. Currently the story doesn't have an AC for partial failure reporting.

**Assessment: CONDITIONAL** — Need confirmation that test fixture data (real TCGPlayer CSV) exists or will be created. Need explicit AC for partial failure reporting during confirm. Both are resolvable during planning.

### Winston (Architecture) — CONDITIONAL

The split-brain flow is well-articulated: CSV → backend → customer-backend (sidedecked-db match) → backend → consumer-seller API (mercur-db write). The data flow diagram in the context file correctly identifies the confirm step as the critical split-brain boundary. No direct cross-DB connections, API calls only. That's architecturally sound.

Three architectural concerns. First, the consumer-seller products API is a stub. This is the split-brain write path — the only way data gets from the matching side (sidedecked-db) into the marketplace side (mercur-db). If this doesn't work, the entire pipeline is broken at the last step. I agree with Bob that this must be scoped. More importantly, the stub shows a `catalog_sku` field as the cross-reference key. We need to verify that the `CatalogSKU` entity in sidedecked-db actually maps to something the backend can use for listing creation. The cross-service data contract (what fields does backend need from customer-backend to create a listing?) is not specified anywhere in this story.

Second, performance at scale. The story targets 2,400 cards and the milestone says "2,400 card CSV imports in < 5 minutes." For the match step, even with a batch endpoint, 2,400 trigram queries against a GIN index is nontrivial. We need to understand the cards table size — if it's 100K cards, performance will differ dramatically from 10M cards. The p95 < 100ms API response time constraint from project-context.md applies to user-facing endpoints, but the match endpoint will be called internally. We should establish separate performance expectations for the import pipeline.

Third, the existing trigram index is on `card_translations.translatedNormalizedName`, not on `cards.normalizedName`. The story says a new GIN index migration on `cards.normalizedName` is needed — that's correct and the story accounts for it. But we should consider whether matching should target `normalizedName` on `cards` or `translatedNormalizedName` on `card_translations` (or both). If sellers have cards with names in different languages, matching only against `cards.normalizedName` (English) would miss translations. This is a design question worth raising.

**Assessment: CONDITIONAL** — The cross-service data contract for listing creation must be defined. The consumer-seller products API must be real. The matching target column decision (cards vs. card_translations) should be resolved during design.

### Amelia (Product) — CONDITIONAL

The user story is clear and compelling: a seller with 2,400 TCGPlayer cards can get them listed without entering each one manually. The three-tier confidence approach (auto/fuzzy/unmatched) is smart — it minimizes seller effort for the 85% auto-match case while giving control for edge cases. This is the supply-side bootstrap weapon mentioned in the milestone context, and I agree it should be S01.

Scope is large — three repos, CSV parsing, fuzzy matching, four API routes, and a multi-step wizard UI. That said, the work is vertically integrated: you can't ship half of it and get user value. A seller can't use CSV upload without matching, can't use matching without the review UI, and can't use the review UI without listing creation. So the scope is justified, but it means this is a chunky slice. I'd want the planning phase to decompose it into at least 6-8 tasks with clear boundaries so we can track progress and course-correct.

The acceptance criteria cover the happy path well. I'd like to see two things added. First, what happens when a seller uploads a second CSV while a previous import is still in review? Can they have multiple active imports, or is it one-at-a-time? Second, the definition of done doesn't mention any user-facing error states — what does the seller see if the CSV is malformed, if matching fails for the whole file, or if the confirm step partially fails? Error communication is part of the product experience.

The open question about maximum CSV file size should be decided before planning: it affects the entire architecture (in-memory vs. queued, sync vs. async). I'd propose 5,000 rows as the MVP ceiling with a clear error message for larger files. This is a product decision, not a technical one.

**Assessment: CONDITIONAL** — Scope is justified but large. Need a decision on concurrent imports (single-active or multi), error state UX, and max CSV size ceiling. These are quick product decisions that can be made at the start of planning.

### Distilled Findings

**Overall Verdict: CONDITIONAL**

All five reviewers assessed CONDITIONAL. No blockers that require external user decisions — all conditions are resolvable during the planning/design phase.

**Key Findings:**

- The consumer-seller products API (`POST /vendor/consumer-seller/products`) is a non-functional stub with TODO comments. It does not create real Medusa products. This is the listing creation path the entire pipeline depends on. S01 must either include completing this endpoint or declare it a prerequisite.
- The cross-service data contract (what fields does the backend need from customer-backend to create a listing via the products API) is not defined anywhere in the story or context.
- The existing trigram GIN index is on `card_translations.translatedNormalizedName`, not `cards.normalizedName`. The story correctly identifies the need for a new index, but the matching target column (cards vs. card_translations) is a design decision with product implications (multi-language support).
- The match step implies 2,400 individual HTTP calls to customer-backend. A batch endpoint should be designed during planning to avoid timeout and performance issues.
- The review step UX (candidate display, selection mechanism, pagination/virtualization for 240+ fuzzy matches) needs specificity before task estimation.
- Test fixture data (a real or representative TCGPlayer CSV with 2,400 rows) must be sourced or generated.
- Several product decisions are needed early in planning: max CSV size, concurrent import behavior, error state UX.

### Conditions

The following must be resolved during the planning phase (not before — none require user escalation):

1. **Consumer-seller products API scope** — Define whether completing the products API is in-scope for S01 or a prerequisite task. If in-scope, add it as an explicit task in the plan.
2. **Cross-service data contract** — Document the exact fields customer-backend must return from the match endpoint and the exact fields backend needs to create a real listing. This is the split-brain interface contract.
3. **Batch matching endpoint** — Design `POST /api/catalog/cards/fuzzy-match/batch` or equivalent to avoid 2,400 serial HTTP calls.
4. **Matching target column** — Decide: `cards.normalizedName` only (English-first), `card_translations.translatedNormalizedName` (multi-language), or both. This affects the migration and the match query.
5. **Import state storage** — Design decision: in-memory (MVP) vs. Redis-backed. Recommend in-memory with documented limitation.
6. **Sync vs. async matching** — Design decision: synchronous with chunked processing vs. background job. Recommend synchronous for MVP with configurable chunk size.
7. **Max CSV size** — Product decision: recommend 5,000 rows as MVP ceiling with clear error.
8. **Concurrent imports** — Product decision: recommend single-active import per seller for MVP.
9. **Partial failure strategy** — Design decision: recommend skip-and-report with a results summary showing succeeded/failed/skipped counts.
10. **Review step UX specifics** — Design decisions: candidate count per fuzzy match, selection mechanism, pagination strategy, search behavior for unmatched tab.
11. **Test fixture data** — Acquire or generate a representative TCGPlayer CSV for integration testing.

### Accepted Risks

- **Scope is large** (3 repos, ~6-8 tasks) but vertically integrated — no way to ship partial value. The panel accepts this as justified, with the mitigation that planning must decompose into well-bounded tasks with progress checkpoints.
- **pg_trgm threshold tuning** (0.5 initial) is unvalidated. Accepted: the threshold is configurable and can be tuned post-implementation with real data. No need to solve before planning.
- **CSV format detection** via marker columns is heuristic. Accepted: TCGPlayer's `TCGplayer Id` column is distinctive enough. Crystal Commerce detection may need refinement, but fallback to manual format is safe.
- **Performance at scale** (2,400 cards, cards table size unknown) is uncharacterized. Accepted: trigram GIN index + batch endpoint should be sufficient for MVP targets. Performance testing is part of the integration verification.
