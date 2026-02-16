# Code Standards

**MANDATORY: These code standards are NON-NEGOTIABLE and must be followed for ALL code, without exception.**

## Core Principles

### TypeScript Strict Mode
**REQUIREMENT: ALL repositories must use TypeScript strict mode**

```json
// tsconfig.json (ALL repositories)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true
  }
}
```

### Code Quality Requirements
- **Zero ESLint errors**: All code must pass linting
- **Zero TypeScript errors**: All code must pass type checking
- **No console.log statements**: Use proper logging
- **No TODO comments**: Convert to GitHub issues
- **No dead code**: Remove unused imports, variables, functions
- **Consistent formatting**: Use Prettier configuration

## Repository-Specific Standards

### Backend (MercurJS Commerce)

#### Service Pattern
```typescript
// ✅ CORRECT: MercurJS Service Pattern
import { TransactionBaseService } from "@medusajs/medusa"
import { Logger } from "@medusajs/medusa"

export class TCGCatalogService extends TransactionBaseService {
  private readonly logger: Logger

  constructor(container: any) {
    super(container)
    this.logger = container.logger
  }

  async importFromScryfall(): Promise<ImportResult> {
    return await this.atomicPhase_(async (manager) => {
      try {
        // Use transaction manager for database operations
        const result = await this.performImport(manager)
        this.logger.info("Scryfall import completed", { count: result.imported })
        return result
      } catch (error) {
        this.logger.error("Scryfall import failed", { error: error.message })
        throw error
      }
    })
  }
}

// ❌ INCORRECT: Non-transactional service
export class BadService {
  async importCards() {
    // No transaction management
    // No error handling
    // No logging
    const cards = await fetch("/api/cards")
    // Direct database access
    await db.cards.save(cards)
  }
}
```

#### API Route Pattern
```typescript
// ✅ CORRECT: MercurJS API Route Pattern
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { TCGCatalogService } from "../../../services/tcg-catalog.service"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const tcgCatalogService = req.scope.resolve<TCGCatalogService>("tcgCatalogService")
  
  try {
    const result = await tcgCatalogService.importFromScryfall()
    
    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    req.logger.error("Import failed", { error: error.message })
    
    res.status(500).json({
      success: false,
      error: "Import failed",
      message: error.message
    })
  }
}

// ❌ INCORRECT: Non-MercurJS pattern
export async function handler(req: any, res: any) {
  // No proper typing
  // No service injection
  // No error handling
  const data = await doSomething()
  res.json(data)
}
```

#### Entity Pattern
```typescript
// ✅ CORRECT: MercurJS Entity Pattern
import { BaseEntity } from "@medusajs/medusa"
import { Entity, Column, ManyToOne, OneToMany } from "typeorm"
import { Game } from "./game.entity"
import { Print } from "./print.entity"

@Entity()
export class Card extends BaseEntity {
  @Column({ type: "varchar", length: 255 })
  oracle_id: string

  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "text", nullable: true })
  description?: string

  @ManyToOne(() => Game, (game) => game.cards)
  game: Game

  @Column({ type: "varchar", length: 50 })
  game_id: string

  @OneToMany(() => Print, (print) => print.card)
  prints: Print[]

  // TCG-specific fields stored as JSONB
  @Column({ type: "jsonb", nullable: true })
  game_data?: {
    mana_cost?: string        // MTG
    power?: number           // MTG, YGO
    toughness?: number       // MTG, YGO
    hp?: number             // Pokemon
    energy_cost?: string[]   // Pokemon
    card_type?: string      // All games
    rarity?: string         // All games
  }
}

// ❌ INCORRECT: Non-BaseEntity pattern
export interface Card {
  // No proper entity inheritance
  // No TypeORM decorators
  // No type safety
  id: string
  name: string
  data: any // Avoid 'any' type
}
```

### Customer Backend (Node.js + TypeORM)

