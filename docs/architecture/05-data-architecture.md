# SideDecked Data Architecture

**Version**: 3.0  
**Last Updated**: 2025-09-12  
**Author**: SideDecked Architecture Team  
**Reviewers**: [Development Team, Database Team]  
**Status**: Approved

## Overview

This document defines the comprehensive data architecture for the SideDecked platform, including split-brain database design, universal TCG data models, performance optimization strategies, and implementation patterns. The architecture supports a community-driven trading card marketplace for Magic: The Gathering, Pokémon, Yu-Gi-Oh!, and One Piece cards.

## 🏗️ Split-Brain Architecture Overview

SideDecked implements a **split-brain architecture** that strictly separates commerce operations from customer experience features across multiple specialized repositories and databases.

### Repository Structure

```
sidedecked/                           # Main project folder (NOT a git repo)
├── backend/                          # 🏪 COMMERCE - MercurJS Backend
│   ├── .git/                         # Independent git repository
│   ├── database: mercur-db           # Commerce operations only
│   └── purpose: Orders, payments, vendors, marketplace transactions
│
├── customer-backend/                 # 🎮 CUSTOMER - Data & APIs Monorepo
│   ├── .git/                         # Independent git repository  
│   ├── database: sidedecked-db       # Customer experience data
│   ├── packages/                     # Modular customer feature packages
│   ├── apps/api/                     # Customer backend API server
│   └── purpose: TCG catalog, decks, community, pricing intelligence
│
├── storefront/                       # 🌐 UI - Customer Frontend
│   ├── .git/                         # Independent git repository
│   ├── consumes: backend + customer-backend APIs
│   └── purpose: Complete customer UI experience
│
└── vendorpanel/                      # 👥 UI - Vendor Frontend  
    ├── .git/                         # Independent git repository
    ├── consumes: backend API only
    └── purpose: Vendor management and operations
```

## 🗄️ Database Split-Brain Design

### Core Design Principles

1. **Complete Data Isolation**: No direct database connections between domains
2. **Universal Base Schema**: Common attributes for all TCGs in dedicated columns
3. **Game-Specific Extensions**: Flexible JSONB fields for unique game attributes
4. **Performance-First**: Strategic indexing and materialized views for sub-100ms queries
5. **SKU Standardization**: Universal format supporting all games and conditions
6. **Event-Driven Sync**: Cross-domain communication via APIs and events

### Database Separation Rules

**CRITICAL**: These databases are completely separate and never share data directly.

#### mercur-db (Commerce Backend)
```sql
-- 🏪 COMMERCE OPERATIONS ONLY
orders, order_items, payments, carts
customers, customer_auth, addresses  
vendors, vendor_verification, vendor_products
marketplace_transactions, payouts, commissions
shipping, fulfillment, returns
reviews, ratings, seller_feedback
product_catalog_matches  -- Links to sidedecked-db SKUs
```

#### sidedecked-db (Customer Backend)  
```sql
-- 🎮 CUSTOMER EXPERIENCE ONLY
-- TCG Catalog System
games, cards, prints, card_sets, catalog_skus, etl_jobs

-- Deck Builder System  
decks, deck_cards, formats, user_collections

-- Community System
user_profiles, user_follows, activities
conversations, messages, forum_categories, forum_topics, forum_posts

-- Pricing Intelligence
price_history, market_prices, price_alerts, price_predictions
portfolios, portfolio_holdings, portfolio_transactions
```

### Data Flow Rules
- ❌ **NEVER**: Direct database connections between domains
- ✅ **ALWAYS**: Cross-domain communication via APIs
- ✅ **REQUIRED**: Data synchronization through event-driven patterns
- ✅ **ENFORCE**: Single source of truth per data entity

## 📦 Universal TCG Data Model

### Games Table
Defines the four supported TCGs with their unique mechanics:

```sql
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL, -- MTG, POKEMON, YUGIOH, OPTCG
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    
    -- Game mechanics flags
    has_colors BOOLEAN DEFAULT false,        -- MTG
    has_energy_types BOOLEAN DEFAULT false,  -- Pokemon
    has_power_toughness BOOLEAN DEFAULT false, -- MTG, YGO
    has_levels BOOLEAN DEFAULT false,        -- YGO/MTG
    
    -- ETL configuration
    etl_enabled BOOLEAN DEFAULT true,
    etl_source VARCHAR(100),
    last_etl_run TIMESTAMP,
    
    -- Display configuration
    card_back_image VARCHAR(500),
    primary_color VARCHAR(20),
    logo_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- Insert supported games
INSERT INTO games (code, name, display_name, has_colors, has_power_toughness, etl_enabled, etl_source) VALUES
('MTG', 'Magic: The Gathering', 'Magic', true, true, true, 'scryfall'),
('POKEMON', 'Pokémon Trading Card Game', 'Pokémon', false, false, true, 'pokemon-tcg-api'),
('YUGIOH', 'Yu-Gi-Oh! Trading Card Game', 'Yu-Gi-Oh!', false, true, true, 'ygoprodeck'),
('OPTCG', 'One Piece Card Game', 'One Piece', false, true, true, 'one-piece-api');
```

### Cards Table (Universal Oracle)
Core card identity across all printings:

```sql
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) NOT NULL,
    
    -- Universal identity
    oracle_id VARCHAR(500) UNIQUE,
    name VARCHAR(500) NOT NULL,
    normalized_name VARCHAR(500) NOT NULL,
    
    -- Universal attributes
    primary_type VARCHAR(100),
    subtypes TEXT[],
    supertypes TEXT[],
    
    -- Rules text
    oracle_text TEXT,
    flavor_text TEXT,
    keywords TEXT[],
    
    -- Universal power system
    power_value INTEGER,  -- Attack/Power/ATK
    defense_value INTEGER, -- Toughness/HP/DEF
    
    -- MTG specific
    mana_cost VARCHAR(100),
    mana_value INTEGER,
    colors TEXT[],
    color_identity TEXT[],
    
    -- Pokemon specific
    hp INTEGER,
    retreat_cost INTEGER,
    energy_types TEXT[],
    
    -- Yu-Gi-Oh! specific
    attribute VARCHAR(20),
    level INTEGER,
    rank INTEGER,
    attack_value INTEGER,
    defense_value_yugioh INTEGER,
    
    -- One Piece specific
    cost INTEGER,
    power INTEGER,
    counter INTEGER,
    life INTEGER,
    
    -- Game-specific data (flexible JSONB)
    game_data JSONB DEFAULT '{}',
    
    -- Search optimization
    popularity_score DECIMAL DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_searches INTEGER DEFAULT 0,
    
    -- Full-text search vector
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', 
            name || ' ' || 
            COALESCE(oracle_text, '') || ' ' ||
            COALESCE(array_to_string(subtypes, ' '), '') || ' ' ||
            COALESCE(array_to_string(keywords, ' '), '')
        )
    ) STORED,
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_cards_game_id ON cards(game_id);
CREATE INDEX idx_cards_name_trgm ON cards USING gin(name gin_trgm_ops);
CREATE INDEX idx_cards_normalized_name_trgm ON cards USING gin(normalized_name gin_trgm_ops);
CREATE INDEX idx_cards_search ON cards USING GIN(search_vector);
CREATE INDEX idx_cards_game_type ON cards(game_id, primary_type);
CREATE INDEX idx_cards_power_defense ON cards(power_value, defense_value) 
    WHERE power_value IS NOT NULL;
CREATE INDEX idx_cards_mana_value ON cards(mana_value) WHERE mana_value IS NOT NULL;
CREATE INDEX idx_cards_colors ON cards USING gin(colors) WHERE colors IS NOT NULL;
CREATE INDEX idx_cards_popularity_score ON cards(popularity_score DESC);
```

