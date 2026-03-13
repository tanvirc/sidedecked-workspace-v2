---
estimated_steps: 5
estimated_files: 4
---

# T02: Rewrite AuthGateDialog as glassmorphic modal + mobile bottom sheet

**Slice:** S05 — Auth, Profile & OAuth Providers
**Milestone:** M001

## Description

Replace the current plain shadcn `AuthGateDialog` with a glassmorphic modal card matching the wireframe's deferred-auth design (State 3/4). Desktop uses a centered Dialog with gradient background, gradient icon, and branded OAuth buttons. Mobile uses a bottom sheet that slides up from the screen edge with a handle bar. Also verify that Google and Discord OAuth providers are correctly registered in the backend.

## Steps

1. **Build `AuthBottomSheet` component** — Mobile-only bottom sheet for deferred auth. Fixed to bottom of viewport, `rounded-t-[20px]`, gradient background (`bg-surface-2` → `bg-surface-1`), `border-strong` top/sides, no bottom border. Handle bar: 40×4px centered, `bg-surface-4`, `rounded-full`. Content: gradient icon (40px, `rounded-[12px]`, purple→orange gradient bg), heading (22px `font-display`), description (13px), 3 OAuth buttons (h-42, `rounded-[12px]`), ghost "Continue as guest" button (h-42, transparent bg, `border-default`). Backdrop: `rgba(9,9,15,0.75)`. Uses `SocialLoginButtons` or maps `onOAuthClick` to individual buttons matching wireframe provider styles. Animate in with CSS `transform: translateY`.

2. **Rewrite `AuthGateDialog` component** — Desktop: replace plain shadcn Dialog with custom-styled Dialog. Modal card: 480px width, gradient background (`bg-surface-2` → `bg-surface-1`), `border-strong`, `rounded-[20px]`, heavy shadow. Close button: 32px, `bg-surface-3`, `border-default`, `rounded-[8px]`, top-right. Gradient icon: 48px, `rounded-[14px]`, `linear-gradient(135deg, rgba(139,92,246,0.2), rgba(255,120,73,0.1))`. Heading: 26px `font-display`. Description with `<strong>` for action context. 3 OAuth buttons: h-44, `rounded-[12px]`. Ghost "Continue as guest" button. Backdrop: `rgba(9,9,15,0.82)`. Use `useMediaQuery` or CSS breakpoints to switch between Dialog (desktop) and `AuthBottomSheet` (mobile).

3. **Wire responsive switching** — `AuthGateDialog` renders the glassmorphic Dialog on `md:` and above, `AuthBottomSheet` below `md:`. Keep the same prop interface (`open`, `description`, `onClose`, `onOAuthClick`). The `onOAuthClick` callback signature stays the same so consumers don't change.

4. **Verify backend OAuth registration** — Confirm in `backend/apps/backend/medusa-config.ts` that `@medusajs/auth-google` is registered with `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` env vars. Confirm Discord auth module is registered. Confirm `backend/apps/backend/src/api/auth/customer/[auth_provider]/callback/route.ts` handles both providers generically. Add comments in test file documenting verification results.

5. **Update tests** — Rewrite `storefront/src/components/auth/__tests__/AuthGateDialog.test.tsx` to match new component structure. Test: renders gradient icon, renders heading and description, renders 3 OAuth buttons with correct labels, clicking each calls `onOAuthClick` with correct provider key, close button calls `onClose`, description accepts `<strong>` content, "Continue as guest" button exists. Add backend verification documentation as test-file comments.

## Must-Haves

- [ ] Desktop AuthGateDialog renders glassmorphic modal with gradient icon, branded OAuth buttons
- [ ] Mobile renders bottom sheet with handle bar, slides up from bottom
- [ ] Close button works on desktop modal
- [ ] `onOAuthClick` prop interface unchanged — existing consumers don't break
- [ ] Google auth provider verified registered in medusa-config.ts
- [ ] Discord auth module verified registered in medusa-config.ts
- [ ] Tests pass for new component structure

## Verification

- `cd storefront && npx vitest run src/components/auth/__tests__/AuthGateDialog.test.tsx` — all tests pass
- `cd storefront && npx vitest run` — 738+ tests pass (no regressions)
- `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/auth/AuthGateDialog.tsx storefront/src/components/auth/AuthBottomSheet.tsx` — zero matches

## Inputs

- `docs/plans/wireframes/storefront-auth.html` — States 3 + 4 (deferred auth desktop modal + mobile bottom sheet)
- `storefront/src/components/auth/AuthGateDialog.tsx` — current implementation to rewrite
- `storefront/src/components/auth/__tests__/AuthGateDialog.test.tsx` — current tests to update
- `storefront/src/components/molecules/SocialLoginButtons/SocialLoginButtons.tsx` — OAuth button styling reference
- `backend/apps/backend/medusa-config.ts` — OAuth provider registration to verify
- `backend/apps/backend/src/modules/discord-auth/services/discord.ts` — Discord provider to verify

## Expected Output

- `storefront/src/components/auth/AuthGateDialog.tsx` — rewritten with glassmorphic modal styling
- `storefront/src/components/auth/AuthBottomSheet.tsx` — new mobile bottom sheet component
- `storefront/src/components/auth/__tests__/AuthGateDialog.test.tsx` — updated tests for new structure
