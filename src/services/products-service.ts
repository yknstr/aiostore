/**
 * Products Service Layer
 * 
 * Provides unified interface for Products data with feature flag switching
 * between mock data and Supabase database
 */

import { Product, ProductStatus, PlatformType } from '@/types/product'
import { mockProducts as mockProductsData, getProductById as getMockProductById, filterProducts as filterMockProducts } from '@/lib/mock-data/products'
import { supabase } from '@/lib/supabase'
import { featureFlags, dataTransformers } from '@/lib/data-sources'

// Product filter interface
export interface ProductFilters {
  search?: string
  platform?: PlatformType
  status?: ProductStatus
  category?: string
}

// Service response interface
export interface ProductServiceResponse<T = any> {
  data: T
  success: boolean
  error?: string
  source: 'mock' | 'supabase'
  timestamp: Date
}

/**
 * Products Service Class
 */
export class ProductsService {
  private readonly tableName = 'products'
  private readonly logPrefix = '[ProductsService]'

  /**
   * Get all products with optional filtering
   */
  async listProducts(filters: ProductFilters = {}): Promise<ProductServiceResponse<Product[]>> {
    const source = featureFlags.products
    const startTime = Date.now()

    try {
      if (featureFlags.useProductsSupabase()) {
        const data = await this.getProductsFromSupabase(filters)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const data = await this.getProductsFromMock(filters)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error:`, error)
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    } finally {
      const duration = Date.now() - startTime
      console.log(`${this.logPrefix} ${source} query completed in ${duration}ms`)
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<ProductServiceResponse<Product | null>> {
    const source = featureFlags.products
    const startTime = Date.now()

    try {
      if (featureFlags.useProductsSupabase()) {
        const data = await this.getProductFromSupabase(id)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const data = await this.getProductFromMock(id)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} getProductById error:`, error)
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    } finally {
      const duration = Date.now() - startTime
      console.log(`${this.logPrefix} getProductById ${source} query completed in ${duration}ms`)
    }
  }

  /**
   * Filter products (alias for listProducts with filters)
   */
  async filterProducts(filters: ProductFilters): Promise<ProductServiceResponse<Product[]>> {
    return this.listProducts(filters)
  }

  // Private methods

