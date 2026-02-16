---
workflowType: bmad-specification
workflowVersion: 6.0.0-Beta.8
specId: 02-commerce-marketplace-system
status: completed
currentSpecification: false
primaryOwner: backend
targetRepos:
  - backend
  - storefront
  - vendorpanel
stepsCompleted:
  - sidedecked-router.route
  - analyst.create-product-brief
  - pm.create-prd
  - architect.create-architecture
  - pm.validate-prd
  - architect.check-implementation-readiness
  - sm.create-epics-and-stories
  - dev.dev-story
  - qa.qa-automate
inputDocuments:
  - docs/architecture/01-system-overview.md
  - docs/architecture/02-architectural-principles.md
  - docs/standards/code-standards.md
  - docs/standards/testing-standards.md
  - module-status.json
outputArtifacts:
  productBrief: _bmad-output/planning-artifacts/02-commerce-marketplace-system/product-brief.md
  prd: _bmad-output/planning-artifacts/02-commerce-marketplace-system/prd.md
  architecture: _bmad-output/planning-artifacts/02-commerce-marketplace-system/architecture.md
  readinessReport: _bmad-output/planning-artifacts/02-commerce-marketplace-system/implementation-readiness.md
  stories: _bmad-output/planning-artifacts/02-commerce-marketplace-system/epics-and-stories.md
---
# Commerce & Marketplace System

## BMAD Workflow Trace

1. @sidedecked-router: Route bounded context and enforce split-domain boundaries.
2. @analyst: Build product brief with user/problem/value framing.
3. @pm: Produce and validate PRD with measurable acceptance criteria.
4. @architect: Define architecture decisions and integration boundaries.
5. @pm + @architect: Run PO readiness gate (validate-prd, check-implementation-readiness).
6. @sm: Decompose into epics/stories for implementation.
7. @dev + @qa: Execute and verify delivery against acceptance criteria.

## Step 1: Routing Decision (@sidedecked-router)

- Bounded context: Commerce operations and marketplace transactions
- Primary owner repo: backend
- Participating repos: backend, storefront, vendorpanel
- API boundary constraints:
  - Checkout, orders, returns, and commerce workflows remain in backend APIs
  - Storefront and vendorpanel are API consumers for commerce workflows
  - Cross-domain catalog lookups use customer-backend APIs where needed
- Data boundary constraints:
  - Transactional commerce data remains in mercur-db
  - Card metadata references are retrieved through API integration, not direct DB reads
  - Payment and order state changes are emitted via domain events for dependent services

## Step 2: Product Brief Summary (@analyst)

The Commerce & Marketplace System handles all transactional aspects of the SideDecked marketplace, built on MercurJS/Medusa v2. It manages product listings, shopping cart functionality, multi-vendor checkout, order processing, and fulfillment. This system enables the core business model by facilitating secure transactions between card collectors and sellers while maintaining platform quality through reviews and seller management.

## Step 3: PRD Baseline (@pm)

- This specification is the source-of-truth PRD for the bounded context above.
- Functional requirements are represented by epic/story decomposition and acceptance criteria in Step 7.
- Non-functional requirements are captured in Technical, Security, Performance, and Testing sections below.
- Acceptance criteria statuses must remain machine-parseable for scripts/check-acceptance-criteria.js.

## Step 4: Architecture Constraints (@architect)

- Preserve split-domain ownership and prohibit direct database coupling between mercur-db and sidedecked-db.
- Cross-domain behavior must be implemented via HTTP APIs and/or events with explicit contracts.
- Implementation must follow existing patterns for service/controller/repository boundaries in the owning repo.

## Step 5: PO Gate - PRD Validation (@pm)

- Requirement traceability to user stories and acceptance criteria is present.
- Scope and status are synchronized with module-status.json.
- Acceptance criteria statuses remain in the approved parseable set.

## Step 6: PO Gate - Implementation Readiness (@architect)

- Affected APIs and bounded contexts are explicit in Step 1 and supporting sections.
- Architecture constraints and quality gates are documented before implementation.
- Validation commands are defined in Step 8.

## Step 7: Epics and Stories (@sm)

### Epic 1: Shopping Cart & Checkout

#### User Story 1.1: Shopping Cart Management

_As a customer, I want to add items to a shopping cart and manage my intended purchases so that I can buy multiple items efficiently._

**UI/UX Implementation:**

- **Pages**: Product listing pages ("Add to Cart" button), `/cart` (Shopping Cart Page)
- **Components**:
  - AddToCartButton component with loading states
  - ShoppingCartDrawer component (slide-out cart)
  - CartItemCard component with quantity controls
  - VendorGrouping component for multi-vendor organization
  - CartTotals component with cost breakdown
- **Add to Cart Interaction**:
  - Prominent "Add to Cart" button on all product listings
  - One-click addition with immediate visual feedback
  - Success animation with cart icon bounce
  - Mini cart drawer slides in from right showing added item
  - "View Cart" and "Continue Shopping" options in drawer
- **Cart Page Layout**:
  - Cart header showing item count and total value
  - Multi-vendor organization grouping items by seller
  - Seller info display (name, rating, location) for each vendor group
  - Individual vendor subtotals and combined shipping indicators
- **Cart Item Design**:
  - 80x80px product image thumbnails
  - Card name, set information, and condition badge
  - Price per unit and total calculation display
  - Quantity controls (decrease/increase buttons with validation)
  - "Remove" button with confirmation modal for expensive items
  - "Save for Later" link moving items to wishlist
- **Mobile Optimization**:
  - Swipe-to-remove gesture on cart items
  - Bottom cart summary sticky bar
  - Touch-friendly quantity controls (min 44px)
  - Collapsible vendor sections for space efficiency

**Acceptance Criteria:**

- ✅ One-click "Add to Cart" on all product listings (IMPLEMENTED)
  - Location: Add to cart functionality throughout storefront
- ✅ Cart persists across browser sessions and devices (IMPLEMENTED)
  - Location: Cart persistence through MercurJS session management
- ✅ Cart displays item details: image, name, condition, price, vendor, shipping (IMPLEMENTED)
  - Location: `storefront/src/components/sections/Cart/EnhancedCartItems.tsx`
- ✅ Quantity adjustment with real-time inventory checking (IMPLEMENTED)
  - Location: `storefront/src/components/molecules/UpdateCartItemButton/`
- ✅ Remove items with confirmation for expensive items (IMPLEMENTED)
  - Location: `storefront/src/components/molecules/DeleteCartItemButton/`
- 🔄 Save for later functionality to move items out of active cart (PARTIAL)
  - Note: Wishlist functionality exists, save for later integration not confirmed
- ✅ Cart total calculation including items, shipping, taxes, fees (IMPLEMENTED)
  - Location: `storefront/src/components/organisms/CartSummary/`
- ✅ Multi-vendor cart organization grouping items by seller (IMPLEMENTED)
  - Location: Enhanced cart with seller grouping and multi-seller notifications
- ✅ Mobile-optimized cart interface with swipe actions (IMPLEMENTED)
  - Location: Mobile-responsive cart design with touch-friendly controls

#### User Story 1.2: Multi-Vendor Checkout Process

_As a customer, I want to purchase items from multiple vendors in a single transaction so that I can get all my needed cards efficiently._

**UI/UX Implementation:**

- **Pages**: `/checkout` (Multi-step checkout flow)
- **Components**:
  - CheckoutStepper component (progress indicator)
  - ShippingAddressForm component with validation
  - PaymentMethodSelector component
  - OrderReview component with vendor breakdown
  - ExpressCheckout component for returning customers
- **Checkout Flow Steps**:
  1. **Shipping Address**: Address form with autocomplete, multiple saved addresses dropdown
  2. **Payment Method**: Credit card, PayPal, Apple Pay, Google Pay options with saved methods
  3. **Review Order**: Final review with itemized breakdown before payment
- **Progress Indicator**:
  - Visual stepper showing current step (1 of 3, 2 of 3, 3 of 3)
  - Completed steps show checkmarks, current step highlighted
  - Back/Next navigation between steps
- **Vendor Organization in Checkout**:
  - Clear vendor sections with seller info and items
  - Individual shipping calculations per vendor
  - Combined shipping notifications where applicable
  - Delivery timeframe estimates per vendor
- **Order Review Section**:
  - Itemized breakdown by vendor (items, shipping, taxes)
  - Grand total calculation with all fees
  - Edit options to modify cart or shipping without leaving checkout
  - Terms and conditions acceptance checkbox
- **Express Checkout Features**:
  - "Buy Now" button for single-item purchases
  - Saved payment/shipping info auto-population
  - One-click checkout for returning customers
- **Guest Checkout Option**:
  - "Continue as Guest" prominent option
  - Optional account creation at end of process
  - Email required for order confirmation
- **Mobile Optimization**:
  - Single-column layout with clear section separation
  - Large, touch-friendly payment method buttons
  - Sticky "Place Order" button at bottom
  - Collapsible order summary for space efficiency

**Acceptance Criteria:**

- ✅ Unified checkout flow for multi-vendor purchases (IMPLEMENTED)
  - Location: `storefront/src/app/[locale]/(checkout)/checkout/page.tsx`
- ✅ Clear breakdown of costs per vendor (items, shipping, taxes) (IMPLEMENTED)
  - Location: `storefront/src/components/sections/CartReview/` with vendor breakdown
- ✅ Combined shipping calculation when vendors can ship together (IMPLEMENTED)
  - Location: Multi-vendor shipping logic in cart workflows
- ✅ Single payment processing for entire order (IMPLEMENTED)
  - Location: `storefront/src/components/sections/CartPaymentSection/`
- ✅ Shipping address validation and multiple address support (IMPLEMENTED)
  - Location: `storefront/src/components/sections/CartAddressSection/`
- ✅ Payment method selection (credit card, PayPal, Apple Pay, Google Pay) (IMPLEMENTED)
  - Location: PaymentWrapper and payment method integration
- ✅ Order review page with itemized breakdown before payment (IMPLEMENTED)
  - Location: `storefront/src/components/sections/CartReview/CartReview.tsx`
- 🔄 Guest checkout option for users without accounts (PARTIAL)
  - Note: Checkout exists, guest-specific flow not confirmed
- 🔄 Express checkout for returning customers with saved information (PARTIAL)
  - Note: Saved address/payment methods exist, express flow not confirmed
- ✅ Order confirmation with tracking numbers and vendor contact info (IMPLEMENTED)
  - Location: Order confirmation and order detail pages with tracking info

#### User Story 1.3: Shipping & Tax Calculation

_As a customer, I want to see accurate shipping costs and taxes during checkout so that I know the total cost before purchasing._

**UI/UX Implementation:**

- **Components**:
  - ShippingCalculator component with real-time updates
  - TaxCalculator component showing breakdown
  - ShippingOptionsSelector component per vendor
  - CombinedShippingIndicator component
  - InternationalShippingWarning component
- **Shipping Calculation Interface**:
  - Real-time shipping cost updates on address change
  - Loading spinners during carrier API calls
  - Shipping options per vendor (Standard, Expedited, Overnight)
  - Delivery timeframe display (e.g., "3-5 business days")
  - Combined shipping badges when vendors can ship together
- **Shipping Options Display**:
  - Radio button selection for each shipping method
  - Cost and delivery time clearly displayed
  - Free shipping threshold indicators ("$5 more for free shipping")
  - Express shipping badges with premium styling
  - Insurance options for high-value orders (checkbox)
- **Tax Calculation Display**:
  - Tax breakdown by jurisdiction (state, local)
  - Tax-exempt status indicator if applicable
  - "Tax will be calculated at checkout" message if address needed
  - International orders: customs declaration notice
- **Cost Breakdown Visualization**:
  - Items subtotal per vendor with clear organization
  - Shipping costs per vendor with delivery methods
  - Tax calculations with jurisdictional breakdown
  - Platform fees (if applicable) clearly itemized
  - **Grand Total** prominently displayed with large font
- **International Shipping Features**:
  - Currency conversion display
  - Customs declaration information
  - Import duty/tax estimates where possible
  - Restricted countries warning messages
- **Mobile Optimization**:
  - Collapsible cost breakdown sections
  - Swipeable shipping option cards
  - Sticky total bar showing grand total
  - Touch-friendly shipping method selection

**Acceptance Criteria:**

- ✅ Real-time shipping calculation based on customer location and vendor settings (IMPLEMENTED)
  - Location: `storefront/src/components/sections/CartShippingMethodsSection/`
- 🔄 Integration with shipping carriers for accurate rates (AusPost, USPS, UPS, FedEx) (PARTIAL)
  - Note: Shipping method selection exists, direct carrier integration not confirmed
- ✅ Shipping options per vendor (standard, expedited, overnight) (IMPLEMENTED)
  - Location: CartShippingMethodsSection with multiple shipping options
- ✅ Combined shipping discounts when multiple items ship from same vendor (IMPLEMENTED)
  - Location: Enhanced cart shows combined shipping notifications
- 🔄 International shipping support with customs declaration (PARTIAL)
  - Note: Shipping framework exists, international specifics not confirmed
- ✅ Tax calculation based on customer location and vendor nexus rules (IMPLEMENTED)
  - Location: Tax calculations integrated in cart totals
- 🔄 Tax-exempt status support for qualified buyers (PARTIAL)
  - Note: Tax calculation exists, exemption handling not confirmed
- 🔄 Free shipping threshold configuration per vendor (PARTIAL)
  - Note: Shipping cost calculations exist, threshold configuration not confirmed
- 🔄 Shipping insurance options for high-value orders (PARTIAL)
  - Note: Shipping options exist, insurance specifics not confirmed

### Epic 2: Order Processing & Management

#### User Story 2.1: Order Creation & Notification

_As a customer, I want to receive immediate confirmation when my order is placed so that I know the transaction was successful._

**UI/UX Implementation:**

