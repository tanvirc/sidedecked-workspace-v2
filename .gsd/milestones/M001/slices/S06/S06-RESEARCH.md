# S06: Wireframe Generation & Figma Export — Research

**Date:** 2026-03-14

## Summary

S06 requires creating HTML wireframes for all storefront pages that don't have one (~24 new files) and exporting the complete set (9 existing + 24 new = 33 total) to Figma via the MCP html-to-design tool. The existing 9 wireframes establish a rigorous pattern: self-contained HTML files with Voltage design tokens, Figma capture.js script, Google Fonts, side-by-side desktop (1440px) + mobile (390px) canvas frames, sd-nav.js shared navigation, and inline footer. Each wireframe averages ~2,000 lines and covers happy path plus key empty state per D006.

The primary risk is volume — 24 wireframe files at ~1,000–2,000 lines each is substantial generation work. The mitigation is that many pages share structural patterns: 8 user-account pages all use the same sidebar-nav + content-area layout, 6 info pages (about/faq/terms/privacy/contact/terms-seller) use the shared InfoPage component template, and commerce pages follow standard e-commerce patterns. The Figma export task depends on Figma MCP OAuth authentication which is currently not configured — this is a hard blocker that requires user action (`mcporter auth figma`).

The page inventory identified 24 wireframe files covering ~40 routes (some files combine related sub-routes like orders list + order detail). Three page routes are redirects (marketplace→products, settings/profile→user/settings, user/register→register) and don't need wireframes. Dev-only pages (debug, test) are excluded.

## Recommendation

**Approach: Template-first batch generation, grouped by layout family.**

1. **Create a shared boilerplate template** extracting the ~120 lines of common HTML head (doctype, capture.js, fonts, Voltage tokens, canvas/frame CSS) into a reference pattern. Each wireframe starts from this template.

2. **Group generation by layout family** to maximize copy-and-adapt efficiency:
   - **User account pages (8 files):** All share `UserNavigation` sidebar + 3-column content area. Generate one canonical wireframe (orders), then adapt for remaining 7.
   - **Seller dashboard pages (5 files):** Share sell-dashboard tab navigation pattern. Generate dashboard first, adapt for payouts/reputation.
   - **Commerce pages (3 files):** Standard e-commerce patterns (cart summary, checkout steps, confirmation).
   - **Info pages (1 file):** Single wireframe showing the InfoPage template with 2-3 sections — covers /about, /faq, /terms, /privacy, /contact, /terms/seller.
   - **Misc pages (7 files):** Categories, collections, community, seller storefront, reset-password, verify-email, products — each relatively unique.

3. **Include `data-component` attributes** on major sections to map wireframe elements to React component names, matching the existing wireframe convention.

4. **Figma export as a separate task** after all wireframes are generated — authenticate with Figma MCP, then batch-process all 33 files.

**Why this approach:** Template-first eliminates the Voltage token / boilerplate duplication risk that could cause token drift across 24 files. Family grouping reduces the effective unique wireframe count from 24 to ~6 distinct layouts with variations. This keeps the generation work manageable while ensuring every page has an authoritative design target for S07.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Nav HTML/CSS in wireframes | `sd-nav.js` — shared nav component | Authoritative nav design, already used in all 9 existing wireframes |
| Voltage design tokens | Existing wireframe `<style>` block with `:root` CSS variables | Copy from any existing wireframe — tokens are identical across all 9 |
| Figma capture | `<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>` | Already embedded in all existing wireframes |
| Footer HTML pattern | `storefront-homepage.html` footer section (lines 1207–1237) | Consistent footer markup with Discord/X/GitHub icons and nav links |
| Google Fonts link | Existing wireframe `<link>` tags for Barlow Condensed, Barlow, Inter, DM Mono | Same 4 font families across all wireframes |
| User account sidebar | `UserNavigation` component (Orders, Messages, Returns, Addresses, Reviews, Wishlist, Settings) | Real navigation structure to replicate in wireframes |
| InfoPage layout | `storefront/src/components/content/InfoPage.tsx` | Shared template for about/faq/terms/privacy/contact — wireframe should match this component's structure |

