/**
 * Express.js API Route Template (Customer Backend)
 * Usage: Replace {{EntityName}}, {{entityName}}, and implement your business logic
 */

import { Router, Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { {{EntityName}} } from "../entities/{{EntityName}}"
import { {{EntityName}}Service } from "../services/{{EntityName}}Service"
import { validateRequest } from "../middleware/validation"
import { authenticateUser } from "../middleware/auth"
import { z } from "zod"

const router = Router()
const {{entityName}}Service = new {{EntityName}}Service()

// Validation schemas
const create{{EntityName}}Schema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  metadata: z.record(z.any()).optional(),
})

const update{{EntityName}}Schema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  metadata: z.record(z.any()).optional(),
})

const query{{EntityName}}Schema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  sort: z.enum(["name", "created_at", "updated_at"]).optional(),
  order: z.enum(["ASC", "DESC"]).optional(),
})

// GET /api/{{entityName}}s - List {{entityName}}s with filtering and pagination
router.get("/", validateRequest(query{{EntityName}}Schema, "query"), async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sort = "created_at",
      order = "DESC"
    } = req.query as any

    const {{entityName}}s = await {{entityName}}Service.findMany({
      page,
      limit,
      search,
      status,
      sort,
      order,
    })

    res.json({
      success: true,
      data: {{entityName}}s.data,
      pagination: {
        page,
        limit,
        total: {{entityName}}s.total,
        totalPages: Math.ceil({{entityName}}s.total / limit),
      }
    })
  } catch (error) {
    console.error("Error fetching {{entityName}}s:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    })
  }
})

// GET /api/{{entityName}}s/:id - Get specific {{entityName}}
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const {{entityName}} = await {{entityName}}Service.findById(id)

    if (!{{entityName}}) {
      return res.status(404).json({
        success: false,
        error: "Not found",
        message: "{{EntityName}} not found"
      })
    }

    res.json({
      success: true,
      data: {{entityName}}
    })
  } catch (error) {
    console.error("Error fetching {{entityName}}:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    })
  }
})

// POST /api/{{entityName}}s - Create new {{entityName}}
router.post("/", 
  authenticateUser, 
  validateRequest(create{{EntityName}}Schema), 
  async (req: Request, res: Response) => {
    try {
      const validatedData = req.body

      const {{entityName}} = await {{entityName}}Service.create(validatedData)

      res.status(201).json({
        success: true,
        data: {{entityName}},
        message: "{{EntityName}} created successfully"
      })
    } catch (error) {
      console.error("Error creating {{entityName}}:", error)
      
      if (error instanceof Error && error.message.includes("duplicate")) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "{{EntityName}} with this name already exists"
        })
      }

      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }
)

// PATCH /api/{{entityName}}s/:id - Update {{entityName}}
router.patch("/:id", 
  authenticateUser, 
  validateRequest(update{{EntityName}}Schema), 
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const validatedData = req.body

      const {{entityName}} = await {{entityName}}Service.update(id, validatedData)

      if (!{{entityName}}) {
        return res.status(404).json({
          success: false,
          error: "Not found",
          message: "{{EntityName}} not found"
        })
      }

      res.json({
        success: true,
        data: {{entityName}},
        message: "{{EntityName}} updated successfully"
      })
    } catch (error) {
      console.error("Error updating {{entityName}}:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }
)

// DELETE /api/{{entityName}}s/:id - Delete {{entityName}}
router.delete("/:id", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const deleted = await {{entityName}}Service.delete(id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Not found",
        message: "{{EntityName}} not found"
      })
    }

    res.json({
      success: true,
      message: "{{EntityName}} deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting {{entityName}}:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    })
  }
})

// Bulk operations
// POST /api/{{entityName}}s/bulk - Bulk create {{entityName}}s
router.post("/bulk", 
  authenticateUser, 
  validateRequest(z.array(create{{EntityName}}Schema)), 
  async (req: Request, res: Response) => {
    try {
      const validatedData = req.body

      const {{entityName}}s = await {{entityName}}Service.createMany(validatedData)

      res.status(201).json({
        success: true,
        data: {{entityName}}s,
        message: `${{{entityName}}s.length} {{entityName}}s created successfully`
      })
    } catch (error) {
      console.error("Error bulk creating {{entityName}}s:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }
)

export default router

// TypeScript interfaces for reference
export interface {{EntityName}}Query {
  page?: number
  limit?: number
  search?: string
  status?: "active" | "inactive" | "pending"
  sort?: "name" | "created_at" | "updated_at"
  order?: "ASC" | "DESC"
}

export interface {{EntityName}}ListResponse {
  success: true
  data: {{EntityName}}[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface {{EntityName}}Response {
  success: true
  data: {{EntityName}}
}

export interface ErrorResponse {
  success: false
  error: string
  message: string
}