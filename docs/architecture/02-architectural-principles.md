# Architectural Principles

**Version**: 1.2  
**Last Updated**: 2025-09-11  
**Author**: SideDecked Architecture Team  
**Reviewers**: [Development Team, Technical Leadership]  
**Status**: Approved

## Overview

This document defines the core architectural principles that guide all technical decisions in the SideDecked platform. These principles are mandatory and must be considered in every architectural decision, design review, and implementation.

## Core Principles

### 1. Domain Separation (Split-Brain Architecture)

**Principle**: Complete separation between commerce operations and customer experience domains.

**Rationale**: 
- Enables independent scaling of commerce vs. content operations
- Reduces complexity by eliminating mixed concerns
- Allows specialized optimization for each domain
- Prevents cascading failures between systems

**Implementation Guidelines**:
- ✅ **DO**: Use dedicated databases for each domain
- ✅ **DO**: Communicate between domains via well-defined APIs
- ✅ **DO**: Maintain clear service boundaries
- ❌ **DON'T**: Share database connections between domains
- ❌ **DON'T**: Mix commerce logic in customer experience services
- ❌ **DON'T**: Create tight coupling between services

**Example**:
```typescript
// ✅ CORRECT: Domain separation
// Commerce domain handles orders
await commerceAPI.createOrder(orderData)

// Customer domain handles deck operations  
await customerAPI.createDeck(deckData)

// ❌ INCORRECT: Mixed domains
await customerService.createDeckAndOrder(data) // Violates separation
```

**Validation Criteria**:
- No shared database tables between domains
- All cross-domain communication goes through APIs
- Services can be deployed and scaled independently
- Domain failures don't cascade to other domains

---

### 2. API-First Design

**Principle**: All functionality must be accessible via well-designed APIs before any user interface is created.

**Rationale**:
- Ensures consistency across multiple user interfaces
- Enables third-party integrations and mobile applications
- Forces clear thinking about data models and operations
- Supports automated testing and documentation

**Implementation Guidelines**:
- ✅ **DO**: Design APIs before implementing user interfaces
- ✅ **DO**: Use OpenAPI 3.0+ specifications for all endpoints
- ✅ **DO**: Follow RESTful conventions consistently
- ✅ **DO**: Implement comprehensive error handling
- ❌ **DON'T**: Create UI-specific endpoints that bypass business logic
- ❌ **DON'T**: Skip API documentation
- ❌ **DON'T**: Couple API design to specific UI requirements

**Example**:
```typescript
// ✅ CORRECT: API-first design
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
 */
export async function createDeck(req: Request, res: Response) {
  const result = await deckService.create(req.body)
  res.json(result)
}

// Then build UI that consumes this API
const createDeck = (deckData) => fetch('/api/decks', {
  method: 'POST',
  body: JSON.stringify(deckData)
})
```

**Validation Criteria**:
- All APIs have OpenAPI documentation
- APIs can be consumed by multiple clients
- Business logic is encapsulated in services, not controllers
- Error responses follow consistent format

---

### 3. Performance by Design

**Principle**: Performance requirements must be considered from the initial design phase, not as an afterthought.

**Rationale**:
- Performance issues are expensive to fix after implementation
- User experience directly impacts business success
- Scalability requirements grow with user base
- Performance affects SEO and conversion rates

**Performance Targets**:
| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time | < 100ms (P95) | Application monitoring |
| Database Queries | < 50ms | Query profiling |
| Page Load Time (TTI) | < 2s | Core Web Vitals |
| Search Queries | < 200ms | Algolia metrics |
| Real-time Updates | < 500ms | WebSocket latency |

**Implementation Guidelines**:
- ✅ **DO**: Design database schemas with indexing strategy
- ✅ **DO**: Implement caching at multiple layers
- ✅ **DO**: Use pagination for large result sets
- ✅ **DO**: Optimize images and static assets
- ✅ **DO**: Monitor performance continuously
- ❌ **DON'T**: Load large datasets without pagination
- ❌ **DON'T**: Make N+1 queries
- ❌ **DON'T**: Skip performance testing

