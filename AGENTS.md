# AGENTS.md - SideDecked TCG Marketplace Implementation Orchestrator

## Project Overview

**SideDecked is a comprehensive community-driven trading card marketplace supporting Magic: The Gathering, Pokémon, Yu-Gi-Oh!, and One Piece cards, built on top of the MercurJS commerce platform.**

This document orchestrates the implementation of this modular TCG marketplace system utilizing a split-brain architecture with four separate repositories and ten specialized system specifications.

### Architecture Philosophy

- **Split-Brain Design**: Complete separation between commerce operations and customer experience
- **Multi-TCG Support**: Universal card catalog supporting all major trading card games
- **Community-First**: Built-in social features, deck building, and pricing intelligence
- **MercurJS Foundation**: Leveraging enterprise-grade commerce platform for scalability
- **Performance-Optimized**: Sub-100ms queries and real-time inventory synchronization
- **Quality-First**: 80% test coverage requirement and TDD methodology

## Project Context & Architecture

### Multi-Repository Structure

**CRITICAL**: The SideDecked project follows a **SPLIT-BRAIN ARCHITECTURE** with FOUR SEPARATE git repositories:

```
sidedecked/                    # Main project folder (NOT a git repo)
├── backend/                   # SEPARATE GIT REPO - MercurJS Commerce (mercur-db)
│   ├── .git/                  # Independent git repository
│   ├── src/
│   │   ├── modules/
│   │   │   ├── authentication/  # Social login & auth
│   │   │   └── vendor-management/ # Vendor tools & CSV import
│   │   ├── api/               # Commerce APIs only
│   │   └── services/          # Commerce services
│   └── package.json
│
├── vendorpanel/               # SEPARATE GIT REPO - Vendor UI
│   ├── .git/                  # Independent git repository
│   ├── src/
│   │   ├── pages/
│   │   │   ├── csv-import/    # Enhanced CSV import UI
│   │   │   ├── analytics/     # Vendor analytics
│   │   │   └── inventory/     # Inventory management
│   │   └── components/
│   └── package.json
│
├── storefront/                # SEPARATE GIT REPO - ALL Customer UI
│   ├── .git/                  # Independent git repository
│   ├── src/
│   │   ├── app/
│   │   │   ├── marketplace/   # Shopping & checkout UI
│   │   │   ├── cards/         # TCG catalog browsing UI
│   │   │   ├── decks/         # Deck builder UI
│   │   │   ├── community/     # Community features UI
│   │   │   ├── pricing/       # Price tracking UI
│   │   │   └── debug/         # Error monitoring dashboard (dev access)
│   │   ├── components/
│   │   │   ├── feedback/      # Error boundaries, toasts, loading states
│   │   │   ├── debug/         # Development debugging tools
│   │   │   └── ...            # Other components
│   │   ├── lib/
│   │   │   ├── api/           # Calls both backend and customer-backend
│   │   │   └── services/      # Error monitoring, inventory optimization
│   └── package.json
│
└── customer-backend/          # SEPARATE GIT REPO - Customer Data & APIs (sidedecked-db)
    ├── .git/                  # Independent git repository
    ├── src/                   # Customer experience API server
    │   ├── config/            # Database & infrastructure config
    │   ├── entities/          # TypeORM entities
    │   ├── routes/            # API endpoints
    │   ├── services/          # Business logic
    │   ├── middleware/        # Express middleware
    │   ├── migrations/        # Database migrations
    │   ├── scripts/           # ETL and utility scripts
    │   └── index.ts           # Main server entry point
    ├── packages/              # Shared modules (workspace packages)
    │   ├── tcg-catalog/       # Card database, ETL, search
    │   ├── deck-builder/      # Deck models & validation
    │   ├── community/         # Social features & forums
    │   ├── pricing/           # Price intelligence
    │   └── shared/            # Common types & utilities
    └── package.json           # Direct configuration (flat structure)
```

### Technology Stack

#### Core Infrastructure

| Component            | Technology                                | Purpose                               | Database        |
| -------------------- | ----------------------------------------- | ------------------------------------- | --------------- |
| **Backend**          | MercurJS (Medusa v2), Node.js, PostgreSQL | Commerce operations, orders, payments | mercur-db       |
| **Customer Backend** | Node.js, Express, TypeORM, PostgreSQL     | TCG catalog, customer features        | sidedecked-db   |
| **Storefront**       | Next.js 14, React, TypeScript             | Customer UI experience                | API consumption |
| **Vendor Panel**     | React, TypeScript, Admin Dashboard        | Vendor management interface           | API consumption |

#### External Services

