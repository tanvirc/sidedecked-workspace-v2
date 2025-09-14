# Code Templates

This directory contains standardized code templates for the SideDecked project. These templates help ensure consistency across the codebase and accelerate development.

## Available Templates

### Backend Templates

#### 1. **medusa-entity.template.ts**
Template for creating MedusaJS entities (commerce backend).
- Extends BaseEntity
- Includes common fields and patterns
- Business logic methods
- TypeORM decorators

**Usage:**
```bash
cp docs/templates/medusa-entity.template.ts backend/src/modules/my-module/entities/MyEntity.ts
# Replace {{EntityName}}, {{tableName}} placeholders
```

#### 2. **typeorm-entity.template.ts**
Template for creating TypeORM entities (customer backend).
- Full entity definition with timestamps
- Relationships and indexes
- DTOs and response types
- JSON serialization

**Usage:**
```bash
cp docs/templates/typeorm-entity.template.ts customer-backend/src/entities/MyEntity.ts
# Replace {{EntityName}}, {{tableName}} placeholders
```

#### 3. **medusa-api-route.template.ts**
Template for MedusaJS API routes with full CRUD operations.
- GET, POST, DELETE endpoints
- Validation and error handling
- MedusaRequest/MedusaResponse types
- Query parameter handling

**Usage:**
```bash
cp docs/templates/medusa-api-route.template.ts backend/src/api/admin/my-entities/route.ts
# Replace {{EntityName}}, {{entityName}} placeholders
```

#### 4. **express-api-route.template.ts**
Template for Express.js API routes (customer backend).
- Full REST API with validation
- Zod schema validation
- Pagination and filtering
- Error handling middleware

**Usage:**
```bash
cp docs/templates/express-api-route.template.ts customer-backend/src/routes/myEntities.ts
# Replace {{EntityName}}, {{entityName}} placeholders
```

#### 5. **service-class.template.ts**
Template for service classes with business logic.
- CRUD operations
- Validation methods
- Bulk operations
- Statistics and analytics
- Error handling

**Usage:**
```bash
cp docs/templates/service-class.template.ts customer-backend/src/services/MyEntityService.ts
# Replace {{EntityName}}, {{entityName}} placeholders
```

#### 6. **medusa-module.template.ts**
Template for creating MedusaJS modules.
- Module definition and configuration
- Service registration
- Event types
- Workflow definitions

**Usage:**
```bash
cp docs/templates/medusa-module.template.ts backend/src/modules/my-module/index.ts
# Replace {{ModuleName}}, {{moduleName}} placeholders
```

#### 7. **migration.template.ts**
Template for database migrations.
- Table creation/modification
- Index management
- Foreign key constraints
- Data manipulation
- Rollback support

**Usage:**
```bash
cp docs/templates/migration.template.ts backend/src/migrations/$(date +%Y%m%d%H%M%S)-MyMigration.ts
# Replace {{MigrationName}}, {{tableName}} placeholders
```

### Frontend Templates

#### 8. **react-component.template.tsx**
Template for React components (storefront).
- TypeScript interfaces
- State management with hooks
- Event handlers
- CSS classes with variants
- Loading and error states
- Accessibility considerations

**Usage:**
```bash
cp docs/templates/react-component.template.tsx storefront/src/components/MyComponent.tsx
# Replace {{ComponentName}}, {{componentName}} placeholders
```

### Testing Templates

#### 9. **test.template.ts**
Comprehensive testing template for services and APIs.
- Unit tests for all CRUD operations
- Integration tests
- Error handling tests
- Performance tests
- Test data setup/teardown

**Usage:**
```bash
cp docs/templates/test.template.ts customer-backend/src/tests/services/MyEntityService.test.ts
# Replace {{EntityName}}, {{entityName}}, {{testType}} placeholders
```

### Documentation Templates

#### 10. **README.template.md**
Template for project/module documentation.
- Overview and features
- Installation and setup
- API reference
- Architecture diagrams
- Development guidelines
- Troubleshooting

**Usage:**
```bash
cp docs/templates/README.template.md my-project/README.md
# Replace {{ProjectName}} and other placeholders
```

## Template Usage Guidelines

### 1. Placeholder Replacement

All templates use double curly braces for placeholders:
- `{{EntityName}}` - PascalCase entity name (e.g., "UserProfile")
- `{{entityName}}` - camelCase entity name (e.g., "userProfile")
- `{{tableName}}` - snake_case table name (e.g., "user_profiles")
- `{{ComponentName}}` - PascalCase component name
- `{{componentName}}` - kebab-case component name (e.g., "user-profile")

### 2. Find and Replace

Use your editor's find-and-replace functionality:
```bash
# Example for UserProfile entity
{{EntityName}} → UserProfile
{{entityName}} → userProfile  
{{tableName}} → user_profiles
```

### 3. Customization

After copying and replacing placeholders:
1. Remove unused code sections
2. Add specific business logic
3. Adjust imports based on your module structure
4. Update types and interfaces as needed
5. Add specific validations and error handling

### 4. Code Standards

All templates follow the project's coding standards:
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- JSDoc comments for public APIs
- Comprehensive error handling
- Input validation

## Template Development

### Adding New Templates

1. Create the template file with `.template.ts/tsx/md` extension
2. Use consistent placeholder naming
3. Include comprehensive examples
4. Add JSDoc comments explaining usage
5. Follow project coding standards
6. Update this README with the new template

### Template Structure

Each template should include:
- File header with usage instructions
- Import statements
- Type definitions
- Main implementation
- Helper functions/utilities
- Error handling
- Examples in comments

### Best Practices

- Keep templates generic but functional
- Include common patterns and edge cases
- Add validation and error handling
- Use meaningful placeholder names
- Provide clear usage instructions
- Include examples and comments

## Integration with Development Workflow

### IDE Snippets

Consider creating IDE snippets for faster template usage:

**VS Code snippets.json:**
```json
{
  "Create Entity": {
    "prefix": "sidedecked-entity",
    "body": [
      "// Copy from docs/templates/typeorm-entity.template.ts",
      "// Replace {{EntityName}} with $1",
      "$0"
    ]
  }
}
```

### Automation Scripts

Future automation scripts (planned) will:
- Auto-generate code from templates
- Replace placeholders interactively
- Set up complete module structures
- Run initial tests and validation

## Related Documentation

- [Code Standards](../standards/code-standards.md)
- [Testing Standards](../standards/testing-standards.md)
- [Architecture Patterns](../architecture/04-architectural-patterns.md)
- [Domain Models](../architecture/03-domain-models.md)