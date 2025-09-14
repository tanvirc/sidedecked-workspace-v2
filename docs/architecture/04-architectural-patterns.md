# Architectural Patterns

**Version**: 1.3  
**Last Updated**: 2025-09-11  
**Author**: SideDecked Architecture Team  
**Reviewers**: [Development Team]  
**Status**: Approved

## Overview

This document defines the architectural patterns used throughout the SideDecked platform. These patterns ensure consistency, maintainability, and scalability across all services while supporting the split-brain architecture.

## Service Patterns

### 1. Commerce Service Pattern (MercurJS)

**Context**: Backend services that handle commerce operations within the MercurJS framework.

**Pattern Implementation**:
```typescript
import { TransactionBaseService } from "@medusajs/medusa"
import { Logger } from "@medusajs/medusa"

export class VendorService extends TransactionBaseService {
  private readonly logger: Logger

  constructor(container: any) {
    super(container)
    this.logger = container.logger
  }

  /**
   * All database operations must use transaction manager
   */
  async createVendor(vendorData: CreateVendorRequest): Promise<Vendor> {
    return await this.atomicPhase_(async (manager) => {
      // All operations within transaction
      const vendor = manager.create(Vendor, vendorData)
      const savedVendor = await manager.save(vendor)
      
      // Create associated entities
      const settings = manager.create(VendorSettings, {
        vendorId: savedVendor.id,
        autoAcceptOrders: false
      })
      await manager.save(settings)
      
      // Emit domain events
      await this.eventBus_.emit('vendor.created', {
        id: savedVendor.id,
        businessName: savedVendor.businessName
      })
      
      this.logger.info('Vendor created', { 
        vendorId: savedVendor.id,
        businessName: savedVendor.businessName 
      })
      
      return savedVendor
    })
  }

  /**
   * Query operations can use repository directly
   */
  async findVendorsByStatus(status: VendorStatus): Promise<Vendor[]> {
    return await this.vendorRepository_.find({
      where: { verificationStatus: status }
    })
  }
}
```

**Key Principles**:
- Extend `TransactionBaseService` for transaction support
- Use `atomicPhase_` for all write operations
- Inject dependencies through constructor
- Emit domain events for significant operations
- Use structured logging with context

### 2. Customer Backend Service Pattern

**Context**: Customer experience services using Node.js and TypeORM.

**Pattern Implementation**:
```typescript
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Deck } from '../entities/deck.entity'

@Injectable()
export class DeckService {
  private readonly logger = new Logger(DeckService.name)

  constructor(
    @InjectRepository(Deck)
    private readonly deckRepository: Repository<Deck>,
    private readonly validationService: DeckValidationService,
    private readonly eventEmitter: EventEmitter
  ) {}

  async createDeck(
    userId: string, 
    deckData: CreateDeckDto
  ): Promise<Deck> {
    const queryRunner = this.deckRepository.manager.connection.createQueryRunner()
    await queryRunner.startTransaction()

    try {
      // Validate business rules
      await this.validateCreateRequest(userId, deckData)
      
      // Create deck entity
      const deck = this.deckRepository.create({
        ...deckData,
        userId,
        isValid: false
      })
      
      const savedDeck = await queryRunner.manager.save(deck)
      
      // Validate deck format
      const validation = await this.validationService.validateDeck(savedDeck)
      savedDeck.isValid = validation.isValid
      savedDeck.validationErrors = validation.errors
      
      await queryRunner.manager.save(savedDeck)
      await queryRunner.commitTransaction()
      
      // Emit events after successful commit
      this.eventEmitter.emit('deck.created', {
        deckId: savedDeck.id,
        userId,
        game: savedDeck.game,
        format: savedDeck.format
      })
      
      this.logger.log(`Deck created: ${savedDeck.id} for user ${userId}`)
      
      return savedDeck
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.logger.error(`Failed to create deck for user ${userId}: ${error.message}`)
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  private async validateCreateRequest(
    userId: string, 
    deckData: CreateDeckDto
  ): Promise<void> {
    // Business rule validation
    const userDeckCount = await this.deckRepository.count({
      where: { userId, isArchived: false }
    })
    
    if (userDeckCount >= 100) { // Max decks per user
      throw new BusinessRuleViolationError('Maximum deck limit reached')
    }
    
    // Validate format is supported for game
    const supportedFormats = await this.getFormatsForGame(deckData.game)
    if (!supportedFormats.includes(deckData.format)) {
      throw new ValidationError(`Format ${deckData.format} not supported for ${deckData.game}`)
    }
  }
}
```