| Service      | Provider              | Purpose                         | Priority      |
| ------------ | --------------------- | ------------------------------- | ------------- |
| **Search**   | Algolia               | Card search and discovery       | R1 - Critical |
| **Cache**    | Redis                 | Performance optimization        | R1 - Critical |
| **Storage**  | MinIO (S3-compatible) | Image and file storage          | R1 - Core     |
| **Email**    | Resend                | Transactional emails            | R1 - Critical |
| **Hosting**  | Railway               | Production deployment           | R1 - Critical |
| **Payments** | Stripe Connect        | Multi-seller payment processing | R1 - Critical |

---

## MANDATORY: Pre-Implementation Protocol

**⚠️ STOP! Before writing ANY code, you MUST complete this checklist:**

### Step 1: Load Core Context (REQUIRED)

```bash
# Execute these commands IN ORDER:
cat AGENTS.md | head -200           # Load main orchestrator
ls -la docs/standards/              # Review all standards
ls -la docs/specifications/         # Identify relevant specifications
find . -name "*.ts" -type f | head -20  # Understand code structure
```

### Step 2: Task-Specific Architecture Requirements

**⚠️ MANDATORY: Read architecture docs specific to your task type:**

| Task Type            | **MANDATORY Architecture Docs**                                                                                                                                                                 | **Additional Requirements**                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **New Feature**      | 1. `cat docs/architecture/03-domain-models.md` (identify domain)<br>2. `cat docs/architecture/04-architectural-patterns.md` (patterns)<br>3. Relevant specification from `docs/specifications/` | Testing standards, existing implementations |
| **Bug Fix**          | 1. `cat docs/architecture/04-architectural-patterns.md`<br>2. `cat docs/standards/code-standards.md`                                                                                            | Existing tests, error patterns              |
| **API Change**       | 1. `cat docs/architecture/06-integration-architecture.md`<br>2. `cat docs/architecture/04-architectural-patterns.md`                                                                            | API conventions, versioning                 |
| **Database Change**  | 1. `cat docs/architecture/05-data-architecture.md`<br>2. `cat docs/architecture/03-domain-models.md`                                                                                            | Migration patterns, schema design           |
| **UI Component**     | 1. `cat docs/architecture/04-architectural-patterns.md`<br>2. Component patterns from existing code                                                                                             | UI/UX guidelines, accessibility             |
| **Authentication**   | 1. `cat docs/architecture/07-authentication-architecture.md`<br>2. `cat docs/architecture/06-integration-architecture.md`                                                                       | Security patterns, OAuth flows              |
| **Commerce Feature** | 1. `cat docs/architecture/03-domain-models.md` (commerce domain)<br>2. `cat docs/architecture/05-data-architecture.md` (mercur-db)                                                              | MercurJS patterns                           |
| **TCG Feature**      | 1. `cat docs/architecture/03-domain-models.md` (TCG domain)<br>2. `cat docs/architecture/05-data-architecture.md` (sidedecked-db)                                                               | ETL patterns, catalog specs                 |

### Step 3: Verification Checklist

**Must answer YES to ALL before proceeding:**

- [ ] I have read AGENTS.md core sections
- [ ] I have read task-specific architecture documents (Step 2)
- [ ] I have read the relevant specification documentation
- [ ] I have reviewed applicable standards documents
- [ ] I have searched for similar existing implementations
- [ ] I understand which bounded context this feature belongs to
- [ ] I know which database this feature should use (mercur-db or sidedecked-db)
- [ ] I have identified the correct architectural patterns to follow
- [ ] I understand the integration points with other systems
- [ ] I understand the security and performance requirements
- [ ] I have identified which frameworks/libraries to use
- [ ] I understand the testing requirements
- [ ] I have marked the specification as "in_progress" in module-status.json
- [ ] I have updated TodoWrite with specification progress tracking

### Step 3.5: Architecture Validation (MANDATORY)

**⚠️ STOP GATE: Answer ALL questions based on architecture documents before proceeding:**

1. **Domain Context**: Which bounded context does this feature belong to?

   - [ ] Commerce (orders, payments, vendors) → Uses mercur-db
   - [ ] TCG Catalog (cards, games, sets) → Uses sidedecked-db
   - [ ] Deck Builder (decks, collections) → Uses sidedecked-db
   - [ ] Community (users, forums, messaging) → Uses sidedecked-db
   - [ ] Pricing (market data, portfolios) → Uses sidedecked-db

2. **Database Selection**: Which database should this feature use?

   - [ ] mercur-db (commerce operations only)
   - [ ] sidedecked-db (customer experience only)
   - [ ] Both databases (requires proper API separation)

3. **Architectural Pattern**: What pattern applies to this implementation?

   - [ ] Repository Pattern (data access)
   - [ ] Service Pattern (business logic)
   - [ ] Controller Pattern (API endpoints)
   - [ ] Event Pattern (async operations)

4. **Integration Points**: What APIs or events will this interact with?

   - [ ] Internal APIs only
   - [ ] External service integration (Stripe, Algolia, etc.)
   - [ ] Cross-database communication via APIs
   - [ ] Event-driven communication

