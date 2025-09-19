# Contributing to SideDecked

Thank you for your interest in contributing to SideDecked! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Community](#community)

## Code of Conduct

This project follows standard open source contribution guidelines. By participating, you are expected to maintain professional and respectful communication.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Docker (for local database)
- Railway CLI (for deployment)

### Initial Setup

1. **Clone the workspace**:
   ```bash
   git clone https://github.com/your-org/sidedecked-workspace.git
   cd sidedecked-workspace
   ```

2. **Run setup script**:
   ```bash
   ./scripts/setup.sh
   ```

3. **Start development servers**:
   ```bash
   ./scripts/dev-start.sh --parallel
   ```

4. **Verify setup**:
   ```bash
   ./scripts/validate.sh
   ```

### Repository Structure

SideDecked uses a **split-brain architecture** with four separate repositories:

- `backend/` - MercurJS Commerce Backend (port 9001)
- `customer-backend/` - Customer Data & APIs (port 7000)
- `storefront/` - Next.js Frontend (port 3000)
- `vendorpanel/` - React Admin Panel (port 5173)

## Development Workflow

### BMAD Workflow (Mandatory)

1. **Plan**: Review the latest artifacts in `docs/prd.md`, `docs/architecture.md`, and the relevant epic under `docs/epics/`.
2. **Shard**: Use `.bmad-core` agents (via Codex CLI or `npx bmad-method`) to generate story files inside `docs/stories/`.
3. **Execute**: Complete tasks listed in the story document, updating status, dev notes, and test evidence as you work.
4. **QA Gate**: Coordinate with QA agents to populate the corresponding entry under `docs/qa/` before marking "Done".
5. **Archive**: Legacy specs in `docs/specifications/` are read-only and should not be edited.
6. **Validate**: Run `node scripts/validate-bmad.js` to ensure epics, stories, and QA gates stay in sync.

### Branch Strategy

We use **feature branch workflow**:

1. Create feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our [code standards](#code-standards)

3. Write tests for new functionality

4. Run validation before committing:
   ```bash
   ./scripts/validate.sh --fix --coverage
   ```

5. Commit with conventional commit format:
   ```bash
   git commit -m "feat(scope): add new feature"
   ```

6. Push and create pull request

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Scopes:**
- `auth`: Authentication system
- `vendor`: Vendor portal
- `catalog`: TCG catalog
- `deck`: Deck builder
- `community`: Community features
- `pricing`: Pricing intelligence
- `api`: API changes
- `ui`: User interface
- `db`: Database changes

**Examples:**
```bash
feat(auth): implement OAuth2 social login
fix(vendor): resolve CSV import validation error
docs(api): update authentication endpoints
test(deck): add validation tests for deck builder
```

## Code Standards

### General Principles

- **Architecture First**: Read [DATA-ARCHITECTURE.md](docs/architecture/05-data-architecture.md) before making changes
- **Test-Driven Development**: Write tests first, aim for >80% coverage
- **Type Safety**: Use TypeScript strict mode everywhere
- **Documentation**: Document public APIs and complex logic

### TypeScript

- Use strict mode configuration
- Prefer interfaces over types for object shapes
- Use enums for fixed sets of values
- Document complex types with JSDoc

```typescript
/**
 * User profile with extended customer data
 */
interface UserProfile {
  id: string
  customerId: string
  username: string
  avatar?: string
}
```

### React Components

- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility guidelines (WCAG 2.1)
- Use semantic HTML elements

```tsx
interface CardProps {
  title: string
  description?: string
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({ title, description, onClick }) => {
  return (
    <article className="card" onClick={onClick}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </article>
  )
}
```

### Backend Services

- Follow domain-driven design principles
- Implement proper error handling
- Use dependency injection
- Write comprehensive tests

```typescript
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private logger: Logger
  ) {}

  async createUser(data: CreateUserDTO): Promise<User> {
    try {
      // Implementation
    } catch (error) {
      this.logger.error('Failed to create user', error)
      throw new ServiceError('User creation failed')
    }
  }
}
```

### Database

- Use migrations for schema changes
- Follow naming conventions (snake_case)
- Add proper indexes for performance
- Document complex queries

```typescript
// Migration example
export class AddUserProfile implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "user_profiles",
      columns: [
        {
          name: "id",
          type: "uuid",
          isPrimary: true,
          generationStrategy: "uuid",
          default: "gen_random_uuid()"
        },
        // ... other columns
      ],
      indices: [
        new Index("IDX_user_profiles_username", ["username"])
      ]
    }))
  }
}
```

## Testing

### Testing Strategy

- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and service interactions
- **E2E Tests**: Critical user workflows

### Running Tests

```bash
# All tests
./scripts/validate.sh --coverage

# Specific service
./scripts/validate.sh --service backend --coverage

# Watch mode (during development)
cd backend && npm run test:watch
```

### Writing Tests

```typescript
describe('UserService', () => {
  let userService: UserService
  let mockRepository: jest.Mocked<UserRepository>

  beforeEach(() => {
    mockRepository = createMockRepository()
    userService = new UserService(mockRepository, mockLogger)
  })

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = { username: 'testuser', email: 'test@example.com' }
      const expectedUser = { id: '123', ...userData }

      mockRepository.save.mockResolvedValue(expectedUser)

      const result = await userService.createUser(userData)

      expect(result).toEqual(expectedUser)
      expect(mockRepository.save).toHaveBeenCalledWith(userData)
    })

    it('should throw error for invalid data', async () => {
      const invalidData = { username: '', email: 'invalid' }

      await expect(userService.createUser(invalidData))
        .rejects
        .toThrow('Invalid user data')
    })
  })
})
```

## Documentation

### Required Documentation

- **API Changes**: Update OpenAPI specs
- **New Features**: Add to phase documentation
- **Breaking Changes**: Document in CHANGELOG.md
- **Architecture Changes**: Update architecture docs

### Documentation Standards

- Use clear, concise language
- Include code examples
- Update inline comments for complex logic
- Maintain up-to-date README files

## Pull Request Process

### Before Submitting

1. **Validate your changes**:
   ```bash
   ./scripts/validate.sh --fix --coverage
   ```

2. **Update documentation** if needed

3. **Add tests** for new functionality

4. **Check for breaking changes**

### PR Requirements

- **Descriptive title** following commit convention
- **Detailed description** explaining changes
- **Link to related issues**
- **Screenshots** for UI changes
- **Breaking changes** clearly marked

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated checks** must pass
2. **At least one approval** from maintainer
3. **No unresolved conversations**
4. **All tests passing**

## Issue Reporting

### Bug Reports

Use the bug report template and include:

- **Environment** (browser, OS, Node version)
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Error logs** or console output

### Feature Requests

Use the feature request template and include:

- **Use case** and motivation
- **Detailed description**
- **Acceptance criteria**
- **Mockups** or wireframes if applicable

### Security Issues

**Do not** create public issues for security vulnerabilities. Instead:

1. Email security@sidedecked.com
2. Include detailed reproduction steps
3. Wait for confirmation before disclosure

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Slack**: Real-time development chat (invite only)
- **Email**: security@sidedecked.com for security issues

### Recognition

Contributors are recognized in:
- CHANGELOG.md for significant contributions
- GitHub contributors page
- Annual contributor spotlight

### Maintainers

Current maintainers:
- [@maintainer1](https://github.com/maintainer1) - Lead Developer
- [@maintainer2](https://github.com/maintainer2) - Backend Specialist
- [@maintainer3](https://github.com/maintainer3) - Frontend Specialist

## Development Resources

### Useful Links

- [Architecture Documentation](docs/architecture/)
- [API Reference](docs/API-REFERENCE.md)
- [Deployment Guide](docs/DEPLOYMENT-GUIDE.md)
- [Troubleshooting](TROUBLESHOOTING.md)

### Development Tools

- **VS Code**: Recommended editor with workspace settings
- **Docker**: For local database development
- **Railway CLI**: For deployment
- **Bruno/Postman**: For API testing

### Learning Resources

- [MedusaJS Documentation](https://docs.medusajs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

## Getting Help

If you need help:

1. **Check documentation** in `docs/` directory
2. **Search existing issues** on GitHub
3. **Ask in discussions** for general questions
4. **Create an issue** for specific problems

Thank you for contributing to SideDecked!
