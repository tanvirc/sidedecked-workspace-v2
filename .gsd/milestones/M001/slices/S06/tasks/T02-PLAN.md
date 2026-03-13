---
estimated_steps: 6
estimated_files: 5
---

# T02: Seller wireframes — Dashboard, List-Card wizard, Upgrade, Payouts, Reputation

**Slice:** S06 — Wireframe Generation & Figma Export
**Milestone:** M001

## Description

Create 5 HTML wireframes for the seller experience. All use sd-nav with `activeLink: 'Sell'`. The list-card wireframe is critical — it defines the S08 3-step wizard target before implementation. Content references come from existing React components (ConsumerSellerDashboard 1017 lines, CustomerToSellerUpgrade 945 lines, PayoutDashboard 219 lines, ReputationDashboard 502 lines).

## Steps

1. **Create `storefront-sell-dashboard.html`.** Standard layout, sd-nav `activeLink: 'Sell'` + footer. Content: sell dashboard with tab navigation (Overview / Listings / Sales / Profile). Overview tab shown: stat cards row (Active Listings, Total Sales, Revenue, Average Rating), recent orders table, tier progress bar (Bronze → Silver → Gold → Platinum) with current tier highlighted, quick-action buttons. Show a second canvas state for the Listings tab: listing table with card thumbnail, title, condition, price, status badge, actions (edit/deactivate). Desktop + mobile frames for each state. `data-component`: `ConsumerSellerDashboard`.

2. **Create `storefront-sell-list-card.html`.** Standard layout, sd-nav `activeLink: 'Sell'` + footer. Content: **3-step wizard** (this is the S08 target design, NOT the current CardListingForm). Step 1 "Identify": search input to find card, results dropdown, then set/printing selector showing available printings with set icons. Step 2 "Condition + Photos": game-specific condition grade selector (NM/LP/MP/HP/DMG with visual guide thumbnails), front + back photo upload zones with drag-and-drop placeholder, notes textarea. Step 3 "Price + Confirm": market price display (low/median/high from last 30 days), price input pre-filled with median, competitive indicator (gauge showing where price falls), shipping config (standard/tracked), final confirmation card summarizing the listing. Show progress indicator (step dots) at top. Desktop: centered single-column wizard (max-width ~720px). Mobile: full-width wizard. `data-component`: `ListingWizard`, `ConditionGradeSelector`, `PricingSection`, `PhotoUploader`.

3. **Create `storefront-sell-upgrade.html`.** Standard layout, sd-nav `activeLink: 'Sell'` + footer. Content: two-state wireframe. State 1 "Benefits CTA": hero section with "Start Selling on SideDecked" heading, benefits grid (No Listing Fees, Instant Payouts, Built-in Buyer Protection, Market Pricing Tools), "Become a Seller" CTA button. State 2 "Upgrade Form": form with business name, description, payout method selection, terms acceptance checkbox, "Complete Setup" button. `data-component`: `CustomerToSellerUpgrade`.

4. **Create `storefront-sell-payouts.html`.** Standard layout, sd-nav `activeLink: 'Sell'` + footer. Content: balance cards row (Available Balance, Pending, Total Earned), payout history table (date, amount, status badge, method), "Request Payout" button. Secondary state: payout settings with Stripe Connect integration placeholder and minimum payout threshold setting. `data-component`: `PayoutDashboard`.

5. **Create `storefront-sell-reputation.html`.** Standard layout, sd-nav `activeLink: 'Sell'` + footer. Content: trust score section (large score number with circular gauge, breakdown: Shipping Speed, Item Accuracy, Communication, Overall Rating), tier progress (current tier badge + progress to next tier), recent reviews list (buyer avatar, rating stars, review text, date, seller response if any), response rate stat. `data-component`: `ReputationDashboard`.

6. **Run verification.** Execute `verify-wireframes.sh` to confirm all 5 new files pass consistency checks alongside the T01 files and existing 9.

## Must-Haves

- [ ] All 5 seller wireframe files exist with desktop + mobile frames
- [ ] All use `activeLink: 'Sell'` in sd-nav init
- [ ] List-card wireframe shows 3-step wizard (Identify → Condition+Photos → Price+Confirm), NOT current CardListingForm
- [ ] Dashboard wireframe shows at least 2 tab states (Overview + Listings)
- [ ] Upgrade wireframe shows both benefits CTA and upgrade form states
- [ ] All files have identical `:root` tokens and include capture.js
- [ ] `data-component` attributes on major sections

## Verification

- `ls docs/plans/wireframes/storefront-sell-*.html | wc -l` returns 5
- `grep "activeLink: 'Sell'" docs/plans/wireframes/storefront-sell-*.html | wc -l` — matches all 5 (desktop inits)
- `bash docs/plans/wireframes/verify-wireframes.sh` passes
- `grep "ListingWizard" docs/plans/wireframes/storefront-sell-list-card.html` — confirms wizard component name

## Inputs

- `docs/plans/wireframes/storefront-homepage.html` — boilerplate reference
- `docs/plans/wireframes/storefront-profile.html` — multi-state/tab wireframe pattern reference
- `storefront/src/components/seller/ConsumerSellerDashboard.tsx` — dashboard content structure (1017 lines)
- `storefront/src/components/seller/CustomerToSellerUpgrade.tsx` — upgrade flow structure (945 lines)
- `storefront/src/components/seller/PayoutDashboard.tsx` — payout content (219 lines)
- `storefront/src/components/seller/ReputationDashboard.tsx` — reputation content (502 lines)
- S08 spec from R017: 3-step wizard (Identify → Condition + Photos → Price + Confirm)

## Expected Output

- `docs/plans/wireframes/storefront-sell-dashboard.html` — tabbed dashboard with overview + listings states
- `docs/plans/wireframes/storefront-sell-list-card.html` — 3-step wizard wireframe (S08 target design)
- `docs/plans/wireframes/storefront-sell-upgrade.html` — benefits CTA + upgrade form states
- `docs/plans/wireframes/storefront-sell-payouts.html` — balance + history + settings
- `docs/plans/wireframes/storefront-sell-reputation.html` — trust score + reviews + tier progress
