---
id: S05
milestone: M001
status: ready
---

# S05: Auth, Profile & OAuth Providers — Context

## Goal

Pixel-perfect auth and profile pages matching wireframes, with working Google, Discord, and Microsoft OAuth providers, functional profile tabs (Overview, Decks, Collection real data; Reviews empty state; Settings editable), and session persistence via Medusa-issued JWT accepted by both backends.

## Why this Slice

S08 (listing wizard) depends on S05 for authenticated seller sessions. The milestone's end-to-end acceptance scenario starts with "sign in via Google OAuth." Auth is a gate for all personalized features (deck ownership, cart, listings). S05 depends only on S01 (complete).

## Scope

### In Scope

- Pixel-perfect auth pages (login, register, OAuth callback) matching `storefront-auth.html` wireframe at 1440px and 390px
- Pixel-perfect profile page matching `storefront-profile.html` wireframe with hero banner, tabbed content
- Google OAuth provider — new implementation in backend auth module following existing provider patterns
- Discord OAuth provider — rework existing `backend/apps/backend/src/modules/discord-auth/` to align with auth module conventions
- Microsoft OAuth provider — rework existing `backend/apps/backend/src/modules/authentication/providers/microsoft-auth.provider.ts`
- Storefront OAuth buttons (Google, Discord, Microsoft) wired to backend OAuth flow with callback handling
- Profile Overview tab — functional with real user data (name, email, avatar, member since, linked accounts)
- Profile Decks tab — functional, pulling real deck data from customer-backend API
- Profile Collection tab — functional, showing owned cards from customer-backend
- Profile Reviews tab — styled shell with empty state ("No reviews yet")
- Profile Settings tab — functional (edit name, email, password, linked social accounts)
- Session persistence across browser restarts via HTTP-only cookies / Medusa JWT

### Out of Scope

- Apple OAuth (D001 — deferred, needs Developer Program)
- Reviews backend or review creation (empty state only in S05)
- Seller upgrade flow (S08 scope — profile page may show the upgrade CTA but it's non-functional)
- 2FA setup/management UI (backend has 2FA infrastructure but UI is deferred)
- Email verification flow (backend has it, storefront page exists, but wiring is deferred unless trivial)
- User-to-user messaging
- Wishlists, price alerts, returns pages (S07 scope — those are separate user account pages)

## Constraints

- OAuth providers must follow the pattern in `apple-auth.provider.ts` — MedusaJS v2 auth module conventions
- Customer-backend validates Medusa-issued JWTs directly (no separate user creation in customer-backend for OAuth users)
- Wireframes are authoritative (D003): `storefront-auth.html`, `storefront-profile.html`
- Inline `style` for Voltage CSS custom properties (D009)
- Session must persist across browser restarts — HTTP-only cookie with appropriate expiry

## Integration Points

### Consumes

- `storefront/src/app/colors.css` — Voltage tokens (from S01)
- `storefront/src/app/globals.css` — Typography scale (from S01)
- `backend/apps/backend/src/modules/authentication/providers/apple-auth.provider.ts` — reference OAuth provider pattern
- `backend/apps/backend/src/modules/discord-auth/services/discord.ts` — existing Discord provider to rework
- `backend/apps/backend/src/modules/authentication/providers/microsoft-auth.provider.ts` — existing Microsoft provider to rework
- `customer-backend/src/middleware/auth.ts` — JWT validation middleware (already accepts Medusa JWTs)
- `docs/plans/wireframes/storefront-auth.html` — auth wireframe
- `docs/plans/wireframes/storefront-profile.html` — profile wireframe

### Produces

- `google-auth.provider.ts` — new Google OAuth provider in backend auth module
- Reworked Discord OAuth provider aligned with auth module conventions
- Reworked Microsoft OAuth provider
- Pixel-perfect auth pages (login, register, callback) matching wireframe
- Pixel-perfect profile page with functional Overview, Decks, Collection, Settings tabs
- Working OAuth flow: storefront → backend → Google/Discord/Microsoft → callback → JWT issued → session persisted
- Profile Settings with edit name/email/password and linked social accounts management

## Open Questions

- Discord provider rework scope — existing code is in a separate module (`discord-auth/`) rather than in `authentication/providers/`. Need to determine whether to move it into the standard providers directory or just align its interface.
- Microsoft provider rework scope — need to inspect what's broken or misaligned in the existing implementation before planning.
- Collection tab data source — need to verify which customer-backend endpoint returns a user's owned cards (may need new route if none exists).
- Profile hero banner — wireframe shows a banner image area. Is this user-uploadable or a static gradient? Assuming static gradient for MVP.
