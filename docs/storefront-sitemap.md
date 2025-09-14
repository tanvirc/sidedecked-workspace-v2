# SideDecked Storefront Sitemap & Navigation Architecture

## Overview

This document provides a comprehensive sitemap for the SideDecked storefront based on the actual implemented file structure and components found in `/storefront/src/app/[locale]/(main)/`. 

**Date Created**: 2025-09-11  
**Version**: 1.0  
**Based on**: Actual codebase structure analysis

---

## Site Architecture

### Route Structure
The storefront follows Next.js 14 App Router with internationalization:
- **Base Pattern**: `/[locale]/(main)/`
- **Checkout Flow**: `/[locale]/(checkout)/`
- **Authentication**: `/auth/`
- **Reset Password**: `/[locale]/(reset-password)/`

---

## 1. Persistent Navigation Elements

### Header Navigation (ModernHeader.tsx)
**Persistent across all pages**

**Desktop Navigation Links**:
- **Browse Cards** (`/cards`) - Primary TCG catalog
- **Deck Builder** (`/decks`) - Universal deck creation
- **Marketplace** (`/marketplace`) - Commerce listings
- **Sell** (`/sell`) - Seller onboarding & tools
- **Community** (`/community`) - Social features

**Header Actions**:
- **Theme Toggle** - Light/dark mode switcher
- **Search Bar** - Enhanced search with filters (desktop only)
- **Notifications** - Bell icon with activity indicator (authenticated users)
- **Wishlist** (`/user/wishlist`) - Heart icon with count badge
- **Cart** (`/cart`) - Shopping cart with item count
- **Profile Dropdown** - Account access and logout

**Profile Dropdown Menu** (Authenticated Users):
- Account Info Display (name, email)
- **Orders** (`/user/orders`) - Order history
- **Messages** (`/user/messages`) - TalkJS messaging
- **Settings** (`/user/settings`) - Account preferences
- **Become a Seller** (`/sell/upgrade`) - Seller upgrade
- **Sign Out** - Logout functionality

**Profile Dropdown Menu** (Unauthenticated):
- **Sign In** (`/user`) - Login page
- **Create Account** (`/user/register`) - Registration

**Mobile Navigation**:
- **Mobile Search Bar** - Appears below header on mobile
- **Hamburger Menu** - Slide-out navigation with same links
- All desktop actions available in mobile-responsive format

### Footer Navigation (Footer.tsx)
**Three-column layout**

**Customer Services**:
- FAQs (placeholder link)
- Track Order (placeholder link)  
- Returns (placeholder link)
- Delivery (placeholder link)
- Payment (placeholder link)

**About**:
- About us (placeholder link)
- Blog (placeholder link)
- Privacy Policy (placeholder link)
- Terms & Conditions (placeholder link)

