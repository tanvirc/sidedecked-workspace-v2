# Commit Standards

**MANDATORY: These commit standards are NON-NEGOTIABLE and must be followed for every commit, without exception.**

## Pre-Commit Requirements

**REQUIREMENT: ALL checks must pass before commit. NO exceptions.**

### Pre-commit Verification Script

Save this as `.husky/pre-commit` or run manually before each commit:

```bash
#!/bin/bash
# Pre-commit verification script - Run before EVERY commit

echo "Running pre-commit checks for SideDecked..."

# 1. Run linter across all services
echo "🔍 Running lint checks..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Lint failed. Fix errors before committing."
  exit 1
fi

# 2. Run type check across all services
echo "📝 Running TypeScript checks..."
npm run typecheck
if [ $? -ne 0 ]; then
  echo "❌ Type check failed. Fix errors before committing."
  exit 1
fi

# 3. Run tests across all services
echo "🧪 Running test suite..."
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Fix failing tests before committing."
  exit 1
fi

# 4. Run build across all services
echo "🏗️ Running build checks..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Fix build errors before committing."
  exit 1
fi

# 5. Check test coverage (must be >80%)
echo "📊 Checking test coverage..."
npm run test:coverage
COVERAGE_CHECK=$?
if [ $COVERAGE_CHECK -ne 0 ]; then
  echo "❌ Coverage below 80%. Add more tests."
  exit 1
fi

# 6. Verify MercurJS specific patterns
echo "🔧 Verifying MercurJS patterns..."
# Check for forbidden patterns
FORBIDDEN_PATTERNS=(
  "MedusaRequest[^S]"
  "'\.\/modules\/"
  "authIdentity: null"
  "session: \{"
  "\(\) => new Date\(\)"
)

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  if grep -r "$pattern" --include="*.ts" --include="*.tsx" src/; then
    echo "❌ Forbidden MercurJS pattern found: $pattern"
    echo "See AGENTS.md for correct patterns"
    exit 1
  fi
done

# 7. Feature Verification (MANDATORY)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 30-SECOND REALITY CHECK - Answer ALL questions:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "✓ Did you run/build the code? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ You must run/build the code before committing."
  exit 1
fi

read -p "✓ Did you trigger the exact feature you changed? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ You must test the actual feature before committing."
  exit 1
fi

read -p "✓ Did you see the expected result with your own observation? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ You must verify the result before committing."
  exit 1
fi

read -p "✓ Did you check for error messages in console/logs? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ You must check for errors before committing."
  exit 1
fi

read -p "✓ Did you test cross-service integration if applicable? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ You must test service integration before committing."
  exit 1
fi

# 8. Documentation Check (for phase work)
if git diff --cached --name-only | grep -E "src/|docs/"; then
  echo "🔍 Checking documentation updates..."
  if ! git diff --cached --name-only | grep -E "(docs/|README|CHANGELOG)"; then
    echo "⚠️  WARNING: No documentation updates detected for code changes."
    echo "Consider updating:"
    echo "  - README.md for new features"
    echo "  - CHANGELOG.md for version tracking"
    echo "  - docs/architecture/ for system changes"
    read -p "Continue without documentation updates? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "❌ Add documentation updates before committing."
      exit 1
    fi
  fi
fi

echo "✅ All pre-commit checks passed!"
```

## Conventional Commit Format

**MANDATORY: Use conventional commit format for ALL commits**

### Format Structure
```
type(scope): description

[optional body]

[optional footer(s)]
```

### Commit Types (REQUIRED)
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (white-space, formatting)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes affecting build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope Guidelines (Repository-Specific)

#### Backend (Commerce)
- `auth` - Authentication and authorization
- `vendor` - Vendor management features
- `product` - Product catalog operations
- `order` - Order processing
- `payment` - Payment processing
- `admin` - Admin panel features
- `api` - API endpoints
- `db` - Database changes

#### Customer-Backend
- `catalog` - TCG catalog features
- `etl` - Data ETL processes
- `deck` - Deck builder features
- `community` - Social features
- `pricing` - Price intelligence
- `search` - Search functionality
- `api` - API endpoints

#### Storefront
- `ui` - User interface components
- `pages` - Page components
- `hooks` - Custom React hooks
- `auth` - Authentication UI
- `search` - Search interface
- `deck` - Deck builder UI
- `marketplace` - Shopping interface

