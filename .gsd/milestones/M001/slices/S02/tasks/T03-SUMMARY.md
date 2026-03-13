---
id: T03
parent: S02
milestone: M001
provides:
  - Glass-card backdrop-filter blur on GameStatsDisplay, PriceInsightsSection, CompactPrintingsTable
  - Mobile 4-tab navigation (Details, Prices, Sellers, Printings) replacing single Legality tab
  - RelatedCards component with horizontal scroll, same-set link fallback, responsive sizing
  - CSS module classes for glass cards, mobile tabs, and related cards section
key_files:
  - storefront/src/components/cards/CardDetailPage.tsx
  - storefront/src/components/cards/RelatedCards.tsx
  - storefront/src/components/cards/__tests__/RelatedCards.test.tsx
  - storefront/src/styles/card-detail.module.css
  - storefront/src/components/cards/GameStatsDisplay.tsx
  - storefront/src/components/cards/PriceInsightsSection.tsx
  - storefront/src/components/cards/CompactPrintingsTable.tsx
key_decisions:
  - "D015: Dual-render pattern for mobile tabs — desktop sections in hidden md:block, mobile tab-controlled content in md:hidden. Tests use getAllByTestId to handle both renders."
patterns_established:
  - "Mobile tab pattern: activeTab state drives conditional rendering in md:hidden block; desktop always shows all sections in hidden md:block"
  - "RelatedCards accepts RelatedCard[] prop array with optional same-set fallback link"
  - "Glass card CSS module classes (.glassCard, .glassCardStrong) in card-detail.module.css for reuse"
observability_surfaces:
  - "data-testid='mobile-tabs' on the tab bar container"
  - "data-testid='mobile-tab-content' on the tab content container"
  - "data-testid='related-cards' on the related cards section"
  - "data-testid='related-cards-scroll' on the horizontal scroll container"
  - "data-testid='related-card-{id}' on each related card link"
  - "data-testid='same-set-link' on the fallback same-set browse link"
duration: ~45min
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T03: Card detail page visual alignment, mobile tabs, and related cards

**Applied glass-card blur to info sections, expanded mobile tabs from 1 to 4 with tab-controlled content, created RelatedCards horizontal scroll component, and fixed section title letter-spacing.**

## What Happened

Three info section components (GameStatsDisplay, PriceInsightsSection, CompactPrintingsTable) already had the correct `rgba(33, 32, 58, 0.6)` background and 16px border-radius but were missing `backdrop-filter: blur(8px)`. Added blur to all three, plus fixed their border to use the `--border-default` CSS variable and standardized `letter-spacing` from `0.84px` to `0.06em` matching the wireframe's section title spec.

Mobile tabs expanded from a single "Legality" pill button to a proper 4-tab bar (Details, Prices, Sellers, Printings) matching the wireframe. Used a dual-render approach: desktop content stays in a `hidden md:block` container showing all sections inline, while mobile gets a `md:hidden` tab-controlled content area. The Sellers tab surfaces QuickBuyPanel + QuickSellerList on mobile (content that's only in the right column on desktop). The right column is now `hidden lg:block` since its content appears in mobile tabs.

Created `RelatedCards` component accepting a `RelatedCard[]` prop array with horizontal scroll. Desktop shows 150px-wide cards with 210px image height; mobile shows 110px/154px. When no related cards are available, renders a same-set browse link fallback. The component is rendered below the 3-column layout, full width, matching the wireframe's "You Might Also Like" section.

Also fixed a pre-existing build error where `CardGrid.tsx` passed an unsupported `viewMode` prop to `CardGridSkeleton`.

## Verification

- `npx vitest run src/components/cards/CardDetailPage.test.tsx` — 27 tests pass ✓
- `npx vitest run src/components/cards/__tests__/RelatedCards.test.tsx` — 9 tests pass ✓
- `npx vitest run` — 709 tests pass (70 files) ✓
- `npx tsc --noEmit` — zero TypeScript errors ✓
- `npm run build` — TypeScript compilation succeeds; pre-existing `_document` PageNotFoundError unrelated to changes

Slice-level verification status (T03 is intermediate, not final):
- ✅ `cd storefront && npx vitest run` — 709 tests pass (exceeds 678+ baseline)
- ✅ `cd storefront && npx vitest run src/components/cards/__tests__/RelatedCards.test.tsx` — passes
- ⚠️ `cd storefront && npm run build` — TS compilation clean; Next.js page generation has pre-existing `_document` error
- ⬜ Visual verification deferred to T04 (final task)

## Diagnostics

- Mobile tabs: inspect `data-testid="mobile-tabs"` for tab bar, `data-testid="mobile-tab-content"` for content area
- Related cards: `data-testid="related-cards"` for section container, `data-testid="related-cards-scroll"` for scroll row
- Glass card blur: inspect computed `backdrop-filter` on GameStatsDisplay, PriceInsightsSection, CompactPrintingsTable root elements
- Tab active state: `aria-selected="true"` on the active tab button

## Deviations

- Fixed pre-existing build error in `CardGrid.tsx` (passed unsupported `viewMode` prop to `CardGridSkeleton`) — not in task plan but blocked build verification.
- Section title `letter-spacing` changed from `0.84px` to `0.06em` across GameStatsDisplay, PriceInsightsSection, CompactPrintingsTable — the wireframe canonical value is `0.06em`.

## Known Issues

- Pre-existing Next.js build error: `PageNotFoundError: Cannot find module for page: /_document` — unrelated to card detail changes, present before this task.
- RelatedCards currently renders only when `relatedCards` prop is passed. No server-side data source wired yet — the prop defaults to empty array, triggering same-set link fallback.

## Files Created/Modified

- `storefront/src/components/cards/CardDetailPage.tsx` — Added 4-tab mobile navigation, dual-render desktop/mobile sections, RelatedCards integration, relatedCards prop
- `storefront/src/components/cards/RelatedCards.tsx` — New component: horizontal scroll of related card tiles with responsive sizing
- `storefront/src/components/cards/__tests__/RelatedCards.test.tsx` — 9 tests covering empty state, fallback, card rendering, links, images, prices
- `storefront/src/styles/card-detail.module.css` — Added .glassCard, .glassCardStrong, .mobileTabs, .mobileTab, .mobileTabActive, .mobileTabContent, .relatedSection, .relatedCard and responsive variants
- `storefront/src/components/cards/GameStatsDisplay.tsx` — Added backdrop-filter blur(8px), fixed border to use CSS var, fixed letter-spacing
- `storefront/src/components/cards/PriceInsightsSection.tsx` — Added backdrop-filter blur(8px), fixed border and letter-spacing (both render paths)
- `storefront/src/components/cards/CompactPrintingsTable.tsx` — Added backdrop-filter blur(8px), fixed border and letter-spacing (both render paths)
- `storefront/src/components/cards/CardDetailPage.test.tsx` — Updated for dual-render pattern (getAllByTestId), added 4-tab tests, added RelatedCards mock
- `storefront/src/components/cards/CardGrid.tsx` — Removed unsupported viewMode prop from CardGridSkeleton call (pre-existing bug fix)
