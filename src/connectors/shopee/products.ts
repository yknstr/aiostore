/**
 * Shopee Products Module
 * 
 * Handles product-related operations for Shopee platform:
 * - List products with pagination and filtering
 * - Get product details
 * - Create new products
 * - Update existing products
 * - Update stock and price
 * 
 * Shopee API Reference: https://shopee.github.io/shopee-marathon-api/
 */

import { 
  ProductListParams,
  ProductDetail,
  ProductPushData,
  ProductUpdateData,
  ConnectorResponse,
  ValidationResult,
  ProductValidationRules
} from '@/connectors/types'
import { ShopeeClient } from './client'

// =============================================================================
// SHOPEE PRODUCT API RESPONSE TYPES
// =============================================================================

interface ShopeeProduct {
  product_id: string
  category_id: number
  name: string
  description: string
  price: number
  stock: number
  status: number // 1=normal, 2=out of stock, 3=deleted
  item: Array<{
    item_id: string
    model_id?: string
    status: number
    stock: number
    price: number
    sku: string
  }>
  images: string[]
  weight: number
  created_time: number
  updated_time: number
}

interface ShopeeProductListResponse {
  products: ShopeeProduct[]
  total_count: number
  has_more: boolean
  next_offset: string
}

interface ShopeeCreateProductResponse {
  product_id: string
  warnings: string[]
}

interface ShopeeProductUpdateResponse {
  success: boolean
  product_id: string
  warnings: string[]
}

// =============================================================================
// VALIDATION RULES FOR SHOPEE
// =============================================================================

export const SHOPEE_VALIDATION_RULES: ProductValidationRules = {
  maxTitleLength: 120,
  maxDescriptionLength: 8000,
  requiredAttributes: [],
  forbiddenTerms: [
    // Add platform-specific forbidden terms
    'fake', 'replica', 'counterfeit', 'pirated'
  ],
  imageRequirements: {
    minCount: 1,
    maxCount: 9,
    maxSizeInMB: 10,
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
  }
}

// =============================================================================
// SHOPEE PRODUCTS CLASS
// =============================================================================

export class ShopeeProducts {
  private client: ShopeeClient
  private logPrefix = '[ShopeeProducts]'

  constructor(client: ShopeeClient) {
    this.client = client
  }

  // =============================================================================
  // PRODUCT LISTING OPERATIONS
  // =============================================================================

  /**
   * List products with pagination and filtering
   */
  async listProducts(params: ProductListParams = {}): Promise<ConnectorResponse<ProductDetail[]>> {
    try {
      const queryParams: any = {
        page_size: params.pageSize || 50,
        offset: ((params.page || 1) - 1) * (params.pageSize || 50)
      }

      // Apply filters
      if (params.status) {
        queryParams.status = this.mapStatusToShopee(params.status)
      }

      if (params.search) {
        queryParams.keyword = params.search
      }

      if (params.category) {
        queryParams.category_id = await this.getCategoryId(params.category)
      }

      const response = await this.client.request<ShopeeProductListResponse>(
        '/api/v1/products/search',
        {
          query: queryParams
        }
      )

      if (response.success && response.data) {
        const products = response.data.products.map(product => 
          this.transformProductFromShopee(product)
        )

        console.log(`${this.logPrefix} Retrieved ${products.length} products`)
        return {
          success: true,
          data: products,
          metadata: {
            totalCount: response.data.total_count,
            hasMore: response.data.has_more,
            nextOffset: response.data.next_offset
          } as any
        }
      } else {
        return {
          success: false,
          error: response.error
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error listing products:`, error)
      return {
        success: false,
        error: {
          code: 'LIST_PRODUCTS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list products',
          retryable: true
        }
      }
    }
  }

  /**
   * Get detailed information about a specific product
   */
  async getProduct(productId: string): Promise<ConnectorResponse<ProductDetail>> {
    try {
      const response = await this.client.request<ShopeeProduct>(
        '/api/v1/products/detail',
        {
          query: {
            product_id: productId
          }
        }
      )

      if (response.success && response.data) {
        const product = this.transformProductFromShopee(response.data)
        console.log(`${this.logPrefix} Retrieved product: ${product.id}`)
        return {
          success: true,
          data: product
        }
      } else {
        return {
          success: false,
          error: response.error
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error getting product ${productId}:`, error)
      return {
        success: false,
        error: {
          code: 'GET_PRODUCT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get product',
          retryable: true
        }
      }
    }
  }

  // =============================================================================
  // PRODUCT CREATION OPERATIONS
  // =============================================================================

  /**
   * Create a new product on Shopee
   */
  async createProduct(productData: ProductPushData): Promise<ConnectorResponse<ProductDetail>> {
    try {
      // Validate product data
      const validation = await this.validateProduct(productData)
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Product validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
            retryable: false
          }
        }
      }

      // Transform to Shopee format
      const shopeeProduct = this.transformProductToShopee(productData)
      
      // Generate idempotency key
      const idempotencyKey = this.client.generateIdempotencyKey()
      
