---
id: T01
parent: S06
milestone: M001
provides:
  - 3 commerce funnel wireframes (cart, checkout, order-confirmed)
  - Reusable verify-wireframes.sh script for all subsequent wireframe tasks
  - Established boilerplate-copy pattern for new wireframes
key_files:
  - docs/plans/wireframes/storefront-cart.html
  - docs/plans/wireframes/storefront-checkout.html
  - docs/plans/wireframes/storefront-order-confirmed.html
  - docs/plans/wireframes/verify-wireframes.sh
key_decisions:
  - Checkout wireframe uses custom minimal header (back-to-cart + centered logo) with NO sd-nav.js and NO footer, matching the storefront (checkout) route group layout
  - Cart wireframe shows multi-seller grouped items with seller avatar/name/rating in group headers, matching EnhancedCartItems component structure
  - Verification script uses >= 12 threshold for file count (will be updated to 33 in T04 when all wireframes complete)
patterns_established:
  - Copy :root tokens, canvas CSS, frame wrappers, footer, and sd-nav init verbatim from storefront-homepage.html into each new wireframe
  - Checkout-layout wireframes omit sd-nav.js and footer, using a minimal header instead
  - data-component attributes map directly to React component names from source code
observability_surfaces:
  - none
duration: ~35min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Commerce wireframes — Cart, Checkout, Order Confirmed

**Created 3 commerce funnel wireframes (cart, checkout, order-confirmed) with multi-seller support, checkout layout exception, and a reusable verification script — all passing 5/5 consistency checks.**

## What Happened

Extracted boilerplate from `storefront-homepage.html` (`:root` Voltage tokens, canvas/frame CSS, Google Fonts, capture.js, footer, sd-nav init) and created 3 wireframes:

1. **storefront-cart.html**: Multi-seller cart with items grouped by seller (avatar, name, rating, badge), each item showing card thumbnail placeholder (2.5:3.5 aspect), name, set, condition badge, quantity controls (−/+), unit price, line total. Promo code input row. Cart summary sidebar with subtotal, shipping estimate, promo discount, total, "Proceed to Checkout" CTA. Hidden empty state with "Your cart is empty" + browse CTA. Desktop: 2-column (items left, sticky summary right). Mobile: stacked. Includes sd-nav + footer.

2. **storefront-checkout.html**: Minimal header (← Back to cart button + centered SideDecked logo). NO sd-nav, NO footer. Progress indicator (Address → Shipping → Payment). 2-column layout: left column has stepped sections (address form fields, shipping method radio cards per seller, Stripe card element placeholder). Right column has order review (items list with seller attribution, per-seller shipping, tax, total, "Place Order" button). Mobile: single column stacked.

3. **storefront-order-confirmed.html**: Centered success state with large green check icon, "Order Confirmed!" heading, order number, email confirmation notice. Order summary card with items purchased, shipping/seller info grid, payment summary, estimated delivery. CTA buttons: "View Order Details" and "Continue Shopping". Includes sd-nav + footer.

4. **verify-wireframes.sh**: 5-check script validating file count (≥12), capture.js presence, `:root` token consistency, sd-nav.js presence/absence, and key token value consistency across all storefront wireframes.

## Verification

All task-level checks passed:
- `ls` confirms all 3 new wireframes exist
- `bash verify-wireframes.sh` → 5/5 PASS (file count=12, capture.js in all 12, brand-primary correct in all 12, sd-nav.js present where expected and absent from checkout, token consistency confirmed)
- `grep "capture.js"` matches all 3 new files
- `grep "sd-nav.js" storefront-checkout.html` returns nothing (correct)
- `grep "sd-nav.js" storefront-cart.html storefront-order-confirmed.html` matches both
- `data-component` attributes verified: Cart has `Cart`, `EnhancedCartItems`, `CartSummary`, `Cart-Empty`; Checkout has `CartAddressSection`, `CartShippingMethodsSection`, `CartPaymentSection`, `CartReview`; Order Confirmed has `OrderConfirmedSection`
- All 3 wireframes visually verified in browser — both desktop (1440px) and mobile (390px) frames render correctly

Slice-level verification (partial — T01 is task 1 of 5):
- ✅ `storefront-*.html | wc -l` = 12 (12 of 33 target)
- ✅ `capture.js` in all 12 files
- ✅ `sd-nav.js` in 10 files (auth + checkout excluded)
- ✅ `verify-wireframes.sh` passes all checks
- ⏳ Remaining 21 wireframes in T02–T04
- ⏳ Figma export in T05

## Diagnostics

Open any wireframe in a browser to visually verify. Run `bash docs/plans/wireframes/verify-wireframes.sh` to check consistency across all wireframes.

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `docs/plans/wireframes/storefront-cart.html` — Multi-seller cart wireframe with desktop + mobile frames
- `docs/plans/wireframes/storefront-checkout.html` — Checkout wireframe with minimal header, no nav/footer
- `docs/plans/wireframes/storefront-order-confirmed.html` — Order confirmed success state wireframe
- `docs/plans/wireframes/verify-wireframes.sh` — Reusable 5-check verification script for all wireframes
