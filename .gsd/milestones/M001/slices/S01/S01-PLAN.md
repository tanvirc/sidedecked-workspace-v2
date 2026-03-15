# S01: Design Foundation + Cart Optimizer Algorithm

**Goal:** Lock the shared UI surface (Header, Footer, PriceTag, skeletons) to the Voltage wireframe spec and prove the cart optimizer algorithm + BFF work correctly before any dependent UI is built on top of them.
**Demo:** `npm test` shows Header, Footer, PriceTag, skeleton components, the optimizer algorithm (all 3 modes), and the BFF endpoint all passing. The card detail BFF degrades gracefully when listings are unavailable. The optimizer returns correct seller groupings in < 50ms for a 15-card × 10-seller fixture.

## Must-Haves

- `Header` (via `ModernHeader`) visually matches `sd-nav.js` spec: glassmorphic sticky bar, 5 nav links (Cards/Decks/Marketplace/Sell/Community), search + wishlist + cart + auth icons, hamburger + bottom bar on mobile
- `Footer` matches wireframe: gradient wordmark, nav link columns, social icons
- `PriceTag` uses `.price` CSS class (tabular figures, DM Mono, `--text-price` color) for all 3 variants (compact / inline / detailed)
- `CardDetailBff` (`GET /api/cards/[id]`) aggregates catalog data from customer-backend and listings from backend; returns catalog data with `listings: []` when backend is slow or errors (no 500s)
- `optimizeCart(listings, mode)` — greedy algorithm producing correct output for cheapest / fewest-sellers / best-value modes
- `POST /api/optimizer/listings` BFF batches listing fetches with ≤ 5 concurrent requests, merges trust data, returns partial results on individual SKU failure
- Zero `alert()`/`confirm()`/`prompt()` in storefront — verified by grep
- All `.dark` Voltage tokens used for new components (no light-mode-only Tailwind classes)

## Proof Level

- This slice proves: contract
- Real runtime required: no (BFF and optimizer are tested against mocked HTTP responses)
- Human/UAT required: no

## Verification

- `npm test -- --run` in `storefront/` — all S01 test files pass
- `grep -rn "window\.alert\|window\.confirm\|window\.prompt" storefront/src/` — zero matches
- `grep -rn "bg-white\|text-gray-900\|text-black\b\|bg-gray-" storefront/src/components/organisms/Header storefront/src/components/organisms/Footer storefront/src/components/tcg/PriceTag.tsx` — zero matches

## Observability / Diagnostics

- Runtime signals: BFF logs `[BFF] /api/cards/[id] error: <message>` to stderr on listing fetch failure; optimizer logs nothing (pure function)
- Inspection surfaces: `GET /api/cards/[id]?id=test` returns `{ card: {...}, listings: [], listingsError: "..." }` shape visible in browser network tab
- Failure visibility: BFF response always includes `listingsError?: string` field so UI can surface degradation message
- Redaction constraints: no secrets in BFF responses; customer IDs are opaque UUIDs

## Integration Closure

- Upstream surfaces consumed: `storefront/src/app/colors.css` (Voltage tokens), `storefront/src/app/globals.css` (`.price` class, typography), `docs/plans/wireframes/sd-nav.js` (nav spec), `backend /store/consumer-seller/listings` (listing data shape), `customer-backend /api/catalog/cards/:id` (card data shape)
- New wiring introduced in this slice: `GET /api/cards/[id]` route added to Next.js API; `POST /api/optimizer/listings` route added; optimizer pure function importable by any component
- What remains before the milestone is truly usable end-to-end: all UI pages (S02–S05), auth (S04), listing wizard (S05), final wiring (S06)

## Tasks

