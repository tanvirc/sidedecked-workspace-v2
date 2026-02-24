# Story 1-4: Unauthenticated Browsing & Deferred Auth — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow unauthenticated users to browse freely while gating write actions with an inline OAuth prompt that preserves and auto-completes the intended action after login.
**Story:** story-1-4-unauthenticated-browsing-deferred-auth — `_bmad-output/implementation-artifacts/` (file to be created in Task 1)
**Domain:** Frontend
**Repos:** `storefront/` only
**Deployment:** true — storefront is user-facing; middleware, callback, and new components require Railway deployment

---

## Requirements Brief (from Phase 2)

### Clarified Acceptance Criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Not signed in | Visit any storefront page (`/`, cards, `/cards/[game]/[slug]`, `/decks`, `/decks/[id]`) | All pages render with full content — no auth wall, no redirect |
| AC2 | Not signed in | Use search (typing 2+ chars) | Autocomplete and results render normally |
| AC3 | Not signed in | Attempt a write action (add to cart, add to deck, list a card, add to wishlist, import deck, toggle "I own this") | `AuthGateDialog` appears with OAuth options and a context note showing the specific deferred action |
| AC4 | Not signed in | Open a shared deck link | Full deck renders with "Import to My Decks" CTA; clicking triggers `AuthGateDialog` |
| AC5 | Complete OAuth after deferred auth prompt | Auth succeeds | Returned to original context, deferred action executes automatically, sonner toast confirms |
| AC6 | Deferred action target no longer exists post-auth | Auth succeeds but target unavailable | Toast: "Signed in! The [item] is no longer available." — no silent failure |
| AC7 | Preserved intent is older than 30 minutes | Auth succeeds | Intent dropped; user lands on original page; toast: "Signed in! Continue from here." |
| AC8 | Hard-protected route accessed unauthenticated (`/seller/*`, `/admin/*`) | Middleware checks JWT | Redirect to locale root (`/{locale}`); flash cookie `_sd_flash=sign_in_required` set; toast shown on landing |

### Business Rules
- **Auth-gated write actions (canonical list):** add to cart, add to deck, list a card, add to wishlist, import public deck, toggle "I own this", duplicate deck
- **Intent storage:** `sessionStorage` key `sdDeferred` → `{ action: string, payload: unknown, returnUrl: string, timestamp: number }`
- **TTL:** 30 minutes from `timestamp`
- **Stale/unavailable intent:** handled gracefully with toast; no silent failure
- **Hard-protected routes:** `/{locale}/seller/*`, `/{locale}/admin/*` → redirect to `/{locale}` + flash toast
- **SSR-protected routes (existing):** `/{locale}/user/*` → redirect to `/{locale}/login?redirect=<path>` (unchanged)

### UX Flow Summary
- Browsing: all read routes accessible without auth; nav shows "Sign In" for unauthenticated state
- Write action gate: `AuthGateDialog` (Radix Dialog) — dismissible, shows OAuth buttons + action context
- Post-auth: `DeferredActionExecutor` (provider-level client component) reads sessionStorage, executes action, shows toast
- Intent routing: `_sd_return_url` cookie (10 min, `sameSite: lax`) read by `/auth/callback/route.ts` to redirect to original page

---

## Technical Design (from Phase 3)

### Architecture
- **Domain:** Frontend — `storefront/` only. No backend changes.
- **No new API endpoints.** Uses existing OAuth flow: `GET /auth/customer/{provider}` → callback → `GET /auth/callback/route.ts`
- **No DB entities or migrations.**

### Intent Preservation Flow
```
1. User triggers write action (unauthenticated)
2. sessionStorage.sdDeferred = { action, payload, returnUrl, timestamp }
3. document.cookie _sd_return_url = returnUrl (10 min, sameSite: lax)
4. AuthGateDialog opens
5. User clicks OAuth provider
6. OAuth flow (existing backend infrastructure)
7. /auth/callback/route.ts:
     reads _sd_return_url cookie → redirect to returnUrl (clears cookie)
     if no _sd_return_url → redirect to /user (unchanged behavior)
8. DeferredActionExecutor mounts on returnUrl page:
     reads sessionStorage.sdDeferred
     checks TTL (< 30 min)
     dispatches to action registry
     clears sessionStorage
     shows sonner toast
```