**Key Principles**:
- Use NestJS dependency injection
- Implement explicit transaction management for complex operations
- Validate business rules before persistence
- Emit events after successful operations
- Use structured logging with correlation context

### 3. API Controller Pattern

**Context**: Consistent API endpoint implementations across all services.

**Pattern Implementation**:
```typescript
import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { DeckService } from '../services/deck.service'

export class DeckController {
  constructor(
    private readonly deckService: DeckService,
    private readonly logger: Logger
  ) {}

  /**
   * @openapi
   * /api/decks:
   *   post:
   *     summary: Create a new deck
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateDeckRequest'
   *     responses:
   *       201:
   *         description: Deck created successfully
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Authentication required
   */
  async createDeck(req: Request, res: Response): Promise<void> {
    const correlationId = req.headers['x-correlation-id'] as string
    const userId = req.user?.id
    
    try {
      // Input validation
      const createDeckDto = new CreateDeckDto()
      Object.assign(createDeckDto, req.body)
      
      const validationErrors = await validate(createDeckDto)
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors.map(err => ({
            field: err.property,
            constraints: err.constraints
          }))
        })
        return
      }
      
      // Business logic
      const deck = await this.deckService.createDeck(userId, createDeckDto)
      
      // Success response
      res.status(201).json({
        success: true,
        data: {
          id: deck.id,
          name: deck.name,
          format: deck.format,
          game: deck.game,
          isPublic: deck.isPublic,
          cardCount: deck.totalCards,
          isValid: deck.isValid,
          createdAt: deck.created_at
        }
      })
      
    } catch (error) {
      this.handleError(error, res, correlationId)
    }
  }

  private handleError(
    error: Error, 
    res: Response, 
    correlationId: string
  ): void {
    this.logger.error('API error', {
      error: error.message,
      stack: error.stack,
      correlationId
    })

    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
        correlationId
      })
    } else if (error instanceof AuthorizationError) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
        correlationId
      })
    } else if (error instanceof BusinessRuleViolationError) {
      res.status(400).json({
        success: false,
        error: 'Business rule violation',
        message: error.message,
        correlationId
      })
    } else {
      // Unknown error - don't leak details
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        correlationId
      })
    }
  }
}
```

**Key Principles**:
- Validate input using class-validator
- Use correlation IDs for request tracing
- Implement consistent error handling
- Return standardized response format
- Document APIs with OpenAPI annotations

## Data Access Patterns

### 4. Repository Pattern

**Context**: Consistent data access across all entities with performance optimization.