5. **Security Requirements**: What authentication/authorization is required?

   - [ ] Public endpoint (no auth)
   - [ ] Customer authentication required
   - [ ] Vendor authentication required
   - [ ] Admin authentication required

6. **Performance Considerations**: What caching or optimization patterns apply?
   - [ ] Database query optimization
   - [ ] Redis caching
   - [ ] API response caching
   - [ ] Real-time data requirements

**❌ DO NOT PROCEED until you can answer ALL questions above with confidence.**

### Step 4: Document Your Understanding

Before coding, state:

1. **Specification**: This belongs to specification \_\_\_
2. **Pattern**: I will follow the pattern from \_\_\_
3. **Frameworks**: I will use \_\_\_ (per AGENTS.md decision matrix)
4. **Tests**: I will write tests for \_\_\_
5. **Documentation**: I will update \_\_\_

### Step 5: Commit Message Format (CRITICAL)

When committing changes, you MUST:

- [ ] Use conventional commit format: `type(scope): description`
- [ ] EXCLUDE any AI/automation references
- [ ] Follow commit-standards.md exactly
- [ ] Run all pre-commit checks

**Example correct commit:**

```
feat(auth): implement JWT refresh token rotation

- Add refresh token generation with 30-day expiry
- Implement token rotation on each refresh
- Add rate limiting to prevent token abuse
```

**❌ FORBIDDEN: NEVER mention "Claude", "AI", "assistant", "bot", or any AI-related terms**
**❌ FORBIDDEN: NEVER include "Generated with", "Co-Authored-By: Claude", or similar**
**❌ FORBIDDEN: NEVER add robot emojis (🤖) or any AI-related emojis**

**If you skip this protocol, your code WILL be rejected.**

---

## MANDATORY: Architecture-First Protocol

**⚠️ CRITICAL: Before implementing ANY feature, you MUST follow architecture-first thinking:**

### Required Architecture Reading (MANDATORY before coding)

**Must read IN ORDER for every feature:**

1. **Core Architecture Documents**:

   ```bash
   cat docs/architecture/05-data-architecture.md              # System architecture & domain models
   cat docs/architecture/01-system-overview.md    # System overview
   cat docs/architecture/02-architectural-principles.md  # Guiding principles
   ```

2. **Pattern & Decision Context**:

   ```bash
   cat docs/architecture/03-domain-models.md      # Domain boundaries & entities
   cat docs/architecture/04-architectural-patterns.md   # Implementation patterns
   cat docs/architecture/06-integration-architecture.md # API & integration patterns
   grep -r "your-feature-area" docs/architecture/adr/   # Relevant ADRs
   ```

3. **Data & Storage Context**:
   ```bash
   cat docs/architecture/05-data-architecture.md  # Data modeling & storage patterns
   ```

### Architecture-First Verification Checklist

**Must answer YES to ALL before writing ANY code:**

- [ ] **Domain Understanding**: I understand which bounded context this feature belongs to
- [ ] **Entity Modeling**: I understand the domain entities and their relationships
- [ ] **Integration Patterns**: I understand how this feature integrates with other domains
- [ ] **Data Patterns**: I understand the data storage and retrieval patterns to use
- [ ] **API Patterns**: I understand the API design patterns to follow
- [ ] **Event Patterns**: I understand what events this feature should emit/consume
- [ ] **Security Patterns**: I understand the security requirements and patterns
- [ ] **Performance Patterns**: I understand the performance requirements and caching strategies
- [ ] **Error Handling**: I understand the error handling and retry patterns
- [ ] **Testing Strategy**: I understand the testing approach for this architectural layer

### Split-Brain Architecture Rules

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

### Architecture Violations (Will cause immediate rejection)

**❌ NEVER do these - they violate core architectural principles:**

#### Document Reading Violations:

- ❌ Writing customer features without reading `03-domain-models.md`
- ❌ Creating APIs without reading `06-integration-architecture.md`
- ❌ Modifying database without reading `05-data-architecture.md`
- ❌ Adding auth features without reading `07-authentication-architecture.md`
- ❌ Writing any code without reading `04-architectural-patterns.md`

#### Domain Boundary Violations:

- ❌ Adding commerce operations to customer-backend (wrong database)
- ❌ Adding customer features to backend (wrong service)
- ❌ Creating direct connections between mercur-db and sidedecked-db
- ❌ Mixing TCG catalog logic with commerce order logic

#### Pattern Violations:

- ❌ Ignoring Repository pattern for data access
- ❌ Not using Service pattern for business logic
- ❌ Creating controllers without following API patterns
- ❌ Implementing features without understanding existing patterns

#### Integration Violations:

- ❌ Creating APIs without following established conventions
- ❌ Not using proper error handling patterns
- ❌ Ignoring authentication/authorization requirements
- ❌ Adding external dependencies without architectural review

#### Performance Violations:

- ❌ Creating N+1 queries without understanding data patterns
- ❌ Not using caching where architecturally required
- ❌ Ignoring split-brain architecture performance implications

**Architecture-first thinking ensures scalable, maintainable, and consistent code.**

---

## Specification Implementation Tracking

### MANDATORY: Specification Progress Management

**⚠️ CRITICAL: You MUST mark specification progress before and after implementation:**

#### Before Starting Any Specification:

1. **Mark as In Progress**:

   ```bash
   # Update module-status.json to mark current specification as "in_progress"
   # Update "current_specification" field with specification ID
   # Update "last_updated" timestamp
   ```

2. **Use TodoWrite Tool**:
   ```typescript
   TodoWrite({
     todos: [
       {
         content: "Implement Specification XX: [System Name]",
         status: "in_progress",
         activeForm: "Implementing Specification XX: [System Name]",
       },
     ],
   });
   ```

#### After Completing Any Specification:

1. **Mark as Complete**:

   ```bash
   # Update module-status.json to mark specification as "completed"
   # Set "current_specification" to next specification or null
   # Update "last_updated" timestamp
   ```

2. **Update TodoWrite**:
   ```typescript
   TodoWrite({
     todos: [
       {
         content: "Implement Specification XX: [System Name]",
         status: "completed",
         activeForm: "Completed Specification XX: [System Name]",
       },
     ],
   });
   ```

### Specification Status File Format

The `module-status.json` file tracks all specification progress:

```json
{
  "specifications": {
    "01-authentication-user-management-system": "completed",
    "02-commerce-marketplace-system": "completed",
    "03-tcg-catalog-card-database-system": "completed",
    "04-vendor-management-system": "in_progress",
    "05-deck-building-system": "completed",
    "06-community-social-system": "not_started",
    "07-pricing-intelligence-system": "not_started",
    "08-search-discovery-system": "not_started",
    "09-inventory-management-system": "not_started",
    "10-payment-processing-system": "not_started"
  },
  "current_specification": "04-vendor-management-system",
  "last_updated": "2025-09-12T00:00:00Z",
  "completed_count": 4,
  "total_count": 10,
  "notes": {
    "01-authentication-user-management-system": "OAuth2 social login and JWT integration complete",
    "02-commerce-marketplace-system": "Customer marketplace features and MercurJS integration complete",
    "03-tcg-catalog-card-database-system": "Universal TCG catalog with ETL pipeline operational",
    "05-deck-building-system": "Universal deck builder with validation and social features complete"
  }
}
```

**Status Values:**

- `"not_started"` - Specification not yet begun
- `"in_progress"` - Specification currently being implemented
- `"completed"` - Specification fully implemented and tested

---

## MANDATORY: Acceptance Criteria Tracking Protocol

### When Implementing Any User Story

**⚠️ CRITICAL: You MUST track progress against ALL acceptance criteria**

#### Before Starting Implementation:

1. **Read the complete user story** and ALL acceptance criteria
2. **Check existing implementations** - many features may already exist
3. **Mark current status** of each criterion before writing new code

#### Status Markers to Use:

- ✅ **IMPLEMENTED** - Feature is fully built and functional

  ```markdown
  - ✅ User can login with OAuth (IMPLEMENTED)
    - Location: `storefront/src/components/molecules/SocialLoginButtons/`
    - Note: Supports 5 providers instead of specified 2
  ```

- 🔄 **PARTIAL** - Feature is partially implemented or in progress

  ```markdown
  - 🔄 User receives welcome email (PARTIAL)
    - Location: Email templates exist but sending not configured
  ```

- ❌ **NOT BUILT** - Feature has not been implemented

  ```markdown
  - ❌ User receives SMS verification (NOT BUILT)
  ```

- ⚠️ **MODIFIED** - Feature implemented differently than specified
  ```markdown
  - ⚠️ Profile uses display_name instead of username (MODIFIED)
    - Note: Changed per UX feedback in PR #123
  ```

#### During Implementation:

1. **As you complete each acceptance criterion**, immediately mark it with status
2. **Add file locations** where features are implemented
3. **Include notes** for any deviations from specification
4. **Update status** if you discover existing implementations

#### After Completing Implementation:

1. **Review ALL acceptance criteria** in the user story
2. **Ensure each criterion has a status marker** and location if implemented
3. **Calculate completion percentage** for the epic
4. **Update epic summary** with overall progress
5. **Commit with message** referencing completed criteria

### Example Complete User Story:

