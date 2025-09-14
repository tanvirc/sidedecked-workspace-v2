/**
 * MedusaJS Entity Template
 * Usage: Replace {{EntityName}}, {{tableName}}, and add your specific fields
 */

import { BaseEntity } from "@medusajs/framework/types"
import { Entity, Column, Index, OneToMany, ManyToOne } from "typeorm"

@Entity("{{tableName}}")
export class {{EntityName}} extends BaseEntity {
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

  // Relationships - Replace with actual entities
  // @OneToMany(() => RelatedEntity, (entity) => entity.{{entityName}})
  // relatedEntities: RelatedEntity[]

  // @ManyToOne(() => ParentEntity, (parent) => parent.{{entityName}}s)
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
}

// Export type for use in services
export type {{EntityName}}Data = Omit<{{EntityName}}, keyof BaseEntity>