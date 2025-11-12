/**
 * Sync Push API Route
 * 
 * POST /api/sync/push
 * 
 * Triggers push jobs to send data to external platforms.
 * Supports pushing products, stock updates, price changes, and other data.
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncJobsService } from '@/services/sync-jobs-service'
import { channelsService } from '@/services/channels-service'
import { listingsService } from '@/services/listings-service'

// =============================================================================
// REQUEST/_RESPONSE TYPES
// =============================================================================

interface SyncPushRequest {
  jobType: 'catalog' | 'stock' | 'prices' | 'orders' | 'full'
  data?: {
    productIds?: string[]
    listingIds?: string[]
    orderIds?: string[]
    customData?: Record<string, any>
  }
  targetAccounts?: string[] // Specific accounts to push to
  options?: {
    force?: boolean
    batchSize?: number
    priority?: 'low' | 'normal' | 'high'
    retryFailed?: boolean
  }
  idempotencyKey?: string
  dryRun?: boolean
}

interface SyncPushResponse {
  success: boolean
  jobsCreated: string[]
  summary: {
    totalAccounts: number
    totalItems: number
    successful: number
    failed: number
    accountBreakdown: Array<{
      accountId: string
      accountName: string
      channel: string
      status: 'queued' | 'failed'
      itemsQueued: number
      error?: string
    }>
  }
  idempotencyKey?: string
  dryRun: boolean
  processingTime: number
}

// =============================================================================
// MAIN API HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const idempotencyKey = request.headers.get('idempotency-key') || body.idempotencyKey
    
    console.log('[SyncPush] Request received:', {
      jobType: body.jobType,
      targetAccounts: body.targetAccounts?.length || 0,
      dataItems: body.data ? Object.keys(body.data).reduce((sum, key) => sum + (body.data[key]?.length || 0), 0) : 0,
      idempotencyKey,
      dryRun: body.dryRun
    })

    // Validate request
    const validation = validateSyncPushRequest(body)
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request',
        details: validation.errors
      }, { status: 400 })
    }

    // Process sync push
    const result = await processSyncPush(body as SyncPushRequest, idempotencyKey)

    const processingTime = Date.now() - startTime
    console.log(`[SyncPush] Completed in ${processingTime}ms:`, {
      success: result.success,
      jobsCreated: result.jobsCreated.length,
      accountsProcessed: result.summary.totalAccounts,
      itemsQueued: result.summary.totalItems
    })

    return NextResponse.json({
      ...result,
      processingTime
    })

  } catch (error) {
    console.error('[SyncPush] Processing error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// =============================================================================
// REQUEST VALIDATION
// =============================================================================

function validateSyncPushRequest(body: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check required fields
  if (!body.jobType || !['catalog', 'stock', 'prices', 'orders', 'full'].includes(body.jobType)) {
    errors.push('jobType must be one of: catalog, stock, prices, orders, full')
  }

  // Validate data if provided
  if (body.data) {
    const hasData = Object.keys(body.data).some(key => 
      body.data[key] && Array.isArray(body.data[key]) && body.data[key].length > 0
    )
    if (!hasData) {
      errors.push('At least one data array must be provided and non-empty')
    }

    // Validate specific arrays
    if (body.data.productIds) {
      if (!Array.isArray(body.data.productIds) || body.data.productIds.some((id: any) => typeof id !== 'string')) {
        errors.push('productIds must be an array of strings')
      }
    }
    if (body.data.listingIds) {
      if (!Array.isArray(body.data.listingIds) || body.data.listingIds.some((id: any) => typeof id !== 'string')) {
        errors.push('listingIds must be an array of strings')
      }
    }
  }

  // Validate options if provided
  if (body.options) {
    if (body.options.batchSize && (typeof body.options.batchSize !== 'number' || body.options.batchSize < 1)) {
      errors.push('options.batchSize must be a positive number')
    }
    if (body.options.priority && !['low', 'normal', 'high'].includes(body.options.priority)) {
      errors.push('options.priority must be one of: low, normal, high')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// =============================================================================
// SYNC PUSH PROCESSING
// =============================================================================

async function processSyncPush(
  request: SyncPushRequest, 
  idempotencyKey?: string
): Promise<SyncPushResponse> {
  const jobsCreated: string[] = []
  const summary = {
    totalAccounts: 0,
    totalItems: 0,
    successful: 0,
    failed: 0,
    accountBreakdown: [] as any[]
  }

  // Get target accounts
  const accounts = await getTargetAccounts(request)
  summary.totalAccounts = accounts.length

  if (accounts.length === 0) {
    return {
      success: false,
      jobsCreated,
      summary,
      idempotencyKey,
      dryRun: request.dryRun || false,
      processingTime: 0
    }
  }

  // Get data to push
  const pushData = await getPushData(request)
  summary.totalItems = Object.values(pushData).reduce((sum, arr) => sum + arr.length, 0)

  if (summary.totalItems === 0) {
    return {
      success: false,
      jobsCreated,
      summary: { ...summary, totalAccounts: 0 },
      idempotencyKey,
      dryRun: request.dryRun || false,
      processingTime: 0
    }
  }

  // Create jobs for each account
  for (const account of accounts) {
    try {
      if (request.dryRun) {
        console.log(`[SyncPush] [DRY-RUN] Would create ${request.jobType} push job for account ${account.id}`)
        summary.successful++
        summary.accountBreakdown.push({
          accountId: account.id,
          accountName: account.shopName,
          channel: account.channel,
          status: 'queued',
          itemsQueued: summary.totalItems
        })
      } else {
        const jobId = await createPushJob(account, request, pushData, idempotencyKey)
        jobsCreated.push(jobId)
        summary.successful++
        summary.accountBreakdown.push({
          accountId: account.id,
          accountName: account.shopName,
          channel: account.channel,
          status: 'queued',
          itemsQueued: summary.totalItems
        })
      }
    } catch (error) {
      console.error(`[SyncPush] Error creating job for account ${account.id}:`, error)
      summary.failed++
      summary.accountBreakdown.push({
        accountId: account.id,
        accountName: account.shopName,
        channel: account.channel,
        status: 'failed',
        itemsQueued: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return {
    success: summary.failed === 0,
    jobsCreated,
    summary,
    idempotencyKey,
    dryRun: request.dryRun || false,
    processingTime: 0
  }
}

// =============================================================================
// ACCOUNT AND DATA SELECTION
// =============================================================================

async function getTargetAccounts(request: SyncPushRequest) {
  // If specific accounts provided
  if (request.targetAccounts && request.targetAccounts.length > 0) {
    const accounts = []
    for (const accountId of request.targetAccounts) {
      const account = await channelsService.getChannelAccount(accountId)
      if (account && account.status === 'active') {
        accounts.push(account)
      }
    }
    return accounts
  }

  // Get all active accounts that match the job type
  const allAccounts = await channelsService.listChannelAccounts({ status: 'active' })
  
  // Filter based on job type if needed
  switch (request.jobType) {
    case 'catalog':
      return allAccounts.filter(acc => acc.config.autoSync)
    case 'stock':
      return allAccounts.filter(acc => acc.config.stockSync)
    case 'prices':
      return allAccounts.filter(acc => acc.config.priceSync)
    default:
      return allAccounts
  }
}

async function getPushData(request: SyncPushRequest) {
  const pushData: Record<string, string[]> = {}

  // Get product IDs
  if (request.data?.productIds) {
    pushData.productIds = request.data.productIds
  }

  // Get listing IDs
  if (request.data?.listingIds) {
    pushData.listingIds = request.data.listingIds
  } else if (request.data?.productIds) {
    // If only product IDs provided, get associated listing IDs
    const listingIds = []
    for (const productId of request.data.productIds) {
      const listings = await listingsService.getListingsByProductId(productId)
      listingIds.push(...listings.map(l => l.id))
    }
    pushData.listingIds = listingIds
  }

  // Get order IDs
  if (request.data?.orderIds) {
    pushData.orderIds = request.data.orderIds
  }

  // Add custom data if provided
  if (request.data?.customData) {
    pushData.customData = Object.keys(request.data.customData)
  }

  return pushData
}

// =============================================================================
// JOB CREATION
// =============================================================================

async function createPushJob(
  account: any, 
  request: SyncPushRequest,
  pushData: Record<string, string[]>,
  idempotencyKey?: string
): Promise<string> {
  const jobData = {
    accountId: account.id,
    jobType: request.jobType,
    operation: 'push',
    data: {
      jobType: request.jobType,
      channel: account.channel,
      accountId: account.id,
      accountName: account.shopName,
      pushData,
      options: request.options || {},
      triggeredBy: 'api',
      triggerTime: new Date().toISOString()
    },
    idempotencyKey: idempotencyKey ? `${idempotencyKey}_${account.id}_${request.jobType}` : undefined,
    priority: request.options?.priority || 'normal'
  }

  const jobId = await syncJobsService.queuePushJob('sync_push', jobData.jobType as any, jobData as any)
  console.log(`[SyncPush] Created push job ${jobId} for account ${account.id}`)
  
  return jobId
}