#### Service Pattern
```typescript
// ✅ CORRECT: Customer Backend Service Pattern
import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Deck } from "../entities/deck.entity"
import { DeckValidationService } from "./deck-validation.service"

@Injectable()
export class DeckService {
  private readonly logger = new Logger(DeckService.name)

  constructor(
    @InjectRepository(Deck)
    private readonly deckRepository: Repository<Deck>,
    private readonly validationService: DeckValidationService
  ) {}

  async createDeck(deckData: CreateDeckDto): Promise<Deck> {
    try {
      // Validate input
      const validation = await this.validationService.validateDeck(deckData)
      if (!validation.isValid) {
        throw new BadRequestException(validation.errors.join(", "))
      }

      // Create entity
      const deck = this.deckRepository.create(deckData)
      const savedDeck = await this.deckRepository.save(deck)

      this.logger.log(`Deck created: ${savedDeck.id}`)
      return savedDeck
    } catch (error) {
      this.logger.error(`Failed to create deck: ${error.message}`)
      throw error
    }
  }
}

// ❌ INCORRECT: Poor service pattern
export class BadDeckService {
  async createDeck(data: any) {
    // No validation
    // No error handling
    // No logging
    // No proper typing
    return await db.decks.save(data)
  }
}
```

#### Entity Pattern
```typescript
// ✅ CORRECT: TypeORM Entity Pattern
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from "typeorm"
import { User } from "./user.entity"
import { DeckCard } from "./deck-card.entity"

@Entity("decks")
export class Deck {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "varchar", length: 50 })
  format: string

  @Column({ type: "varchar", length: 20 })
  game: "MTG" | "POKEMON" | "YUGIOH" | "OPTCG"

  @Column({ type: "boolean", default: false })
  is_public: boolean

  @Column({ type: "text", nullable: true })
  description?: string

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "user_id" })
  user: User

  @Column({ type: "uuid" })
  user_id: string

  @OneToMany(() => DeckCard, (deckCard) => deckCard.deck, { 
    cascade: true,
    eager: false 
  })
  cards: DeckCard[]

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  // Computed properties
  get card_count(): number {
    return this.cards?.reduce((total, card) => total + card.quantity, 0) ?? 0
  }

  get is_valid(): boolean {
    // Basic validation - detailed validation in service
    return this.card_count >= 60 // Minimum deck size
  }
}
```

### Frontend (Next.js + React)

#### Component Pattern
```typescript
// ✅ CORRECT: React Component Pattern
import { FC, useState, useEffect, useCallback } from "react"
import { Card } from "../types/card.types"
import { useFeedback } from "../hooks/useFeedback"
import { OptimizedImage } from "./ui/OptimizedImage"
import { LoadingSpinner } from "./ui/LoadingSpinner"

interface CardDetailProps {
  cardId: string
  onAddToCart?: (card: Card) => void
  onAddToWishlist?: (card: Card) => void
  className?: string
}

export const CardDetail: FC<CardDetailProps> = ({
  cardId,
  onAddToCart,
  onAddToWishlist,
  className = ""
}) => {
  const [card, setCard] = useState<Card | null>(null)
  const { executeWithFeedback, loading, error } = useFeedback("load-card")

  const loadCard = useCallback(async () => {
    const response = await fetch(`/api/cards/${cardId}`)
    if (!response.ok) {
      throw new Error(`Failed to load card: ${response.statusText}`)
    }
    return response.json()
  }, [cardId])

  useEffect(() => {
    executeWithFeedback(loadCard, setCard)
  }, [cardId, executeWithFeedback, loadCard])

  const handleAddToCart = useCallback(() => {
    if (card && onAddToCart) {
      onAddToCart(card)
    }
  }, [card, onAddToCart])

  if (loading) {
    return <LoadingSpinner className="w-8 h-8" />
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading card: {error}
      </div>
    )
  }

  if (!card) {
    return null
  }

  return (
    <div className={`card-detail ${className}`} data-testid="card-detail">
      <OptimizedImage
        src={card.image_url}
        alt={card.name}
        width={400}
        height={560}
        className="rounded-lg"
        priority
      />
      
      <div className="card-info p-4">
        <h1 className="text-2xl font-bold">{card.name}</h1>
        <p className="text-gray-600">{card.set_name}</p>
        
        {card.mana_cost && (
          <div className="mana-cost mt-2">
            {/* Mana cost rendering logic */}
          </div>
        )}
        
        <div className="actions mt-4 space-x-2">
          {onAddToCart && (
            <button
              onClick={handleAddToCart}
              className="btn btn-primary"
              data-testid="add-to-cart-button"
            >
              Add to Cart
            </button>
          )}
          
          {onAddToWishlist && (
            <button
              onClick={() => onAddToWishlist(card)}
              className="btn btn-secondary"
              data-testid="add-to-wishlist-button"
            >
              Add to Wishlist
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ❌ INCORRECT: Poor component pattern
export function BadCard(props: any) {
  // No type safety
  // No error handling
  // No loading states
  // Direct DOM manipulation
  const [card, setCard] = useState(null)
  
  useEffect(() => {
    fetch("/api/cards/" + props.id)
      .then(res => res.json())
      .then(setCard)
  }, [])

  return (
    <div>
      {card ? card.name : "Loading..."}
    </div>
  )
}
```

