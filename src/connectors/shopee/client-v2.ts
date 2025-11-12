/**
 * Shopee v2 API Client
 * 
 * Implements proper v2 signing logic according to Phase 3 requirements:
 * - Uses official v2 endpoints (not v1)
 * - Correct StringToSign pattern: base = partner_id + api_path + timestamp + (access_token? + shop_or_merchant_id?)
 * - Sign = hex(hmac_sha256(base, PARTNER_KEY))
 * 
 * Phase 3 Documentation: docs/newtasks_1.md
 * Shopee API v2: https://partner.shopeemobile.com/api/docs/v2
 */

import { 
  ConnectorConfig, 
  ConnectorResponse, 
  ConnectorError,
  RateLimitInfo,
  RetryConfig,
  IdempotencyKey
} from '@/connectors/types'
import crypto from 'crypto'

// =============================================================================
// SHOPEE V2 CLIENT CONFIGURATION
// =============================================================================

export interface ShopeeV2ClientConfig extends ConnectorConfig {
  baseUrl: string
  partnerId: string
  partnerKey: string
  shopId?: string // Optional for some endpoints
  merchantId?: string // Optional for merchant-based flows
  accessToken?: string // Optional for token-based endpoints
}

export interface ShopeeV2ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    request_id?: string
  }
  request_id?: string
}

// =============================================================================
// SHOPEE V2 CLIENT CLASS
// =============================================================================

export class ShopeeV2Client {
  private config: ShopeeV2ClientConfig
  private rateLimiters: Map<string, { remaining: number; resetAt: Date }> = new Map()
  
