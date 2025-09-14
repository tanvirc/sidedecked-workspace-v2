/**
 * MedusaJS API Route Template
 * Usage: Replace {{EntityName}}, {{entityName}}, and implement your business logic
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// GET /admin/{{entityName}}s
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const query = req.scope.resolve("query")
    
    const { data: {{entityName}}s, metadata } = await query.graph({
      entity: "{{entityName}}",
      fields: req.remoteQueryConfig.fields,
      filters: req.filterableFields,
      pagination: req.remoteQueryConfig.pagination,
    })

    res.json({
      {{entityName}}s,
      count: metadata.count,
      offset: metadata.skip,
      limit: metadata.take,
    })
  } catch (error) {
    res.status(500).json({
      type: "server_error",
      message: error.message,
    })
  }
}

// GET /admin/{{entityName}}s/:id
export const GET_ID = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params
    const query = req.scope.resolve("query")

    const [{{entityName}}] = await query.graph({
      entity: "{{entityName}}",
      fields: req.remoteQueryConfig.fields,
      filters: { id },
    })

    if (!{{entityName}}) {
      return res.status(404).json({
        type: "not_found",
        message: "{{EntityName}} not found",
      })
    }

    res.json({ {{entityName}} })
  } catch (error) {
    res.status(500).json({
      type: "server_error",
      message: error.message,
    })
  }
}

// POST /admin/{{entityName}}s
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const {{entityName}}Service = req.scope.resolve("{{entityName}}Service")
    
    // Validate request body
    const { name, description, status, metadata } = req.body
    
    if (!name) {
      return res.status(400).json({
        type: "invalid_data",
        message: "Name is required",
      })
    }

    const {{entityName}} = await {{entityName}}Service.create({
      name,
      description,
      status,
      metadata,
    })

    res.status(201).json({ {{entityName}} })
  } catch (error) {
    res.status(500).json({
      type: "server_error",
      message: error.message,
    })
  }
}

// POST /admin/{{entityName}}s/:id
export const POST_ID = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params
    const {{entityName}}Service = req.scope.resolve("{{entityName}}Service")
    
    // Validate update data
    const { name, description, status, metadata } = req.body

    const {{entityName}} = await {{entityName}}Service.update(id, {
      name,
      description,
      status,
      metadata,
    })

    res.json({ {{entityName}} })
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        type: "not_found",
        message: "{{EntityName}} not found",
      })
    }
    
    res.status(500).json({
      type: "server_error",
      message: error.message,
    })
  }
}

// DELETE /admin/{{entityName}}s/:id
export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params
    const {{entityName}}Service = req.scope.resolve("{{entityName}}Service")
    
    await {{entityName}}Service.delete(id)

    res.json({
      id,
      object: "{{entityName}}",
      deleted: true,
    })
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        type: "not_found",
        message: "{{EntityName}} not found",
      })
    }
    
    res.status(500).json({
      type: "server_error",
      message: error.message,
    })
  }
}

// Request/Response types
export interface Create{{EntityName}}Request {
  name: string
  description?: string
  status?: "active" | "inactive" | "pending"
  metadata?: Record<string, any>
}

export interface Update{{EntityName}}Request {
  name?: string
  description?: string
  status?: "active" | "inactive" | "pending"
  metadata?: Record<string, any>
}

export interface {{EntityName}}Response {
  {{entityName}}: {
    id: string
    name: string
    description?: string
    status: "active" | "inactive" | "pending"
    metadata?: Record<string, any>
    created_at: Date
    updated_at: Date
  }
}

export interface {{EntityName}}ListResponse {
  {{entityName}}s: {{EntityName}}Response["{{entityName}}"][]
  count: number
  offset: number
  limit: number
}