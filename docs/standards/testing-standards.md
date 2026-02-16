# Testing Standards

**MANDATORY: These testing standards are NON-NEGOTIABLE and must be followed for every feature, without exception.**

## Core Testing Philosophy

### Test-Driven Development (TDD)
**REQUIREMENT: ALL features must be developed using TDD methodology**

#### TDD Cycle (RED-GREEN-REFACTOR)
```bash
# 1. RED - Write a failing test FIRST
touch src/features/deck-validation.test.ts
# Write test that describes expected behavior

# 2. GREEN - Write minimal code to make test pass
touch src/features/deck-validation.ts
# Implement just enough to pass the test

# 3. REFACTOR - Improve code while keeping tests green
# Optimize, clean up, improve design
# Tests must continue to pass

# 4. REPEAT - Continue cycle for next requirement
```

### Coverage Requirements

**MANDATORY MINIMUM COVERAGE: 80% for ALL repositories**

| Repository | Current Coverage | Target | Status |
|------------|------------------|---------|---------|
| **Backend** | 75% | 80% | ⚠️ Needs Improvement |
| **Customer-Backend** | 82% | 80% | ✅ Meeting Target |
| **Storefront** | 78% | 80% | ⚠️ Needs Improvement |
| **Vendor Panel** | 65% | 80% | ❌ Below Target |

#### Coverage Verification Commands
```bash
# Run coverage for all services
npm run test -- --coverage --if-present

# Per-service coverage
cd backend && npm run test:unit --workspace=apps/backend -- --coverage
cd customer-backend && npm test -- --coverage
cd vendorpanel && npm run test -- --coverage  # if coverage provider is configured
# storefront currently has no default test script configured

# Fail build if coverage below 80%
# Enforce threshold in CI/tooling config where supported
npm run test -- --coverage --if-present
```

## Testing Framework Standards

### Backend Testing (MercurJS)
**Framework**: Jest + Medusa Testing Utilities

#### Service Testing Pattern
```typescript
// src/services/__tests__/tcg-catalog.service.test.ts
import { ModuleRegistrationName } from "@medusajs/modules-sdk"
import { createMedusaContainer } from "@medusajs/medusa/dist/utils"
import { TCGCatalogService } from "../tcg-catalog.service"

describe("TCGCatalogService", () => {
  let container
  let service: TCGCatalogService

  beforeEach(async () => {
    container = createMedusaContainer()
    service = new TCGCatalogService(container)
  })

  describe("importFromScryfall", () => {
    it("should import MTG cards from Scryfall API", async () => {
      // Arrange
      const mockCards = [
        { id: "123", name: "Lightning Bolt", game: "MTG" }
      ]
      jest.spyOn(service, 'fetchFromScryfall').mockResolvedValue(mockCards)

      // Act
      const result = await service.importFromScryfall()

      // Assert
      expect(result.imported).toBe(1)
      expect(service.fetchFromScryfall).toHaveBeenCalledWith(
        expect.objectContaining({ game: "MTG" })
      )
    })

    it("should handle API errors gracefully", async () => {
      // Arrange
      jest.spyOn(service, 'fetchFromScryfall').mockRejectedValue(
        new Error("API timeout")
      )

      // Act & Assert
      await expect(service.importFromScryfall()).rejects.toThrow("API timeout")
    })
  })

  describe("matchProductToCard", () => {
    it("should match vendor SKU to catalog card", async () => {
      // Arrange
      const vendorSku = "MTG-LTG-BOLT-NM"
      const expectedCard = { 
        id: "123", 
        name: "Lightning Bolt", 
        condition: "NM" 
      }
      
      // Act
      const result = await service.matchProductToCard(vendorSku)

      // Assert
      expect(result).toEqual(expectedCard)
    })
  })
})
```

#### API Route Testing Pattern
```typescript
// src/api/__tests__/vendor/products/import.test.ts
import request from "supertest"
import { createApp } from "../../test-utils"

describe("POST /vendor/products/import", () => {
  let app

  beforeEach(async () => {
    app = await createApp()
  })

  it("should import products from CSV", async () => {
    // Arrange
    const csvData = Buffer.from(`
      name,price,condition,set
      Lightning Bolt,1.50,NM,LEA
    `)

    // Act
    const response = await request(app)
      .post("/vendor/products/import")
      .attach("file", csvData, "products.csv")
      .expect(200)

    // Assert
    expect(response.body).toEqual({
      success: true,
      imported: 1,
      skipped: 0,
      errors: []
    })
  })

  it("should validate CSV format", async () => {
    // Arrange
    const invalidCsv = Buffer.from("invalid,csv,format")

    // Act
    const response = await request(app)
      .post("/vendor/products/import")
      .attach("file", invalidCsv, "invalid.csv")
      .expect(400)

    // Assert
    expect(response.body.error).toContain("Invalid CSV format")
  })
})
```

