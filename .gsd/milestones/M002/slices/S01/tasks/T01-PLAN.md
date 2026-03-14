---
estimated_steps: 5
estimated_files: 2
---

# T01: CSV parser with format detection and column mapping

**Slice:** S01 — CSV Inventory Import & Catalog Matching
**Milestone:** M002

## Description

Build the CSVParserService — a pure-logic module that accepts raw CSV text, auto-detects the format (TCGPlayer, Crystal Commerce, or manual), maps format-specific columns to a common `ParsedCard` intermediate representation, and returns structured results with per-row errors. Uses papaparse per D039. No database dependency — fully unit-testable.

## Steps

1. Install `papaparse` and `@types/papaparse` in customer-backend if not already present. Define TypeScript types: `CSVFormat` enum (`tcgplayer | crystal_commerce | manual`), `ParsedCard` interface (cardName, setName, collectorNumber, condition, quantity, price, language, finish, rawRow, rowNumber), `ParseResult` interface (format, cards, errors, totalRows, validRows).
2. Implement `detectFormat(headers: string[]): CSVFormat` — check for `TCGplayer Id` or `TCGPlayer Id` → `tcgplayer`, `Category` + `Product Name` → `crystal_commerce`, fallback → `manual`. Case-insensitive header matching.
3. Implement format-specific column mappers: `mapTCGPlayerRow()` maps columns (Product Name → cardName, Set Name → setName, Number → collectorNumber, Condition → condition, Quantity → quantity, TCGplayer Price / Add to Quantity → price), `mapCrystalCommerceRow()` maps (Product Name → cardName, Category → setName, Qty → quantity, Buy Price / Sell Price → price), `mapManualRow()` maps (card_name/name → cardName, set/set_name → setName, condition → condition, qty/quantity → quantity, price → price). All mappers handle missing/null columns gracefully.
4. Implement `parseCSV(csvText: string): ParseResult` — use papaparse with `header: true`, `skipEmptyLines: true`, `transformHeader` to trim whitespace and strip BOM. Call detectFormat on parsed headers, then map each row through the appropriate mapper. Collect per-row validation errors (missing cardName, negative price, non-numeric quantity). Return ParseResult.
5. Write comprehensive unit tests in `customer-backend/src/tests/services/csv-parser.test.ts`: test format detection for all three formats, column mapping for each format, BOM handling (prepend `\uFEFF` to CSV), empty row skipping, quoted fields with embedded commas and newlines, missing required fields produce errors, partial rows map what they can, large CSV (100+ rows) parses correctly.

## Must-Haves

- [ ] papaparse installed in customer-backend
- [ ] `CSVFormat`, `ParsedCard`, `ParseResult` types exported
- [ ] Format detection correctly identifies TCGPlayer, Crystal Commerce, and manual formats
- [ ] Column mappers for all three formats produce correct `ParsedCard` shape
- [ ] BOM, trailing commas, empty rows, quoted newlines handled
- [ ] Per-row validation errors captured (missing cardName, invalid price/quantity)
- [ ] Unit tests cover all three formats, edge cases, and error paths

## Verification

- `cd customer-backend && npm test -- --testPathPattern="csv-parser"` — all tests pass
- Types compile: `cd customer-backend && npx tsc --noEmit`

## Inputs

- D039 (papaparse choice) and D040 (word_similarity) decisions from DECISIONS.md
- Existing customer-backend jest configuration and test patterns (see `catalog-sku.test.ts`)
- TCGPlayer CSV column names: `TCGplayer Id`, `Product Line`, `Set Name`, `Product Name`, `Title`, `Number`, `Rarity`, `Condition`, `TCGPlayer Market Price`, `TCGPlayer Direct Low`, `TCGPlayer Low Price`, `Quantity`, `Add to Quantity`
- Crystal Commerce column names: `Product Name`, `Category`, `Qty`, `Buy Price`, `Sell Price`, `MSRP`

## Expected Output

- `customer-backend/src/services/CSVParserService.ts` — exported CSVParserService with `parseCSV()`, `detectFormat()`, types
- `customer-backend/src/tests/services/csv-parser.test.ts` — ≥15 test cases covering all formats and edge cases