- **Pages**: `/checkout/confirmation` (Order confirmation page), `/orders/:id` (Order status page)
- **Components**:
  - OrderConfirmation component with success animation
  - OrderSummary component with vendor breakdown
  - TrackingInfo component with carrier links
  - NotificationPreferences component
  - CustomerServiceContact component
- **Order Confirmation Page**:
  - Large success checkmark animation on page load
  - "Order Confirmed!" header with order number prominently displayed
  - Estimated delivery date with calendar icon
  - Order summary with vendor organization and item details
  - Payment confirmation with last 4 digits of payment method
  - Next steps section ("What happens next?")
- **Order Details Display**:
  - Unique order number with copy-to-clipboard functionality
  - Order date and payment confirmation timestamp
  - Itemized breakdown by vendor with seller contact info
  - Shipping addresses and delivery methods per vendor
  - Order total with payment method used
- **Tracking Information Section**:
  - "Track Your Order" prominent button/link
  - Expected delivery dates per vendor shipment
  - Carrier information (USPS, UPS, FedEx) with logos
  - Tracking numbers (when available) with direct carrier links
- **Communication Preferences**:
  - SMS notification opt-in toggle with phone number field
  - Email notification preferences (order updates, shipping, delivery)
  - Customer service contact information prominently displayed
- **Post-Order Actions**:
  - "Continue Shopping" button to return to marketplace
  - "View Order History" link to user account
  - Social sharing options ("I just bought on SideDecked!")
  - Add to calendar option for expected delivery dates
- **Mobile Optimization**:
  - Single-column layout with clear section dividers
  - Large, touch-friendly buttons for tracking and actions
  - Swipeable vendor sections if multiple vendors
  - Copy order number with single tap

**Acceptance Criteria:**

- ✅ Immediate order confirmation email with complete order details (IMPLEMENTED)
  - Location: Order processing in checkout flow
- ✅ Order number generation with unique identifier format (IMPLEMENTED)
  - Location: `retrieveOrderSet` function generates display_id
- ✅ Order status page accessible via link in confirmation email (IMPLEMENTED)
  - Location: `/user/orders/[id]` page shows order details
- ❌ SMS notifications for order updates (if enabled by customer) (NOT BUILT)
- ✅ Inventory immediately reserved upon successful payment (IMPLEMENTED)
  - Location: MercurJS handles inventory reservation
- ❌ Automatic vendor notifications with fulfillment instructions (NOT BUILT)
- ✅ Order splitting when items come from multiple vendors (IMPLEMENTED)
  - Location: OrderSet system groups multi-vendor orders
- ✅ Payment processing confirmation and receipt generation (IMPLEMENTED)
  - Location: Integrated with Stripe payment processing
- 🔄 Expected delivery date calculation and communication (PARTIAL)
  - Location: Order details show date but calculation logic unclear
- ❌ Customer service contact information in all communications (NOT BUILT)

#### User Story 2.2: Order Tracking & Updates

_As a customer, I want to track my order status and receive updates so that I know when to expect delivery._

**UI/UX Implementation:**

- **Pages**: `/orders/:id` (Order tracking page), `/orders` (Order history)
- **Components**:
  - OrderTimeline component with progress visualization
  - TrackingMap component showing package location
  - DeliveryEstimate component with countdown
  - CarrierIntegration component with live updates
  - ExceptionHandling component for delivery issues
- **Order Timeline Interface**:
  - Visual progress bar with status milestones
  - Status indicators: Confirmed → Processing → Shipped → In Transit → Delivered
  - Timestamps for each status change with relative time ("2 hours ago")
  - Checkmarks for completed steps, current step highlighted
  - Animated progress transitions between states
- **Tracking Details Section**:
  - Real-time location updates with carrier integration
  - Interactive map showing package journey (optional premium feature)
  - Carrier tracking number with direct link to carrier site
  - Package weight and dimensions for reference
  - Special handling notes (signature required, hold for pickup)
- **Delivery Information Panel**:
  - Expected delivery date with confidence indicator
  - Delivery window (e.g., "Between 10 AM - 2 PM")
  - Weather delay warnings where applicable
  - Alternative delivery options (hold at location, reschedule)
- **Exception Handling Interface**:
  - Delay notifications with updated delivery estimates
  - Failed delivery attempt information with next attempt details
  - Customer action required notifications (sign for package, provide access)
- **Multi-Vendor Order Management**:
  - Separate tracking sections for each vendor shipment
  - Combined delivery status overview
  - Individual carrier information per shipment
  - Coordinated delivery options when possible
- **Communication Features**:
  - SMS/email update preferences toggle
  - "Notify me when delivered" checkbox
  - Share tracking link with others functionality
  - Direct message vendor option for questions
- **Mobile Optimization**:
  - Vertical timeline layout optimized for mobile scrolling
  - Large status indicators and touch-friendly map interaction
  - Swipe between multiple shipments if applicable
  - One-tap carrier website access

**Acceptance Criteria:**

- 🔄 Real-time order tracking page with status timeline (PARTIAL)
  - Location: `/user/orders/[id]` exists but basic status display only
- ❌ Integration with carrier tracking systems for live updates (NOT BUILT)
- ❌ Automatic status update emails (shipped, in transit, delivered) (NOT BUILT)
- ❌ Expected delivery date updates based on actual shipping progress (NOT BUILT)
- ❌ Delivery confirmation with photo proof when available (NOT BUILT)
- ❌ Exception handling for delivery issues (delays, failed delivery) (NOT BUILT)
- ✅ Easy access to tracking from order history and email confirmations (IMPLEMENTED)
  - Location: ParcelAccordion component links to order details

### Epic 3: Returns & Customer Service

#### User Story 3.1: Return Request Process

_As a customer, I want to request returns for items that don't meet my expectations so that I can get a refund or exchange._

**UI/UX Implementation:**

- **Pages**: `/orders/:id/return` (Return request form), `/returns/:id` (Return status page)
- **Components**:
  - ReturnRequestForm component with item selection
  - ReasonSelector component with predefined options
  - PhotoUpload component for condition documentation
  - ReturnPolicyDisplay component per vendor
  - ReturnShippingLabel component
- **Return Request Form**:
  - Item selection checkboxes for multi-item orders
  - Return reason dropdown (Not as described, Damaged, Wrong item, Changed mind)
  - Detailed description textarea for additional context
  - Photo upload section with before/after comparison capability
  - Refund vs. Exchange option selection
- **Vendor Return Policy Display**:
  - Policy summary card for each vendor in the order
  - Return window countdown (e.g., "14 days remaining")
  - Accepted return conditions and exclusions
  - Return shipping responsibility (buyer vs. seller)
  - Processing timeframes for refunds/exchanges
- **Photo Documentation Interface**:
  - Multiple photo upload with drag-and-drop functionality
  - Photo comparison view (listing photos vs. received condition)
  - Image annotation tools for highlighting specific issues
  - Photo requirements guidelines (lighting, angles, clarity)
  - Mobile camera integration for instant photo capture
- **Return Authorization (RMA) Display**:
  - Unique RMA number generation with copy functionality
  - Return shipping label download/print option
  - Return tracking number input field (when shipped)
  - Return package preparation instructions
- **Return Status Tracking**:
  - Status timeline: Requested → Approved → Shipped → Received → Processed
  - Estimated processing time with progress indicators
  - Refund/exchange status with payment method information
  - Communication history with vendor/customer service
- **Mobile Optimization**:
  - Single-column form layout with clear section separation
  - Large photo upload areas with touch-friendly controls
  - Simplified reason selection with icon representations
  - Voice-to-text option for description field

**Acceptance Criteria:**

- ✅ Return request form accessible from order history (IMPLEMENTED)
  - Location: `/user/orders/[id]/return` page exists
- ✅ Return reason selection (not as described, damaged, wrong item, changed mind) (IMPLEMENTED)
  - Location: `OrderReturnSection` component with `ReturnItemsTab`
- 🔄 Photo upload for condition documentation (PARTIAL)
  - Location: Component structure exists but photo upload needs verification
- ❌ Return policy display specific to each vendor (NOT BUILT)
- 🔄 Automatic return authorization (RMA) number generation (PARTIAL)
  - Location: `createReturnRequest` function exists in orders.ts
- 🔄 Return shipping label generation (when vendor covers return shipping) (PARTIAL)
  - Location: `ReturnMethodsTab` and `retriveReturnMethods` function exist
- 🔄 Return tracking and status updates (PARTIAL)
  - Location: Basic return status tracking exists
- ❌ Integration with vendor return preferences and policies (NOT BUILT)
- ✅ Automated partial returns for multi-item orders (IMPLEMENTED)
  - Location: Item selection logic in `handleSelectItem` function

#### User Story 3.2: Dispute Resolution

_As a customer or vendor, I want access to fair dispute resolution so that transaction issues can be resolved equitably._

**UI/UX Implementation:**

- **Pages**: `/disputes/create` (Dispute initiation), `/disputes/:id` (Dispute management)
- **Components**:
  - DisputeCreationForm component with guided flow
  - EvidenceUpload component for documentation
  - DisputeTimeline component showing case progress
  - MediationInterface component for platform intervention
  - AppealProcess component for contested decisions
- **Dispute Initiation Interface**:
  - "Open Dispute" button accessible from order details
  - Dispute type selection (Item not as described, Not received, Quality issues)
  - Order context display with item and transaction details
  - Preliminary resolution attempt requirement ("Have you contacted the seller?")
  - Dispute reason detailed explanation textarea
- **Evidence Submission Portal**:
  - Multi-file upload for photos, receipts, messages
  - Evidence categorization (Photos, Communication, Documentation)
  - Timeline builder for chronological evidence organization
  - File preview and annotation capabilities
  - Evidence summary checklist for completeness
- **Dispute Case Dashboard**:
  - Case number and status badge prominently displayed
  - Dispute timeline with response deadlines clearly marked
  - Response countdown timers for all parties
  - Case manager contact information (when assigned)
  - Settlement offer interface for negotiation
- **Communication Panel**:
  - Secure messaging between customer, vendor, and mediator
  - Message thread organization by participant
  - File sharing within dispute conversation
  - Automated deadline reminders and status updates
  - Translation support for international disputes
- **Resolution Interface**:
  - Final decision display with detailed reasoning
  - Refund/compensation processing status
  - Appeal option with deadline information
  - Case closure confirmation and satisfaction rating
- **Appeal Process**:
  - Appeal request form with additional evidence submission
  - Appeal review timeline and process explanation
  - Final decision display with no further appeal notice
- **Mobile Optimization**:
  - Document upload via mobile camera integration
  - Swipeable evidence gallery with zoom functionality
  - Voice message recording for complex explanations
  - Push notifications for case updates and deadlines

**Acceptance Criteria:**

- ❌ Dispute initiation from order details page (NOT BUILT)
- ❌ Evidence submission (photos, messages, documentation) (NOT BUILT)
- ❌ Platform mediation with neutral case managers (NOT BUILT)
- ❌ Time-limited response windows for all parties (NOT BUILT)
- ❌ Escalation process for unresolved disputes (NOT BUILT)
- ❌ Final decision communication with detailed reasoning (NOT BUILT)
- ❌ Refund/compensation processing based on decisions (NOT BUILT)
- ❌ Dispute history tracking and pattern analysis (NOT BUILT)
- ❌ Appeal process for disputed decisions (NOT BUILT)
- ❌ Integration with payment processor dispute systems (NOT BUILT)

### Epic 4: Reviews & Ratings

#### User Story 4.1: Customer Reviews

_As a customer, I want to leave reviews for purchased items so that I can share my experience with other buyers._

**UI/UX Implementation:**

- **Pages**: `/reviews/create/:orderId` (Review creation), `/reviews/:id` (Review display)
- **Components**:
  - ReviewForm component with multi-criteria rating
  - StarRating component with hover effects
  - PhotoUpload component for received item documentation
  - ReviewModeration component (admin)
  - HelpfulnessVoting component
- **Review Creation Interface**:
  - Order context display showing purchased items and vendor
  - Multi-criteria rating system with individual 5-star ratings:
    - Item Condition (matches description accuracy)
    - Shipping Speed (delivery time satisfaction)
    - Vendor Communication (responsiveness and helpfulness)
    - Overall Experience (combined satisfaction)
  - Written review textarea with character counter (500 max)
  - Photo upload section for received item condition documentation
- **Star Rating Components**:
  - Interactive 5-star rating with hover effects
  - Half-star ratings for precise feedback
  - Visual feedback on hover (star fill animation)
  - Rating labels (Poor, Fair, Good, Very Good, Excellent)
  - Required ratings indication for each criteria
- **Photo Documentation**:
  - Before/after comparison with listing photos
  - Multiple photo upload (up to 10 images)
  - Photo annotation for highlighting specific aspects
  - Mobile camera integration for immediate capture
  - Photo quality guidelines and tips
- **Review Management**:
  - Edit review option (30-day window after submission)
  - Review preview before final submission
  - Moderation status indicator (pending, approved, flagged)
  - Response to vendor replies functionality
  - Review history and reputation impact display
- **Verified Purchase Indicators**:
  - "Verified Purchase" badge prominent display
  - Purchase date and item details confirmation
  - Order number reference for authenticity
  - Protection against fake reviews through purchase verification
- **Community Features**:
  - Helpful/unhelpful voting buttons on reviews
  - Review sorting options (newest, oldest, highest rated, lowest rated)
  - Review filtering by rating, verified purchases, with photos
  - Report inappropriate review option
- **Mobile Optimization**:
  - Simplified rating interface with larger touch targets
  - Voice-to-text option for written reviews
  - Swipeable photo gallery with zoom capabilities
  - One-handed review submission flow

**Acceptance Criteria:**

- ❌ Review invitation email sent after delivery confirmation (7-day delay) (NOT BUILT)
- ✅ Review form with rating (1-5 stars) and written feedback (IMPLEMENTED)
  - Location: `ReviewsToWrite` component and `/user/reviews` page
