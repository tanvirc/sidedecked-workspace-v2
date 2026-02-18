# Story 4.1.2: Sales Analytics & Insights

**Epic**: [epic-04-vendor-management.md](../epics/epic-04-vendor-management.md)
**Status**: in_progress
**Domain**: Both

## User Story

_As a vendor, I want detailed sales analytics so that I can make data-driven decisions about inventory and pricing._

## Acceptance Criteria

- (IN PROGRESS) Sales funnel analysis showing listing views → saves → purchases conversion rates
- (IMPLEMENTED) Time-based sales patterns identifying peak selling hours and days
- (IN PROGRESS) Seasonal trends analysis for different card categories and games
- (IMPLEMENTED) Customer behavior insights including average time to purchase and repeat purchase rates

## Implementation Notes

The analytics dashboard is located at `/vendor/analytics`. It features a tab-based interface covering Sales Funnel, Customer Insights, Pricing Analysis, and Forecasting. Components include SalesFunnel (conversion visualization), TrendAnalysis (seasonal pattern recognition), CustomerBehavior (cohort analysis), PricingEffectiveness, and ForecastingChart. A date range picker with preset options and filter controls for game type, card category, price range, and customer segment are provided.