**Pattern Implementation**:
```typescript
import { Repository, EntityRepository, SelectQueryBuilder } from 'typeorm'
import { Deck } from '../entities/deck.entity'

@EntityRepository(Deck)
export class DeckRepository extends Repository<Deck> {
  
  /**
   * Find decks with optimized loading
   */
  async findDecksWithCards(
    userId: string, 
    options: FindDecksOptions = {}
  ): Promise<PaginatedResult<Deck>> {
    const queryBuilder = this.createQueryBuilder('deck')
      .leftJoinAndSelect('deck.cards', 'deckCard')
      .leftJoinAndSelect('deckCard.card', 'card')
      .leftJoinAndSelect('card.game', 'game')
      .where('deck.userId = :userId', { userId })

    // Apply filters
    if (options.game) {
      queryBuilder.andWhere('deck.game = :game', { game: options.game })
    }
    
    if (options.format) {
      queryBuilder.andWhere('deck.format = :format', { format: options.format })
    }
    
    if (options.isPublic !== undefined) {
      queryBuilder.andWhere('deck.isPublic = :isPublic', { isPublic: options.isPublic })
    }

    // Apply sorting
    queryBuilder.orderBy('deck.updated_at', 'DESC')

    // Apply pagination
    const page = options.page || 1
    const limit = Math.min(options.limit || 20, 100) // Max 100 per page
    const offset = (page - 1) * limit

    queryBuilder.skip(offset).take(limit)

    const [decks, total] = await queryBuilder.getManyAndCount()

    return {
      data: decks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Search decks with performance optimization
   */
  async searchDecks(query: string, options: SearchOptions = {}): Promise<Deck[]> {
    const queryBuilder = this.createQueryBuilder('deck')
      .where('deck.isPublic = true') // Only search public decks
      .andWhere(
        '(deck.name ILIKE :query OR deck.description ILIKE :query OR :query = ANY(deck.tags))',
        { query: `%${query}%` }
      )

    // Use indexes for performance
    if (options.game) {
      queryBuilder.andWhere('deck.game = :game', { game: options.game })
    }

    return queryBuilder
      .orderBy('deck.totalViews', 'DESC') // Popular first
      .limit(50) // Limit search results
      .getMany()
  }

  /**
   * Bulk update with performance optimization
   */
  async updateDeckStatistics(deckId: string, stats: DeckStatistics): Promise<void> {
    await this.update(deckId, {
      totalCards: stats.totalCards,
      estimatedValue: stats.estimatedValue,
      completionPercentage: stats.completionPercentage,
      updated_at: new Date()
    })
  }
}
```

### 5. Entity Pattern

**Context**: Consistent entity definitions with business logic encapsulation.

**Pattern Implementation**:
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index
} from 'typeorm'

