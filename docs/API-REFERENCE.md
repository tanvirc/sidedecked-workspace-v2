# SideDecked TCG Catalog API Reference

## Base URL
```
Production: https://api.sidedecked.com
Development: http://localhost:7000
```

## Authentication
```http
Authorization: Bearer <jwt_token>
X-API-Key: <api_key>
```

## Error Responses
```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    timestamp: string
    path: string
  }
}
```

## Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

---

## 🃏 Cards API

### Search Cards
Search for cards across all supported games with advanced filtering.

```http
GET /api/catalog/cards/search
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (card name, text, etc.) |
| `game` | string | No | Game filter (MTG, POKEMON, YUGIOH, OPTCG) |
| `set` | string | No | Set code filter |
| `format` | string | No | Format filter (standard, modern, legacy, etc.) |
| `type` | string | No | Card type filter |
| `rarity` | string | No | Rarity filter |
| `color` | string | No | Color filter (for MTG) |
| `cmc` | number | No | Converted mana cost (for MTG) |
| `hp_min` | number | No | Minimum HP (for Pokemon) |
| `hp_max` | number | No | Maximum HP (for Pokemon) |
| `attribute` | string | No | Attribute filter (for Yu-Gi-Oh!) |
| `has_inventory` | boolean | No | Only cards with available inventory |
| `price_min` | number | No | Minimum price |
| `price_max` | number | No | Maximum price |
| `sort` | string | No | Sort order (name, price, release_date, popularity) |
| `order` | string | No | Sort direction (asc, desc) |
| `limit` | number | No | Results per page (default: 20, max: 100) |
| `offset` | number | No | Results offset for pagination |

#### Response
```typescript
interface SearchCardsResponse {
  success: true
  data: {
    cards: Card[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
    facets: {
      games: Array<{ code: string; name: string; count: number }>
      sets: Array<{ code: string; name: string; count: number }>
      types: Array<{ name: string; count: number }>
      rarities: Array<{ name: string; count: number }>
      formats: Array<{ name: string; count: number }>
    }
    suggestions?: string[]
  }
}
```

#### Example
```bash
curl "https://api.sidedecked.com/api/catalog/cards/search?q=lightning&game=MTG&type=instant&limit=10"
```

### Get Card Details
Retrieve detailed information about a specific card.

```http
GET /api/catalog/cards/:id
```

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Card UUID |

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `include_prints` | boolean | Include all prints (default: false) |
| `include_prices` | boolean | Include pricing data (default: false) |
| `include_inventory` | boolean | Include inventory status (default: false) |

#### Response
```typescript
interface CardDetailsResponse {
  success: true
  data: {
    card: Card & {
      prints?: Print[]
      prices?: PriceData[]
      inventory?: InventoryData
    }
  }
}
```

### Get Card Prints
Get all prints/versions of a specific card.

```http
GET /api/catalog/cards/:id/prints
```

#### Response
```typescript
interface CardPrintsResponse {
  success: true
  data: {
    prints: Print[]
  }
}
```

---

## 🎴 Prints API

### Get Print Details
Retrieve detailed information about a specific card print.

```http
GET /api/catalog/prints/:id
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `include_skus` | boolean | Include available SKUs (default: false) |
| `include_images` | boolean | Include image data (default: true) |
| `include_prices` | boolean | Include pricing data (default: false) |

#### Response
```typescript
interface PrintDetailsResponse {
  success: true
  data: {
    print: Print & {
      skus?: CatalogSKU[]
      images?: CardImage[]
      prices?: PriceData[]
    }
  }
}
```

### Get Print Images
Get all available images for a print in different sizes.

```http
GET /api/catalog/prints/:id/images
```

#### Response
```typescript
interface PrintImagesResponse {
  success: true
  data: {
    images: Array<{
      type: string // 'normal', 'art_crop', 'large', etc.
      sizes: Array<{
        name: string // 'thumbnail', 'small', 'medium', 'large'
        url: string
        width: number
        height: number
      }>
      blurhash: string
    }>
  }
}
```

---

## 📦 Sets API

### List Sets
Get sets for a specific game or all games.

```http
GET /api/catalog/sets
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `game` | string | Filter by game code |
| `type` | string | Set type (core, expansion, masters, etc.) |
| `released_after` | string | ISO date filter |
| `released_before` | string | ISO date filter |
| `sort` | string | Sort order (name, release_date, code) |
| `order` | string | Sort direction (asc, desc) |

#### Response
```typescript
interface SetsResponse {
  success: true
  data: {
    sets: CardSet[]
  }
}
```

### Get Set Details
Get detailed information about a specific set.

```http
GET /api/catalog/sets/:id
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `include_cards` | boolean | Include cards in set (default: false) |
| `include_stats` | boolean | Include set statistics (default: true) |

#### Response
```typescript
interface SetDetailsResponse {
  success: true
  data: {
    set: CardSet & {
      cards?: Card[]
      stats?: {
        totalCards: number
        cardsByRarity: Record<string, number>
        cardsByType: Record<string, number>
      }
    }
  }
}
```

---

## 🎮 Games API

### List Games
Get all supported games and their metadata.

```http
GET /api/catalog/games
```

#### Response
```typescript
interface GamesResponse {
  success: true
  data: {
    games: Game[]
  }
}
```

### Get Game Details
Get detailed information about a specific game.

```http
GET /api/catalog/games/:code
```

#### Response
```typescript
interface GameDetailsResponse {
  success: true
  data: {
    game: Game & {
      stats: {
        totalCards: number
        totalSets: number
        totalPrints: number
        totalSKUs: number
        lastETLRun: string
      }
    }
  }
}
```

### List Game Formats
Get available formats for a specific game.

```http
GET /api/catalog/games/:code/formats
```

#### Response
```typescript
interface GameFormatsResponse {
  success: true
  data: {
    formats: Format[]
  }
}
```

---

## 🏷️ SKU API

### Get SKU Details
Get information about a specific catalog SKU.

```http
GET /api/catalog/skus/:sku
```

#### Response
```typescript
interface SKUDetailsResponse {
  success: true
  data: {
    catalogSku: CatalogSKU & {
      print: Print
      card: Card
      set: CardSet
      inventory?: InventoryData
      prices?: PriceData[]
    }
  }
}
```

### Validate SKU
Validate a SKU format and existence.

```http
POST /api/catalog/skus/validate
```

#### Request Body
```typescript
{
  sku: string
}
```

#### Response
```typescript
interface SKUValidationResponse {
  success: true
  data: {
    validation: {
      isValid: boolean
      catalogSku?: CatalogSKU
      errors: ValidationError[]
      warnings: ValidationWarning[]
      suggestions: SKUSuggestion[]
      metrics: ValidationMetrics
    }
  }
}
```

---

## ⚙️ ETL API

### Start ETL Job
Trigger a data import job for a specific game.

```http
POST /api/catalog/etl/start
```

#### Request Body
```typescript
{
  gameCode: string // 'MTG', 'POKEMON', 'YUGIOH', 'OPTCG', or 'ALL'
  jobType: 'FULL' | 'INCREMENTAL' | 'SETS'
  triggeredBy?: string // Default: 'manual'
  force?: boolean // Bypass circuit breaker
}
```

#### Response
```typescript
interface ETLJobResponse {
  success: true
  data: {
    job: {
      id: string
      gameCode: string
      jobType: string
      status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
      triggeredBy: string
      startedAt: string
      estimatedDuration?: number
    }
  }
}
```

### Get ETL Job Status
Check the status of a specific ETL job.

```http
GET /api/catalog/etl/jobs/:id
```

#### Response
```typescript
interface ETLJobStatusResponse {
  success: true
  data: {
    job: ETLJob & {
      progress?: {
        totalRecords: number
        processedRecords: number
        successfulRecords: number
        failedRecords: number
        percentage: number
      }
      logs?: Array<{
        timestamp: string
        level: string
        message: string
      }>
    }
  }
}
```

### List ETL Jobs
Get a list of ETL jobs with filtering options.

```http
GET /api/catalog/etl/jobs
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `game` | string | Filter by game code |
| `status` | string | Filter by job status |
| `type` | string | Filter by job type |
| `limit` | number | Results per page |
| `offset` | number | Results offset |

#### Response
```typescript
interface ETLJobsResponse {
  success: true
  data: {
    jobs: ETLJob[]
    pagination: PaginationData
  }
}
```

### ETL Health Check
Check the health status of the ETL system.

```http
GET /api/catalog/etl/health
```

#### Response
```typescript
interface ETLHealthResponse {
  success: true
  data: {
    healthy: boolean
    activeJobs: number
    failedJobs: number
    lastSuccessfulRun: Record<string, string>
    circuitBreakerStatus: Record<string, 'open' | 'closed' | 'half-open'>
    queueStats: {
      waiting: number
      active: number
      completed: number
      failed: number
    }
  }
}
```

---

## 🔍 Search API

### Advanced Search
Perform advanced search with custom filters and sorting.

```http
POST /api/catalog/search
```

#### Request Body
```typescript
{
  query: string
  filters: {
    games?: string[]
    sets?: string[]
    types?: string[]
    rarities?: string[]
    formats?: string[]
    colors?: string[] // MTG only
    attributes?: string[] // Yu-Gi-Oh! only
    priceRange?: { min?: number; max?: number }
    cmcRange?: { min?: number; max?: number } // MTG only
    hpRange?: { min?: number; max?: number } // Pokemon only
    hasInventory?: boolean
    isLegal?: { format: string; game: string }
  }
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }
  pagination?: {
    limit: number
    offset: number
  }
  includeFacets?: boolean
}
```

#### Response
```typescript
interface AdvancedSearchResponse {
  success: true
  data: {
    results: SearchResult[]
    pagination: PaginationData
    facets?: SearchFacets
    suggestions?: string[]
    searchMeta: {
      queryTime: number
      totalHits: number
      exactMatch: boolean
    }
  }
}
```

### Search Suggestions
Get search suggestions for autocomplete.

```http
GET /api/catalog/search/suggestions
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Partial query |
| `game` | string | Limit to specific game |
| `type` | string | Suggestion type (cards, sets, types) |
| `limit` | number | Max suggestions (default: 10) |

