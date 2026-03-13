# S03: Deck Builder, Browser & Viewer — Pixel Perfect — UAT

**Milestone:** M001
**Written:** 2026-03-13

## UAT Type

- UAT mode: mixed (artifact-driven + live-runtime + human-experience)
- Why this mode is sufficient: Structural correctness verified by 742 automated tests and successful build. Visual fidelity requires human comparison against wireframes at both breakpoints. Builder requires auth + running backend for live verification.

## Preconditions

- Storefront dev server running (`cd storefront && npm run dev`)
- For deck builder testing: backend running with auth session (Google/Discord OAuth or dev token)
- Wireframe files available for comparison: `docs/plans/wireframes/storefront-deck-browser.html`, `storefront-deck-viewer.html`, `storefront-deck-builder.html`

## Smoke Test

Navigate to `/decks` — page should render hero section with "Deck Discovery" headline, featured deck carousel below, game tabs (All/MTG/Pokémon/Yu-Gi-Oh!/One Piece), 3-column deck grid, and community stats banner at bottom.

## Test Cases

### 1. Deck Browser — Hero and Featured Carousel

1. Open `/decks` at 1440px viewport
2. Verify hero section has radial gradient background, "Deck Discovery" display headline, subtext, glassmorphic search bar with `Ctrl K` hint
3. Below hero, verify featured decks carousel shows 3 deck cards with card-fan art, game badges, author rows, stats, social counts
4. Verify carousel has left/right arrow buttons
5. **Expected:** Hero and carousel match `storefront-deck-browser.html` wireframe top sections

### 2. Deck Browser — Game Tabs and Grid

1. On `/decks` at 1440px, scroll to game tabs section
2. Verify 5 tabs: All, MTG, Pokémon, Yu-Gi-Oh!, One Piece
3. Click "MTG" tab — verify active state shows game-colored (purple) border-bottom and text
4. Verify deck grid below shows 3 columns of DeckGridCards
5. Each card: 4px game-colored accent bar at top, card-fan preview (3 fanned rectangles), deck name, game dot + format, author row, description (2-line clamp), stats row, social row
6. **Expected:** Grid cards match wireframe deck card styling. 3-col layout. Game tab colors match game identity.

### 3. Deck Browser — Pagination and Stats Banner

1. On `/decks`, scroll to bottom of grid
2. Verify numbered pagination with page buttons, prev/next arrows, active page in brand-primary
3. Below pagination, verify community stats banner: 4 numbers (decks built, active brewers, cards indexed, games supported) in mono font
4. **Expected:** Pagination and stats banner match wireframe bottom sections

### 4. Deck Browser — Mobile Layout (390px)

1. Resize viewport to 390px or use mobile emulation
2. Verify hero section scales (smaller fonts)
3. Verify game tabs scroll horizontally
4. Verify grid is 1 column
5. Verify deck cards hide description and social row on mobile
6. Featured carousel cards are narrower (300px)
7. **Expected:** Mobile layout matches wireframe mobile frames

### 5. Deck Viewer — Header and Tabs

1. Navigate to `/decks/[id]` for any existing deck
2. Verify hero header: gradient background, deck name in display font, game/format badges, author row with avatar, social stats (likes/copies/views), action buttons (Copy Deck, Buy All, Export, Like)
3. Verify tab bar below header: Visual / List / Stats tabs with brand-primary active indicator
4. Default tab should be Visual
5. **Expected:** Header and tab bar match `storefront-deck-viewer.html` wireframe

### 6. Deck Viewer — Visual View

1. On the Visual tab, verify cards display as image grid grouped by type (Creatures, Instants, Sorceries, etc.)
2. Each group has a header with type name and count
3. Cards show either actual card images or gradient placeholders with card name
4. Quantity badges in brand-primary for cards with qty > 1
5. Sideboard section exists (collapsed by default), click to expand
6. **Expected:** Visual view matches wireframe card grid layout

### 7. Deck Viewer — List View