### Game-Specific Data Examples

```json
-- MTG Card
{
  "mana_cost": "3R",
  "mana_value": 4,
  "colors": ["Red"],
  "color_identity": ["R"],
  "keywords": ["Haste", "Trample"],
  "layout": "normal",
  "frame": "2015",
  "border_color": "black"
}

-- Pokemon Card  
{
  "hp": 120,
  "retreat_cost": 2,
  "energy_types": ["Fire"],
  "evolves_from": "Charmeleon",
  "attacks": [
    {
      "name": "Fire Blast", 
      "cost": ["Fire", "Fire"],
      "damage": 90,
      "text": "Discard an Energy card attached to this Pokémon."
    }
  ],
  "weaknesses": [{"type": "Water", "value": "×2"}],
  "resistances": [{"type": "Fighting", "value": "-30"}]
}

-- Yu-Gi-Oh Card
{
  "attribute": "FIRE",
  "level": 4,
  "attack": 1800,
  "defense": 1000,
  "monster_type": "Dragon",
  "card_type": "Effect Monster",
  "archetype": "Blue-Eyes"
}

-- One Piece Card
{
  "cost": 4,
  "power": 5000,
  "counter": 1000,
  "color": ["Red"],
  "type": ["Character"],
  "attribute": ["Slash"],
  "effect": "[On Play] Give up to 1 of your opponent's Characters -2000 power during this turn."
}
```

### Card Sets Table

```sql
CREATE TABLE card_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) NOT NULL,
    
    -- Set identification
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    
    -- Set metadata
    release_date DATE,
    block_code VARCHAR(50),
    type VARCHAR(50), -- expansion, core, masters, etc.
    
    -- Set stats
    total_cards INTEGER,
    total_unique_cards INTEGER,
    
    -- Images
    icon_svg_uri VARCHAR(500),
    logo_uri VARCHAR(500),
    
    -- ETL metadata
    etl_source VARCHAR(100),
    etl_last_updated TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP,
    
    UNIQUE(game_id, code)
);

CREATE INDEX idx_card_sets_game_code ON card_sets(game_id, code);
CREATE INDEX idx_card_sets_release_date ON card_sets(release_date DESC);
```

### Prints Table
Game-specific card printings and variants:

```sql
CREATE TABLE prints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES cards(id) NOT NULL,
    set_id UUID REFERENCES card_sets(id) NOT NULL,
    
    -- Print identification
    number VARCHAR(50),
    rarity VARCHAR(50),
    artist VARCHAR(200),
    language VARCHAR(10) DEFAULT 'en',
    
    -- Images and assets
    image_small VARCHAR(500),
    image_normal VARCHAR(500),
    image_large VARCHAR(500),
    image_art_crop VARCHAR(500),
    image_border_crop VARCHAR(500),
    blurhash VARCHAR(255),
    
    -- Print-specific attributes
    finish VARCHAR(50) DEFAULT 'normal', -- normal, foil, etched, etc.
    variation VARCHAR(100),
    frame VARCHAR(50),
    border_color VARCHAR(50),
    
    -- Format legality (MTG specific)
    is_legal_standard BOOLEAN DEFAULT false,
    is_legal_pioneer BOOLEAN DEFAULT false,
    is_legal_modern BOOLEAN DEFAULT false,
    is_legal_legacy BOOLEAN DEFAULT false,
    is_legal_vintage BOOLEAN DEFAULT false,
    is_legal_commander BOOLEAN DEFAULT false,
    
    -- External IDs for data sources
    tcgplayer_id VARCHAR(50),
    cardmarket_id VARCHAR(50),
    scryfall_id VARCHAR(50),
    pokemon_tcg_id VARCHAR(50),
    ygoprodeck_id VARCHAR(50),
    
    -- Pricing cache (updated from external sources)
    current_price_low DECIMAL(10,2),
    current_price_mid DECIMAL(10,2),
    current_price_high DECIMAL(10,2),
    price_updated_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- Indexes for efficient queries
CREATE INDEX idx_prints_card_id ON prints(card_id);
CREATE INDEX idx_prints_set_id ON prints(set_id);
CREATE INDEX idx_prints_rarity ON prints(rarity);
CREATE INDEX idx_prints_finish ON prints(finish);
CREATE INDEX idx_prints_language ON prints(language);
CREATE INDEX idx_prints_external_ids ON prints(tcgplayer_id, cardmarket_id, scryfall_id);
```

### Universal SKU System

**Format**: `{GAME}-{SET}-{NUMBER}-{LANG}-{CONDITION}-{FINISH}[-{GRADE}]`

**Examples**:
- `MTG-NEO-001-EN-NM-FOIL`
- `POKEMON-CRZ-025-JP-LP-NORMAL-PSA9`
- `YUGIOH-ROTD-045-EN-NM-1ST`
- `OPTCG-OP01-001-EN-NM-NORMAL`

```sql
CREATE TABLE catalog_skus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    print_id UUID REFERENCES prints(id) NOT NULL,
    
    -- Universal SKU
    sku VARCHAR(200) UNIQUE NOT NULL,
    
    -- Components (denormalized for performance)
    game_code VARCHAR(20) NOT NULL,
    set_code VARCHAR(50) NOT NULL,
    card_number VARCHAR(50) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    condition VARCHAR(10) NOT NULL, -- NM, LP, MP, HP, DMG
    finish VARCHAR(20) NOT NULL DEFAULT 'normal',
    
    -- Grading (optional)
    grade VARCHAR(10),
    grading_company VARCHAR(20), -- PSA, BGS, CGC, etc.
    
    -- Market tracking
    is_available_b2c BOOLEAN DEFAULT false,
    is_available_c2c BOOLEAN DEFAULT false,
    vendor_count INTEGER DEFAULT 0,
    consumer_seller_count INTEGER DEFAULT 0,
    total_listings INTEGER DEFAULT 0,
    
    -- Price aggregation
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    avg_price DECIMAL(10,2),
    median_price DECIMAL(10,2),
    market_price DECIMAL(10,2),
    price_trend VARCHAR(20) DEFAULT 'stable', -- up, down, stable
    price_updated_at TIMESTAMP,
    
    -- Popularity metrics
    view_count INTEGER DEFAULT 0,
    search_count INTEGER DEFAULT 0,
    deck_usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- Indexes for SKU operations
CREATE INDEX idx_catalog_skus_sku ON catalog_skus(sku);
CREATE INDEX idx_catalog_skus_print_id ON catalog_skus(print_id);
CREATE INDEX idx_catalog_skus_game_code ON catalog_skus(game_code);
CREATE INDEX idx_catalog_skus_set_code ON catalog_skus(set_code);
CREATE INDEX idx_catalog_skus_condition ON catalog_skus(condition);
CREATE INDEX idx_catalog_skus_finish ON catalog_skus(finish);
CREATE INDEX idx_catalog_skus_price_range ON catalog_skus(min_price, max_price);
CREATE INDEX idx_catalog_skus_availability ON catalog_skus(is_available_b2c, is_available_c2c);
CREATE INDEX idx_catalog_skus_popularity ON catalog_skus(view_count DESC, deck_usage_count DESC);
```