- 🔄 Separate ratings for item condition, shipping speed, and vendor communication (PARTIAL)
  - Location: Basic rating exists but multi-criteria rating needs verification
- ❌ Photo upload to show received item condition (NOT BUILT)
- ❌ Review moderation system to prevent fake or inappropriate reviews (NOT BUILT)
- ❌ Edit window for reviews (30 days after submission) (NOT BUILT)
- ❌ Helpful/unhelpful voting on reviews by other users (NOT BUILT)
- 🔄 Verified purchase badge on reviews (PARTIAL)
  - Location: Review system tracks order relationship but badge display unclear
- ✅ Review aggregation in vendor profiles and item listings (IMPLEMENTED)
  - Location: Reviews integrated with order/seller system
- ❌ Email notifications to vendors for new reviews (NOT BUILT)

### Epic 5: Consumer/Individual Seller Features

#### User Story 5.1: Discover Individual Selling Opportunities

_As a collector, I want to easily discover selling opportunities so that I can monetize my excess cards and collection._

**UI/UX Implementation:**

- **Components**:
  - SellButton component in main navigation
  - SellThisCardButton component on card pages
  - BecomeSeller component in user dropdown
  - SellingOnboardingPrompt component
- **Main Navigation Integration**:
  - "Sell" link prominently displayed in header navigation
  - Sell icon (dollar sign or shop) with hover effects
  - Mobile: "Sell" tab in bottom navigation bar
  - Clear visual hierarchy with other main navigation items
- **User Dropdown Menu Enhancement**:
  - "Become a Seller" option with seller icon
  - Visual distinction from other menu items (highlighted background)
  - Badge indicator for new users ("Start Selling Today!")
  - Quick stats preview for existing sellers
- **Card Detail Page Integration**:
  - "Sell This Card" button prominently placed near card image
  - Price suggestion tooltip on hover ("Cards like this sell for $X")
  - Authentication check with login/signup prompt for guests
- **Selling Opportunity Discovery**:
  - "Your collection is worth approximately $X" notifications
  - High-value card alerts ("This card is in high demand!")
  - Market trend notifications ("MTG prices are up 15% this month")
- **Social Proof Elements**:
  - Success story snippets ("Sarah sold $500 of cards this month")
  - Active seller counter ("Join 2,547 active sellers")
  - Recent sales feed ("Someone just sold a Black Lotus for $8,000")
  - Trust badges and security indicators
- **Mobile-First Discovery**:
  - Bottom action bar with "Start Selling" on relevant pages
  - Swipe-up selling opportunity cards
  - Camera integration for instant card recognition and valuation
  - Voice search for "How much is my [card name] worth?"

**Acceptance Criteria:**

- ✅ "Sell" link prominently displayed in main navigation header (IMPLEMENTED)
  - Location: `ModernHeader.tsx` line 132 has '/sell' navigation item
- ✅ "Become a Seller" option in authenticated user dropdown menu (IMPLEMENTED)
  - Location: `UserDropdown.tsx` line 57-58 has "Become a Seller" link
- ✅ "Sell This Card" button on individual card detail pages (IMPLEMENTED)
  - Location: `SellThisCardButton.tsx` component exists for card pages
- 🔄 Clear differentiation between individual and business selling options (PARTIAL)
  - Location: Seller upgrade flow exists but distinction unclear
- 🔄 Authentication flow integration for non-logged users (PARTIAL)
  - Location: Basic auth exists but contextual flow unclear

#### User Story 5.2: Consumer Seller Onboarding

_As a collector, I want a simple upgrade process to become an individual seller so that I can start selling my cards quickly._

**UI/UX Implementation:**

- **Pages**: `/sell/upgrade` (Seller onboarding flow)
- **Components**:
  - OnboardingStepper component (3-step progress)
  - SellerTypeSelector component
  - BenefitsComparison component
  - TermsAgreement component
  - WelcomeDashboard component
- **Onboarding Flow Design**:
  - Clean, minimal 3-step process with progress indicator
  - Step titles: "Choose Seller Type", "Accept Terms", "Complete Setup"
  - Mobile-optimized single-page application flow
  - Auto-save progress with ability to complete later
- **Step 1 - Seller Type Selection**:
  - Two prominent cards: "Individual Seller" vs "Business Seller"
  - Individual seller card highlighted as recommended for collectors
  - Clear benefit comparison table:
    - Individual: No monthly fees, simple tax reporting, personal verification
    - Business: Advanced analytics, bulk tools, business verification required
  - Visual icons distinguishing seller types (person vs. building)
- **Step 2 - Terms Acceptance**:
  - Simplified terms specific to individual sellers
  - Key points highlighted in bullet format:
    - Seller responsibilities and item condition standards
    - Fee structure (platform percentage clearly stated)
    - Payment processing and payout schedule
  - "I understand and agree" checkbox with terms link
- **Step 3 - Completion**:
  - Email verification confirmation integrated
  - Initial trust score display (60 points for new sellers)
  - Next steps checklist (complete profile, list first item)
  - Welcome message with seller resources links
- **Mobile Optimization**:
  - Full-screen onboarding experience
  - Large, touch-friendly selection cards
  - Simplified terms with expandable sections
  - One-handed completion flow
- **Success State**:
  - Celebration animation and "Welcome, Seller!" message
  - Automatic redirect to individual seller dashboard
  - Initial setup checklist with progress tracking
  - "List Your First Item" prominent call-to-action

**Acceptance Criteria:**

- Simplified 3-step upgrade flow (seller type → terms → completion)
- Clear selection between "Individual Seller" vs "Business Seller" paths
- Individual seller benefits clearly communicated (no fees, simple setup)
- Terms and conditions specific to individual selling responsibilities
- Email verification confirmation integrated into flow
- Initial trust score assignment (60 points for new individual sellers)
- Welcome message with immediate next steps after completion
- Automatic redirect to consumer seller dashboard upon success
- Mobile-optimized upgrade experience for phone users
- Skip complex business verification requirements for individuals
- Integration with existing customer account (no separate registration)
- Progress indicator showing current step and completion status

#### User Story 5.3: Consumer Seller Dashboard

_As an individual seller, I want a simple dashboard to manage my selling activities so that I can track my progress and manage listings easily._

**UI/UX Implementation:**

- **Page**: `/sell/dashboard` (Individual seller dashboard)
- **Components**:
  - SellerOverview component with key metrics
  - QuickStatsCards component
  - RecentActivityFeed component
  - ListingsGrid component
  - TrustLevelBadge component
- **Dashboard Layout**:
  - Clean, mobile-first design with card-based sections
  - Header with seller greeting and trust level badge
  - Quick stats row with 4 key metric cards
  - Recent activity feed with chronological updates
  - Tabbed interface: Overview, Listings, Sales, Profile
- **Quick Stats Cards**:
  - Active Listings: Count with trending indicator (up/down arrows)
  - Revenue This Month: Dollar amount with percentage change
  - Trust Score: Current score with progress bar to next level
  - Seller Tier: Badge display (Bronze, Silver, Gold, Platinum, Diamond)
- **Recent Activity Feed**:
  - Latest sales with item images and buyer info
  - New messages with unread indicators
  - Recent reviews with star ratings
  - Price changes and listing updates
  - Trust score changes and milestone achievements
- **Listings Management Section**:
  - Grid view of active listings with thumbnail images
  - Quick actions: Edit price/quantity, pause/unpause, delete
  - Status indicators (active, paused, sold, pending)
  - Bulk selection for multiple listing management
  - "+ List New Card" prominent button
- **Trust Level Display**:
  - Progress bar showing advancement to next tier
  - Trust score breakdown with improvement tips
  - Verification checklist (email ✓, phone ?, ID verification ?)
  - Performance metrics affecting trust score
- **Quick Action Buttons**:
  - "List New Card" primary call-to-action button
  - "Check Messages" with unread count badge
  - "View Analytics" for performance insights
  - "Seller Resources" for help and tips
- **Mobile Optimization**:
  - Single-column layout with collapsible sections
  - Swipeable quick stats cards
  - Touch-friendly grid controls for listings
  - Bottom navigation for main dashboard sections

**Acceptance Criteria:**

- Clean, mobile-first dashboard design appropriate for casual sellers
- Overview tab showing key metrics: active listings, total sales, current rating
- Quick stats cards: listings count, revenue this month, trust score, seller tier
- Recent activity feed showing latest sales, messages, and reviews
- Listings tab with grid view of active/inactive items
- Simple listing management: edit price/quantity, pause/unpause, delete
- Sales tab showing order history and payout status
- Profile tab for managing seller settings and verification status
- Trust level badge display (Bronze, Silver, Gold, Platinum, Diamond)
- Individual verification checklist (email, phone, optional ID verification)
- Quick action buttons for common tasks (list new card, check messages)
- Mobile-responsive design with touch-friendly controls
- Integration with notification system for important updates
- Basic analytics appropriate for individual sellers (no complex business metrics)
- Easy access to customer support and seller resources

#### User Story 5.4: Quick Card Listing from Collection

_As an individual seller, I want to quickly list specific cards I own so that I can sell them with minimal effort._

**UI/UX Implementation:**

- **Pages**: `/sell/list-card` (Quick listing creation), Card detail pages with "Sell This Card" button
- **Components**:
  - QuickListingForm component
  - CardSearchSelector component
  - ConditionGuide component
  - PhotoUpload component with mobile camera
  - PriceSuggestion component
- **Card Selection Interface**:
  - Universal search bar with TCG game filters (MTG, Pokemon, Yu-Gi-Oh!, One Piece)
  - Auto-populated card information from catalog (name, set, rarity, game)
  - Selected card preview with official catalog image
  - "Manual Entry" option for unlisted cards
  - Recent cards and collection integration shortcuts
- **Listing Creation Form**:
  - Auto-populated card details (read-only name, set, rarity with badges)
  - Condition dropdown with visual condition guide modal
  - Market price suggestions with recent sales data
  - Custom description textarea (optional, 200 character limit)
  - Quantity input with reasonable limits for individual sellers
  - Shipping preferences pre-filled from seller profile
- **Condition Selection Guide**:
  - Visual condition guide with card examples
  - Dropdown options: Near Mint, Lightly Played, Moderately Played, Heavily Played, Damaged
  - Condition impact on price suggestion display
  - Photo upload encouragement for accurate condition representation
- **Photo Upload Interface**:
  - Primary image upload (required) with drag-and-drop
  - Mobile camera integration for instant photo capture
  - Image preview with crop and rotate functionality
  - Additional images option (up to 4 more)
  - Photo quality tips and lighting guidelines
- **Price Suggestion Engine**:
  - Real-time market price suggestions based on condition and recent sales
  - Price range display ("Similar cards sell for $X - $Y")
  - Competitive pricing alerts ("Price $2 lower to match top listings")
  - Manual price override with market comparison warning
- **Mobile-First Design**:
  - One-handed form completion flow
  - Large photo upload area with camera button
  - Voice-to-text for custom descriptions
  - Simplified condition selection with icons
- **Listing Preview & Publish**:
  - Preview mode showing buyer view of listing
  - Save as draft for incomplete listings
  - "Publish Listing" primary action button
  - Success confirmation with listing management links

**Acceptance Criteria:**

- "Sell This Card" button on every card detail page
- One-click access to listing creation from card context
- Auto-populated card information (name, set, game, rarity)
- Condition selection with visual guide for accurate grading
- Market price suggestions based on recent sales data
- Simple photo upload with preview functionality
- Quantity selector (limited to reasonable amounts for individuals)
- Custom description field for additional details
- Shipping preferences selection from seller profile defaults
- Preview functionality showing how listing will appear to buyers
- Save as draft option for incomplete listings
- Immediate publication to marketplace upon completion
- Mobile camera integration for condition photos
- Authentication check with redirect to upgrade flow if needed
- Integration with inventory system for immediate availability
- Success confirmation with link to manage listing

#### User Story 5.5: Individual Seller Reputation Management

_As an individual seller, I want to build and maintain my reputation so that buyers trust my listings and I can achieve better sales._

**UI/UX Implementation:**

- **Pages**: `/sell/reputation` (Reputation management), Profile pages showing public reputation
- **Components**:
  - TrustScoreDisplay component with progress visualization
  - SellerTierBadge component
  - VerificationChecklist component
  - PerformanceMetrics component
  - ReputationTips component
- **Trust Score Visualization**:
  - Large circular progress indicator showing current score (out of 100)
  - Color-coded score ranges (Red: 0-39, Yellow: 40-69, Green: 70-100)
  - Progress bar to next seller tier with points needed
  - Historical score tracking with line chart showing progress over time
- **Seller Tier Progression**:
  - Tier badge display: Bronze (0-199), Silver (200-499), Gold (500-999), Platinum (1000-1999), Diamond (2000+)
  - Tier benefits clearly explained with icons
  - Next tier requirements with progress indicators
  - Tier achievement celebrations and notifications
- **Verification Status Dashboard**:
  - Email verification (required) with green checkmark or red X
  - Phone verification (optional) with completion incentive
  - ID verification (optional) with trust boost indicator
  - Social media linking options for additional credibility
- **Performance Metrics Display**:
  - Response rate to buyer inquiries with improvement tips
  - Average shipping time with benchmark comparison
  - Customer satisfaction rating (5-star average) with recent reviews
  - Order completion rate with perfect score achievement badge
- **Trust Score Factor Breakdown**:
  - Verification status contribution (up to 30 points)
  - Performance metrics impact (up to 40 points)
  - Customer reviews influence (up to 30 points)
  - Account age and history bonus (up to 10 points)
- **Reputation Improvement Tools**:
  - Actionable improvement tips based on current performance
  - "Quick Wins" suggestions for immediate score boosts
  - Goal setting with milestone tracking
  - Best practices guide for individual sellers