```markdown
#### User Story 1.1: Social Login Registration

_As a new user, I want to register using my Google or GitHub account..._

**Acceptance Criteria:**

- ✅ User can click social login buttons (IMPLEMENTED)
  - Location: `storefront/src/components/molecules/SocialLoginButtons/`
  - Note: 5 providers implemented (Google, GitHub, Microsoft, Facebook, Apple)
- ✅ System redirects to OAuth2 provider (IMPLEMENTED)
  - Location: `storefront/src/app/auth/callback/route.ts`
- 🔄 User is redirected to onboarding flow (PARTIAL)
  - Location: Seller onboarding exists, general user onboarding missing
- ✅ System handles OAuth2 errors gracefully (IMPLEMENTED)
  - Location: Error handling in SocialLoginButtons component
```

### Epic Completion Tracking:

After marking all user stories in an epic, add completion summary:

```markdown
### Epic 1 Completion Status: 75% (6/8 stories fully implemented)

- User Story 1.1: ✅ FULLY IMPLEMENTED (4/4 criteria)
- User Story 1.2: 🔄 PARTIALLY IMPLEMENTED (2/4 criteria)
- User Story 1.3: ❌ NOT IMPLEMENTED (0/4 criteria)
```

### Critical Reminders:

- **Check existing code FIRST** - many features may already be built
- **Include file paths** for all implemented features
- **Note any deviations** from original specification
- **Update status** as you discover or implement features
- **Never assume a feature is missing** without checking the codebase

---

## Post-Implementation Protocol

### MANDATORY: Specification Completion Checklist

**⚠️ CRITICAL: Complete ALL steps when finishing any specification:**

#### Step 1: Functional Verification

- [ ] All specification functionality works as specified
- [ ] All tests pass (unit, integration, e2e)
- [ ] No lint or TypeScript errors remain
- [ ] Performance requirements met (sub-100ms queries)
- [ ] Security requirements satisfied
- [ ] Cross-service integration verified

#### Step 2: Documentation Update (MANDATORY)

**⚠️ FAILURE TO UPDATE DOCS = PHASE NOT COMPLETE**

Based on phase type, update ALL applicable documentation:

**Core Documentation (ALL specifications):**

- [ ] `README.md` - Add new features/APIs to main README
- [ ] `CHANGELOG.md` - Document all changes with version info
- [ ] `docs/specifications/XX-[system-name].md` - Add implementation notes and lessons learned

**Architecture Documentation (if applicable):**

- [ ] `docs/architecture/03-domain-models.md` - Update for new entities/aggregates
- [ ] `docs/architecture/06-integration-architecture.md` - Update for new integrations
- [ ] `docs/architecture/05-data-architecture.md` - Update for new data patterns
- [ ] `docs/architecture/04-architectural-patterns.md` - Update for new patterns
- [ ] `docs/architecture/adr/ADR-XXX-[decision].md` - Create ADR for major decisions

**API Documentation (if specification adds endpoints):**

- [ ] Repository-specific API documentation
- [ ] Update OpenAPI/Swagger spec if exists

**Verification Commands (MANDATORY):**

```bash
# Step 2a: Verify docs were updated
git status | grep -E "modified:.*docs/|modified:.*README|modified:.*CHANGELOG" || echo "ERROR: No documentation updates detected!"

# Step 2b: Verify architecture docs are current
git diff --name-only | grep -E "docs/architecture/" && echo "Architecture docs updated ✓"
```

#### Step 3: Quality Gates

- [ ] 80% test coverage maintained across all modules
- [ ] Performance testing completed (sub-100ms queries)
- [ ] Security review passed
- [ ] Cross-browser compatibility verified
- [ ] All validation workflows pass

#### Step 4: Specification Status Update

1. **Update module-status.json**:

   ```json
   {
     "specifications": {
       "XX-system-name": "completed"  // Mark as completed
     },
     "current_specification": "YY-next-system",  // Next specification or null
     "last_updated": "YYYY-MM-DDTHH:mm:ssZ",  // Update timestamp
     "completed_count": X  // Increment count
   }
   ```

2. **Final TodoWrite Update**:
   ```typescript
   TodoWrite({
     todos: [
       {
         content: "Complete Specification XX: [System Name]",
         status: "completed",
         activeForm: "Completed Specification XX: [System Name]",
       },
     ],
   });
   ```

#### Step 5: Commit Specification Completion

```bash
git add .
git commit -m "feat(system-XX): complete [System Name] implementation

- Implement all specified functionality
- Add comprehensive test coverage
- Update documentation
- Mark specification as completed in module-status.json

Closes XX-system-name specification implementation."
```

**⚠️ A specification is NOT complete until ALL steps are verified and module-status.json is updated.**

---

## MANDATORY: Documentation Update Protocol

**⚠️ CRITICAL: Documentation is NOT optional - it's a required deliverable for every specification.**

### Documentation Requirements by Specification Type

Each specification type has specific documentation that MUST be updated upon completion:

| Specification Type                   | Required Documentation Updates                                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication & User Management** | `docs/architecture/03-domain-models.md` (User domain), `docs/architecture/06-integration-architecture.md`, API docs              |
| **Commerce & Marketplace**           | API documentation, performance patterns, UX/UI guidelines                                                                        |
| **TCG Catalog & Card Database**      | `docs/architecture/03-domain-models.md` (Card domain), `docs/architecture/04-architectural-patterns.md`, ETL documentation       |
| **Vendor Management**                | `docs/architecture/03-domain-models.md` (Vendor domain), `docs/architecture/06-integration-architecture.md`, CSV import patterns |
| **Deck Building**                    | `docs/architecture/04-architectural-patterns.md`, validation engine documentation                                                |
| **Community & Social**               | `docs/architecture/03-domain-models.md` (Community domain), social features patterns                                             |
| **Pricing Intelligence**             | `docs/architecture/05-data-architecture.md`, ML/analytics architecture, performance patterns                                     |
| **Search & Discovery**               | `docs/architecture/04-architectural-patterns.md`, search architecture, performance patterns                                      |
| **Inventory Management**             | `docs/architecture/05-data-architecture.md`, real-time sync patterns                                                             |
| **Payment Processing**               | `docs/architecture/06-integration-architecture.md`, security patterns, compliance documentation                                  |

### Architecture Documentation Update Requirements

**MANDATORY updates for specifications that:**

1. **Add New Domain Entities** → Update `docs/architecture/03-domain-models.md`

   - Add new aggregates and their relationships
   - Update domain boundary diagrams
   - Document new business rules and constraints

2. **Add New Integrations** → Update `docs/architecture/06-integration-architecture.md`

   - Add new external service integrations
   - Update integration flow diagrams
   - Document API contracts and webhook patterns

3. **Change Data Patterns** → Update `docs/architecture/05-data-architecture.md`

   - Document new database schemas
   - Update caching strategies
   - Add performance considerations

4. **Introduce New Patterns** → Update `docs/architecture/04-architectural-patterns.md`

   - Document new coding patterns
   - Add example implementations
   - Update best practices

5. **Make Architectural Decisions** → Create `docs/architecture/adr/ADR-XXX-[decision].md`
   - Document significant technical decisions
   - Include alternatives considered
   - Add consequences and trade-offs

### Documentation Verification Process

**Before marking any specification as complete:**

```bash
# Step 1: Check if documentation was updated
git status | grep -E "(docs/|README|CHANGELOG)" || {
  echo "❌ ERROR: No documentation updates detected!"
  echo "Specification cannot be marked complete without documentation updates."
  exit 1
}

# Step 2: Verify architecture docs for architecture-impacting specifications
case "$SPEC_TYPE" in
  "authentication"|"commerce"|"tcg-catalog"|"vendor-management"|"deck-building"|"community"|"pricing"|"search"|"inventory"|"payment")
    git diff --name-only | grep -E "docs/architecture/" || {
      echo "❌ ERROR: Architecture documentation must be updated for $SPEC_TYPE specifications!"
      exit 1
    }
    ;;
esac

# Step 3: Check README was updated with new features
git diff README.md | grep -E "\+" && echo "✅ README updated" || {
  echo "❌ WARNING: README should be updated with new features"
}

# Step 4: Verify CHANGELOG was updated
git diff CHANGELOG.md | grep -E "\+" && echo "✅ CHANGELOG updated" || {
  echo "❌ ERROR: CHANGELOG must be updated for every specification"
  exit 1
}
```

### Documentation Anti-Patterns (Will cause immediate rejection)

- ❌ **Completing a specification without updating ANY documentation**
- ❌ **Adding new domain entities without updating domain models**
- ❌ **Creating new integrations without updating integration architecture**
- ❌ **Making architectural decisions without creating an ADR**
- ❌ **Adding APIs without documenting them**
- ❌ **Changing data schemas without updating data architecture docs**
- ❌ **Introducing new patterns without documenting them**
- ❌ **Completing infrastructure changes without updating system overview**

### TodoWrite Documentation Tasks

When starting any specification, include documentation tasks in TodoWrite:

```typescript
TodoWrite({
  todos: [
    {
      content: "Update architecture documentation for Specification XX",
      status: "pending",
      activeForm: "Updating architecture documentation",
    },
    {
      content: "Create/update API documentation",
      status: "pending",
      activeForm: "Creating API documentation",
    },
    {
      content: "Update README and CHANGELOG",
      status: "pending",
      activeForm: "Updating project documentation",
    },
    {
      content: "Create ADR for major decisions",
      status: "pending",
      activeForm: "Creating architectural decision record",
    },
  ],
});
```

**Remember: Documentation is code. Undocumented code is incomplete code.**

---

## System Specifications Implementation

### MVP (R1) - Core System Specifications ✅ **PARTIALLY COMPLETED**

**Core Objective**: Complete community-driven TCG marketplace with deck building

#### 1. Authentication & User Management System ✅ **COMPLETED**

**File**: `docs/specifications/01-authentication-user-management-system.md`

