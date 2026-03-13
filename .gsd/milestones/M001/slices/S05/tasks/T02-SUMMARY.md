---
id: T02
parent: S05
milestone: M001
provides:
  - Glassmorphic AuthGateDialog (desktop modal + mobile bottom sheet)
  - AuthBottomSheet component for mobile deferred auth
  - Backend OAuth provider verification (Google + Discord)
key_files:
  - storefront/src/components/auth/AuthGateDialog.tsx
  - storefront/src/components/auth/AuthBottomSheet.tsx
  - storefront/src/components/auth/__tests__/AuthGateDialog.test.tsx
key_decisions:
  - Used CSS-based responsive switching (hidden/md:block) instead of useMediaQuery JS hook — avoids hydration mismatches and is simpler
  - Used Radix DialogPrimitive directly instead of the project's DialogContent wrapper — the wrapper has its own close button and styling that conflicts with the glassmorphic design
  - Google OAuth button uses bg-white intentionally per Google brand guidelines — matches wireframe and SocialLoginButtons pattern
  - OAuth provider icons and button configs are inlined in both AuthGateDialog and AuthBottomSheet rather than extracted to a shared constant — keeps each component self-contained and avoids coupling; the duplication is small (SVG icons) and the components have different size specs
patterns_established:
  - Bottom sheet pattern with CSS transform slide-up animation (translateY) and backdrop
  - Glassmorphic modal pattern using gradient background, border-strong, heavy shadow, gradient icon
observability_surfaces:
  - none
duration: 1 step
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T02: Rewrote AuthGateDialog as glassmorphic modal + mobile bottom sheet

**Replaced plain shadcn AuthGateDialog with glassmorphic desktop modal (480px, gradient bg, gradient icon, branded OAuth buttons) and mobile bottom sheet (slide-up with handle bar), matching wireframe States 3/4.**

## What Happened

Built `AuthBottomSheet` as a new mobile-only component: fixed to bottom of viewport, `rounded-t-[20px]`, gradient background (surface-2 → surface-1), border-strong top/sides, 40×4px handle bar, gradient lock icon, heading in font-display, 3 branded OAuth buttons (Google white, Discord #5865F2, Microsoft #2F2F2F), and ghost "Continue as Guest" button. Animates in via CSS translateY transition (350ms ease-out).

Rewrote `AuthGateDialog` to use Radix DialogPrimitive directly for the desktop modal: 480px width, gradient background, border-strong, rounded-[20px], heavy shadow with purple glow, custom close button (32px, bg-surface-3, rounded-[8px]), gradient lock icon (48px), heading at 26px font-display, description supporting React nodes (including `<strong>`), same 3 branded OAuth buttons at h-44/h-11, and ghost "Continue as Guest" button.

Responsive switching is pure CSS: desktop Dialog uses `hidden md:block`, AuthBottomSheet root uses `md:hidden`.

Verified backend OAuth registration: Google (`@medusajs/medusa/auth-google`) and Discord (`./src/modules/discord-auth`) both registered in medusa-config.ts. Generic callback route at `[auth_provider]/callback/route.ts` handles both providers.

## Verification

- `npx vitest run src/components/auth/__tests__/AuthGateDialog.test.tsx` — 15 tests pass (gradient icon, heading, description, 3 OAuth buttons with correct labels, onOAuthClick callbacks, close button, Continue as Guest, description with `<strong>`, bottom sheet handle, bottom sheet backdrop)
- `npx vitest run` — 766 tests pass (above 738+ baseline, zero regressions)
- `npx vitest run src/components/auth/__tests__/AuthPage.test.tsx` — 22 tests pass (T01 preserved)
- `grep bg-gray- / text-gray-` — zero matches in auth components (R024 compliant)
- `bg-white` only on Google OAuth buttons — intentional per brand guidelines, matches wireframe and SocialLoginButtons pattern
- Profile tests not yet created (T03 scope)

### Slice verification status (intermediate task — partial expected):
- ✅ `cd storefront && npx vitest run` — 766 tests pass
- ✅ `cd storefront && npx vitest run src/components/auth/__tests__/AuthPage.test.tsx` — 22 pass
- ✅ `cd storefront && npx vitest run src/components/auth/__tests__/AuthGateDialog.test.tsx` — 15 pass
- ⬜ `cd storefront && npx vitest run src/components/profile/__tests__/ProfilePage.test.tsx` — not yet created (T03)
- ⚠️ `grep bg-white` matches Google OAuth buttons only — brand color, not theme violation

## Diagnostics

None — static UI components with no runtime state or API surface.

## Deviations

- Used Radix DialogPrimitive directly instead of the project's `DialogContent` wrapper. The wrapper includes its own close button and default styling that conflicts with the glassmorphic design. Using primitives directly is cleaner and avoids fighting the abstraction.
- CSS-based responsive switching instead of `useMediaQuery` JS hook as mentioned in the plan. CSS approach is strictly better: no hydration mismatch risk, no extra JS, and follows the same pattern used throughout the codebase with Tailwind responsive prefixes.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/components/auth/AuthGateDialog.tsx` — rewritten with glassmorphic desktop modal using Radix primitives
- `storefront/src/components/auth/AuthBottomSheet.tsx` — new mobile bottom sheet component with slide-up animation
- `storefront/src/components/auth/__tests__/AuthGateDialog.test.tsx` — rewritten tests (15 tests) covering new structure + backend verification docs