- [ ] **T01: Audit and align Header to sd-nav.js wireframe spec** `est:2h`
  - Why: `ModernHeader.tsx` exists but may not precisely match the glassmorphic sticky nav, 5-link structure, mobile hamburger + bottom bar, and icon layout defined in `sd-nav.js`. This is the shared component rendered on every page — drift here cascades.
  - Files: `storefront/src/components/organisms/Header/ModernHeader.tsx`, `storefront/src/components/organisms/Header/__tests__/ModernHeader.test.tsx` (create)
  - Do: Read `docs/plans/wireframes/sd-nav.js` fully. Compare its nav HTML/CSS against `ModernHeader.tsx`. Fix any structural divergence: nav link order (Cards/Decks/Marketplace/Sell/Community), glassmorphic `bg: rgba(24,22,42,0.60) backdrop-blur-[16px]`, sticky `top-0 z-[1000]`, desktop icon row (search, wishlist, cart, auth avatar), mobile hamburger menu + bottom nav bar with 4 icons. Write tests asserting: nav links present and in order, cart count badge renders when `cart` prop has items, mobile menu toggle works, auth state renders sign-in button when `user` is null and avatar when `user` is set. Use Voltage tokens only (no `bg-white`, `text-gray-`).
  - Verify: `npm test -- --run --reporter=verbose src/components/organisms/Header` — all tests pass. `grep -rn "bg-white\|text-gray" storefront/src/components/organisms/Header/` — zero matches.
  - Done when: Header tests pass, zero light-mode class leaks, visual structure matches sd-nav.js spec.

- [ ] **T02: Audit and align Footer to wireframe spec** `est:1h`
  - Why: Footer renders on every page. Any light-mode classes or structural drift from the wireframe spec affects all pages simultaneously.
  - Files: `storefront/src/components/organisms/Footer/Footer.tsx`, `storefront/src/components/organisms/Footer/__tests__/Footer.test.tsx` (create if absent)
  - Do: Read the footer section of `docs/plans/wireframes/storefront-homepage.html`. Compare against `Footer.tsx`. Wire in: gradient wordmark (`linear-gradient(135deg, var(--brand-primary), #A78BFA)`), nav link columns (matching wireframe column structure), social icon row (Discord, Twitter, GitHub) with `--bg-surface-2` backgrounds. Write tests asserting: copyright year renders, nav links present, social links have correct `href` and `aria-label`, all colors use Voltage CSS custom properties.
  - Verify: `npm test -- --run src/components/organisms/Footer` — pass. `grep -rn "bg-white\|text-gray\|border-gray" storefront/src/components/organisms/Footer/` — zero.
  - Done when: Footer tests pass, zero light-mode leaks.

- [ ] **T03: Audit and lock PriceTag component** `est:1h`
  - Why: PriceTag is used on card grid items, detail pages, listings tables, and the optimizer panel. It must use the `.price` CSS class for tabular figures and `--text-price` color — if it uses inline styles or Tailwind instead, prices misalign in columns.
  - Files: `storefront/src/components/tcg/PriceTag.tsx`, `storefront/src/components/tcg/__tests__/PriceTag.test.tsx`
  - Do: Confirm `PriceTag` applies `className="price ..."` (from `globals.css`) to all price figures — not `font-mono` Tailwind class. Confirm `--text-price` color is applied (via `.price` class in CSS, not inline). Add/extend tests for: compact variant renders `$12.99` with `.price` class present in DOM, inline variant shows seller count, detailed variant shows market avg, `null` price renders "No sellers", `trend="down"` renders green arrow. Confirm `price` prop accepts dollar value not cents.
  - Verify: `npm test -- --run src/components/tcg/PriceTag` — all pass.
  - Done when: Tests pass, `.price` class confirmed on all price spans, no inline `fontFamily` or `color` overrides for the numeric figure itself.

- [ ] **T04: Build card skeleton loading components** `est:1h`
  - Why: Card browse, search results, and card detail all need skeleton states to avoid layout shift during data loading. These must be built before S02 can wire them into page-level loading states.
  - Files: `storefront/src/components/cards/CardGridSkeleton.tsx` (create), `storefront/src/components/cards/CardDetailSkeleton.tsx` (create), `storefront/src/components/cards/__tests__/CardSkeletons.test.tsx` (create)
  - Do: `CardGridSkeleton` — renders N (default 12) card-shaped skeleton tiles matching the card grid item dimensions from `storefront-cards.html` wireframe (aspect ratio ~2:3, rounded corners, pulse animation using `--bg-surface-2`/`--bg-surface-3`). `CardDetailSkeleton` — renders the card detail page skeleton: large image placeholder left, content block stacked right with 3 text lines and a table skeleton below. Use `animate-pulse` from Tailwind. No light-mode color classes. Write tests asserting: `CardGridSkeleton` renders 12 tiles by default, renders N tiles when `count` prop passed; `CardDetailSkeleton` renders image and content placeholders.
  - Verify: `npm test -- --run src/components/cards/CardSkeletons` — pass.
  - Done when: Both skeleton components render, tests pass, Voltage tokens only.