@Entity('decks')
@Index(['userId', 'game']) // Compound index for performance
@Index(['isPublic', 'game', 'format']) // Search optimization
export class Deck {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  @Index() // Single column index
  userId: string

  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'varchar', length: 50 })
  format: string

  @Column({ 
    type: 'enum', 
    enum: ['MTG', 'POKEMON', 'YUGIOH', 'OPTCG'] 
  })
  game: string

  @Column({ type: 'boolean', default: false })
  @Index() // For public deck queries
  isPublic: boolean

  @Column({ type: 'boolean', default: false })
  isArchived: boolean

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[]

  @Column({ type: 'varchar', nullable: true })
  coverImage?: string

  // Computed fields (updated via triggers or application logic)
  @Column({ type: 'integer', default: 0 })
  totalCards: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  estimatedValue: number

  @Column({ type: 'integer', default: 0 })
  completionPercentage: number

  @Column({ type: 'integer', default: 0 })
  likes: number

  @Column({ type: 'integer', default: 0 })
  views: number

  @Column({ type: 'integer', default: 0 })
  copies: number

  // Validation status
  @Column({ type: 'boolean', default: false })
  isValid: boolean

  @Column({ type: 'jsonb', nullable: true })
  validationErrors?: ValidationError[]

  @Column({ type: 'timestamp', nullable: true })
  lastValidated?: Date

  // Relationships
  @OneToMany(() => DeckCard, deckCard => deckCard.deck, { 
    cascade: true,
    eager: false // Don't auto-load for performance
  })
  cards: DeckCard[]

  // Timestamps
  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  // Business logic methods
  addCard(cardId: string, quantity: number = 1, zone: string = 'main'): DeckCard {
    const existingCard = this.cards.find(dc => 
      dc.cardId === cardId && dc.zone === zone
    )

    if (existingCard) {
      existingCard.quantity += quantity
      return existingCard
    }

    const newDeckCard = new DeckCard()
    newDeckCard.deckId = this.id
    newDeckCard.cardId = cardId
    newDeckCard.quantity = quantity
    newDeckCard.zone = zone

    this.cards.push(newDeckCard)
    return newDeckCard
  }

  removeCard(cardId: string, zone: string = 'main'): boolean {
    const cardIndex = this.cards.findIndex(dc => 
      dc.cardId === cardId && dc.zone === zone
    )

    if (cardIndex === -1) {
      return false
    }

    this.cards.splice(cardIndex, 1)
    return true
  }

  getCardsByZone(zone: string): DeckCard[] {
    return this.cards.filter(dc => dc.zone === zone)
  }

  calculateTotalCards(): number {
    return this.cards.reduce((total, card) => total + card.quantity, 0)
  }

  // Validation method
  validateDeckSize(): ValidationResult {
    const totalCards = this.calculateTotalCards()
    const mainCards = this.getCardsByZone('main').reduce(
      (total, card) => total + card.quantity, 0
    )

    const errors: ValidationError[] = []

    // Game-specific validation
    switch (this.game) {
      case 'MTG':
        if (this.format === 'Commander' && mainCards !== 99) {
          errors.push({
            type: 'deck_size',
            message: 'Commander deck must have exactly 99 cards in main deck'
          })
        } else if (this.format !== 'Commander' && mainCards < 60) {
          errors.push({
            type: 'deck_size',
            message: 'Deck must have at least 60 cards'
          })
        }
        break
        
      case 'POKEMON':
        if (totalCards !== 60) {
          errors.push({
            type: 'deck_size',
            message: 'Pokemon deck must have exactly 60 cards'
          })
        }
        break
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
```

## Frontend Patterns

### 6. Component Pattern

**Context**: Consistent React component structure with performance optimization.

**Pattern Implementation**:
```typescript
import React, { memo, useCallback, useMemo } from 'react'
import { Card } from '../types/card.types'
import { useFeedback } from '../hooks/useFeedback'
import { OptimizedImage } from './ui/OptimizedImage'

interface DeckCardListProps {
  cards: DeckCard[]
  onCardAdd?: (card: Card) => void
  onCardRemove?: (cardId: string) => void
  onCardQuantityChange?: (cardId: string, quantity: number) => void
  readOnly?: boolean
  className?: string
}

export const DeckCardList = memo<DeckCardListProps>(({
  cards,
  onCardAdd,
  onCardRemove,
  onCardQuantityChange,
  readOnly = false,
  className = ''
}) => {
  const { executeWithFeedback, loading } = useFeedback('deck-card-operations')

  // Memoize expensive calculations
  const groupedCards = useMemo(() => {
    return cards.reduce((groups, card) => {
      if (!groups[card.zone]) {
        groups[card.zone] = []
      }
      groups[card.zone].push(card)
      return groups
    }, {} as Record<string, DeckCard[]>)
  }, [cards])

  const totalCards = useMemo(() => {
    return cards.reduce((total, card) => total + card.quantity, 0)
  }, [cards])

  // Memoized callbacks to prevent unnecessary re-renders
  const handleCardRemove = useCallback((cardId: string) => {
    if (onCardRemove && !readOnly) {
      executeWithFeedback(
        () => onCardRemove(cardId),
        null,
        `Card removed from deck`
      )
    }
  }, [onCardRemove, readOnly, executeWithFeedback])

  const handleQuantityChange = useCallback((cardId: string, quantity: number) => {
    if (onCardQuantityChange && !readOnly) {
      executeWithFeedback(
        () => onCardQuantityChange(cardId, quantity),
        null,
        `Card quantity updated`
      )
    }
  }, [onCardQuantityChange, readOnly, executeWithFeedback])

  const renderCardZone = useCallback((zoneName: string, zoneCards: DeckCard[]) => (
    <div key={zoneName} className="card-zone" data-testid={`zone-${zoneName}`}>
      <h3 className="zone-title">
        {zoneName.charAt(0).toUpperCase() + zoneName.slice(1)} 
        ({zoneCards.reduce((total, card) => total + card.quantity, 0)})
      </h3>
      
      <div className="zone-cards">
        {zoneCards.map(deckCard => (
          <DeckCardItem
            key={`${deckCard.cardId}-${deckCard.zone}`}
            deckCard={deckCard}
            onRemove={handleCardRemove}
            onQuantityChange={handleQuantityChange}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  ), [handleCardRemove, handleQuantityChange, readOnly])

  if (loading) {
    return <div className="loading-spinner" aria-label="Loading deck cards..." />
  }

  return (
    <div className={`deck-card-list ${className}`} data-testid="deck-card-list">
      <div className="deck-summary">
        <span className="total-cards">Total Cards: {totalCards}</span>
      </div>

      <div className="card-zones">
        {Object.entries(groupedCards).map(([zoneName, zoneCards]) =>
          renderCardZone(zoneName, zoneCards)
        )}
      </div>
    </div>
  )
})

DeckCardList.displayName = 'DeckCardList'
```

### 7. Hook Pattern

**Context**: Custom hooks for reusable logic with proper error handling and loading states.

**Pattern Implementation**:
```typescript
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDebounce } from './useDebounce'

interface UseSearchOptions {
  debounceDelay?: number
  minQueryLength?: number
  maxResults?: number
}

interface SearchResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  hasMore: boolean
  total: number
}

export function useSearch<T>(
  searchFn: (query: string, options?: any) => Promise<{ data: T[], total: number }>,
  options: UseSearchOptions = {}
): [string, (query: string) => void, SearchResult<T>] {
  
  const {
    debounceDelay = 300,
    minQueryLength = 2,
    maxResults = 50
  } = options

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const debouncedQuery = useDebounce(query, debounceDelay)

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setResults([])
      setTotal(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await searchFn(searchQuery, {
        limit: maxResults
      })
      
      setResults(result.data)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [searchFn, minQueryLength, maxResults])

  useEffect(() => {
    search(debouncedQuery)
  }, [debouncedQuery, search])

  const result = useMemo<SearchResult<T>>(() => ({
    data: results,
    loading,
    error,
    hasMore: results.length < total,
    total
  }), [results, loading, error, total])

  return [query, setQuery, result]
}

// Usage example
export function CardSearchComponent() {
  const [query, setQuery, searchResult] = useSearch(
    useCallback(async (query: string) => {
      const response = await fetch(`/api/cards/search?q=${encodeURIComponent(query)}`)
      return response.json()
    }, []),
    {
      debounceDelay: 300,
      minQueryLength: 2,
      maxResults: 20
    }
  )

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cards..."
      />
      
      {searchResult.loading && <div>Searching...</div>}
      {searchResult.error && <div>Error: {searchResult.error}</div>}
      
      <div>
        {searchResult.data.map(card => (
          <div key={card.id}>{card.name}</div>
        ))}
      </div>
    </div>
  )
}
```

## Performance Patterns

### 8. Caching Pattern

**Context**: Multi-layer caching strategy for optimal performance.

**Pattern Implementation**:
```typescript
import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class CacheService {
  constructor(private readonly redis: Redis) {}

  /**
   * L1: Application-level cache (in-memory)
   * L2: Redis cache (distributed)
   * L3: Database (source of truth)
   */
  async getCachedData<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: {
      ttl?: number // seconds
      useL1Cache?: boolean
      refreshThreshold?: number // percentage of TTL
    } = {}
  ): Promise<T> {
    const { ttl = 300, useL1Cache = true, refreshThreshold = 0.8 } = options

    // L1 Cache check (in-memory)
    if (useL1Cache && this.l1Cache.has(key)) {
      const cached = this.l1Cache.get(key)
      if (cached && Date.now() < cached.expiresAt) {
        // Background refresh if near expiry
        if (Date.now() > cached.expiresAt * refreshThreshold) {
          this.backgroundRefresh(key, fetchFunction, ttl)
        }
        return cached.data
      }
    }

    // L2 Cache check (Redis)
    const redisValue = await this.redis.get(key)
    if (redisValue) {
      const cached = JSON.parse(redisValue)
      
      // Update L1 cache
      if (useL1Cache) {
        this.l1Cache.set(key, {
          data: cached.data,
          expiresAt: Date.now() + (ttl * 1000)
        })
      }
      
      return cached.data
    }

    // L3: Fetch from source
    const data = await fetchFunction()
    
    // Store in all cache layers
    await this.setCachedData(key, data, ttl, useL1Cache)
    
    return data
  }

  private async setCachedData<T>(
    key: string,
    data: T,
    ttl: number,
    useL1Cache: boolean
  ): Promise<void> {
    // Store in Redis
    await this.redis.setex(key, ttl, JSON.stringify({ data, cachedAt: Date.now() }))
    
    // Store in L1 cache
    if (useL1Cache) {
      this.l1Cache.set(key, {
        data,
        expiresAt: Date.now() + (ttl * 1000)
      })
    }
  }

  private async backgroundRefresh<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number
  ): Promise<void> {
    try {
      const data = await fetchFunction()
      await this.setCachedData(key, data, ttl, true)
    } catch (error) {
      // Log error but don't throw - we still have cached data
      console.error(`Background refresh failed for key ${key}:`, error)
    }
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  async invalidateTagged(tags: string[]): Promise<void> {
    for (const tag of tags) {
      const tagKey = `tag:${tag}`
      const keys = await this.redis.smembers(tagKey)
      if (keys.length > 0) {
        await this.redis.del(...keys)
        await this.redis.del(tagKey)
      }
    }
  }
}
```

## Error Handling Patterns

### 9. Comprehensive Error Handling

**Context**: Consistent error handling across all services with proper logging and user feedback.

**Pattern Implementation**:
```typescript
// Custom error hierarchy
export abstract class BaseError extends Error {
  abstract readonly statusCode: number
  abstract readonly errorCode: string
  abstract readonly userMessage: string
  
  constructor(
    message: string,
    public readonly context?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError extends BaseError {
  readonly statusCode = 400
  readonly errorCode = 'VALIDATION_ERROR'
  readonly userMessage = 'The provided data is invalid'
  
  constructor(
    message: string,
    public readonly validationDetails?: ValidationDetail[],
    context?: Record<string, any>
  ) {
    super(message, context)
  }
}

export class BusinessRuleViolationError extends BaseError {
  readonly statusCode = 400
  readonly errorCode = 'BUSINESS_RULE_VIOLATION'
  readonly userMessage: string
  
  constructor(userMessage: string, message?: string, context?: Record<string, any>) {
    super(message || userMessage, context)
    this.userMessage = userMessage
  }
}

export class NotFoundError extends BaseError {
  readonly statusCode = 404
  readonly errorCode = 'NOT_FOUND'
  readonly userMessage = 'The requested resource was not found'
}

// Error handling middleware
export class ErrorHandlerMiddleware {
  constructor(private readonly logger: Logger) {}

  handle(error: Error, req: Request, res: Response, next: NextFunction): void {
    const correlationId = req.headers['x-correlation-id'] as string
    
    // Log error with context
    this.logger.error('Request failed', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      correlationId,
      userId: req.user?.id,
      ...(error instanceof BaseError ? error.context : {})
    })

    // Handle known errors
    if (error instanceof BaseError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.errorCode,
        message: error.userMessage,
        ...(error instanceof ValidationError && { 
          validationErrors: error.validationDetails 
        }),
        correlationId
      })
      return
    }

    // Handle unknown errors
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      correlationId
    })
  }
}