### Customer-Backend Testing (Node.js + TypeORM)
**Framework**: Jest + TypeORM Testing Utilities

#### Entity Testing Pattern
```typescript
// src/entities/__tests__/deck.entity.test.ts
import { createConnection, Connection } from "typeorm"
import { Deck } from "../deck.entity"
import { Card } from "../card.entity"

describe("Deck Entity", () => {
  let connection: Connection

  beforeAll(async () => {
    connection = await createConnection({
      type: "sqlite",
      database: ":memory:",
      entities: [Deck, Card],
      synchronize: true
    })
  })

  afterAll(async () => {
    await connection.close()
  })

  beforeEach(async () => {
    await connection.synchronize(true)
  })

  it("should create a deck with valid data", async () => {
    // Arrange
    const deckData = {
      name: "Lightning Deck",
      format: "Standard",
      game: "MTG",
      isPublic: true
    }

    // Act
    const deck = connection.manager.create(Deck, deckData)
    const savedDeck = await connection.manager.save(deck)

    // Assert
    expect(savedDeck.id).toBeDefined()
    expect(savedDeck.name).toBe("Lightning Deck")
    expect(savedDeck.format).toBe("Standard")
  })

  it("should validate deck format requirements", async () => {
    // Arrange
    const invalidDeck = {
      name: "Invalid Deck",
      format: "InvalidFormat",
      game: "MTG"
    }

    // Act & Assert
    await expect(
      connection.manager.save(connection.manager.create(Deck, invalidDeck))
    ).rejects.toThrow("Invalid format")
  })
})
```

#### Service Testing Pattern
```typescript
// src/services/__tests__/deck-validation.service.test.ts
import { DeckValidationService } from "../deck-validation.service"
import { MTGFormatValidator } from "../validators/mtg-format.validator"

describe("DeckValidationService", () => {
  let service: DeckValidationService
  let mockMTGValidator: jest.Mocked<MTGFormatValidator>

  beforeEach(() => {
    mockMTGValidator = {
      validate: jest.fn(),
      validateMainboard: jest.fn(),
      validateSideboard: jest.fn()
    } as any

    service = new DeckValidationService({
      MTG: mockMTGValidator
    })
  })

  describe("validateDeck", () => {
    it("should validate MTG Standard deck", async () => {
      // Arrange
      const deck = {
        format: "Standard",
        game: "MTG",
        cards: [
          { name: "Lightning Bolt", quantity: 4, zone: "main" }
        ]
      }
      mockMTGValidator.validate.mockResolvedValue({
        isValid: true,
        errors: []
      })

      // Act
      const result = await service.validateDeck(deck)

      // Assert
      expect(result.isValid).toBe(true)
      expect(mockMTGValidator.validate).toHaveBeenCalledWith(deck)
    })

    it("should return validation errors for invalid deck", async () => {
      // Arrange
      const invalidDeck = {
        format: "Standard",
        game: "MTG",
        cards: [
          { name: "Black Lotus", quantity: 1, zone: "main" }
        ]
      }
      mockMTGValidator.validate.mockResolvedValue({
        isValid: false,
        errors: ["Black Lotus is banned in Standard"]
      })

      // Act
      const result = await service.validateDeck(invalidDeck)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Black Lotus is banned in Standard")
    })
  })
})
```

### Frontend Testing (Next.js + React)
**Framework**: Jest + React Testing Library + MSW