## 🔗 Cross-Database Integration

Since databases are separate, integration happens through:

1. **Shared Customer IDs**: Customer entities exist in both databases, linked by ID
2. **API Integration**: REST calls between backend and customer-backend
3. **Event-Driven Updates**: Webhook/event publishing for real-time sync
4. **Storefront Aggregation**: Frontend combines data from both APIs
5. **Consumer Seller Bridge**: Seamless customer-to-seller upgrades via Medusa infrastructure

### Product-to-Catalog SKU Matching

Automatic linking of all seller products (vendor and consumer) to catalog SKUs:

```sql
-- In mercur-db (commerce backend)
CREATE TABLE product_catalog_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_variant_id UUID REFERENCES product_variants(id) NOT NULL,
    catalog_sku VARCHAR(200) NOT NULL, -- References catalog_skus.sku in sidedecked-db
    
    -- Match confidence and method
    match_method VARCHAR(50) NOT NULL, -- exact, fuzzy, manual, ml, consumer_selected
    confidence_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    matched_fields JSONB DEFAULT '{}', -- {"name": 0.95, "set": 1.0}
    
    -- Seller context
    seller_id UUID NOT NULL,
    seller_type VARCHAR(20) NOT NULL, -- 'business_vendor' or 'consumer_seller'
    
    -- Validation status
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID, -- admin user ID
    verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    UNIQUE(product_variant_id, catalog_sku)
);

CREATE INDEX idx_product_catalog_matches_sku ON product_catalog_matches(catalog_sku);
CREATE INDEX idx_product_catalog_matches_product ON product_catalog_matches(product_variant_id);
CREATE INDEX idx_product_catalog_matches_seller ON product_catalog_matches(seller_id, seller_type);
```

### Consumer Seller Integration

Consumer sellers leverage Medusa's seller infrastructure with simplified workflows:

```sql
-- Enhanced seller profile for consumer sellers
-- (Extends existing Medusa seller table)
ALTER TABLE sellers ADD COLUMN seller_tier VARCHAR(20) DEFAULT 'business';
-- seller_tier: 'business' | 'consumer'

ALTER TABLE sellers ADD COLUMN auto_setup_enabled BOOLEAN DEFAULT false;
-- For streamlined consumer seller onboarding

ALTER TABLE sellers ADD COLUMN mobile_optimized BOOLEAN DEFAULT false;
-- Mobile-first interface for consumer sellers

ALTER TABLE sellers ADD COLUMN trust_score DECIMAL(3,2) DEFAULT 0.00;
-- Reputation score for consumer sellers

ALTER TABLE sellers ADD COLUMN total_sales INTEGER DEFAULT 0;
-- Sales count for reputation building
```

## 📦 Customer-Backend Monorepo Structure

### Package Architecture

```
customer-backend/
├── packages/                         # Shared packages
│   ├── types/                        # TypeScript definitions
│   │   ├── src/common.ts             # Shared types
│   │   ├── src/tcg.ts                # TCG-specific types
│   │   ├── src/deck.ts               # Deck builder types
│   │   ├── src/community.ts          # Social feature types
│   │   └── src/pricing.ts            # Pricing intelligence types
│   │
│   ├── tcg-catalog/                  # Universal TCG card database
│   │   ├── src/entities/             # Card, Print, Set entities
│   │   ├── src/services/             # ETL, search, catalog services
│   │   ├── src/etl/                  # ETL pipelines for each game
│   │   └── src/search/               # Search optimization
│   │
│   ├── deck-builder/                 # Deck management and validation
│   │   ├── src/entities/             # Deck, DeckCard entities
│   │   ├── src/validators/           # Format-specific validation
│   │   ├── src/services/             # Deck operations
│   │   └── src/formats/              # Game format definitions
│   │
│   ├── community/                    # Social features and forums
│   │   ├── src/entities/             # UserProfile, Activity entities
│   │   ├── src/services/             # Social interaction services
│   │   ├── src/messaging/            # Real-time messaging
│   │   └── src/forums/               # Forum functionality
│   │
│   ├── pricing/                      # Price intelligence
│   │   ├── src/entities/             # Price history, alerts
│   │   ├── src/services/             # Price tracking, predictions
│   │   ├── src/scrapers/             # External price sources
│   │   └── src/analytics/            # Market analysis
│   │
│   └── shared/                       # Common utilities
│       ├── src/utils/                # Helper functions
│       ├── src/middleware/           # Express middleware
│       ├── src/validators/           # Data validation
│       └── src/cache/                # Caching utilities
│
├── apps/
│   └── api/                          # Customer backend API server
│       ├── src/entities/             # TypeORM entities
│       ├── src/services/             # Business logic
│       ├── src/controllers/          # API endpoints
│       ├── src/migrations/           # Database migrations
│       ├── src/config/               # Configuration
│       └── src/index.ts              # Main server entry point
│
├── lerna.json                        # Monorepo configuration
├── package.json                      # Workspace management
└── tsconfig.json                     # Shared TypeScript config
```

### Package Dependencies

```typescript
// Internal package dependencies
@sidedecked/types         → Base types for all packages
@sidedecked/tcg-catalog   → Depends on @sidedecked/types
@sidedecked/deck-builder  → Depends on @sidedecked/types, @sidedecked/tcg-catalog
@sidedecked/community     → Depends on @sidedecked/types
@sidedecked/pricing       → Depends on @sidedecked/types, @sidedecked/tcg-catalog
@sidedecked/shared        → Utility functions, shared across all packages

// API Server Dependencies
apps/api                  → Uses ALL packages for complete functionality
```

## 🔗 API Integration Patterns

### Storefront Data Flow

The storefront is the **only** application that consumes both APIs to create a unified customer experience:

