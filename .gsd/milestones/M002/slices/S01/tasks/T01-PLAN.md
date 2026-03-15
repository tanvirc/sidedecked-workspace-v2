---
estimated_steps: 12
estimated_files: 10
---

# T01: CSV Parser Service + Test Fixtures in customer-backend

**Slice:** S01 — CSV Inventory Import & Catalog Matching
**Milestone:** M002

## Why

The CSV parser is the entry point for all import data and has zero database dependencies — making it the safest place to start. Getting format detection and column mapping right is foundational: every downstream task (matching, review, confirm) consumes the parser's output. The test fixtures generated here (especially the 2,400-row TCGPlayer CSV) are reused for integration testing in T08.

## What

- `CsvParserService` class with format detection, column mapping, and row validation
- papaparse installed as a dependency
- Synthetic test fixtures: 2,400-row TCGPlayer, 20-row TCGPlayer, 20-row Crystal Commerce, 20-row manual format
- Comprehensive unit tests covering all 3 formats and edge cases

## Steps

1. Install `papaparse` and `@types/papaparse` in `customer-backend/package.json`
2. Define the normalized internal row representation type (`ParsedCardRow`):
   ```typescript
   interface ParsedCardRow {
     externalId?: string       // TCGplayer Id, or Crystal Commerce product ID
     productName: string       // normalized card name
     setName?: string          // expansion/set
     condition?: string        // NM, LP, MP, HP, DMG
     quantity: number          // default 1
     price?: number            // seller's price in cents
     rarity?: string
     language?: string         // default "EN"
     finish?: string           // default "NORMAL"
     rawRow: Record<string, string>  // original parsed row for debugging
   }
   ```
3. Define the `ParseResult` return type:
   ```typescript
   interface ParseResult {
     format: 'tcgplayer' | 'crystal_commerce' | 'manual'
     rows: ParsedCardRow[]
     errors: Array<{ row: number; message: string }>
     totalRows: number
   }
   ```
4. Build `CsvParserService` with:
   - `detectFormat(headers: string[]): 'tcgplayer' | 'crystal_commerce' | 'manual'` — check for `TCGplayer Id` first, then `Category`, else fallback
   - `parseCSV(content: string): ParseResult` — uses papaparse with `header: true, skipEmptyLines: true, transformHeader` to strip BOM and whitespace
   - Column mapping functions per format: `mapTCGPlayerRow()`, `mapCrystalCommerceRow()`, `mapManualRow()`
   - Row validation: `productName` required, `quantity` must be positive integer, `price` must be non-negative
   - 5,000-row limit check — reject with clear error message
5. Handle BOM: papaparse `transformHeader` callback trims `\uFEFF` from first header
6. Create test fixture generator script at `customer-backend/src/tests/fixtures/generate-fixtures.ts`:
   - Build 2,400-row TCGPlayer CSV from known card name patterns
   - 80% exact names (e.g., "Lightning Bolt", "Counterspell"), 10% misspelled (e.g., "Lightnng Bolt", "Cuntrspell"), 10% nonsense (e.g., "Xyzzy Card 42")
   - Include columns: `TCGplayer Id`, `Product Line`, `Set Name`, `Product Name`, `Title`, `Number`, `Rarity`, `Condition`, `TCG Market Price`, `Quantity`, `My Price`
   - Include edge cases in the fixture: BOM at file start, rows with quoted fields containing commas and newlines, trailing commas, empty rows interspersed
7. Generate and commit the fixture files:
   - `src/tests/fixtures/tcgplayer-2400.csv` (large fixture)
   - `src/tests/fixtures/tcgplayer-20.csv` (small fixture — first 20 rows of large)
   - `src/tests/fixtures/crystal-commerce-20.csv` (Crystal Commerce format with `Category`, `Product Name`, `Condition`, `Qty`, `Price`)
   - `src/tests/fixtures/manual-20.csv` (SideDecked manual format with `Card Name`, `Set`, `Condition`, `Quantity`, `Price`)
8. Write unit tests at `customer-backend/src/tests/services/csv-parser.test.ts`:
   - Format detection: TCGPlayer by `TCGplayer Id` header
   - Format detection: Crystal Commerce by `Category` header (no `TCGplayer Id`)
   - Format detection: fallback to manual when neither marker present
   - BOM handling: first column name not corrupted
   - Trailing comma handling: no phantom empty column
   - Quoted field with newline: row parsed correctly
   - Empty rows: skipped without error
   - Zero data rows (headers only): returns `{ rows: [], totalRows: 0 }`
   - Duplicate card names: each row parsed independently
   - Row count >5,000: throws/returns error with clear message
   - Unicode card names (e.g., Japanese): parsed without corruption
   - Missing required `productName`: row recorded in errors array
   - Invalid quantity (negative, non-integer): row recorded in errors array
   - Full 2,400-row fixture: parses without errors, correct row count
9. Verify: `cd customer-backend && npm test -- --testPathPattern="csv-parser"`
10. Run typecheck and build: `cd customer-backend && npm run typecheck && npm run build`

## Files

- `customer-backend/package.json` — add papaparse + @types/papaparse
- `customer-backend/src/services/CsvParserService.ts` — new: parser service
- `customer-backend/src/types/csv-import.ts` — new: ParsedCardRow, ParseResult types
- `customer-backend/src/tests/services/csv-parser.test.ts` — new: unit tests
- `customer-backend/src/tests/fixtures/generate-fixtures.ts` — new: fixture generator
- `customer-backend/src/tests/fixtures/tcgplayer-2400.csv` — new: large fixture
- `customer-backend/src/tests/fixtures/tcgplayer-20.csv` — new: small fixture
- `customer-backend/src/tests/fixtures/crystal-commerce-20.csv` — new: CC fixture
- `customer-backend/src/tests/fixtures/manual-20.csv` — new: manual format fixture
- `customer-backend/src/tests/fixtures/bom-test.csv` — new: BOM edge case fixture

## Verification

- `cd customer-backend && npm test -- --testPathPattern="csv-parser"` — all tests pass
- `cd customer-backend && npm run typecheck` — no type errors
- `cd customer-backend && npm run build` — builds cleanly

## Done When

- `CsvParserService` correctly detects all 3 CSV formats via marker columns
- All edge cases (BOM, trailing commas, quoted newlines, empty rows, Unicode, >5000 rows) tested and passing
- 2,400-row TCGPlayer fixture committed with 80/10/10 distribution
- Small fixtures (20-row) committed for all 3 formats
- `npm test -- --testPathPattern="csv-parser"` passes with 0 failures
- `npm run typecheck && npm run build` succeeds