**Example**:
```typescript
// ✅ CORRECT: Performance-optimized query
async searchCards(query: SearchQuery): Promise<SearchResult> {
  // Use indexes effectively
  const queryBuilder = this.repository
    .createQueryBuilder('card')
    .where('card.name ILIKE :name', { name: `%${query.name}%` })
    .skip(query.offset)
    .take(Math.min(query.limit, 100)) // Limit max results
    
  return queryBuilder.getManyAndCount()
}

// ❌ INCORRECT: Performance anti-pattern
async searchCards(query: SearchQuery): Promise<Card[]> {
  const allCards = await this.repository.find() // Loads everything
  return allCards.filter(card => card.name.includes(query.name)) // Client-side filtering
}
```

---

### 4. Universal Multi-Game Design

**Principle**: Architecture must support multiple TCGs without requiring fundamental changes for new games.

**Rationale**:
- SideDecked supports MTG, Pokémon, Yu-Gi-Oh!, and One Piece TCG
- New games should be addable through configuration, not code changes
- Common patterns exist across all trading card games
- Specialized game logic should be encapsulated and pluggable

**Implementation Guidelines**:
- ✅ **DO**: Create universal base models with game-specific extensions
- ✅ **DO**: Use strategy pattern for game-specific validation
- ✅ **DO**: Store game-specific data in flexible JSONB fields
- ✅ **DO**: Design ETL pipelines that can be extended
- ❌ **DON'T**: Hard-code game-specific logic in shared components
- ❌ **DON'T**: Create separate databases per game
- ❌ **DON'T**: Couple core functionality to specific games

**Example**:
```typescript
// ✅ CORRECT: Universal design with game-specific extensions
@Entity()
export class Card {
  @Column()
  name: string
  
  @Column()
  game: 'MTG' | 'POKEMON' | 'YUGIOH' | 'OPTCG'
  
  // Universal attributes
  @Column({ type: 'jsonb' })
  game_data: {
    mana_cost?: string      // MTG
    hp?: number            // Pokemon  
    attack?: number        // Pokemon, YGO
    defense?: number       // YGO
    power?: number         // One Piece
    // Extensible for new games
  }
}

// Game-specific validation
export class GameValidatorFactory {
  static getValidator(game: string): GameValidator {
    switch (game) {
      case 'MTG': return new MTGValidator()
      case 'POKEMON': return new PokemonValidator()
      // Easy to add new games
    }
  }
}
```

---

### 5. Data Consistency and Integrity

**Principle**: Data must remain consistent across all services while maintaining service independence.

**Rationale**:
- Distributed systems require careful consistency management
- Business-critical data cannot be corrupted or lost
- Users expect consistent experiences across all interfaces
- Debugging distributed data issues is complex and expensive

**Consistency Patterns**:
- **Eventual Consistency**: Non-critical data (user profiles, preferences)
- **Strong Consistency**: Financial data (orders, payments, inventory)
- **Event-Driven Sync**: Real-time updates (inventory levels, pricing)

**Implementation Guidelines**:
- ✅ **DO**: Use database transactions for critical operations
- ✅ **DO**: Implement idempotent operations
- ✅ **DO**: Use event sourcing for audit trails
- ✅ **DO**: Design compensating actions for failures
- ❌ **DON'T**: Assume distributed transactions will work reliably
- ❌ **DON'T**: Update the same data in multiple services
- ❌ **DON'T**: Skip data validation at service boundaries

**Example**:
```typescript
// ✅ CORRECT: Consistent data management
export class OrderService extends TransactionBaseService {
  async createOrder(orderData: OrderRequest): Promise<Order> {
    return await this.atomicPhase_(async (manager) => {
      // All operations in same transaction
      const order = await manager.save(Order, orderData)
      const inventory = await manager.findOne(Product, orderData.productId)
      
      if (inventory.quantity < orderData.quantity) {
        throw new Error('Insufficient inventory')
      }
      
      inventory.quantity -= orderData.quantity
      await manager.save(inventory)
      
      // Notify other services asynchronously
      await this.eventBus.emit('order.created', order)
      
      return order
    })
  }
}
```

---

### 6. Security by Design

**Principle**: Security considerations must be integrated into every architectural decision from the beginning.