- OAuth2 social login (Google, GitHub)
- PKCE security implementation
- JWT integration with MercurJS
- User profiles and vendor verification
- Role-based access control

#### 2. Commerce & Marketplace System ✅ **COMPLETED**

**File**: `docs/specifications/02-commerce-marketplace-system.md`

- MercurJS integration and product listings
- Multi-vendor checkout and order processing
- Stripe Connect payment processing
- Shopping cart and marketplace features
- Reviews and ratings system

#### 3. TCG Catalog & Card Database System ✅ **COMPLETED**

**File**: `docs/specifications/03-tcg-catalog-card-database-system.md`

- Universal card database supporting MTG, Pokémon, Yu-Gi-Oh!, One Piece
- ETL pipeline for card data from multiple sources
- Image processing and CDN integration
- Catalog SKU standardization system
- Advanced search and filtering

#### 4. Vendor Management System **IN PROGRESS**

**File**: `docs/specifications/04-vendor-management-system.md`

- Enhanced CSV import transformation
- TCG analytics and reporting dashboard
- Bulk inventory management tools
- Automated pricing and market intelligence
- Performance tracking and financial reporting

#### 5. Deck Building System ✅ **COMPLETED**

**File**: `docs/specifications/05-deck-building-system.md`

- Universal deck architecture for all TCG games
- Format-specific validation engines
- Drag-and-drop deck editor with zone management
- Public/private deck sharing with social features
- Collection integration and completion tracking
- Import/export functionality for multiple formats

### Advanced System Specifications (R2)

#### 6. Community & Social System

**File**: `docs/specifications/06-community-social-system.md`

- User profiles with reputation system
- Social networking and following system
- Real-time messaging and trade negotiations
- Forum and discussion boards with moderation
- Tournament organization system
- Badge and achievement system

#### 7. Pricing Intelligence System

**File**: `docs/specifications/07-pricing-intelligence-system.md`

- Real-time price scraping from multiple sources
- ML-based price prediction models
- Advanced market analytics and insights
- Investment portfolio tracking
- Price trend analysis and alerts
- Market report generation

#### 8. Search & Discovery System

**File**: `docs/specifications/08-search-discovery-system.md`

- Advanced search with filters and facets
- Algolia integration for real-time search
- Autocomplete and search suggestions
- Visual search capabilities
- Search analytics and optimization
- Personalized recommendations

#### 9. Inventory Management System

**File**: `docs/specifications/09-inventory-management-system.md`

- Real-time inventory synchronization
- Multi-channel inventory tracking
- Automated reordering and stock alerts
- Inventory optimization algorithms
- Warehouse management integration
- Cross-platform inventory sync

#### 10. Payment Processing System

**File**: `docs/specifications/10-payment-processing-system.md`

- Stripe Connect multi-seller payments
- Split payments and commission handling
- Refund and dispute management
- Payment method diversity (cards, digital wallets)
- International payment processing
- Compliance and security features

---

## Development Standards

This project enforces strict development standards. **ALL are mandatory.**

### Framework Decision Matrix

#### R1 (MVP) Technology Decisions:

| Need             | Use                | Never                 | Priority          |
| ---------------- | ------------------ | --------------------- | ----------------- |
| Commerce Backend | MercurJS v2        | Custom commerce       | **R1 - Critical** |
| Customer Backend | Node.js + TypeORM  | Prisma, custom ORM    | **R1 - Critical** |
| Database         | PostgreSQL         | MongoDB, SQLite       | **R1 - Critical** |
| Frontend         | Next.js 14 + React | Vue, Angular          | **R1 - Critical** |
| Authentication   | OAuth2 + JWT       | Sessions, custom auth | **R1 - Critical** |
| Payments         | Stripe Connect     | Custom payment        | **R1 - Critical** |
| Search           | Algolia            | Elasticsearch, custom | **R1 - Core**     |
| Cache            | Redis              | In-memory, file cache | **R1 - Core**     |
| Storage          | MinIO (S3)         | Local filesystem      | **R1 - Core**     |
| Email            | Resend             | SMTP, custom email    | **R1 - Core**     |
| Testing          | Vitest + Jest      | Mocha, custom         | **R1 - Core**     |

### Core Requirements:

- **[Testing Standards](./docs/standards/testing-standards.md)** - TDD, 80% coverage, verification before commit
- **[Code Standards](./docs/standards/code-standards.md)** - TypeScript strict mode, ESLint, error handling
- **[Commit Standards](./docs/standards/commit-standards.md)** - Pre-commit hooks, conventional commits

### Quick Reference:

- Write tests FIRST (TDD)
- Use established frameworks before custom code
- Document every architectural change
- Verify functionality before commit
- 80% test coverage requirement
- Sub-100ms query performance target

### MedusaJS v2 Critical Patterns

