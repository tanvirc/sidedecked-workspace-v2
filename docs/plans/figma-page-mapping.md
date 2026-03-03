# Figma Page Mapping — SideDecked Storefront

**File:** [SideDecked Storefront](https://www.figma.com/design/k5seLEn5Loi0YJ6UrJvzpr)
**File Key:** `k5seLEn5Loi0YJ6UrJvzpr`
**Date:** 2026-03-02

---

## Target Page Structure

Reorganize the single "Page 1" into per-epic pages. Page 1 becomes an archive of original captures. New wireframe captures and refined story wireframes target the correct epic page by node ID.

| Figma Page Name | Wireframe Frames | Source HTMLs | Node ID |
|-----------------|-----------------|-------------|---------|
| `Archive — Original Captures` | All 12 original frames | (was Page 1) | TBD — rename existing Page 1 |
| `00 — Design System` | Voltage tokens reference | Extract from `storefront-homepage.html` or design system plan | TBD |
| `01 — Epic 1: Auth & Profiles` | Auth, Profile | `storefront-auth.html`, `storefront-profile.html` | TBD |
| `02 — Epic 2: Card Catalog` | Cards Browse, Search, Card Detail | `storefront-cards.html`, `storefront-search.html`, `storefront-card-detail.html` | TBD |
| `03 — Epic 3: Deck Building` | Deck Builder, Deck Browser, Deck Viewer | `storefront-deck-builder.html`, `storefront-deck-browser.html`, `storefront-deck-viewer.html` | TBD |
| `04 — Epic 4: Seller Listing` | (future) | (no wireframes yet) | TBD |
| `05 — Epic 5: Commerce` | (future) | (no wireframes yet) | TBD |
| `09 — Epic 9: Homepage` | Homepage | `storefront-homepage.html` | TBD |

Pages 06-08 and 10-11 will be created as wireframes are produced for those epics.

---

## Manual Setup Steps (Figma)

### Step 1: Rename Page 1
1. Open the Figma file
2. Right-click "Page 1" → Rename → `Archive — Original Captures`

### Step 2: Create Epic Pages
Create each page listed above (right-click page list → Add page). Name them exactly as shown.

### Step 3: Copy Frames to Epic Pages
For each epic page, select the relevant frames from the Archive page and move (Cut → Paste) to the correct epic page:

| Target Page | Frames to Move (by wireframe name in original captures) |
|-------------|--------------------------------------------------------|
| `01 — Epic 1` | Auth wireframe frames, Profile wireframe frames |
| `02 — Epic 2` | Cards Browse frames, Search frames, Card Detail frames |
| `03 — Epic 3` | Deck Builder frames, Deck Browser frames, Deck Viewer frames |
| `09 — Epic 9` | Homepage wireframe frames |

### Step 4: Record Node IDs
After reorganizing, record each page's node ID:
1. Click on the page name
2. The URL will show `?node-id=X:Y` — that's the page node ID
3. Update this document with the actual node IDs in the table above

### Step 5: Verify
- Each epic page contains only its wireframes
- Archive page is empty or contains only deprecated frames
- All frame positions are reasonable (re-arrange if needed after paste)

---

## Capture Targeting Convention

When capturing **new** wireframes (e.g., refined story wireframes from Task 3), target the correct epic page:

```
generate_figma_design({
  outputMode: 'existingFile',
  fileKey: 'k5seLEn5Loi0YJ6UrJvzpr',
  nodeId: '<epic-page-node-id>'   // from table above
})
```

Without `nodeId`, captures land on the default page. Always specify the epic page node ID.

---

## Wireframe → Page Assignment

| Wireframe File | Epic Page | Stories Covered |
|----------------|-----------|----------------|
| `storefront-homepage.html` | `09 — Epic 9: Homepage` | 9-1, 9-2 |
| `storefront-auth.html` | `01 — Epic 1: Auth & Profiles` | 1-1, 1-4 |
| `storefront-profile.html` | `01 — Epic 1: Auth & Profiles` | 1-2 |
| `storefront-cards.html` | `02 — Epic 2: Card Catalog` | 2-2, 2-3, 2-4 |
| `storefront-search.html` | `02 — Epic 2: Card Catalog` | 2-3 |
| `storefront-card-detail.html` | `02 — Epic 2: Card Catalog` | 2-5 |
| `storefront-deck-builder.html` | `03 — Epic 3: Deck Building` | 3-1, 3-2, 3-3, 3-4 |
| `storefront-deck-browser.html` | `03 — Epic 3: Deck Building` | 3-6 |
| `storefront-deck-viewer.html` | `03 — Epic 3: Deck Building` | 3-5 |

### Refined Story Wireframes (Task 3 outputs)

| Refined Wireframe | Epic Page | Stories |
|-------------------|-----------|---------|
| `ux-9-1-9-2-homepage-wireframe.html` | `09 — Epic 9` | 9-1 + 9-2 |
| `ux-1-1-social-oauth-wireframe.html` | `01 — Epic 1` | 1-1 |
| `ux-1-2-user-profile-wireframe.html` | `01 — Epic 1` | 1-2 |
| `ux-1-4-deferred-auth-wireframe.html` | `01 — Epic 1` | 1-4 |
| `ux-2-2-card-display-wireframe.html` | `02 — Epic 2` | 2-2 |
| `ux-2-3-2-4-search-filters-wireframe.html` | `02 — Epic 2` | 2-3 + 2-4 |
| `ux-2-5-card-detail-wireframe.html` | `02 — Epic 2` | 2-5 |

---

## Node ID Registry

Update this section after completing the manual Figma reorganization:

```yaml
# Figma page node IDs — update after manual setup
pages:
  archive: ""           # Archive — Original Captures
  design-system: ""     # 00 — Design System
  epic-1-auth: ""       # 01 — Epic 1: Auth & Profiles
  epic-2-catalog: ""    # 02 — Epic 2: Card Catalog
  epic-3-decks: ""      # 03 — Epic 3: Deck Building
  epic-4-seller: ""     # 04 — Epic 4: Seller Listing
  epic-5-commerce: ""   # 05 — Epic 5: Commerce
  epic-9-homepage: ""   # 09 — Epic 9: Homepage
```
