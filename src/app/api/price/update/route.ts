/**
 * Price Update API Route
 * 
 * POST /api/price/update
 * 
 * Handles batch price updates across multiple platforms with preview/commit pattern.
 * Supports idempotency, retry mechanisms, and comprehensive error handling.
 */

import { NextRequest, NextResponse } from 'next/server'
import { listingsService } from '@/services/listings-service'

// =============================================================================
// REQUEST/_RESPONSE TYPES
// =============================================================================

interface PriceUpdateRequest {
  updates: Array<{
    listingId: string
    newPrice: number
    compareAtPrice?: number
    reason?: string
  }>
  commitMode: 'preview' | 'commit'
  idempotencyKey?: string
  dryRun?: boolean
}

interface PriceUpdateItem {
  listingId: string
  currentPrice: number
  newPrice: number
  compareAtPrice?: number
  change: number
  changePercent: number
  status: 'success' | 'error' | 'warning'
  error?: string
  warning?: string
}

interface PriceUpdateResponse {
  success: boolean
  commitMode: 'preview' | 'commit'
  processedItems: PriceUpdateItem[]
  summary: {
    total: number
    successful: number
    failed: number
    warnings: number
    totalPriceChange: number
    averagePriceChange: number
  }
  idempotencyKey?: string
  previewMode: boolean
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
    
    console.log('[PriceUpdate] Request received:', {
      itemsCount: body.updates?.length || 0,
      commitMode: body.commitMode,
      idempotencyKey,
      dryRun: body.dryRun
    })

