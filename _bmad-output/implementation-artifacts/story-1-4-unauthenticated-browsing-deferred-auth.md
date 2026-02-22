# Story 1-4: Unauthenticated Browsing & Deferred Auth

**Epic:** Epic 1 — Authentication & User Profiles
**Status:** ready-for-dev
**Story Key:** story-1-4-unauthenticated-browsing-deferred-auth
**Plan:** docs/plans/2026-02-22-story-1-4-unauthenticated-browsing-deferred-auth-plan.md

---

## Story

As a visitor who hasn't signed up,
I want to browse cards, search, and view public decks without creating an account,
So that I can evaluate the platform before committing.

---

## Acceptance Criteria

**AC1** (NOT BUILT)
**Given** I am not signed in
**When** I visit any storefront page (`/`, card list, `/cards/[game]/[slug]`, `/decks`, `/decks/[id]`)
**Then** all pages render with full content — no auth wall, no redirect

**AC2** (NOT BUILT)
**Given** I am not signed in
**When** I use search (typing 2+ characters)
**Then** autocomplete and results render normally

**AC3** (NOT BUILT)
**Given** I am not signed in
**When** I attempt any write action (add to cart, add to deck, list a card, add to wishlist, import deck, toggle "I own this")
**Then** `AuthGateDialog` appears with OAuth options (Google, Discord, Microsoft) and a context note showing the specific deferred action

**AC4** (NOT BUILT)
**Given** I am not signed in
**When** I open a shared deck link
**Then** the full deck renders (cards, stats, cost estimate) with "Import to My Decks" CTA; clicking triggers `AuthGateDialog`

**AC5** (NOT BUILT)
**Given** I complete OAuth after being prompted by a write action
**When** authentication succeeds
**Then** I am returned to my original context, the deferred action executes automatically, and a sonner toast confirms completion

**AC6** (NOT BUILT)
**Given** the deferred action's target no longer exists after auth
**When** authentication succeeds but target (listing, deck) is unavailable
**Then** toast: "Signed in! The item is no longer available." — no silent failure

**AC7** (NOT BUILT)
**Given** preserved intent is older than 30 minutes
**When** authentication succeeds
**Then** intent is dropped; user lands on original page; toast: "Signed in! Continue from here."

**AC8** (NOT BUILT)
**Given** unauthenticated user accesses a hard-protected route (`/{locale}/seller/*`, `/{locale}/admin/*`)
**When** the middleware checks the JWT cookie
**Then** redirect to locale root (`/{locale}`); `_sd_flash=sign_in_required` cookie set; toast shown on landing

---

## Tasks

- [ ] Task 0: Create story file and update sprint status
- [ ] Task 1: Deferred intent utilities (`storefront/src/lib/deferred-intent.ts`)
- [ ] Task 2: `useAuthGate` hook (`storefront/src/hooks/useAuthGate.ts`)
- [ ] Task 3: `AuthGateDialog` component (`storefront/src/components/auth/AuthGateDialog.tsx`)
- [ ] Task 4: `DeferredActionExecutor` component (`storefront/src/components/auth/DeferredActionExecutor.tsx`)
- [ ] Task 5: Modify OAuth callback (`storefront/src/app/auth/callback/route.ts`)
- [ ] Task 6: Extend middleware for hard-protected routes (`storefront/src/middleware.ts`)
- [ ] Task 7: Mount `DeferredActionExecutor` in providers (`storefront/src/app/providers.tsx`)
- [ ] Task 8: Quality gate and story completion

---

## Dev Agent Record

### Implementation Notes
_To be filled during implementation_

### Files Changed
_To be filled during implementation_