```typescript
// ✅ CORRECT
import { MedusaStoreRequest, MedusaResponse } from '@medusajs/framework/http'
updateEntity({ id: 'entity_id' }, updateData, context)  // Object ID parameter
export default ServiceClass  // Default export
model.text().default('literal_value')  // Not () => value
{ resolve: './src/modules/auth' }  // Object format
{ success: true, authIdentity: undefined }  // Not null

// ❌ FORBIDDEN
MedusaRequest  // Use MedusaStoreRequest
'./modules/auth'  // Use { resolve: }
[Service1, Service2]  // Use single service
created_at, updated_at, deleted_at  // Implicit fields
() => new Date()  // Use literal values
authIdentity: null  // Use undefined
session: {...}  // Not supported
```

### Critical Reminders:

1. **NEVER commit without running ALL checks**
2. **ALWAYS write tests FIRST (TDD)**
3. **ALWAYS use existing frameworks/libraries**
4. **ALWAYS update documentation BEFORE marking phase complete**
   - README.md for new features and APIs
   - CHANGELOG.md for all changes
   - Architecture docs for system changes
   - API docs for new endpoints
   - ADRs for significant decisions
5. **NEVER reference AI/automation in code, docs, or commit messages**
   - No "Generated with Claude Code" in commits
   - No "Co-Authored-By: Claude" in commits
   - No AI tool mentions anywhere
6. **ALWAYS plan before implementing**
7. **ALWAYS fix lint/type/test errors before commit**
8. **ALWAYS mark specification as "in_progress" before starting and "completed" when finished**
   - Update module-status.json with current status
   - Use TodoWrite tool to track specification progress
   - Follow Post-Implementation Protocol for completion
   - **MANDATORY: Verify documentation was updated during completion**
9. **ALWAYS track acceptance criteria progress when implementing user stories**
   - Mark each criterion with ✅ IMPLEMENTED, 🔄 PARTIAL, ❌ NOT BUILT, or ⚠️ MODIFIED
   - Include file locations for implemented features
   - Add notes for deviations from specification
   - Update epic completion percentage based on criteria status

**See individual documents for detailed requirements.**

---

## Development Workflow

### Local Development Setup

```bash
# 1. Install all repositories
cd backend && npm install
cd customer-backend && npm install
cd storefront && npm install
cd vendorpanel && npm install

# 2. Configure environment variables
cp backend/.env.template backend/.env
# Edit .env files with proper values

# 3. Run database migrations
cd backend && npm run migration:run
cd customer-backend && npm run migration:run

# 4. Setup inventory sync (REQUIRED)
# Create publishable API key in Medusa admin
# Add to customer-backend/.env: COMMERCE_PUBLISHABLE_KEY=pk_xxx

# 5. Start development services
cd backend && npm run dev           # :9000
cd customer-backend && npm run dev  # :7000
cd vendorpanel && npm run dev       # :5173
cd storefront && npm run dev        # :3000
```

### Test-Driven Development Workflow

```bash
# Step 1: Create test file FIRST
touch src/feature.test.ts

# Step 2: Write failing test
# Edit src/feature.test.ts with test cases

# Step 3: Run test to see it fail
npm test

# Step 4: Write minimal code to pass test
touch src/feature.ts

# Step 5: Run test to see it pass
npm test

# Step 6: Refactor while keeping tests green
npm run test:watch

# Step 7: Check coverage (must be >80%)
npm run test:coverage

# Step 8: Run all checks before commit
npm run pre-commit

# Step 9: MANDATORY - Verify documentation was updated (for specifications)
git status | grep -E "(docs/|README|CHANGELOG)" || echo "⚠️  WARNING: No documentation updates detected!"
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

## Performance Targets

### API Performance

- Response time: < 100ms (p95)
- Database queries: < 50ms
- Search queries: < 200ms
- Real-time inventory: < 500ms

### UI Performance

- Time to Interactive: < 2s
- Largest Contentful Paint: < 1.5s
- First Input Delay: < 100ms
- Cumulative Layout Shift: < 0.1

### Quality Targets

- Test coverage: > 80%
- TypeScript strict mode: Required
- ESLint errors: 0
- Build warnings: 0

---

## Quick Start Commands

```bash
# Development
npm run start           # Start all services
npm run dev:backend     # Backend only
npm run dev:customer    # Customer backend only
npm run dev:storefront  # Storefront only
npm run dev:vendor      # Vendor panel only

# Testing
npm test               # Run all tests
npm run test:coverage  # Check coverage
npm run test:watch     # Watch mode

# Quality
npm run lint           # Lint all code
npm run typecheck      # Type checking
npm run format         # Format code

# Database
npm run migration:run  # Run migrations
npm run migration:create NAME  # Create migration

# Utilities
npm run doc:check      # Verify documentation
npm run spec:status   # Check specification progress
```

---

_This orchestrator document should be used in conjunction with individual system specifications, standards documentation, and architecture guides for complete implementation guidance._