#### Vendor Panel
- `import` - CSV import features
- `analytics` - Vendor analytics
- `inventory` - Inventory management
- `ui` - User interface components

### Example Commit Messages

#### ✅ CORRECT Examples
```bash
feat(auth): implement JWT refresh token rotation

- Add refresh token generation with 30-day expiry
- Implement token rotation on each refresh
- Add rate limiting to prevent token abuse
- Update authentication middleware

Closes #123

fix(catalog): resolve card image loading timeout

- Increase timeout for image processing to 30 seconds
- Add retry logic for failed image downloads
- Implement fallback to placeholder images
- Update error logging for better debugging

Fixes #456

docs(architecture): update domain model documentation

- Add new deck builder entity relationships
- Update integration architecture for new APIs
- Document performance optimizations

perf(search): optimize Algolia query performance

- Implement query result caching with 5-minute TTL
- Reduce facet requests by 40%
- Add pagination for large result sets
- Update search index configuration

test(deck): add comprehensive deck validation tests

- Add unit tests for all format validators
- Test invalid deck configurations
- Add integration tests for deck CRUD operations
- Achieve 95% coverage for deck builder module

refactor(vendor): extract CSV parsing logic to service

- Create dedicated CSVParserService
- Remove parsing logic from component
- Add comprehensive error handling
- Improve testability and maintainability
```

#### ❌ FORBIDDEN Examples
```bash
# NO AI REFERENCES
feat(auth): implement JWT tokens 🤖 Generated with Claude Code
fix: resolve auth bug Co-Authored-By: Claude <noreply@anthropic.com>
docs: update readme Generated with AI assistance

# NO VAGUE DESCRIPTIONS  
fix: bug fix
feat: add stuff
update: changes

# NO PERSONAL REFERENCES
fix: my changes to auth
feat: I added deck builder
update: fixed my mistake

# WRONG FORMAT
Fix auth bug (no type)
feat add deck builder (missing colon)
FEAT(auth): uppercase type
```

## Commit Message Requirements

### Description Requirements
- Use imperative mood ("add feature" not "added feature")
- Don't capitalize first letter after colon
- No period at the end of description
- Maximum 72 characters for description line
- Be specific about what changed

### Body Requirements (when applicable)
- Separate body from description with blank line
- Wrap at 72 characters
- Explain WHAT and WHY, not HOW
- Use bullet points for multiple changes
- Reference issues and pull requests

### Footer Requirements
- Use for breaking changes: `BREAKING CHANGE:`
- Reference issues: `Closes #123`, `Fixes #456`, `Refs #789`
- Co-author attribution (human only): `Co-authored-by: Name <email>`

## Special Commit Scenarios

### Specification Completion Commits
When completing an entire specification:

```bash
feat(vendor): complete vendor management system implementation

- Implement native CSV import transformation system
- Add comprehensive TCG analytics and reporting
- Build bulk inventory management interface  
- Create vendor automation engine
- Add 89% test coverage for all vendor features
- Update architecture documentation
- Mark specification as completed in module-status.json

Closes 04-vendor-management-system specification
Refs #234, #345, #456
```

### Breaking Change Commits
```bash
feat(api): redesign deck validation API

- Change validation endpoint from GET to POST
- Update request/response format for better performance
- Add comprehensive error response structure
- Migrate all client implementations

BREAKING CHANGE: Deck validation API now requires POST with deck data in request body instead of query parameters. Update client code accordingly.

Closes #567
```

### Documentation Updates
```bash
docs(architecture): add pricing intelligence domain model

- Document price prediction entity relationships
- Add market analytics aggregation patterns
- Update integration architecture for ML services
- Create ADR for price data storage decisions

Refs #678
```

## Commit Verification Checklist

Before every commit, verify:

### Technical Verification
- [ ] All tests pass (`npm test`)
- [ ] No lint errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] Test coverage >80% (`npm run test:coverage`)

### Functional Verification  
- [ ] I ran the code and tested the changed functionality
- [ ] I verified the expected behavior works
- [ ] I checked console/logs for errors
- [ ] I tested integration between services (if applicable)

