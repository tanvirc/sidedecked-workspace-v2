# M005: Intelligence & Scale

## Goal
Add ML-powered intelligence and automation once the data foundation is solid.

## Slices

- [ ] **S01: ML Price Forecasting** `risk:high` `depends:[]`
  > Feature engineering from PriceHistory, listing volume, set age, reprint announcements. Model training pipeline + serving infrastructure. 7/30/90-day price forecast display on card detail. Confidence interval visualization.

- [ ] **S02: Automated Repricing** `risk:medium` `depends:[S01]`
  > Repricing rules engine (seller-configurable: match lowest, beat by X%, maintain margin %). Background Bull queue job on schedule. Price change notifications to seller (in-app + email). Audit log of automated changes.

- [ ] **S03: Visual Card Recognition** `risk:high` `depends:[]`
  > Mobile camera capture integration in storefront. Vision model inference (cloud API, confidence-gated). Catalog matching from recognized card name + set. Collection add / listing wizard pre-fill from camera. Fallback to manual search when confidence < threshold.

- [ ] **S04: Semantic Search** `risk:medium` `depends:[]`
  > Vector embeddings for cards (name, oracle text, flavor, tags). Semantic search endpoint alongside keyword search. "Find similar cards" feature on card detail. Natural language deck queries ("aggressive red deck under $50").
