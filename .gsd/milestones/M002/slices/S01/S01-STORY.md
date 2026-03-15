---
story_key: s01
title: CSV Inventory Import & Catalog Matching
status: clarified
requirement_ids: [R031]
affected_repos: [customer-backend, backend, vendorpanel]
story_type: feature
ui_story: true
split_brain_risk: true
needs_deploy: pending
party_gates:
  readiness: passed
  design_plan: passed
approvals:
  selected: false
  plan_frozen: true
  external_actions: false
review:
  spec_pass: pending
  quality_pass: pending
links:
  context: S01-CONTEXT.md
  research: S01-RESEARCH.md
  plan: S01-PLAN.md
  uat: S01-UAT.md
  summary: S01-SUMMARY.md
---

## Story

A business seller needs to upload their existing inventory from external platforms into the SideDecked marketplace. Today, listing cards is a one-at-a-time process through the storefront listing wizard — impractical for a seller with 2,400 cards in a TCGPlayer export. This slice builds a bulk CSV import pipeline that lets a seller upload their inventory file in the vendor panel and have the system do the heavy lifting of matching cards to the SideDecked catalog.

The import flow works like this: the seller uploads a CSV file in the vendor panel's bulk import wizard. The system detects the file format — TCGPlayer (identified by a `TCGplayer Id` column), Crystal Commerce (identified by a `Category` column), or a manual SideDecked template (fallback). The CSV is parsed with papaparse, columns are mapped to a normalized internal representation, and each card row is sent to the customer-backend's fuzzy match endpoint. That endpoint uses PostgreSQL's pg_trgm extension with `word_similarity()` to compare each card name against the `normalizedName` column in the cards table, returning match candidates with similarity scores. Results are classified into three confidence tiers: auto-match (≥0.8), fuzzy (0.5–0.79), and unmatched (<0.5).

The seller then reviews the results in a tabbed UI — auto-matched cards are pre-approved, fuzzy matches show the seller's card alongside the best catalog candidates for manual selection, and unmatched cards can be searched and resolved or skipped. Once the seller confirms, the system creates real listings in mercur-db by calling the existing consumer-seller products API for each confirmed card. The entire flow — upload, parse, match, review, confirm, create listings — is proven end-to-end with a 2,400-card CSV.

## Acceptance Criteria

- [ ] CSV parser detects TCGPlayer format when the header row contains `TCGplayer Id`
- [ ] CSV parser detects Crystal Commerce format when the header row contains `Category` (and no `TCGplayer Id`)
- [ ] CSV parser falls back to manual/SideDecked format when neither marker column is present
- [ ] CSV parser handles BOM (byte order mark) at file start without corrupting the first column name
- [ ] CSV parser handles trailing commas, quoted fields containing newlines, and empty rows without errors
- [ ] Fuzzy match endpoint accepts a card name and returns match candidates with `word_similarity()` scores
- [ ] Match results are classified into three tiers: auto (≥0.8), fuzzy (0.5–0.79), unmatched (<0.5)
- [ ] A GIN trigram index exists on `cards.normalizedName` in sidedecked-db
- [ ] Backend exposes `POST /vendor/consumer-seller/bulk-import/upload` accepting a multipart CSV file, returning `importId` and parsed row count
- [ ] Backend exposes `POST /vendor/consumer-seller/bulk-import/:importId/match` triggering catalog matching via customer-backend API
- [ ] Backend exposes `GET /vendor/consumer-seller/bulk-import/:importId/results` returning matched/fuzzy/unmatched lists with confidence scores
- [ ] Backend exposes `POST /vendor/consumer-seller/bulk-import/:importId/confirm` creating listings from confirmed matches
- [ ] Confirm step creates real listings via the existing consumer-seller products API — no alternative listing creation path
- [ ] Vendor panel has a bulk import route with three steps: upload, review, and confirm
- [ ] Review step has tabs or sections for auto-matched, fuzzy, and unmatched cards
- [ ] Fuzzy match tab shows the seller's card name alongside catalog candidates for manual selection
- [ ] Unmatched tab allows the seller to search the catalog and manually assign a match or skip the card
- [ ] A 2,400-card TCGPlayer CSV processes successfully through the full pipeline: upload → parse → match → review → confirm → listings created

## Constraints

- **Split-brain architecture:** Card matching queries run against sidedecked-db (customer-backend). Listing creation writes to mercur-db (backend) via the consumer-seller products API. No direct cross-database queries are permitted — all cross-system data flows through API calls.
- **pg_trgm extension:** Already enabled on sidedecked-db. The trigram GIN index must be created via a TypeORM migration in customer-backend.
- **CSV parsing library:** Must use papaparse (D039) — works in both browser (client-side preview) and Node (server-side validation).
- **Listing creation path:** Must use the existing consumer-seller products API (`POST /vendor/consumer-seller/products`). No new listing creation endpoint or workflow.
- **Vendor panel patterns:** UI must use Medusa UI components, TanStack Query for data fetching, and react-hook-form for form handling — consistent with existing vendor panel patterns.
- **Backend route patterns:** Bulk import routes in backend follow MedusaJS v2 API route conventions (route config, validators, middleware).
- **Customer-backend patterns:** Fuzzy match endpoint and CSV parser service follow Express + TypeORM patterns with the existing project structure.
- **Fuzzy match function:** Use `word_similarity()` over `similarity()` (D040) — handles partial name matches better. Initial threshold at 0.5, stored in config.

## Definition of Done

- [ ] CSV parser service with unit tests covering all 3 format detections and edge cases (BOM, trailing commas, quoted newlines, empty rows)
- [ ] Fuzzy match endpoint with unit tests covering similarity scoring, tier classification, edge cases (no matches, exact matches, multiple close candidates)
- [ ] Backend bulk-import API routes functional (upload, match, results, confirm)
- [ ] Vendor panel bulk import UI functional: upload → review (auto/fuzzy/unmatched tabs) → confirm
- [ ] Integration test procedure documented (steps to prove the full pipeline with running services)
- [ ] All quality gates pass across affected repos: lint, typecheck, build, test
- [ ] No regressions in existing test suites in customer-backend, backend, or vendorpanel

## Open Questions

- Is `word_similarity()` the right pg_trgm function, or should we also expose `similarity()` and let the threshold tuning decide? D040 says `word_similarity()` but notes this is revisitable after calibration.
- Should import state (parsed rows, match results, user selections) be stored in-memory on the server (MVP simplicity) or backed by Redis/database from the start? In-memory is simpler but doesn't survive server restarts mid-import.
- What is the maximum CSV file size we should support? 2,400 rows is the target, but sellers may have larger inventories. Need to decide on a hard limit for the upload endpoint.
- Should the match step (`POST .../match`) be synchronous or use a background job (bull queue) for large CSVs? Synchronous is simpler but may time out for large files.
- How should partial failures during the confirm step be handled? If listing creation fails for card 1,200 of 2,400, should the system roll back, skip failures, or allow retry of failed items?

## Affected Repos

- **customer-backend** — CSV parser service, fuzzy match endpoint (`GET /api/catalog/cards/fuzzy-match`), TypeORM migration for GIN trigram index on `cards.normalizedName`
- **backend** — Bulk import API routes: upload (multipart CSV), match (trigger matching), results (return classified matches), confirm (create listings via consumer-seller products API)
- **vendorpanel** — Bulk import UI: upload wizard step, match review page with auto/fuzzy/unmatched tabs, confirm step with summary and listing creation progress
