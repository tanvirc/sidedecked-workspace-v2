---
estimated_steps: 6
estimated_files: 7
---

# T03: Build profile page with hero banner and tabbed layout

**Slice:** S05 — Auth, Profile & OAuth Providers
**Milestone:** M001

## Description

Replace the current simple sidebar + welcome layout at `/user` with a profile page matching the `storefront-profile.html` wireframe. Build a hero banner with avatar, display name, game badges, and stat chips. Add a tabbed content area (Collection/Decks/Activity/Settings) with URL hash-based tab switching. Compose existing settings components into the Settings tab. Collection/Decks/Activity tabs render placeholder empty states.

## Steps

1. **Build `ProfileHero` component** — Full-width hero banner, 280px height. Background: `bg-surface-1` with radial gradient overlay (purple, fading to transparent). Bottom gradient fade to `bg-base` (120px). Content: max-width 1200px centered, `px-12`. Left side (flex row, bottom-aligned): avatar (96px circle, gradient border `brand-primary`, initials fallback, online status dot 16px `positive` with `bg-base` border), display name (28px `font-display` bold), username (`@handle`, 15px `text-tertiary`), joined date with calendar SVG icon (13px `text-tertiary`), bio (14px `text-secondary`, max-width 460px), game badges (pills with game-specific colors: MTG purple, Pokemon yellow, YGO blue — matching existing `GameBadge` patterns). Right side (flex column, bottom-aligned): "Edit Profile" ghost button (`brand-primary` border + text, `rounded-[10px]`), share icon button (36px, `border-strong`), stat chips row (cards/decks/trades/rating, each in `bg-surface-2/60` with `backdrop-blur`, `border-default`, `rounded-[12px]`, icon + label + bold mono value). Mobile: stacks vertically, avatar 72px, stats wrap in 2×2 grid.

2. **Build `ProfileTabs` component** — Tab bar: flex row, `border-b border-default`, `mb-8`. Tab items: `font-heading` 14px 600 weight, `text-tertiary` default, `brand-primary` active with 2px bottom border. Tabs: Collection, Decks, Activity, Settings. State management via URL hash (`#collection`, `#decks`, `#activity`, `#settings`). Default to `#collection`. Use `useEffect` to read `window.location.hash` on mount and listen to `hashchange` event. Renders active tab content below tab bar. Mobile: tabs scroll horizontally if needed (`overflow-x-auto`).

3. **Build tab content components** — `CollectionTabContent`: empty state with card icon, "Your collection will appear here" heading, "Cards you own will be displayed..." description, all in centered column with `text-tertiary` styling. `DecksTabContent`: same pattern with deck icon, "Your decks will appear here". `ActivityTabContent`: same with clock/activity icon, "Your activity will appear here". These are lightweight placeholder components — no data fetching.

4. **Build `ProfilePage` component** — Accepts `user` and `customerProfile` props. Renders `ProfileHero` with user data (avatar initials from first_name, display_name, email as username fallback, created_at for joined date, bio from profile, game preferences as badges). Renders `ProfileTabs` with Settings tab content composed from existing components: `ProfileDetails`, `PublicProfile`, `UserPreferences`, `Addresses`, `ProfilePassword`, `SecuritySettings` in a `space-y-6` container. Passes `user`, `customerProfile`, `regions` as needed.

5. **Update `/user` page** — When authenticated: fetch `customerProfile` and `regions` (parallel), render `ProfilePage` with user data. Remove `UserNavigation` sidebar. When unauthenticated: redirect to `/login` (already done in T01). Keep the `/user/settings` page working independently as a standalone settings-only page.

6. **Write tests** — `storefront/src/components/profile/__tests__/ProfilePage.test.tsx`. Test: hero renders avatar with initials, hero renders display name and username, game badges render with correct game colors, stat chips show card/deck/trades/rating, tab bar renders 4 tabs, clicking tab updates active state, Settings tab renders ProfileDetails heading, Collection/Decks/Activity tabs show empty state messages, mobile hero uses smaller avatar (test class presence), no Tailwind gray classes in profile components.

## Must-Haves

- [ ] `ProfileHero` renders avatar, display name, username, joined date, game badges, stat chips
- [ ] `ProfileTabs` renders 4 tabs with URL hash-based switching
- [ ] Settings tab composes `ProfileDetails`, `PublicProfile`, `UserPreferences`, `Addresses`, `ProfilePassword`, `SecuritySettings`
- [ ] Collection/Decks/Activity tabs render placeholder empty states
- [ ] `/user` renders `ProfilePage` when authenticated
- [ ] Mobile hero stacks vertically with smaller avatar
- [ ] All styling uses Voltage tokens — zero Tailwind gray classes
- [ ] Tests pass for hero, tabs, and tab content

## Verification

- `cd storefront && npx vitest run src/components/profile/__tests__/ProfilePage.test.tsx` — all tests pass
- `cd storefront && npx vitest run` — 738+ tests pass (no regressions)
- `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/profile/` — zero matches

## Inputs

- `docs/plans/wireframes/storefront-profile.html` — authoritative design target
- `storefront/src/app/[locale]/(main)/user/page.tsx` — current page to update (T01 already handles unauthenticated redirect)
- `storefront/src/app/[locale]/(main)/user/settings/page.tsx` — existing settings page with components to reuse
- `storefront/src/components/molecules/ProfileDetails/ProfileDetails.tsx` — reuse in Settings tab
- `storefront/src/components/molecules/PublicProfile/PublicProfile.tsx` — reuse in Settings tab
- `storefront/src/components/molecules/UserPreferences/UserPreferences.tsx` — reuse in Settings tab
- `storefront/src/components/molecules/SecuritySettings/SecuritySettings.tsx` — reuse in Settings tab
- `storefront/src/components/molecules/ProfileDetails/ProfilePassword.tsx` — reuse in Settings tab
- `storefront/src/components/organisms/Addresses/Addresses.tsx` — reuse in Settings tab
- `storefront/src/lib/data/customer.ts` — `retrieveCustomer()`, `getCustomerProfile()`

## Expected Output

- `storefront/src/components/profile/ProfilePage.tsx` — profile layout with hero + tabs
- `storefront/src/components/profile/ProfileHero.tsx` — hero banner component
- `storefront/src/components/profile/ProfileTabs.tsx` — tabbed content with hash routing
- `storefront/src/components/profile/tabs/CollectionTabContent.tsx` — placeholder empty state
- `storefront/src/components/profile/tabs/DecksTabContent.tsx` — placeholder empty state
- `storefront/src/components/profile/tabs/ActivityTabContent.tsx` — placeholder empty state
- `storefront/src/components/profile/__tests__/ProfilePage.test.tsx` — test coverage
- `storefront/src/app/[locale]/(main)/user/page.tsx` — updated to render ProfilePage
