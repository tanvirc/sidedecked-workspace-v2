# M005: Intelligence & Scale — Context

**Gathered:** 2026-03-13
**Status:** Future milestone — plan when M004 completes

## Project Description

Add machine learning and advanced intelligence features — price forecasting, visual card recognition, automated repricing, semantic search, and multi-currency support. These features differentiate SideDecked from competitors and justify premium seller tiers.

## Why This Milestone

M001-M004 built a complete marketplace with community. M005 adds intelligence that competitors can't easily replicate. ML models trained on SideDecked's unique deck-to-purchase data create a data moat. Price forecasting helps both buyers (buy low) and sellers (price right), creating a virtuous cycle.

## User-Visible Outcome

### When this milestone is complete, the user can:

- See ML-powered price forecasts on card detail pages ("Expected to rise 15% in 2 weeks")
- Point their phone camera at a card and have it identified automatically
- (Seller) Enable automated repricing rules that adjust prices based on market movement
- Search using natural language ("cheap red aggro cards for Modern")
- (International) Browse and purchase in their local currency

### Entry point / environment

- Entry point: Storefront, mobile web
- Environment: production with ML inference service
- Live dependencies: ML inference API, camera API, currency conversion service

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Price forecast for a card with 90 days of history produces a directional prediction with confidence interval
- Camera card recognition identifies an MTG card from a photo with > 90% accuracy
- Automated repricing adjusts a seller's listing within 1 hour of market price change
- Natural language search returns relevant results for game-specific queries

## Existing Codebase / Prior Art

- `customer-backend/src/services/MarketDataService.ts` — Historical price data source for ML training
- `customer-backend/src/services/PriceHistoryService.ts` — Price history storage
- `customer-backend/src/services/AlgoliaIndexService.ts` — Search index management

## Relevant Requirements

- R037 — ML price forecasting
- R040 — Multi-currency (currently out of scope, revisit here)
- R041 — Visual card recognition (currently out of scope, revisit here)

## Scope

### In Scope
- ML price forecasting model and UI
- Visual card recognition (camera-based)
- Automated repricing for sellers
- Semantic natural language search
- Multi-currency support
- AI-powered content recommendations
- ML-powered fraud detection

### Out of Scope / Non-Goals
- Native mobile apps (separate project)
- Blockchain/NFT integration
- Augmented reality card viewing
