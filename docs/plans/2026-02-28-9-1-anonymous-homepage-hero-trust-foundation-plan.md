# Story 9.1: Anonymous Homepage — Hero & Trust Foundation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the full homepage with a server-rendered two-column hero (H1, search bar, trust strip, seller signal) that proves marketplace legitimacy to anonymous visitors within 10 seconds.
**Story:** 9-1 — `_bmad-output/implementation-artifacts/story-9-1-anonymous-homepage-hero-trust-foundation.md`
**Domain:** Frontend
**Repos:** storefront/
**Deployment:** true — user-facing homepage change; Railway deployment of storefront/ required after merge
**UX Wireframe:** `_bmad-output/planning-artifacts/ux-9-1-anonymous-homepage-hero-trust-foundation-wireframe.html`

---

## Requirements Brief (from Phase 2)

**Clarified ACs:**
- AC1: Page is Next.js RSC (no "use client" on page.tsx). H1 is first heading in DOM. Reuse `EnhancedSearchBar` from `@/components/search/EnhancedSearchBar` (existing client component) with `placeholder="Search cards, sets, sellers..."`.
- AC2: Trust strip values from `getSiteConfig()` in `lib/site-config.ts`. Fallback: "—" if env vars missing. Values: card count, seller count. "Buyers protected" is always static copy.
- AC3: Auth check server-side via `retrieveCustomer()` from `@/lib/data/customer`. Seller signal omitted from RSC output for authenticated users (not hidden via CSS). Fail open: if auth check throws, render seller signal.
- AC4: All touch targets ≥ 44×44px via Tailwind `min-h-[44px]`. Single-column on mobile.
- AC5: Two-column CSS Grid at `lg:` breakpoint — `grid-cols-[1fr_340px]` gap-12. Right column: static markup only, no API calls.
- AC6: LCP = H1 text (no hero image). CLS prevention via server-side auth rendering. Right column has reserved height (no dynamic content).

**Business rules:**
- BR1: Trust strip values in `site-config.ts`, never hardcoded in component JSX
- BR2: Auth check server-side; degrade to showing seller signal if `retrieveCustomer()` throws
- BR3: H1 text is fixed product copy (safe to hardcode as constant in component)
- BR4: Preserve existing `<nav>` and `<footer>` from layout.tsx (untouched)

**Edge cases:**
- EC1: Config missing → "—" placeholder in trust strip
- EC2: Auth check error → show seller signal (fail open)
- EC3: `GamesBentoGrid` and `HomeProductSection` removed from page.tsx import — do NOT delete their source files (HomeProductSection used in ProductDetailsPage)
- EC4: `_HomeClient.tsx` used only in page.tsx — safe to delete
- EC5: `EnhancedSearchBar` hydration failure → static trigger div still visible (RSC renders the wrapper, client JS adds interactivity)

---

## Technical Design (from Phase 3)

**Domain routing:** Frontend only — storefront/. No backend, no DB, no external APIs.

**New files:**
```
storefront/src/lib/site-config.ts
storefront/src/components/homepage/HeroSection.tsx
storefront/src/components/homepage/TrustStrip.tsx
storefront/src/components/homepage/SellerSignal.tsx
storefront/src/components/homepage/HeroRight.tsx
storefront/src/components/homepage/TrustStatsCard.tsx
storefront/src/components/homepage/SellerOpportunityCard.tsx
```

**Modified files:**
```
storefront/src/app/[locale]/(main)/page.tsx  — replace full body
```

**Deleted files:**
```
storefront/src/app/[locale]/(main)/_HomeClient.tsx  — only used in page.tsx
```

**Auth pattern (verified):** `retrieveCustomer()` from `@/lib/data/customer` — async, reads `_medusa_jwt` cookie, returns `StoreCustomer | null`.

**Search pattern (verified):** `EnhancedSearchBar` from `@/components/search/EnhancedSearchBar` — `"use client"`, accepts `placeholder` prop.

**API contracts:** None. No new endpoints. No cross-service calls.

**Integration touchpoints:** None.

---

## Tasks

### Task 1: Create `lib/site-config.ts`
**Files:** `storefront/src/lib/site-config.ts`
**Steps (TDD):**
1. Write failing test: `src/lib/__tests__/site-config.test.ts`
   - Test: `getSiteConfig()` returns object with `cardCount`, `sellerCount`, `avgSellerRating`
   - Test: when env vars set, values are returned
   - Test: when env vars missing, fallback "—" returned for cardCount/sellerCount
