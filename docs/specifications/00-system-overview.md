# SideDecked System Specifications Overview

> **BMAD Migration:** This legacy overview is retained for context. Refer to `docs/prd.md` for the current BMAD-aligned planning artifact.

## Purpose
This document provides an overview of all SideDecked system specifications and how they integrate to form a complete TCG marketplace platform. Each specification is written as a greenfield implementation guide optimized for Claude Code development while remaining accessible to Business Analysts and Product Owners.

## System Architecture
SideDecked follows a **split-brain architecture** with 10 core systems across 4 separate repositories:

### Repository Structure
- **Backend** (Port 9001): Commerce operations with MercurJS/Medusa
- **Customer-Backend** (Port 7000): TCG catalog, decks, community, pricing
- **Storefront** (Port 3000): Customer marketplace interface
- **Vendor Panel** (Port 5173): Vendor management tools

### Database Architecture
- **mercur-db**: Commerce, Payment, and Vendor management data
- **sidedecked-db**: TCG Catalog, Deck Builder, Community, and user-generated content

## System Specifications

### 1. Authentication & User Management System
**File**: `01-authentication-user-management-system.md`
**Purpose**: OAuth2 social login, user profiles, vendor verification, role-based access control
**Key Features**: Google/GitHub login, JWT sessions, vendor verification, profile management
**Database**: Both databases (user identity shared)

### 2. Commerce & Marketplace System
**File**: `02-commerce-marketplace-system.md`
**Purpose**: Product listings, multi-vendor checkout, order processing, reviews
**Key Features**: MercurJS integration, Stripe Connect payments, shipping, returns
**Database**: mercur-db (primary commerce operations)

### 3. TCG Catalog & Card Database System
**File**: `03-tcg-catalog-card-database-system.md`
**Purpose**: Universal card database, ETL pipeline, image management
**Key Features**: Multi-game support, automated data import, image CDN, search integration
**Database**: sidedecked-db (card catalog and metadata)

### 4. Vendor Management System
**File**: `04-vendor-management-system.md`
**Purpose**: Analytics, CSV import, pricing automation, financial reporting
**Key Features**: Performance dashboards, bulk inventory, automated pricing, market intelligence
**Database**: mercur-db (vendor business data)

### 5. Deck Building System
**File**: `05-deck-building-system.md`
**Purpose**: Multi-game deck builder, format validation, social sharing
**Key Features**: Drag-and-drop interface, format validation, collaboration, collection integration
**Database**: sidedecked-db (deck data and social features)

### 6. Community & Social System
**File**: `06-community-social-system.md`
**Purpose**: User profiles, messaging, forums, trading, local meetups
**Key Features**: Real-time messaging, forum discussions, community events, reputation system
**Database**: sidedecked-db (social and community data)

### 7. Pricing Intelligence System
**File**: `07-pricing-intelligence-system.md`
**Purpose**: Market analysis, AI predictions, portfolio tracking, price alerts
**Key Features**: Multi-source price data, machine learning predictions, portfolio management
**Database**: sidedecked-db (pricing and analytics data)

### 8. Search & Discovery System
**File**: `08-search-discovery-system.md`
**Purpose**: Universal search, personalized recommendations, voice/visual search
**Key Features**: Elasticsearch integration, AI recommendations, multi-modal search
**Database**: Both databases (federated search across all content)

### 9. Inventory Management System
**File**: `09-inventory-management-system.md`
**Purpose**: Multi-channel tracking, automated reordering, mobile management
**Key Features**: Real-time synchronization, intelligent reordering, mobile apps, analytics
**Database**: mercur-db (inventory and logistics data)

### 10. Payment Processing System
**File**: `10-payment-processing-system.md`
**Purpose**: Stripe Connect, escrow services, international payments, financial reporting
**Key Features**: Multi-vendor splits, escrow for high-value items, global payments
**Database**: mercur-db (financial and payment data)

## System Integration Map

