# Wireframe Creation Standard

All storefront wireframes must follow this standard to ensure visual and structural consistency with the existing 9 wireframes.

---

## 1. File Conventions

- **Location:** `docs/plans/wireframes/storefront-{page-name}.html`
- **Self-contained:** Single HTML file with all CSS inline (no external stylesheets)
- **External dependencies (only):** `sd-nav.js` (local) and Google Fonts
- **Figma capture script:** Include in `<head>`:
  ```html
  <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
  ```
- **Title format:** `SideDecked — {Page Name} Wireframe (Voltage)`
- **HTML lang attribute:** `<html lang="en" class="dark">`
- **Google Fonts:** Barlow Condensed (500-800), Barlow (400-700), Inter (400-700), DM Mono (400-500)

---

## 2. Frame Structure

Side-by-side desktop + mobile frames on a shared canvas.

- **Canvas:** `display: flex`, `gap: 80px`, `padding: 60px`, `align-items: flex-start`, `justify-content: center`
- **Desktop frame:** 1440px wide, `border-radius: var(--radius-xl)` (20px), `background: var(--bg-base)`, 1px `--border-default` border
- **Mobile frame:** 390px wide, `border-radius: 40px`, 3px `--border-strong` border, `min-height: 844px`
- **Mobile notch:** `::before` pseudo-element — 126px wide, 28px tall, centered at top, `border-radius: 0 0 18px 18px`
- **Frame labels:** `.frame-label` using `--font-display`, uppercase, with `.dim` badge showing pixel dimensions (e.g., `1440 x 3200`)

---

## 3. Required CSS Sections (in order)

Separate all sections with comment headers:

```css
/* =============================================
   SECTION NAME
   ============================================= */
```

**Mandatory sections:**

1. **Voltage Design Tokens** — `:root` block with all token variables (copy from existing wireframe)
2. **Reset + Base** — box-sizing reset, body font/background/color
3. **Wireframe Canvas** — `.canvas`, `.frame-label`, `.dim`
4. **Desktop Frame** — `.desktop-frame` (1440px)
5. **Mobile Frame** — `.mobile-frame` with `::before` notch
6. **Annotation Badges** — `.annotation` + color variants
7. **Page-specific sections** — organized by UI region

---

## 4. Voltage Design Tokens

Copy the full `:root` block from an existing wireframe. Required token categories:

| Category | Variables |
|----------|-----------|
| Brand | `--brand-primary`, `--brand-secondary`, `--brand-primary-subtle`, `--brand-secondary-subtle` |
| Backgrounds | `--bg-base`, `--bg-surface-1` through `--bg-surface-4` |
| Text | `--text-primary`, `--text-secondary`, `--text-tertiary` |
| Borders | `--border-default`, `--border-strong` |
| Semantic | `--positive`, `--negative`, `--warning`, `--info`, `--interactive` |
| Game colors | `--game-mtg`, `--game-pokemon`, `--game-ygo`, `--game-op` |
| Typography | `--font-display`, `--font-heading`, `--font-body`, `--font-mono` |
| Radii | `--radius-sm` (6px), `--radius-md` (10px), `--radius-lg` (14px), `--radius-xl` (20px) |

---

## 5. Template Selection

Start from the closest existing wireframe rather than building from scratch:

| Page Type | Template | Examples |
|-----------|----------|----------|
| Section-heavy landing | `storefront-homepage.html` | Marketing pages, game hubs |
| Filter + grid browse | `storefront-search.html` or `storefront-cards.html` | Catalog, marketplace listings |
| Detail page | `storefront-card-detail.html` | Product detail, order detail |
| Form / auth flow | `storefront-auth.html` | Login, registration, checkout |
| Dashboard layout | `storefront-profile.html` | Settings, account, vendor dashboard |
| Workspace / tool | `storefront-deck-builder.html` | Editors, builders, split panels |
| Community browse | `storefront-deck-browser.html` | Forums, user content grids |
| Read-only detail | `storefront-deck-viewer.html` | Shared content, public profiles |

Reuse existing CSS patterns; do not invent new layout systems when one already exists.

---

## 6. Navigation Integration

### Desktop

```html
<div id="sd-nav-root"></div>
<script src="sd-nav.js"></script>
<script>SdNav.init({ activeLink: '/cards', searchContent: 'pill' });</script>
```

### Mobile

```html
<div id="sd-nav-mobile"></div>
<script>SdNav.init({ target: '#sd-nav-mobile', mobile: true, activeLink: '/cards', searchContent: 'pill' });</script>
```

### Options

| Option | Values | Default | Notes |
|--------|--------|---------|-------|
| `activeLink` | `'/'`, `'/cards'`, `'/decks'`, etc. | none | Highlights current page in nav |
| `searchContent` | `'pill'`, `'expanded'` | `'pill'` | Use `'expanded'` only for search page |
| `variant` | `'default'`, `'workspace'` | `'default'` | Use `'workspace'` for deck builder |
| `mobile` | `true`, `false` | `false` | Renders mobile nav variant |
| `target` | CSS selector | `'#sd-nav-root'` | Mount point for nav component |

---

## 7. Annotation System

All wireframes must include development annotations using absolutely positioned badges.

### Base CSS

```css
.annotation {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  background: var(--brand-secondary);
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 40;
  pointer-events: none;
  line-height: 1.3;
}
```

### Annotation Types

