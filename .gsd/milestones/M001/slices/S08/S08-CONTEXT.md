---
id: S08
milestone: M001
status: ready
---

# S08: 3-Step Seller Listing Wizard — Context

## Goal

Deliver a fully wired 3-step listing wizard (Identify → Condition + Photos → Price + Confirm) that creates real listings visible on card detail pages, with Algolia card identification, game-specific text grading guides, front+back photo upload to MinIO, and BFF-powered market pricing pre-fill.

## Why this Slice

S09 (Cart Optimizer) depends on live listings existing for the optimizer to query — without S08, there's no seller inventory to optimize against. S08 also proves the seller side of the marketplace: a seller can upgrade, list a card, and see it appear on the storefront. This is half of the M001 acceptance scenario ("A seller can list a card via the 3-step wizard and see it on the card detail page").

## Scope

### In Scope

- **3-step wizard UI** replacing the existing 571-line `CardListingForm` single-page form:
  - Step 1 (Identify): Algolia autocomplete card search with card image previews, set/printing/language/foil selector
  - Step 2 (Condition + Photos): Game-specific text condition descriptions (MTG-specific, Pokémon-specific, Yu-Gi-Oh!-specific, One Piece-specific), front + back photo upload to MinIO
  - Step 3 (Price + Confirm): Market price pre-fill from MarketDataService via BFF, competitive indicator, shipping config, listing submission
- **Step indicator**: 3-step horizontal (desktop) / vertical (mobile) progress bar with current step highlighted in gold (brand-primary)
- **Two entry points**:
  - `/sell/list-card` page — seller starts from scratch with Algolia card search
  - "Sell this card" button on card detail pages — pre-fills card identity and skips directly to Step 2
- **Algolia card identification**: Search-as-you-type with card image + set info in results, then set/printing picker after selection
- **Photo upload**: Front photo (strongly encouraged) + back photo (optional), uploaded to MinIO via existing `POST /store/consumer-seller/uploads` endpoint. Inline preview after upload. Nudge message ("Listings with photos sell 3x faster") if skipping photos.
- **Game-specific grading**: Existing `ConditionGuide` component migrated to Voltage tokens with game-specific text descriptions per condition (NM/LP/MP/HP/DMG). Text descriptions only — no reference photos for MVP.
- **Market pricing via BFF**: New BFF endpoint that queries customer-backend's `MarketDataService` for the selected card's `catalog_sku`. Returns `current_market_price`, `lowest_available`, `highest_available`, `average_price`. Pre-fills suggested price. Competitive indicator: "Below average — priced to sell!" / "Above market — may take longer". Warning for >50% below average.
- **Full end-to-end listing creation**: Wizard submits to `POST /store/consumer-seller/listings` backend endpoint. Created listing goes live. Listing appears on the card detail page via existing BFF aggregation. Success screen with shareable link, "Share on Discord/Twitter" CTA, and "List Another Card" button.
- **Returning seller convenience**: Last-used shipping config pre-filled with "Use same shipping as last listing" toggle.
- **Voltage visual alignment**: Wizard UI matches the S06-generated wireframe for sell/list-card page.

### Out of Scope

- CSV bulk import (M002 — Story 4.5)
- Photo reference images for condition grading (text descriptions only for MVP)
- Listing management dashboard (listing editing, deactivation, reactivation) — existing `ConsumerSellerDashboard` handles this
- Seller trust score calculation (M002)
- Price history charts (M003)
- "Card not found" request form (deferred — catalog is comprehensive enough for MVP)
- Seller upgrade flow (S05 scope — S08 consumes authenticated seller session from S05)
- Fuzzy match review for catalog matching (M002 — Story 4.6)
- Listing quantity > 1 per wizard submission (seller can list again for additional copies)

## Constraints

- S05 must be complete: wizard requires authenticated seller session and seller upgrade flow
- Existing backend endpoints must be used as-is: `POST /store/consumer-seller/listings` for listing creation, `POST /store/consumer-seller/uploads` for photo upload — no backend modifications unless absolutely necessary
- Algolia is already integrated in storefront — use the existing `InstantSearchNext` / Algolia client patterns established in S02
- Voltage tokens and inline `style` for CSS custom properties (D009) — same pattern as all prior slices
- Photo file size limit: < 10MB per image (validated client-side before upload)
- MarketDataService lives in customer-backend — must be accessed via BFF endpoint, never direct DB access (split-brain architecture)
- Success criteria: < 90 seconds for a seller to complete the full wizard flow

## Integration Points

### Consumes

- `storefront/src/components/ui/` — Voltage-styled shadcn/ui primitives (Sheet, Dialog, sonner for toasts)
- `storefront/src/app/colors.css`, `globals.css` — Voltage design tokens, typography
- S05 — Authenticated seller session (JWT valid on both backends), seller upgrade flow complete
- `POST /store/consumer-seller/listings` — Backend listing creation via MedusaJS `createProductsWorkflow`
- `POST /store/consumer-seller/uploads` — MinIO photo upload via MedusaJS `uploadFilesWorkflow`
- `customer-backend/src/services/MarketDataService.ts` — Market pricing data (via new BFF endpoint)
- `customer-backend/src/routes/catalog.ts` — Card catalog with `/cards/search` for identification (via Algolia or BFF)
- Algolia search index — Card autocomplete for Step 1 identification
- S06 wireframe — `docs/plans/wireframes/storefront-sell-list-card.html` as visual alignment target

### Produces

- `ListingWizard` component — 3-step flow replacing `CardListingForm`
- `ConditionGradeSelector` — Game-specific text grading guides, migrated to Voltage tokens
- `PricingSection` — Market price pre-fill with competitive indicator
- `PhotoUploader` — Front + back photo upload to MinIO with preview
- BFF market pricing endpoint — Proxies MarketDataService for the storefront
- "Sell this card" button integration on `CardDetailPage`
- Live listings appearing on card detail page via existing BFF aggregation
- Success screen with shareable link and social sharing CTAs

## Open Questions

- Algolia index for listing identification vs customer-backend `/cards/search` — Algolia is already integrated for card browse/search, but card identification for listing may need different result shapes (need catalog_sku, printings, languages). Current thinking: use Algolia for autocomplete, then fetch full printing details from customer-backend catalog API for set/language/foil selection.
- Shipping configuration defaults — Story 4.4 mentions Standard Mail / Tracked Package with market-range rates. The existing `CardListingForm` has `SHIPPING_OPTIONS` with $3.99 / $7.99 / free over $25. Current thinking: keep existing shipping options for MVP, just restyle and integrate into Step 3.
- Market pricing BFF endpoint location — should it live in the storefront's `/api/` BFF routes or as a new route on customer-backend? Current thinking: storefront BFF route that proxies to customer-backend, matching the existing BFF pattern used elsewhere.
