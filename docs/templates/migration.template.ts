/**
 * Database Migration Template
 * Usage: Replace {{MigrationName}}, {{tableName}}, and implement your migration logic
 * 
 * Migration Naming Convention:
 * - YYYYMMDDHHMMSS-MigrationName.ts
 * - Example: 20240315120000-AddUserTable.ts
 */

import { MigrationInterface, QueryRunner, Table, Index, Column, TableForeignKey } from "typeorm"

export class {{MigrationName}}{{timestamp}} implements MigrationInterface {
    name = '{{MigrationName}}{{timestamp}}'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // CREATE TABLE Example
        await queryRunner.createTable(
            new Table({
                name: "{{tableName}}",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "gen_random_uuid()",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["active", "inactive", "pending"],
                        default: "'pending'",
                    },
                    {
                        name: "metadata",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
                indices: [
                    new Index("IDX_{{tableName}}_name", ["name"]),
                    new Index("IDX_{{tableName}}_status", ["status"]),
                    new Index("IDX_{{tableName}}_created_at", ["created_at"]),
                ],
            }),
            true
        )

        // ADD COLUMN Example
        // await queryRunner.addColumn("{{tableName}}", new Column({
        //     name: "new_column",
        //     type: "varchar",
        //     length: "100",
        //     isNullable: true,
        // }))

        // ADD INDEX Example
        // await queryRunner.createIndex("{{tableName}}", new Index("IDX_{{tableName}}_new_column", ["new_column"]))

        // ADD FOREIGN KEY Example
        // await queryRunner.createForeignKey("{{tableName}}", new TableForeignKey({
        //     columnNames: ["parent_id"],
        //     referencedColumnNames: ["id"],
        //     referencedTableName: "parent_table",
        //     onDelete: "CASCADE",
        //     onUpdate: "CASCADE",
        // }))

        // INSERT DATA Example
        // await queryRunner.query(`
        //     INSERT INTO {{tableName}} (name, description, status) VALUES
        //     ('Default Item 1', 'Default description', 'active'),
        //     ('Default Item 2', 'Another description', 'active')
        // `)

        // UPDATE DATA Example
        // await queryRunner.query(`
        //     UPDATE {{tableName}} 
        //     SET status = 'active' 
        //     WHERE status = 'pending'
        // `)

        // ALTER COLUMN Example
        // await queryRunner.query(`
        //     ALTER TABLE {{tableName}} 
        //     ALTER COLUMN name SET NOT NULL
        // `)

        // CREATE TRIGGER Example (PostgreSQL)
        // await queryRunner.query(`
        //     CREATE OR REPLACE FUNCTION update_updated_at_column()
        //     RETURNS TRIGGER AS $$
        //     BEGIN
        //         NEW.updated_at = CURRENT_TIMESTAMP;
        //         RETURN NEW;
        //     END;
        //     $$ language 'plpgsql';
        // `)

        // await queryRunner.query(`
        //     CREATE TRIGGER update_{{tableName}}_updated_at 
        //     BEFORE UPDATE ON {{tableName}} 
        //     FOR EACH ROW 
        //     EXECUTE FUNCTION update_updated_at_column();
        // `)

        console.log(`Migration ${this.name} executed successfully (UP)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // DROP TRIGGER Example
        // await queryRunner.query(`DROP TRIGGER IF EXISTS update_{{tableName}}_updated_at ON {{tableName}}`)
        // await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`)

        // DROP FOREIGN KEY Example
        // const table = await queryRunner.getTable("{{tableName}}")
        // const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf("parent_id") !== -1)
        // if (foreignKey) {
        //     await queryRunner.dropForeignKey("{{tableName}}", foreignKey)
        // }

        // DROP INDEX Example
        // await queryRunner.dropIndex("{{tableName}}", "IDX_{{tableName}}_new_column")

        // DROP COLUMN Example
        // await queryRunner.dropColumn("{{tableName}}", "new_column")

        // DROP TABLE Example
        await queryRunner.dropTable("{{tableName}}")

        console.log(`Migration ${this.name} reverted successfully (DOWN)`)
    }
}

/*
Migration Best Practices:

1. Always test migrations in development first
2. Make migrations reversible (implement both up and down)
3. Avoid data loss operations in production
4. Use transactions for complex operations
5. Add appropriate indexes for performance
6. Include proper foreign key constraints
7. Use meaningful names for indexes and constraints
8. Test the rollback (down) migration
9. Consider migration order and dependencies
10. Document complex migrations

Example Commands:
```bash
# Generate migration
npm run migration:create src/migrations/{{MigrationName}}

# Run migration
npm run migration:run

# Revert migration
npm run migration:revert

# Show migration status
npm run migration:show
```

Data Types Reference:
- varchar(length)    - Variable character string
- text               - Long text
- integer            - Integer number
- decimal(p,s)       - Decimal number with precision and scale
- boolean            - True/false
- timestamp          - Date and time
- date               - Date only
- time               - Time only
- uuid               - UUID type
- jsonb              - JSON binary (PostgreSQL)
- enum               - Enumeration

Index Types:
- BTREE (default)    - General purpose
- HASH               - Equality comparisons
- GIN                - Full text search, arrays
- GIST               - Geometric data
- PARTIAL            - Conditional index

Foreign Key Actions:
- CASCADE            - Delete/update related records
- SET NULL           - Set foreign key to null
- SET DEFAULT        - Set foreign key to default value
- RESTRICT           - Prevent delete/update
- NO ACTION          - Same as RESTRICT but deferred
*/