```typescript
// Example: Product page integration with Consumer Seller support
export class ProductService {
  async getEnrichedProduct(productId: string) {
    // 1. Get commerce data from backend (vendor or consumer seller)
    const product = await this.commerceAPI.getProduct(productId)
    
    // 2. Get card details from customer-backend  
    const cardDetails = await this.customerAPI.getCardBySKU(product.sku)
    
    // 3. Get pricing data from customer-backend
    const priceHistory = await this.customerAPI.getPriceHistory(cardDetails.printId)
    
    // 4. Get seller information (handles both tiers)
    const sellerInfo = await this.commerceAPI.getSellerInfo(product.seller_id)
    
    // 5. Combine for rich product experience
    return {
      ...product,           // Commerce: price, seller, availability
      cardDetails,          // Customer: game rules, art, rarity
      priceHistory,         // Customer: market trends, predictions
      deckUsage: await this.customerAPI.getDeckUsage(cardDetails.id),
      seller: {
        ...sellerInfo,
        tier: sellerInfo.seller_tier,
        trustScore: await this.commerceAPI.getSellerTrustScore(product.seller_id),
        isConsumerSeller: sellerInfo.seller_tier === 'consumer'
      }
    }
  }

  // Example: Consumer Seller listing creation
  async createConsumerSellerListing(catalogSku: string, listingData: ConsumerListingData) {
    // 1. Get card data from customer-backend
    const cardData = await this.customerAPI.getCardBySKU(catalogSku)
    
    // 2. Create Medusa product variant in commerce backend
    const productVariant = await this.commerceAPI.createProductVariant({
      seller_id: listingData.seller_id,
      sku: catalogSku,
      title: `${cardData.card.name} - ${listingData.condition}`,
      condition: listingData.condition,
      price: listingData.price,
      inventory_quantity: 1,
      images: listingData.images,
      metadata: {
        catalog_sku: catalogSku,
        card_name: cardData.card.name,
        set_name: cardData.print.set.name,
        seller_type: 'consumer_seller'
      }
    })
    
    // 3. Create product-catalog match
    await this.commerceAPI.createProductCatalogMatch({
      product_variant_id: productVariant.id,
      catalog_sku: catalogSku,
      match_method: 'consumer_selected',
      confidence_score: 1.0,
      seller_id: listingData.seller_id,
      seller_type: 'consumer_seller'
    })
    
    return productVariant
  }
}
```

### Backend-to-Customer-Backend Communication

```typescript
// Commerce backend calls customer-backend for enrichment
export class ProductEnrichmentService {
  constructor(
    private readonly customerAPI: CustomerBackendClient,
    private readonly medusaQuery: MedusaQueryService
  ) {}

  async enrichProductWithCardData(productSKU: string) {
    try {
      // Call customer-backend API to get card information
      const response = await this.customerAPI.get(
        `/api/catalog/by-sku/${productSKU}`
      )
      return response.data
    } catch (error) {
      this.logger.error('Failed to enrich product with card data', {
        sku: productSKU,
        error: error.message
      })
      return null // Graceful degradation
    }
  }
  
  async getAvailableListings(catalogSku: string) {
    // Get both vendor and consumer seller listings
    const [vendorListings, consumerListings] = await Promise.all([
      this.getVendorListings(catalogSku),
      this.getConsumerSellerListings(catalogSku)
    ])
    
    return {
      vendor: vendorListings,
      consumer_seller: consumerListings,
      total_available: vendorListings.length + consumerListings.length
    }
  }
  
  private async getVendorListings(catalogSku: string) {
    // Query Medusa backend for business vendor products
    return await this.medusaQuery.graph({
      entity: 'product_variant',
      fields: ['id', 'price', 'inventory_quantity', 'seller.id', 'seller.store_name'],
      filters: {
        sku: catalogSku,
        'seller.seller_tier': 'business'
      }
    })
  }
  
  private async getConsumerSellerListings(catalogSku: string) {
    // Query Medusa backend for consumer seller products
    return await this.medusaQuery.graph({
      entity: 'product_variant',
      fields: ['id', 'price', 'inventory_quantity', 'seller.id', 'seller.handle'],
      filters: {
        sku: catalogSku,
        'seller.seller_tier': 'consumer'
      }
    })
  }
}
```

### Event-Driven Integration

```typescript
// Commerce events trigger customer-backend updates
export class EventBus {
  // Commerce backend publishes events
  async publishCustomerCreated(data: CustomerCreatedEvent) {
    await this.publish('customer.created', { 
      customerId: data.customerId, 
      email: data.email, 
      profile: data.profile 
    })
  }

  async publishOrderCompleted(data: OrderCompletedEvent) {
    await this.publish('order.completed', { 
      customerId: data.customerId, 
      items: data.items, 
      total: data.total, 
      sellerInfo: data.sellerInfo 
    })
  }

  async publishConsumerSellerCreated(data: ConsumerSellerCreatedEvent) {
    await this.publish('consumer_seller.created', { 
      sellerId: data.sellerId, 
      customerId: data.customerId, 
      tier: 'consumer' 
    })
  }

  async publishProductListed(data: ProductListedEvent) {
    await this.publish('product.listed', { 
      productId: data.productId, 
      catalogSku: data.catalogSku, 
      sellerId: data.sellerId, 
      sellerTier: data.sellerTier 
    })
  }
}

// Customer-backend subscribes and updates
export class CustomerEventHandler {
  @Subscribe('customer.created')
  async handleCustomerCreated(data: CustomerCreatedEvent): Promise<void> {
    await this.userProfileService.createProfile(data.customerId, data.profile)
  }

  @Subscribe('order.completed')
  async handleOrderCompleted(data: OrderCompletedEvent): Promise<void> {
    await this.activityService.recordPurchase(data.customerId, data.items)
    
    // Track sales for both vendor and consumer sellers
    if (data.sellerInfo) {
      await this.activityService.recordSale({
        sellerId: data.sellerInfo.id,
        sellerType: data.sellerInfo.tier,
        items: data.items,
        total: data.total
      })
    }
  }

  @Subscribe('consumer_seller.created')
  async handleConsumerSellerCreated(data: ConsumerSellerCreatedEvent): Promise<void> {
    // Create seller profile in customer-backend for community features
    await this.userProfileService.upgradeToSeller({
      customerId: data.customerId,
      sellerId: data.sellerId,
      sellerTier: data.tier
    })
  }

  @Subscribe('product.listed')
  async handleProductListed(data: ProductListedEvent): Promise<void> {
    // Update catalog availability tracking
    await this.catalogService.updateSkuAvailability({
      catalogSku: data.catalogSku,
      sellerId: data.sellerId,
      sellerTier: data.sellerTier,
      available: true
    })
  }
}
```

## 🛡️ Data Integrity and Consistency

### Reference Management

```typescript
// Customer and seller references are maintained as strings in customer-backend
interface UserProfile {
  customer_id: string     // References customers.id in mercur-db
  seller_id?: string      // References sellers.id in mercur-db (if user is also a seller)
  username: string        // Customer-backend specific data
  bio?: string           // Customer-backend specific data
  seller_tier?: 'business' | 'consumer'  // If seller_id exists
  seller_verified: boolean // Seller verification status
}

interface Deck {
  user_id: string        // References customers.id in mercur-db  
  name: string           // Customer-backend specific data
  cards: DeckCard[]      // Customer-backend specific data
}

interface Activity {
  user_id: string        // References customers.id in mercur-db
  type: 'purchase' | 'sale' | 'listing_created' | 'deck_shared'
  
  // For seller activities
  seller_context?: {
    seller_id: string    // References sellers.id in mercur-db
    seller_tier: 'business' | 'consumer'
    product_id?: string  // References products.id in mercur-db
  }
}
```

