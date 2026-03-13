---
estimated_steps: 6
estimated_files: 4
---

# T01: Commerce wireframes — Cart, Checkout, Order Confirmed

**Slice:** S06 — Wireframe Generation & Figma Export
**Milestone:** M001

## Description

Create 3 HTML wireframes for the commerce funnel (cart, checkout, order confirmed) plus a verification script. These are the first new wireframes generated, so this task also establishes the copy-from-existing-boilerplate pattern. The checkout wireframe is notable because it uses a distinct layout (minimal header, no nav, no footer) matching the storefront's `(checkout)` route group.

## Steps

1. **Extract boilerplate reference.** From `storefront-homepage.html`, identify the exact `:root` CSS token block (lines 16–43), canvas/frame CSS, Google Fonts links, and capture.js script tag. These will be copied verbatim into every new wireframe. Do NOT modify any token values.

2. **Create `storefront-cart.html`.** Standard layout with sd-nav (no activeLink) + footer. Content: page title "Shopping Cart", multi-seller cart with items grouped by seller (seller avatar, name, rating), each item shows card thumbnail (2.5:3.5), name, set, condition badge, quantity controls (−/+), unit price, line total. Promo code input row. Cart summary sidebar: subtotal, shipping estimate, promo discount, total, "Proceed to Checkout" button. Empty state: "Your cart is empty" with browse CTA. Desktop: 2-column (items left, summary right). Mobile: stacked, summary sticky at bottom. Add `data-component` attributes: `Cart`, `EnhancedCartItems`, `CartSummary`.

3. **Create `storefront-checkout.html`.** Checkout layout: minimal header (left: "← Back to cart" button, center: SideDecked logo). NO sd-nav, NO footer. Content: 2-column layout. Left column: stepped sections (Address with form fields → Shipping method radio cards per seller → Payment with Stripe card element placeholder). Right column: order review (items list, subtotals, shipping per seller, total, "Place Order" button). Progress indicator showing current step. Add `data-component` attributes: `CartAddressSection`, `CartShippingMethodsSection`, `CartPaymentSection`, `CartReview`.

4. **Create `storefront-order-confirmed.html`.** Standard layout with sd-nav (no activeLink) + footer. Content: centered success state with large check icon in green circle, "Order Confirmed!" heading, order number, confirmation email notice. Order summary card: items purchased, seller(s), shipping addresses, payment summary, estimated delivery. CTA buttons: "View Order Details" and "Continue Shopping". Add `data-component` attributes: `OrderConfirmedSection`.

5. **Create `verify-wireframes.sh`.** Bash script that checks: (a) total wireframe file count is 33 (will grow as tasks complete — use `>= 12` for now, update to 33 in T04), (b) every storefront-*.html file contains capture.js script tag, (c) every storefront-*.html file contains the exact `:root` opening with `--brand-primary: #8B5CF6`, (d) files that should have sd-nav.js do contain it, (e) no file has divergent token values for key tokens (--bg-base, --text-primary). Script should output PASS/FAIL per check with file names on failure.

6. **Verify all 3 wireframes render correctly.** Open each in a browser (or validate HTML structure) to confirm both desktop and mobile frames appear. Run `verify-wireframes.sh` to confirm consistency.

## Must-Haves

- [ ] `storefront-cart.html` exists with multi-seller cart layout, desktop + mobile frames
- [ ] `storefront-checkout.html` exists with minimal header (no sd-nav, no footer), 2-column checkout
- [ ] `storefront-order-confirmed.html` exists with success state, desktop + mobile frames
- [ ] All 3 files have identical `:root` tokens copied from existing wireframes
- [ ] All 3 files include `capture.js` script tag
- [ ] Cart and order-confirmed include sd-nav.js + footer; checkout does NOT
- [ ] `verify-wireframes.sh` exists and passes
- [ ] `data-component` attributes present on major sections

## Verification

- `ls docs/plans/wireframes/storefront-cart.html docs/plans/wireframes/storefront-checkout.html docs/plans/wireframes/storefront-order-confirmed.html` — all 3 exist
- `bash docs/plans/wireframes/verify-wireframes.sh` — passes all checks
- `grep "capture.js" docs/plans/wireframes/storefront-cart.html docs/plans/wireframes/storefront-checkout.html docs/plans/wireframes/storefront-order-confirmed.html` — matches all 3
- `grep "sd-nav.js" docs/plans/wireframes/storefront-checkout.html` — returns nothing (checkout has no nav)
- `grep "sd-nav.js" docs/plans/wireframes/storefront-cart.html docs/plans/wireframes/storefront-order-confirmed.html` — matches both

## Inputs

- `docs/plans/wireframes/storefront-homepage.html` — boilerplate reference (`:root` tokens, canvas CSS, frame wrappers, footer, sd-nav init pattern)
- `storefront/src/components/sections/Cart/Cart.tsx` + `EnhancedCartItems.tsx` — cart content structure
- `storefront/src/app/[locale]/(checkout)/layout.tsx` — checkout minimal header pattern
- `storefront/src/components/sections/CartAddressSection/`, `CartShippingMethodsSection/`, `CartPaymentSection/`, `CartReview/` — checkout sections structure
- `storefront/src/components/sections/OrderConfirmedSection/` — order confirmed content

## Expected Output

- `docs/plans/wireframes/storefront-cart.html` — complete wireframe with multi-seller cart
- `docs/plans/wireframes/storefront-checkout.html` — complete wireframe with checkout layout exception
- `docs/plans/wireframes/storefront-order-confirmed.html` — complete wireframe with success state
- `docs/plans/wireframes/verify-wireframes.sh` — reusable verification script for all wireframes
