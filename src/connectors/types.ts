/**
 * AIOStore Connector Base Types
 * 
 * Common types and interfaces used by all platform connectors
 * (Shopee, TikTok Shop, Tokopedia, etc.)
 */

import { PlatformType } from '@/types/product'

// =============================================================================
// CONFIGURATION & CREDENTIALS
// =============================================================================

export interface ConnectorConfig {
  baseUrl: string
  timeout?: number
  retryAttempts?: number
  rateLimitPerMinute?: number
}

export interface PlatformCredentials {
  // Shopee
  partnerId?: string
  partnerKey?: string
  shopId?: string
  accessToken?: string
  
  // TikTok Shop
  appKey?: string
  appSecret?: string
  
  // Generic
  clientId?: string
  clientSecret?: string
  baseUrl?: string
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ConnectorResponse<T = any> {
  success: boolean
  data?: T
  error?: ConnectorError
  metadata?: {
    requestId?: string
    timestamp: Date
    rateLimitRemaining?: number
    rateLimitReset?: number
  }
}

export interface ConnectorError {
  code: string
  message: string
  details?: any
  retryable: boolean
  httpStatusCode?: number
}

// =============================================================================
// PRODUCT OPERATION TYPES
// =============================================================================

export interface ProductListParams {
  page?: number
  pageSize?: number
  status?: string
  category?: string
  search?: string
  modifiedFrom?: Date
  modifiedTo?: Date
}

export interface ProductDetail {
  id: string
  title: string
  description?: string
  price: number
  compareAtPrice?: number
  stock: number
  category?: string
  images: string[]
  attributes?: Record<string, any>
  status: 'active' | 'inactive' | 'out_of_stock'
  createdAt: Date
  updatedAt: Date
}

export interface ProductPushData {
  title: string
  description?: string
  price: number
  compareAtPrice?: number
  stock: number
  category?: string
  images: string[]
  attributes?: Record<string, any>
  sku?: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  shippingInfo?: {
    weight?: number
    dimensions?: {
      length: number
      width: number
      height: number
    }
  }
}

export interface ProductUpdateData {
  productId: string
  title?: string
  description?: string
  price?: number
  compareAtPrice?: number
  stock?: number
  category?: string
  attributes?: Record<string, any>
  images?: string[]
  status?: 'active' | 'inactive' | 'out_of_stock'
}

// =============================================================================
// ORDER OPERATION TYPES
// =============================================================================

export interface OrderListParams {
  page?: number
  pageSize?: number
  status?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface OrderDetail {
  id: string
  orderNumber: string
  platformOrderId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  totalAmount: number
  currency: string
  customer: {
    name: string
    email?: string
    phone: string
  }
  items: OrderItem[]
  shippingAddress: ShippingAddress
  shippingMethod?: string
  trackingNumber?: string
  createdAt: Date
  updatedAt: Date
  orderDate: Date
}

export interface OrderItem {
  id: string
  productId: string
  title: string
  sku?: string
  quantity: number
  price: number
  total: number
}

export type OrderStatus = 
  | 'pending' 
  | 'paid' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded'

export type PaymentStatus = 
  | 'unpaid' 
  | 'paid' 
  | 'refunded'

export interface ShippingAddress {
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface OrderStatusUpdate {
  orderId: string
  status: OrderStatus
  trackingNumber?: string
  notes?: string
}

// =============================================================================
// STOCK & PRICE UPDATE TYPES
// =============================================================================

export interface StockUpdate {
  productId: string
  stock: number
  reason?: 'restock' | 'sale' | 'adjustment' | 'damage' | 'return'
}

export interface PriceUpdate {
  productId: string
  price: number
  compareAtPrice?: number
  reason?: 'promotion' | 'seasonal' | 'competitive' | 'cost_change'
}

// =============================================================================
// SYNC OPERATION TYPES
// =============================================================================

export interface SyncJob {
  id: string
  type: 'pull' | 'push' | 'sync'
  platform: PlatformType
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  totalItems: number
  processedItems: number
  successCount: number
  errorCount: number
  startedAt?: Date
  completedAt?: Date
  errorMessage?: string
  metadata?: Record<string, any>
}

export interface SyncItem {
  id: string
  jobId: string
  type: 'product' | 'order' | 'stock' | 'price'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  attempts: number
  maxAttempts: number
  errorMessage?: string
  data: any
}

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

export interface WebhookEvent {
  id: string
  type: string
  platform: PlatformType
  timestamp: Date
  data: any
  processed: boolean
  signature?: string
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

export interface ProductValidationRules {
  maxTitleLength: number
  maxDescriptionLength: number
  requiredAttributes: string[]
  forbiddenTerms: string[]
  imageRequirements: {
    minCount: number
    maxCount: number
    maxSizeInMB: number
    allowedFormats: string[]
  }
}

// =============================================================================
// CONNECTOR INTERFACE
// =============================================================================

export interface Connector {
  platform: PlatformType
  config: ConnectorConfig
  credentials: PlatformCredentials
  
  // Product operations
  listProducts(params?: ProductListParams): Promise<ConnectorResponse<ProductDetail[]>>
  getProduct(productId: string): Promise<ConnectorResponse<ProductDetail>>
  createProduct(data: ProductPushData): Promise<ConnectorResponse<ProductDetail>>
  updateProduct(productId: string, data: ProductUpdateData): Promise<ConnectorResponse<ProductDetail>>
  updateStock(productId: string, stock: number): Promise<ConnectorResponse<void>>
  updatePrice(productId: string, price: number, compareAtPrice?: number): Promise<ConnectorResponse<void>>
  
  // Order operations
  listOrders(params?: OrderListParams): Promise<ConnectorResponse<OrderDetail[]>>
  getOrder(orderId: string): Promise<ConnectorResponse<OrderDetail>>
  updateOrderStatus(orderId: string, update: OrderStatusUpdate): Promise<ConnectorResponse<void>>
  
  // Sync operations
  getSyncStatus(jobId: string): Promise<ConnectorResponse<SyncJob>>
  cancelSync(jobId: string): Promise<ConnectorResponse<void>>
  
  // Webhook operations
  verifyWebhookSignature(payload: string, signature: string): boolean
  
  // Health check
  healthCheck(): Promise<ConnectorResponse<{ status: 'healthy' | 'unhealthy'; message?: string }>>
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface IdempotencyKey {
  key: string
  timestamp: Date
  expiresAt: Date
}

export interface RateLimitInfo {
  remaining: number
  resetAt: Date
  limit: number
}

export interface RetryConfig {
  maxAttempts: number
  baseDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

// =============================================================================
// EXPORTS
// =============================================================================

export default Connector