      const response = await this.client.request<ShopeeCreateProductResponse>(
        '/api/v1/products/add',
        {
          body: shopeeProduct,
          idempotencyKey: idempotencyKey.key
        }
      )

      if (response.success && response.data) {
        // Get the created product details
        const productResponse = await this.getProduct(response.data.product_id)
        
        if (productResponse.success && productResponse.data) {
          console.log(`${this.logPrefix} Created product: ${productResponse.data.id}`)
          return {
            success: true,
            data: productResponse.data
          }
        } else {
          // Product created but failed to fetch details
          return {
            success: false,
            error: {
              code: 'FETCH_CREATED_PRODUCT_ERROR',
              message: 'Product created but failed to fetch details',
              retryable: true
            }
          }
        }
      } else {
        return {
          success: false,
          error: response.error
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error creating product:`, error)
      return {
        success: false,
        error: {
          code: 'CREATE_PRODUCT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create product',
          retryable: true
        }
      }
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(productId: string, updateData: ProductUpdateData): Promise<ConnectorResponse<ProductDetail>> {
    try {
      // Validate update data
      const validation = await this.validateUpdateData(updateData)
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Product update validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
            retryable: false
          }
        }
      }

      // Transform update data to Shopee format
      const shopeeUpdate = this.transformUpdateToShopee(updateData)
      
      // Generate idempotency key
      const idempotencyKey = this.client.generateIdempotencyKey()
      
      const response = await this.client.request<ShopeeProductUpdateResponse>(
        '/api/v1/products/update',
        {
          body: {
            ...shopeeUpdate,
            product_id: productId
          },
          idempotencyKey: idempotencyKey.key
        }
      )

      if (response.success) {
        // Get the updated product details
        const productResponse = await this.getProduct(productId)
        
        if (productResponse.success && productResponse.data) {
          console.log(`${this.logPrefix} Updated product: ${productId}`)
          return {
            success: true,
            data: productResponse.data
          }
        } else {
          return {
            success: false,
            error: {
              code: 'FETCH_UPDATED_PRODUCT_ERROR',
              message: 'Product updated but failed to fetch details',
              retryable: true
            }
          }
        }
      } else {
        return {
          success: false,
          error: response.error
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error updating product ${productId}:`, error)
      return {
        success: false,
        error: {
          code: 'UPDATE_PRODUCT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update product',
          retryable: true
        }
      }
    }
  }

  // =============================================================================
  // STOCK & PRICE OPERATIONS
  // =============================================================================

  /**
   * Update product stock
   */
  async updateStock(productId: string, stock: number): Promise<ConnectorResponse<void>> {
    try {
      const idempotencyKey = this.client.generateIdempotencyKey()
      
      const response = await this.client.request(
        '/api/v1/products/update_stock',
        {
          body: {
            product_id: productId,
            stock
          },
          idempotencyKey: idempotencyKey.key
        }
      )

      if (response.success) {
        console.log(`${this.logPrefix} Updated stock for product ${productId}: ${stock}`)
        return { success: true }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error updating stock for product ${productId}:`, error)
      return {
        success: false,
        error: {
          code: 'UPDATE_STOCK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update stock',
          retryable: true
        }
      }
    }
  }

  /**
   * Update product price
   */
  async updatePrice(
    productId: string, 
    price: number, 
    compareAtPrice?: number
  ): Promise<ConnectorResponse<void>> {
    try {
      const idempotencyKey = this.client.generateIdempotencyKey()
      
      const updateData: any = {
        product_id: productId,
        price
      }

      if (compareAtPrice !== undefined) {
        updateData.original_price = compareAtPrice
      }

      const response = await this.client.request(
        '/api/v1/products/update_price',
        {
          body: updateData,
          idempotencyKey: idempotencyKey.key
        }
      )

      if (response.success) {
        console.log(`${this.logPrefix} Updated price for product ${productId}: ${price}`)
        return { success: true }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error updating price for product ${productId}:`, error)
      return {
        success: false,
        error: {
          code: 'UPDATE_PRICE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update price',
          retryable: true
        }
      }
    }
  }

  // =============================================================================
  // VALIDATION HELPERS
  // =============================================================================

  /**
   * Validate product data before creating
   */
  private async validateProduct(productData: ProductPushData): Promise<ValidationResult> {
    const errors: any[] = []
    const warnings: any[] = []
    const rules = SHOPEE_VALIDATION_RULES

    // Check title length
    if (productData.title.length > rules.maxTitleLength) {
      errors.push({
        field: 'title',
        message: `Title cannot exceed ${rules.maxTitleLength} characters`,
        code: 'TITLE_TOO_LONG'
      })
    }

    // Check description length
    if (productData.description && productData.description.length > rules.maxDescriptionLength) {
      errors.push({
        field: 'description',
        message: `Description cannot exceed ${rules.maxDescriptionLength} characters`,
        code: 'DESCRIPTION_TOO_LONG'
      })
    }

    // Check price validity
    if (productData.price <= 0) {
      errors.push({
        field: 'price',
        message: 'Price must be greater than 0',
        code: 'INVALID_PRICE'
      })
    }

    // Check stock validity
    if (productData.stock < 0) {
      errors.push({
        field: 'stock',
        message: 'Stock cannot be negative',
        code: 'INVALID_STOCK'
      })
    }

    // Check image requirements
    if (!productData.images || productData.images.length === 0) {
      errors.push({
        field: 'images',
        message: 'At least one image is required',
        code: 'NO_IMAGES'
      })
    } else if (productData.images.length < rules.imageRequirements.minCount) {
      errors.push({
        field: 'images',
        message: `At least ${rules.imageRequirements.minCount} images are required`,
        code: 'INSUFFICIENT_IMAGES'
      })
    } else if (productData.images.length > rules.imageRequirements.maxCount) {
      warnings.push({
        field: 'images',
        message: `Maximum ${rules.imageRequirements.maxCount} images recommended`,
        code: 'TOO_MANY_IMAGES'
      })
    }

    // Check forbidden terms
    const forbiddenFound = this.findForbiddenTerms(productData.title, rules.forbiddenTerms)
    if (forbiddenFound.length > 0) {
      errors.push({
        field: 'title',
        message: `Title contains forbidden terms: ${forbiddenFound.join(', ')}`,
        code: 'FORBIDDEN_TERMS'
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate update data
   */
  private async validateUpdateData(updateData: ProductUpdateData): Promise<ValidationResult> {
    const errors: any[] = []

    // Check price validity if provided
    if (updateData.price !== undefined && updateData.price <= 0) {
      errors.push({
        field: 'price',
        message: 'Price must be greater than 0',
        code: 'INVALID_PRICE'
      })
    }

    // Check stock validity if provided
    if (updateData.stock !== undefined && updateData.stock < 0) {
      errors.push({
        field: 'stock',
        message: 'Stock cannot be negative',
        code: 'INVALID_STOCK'
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    }
  }

  /**
   * Find forbidden terms in text
   */
  private findForbiddenTerms(text: string, forbiddenTerms: string[]): string[] {
    const lowerText = text.toLowerCase()
    return forbiddenTerms.filter(term => lowerText.includes(term.toLowerCase()))
  }

  // =============================================================================
  // TRANSFORMATION HELPERS
  // =============================================================================

  /**
   * Transform product from Shopee format to internal format
   */
  private transformProductFromShopee(shopeeProduct: ShopeeProduct): ProductDetail {
    return {
      id: shopeeProduct.product_id,
      title: shopeeProduct.name,
      description: shopeeProduct.description,
      price: shopeeProduct.price,
      stock: shopeeProduct.stock,
      category: shopeeProduct.category_id.toString(),
      images: shopeeProduct.images || [],
      attributes: {},
      status: this.mapStatusFromShopee(shopeeProduct.status),
      createdAt: new Date(shopeeProduct.created_time * 1000),
      updatedAt: new Date(shopeeProduct.updated_time * 1000)
    }
  }

  /**
   * Transform internal product data to Shopee format
   */
  private transformProductToShopee(productData: ProductPushData): any {
    return {
      name: productData.title,
      description: productData.description || '',
      price: productData.price,
      stock: productData.stock,
      category_id: 0, // Will need to be mapped based on category
      images: productData.images,
      weight: productData.weight || 0,
      item: [
        {
          sku: productData.sku || '',
          stock: productData.stock,
          price: productData.price,
          status: 1
        }
      ]
    }
  }

  /**
   * Transform update data to Shopee format
   */
  private transformUpdateToShopee(updateData: ProductUpdateData): any {
    const update: any = {}

    if (updateData.title !== undefined) {
      update.name = updateData.title
    }

    if (updateData.description !== undefined) {
      update.description = updateData.description
    }

    if (updateData.price !== undefined) {
      update.price = updateData.price
    }

    if (updateData.stock !== undefined) {
      update.stock = updateData.stock
    }

    if (updateData.images !== undefined) {
      update.images = updateData.images
    }

    if (updateData.status !== undefined) {
      update.status = this.mapStatusToShopee(updateData.status)
    }

    return update
  }

  /**
   * Map internal status to Shopee status
   */
  private mapStatusToShopee(status: string): number {
    switch (status) {
      case 'active':
        return 1
      case 'out_of_stock':
        return 2
      case 'inactive':
        return 0
      default:
        return 1
    }
  }

  /**
   * Map Shopee status to internal status
   */
  private mapStatusFromShopee(status: number): 'active' | 'inactive' | 'out_of_stock' {
    switch (status) {
      case 1:
        return 'active'
      case 2:
        return 'out_of_stock'
      case 0:
        return 'inactive'
      default:
        return 'inactive'
    }
  }

  /**
   * Get category ID by category name (placeholder implementation)
   */
  private async getCategoryId(categoryName: string): Promise<number> {
    // TODO: Implement category mapping logic
    // This would typically involve calling Shopee's category API
    // and mapping your internal categories to Shopee's category IDs
    return 0
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ShopeeProducts