# TCG Catalog System - Implementation Guide

## Overview

The SideDecked TCG Catalog System is a comprehensive solution for managing trading card game data across Magic: The Gathering, Pokémon, Yu-Gi-Oh!, and One Piece TCG. This implementation guide covers the complete system architecture, deployment, and integration.

## System Architecture

### Split-Brain Design
The system follows SideDecked's split-brain architecture:
- **Commerce Data** → `backend` repository (MercurJS/PostgreSQL)
- **Catalog Data** → `customer-backend` repository (PostgreSQL)
- **Communication** → REST APIs between services

### Core Components

#### 1. Database Layer (`customer-backend/packages/tcg-catalog/src/entities/`)
- **Game**: Supported TCG games (MTG, Pokemon, Yu-Gi-Oh!, One Piece)
- **Card**: Universal card definitions with game-specific fields
- **Print**: Specific card printings in sets
- **CardSet**: Set information for each game
- **CatalogSKU**: Universal SKU system for commerce integration
- **CardImage**: Optimized card images (WebP, multiple sizes, blurhash)
- **ETLJob**: Data pipeline job tracking
- **Format**: Game format definitions (Standard, Modern, Legacy, etc.)

#### 2. ETL Pipeline (`customer-backend/packages/tcg-catalog/src/services/ETLService.ts`)
- **Circuit Breaker Pattern**: Failure protection and recovery
- **Batch Processing**: Efficient data ingestion with transaction support
- **Deduplication**: SHA-256 hashing for oracle and print uniqueness
- **Error Handling**: Comprehensive logging and retry mechanisms
- **Job Scheduling**: Background processing with Bull queues

#### 3. Data Source Transformers (`customer-backend/packages/tcg-catalog/src/transformers/`)
- **ScryfallTransformer**: Magic: The Gathering API integration
- **PokemonTransformer**: Pokemon TCG API integration  
- **YugiohTransformer**: Yu-Gi-Oh! data source integration
- **OnePieceTransformer**: One Piece TCG API integration

#### 4. Search System (`customer-backend/packages/tcg-catalog/src/services/SearchService.ts`)
- **Algolia Integration**: High-performance search engine
- **Dual-Index Strategy**: 
  - `cards_catalog`: TCG card search
  - `marketplace_products`: Vendor product search
- **Advanced Filtering**: Game, set, format, condition, price range
- **Faceted Search**: Dynamic filter options based on results

#### 5. Image Processing (`customer-backend/packages/tcg-catalog/src/services/ImageProcessingService.ts`)
- **WebP Conversion**: Sharp library for optimal compression
- **Multi-Size Generation**: thumbnail (150x209), small (200x279), medium (300x419), large (488x680)
- **Blurhash**: Progressive loading placeholders
- **MinIO Storage**: S3-compatible object storage
- **CDN-Ready**: Structured paths for future CDN integration

#### 6. Commerce Integration (`customer-backend/packages/tcg-catalog/src/services/CommerceIntegrationService.ts`)
- **MercurJS Bridge**: Connects catalog to commerce platform
- **Product Matching**: Links vendor products to catalog entries
- **Inventory Sync**: Real-time stock and pricing updates
- **SKU Validation**: Comprehensive SKU format validation

#### 7. Vendor Matching (`customer-backend/packages/tcg-catalog/src/services/VendorMatchingService.ts`)
- **Multi-Strategy Matching**: Exact SKU, parsed title, fuzzy search
- **Confidence Scoring**: Machine learning-style confidence metrics
- **Alternative Suggestions**: Multiple match options for manual review
- **Smart Parsing**: Extract card details from vendor product titles

## Universal SKU System

### Format Specification
```
{GAME}-{SET}-{NUMBER}-{LANG}-{CONDITION}-{FINISH}[-{GRADE}]
```