## Existing Code and Patterns

### Wireframe Patterns (reference for generation)
- `docs/plans/wireframes/storefront-homepage.html` (1,242 lines) — Simplest full wireframe. Good boilerplate reference. Has footer.
- `docs/plans/wireframes/storefront-auth.html` (1,539 lines) — Shows multi-state wireframe pattern (login + register + auth gate dialog). 3 separate canvases.
- `docs/plans/wireframes/storefront-profile.html` (2,382 lines) — Shows tabbed content (Collection/Decks/Activity/Settings). Multi-frame canvas for different tab states.
- `docs/plans/wireframes/storefront-cards.html` (2,539 lines) — Most complex. Shows sidebar filters + grid + pagination. Good reference for categories/collections pages.
- `docs/plans/wireframes/sd-nav.js` (22,111 bytes) — Shared nav. Variants: `standard` (default), `workspace` (deck builder). Options: `activeLink`, `searchContent` ('pill'|'expanded'), `searchValue`, `avatarActive`, `mobile`, `target`, `deckName`.

### Page Implementations (content reference)
- `storefront/src/components/sections/Cart/Cart.tsx` + `EnhancedCartItems.tsx` (306 lines) — Cart shows card images, seller info, quantity controls, enriched multi-seller grouping, promotion codes, cart summary.
- `storefront/src/components/sections/CartAddressSection/`, `CartPaymentSection/`, `CartShippingMethodsSection/`, `CartReview/` — Checkout is a 2-column layout: left (address → shipping → payment) and right (order review). Already functional.
- `storefront/src/components/seller/ConsumerSellerDashboard.tsx` (1,017 lines) — Dashboard with 4 tabs (overview/listings/sales/profile). Has stat cards, tier progress, verification status.
- `storefront/src/components/seller/CustomerToSellerUpgrade.tsx` (945 lines) — Full upgrade flow with benefits CTA, form, and confirmation.
- `storefront/src/components/seller/PayoutDashboard.tsx` (219 lines) — Balance cards, payout history, Stripe Connect.
- `storefront/src/components/seller/ReputationDashboard.tsx` (502 lines) — Trust score, review management, tier progress.
- `storefront/src/components/seller/CardListingForm.tsx` (571 lines) — Current listing form (will be replaced by wizard in S08, but wireframe should show the S08 target: 3-step wizard flow).
- `storefront/src/components/molecules/UserNavigation/UserNavigation.tsx` — Sidebar nav: Orders, Messages, Returns, Addresses, Reviews, Wishlist | Settings (separated by border).
- `storefront/src/components/content/InfoPage.tsx` — Shared layout: eyebrow + title + description header card, then section cards with title + content paragraphs.
- `storefront/src/components/pricing/EnhancedPriceAlerts.tsx` — Referenced by price-alerts page. Client component with alert list.
- `storefront/src/components/sections/OrderConfirmedSection/` — Order confirmation display.

### Layout Patterns
- `storefront/src/app/[locale]/(main)/layout.tsx` — Main layout wraps all standard pages with Header + Footer.
- `storefront/src/app/[locale]/(auth)/` — Auth route group: no Header/Footer (full-bleed).
- `storefront/src/app/[locale]/(checkout)/layout.tsx` — Checkout layout: minimal header (back to cart + logo), no Footer.
- `storefront/src/app/[locale]/(reset-password)/` — Separate route group for reset password.

## Page Inventory — Complete List