### Hard-Protected Route Flow
```
1. Unauthenticated user navigates to /{locale}/seller/* or /{locale}/admin/*
2. middleware.ts: no JWT cookie → redirect to /{locale}
3. Set cookie _sd_flash=sign_in_required (30 sec, sameSite: lax)
4. DeferredActionExecutor on home page reads _sd_flash → fires toast:
   "Sign in to access your dashboard."
```

### Key Files

| Action | Path |
|--------|------|
| CREATE | `storefront/src/lib/deferred-intent.ts` — sessionStorage + cookie utilities |
| CREATE | `storefront/src/hooks/useAuthGate.ts` — write action guard hook |
| CREATE | `storefront/src/components/auth/AuthGateDialog.tsx` — OAuth prompt dialog |
| CREATE | `storefront/src/components/auth/DeferredActionExecutor.tsx` — post-auth executor |
| MODIFY | `storefront/src/app/auth/callback/route.ts` — honor `_sd_return_url` cookie |
| MODIFY | `storefront/src/middleware.ts` — add seller/admin guards + flash cookie |
| MODIFY | `storefront/src/app/providers.tsx` — mount DeferredActionExecutor |
| CREATE | `storefront/src/lib/__tests__/deferred-intent.test.ts` |
| CREATE | `storefront/src/hooks/__tests__/useAuthGate.test.ts` |
| CREATE | `storefront/src/components/auth/__tests__/AuthGateDialog.test.tsx` |
| CREATE | `storefront/src/components/auth/__tests__/DeferredActionExecutor.test.tsx` |
| MODIFY | `storefront/src/middleware.test.ts` (if exists) or CREATE |

### Existing Infrastructure (do not duplicate)
- `storefront/src/components/ui/dialog.tsx` — Radix Dialog (available)
- `storefront/src/components/ui/sonner.tsx` — Sonner toast (available; Toaster mounted in providers at bottom-right)
- `storefront/src/app/auth/callback/route.ts` — OAuth callback (modify only)
- `storefront/src/middleware.ts` — Next.js middleware (modify only)
- `storefront/src/lib/actions/oauth.ts` — existing OAuth action helpers

---

## Tasks

### Task 0: Create Story File and Update Sprint Status
**Files:**
- CREATE: `_bmad-output/implementation-artifacts/story-1-4-unauthenticated-browsing-deferred-auth.md`
- MODIFY: `_bmad-output/implementation-artifacts/sprint-status.yaml`

**Steps:**
1. Create the story file with the full story definition, all 8 ACs tagged `(NOT BUILT)`, and standard story metadata
2. Update sprint-status.yaml: change `1-4-unauthenticated-browsing-deferred-auth: backlog` → `ready-for-dev`; change `epic-1: in-progress` (already set)
3. Commit: `docs(story-1-4): add story file and set ready-for-dev`

---

### Task 1: Deferred Intent Utilities
**Files:**
- CREATE: `storefront/src/lib/deferred-intent.ts`
- CREATE: `storefront/src/lib/__tests__/deferred-intent.test.ts`

**Interface:**
```typescript
export interface DeferredAction {
  action: string        // e.g. 'add_to_cart', 'import_deck', 'add_to_wishlist'
  payload: unknown      // action-specific data
  returnUrl: string     // page to return to after auth
  timestamp: number     // Date.now() at capture time
  description: string   // human-readable: "Adding Black Lotus to your cart"
}

const STORAGE_KEY = 'sdDeferred'
const TTL_MS = 30 * 60 * 1000       // 30 minutes
const RETURN_URL_COOKIE = '_sd_return_url'
const FLASH_COOKIE = '_sd_flash'

export function saveIntent(intent: DeferredAction): void
export function loadIntent(): DeferredAction | null   // returns null if missing or expired
export function clearIntent(): void
export function setReturnUrlCookie(url: string): void // writes _sd_return_url cookie (10 min, sameSite: lax)
export function clearReturnUrlCookie(): void
export function readFlashCookie(): string | null      // reads _sd_flash, clears it immediately
```

**Steps:**
1. Write failing tests:
   - `saveIntent` writes to sessionStorage correctly
   - `loadIntent` returns null when sessionStorage is empty
   - `loadIntent` returns null when TTL exceeded (mock `Date.now()`)
   - `loadIntent` returns the intent when within TTL
   - `clearIntent` removes the key
   - `setReturnUrlCookie` sets the cookie with correct attributes
   - `readFlashCookie` returns value and clears immediately