### Data Flow
```
Authentication System → All Systems (user identity)
TCG Catalog → Commerce (product data)
TCG Catalog → Deck Builder (card data)
TCG Catalog → Search (indexed content)
Commerce → Payment (transaction processing)
Commerce → Inventory (stock management)
Vendor Management → Inventory (vendor operations)
Pricing Intelligence → Commerce (market data)
Community → Deck Builder (social features)
Search → All Systems (discovery)
```

### Key Integration Points
- **Authentication** provides user identity to all systems
- **TCG Catalog** serves as the foundation data source
- **Commerce & Inventory** work in tight coordination
- **Search** indexes data from all content systems
- **Payment** processes all financial transactions
- **Community** adds social layer to all features

## Technology Stack

### Core Technologies
- **Backend**: Node.js, Express.js, MercurJS/Medusa v2
- **Frontend**: Next.js 14, React 18, TypeScript
- **Databases**: PostgreSQL, Redis
- **Search**: Elasticsearch/Algolia
- **Payments**: Stripe Connect
- **Storage**: MinIO/S3
- **Email**: Resend

### External Integrations
- **OAuth2**: Google, GitHub
- **Shipping**: EasyPost, major carriers
- **Data Sources**: Scryfall, PokeAPI, YGOPRODECK
- **Analytics**: Custom analytics with machine learning
- **CDN**: CloudFlare for global performance

## Performance Targets

### Response Times
- API endpoints: < 100ms (95th percentile)
- Search queries: < 200ms
- Page loads: < 2 seconds
- Real-time features: < 100ms latency

### Scale Requirements
- 1M+ users
- 10M+ cards in catalog
- 100K+ concurrent sessions
- 1M+ transactions per month

## Security Standards

### Data Protection
- Encryption at rest and in transit
- PCI DSS compliance for payments
- GDPR compliance for user data
- Role-based access control

### Authentication Security
- OAuth2 with PKCE
- JWT with refresh tokens
- 2FA for high-value accounts
- Session management

## Quality Requirements

### Testing Standards
- 80% code coverage minimum
- TDD methodology required
- End-to-end testing for critical paths
- Performance testing under load

### Development Standards
- TypeScript strict mode
- ESLint and Prettier
- Conventional commits
- Pre-commit hooks

## Implementation Approach

### Phase-Based Development
Each system can be developed independently while maintaining integration points:

1. **Foundation Phase**: Authentication and TCG Catalog
2. **Commerce Phase**: Marketplace and Payment systems  
3. **Experience Phase**: Search, Community, and Deck Builder
4. **Intelligence Phase**: Pricing and advanced features
5. **Operations Phase**: Vendor Management and Inventory

### Integration Strategy
- API-first design for all systems
- Event-driven architecture for real-time features
- Shared data models for cross-system consistency
- Comprehensive integration testing

## Getting Started

### For Developers
1. Read the specific system specification you're implementing
2. Review the Technology Stack and Database Schema sections
3. Follow the User Stories and Acceptance Criteria
4. Implement API Endpoints as specified
5. Ensure all Business Rules are enforced
6. Add comprehensive testing per Testing Requirements

### For Business Analysts
1. Each specification includes Executive Summary for context
2. User Stories are written in plain English with business value
3. Business Rules section explains operational constraints
4. Integration Requirements show how systems work together

### For Product Owners
1. User Stories provide complete feature definitions
2. Acceptance Criteria define done conditions
3. Performance Requirements set quality expectations
4. Each system can be prioritized and delivered independently

## Documentation Standards

Each specification follows a consistent structure:
- **Executive Summary**: Business context and purpose
- **User Stories & Acceptance Criteria**: Detailed feature requirements
- **Technical Requirements**: Implementation details
- **Business Rules**: Operational constraints
- **Integration Requirements**: System interconnections
- **Performance Requirements**: Quality targets
- **Security Requirements**: Protection standards
- **Testing Requirements**: Quality assurance approach

This ensures consistency across all systems while providing complete implementation guidance for developers and clear business understanding for stakeholders.