### Existing Wireframes (9)
| # | File | Routes |
|---|------|--------|
| 1 | storefront-homepage.html | `/` |
| 2 | storefront-cards.html | `/cards` |
| 3 | storefront-card-detail.html | `/cards/[id]` |
| 4 | storefront-search.html | `/search` |
| 5 | storefront-deck-browser.html | `/decks` |
| 6 | storefront-deck-builder.html | `/decks/builder/new`, `/decks/[id]/edit` |
| 7 | storefront-deck-viewer.html | `/decks/[deckId]` |
| 8 | storefront-auth.html | `/login`, `/register` |
| 9 | storefront-profile.html | `/user` |

### New Wireframes Needed (24)

**Commerce (3 files)**
| # | File | Routes | Content Reference | Complexity |
|---|------|--------|-------------------|------------|
| 10 | storefront-cart.html | `/cart` | Cart.tsx, EnhancedCartItems.tsx (306 lines), CartSummary | Medium — multi-seller cart with enriched items, promo codes, summary |
| 11 | storefront-checkout.html | `/checkout` | CartAddressSection, CartShippingMethodsSection, CartPaymentSection, CartReview | High — 4-step checkout with 2-column layout, Stripe integration |
| 12 | storefront-order-confirmed.html | `/order/[id]/confirmed` | OrderConfirmedSection | Low — success state with order summary |

**Seller (5 files)**
| # | File | Routes | Content Reference | Complexity |
|---|------|--------|-------------------|------------|
| 13 | storefront-sell-dashboard.html | `/sell` | ConsumerSellerDashboard.tsx (1,017 lines) — 4 tabs: overview/listings/sales/profile | High — tabbed dashboard with stat cards, listing management |
| 14 | storefront-sell-list-card.html | `/sell/list-card` | CardListingForm.tsx + S08 spec (3-step wizard) | High — 3 wizard steps: Identify → Condition+Photos → Price+Confirm |
| 15 | storefront-sell-upgrade.html | `/sell/upgrade` | CustomerToSellerUpgrade.tsx (945 lines) | Medium — benefits CTA + upgrade form |
| 16 | storefront-sell-payouts.html | `/sell/payouts`, `/sell/payouts/settings` | PayoutDashboard.tsx, PayoutSettingsPage.tsx | Medium — balance cards, payout history, settings |
| 17 | storefront-sell-reputation.html | `/sell/reputation` | ReputationDashboard.tsx (502 lines) | Medium — trust score, reviews, tier progress |

**User Account (8 files)**
| # | File | Routes | Content Reference | Complexity |
|---|------|--------|-------------------|------------|
| 18 | storefront-user-orders.html | `/user/orders`, `/user/orders/[id]` | OrdersPagination, ParcelAccordion, OrderDetailsSection | Medium — order list + detail with sidebar nav |
| 19 | storefront-user-addresses.html | `/user/addresses` | Addresses organism | Low — address list/form with sidebar nav |
| 20 | storefront-user-settings.html | `/user/settings` | ProfileDetails, ProfilePassword, PublicProfile, UserPreferences, GamePreferences, NotificationPreferences | Medium — settings grid with sidebar nav |
| 21 | storefront-user-wishlist.html | `/user/wishlist` | Wishlist with card grid | Low — card grid with sidebar nav |
| 22 | storefront-user-reviews.html | `/user/reviews`, `/user/reviews/written` | ReviewsToWrite organism | Low — review list with sidebar nav |
| 23 | storefront-user-messages.html | `/user/messages` | UserMessagesSection (TalkJS integration) | Low — message inbox with sidebar nav |
| 24 | storefront-user-returns.html | `/user/returns`, `/user/orders/[id]/return`, `/user/orders/[id]/request-success` | OrderReturnRequests, OrderReturnSection, ReturnItemsTab, ReturnMethodsTab | Medium — return list + return request flow |
| 25 | storefront-user-price-alerts.html | `/user/price-alerts` | EnhancedPriceAlerts | Low — alert list with sidebar nav |