#### Hook Pattern
```typescript
// ✅ CORRECT: Custom Hook Pattern
import { useState, useEffect, useCallback, useMemo } from "react"
import { Deck, DeckCard } from "../types/deck.types"
import { useDebounce } from "./useDebounce"

interface UseDeckBuilderOptions {
  autoSave?: boolean
  autoSaveDelay?: number
}

interface UseDeckBuilderReturn {
  deck: Deck | null
  loading: boolean
  error: string | null
  isDirty: boolean
  canUndo: boolean
  canRedo: boolean
  addCard: (card: DeckCard) => void
  removeCard: (cardId: string) => void
  updateCard: (cardId: string, updates: Partial<DeckCard>) => void
  undo: () => void
  redo: () => void
  save: () => Promise<void>
  validate: () => ValidationResult
}

export function useDeckBuilder(
  deckId: string,
  options: UseDeckBuilderOptions = {}
): UseDeckBuilderReturn {
  const { autoSave = true, autoSaveDelay = 2000 } = options

  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [history, setHistory] = useState<Deck[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const debouncedSave = useDebounce(autoSaveDelay)

  // Load deck on mount
  useEffect(() => {
    loadDeck()
  }, [deckId])

  // Auto-save when dirty
  useEffect(() => {
    if (isDirty && autoSave && deck) {
      debouncedSave(async () => {
        await save()
      })
    }
  }, [isDirty, autoSave, deck, debouncedSave])

  const loadDeck = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/decks/${deckId}`)
      if (!response.ok) {
        throw new Error(`Failed to load deck: ${response.statusText}`)
      }
      
      const deckData = await response.json()
      setDeck(deckData)
      setHistory([deckData])
      setHistoryIndex(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [deckId])

  const addToHistory = useCallback((newDeck: Deck) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(newDeck)
      // Keep only last 50 states
      return newHistory.slice(-50)
    })
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  const addCard = useCallback((card: DeckCard) => {
    if (!deck) return

    const newDeck = {
      ...deck,
      cards: [...deck.cards, card]
    }
    
    setDeck(newDeck)
    setIsDirty(true)
    addToHistory(newDeck)
  }, [deck, addToHistory])

  const removeCard = useCallback((cardId: string) => {
    if (!deck) return

    const newDeck = {
      ...deck,
      cards: deck.cards.filter(card => card.id !== cardId)
    }
    
    setDeck(newDeck)
    setIsDirty(true)
    addToHistory(newDeck)
  }, [deck, addToHistory])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousIndex = historyIndex - 1
      setDeck(history[previousIndex])
      setHistoryIndex(previousIndex)
      setIsDirty(true)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      setDeck(history[nextIndex])
      setHistoryIndex(nextIndex)
      setIsDirty(true)
    }
  }, [history, historyIndex])

  const save = useCallback(async () => {
    if (!deck || !isDirty) return

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deck)
      })

      if (!response.ok) {
        throw new Error("Failed to save deck")
      }

      setIsDirty(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
      throw err
    }
  }, [deck, deckId, isDirty])

  const validate = useCallback(() => {
    // Validation logic here
    return { isValid: true, errors: [] }
  }, [deck])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return {
    deck,
    loading,
    error,
    isDirty,
    canUndo,
    canRedo,
    addCard,
    removeCard,
    updateCard,
    undo,
    redo,
    save,
    validate
  }
}
```

## Error Handling Standards

### Backend Error Handling
```typescript
// ✅ CORRECT: Comprehensive Error Handling
export class TCGCatalogService extends TransactionBaseService {
  async importFromScryfall(): Promise<ImportResult> {
    return await this.atomicPhase_(async (manager) => {
      try {
        const result = await this.performImport(manager)
        return result
      } catch (error) {
        if (error instanceof ValidationError) {
          this.logger.warn("Validation error during import", { 
            error: error.message,
            details: error.details 
          })
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            error.message
          )
        }

        if (error instanceof NetworkError) {
          this.logger.error("Network error during import", { 
            error: error.message,
            retryCount: error.retryCount 
          })
          throw new MedusaError(
            MedusaError.Types.UNEXPECTED_STATE,
            "External API unavailable"
          )
        }

        // Unknown error - log and re-throw
        this.logger.error("Unexpected error during import", { 
          error: error.message,
          stack: error.stack 
        })
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Import failed due to unexpected error"
        )
      }
    })
  }
}
```

### Frontend Error Handling
```typescript
// ✅ CORRECT: React Error Boundaries
import { Component, ReactNode, ErrorInfo } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught an error:", error)
    
    // Report to monitoring service
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary p-4 border border-red-300 rounded">
          <h2 className="text-red-600 font-semibold">Something went wrong</h2>
          <p className="text-gray-600">
            We apologize for the inconvenience. Please try refreshing the page.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-2">
              <summary>Error Details</summary>
              <pre className="text-xs text-gray-500 mt-1">
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
```

## Logging Standards

### Backend Logging
```typescript
// ✅ CORRECT: Structured Logging
export class DeckService {
  private readonly logger = new Logger(DeckService.name)

