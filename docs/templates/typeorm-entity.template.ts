/**
 * TypeORM Entity Template (Customer Backend)
 * Usage: Replace {{EntityName}}, {{tableName}}, and add your specific fields
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn
} from "typeorm"

@Entity("{{tableName}}")
export class {{EntityName}} {
  @PrimaryGeneratedColumn("uuid")
  id: string

  // Required: Primary business identifier
  @Column({ type: "varchar", length: 255 })
  @Index()
  name: string

  // Optional: Description field
  @Column({ type: "text", nullable: true })
  description?: string

  // Status fields with enum
  @Column({ 
    type: "enum", 
    enum: ["active", "inactive", "pending"],
    default: "pending"
  })
  @Index()
  status: "active" | "inactive" | "pending"

  // JSON fields for flexible data
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>

  // Foreign key references (replace with actual entity references)
  @Column({ type: "uuid", nullable: true })
  @Index()
  user_id?: string

  // Timestamps
  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  // Relationships - Replace with actual entities
  // @OneToMany(() => RelatedEntity, (entity) => entity.{{entityName}})
  // relatedEntities: RelatedEntity[]

  // @ManyToOne(() => ParentEntity, (parent) => parent.{{entityName}}s)
  // @JoinColumn({ name: "parent_id" })
  // parent: ParentEntity

  // Computed properties
  get displayName(): string {
    return this.name || `{{EntityName}} ${this.id}`
  }

  // Business logic methods
  isActive(): boolean {
    return this.status === "active"
  }

  canBeModified(): boolean {
    return this.status !== "inactive"
  }

  // JSON serialization
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

// Export DTOs
export interface Create{{EntityName}}DTO {
  name: string
  description?: string
  status?: "active" | "inactive" | "pending"
  metadata?: Record<string, any>
}

export interface Update{{EntityName}}DTO {
  name?: string
  description?: string
  status?: "active" | "inactive" | "pending"
  metadata?: Record<string, any>
}

export interface {{EntityName}}Response {
  id: string
  name: string
  description?: string
  status: "active" | "inactive" | "pending"
  metadata?: Record<string, any>
  created_at: Date
  updated_at: Date
}