#### Component Testing Pattern
```typescript
// src/components/__tests__/DeckBuilder.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { DeckBuilder } from "../DeckBuilder"
import { DeckBuilderProvider } from "../../contexts/DeckBuilderContext"
import { mockCard, mockDeck } from "../../test-utils/fixtures"

// Mock API calls
import { server } from "../../test-utils/server"
import { rest } from "msw"

describe("DeckBuilder", () => {
  const renderDeckBuilder = (props = {}) => {
    return render(
      <DeckBuilderProvider>
        <DeckBuilder {...props} />
      </DeckBuilderProvider>
    )
  }

  beforeEach(() => {
    server.use(
      rest.get("/api/decks/123", (req, res, ctx) => {
        return res(ctx.json(mockDeck))
      }),
      rest.post("/api/decks/123/cards", (req, res, ctx) => {
        return res(ctx.json({ success: true }))
      })
    )
  })

  it("should load and display deck", async () => {
    // Arrange & Act
    renderDeckBuilder({ deckId: "123" })

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Lightning Deck")).toBeInTheDocument()
      expect(screen.getByText("Standard")).toBeInTheDocument()
    })
  })

  it("should add card to deck on drag and drop", async () => {
    // Arrange
    renderDeckBuilder({ deckId: "123" })
    await waitFor(() => screen.getByText("Lightning Deck"))

    // Act
    const cardElement = screen.getByTestId("card-lightning-bolt")
    const deckZone = screen.getByTestId("deck-main-zone")
    
    fireEvent.dragStart(cardElement)
    fireEvent.dragOver(deckZone)
    fireEvent.drop(deckZone)

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Lightning Bolt x4")).toBeInTheDocument()
    })
  })

  it("should validate deck format on card add", async () => {
    // Arrange
    server.use(
      rest.post("/api/decks/validate", (req, res, ctx) => {
        return res(ctx.json({
          isValid: false,
          errors: ["Lightning Bolt is banned in Standard"]
        }))
      })
    )

    renderDeckBuilder({ deckId: "123" })

    // Act
    const addButton = screen.getByTestId("add-card-button")
    fireEvent.click(addButton)

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Lightning Bolt is banned in Standard")).toBeInTheDocument()
    })
  })
})
```

#### Hook Testing Pattern
```typescript
// src/hooks/__tests__/useDeckBuilder.test.tsx
import { renderHook, act, waitFor } from "@testing-library/react"
import { useDeckBuilder } from "../useDeckBuilder"
import { DeckBuilderProvider } from "../../contexts/DeckBuilderContext"
import { server } from "../../test-utils/server"
import { rest } from "msw"

const wrapper = ({ children }) => (
  <DeckBuilderProvider>{children}</DeckBuilderProvider>
)

describe("useDeckBuilder", () => {
  beforeEach(() => {
    server.use(
      rest.patch("/api/decks/123", (req, res, ctx) => {
        return res(ctx.json({ success: true }))
      })
    )
  })

  it("should add card to deck", async () => {
    // Arrange
    const { result } = renderHook(() => useDeckBuilder("123"), { wrapper })

    // Act
    act(() => {
      result.current.addCard({
        id: "456",
        name: "Lightning Bolt",
        zone: "main",
        quantity: 1
      })
    })

    // Assert
    await waitFor(() => {
      expect(result.current.deck.cards).toHaveLength(1)
      expect(result.current.deck.cards[0].name).toBe("Lightning Bolt")
    })
  })

  it("should handle undo/redo operations", async () => {
    // Arrange
    const { result } = renderHook(() => useDeckBuilder("123"), { wrapper })

    // Act - Add card
    act(() => {
      result.current.addCard({
        id: "456",
        name: "Lightning Bolt",
        zone: "main",
        quantity: 4
      })
    })

    // Act - Undo
    act(() => {
      result.current.undo()
    })

    // Assert - Card should be removed
    expect(result.current.deck.cards).toHaveLength(0)
    expect(result.current.canRedo).toBe(true)

    // Act - Redo
    act(() => {
      result.current.redo()
    })

    // Assert - Card should be back
    expect(result.current.deck.cards).toHaveLength(1)
  })
})
```

## Integration Testing

### Cross-Service Integration Tests
**Location**: `tests/integration/`

