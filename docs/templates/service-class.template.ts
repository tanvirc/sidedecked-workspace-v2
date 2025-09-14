/**
 * Service Class Template
 * Usage: Replace {{EntityName}}, {{entityName}}, and implement your business logic
 */

import { Repository } from "typeorm"
import { AppDataSource } from "../config/database"
import { {{EntityName}} } from "../entities/{{EntityName}}"
import { BaseService } from "./BaseService"

// DTOs
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

export interface {{EntityName}}QueryOptions {
  page?: number
  limit?: number
  search?: string
  status?: "active" | "inactive" | "pending"
  sort?: "name" | "created_at" | "updated_at"
  order?: "ASC" | "DESC"
}

export interface {{EntityName}}ListResult {
  data: {{EntityName}}[]
  total: number
  page: number
  limit: number
}

// Main service class
export class {{EntityName}}Service extends BaseService<{{EntityName}}> {
  private {{entityName}}Repository: Repository<{{EntityName}}>

  constructor() {
    super()
    this.{{entityName}}Repository = AppDataSource.getRepository({{EntityName}})
  }

  // CRUD Operations

  /**
   * Create a new {{entityName}}
   */
  async create(data: Create{{EntityName}}DTO): Promise<{{EntityName}}> {
    try {
      // Validation
      await this.validateCreate(data)

      // Business logic
      const {{entityName}} = this.{{entityName}}Repository.create({
        ...data,
        status: data.status || "pending",
      })

      // Save to database
      const saved{{EntityName}} = await this.{{entityName}}Repository.save({{entityName}})

      // Post-creation hooks
      await this.afterCreate(saved{{EntityName}})

      return saved{{EntityName}}
    } catch (error) {
      throw this.handleError(error, "Failed to create {{entityName}}")
    }
  }