**Misc (8 files)**
| # | File | Routes | Content Reference | Complexity |
|---|------|--------|-------------------|------------|
| 26 | storefront-verify-email.html | `/user/verify-email` | VerificationStatus component | Low — simple status page |
| 27 | storefront-categories.html | `/categories`, `/categories/[category]` | AlgoliaProductsListing, ProductListing | Medium — product grid similar to cards page |
| 28 | storefront-collections.html | `/collections/[handle]` | Similar to categories | Medium — product grid with collection header |
| 29 | storefront-community.html | `/community` | community/page.tsx (201 lines) — "Coming Soon" with feature grid | Low — placeholder/coming-soon design |
| 30 | storefront-info-pages.html | `/about`, `/faq`, `/terms`, `/terms/seller`, `/privacy`, `/contact` | InfoPage.tsx shared component | Low — one wireframe covers all 6 pages |
| 31 | storefront-seller-storefront.html | `/sellers/[handle]`, `/sellers/[handle]/reviews` | SellerPageHeader, SellerTabs | Medium — seller profile with tabs |
| 32 | storefront-reset-password.html | `/reset-password`, `/auth/error` | ProfilePasswordForm, AuthErrorContent | Low — simple form pages |
| 33 | storefront-products.html | `/products/[handle]` | ProductDetailsPage | Medium — Medusa PDP with card enrichment |

### Excluded Routes (no wireframe needed)
- `/marketplace` — redirects to `/products`
- `/settings/profile` — redirects to `/user/settings`
- `/user/register` — legacy route (new auth at `/register`)
- `/debug`, `/test/*`, `/test-navigation` — dev-only pages

## Constraints

- **D003 (Wireframe authority):** HTML wireframes in `docs/plans/wireframes/` are the authoritative design source. Figma is the export target, not the source of truth.
- **D006 (Coverage scope):** Generated wireframes cover primary content state + one key empty state per page. Error states and loading states follow Voltage patterns generically — no need to wireframe them individually.
- **Voltage tokens must be identical:** All 24 new wireframes must use the exact same `:root` CSS variable block as existing wireframes. No token drift.
- **sd-nav.js is required:** Every wireframe with nav must include `<div id="sd-nav-root"></div>` + `<script src="sd-nav.js"></script>` + `SdNav.init({})` with appropriate options.
- **Figma capture.js is required:** Every wireframe must include `<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>` in the `<head>`.
- **Figma MCP requires OAuth auth:** The Figma MCP server at `https://mcp.figma.com/mcp` shows as "auth required" in mcporter. User must run `mcporter auth figma` before export can proceed.
- **Desktop + Mobile frames:** Each wireframe state needs both 1440×900 desktop and 390×844 mobile frames, side-by-side in a `.canvas` container.
- **Self-contained HTML:** Each wireframe is a single HTML file with all CSS inline (no external stylesheets except Google Fonts). No build step.
- **Checkout layout has no Footer:** Checkout pages use a minimal header (back-to-cart + logo). Wireframe should match this layout.
- **Auth-gated pages show content state:** Wireframes show the authenticated/populated state, not the login redirect. The sidebar nav (UserNavigation) appears on all user-account pages.

## Common Pitfalls

- **Token drift between wireframes** — Different CSS variable values across files creates inconsistency. Avoid by copying the exact `:root` block from an existing wireframe (e.g., homepage) without modification.
- **Forgetting mobile frame** — Every wireframe canvas must have both desktop AND mobile frames. The mobile frame needs `SdNav.init({ target: '#sd-nav-mobile', mobile: true })` with a separate target ID.
- **sd-nav.js `activeLink` mismatch** — The `activeLink` option must match one of the 5 nav links: 'Browse Cards', 'Deck Builder', 'Marketplace', 'Sell', 'Community'. Seller pages should use `activeLink: 'Sell'`. User account pages should not highlight any nav link.
- **Footer inconsistency** — Only some existing wireframes include footer (homepage, profile, search). Include footer on pages that show full nav (standard layout), skip on checkout/auth/workspace layouts.
- **Wireframing the current implementation instead of the target** — The sell/list-card wireframe should show the S08 target (3-step wizard: Identify → Condition + Photos → Price + Confirm), NOT the current 571-line CardListingForm. Similarly, community should show the "coming soon" state since R036 is deferred.
- **Overcomplicating per-page CSS** — Each wireframe re-declares all styling inline. Resist the urge to extract shared CSS files — the wireframes must be self-contained for Figma capture.
- **Figma export before auth** — The Figma MCP server will reject all calls until OAuth is completed. Don't attempt export until auth is confirmed.