#### Response
```typescript
interface SearchSuggestionsResponse {
  success: true
  data: {
    suggestions: Array<{
      text: string
      type: string
      game?: string
      confidence: number
    }>
  }
}
```

---

## 🛒 Commerce Integration API

### Match Vendor Product
Match a vendor's product to catalog entries.

```http
POST /api/commerce/match-product
```

#### Request Body
```typescript
{
  vendorProduct: {
    id: string
    name: string
    description?: string
    variants: Array<{
      id: string
      sku?: string
      condition: string
      language?: string
      finish?: string
      price: number
      quantity: number
    }>
    metadata?: Record<string, any>
  }
  config?: {
    enableFuzzyMatching?: boolean
    minimumConfidence?: number
    maxAlternatives?: number
  }
}
```

#### Response
```typescript
interface ProductMatchResponse {
  success: true
  data: {
    matches: Array<{
      variantId: string
      result: MatchingResult
    }>
    summary: {
      totalVariants: number
      successfulMatches: number
      confidenceDistribution: Record<string, number>
    }
  }
}
```

### Bulk Product Matching
Match multiple vendor products at once.

```http
POST /api/commerce/match-products-bulk
```

#### Request Body
```typescript
{
  vendorProducts: VendorProduct[]
  config?: MatchingConfig
  callback?: {
    url: string
    method: 'POST' | 'PUT'
    headers?: Record<string, string>
  }
}
```