2. Verify test fails
3. Implement `getSiteConfig()`:
   ```typescript
   export interface SiteConfig {
     cardCount: string
     sellerCount: string
     avgSellerRating: string
   }

   export async function getSiteConfig(): Promise<SiteConfig> {
     return {
       cardCount: process.env.SITE_CARD_COUNT ?? '—',
       sellerCount: process.env.SITE_SELLER_COUNT ?? '—',
       avgSellerRating: process.env.SITE_AVG_SELLER_RATING ?? '4.9',
     }
   }
   ```
4. Verify tests pass

---

### Task 2: Create `TrustStrip` component
**Files:** `storefront/src/components/homepage/TrustStrip.tsx`, `storefront/src/components/homepage/__tests__/TrustStrip.test.tsx`
**Steps (TDD):**
1. Write failing test:
   - Test: renders card count from props
   - Test: renders seller count from props
   - Test: renders "Buyers protected" (always static)
   - Test: renders "—" when cardCount prop is "—"
   - Test: has `aria-label="Platform trust indicators"`
2. Verify tests fail
3. Implement RSC (no "use client"):
   ```typescript
   // Props: cardCount: string, sellerCount: string
   // Renders trust strip rows with icons (aria-hidden)
   // Tailwind: bg-surface-2 rounded-xl border border-border-default
   // Uses CSS custom properties from Midnight Forge globals.css
   ```
4. Verify tests pass

---

### Task 3: Create `SellerSignal` component
**Files:** `storefront/src/components/homepage/SellerSignal.tsx`, `storefront/src/components/homepage/__tests__/SellerSignal.test.tsx`
**Steps (TDD):**
1. Write failing test:
   - Test: renders "Become a seller →" link when `isAuthenticated=false`
   - Test: renders nothing (null) when `isAuthenticated=true`
   - Test: link has `aria-label="Become a seller on SideDecked"`
   - Test: link href is "/sell"
2. Verify tests fail
3. Implement RSC (no "use client"). Receives `isAuthenticated: boolean` prop:
   - If `isAuthenticated` → return null (no DOM output)
   - If not → render `<a href="/sell" aria-label="Become a seller on SideDecked">Become a seller →</a>`
   - Touch target: `min-h-[44px]` flex items-center on wrapper
4. Verify tests pass

---

### Task 4: Create `TrustStatsCard` and `SellerOpportunityCard`
**Files:**
- `storefront/src/components/homepage/TrustStatsCard.tsx`
- `storefront/src/components/homepage/SellerOpportunityCard.tsx`
- `storefront/src/components/homepage/__tests__/TrustStatsCard.test.tsx`
- `storefront/src/components/homepage/__tests__/SellerOpportunityCard.test.tsx`

**Steps (TDD):**
1. Write failing tests:
   - `TrustStatsCard`: renders 4 stats (cards, sellers, rating, games); has `aria-label="Platform stats"`; values from props
   - `SellerOpportunityCard`: renders heading "Turn your collection into cash"; link to "/sell"; `aria-label="Become a seller on SideDecked"` on CTA
2. Verify tests fail
3. Implement both as RSCs (no "use client"). Static markup, no API calls:
   - `TrustStatsCard` receives `cardCount`, `sellerCount`, `avgSellerRating` props; "4 TCG games" is static
   - `SellerOpportunityCard` is fully static — `<a href="/sell">` for CTA (not `<button>`)
4. Verify tests pass

---

### Task 5: Create `HeroRight` (desktop right column)
**Files:** `storefront/src/components/homepage/HeroRight.tsx`, `storefront/src/components/homepage/__tests__/HeroRight.test.tsx`
**Steps (TDD):**
1. Write failing test:
   - Renders `TrustStatsCard` and `SellerOpportunityCard`
   - Has `hidden lg:block` (or equivalent) — not visible on mobile
2. Verify test fails
3. Implement RSC. CSS: `hidden lg:flex lg:flex-col lg:gap-4`. Reserved height via fixed-height children (no dynamic fetch).
4. Verify tests pass

---

### Task 6: Create `HeroSection` (root assembly)
**Files:** `storefront/src/components/homepage/HeroSection.tsx`, `storefront/src/components/homepage/__tests__/HeroSection.test.tsx`
**Steps (TDD):**
1. Write failing test:
   - Renders `<h1>` with orientation text
   - Renders `EnhancedSearchBar`
   - Renders `TrustStrip`
   - Renders `SellerSignal` (with `isAuthenticated` prop)
   - Renders `HeroRight`
   - Has `<section aria-label="Homepage hero">`
