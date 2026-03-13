---
id: M001
title: MVP Core Loop
slices_complete: 6
slices_total: 10
updated_at: 2026-03-14
---

# M001: MVP Core Loop — Progress Summary

**6 of 10 slices complete.** Storefront visual foundation, all card/deck/homepage/auth pages pixel-aligned to Voltage wireframes, and all 33 wireframes generated for remaining pages.

## Completed Slices

### S01: Voltage Design System Foundation
Footer rewritten to wireframe spec, PriceTag uses tabular figures, zero hardcoded light-mode colors in shared components, toast migration confirmed, 794 tests passing.

### S02: Card Browse, Detail & Search — Pixel Perfect
`/cards`, `/cards/[id]`, `/search` restructured to match wireframes — 16 new/modified components, shared CardSearchGrid, numbered pagination, glass-card blur, mobile 4-tab nav, 719 tests passing.

### S03: Deck Builder, Browser & Viewer — Pixel Perfect
All three deck-facing pages match wireframes — browser with hero/carousel/game tabs/3-col grid, viewer with tabbed Visual/List/Stats, builder with glassmorphic toolbar and collapsible zones. 794 tests pass.

### S04: Homepage — Pixel Perfect + Live Data
All six homepage sections pixel-aligned, TrendingStrip wired to live API with 8-card curated fallback using real card images.

### S05: Auth, Profile & OAuth Providers
Cinematic split-screen auth pages, glassmorphic AuthGateDialog, profile page with hero banner and 4-tab hash-routed layout, Google/Discord OAuth providers registered. 794 tests pass.

### S06: Wireframe Generation & Figma Export
24 new HTML wireframes (33 total) covering all remaining storefront pages. All pass 5/5 automated consistency checks. Figma export blocked on MCP auth — HTML wireframes remain authoritative per D003.

## Remaining Slices

- **S07:** Remaining Pages — Visual Alignment (depends: S01, S06)
- **S08:** 3-Step Seller Listing Wizard (depends: S01, S05)
- **S09:** Cart Optimizer & Deck-to-Cart Flow (depends: S02, S03, S08)
- **S10:** Integration & Polish (depends: S09)

## Key Patterns Established
- Voltage token system with `:root` CSS variables, dark-mode only
- sd-nav.js + ModernHeader for consistent navigation
- Glass-card/glassmorphic UI patterns across all pages
- `data-component` attributes mapping wireframes to React component names
- Layout families: standard (nav+footer), checkout (minimal header), auth-adjacent (centered card), user-account (sidebar nav), seller (dashboard tabs)
- Copy boilerplate from storefront-homepage.html for token consistency

## Key Decisions (recent)
- D003: HTML wireframes are authoritative alignment targets
- D024: Wireframes grouped by layout family for efficiency
- D025: Figma export decoupled from wireframe generation

## Test Status
794 tests passing, production build clean, zero lint errors.

## Drill-Down Paths
- `.gsd/milestones/M001/slices/S01/S01-SUMMARY.md`
- `.gsd/milestones/M001/slices/S02/S02-SUMMARY.md`
- `.gsd/milestones/M001/slices/S03/S03-SUMMARY.md`
- `.gsd/milestones/M001/slices/S04/S04-SUMMARY.md`
- `.gsd/milestones/M001/slices/S05/S05-SUMMARY.md`
- `.gsd/milestones/M001/slices/S06/S06-SUMMARY.md`