// Service error handling pattern
export class DeckService {
  async createDeck(userId: string, deckData: CreateDeckDto): Promise<Deck> {
    try {
      // Business validation
      if (!this.isSupportedFormat(deckData.game, deckData.format)) {
        throw new ValidationError(
          `Format ${deckData.format} is not supported for ${deckData.game}`,
          [{
            field: 'format',
            message: 'Unsupported format for the selected game',
            code: 'UNSUPPORTED_FORMAT'
          }]
        )
      }

      // Business rule checking
      const userDeckCount = await this.countUserDecks(userId)
      if (userDeckCount >= 100) {
        throw new BusinessRuleViolationError(
          'You have reached the maximum number of decks allowed (100)',
          'User deck limit exceeded',
          { userId, currentCount: userDeckCount, limit: 100 }
        )
      }

      return await this.createDeckInternal(userId, deckData)
      
    } catch (error) {
      // Re-throw known errors
      if (error instanceof BaseError) {
        throw error
      }

      // Wrap unknown errors
      throw new Error(`Failed to create deck: ${error.message}`)
    }
  }
}
```

## Testing Patterns

### 10. Testing Pattern

**Context**: Comprehensive testing strategy with consistent patterns.

**Pattern Implementation**:
```typescript
// Service testing pattern
describe('DeckService', () => {
  let service: DeckService
  let mockRepository: jest.Mocked<Repository<Deck>>
  let mockValidationService: jest.Mocked<DeckValidationService>
  let mockEventEmitter: jest.Mocked<EventEmitter>

  beforeEach(() => {
    mockRepository = createMockRepository()
    mockValidationService = createMockValidationService()
    mockEventEmitter = createMockEventEmitter()

    service = new DeckService(
      mockRepository,
      mockValidationService,
      mockEventEmitter
    )
  })

  describe('createDeck', () => {
    it('should create a valid deck successfully', async () => {
      // Arrange
      const userId = 'user-123'
      const deckData = {
        name: 'Test Deck',
        format: 'Standard',
        game: 'MTG',
        isPublic: false
      }
      
      const expectedDeck = {
        id: 'deck-123',
        ...deckData,
        userId,
        isValid: true,
        created_at: new Date()
      }

      mockRepository.create.mockReturnValue(expectedDeck as any)
      mockRepository.save.mockResolvedValue(expectedDeck as any)
      mockValidationService.validateDeck.mockResolvedValue({
        isValid: true,
        errors: []
      })

      // Act
      const result = await service.createDeck(userId, deckData)

      // Assert
      expect(result).toEqual(expectedDeck)
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...deckData,
        userId,
        isValid: false
      })
      expect(mockValidationService.validateDeck).toHaveBeenCalledWith(expectedDeck)
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('deck.created', {
        deckId: expectedDeck.id,
        userId,
        game: deckData.game,
        format: deckData.format
      })
    })

    it('should handle validation errors', async () => {
      // Arrange
      const userId = 'user-123'
      const deckData = {
        name: '',
        format: 'InvalidFormat',
        game: 'MTG'
      }

      // Act & Assert
      await expect(service.createDeck(userId, deckData))
        .rejects
        .toThrow(ValidationError)
    })

    it('should handle business rule violations', async () => {
      // Arrange
      const userId = 'user-123'
      const deckData = {
        name: 'Test Deck',
        format: 'Standard',
        game: 'MTG'
      }

      jest.spyOn(service, 'countUserDecks').mockResolvedValue(100)

      // Act & Assert
      await expect(service.createDeck(userId, deckData))
        .rejects
        .toThrow(BusinessRuleViolationError)
    })
  })
})

