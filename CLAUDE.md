# CLAUDE.md - SideDecked Implementation Guide for Claude Code

**Version**: 1.0
**Last Updated**: 2025-09-15
**Status**: Production

## MANDATORY: Always Build Working Software

**⚠️ CRITICAL: Claude Code must NEVER write mock, stub, TODO, or placeholder code. Every implementation must be functional, tested, and production-ready.**

### Working Software Requirements:

- ✅ **All code MUST be functional** - No `// TODO` comments or placeholder implementations
- ✅ **All code MUST be tested** - Follow TDD with 80% coverage before marking complete
- ✅ **All code MUST build** - No compilation errors or type issues
- ✅ **All code MUST pass validation** - Lint, typecheck, and tests must pass
- ✅ **All features MUST be complete** - No partial implementations marked as "done"

### FORBIDDEN Implementations:

```typescript
// ❌ NEVER DO THIS - Placeholder implementations
function getUserProfile(id: string) {
  // TODO: Implement user profile fetching
  return null;
}

// ❌ NEVER DO THIS - Mock implementations in production code
const mockUserData = { id: "123", name: "Test User" };

// ❌ NEVER DO THIS - Incomplete features
function validateDeck(deck: Deck) {
  console.log("Validation not implemented yet");
  return true; // This is not real validation
}
```

```typescript
// ✅ ALWAYS DO THIS - Complete, working implementations
async function getUserProfile(id: string): Promise<UserProfile | null> {
  try {
    const profile = await userRepository.findById(id);
    return profile ? profileMapper.toDTO(profile) : null;
  } catch (error) {
    logger.error('Failed to fetch user profile', { id, error });
    throw new UserProfileError('Unable to fetch user profile');
  }
}

// ✅ ALWAYS DO THIS - Real validation with business logic
function validateDeck(deck: Deck): DeckValidationResult {
  const validator = getDeckValidator(deck.format);
  return validator.validate(deck);
}
```

---

## Project Architecture Overview

**SideDecked is a community-driven TCG marketplace with split-brain architecture across four repositories:**

### Repository Structure
```
sidedecked/                    # Main project folder (NOT a git repo)
├── backend/                   # MercurJS Commerce (mercur-db)
├── customer-backend/          # Customer APIs (sidedecked-db)
├── storefront/                # Customer UI (Next.js)
└── vendorpanel/               # Vendor UI (React)
```

### Database Separation (CRITICAL)
```sql
-- mercur-db (Commerce Operations ONLY)
orders, payments, customers, vendors, marketplace_transactions

-- sidedecked-db (Customer Experience ONLY)
cards, decks, user_profiles, communities, pricing_data
```

**❌ NEVER mix data between databases or create direct connections**

---

## MANDATORY: Pre-Implementation Protocol

**⚠️ STOP! Before writing ANY code, you MUST complete this checklist:**

### Step 1: Load Core Context
```bash
# Execute these commands in order:
cat AGENTS.md                                    # Orchestrator for agents
cat docs/standards/code-standards.md       # Code requirements
cat docs/standards/testing-standards.md    # TDD requirements
find . -name "*.ts" -type f | head -20    # Understand code structure
```

### Step 2: Architecture Requirements

**Read architecture docs specific to your task:**

| Task Type | **MANDATORY Architecture Docs** |
|-----------|----------------------------------|
| **New Feature** | `docs/architecture/03-domain-models.md`, `docs/architecture/04-architectural-patterns.md` |
| **API Change** | `docs/architecture/06-integration-architecture.md` |
| **Database Change** | `docs/architecture/05-data-architecture.md` |
| **Authentication** | `docs/architecture/07-authentication-architecture.md` |

### Step 3: Verification Checklist

**Must answer YES to ALL before proceeding:**

- [ ] I understand which bounded context this feature belongs to
- [ ] I know which database to use (mercur-db or sidedecked-db)
- [ ] I have identified existing similar implementations
- [ ] I understand the testing requirements (TDD, 80% coverage)
- [ ] I have marked the specification as "in_progress" in TodoWrite
- [ ] I will write complete, working code with no placeholders