2. Run tests → confirm all fail (file doesn't exist yet)
3. Implement `storefront/src/lib/deferred-intent.ts`
4. Run tests → confirm all pass
5. Run `npm run typecheck` → 0 errors
6. Commit: `feat(auth): add deferred intent storage utilities`

---

### Task 2: `useAuthGate` Hook
**Files:**
- CREATE: `storefront/src/hooks/useAuthGate.ts`
- CREATE: `storefront/src/hooks/__tests__/useAuthGate.test.ts`

**Interface:**
```typescript
export interface AuthGateOptions {
  action: string
  payload?: unknown
  description: string   // shown in dialog: "Adding [card] to your cart"
  returnUrl?: string    // defaults to window.location.pathname
}

export function useAuthGate(): {
  isAuthenticated: boolean
  triggerAuthGate: (options: AuthGateOptions) => void  // runs action directly if authed; shows dialog if not
  dialogProps: {
    open: boolean
    description: string
    onClose: () => void
    onOAuthClick: (provider: 'google' | 'discord' | 'microsoft') => void
  }
}
```

**Steps:**
1. Write failing tests:
   - When authenticated (`_medusa_jwt` cookie present): `triggerAuthGate` invokes action immediately, dialog does not open
   - When unauthenticated: `triggerAuthGate` saves intent to sessionStorage, opens dialog
   - `onClose` closes dialog without clearing intent
   - `onOAuthClick('google')` sets `_sd_return_url` cookie and navigates to `/auth/customer/google`
2. Run tests → confirm all fail
3. Implement `storefront/src/hooks/useAuthGate.ts`
   - Auth detection: check for `_medusa_jwt` cookie via `document.cookie` (client-side)
   - Use `saveIntent` and `setReturnUrlCookie` from Task 1
   - OAuth initiation: `window.location.href = /auth/customer/{provider}`
4. Run tests → confirm all pass
5. Run `npm run typecheck` → 0 errors
6. Commit: `feat(auth): add useAuthGate hook for deferred auth pattern`

---

### Task 3: `AuthGateDialog` Component
**Files:**
- CREATE: `storefront/src/components/auth/AuthGateDialog.tsx`
- CREATE: `storefront/src/components/auth/__tests__/AuthGateDialog.test.tsx`

**Interface:**
```typescript
interface AuthGateDialogProps {
  open: boolean
  description: string  // e.g. "Adding Black Lotus to your cart"
  onClose: () => void
  onOAuthClick: (provider: 'google' | 'discord' | 'microsoft') => void
}
```

**UI spec:**
```
Dialog (max-w-sm, centered)
  Title: "Sign in to continue"
  Description: {description}  ← context note, muted text
  ─────────────────────────────
  [Google icon] Continue with Google
  [Discord icon] Continue with Discord
  [Microsoft icon] Continue with Microsoft
  ─────────────────────────────
  [✕] close button (Radix DialogClose, top-right, inherited from dialog.tsx)

Accessibility:
  role="dialog", aria-modal="true" (provided by Radix)
  ESC closes (provided by Radix)
  Tab cycles through OAuth buttons and close
  Focus set to first OAuth button on open (autoFocus)
```

**Steps:**
1. Write failing tests:
   - Renders with `open=true`, shows title "Sign in to continue" and description text
   - Does not render when `open=false`
   - Clicking close button calls `onClose`
   - ESC key calls `onClose`
   - Clicking "Continue with Google" calls `onOAuthClick('google')`
   - Clicking "Continue with Discord" calls `onOAuthClick('discord')`
   - Clicking "Continue with Microsoft" calls `onOAuthClick('microsoft')`
   - First OAuth button receives focus on open
2. Run tests → confirm all fail
3. Implement `AuthGateDialog.tsx` using `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` from `@/components/ui/dialog`
4. Run tests → confirm all pass
5. Run `npm run typecheck` → 0 errors
6. Commit: `feat(auth): add AuthGateDialog component`

---

### Task 4: `DeferredActionExecutor` Component
**Files:**
- CREATE: `storefront/src/components/auth/DeferredActionExecutor.tsx`
- CREATE: `storefront/src/components/auth/__tests__/DeferredActionExecutor.test.tsx`

**Behaviour:**
- Client component; mounts once in providers
- On mount:
  1. Read `_sd_flash` cookie via `readFlashCookie()` → if `sign_in_required`, fire sonner toast: `"Sign in to access your dashboard."`
  2. Read deferred intent via `loadIntent()`; if none → no-op
  3. If intent present and TTL valid:
     - Dispatch to `ACTION_REGISTRY[intent.action]?.(intent.payload)`
     - If handler exists and succeeds: sonner toast `"Signed in! {intent.description} complete."`
     - If handler exists but target unavailable (handler returns `{ unavailable: true }`): sonner toast `"Signed in! The item is no longer available."`
     - If handler not found (future story): sonner toast `"Signed in! Continue from here."`
  4. `clearIntent()` regardless of outcome
- `ACTION_REGISTRY` is an extensible map; initially empty (handlers added per-story):
  ```typescript
  type ActionHandler = (payload: unknown) => Promise<void | { unavailable: true }>
  export const ACTION_REGISTRY: Record<string, ActionHandler> = {}
  ```
- Returns `null` (no rendered UI; effects only)

**Steps:**
1. Write failing tests:
   - Mounts without errors when no deferred intent in storage
   - Reads and clears intent on mount
   - Shows "Signed in! Continue from here." toast when action has no registered handler
   - Shows flash toast when `_sd_flash=sign_in_required` cookie is present
   - Clears flash cookie after reading
   - Does not re-execute if unmounted and remounted (intent already cleared)
   - Shows "item no longer available" toast when handler returns `{ unavailable: true }`
2. Run tests → confirm all fail
3. Implement `DeferredActionExecutor.tsx`
   - Use `useEffect` with empty dependency array (runs once on mount)
   - Import `loadIntent`, `clearIntent`, `readFlashCookie` from `@/lib/deferred-intent`
   - Use `toast` from `sonner` for all notifications
4. Run tests → confirm all pass
5. Run `npm run typecheck` → 0 errors
6. Commit: `feat(auth): add DeferredActionExecutor provider component`

---

### Task 5: Modify OAuth Callback to Honor `returnUrl`
**Files:**
- MODIFY: `storefront/src/app/auth/callback/route.ts`
- MODIFY (or CREATE): `storefront/src/app/auth/callback/__tests__/route.test.ts`

**Current behaviour:** Always redirects to `/user` after setting JWT cookie.
**New behaviour:** Read `_sd_return_url` cookie; if present, redirect to its value and clear it; else redirect to `/user`.

**Security constraint:** Validate that `returnUrl` is a relative path (starts with `/`, does not contain `://`) to prevent open redirect.

**New flow:**
```typescript
// After: await setAuthToken(token)
const returnUrlCookie = cookieStore.get('_sd_return_url')?.value
const returnUrl = isValidRelativePath(returnUrlCookie) ? returnUrlCookie : '/user'
// Clear the cookie
// Redirect to returnUrl
```

**Steps:**
1. Write failing tests:
   - When `_sd_return_url` cookie is present with valid relative path: redirects to that path
   - When `_sd_return_url` is absent: redirects to `/user` (existing behavior preserved)
   - When `_sd_return_url` contains `://` (open redirect attempt): redirects to `/user`
   - When `_sd_return_url` does not start with `/`: redirects to `/user`
   - On error setting token: redirects to `/user?error=...` (existing behavior preserved)
2. Run tests → confirm new cases fail, existing cases pass
3. Modify `route.ts` — add `isValidRelativePath()` utility inline, read cookie, conditional redirect, clear cookie
4. Run tests → confirm all pass
5. Run `npm run typecheck` → 0 errors
6. Commit: `feat(auth): honor return URL in OAuth callback for deferred auth`

---

### Task 6: Extend Middleware for Hard-Protected Routes
**Files:**
- MODIFY: `storefront/src/middleware.ts`
- MODIFY (or CREATE): `storefront/src/middleware.test.ts`

**Changes:**
1. Add `shouldGuardHardProtectedRoute(pathname: string): boolean`
   - Returns true for `/{locale}/seller/*` and `/{locale}/admin/*`
2. In the middleware body (inside the "URL has country code" fast path block):
   - Check `shouldGuardHardProtectedRoute(pathname)` before existing `shouldGuardUserRoute` check
   - If hard-protected and no JWT: set `_sd_flash=sign_in_required` cookie (30s, `sameSite: lax`) and redirect to `/${locale}`
3. Export `shouldGuardHardProtectedRoute` for testing (same pattern as existing `shouldGuardUserRoute`)

**Steps:**
1. Write failing tests:
   - `shouldGuardHardProtectedRoute('/us/seller/dashboard')` → true
   - `shouldGuardHardProtectedRoute('/us/admin/disputes')` → true
   - `shouldGuardHardProtectedRoute('/us/seller')` → false (base route, not a sub-path — sellers land here after upgrade, not a protected dashboard)
   - `shouldGuardHardProtectedRoute('/us/user/profile')` → false (handled by existing guard)
   - `shouldGuardHardProtectedRoute('/us/cards')` → false
   - Middleware: unauthenticated request to `/us/seller/dashboard` → redirect to `/us`, `_sd_flash` cookie set
   - Middleware: authenticated request to `/us/seller/dashboard` → passes through
2. Run tests → confirm new cases fail
3. Implement changes in `middleware.ts`
4. Run tests → confirm all pass
5. Run `npm run typecheck` → 0 errors
6. Commit: `feat(auth): add hard-protected route guards for seller and admin paths`

---

### Task 7: Mount `DeferredActionExecutor` in Providers
**Files:**
- MODIFY: `storefront/src/app/providers.tsx`

**Change:** Add `<DeferredActionExecutor />` inside the provider tree, after `<IdleSessionGuard />`.

```typescript
import { DeferredActionExecutor } from "@/components/auth/DeferredActionExecutor"

// Inside Providers JSX, alongside IdleSessionGuard:
<IdleSessionGuard />
<DeferredActionExecutor />
```

**Steps:**
1. Read current `providers.tsx` (already done above — verified structure)
2. Verify no test for providers exists that would break
3. Add import and `<DeferredActionExecutor />` after `<IdleSessionGuard />`
4. Run `npm run typecheck` → 0 errors
5. Run `npm run lint` → 0 errors
6. Commit: `feat(auth): mount DeferredActionExecutor in app providers`

---

### Task 8: Quality Gate, Story File Updates, and Final Commit
**Files:**
- MODIFY: `_bmad-output/implementation-artifacts/story-1-4-unauthenticated-browsing-deferred-auth.md`
  — mark all ACs `(IMPLEMENTED)`
- MODIFY: `_bmad-output/implementation-artifacts/sprint-status.yaml`
  — change `1-4-unauthenticated-browsing-deferred-auth: ready-for-dev` → `in-progress` (dev sets this) → `review`

**Steps:**
1. Run full quality gate in `storefront/`:
   ```bash
   npm run lint && npm run typecheck && npm run build && npm test
   ```
   All must pass before continuing.
2. Run coverage:
   ```bash
   npm run test:coverage
   ```
   Coverage on changed modules must be ≥ 80%.
3. Update story file: mark all 8 ACs `(IMPLEMENTED)` with implementation notes
4. Update sprint-status.yaml story status → `review`
5. Stage all changed files and commit:
   ```
   feat(auth): story 1-4 unauthenticated browsing and deferred auth
   ```
6. Push feature branch to remote

---

## Execution Notes

- **TDD is non-negotiable.** For every task: write the test first, see it fail, then implement. No exceptions.
- **No production code without a failing test first.** If you find yourself writing implementation before tests, stop and reverse.
- **shadcn/ui Dialog** is already installed (`src/components/ui/dialog.tsx`). Import from there.
- **Sonner** is already mounted at `bottom-right` with `richColors` in `providers.tsx`. Use `toast()` from `sonner`.
- **OAuth providers available:** Google, Discord, Microsoft (not Apple — architecture doc lists Apple as not wired).
- **`ACTION_REGISTRY` starts empty.** Future stories add handlers. The executor gracefully handles missing handlers.
- **Do not implement "add to cart", "add to deck", etc.** Those are Epic 2-5 scope. This story only builds the gate and executor infrastructure.
- On failure at any task: follow `superpowers:systematic-debugging` — read errors carefully, do not retry blindly.