| Type | CSS Class | Color Variable | Text Color | Purpose | Example |
|------|-----------|----------------|------------|---------|---------|
| Component | `.annotation.violet` | `--brand-primary` | white | React component name | `<GameSelectorStrip />` |
| API | `.annotation.green` | `--positive` | white | API endpoint | `GET /api/cards/browse` |
| Behavior | `.annotation.blue` | `--info` | white | UX behavior note | `persists via cookie` |
| Breakpoint | `.annotation.orange` | `--warning` | black | Responsive rule | `4-col -> 2 @ 640px` |

### Inline Annotations

For annotations that flow with content rather than being absolutely positioned:

```css
.annotation--inline {
  position: relative;
  display: inline-flex;
  margin-left: 12px;
}
```

### Hover State Annotation

Annotate hover states on the first interactive item using a `::after` pseudo-element with `--brand-secondary` dashed border.

---

## 8. Required States

Each wireframe should include these states (where applicable):

### Loading / Skeleton State

Animated gradient pulse showing shimmer loading pattern:

```css
.skeleton {
  background: linear-gradient(90deg, var(--bg-surface-2) 25%, var(--bg-surface-3) 50%, var(--bg-surface-2) 75%);
  background-size: 200% 100%;
  animation: pulse 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}
@keyframes pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

Show 2-4 skeleton cards in the grid to represent loading state.

### Empty State

Zero-results UI containing:
- Icon or illustration (SVG inline or placeholder)
- Primary message (e.g., "No cards found")
- Suggestion text (e.g., "Did you mean...?")
- Clear-filters CTA button

### Hover State

Annotate hover effects on the first interactive item (card, row, button). Show the hover treatment and add a behavior annotation describing the effect (e.g., `hover: glass border + shadow`).

---

## 9. Mobile Conventions

| Pattern | Desktop | Mobile |
|---------|---------|--------|
| Card grid | 4 columns | 2 columns |
| Filter panel | Sidebar | Bottom sheet (`.m-sheet-overlay` + `.m-sheet`) |
| Category pills | Horizontal row | Horizontal scroll |
| Pagination | Numbered pages | "Load More" button |
| Card info | Full (name, price, seller, condition) | Condensed (name + price) |
| Annotations | Visible | Hidden (`.mobile-frame .annotation { display: none; }`) |
| Sort/filter controls | Inline | Sticky top bar |

### Mobile Bottom Sheet Pattern

```css
.m-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 100;
}
.m-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-surface-1);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}
```

---

## 10. Section Comments

Separate all major HTML sections with block comments:

```html
<!-- ===== SECTION NAME ===== -->
```

Use for: navigation, hero/header areas, filter panels, content grids, loading states, empty states, footer sections, mobile-specific sections.

---

## 11. Card Grid Pattern (TCG-Specific)

When displaying card items in a grid, each card should include:

| Element | Details |
|---------|---------|
| Card image | 5:7 aspect ratio placeholder with `.img-label` text |
| Game badge | Colored dot (`--game-mtg`, `--game-pokemon`, etc.) + 3-letter abbreviation |
| Card name | `--font-heading`, `--text-primary` |
| Set name | `--text-tertiary`, smaller font |
| Condition badge | Inline badge with color coding (see below) |
| Price | `--font-mono` (DM Mono), `--text-primary` |
| Seller info | `--text-tertiary` (desktop only, hidden on mobile) |
| Add-to-cart | Button or icon |

### Condition Color Coding

| Grade | Color Variable | Meaning |
|-------|---------------|---------|
| NM | `--positive` | Near Mint |
| LP | `--warning` | Lightly Played |
| MP | `--brand-secondary` | Moderately Played |
| HP | `--negative` | Heavily Played |
| DMG | `--negative` | Damaged |

---

## 12. Figma Capture Process

After creating the wireframe HTML:

1. **Start local server:**
   ```bash
   npx http-server docs/plans/wireframes -p 3030 --cors
   ```

2. **Initiate capture:** Call `generate_figma_design` with:
   - `outputMode: 'existingFile'`
   - `fileKey: 'k5seLEn5Loi0YJ6UrJvzpr'` (SideDecked Storefront)

3. **Open capture URL** in browser with `?figmadelay=3000` to allow fonts and nav to load

4. **Poll `captureId`** every 5 seconds until status is `'completed'`

5. **Stop the local server** after capture completes

---

## 13. Story Coverage Verification

Every wireframe must include a story coverage table (as an HTML comment or visible section) mapping wireframe sections to story acceptance criteria:

```
| Story | AC | Section | Coverage |
|-------|-----|---------|----------|
| 2-1-1 | AC1 | Game selector strip | Full |
| 2-1-1 | AC3 | Category pills | Full |
```

This ensures the wireframe covers all requirements from the associated stories.

---

## 14. Existing Wireframes Reference

| Page | File | Good Template For |
|------|------|-------------------|
| Homepage | `storefront-homepage.html` | Section-heavy pages, game grids, trending strips, seller CTA |
| Search | `storefront-search.html` | Filter sidebars, card grids, pagination, mobile bottom sheets |
| Card Detail | `storefront-card-detail.html` | Detail pages, tabbed content |
| Auth | `storefront-auth.html` | Form pages, OAuth flows |
| Profile | `storefront-profile.html` | Dashboard layouts, stats, tabs |
| Deck Builder | `storefront-deck-builder.html` | Workspace layouts, split panels |
| Deck Browser | `storefront-deck-browser.html` | Browse grids, community content |
| Deck Viewer | `storefront-deck-viewer.html` | Read-only detail, card lists |
| Card Browse | `storefront-cards.html` | Filter + browse, game selectors, category pills |
