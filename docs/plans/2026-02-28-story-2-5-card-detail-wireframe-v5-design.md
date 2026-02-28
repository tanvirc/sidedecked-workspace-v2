# Story 2-5 Card Detail Page — Wireframe v5 Design

**Date:** 2026-02-28
**Source:** Multi-agent user elicitation session (Players, Buyers, Deck Builders, Collectors)
**Supersedes:** Wireframe v4 (6-screen HTML, `_bmad-output/planning-artifacts/ux-story-2-5-card-detail-page-bff-endpoint-wireframe.html`)

---

## Elicitation Summary

### Participants

| Persona | Profile | Primary goal on this page |
|---------|---------|--------------------------|
| Alex (Player) | Competitive Standard/Pioneer | Understand what the card does — oracle text first |
| Maria (Buyer) | Casual impulse buyer | Find the cheapest price and buy quickly |
| Jordan (Deck Builder) | Commander / Modern | Check format legality, mana cost, add to a deck |
| Sam (Collector) | Seeks specific art prints | Browse prints, filter by treatment, check artist |

### Key Tensions Resolved

1. **Player vs Buyer priority conflict** — oracle text now lives in the sticky left column below the card image; buyers get their own sticky right column for the action panel. Neither group has to scroll past the other's primary content.
2. **Deck builder legality placement** — moved from bottom-of-page to above the listings table (natural reading order: "Can I play this?" before "How much does it cost?").
3. **Collector print browser** — vertical list kept (user preference over thumbnails) but enhanced with filter chips (Foil / Treatment / Sort) and artist name per row.
4. **Action panel overload** — split into three visually distinct sections (Quick Buy / Save / Price Insights) with clear hierarchy.

---

## Layout Architecture

### Desktop Grid (min-width: 900px)

```
grid-template-columns: 260px 1fr 268px;
gap: 24px;
align-items: start;
```

| Column | Sticky | Contents |
|--------|--------|----------|
| Left (260px) | `top: 68px` | Card image → oracle text → flavor text |
| Center (1fr) | No | Card identity → quick stats bar → print browser → listings → legality → rulings |
| Right (268px) | `top: 68px` | Quick Buy section → Save section → Price Insights |

### Content Column — Reading Order

1. **Card identity row** — game badge · rarity badge · foil/treatment badge
2. **Card name** (h1, 26px/800) + card type subtitle
3. **Quick stats bar** — mana pips (visual) · CMC · inline legality pills (colored ●/✕, not comma string)
4. **Print browser** — vertical list with filter strip; artist name per row; show/hide overflow
5. **All Listings table** — sortable (Price ↑ / Condition / Seller Rating); cheapest row highlighted
6. **Format Legality grid** — full pill grid (●Legal / ✕Banned / ○Illegal per format)
7. **Rulings accordion** — collapsible; official card rulings for competitive players

### Left Column — Player Zone

The left column mirrors a physical card: art above, text below. Card image is sticky at viewport top. Oracle text and flavor text sit immediately below — they scroll within the left column as the user reads.

- Card image: `aspect-ratio: 63/88`, `width: 100%`, foil/treatment overlay badge
- Oracle text box: same styling as current (bg-surface-2, italic, 13px)
- Flavor text: left-border, 12px tertiary, italic
- Stats (P/T, CMC, Mana Cost): small 3-chip grid below oracle — removed from duplicate in content column

### Right Column — Action Panel

Three clearly separated sections with visual hierarchy:

**Section 1 — Quick Buy** (gold accent border, primary)
- Print reference label (e.g., "MKM · #242")
- Price hero: "From $2.49" (26px mono, gold)
- Seller name + trust signal (star/percent + sale count)
- Condition chips (NM/LP/MP/HP) — with stock count badge, disabled chips for out-of-stock
- Qty stepper + "X available" inline label (caps at available stock)
- **Add to Cart** — primary gold CTA, full-width, aria-label with full context

