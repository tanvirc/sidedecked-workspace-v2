---
id: T04
parent: S03
milestone: M001
provides:
  - Polished DeckBuilderLayout toolbar with glassmorphic styling, grouped undo/redo, separator dividers, accent save button
  - Styled DeckSurface with native tab bar (Zones/List) replacing Radix Tabs, matching viewer tab visual language
  - DeckZone with collapsible zone headers (uppercase labels, mono count badges, chevron toggle)
  - Wireframe-sized card thumbnails in DeckZone with compact hover controls
  - Polished MobileDeckBuilder header, bottom navigation, and zone cards matching desktop styling language
  - data-testid="builder-toolbar" and data-testid="zone-header-{zone}" inspection surfaces
key_files:
  - storefront/src/components/deck-builder/DeckBuilderLayout.tsx
  - storefront/src/components/deck-builder/DeckSurface.tsx
  - storefront/src/components/deck-builder/DeckZone.tsx
  - storefront/src/components/deck-builder/MobileDeckBuilder.tsx
  - storefront/src/components/deck-builder/DeckHeader.tsx
key_decisions:
  - Replaced Radix Tabs in DeckSurface with native styled tab bar to match the viewer tab pattern (glassmorphic bar with brand-primary active indicator) — avoids importing Radix for a simple two-tab toggle
  - DeckZone collapse state is local per-zone (not shared context) — simpler and avoids coupling zone open/close behavior
  - Used native button elements with inline styles instead of Button component for toolbar actions — matches the glassmorphic theme without fighting component defaults
patterns_established:
  - Zone header pattern: uppercase 12px label + mono count badge + collapse chevron in bg-surface-2 bar — reusable for any collapsible section with count indicators
  - Glassmorphic toolbar pattern: rgba(24,22,42,0.85) + backdrop-blur(16px) + grouped controls with 1px border separators
observability_surfaces:
  - data-testid="builder-toolbar" on the header toolbar bar
  - data-testid="zone-header-{zone}" on each zone header for collapse state inspection
  - data-testid="deck-surface" on the deck surface container
duration: 1.5h
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T04: Deck builder visual polish, mobile alignment, and cross-page test sweep

**Polished DeckBuilderLayout toolbar, DeckSurface tabs, DeckZone headers with collapse, card thumbnail sizing, and MobileDeckBuilder styling to match wireframe design language. 742 tests pass, production build clean.**

## What Happened

Applied wireframe polish to all deck builder components:

1. **DeckBuilderLayout toolbar** — Replaced the basic header with a glassmorphic toolbar bar (backdrop-blur, rgba background). Undo/redo buttons grouped with a 1px border separator. Import/Export as lightweight icon buttons. Save button gets brand-primary background + glow shadow when dirty, fades when saved.

2. **Card browser panel** — Added inset box-shadow on the left panel edge for depth. Refined the collapse toggle to a narrower 20px rounded tab with border.

3. **DeckSurface** — Replaced Radix `<Tabs>` component with a native two-tab bar (Zones/List) styled to match the viewer page tab pattern (uppercase text, brand-primary active border-bottom, transparent background). Deck stats card uses Voltage surface tokens.

4. **DeckZone** — Complete restyle of zone containers: uppercase 12px header labels, monospace count badge (purple when valid, red on errors), clickable header row that collapses/expands the zone content, chevron icon with rotation animation. Cards grid uses `auto-fill, minmax(80px, 1fr)` for tighter wireframe-sized thumbnails. Hover controls resized to 22px compact buttons.

5. **MobileDeckBuilder** — Header now uses glassmorphic blur matching desktop toolbar. Game badge uses `color-mix()` for dynamic game-colored backgrounds. Bottom navigation tabs have brand-primary top border on active tab. Zone cards in the deck view use uppercase headers and mono count badges matching desktop.

6. **Test sweep** — All 742 tests pass (above 719+ baseline). DeckBrowsingPage tests (9), DeckViewPage tests (9), and all other test suites green. No tests needed modification from the visual polish changes.

## Verification

- `cd storefront && npx vitest run` — **742 tests pass** (73 test files, 0 failures)
- `cd storefront && npx vitest run src/components/decks/__tests__/DeckBrowsingPage.test.tsx` — 9 tests pass
- `cd storefront && npx vitest run src/components/decks/__tests__/DeckViewPage.test.tsx` — 9 tests pass
- `cd storefront && npm run build` — production build succeeds (no type errors, no build errors)
- Visual: deck builder pages require authentication — visual UAT comparison against wireframes at 1440px and 390px breakpoints deferred to manual review (backend not running)

## Diagnostics

- Inspect builder toolbar: `[data-testid="builder-toolbar"]` — check for glassmorphic background and grouped controls
- Inspect zone collapse state: `[data-testid="zone-header-main"]` — clicking toggles zone content visibility
- Zone count badge: monospace font, purple when valid, red when validation errors present
- DeckSurface tab switching: native button tabs, `activeTab` state drives content visibility

## Deviations

- Removed Radix `<Tabs>` dependency from DeckSurface — replaced with native styled tab bar. The Radix component was overkill for a two-tab toggle and didn't match the wireframe's visual language.
- Did not create separate `DeckBrowsingPage.test.tsx` as noted in the plan's file list — tests already existed from T01 with full structural coverage. Extended test count was already achieved.

## Known Issues

- Deck builder pages (`/decks/builder/new`, `/decks/[id]/edit`) require authentication and a running backend to render — visual browser verification not possible in isolated dev without auth session. Production build confirms component compilation and type-correctness.
- `color-mix()` CSS function used in MobileDeckBuilder game badge may not be supported in older browsers (Safari <16.4). Fallback values exist in the badge styling.

## Files Created/Modified

- `storefront/src/components/deck-builder/DeckBuilderLayout.tsx` — Glassmorphic toolbar with grouped undo/redo, styled import/export/save, inset shadow on card browser panel, refined collapse toggle
- `storefront/src/components/deck-builder/DeckSurface.tsx` — Replaced Radix Tabs with native styled tab bar, added useState import, Voltage surface tokens for stats card
- `storefront/src/components/deck-builder/DeckZone.tsx` — Collapsible zone headers with uppercase labels, mono count badges, ChevronIcon helper, wireframe-sized card grid, compact hover controls
- `storefront/src/components/deck-builder/MobileDeckBuilder.tsx` — Glassmorphic header, game-colored badges with color-mix, styled bottom navigation with active indicator, uppercase zone headers in deck view
- `storefront/src/components/deck-builder/DeckHeader.tsx` — No changes (already well-styled from prior work)