  async createDeck(deckData: CreateDeckDto, userId: string): Promise<Deck> {
    // Start operation logging
    this.logger.log("Creating deck", {
      operation: "create_deck",
      userId,
      deckName: deckData.name,
      format: deckData.format,
      game: deckData.game
    })

    try {
      const deck = await this.deckRepository.save(deckData)
      
      // Success logging
      this.logger.log("Deck created successfully", {
        operation: "create_deck",
        deckId: deck.id,
        userId,
        duration: Date.now() - startTime
      })

      return deck
    } catch (error) {
      // Error logging
      this.logger.error("Failed to create deck", {
        operation: "create_deck",
        error: error.message,
        stack: error.stack,
        userId,
        deckData: JSON.stringify(deckData)
      })
      
      throw error
    }
  }
}
```

### Frontend Logging
```typescript
// ✅ CORRECT: Client-side Error Logging
class ErrorMonitoringService {
  private logBuffer: ErrorReport[] = []

  captureError(error: Error, context?: Record<string, any>) {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      context
    }

    this.logBuffer.push(errorReport)
    
    // Send immediately for critical errors
    if (this.isCriticalError(error)) {
      this.flushLogs()
    }
  }

  private async flushLogs() {
    if (this.logBuffer.length === 0) return

    try {
      await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errors: this.logBuffer })
      })
      
      this.logBuffer = []
    } catch (error) {
      // Store in localStorage if network fails
      localStorage.setItem(
        "pending_error_reports", 
        JSON.stringify(this.logBuffer)
      )
    }
  }
}
```

## Performance Standards

### Database Query Optimization
```typescript
// ✅ CORRECT: Optimized Queries
export class CardService {
  async searchCards(query: SearchCardDto): Promise<SearchResult> {
    const queryBuilder = this.cardRepository
      .createQueryBuilder("card")
      .leftJoinAndSelect("card.game", "game")
      .leftJoinAndSelect("card.prints", "prints")
      
    // Use indexes effectively
    if (query.name) {
      queryBuilder.andWhere("card.name ILIKE :name", { 
        name: `%${query.name}%` 
      })
    }
    
    if (query.gameIds?.length) {
      queryBuilder.andWhere("card.game_id IN (:...gameIds)", { 
        gameIds: query.gameIds 
      })
    }
    
    // Pagination to limit results
    queryBuilder
      .skip(query.offset || 0)
      .take(Math.min(query.limit || 20, 100)) // Max 100 results
      .orderBy("card.name", "ASC")
    
    const [cards, total] = await queryBuilder.getManyAndCount()
    
    return {
      cards,
      total,
      page: Math.floor((query.offset || 0) / (query.limit || 20)) + 1,
      totalPages: Math.ceil(total / (query.limit || 20))
    }
  }
}