- **Customer Review Management**:
  - Recent reviews display with response capability
  - Review aggregation and sentiment analysis
  - Dispute option for unfair negative reviews
  - Thank you message templates for positive reviews
- **Mobile Reputation Interface**:
  - Swipeable metric cards with detailed views
  - Progress ring animations for visual engagement
  - One-tap verification initiation
  - Push notifications for reputation milestones

**Acceptance Criteria:**

- Personal trust score display with explanation of calculation
- Seller tier progression system (Bronze → Silver → Gold → Platinum → Diamond)
- Individual verification badges (email verified, phone verified, ID verified)
- Performance metrics relevant to individual sellers:
  - Response rate to buyer inquiries
  - Average shipping time
  - Customer satisfaction rating
  - Order completion rate
- Trust score factors clearly explained to sellers
- Verification process streamlined for individuals (no business docs)
- Reputation improvement suggestions and tips
- Historical trust score tracking with progress visualization
- Customer review aggregation and response capabilities
- Dispute resolution support maintaining fairness for individuals
- Protection against unfair negative reviews
- Trust score recovery process for resolved issues
- Integration with listing prominence (higher trust = better visibility)
- Mobile-friendly reputation management interface
- Notification system for reputation changes and milestone achievements

#### User Story 5.6: Individual Seller Payment & Payout

_As an individual seller, I want simple payment processing and payouts so that I can receive money from sales without complexity._

**UI/UX Implementation:**

- **Pages**: `/sell/payouts` (Payout management), `/sell/financial` (Financial dashboard)
- **Components**:
  - PayoutDashboard component with earnings summary
  - BankAccountSetup component for Stripe Connect
  - PayoutHistory component with transaction details
  - TaxDocuments component for 1099-K access
  - FeeCalculator component for transparency
- **Financial Dashboard Overview**:
  - Earnings summary card showing available balance, pending, and total lifetime
  - Next payout date and amount prominently displayed
  - Monthly revenue chart with simple bar graph visualization
  - Quick stats: This month's sales, average sale price, total transactions
- **Bank Account Setup Interface**:
  - Stripe Connect Standard onboarding integration
  - Simple bank account linking with routing/account number fields
  - Verification status indicator with micro-deposit confirmation
  - Alternative payout methods (PayPal backup option)
  - Security badges and SSL indicators for trust
- **Payout Schedule Management**:
  - Weekly payout default with option to change to daily (for qualified sellers)
  - Payout calendar showing upcoming payment dates
  - Instant payout option with fee display (for qualified sellers)
  - Holiday and weekend payout delay notifications
- **Fee Structure Display**:
  - Clear breakdown: Platform fee (%), Payment processing fee (fixed + %)
  - Interactive fee calculator ("If you sell for $X, you receive $Y")
  - Comparison with competitor platforms for transparency
  - Fee reduction incentives for higher-tier sellers
- **Transaction History Interface**:
  - Detailed payout history with filterable date ranges
  - Individual sale breakdown with buyer info and item details
  - Hold explanations for new sellers with release dates
  - Reserve policy display with current reserve amount
- **Tax Documentation**:
  - 1099-K document download when applicable ($600+ threshold)
  - Tax year summary with total earnings breakdown
  - State tax information and nexus explanations
  - Integration with popular tax software (TurboTax, etc.)
- **Mobile Financial Management**:
  - Simplified earnings widget with key metrics
  - Quick payout status check with notifications
  - Mobile bank account management with security features
  - Transaction search and filtering optimized for mobile

**Acceptance Criteria:**

- Stripe Connect Standard account setup for individuals
- Personal bank account linking with verification
- Weekly payout schedule (configurable to daily for qualified sellers)
- Clear fee structure display: platform percentage, payment processing fees
- Automatic tax document generation (1099-K when applicable)
- Payout history with detailed transaction breakdown
- Reserve policy explanation for new individual sellers
- Instant payout option for qualified sellers (small fee)
- Currency support for international individual sellers
- Mobile-friendly financial dashboard
- Integration with order fulfillment (payout on delivery confirmation)
- Clear communication of hold periods for new sellers
- Support for personal PayPal accounts as backup payout method
- Financial performance tracking suitable for individuals
- Simple dispute resolution affecting payouts

#### User Story 5.7: Individual Seller Communication

_As an individual seller, I want to communicate effectively with buyers so that I can provide good customer service and resolve issues._

**UI/UX Implementation:**

- **Pages**: `/sell/messages` (Message center), Individual message threads
- **Components**:
  - MessageCenter component with conversation list
  - ChatInterface component for individual conversations
  - MessageTemplates component for quick responses
  - PhotoSharing component for condition clarification
  - NotificationSettings component
- **Message Center Layout**:
  - Inbox-style conversation list with buyer names and order context
  - Unread message indicators with count badges
  - Message preview with last message and timestamp
  - Search and filter options (by buyer, order, date range)
  - Quick actions: Mark as read, archive, priority flag
- **Chat Interface Design**:
  - WhatsApp/iMessage style conversation bubbles
  - Order context header showing item details and order number
  - Message timestamp display with read receipt indicators
  - Photo sharing capability with drag-and-drop
  - Voice message recording for mobile (optional premium feature)
- **Quick Response Templates**:
  - Pre-written message templates for common scenarios:
    - Shipping confirmation ("Your item has been shipped...")
    - Thank you note ("Thank you for your purchase...")
    - Condition clarification ("Here are additional photos...")
    - Delay notification ("There will be a slight delay...")
  - Customizable templates with seller personalization
- **Order Context Integration**:
  - Direct link from order details to message thread
  - Item information displayed in chat header
  - Order status updates automatically shared in chat
  - Quick actions: Mark as shipped, request feedback, process return
- **Photo Sharing Interface**:
  - In-chat photo upload with preview thumbnails
  - Mobile camera integration for instant photo capture
  - Photo annotation tools for highlighting card details
  - Image compression for fast sending
- **Response Time Tracking**:
  - Response time badge display in seller profile
  - Visual indicator for quick responders ("Usually replies within 1 hour")
  - Performance impact explanation and improvement tips
  - Goal setting for response time improvement
- **Notification Management**:
  - Push notification settings for new messages
  - Email notification options with digest preferences
  - In-app notification center with message priorities
  - Do not disturb settings for off-hours
- **Mobile Communication Optimization**:
  - Native mobile chat experience with swipe gestures
  - Voice-to-text integration for quick responses
  - Offline message drafting with auto-send when online
  - Background app refresh for real-time message delivery

**Acceptance Criteria:**

- Built-in messaging system for buyer-seller communication
- Mobile-optimized messaging interface for on-the-go responses
- Notification system for new messages (email, push, in-app)
- Message templates for common responses (shipping updates, thank you notes)
- Photo sharing capability within messages for condition clarification
- Order context integration (messages linked to specific purchases)
- Response time tracking with performance implications
- Professional communication guidelines and tips for individuals
- Escalation path to platform customer support for complex issues
- Message history preservation for reference and dispute resolution
- Bulk messaging for shipping updates to multiple buyers
- Integration with order management (messages from order details)
- Translation support for international buyer communication
- Spam and harassment protection for seller safety
- Quick responses for common questions (shipping time, return policy)

#### User Story 5.8: Individual Seller Growth & Success

_As an individual seller, I want resources and tools to improve my selling success so that I can maximize my revenue and customer satisfaction._

**UI/UX Implementation:**

- **Pages**: `/sell/resources` (Seller education hub), `/sell/analytics` (Performance insights)
- **Components**:
  - EducationHub component with categorized resources
  - PerformanceAnalytics component with visual insights
  - GoalSetting component with progress tracking
  - CommunityForum component for seller networking
  - SuccessStories component for motivation
- **Seller Education Hub**:
  - Resource categories with icon-based navigation:
    - Photography Tips (camera icon) - Card photography best practices
    - Pricing Strategies (dollar icon) - Market analysis and competitive pricing
    - Customer Service (chat icon) - Communication and problem resolution
    - Shipping & Handling (package icon) - Safe packaging and shipping methods
  - Interactive tutorials with step-by-step guidance
  - Video content library with expert seller interviews
- **Performance Analytics Dashboard**:
  - Key metric visualization appropriate for individual sellers:
    - Listing views and conversion rates with simple bar charts
    - Average sale price trends over time with line graphs
    - Buyer satisfaction scores with progress indicators
    - Seasonal performance patterns with seasonal tips
  - Actionable insights: "Your items with photos sell 40% faster"
  - Benchmarking against similar sellers (anonymized)
- **Goal Setting & Progress Tracking**:
  - Goal templates for individual sellers:
    - Monthly sales targets with progress bars
    - Customer satisfaction improvement goals
    - Inventory turnover rate optimization
    - Trust score advancement milestones
  - Visual progress tracking with celebration animations
  - Achievement badges for goal completion
- **Market Intelligence Integration**:
  - Pricing trend notifications for seller's card categories
  - Seasonal selling advice ("List holiday gifts in November")
  - Market opportunity alerts ("MTG prices trending up 15%")
  - Competitive analysis tools for price optimization
- **Community Features**:
  - Seller forum access with Q&A sections
  - Success story sharing platform with seller spotlights
  - Peer mentorship matching for new sellers
  - Local seller meetup organization tools
- **Success Stories & Inspiration**:
  - Featured seller stories with earnings and tips
  - Before/after case studies with specific improvements
  - Video testimonials from successful individual sellers
  - Monthly seller spotlight with interview features
- **Learning Path Progression**:
  - Beginner to advanced seller curriculum
  - Completion certificates for training modules
  - Skill badges for mastering different aspects
  - Continuing education credits for tier advancement
- **Mobile Learning Platform**:
  - Bite-sized learning modules for mobile consumption
  - Offline content download for learning on-the-go
  - Push notifications for new tips and market insights
  - Voice-guided tutorials for hands-free learning

**Acceptance Criteria:**

- Seller education resources tailored to individual collectors
- Best practices guide for photographing cards and writing descriptions
- Pricing strategy advice based on market data and competition
- Performance analytics dashboard with actionable insights
- Seasonal selling tips and market trend information
- Success stories and case studies from other individual sellers
- Community forum access for seller peer support and advice
- Optional seller training modules with completion certificates
- Performance benchmarking against similar individual sellers
- Goal setting and progress tracking tools
- Integration with pricing intelligence for competitive insights
- Mobile-accessible learning resources and tips
- Notification system for new educational content and opportunities
- Seller level progression rewards and recognition system
- Access to seller-only features and community events

## Step 8: Delivery and QA Plan (@dev + @qa)

- Required validation entrypoints:
  - node scripts/check-acceptance-criteria.js --id 02-commerce-marketplace-system
  - node scripts/check-acceptance-criteria.js --id 02-commerce-marketplace-system --next-story
  - node scripts/next-spec.js
- Repo-level checks must include lint/typecheck/build/tests where applicable before marking the spec complete.
- Story/spec status transitions are controlled through scripts/mark-spec.js after criteria pass.

### Testing Requirements

### E-commerce Testing

- Complete checkout flow testing across payment methods
- Multi-vendor order processing verification
- Return and refund workflow testing
- Review and rating system functionality
- Mobile commerce experience testing

### Performance Testing

- Load testing for peak shopping periods
- Database performance optimization
- CDN effectiveness for product images
- Search query performance optimization
- Payment processing speed verification

### Integration Testing

- Stripe Connect payment flow testing
- Shipping carrier API integration verification
- Email notification delivery testing
- Inventory synchronization accuracy
- Order status update propagation

### Consumer Seller Testing Requirements

#### Individual Seller Onboarding Testing

- **Upgrade Flow Testing**: Complete consumer seller upgrade process across all devices
- **Authentication Testing**: Seller upgrade with and without existing customer accounts
- **Validation Testing**: Form validation and error handling for upgrade process
- **Terms Acceptance**: Legal agreement acceptance and version tracking
- **Mobile Onboarding**: Complete upgrade flow testing on mobile devices
- **Cross-Browser Testing**: Seller upgrade compatibility across major browsers
- **Error Recovery**: Incomplete upgrade process recovery and completion

#### Consumer Seller Dashboard Testing

- **Dashboard Functionality**: All dashboard tabs and features across user types
- **Real-time Updates**: Live data updates and synchronization testing
- **Performance Testing**: Dashboard loading times under various data volumes
- **Mobile Dashboard**: Complete mobile dashboard functionality and usability
- **Notification Testing**: In-app notification delivery and interaction
- **Analytics Display**: Seller performance metrics accuracy and visualization
- **Settings Management**: Seller profile and preference updates

#### Individual Seller Listing Testing

- **Listing Creation**: Complete listing creation flow with all required fields
- **Quick Listing**: "Sell This Card" button functionality from card detail pages
- **Image Upload**: Photo upload, processing, and display testing
- **Mobile Listing**: Listing creation on mobile with camera integration
- **Validation Testing**: Listing form validation and error handling
- **Market Price Integration**: Price suggestion accuracy and competitive analysis
- **Draft Functionality**: Save, edit, and publish draft listings
- **Listing Management**: Edit, pause, delete, and bulk operations on listings

#### Consumer Seller Trust & Verification Testing

- **Trust Score Calculation**: Accurate trust score calculation and real-time updates
- **Tier Progression**: Seller tier advancement and demotion testing
- **Verification Process**: Email, phone, and identity verification workflows
- **Performance Metrics**: Accurate tracking of seller performance indicators
- **Review Integration**: Customer review impact on seller trust scores
- **Dispute Handling**: Dispute resolution and trust score adjustment testing
- **Mobile Verification**: Mobile-optimized verification processes

#### Individual Seller Communication Testing

- **Message System**: Buyer-seller messaging functionality and notifications
- **Order Integration**: Message context linking to specific orders and listings
- **Mobile Messaging**: Mobile messaging interface and push notifications
- **Response Templates**: Pre-written response template functionality
- **Photo Sharing**: Image sharing within message conversations
- **Translation Testing**: Automatic translation for international communications
- **Notification Delivery**: Email, SMS, and push notification testing