### Step 4: Domain Context Validation

**Answer these questions based on architecture documents:**

1. **Domain Context**: Which bounded context?
   - [ ] Commerce (orders, payments) → Uses mercur-db
   - [ ] TCG Catalog (cards, games) → Uses sidedecked-db
   - [ ] Deck Builder (decks, collections) → Uses sidedecked-db
   - [ ] Community (users, forums) → Uses sidedecked-db
   - [ ] Pricing (market data) → Uses sidedecked-db

2. **Database Selection**: Which database?
   - [ ] mercur-db (commerce operations only)
   - [ ] sidedecked-db (customer experience only)

3. **Integration Points**: What APIs will this interact with?
   - [ ] Internal APIs only
   - [ ] External service integration (Stripe, Algolia, etc.)
   - [ ] Cross-database communication via APIs

**❌ DO NOT PROCEED until you can answer ALL questions with confidence.**

---

## Technology Stack & Framework Decisions

### MANDATORY Technology Choices (R1 - Critical)

| Component | **MUST Use** | **NEVER Use** |
|-----------|--------------|---------------|
| **Commerce Backend** | MercurJS v2 | Custom commerce |
| **Customer Backend** | Node.js + TypeORM | Prisma, custom ORM |
| **Database** | PostgreSQL | MongoDB, SQLite |
| **Frontend** | Next.js 14 + React | Vue, Angular |
| **Authentication** | OAuth2 + JWT | Sessions, custom auth |
| **Payments** | Stripe Connect | Custom payment |
| **Search** | Algolia | Elasticsearch |
| **Cache** | Redis | In-memory cache |
| **Testing** | Vitest + Jest | Mocha |

### MedusaJS v2 Critical Patterns

```typescript
// ✅ CORRECT MedusaJS v2 patterns
import { MedusaStoreRequest, MedusaResponse } from '@medusajs/framework/http'
updateEntity({ id: 'entity_id' }, updateData, context)
export default ServiceClass  // Default export required
model.text().default('literal_value')  // Not () => value
{ resolve: './src/modules/auth' }  // Object format required
{ success: true, authIdentity: undefined }  // Not null

// ❌ FORBIDDEN MedusaJS patterns
MedusaRequest  // Use MedusaStoreRequest
'./modules/auth'  // Use { resolve: }
authIdentity: null  // Use undefined
() => new Date()  // Use literal values
```

---

## Quality Standards (MANDATORY)

### Test-Driven Development (TDD)
**REQUIREMENT: ALL features must be developed using TDD**

```bash
# Step 1: Write failing test FIRST
npm test  # Should fail

# Step 2: Write minimal working code
# Step 3: Make test pass
npm test  # Should pass

# Step 4: Refactor while keeping tests green
npm run test:watch

# Step 5: Check coverage (must be >80%)
npm run test:coverage
```

### Performance Targets
- API Response time: < 100ms (p95)
- Database queries: < 50ms
- Test coverage: > 80%
- TypeScript strict mode: Required
- ESLint errors: 0

### Pre-Commit Requirements
```bash
# MANDATORY before EVERY commit
npm run lint && npm run typecheck && npm run build && npm test
```

---

## Specification Implementation Tracking

### MANDATORY: Progress Management

**Before Starting Any Feature:**
1. **Mark as In Progress** in TodoWrite
2. **Update module-status.json** with current specification
3. **Load all required architecture documents**

**After Completing Any Feature:**
1. **Verify all acceptance criteria met**
2. **Ensure 80% test coverage**
3. **Update documentation** (MANDATORY)
4. **Mark as complete** in TodoWrite and module-status.json

### Specification Status Tracking
```json
{
  "specifications": {
    "01-authentication-user-management-system": "completed",
    "02-commerce-marketplace-system": "completed",
    "03-tcg-catalog-card-database-system": "completed",
    "04-vendor-management-system": "in_progress",
    "05-deck-building-system": "completed"
  },
  "current_specification": "04-vendor-management-system",
  "last_updated": "2025-09-15T00:00:00Z"
}
```