  /**
   * Find {{entityName}}s with filtering and pagination
   */
  async findMany(options: {{EntityName}}QueryOptions = {}): Promise<{{EntityName}}ListResult> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        sort = "created_at",
        order = "DESC"
      } = options

      const query = this.{{entityName}}Repository.createQueryBuilder("{{entityName}}")

      // Filtering
      if (search) {
        query.andWhere(
          "({{entityName}}.name ILIKE :search OR {{entityName}}.description ILIKE :search)",
          { search: `%${search}%` }
        )
      }

      if (status) {
        query.andWhere("{{entityName}}.status = :status", { status })
      }

      // Sorting
      query.orderBy(`{{entityName}}.${sort}`, order)

      // Pagination
      const offset = (page - 1) * limit
      query.skip(offset).take(limit)

      // Execute
      const [data, total] = await query.getManyAndCount()

      return {
        data,
        total,
        page,
        limit,
      }
    } catch (error) {
      throw this.handleError(error, "Failed to fetch {{entityName}}s")
    }
  }

  /**
   * Find {{entityName}} by ID
   */
  async findById(id: string): Promise<{{EntityName}} | null> {
    try {
      const {{entityName}} = await this.{{entityName}}Repository.findOne({
        where: { id },
        // relations: ["relatedEntity"], // Add relations as needed
      })

      return {{entityName}}
    } catch (error) {
      throw this.handleError(error, "Failed to fetch {{entityName}}")
    }
  }

  /**
   * Find {{entityName}} by name
   */
  async findByName(name: string): Promise<{{EntityName}} | null> {
    try {
      const {{entityName}} = await this.{{entityName}}Repository.findOne({
        where: { name },
      })

      return {{entityName}}
    } catch (error) {
      throw this.handleError(error, "Failed to fetch {{entityName}} by name")
    }
  }

  /**
   * Update {{entityName}}
   */
  async update(id: string, data: Update{{EntityName}}DTO): Promise<{{EntityName}} | null> {
    try {
      // Find existing
      const existing{{EntityName}} = await this.findById(id)
      if (!existing{{EntityName}}) {
        return null
      }

      // Validation
      await this.validateUpdate(existing{{EntityName}}, data)

      // Apply updates
      Object.assign(existing{{EntityName}}, data)

      // Save
      const updated{{EntityName}} = await this.{{entityName}}Repository.save(existing{{EntityName}})

      // Post-update hooks
      await this.afterUpdate(updated{{EntityName}})

      return updated{{EntityName}}
    } catch (error) {
      throw this.handleError(error, "Failed to update {{entityName}}")
    }
  }

  /**
   * Delete {{entityName}}
   */
  async delete(id: string): Promise<boolean> {
    try {
      // Find existing
      const existing{{EntityName}} = await this.findById(id)
      if (!existing{{EntityName}}) {
        return false
      }

      // Validation
      await this.validateDelete(existing{{EntityName}})

      // Soft delete or hard delete
      const result = await this.{{entityName}}Repository.delete(id)

      // Post-delete hooks
      if (result.affected && result.affected > 0) {
        await this.afterDelete(existing{{EntityName}})
        return true
      }

      return false
    } catch (error) {
      throw this.handleError(error, "Failed to delete {{entityName}}")
    }
  }

  /**
   * Bulk create {{entityName}}s
   */
  async createMany(dataArray: Create{{EntityName}}DTO[]): Promise<{{EntityName}}[]> {
    try {
      // Validate all items
      for (const data of dataArray) {
        await this.validateCreate(data)
      }

      // Create entities
      const {{entityName}}s = dataArray.map(data => 
        this.{{entityName}}Repository.create({
          ...data,
          status: data.status || "pending",
        })
      )

      // Bulk save
      const saved{{EntityName}}s = await this.{{entityName}}Repository.save({{entityName}}s)

      // Post-creation hooks
      for (const {{entityName}} of saved{{EntityName}}s) {
        await this.afterCreate({{entityName}})
      }

      return saved{{EntityName}}s
    } catch (error) {
      throw this.handleError(error, "Failed to bulk create {{entityName}}s")
    }
  }

  // Business Logic Methods

  /**
   * Activate {{entityName}}
   */
  async activate(id: string): Promise<{{EntityName}} | null> {
    return this.update(id, { status: "active" })
  }

  /**
   * Deactivate {{entityName}}
   */
  async deactivate(id: string): Promise<{{EntityName}} | null> {
    return this.update(id, { status: "inactive" })
  }

  /**
   * Get active {{entityName}}s
   */
  async findActive(): Promise<{{EntityName}}[]> {
    const result = await this.findMany({ status: "active" })
    return result.data
  }

  /**
   * Search {{entityName}}s
   */
  async search(query: string): Promise<{{EntityName}}[]> {
    const result = await this.findMany({ search: query })
    return result.data
  }

  // Validation Methods

  private async validateCreate(data: Create{{EntityName}}DTO): Promise<void> {
    // Check for duplicate names
    const existing = await this.findByName(data.name)
    if (existing) {
      throw new Error(`{{EntityName}} with name "${data.name}" already exists`)
    }

    // Additional validation rules
    if (data.name.length < 2) {
      throw new Error("Name must be at least 2 characters long")
    }

    // Custom business rules
    await this.validateBusinessRules(data)
  }

  private async validateUpdate(existing: {{EntityName}}, data: Update{{EntityName}}DTO): Promise<void> {
    // Check for duplicate names (if name is being updated)
    if (data.name && data.name !== existing.name) {
      const duplicate = await this.findByName(data.name)
      if (duplicate) {
        throw new Error(`{{EntityName}} with name "${data.name}" already exists`)
      }
    }

    // State transition validation
    if (data.status && !this.isValidStatusTransition(existing.status, data.status)) {
      throw new Error(`Invalid status transition from ${existing.status} to ${data.status}`)
    }
  }

  private async validateDelete({{entityName}}: {{EntityName}}): Promise<void> {
    // Check if {{entityName}} can be deleted
    if ({{entityName}}.status === "active") {
      throw new Error("Cannot delete active {{entityName}}. Deactivate it first.")
    }

    // Check for dependencies
    // const hasRelatedEntities = await this.hasRelatedEntities({{entityName}}.id)
    // if (hasRelatedEntities) {
    //   throw new Error("Cannot delete {{entityName}} with related entities")
    // }
  }

  private async validateBusinessRules(data: Create{{EntityName}}DTO): Promise<void> {
    // Implement custom business validation rules
    // Example: Check permissions, quotas, etc.
  }

  // Helper Methods

  private isValidStatusTransition(from: string, to: string): boolean {
    const validTransitions: Record<string, string[]> = {
      pending: ["active", "inactive"],
      active: ["inactive"],
      inactive: ["active"],
    }

    return validTransitions[from]?.includes(to) || false
  }

  // Lifecycle Hooks

  private async afterCreate({{entityName}}: {{EntityName}}): Promise<void> {
    // Emit events, send notifications, etc.
    console.log(`{{EntityName}} created: ${{{entityName}}.id}`)
  }

  private async afterUpdate({{entityName}}: {{EntityName}}): Promise<void> {
    // Emit events, send notifications, etc.
    console.log(`{{EntityName}} updated: ${{{entityName}}.id}`)
  }

  private async afterDelete({{entityName}}: {{EntityName}}): Promise<void> {
    // Cleanup, emit events, send notifications, etc.
    console.log(`{{EntityName}} deleted: ${{{entityName}}.id}`)
  }

  // Statistics and Analytics

  async getStatistics(): Promise<{
    total: number
    active: number
    inactive: number
    pending: number
  }> {
    const [total, active, inactive, pending] = await Promise.all([
      this.{{entityName}}Repository.count(),
      this.{{entityName}}Repository.count({ where: { status: "active" } }),
      this.{{entityName}}Repository.count({ where: { status: "inactive" } }),
      this.{{entityName}}Repository.count({ where: { status: "pending" } }),
    ])

    return { total, active, inactive, pending }
  }
}

// Export singleton instance
export const {{entityName}}Service = new {{EntityName}}Service()