2. Verify tests fail
3. Implement RSC. Layout:
   ```typescript
   // Mobile: single column (default)
   // Desktop: lg:grid lg:grid-cols-[1fr_340px] lg:gap-12
   // Left: h1, EnhancedSearchBar, TrustStrip, SellerSignal
   // Right: HeroRight (hidden on mobile via CSS inside HeroRight)
   // H1 text: exact string from AC1
   // Passes isAuthenticated: boolean (received as prop from page.tsx)
   ```
4. Verify tests pass

---

### Task 7: Replace `page.tsx` and delete `_HomeClient.tsx`
**Files:**
- `storefront/src/app/[locale]/(main)/page.tsx` — replace
- `storefront/src/app/[locale]/(main)/_HomeClient.tsx` — delete

**Steps (TDD):**
1. Write failing test for page.tsx (integration-style via component tree):
   - `page.tsx` renders `HeroSection`
   - `page.tsx` does NOT render `GamesBentoGrid`, `HomeClient`, `HomeProductSection`
   - `retrieveCustomer()` is called; result passed to `HeroSection` as `isAuthenticated`
   - Page renders without `"use client"` directive
2. Verify tests fail
3. Implement `page.tsx`:
   ```typescript
   import { retrieveCustomer } from "@/lib/data/customer"
   import { getSiteConfig } from "@/lib/site-config"
   import { HeroSection } from "@/components/homepage/HeroSection"
   import type { Metadata } from "next"

   export const metadata: Metadata = { /* keep existing metadata */ }

   export default async function Home({
     params,
   }: {
     params: Promise<{ locale: string }>
   }) {
     const [customer, config] = await Promise.all([
       retrieveCustomer().catch(() => null),  // EC2: fail open
       getSiteConfig(),
     ])

     return (
       <main>
         <HeroSection
           isAuthenticated={!!customer}
           cardCount={config.cardCount}
           sellerCount={config.sellerCount}
           avgSellerRating={config.avgSellerRating}
         />
         {/* Story 9.2: GameSelectorGrid slot */}
         {/* Story 9.4: PersonalisedStrip slot */}
         {/* Story 9.6: SerendipityLayer slot */}
       </main>
     )
   }
   ```
4. Delete `_HomeClient.tsx`
5. Verify tests pass

---

### Task 8: Quality gate + coverage + accessibility check
**Files:** all modified files
**Steps:**
1. Run full quality gate in storefront/:
   ```bash
   npm run lint && npm run typecheck && npm run build && npm test
   ```
2. Run coverage check — changed modules must be >80%:
   ```bash
   npm run test:coverage
   ```
3. Manual verification checklist:
   - [ ] `npm run dev` — open `localhost:3000` — homepage renders with H1 above fold
   - [ ] Anonymous: trust strip visible, seller signal visible
   - [ ] Authenticated (sign in): seller signal NOT rendered
   - [ ] Mobile viewport (390px): single-column, search thumb-reachable
   - [ ] Desktop (1280px+): two-column hero, right panel visible
   - [ ] Keyboard nav: Tab reaches search bar, seller signal link, right panel CTA
   - [ ] Lighthouse: LCP <= 2.5s, CLS < 0.1
4. Update story file: mark all ACs `(IMPLEMENTED)`
5. Commit to feature branch:
   ```bash
   # In storefront/ and root repo:
   git checkout -b feature/9-1-anonymous-homepage-hero-trust-foundation
   git add <files>
   git commit -m "feat(homepage): implement story 9.1 anonymous hero and trust foundation"
   git push -u origin feature/9-1-anonymous-homepage-hero-trust-foundation
   ```

---

## Pre-Coding Verification Checklist

Before writing any implementation code, verify:
- [ ] `retrieveCustomer()` import path: `@/lib/data/customer` ✓ (verified)
- [ ] `EnhancedSearchBar` import path: `@/components/search/EnhancedSearchBar` ✓ (verified, accepts `placeholder` prop)
- [ ] `_HomeClient.tsx` is only used in `page.tsx` ✓ (verified — safe to delete)
- [ ] `HomeProductSection` is used in `ProductDetailsPage` ✓ (verified — do NOT delete)
- [ ] `SITE_CARD_COUNT`, `SITE_SELLER_COUNT`, `SITE_AVG_SELLER_RATING` env vars added to `.env.local` for dev