- [ ] **T05: Implement card detail BFF with graceful degradation** `est:2h`
  - Why: The card detail page needs data from two backends simultaneously. The BFF must return catalog data even when the listings backend is unavailable — a 500 on listing fetch should not 500 the page.
  - Files: `storefront/src/app/api/cards/[id]/route.ts` (create/rewrite), `storefront/src/app/api/cards/[id]/route.test.ts` (create)
  - Do: `GET /api/cards/[id]`: (1) fire both `GET {CUSTOMER_BACKEND_URL}/api/catalog/cards/:id` and `GET {BACKEND_URL}/store/consumer-seller/listings?catalog_sku=:id` concurrently using `Promise.allSettled`. (2) If catalog fetch fails, return `NextResponse.json({ error: "Card not found" }, { status: 404 })`. (3) If listings fetch fails, return `{ card: catalogData, listings: [], listingsError: "Listings temporarily unavailable" }` with status 200. (4) On full success, merge and return `{ card: catalogData, listings: listingsData }`. Response shape: `{ card: { id, name, game, setCode, imageUrl, attributes, prints }, listings: Array<{ id, sellerId, sellerName, price, condition, quantity, shippingCost, trustScore }>, listingsError?: string }`. Write tests: happy path returns merged data, listings 500 returns card with empty listings + error field, catalog 404 returns 404, concurrent fetch race (listings slow) still returns within test timeout.
  - Verify: `npm test -- --run src/app/api/cards` — all pass.
  - Done when: BFF tests pass including the degradation scenario; response always has `card` field when catalog responds 200.

- [ ] **T06: Implement greedy cart optimizer algorithm** `est:2h`
  - Why: The hardest algorithmic problem in M001. Must be proven correct on a multi-seller fixture before any UI is built around it. All 3 modes (cheapest, fewest-sellers, best-value) must produce verifiably correct output.
  - Files: `storefront/src/lib/optimizer/types.ts` (create), `storefront/src/lib/optimizer/optimizeCart.ts` (create), `storefront/src/lib/optimizer/__tests__/optimizeCart.test.ts` (create)
  - Do: Types — `Listing { catalogSku, sellerId, sellerName, price, condition, quantity, shippingCost, trustScore }`, `SellerGroup { sellerId, sellerName, listings: Listing[], subtotal, shipping, total }`, `OptimizationResult { groups: SellerGroup[], totalCost, estimatedSavings, unavailableSkus: string[] }`, `OptimizationMode = 'cheapest' | 'fewest-sellers' | 'best-value'`. Algorithm — `optimizeCart(listings: Listing[], mode: OptimizationMode): OptimizationResult`: (1) group listings by catalogSku, deduplicate (lowest price per seller per SKU), (2) sort SKUs by scarcity (fewest listings first), (3) for each SKU in scarcity order: pick cheapest listing (`cheapest`), or cheapest listing from already-chosen sellers if one exists else cheapest new seller (`fewest-sellers`), or apply best-value logic (`fewest-sellers` when cost increase ≤ 15% vs `cheapest`, else `cheapest`), (4) accumulate per-seller subtotals + shipping (deduplicated — shipping charged once per seller), (5) compute `estimatedSavings` as delta between worst-case (all separate sellers) and chosen grouping. SKUs with zero listings go into `unavailableSkus`. Write tests: 15-card × 10-seller fixture, all 3 modes produce expected groupings; single seller, all-owned (empty input), no listings edge cases; performance — `Date.now()` delta < 50ms for 60-card input.
  - Verify: `npm test -- --run src/lib/optimizer/__tests__/optimizeCart` — all pass.
  - Done when: All test cases pass including performance check; algorithm handles edge cases without throwing.