### Data Consistency Patterns

#### Strong Consistency (ACID Transactions)
```sql
-- Example: Order creation with inventory updates
BEGIN;
    -- Create order
    INSERT INTO orders (customer_id, total, currency) 
    VALUES ($1, $2, $3) RETURNING id;
    
    -- Create order items and update inventory
    WITH order_items AS (
        INSERT INTO order_items (order_id, variant_id, quantity, unit_price)
        SELECT $4, variant_id, quantity, unit_price FROM unnest($5::order_item[])
        RETURNING variant_id, quantity
    )
    UPDATE product_variants pv
    SET inventory_quantity = inventory_quantity - oi.quantity
    FROM order_items oi
    WHERE pv.id = oi.variant_id
    AND pv.inventory_quantity >= oi.quantity;
    
    -- Fail if insufficient inventory
    IF NOT FOUND THEN
        ROLLBACK;
        RAISE EXCEPTION 'Insufficient inventory';
    END IF;
COMMIT;
```

#### Eventual Consistency (Event-Driven)
```typescript
// Example: User profile synchronization
export class UserProfileSyncService {
  async handleCustomerUpdated(event: CustomerUpdatedEvent): Promise<void> {
    try {
      const profile = await this.userProfileRepo.findByCustomerId(
        event.customerId
      )
      
      if (profile) {
        await this.userProfileRepo.update(profile.id, {
          email: event.email,
          displayName: `${event.firstName} ${event.lastName}`.trim(),
          lastSynced: new Date()
        })
      }
      
      // Acknowledge event processing
      await this.eventBus.ack(event.id)
      
    } catch (error) {
      // Dead letter queue for failed events
      await this.eventBus.deadLetter(event.id, error.message)
    }
  }
}
```

### Consistency Strategies

1. **Eventual Consistency**: Accept temporary inconsistencies, sync via events
2. **Read-Heavy Optimization**: Cache frequently accessed cross-service data
3. **Graceful Degradation**: Handle service unavailability gracefully
4. **Compensating Transactions**: Implement rollback strategies for failures

## 📊 Performance Optimizations

### Query Performance Targets

| Operation | Target | Implementation |
|-----------|--------|----------------|
| Card Search | < 50ms | Full-text search with GIN indexes |
| Deck Load | < 30ms | Optimized joins with selective loading |
| User Decks | < 25ms | Compound indexes on user_id |
| Price Lookup | < 20ms | Cached aggregations |

### Strategic Indexes

```sql
-- sidedecked-db: Optimized for search and analytics
-- Full-text search indexes
CREATE INDEX idx_cards_name_trgm ON cards USING gin(name gin_trgm_ops);
CREATE INDEX idx_cards_normalized_name_trgm ON cards USING gin(normalized_name gin_trgm_ops);
CREATE INDEX idx_cards_search ON cards USING GIN(search_vector);

-- Query optimization indexes
CREATE INDEX idx_cards_game_id ON cards(game_id);
CREATE INDEX idx_cards_primary_type ON cards(primary_type);
CREATE INDEX idx_cards_colors ON cards USING gin(colors);
CREATE INDEX idx_cards_mana_value ON cards(mana_value);
CREATE INDEX idx_cards_popularity_score ON cards(popularity_score DESC);

-- Print and SKU indexes
CREATE INDEX idx_prints_card_id ON prints(card_id);
CREATE INDEX idx_prints_set_id ON prints(set_id);
CREATE INDEX idx_prints_rarity ON prints(rarity);
CREATE INDEX idx_prints_finish ON prints(finish);
CREATE INDEX idx_prints_language ON prints(language);

CREATE INDEX idx_catalog_skus_sku ON catalog_skus(sku);
CREATE INDEX idx_catalog_skus_print_id ON catalog_skus(print_id);
CREATE INDEX idx_catalog_skus_game_code ON catalog_skus(game_code);
CREATE INDEX idx_catalog_skus_condition ON catalog_skus(condition);
CREATE INDEX idx_catalog_skus_price_range ON catalog_skus(min_price, max_price);

-- Deck builder indexes
CREATE INDEX idx_decks_user_game_format 
ON decks(user_id, game, format) 
WHERE is_archived = false;

CREATE INDEX idx_public_decks_popular 
ON decks(total_views DESC, created_at DESC) 
WHERE is_public = true AND is_archived = false;

-- mercur-db: Optimized for transactions and payments
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX idx_payments_vendor_date ON payments(vendor_id, created_at);
CREATE INDEX idx_product_catalog_matches_sku ON product_catalog_matches(catalog_sku);
CREATE INDEX idx_product_catalog_matches_product ON product_catalog_matches(product_variant_id);
```

### Materialized Views

```sql
-- High-performance search view
CREATE MATERIALIZED VIEW card_search_view AS
SELECT 
    c.id, c.name, c.normalized_name,
    g.code as game_code, g.name as game_name,
    c.primary_type, c.subtypes, c.oracle_text, c.keywords,
    c.mana_cost, c.mana_value, c.colors,
    c.power_value, c.defense_value,
    -- Aggregated set information
    array_agg(DISTINCT s.name) as set_names,
    array_agg(DISTINCT p.rarity) as rarities,
    array_agg(DISTINCT p.artist) as artists,
    -- Market data
    MIN(sku.min_price) as min_price,
    MAX(sku.max_price) as max_price,
    AVG(sku.avg_price) as avg_price,
    bool_or(sku.is_available_b2c) as has_b2c,
    bool_or(sku.is_available_c2c) as has_c2c,
    -- Popularity metrics
    c.total_views, c.total_searches
FROM cards c
JOIN games g ON c.game_id = g.id
LEFT JOIN prints p ON p.card_id = c.id
LEFT JOIN card_sets s ON p.set_id = s.id
LEFT JOIN catalog_skus sku ON sku.print_id = p.id
WHERE c.deleted_at IS NULL
GROUP BY c.id, g.id;

-- Deck statistics materialized view
CREATE MATERIALIZED VIEW deck_statistics AS
SELECT 
    d.id as deck_id,
    COUNT(dc.id) as total_cards,
    SUM(dc.quantity) as total_quantity,
    AVG(sku.market_price * dc.quantity) as estimated_value,
    COUNT(DISTINCT c.primary_type) as type_diversity,
    AVG(c.mana_value) as avg_mana_value
FROM decks d
LEFT JOIN deck_cards dc ON d.id = dc.deck_id
LEFT JOIN cards c ON dc.card_id = c.id
LEFT JOIN prints p ON dc.print_id = p.id
LEFT JOIN catalog_skus sku ON sku.print_id = p.id
GROUP BY d.id;

-- Refresh functions
CREATE OR REPLACE FUNCTION refresh_card_search_view()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY card_search_view;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_deck_statistics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY deck_statistics;
END;
$$ LANGUAGE plpgsql;
```

