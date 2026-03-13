# S03: Deck Builder, Browser & Viewer — Pixel Perfect — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven + human-experience)
- Why this mode is sufficient: Structural correctness verified by 794 passing tests and successful production build. Visual fidelity requires human comparison against wireframes at both breakpoints.

## Preconditions

- Storefront dev server running (`cd storefront && npm run dev`)
- For deck browser/viewer: no auth required (public pages)
- For deck builder: authenticated session required + backend running (Medusa + customer-backend)
- Wireframes available at `docs/plans/wireframes/storefront-deck-browser.html`, `storefront-deck-viewer.html`, `storefront-deck-builder.html`

## Smoke Test

Navigate to `/decks` — hero section with gradient background, featured carousel with card-fan deck cards, game tabs bar, and 3-column deck grid should render without errors. Page should feel visually rich, not a flat list.

## Test Cases

### 1. Deck Browser — Desktop (1440px)

1. Open `/decks` at 1440px viewport
2. Open `docs/plans/wireframes/storefront-deck-browser.html` desktop frame side-by-side
3. Compare hero section: radial gradient background, "Deck Discovery" display headline, subtext, glassmorphic search bar with Ctrl+K hint
4. Compare featured carousel: horizontal scroll with card-fan deck cards, game badges, featured badge, stats, social counts, left/right arrows
5. Compare game tabs: All + 4 game tabs with game-colored active state (border-bottom + text)
6. Compare deck grid: 3-column layout, each card has 4px accent bar, card-fan preview, deck name, game dot + format, author, description, stats row, social row
7. Compare pagination: numbered page buttons with brand-primary active state, prev/next, showing count
8. Compare community stats banner: 4-column mono numbers section at bottom
9. **Expected:** All sections match wireframe layout, spacing, and visual hierarchy at 1440px

### 2. Deck Browser — Mobile (390px)

1. Open `/decks` at 390px viewport
2. Open wireframe mobile frame side-by-side
3. Verify hero responsive sizing (smaller headline, full-width search)
4. Verify featured carousel horizontal scroll with hidden nav arrows
5. Verify game tabs horizontal scroll
6. Verify 1-column deck grid with description and social rows hidden
7. **Expected:** Mobile layout matches wireframe — single column, horizontal scrolling tabs/carousel

### 3. Deck Viewer — Desktop (1440px)

1. Navigate to `/decks/[id]` with a deck containing cards
2. Open `storefront-deck-viewer.html` desktop frame side-by-side
3. Compare header: card-fan visual with gradient background, deck name (display font), game/format badges, author row, social stats, action buttons
4. Verify tab bar: Visual/List/Stats tabs with glassmorphic bar and brand-primary active indicator
5. Click Visual tab: card image grid grouped by type, quantity badges, collapsible sideboard section
6. Click List tab: table with type-grouped rows, mana cost column, price column, total row
7. Click Stats tab: ManaCurveChart with bar chart, color distribution stacked bar, type distribution bars, pricing summary
8. **Expected:** Viewer matches wireframe structure. Tab switching works smoothly. Stats render correctly.

### 4. Deck Viewer — Mobile (390px)

1. Open viewer page at 390px
2. Verify tabs are horizontally scrollable
3. Verify visual view shows 2-column card grid
4. Verify list view table scrolls horizontally if needed
5. **Expected:** Mobile layout is usable, tabs accessible, content fits viewport

### 5. Deck Builder — Desktop (1440px)

1. Navigate to `/decks/builder/new` (requires auth)
2. Open `storefront-deck-builder.html` desktop frame side-by-side
3. Compare toolbar: glassmorphic header bar, undo/redo grouped with separator, import/export buttons, save button with accent glow
4. Compare card browser panel: left panel with inset shadow, search functionality
5. Compare deck surface: Zones/List tab bar matching viewer tab pattern, zone headers with uppercase labels, mono count badges, collapse chevron
6. Collapse/expand a zone: verify chevron rotates, content hides/shows
7. Compare card thumbnails: wireframe sizing, compact hover controls
8. **Expected:** Builder matches wireframe toolbar, panel, and zone styling

### 6. Deck Builder — Mobile (390px)

1. Open builder at 390px (requires auth)
2. Verify glassmorphic header with game-colored badge
3. Verify bottom navigation tabs with brand-primary active indicator
4. Verify zone cards in deck view have uppercase headers and mono count badges
5. **Expected:** Mobile builder feels polished and consistent with desktop design language

## Edge Cases

### Empty Deck Browser

1. Filter to a game with no decks (or clear all results)
2. **Expected:** Empty state renders with Voltage styling, not a blank page

### Deck with No Card Images

1. View a deck where cards lack `image_uris`
2. **Expected:** Gradient placeholders render in visual view (colored by card type), not broken images

### Mana Curve with All Same Cost

1. View a deck where all cards have the same mana cost
2. **Expected:** ManaCurveChart renders with one tall bar and rest at zero, no layout breaks

### Sideboard Toggle

1. In visual view, find the sideboard section
2. Click sideboard toggle button
3. **Expected:** Sideboard expands/collapses with smooth transition, toggle state is clear

## Failure Signals

- Hero section missing or flat gray background instead of radial gradient
- Featured carousel showing empty or broken cards
- Game tabs not responding to clicks or not showing game-colored active states
- Deck grid showing 4 columns instead of 3 on desktop
- Card-fan preview missing from grid cards (showing nothing where fanned cards should be)
- Viewer tabs not switching content when clicked
- ManaCurveChart showing no bars or broken layout
- Builder toolbar looking like a plain header instead of glassmorphic blur
- Zone headers not collapsible or missing count badges
- Mobile bottom navigation missing active indicator styling
- Any console errors on page load

## Requirements Proved By This UAT

- R005 (Deck browser pixel-perfect) — browser page structurally matches wireframe at both breakpoints
- R006 (Deck builder pixel-perfect) — builder polished to wireframe styling (toolbar, zones, thumbnails, mobile)
- R007 (Deck viewer pixel-perfect) — viewer matches wireframe with tabbed layout, stats, distributions

## Not Proven By This UAT

- R006 "I own this" toggle state management — deferred to S09
- R006 "Buy Missing Cards" button wired to optimizer — deferred to S09
- Live featured decks data — currently placeholder
- Live community stats — currently placeholder
- Pricing data in list view — depends on API availability
- Win rate / tournament data in stats panel — depends on data population

## Notes for Tester

- Featured carousel and community stats banner show placeholder data — this is expected for S03. Real data wiring happens in later slices.
- Deck builder pages require authentication — you need a running backend and logged-in session to access `/decks/builder/new` or `/decks/[id]/edit`.
- Card images in visual view will show colored gradient placeholders unless the deck data includes `image_uris` on card objects — this matches the wireframe's card representation style.
- The "Buy Missing Cards" and "Copy Deck" buttons in the viewer header are visually present but not wired to backend actions yet (S09 scope).
- `color-mix()` CSS may not render correctly in Safari <16.4 — check MobileDeckBuilder game badges in older Safari if that's a target browser.
