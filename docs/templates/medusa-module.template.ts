/**
 * MedusaJS Module Template
 * Usage: Replace {{ModuleName}}, {{moduleName}}, and implement your module logic
 */

import { Module } from "@medusajs/framework/utils"
import { {{ModuleName}}Service } from "./services/{{ModuleName}}Service"

// Module Definition
export const {{ModuleName}}Module = Module("{{moduleName}}", {
  service: {{ModuleName}}Service,
})

export default {{ModuleName}}Module

// Module Configuration
export interface {{ModuleName}}ModuleOptions {
  apiKey?: string
  baseUrl?: string
  timeout?: number
  retryAttempts?: number
  enableLogging?: boolean
}

// Service Registration
export const {{moduleName}}ServiceKey = "{{moduleName}}Service"

// Module exports for use in other modules
export * from "./services/{{ModuleName}}Service"
export * from "./types"

// Module types
export interface {{ModuleName}}ModuleService {
  // Define your service interface here
  create(data: any): Promise<any>
  findById(id: string): Promise<any>
  update(id: string, data: any): Promise<any>
  delete(id: string): Promise<boolean>
}

// Event types
export const {{ModuleName}}Events = {
  CREATED: "{{moduleName}}.created",
  UPDATED: "{{moduleName}}.updated", 
  DELETED: "{{moduleName}}.deleted",
} as const

// Workflow definitions
export const {{ModuleName}}Workflows = {
  CREATE_{{ModuleName.toUpperCase()}}: "create-{{moduleName}}",
  UPDATE_{{ModuleName.toUpperCase()}}: "update-{{moduleName}}",
  DELETE_{{ModuleName.toUpperCase()}}: "delete-{{moduleName}}",
} as const