#### Response
```typescript
interface BulkMatchResponse {
  success: true
  data: {
    jobId: string
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
    estimatedCompletion: string
    progress: {
      total: number
      processed: number
      successful: number
      failed: number
    }
  }
}
```

### Get Matching Suggestions
Get matching suggestions for a vendor product.

```http
GET /api/commerce/match-suggestions/:vendorProductId
```

#### Response
```typescript
interface MatchSuggestionsResponse {
  success: true
  data: {
    suggestions: Array<{
      catalogSku: CatalogSKU
      card: Card
      print: Print
      confidence: number
      reason: string
      matchingFactors: MatchingFactors
    }>
  }
}
```

### Validate SKU
Comprehensive SKU validation with suggestions.

```http
POST /api/commerce/validate-sku
```

#### Request Body
```typescript
{
  sku: string
}
```

#### Response
```typescript
interface SKUValidationResponse {
  success: true
  data: {
    validation: SKUValidation
  }
}
```

### Bulk SKU Validation
Validate multiple SKUs at once.

```http
POST /api/commerce/validate-skus-bulk
```

#### Request Body
```typescript
{
  skus: string[]
  callback?: CallbackConfig
}
```

#### Response
```typescript
interface BulkSKUValidationResponse {
  success: true
  data: {
    summary: BulkSKUValidation
    results?: Map<string, SKUValidation> // Only for small batches
    jobId?: string // For large batches
  }
}
```