**Rationale**:
- Retrofitting security is expensive and often incomplete
- Data breaches have severe business and legal consequences
- Users trust us with payment and personal information
- Regulatory compliance requires comprehensive security measures

**Security Requirements**:
- **Authentication**: Multi-factor authentication for sensitive operations
- **Authorization**: Role-based access control with principle of least privilege
- **Data Protection**: Encryption in transit and at rest
- **Input Validation**: Comprehensive validation at all boundaries
- **Audit Logging**: Complete audit trail for security events

**Implementation Guidelines**:
- ✅ **DO**: Validate and sanitize all inputs
- ✅ **DO**: Use parameterized queries to prevent SQL injection
- ✅ **DO**: Implement rate limiting on all APIs
- ✅ **DO**: Hash passwords with strong algorithms (bcrypt, Argon2)
- ✅ **DO**: Use HTTPS everywhere
- ❌ **DON'T**: Trust client-side validation
- ❌ **DON'T**: Store sensitive data in logs
- ❌ **DON'T**: Hard-code secrets in source code

**Example**:
```typescript
// ✅ CORRECT: Security by design
import { IsString, IsEmail, Length } from 'class-validator'
import bcrypt from 'bcrypt'

export class CreateUserDto {
  @IsEmail()
  email: string
  
  @IsString()
  @Length(8, 128)
  password: string
}

export class AuthService {
  async createUser(userData: CreateUserDto): Promise<User> {
    // Validate input
    await validateOrReject(userData)
    
    // Hash password securely
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    // Use parameterized queries
    return this.repository.save({
      ...userData,
      password: hashedPassword
    })
  }
}
```

---

### 7. Testability and Quality

**Principle**: All code must be designed for comprehensive testing with 80%+ coverage requirement.

**Rationale**:
- Tests serve as living documentation of system behavior
- Automated testing enables confident refactoring and deployment
- Quality gates prevent regressions and maintain system reliability
- Test-driven development improves design quality

**Testing Requirements**:
- **Unit Tests**: 80%+ code coverage for all services
- **Integration Tests**: API endpoint and database interaction testing
- **End-to-End Tests**: Critical user flows and business scenarios
- **Performance Tests**: Load testing and performance benchmarking

**Implementation Guidelines**:
- ✅ **DO**: Write tests first (TDD methodology)
- ✅ **DO**: Mock external dependencies in unit tests
- ✅ **DO**: Test error conditions and edge cases
- ✅ **DO**: Use realistic test data and scenarios
- ❌ **DON'T**: Skip testing for "simple" code
- ❌ **DON'T**: Test implementation details instead of behavior
- ❌ **DON'T**: Write flaky or non-deterministic tests

**Example**:
```typescript
// ✅ CORRECT: Testable design
export class DeckValidationService {
  constructor(
    private readonly formatValidators: Map<string, FormatValidator>,
    private readonly logger: Logger
  ) {}
  
  async validateDeck(deck: Deck): Promise<ValidationResult> {
    const validator = this.formatValidators.get(deck.format)
    if (!validator) {
      throw new UnsupportedFormatError(deck.format)
    }
    
    return validator.validate(deck)
  }
}

// Easy to test with mocked dependencies
describe('DeckValidationService', () => {
  let service: DeckValidationService
  let mockValidator: jest.Mocked<FormatValidator>
  
  beforeEach(() => {
    mockValidator = {
      validate: jest.fn()
    }
    
    service = new DeckValidationService(
      new Map([['Standard', mockValidator]]),
      mockLogger
    )
  })
  
  it('should validate deck using appropriate validator', async () => {
    const deck = { format: 'Standard', cards: [] }
    const expectedResult = { isValid: true, errors: [] }
    mockValidator.validate.mockResolvedValue(expectedResult)
    
    const result = await service.validateDeck(deck)
    
    expect(result).toEqual(expectedResult)
    expect(mockValidator.validate).toHaveBeenCalledWith(deck)
  })
})
```

---

### 8. Observability and Monitoring

**Principle**: Systems must be designed with comprehensive observability to enable proactive issue detection and resolution.

**Rationale**:
- Distributed systems have complex failure modes
- Performance issues can impact user experience and revenue
- Debugging production issues requires detailed telemetry
- Business metrics inform product and technical decisions