#### Consumer Seller Financial Testing

- **Stripe Connect**: Individual seller payout setup and processing
- **Payout Scheduling**: Weekly and instant payout functionality testing
- **Fee Calculation**: Accurate platform fee calculation and deduction
- **Tax Document**: 1099-K generation and delivery testing
- **Revenue Tracking**: Accurate revenue and earnings tracking
- **International Payments**: Multi-currency and international seller support
- **Bank Account Verification**: Personal bank account linking and verification

#### Individual Seller Security Testing

- **Authentication Security**: Secure login and session management for sellers
- **Data Protection**: Personal seller information encryption and access control
- **Financial Security**: Secure handling of banking and payout information
- **Privacy Controls**: Seller profile visibility and privacy settings
- **Mobile Security**: Biometric authentication and secure data storage
- **API Security**: Seller API endpoint security and rate limiting
- **Fraud Prevention**: Seller fraud detection and prevention testing

#### Consumer Seller Performance Testing

- **Load Testing**: Individual seller dashboard and listing performance under load
- **Mobile Performance**: Mobile app performance for seller functions
- **Database Performance**: Trust score calculation and seller data query performance
- **Real-time Updates**: Performance of live seller notifications and updates
- **Image Processing**: Photo upload and processing performance testing
- **API Response Times**: Seller API endpoint performance testing
- **Concurrent Users**: Multiple individual sellers using system simultaneously

#### Consumer Seller Integration Testing

- **Cross-System Integration**: Customer-backend and storefront seller data sync
- **Commerce Integration**: MedusaJS integration for seller listings and orders
- **Trust Score Integration**: Trust score calculation across all seller activities
- **Notification Integration**: Email, SMS, and push notification delivery
- **Mobile Integration**: Native mobile features and seller functionality
- **Third-Party Integration**: Stripe Connect, verification services, and shipping APIs

#### Consumer Seller Accessibility Testing

- **Screen Reader Testing**: Complete seller interface accessibility with screen readers
- **Keyboard Navigation**: Full keyboard accessibility for all seller functions
- **Mobile Accessibility**: Seller mobile app accessibility compliance
- **Visual Accessibility**: High contrast and color-blind friendly seller interfaces
- **Cognitive Accessibility**: Clear and simple seller interface design
- **WCAG Compliance**: Full WCAG 2.1 AA compliance for all seller interfaces

#### Consumer Seller User Acceptance Testing

- **End-to-End Scenarios**: Complete individual seller journey testing
- **Usability Testing**: Task completion rates for typical seller activities
- **Mobile Usability**: Touch-friendly interface validation for sellers
- **Conversion Testing**: A/B testing for seller onboarding and engagement
- **Performance Benchmarking**: Seller satisfaction and success metrics
- **Error Handling**: User-friendly error messages and recovery processes
- **Cross-Browser Compatibility**: Seller functionality across all major browsers

## Supporting Requirements

### Technical Requirements

### Technology Stack

- **Commerce Framework**: MercurJS (Medusa v2) with PostgreSQL
- **Payment Processing**: Stripe Connect for multi-vendor payments
- **File Storage**: MinIO/S3 for product images and documentation
- **Search Engine**: Elasticsearch for product discovery
- **Cache Layer**: Redis for session data and frequent queries
- **Email Service**: Resend for transactional emails
- **Shipping APIs**: EasyPost for carrier rate integration

### Database Schema Requirements

#### Products Table (MercurJS Extension)

```sql
CREATE TABLE products (
    id VARCHAR PRIMARY KEY,
    catalog_card_id UUID REFERENCES catalog_cards(id),
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id),
    condition_grade product_condition NOT NULL,
    custom_description TEXT,
    images JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE product_condition AS ENUM ('near_mint', 'lightly_played', 'moderately_played', 'heavily_played', 'damaged');
```

#### Orders Table (MercurJS Extension)

```sql
CREATE TABLE orders (
    id VARCHAR PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES users(id),
    status order_status DEFAULT 'pending',
    subtotal_amount INTEGER NOT NULL,
    shipping_amount INTEGER NOT NULL,
    tax_amount INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'USD',
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
```

#### Order Items Table

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR NOT NULL REFERENCES products(id),
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    shipping_cost INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Reviews Table

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES order_items(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),
    shipping_rating INTEGER CHECK (shipping_rating >= 1 AND shipping_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    review_text TEXT,
    images JSONB,
    is_verified BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    vendor_response TEXT,
    vendor_response_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Consumer Seller Tables

#### SellerRating Table (Individual Seller Support)

```sql
CREATE TABLE seller_rating (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id VARCHAR NOT NULL UNIQUE REFERENCES customers(id),
    seller_type seller_type_enum DEFAULT 'consumer',
    seller_tier seller_tier_enum DEFAULT 'bronze',
    verification_status verification_status_enum DEFAULT 'unverified',
    trust_score INTEGER DEFAULT 60 CHECK (trust_score >= 0 AND trust_score <= 1000),
    overall_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (overall_rating >= 0.00 AND overall_rating <= 5.00),

    -- Performance Metrics
    total_reviews INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_sales_volume DECIMAL(12,2) DEFAULT 0.00,
    response_rate_percentage DECIMAL(5,2) DEFAULT 0.00,
    on_time_shipping_percentage DECIMAL(5,2) DEFAULT 0.00,
    dispute_rate_percentage DECIMAL(5,2) DEFAULT 0.00,
    cancellation_rate_percentage DECIMAL(5,2) DEFAULT 0.00,

    -- Individual Seller Verification
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_identity_verified BOOLEAN DEFAULT FALSE,
    is_address_verified BOOLEAN DEFAULT FALSE,
    is_payment_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),

    -- Individual Seller Limits and Status
    max_active_listings INTEGER DEFAULT 50,
    current_active_listings INTEGER DEFAULT 0,
    is_active_seller BOOLEAN DEFAULT TRUE,
    is_featured_seller BOOLEAN DEFAULT FALSE,
    is_preferred_seller BOOLEAN DEFAULT FALSE,

    -- Risk Assessment (Individual Seller Focused)
    risk_level risk_level_enum DEFAULT 'low',
    risk_notes TEXT,
    last_risk_assessment TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_trust_score CHECK (trust_score >= 0 AND trust_score <= 1000),
    CONSTRAINT valid_rating CHECK (overall_rating >= 0.00 AND overall_rating <= 5.00)
);

-- Enum Types for Consumer Sellers
CREATE TYPE seller_type_enum AS ENUM ('consumer', 'business');
CREATE TYPE seller_tier_enum AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond');
CREATE TYPE verification_status_enum AS ENUM ('unverified', 'pending', 'verified', 'suspended');
CREATE TYPE risk_level_enum AS ENUM ('low', 'medium', 'high', 'critical');
```

#### Consumer Seller Profiles Table

```sql
CREATE TABLE consumer_seller_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR NOT NULL UNIQUE REFERENCES customers(id),
    seller_rating_id UUID NOT NULL REFERENCES seller_rating(id),

    -- Individual Seller Profile Information
    display_name VARCHAR(255),
    bio TEXT,
    location VARCHAR(255),
    specialties JSONB, -- ["MTG", "Pokemon", "Vintage"] etc.

    -- Selling Preferences
    default_shipping_method VARCHAR(100),
    shipping_from_location VARCHAR(255),
    ships_internationally BOOLEAN DEFAULT FALSE,
    accepted_payment_methods JSONB,
    return_policy_days INTEGER DEFAULT 14,

    -- Communication Preferences
    auto_respond_enabled BOOLEAN DEFAULT FALSE,
    auto_response_template TEXT,
    notification_preferences JSONB,

    -- Individual Seller Settings
    listing_template JSONB, -- Default values for new listings
    pricing_strategy VARCHAR(50) DEFAULT 'market', -- 'market', 'competitive', 'premium'
    bulk_discount_enabled BOOLEAN DEFAULT FALSE,
    bulk_discount_threshold INTEGER DEFAULT 10,
    bulk_discount_percentage DECIMAL(5,2) DEFAULT 5.00,

    -- Performance Tracking
    average_response_time_hours DECIMAL(4,1) DEFAULT 24.0,
    average_shipping_days INTEGER DEFAULT 3,
    preferred_shipping_carriers JSONB,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Consumer Seller Metrics Table

```sql
CREATE TABLE consumer_seller_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id VARCHAR NOT NULL REFERENCES customers(id),
    metric_date DATE NOT NULL,

    -- Daily Performance Metrics for Individual Sellers
    listings_created INTEGER DEFAULT 0,
    listings_sold INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,
    messages_responded INTEGER DEFAULT 0,
    average_response_time_minutes INTEGER DEFAULT 0,

    -- Individual Seller Specific Metrics
    new_reviews_received INTEGER DEFAULT 0,
    average_daily_rating DECIMAL(3,2),
    trust_score_change INTEGER DEFAULT 0,
    verification_progress_updates INTEGER DEFAULT 0,

    -- Engagement Metrics
    profile_views INTEGER DEFAULT 0,
    listing_views INTEGER DEFAULT 0,
    inquiries_received INTEGER DEFAULT 0,
    repeat_customers INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(seller_id, metric_date)
);
```

#### Consumer Seller Listings Table (Extension)

```sql
-- Extension to products table for consumer seller specific fields
CREATE TABLE consumer_seller_listing_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id VARCHAR NOT NULL REFERENCES customers(id),

    -- Individual Seller Listing Attributes
    is_quick_listed BOOLEAN DEFAULT FALSE, -- Listed via "Sell This Card" button
    source_page VARCHAR(255), -- URL where listing was created from
    market_price_at_creation DECIMAL(10,2),
    pricing_strategy VARCHAR(50) DEFAULT 'market',
    auto_pricing_enabled BOOLEAN DEFAULT FALSE,

    -- Individual Seller Management
    listing_template_used UUID REFERENCES listing_templates(id),
    photo_count INTEGER DEFAULT 0,
    custom_tags JSONB,
    personal_notes TEXT, -- Private notes for seller only

    -- Performance Tracking
    view_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0, -- Added to wishlists
    days_active INTEGER DEFAULT 0,

    -- Mobile Creation Support
    created_via_mobile BOOLEAN DEFAULT FALSE,
    device_type VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Consumer Seller Notifications Table

```sql
CREATE TABLE consumer_seller_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id VARCHAR NOT NULL REFERENCES customers(id),
    notification_type notification_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Notification Context
    related_order_id VARCHAR REFERENCES orders(id),
    related_product_id VARCHAR REFERENCES products(id),
    related_customer_id VARCHAR REFERENCES customers(id),

    -- Notification Status
    is_read BOOLEAN DEFAULT FALSE,
    is_actionable BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(512),
    priority priority_enum DEFAULT 'normal',

    -- Delivery Status
    sent_via_email BOOLEAN DEFAULT FALSE,
    sent_via_push BOOLEAN DEFAULT FALSE,
    sent_via_sms BOOLEAN DEFAULT FALSE,
    email_opened BOOLEAN DEFAULT FALSE,
    push_clicked BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- Enum Types for Notifications
CREATE TYPE notification_type_enum AS ENUM (
    'new_order', 'payment_received', 'review_received', 'message_received',
    'listing_sold', 'listing_expired', 'trust_score_change', 'tier_upgrade',
    'verification_update', 'payout_processed', 'dispute_opened', 'policy_update'
);

CREATE TYPE priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');
```

### API Endpoints

#### Product Management Endpoints

```typescript
GET /products - List products with filtering and pagination
GET /products/:id - Get product details
POST /products - Create new product listing (vendor only)
PUT /products/:id - Update product listing (vendor only)
DELETE /products/:id - Delete product listing (vendor only)
POST /products/:id/images - Upload product images
GET /vendors/:id/products - Get vendor's product listings
```

#### Shopping Cart Endpoints

```typescript
GET /cart - Get current user's cart
POST /cart/items - Add item to cart
PUT /cart/items/:id - Update cart item quantity
DELETE /cart/items/:id - Remove item from cart
DELETE /cart - Clear entire cart
POST /cart/save-for-later/:id - Move item to saved list
```

#### Checkout & Order Endpoints

```typescript
POST /checkout/calculate - Calculate totals, shipping, and taxes
POST /checkout/payment-methods - Get available payment methods
POST /checkout/place-order - Create order and process payment
GET /orders - Get user's order history
GET /orders/:id - Get specific order details
POST /orders/:id/cancel - Cancel order (if cancellable)
```

#### Returns & Reviews Endpoints

```typescript
POST /orders/:id/return - Request order return
GET /returns - Get return requests (customer/vendor)
PUT /returns/:id - Update return status (vendor)
POST /orders/:id/review - Submit order review
GET /reviews - Get reviews with filtering
POST /reviews/:id/helpful - Mark review as helpful
POST /reviews/:id/response - Vendor response to review
```

#### Consumer Seller Management Endpoints