  /**
   * Get products from mock data
   */
  private async getProductsFromMock(filters: ProductFilters): Promise<Product[]> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return filterMockProducts(filters)
  }

  /**
   * Get a single product from mock data
   */
  private async getProductFromMock(id: string): Promise<Product | null> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50))
    
    return getMockProductById(id) || null
  }

  /**
   * Get products from Supabase
   */
  private async getProductsFromSupabase(filters: ProductFilters): Promise<Product[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      // Order by created_at descending
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      // Transform from snake_case to camelCase
      const transformedData = dataTransformers.snakeToCamel(data || []) as Product[]
      
      // Apply platform filter if needed (check platforms JSONB field)
      if (filters.platform) {
        return transformedData.filter(product => 
          product.platforms?.some((p: any) => 
            p.platform === filters.platform && p.isPublished
          )
        )
      }

      return transformedData
    } catch (error) {
      console.error(`${this.logPrefix} Supabase query failed:`, error)
      throw error
    }
  }

  /**
   * Get a single product from Supabase
   */
  private async getProductFromSupabase(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        throw new Error(`Supabase error: ${error.message}`)
      }

      // Transform from snake_case to camelCase
      return dataTransformers.snakeToCamel(data) as Product
    } catch (error) {
      console.error(`${this.logPrefix} getProductFromSupabase error:`, error)
      throw error
    }
  }

  /**
   * Get product statistics
   */
  async getProductStats(): Promise<ProductServiceResponse<{
    total: number
    active: number
    inactive: number
    outOfStock: number
    lowStock: number
  }>> {
    const source = featureFlags.products

    try {
      if (featureFlags.useProductsSupabase()) {
        const products = await this.getProductsFromSupabase({})
        
        const stats = {
          total: products.length,
          active: products.filter(p => p.status === 'active').length,
          inactive: products.filter(p => p.status === 'inactive').length,
          outOfStock: products.filter(p => p.status === 'out_of_stock').length,
          lowStock: products.filter(p => p.stock <= p.lowStockThreshold).length,
        }

        return {
          data: stats,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const products = await this.getProductsFromMock({})
        
        const stats = {
          total: products.length,
          active: products.filter(p => p.status === 'active').length,
          inactive: products.filter(p => p.status === 'inactive').length,
          outOfStock: products.filter(p => p.status === 'out_of_stock').length,
          lowStock: products.filter(p => p.stock <= p.lowStockThreshold).length,
        }

        return {
          data: stats,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} getProductStats error:`, error)
      return {
        data: {
          total: 0,
          active: 0,
          inactive: 0,
          outOfStock: 0,
          lowStock: 0,
        },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Create a new product (Phase 3 - Write Operations)
   */
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductServiceResponse<Product>> {
    const source = featureFlags.products
    const writeMode = featureFlags.writeMode

    try {
      // Transform to database format (camelCase to snake_case)
      const dbProduct = dataTransformers.camelToSnake(productData)

      if (featureFlags.isDryRun()) {
        console.log(`${this.logPrefix} [DRY-RUN] Would insert product:`, productData)
        console.log(`${this.logPrefix} [DRY-RUN] SQL: INSERT INTO products (${Object.keys(dbProduct).join(', ')}) VALUES (${Object.values(dbProduct).map(v => `'${v}'`).join(', ')})`)
        console.log(`${this.logPrefix} [DRY-RUN] Payload:`, dbProduct)
        
        // Return success response with mock data (no actual database operation)
        const mockProduct: Product = {
          ...productData,
          id: `mock-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        return {
          data: mockProduct,
          success: true,
          source,
          timestamp: new Date(),
        }
      }

      // LIVE mode - actual database operation
      if (featureFlags.useProductsSupabase()) {
        const { data, error } = await supabase
          .from(this.tableName)
          .insert(dbProduct)
          .select()
          .single()

        if (error) {
          throw new Error(`Supabase error: ${error.message}`)
        }

        // Transform from snake_case to camelCase
        const transformedProduct = dataTransformers.snakeToCamel(data) as Product

        return {
          data: transformedProduct,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        // Mock mode - simulate creation
        const mockProduct: Product = {
          ...productData,
          id: `mock-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        return {
          data: mockProduct,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} createProduct error:`, error)
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Update an existing product (Phase 3 - Write Operations)
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<ProductServiceResponse<Product>> {
    const source = featureFlags.products
    const writeMode = featureFlags.writeMode

    try {
      // Transform to database format (camelCase to snake_case)
      const dbUpdates = dataTransformers.camelToSnake(updates)

      if (featureFlags.isDryRun()) {
        console.log(`${this.logPrefix} [DRY-RUN] Would update product ${id}:`, updates)
        console.log(`${this.logPrefix} [DRY-RUN] SQL: UPDATE products SET ${Object.entries(dbUpdates).map(([key, value]) => `${key} = '${value}'`).join(', ')} WHERE id = '${id}'`)
        console.log(`${this.logPrefix} [DRY-RUN] Updates:`, dbUpdates)
        
        // Return success response with mock data (no actual database operation)
        const mockProduct: Product = {
          ...updates as Product,
          id,
          updatedAt: new Date(),
        }
        
        return {
          data: mockProduct,
          success: true,
          source,
          timestamp: new Date(),
        }
      }

      // LIVE mode - actual database operation
      if (featureFlags.useProductsSupabase()) {
        const { data, error } = await supabase
          .from(this.tableName)
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          throw new Error(`Supabase error: ${error.message}`)
        }

        // Transform from snake_case to camelCase
        const transformedProduct = dataTransformers.snakeToCamel(data) as Product

        return {
          data: transformedProduct,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        // Mock mode - simulate update
        const mockProduct: Product = {
          ...updates as Product,
          id,
          updatedAt: new Date(),
        }

        return {
          data: mockProduct,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} updateProduct error:`, error)
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    }
  }
}

// Export singleton instance
export const productsService = new ProductsService()

// Export utility functions for easy use (renamed to avoid conflicts)
export const listProductsService = (filters?: ProductFilters) => productsService.listProducts(filters)
export const getProductByIdService = (id: string) => productsService.getProductById(id)
export const filterProductsService = (filters: ProductFilters) => productsService.filterProducts(filters)
export const getProductStatsService = () => productsService.getProductStats()

export default productsService