## Open Risks

- **Figma MCP auth is a hard blocker for R025.** If the user cannot or does not authenticate, the wireframes can still be created (R013 satisfied) but cannot be exported to Figma. The wireframe generation should proceed independently of Figma auth. The export task should be a separate, final step.
- **Volume risk:** 24 wireframe files at ~1,000–2,000 lines each = 24,000–48,000 lines of HTML. This is substantial generation work that may need to be split across multiple tasks. Recommend grouping into 4-5 batch tasks by family.
- **Sell/list-card wireframe represents S08 target, not current state.** The 3-step wizard doesn't exist yet. The wireframe is speculative based on R017 spec (Identify → Condition + Photos → Price + Confirm). If the wizard design changes during S08, the wireframe may need updating.
- **Figma capture.js behavior unknown** — We haven't tested whether the capture.js script successfully processes these complex wireframes. The existing wireframes include it but we haven't confirmed successful Figma import.
- **Checkout wireframe needs careful treatment** — The checkout page uses a separate layout group `(checkout)` with minimal header (no main nav). The wireframe must reflect this distinct chrome.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Figma MCP | `figma/mcp-server-guide@implement-design` (4.6K installs) | available — relevant for Figma export workflow understanding |
| Figma MCP | `figma/mcp-server-guide@create-design-system-rules` (953 installs) | available — potentially useful for establishing design rules in Figma |
| Wireframing | `aj-geddes/useful-ai-prompts@wireframe-prototyping` (325 installs) | available — general wireframe prototyping guidance |
| Frontend Design | `frontend-design` | installed — available in `<available_skills>` for design quality |

**Note:** The `figma/mcp-server-guide@implement-design` skill (4.6K installs) may be useful for understanding the Figma MCP html-to-design workflow during the export task. The wireframe generation itself is HTML/CSS work that doesn't need additional skills — the existing 9 wireframes provide comprehensive patterns to follow.

## Task Decomposition Suggestion

Given the volume, recommend splitting S06 into 5-6 tasks:

1. **T01: Boilerplate template + Commerce wireframes (3 files)** — Cart, Checkout, Order Confirmed
2. **T02: Seller wireframes (5 files)** — Dashboard, List-Card (wizard), Upgrade, Payouts, Reputation
3. **T03: User account wireframes (8 files)** — Orders, Addresses, Settings, Wishlist, Reviews, Messages, Returns, Price Alerts
4. **T04: Misc wireframes (8 files)** — Verify Email, Categories, Collections, Community, Info Pages, Seller Storefront, Reset Password, Products
5. **T05: Figma export** — Authenticate Figma MCP + export all 33 wireframes

Tasks 1-4 can be parallelized if needed. Task 5 depends on all prior tasks + user auth action.

## Sources

- All 9 existing wireframes in `docs/plans/wireframes/` — authoritative pattern reference
- `sd-nav.js` (22KB) — shared nav component source
- Storefront route tree (`find storefront/src/app -name "page.tsx"`) — complete page inventory
- Page implementations — content structure reference for each wireframe
- M001 Context / Decisions — D003 (wireframe authority), D006 (coverage scope)
- Figma MCP discovery (`mcporter list`) — auth status confirmed as "auth required"