**Observability Requirements**:
- **Metrics**: Response times, error rates, business KPIs
- **Logging**: Structured logging with correlation IDs
- **Tracing**: Distributed request tracing across services
- **Alerting**: Proactive alerting on SLA violations

**Implementation Guidelines**:
- ✅ **DO**: Use structured logging with consistent format
- ✅ **DO**: Include correlation IDs in all requests
- ✅ **DO**: Monitor business metrics alongside technical metrics
- ✅ **DO**: Set up alerts for critical thresholds
- ❌ **DON'T**: Log sensitive information (passwords, tokens)
- ❌ **DON'T**: Create noisy alerts that get ignored
- ❌ **DON'T**: Skip monitoring for background processes

**Example**:
```typescript
// ✅ CORRECT: Observable service design
export class OrderService {
  private readonly logger = new Logger(OrderService.name)
  private readonly metrics = new MetricsCollector()
  
  async createOrder(orderData: OrderRequest, correlationId: string): Promise<Order> {
    const startTime = Date.now()
    
    this.logger.log('Creating order', {
      correlationId,
      userId: orderData.userId,
      productCount: orderData.items.length,
      totalAmount: orderData.total
    })
    
    try {
      const order = await this.processOrder(orderData)
      
      const duration = Date.now() - startTime
      this.metrics.recordOrderCreation(duration, 'success')
      
      this.logger.log('Order created successfully', {
        correlationId,
        orderId: order.id,
        duration
      })
      
      return order
    } catch (error) {
      const duration = Date.now() - startTime
      this.metrics.recordOrderCreation(duration, 'failure')
      
      this.logger.error('Order creation failed', {
        correlationId,
        error: error.message,
        stack: error.stack,
        duration
      })
      
      throw error
    }
  }
}
```

## Principle Validation Framework

### Architecture Decision Review Process

Every significant architectural decision must be evaluated against these principles:

1. **Principle Compliance Check**: Does the decision align with all applicable principles?
2. **Trade-off Analysis**: What principles might be compromised and why?
3. **Mitigation Plan**: How will negative impacts be minimized?
4. **Success Metrics**: How will adherence to principles be measured?

### Decision Documentation Template

```markdown
## Architectural Decision: [Title]

### Principles Analysis
- **Domain Separation**: ✅ Maintains / ⚠️ Challenges / ❌ Violates
- **API-First Design**: ✅ Supports / ⚠️ Neutral / ❌ Conflicts  
- **Performance**: ✅ Improves / ⚠️ Maintains / ❌ Degrades
- **Multi-Game Support**: ✅ Enhances / ⚠️ Neutral / ❌ Limits
- **Data Consistency**: ✅ Strengthens / ⚠️ Maintains / ❌ Weakens
- **Security**: ✅ Improves / ⚠️ Maintains / ❌ Compromises
- **Testability**: ✅ Enhances / ⚠️ Maintains / ❌ Reduces
- **Observability**: ✅ Improves / ⚠️ Maintains / ❌ Limits

### Principle Conflicts
[Document any conflicts and justify trade-offs]

### Mitigation Measures
[Steps to minimize negative impacts]
```

## Principle Evolution

### Review Schedule
- **Quarterly Reviews**: Assess principle relevance and effectiveness
- **Annual Updates**: Formal review and update cycle
- **Ad-hoc Reviews**: When facing significant architectural challenges

### Change Process
1. **Proposal**: Document proposed changes with justification
2. **Review**: Architecture team and stakeholders review
3. **Approval**: Formal approval required for changes
4. **Communication**: Broadcast changes to all development teams
5. **Training**: Update training materials and conduct knowledge transfer

## References

- [System Overview](./01-system-overview.md)
- [Domain Models](./03-domain-models.md)
- [Architectural Patterns](./04-architectural-patterns.md)
- [Data Architecture](./05-data-architecture.md)
- [Integration Architecture](./06-integration-architecture.md)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.2 | 2025-09-11 | Added principle validation framework and decision templates |
| 1.1 | 2025-01-15 | Enhanced security and observability principles |
| 1.0 | 2025-01-01 | Initial architectural principles definition |