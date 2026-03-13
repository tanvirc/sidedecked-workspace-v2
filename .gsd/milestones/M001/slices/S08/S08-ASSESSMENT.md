# S08 Post-Slice Roadmap Assessment

**Verdict: Roadmap unchanged.**

## Risk Retirement

S08 (`risk:high`) fully retired — 13 wizard components, 60 tests, complete publish flow wired to `createSellerListing()`. Listings appear on card detail page via BFF. No residual risk carries forward.

## Success Criteria Coverage

All 8 milestone success criteria have at least one remaining owning slice:

- Pixel-perfect pages → S10 (final visual audit)
- Full deck-to-cart flow → S09
- Listing wizard < 90s → S08 ✓ (complete)
- Google/Discord OAuth e2e → S05 ✓ (structural; live needs credentials)
- Cart optimizer < 2s for 15 cards → S09
- Collection auto-update on receipt → S10
- Figma export → blocked on MCP auth (R025), tracked independently
- 672+ tests pass, build clean → currently 854, well above threshold

## Boundary Contracts

- S08 → S09: `createSellerListing()` and BFF listing pipeline confirmed working. S09 queries listings through existing BFF. Contract holds.
- S03 → S09: "I own this" toggle deferred to S09 as planned. S09 description already accounts for this.
- S09 → S10: Unchanged.

## Requirement Coverage

- R017 validated by S08 (60 tests).
- R018, R019, R020 remain active, owned by S09.
- R021 remains active, owned by S10.
- No requirements surfaced, invalidated, or re-scoped.

## Notes for S09 Planning

- Test baseline is 854 (not the original 794 threshold).
- Game code hardcoded to "MTG" in `catalog_sku` — doesn't affect optimizer (queries listings regardless).
- `MarketPriceDisplay` pricing endpoint may not exist yet — fallback path is default experience.