```typescript
// Seller Status and Profile Management
GET /api/customers/:customer_id/seller-status - Check if customer is individual seller
POST /api/customers/:customer_id/upgrade-to-consumer-seller - Upgrade customer to individual seller
GET /api/customers/:customer_id/seller-profile - Get individual seller profile data
PUT /api/customers/:customer_id/seller-profile - Update individual seller profile
GET /api/customers/:customer_id/seller-settings - Get seller preferences and settings
PUT /api/customers/:customer_id/seller-settings - Update seller preferences

// Trust and Verification Endpoints
GET /api/customers/:customer_id/trust-score - Get current trust score and breakdown
GET /api/customers/:customer_id/verification-status - Get verification progress
POST /api/customers/:customer_id/verify-phone - Initiate phone verification
POST /api/customers/:customer_id/verify-identity - Submit identity documents
PUT /api/customers/:customer_id/verification/:type - Update verification status

// Individual Seller Dashboard Endpoints
GET /api/sellers/:seller_id/dashboard - Get dashboard overview data
GET /api/sellers/:seller_id/metrics - Get performance metrics and analytics
GET /api/sellers/:seller_id/activities - Get recent seller activities feed
GET /api/sellers/:seller_id/notifications - Get seller notifications
PUT /api/sellers/:seller_id/notifications/:id/read - Mark notification as read

// Consumer Seller Listings Management
GET /api/sellers/:seller_id/listings - Get seller's listings with filtering
POST /api/sellers/:seller_id/listings - Create new listing (individual seller)
PUT /api/listings/:listing_id - Update listing (owner only)
DELETE /api/listings/:listing_id - Delete listing (owner only)
POST /api/listings/:listing_id/pause - Pause/unpause listing
POST /api/listings/:listing_id/duplicate - Create duplicate listing

// Quick Listing Endpoints (Sell This Card feature)
POST /api/cards/:card_id/quick-list - Create listing from card detail page
GET /api/cards/:card_id/market-price - Get market price suggestions
GET /api/cards/:card_id/listing-template - Get pre-filled listing data
POST /api/cards/:card_id/price-check - Get competitive pricing analysis

// Individual Seller Performance
GET /api/sellers/:seller_id/performance - Get detailed performance metrics
GET /api/sellers/:seller_id/reviews - Get seller reviews and ratings
GET /api/sellers/:seller_id/response-times - Get communication performance
GET /api/sellers/:seller_id/tier-progress - Get seller tier advancement progress

// Consumer Seller Communication
GET /api/sellers/:seller_id/messages - Get seller message inbox
POST /api/sellers/:seller_id/messages/:message_id/reply - Reply to buyer message
GET /api/sellers/:seller_id/message-templates - Get saved response templates
POST /api/sellers/:seller_id/message-templates - Create message template
PUT /api/sellers/:seller_id/auto-responses - Update automatic response settings

// Individual Seller Financial
GET /api/sellers/:seller_id/payouts - Get payout history and schedule
GET /api/sellers/:seller_id/earnings - Get earnings breakdown and analytics
GET /api/sellers/:seller_id/fee-structure - Get current fee rates and breakdown
POST /api/sellers/:seller_id/payout-schedule - Update payout preferences
GET /api/sellers/:seller_id/tax-documents - Get tax forms and documents (1099-K)
```

#### Consumer Seller Authentication & Authorization

```typescript
// Middleware for Individual Seller Routes
authenticateConsumerSeller(req, res, next) {
  // Verify user is authenticated
  // Check seller_status is active individual seller
  // Validate seller tier permissions
  // Rate limiting for seller operations
}

// Permission Levels for Individual Sellers
interface ConsumerSellerPermissions {
  canCreateListing: boolean;           // Based on listing limits
  canEditAllListings: boolean;         // Own listings only
  canAccessAdvancedAnalytics: boolean; // Tier-based feature
  canUseBulkOperations: boolean;       // Limited for individuals
  canAccessSellerAPI: boolean;         // API access permissions
  maxActiveListings: number;           // Individual seller limits
  canShipInternationally: boolean;     // Verification-based
}
```

### Business Rules

### Product Listing Rules

- Only verified vendors can create product listings
- Each listing must reference a valid catalog card entry
- Product condition must be accurately described with photos
- Prices must be in valid range (minimum $0.01, maximum $50,000)
- Quantity limits per listing (maximum 1000 units)
- Listings automatically deactivate when inventory reaches zero

### Shopping Cart Rules

- Cart items reserve inventory for 30 minutes after adding
- Cart maximum of 100 unique items and 1000 total quantity
- International shipping restrictions based on vendor settings
- Combined shipping applies only to items from same vendor location
- Guest carts convert to user carts upon account creation/login

### Order Processing Rules

- Orders automatically cancel if payment fails after 3 attempts
- Inventory deduction occurs immediately upon payment confirmation
- Orders cannot be modified after payment completion
- Vendor has 48 hours to ship or order may be auto-cancelled
- International orders require customs declaration completion

### Returns Policy Rules

- Return window varies by vendor (7-30 days from delivery)
- Return shipping costs depend on return reason and vendor policy
- Items must be in original condition unless legitimately damaged/misdescribed
- Refunds processed within 5-7 business days of return receipt
- Partial returns allowed for multi-item orders

### Individual Seller Rules

#### Consumer Seller Onboarding Rules

- Only authenticated customers can upgrade to individual seller status
- Simplified upgrade process requires email verification only (no business documents)
- Initial trust score of 60 points assigned to all new individual sellers
- Default seller tier set to Bronze for all new individual sellers
- Maximum 3 upgrade attempts per customer per month to prevent abuse
- Individual sellers cannot have business seller status simultaneously
- Upgrade process must complete within 24 hours or restart required
- Terms and conditions acceptance required with version tracking
- Individual seller accounts linked to personal bank accounts only
- Phone verification recommended but not required for initial onboarding

#### Individual Seller Listing Rules

- Maximum 50 active listings per individual seller (vs unlimited for business)
- Individual sellers limited to single-item quantities per listing (no bulk inventory)
- Listings must reference valid catalog cards (no custom products for individuals)
- Product photos required: minimum 1, maximum 5 images per listing
- Individual sellers cannot use advanced listing features (bulk operations, CSV import)
- Listing creation rate limited to 10 new listings per hour for individuals
- Auto-pricing and repricing tools available to Silver tier and above individual sellers
- Quick listing via "Sell This Card" limited to 20 cards per day for new sellers
- Individual sellers cannot create auction-style listings (fixed price only)
- Listing templates limited to 5 saved templates per individual seller

#### Individual Seller Tier Progression Rules

- **Bronze Tier** (0-499 points): New individual sellers, 50 listing limit, basic features
- **Silver Tier** (500-699 points): Expanded features, auto-pricing tools, priority support
- **Gold Tier** (700-849 points): Advanced analytics, higher visibility, reduced fees
- **Platinum Tier** (850-949 points): Premium features, bulk messaging, featured seller status
- **Diamond Tier** (950-1000 points): Elite seller benefits, API access, dedicated support
- Tier advancement based on trust score, performance metrics, and customer feedback
- Tier demotion possible for poor performance or policy violations
- Tier benefits activate immediately upon qualification
- Special tier progression events for seasonal performance bonuses

#### Individual Seller Trust Score Calculation Rules

```typescript
// Trust Score Components for Individual Sellers
const calculateTrustScore = {
  baseScore: 60, // Starting score for new individual sellers
  factors: {
    customerRating: 0.3, // Customer review ratings (1-5 stars)
    orderCompletion: 0.2, // Successfully completed orders ratio
    responseTime: 0.15, // Average response time to messages
    shippingPerformance: 0.15, // On-time shipping percentage
    disputeRate: 0.1, // Dispute/return rate (inverse)
    verificationLevel: 0.1, // Email, phone, ID verification bonus
  },
  bonuses: {
    emailVerified: 25, // One-time bonus
    phoneVerified: 25, // One-time bonus
    identityVerified: 50, // One-time bonus for ID upload
    firstSale: 20, // One-time bonus for completing first sale
    hundredSales: 100, // Milestone bonus for 100 completed sales
    perfectMonth: 50, // Monthly bonus for perfect performance
  },
  penalties: {
    cancelledOrder: -10, // Per cancelled order
    disputeLoss: -25, // Per dispute resolved against seller
    policyViolation: -50, // Per confirmed policy violation
    fakeReview: -100, // Per confirmed fake review
    counterfeitItem: -200, // Per confirmed counterfeit item sold
  },
};
```

#### Individual Seller Verification Rules

- **Email Verification**: Required for all individual sellers, automatic upon registration
- **Phone Verification**: Optional, adds 25 trust points and enables SMS notifications
- **Identity Verification**: Optional, adds 50 trust points and increases buyer confidence
- **Address Verification**: Optional, enables domestic shipping optimization
- **Payment Verification**: Required for payouts, Stripe Connect standard account setup
- Verification documents processed within 2-5 business days
- Failed verification attempts limited to 3 per type per month
- Re-verification required annually for identity and address verification
- Suspended sellers must re-complete verification to reactivate accounts

#### Individual Seller Performance Rules

- **Response Time Target**: 24 hours for message responses (impacts trust score)
- **Shipping Time Target**: 3 business days from payment to shipment (individual seller standard)
- **Order Completion Rate**: Minimum 95% for maintaining good standing
- **Customer Satisfaction**: Minimum 4.0/5.0 average rating for tier advancement
- **Dispute Rate Limit**: Maximum 5% dispute rate for Gold tier and above
- **Listing Accuracy**: Item condition must match photos and description
- Performance metrics updated daily and affect trust score calculations
- Poor performance may result in listing limits or account restrictions

#### Individual Seller Fee Structure Rules

- **No Listing Fees**: Individual sellers can create listings for free (vs potential fees for business)
- **Transaction Fees**: 5% of sale price (may decrease with higher tiers)
- **Payment Processing**: Stripe fees passed through (2.9% + $0.30 per transaction)
- **No Subscription Fees**: Individual sellers access all basic features for free
- **Premium Features**: Optional paid upgrades available for advanced tools
- **International Fees**: Additional 1% for international payments
- **Instant Payout Fees**: 1% fee for instant payouts (vs free weekly payouts)
- **Refund Processing**: No fees for legitimate returns and refunds

#### Individual Seller Risk Management Rules

- **New Seller Limits**: First 30 days limited to $2,500 in sales
- **High-Value Item Limits**: Items over $1,000 require identity verification
- **Velocity Checks**: Unusual selling patterns trigger manual review
- **Duplicate Listing Detection**: Automatic detection and prevention of duplicate listings
- **Price Manipulation Prevention**: Listings with unrealistic prices flagged for review
- **Account Monitoring**: Automated monitoring for suspicious activities
- **Graduated Penalties**: Warning → restriction → suspension → termination
- **Appeal Process**: Fair dispute resolution for penalized individual sellers
- **Recovery Program**: Path for suspended sellers to regain good standing

### Integration Requirements

### MercurJS/Medusa Integration

- Custom product model extending Medusa's base Product entity
- Integration with Medusa's cart, checkout, and payment systems
- Custom price calculation including platform fees and vendor splits
- Medusa's inventory management with real-time synchronization
- Order fulfillment workflow integration with vendor notifications

### Stripe Connect Integration

- Multi-vendor payment splitting with automatic platform fee deduction
- Vendor payout scheduling (daily, weekly, monthly)
- Refund processing with proper fund routing
- Dispute handling with Stripe's dispute resolution system
- Connect account verification and compliance monitoring

### Shipping Carrier Integration

- EasyPost API for real-time shipping rate calculation
- Label generation for USPS, UPS, FedEx, DHL
- International shipping with customs forms
- Package tracking integration with automatic status updates
- Address validation and correction suggestions

### Search Engine Integration

- Elasticsearch indexing of all product data
- Real-time index updates when listings change
- Advanced search with filtering, faceting, and sorting
- Auto-complete and suggestion functionality
- Analytics tracking for search performance optimization

### Consumer Seller Integration Requirements

#### Customer-Backend Integration

- **Seller Status API**: Real-time seller eligibility checking and status updates
- **Trust Score Engine**: Continuous calculation and synchronization of seller trust scores
- **Performance Metrics**: Daily aggregation of seller performance data
- **Notification System**: Cross-system notifications for seller activities and milestones
- **Profile Synchronization**: Bi-directional sync of customer and seller profile data
- **Verification Services**: Integration with identity and payment verification providers

#### Storefront Integration

- **Seller Discovery**: Navigation integration for seller onboarding entry points
- **Quick Listing**: Card detail page integration for "Sell This Card" functionality
- **Dashboard Integration**: Seamless seller dashboard within customer experience
- **Mobile App Support**: Native mobile features for seller functions
- **Real-time Updates**: WebSocket integration for live seller notifications

#### Commerce Backend (MedusaJS) Integration

- **Product Creation**: Individual seller product listings in commerce catalog
- **Order Processing**: Seller notification and fulfillment workflow integration
- **Payment Distribution**: Automatic seller payout calculation and processing
- **Inventory Sync**: Real-time inventory updates between systems
- **Review System**: Customer review integration with seller reputation

#### Stripe Connect Integration for Individual Sellers

- **Standard Connect Accounts**: Simplified onboarding for individual sellers
- **Personal Bank Accounts**: Integration with personal banking for individuals
- **Automatic Payouts**: Weekly payout scheduling with instant payout options
- **Fee Distribution**: Transparent platform fee calculation and deduction
- **Tax Document Generation**: 1099-K generation for qualifying individual sellers
- **International Support**: Multi-currency and international payment processing

#### Trust Score Calculation Engine

```typescript
interface TrustScoreIntegration {
  // Real-time calculation triggers
  onOrderCompletion: (sellerId: string, orderData: Order) => Promise<void>;
  onReviewReceived: (sellerId: string, reviewData: Review) => Promise<void>;
  onMessageResponse: (sellerId: string, responseTime: number) => Promise<void>;
  onVerificationUpdate: (
    sellerId: string,
    verificationType: string
  ) => Promise<void>;

  // Scheduled batch updates
  dailyPerformanceCalculation: () => Promise<void>;
  monthlyTierRecalculation: () => Promise<void>;

  // Integration points
  updateSellerTier: (sellerId: string, newTier: SellerTier) => Promise<void>;
  notifyTierChange: (
    sellerId: string,
    oldTier: SellerTier,
    newTier: SellerTier
  ) => Promise<void>;
}
```

#### Notification and Communication Integration

- **Email Service Integration**: Transactional emails for seller milestones and activities
- **SMS Notifications**: Order updates and urgent seller notifications via SMS
- **Push Notifications**: Mobile app notifications for seller activities
- **In-App Messaging**: TalkJS integration for buyer-seller communication
- **Notification Preferences**: Granular control over notification types and delivery methods

#### Mobile App Integration

