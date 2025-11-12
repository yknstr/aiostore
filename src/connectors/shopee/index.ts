/**
 * Shopee Connector Main Index
 * 
 * Exports all Shopee connector components and provides factory functions
 * for easy integration with the AIOStore platform.
 */

import { ShopeeClient } from './client'
import ShopeeProducts from './products'
import ShopeeOrders from './orders'

// =============================================================================
// MAIN SHOPEE CONNECTOR CLASS
// =============================================================================

export class ShopeeConnector {
  private client: ShopeeClient
  private products: ShopeeProducts
  private orders: ShopeeOrders
  private logPrefix = '[ShopeeConnector]'

  constructor(client: ShopeeClient) {
    this.client = client
    this.products = new ShopeeProducts(client)
    this.orders = new ShopeeOrders(client)
  }

  // =============================================================================
  // GETTERS FOR SUB-MODULES
  // =============================================================================

  getClient(): ShopeeClient {
    return this.client
  }

  getProducts(): ShopeeProducts {
    return this.products
  }

  getOrders(): ShopeeOrders {
    return this.orders
  }

  // =============================================================================
  // COMPATIBILITY METHODS FOR Connector INTERFACE
  // =============================================================================

  platform = 'shopee' as const

  get config() {
    return this.client.getConfig()
  }

  credentials = {
    partnerId: process.env.SHOPEE_PARTNER_ID || '',
    partnerKey: process.env.SHOPEE_PARTNER_KEY || '',
    shopId: process.env.SHOPEE_SHOP_ID || '',
    accessToken: process.env.SHOPEE_ACCESS_TOKEN || ''
  }

  // Product operations
  async listProducts(params?: any) {
    return this.products.listProducts(params)
  }

  async getProduct(productId: string) {
    return this.products.getProduct(productId)
  }

  async createProduct(data: any) {
    return this.products.createProduct(data)
  }

  async updateProduct(productId: string, data: any) {
    return this.products.updateProduct(productId, data)
  }

  async updateStock(productId: string, stock: number) {
    return this.products.updateStock(productId, stock)
  }

  async updatePrice(productId: string, price: number, compareAtPrice?: number) {
    return this.products.updatePrice(productId, price, compareAtPrice)
  }

  // Order operations
  async listOrders(params?: any) {
    return this.orders.listOrders(params)
  }

  async getOrder(orderId: string) {
    return this.orders.getOrder(orderId)
  }

  async updateOrderStatus(orderId: string, update: any) {
    return this.orders.updateOrderStatus(orderId, update)
  }

  // Health check
  async healthCheck() {
    return this.client.healthCheck()
  }

  // Webhook verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    return this.client.verifyWebhookSignature(payload, signature)
  }

  // Sync operations (placeholder implementation)
  async getSyncStatus(jobId: string) {
    console.warn(`${this.logPrefix} Sync status not implemented yet`)
    return {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Sync operations not implemented yet',
        retryable: false
      }
    }
  }

  async cancelSync(jobId: string) {
    console.warn(`${this.logPrefix} Sync cancellation not implemented yet`)
    return {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Sync operations not implemented yet',
        retryable: false
      }
    }
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a Shopee connector instance with environment-based configuration
 */
export function createShopeeConnector(): ShopeeConnector {
  const client = createShopeeClient()
  return new ShopeeConnector(client)
}

/**
 * Create Shopee client from environment variables
 */
export function createShopeeClient(): ShopeeClient {
  const config = {
    baseUrl: process.env.SHOPEE_BASE_URL || 'https://partner.shopeemobile.com/api/v2',
    partnerId: process.env.SHOPEE_PARTNER_ID || '',
    partnerKey: process.env.SHOPEE_PARTNER_KEY || '',
    shopId: process.env.SHOPEE_SHOP_ID || '',
    accessToken: process.env.SHOPEE_ACCESS_TOKEN || '',
    timeout: 30000,
    retryAttempts: 3,
    rateLimitPerMinute: 100
  }

  // Validate required configuration
  const missingVars = []
  if (!config.partnerId) missingVars.push('SHOPEE_PARTNER_ID')
  if (!config.partnerKey) missingVars.push('SHOPEE_PARTNER_KEY')
  if (!config.shopId) missingVars.push('SHOPEE_SHOP_ID')
  if (!config.accessToken) missingVars.push('SHOPEE_ACCESS_TOKEN')

  if (missingVars.length > 0) {
    throw new Error(`Missing required Shopee environment variables: ${missingVars.join(', ')}`)
  }

  return new ShopeeClient(config)
}

/**
 * Create Shopee connector with custom configuration
 */
export function createCustomShopeeConnector(config: {
  baseUrl?: string
  partnerId: string
  partnerKey: string
  shopId: string
  accessToken: string
  timeout?: number
  retryAttempts?: number
  rateLimitPerMinute?: number
}): ShopeeConnector {
  const client = new ShopeeClient({
    baseUrl: config.baseUrl || 'https://partner.shopeemobile.com/api/v2',
    ...config
  })
  return new ShopeeConnector(client)
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate Shopee configuration
 */
export function validateShopeeConfig(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required environment variables
  const requiredVars = [
    'SHOPEE_PARTNER_ID',
    'SHOPEE_PARTNER_KEY',
    'SHOPEE_SHOP_ID',
    'SHOPEE_ACCESS_TOKEN'
  ]

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  })

  // Check optional configurations
  if (!process.env.SHOPEE_BASE_URL) {
    warnings.push('SHOPEE_BASE_URL not set, using default: https://partner.shopeemobile.com/api/v2')
  }

  // Validate URL format if provided
  const baseUrl = process.env.SHOPEE_BASE_URL || 'https://partner.shopeemobile.com/api/v2'
  try {
    new URL(baseUrl)
  } catch (error) {
    errors.push('SHOPEE_BASE_URL is not a valid URL')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Test Shopee connection
 */
export async function testShopeeConnection(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    const connector = createShopeeConnector()
    const healthCheck = await connector.healthCheck()

    if (healthCheck.success) {
      return {
        success: true,
        message: 'Shopee connection successful',
        details: healthCheck.data
      }
    } else {
      return {
        success: false,
        message: `Shopee connection failed: ${healthCheck.error?.message}`,
        details: healthCheck.error
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Shopee connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ShopeeConnector