### Documentation Verification (for significant changes)
- [ ] Updated relevant documentation
- [ ] Updated API documentation (if endpoints changed)
- [ ] Updated architecture docs (if design changed)
- [ ] Updated CHANGELOG.md

### Commit Message Verification
- [ ] Uses conventional commit format
- [ ] Has appropriate type and scope
- [ ] Description is clear and specific
- [ ] No AI/automation references
- [ ] No personal pronouns or casual language
- [ ] References relevant issues/PRs

### Repository-Specific Checks

#### MercurJS Backend
- [ ] No forbidden MercurJS patterns
- [ ] Proper service export patterns
- [ ] Correct entity relationships
- [ ] No direct database access outside services

#### Split-Brain Architecture
- [ ] No cross-database queries
- [ ] Proper API boundaries maintained
- [ ] No commerce logic in customer-backend
- [ ] No customer features in backend

## Commit Frequency Guidelines

### When to Commit
- **Feature completion**: When a feature is fully working and tested
- **Bug fixes**: Immediately after fixing and testing
- **Refactoring**: After completing a logical refactoring unit
- **Documentation**: When docs are complete and reviewed
- **Tests**: When test coverage is added/improved

### Commit Size Guidelines
- **Small commits preferred**: Each commit should represent one logical change
- **Maximum changes**: ~300 lines of production code per commit
- **Combine related changes**: Group related files in single commit
- **Separate concerns**: Don't mix features, fixes, and refactoring

## Branch Protection Rules

### Protected Branches
- `main`/`master` - Production ready code
- `develop` - Integration branch for features
- `staging` - Pre-production testing

### Protection Requirements
- All commits must pass CI/CD pipeline
- Require pull request reviews (minimum 1)
- Require status checks to pass
- Require up-to-date branches before merging
- Require signed commits (recommended)

## Automated Commit Verification

### GitHub Actions Integration
```yaml
# .github/workflows/commit-validation.yml
name: Commit Validation
on: [push, pull_request]
jobs:
  validate-commits:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate commit messages
        run: |
          npm install -g @commitlint/cli @commitlint/config-conventional
          commitlint --from=HEAD~1 --to=HEAD --verbose
```

### Commitlint Configuration
```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'scope-enum': [2, 'always', [
      // Backend scopes
      'auth', 'vendor', 'product', 'order', 'payment', 'admin', 'api', 'db',
      // Customer-backend scopes  
      'catalog', 'etl', 'deck', 'community', 'pricing', 'search',
      // Frontend scopes
      'ui', 'pages', 'hooks', 'import', 'analytics', 'inventory',
      // General scopes
      'auth-system', 'commerce-system', 'catalog-system', 'vendor-system', 'deck-system',
      'community-system', 'pricing-system', 'search-system', 'inventory-system', 'payment-system'
    ]],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 72]
  }
};
```

## Emergency Hotfix Procedures

### Critical Bug Fixes
For production issues requiring immediate fixes:

```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-auth-bug

# 2. Make minimal fix
# Edit files...

# 3. Use special commit format
git commit -m "fix(auth): resolve critical JWT validation bypass

- Patch JWT signature verification
- Add input sanitization
- Emergency security fix

CRITICAL: Security vulnerability fix
Refs #EMERGENCY-001"

# 4. Fast-track through testing
npm run test
npm run build

# 5. Deploy immediately
git checkout main
git merge hotfix/critical-auth-bug
git tag v1.2.3-hotfix
```

## Troubleshooting Common Issues

### Commit Message Rejected
```bash
# Problem: Commit message doesn't follow format
# Solution: Amend the commit message
git commit --amend -m "feat(auth): implement JWT refresh rotation"
```

### Pre-commit Hooks Failing
```bash
# Problem: Pre-commit checks fail
# Solution: Fix issues before committing
npm run lint --fix
npm run format
npm test
git add .
git commit
```

### Large Commit Size
```bash
# Problem: Too many changes in one commit
# Solution: Split into multiple commits
git reset --soft HEAD~1
git add src/auth/
git commit -m "feat(auth): implement JWT service"
git add src/vendor/
git commit -m "feat(vendor): add CSV import validation"
```

**Remember: Commit standards ensure code quality, project maintainability, and team collaboration. These standards are mandatory and non-negotiable.**
