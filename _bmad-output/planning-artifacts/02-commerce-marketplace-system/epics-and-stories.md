---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - docs/specifications/02-commerce-marketplace-system.md
---
# Commerce & Marketplace System - Epic Breakdown

## Overview

This document decomposes 02-commerce-marketplace-system into implementation-ready epics and stories for BMAD execution.

## Requirements Inventory

### Functional Requirements

- Shopping Cart & Checkout
- Order Processing & Management
- Returns & Customer Service
- Reviews & Ratings
- Consumer/Individual Seller Features

### NonFunctional Requirements

- Technical requirements are synchronized from the source specification.
- Security and performance constraints are synchronized from the source specification.

### Additional Requirements

- Business rules and integration constraints remain authoritative in the source specification.

### FR Coverage Map

- Epic-to-story coverage is represented by the complete story list below.

## Epic List

- Shopping Cart & Checkout
- Order Processing & Management
- Returns & Customer Service
- Reviews & Ratings
- Consumer/Individual Seller Features

## Story Index

- Shopping Cart Management
- Multi-Vendor Checkout Process
- Shipping & Tax Calculation
- Order Creation & Notification
- Order Tracking & Updates
- Return Request Process
- Dispute Resolution
- Customer Reviews
- Discover Individual Selling Opportunities
- Consumer Seller Onboarding
- Consumer Seller Dashboard
- Quick Card Listing from Collection
- Individual Seller Reputation Management
- Individual Seller Payment & Payout
- Individual Seller Communication
- Individual Seller Growth & Success

## Full Epic and Story Breakdown

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