---

## MANDATORY: Documentation Requirements

**⚠️ CRITICAL: Documentation is NOT optional - it's required for every feature.**

### Required Documentation Updates

For ANY specification completion, you MUST update:
- [ ] **README.md** - Add new features/APIs
- [ ] **CHANGELOG.md** - Document all changes
- [ ] **Architecture docs** - Update for new patterns/integrations
- [ ] **API documentation** - For new endpoints

### Documentation Verification
```bash
# Before marking specification complete:
git status | grep -E "(docs/|README|CHANGELOG)" || {
  echo "❌ ERROR: No documentation updates detected!"
  exit 1
}
```

### FORBIDDEN in Documentation/Commits
- ❌ **Any AI references**: "Generated with Claude", "Co-Authored-By: Claude"
- ❌ **Robot emojis**: 🤖 or any AI-related emojis
- ❌ **TODO comments**: Convert to GitHub issues instead

---

## Critical Implementation Rules

### 1. Always Use Existing Frameworks
- **Before writing custom code**, check if existing library/framework handles it
- **Search the codebase** for similar implementations first
- **Follow established patterns** from existing code

### 2. Complete Feature Implementation
- **No partial implementations** - finish the entire feature
- **Include error handling** - comprehensive error scenarios
- **Add proper logging** - for debugging and monitoring
- **Write integration tests** - not just unit tests

### 3. Real Data Integration
- **Connect to actual databases/APIs** - no mock data in production code
- **Handle real error scenarios** - network failures, data corruption, etc.
- **Implement proper caching** - where architecturally required
- **Use actual external services** - Stripe, Algolia, etc.

### 4. Security Implementation
- **Implement real authentication** - no bypasses or mocks
- **Add proper authorization** - role-based access control
- **Validate all inputs** - sanitization and validation
- **Follow security patterns** - from architecture documentation

---

## Development Workflow

### Local Development Setup
```bash
# 1. Install all repositories
cd backend && npm install
cd customer-backend && npm install
cd storefront && npm install
cd vendorpanel && npm install

# 2. Run database migrations
cd backend && npm run migration:run
cd customer-backend && npm run migration:run

# 3. Start all services
npm run start  # Start all services
```

### Validation Workflow
```bash
# MANDATORY after EVERY code change
npm run build && npm test  # Must pass before continuing

# Before ANY commit (all services)
cd backend && npm run typecheck && npm run build && npm test
cd customer-backend && npm run typecheck && npm run build && npm test
cd storefront && npm run typecheck && npm run build && npm test
cd vendorpanel && npm run typecheck && npm run build && npm test
```

---

## Quick Reference Commands

```bash
# Development
npm run start           # Start all services
npm run dev:backend     # Backend only
npm run dev:customer    # Customer backend only
npm run dev:storefront  # Storefront only

# Testing & Quality
npm test                # Run all tests
npm run test:coverage   # Check coverage
npm run lint            # Lint all code
npm run typecheck       # Type checking

# Database
npm run migration:run   # Run migrations
npm run migration:create NAME  # Create migration
```

---

## CRITICAL REMINDERS

1. **NEVER commit without passing ALL validation checks**
2. **ALWAYS write tests FIRST (TDD methodology)**
3. **ALWAYS implement complete, working features - no placeholders**
4. **ALWAYS update documentation BEFORE marking complete**
5. **NEVER reference AI/automation in code, docs, or commits**
6. **ALWAYS use existing frameworks/libraries instead of custom code**
7. **ALWAYS mark specification progress in TodoWrite and module-status.json**

**Remember: Every line of code must be production-ready, tested, and functional. No exceptions.**

---

_This document serves as the definitive guide for Claude Code implementation in the SideDecked project. All requirements are mandatory and non-negotiable._