### Multi-Layer Caching Strategy

```typescript
export class DataCacheService {
  
  /**
   * L1: Application Memory (< 1ms)
   * L2: Redis Cache (< 5ms)  
   * L3: Database (< 50ms)
   */
  async getCachedData<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    
    // L1: Check application memory
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)
    }
    
    // L2: Check Redis
    const cached = await this.redis.get(key)
    if (cached) {
      const data = JSON.parse(cached)
      this.memoryCache.set(key, data, options.l1TTL)
      return data
    }
    
    // L3: Fetch from database
    const data = await fetchFunction()
    
    // Store in all cache layers
    await this.redis.setex(key, options.l2TTL, JSON.stringify(data))
    this.memoryCache.set(key, data, options.l1TTL)
    
    return data
  }
}

// Cache configuration by data type
const CACHE_CONFIGS = {
  // Static reference data - long TTL
  GAMES: { l1TTL: 3600, l2TTL: 86400 }, // 1h / 24h
  CARD_SETS: { l1TTL: 1800, l2TTL: 43200 }, // 30m / 12h
  
  // Dynamic user data - short TTL
  USER_PROFILES: { l1TTL: 300, l2TTL: 1800 }, // 5m / 30m
  DECK_DATA: { l1TTL: 180, l2TTL: 900 }, // 3m / 15m
  
  // Market data - very short TTL
  PRICES: { l1TTL: 60, l2TTL: 300 }, // 1m / 5m
  INVENTORY: { l1TTL: 30, l2TTL: 120 } // 30s / 2m
}

// Multi-level caching for cross-service data
export class ProductEnrichmentService {
  async getEnrichedProduct(productId: string) {
    // 1. Check Redis cache
    const cached = await this.redis.get(`enriched:product:${productId}`)
    if (cached) return JSON.parse(cached)
    
    // 2. Fetch from both services
    const [product, cardData] = await Promise.all([
      this.commerceAPI.getProduct(productId),
      this.customerAPI.getCardBySKU(product.sku)
    ])
    
    // 3. Cache result
    const enriched = { ...product, cardData }
    await this.redis.setex(`enriched:product:${productId}`, 3600, JSON.stringify(enriched))
    
    return enriched
  }
}
```

## 🔄 Data Migration Patterns

### Schema Evolution Strategy

```sql
-- Migration pattern for adding new game support
-- Migration: 001_add_optcg_game.sql

-- Add new game to enum (safe addition)
ALTER TYPE game_type ADD VALUE 'OPTCG';

-- Insert game configuration
INSERT INTO games (id, code, name, display_name, has_colors, etl_enabled) 
VALUES (
  gen_random_uuid(),
  'OPTCG',
  'One Piece Card Game', 
  'One Piece TCG',
  false,
  true
);

-- Add game-specific indexes if needed
CREATE INDEX CONCURRENTLY idx_cards_optcg_power 
ON cards(game_data->>'power') 
WHERE game_id = (SELECT id FROM games WHERE code = 'OPTCG');
```

### Data Backfill Pattern

```typescript
// Background job for data migrations
export class DataMigrationJob {
  async backfillCardPopularityScores(): Promise<void> {
    const batchSize = 1000
    let offset = 0
    let hasMore = true
    
    while (hasMore) {
      const cards = await this.cardRepo.find({
        skip: offset,
        take: batchSize,
        where: { popularityScore: 0 }
      })
      
      if (cards.length === 0) {
        hasMore = false
        break
      }
      
      // Calculate popularity scores in batch
      const updates = await Promise.all(
        cards.map(async card => ({
          id: card.id,
          popularityScore: await this.calculatePopularityScore(card)
        }))
      )
      
      // Batch update
      await this.cardRepo.save(updates)
      
      offset += batchSize
      
      // Progress logging
      this.logger.log(`Processed ${offset} cards`)
      
      // Rate limiting to avoid database overload
      await this.sleep(100)
    }
  }
}
```

## 🛡️ Data Quality and Monitoring

### Entity-Level Validation

```typescript
@Entity()
export class Deck {
  @Column()
  @IsNotEmpty()
  @Length(1, 255)
  name: string
  
  @Column()
  @IsIn(['MTG', 'POKEMON', 'YUGIOH', 'OPTCG'])
  game: string
  
  @Column()
  @ValidateFormat() // Custom validator
  format: string
  
  // Database constraints
  @Check('total_cards >= 0')
  @Column({ type: 'integer', default: 0 })
  totalCards: number
  
  // Business rule validation
  @AfterLoad()
  @AfterInsert() 
  @AfterUpdate()
  validateBusinessRules(): void {
    if (this.game === 'MTG' && this.format === 'Commander' && this.totalCards !== 100) {
      throw new Error('Commander decks must have exactly 100 cards')
    }
  }
}

// Custom validator implementation
export function ValidateFormat() {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(format: string, args: ValidationArguments) {
          const deck = args.object as Deck
          return SUPPORTED_FORMATS[deck.game]?.includes(format) ?? false
        },
        defaultMessage(): string {
          return 'Format is not supported for the selected game'
        }
      }
    })
  }
}
```

### Database Health Monitoring

```typescript
export class DatabaseHealthService {
  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks = await Promise.allSettled([
      this.checkConnectionHealth(),
      this.checkQueryPerformance(),
      this.checkDataIntegrity(),
      this.checkStorageMetrics()
    ])
    
    return {
      status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'unhealthy',
      checks: checks.map((check, index) => ({
        name: ['connection', 'performance', 'integrity', 'storage'][index],
        status: check.status,
        ...(check.status === 'rejected' && { error: check.reason })
      })),
      timestamp: new Date()
    }
  }
  
  private async checkQueryPerformance(): Promise<void> {
    const start = Date.now()
    
    // Test critical queries
    await Promise.all([
      this.testQuery('SELECT 1', 10), // Basic connectivity
      this.testQuery('SELECT COUNT(*) FROM cards', 100), // Index performance  
      this.testQuery('SELECT * FROM decks ORDER BY updated_at DESC LIMIT 10', 50) // Complex query
    ])
    
    const duration = Date.now() - start
    if (duration > 200) {
      throw new Error(`Query performance degraded: ${duration}ms`)
    }
  }
  
  private async checkDataIntegrity(): Promise<void> {
    // Check for orphaned records
    const orphanedDecks = await this.db.query(`
      SELECT COUNT(*) as count 
      FROM deck_cards dc 
      LEFT JOIN cards c ON dc.card_id = c.id 
      WHERE c.id IS NULL
    `)
    
    if (orphanedDecks[0].count > 0) {
      throw new Error(`Found ${orphanedDecks[0].count} orphaned deck cards`)
    }
    
    // Check constraint violations
    const invalidDecks = await this.db.query(`
      SELECT COUNT(*) as count 
      FROM decks 
      WHERE total_cards < 0 OR total_cards > 1000
    `)
    
    if (invalidDecks[0].count > 0) {
      throw new Error(`Found ${invalidDecks[0].count} decks with invalid card counts`)
    }
  }
}
```

