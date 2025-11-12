/**
 * Sync Jobs Service
 * 
 * Handles background synchronization jobs between AIOStore and e-commerce platforms.
 * Supports pull, push, and sync operations with retry logic, rate limiting,
 * and comprehensive error handling.
 */

import { supabase } from '@/lib/supabase'
import { featureFlags } from '@/lib/data-sources'
import { createShopeeConnector } from '@/connectors/shopee'
import crypto from 'crypto'

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface SyncJob {
  id: string
  type: 'pull' | 'push' | 'sync'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  channel: string
  channelAccountId?: string
  totalItems: number
  completedItems: number
  failedItems: number
  startedAt?: Date
  completedAt?: Date
  errorMessage?: string
  metadata: any
  createdAt: Date
  updatedAt: Date
}

interface SyncJobItem {
  id: string
  jobId: string
  itemType: 'product' | 'order' | 'stock' | 'price'
  itemId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  attempts: number
  maxAttempts: number
  nextRetryAt?: Date
  errorMessage?: string
  metadata: any
  createdAt: Date
  updatedAt: Date
}

interface SyncLog {
  id: string
  jobId?: string
  level: 'info' | 'warning' | 'error'
  message: string
  details?: any
  createdAt: Date
}

interface JobQueueOptions {
  priority?: 'low' | 'normal' | 'high'
  maxConcurrency?: number
  retryAttempts?: number
  rateLimitPerMinute?: number
}

// =============================================================================
// SYNC JOBS SERVICE CLASS
// =============================================================================

export class SyncJobsService {
  private logPrefix = '[SyncJobsService]'

  // =============================================================================
  // JOB CREATION AND QUEUING
  // =============================================================================

  /**
   * Create and queue a new sync job
   */
  async createJob(jobData: {
    type: 'pull' | 'push' | 'sync'
    channel: string
    channelAccountId?: string
    items: Array<{
      type: 'product' | 'order' | 'stock' | 'price'
      id: string
      data?: any
    }>
    metadata?: any
    options?: JobQueueOptions
  }): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      // Generate unique job ID
      const jobId = `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`

      // Create main job record
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          id: jobId,
          type: jobData.type,
          status: 'pending',
          channel: jobData.channel,
          channel_account_id: jobData.channelAccountId,
          total_items: jobData.items.length,
          completed_items: 0,
          failed_items: 0,
          metadata: jobData.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (jobError) {
        throw new Error(`Failed to create job: ${jobError.message}`)
      }