#### API Integration Testing
```typescript
// tests/integration/deck-commerce-integration.test.ts
import request from "supertest"
import { setupTestEnvironment, teardownTestEnvironment } from "../utils"

describe("Deck to Commerce Integration", () => {
  let backendApp, customerBackendApp

  beforeAll(async () => {
    const env = await setupTestEnvironment()
    backendApp = env.backendApp
    customerBackendApp = env.customerBackendApp
  })

  afterAll(async () => {
    await teardownTestEnvironment()
  })

  it("should create marketplace listing from deck", async () => {
    // Arrange - Create deck in customer-backend
    const deckResponse = await request(customerBackendApp)
      .post("/api/decks")
      .send({
        name: "Lightning Deck",
        format: "Standard",
        cards: [
          { name: "Lightning Bolt", quantity: 4 }
        ]
      })
      .expect(201)

    const deckId = deckResponse.body.id

    // Act - Create listing in backend from deck
    const listingResponse = await request(backendApp)
      .post("/store/products/from-deck")
      .send({
        deckId: deckId,
        price: 2500, // $25.00
        condition: "NM",
        sellerId: "seller-123"
      })
      .expect(201)

    // Assert
    expect(listingResponse.body.title).toBe("Lightning Deck")
    expect(listingResponse.body.variants).toHaveLength(1)
    expect(listingResponse.body.variants[0].inventory_quantity).toBe(1)
  })
})
```

### Database Integration Tests
```typescript
// tests/integration/database-consistency.test.ts
import { createConnection } from "typeorm"
import { MedusaApp } from "@medusajs/medusa"

describe("Database Consistency", () => {
  it("should maintain referential integrity across services", async () => {
    // Test that catalog SKUs referenced in commerce exist in customer-backend
    // Test that user IDs referenced in decks exist in commerce backend
    // Test that deleted cards are properly handled across services
  })

  it("should handle concurrent deck modifications", async () => {
    // Test concurrent deck edits from multiple users
    // Verify optimistic locking works correctly
    // Ensure no data corruption occurs
  })
})
```

## Performance Testing

### Load Testing Standards
```typescript
// tests/performance/api-load.test.ts
import { performance } from "perf_hooks"
import request from "supertest"

describe("API Performance", () => {
  it("should respond to card search within 200ms", async () => {
    const startTime = performance.now()
    
    await request(app)
      .get("/api/cards/search?q=lightning")
      .expect(200)
    
    const endTime = performance.now()
    const responseTime = endTime - startTime
    
    expect(responseTime).toBeLessThan(200)
  })

  it("should handle 100 concurrent deck validations", async () => {
    const promises = Array(100).fill().map(() =>
      request(app)
        .post("/api/decks/validate")
        .send({ /* deck data */ })
    )

    const startTime = performance.now()
    const responses = await Promise.all(promises)
    const endTime = performance.now()

    responses.forEach(response => {
      expect(response.status).toBe(200)
    })
    
    expect(endTime - startTime).toBeLessThan(5000) // 5 seconds for 100 requests
  })
})
```

## End-to-End Testing

### E2E Testing Framework: Playwright

#### E2E Test Structure
```typescript
// tests/e2e/deck-builder-flow.spec.ts
import { test, expect } from "@playwright/test"

test.describe("Deck Builder Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Setup test user and authentication
    await page.goto("/auth/login")
    await page.fill("[data-testid=email]", "test@example.com")
    await page.fill("[data-testid=password]", "password123")
    await page.click("[data-testid=login-button]")
    await expect(page).toHaveURL("/dashboard")
  })

  test("should create, edit, and save deck", async ({ page }) => {
    // Navigate to deck builder
    await page.goto("/decks/builder/new")
    
    // Create deck
    await page.fill("[data-testid=deck-name]", "Test Deck")
    await page.selectOption("[data-testid=deck-format]", "Standard")
    await page.selectOption("[data-testid=deck-game]", "MTG")
    
    // Search and add cards
    await page.fill("[data-testid=card-search]", "Lightning Bolt")
    await page.click("[data-testid=search-button]")
    
    await expect(page.locator("[data-testid=search-results]")).toBeVisible()
    await page.click("[data-testid=add-card-lightning-bolt]")
    
    // Verify card added to deck
    await expect(page.locator("[data-testid=deck-main-zone]")).toContainText("Lightning Bolt")
    
    // Save deck
    await page.click("[data-testid=save-deck-button]")
    await expect(page.locator("[data-testid=success-toast]")).toBeVisible()
    
    // Verify deck in list
    await page.goto("/decks")
    await expect(page.locator("[data-testid=deck-list]")).toContainText("Test Deck")
  })

  test("should validate deck format rules", async ({ page }) => {
    await page.goto("/decks/builder/new")
    
    // Set up Standard deck
    await page.fill("[data-testid=deck-name]", "Invalid Standard Deck")
    await page.selectOption("[data-testid=deck-format]", "Standard")
    await page.selectOption("[data-testid=deck-game]", "MTG")
    
    // Try to add banned card
    await page.fill("[data-testid=card-search]", "Black Lotus")
    await page.click("[data-testid=search-button]")
    await page.click("[data-testid=add-card-black-lotus]")
    
    // Verify validation error
    await expect(page.locator("[data-testid=validation-errors]"))
      .toContainText("Black Lotus is banned in Standard")
  })
})
```