## 💾 Backup and Recovery

### Automated Backup Strategy

```typescript
export class BackupService {
  async performBackup(): Promise<BackupResult> {
    const timestamp = new Date().toISOString().replace(/:/g, '-')
    const backupPath = `backups/${timestamp}`
    
    try {
      // 1. Create database dump
      await this.createDatabaseDump(`${backupPath}/database.sql`)
      
      // 2. Backup critical files (images, documents)
      await this.backupFiles(`${backupPath}/files/`)
      
      // 3. Export configuration
      await this.exportConfiguration(`${backupPath}/config.json`)
      
      // 4. Create compressed archive
      const archivePath = await this.createArchive(backupPath)
      
      // 5. Upload to long-term storage
      await this.uploadToStorage(archivePath)
      
      // 6. Verify backup integrity
      await this.verifyBackup(archivePath)
      
      // 7. Clean up local files
      await this.cleanup(backupPath, archivePath)
      
      return {
        success: true,
        timestamp,
        size: await this.getBackupSize(archivePath),
        location: `s3://backups/${archivePath}`
      }
      
    } catch (error) {
      this.logger.error('Backup failed', { error: error.message })
      
      return {
        success: false,
        error: error.message,
        timestamp
      }
    }
  }
}
```

## 🔄 ETL Pipeline Implementation

### Card Data ETL Pipeline

**Implementation:** `packages/tcg-catalog/src/services/ETLService.ts`
**Admin API:** `POST /api/admin/etl/trigger`, `GET /api/admin/etl/jobs` (platform admin only)

`ETLService` is a single service that routes per-game via a provider-specific transformer:

| Game    | API Provider  | Transformer class     |
|---------|---------------|-----------------------|
| MTG     | Scryfall      | `ScryfallTransformer` |
| POKEMON | Pokémon TCG   | `PokemonTransformer`  |
| YUGIOH  | YGOProDeck    | `YugiohTransformer`   |
| OPTCG   | One Piece TCG | `OnePieceTransformer` |

Each transformer implements `fetchCards()` and returns a normalized card list. `ETLService` then upserts cards, prints, and SKUs in batches via atomic TypeORM transactions.

Circuit breaker is per-game (`Map<gameCode, CircuitBreakerState>`); opens after `circuitBreakerThreshold` consecutive failures and resets after `circuitBreakerResetTimeout` ms.

### ETL Operational Guarantees

- `OPTCG` is the canonical One Piece game code; alias inputs are normalized before job execution.
- ETL runs are transactional per game so one game failure does not corrupt already-committed data for other games.
- Duplicate card conflicts resolve deterministically: higher completeness score → newer source `updated_at` → smallest stable source identifier.
- Catalog SKU tokens are normalized to uppercase ASCII kebab format with `UNK` fallback for missing tokens.
- Per-game circuit breaker prevents cascading failures; isolated by `gameCode` key.

```typescript
// Real API (packages/tcg-catalog/src/services/ETLService.ts)
const etl = new ETLService({ batchSize: 100, circuitBreakerThreshold: 3 })
const result = await etl.startETLJob('MTG', ETLJobType.FULL_SYNC, 'admin')
// result: { success, gameCode, totalProcessed, cardsCreated, cardsUpdated,
//           printsCreated, skusGenerated, errors[] }
```

Job lifecycle is tracked in the `etl_jobs` table:
`PENDING → RUNNING → COMPLETED | FAILED | PARTIAL | CANCELLED`

#### Pre-implementation pseudocode (historical reference)

```typescript
// NOTE: The classes below are design-phase pseudocode, not the real implementation.
export class UniversalETLService {
  private readonly scrapers = {
    MTG: new ScryfallETLService(),
    POKEMON: new PokemonTCGETLService(),
    YUGIOH: new YGOProDeckETLService(),
    OPTCG: new OnePieceETLService()
  }

  async syncAllGames(): Promise<ETLResult> {
    const results = await Promise.allSettled(
      Object.entries(this.scrapers).map(async ([gameCode, scraper]) => {
        this.logger.log(`Starting ETL for ${gameCode}`)
        return await scraper.syncCardData()
      })
    )

    return {
      success: results.every(r => r.status === 'fulfilled'),
      results: results.map((result, index) => ({
        game: Object.keys(this.scrapers)[index],
        ...(result.status === 'fulfilled' ? result.value : { error: result.reason })
      }))
    }
  }
}

export class ScryfallETLService {
  async syncCardData(): Promise<ETLResult> {
    const startTime = Date.now()
    let processed = 0
    let errors = 0
    
    try {
      // 1. Fetch bulk data from Scryfall
      const bulkData = await this.fetchBulkData()
      
      // 2. Process in batches for memory efficiency
      for await (const batch of this.processBatches(bulkData, 1000)) {
        try {
          await this.processBatch(batch)
          processed += batch.length
        } catch (error) {
          errors += batch.length
          this.logger.error('Batch processing failed', { 
            batchSize: batch.length,
            error: error.message 
          })
        }
        
        // Progress reporting
        if (processed % 10000 === 0) {
          this.logger.log(`Processed ${processed} MTG cards`)
        }
      }
      
      // 3. Update ETL metadata
      await this.updateETLMetadata({
        lastRun: new Date(),
        processed,
        errors,
        duration: Date.now() - startTime
      })
      
      return { success: true, processed, errors }
      
    } catch (error) {
      this.logger.error('ETL process failed', { error: error.message })
      return { success: false, error: error.message }
    }
  }
  