      // Create job items
      const jobItems = jobData.items.map((item, index) => ({
        id: `${jobId}_item_${index}`,
        job_id: jobId,
        item_type: item.type,
        item_id: item.id,
        status: 'pending',
        attempts: 0,
        max_attempts: jobData.options?.retryAttempts || 3,
        metadata: item.data || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { error: itemsError } = await supabase
        .from('job_items')
        .insert(jobItems)

      if (itemsError) {
        throw new Error(`Failed to create job items: ${itemsError.message}`)
      }

      // Log job creation
      await this.logJobEvent(jobId, 'info', `Job created: ${jobData.type} ${jobData.channel} with ${jobData.items.length} items`)

      console.log(`${this.logPrefix} Created job ${jobId}: ${jobData.type} ${jobData.channel}`)

      return {
        success: true,
        jobId
      }

    } catch (error) {
      console.error(`${this.logPrefix} Error creating job:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Queue pull job to sync data from platform to AIOStore
   */
  async queuePullJob(channel: string, dataType: 'products' | 'orders' | 'customers', params?: any): Promise<string> {
    const jobId = `pull_${channel}_${dataType}_${Date.now()}`
    
    // Determine what items to pull based on data type
    const items = await this.getItemsForPull(channel, dataType, params)
    
    const result = await this.createJob({
      type: 'pull',
      channel,
      items,
      metadata: {
        dataType,
        params,
        startedBy: 'system' // or user ID
      }
    })

    if (!result.success) {
      throw new Error(`Failed to queue pull job: ${result.error}`)
    }

    return result.jobId!
  }

  /**
   * Queue push job to sync data from AIOStore to platform
   */
  async queuePushJob(channel: string, dataType: 'products' | 'orders' | 'stock' | 'prices', itemIds: string[]): Promise<string> {
    const jobId = `push_${channel}_${dataType}_${Date.now()}`
    
    const items = await this.getItemsForPush(channel, dataType, itemIds)
    
    const result = await this.createJob({
      type: 'push',
      channel,
      items,
      metadata: {
        dataType,
        itemIds,
        startedBy: 'system' // or user ID
      }
    })

    if (!result.success) {
      throw new Error(`Failed to queue push job: ${result.error}`)
    }

    return result.jobId!
  }

  /**
   * Queue bi-directional sync job
   */
  async queueSyncJob(channel: string, options?: {
    pullProducts?: boolean
    pullOrders?: boolean
    pushUpdates?: boolean
    resolveConflicts?: boolean
  }): Promise<string> {
    const jobId = `sync_${channel}_${Date.now()}`
    const items: any[] = []

    if (options?.pullProducts) {
      const productItems = await this.getItemsForPull(channel, 'products', {})
      items.push(...productItems)
    }

    if (options?.pullOrders) {
      const orderItems = await this.getItemsForPull(channel, 'orders', {})
      items.push(...orderItems)
    }

    // Add sync-specific job items
    items.push({
      type: 'product' as const,
      id: 'sync_products',
      data: { action: 'bidirectional_sync' }
    })

    const result = await this.createJob({
      type: 'sync',
      channel,
      items,
      metadata: {
        options,
        startedBy: 'system'
      }
    })

    if (!result.success) {
      throw new Error(`Failed to queue sync job: ${result.error}`)
    }

    return result.jobId!
  }

  // =============================================================================
  // JOB PROCESSING
  // =============================================================================

  /**
   * Process pending jobs (should be called by a job processor/worker)
   */
  async processJobs(maxConcurrency = 3): Promise<void> {
    try {
      // Get pending jobs (limit concurrency)
      const { data: pendingJobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(maxConcurrency)

      if (error) {
        throw new Error(`Failed to fetch pending jobs: ${error.message}`)
      }

      if (!pendingJobs || pendingJobs.length === 0) {
        return
      }

      console.log(`${this.logPrefix} Processing ${pendingJobs.length} jobs`)

      // Process jobs concurrently (respecting concurrency limit)
      const promises = pendingJobs.map(job => this.processJob(job))
      await Promise.allSettled(promises)

    } catch (error) {
      console.error(`${this.logPrefix} Error processing jobs:`, error)
    }
  }

  /**
   * Process a single job
   */
  async processJob(job: SyncJob): Promise<void> {
    const startTime = Date.now()
    
    try {
      console.log(`${this.logPrefix} Processing job ${job.id} (${job.type})`)

      // Update job status to running
      await this.updateJobStatus(job.id, 'running', {
        startedAt: new Date()
      })

      await this.logJobEvent(job.id, 'info', `Started processing job`)

      // Get job items
      const { data: jobItems, error } = await supabase
        .from('job_items')
        .select('*')
        .eq('job_id', job.id)
        .order('created_at', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch job items: ${error.message}`)
      }

      if (!jobItems || jobItems.length === 0) {
        throw new Error('No job items found')
      }

      // Process job items
      const results = await Promise.allSettled(
        jobItems.map(item => this.processJobItem(job, item))
      )

      // Count results
      const completed = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      // Update job completion
      await this.updateJobStatus(job.id, 'completed', {
        completedAt: new Date(),
        completed_items: completed,
        failed_items: failed
      })

      await this.logJobEvent(job.id, 'info', `Job completed: ${completed} successful, ${failed} failed`, {
        processingTime: Date.now() - startTime
      })

      console.log(`${this.logPrefix} Job ${job.id} completed in ${Date.now() - startTime}ms`)

    } catch (error) {
      console.error(`${this.logPrefix} Error processing job ${job.id}:`, error)

      await this.updateJobStatus(job.id, 'failed', {
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })

      await this.logJobEvent(job.id, 'error', `Job failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        processingTime: Date.now() - startTime
      })
    }
  }

  /**
   * Process a single job item
   */
  async processJobItem(job: SyncJob, jobItem: SyncJobItem): Promise<void> {
    try {
      // Update item status to processing
      await this.updateJobItemStatus(jobItem.id, 'processing')

      // Execute the sync operation based on job type and item type
      let result: boolean

      switch (job.type) {
        case 'pull':
          result = await this.processPullItem(job, jobItem)
          break
        
        case 'push':
          result = await this.processPushItem(job, jobItem)
          break
        
        case 'sync':
          result = await this.processSyncItem(job, jobItem)
          break
        
        default:
          throw new Error(`Unsupported job type: ${job.type}`)
      }

      if (result) {
        await this.updateJobItemStatus(jobItem.id, 'completed')
        await this.logJobEvent(job.id, 'info', `Successfully processed ${jobItem.itemType} ${jobItem.itemId}`)
      } else {
        throw new Error('Operation failed without specific error')
      }

    } catch (error) {
      console.error(`${this.logPrefix} Error processing job item ${jobItem.id}:`, error)
      
      const attempts = jobItem.attempts + 1
      
      if (attempts < jobItem.maxAttempts) {
        // Schedule retry with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, attempts), 300000) // Max 5 minutes
        const nextRetryAt = new Date(Date.now() + retryDelay)

        await this.updateJobItemStatus(jobItem.id, 'pending', {
          attempts,
          nextRetryAt,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        })

        await this.logJobEvent(job.id, 'warning', `Item ${jobItem.itemId} failed, retrying in ${retryDelay}ms (attempt ${attempts}/${jobItem.maxAttempts})`)
      } else {
        // Max attempts reached, mark as failed
        await this.updateJobItemStatus(jobItem.id, 'failed', {
          attempts,
          errorMessage: error instanceof Error ? error.message : 'Max retries exceeded'
        })

        await this.logJobEvent(job.id, 'error', `Item ${jobItem.itemId} failed after ${attempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  // =============================================================================
  // ITEM PROCESSING HELPERS
  // =============================================================================

  /**
   * Process pull item (from platform to AIOStore)
   */
  private async processPullItem(job: SyncJob, jobItem: SyncJobItem): Promise<boolean> {
    try {
      switch (jobItem.itemType) {
        case 'product':
          return await this.pullProduct(job.channel, jobItem.itemId)
        
        case 'order':
          return await this.pullOrder(job.channel, jobItem.itemId)
        
        default:
          throw new Error(`Unsupported pull item type: ${jobItem.itemType}`)
      }
    } catch (error) {
      throw new Error(`Pull operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process push item (from AIOStore to platform)
   */
  private async processPushItem(job: SyncJob, jobItem: SyncJobItem): Promise<boolean> {
    try {
      switch (jobItem.itemType) {
        case 'product':
          return await this.pushProduct(job.channel, jobItem.itemId, jobItem.metadata)
        
        case 'stock':
          return await this.pushStock(job.channel, jobItem.itemId, jobItem.metadata)
        
        case 'price':
          return await this.pushPrice(job.channel, jobItem.itemId, jobItem.metadata)
        
        default:
          throw new Error(`Unsupported push item type: ${jobItem.itemType}`)
      }
    } catch (error) {
      throw new Error(`Push operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process sync item (bi-directional sync)
   */
  private async processSyncItem(job: SyncJob, jobItem: SyncJobItem): Promise<boolean> {
    try {
      // For sync operations, we compare versions and update the older one
      const localData = await this.getLocalData(jobItem.itemType, jobItem.itemId)
      const platformData = await this.getPlatformData(job.channel, jobItem.itemType, jobItem.itemId)

      // Simple conflict resolution: last updated wins
      const localUpdated = new Date(localData?.updated_at || 0)
      const platformUpdated = new Date(platformData?.updated_at || 0)

      if (localUpdated > platformUpdated) {
        // Update platform with local data
        return await this.pushProduct(job.channel, jobItem.itemId, localData)
      } else if (platformUpdated > localUpdated) {
        // Update local with platform data
        return await this.pullProduct(job.channel, jobItem.itemId)
      } else {
        // No conflicts, consider successful
        return true
      }
    } catch (error) {
      throw new Error(`Sync operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // =============================================================================
  // PLATFORM-SPECIFIC OPERATIONS
  // =============================================================================

  /**
   * Pull product from platform
   */
  private async pullProduct(channel: string, productId: string): Promise<boolean> {
    try {
      if (channel === 'shopee') {
        const connector = createShopeeConnector()
        const response = await connector.getProduct(productId)
        
        if (response.success && response.data) {
          // Update or insert product in AIOStore database
          const { error } = await supabase
            .from('products')
            .upsert({
              id: response.data.id,
              sku: response.data.title.toLowerCase().replace(/\s+/g, '-'),
              name: response.data.title,
              description: response.data.description,
              category: response.data.category,
              price: response.data.price,
              stock: response.data.stock,
              status: response.data.status,
              platforms: [{
                platform: 'shopee',
                platformProductId: response.data.id,
                isPublished: true,
                lastSynced: new Date().toISOString()
              }],
              created_at: response.data.createdAt,
              updated_at: response.data.updatedAt
            })

          if (error) {
            throw error
          }

          return true
        } else {
          throw new Error(response.error?.message || 'Failed to get product from Shopee')
        }
      }

      // TODO: Add support for other channels
      throw new Error(`Channel ${channel} not supported yet`)

    } catch (error) {
      throw new Error(`Pull product failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Pull order from platform
   */
  private async pullOrder(channel: string, orderId: string): Promise<boolean> {
    try {
      if (channel === 'shopee') {
        const connector = createShopeeConnector()
        const response = await connector.getOrder(orderId)
        
        if (response.success && response.data) {
          // Update or insert order in AIOStore database
          const { error } = await supabase
            .from('orders')
            .upsert({
              id: response.data.id,
              order_number: response.data.orderNumber,
              platform: 'shopee',
              platform_order_id: response.data.platformOrderId,
              customer_name: response.data.customer.name,
              customer_email: response.data.customer.email,
              customer_phone: response.data.customer.phone,
              items: response.data.items,
              subtotal: response.data.items.reduce((sum, item) => sum + item.total, 0),
              total: response.data.totalAmount,
              order_status: response.data.status,
              payment_status: response.data.paymentStatus,
              order_date: response.data.orderDate,
              created_at: response.data.createdAt,
              updated_at: response.data.updatedAt
            })

          if (error) {
            throw error
          }

          return true
        } else {
          throw new Error(response.error?.message || 'Failed to get order from Shopee')
        }
      }

      throw new Error(`Channel ${channel} not supported yet`)

    } catch (error) {
      throw new Error(`Pull order failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Push product to platform
   */
  private async pushProduct(channel: string, productId: string, productData: any): Promise<boolean> {
    try {
      if (channel === 'shopee') {
        const connector = createShopeeConnector()
        const response = await connector.createProduct(productData)
        
        return response.success
      }

      throw new Error(`Channel ${channel} not supported yet`)

    } catch (error) {
      throw new Error(`Push product failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Push stock update to platform
   */
  private async pushStock(channel: string, productId: string, stockData: any): Promise<boolean> {
    try {
      if (channel === 'shopee') {
        const connector = createShopeeConnector()
        const response = await connector.updateStock(productId, stockData.stock)
        
        return response.success
      }

      throw new Error(`Channel ${channel} not supported yet`)

    } catch (error) {
      throw new Error(`Push stock failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Push price update to platform
   */
  private async pushPrice(channel: string, productId: string, priceData: any): Promise<boolean> {
    try {
      if (channel === 'shopee') {
        const connector = createShopeeConnector()
        const response = await connector.updatePrice(productId, priceData.price, priceData.compareAtPrice)
        
        return response.success
      }

      throw new Error(`Channel ${channel} not supported yet`)

    } catch (error) {
      throw new Error(`Push price failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<SyncJob | null> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) {
      console.error(`${this.logPrefix} Error fetching job ${jobId}:`, error)
      return null
    }

    return data
  }

  /**
   * Get job items for a job
   */
  async getJobItems(jobId: string): Promise<SyncJobItem[]> {
    const { data, error } = await supabase
      .from('job_items')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error(`${this.logPrefix} Error fetching job items for ${jobId}:`, error)
      return []
    }

    return data || []
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<boolean> {
    try {
      // Reset job status to pending and clear error
      const { error } = await supabase
        .from('jobs')
        .update({
          status: 'pending',
          error_message: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)

      if (error) {
        throw error
      }

      // Reset job items status to pending
      const { error: itemsError } = await supabase
        .from('job_items')
        .update({
          status: 'pending',
          error_message: null,
          next_retry_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('job_id', jobId)
        .eq('status', 'failed')

      if (itemsError) {
        throw itemsError
      }

      await this.logJobEvent(jobId, 'info', 'Job reset for retry')

      console.log(`${this.logPrefix} Job ${jobId} reset for retry`)

      return true

    } catch (error) {
      console.error(`${this.logPrefix} Error retrying job ${jobId}:`, error)
      return false
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          status: 'cancelled',
          completed_at: new Date(),
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .eq('status', 'pending')

      if (error) {
        throw error
      }

      await this.logJobEvent(jobId, 'info', 'Job cancelled')

      console.log(`${this.logPrefix} Job ${jobId} cancelled`)

      return true

    } catch (error) {
      console.error(`${this.logPrefix} Error cancelling job ${jobId}:`, error)
      return false
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  /**
   * Update job status
   */
  private async updateJobStatus(jobId: string, status: string, updates: any = {}): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .update({
        status,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    if (error) {
      throw new Error(`Failed to update job status: ${error.message}`)
    }
  }

  /**
   * Update job item status
   */
  private async updateJobItemStatus(itemId: string, status: string, updates: any = {}): Promise<void> {
    const { error } = await supabase
      .from('job_items')
      .update({
        status,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)

    if (error) {
      throw new Error(`Failed to update job item status: ${error.message}`)
    }
  }

  /**
   * Log job event
   */
  private async logJobEvent(jobId: string, level: 'info' | 'warning' | 'error', message: string, details?: any): Promise<void> {
    try {
      await supabase
        .from('sync_logs')
        .insert({
          job_id: jobId,
          level,
          message,
          details: details || {},
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error(`${this.logPrefix} Failed to log job event:`, error)
    }
  }

  /**
   * Get items for pull operation
   */
  private async getItemsForPull(channel: string, dataType: string, params: any): Promise<any[]> {
    // This would fetch items from the platform that need to be pulled
    // For now, return empty array - would be implemented based on platform API
    return []
  }

  /**
   * Get items for push operation
   */
  private async getItemsForPush(channel: string, dataType: string, itemIds: string[]): Promise<any[]> {
    // Get items from AIOStore database that need to be pushed
    const items: any[] = []

    for (const id of itemIds) {
      items.push({
        type: dataType === 'products' ? 'product' : 
              dataType === 'orders' ? 'order' : 'product',
        id,
        data: await this.getLocalData(dataType === 'products' ? 'product' : 'product', id)
      })
    }

    return items
  }

  /**
   * Get local data
   */
  private async getLocalData(itemType: string, itemId: string): Promise<any> {
    const tableName = itemType === 'product' ? 'products' : 'orders'
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', itemId)
      .single()

    if (error) {
      return null
    }

    return data
  }

  /**
   * Get platform data
   */
  private async getPlatformData(channel: string, itemType: string, itemId: string): Promise<any> {
    // This would fetch from the platform API
    // For now, return null
    return null
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const syncJobsService = new SyncJobsService()

export default SyncJobsService