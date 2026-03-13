---
id: T03
parent: S05
milestone: M001
provides:
  - ProfileHero component with avatar, display name, username, joined date, bio, game badges, stat chips
  - ProfileTabs component with URL hash-based tab switching (Collection/Decks/Activity/Settings)
  - CollectionTabContent, DecksTabContent, ActivityTabContent placeholder empty states
  - ProfilePage component composing hero + tabs + settings components
  - Updated /user page rendering ProfilePage instead of sidebar layout
key_files:
  - storefront/src/components/profile/ProfileHero.tsx
  - storefront/src/components/profile/ProfileTabs.tsx
  - storefront/src/components/profile/ProfilePage.tsx
  - storefront/src/components/profile/tabs/CollectionTabContent.tsx
  - storefront/src/components/profile/tabs/DecksTabContent.tsx
  - storefront/src/components/profile/tabs/ActivityTabContent.tsx
  - storefront/src/components/profile/__tests__/ProfilePage.test.tsx
  - storefront/src/app/[locale]/(main)/user/page.tsx
key_decisions:
  - ProfileHero uses mobile-first responsive sizing (72px avatar → md:96px) with CSS-only responsive switching, matching the T02 pattern of avoiding useMediaQuery
  - ProfileHeroMobileExtras is a separate exported component for mobile stats/actions rendered below the hero, keeping the hero height consistent
  - Game badge config uses tcg_games values as keys (mtg, pokemon, yugioh, onepiece) mapping to Voltage CSS custom properties (--game-mtg, etc.)
  - Stat chips currently show placeholder values (0/—) since collection/deck/trade APIs don't exist yet
  - ProfileTabs uses window.location.hash for state (not React state router) to keep URL-shareable tab switching without Next.js router overhead
patterns_established:
  - Hash-based tab switching pattern with useEffect hashchange listener for client-side tab routing
  - ProfilePage as a client component composition shell accepting server-fetched data as props
  - Empty state pattern for future tab content (centered icon + heading + description)
observability_surfaces:
  - data-testid attributes on all key elements for testing and browser automation
duration: 1 context window
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T03: Built profile page with hero banner and tabbed layout

**Replaced sidebar /user page with full-width profile page featuring hero banner (avatar, display name, game badges, stat chips) and 4-tab layout with hash-based switching.**

## What Happened

Built ProfileHero with radial gradient overlay, avatar with gradient border and initials fallback, online status dot, display name, @username, joined date, bio, and game badges using Voltage game color tokens. Desktop shows Edit Profile + Share buttons and stat chips row on the right; mobile stacks vertically with 2×2 stats grid via ProfileHeroMobileExtras.

Built ProfileTabs with 4 tabs (Collection/Decks/Activity/Settings) using URL hash routing — reads window.location.hash on mount and listens to hashchange events. Tab bar uses horizontal scroll overflow on mobile.

Collection/Decks/Activity tabs render centered empty states with relevant SVG icons. Settings tab composes all 6 existing settings components (ProfileDetails, PublicProfile, UserPreferences, Addresses, ProfilePassword, SecuritySettings) in a space-y-6 container.

Updated /user page to fetch customerProfile and regions in parallel, then render ProfilePage. Removed UserNavigation sidebar. /user/settings page left untouched as a standalone settings-only route.

## Verification

- `npx vitest run src/components/profile/__tests__/ProfilePage.test.tsx` — 23 tests pass (hero, tabs, tab content, integration, Voltage compliance)
- `npx vitest run` — 789 tests pass (exceeds 738+ baseline, no regressions)
- `grep -rn "bg-white|bg-gray-|text-gray-" storefront/src/components/profile/` — zero matches in component files (only in test regex patterns)
- Slice-level: AuthPage tests (22 pass), AuthGateDialog tests (15 pass), ProfilePage tests (23 pass), combined auth+profile grep clean

## Diagnostics

All profile components use data-testid attributes for automation: profile-hero, profile-avatar, profile-display-name, profile-username, game-badges, game-badge-{game}, stat-chips, stat-chip-{label}, profile-tab-bar, tab-{id}, tab-content-{id}, collection-empty-state, decks-empty-state, activity-empty-state, profile-page.

## Deviations

- Wireframe shows a Wishlist tab — task plan specifies 4 tabs (Collection/Decks/Activity/Settings), so Wishlist was omitted per plan.
- Stat chips show placeholder values (0/—) rather than real data since collection/deck/trade count APIs don't exist yet. This is consistent with the task plan specifying "placeholder empty states" for non-settings tabs.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/components/profile/ProfileHero.tsx` — hero banner with avatar, name, badges, stats
- `storefront/src/components/profile/ProfileTabs.tsx` — tabbed layout with URL hash routing
- `storefront/src/components/profile/ProfilePage.tsx` — composition shell for hero + tabs + settings
- `storefront/src/components/profile/tabs/CollectionTabContent.tsx` — collection empty state
- `storefront/src/components/profile/tabs/DecksTabContent.tsx` — decks empty state
- `storefront/src/components/profile/tabs/ActivityTabContent.tsx` — activity empty state
- `storefront/src/components/profile/__tests__/ProfilePage.test.tsx` — 23 tests covering hero, tabs, content, compliance
- `storefront/src/app/[locale]/(main)/user/page.tsx` — updated to render ProfilePage with parallel data fetching