  private async processBatch(cards: ScryfallCard[]): Promise<void> {
    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.startTransaction()
    
    try {
      for (const scryfallCard of cards) {
        // Transform Scryfall data to our universal model
        const cardData = this.transformCard(scryfallCard)
        const printData = this.transformPrint(scryfallCard)
        const skuData = this.generateSKUs(scryfallCard)
        
        // Upsert card (handle duplicates)
        await queryRunner.manager.createQueryBuilder()
          .insert()
          .into(Card)
          .values(cardData)
          .onConflict('(oracle_id) DO UPDATE SET name = EXCLUDED.name, updated_at = EXCLUDED.updated_at')
          .execute()

        // Upsert print
        await queryRunner.manager.createQueryBuilder()
          .insert()
          .into(Print)
          .values(printData)
          .onConflict('(scryfall_id) DO UPDATE SET updated_at = EXCLUDED.updated_at')
          .execute()

        // Generate catalog SKUs for all conditions and finishes
        for (const sku of skuData) {
          await queryRunner.manager.createQueryBuilder()
            .insert()
            .into(CatalogSku)
            .values(sku)
            .onConflict('(sku) DO UPDATE SET updated_at = EXCLUDED.updated_at')
            .execute()
        }
      }
      
      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  private transformCard(scryfallCard: ScryfallCard): Partial<Card> {
    return {
      oracle_id: scryfallCard.oracle_id,
      name: scryfallCard.name,
      normalized_name: scryfallCard.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      primary_type: scryfallCard.type_line.split(' ')[0],
      subtypes: scryfallCard.type_line.includes('—')
        ? scryfallCard.type_line.split('—')[1].trim().split(' ')
        : [],
      oracle_text: scryfallCard.oracle_text,
      flavor_text: scryfallCard.flavor_text,
      keywords: scryfallCard.keywords || [],
      mana_cost: scryfallCard.mana_cost,
      mana_value: scryfallCard.cmc,
      colors: scryfallCard.colors,
      color_identity: scryfallCard.color_identity,
      power_value: scryfallCard.power ? parseInt(scryfallCard.power) : null,
      defense_value: scryfallCard.toughness ? parseInt(scryfallCard.toughness) : null,
      game_data: {
        layout: scryfallCard.layout,
        frame: scryfallCard.frame,
        border_color: scryfallCard.border_color,
        legalities: scryfallCard.legalities
      }
    }
  }
}
// END pseudocode — see real implementation in packages/tcg-catalog/src/
```

## 🚀 Deployment Architecture

### Service Deployment

```yaml
# Railway/Docker deployment
services:
  # Commerce operations
  backend:
    image: sidedecked/backend
    database: mercur-db
    port: 9001
    environment:
      - DATABASE_URL=postgresql://mercur-db
      - CUSTOMER_BACKEND_URL=http://customer-backend:7000
    
  # Customer data and APIs  
  customer-backend:
    image: sidedecked/customer-backend
    database: sidedecked-db
    port: 7000
    environment:
      - DATABASE_URL=postgresql://sidedecked-db
      - COMMERCE_BACKEND_URL=http://backend:9001
    
  # Frontend applications
  storefront:
    image: sidedecked/storefront
    port: 3000
    environment:
      - NEXT_PUBLIC_COMMERCE_API_URL=http://backend:9001
      - NEXT_PUBLIC_CUSTOMER_API_URL=http://customer-backend:7000
      
  vendorpanel:
    image: sidedecked/vendorpanel  
    port: 5173
    environment:
      - VITE_COMMERCE_API_URL=http://backend:9001

  # Supporting services
  redis:
    image: redis:7-alpine
    port: 6379
    
  minio:
    image: minio/minio
    port: 8000
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin123
```

### Database Deployment

```yaml
databases:
  mercur-db:
    type: postgresql
    version: 14
    purpose: commerce operations
    size: production-optimized
    extensions: [uuid-ossp]
    
  sidedecked-db:
    type: postgresql
    version: 14
    purpose: customer experience
    size: analytics-optimized
    extensions: [uuid-ossp, pg_trgm, unaccent]
```

## 🔍 Monitoring and Observability

### Cross-Service Tracing

```typescript
// Distributed tracing across services
app.use(requestTracing({
  serviceName: 'customer-backend',
  traceCommerceCalls: true,
  correlationId: (req) => req.headers['x-correlation-id']
}))
```

### Health Checks

```typescript
// Health check includes dependency services
export const healthCheck = async () => {
  const checks = await Promise.allSettled([
    checkDatabase('sidedecked-db'),
    checkExternalAPI('commerce-backend'),
    checkRedis(),
    checkMinio()
  ])
  
  return {
    status: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'degraded',
    dependencies: checks
  }
}
```

## 🛠️ Development Workflow

### Repository Management

```bash
# Each repository is developed independently
cd sidedecked/backend && git commit -m "feat(vendor): add bulk import"
cd sidedecked/customer-backend && git commit -m "feat(catalog): add MTG search"
cd sidedecked/storefront && git commit -m "feat(ui): combine commerce and catalog data"
cd sidedecked/vendorpanel && git commit -m "feat(ui): improve vendor dashboard"
```

### Testing Strategy

```typescript
// Integration tests verify cross-service communication
describe('Product Enrichment Integration', () => {
  it('should combine commerce and catalog data', async () => {
    // Mock commerce backend
    mockCommerceAPI.getProduct.mockResolvedValue(mockProduct)
    
    // Mock customer backend
    mockCustomerAPI.getCardBySKU.mockResolvedValue(mockCard)
    
    // Test integration
    const enriched = await productService.getEnrichedProduct('prod_123')
    
    expect(enriched).toMatchObject({
      ...mockProduct,
      cardDetails: mockCard
    })
  })
})
```

## 📋 Migration and Rollback Strategy

### From Monolithic to Split-Brain

1. **Data Separation**: Move customer-specific tables to sidedecked-db
2. **API Splitting**: Extract customer APIs to customer-backend
3. **Frontend Updates**: Update storefront to call both APIs
4. **Event Integration**: Implement cross-service event publishing
5. **Gradual Migration**: Migrate features incrementally

### Rollback Strategy

1. **Database Snapshots**: Maintain pre-migration backups
2. **Feature Flags**: Control split-brain behavior via configuration
3. **Graceful Degradation**: Fall back to single-service mode if needed
4. **Data Reconciliation**: Tools to merge data if rollback required

## 🚀 Future Enhancements

1. **ML-Based Matching**: Train models on verified matches
2. **Real-time Price Feeds**: WebSocket price updates
3. **Image AI**: Card recognition and condition grading
4. **Multi-language Search**: Full-text search in all languages
5. **Blockchain Integration**: NFT card ownership tracking

## 📚 References

- [System Overview](./01-system-overview.md)
- [Domain Models](./03-domain-models.md)
- [Integration Architecture](./06-integration-architecture.md)
- [Testing Standards](../standards/testing-standards.md)
- [Code Standards](../standards/code-standards.md)

## 📝 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 3.1 | 2026-02-23 | Documented story 2-1 ETL operational guarantees (canonical game-code mapping, deterministic duplicate resolution, per-game transaction boundaries, weekly scheduler sync) |
| 3.0 | 2025-09-12 | Complete unified data architecture document with comprehensive patterns, schemas, and implementation details |
| 2.1 | 2025-09-11 | Added comprehensive data patterns and ETL pipeline documentation |
| 2.0 | 2025-01-15 | Enhanced caching and performance patterns |
| 1.1 | 2025-01-01 | Added data quality and monitoring patterns |
| 1.0 | 2024-12-01 | Initial data architecture patterns |

---

This split-brain architecture provides:
- ✅ **Separation of Concerns**: Commerce vs. customer experience
- ✅ **Independent Scaling**: Scale each service based on load patterns  
- ✅ **Team Autonomy**: Teams can work on different aspects independently
- ✅ **Technology Flexibility**: Choose optimal tech for each domain
- ✅ **Fault Isolation**: Issues in one domain don't affect the other
- ✅ **Universal TCG Support**: Comprehensive data model for all card games
- ✅ **Performance Optimized**: Sub-100ms search with materialized views
- ✅ **Production Ready**: Complete monitoring, caching, and deployment strategies