- **Camera Integration**: Native camera access for listing photos and verification
- **Push Notification Support**: Platform-specific push notifications (APNs, FCM)
- **Offline Functionality**: Core seller functions available offline
- **Biometric Authentication**: Touch ID/Face ID for secure seller access
- **Location Services**: Shipping calculation and local market insights

#### Analytics and Reporting Integration

- **Seller Performance Tracking**: Individual seller analytics and reporting
- **Revenue Reporting**: Tax-compliant revenue tracking and reporting
- **Market Intelligence**: Competitive pricing and market trend data
- **A/B Testing**: Seller experience optimization and testing framework
- **Business Intelligence**: Seller success metrics and platform optimization

#### Third-Party Service Integrations

- **Identity Verification**: Jumio or similar for document verification
- **Address Verification**: USPS or SmartyStreets for address confirmation
- **Shipping Carriers**: Direct integration with USPS, UPS, FedEx for individual sellers
- **Tax Services**: TaxJar or Avalara for automated tax calculation and compliance
- **Fraud Detection**: Machine learning-based fraud detection for new sellers

### Security Requirements

### Payment Security

- PCI DSS Level 1 compliance through Stripe
- Tokenization of all payment information
- 3D Secure authentication for international cards
- Fraud detection and prevention algorithms
- Secure API endpoints with rate limiting

### Data Security

- Encryption of sensitive customer and order data
- Secure handling of vendor payout information
- HTTPS for all commerce transactions
- Input validation and SQL injection prevention
- Regular security audits and penetration testing

### Consumer Seller Security

#### Individual Seller Authentication & Authorization

- **Multi-Factor Authentication**: Optional 2FA for individual seller accounts
- **Role-Based Access Control**: Individual seller permissions separate from business sellers
- **Session Management**: Secure session handling with automatic timeout
- **API Rate Limiting**: Seller-specific rate limiting to prevent abuse
- **Account Lockout**: Progressive lockout for failed authentication attempts

#### Individual Seller Data Protection

- **Personal Information Encryption**: Individual seller personal data encrypted at rest
- **Bank Account Security**: Secure handling of personal banking information
- **Identity Document Protection**: Secure storage of verification documents with limited access
- **PII Access Controls**: Strict access controls for individual seller personal information
- **Data Retention**: Automatic data purging per privacy regulations

#### Consumer Seller Financial Security

- **Stripe Connect Security**: Individual sellers use Stripe Standard accounts for enhanced security
- **Payout Verification**: Multi-step verification for payout changes and large amounts
- **Transaction Monitoring**: Automated monitoring for unusual financial patterns
- **Fraud Prevention**: Machine learning-based fraud detection for new individual sellers
- **Tax Compliance**: Secure handling of tax documents and 1099-K generation

#### Individual Seller Privacy Controls

- **Profile Visibility**: Granular controls over seller profile information display
- **Communication Privacy**: Secure buyer-seller messaging with content moderation
- **Data Portability**: Ability to export individual seller data for GDPR compliance
- **Account Deletion**: Secure deletion of individual seller accounts and associated data
- **Consent Management**: Clear consent mechanisms for data collection and usage

#### Consumer Seller Risk Management

- **Trust Score Integrity**: Prevention of trust score manipulation and gaming
- **Review Authentication**: Verification of legitimate reviews and prevention of fake reviews
- **Listing Verification**: Automated detection of suspicious or fraudulent listings
- **Account Monitoring**: Continuous monitoring for policy violations and suspicious activity
- **Escalation Procedures**: Clear escalation paths for security incidents involving individual sellers

#### Mobile Security for Individual Sellers

- **Biometric Authentication**: Support for Touch ID/Face ID on mobile devices
- **App Security**: Certificate pinning and runtime application self-protection
- **Data Encryption**: End-to-end encryption for sensitive seller data on mobile
- **Secure Image Upload**: Secure handling of photos for listings and verification
- **Offline Security**: Secure data storage for offline functionality

### Consumer Seller Performance Requirements

#### Individual Seller API Performance

- **Seller Status Check**: < 100ms response time for seller eligibility verification
- **Dashboard Loading**: < 300ms for individual seller dashboard
- **Listing Creation**: < 400ms for new listing submission
- **Trust Score Updates**: Real-time calculation and display
- **Message Interface**: < 200ms for seller message threads

#### Mobile Performance for Individual Sellers

- **Mobile Dashboard**: < 250ms load time on mobile devices
- **Image Upload**: < 3 seconds for photo processing and upload
- **Offline Sync**: < 500ms for data synchronization when online
- **Push Notifications**: < 1 second delivery time for urgent seller notifications
- **Camera Integration**: < 2 seconds for camera access and photo capture

#### Scalability for Individual Sellers

- **Concurrent Sellers**: Support for 50,000+ active individual sellers
- **Daily Listings**: Handle 10,000+ new individual seller listings per day
- **Trust Score Calculation**: Real-time processing for all individual seller activities
- **Notification Delivery**: Process 100,000+ seller notifications per hour
- **Mobile App Usage**: Support 25,000+ concurrent mobile seller sessions

### Performance Requirements

### Response Time Targets

- Product listing pages: < 200ms
- Search results: < 300ms
- Cart operations: < 150ms
- Checkout process: < 500ms per step
- Order placement: < 2 seconds total

### Scalability Requirements

- Support for 1M+ products in catalog
- Handle 10,000+ concurrent shoppers
- Process 1000+ orders per hour during peak times
- 99.9% uptime for commerce operations
- Horizontal scaling capability for traffic spikes

### UI/UX Requirements

### Product Listing Interface Design

#### Create Product Listing Page (`/sell/list-card`)

**Page Layout:**

- **Header Section**: "List Your Cards" title with progress indicator
- **Card Selection Panel**:
  - Universal search bar with TCG game filters
  - Card search results with thumbnail previews
  - Selected card display with catalog information
  - Alternative "Manual Entry" option for unlisted cards

**Listing Form Design:**

- **Card Information Section** (auto-populated):
  - Card name, set, rarity display (read-only)
  - Game type badge (MTG, Pokemon, etc.)
  - Catalog image preview
- **Listing Details Form**:
  - Condition dropdown with visual condition guide
  - Custom description textarea with character counter
  - Price input with market price suggestions
  - Quantity input with bulk listing toggle
  - Shipping settings dropdown
- **Image Upload Section**:
  - Primary image upload with crop functionality
  - Additional images gallery (up to 10 images)
  - Drag-and-drop upload zone
  - Image preview with delete option
  - File size and format indicators

**Action Buttons:**

- **Save as Draft**: Secondary button for incomplete listings
- **Preview Listing**: Show customer view before publishing
- **Publish Listing**: Primary call-to-action button
- **Bulk Create**: Option for multiple quantity listings

#### Vendor Listing Management Dashboard

**Dashboard Layout:**

- **Summary Cards Row**:
  - Active listings count with trending indicator
  - Total views and engagement metrics
  - Revenue summary with period selector
  - Inventory alerts and notifications

**Listings Table Interface:**

- **Data Grid Features**:
  - Sortable columns (date, price, views, status)
  - Bulk selection checkboxes
  - Status indicators with color coding
  - Quick action buttons (edit, pause, duplicate)
- **Filter Sidebar**:
  - Status filter (active, paused, sold, draft)
  - Game type filter with checkboxes
  - Date range picker
  - Price range slider
- **Bulk Operations Bar**:
  - Bulk edit pricing modal
  - Bulk pause/activate toggle
  - Bulk delete with confirmation
  - Export selection functionality

### Shopping Cart Interface Design

#### Shopping Cart Page (`/cart`)

**Cart Layout Structure:**

- **Cart Header**: Item count and total value display
- **Multi-Vendor Organization**:
  - Grouped items by vendor with seller info
  - Individual vendor subtotals
  - Combined shipping when possible
  - Seller rating and location display

**Cart Item Components:**

- **Item Card Design**:
  - Product image thumbnail (80x80px)
  - Card name and set information
  - Condition badge with color coding
  - Price per unit and total calculation
  - Quantity controls with real-time updates
  - Remove item button with confirmation
- **Quantity Controls**:
  - Decrease/increase buttons with validation
  - Direct input with max inventory checking
  - Inventory availability indicator
  - "Last N available" urgency messages

**Cart Totals Section:**

- **Cost Breakdown**:
  - Items subtotal per vendor
  - Shipping costs calculation
  - Estimated taxes display
  - Platform fees (if applicable)
  - **Grand Total** with prominent styling
- **Promotional Codes**:
  - Coupon code input field
  - Applied discount display
  - Available promotions suggestions

**Cart Actions:**

- **Continue Shopping**: Link back to marketplace
- **Save for Later**: Move items to wishlist
- **Proceed to Checkout**: Primary action button
- **Clear Cart**: Secondary destructive action

#### Cart Dropdown Component (Header)

**Mini Cart Design:**

- **Cart Icon**: Badge with item count
- **Dropdown Content**:
  - Recent items preview (max 3 items)
  - Mini item cards with image and price
  - Subtotal display
  - "View Cart" and "Checkout" buttons
  - Empty state with shopping suggestions

### Checkout Flow Interface Design

#### Checkout Process (`/checkout`)

**Multi-Step Checkout Layout:**

- **Progress Indicator**: Steps with completion status
  1. **Shipping Information**
  2. **Shipping Methods**
  3. **Payment Information**
  4. **Order Review**

**Step 1: Shipping Information**

- **Address Form**:
  - Address autocomplete with validation
  - Multiple saved addresses selection
  - "Same as billing" checkbox option
  - New address creation inline
- **Contact Information**:
  - Phone number with format validation
  - Email confirmation field
  - Shipping instructions textarea

**Step 2: Shipping Methods**

- **Per-Vendor Shipping Options**:
  - Vendor-specific shipping choices
  - Cost and delivery time for each option
  - Express shipping upgrades
  - Insurance options for valuable orders
- **Combined Shipping Indicator**:
  - Savings display when items ship together
  - Separate shipping notifications

**Step 3: Payment Information**

- **Payment Method Selection**:
  - Credit/debit card form with validation
  - Saved payment methods list
  - Alternative payment options (PayPal, Apple Pay, Google Pay)
  - Payment security badges and SSL indicators
- **Billing Address**:
  - "Same as shipping" toggle
  - Billing address form if different
  - Tax calculation updates

**Step 4: Order Review**

- **Complete Order Summary**:
  - All items with images and details
  - Shipping method confirmations
  - Total cost breakdown by vendor
  - Terms and conditions acceptance
- **Place Order Section**:
  - Final total with prominence
  - "Place Order" primary action button
  - Order processing time estimate
  - Customer service contact info

#### Checkout Mobile Optimization

**Mobile-Specific Features:**

- **Single-column layout** with simplified navigation
- **Sticky checkout button** at bottom of screen
- **Accordion sections** for step organization
- **Touch-friendly** input fields and buttons
- **Native payment integration** (Apple Pay, Google Pay)

### Order Management Interface Design

#### Order Confirmation Page (`/order/[id]/confirmed`)

**Confirmation Layout:**

- **Success Message**: Clear confirmation with order number
- **Order Summary Section**:
  - Complete item breakdown with images
  - Vendor information and contact details
  - Shipping addresses confirmation
  - Payment method used
- **Next Steps Section**:
  - Expected delivery timeline
  - Tracking information availability
  - Customer service contact methods
- **Related Actions**:
  - Continue shopping button
  - Account/order history link
  - Print receipt option

#### Order History Page (`/user/orders`)

**Order List Design:**

- **Order Cards Layout**:
  - Order date and number header
  - Order status badge with color coding
  - Item thumbnails preview
  - Total amount and payment status
  - Quick actions (view details, track, reorder)
- **Filtering and Search**:
  - Date range filter
  - Order status filter
  - Search by order number or item name
  - Sorting options (recent, amount, status)

#### Order Details Page (`/user/orders/[id]`)

**Detailed Order View:**

- **Order Information Header**:
  - Order number, date, and status
  - Progress timeline with tracking updates
  - Delivery estimate and actual delivery date
- **Items Section**:
  - Complete item list with images and descriptions
  - Individual item tracking when available
  - Vendor contact information per item
- **Addresses and Payment**:
  - Shipping and billing address display
  - Payment method and transaction ID
  - Cost breakdown with taxes and fees
- **Order Actions**:
  - Cancel order (if still processing)
  - Request return for delivered items
  - Contact seller buttons
  - Reorder items functionality

### Returns Interface Design

#### Return Request Page (`/user/orders/[id]/return`)

**Return Form Layout:**

- **Returnable Items Selection**:
  - Item list with checkboxes for selection
  - Return quantity controls for multi-item orders
  - Item condition display and photos
- **Return Reason Section**:
  - Radio button selection for return reasons
  - Text area for detailed explanation
  - Photo upload for condition documentation
- **Return Method Selection**:
  - Return shipping options
  - Cost responsibility indicator
  - Return timeline expectations
- **Return Confirmation**:
  - RMA number generation
  - Return instructions display
  - Shipping label download/email

#### Returns Management Page (`/user/returns`)

**Returns Dashboard:**

- **Return Status Cards**:
  - Active returns with progress tracking
  - Return request status indicators
  - Refund processing timelines
- **Return History**:
  - Completed returns list
  - Refund amounts and dates
  - Return reasons summary

### Reviews and Ratings Interface Design

#### Review Submission Interface

**Review Form Design:**

- **Overall Rating**: 5-star rating component with hover effects
- **Detailed Ratings**:
  - Item condition accuracy rating
  - Shipping speed rating
  - Vendor communication rating
- **Written Review**:
  - Textarea with character counter
  - Review guidelines display
  - Helpful writing tips
- **Photo Upload**:
  - Multiple image upload for received item condition
  - Image preview with captions
  - File size and format validation

#### Seller Reviews Page (`/sellers/[handle]/reviews`)