**Connect**:
- Facebook (https://facebook.com)
- Instagram (https://instagram.com)

**Copyright**: © 2024 SideDecked

---

## 2. Main Site Pages

### 2.1 Homepage (`/`)
**Primary landing experience**

**Components & Sections**:
- **GamesBentoGrid** - Featured TCG game categories
- **CommunityPulse** - Live activity feed from community
- **CollectionShowcase** - Premium cards carousel
- **MarketIntelligence** - Data visualization & insights
- **HomeProductSection** - Trending listings (algorithmic)

**Navigation Paths From Home**:
- → Browse Cards (`/cards`)
- → Deck Builder (`/decks`)
- → Marketplace (`/marketplace`)
- → Community (`/community`)
- → Individual card details (`/cards/[id]`)
- → Product listings (`/products/[handle]`)

### 2.2 TCG Catalog Section

#### Browse Cards (`/cards`)
**Primary card discovery interface**

**Features**:
- Card grid with search and filtering
- Game-specific filtering (MTG, Pokémon, Yu-Gi-Oh!, One Piece)
- Advanced search capabilities
- Sorting and pagination

**Navigation Paths**:
- → Card Details (`/cards/[id]`)
- → Advanced Search Modal (overlay)
- → Filtered results with URL parameters

#### Card Details (`/cards/[id]`)
**Individual card information page**

**Components**:
- **CardDetailPage** - Full card details with marketplace listings
- Card image gallery
- Oracle text and game rules
- Price history and market data
- Available listings from sellers
- "Sell This Card" action button

**Key Features**:
- **Create Price Alert Modal** - Price tracking setup
- **Add to Wishlist** - Save for later
- **Add to Cart** - Purchase from available listings
- **Share Card** - Social sharing options

**Navigation Paths**:
- → Cart (`/cart`) - After adding items
- → Seller Profile (`/sellers/[handle]`)
- → Related cards
- → Price Alert management

### 2.3 Deck Builder Section

#### Deck Browser (`/decks`)
**Community deck discovery**

**Components**:
- **DeckBrowsingPage** - Main deck browsing interface

**Features & Filters**:
- Game selection (MTG, Pokémon, Yu-Gi-Oh!, One Piece)
- Format filtering (Standard, Modern, etc.)
- Search by deck name or cards
- Sort options (newest, popularity, value)
- View modes: All Decks, My Decks, Following

**Search Parameters**:
- `game` - Game type filter
- `format` - Format filter
- `q` - Search query
- `sort` - Sort order
- `page` - Pagination
- `view` - Deck view mode
- `minValue`/`maxValue` - Price filtering
- `onlyValid` - Format legality filter

**Navigation Paths**:
- → Deck Details (`/decks/[deckId]`)
- → Create New Deck (`/decks/builder/new`)
- → Edit Deck (`/decks/[deckId]/edit`)

#### Deck Details (`/decks/[deckId]`)
**Individual deck viewing**

**Features**:
- Complete deck list with card counts
- Mana curve and statistics
- Deck creator information
- Social features (likes, comments, shares)
- Format legality validation
- Estimated deck value

#### Create New Deck (`/decks/builder/new`)
**Deck creation interface**

**Features**:
- **CreateDeckModal** - Initial deck setup
- Drag-and-drop card addition
- Auto-suggestions and validation
- Format-specific rules engine
- Save as public/private
- Collection integration

#### Edit Deck (`/decks/[deckId]/edit`)
**Deck modification interface**

**Same features as deck creation** with existing deck data pre-loaded

### 2.4 Commerce Section

#### Marketplace (`/marketplace`)
**Main shopping interface**

**Features**:
- Product grid with seller information
- Advanced filtering and search
- Price comparison across sellers
- Seller ratings and reviews
- Stock availability indicators

#### Shopping Cart (`/cart`)
**Cart review and management**

**Components**:
- **CartReview** - Item list with quantities
- **CartItems** - Individual item management
- **CartPromotionCode** - Coupon/discount code entry
- Shipping cost calculation
- Tax calculation
- Total price summary

**Navigation Paths**:
- → Checkout (`/checkout`)
- → Continue Shopping (back to marketplace)
- → Remove/modify items

#### Checkout (`/checkout`)
**Separate checkout layout**

**Components**:
- **CartAddressSection** - Shipping/billing addresses
- **CartShippingMethodsSection** - Delivery options
- **CartPaymentSection** - Payment method selection
- **CartReview** - Final order review
- **PaymentWrapper** - Payment processing

**Checkout Flow**:
1. Address verification/entry
2. Shipping method selection
3. Payment method setup
4. Order review and confirmation
5. → Order Confirmation (`/order/[id]/confirmed`)

#### Order Confirmation (`/order/[id]/confirmed`)
**Post-purchase confirmation**

**Features**:
- Order summary
- Payment confirmation
- Shipping details
- Tracking information setup

#### Categories (`/categories`)
**Product category browsing**

**Features**:
- Category hierarchy navigation
- → Category Details (`/categories/[category]`)

#### Collections (`/collections/[handle]`)
**Curated product collections**

**Features**:
- Featured product sets
- Seasonal collections
- Seller spotlights

#### Product Details (`/products/[handle]`)
**Individual product marketplace listings**

**Features**:
- Product images and details
- Seller information
- Stock and pricing
- Reviews and ratings
- Add to cart functionality

### 2.5 Seller Tools

#### Sell Landing (`/sell`)
**Seller onboarding homepage**

**Features**:
- Seller benefits overview
- Getting started guide
- Success stories
- → Seller Upgrade (`/sell/upgrade`)

#### List Card (`/sell/list-card`)
**Quick card listing interface**

**Features**:
- Card search and selection
- Condition assessment
- Pricing recommendations
- Bulk listing tools

#### Seller Upgrade (`/sell/upgrade`)
**Premium seller features**

**Features**:
- Seller account upgrade
- Premium tools overview
- Pricing and payment setup

#### Seller Profile (`/sellers/[handle]`)
**Public seller storefront**

**Components**:
- **SellerTabs** - Navigation between sections
- **SellerFooter** - Seller information
- **SellerScore** - Reputation display
- Seller's active listings
- → Seller Reviews (`/sellers/[handle]/reviews`)

#### Seller Reviews (`/sellers/[handle]/reviews`)
**Seller feedback and ratings**

**Features**:
- Review list with ratings
- Review filtering and sorting
- Overall seller score
- Response from seller

### 2.6 User Account Section

#### User Dashboard (`/user`)
**Account homepage / Sign-in page**

**Features**:
- Authentication gateway
- Account overview (if logged in)
- Quick actions and shortcuts

#### User Registration (`/user/register`)
**Account creation**

**Features**:
- Registration form
- Social login options (OAuth2)
- Email verification flow

#### User Settings (`/user/settings`)
**Account preferences**

**Features**:
- Profile information editing
- Privacy settings
- Notification preferences
- Password management

#### Orders (`/user/orders`)
**Order history and management**

**Features**:
- Order list with status
- → Order Details (`/user/orders/[id]`)
- Reorder functionality
- Order tracking

#### Order Details (`/user/orders/[id]`)
**Individual order information**

**Components**:
- **OrderDetails** - Complete order information
- **OrderAddresses** - Shipping/billing details
- **OrderTotals** - Pricing breakdown
- → Return Request (`/user/orders/[id]/return`)
- → Return Success (`/user/orders/[id]/request-success`)

#### Order Returns (`/user/orders/[id]/return`)
**Return request interface**

**Components**:
- **OrderReturnSection** - Return form and options
- **SingleOrderReturn** - Individual item returns
- **ReturnMethodsTab** - Return method selection

#### Return Success (`/user/orders/[id]/request-success`)
**Return confirmation page**

#### Returns Management (`/user/returns`)
**All return requests**

**Features**:
- Return status tracking
- Return history
- Return policy information

#### Messages (`/user/messages`)
**TalkJS messaging interface**

**Components**:
- **Chat** - Real-time messaging with sellers
- Conversation list
- Message notifications

#### Wishlist (`/user/wishlist`)
**Saved items management**

**Components**:
- **WishlistPage** - Main wishlist interface
- **WishlistTabs** - Different wishlist categories
- Add to cart from wishlist
- Share wishlist functionality

#### Price Alerts (`/user/price-alerts`)
**Price tracking management**

**Features**:
- Active price alerts list
- Alert configuration
- Price change notifications
- Alert history

#### Addresses (`/user/addresses`)
**Shipping address management**

**Features**:
- Address book management
- Default address settings
- Add/edit/delete addresses

#### Reviews (`/user/reviews`)
**User's review activity**

**Features**:
- Reviews given to sellers
- → Written Reviews (`/user/reviews/written`)
- Review history and management

#### Written Reviews (`/user/reviews/written`)
**Reviews authored by user**

### 2.7 Community Section

#### Community Hub (`/community`)
**Social features homepage**

**Features**:
- Activity feed
- Community highlights
- Discussion forums
- User profiles and following

#### Search (`/search`)
**Universal search interface**

**Components**:
- **EnhancedSearchBar** - Advanced search with filters
- **SmartSearchResults** - AI-powered search results
- **AdvancedSearchModal** - Detailed search options

**Search Features**:
- Multi-category search (cards, decks, sellers, products)
- Advanced filtering options
- Search suggestions and autocomplete
- Search result categorization

**URL Parameters**:
- `q` - Search query
- `games` - Game filter
- `types` - Card type filter
- `condition` - Card condition
- `language` - Card language
- `in_stock` - Stock availability
- `price_min`/`price_max` - Price range
- `sort` - Sort order

---

## 3. Authentication & Special Flows

### Authentication (`/auth/`)

#### OAuth Callback (`/auth/callback`)
**OAuth2 authentication processing**

#### Auth Error (`/auth/error`)
**Authentication error handling**

#### Auth Test (`/auth/test`)
**Development authentication testing**

### Password Reset (`/[locale]/(reset-password)/`)

#### Reset Password (`/reset-password`)
**Password reset form**

---

## 4. Modal & Overlay Flows

### Overlays That Don't Change URL

#### Authentication Modals
- **Login Modal** - Quick sign-in overlay
- **Registration Modal** - Quick account creation
- **Password Reset Modal** - Reset password request

#### Shopping & Commerce Modals
- **Add to Cart Confirmation** - Cart addition feedback
- **Quick View Modal** - Product preview without leaving page
- **Shipping Calculator** - Shipping cost estimation

#### Card & Deck Modals
- **CreatePriceAlertModal** - Set up price tracking for cards
- **AdvancedSearchModal** - Detailed search options
- **CreateDeckModal** - Initial deck creation setup
- **CardHoverPopup** - Card preview on hover

#### General UI Modals
- **Modal** - General purpose modal component
- Error modals and confirmation dialogs
- Success notifications and feedback

---

## 5. User Flow Diagrams

### Primary User Journeys

#### 1. New User Registration → First Purchase
```
Home → Browse Cards → Card Details → Create Account → 
Add to Cart → Checkout → Payment → Order Confirmation
```

#### 2. Deck Building Flow
```
Home → Deck Builder → Browse Decks → Create New → 
Add Cards → Save Deck → Share → View Community Response
```

#### 3. Seller Onboarding
```
Sell → Seller Upgrade → List Cards → Manage Inventory → 
Receive Orders → Fulfill → Get Reviews
```

#### 4. Shopping & Checkout
```
Search → Filter Results → Compare Sellers → Add to Cart → 
Review Cart → Checkout → Address → Shipping → Payment → Confirm
```

### Secondary User Journeys

#### 5. Account Management
```
Profile Dropdown → Settings → Update Info → 
Manage Addresses → Review Orders → Track Returns
```

#### 6. Social & Community
```
Community → View Activity → Follow Users → 
Create Content → Receive Notifications → Engage
```

#### 7. Price Tracking
```
Card Details → Create Alert → Manage Alerts → 
Receive Notifications → Purchase → Update Alerts
```

---

## 6. Navigation Patterns

### Breadcrumb Navigation
Used on:
- Product detail pages
- Category browsing
- User account sections
- Order details

### Tab Navigation
Used in:
- **SellerTabs** - Seller profile sections
- **WishlistTabs** - Wishlist categories
- **ReturnMethodsTab** - Return options
- User settings sections

### Sidebar Navigation
Used in:
- Advanced search filtering
- Category browsing
- User account dashboard

### Pagination
Used in:
- Product listings
- Search results
- Order history
- Review lists

---

## 7. Mobile-Specific Navigation

### Mobile Header Differences
- **Hamburger Menu** - Replaces desktop navigation
- **Mobile Search Bar** - Dedicated search section below header
- **Simplified Profile Menu** - Condensed account options

### Mobile-Specific Features
- **Swipe Gestures** - Card gallery navigation
- **Pull-to-Refresh** - List refreshing
- **Bottom Navigation** - Secondary navigation bar (if implemented)

### Mobile Layout Adaptations
- **Single Column** - Responsive grid layouts
- **Accordion Sections** - Collapsible content areas
- **Touch-Friendly** - Larger touch targets and spacing

---

## 8. Error States & Special Pages

### Error Pages
- **404 Not Found** - Missing pages/resources
- **Auth Errors** - Authentication failures
- **Cart Errors** - Checkout issues
- **Payment Errors** - Transaction problems

### Loading States
- **Page Skeletons** - Content loading animations
- **Progressive Loading** - Incremental content loading
- **Search Loading** - Search result loading states

### Empty States
- **Empty Cart** - No items in shopping cart
- **No Search Results** - Search yielded no results
- **Empty Wishlist** - No saved items
- **No Orders** - User has no order history

---

## 9. Integration Points

### External Services
- **TalkJS** - Real-time messaging system
- **Stripe Connect** - Payment processing
- **OAuth2 Providers** - Google, GitHub authentication
- **Algolia** - Search functionality
- **MinIO/S3** - Image and file storage

### API Endpoints
- **MercurJS Backend** - Commerce operations
- **Customer Backend** - TCG catalog and customer features
- **Authentication APIs** - User management
- **Search APIs** - Card and product search

---

## 10. SEO & Metadata

### Dynamic Metadata Generation
- **Card Pages** - Card name, set information, oracle text
- **Seller Pages** - Seller name, reputation, products
- **Deck Pages** - Deck name, creator, card list
- **Category Pages** - Category name, product count

### OpenGraph Support
- **Product Images** - Card images and product photos
- **Social Sharing** - Deck sharing, card sharing
- **Rich Previews** - Enhanced social media previews

---

## 11. Performance Considerations

### Code Splitting
- **Route-based** - Automatic Next.js code splitting
- **Component-based** - Lazy loading for heavy components
- **Modal Splitting** - Separate bundles for overlay components

### Caching Strategies
- **Static Generation** - Pre-generated pages where possible
- **ISR** - Incremental Static Regeneration for dynamic content
- **Client Caching** - Browser and service worker caching

---

## 12. Development & Debug Features

### Debug Mode (`/debug`)
**Development-only features**

**Features**:
- Error monitoring dashboard
- Performance metrics
- API endpoint testing
- Component state inspection

### Test Navigation (`/test-navigation`)
**Development navigation testing**

---

This comprehensive sitemap reflects the actual implemented structure of the SideDecked storefront as of September 2025. The navigation architecture supports a complex multi-game TCG marketplace with social features, deck building, and comprehensive commerce functionality.

**Key Architectural Features**:
- **Multi-game Support** - Universal TCG platform
- **Social Integration** - Community features and real-time messaging
- **Commerce Focus** - Full marketplace with seller tools
- **Mobile-First** - Responsive design throughout
- **Performance Optimized** - Modern web standards and caching
- **Extensible** - Modular component architecture for future expansion