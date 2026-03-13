---
estimated_steps: 5
estimated_files: 8
---

# T04: Misc wireframes — Verify Email, Categories, Collections, Community, Info Pages, Seller Storefront, Reset Password, Products

**Slice:** S06 — Wireframe Generation & Figma Export
**Milestone:** M001

## Description

Create the final 8 wireframes covering miscellaneous routes. These are a mix: some very simple (verify-email, reset-password), some medium (categories, products, seller storefront), and one that covers 6 routes in a single file (info-pages). After this task, all 24 new wireframes exist (33 total) and R013 is satisfied.

## Steps

1. **Create simple auth-adjacent wireframes.**
   - `storefront-verify-email.html`: Minimal page, no sd-nav (auth-adjacent). Centered content: SideDecked logo, two-state display. State 1 "Verifying": spinner animation, "Verifying your email..." text. State 2 "Verified": green check icon, "Email Verified!" heading, "Your account is now active" subtext, "Continue to SideDecked" button. Desktop + mobile frames.
   - `storefront-reset-password.html`: Minimal page, no sd-nav (separate route group). Two-state wireframe. State 1 "Request": centered card with "Reset Password" heading, email input, "Send Reset Link" button, "Back to Login" link. State 2 "Reset Form": new password + confirm password inputs, "Reset Password" button. Include an "Auth Error" variant: error icon, error message, "Try Again" / "Back to Login" buttons. `data-component`: `ProfilePasswordForm`, `AuthErrorContent`.

2. **Create product/commerce browse wireframes.**
   - `storefront-categories.html`: Standard layout, sd-nav (activeLink: 'Marketplace') + footer. Two-state wireframe. State 1 "Categories Index": heading "Browse Categories", category cards grid (each with category image/icon, name, product count). State 2 "Category Detail": breadcrumbs (Home > Categories > [Category]), category heading with description, sidebar filters (price range, condition, game, sort), product grid with pagination — similar to cards page layout. `data-component`: `AlgoliaProductsListing`, `ProductListing`.
   - `storefront-collections.html`: Standard layout, sd-nav (no activeLink) + footer. Collection header (collection image/banner, title, description, item count), then product grid with sidebar filters similar to categories detail. `data-component`: `CollectionHeader`, `ProductListing`.
   - `storefront-products.html`: Standard layout, sd-nav (activeLink: 'Marketplace') + footer. Product detail page (Medusa PDP): left column with product image gallery (main + thumbnails), right column with product title, price, description, variant selector (if applicable), quantity, "Add to Cart" button. Below: card enrichment section (if product is a TCG card — links to `/cards/[id]` for full card data, recent price, condition note). Related products row. `data-component`: `ProductDetailsPage`.

3. **Create community and info wireframes.**
   - `storefront-community.html`: Standard layout, sd-nav (activeLink: 'Community') + footer. "Coming Soon" design matching existing page: hero with community icon, "Community Hub Coming Soon" heading, description text, "Launching Soon" badge. Feature preview grid (3-col): Player Profiles, Discussion Forums, Local Events, Trading Groups, Tournament Calendar, Deck Sharing — each with icon, title, description. Discord CTA banner at bottom. `data-component`: `CommunityPage`.
   - `storefront-info-pages.html`: Standard layout, sd-nav (no activeLink) + footer. Shows the InfoPage component template: header card with eyebrow text, title, description, optional navigation pills (linking to related info pages). Below: content section cards with section title + paragraphs. Show a representative "About" page content. A second canvas state shows the "FAQ" variant with expandable question/answer sections instead of paragraphs. This single wireframe covers /about, /faq, /terms, /privacy, /contact, /terms/seller since they all use the same InfoPage component. `data-component`: `InfoPage`.

4. **Create seller storefront wireframe.**
   - `storefront-seller-storefront.html`: Standard layout, sd-nav (no activeLink) + footer. Seller header: cover image area, seller avatar, seller display name, member since date, trust score badge, stat chips (Total Sales, Items Listed, Response Rate, Avg Ship Time). Tab navigation (Products / Reviews). Products tab: seller's listing grid with card images, prices, conditions. Reviews tab: review list with buyer avatar, rating stars, text, date. `data-component`: `SellerPageHeader`, `SellerTabs`.

5. **Final verification.** Update `verify-wireframes.sh` threshold to expect exactly 33 files. Run verification — all checks must pass. Confirm every wireframe file has identical `:root` tokens, capture.js, and appropriate sd-nav usage.

## Must-Haves

- [ ] All 8 misc wireframe files exist with desktop + mobile frames
- [ ] Verify-email and reset-password have minimal chrome (no sd-nav)
- [ ] Categories and products use `activeLink: 'Marketplace'`
- [ ] Community uses `activeLink: 'Community'`
- [ ] Info-pages wireframe covers multiple page variants in one file
- [ ] Total wireframe count is 33 (9 existing + 24 new)
- [ ] `verify-wireframes.sh` updated to check for 33 files and passes
- [ ] All files have identical `:root` tokens and include capture.js
- [ ] `data-component` attributes on major sections

## Verification

- `ls docs/plans/wireframes/storefront-*.html | wc -l` returns 33
- `bash docs/plans/wireframes/verify-wireframes.sh` passes all checks (updated to 33-file threshold)
- `grep "capture.js" docs/plans/wireframes/storefront-*.html | wc -l` returns 33
- Token consistency: `grep "brand-primary: #8B5CF6" docs/plans/wireframes/storefront-*.html | wc -l` returns 33

## Inputs

- `docs/plans/wireframes/storefront-homepage.html` — boilerplate reference
- `docs/plans/wireframes/storefront-cards.html` — sidebar filter + grid pattern reference (for categories/collections)
- `storefront/src/components/content/InfoPage.tsx` — InfoPage component structure
- `storefront/src/app/[locale]/(main)/community/page.tsx` — community page content (201 lines)
- `storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx` — seller storefront structure
- All T01–T03 wireframes — for pattern consistency

## Expected Output

- 8 HTML wireframe files completing the full set of 24 new wireframes
- Updated `verify-wireframes.sh` with 33-file threshold
- R013 satisfied: all storefront pages have authoritative wireframe targets