### Sync Inventory
Sync inventory data for a catalog SKU.

```http
POST /api/commerce/sync-inventory/:catalogSkuId
```

#### Response
```typescript
interface InventorySyncResponse {
  success: true
  data: {
    syncStatus: InventorySyncStatus
  }
}
```

---

## 📊 Analytics API

### Get Search Analytics
Retrieve search analytics and trends.

```http
GET /api/catalog/analytics/search
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | Time period (1h, 24h, 7d, 30d) |
| `game` | string | Filter by game |

#### Response
```typescript
interface SearchAnalyticsResponse {
  success: true
  data: {
    metrics: {
      totalSearches: number
      uniqueQueries: number
      averageResultsPerQuery: number
      topQueries: Array<{ query: string; count: number }>
      noResultsQueries: Array<{ query: string; count: number }>
    }
    trends: {
      searchVolume: Array<{ timestamp: string; count: number }>
      popularGames: Array<{ game: string; percentage: number }>
    }
  }
}
```

---

## 📱 Mobile API Optimizations

### Get Card Summary
Get optimized card data for mobile list views.

```http
GET /api/catalog/cards/:id/summary
```

#### Response
```typescript
interface CardSummaryResponse {
  success: true
  data: {
    card: {
      id: string
      name: string
      gameCode: string
      primaryType: string
      rarity: string
      thumbnailUrl: string
      blurhash: string
      price?: {
        lowest: number
        average: number
        currency: string
      }
    }
  }
}
```

### Get Lightweight Search
Optimized search for mobile with minimal data.

```http
GET /api/catalog/search/mobile
```

#### Query Parameters
Same as regular search, but returns minimal data optimized for mobile bandwidth.

---

## Rate Limiting

### Limits
- **Public API**: 1000 requests per hour per IP
- **Authenticated API**: 5000 requests per hour per user
- **Bulk Operations**: 100 requests per hour per user
- **ETL Operations**: 10 requests per hour per user

### Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1634567890
Retry-After: 3600
```

## Webhooks

### ETL Job Completion
```http
POST <your-webhook-url>
Content-Type: application/json

{
  "event": "etl.job.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "jobId": "uuid",
    "gameCode": "MTG",
    "jobType": "INCREMENTAL",
    "status": "COMPLETED",
    "recordsProcessed": 1250,
    "duration": 300000
  }
}
```

### Product Match Completion
```http
POST <your-webhook-url>
Content-Type: application/json

{
  "event": "commerce.match.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "jobId": "uuid",
    "totalProducts": 500,
    "successfulMatches": 485,
    "confidence": {
      "high": 400,
      "medium": 85,
      "low": 15
    }
  }
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { SideDeckedAPI } from '@sidedecked/api-client'

const api = new SideDeckedAPI({
  baseURL: 'https://api.sidedecked.com',
  apiKey: 'your-api-key'
})

// Search cards
const searchResults = await api.cards.search({
  query: 'Lightning Bolt',
  game: 'MTG',
  limit: 10
})

// Get card details
const card = await api.cards.get('card-uuid', {
  includePrints: true,
  includePrices: true
})

// Start ETL job
const etlJob = await api.etl.start({
  gameCode: 'MTG',
  jobType: 'INCREMENTAL'
})
```

### Python
```python
from sidedecked import SideDeckedAPI

api = SideDeckedAPI(
    base_url='https://api.sidedecked.com',
    api_key='your-api-key'
)

# Search cards
results = api.cards.search(
    query='Lightning Bolt',
    game='MTG',
    limit=10
)

# Get card details
card = api.cards.get(
    'card-uuid',
    include_prints=True,
    include_prices=True
)
```

This API reference provides comprehensive documentation for integrating with the SideDecked TCG Catalog system.