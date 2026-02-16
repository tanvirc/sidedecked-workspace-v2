# Story 8.2: Vendor Analytics Dashboard

## Goal
Provide vendors with actionable analytics and exports.

## Context
Epic 8: Vendor Operations & Inventory

## Dependencies
- story-08-01-inventory-import-sync.md
- story-07-02-pricing-analytics-engine.md

## Acceptance Criteria
1. Display sales, conversion, average order value, and top-performing SKUs with date filters.
2. Support comparisons against previous periods and highlight insights such as low stock or high demand.
3. Offer CSV exports and scheduled email reports for accounting workflows.

## Implementation Tasks
- Design analytics API aggregating vendor KPIs with filter support.
- Implement vendor panel dashboards with charts, comparisons, and insight callouts.
- Add export endpoints and scheduled email reports delivering CSV snapshots.

## Validation Plan
- Run analytics regression tests ensuring KPI accuracy across sample data.
- Validate exports and scheduled emails include correct metrics and formats.