  constructor(config: ShopeeV2ClientConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      rateLimitPerMinute: 100,
      ...config
    }
  }

  // =============================================================================
  // V2 SIGNATURE GENERATION (Phase 3 Requirement)
  // =============================================================================

  /**
   * Generate v2 HMAC-SHA256 signature according to Phase 3 spec
   * StringToSign = partner_id + api_path + timestamp + (access_token? + shop_or_merchant_id?)
   * Sign = hex(hmac_sha256(base, PARTNER_KEY))
   */
  private generateV2Signature(
    apiPath: string,
    timestamp: string,
    options: {
      includeAccessToken?: boolean
      includeShopId?: boolean
      includeMerchantId?: boolean
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    } = {}
  ): string {
    const {
      includeAccessToken = false,
      includeShopId = false,
      includeMerchantId = false,
      method = 'POST'
    } = options

    // Build base string: partner_id + api_path + timestamp
    let baseString = `${this.config.partnerId}${apiPath}${timestamp}`

    // Add access_token and shop_id/merchant_id if required by endpoint
    if (includeAccessToken && this.config.accessToken) {
      baseString += this.config.accessToken
    }

    if (includeShopId && this.config.shopId) {
      baseString += this.config.shopId
    } else if (includeMerchantId && this.config.merchantId) {
      baseString += this.config.merchantId
    }

    // Generate signature
    const signature = crypto
      .createHmac('sha256', this.config.partnerKey)
      .update(baseString)
      .digest('hex')
    
    return signature
  }

  /**
   * Get current timestamp for v2 API calls (Unix seconds)
   */
  private getTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString()
  }

  // =============================================================================
  // V2 API REQUEST HANDLER
  // =============================================================================

  /**
   * Make authenticated API request to Shopee v2
   */
  async request<T = any>(
    endpoint: string, 
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: any
      query?: Record<string, any>
      includeAccessToken?: boolean
      includeShopId?: boolean
      includeMerchantId?: boolean
      idempotencyKey?: string
    } = {}
  ): Promise<ConnectorResponse<T>> {
    const {
      method = 'POST',
      body,
      query,
      includeAccessToken = false,
      includeShopId = false,
      includeMerchantId = false,
      idempotencyKey
    } = options

    const baseUrl = this.config.baseUrl
    const timestamp = this.getTimestamp()
    const apiPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    
    // Build query parameters with v2 pattern
    const params = new URLSearchParams({
      partner_id: this.config.partnerId,
      timestamp,
      ...query
    })

    // Add shop_id or merchant_id if available
    if (includeShopId && this.config.shopId) {
      params.append('shop_id', this.config.shopId)
    } else if (includeMerchantId && this.config.merchantId) {
      params.append('merchant_id', this.config.merchantId)
    }

    // Generate signature according to v2 pattern
    const signature = this.generateV2Signature(apiPath, timestamp, {
      includeAccessToken,
      includeShopId,
      includeMerchantId,
      method
    })
    params.append('sign', signature)

    // Add access token if required by endpoint
    if (includeAccessToken && this.config.accessToken) {
      params.append('access_token', this.config.accessToken)
    }

    const url = `${baseUrl}${apiPath}?${params.toString()}`

    // Check rate limiting
    const rateLimitKey = endpoint
    if (await this.isRateLimited(rateLimitKey)) {
      return {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Rate limit exceeded. Please try again later.',
          retryable: true
        }
      }
    }

    // Implement retry logic
    const retryConfig: RetryConfig = {
      maxAttempts: this.config.retryAttempts || 3,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      backoffMultiplier: 2
    }

    return this.executeWithRetry<T>(url, method, body, retryConfig, idempotencyKey)
  }

  /**
   * Check if we're rate limited for a specific endpoint
   */
  private async isRateLimited(endpoint: string): Promise<boolean> {
    const limiter = this.rateLimiters.get(endpoint)
    if (!limiter) return false

    const now = new Date()
    if (now >= limiter.resetAt) {
      // Reset rate limit
      this.rateLimiters.delete(endpoint)
      return false
    }

    return limiter.remaining <= 0
  }

  /**
   * Update rate limit information
   */
  private updateRateLimit(endpoint: string, headers: Record<string, string>) {
    // Shopee v2 implements time-based rate limiting
    const rateLimitPerMinute = this.config.rateLimitPerMinute || 100
    
    const limiter = this.rateLimiters.get(endpoint) || {
      remaining: rateLimitPerMinute,
      resetAt: new Date(Date.now() + 60000) // Reset every minute
    }

    limiter.remaining -= 1
    this.rateLimiters.set(endpoint, limiter)
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    url: string,
    method: string,
    body: any,
    retryConfig: RetryConfig,
    idempotencyKey?: string
  ): Promise<ConnectorResponse<T>> {
    let lastError: ConnectorError | null = null

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(idempotencyKey && { 'X-Idempotency-Key': idempotencyKey }),
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(this.config.timeout || 30000)
        })

        // Update rate limit info
        this.updateRateLimit(url, {})

        const data: ShopeeV2ApiResponse<T> = await response.json()

        if (response.ok && data.success) {
          return {
            success: true,
            data: data.data,
            metadata: {
              requestId: data.request_id,
              timestamp: new Date()
            }
          }
        } else {
          const error = data.error || {
            code: 'UNKNOWN_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`,
            retryable: this.isRetryableError(response.status)
          }

          lastError = {
            ...error,
            httpStatusCode: response.status,
            retryable: 'retryable' in error ? error.retryable : this.isRetryableError(response.status)
          }

          // If not retryable, break immediately
          if (!lastError.retryable || attempt === retryConfig.maxAttempts) {
            break
          }

          // Wait before retry with exponential backoff
          const delay = Math.min(
            retryConfig.baseDelayMs * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
            retryConfig.maxDelayMs
          )
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      } catch (error) {
        lastError = {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
          retryable: true
        }

        if (attempt === retryConfig.maxAttempts) break

        const delay = Math.min(
          retryConfig.baseDelayMs * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelayMs
        )
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    return {
      success: false,
      error: lastError || {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        retryable: false
      }
    }
  }

  /**
   * Determine if error is retryable
   */
  private isRetryableError(statusCode: number): boolean {
    // Retry on server errors and rate limits
    return statusCode >= 500 || statusCode === 429
  }

  // =============================================================================
  // V2 ENDPOINTS (Phase 3 Minimal Set for Smoke Tests)
  // =============================================================================

  /**
   * GET /api/v2/shop/get_shop_info - Get shop information
   */
  async getShopInfo(): Promise<ConnectorResponse<any>> {
    return this.request('/api/v2/shop/get_shop_info', {
      method: 'GET',
      includeShopId: true
    })
  }

  /**
   * GET /api/v2/product/get_item_list - Get product list
   */
  async getItemList(params?: {
    page_size?: number
    page_no?: number
    item_status?: string
  }): Promise<ConnectorResponse<any>> {
    return this.request('/api/v2/product/get_item_list', {
      method: 'GET',
      query: params,
      includeShopId: true,
      includeAccessToken: true
    })
  }

  /**
   * GET /api/v2/order/get_order_list - Get order list
   */
  async getOrderList(params?: {
    page_size?: number
    page_no?: number
    order_status?: string
    create_time_from?: number
    create_time_to?: number
  }): Promise<ConnectorResponse<any>> {
    return this.request('/api/v2/order/get_order_list', {
      method: 'GET',
      query: params,
      includeShopId: true,
      includeAccessToken: true
    })
  }

  // =============================================================================
  // V2 WEBHOOK SIGNATURE VERIFICATION
  // =============================================================================

  /**
   * Verify v2 webhook signature from Shopee
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.config.partnerKey)
        .update(payload)
        .digest('hex')
      
      return expectedSignature === signature
    } catch (error) {
      console.error('Error verifying v2 webhook signature:', error)
      return false
    }
  }

  // =============================================================================
  // IDEMPOTENCY HELPERS
  // =============================================================================

  /**
   * Generate idempotency key for request
   */
  generateIdempotencyKey(): IdempotencyKey {
    const key = crypto.randomUUID()
    return {
      key,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
  }

  /**
   * Check if idempotency key is expired
   */
  isIdempotencyKeyExpired(idempotencyKey: IdempotencyKey): boolean {
    return new Date() > idempotencyKey.expiresAt
  }

  // =============================================================================
  // GETTERS
  // =============================================================================

  getConfig(): ShopeeV2ClientConfig {
    return { ...this.config }
  }

  getShopId(): string | undefined {
    return this.config.shopId
  }

  getPartnerId(): string {
    return this.config.partnerId
  }

  getBaseUrl(): string {
    return this.config.baseUrl
  }
}

