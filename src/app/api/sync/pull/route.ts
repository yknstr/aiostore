/**
 * Sync Pull API Route
 * 
 * POST /api/sync/pull
 * 
 * Triggers pull jobs to fetch data from external platforms.
 * Supports pulling products, orders, stock levels, and other data.
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncJobsService } from '@/services/sync-jobs-service'
import { channelsService } from '@/services/channels-service'

// =============================================================================
// REQUEST/_RESPONSE TYPES
// =============================================================================

interface SyncPullRequest {
  jobType: 'catalog' | 'orders' | 'stock' | 'prices' | 'full'
  channel?: string
  accountId?: string
  options?: {
    since?: string // ISO date string
    limit?: number
    force?: boolean
    filters?: Record<string, any>
  }
  idempotencyKey?: string
  dryRun?: boolean
}

interface SyncPullResponse {
  success: boolean
  jobsCreated: string[]
  summary: {
    totalAccounts: number
    successful: number
    failed: number
    accountBreakdown: Array<{
      accountId: string
      accountName: string
      channel: string
      status: 'queued' | 'failed'
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
    
    console.log('[SyncPull] Request received:', {
      jobType: body.jobType,
      channel: body.channel,
      accountId: body.accountId,
      idempotencyKey,
      dryRun: body.dryRun
    })

    // Validate request
    const validation = validateSyncPullRequest(body)
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request',
        details: validation.errors
      }, { status: 400 })
    }

    // Process sync pull
    const result = await processSyncPull(body as SyncPullRequest, idempotencyKey)

    const processingTime = Date.now() - startTime
    console.log(`[SyncPull] Completed in ${processingTime}ms:`, {
      success: result.success,
      jobsCreated: result.jobsCreated.length,
      accountsProcessed: result.summary.totalAccounts
    })

    return NextResponse.json({
      ...result,
      processingTime
    })

  } catch (error) {
    console.error('[SyncPull] Processing error:', error)
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

function validateSyncPullRequest(body: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check required fields
  if (!body.jobType || !['catalog', 'orders', 'stock', 'prices', 'full'].includes(body.jobType)) {
    errors.push('jobType must be one of: catalog, orders, stock, prices, full')
  }

  // Validate options if provided
  if (body.options) {
    if (body.options.limit && (typeof body.options.limit !== 'number' || body.options.limit < 1)) {
      errors.push('options.limit must be a positive number')
    }
    if (body.options.since && isNaN(Date.parse(body.options.since))) {
      errors.push('options.since must be a valid ISO date string')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// =============================================================================
// SYNC PULL PROCESSING
// =============================================================================

async function processSyncPull(
  request: SyncPullRequest, 
  idempotencyKey?: string
): Promise<SyncPullResponse> {
  const jobsCreated: string[] = []
  const summary = {
    totalAccounts: 0,
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

  // Create jobs for each account
  for (const account of accounts) {
    try {
      if (request.dryRun) {
        console.log(`[SyncPull] [DRY-RUN] Would create ${request.jobType} pull job for account ${account.id}`)
        summary.successful++
        summary.accountBreakdown.push({
          accountId: account.id,
          accountName: account.shopName,
          channel: account.channel,
          status: 'queued'
        })
      } else {
        const jobId = await createPullJob(account, request, idempotencyKey)
        jobsCreated.push(jobId)
        summary.successful++
        summary.accountBreakdown.push({
          accountId: account.id,
          accountName: account.shopName,
          channel: account.channel,
          status: 'queued'
        })
      }
    } catch (error) {
      console.error(`[SyncPull] Error creating job for account ${account.id}:`, error)
      summary.failed++
      summary.accountBreakdown.push({
        accountId: account.id,
        accountName: account.shopName,
        channel: account.channel,
        status: 'failed',
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
// ACCOUNT SELECTION
// =============================================================================

async function getTargetAccounts(request: SyncPullRequest) {
  // If specific account ID provided
  if (request.accountId) {
    const account = await channelsService.getChannelAccount(request.accountId)
    return account ? [account] : []
  }

  // If specific channel provided
  if (request.channel) {
    return await channelsService.listChannelAccounts({
      channel: request.channel as any,
      status: 'active'
    })
  }

  // Get all active accounts
  return await channelsService.listChannelAccounts({ status: 'active' })
}

// =============================================================================
// JOB CREATION
// =============================================================================

async function createPullJob(
  account: any, 
  request: SyncPullRequest, 
  idempotencyKey?: string
): Promise<string> {
  const jobData = {
    accountId: account.id,
    jobType: request.jobType,
    operation: 'pull',
    data: {
      jobType: request.jobType,
      channel: account.channel,
      accountId: account.id,
      accountName: account.shopName,
      options: request.options || {},
      triggeredBy: 'api',
      triggerTime: new Date().toISOString()
    },
    idempotencyKey: idempotencyKey ? `${idempotencyKey}_${account.id}_${request.jobType}` : undefined,
    priority: request.jobType === 'full' ? 'high' : 'normal'
  }

  const jobId = await syncJobsService.queuePullJob('sync_pull', jobData as any)
  console.log(`[SyncPull] Created pull job ${jobId} for account ${account.id}`)
  
  return jobId
}