**Section 2 — Save** (secondary, separated by divider)
- Inherits selected print + condition from Section 1
- Add to Deck (secondary btn, "Soon" badge until story 3-2)
- Add to Collection (secondary btn, "Soon" badge until collection story)
- Note: condition selection in Section 1 applies to both save actions

**Section 3 — Price Insights** (tertiary, optional)
- Market price range: Low / Mid / High across all listings
- 30-day trend indicator (e.g., ↑ +12% · 30d)
- Sourced from aggregated listing data — no external API needed initially

### Print Browser Enhancements

**Filter strip above list:**
```
[All ▼] [Foil] [Non-foil] [Treatment ▼]    Sort: [Price ↑] [Year ↓]
```

**Row format (enhanced from v4):**
```
● Set Name                              $2.49
  2024 · #242 · Foil · Artist: J. Murray
```

- Artist name on second line (important for collectors distinguishing art variants)
- Treatment tag (Foil, Etched, Borderless, Extended Art) as inline chip
- "No listings" rows shown but visually dimmed, no price column
- Show/hide overflow remains (show N more prints)

---

## Mobile Layout (< 768px)

Single column layout. Print browser stays as vertical list (same as desktop, no thumbnails).

**Sticky bottom action bar:**
- Row 1: Condition chip strip (horizontal scroll)
- Row 2: Price + seller · [Add to Cart] primary (flex: 2) · [Deck] + [Collection] secondary (flex: 1 each, stacked, min 44px touch target)

**Content order (top to bottom):**
1. Card image (max-height: 200px, centered)
2. Card identity row
3. Quick stats bar (scrolls horizontally if needed)
4. Tab chip row: **[Card Info]** · **[Legality]** — lazy surfaces oracle text and legality without deep scroll
5. Print browser (vertical list)
6. Listings table
7. (Legality grid hidden — surfaced via tab)
8. Rulings accordion

---

## Changes From v4

| # | v4 Behavior | v5 Change | Rationale |
|---|-------------|-----------|-----------|
| 1 | 2-column grid (image \| content) | 3-column grid (image+oracle \| content \| action) | Each user group gets a dedicated zone |
| 2 | Oracle text in content column, below buy UI | Oracle text in left column, below card image | Physical card metaphor; player doesn't scroll past buy UI |
| 3 | Nested `prints-action-grid` (2-col within content) | Print browser full-width in content col; action panel in own col | Removes confusing nested 2-within-2 layout |
| 4 | Print list: text-only, no filters | Print list: filter strip + artist name per row | Collector feedback |
| 5 | Legality at bottom of page | Legality above listings | Deck builder feedback — check legality before price |
| 6 | Action panel: Buy + Deck + Collection undifferentiated | Action panel: 3 clearly separated sections | Buyer feedback — Add to Cart was competing with secondary actions |
| 7 | Quick stats bar: comma-separated legality string | Quick stats bar: colored pills per format | Jordan (Deck Builder) feedback — pills scannable, string is not |
| 8 | No rulings section | Rulings accordion below legality | Alex (Player) feedback — critical for competitive play |
| 9 | No price trend data | Price Insights section in right col | Maria (Buyer) + Sam (Collector) feedback |
| 10 | Mobile: 11px secondary touch targets | Mobile: 44px min touch targets | Maria (Buyer) mobile feedback |
| 11 | Mobile: legality buried in scroll | Mobile: Legality tab chip | Jordan (Deck Builder) mobile feedback |

---

## Out of Scope (Future Stories)

- Art thumbnails per print row (requires image storage per print SKU)
- "Often paired with" / similar cards section (requires ML/recommendation service)
- Add to Deck (story 3-2)
- Add to Collection (future collection story)
- Price history chart

---

## Wireframe Deliverable

Updated wireframe: `_bmad-output/planning-artifacts/ux-story-2-5-card-detail-page-bff-endpoint-wireframe.html` (v5)

Screens:
1. Primary — 3-column desktop, full state
2. Print switching — print list filter + selection update
3. No stock — no listings for selected print
4. Degraded — backend unavailable, catalog-only mode
5. Loading — skeleton state
6. Mobile — single column + sticky bottom bar + tab chips