**Reviews Display Layout:**

- **Review Summary Section**:
  - Overall seller rating with star display
  - Rating distribution bar chart
  - Total review count
  - Recent rating trends
- **Individual Reviews List**:
  - Reviewer information and verification badge
  - Purchase date and verification status
  - Star ratings for all categories
  - Review text with helpful/unhelpful voting
  - Seller response display
  - Review photos gallery

### Marketplace Browsing Interface Design

#### Marketplace Page (`/marketplace`)

**Product Grid Layout:**

- **Filter Sidebar**:
  - Game type checkboxes (MTG, Pokemon, etc.)
  - Card condition filters
  - Price range slider
  - Seller location and rating filters
  - Sort options dropdown
- **Product Grid**:
  - Card thumbnail with hover zoom
  - Card name and set information
  - Condition badge display
  - Price with shipping information
  - Seller rating and location
  - Quick "Add to Cart" button
  - "Add to Wishlist" heart icon

#### Product Details Page (`/products/[handle]`)

**Product Page Layout:**

- **Image Gallery Section**:
  - Primary product image with zoom functionality
  - Thumbnail gallery for additional images
  - Full-screen image viewer modal
- **Product Information**:
  - Card name, set, and game information
  - Condition description with guide link
  - Seller description and custom notes
  - Market price comparison data
- **Purchase Section**:
  - Current price with shipping costs
  - Quantity selector with max validation
  - "Add to Cart" primary button
  - "Add to Wishlist" secondary button
  - "Buy Now" express checkout option
- **Seller Information**:
  - Seller name and rating display
  - Seller location and shipping info
  - Other items from seller link
  - Contact seller messaging option

### Responsive Design Requirements

#### Mobile Commerce Optimization (< 768px)

**Layout Adaptations:**

- **Single-column layouts** for all commerce pages
- **Bottom-sticky checkout buttons** for easy access
- **Swipe gestures** for image galleries
- **Collapsible sections** for detailed information
- **Touch-optimized** quantity controls and buttons
- **Full-screen modals** for complex interactions

**Mobile-Specific Commerce Features:**

- **Mobile payment integration** (Apple Pay, Google Pay)
- **Camera integration** for condition photos
- **Location services** for shipping calculations
- **Push notifications** for order updates

#### Tablet Commerce Experience (768px - 1024px)

**Enhanced Layouts:**

- **Two-column layouts** for product pages
- **Side-by-side comparisons** for similar products
- **Enhanced image galleries** with larger previews
- **Improved filter interfaces** with more screen space

#### Desktop Commerce Features (> 1024px)

**Advanced Functionality:**

- **Hover effects** for product previews
- **Quick view modals** for product browsing
- **Advanced filtering** with multi-select options
- **Keyboard shortcuts** for power users
- **Bulk operations** for vendor management

### Performance Requirements

#### Commerce Page Loading Targets

- **Product listings**: < 300ms first contentful paint
- **Shopping cart**: < 200ms for cart updates
- **Checkout steps**: < 400ms per step transition
- **Image loading**: Progressive loading with placeholders
- **Search results**: < 500ms with pagination

#### Real-time Features

- **Inventory updates**: Real-time stock validation
- **Price changes**: Live price update notifications
- **Cart synchronization**: Cross-device cart sync
- **Order status**: Real-time tracking updates

### Accessibility Requirements

#### Commerce Accessibility Standards

**WCAG 2.1 AA Compliance:**

- **Form accessibility**: Proper labeling and error handling
- **Button accessibility**: Clear focus states and descriptions
- **Image accessibility**: Alt text for all product images
- **Color accessibility**: High contrast for status indicators
- **Keyboard navigation**: Full keyboard accessibility

**Screen Reader Optimization:**

- **Price announcements**: Clear price and total communication
- **Status updates**: Cart and checkout status announcements
- **Error handling**: Accessible error message delivery
- **Progress indication**: Checkout step progress communication

### Testing Requirements

#### UI Component Testing

- **Cart functionality testing**: Add, remove, update quantities
- **Checkout flow testing**: Complete multi-step process
- **Payment integration testing**: All payment methods
- **Mobile commerce testing**: Touch interactions and layouts
- **Cross-browser testing**: Commerce functionality across browsers

#### User Experience Testing

- **Conversion optimization**: A/B testing for checkout flow
- **Usability testing**: Task completion rates for purchases
- **Performance testing**: Page load times and interaction speed
- **Accessibility testing**: Screen reader and keyboard navigation
- **Mobile usability**: Touch-friendly interface validation

### Consumer Seller Interface Design

#### Consumer Seller Upgrade Flow Interface (`/sell/upgrade`)

**Upgrade Flow Layout:**

- **Page Header**: "Become a Seller" title with trust badges and social proof
- **Progress Indicator**: 3-step process visualization with completion status
- **Mobile-First Design**: Single-column layout optimized for phone users

**Step 1: Seller Type Selection**

- **Individual vs Business Choice**:
  - Large selection cards with clear benefit comparison
  - "Perfect for collectors" messaging for individual option
  - Visual icons showing appropriate use cases
  - Benefits list: "No fees", "Simple setup", "Start selling immediately"
- **Selection Confirmation**:
  - Selected option highlighted with checkmark
  - "Continue" button activates after selection
  - "Why choose individual?" tooltip with additional context

**Step 2: Terms & Agreement**

- **Terms Display**:
  - Scrollable terms and conditions specific to individual sellers
  - Key points highlighted: responsibilities, fees, policies
  - Progress indicator showing user has scrolled through terms
- **Agreement Checkbox**:
  - Required checkbox with clear "I agree to the individual seller terms"
  - Links to full terms, privacy policy, and seller guidelines
  - Checkbox validation with error state if not selected

**Step 3: Welcome & Completion**

- **Success Message**: "Welcome to SideDecked Sellers!" with celebration design
- **Initial Setup Summary**:
  - Confirmation of individual seller status
  - Initial trust score display (60 points)
  - Bronze tier badge assignment
- **Immediate Actions**:
  - "List Your First Card" primary button → `/sell/list-card`
  - "Complete Your Profile" secondary button → seller settings
  - "Go to Dashboard" tertiary link → `/sell`

#### Consumer Seller Dashboard Interface (`/sell`)

**Dashboard Header:**

- **Seller Status Banner**: Trust level badge, seller tier, verification status
- **Quick Stats Row**: Active listings, total sales, current rating, trust score
- **Action Buttons**: "List New Card", "Check Messages", "View Profile"

**Tab Navigation System:**

- **Overview Tab** (Default):
  - Recent activity feed with timeline design
  - Performance charts (mobile-friendly)
  - Quick action cards for common tasks
  - Notifications and alerts panel
- **Listings Tab**:
  - Grid view of active listings with thumbnails
  - Quick filters: Active, Paused, Sold, Draft
  - Bulk selection for basic operations
  - "Create New Listing" prominent button
- **Sales Tab**:
  - Order history with status indicators
  - Revenue tracking with simple charts
  - Payout schedule and history
  - Tax document access for individuals
- **Profile Tab**:
  - Seller profile management form
  - Verification status checklist
  - Notification preferences
  - Account settings and security

**Mobile-First Dashboard Features:**

- **Collapsible sections** for better mobile navigation
- **Swipe gestures** for tab navigation
- **Bottom action bar** with key functions
- **Pull-to-refresh** for real-time updates
- **Touch-optimized** charts and interactions

#### Individual Seller Listing Creation Interface

**Create Listing Page Layout:**

- **Header**: "List Your Card" with progress indicator for complex listings
- **Mobile Camera Integration**: "Take Photo" button with direct camera access
- **Auto-Population**: Card search with catalog integration and auto-fill

**Listing Form Design:**

- **Card Search Section**:
  - Universal search with game type filters
  - Card suggestions with thumbnail previews
  - "Manual Entry" option for unlisted cards
  - Recently searched cards quick access
- **Listing Details Form**:
  - **Condition Selector**: Visual condition guide with examples
  - **Price Input**: Market price suggestions with competitive analysis
  - **Quantity Input**: Limited to reasonable amounts for individuals
  - **Description Field**: Character counter with helpful writing tips
  - **Shipping Options**: Dropdown based on seller preferences
- **Photo Upload Section**:
  - Primary image upload with crop functionality
  - Additional images carousel (max 5 for individuals)
  - Mobile camera integration with preview
  - Photo quality tips and guidelines
- **Preview Section**:
  - Real-time preview of how listing appears to buyers
  - Mobile and desktop preview toggle
  - Final review before publishing

**Quick Listing Interface ("Sell This Card" Button):**

- **Modal Design**: Overlay modal triggered from card detail pages
- **Pre-populated Data**: Card info automatically filled from catalog
- **Simplified Form**: Only essential fields (condition, price, photos)
- **One-Click Publish**: Streamlined creation for frequent sellers
- **Mobile Optimization**: Touch-friendly modal with large buttons

#### Individual Seller Trust & Verification Interface

**Trust Score Dashboard:**

- **Trust Score Display**: Large circular progress indicator showing current score
- **Tier Visualization**: Progress bar showing advancement to next tier
- **Score Breakdown**: Expandable sections showing contribution factors
- **Improvement Tips**: Personalized suggestions for score enhancement

**Verification Center:**

- **Verification Checklist**: Progress indicators for each verification type
- **Email Verification**: Automatic status with re-send option
- **Phone Verification**: SMS verification flow with country code selection
- **Identity Verification**: Document upload with photo capture integration
- **Address Verification**: Address confirmation with shipping integration
- **Payment Verification**: Stripe Connect account status and setup

**Performance Metrics Display:**

- **Response Time**: Average response time with target indicators
- **Shipping Performance**: On-time shipping percentage with trends
- **Customer Satisfaction**: Star rating with review count
- **Order Completion**: Completion rate with benchmark comparison

#### Consumer Seller Communication Interface

**Message Inbox Design:**

- **Conversation List**: Recent messages with buyer information and order context
- **Unread Indicators**: Clear visual indicators for new messages
- **Order Integration**: Messages linked to specific orders and listings
- **Search and Filter**: Find messages by buyer, order, or date range

**Message Thread Interface:**

- **Order Context Panel**: Relevant order details and item information
- **Message History**: Chronological conversation with clear sender identification
- **Photo Sharing**: Image upload for condition clarification
- **Quick Responses**: Pre-written templates for common situations
- **Translation Support**: Automatic translation for international buyers

**Mobile Messaging Optimization:**

- **Push Notifications**: Immediate message alerts with reply actions
- **Voice-to-Text**: Voice input for quick responses on mobile
- **Image Capture**: Direct camera access for shipping photos
- **Offline Support**: Message queuing for poor connectivity

#### Individual Seller Performance Analytics

**Analytics Dashboard:**

- **Key Metrics Cards**: Revenue, orders, views, conversion rate
- **Performance Trends**: Simple line charts showing progress over time
- **Comparison Data**: Benchmarks against similar individual sellers
- **Goal Tracking**: Progress towards personal selling goals

**Mobile Analytics:**

- **Simplified Charts**: Touch-optimized charts designed for small screens
- **Key Insights**: Highlight most important performance indicators
- **Action Items**: Personalized recommendations for improvement
- **Quick Filters**: Easy date range and metric filtering

#### Consumer Seller Settings Interface

**Profile Settings:**

- **Display Information**: Seller name, bio, location, specialties
- **Seller Preferences**: Shipping methods, return policy, auto-responses
- **Notification Settings**: Email, SMS, and push notification preferences
- **Privacy Controls**: Profile visibility and buyer communication settings

**Account Management:**

- **Security Settings**: Password, two-factor authentication
- **Payment Settings**: Payout schedule, bank account management
- **Tax Information**: Tax forms, documentation, 1099-K access
- **Account Deletion**: Clear process for account closure

#### Responsive Design for Consumer Sellers

**Mobile-First Approach (< 768px):**

- **Single-column layouts** throughout all seller interfaces
- **Thumb-friendly navigation** with large touch targets
- **Simplified interactions** reducing complexity for mobile users
- **Camera integration** for listing photos and verification
- **Swipe gestures** for navigating between sections
- **Bottom navigation** for key seller functions
- **Collapsible sections** to manage screen space efficiently

**Tablet Seller Experience (768px - 1024px):**

- **Two-column layouts** for dashboard and listing management
- **Enhanced image galleries** for listing creation
- **Side-by-side comparison** views for performance analytics
- **Improved form layouts** with better field organization

**Desktop Seller Features (> 1024px):**

- **Advanced dashboard layouts** with multiple columns
- **Keyboard shortcuts** for power sellers
- **Hover effects** for better interaction feedback
- **Bulk operations** interface for managing multiple listings
- **Advanced analytics** with detailed charts and insights

#### Consumer Seller Accessibility

**Individual Seller Accessibility Standards:**

- **Screen Reader Support**: Comprehensive alt text and ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility for all functions
- **High Contrast**: Clear visual indicators for seller status and actions
- **Font Size Support**: Scalable text for better readability
- **Color Blind Support**: Color-independent status indicators

**Mobile Accessibility:**

- **Voice Control**: Voice commands for listing creation and management
- **Large Touch Targets**: Minimum 44px touch targets throughout
- **Gesture Alternatives**: Alternative access methods for swipe gestures
- **Screen Reader**: VoiceOver and TalkBack optimization

#### Consumer Seller Performance Standards

**Interface Performance Targets:**

- **Dashboard Loading**: < 300ms for seller dashboard
- **Listing Creation**: < 400ms for form rendering
- **Image Upload**: < 2 seconds for photo processing
- **Trust Score Updates**: Real-time score calculations
- **Message Interface**: < 200ms for message thread loading

**Mobile Performance:**

- **Offline Support**: Key seller functions available offline
- **Data Optimization**: Efficient data usage for mobile users
- **Battery Optimization**: Minimal battery impact from seller app usage
- **Progressive Loading**: Incremental content loading for slow connections

