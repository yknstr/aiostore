/**
 * Shopee Connector Client
 * 
 * Handles HMAC authentication, API communication, and base operations
 * for the Shopee platform API.
 * 
 * Shopee API Reference: https://shopee.github.io/shopee-marathon-api/
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
// SHOPEE CLIENT CONFIGURATION
// =============================================================================

export interface ShopeeClientConfig extends ConnectorConfig {
  baseUrl: string
  partnerId: string
  partnerKey: string
  shopId: string
  accessToken: string
}

export interface ShopeeApiResponse<T = any> {
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
// SHOPEE CLIENT CLASS
// =============================================================================

export class ShopeeClient {
  private config: ShopeeClientConfig
  private rateLimiters: Map<string, { remaining: number; resetAt: Date }> = new Map()
  
  constructor(config: ShopeeClientConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      rateLimitPerMinute: 100,
      ...config
    }
  }

  // =============================================================================
  // HMAC SIGNATURE GENERATION
  // =============================================================================

  /**
   * Generate HMAC-SHA256 signature for Shopee API requests
   */
  private generateSignature(
    path: string, 
    timestamp: string, 
    method: string = 'POST'
  ): string {
    const message = `${timestamp}${method}${path}`
    const signature = crypto
      .createHmac('sha256', this.config.partnerKey)
      .update(message)
      .digest('hex')
    
    return signature
  }

  /**
   * Generate access token signature for certain endpoints
   */
  private generateAccessTokenSignature(): string {
    const message = `${this.config.accessToken}${this.config.partnerId}${this.config.shopId}`
    return crypto
      .createHmac('sha256', this.config.partnerKey)
      .update(message)
      .digest('hex')
  }

  /**
   * Get current timestamp for API calls (ISO 8601 format)
   */
  private getTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString()
  }

  // =============================================================================
  // HTTP CLIENT WITH RETRY AND RATE LIMITING
  // =============================================================================

  /**
   * Make authenticated API request to Shopee
   */
  async request<T = any>(
    endpoint: string, 
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: any
      query?: Record<string, any>
      idempotencyKey?: string
    } = {}
  ): Promise<ConnectorResponse<T>> {
    const {
      method = 'POST',
      body,
      query,
      idempotencyKey
    } = options

    const baseUrl = this.config.baseUrl
    const timestamp = this.getTimestamp()
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    
    // Build query parameters
    const params = new URLSearchParams({
      partner_id: this.config.partnerId,
      timestamp,
      shop_id: this.config.shopId,
      ...query
    })

    // Add access token signature for certain endpoints
    if (this.shouldIncludeAccessToken(endpoint)) {
      const accessTokenSignature = this.generateAccessTokenSignature()
      params.append('access_token', this.config.accessToken)
      params.append('sign', accessTokenSignature)
    } else {
      const signature = this.generateSignature(path + '?' + params.toString(), timestamp, method)
      params.append('sign', signature)
    }

    const url = `${baseUrl}${path}?${params.toString()}`

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
   * Check if endpoint requires access token signature
   */
  private shouldIncludeAccessToken(endpoint: string): boolean {
    const requiresAccessToken = [
      '/api/v1/orders/basics',
      '/api/v1/orders/detail',
      '/api/v1/orders/items',
      '/api/v1/logistics/carrier',
      '/api/v1/shops/safe_mode',
      '/api/v1/shops/profile'
    ]
    
    return requiresAccessToken.some(path => endpoint.startsWith(path))
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
    // Shopee doesn't provide explicit rate limit headers, 
    // so we'll implement a simple time-based rate limiter
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

        const data: ShopeeApiResponse<T> = await response.json()

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
  // API HEALTH CHECK
  // =============================================================================

  /**
   * Test API connectivity
   */
  async healthCheck(): Promise<ConnectorResponse<{ status: 'healthy' | 'unhealthy'; message?: string }>> {
    try {
      // Try to call a simple endpoint that doesn't require complex parameters
      const response = await this.request('/api/v1/shops/profile')
      
      if (response.success) {
        return {
          success: true,
          data: {
            status: 'healthy' as const,
            message: 'Shopee API connection successful'
          }
        }
      } else {
        return {
          success: false,
          data: {
            status: 'unhealthy' as const,
            message: response.error?.message || 'Unknown error'
          },
          error: response.error
        }
      }
    } catch (error) {
      return {
        success: false,
        data: {
          status: 'unhealthy' as const,
          message: error instanceof Error ? error.message : 'Connection failed'
        },
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: error instanceof Error ? error.message : 'Health check failed',
          retryable: false
        }
      }
    }
  }

  // =============================================================================
  // WEBHOOK SIGNATURE VERIFICATION
  // =============================================================================

  /**
   * Verify webhook signature from Shopee
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.config.partnerKey)
        .update(payload)
        .digest('hex')
      
      return expectedSignature === signature
    } catch (error) {
      console.error('Error verifying webhook signature:', error)
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

  getConfig(): ShopeeClientConfig {
    return { ...this.config }
  }

  getShopId(): string {
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
// CLIENT FACTORY
// =============================================================================

/**
 * Create Shopee client from environment variables
 */
export function createShopeeClient(): ShopeeClient {
  const config: ShopeeClientConfig = {
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
  if (!config.partnerId || !config.partnerKey || !config.shopId || !config.accessToken) {
    throw new Error('Missing required Shopee credentials. Please check environment variables.')
  }

  return new ShopeeClient(config)
}

// =============================================================================
// STANDALONE WEBHOOK SIGNATURE VERIFICATION
// =============================================================================

/**
 * Verify webhook signature from Shopee (standalone function)
 * Used by webhook handlers without needing to instantiate a client
 */
export function verifyShopeeSignature(payload: string, signature: string): boolean {
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
    console.error('Error verifying Shopee webhook signature:', error)
    return false
  }
}

export default ShopeeClient