### Examples
- `MTG-DOM-001-EN-NM-NORMAL` (Magic: The Gathering, Dominaria, #001, English, Near Mint, Normal)
- `POKEMON-BASE1-004-EN-LP-HOLO` (Pokemon Base Set, #004, English, Lightly Played, Holographic)
- `YUGIOH-LOB-001-EN-NM-SECRET` (Yu-Gi-Oh! Legend of Blue Eyes, #001, English, Near Mint, Secret Rare)
- `OPTCG-OP01-001-EN-NM-NORMAL` (One Piece, Starter Deck 1, #001, English, Near Mint, Normal)

### Validation Rules
- **Game Codes**: MTG, POKEMON, YUGIOH, OPTCG
- **Language Codes**: EN, ES, FR, DE, IT, PT, JA, KO, ZH, RU
- **Condition Codes**: NM, LP, MP, HP, DMG, MINT
- **Finish Codes**: NORMAL, FOIL, HOLO, RAINBOW, SECRET, GOLD, SILVER

## Installation & Setup

### Prerequisites
```bash
# PostgreSQL with extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

# Redis for caching and queues
# MinIO for object storage
# Algolia for search
```

### Environment Configuration

#### customer-backend/.env
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sidedecked-db
REDIS_URL=redis://localhost:6379

# Search
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_API_KEY=your_algolia_api_key
ALGOLIA_INDEX_PREFIX=sidedecked

# Storage
MINIO_ENDPOINT=localhost:8001
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key
MINIO_BUCKET=sidedecked-images
MINIO_USE_SSL=false

# API Keys
SCRYFALL_DELAY_MS=100
POKEMON_TCG_API_KEY=your_pokemon_api_key
YUGIOH_API_DELAY_MS=200
ONEPIECE_API_DELAY_MS=150

# Processing
ETL_BATCH_SIZE=100
IMAGE_PROCESSING_CONCURRENCY=3
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT_MS=60000
```

### Database Migration
```bash
cd customer-backend
npm run migration:run
```

### Package Installation
```bash
cd customer-backend
npm install
```

## API Endpoints

### Core Catalog APIs

#### Cards & Search
```typescript
// Search cards with filters
GET /api/catalog/cards/search?q=lightning&game=MTG&set=DOM&format=standard

// Get card details
GET /api/catalog/cards/:id

// Get card prints
GET /api/catalog/cards/:id/prints

// Get print details
GET /api/catalog/prints/:id

// Get SKU details
GET /api/catalog/skus/:sku
```

#### Sets & Games
```typescript
// List games
GET /api/catalog/games

// List sets for a game
GET /api/catalog/games/:gameCode/sets

// Get set details
GET /api/catalog/sets/:id

// List formats for a game
GET /api/catalog/games/:gameCode/formats
```

#### ETL Management
```typescript
// Start ETL job
POST /api/catalog/etl/start
{
  "gameCode": "MTG",
  "jobType": "INCREMENTAL",
  "triggeredBy": "scheduler"
}

// Get ETL job status
GET /api/catalog/etl/jobs/:id

// List ETL jobs
GET /api/catalog/etl/jobs?gameCode=MTG&status=COMPLETED

// ETL health check
GET /api/catalog/etl/health
```

### Commerce Integration APIs

#### Product Matching
```typescript
// Match vendor product to catalog
POST /api/commerce/match-product
{
  "vendorProduct": {
    "id": "vendor_product_123",
    "name": "Lightning Bolt",
    "variants": [...]
  }
}

// Bulk match products
POST /api/commerce/match-products-bulk
{
  "vendorProducts": [...]
}

// Get matching suggestions
GET /api/commerce/match-suggestions/:vendorProductId
```

#### SKU Validation
```typescript
// Validate single SKU
POST /api/commerce/validate-sku
{
  "sku": "MTG-DOM-001-EN-NM-NORMAL"
}

// Bulk SKU validation
POST /api/commerce/validate-skus-bulk
{
  "skus": ["MTG-DOM-001-EN-NM-NORMAL", ...]
}

// SKU suggestions
GET /api/commerce/sku-suggestions?partial=MTG-DOM-001
```

#### Inventory Sync
```typescript
// Sync catalog SKU inventory
POST /api/commerce/sync-inventory/:catalogSkuId

// Bulk inventory sync
POST /api/commerce/sync-inventory-bulk
{
  "catalogSkuIds": ["uuid1", "uuid2", ...]
}

// Get inventory status
GET /api/commerce/inventory-status/:catalogSkuId
```

## Background Jobs & Queues

### ETL Jobs
```typescript
// Schedule full ETL for all games
await etlQueue.add('full-etl', {
  gameCode: 'ALL',
  priority: 'high'
}, {
  repeat: { cron: '0 2 * * *' } // Daily at 2 AM
})

// Schedule incremental updates
await etlQueue.add('incremental-etl', {
  gameCode: 'MTG'
}, {
  repeat: { cron: '*/15 * * * *' } // Every 15 minutes
})
```

### Image Processing
```typescript
// Process card images
await imageQueue.add('process-image', {
  printId: 'uuid',
  imageUrl: 'https://api.scryfall.com/image.jpg',
  imageType: 'normal'
})

// Batch image processing
await imageQueue.addBulk([
  { name: 'process-image', data: { printId: 'uuid1', ... } },
  { name: 'process-image', data: { printId: 'uuid2', ... } }
])
```

### Search Indexing
```typescript
// Index new card
await searchQueue.add('index-card', {
  cardId: 'uuid',
  operation: 'CREATE'
})

// Bulk reindex
await searchQueue.add('bulk-reindex', {
  gameCode: 'MTG',
  batchSize: 1000
})
```

## Performance Optimization

### Database Indexes
```sql
-- Catalog search optimization
CREATE INDEX CONCURRENTLY idx_cards_name_trgm ON cards USING gin(name gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_cards_normalized_name ON cards(normalized_name);
CREATE INDEX CONCURRENTLY idx_prints_collector_number ON prints(collector_number);
CREATE INDEX CONCURRENTLY idx_catalog_skus_sku ON catalog_skus(sku);
CREATE INDEX CONCURRENTLY idx_catalog_skus_game_set ON catalog_skus(game_code, set_code);

-- ETL optimization
CREATE INDEX CONCURRENTLY idx_etl_jobs_status_created ON etl_jobs(status, created_at);
CREATE INDEX CONCURRENTLY idx_cards_oracle_hash ON cards(oracle_hash);
CREATE INDEX CONCURRENTLY idx_prints_print_hash ON prints(print_hash);
```

### Caching Strategy
```typescript
// Redis caching layers
const CACHE_KEYS = {
  CARD: (id: string) => `card:${id}`,
  PRINT: (id: string) => `print:${id}`,
  SET: (id: string) => `set:${id}`,
  SKU: (sku: string) => `sku:${sku}`,
  SEARCH: (query: string, filters: string) => `search:${query}:${filters}`
}

const CACHE_TTL = {
  CARD: 3600,      // 1 hour
  PRINT: 3600,     // 1 hour  
  SET: 7200,       // 2 hours
  SKU: 1800,       // 30 minutes
  SEARCH: 900      // 15 minutes
}
```

### Batch Processing
```typescript
// ETL batch configuration
const ETL_CONFIG = {
  BATCH_SIZE: 100,
  CONCURRENT_REQUESTS: 5,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  CIRCUIT_BREAKER_THRESHOLD: 5
}

// Image processing configuration
const IMAGE_CONFIG = {
  CONCURRENT_DOWNLOADS: 3,
  MAX_FILE_SIZE_MB: 10,
  TIMEOUT_MS: 30000,
  SIZES: [
    { name: 'thumbnail', width: 150, height: 209 },
    { name: 'small', width: 200, height: 279 },
    { name: 'medium', width: 300, height: 419 },
    { name: 'large', width: 488, height: 680 }
  ]
}
```

## Monitoring & Health Checks

### System Health Endpoints
```typescript
// Overall system health
GET /api/health
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "algolia": "healthy",
    "minio": "healthy"
  }
}

// ETL system health
GET /api/catalog/etl/health
{
  "healthy": true,
  "activeJobs": 2,
  "failedJobs": 0,
  "circuitBreakerStatus": {
    "MTG": "closed",
    "POKEMON": "closed",
    "YUGIOH": "closed",
    "OPTCG": "closed"
  }
}

// Search system health
GET /api/catalog/search/health
{
  "healthy": true,
  "indexStatus": {
    "cards_catalog": "active",
    "marketplace_products": "active"
  },
  "responseTimeMs": 45
}
```

### Metrics & Logging
```typescript
// Key metrics to monitor
const METRICS = {
  ETL_JOB_DURATION: 'etl_job_duration_seconds',
  ETL_RECORDS_PROCESSED: 'etl_records_processed_total',
  SEARCH_RESPONSE_TIME: 'search_response_time_ms',
  IMAGE_PROCESSING_TIME: 'image_processing_time_ms',
  COMMERCE_MATCH_ACCURACY: 'commerce_match_accuracy_ratio',
  SKU_VALIDATION_TIME: 'sku_validation_time_ms',
  API_REQUEST_COUNT: 'api_requests_total',
  API_ERROR_COUNT: 'api_errors_total'
}

// Log levels and categories
const LOG_CATEGORIES = {
  ETL: 'tcg-catalog:etl',
  SEARCH: 'tcg-catalog:search',
  IMAGES: 'tcg-catalog:images',
  COMMERCE: 'tcg-catalog:commerce',
  API: 'tcg-catalog:api'
}
```

## Troubleshooting

### Common Issues

#### ETL Pipeline Problems
```bash
# Check ETL job status
GET /api/catalog/etl/jobs?status=FAILED

# Reset circuit breaker
POST /api/catalog/etl/circuit-breaker/reset
{
  "gameCode": "MTG"
}

# Manual ETL restart
POST /api/catalog/etl/start
{
  "gameCode": "MTG",
  "jobType": "FULL",
  "force": true
}
```

#### Search Index Issues
```bash
# Reindex specific game
POST /api/catalog/search/reindex
{
  "gameCode": "MTG",
  "batchSize": 500
}

# Clear and rebuild index
POST /api/catalog/search/rebuild
{
  "indexName": "cards_catalog"
}
```

#### Image Processing Problems
```bash
# Check image processing queue
GET /api/catalog/images/queue/status

# Retry failed image processing
POST /api/catalog/images/retry-failed
{
  "limit": 100
}
```

### Performance Issues

#### Database Query Optimization
```sql
-- Identify slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%cards%' OR query LIKE '%prints%'
ORDER BY mean_time DESC 
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename IN ('cards', 'prints', 'catalog_skus');
```

#### Redis Memory Optimization
```bash
# Check Redis memory usage
redis-cli info memory

# Clear specific cache patterns
redis-cli eval "return redis.call('del',unpack(redis.call('keys','search:*')))" 0
redis-cli eval "return redis.call('del',unpack(redis.call('keys','sku:*')))" 0
```

## Deployment

### Production Checklist
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Redis cluster configured
- [ ] MinIO bucket created with proper policies
- [ ] Algolia indexes created and configured
- [ ] SSL certificates installed
- [ ] Monitoring dashboards configured
- [ ] Backup procedures tested
- [ ] Circuit breaker thresholds tuned
- [ ] Rate limiting configured

### Scaling Considerations
- **Database**: Read replicas for search queries
- **Redis**: Cluster mode for high availability
- **MinIO**: Distributed mode for storage scaling
- **API**: Horizontal pod autoscaling
- **ETL**: Queue-based processing with worker scaling
- **Search**: Algolia automatically scales

## Future Enhancements

### Planned Features
1. **AI-Powered Matching**: Machine learning models for vendor product matching
2. **Price Intelligence**: Historical pricing data and trend analysis
3. **Condition Assessment**: Computer vision for card condition grading
4. **Multi-Language Support**: Internationalization for card names and sets
5. **Real-Time Inventory**: WebSocket-based live inventory updates
6. **Advanced Analytics**: Business intelligence dashboards
7. **Mobile API**: Optimized endpoints for mobile applications
8. **Third-Party Integrations**: eBay, TCGPlayer, CardMarket APIs

### Architecture Evolution
- **Microservices**: Split catalog system into focused services
- **Event Sourcing**: Command Query Responsibility Segregation (CQRS)
- **GraphQL API**: More flexible data fetching
- **CDN Integration**: Global image delivery optimization
- **Blockchain**: Card authenticity verification
- **Edge Computing**: Localized search and caching

## Support & Maintenance

### Regular Maintenance Tasks
- **Daily**: Monitor ETL job success rates
- **Weekly**: Check search index health and rebuild if needed
- **Monthly**: Analyze performance metrics and optimize queries
- **Quarterly**: Review and update data source integrations
- **Annually**: Evaluate and upgrade infrastructure components

### Emergency Procedures
1. **ETL Failure**: Enable circuit breaker, investigate data source issues
2. **Search Outage**: Fallback to database search, rebuild indexes
3. **Image Processing Backlog**: Scale worker processes, clear queue
4. **High API Error Rate**: Enable rate limiting, check upstream services
5. **Database Performance**: Enable read replicas, optimize queries

---

This comprehensive implementation provides a robust foundation for SideDecked's TCG catalog system, supporting millions of cards across multiple games with high performance, reliability, and scalability.