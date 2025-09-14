/**
 * Test Template
 * Usage: Replace {{EntityName}}, {{entityName}}, {{testType}}, and implement your test cases
 * 
 * Test Types:
 * - unit: Unit tests for individual functions/methods
 * - integration: Integration tests for API endpoints
 * - e2e: End-to-end tests for user workflows
 */

import { describe, beforeEach, afterEach, beforeAll, afterAll, it, expect, jest } from '@jest/globals'
import { AppDataSource } from '../../config/database'
import { {{EntityName}} } from '../../entities/{{EntityName}}'
import { {{EntityName}}Service } from '../../services/{{EntityName}}Service'

describe('{{EntityName}} {{testType}} Tests', () => {
  let {{entityName}}Service: {{EntityName}}Service
  let testRepository: any

  // Test data
  const mockCreate{{EntityName}}Data = {
    name: 'Test {{EntityName}}',
    description: 'Test description',
    status: 'pending' as const,
    metadata: { test: true },
  }

  const mockUpdate{{EntityName}}Data = {
    name: 'Updated {{EntityName}}',
    description: 'Updated description',
    status: 'active' as const,
  }

  // Setup and teardown
  beforeAll(async () => {
    // Initialize test database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }
    
    // Setup test data
    testRepository = AppDataSource.getRepository({{EntityName}})
  })

  afterAll(async () => {
    // Clean up database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  })

  beforeEach(async () => {
    // Initialize service
    {{entityName}}Service = new {{EntityName}}Service()
    
    // Clean test data
    await testRepository.delete({})
    
    // Reset mocks
    jest.clearAllMocks()
  })

  afterEach(async () => {
    // Clean up after each test
    await testRepository.delete({})
  })

  // Helper functions
  const create{{EntityName}} = async (data = mockCreate{{EntityName}}Data) => {
    return await {{entityName}}Service.create(data)
  }

  const createMultiple{{EntityName}}s = async (count: number) => {
    const {{entityName}}s = []
    for (let i = 0; i < count; i++) {
      const {{entityName}} = await create{{EntityName}}({
        ...mockCreate{{EntityName}}Data,
        name: `Test {{EntityName}} ${i + 1}`,
      })
      {{entityName}}s.push({{entityName}})
    }
    return {{entityName}}s
  }

  // CREATE Tests
  describe('create', () => {
    it('should create a {{entityName}} with valid data', async () => {
      const {{entityName}} = await {{entityName}}Service.create(mockCreate{{EntityName}}Data)

      expect({{entityName}}).toBeDefined()
      expect({{entityName}}.id).toBeDefined()
      expect({{entityName}}.name).toBe(mockCreate{{EntityName}}Data.name)
      expect({{entityName}}.description).toBe(mockCreate{{EntityName}}Data.description)
      expect({{entityName}}.status).toBe(mockCreate{{EntityName}}Data.status)
      expect({{entityName}}.created_at).toBeDefined()
      expect({{entityName}}.updated_at).toBeDefined()
    })

    it('should set default status to pending when not provided', async () => {
      const data = { ...mockCreate{{EntityName}}Data }
      delete data.status

      const {{entityName}} = await {{entityName}}Service.create(data)

      expect({{entityName}}.status).toBe('pending')
    })

    it('should throw error for duplicate name', async () => {
      await create{{EntityName}}()

      await expect({{entityName}}Service.create(mockCreate{{EntityName}}Data))
        .rejects
        .toThrow('{{EntityName}} with name "Test {{EntityName}}" already exists')
    })

    it('should throw error for invalid name', async () => {
      const invalidData = { ...mockCreate{{EntityName}}Data, name: 'A' }

      await expect({{entityName}}Service.create(invalidData))
        .rejects
        .toThrow('Name must be at least 2 characters long')
    })

    it('should handle metadata correctly', async () => {
      const dataWithMetadata = {
        ...mockCreate{{EntityName}}Data,
        metadata: { custom: 'value', number: 42 },
      }

      const {{entityName}} = await {{entityName}}Service.create(dataWithMetadata)

      expect({{entityName}}.metadata).toEqual(dataWithMetadata.metadata)
    })
  })

  // READ Tests
  describe('findById', () => {
    it('should find {{entityName}} by id', async () => {
      const created{{EntityName}} = await create{{EntityName}}()

      const found{{EntityName}} = await {{entityName}}Service.findById(created{{EntityName}}.id)

      expect(found{{EntityName}}).toBeDefined()
      expect(found{{EntityName}}!.id).toBe(created{{EntityName}}.id)
      expect(found{{EntityName}}!.name).toBe(created{{EntityName}}.name)
    })

    it('should return null for non-existent id', async () => {
      const found{{EntityName}} = await {{entityName}}Service.findById('non-existent-id')

      expect(found{{EntityName}}).toBeNull()
    })
  })

  describe('findMany', () => {
    beforeEach(async () => {
      await createMultiple{{EntityName}}s(5)
    })

    it('should return paginated results', async () => {
      const result = await {{entityName}}Service.findMany({ page: 1, limit: 3 })

      expect(result.data).toHaveLength(3)
      expect(result.total).toBe(5)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(3)
    })

    it('should filter by status', async () => {
      // Create some active {{entityName}}s
      await {{entityName}}Service.create({ ...mockCreate{{EntityName}}Data, name: 'Active 1', status: 'active' })
      await {{entityName}}Service.create({ ...mockCreate{{EntityName}}Data, name: 'Active 2', status: 'active' })

      const result = await {{entityName}}Service.findMany({ status: 'active' })

      expect(result.data).toHaveLength(2)
      expect(result.data.every(item => item.status === 'active')).toBe(true)
    })

    it('should search by name and description', async () => {
      await {{entityName}}Service.create({ ...mockCreate{{EntityName}}Data, name: 'Searchable Name' })
      await {{entityName}}Service.create({ ...mockCreate{{EntityName}}Data, name: 'Another Name', description: 'Contains searchable word' })

      const result = await {{entityName}}Service.findMany({ search: 'searchable' })

      expect(result.data).toHaveLength(2)
    })

    it('should sort results correctly', async () => {
      const result = await {{entityName}}Service.findMany({ sort: 'name', order: 'ASC' })

      const names = result.data.map(item => item.name)
      const sortedNames = [...names].sort()
      expect(names).toEqual(sortedNames)
    })
  })

  // UPDATE Tests
  describe('update', () => {
    let created{{EntityName}}: {{EntityName}}

    beforeEach(async () => {
      created{{EntityName}} = await create{{EntityName}}()
    })

    it('should update {{entityName}} with valid data', async () => {
      const updated{{EntityName}} = await {{entityName}}Service.update(
        created{{EntityName}}.id,
        mockUpdate{{EntityName}}Data
      )

      expect(updated{{EntityName}}).toBeDefined()
      expect(updated{{EntityName}}!.name).toBe(mockUpdate{{EntityName}}Data.name)
      expect(updated{{EntityName}}!.description).toBe(mockUpdate{{EntityName}}Data.description)
      expect(updated{{EntityName}}!.status).toBe(mockUpdate{{EntityName}}Data.status)
      expect(updated{{EntityName}}!.updated_at.getTime()).toBeGreaterThan(
        created{{EntityName}}.updated_at.getTime()
      )
    })

    it('should return null for non-existent id', async () => {
      const result = await {{entityName}}Service.update('non-existent-id', mockUpdate{{EntityName}}Data)

      expect(result).toBeNull()
    })

    it('should throw error for duplicate name', async () => {
      const another{{EntityName}} = await {{entityName}}Service.create({
        ...mockCreate{{EntityName}}Data,
        name: 'Another {{EntityName}}',
      })

      await expect({{entityName}}Service.update(created{{EntityName}}.id, { name: 'Another {{EntityName}}' }))
        .rejects
        .toThrow('{{EntityName}} with name "Another {{EntityName}}" already exists')
    })

    it('should validate status transitions', async () => {
      // Set to inactive first
      await {{entityName}}Service.update(created{{EntityName}}.id, { status: 'inactive' })

      // Try invalid transition (there might be business rules preventing certain transitions)
      // Adjust this test based on your actual business rules
      await expect({{entityName}}Service.update(created{{EntityName}}.id, { status: 'pending' }))
        .rejects
        .toThrow(/Invalid status transition/)
    })
  })

  // DELETE Tests
  describe('delete', () => {
    let created{{EntityName}}: {{EntityName}}

    beforeEach(async () => {
      created{{EntityName}} = await create{{EntityName}}()
    })

    it('should delete {{entityName}}', async () => {
      const result = await {{entityName}}Service.delete(created{{EntityName}}.id)

      expect(result).toBe(true)

      const found{{EntityName}} = await {{entityName}}Service.findById(created{{EntityName}}.id)
      expect(found{{EntityName}}).toBeNull()
    })

    it('should return false for non-existent id', async () => {
      const result = await {{entityName}}Service.delete('non-existent-id')

      expect(result).toBe(false)
    })

    it('should prevent deletion of active {{entityName}}', async () => {
      await {{entityName}}Service.update(created{{EntityName}}.id, { status: 'active' })

      await expect({{entityName}}Service.delete(created{{EntityName}}.id))
        .rejects
        .toThrow('Cannot delete active {{entityName}}. Deactivate it first.')
    })
  })

  // BULK Operations Tests
  describe('createMany', () => {
    it('should create multiple {{entityName}}s', async () => {
      const dataArray = [
        { ...mockCreate{{EntityName}}Data, name: 'Bulk 1' },
        { ...mockCreate{{EntityName}}Data, name: 'Bulk 2' },
        { ...mockCreate{{EntityName}}Data, name: 'Bulk 3' },
      ]

      const {{entityName}}s = await {{entityName}}Service.createMany(dataArray)

      expect({{entityName}}s).toHaveLength(3)
      expect({{entityName}}s[0].name).toBe('Bulk 1')
      expect({{entityName}}s[1].name).toBe('Bulk 2')
      expect({{entityName}}s[2].name).toBe('Bulk 3')
    })

    it('should rollback on validation error', async () => {
      const dataArray = [
        { ...mockCreate{{EntityName}}Data, name: 'Valid 1' },
        { ...mockCreate{{EntityName}}Data, name: 'A' }, // Invalid name
        { ...mockCreate{{EntityName}}Data, name: 'Valid 2' },
      ]

      await expect({{entityName}}Service.createMany(dataArray))
        .rejects
        .toThrow('Name must be at least 2 characters long')

      const result = await {{entityName}}Service.findMany()
      expect(result.data).toHaveLength(0) // No {{entityName}}s should be created
    })
  })

  // Business Logic Tests
  describe('activate/deactivate', () => {
    let created{{EntityName}}: {{EntityName}}

    beforeEach(async () => {
      created{{EntityName}} = await create{{EntityName}}()
    })

    it('should activate {{entityName}}', async () => {
      const activated{{EntityName}} = await {{entityName}}Service.activate(created{{EntityName}}.id)

      expect(activated{{EntityName}}!.status).toBe('active')
    })

    it('should deactivate {{entityName}}', async () => {
      const deactivated{{EntityName}} = await {{entityName}}Service.deactivate(created{{EntityName}}.id)

      expect(deactivated{{EntityName}}!.status).toBe('inactive')
    })
  })

  describe('findActive', () => {
    it('should return only active {{entityName}}s', async () => {
      await {{entityName}}Service.create({ ...mockCreate{{EntityName}}Data, name: 'Active 1', status: 'active' })
      await {{entityName}}Service.create({ ...mockCreate{{EntityName}}Data, name: 'Inactive 1', status: 'inactive' })
      await {{entityName}}Service.create({ ...mockCreate{{EntityName}}Data, name: 'Pending 1', status: 'pending' })

      const active{{EntityName}}s = await {{entityName}}Service.findActive()

      expect(active{{EntityName}}s).toHaveLength(1)
      expect(active{{EntityName}}s[0].status).toBe('active')
    })
  })

  // Statistics Tests
  describe('getStatistics', () => {
    beforeEach(async () => {
      await {{entityName}}Service.create({ ...mockCreate{{EntityName}}Data, name: 'Active 1', status: 'active' })
      await {{entityName}}Service.create({ ...mockCreate{{EntityName}}Data, name: 'Active 2', status: 'active' })
      await {{entityName}}Service.create({ ...mockCreate{{EntityName}}Data, name: 'Inactive 1', status: 'inactive' })
      await {{entityName}}Service.create({ ...mockCreate{{EntityName}}Data, name: 'Pending 1', status: 'pending' })
    })

    it('should return correct statistics', async () => {
      const stats = await {{entityName}}Service.getStatistics()

      expect(stats.total).toBe(4)
      expect(stats.active).toBe(2)
      expect(stats.inactive).toBe(1)
      expect(stats.pending).toBe(1)
    })
  })

  // Error Handling Tests
  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      // Mock database error
      jest.spyOn(testRepository, 'save').mockRejectedValueOnce(new Error('Database connection lost'))

      await expect({{entityName}}Service.create(mockCreate{{EntityName}}Data))
        .rejects
        .toThrow('Failed to create {{entityName}}')
    })

    it('should handle concurrent updates', async () => {
      const created{{EntityName}} = await create{{EntityName}}()

      // Simulate concurrent updates
      const update1 = {{entityName}}Service.update(created{{EntityName}}.id, { name: 'Update 1' })
      const update2 = {{entityName}}Service.update(created{{EntityName}}.id, { name: 'Update 2' })

      // Both should complete successfully (last one wins)
      await Promise.all([update1, update2])

      const final{{EntityName}} = await {{entityName}}Service.findById(created{{EntityName}}.id)
      expect(['Update 1', 'Update 2']).toContain(final{{EntityName}}!.name)
    })
  })

  // Performance Tests
  describe('performance', () => {
    it('should handle large datasets efficiently', async () => {
      const startTime = Date.now()
      
      // Create 1000 {{entityName}}s
      const dataArray = Array.from({ length: 1000 }, (_, i) => ({
        ...mockCreate{{EntityName}}Data,
        name: `Performance Test ${i + 1}`,
      }))

      await {{entityName}}Service.createMany(dataArray)
      
      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000) // 5 seconds

      const result = await {{entityName}}Service.findMany({ limit: 100 })
      expect(result.total).toBe(1000)
    })
  })
})

// Integration Tests (if this is an integration test file)
describe('{{EntityName}} API Integration Tests', () => {
  // Add API endpoint tests here
  // Example:
  // describe('POST /api/{{entityName}}s', () => {
  //   it('should create {{entityName}} via API', async () => {
  //     const response = await request(app)
  //       .post('/api/{{entityName}}s')
  //       .send(mockCreate{{EntityName}}Data)
  //       .expect(201)
  //
  //     expect(response.body.success).toBe(true)
  //     expect(response.body.data.name).toBe(mockCreate{{EntityName}}Data.name)
  //   })
  // })
})