// =============================================================================
// V2 CLIENT FACTORY
// =============================================================================

/**
 * Create Shopee v2 client from environment variables
 * Uses the proper v2 configuration pattern
 */
export function createShopeeV2Client(): ShopeeV2Client {
  const config: ShopeeV2ClientConfig = {
    baseUrl: process.env.SHOPEE_BASE_URL || 'https://partner.shopeemobile.com/api/v2',
    partnerId: process.env.SHOPEE_PARTNER_ID || '',
    partnerKey: process.env.SHOPEE_PARTNER_KEY || '',
    shopId: process.env.SHOPEE_SHOP_ID || undefined,
    accessToken: process.env.SHOPEE_ACCESS_TOKEN || undefined,
    timeout: 30000,
    retryAttempts: 3,
    rateLimitPerMinute: 100
  }

  // Validate required configuration for v2
  if (!config.partnerId || !config.partnerKey) {
    throw new Error('Missing required Shopee v2 credentials. Please check SHOPEE_PARTNER_ID and SHOPEE_PARTNER_KEY.')
  }

  return new ShopeeV2Client(config)
}

// =============================================================================
// STANDALONE V2 WEBHOOK SIGNATURE VERIFICATION
// =============================================================================

/**
 * Verify v2 webhook signature from Shopee (standalone function)
 * Used by webhook handlers without needing to instantiate a client
 */
export function verifyShopeeV2Signature(payload: string, signature: string): boolean {
  const partnerKey = process.env.SHOPEE_PARTNER_KEY
  if (!partnerKey) {
    console.error('SHOPEE_PARTNER_KEY not found in environment')
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', partnerKey)
      .update(payload)
      .digest('hex')
    
    return expectedSignature === signature
  } catch (error) {
    console.error('Error verifying Shopee v2 webhook signature:', error)
    return false
  }
}

export default ShopeeV2Client