## Test Data Management

### Fixtures and Factories
```typescript
// src/test-utils/fixtures.ts
export const mockCard = {
  id: "123",
  name: "Lightning Bolt",
  manaCost: "R",
  type: "Instant",
  game: "MTG",
  set: "LEA",
  rarity: "Common"
}

export const mockDeck = {
  id: "456",
  name: "Lightning Deck",
  format: "Standard",
  game: "MTG",
  isPublic: true,
  cards: [
    { ...mockCard, quantity: 4, zone: "main" }
  ]
}

// src/test-utils/factories.ts
import { Factory } from "fishery"

export const CardFactory = Factory.define<Card>(({ sequence }) => ({
  id: `card-${sequence}`,
  name: `Card ${sequence}`,
  manaCost: "1",
  type: "Creature",
  game: "MTG",
  set: "TST",
  rarity: "Common"
}))

export const DeckFactory = Factory.define<Deck>(({ sequence }) => ({
  id: `deck-${sequence}`,
  name: `Deck ${sequence}`,
  format: "Standard",
  game: "MTG",
  isPublic: false,
  cards: []
}))
```

### Database Seeding for Tests
```typescript
// src/test-utils/database.ts
export async function seedTestDatabase() {
  const cards = CardFactory.buildList(100)
  const decks = DeckFactory.buildList(10)
  
  await connection.manager.save(Card, cards)
  await connection.manager.save(Deck, decks)
}

export async function cleanTestDatabase() {
  await connection.manager.clear(Deck)
  await connection.manager.clear(Card)
}
```

## Test Environment Setup

### Test Configuration
```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/src/test-utils/setup.ts"],
  testMatch: [
    "**/__tests__/**/*.(test|spec).ts",
    "**/*.(test|spec).ts"
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/test-utils/**/*",
    "!src/**/__tests__/**/*"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ["text", "lcov", "html"],
  testTimeout: 10000
}
```

### Test Setup File
```typescript
// src/test-utils/setup.ts
import "reflect-metadata"
import { server } from "./server"

// Setup MSW
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Global test helpers
global.waitForNextTick = () => new Promise(resolve => process.nextTick(resolve))

// Mock console.error for clean test output
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})
afterAll(() => {
  console.error = originalError
})
```

## Continuous Integration Testing

### GitHub Actions Configuration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [backend, customer-backend, storefront, vendorpanel]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: ${{ matrix.service }}/package-lock.json
      
      - name: Install dependencies
        working-directory: ${{ matrix.service }}
        run: npm ci
      
      - name: Run tests
        working-directory: ${{ matrix.service }}
        run: npm run test -- --coverage --if-present
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          directory: ${{ matrix.service }}/coverage
```

## Test Quality Gates

### Pre-commit Test Requirements
- All tests must pass
- Coverage must be ≥80%
- No test files should be skipped
- Performance tests within limits

### Pull Request Test Requirements
- Full test suite passes
- Coverage maintained or improved
- New features have corresponding tests
- Integration tests pass

### Deployment Test Requirements
- All test suites pass
- E2E tests pass in staging
- Performance benchmarks met
- Security tests pass

## Testing Anti-Patterns

### ❌ NEVER Do These
- Skip writing tests ("I'll add them later")
- Test implementation details instead of behavior
- Write tests that depend on external services without mocking
- Use real databases or APIs in unit tests
- Write tests that are flaky or non-deterministic
- Mock everything unnecessarily
- Write tests without assertions
- Copy-paste test code without understanding

### ✅ ALWAYS Do These
- Write tests before code (TDD)
- Test behavior, not implementation
- Use proper mocking and stubbing
- Keep tests fast and isolated
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Test edge cases and error conditions
- Maintain and refactor test code

**Remember: Tests are code too. They require the same attention to quality, maintainability, and clarity as production code.**