// Integration testing pattern
describe('DeckController Integration', () => {
  let app: TestingModule
  let request: supertest.SuperTest<supertest.Test>

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DeckService)
      .useValue(createMockDeckService())
      .compile()

    const nestApp = app.createNestApplication()
    await nestApp.init()
    request = supertest(nestApp.getHttpServer())
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /api/decks', () => {
    it('should create deck and return 201', async () => {
      const deckData = {
        name: 'Test Deck',
        format: 'Standard',
        game: 'MTG',
        isPublic: false
      }

      const response = await request
        .post('/api/decks')
        .set('Authorization', 'Bearer valid-token')
        .send(deckData)
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          name: deckData.name,
          format: deckData.format,
          game: deckData.game
        }
      })
    })

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        format: 'InvalidFormat'
      }

      const response = await request
        .post('/api/decks')
        .set('Authorization', 'Bearer valid-token')
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
    })
  })
})
```

## References

- [System Overview](./01-system-overview.md)
- [Architectural Principles](./02-architectural-principles.md)
- [Domain Models](./03-domain-models.md)
- [Code Standards](../standards/code-standards.md)
- [Testing Standards](../standards/testing-standards.md)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.3 | 2025-09-11 | Added comprehensive testing patterns and error handling |
| 1.2 | 2025-01-15 | Enhanced performance and caching patterns |
| 1.1 | 2025-01-01 | Added frontend patterns and component structure |
| 1.0 | 2024-12-01 | Initial architectural patterns definition |