1. Click "List" tab
2. Verify table with columns: Qty, Card Name, Mana Cost, Type, Price
3. Rows grouped by type with colored header rows (brand-primary text on surface-1 bg)
4. Total row at bottom with 2px brand-primary top border
5. **Expected:** List view matches wireframe table format

### 8. Deck Viewer — Stats Panel

1. Click "Stats" tab
2. Verify ManaCurveChart: bar chart with 0-6+ mana cost buckets, gradient bars, count labels, average CMC
3. Verify color distribution: horizontal stacked bar with color legend
4. Verify type distribution: horizontal bars with labels and counts
5. Verify pricing summary card at bottom
6. **Expected:** Stats panel matches wireframe statistics section

### 9. Deck Builder — Toolbar and Zones

1. Navigate to `/decks/builder/new` (requires auth)
2. Verify glassmorphic header toolbar: game selector, deck name input, undo/redo buttons grouped with separator, import/export buttons, save button with brand-primary accent when dirty
3. Verify card browser panel on left with inset shadow
4. Verify deck surface with Zones/List tab bar (matching viewer tab visual language)
5. Verify zone headers: uppercase labels, monospace count badges, clickable to collapse/expand
6. **Expected:** Builder layout matches `storefront-deck-builder.html` wireframe toolbar and panel styling

### 10. Deck Builder — Mobile

1. Open deck builder on 390px viewport
2. Verify glassmorphic header with game badge
3. Verify bottom navigation tabs with brand-primary active indicator
4. Verify zone cards use uppercase headers and mono count badges
5. **Expected:** Mobile builder matches wireframe mobile frames

## Edge Cases

### Empty Deck Grid

1. Apply game tab filter that returns 0 decks
2. **Expected:** Empty state renders with message and no broken layout

### Deck with No Card Images

1. View a deck where cards have no `image_uris`
2. **Expected:** Visual view shows gradient placeholders with card names (not broken images)

### Deck with No Stats

1. View a deck with no `stats` object populated
2. **Expected:** Stats panel computes from cards directly. ManaCurveChart shows bars even if all counts are 0.

### Zone Collapse Toggle

1. In deck builder, click a zone header to collapse
2. **Expected:** Zone content hides, chevron rotates. Click again to expand.

## Failure Signals

- Hero section missing or showing old "Deck Browser" h1 heading
- Grid showing 4 columns instead of 3 on desktop
- Game tabs not changing color on active state
- Viewer tabs not switching content (Visual/List/Stats)
- ManaCurveChart not rendering bars
- Builder toolbar showing unstyled buttons (no glassmorphic background)
- Zone headers not collapsible
- Mobile layout not switching to 1-column grid
- Community stats banner missing at bottom of browse page

## Requirements Proved By This UAT

- R005 (Deck browser pixel-perfect) — UAT cases 1-4 prove structural match to wireframe at both breakpoints
- R006 (Deck builder pixel-perfect) — UAT cases 9-10 prove toolbar, zones, and mobile alignment
- R007 (Deck viewer pixel-perfect) — UAT cases 5-8 prove header, tabs, visual/list/stats views

## Not Proven By This UAT

- "I own this" toggle and "Buy Missing Cards" flow — S09 scope
- Real card images in visual view — depends on deck data including image_uris
- Pricing/Comments tabs on viewer — deferred, no API endpoints
- Live featured decks data — placeholder only
- Win rate, tournament results, meta position in stats panel — not populated by API

## Notes for Tester

- Featured carousel and community stats use placeholder data — verify layout/styling, not data accuracy.
- Builder requires authentication. If no auth session exists, test cases 9-10 will redirect to login.
- Card-fan art is intentionally abstract gradient rectangles — this is the wireframe's representation, not missing images.
- `color-mix()` CSS in mobile builder game badges may render differently in Safari <16.4.
- The stats panel's win rate/tournament sections only appear when the deck object has those fields — it's expected that they're missing with current test data.