- [ ] **T07: Implement optimizer listings BFF** `est:2h`
  - Why: The UI cannot call the backend listings API directly (CORS, auth). The BFF batches listing fetches for all missing-card SKUs, merges trust scores, and caps concurrency to stay within Railway's pool limit.
  - Files: `storefront/src/app/api/optimizer/listings/route.ts` (create/rewrite), `storefront/src/app/api/optimizer/__tests__/listings.test.ts` (create)
  - Do: `POST /api/optimizer/listings` body: `{ skus: string[], mode: OptimizationMode }`. (1) Validate input — reject if `skus` empty or > 60 or `mode` invalid. (2) Fetch listings for all SKUs using `Promise.allSettled` in batches of 5 concurrent: `GET {BACKEND_URL}/store/consumer-seller/listings?catalog_sku=:sku` per SKU. (3) For each resolved SKU, fetch seller trust score from customer-backend: `GET {CUSTOMER_BACKEND_URL}/api/sellers/:sellerId/trust-score` (batch by unique seller IDs). (4) Merge trust scores onto listings. (5) Run `optimizeCart(allListings, mode)`. (6) Return `{ result: OptimizationResult, partialFailures: string[] }` — include SKUs that failed in `partialFailures` but still optimize what's available. Write tests: happy path returns optimization result, one SKU fails returns partial result + partialFailures array, all SKUs fail returns 200 with empty result + all skus in partialFailures, invalid mode returns 400, empty skus returns 400.
  - Verify: `npm test -- --run src/app/api/optimizer/__tests__/listings` — all pass.
  - Done when: BFF tests pass including partial failure scenario; concurrency is capped at 5 (verifiable by counting mock call timing in tests).

- [x] **T08: Zero alert() audit + commit slice branch** `est:30m`
  - Why: Slate-clean for S01. Alert dialogs are a UX regression — everything must use sonner before any new UI is added.
  - Files: any storefront files containing `window.alert`, `window.confirm`, `window.prompt`, `alert(`, `confirm(`
  - Do: `grep -rn "window\.alert\|window\.confirm\|window\.prompt\|\balert(\|\bconfirm(" storefront/src/`. For each match: replace `alert(msg)` with `toast(msg)` (import from `sonner`), replace `confirm(msg)` with an `AlertDialog` from `storefront/src/components/ui/alert-dialog.tsx`. Commit all S01 changes to `gsd/M001/S01` branch inside `storefront/`.
  - Verify: `grep -rn "window\.alert\|window\.confirm\|window\.prompt" storefront/src/` — zero matches. `npm test -- --run` — all tests pass.
  - Done when: Zero alert/confirm/prompt calls. Full test suite green. Changes committed to slice branch.

## Files Likely Touched

- `storefront/src/components/organisms/Header/ModernHeader.tsx`
- `storefront/src/components/organisms/Header/__tests__/ModernHeader.test.tsx`
- `storefront/src/components/organisms/Footer/Footer.tsx`
- `storefront/src/components/organisms/Footer/__tests__/Footer.test.tsx`
- `storefront/src/components/tcg/PriceTag.tsx`
- `storefront/src/components/tcg/__tests__/PriceTag.test.tsx`
- `storefront/src/components/cards/CardGridSkeleton.tsx`
- `storefront/src/components/cards/CardDetailSkeleton.tsx`
- `storefront/src/components/cards/__tests__/CardSkeletons.test.tsx`
- `storefront/src/app/api/cards/[id]/route.ts`
- `storefront/src/app/api/cards/[id]/route.test.ts`
- `storefront/src/lib/optimizer/types.ts`
- `storefront/src/lib/optimizer/optimizeCart.ts`
- `storefront/src/lib/optimizer/__tests__/optimizeCart.test.ts`
- `storefront/src/app/api/optimizer/listings/route.ts`
- `storefront/src/app/api/optimizer/__tests__/listings.test.ts`