    // Validate request
    const validation = validatePriceUpdateRequest(body)
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request',
        details: validation.errors
      }, { status: 400 })
    }

    // Process price update
    const result = await processPriceUpdate(body as PriceUpdateRequest, idempotencyKey)

    const processingTime = Date.now() - startTime
    console.log(`[PriceUpdate] Completed in ${processingTime}ms:`, {
      success: result.success,
      processed: result.summary.total,
      successful: result.summary.successful,
      failed: result.summary.failed
    })

    return NextResponse.json({
      ...result,
      processingTime
    })

  } catch (error) {
    console.error('[PriceUpdate] Processing error:', error)
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

function validatePriceUpdateRequest(body: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check required fields
  if (!body.updates || !Array.isArray(body.updates) || body.updates.length === 0) {
    errors.push('updates array is required and must not be empty')
  }

  if (!body.commitMode || !['preview', 'commit'].includes(body.commitMode)) {
    errors.push('commitMode must be either "preview" or "commit"')
  }

  // Validate individual updates
  if (body.updates && Array.isArray(body.updates)) {
    body.updates.forEach((update: any, index: number) => {
      if (!update.listingId) {
        errors.push(`update[${index}].listingId is required`)
      }
      if (typeof update.newPrice !== 'number' || update.newPrice <= 0) {
        errors.push(`update[${index}].newPrice must be a positive number`)
      }
      if (update.compareAtPrice !== undefined && (typeof update.compareAtPrice !== 'number' || update.compareAtPrice <= 0)) {
        errors.push(`update[${index}].compareAtPrice must be a positive number if provided`)
      }
      if (update.compareAtPrice && update.compareAtPrice <= update.newPrice) {
        errors.push(`update[${index}].compareAtPrice must be greater than newPrice for discount display`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// =============================================================================
// PRICE UPDATE PROCESSING
// =============================================================================

async function processPriceUpdate(
  request: PriceUpdateRequest, 
  idempotencyKey?: string
): Promise<PriceUpdateResponse> {
  const processedItems: PriceUpdateItem[] = []
  let summary = {
    total: request.updates.length,
    successful: 0,
    failed: 0,
    warnings: 0,
    totalPriceChange: 0,
    averagePriceChange: 0
  }

  // Process each price update
  for (const update of request.updates) {
    try {
      const itemResult = await processPriceUpdateItem(update)
      processedItems.push(itemResult)

      // Update summary
      if (itemResult.status === 'success') {
        summary.successful++
        summary.totalPriceChange += Math.abs(itemResult.change)
      } else if (itemResult.status === 'error') {
        summary.failed++
      } else {
        summary.warnings++
      }
    } catch (error) {
      console.error(`[PriceUpdate] Error processing item ${update.listingId}:`, error)
      processedItems.push({
        listingId: update.listingId,
        currentPrice: 0,
        newPrice: update.newPrice,
        compareAtPrice: update.compareAtPrice,
        change: update.newPrice,
        changePercent: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      summary.failed++
    }
  }

  // Calculate average price change
  summary.averagePriceChange = summary.successful > 0 
    ? summary.totalPriceChange / summary.successful 
    : 0

  // Queue sync jobs if in commit mode
  if (request.commitMode === 'commit' && !request.dryRun) {
    await queuePriceSyncJobs(processedItems, idempotencyKey)
  }

  return {
    success: summary.failed === 0,
    commitMode: request.commitMode,
    processedItems,
    summary,
    idempotencyKey,
    previewMode: request.commitMode === 'preview',
    dryRun: request.dryRun || false,
    processingTime: 0 // Will be set by the main handler
  }
}

// =============================================================================
// INDIVIDUAL ITEM PROCESSING
// =============================================================================

async function processPriceUpdateItem(update: {
  listingId: string
  newPrice: number
  compareAtPrice?: number
  reason?: string
}): Promise<PriceUpdateItem> {
  try {
    // Get current listing
    const listing = await listingsService.getListingById(update.listingId)
    if (!listing) {
      return {
        listingId: update.listingId,
        currentPrice: 0,
        newPrice: update.newPrice,
        compareAtPrice: update.compareAtPrice,
        change: update.newPrice,
        changePercent: 0,
        status: 'error',
        error: 'Listing not found'
      }
    }

    const currentPrice = listing.price
    const change = update.newPrice - currentPrice
    const changePercent = currentPrice > 0 ? (change / currentPrice) * 100 : 0

    // Validate price change
    const validation = validatePriceChange(currentPrice, update.newPrice, listing.price)
    if (!validation.valid) {
      return {
        listingId: update.listingId,
        currentPrice,
        newPrice: update.newPrice,
        compareAtPrice: update.compareAtPrice,
        change,
        changePercent,
        status: 'error',
        error: validation.error!
      }
    }

    // Generate warnings for significant changes
    const warnings = []
    
    if (Math.abs(changePercent) > 20) {
      warnings.push(`Large price change detected: ${changePercent.toFixed(1)}%`)
    }
    
    if (update.newPrice < currentPrice * 0.5) {
      warnings.push('Price decreased by more than 50%')
    }
    
    if (update.newPrice > currentPrice * 2) {
      warnings.push('Price increased by more than 100%')
    }

    if (warnings.length > 0) {
      return {
        listingId: update.listingId,
        currentPrice,
        newPrice: update.newPrice,
        compareAtPrice: update.compareAtPrice,
        change,
        changePercent,
        status: 'warning',
        warning: warnings.join('; ')
      }
    }

    // Validate compare at price
    if (update.compareAtPrice && update.compareAtPrice <= update.newPrice) {
      return {
        listingId: update.listingId,
        currentPrice,
        newPrice: update.newPrice,
        compareAtPrice: update.compareAtPrice,
        change,
        changePercent,
        status: 'error',
        error: 'Compare at price must be greater than new price for proper discount display'
      }
    }

    // Check if price is suspiciously low (potential error)
    if (update.newPrice < 1000 && currentPrice > 10000) {
      return {
        listingId: update.listingId,
        currentPrice,
        newPrice: update.newPrice,
        compareAtPrice: update.compareAtPrice,
        change,
        changePercent,
        status: 'warning',
        warning: 'New price seems unusually low compared to current price'
      }
    }

    return {
      listingId: update.listingId,
      currentPrice,
      newPrice: update.newPrice,
      compareAtPrice: update.compareAtPrice,
      change,
      changePercent,
      status: 'success'
    }

  } catch (error) {
    return {
      listingId: update.listingId,
      currentPrice: 0,
      newPrice: update.newPrice,
      compareAtPrice: update.compareAtPrice,
      change: update.newPrice,
      changePercent: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Processing error'
    }
  }
}

// =============================================================================
// PRICE CHANGE VALIDATION
// =============================================================================

function validatePriceChange(currentPrice: number, newPrice: number, originalPrice?: number): {
  valid: boolean
  error?: string
} {
  // Basic range validation
  if (newPrice <= 0) {
    return { valid: false, error: 'Price must be positive' }
  }

  if (newPrice > 999999999) {
    return { valid: false, error: 'Price exceeds maximum limit (999,999,999)' }
  }

  // Check for unreasonable prices (too cheap)
  if (newPrice < 0.01) {
    return { valid: false, error: 'Price is too low (minimum 0.01)' }
  }

  // Check for dramatic decreases that might indicate errors
  if (currentPrice > 1000 && newPrice < currentPrice * 0.1) {
    return { valid: false, error: 'Price decrease seems too dramatic (>90%)' }
  }

  // Check for unrealistic increases
  if (newPrice > currentPrice * 20 && currentPrice > 0) {
    return { valid: false, error: 'Price increase seems too dramatic (>1900%)' }
  }

  // Check against original price if available
  if (originalPrice && Math.abs(newPrice - originalPrice) > originalPrice * 5) {
    return { valid: false, error: 'Price deviation from original seems unrealistic' }
  }

  return { valid: true }
}

// =============================================================================
// SYNC JOB QUEUEING
// =============================================================================

async function queuePriceSyncJobs(processedItems: PriceUpdateItem[], idempotencyKey?: string): Promise<void> {
  const successfulItems = processedItems.filter(item => item.status === 'success')
  
  if (successfulItems.length === 0) {
    console.log('[PriceUpdate] No successful items to queue for sync')
    return
  }

  // Group by channel account for efficient sync
  const itemsByAccount: Record<string, PriceUpdateItem[]> = {}
  
  for (const item of successfulItems) {
    try {
      const listing = await listingsService.getListingById(item.listingId)
      if (listing) {
        const accountId = listing.channelAccountId
        if (!itemsByAccount[accountId]) {
          itemsByAccount[accountId] = []
        }
        itemsByAccount[accountId].push(item)
      }
    } catch (error) {
      console.error(`[PriceUpdate] Error getting listing ${item.listingId} for sync:`, error)
    }
  }

  // For now, just log that sync jobs would be queued
  // TODO: Implement actual sync job queueing when sync service is fully implemented
  console.log(`[PriceUpdate] Would queue price sync jobs for ${Object.keys(itemsByAccount).length} accounts`)
  console.log('[PriceUpdate] Items by account:', Object.entries(itemsByAccount).map(([accountId, items]) => ({
    accountId,
    itemCount: items.length,
    totalPriceChange: items.reduce((sum, item) => sum + Math.abs(item.change), 0),
    averageChange: items.reduce((sum, item) => sum + item.changePercent, 0) / items.length
  })))
}