// ❌ INCORRECT: Non-optimized queries
export class BadCardService {
  async searchCards(query: any) {
    // No pagination - can return millions of records
    // No indexing consideration
    // N+1 query problem
    const cards = await this.cardRepository.find()
    return cards.filter(card => 
      card.name.includes(query.name) // Client-side filtering
    )
  }
}
```

### Frontend Performance
```typescript
// ✅ CORRECT: Performance Optimized Component
import { memo, useMemo, useCallback } from "react"
import { VirtualizedList } from "./ui/VirtualizedList"

interface CardListProps {
  cards: Card[]
  onCardSelect: (card: Card) => void
  searchTerm: string
}

export const CardList = memo<CardListProps>(({ 
  cards, 
  onCardSelect, 
  searchTerm 
}) => {
  // Memoize expensive calculations
  const filteredCards = useMemo(() => {
    if (!searchTerm) return cards
    
    return cards.filter(card =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [cards, searchTerm])

  // Memoize callbacks to prevent unnecessary re-renders
  const renderCard = useCallback((card: Card, index: number) => (
    <CardItem 
      key={card.id}
      card={card}
      onClick={() => onCardSelect(card)}
    />
  ), [onCardSelect])

  // Use virtualization for large lists
  if (filteredCards.length > 100) {
    return (
      <VirtualizedList
        items={filteredCards}
        itemHeight={120}
        renderItem={renderCard}
      />
    )
  }

  return (
    <div className="card-list">
      {filteredCards.map(renderCard)}
    </div>
  )
})
```

## Security Standards

### Input Validation
```typescript
// ✅ CORRECT: Comprehensive Input Validation
import { IsString, IsEmail, IsUUID, Length, IsOptional, ValidateNested } from "class-validator"
import { Transform } from "class-transformer"

export class CreateDeckDto {
  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => value?.trim())
  name: string

  @IsString()
  @IsIn(["Standard", "Modern", "Commander", "Legacy", "Vintage"])
  format: string

  @IsString()
  @IsIn(["MTG", "POKEMON", "YUGIOH", "OPTCG"])
  game: string

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  @Transform(({ value }) => value?.trim())
  description?: string

  @ValidateNested({ each: true })
  @Type(() => DeckCardDto)
  cards: DeckCardDto[]
}

export class DeckCardDto {
  @IsUUID()
  card_id: string

  @IsInt()
  @Min(1)
  @Max(10) // Maximum copies allowed
  quantity: number

  @IsString()
  @IsIn(["main", "sideboard", "commander", "extra"])
  zone: string
}
```

### SQL Injection Prevention
```typescript
// ✅ CORRECT: Parameterized Queries
export class CardRepository {
  async findCardsByName(name: string, gameId: string): Promise<Card[]> {
    // Use parameterized queries - TypeORM handles escaping
    return this.repository
      .createQueryBuilder("card")
      .where("card.name ILIKE :name", { name: `%${name}%` })
      .andWhere("card.game_id = :gameId", { gameId })
      .getMany()
  }
}

// ❌ INCORRECT: SQL Injection Vulnerability
export class BadCardRepository {
  async findCardsByName(name: string): Promise<Card[]> {
    // NEVER do this - vulnerable to SQL injection
    const query = `SELECT * FROM cards WHERE name LIKE '%${name}%'`
    return this.repository.query(query)
  }
}
```

## Documentation Standards

### Code Documentation
```typescript
/**
 * Service responsible for managing TCG card catalog operations
 * 
 * Handles:
 * - Card data import from external APIs (Scryfall, Pokemon TCG, etc.)
 * - Card search and filtering with performance optimization
 * - Card data normalization across different TCG formats
 * - Image processing and CDN integration
 * 
 * @example
 * ```typescript
 * const catalogService = container.resolve<TCGCatalogService>("tcgCatalogService")
 * const result = await catalogService.importFromScryfall()
 * ```
 */
export class TCGCatalogService extends TransactionBaseService {
  /**
   * Imports card data from Scryfall API for Magic: The Gathering
   * 
   * @param options - Import configuration options
   * @param options.setCode - Specific set to import (optional, imports all if not provided)
   * @param options.forceRefresh - Force refresh of existing cards
   * @param options.batchSize - Number of cards to process per batch (default: 100)
   * 
   * @returns Promise resolving to import statistics
   * 
   * @throws {ValidationError} When API response format is invalid
   * @throws {NetworkError} When API is unavailable or rate limited
   * @throws {MedusaError} For other import failures
   * 
   * @example
   * ```typescript
   * const result = await service.importFromScryfall({
   *   setCode: "NEO",
   *   forceRefresh: false,
   *   batchSize: 50
   * })
   * console.log(`Imported ${result.imported} cards`)
   * ```
   */
  async importFromScryfall(options: ImportOptions = {}): Promise<ImportResult> {
    // Implementation...
  }
}
```

### API Documentation
```typescript
/**
 * @openapi
 * /api/decks:
 *   post:
 *     summary: Create a new deck
 *     tags: [Decks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeckRequest'
 *     responses:
 *       201:
 *         description: Deck created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeckResponse'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(req: Request, res: Response) {
  // Implementation...
}
```

## Code Quality Tools Configuration

### ESLint Configuration
```javascript
// .eslintrc.js (All repositories)
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "react-hooks", // Frontend only
    "import"
  ],
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "prettier" // Must be last
  ],
  rules: {
    // TypeScript rules
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    
    // Import rules
    "import/order": ["error", {
      "groups": [
        "builtin",
        "external", 
        "internal",
        "parent",
        "sibling",
        "index"
      ],
      "alphabetize": { "order": "asc" }
    }],
    "import/no-default-export": "warn", // Prefer named exports
    
    // General rules
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-template": "error",
    
    // React rules (frontend only)
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  overrides: [
    {
      // Allow console in development files
      files: ["*.config.js", "*.dev.ts"],
      rules: {
        "no-console": "off"
      }
    }
  ]
}
```

### Prettier Configuration
```javascript
// .prettierrc.js (All repositories)
module.exports = {
  semi: false,
  trailingComma: "es5",
  singleQuote: false,
  printWidth: 88,
  tabWidth: 2,
  useTabs: false,
  quoteProps: "as-needed",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "avoid",
  endOfLine: "lf",
  
  // Override for specific file types
  overrides: [
    {
      files: "*.md",
      options: {
        printWidth: 80,
        proseWrap: "always"
      }
    }
  ]
}
```

### Husky Pre-commit Configuration
```bash
#!/bin/sh
# .husky/pre-commit

echo "🔍 Running pre-commit checks..."

# Lint staged files
npx lint-staged

# Run type check
npm run typecheck

# Run tests for changed files
npm run test --if-present

# Check for forbidden patterns
echo "🚫 Checking for forbidden patterns..."

# MercurJS specific patterns
if grep -r "MedusaRequest[^S]" --include="*.ts" --include="*.tsx" src/; then
  echo "❌ Use MedusaStoreRequest instead of MedusaRequest"
  exit 1
fi

if grep -r "console\.log" --include="*.ts" --include="*.tsx" src/; then
  echo "❌ Remove console.log statements"
  exit 1
fi

if grep -r "// TODO" --include="*.ts" --include="*.tsx" src/; then
  echo "⚠️ TODO comments found. Consider creating GitHub issues instead."
fi

echo "✅ Pre-commit checks passed!"
```

**Remember: Code standards are not suggestions—they are requirements. Consistent, high-quality code is essential for maintainability, security, and team collaboration.**
