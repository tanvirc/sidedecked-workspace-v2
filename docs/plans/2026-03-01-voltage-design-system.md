# Voltage Design System

**Date:** 2026-03-01
**Branch:** design/voltage
**Status:** Implemented

## Overview

Full replacement of the "Midnight Forge" design system (warm bronze-gold on near-black) with "Voltage" — Electric Violet + Neon Coral. The redesign targets a vibrant, modern identity that serves competitive players and differentiates SideDecked from competitors (TCGplayer, Cardmarket).

## Brand Concept

Tournament energy meets late-night game store. Electric Violet is the strategic depth of a master player — precise, powerful, intentional. Neon Coral is the excitement of a tournament pull. Together: alive.

## Color System

### Brand Palette

| Token | Light Mode | Dark Mode | Use |
|---|---|---|---|
| `--brand-primary` | `#7C3AED` | `#8B5CF6` | Brand, active states, selected |
| `--brand-secondary` | `#FF6B35` | `#FF7849` | CTAs, highlights, prices, urgency |
| `--brand-primary-subtle` | `#EDE9FE` | `#1E1A3A` | Tints, hover backgrounds |
| `--brand-secondary-subtle` | `#FFF0EB` | `#2A1A12` | CTA hover tints |

### Dark Mode Surfaces (default)

| Token | Value | Use |
|---|---|---|
| `--bg-base` | `#09090F` | Root background |
| `--bg-surface-1` | `#18162A` | Cards, panels |
| `--bg-surface-2` | `#21203A` | Input fields, wells |
| `--bg-surface-3` | `#2C2A4A` | Hover states |
| `--bg-surface-4` | `#38365C` | Active selections |
| `--text-primary` | `#F0EEFF` | Headings, primary text |
| `--text-secondary` | `#B8B0D8` | Body copy, descriptions |
| `--text-tertiary` | `#7B72A8` | Placeholder, metadata |
| `--border-default` | `#2C2A4A` | Card borders |
| `--border-strong` | `#4A4680` | Focused borders |

### Light Mode Surfaces

| Token | Value | Use |
|---|---|---|
| `--bg-base` | `#FAF9FF` | Root background |
| `--bg-surface-1` | `#FFFFFF` | Cards, panels |
| `--bg-surface-2` | `#F3F0FF` | Input fields, wells |
| `--text-primary` | `#12103A` | Headings |
| `--text-secondary` | `#3D3760` | Body copy |
| `--border-default` | `#DDD8F5` | Card borders |

### Semantic Colors

| Token | Value | Use |
|---|---|---|
| `--positive` | `#10B981` | Success, gains |
| `--negative` | `#EF4444` | Error, losses |
| `--warning` | `#F59E0B` | Warning |
| `--info` | `#3B82F6` | Info |

### Game-Specific Colors

| Game | Token | Dark Value |
|---|---|---|
| Magic: The Gathering | `--game-mtg` | `#A78BFA` |
| Pokémon | `--game-pokemon` | `#FCD34D` |
| Yu-Gi-Oh! | `--game-yugioh` | `#60A5FA` |
| One Piece TCG | `--game-optcg` | `#34D399` |

### Rarity Tokens

All 20 rarity tokens recalibrated to pass WCAG AA contrast:
- Dark mode: calibrated for `--bg-surface-1: #18162A`
- Light mode: calibrated for `--bg-surface-1: #FFFFFF`

## Typography System

| Role | Font | Weights |
|---|---|---|
| Display / Hero | Barlow Condensed | 600, 700, 800 |
| Headings (h1–h3) | Barlow Condensed | 600 |
| Headings (h4–h6) | Barlow | 500, 600 |
| Body | Inter | 400, 500 |
| Stats / Price | DM Mono | 400, 500 |

### Type Scale

```css
.display-lg { font: 800 72px/1.05 Barlow Condensed; letter-spacing: -0.02em; }
.display-md { font: 700 56px/1.1  Barlow Condensed; letter-spacing: -0.02em; }
.heading-xl  { font: 600 40px/1.15 Barlow Condensed; }
.heading-lg  { font: 600 32px/1.2  Barlow Condensed; }
.heading-md  { font: 600 24px/1.25 Barlow; }
.heading-sm  { font: 600 20px/1.3  Barlow; }
.heading-xs  { font: 600 16px/1.4  Barlow; }
```

## Motion & Effects

| Effect | Spec | Use |
|---|---|---|
| Card hover glow | `box-shadow: 0 0 24px rgba(139,92,246,0.4)` | Card components on hover |
| Brand pulse | `@keyframes brand-pulse` on brand-primary | Loading states |
| Transition default | `150ms ease-out` | All interactive transitions |
| Gradient sweep | `@keyframes gradient-sweep` | Hero sections, banners |

## Figma Files

| File | Key | URL |
|---|---|---|
| Voltage Design System | `QNFLTck7Bpd3OmJjwktKBf` | https://www.figma.com/design/QNFLTck7Bpd3OmJjwktKBf |
| SideDecked Storefront | `k5seLEn5Loi0YJ6UrJvzpr` | https://www.figma.com/design/k5seLEn5Loi0YJ6UrJvzpr |

- **Voltage DS file** — dark + light mode captures of all 10 design system sections
- **Storefront file** — 8 page wireframes (Homepage, Search, Card Detail, Auth, Profile, Deck Builder, Deck Browser, Deck Viewer) with desktop + mobile variants
- Source HTML: `docs/plans/wireframes/storefront-*.html` (shared nav via `sd-nav.js`)

## Files Changed

| File | Change |
|---|---|
| `storefront/src/app/colors.css` | Full token replacement — Midnight Forge → Voltage |
| `storefront/src/app/globals.css` | Updated type scale, `.price`, `.accent-cta-btn`, added `.card-glow`, Voltage keyframes |
| `storefront/tailwind.config.ts` | Replaced `rajdhani` font alias with `barlow-condensed` + `barlow`; added `heading` alias |
| `storefront/src/app/layout.tsx` | Replaced `Rajdhani` font import with `Barlow_Condensed` + `Barlow` |
| `storefront/src/components/tcg/CardDisplay.tsx` | Added `card-glow` class to Gallery and Grid variants |
| `docs/plans/voltage-preview.html` | Standalone design preview (10 sections, dark/light toggle) |

## Verification

- Build: 0 errors
- Tests: 620/620 passing
- Lint: 0 errors
- WCAG AA: rarity tokens recalibrated for both light and dark `--bg-surface-1`
