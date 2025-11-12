/**
 * TikTok Shop Webhook Handler
 * 
 * POST /api/webhooks/tiktokshop
 * 
 * Handles incoming webhook events from TikTok Shop platform.
 * Verifies signatures, processes events, and triggers appropriate sync jobs.
 * 
 * Supported Events:
 * - order.created
 * - order.updated
 * - order.cancelled
 * - product.updated
 * - inventory.updated
 * - price.updated
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncJobsService } from '@/services/sync-jobs-service'

// =============================================================================
// WEBHOOK EVENT TYPES
// =============================================================================

interface TikTokShopWebhookEvent {
  event: string
  timestamp: number
  data: any
  shop_id: string
  app_id: string
  source: string
}

interface TikTokShopOrderEvent {
  order_id: string
  order_number: string
  order_status: string
  create_time: number
  update_time: number
  currency: string
  total_amount: number
  items: Array<{
    product_id: string
    product_name: string
    product_sku: string
    variation_id: string
    variation_name: string
    price: number
    quantity: number
    weight: number
    order_item_id: string
  }>
  shipping_address: {
    name: string
    phone: string
    country: string
    region: string
    city: string
    district: string
    detailed_address: string
    zip_code: string
  }
}

interface TikTokShopProductEvent {
  product_id: string
  update_time: number
  product_name: string
  sku: string
  price: number
  stock: number
  status: string
  variations: Array<{
    variation_id: string
    variation_sku: string
    price: number
    stock: number
    name: string
  }>
}

interface TikTokShopInventoryEvent {
  product_id: string
  variation_id: string
  stock: number
  update_time: number
}

// =============================================================================
// STANDALONE SIGNATURE VERIFICATION
// =============================================================================

/**
 * Verify TikTok Shop webhook signature (placeholder for now)
 * TODO: Implement when TikTok Shop connector is ready
 */
function verifyTikTokShopSignature(payload: string, signature: string): boolean {
  // For now, just return true - implement with TikTok Shop connector when ready
  console.log('[TikTokShopWebhook] Signature verification not yet implemented')
  return true
}

// =============================================================================
// MAIN WEBHOOK HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-tiktok-signature')
    const appId = request.headers.get('x-tiktok-app-id')
    const timestamp = request.headers.get('x-tiktok-timestamp')
    
    console.log('[TikTokShopWebhook] Received webhook:', {
      signature: signature?.substring(0, 16) + '...',
      appId,
      timestamp,
      bodyLength: rawBody.length
    })

    // Verify webhook signature
    if (!verifyTikTokShopSignature(rawBody, signature || '')) {
      console.error('[TikTokShopWebhook] Invalid signature')
      return NextResponse.json({
        success: false,
        error: 'Invalid signature'
      }, { status: 401 })
    }

    // Parse webhook event
    let event: TikTokShopWebhookEvent
    try {
      event = JSON.parse(rawBody)
    } catch (error) {
      console.error('[TikTokShopWebhook] Failed to parse JSON:', error)
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON'
      }, { status: 400 })
    }

    // Validate required fields
    if (!event.event || !event.data || !event.shop_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Process webhook event
    const result = await processWebhookEvent(event)

    const processingTime = Date.now() - startTime
    console.log(`[TikTokShopWebhook] Processed ${event.event} in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      event: event.event,
      processed: result.processed,
      createdJobs: result.createdJobs,
      processingTime
    })

  } catch (error) {
    console.error('[TikTokShopWebhook] Processing error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// =============================================================================
// EVENT PROCESSING
// =============================================================================

/**
 * Process webhook event based on type
 */
async function processWebhookEvent(event: TikTokShopWebhookEvent): Promise<{
  processed: boolean
  createdJobs: string[]
  message?: string
}> {
  const createdJobs: string[] = []

  try {
    switch (event.event) {
      case 'order.created':
        await processOrderCreatedEvent(event.data as TikTokShopOrderEvent, createdJobs)
        break

      case 'order.updated':
        await processOrderUpdatedEvent(event.data as TikTokShopOrderEvent, createdJobs)
        break

      case 'order.cancelled':
        await processOrderCancelledEvent(event.data as TikTokShopOrderEvent, createdJobs)
        break

      case 'product.updated':
        await processProductUpdateEvent(event.data as TikTokShopProductEvent, createdJobs)
        break

      case 'inventory.updated':
        await processInventoryUpdateEvent(event.data as TikTokShopInventoryEvent, createdJobs)
        break

      case 'price.updated':
        await processPriceUpdateEvent(event.data as TikTokShopProductEvent, createdJobs)
        break

      default:
        console.log(`[TikTokShopWebhook] Unhandled event type: ${event.event}`)
        return {
          processed: false,
          createdJobs,
          message: `Event type ${event.event} not supported`
        }
    }

    return {
      processed: true,
      createdJobs,
      message: `Successfully processed ${event.event}`
    }

  } catch (error) {
    console.error(`[TikTokShopWebhook] Error processing ${event.event}:`, error)
    throw error
  }
}

// =============================================================================
// SPECIFIC EVENT HANDLERS
// =============================================================================

/**
 * Process order created event
 */
async function processOrderCreatedEvent(eventData: TikTokShopOrderEvent, createdJobs: string[]): Promise<void> {
  console.log(`[TikTokShopWebhook] Processing order created: ${eventData.order_id}`)

  try {
    // Queue pull job to get full order details
    const jobId = await syncJobsService.queuePullJob('tiktokshop', 'orders', {
      orderId: eventData.order_id,
      eventType: 'created'
    })
    createdJobs.push(jobId)

    // Also sync related products if needed
    const productIds = eventData.items.map(item => item.product_id)
    if (productIds.length > 0) {
      const productJobId = await syncJobsService.queuePullJob('tiktokshop', 'products', {
        productIds,
        triggerEvent: 'order_created',
        orderId: eventData.order_id
      })
      createdJobs.push(productJobId)
    }

    console.log(`[TikTokShopWebhook] Created jobs for order ${eventData.order_id}:`, createdJobs)

  } catch (error) {
    console.error(`[TikTokShopWebhook] Error processing order created ${eventData.order_id}:`, error)
    throw error
  }
}

/**
 * Process order updated event
 */
async function processOrderUpdatedEvent(eventData: TikTokShopOrderEvent, createdJobs: string[]): Promise<void> {
  console.log(`[TikTokShopWebhook] Processing order updated: ${eventData.order_id}`)

  try {
    // Queue pull job to get updated order details
    const jobId = await syncJobsService.queuePullJob('tiktokshop', 'orders', {
      orderId: eventData.order_id,
      eventType: 'updated',
      previousStatus: 'unknown'
    })
    createdJobs.push(jobId)

    // If status changed to shipped, we might want to update shipping info
    if (eventData.order_status === 'shipped') {
      console.log(`[TikTokShopWebhook] Order ${eventData.order_id} shipped - might trigger shipping jobs`)
    }

  } catch (error) {
    console.error(`[TikTokShopWebhook] Error processing order updated ${eventData.order_id}:`, error)
    throw error
  }
}

/**
 * Process order cancelled event
 */
async function processOrderCancelledEvent(eventData: TikTokShopOrderEvent, createdJobs: string[]): Promise<void> {
  console.log(`[TikTokShopWebhook] Processing order cancelled: ${eventData.order_id}`)

  try {
    // Queue pull job to get cancellation details
    const jobId = await syncJobsService.queuePullJob('tiktokshop', 'orders', {
      orderId: eventData.order_id,
      eventType: 'cancelled'
    })
    createdJobs.push(jobId)

    // Restore inventory if products were affected
    const productIds = eventData.items.map(item => item.product_id)
    if (productIds.length > 0) {
      const inventoryJobId = await syncJobsService.queuePullJob('tiktokshop', 'products', {
        productIds,
        triggerEvent: 'order_cancelled',
        orderId: eventData.order_id,
        action: 'restore_inventory'
      })
      createdJobs.push(inventoryJobId)
    }

  } catch (error) {
    console.error(`[TikTokShopWebhook] Error processing order cancelled ${eventData.order_id}:`, error)
    throw error
  }
}

/**
 * Process product update event
 */
async function processProductUpdateEvent(eventData: TikTokShopProductEvent, createdJobs: string[]): Promise<void> {
  console.log(`[TikTokShopWebhook] Processing product update: ${eventData.product_id}`)

  try {
    // Queue pull job to get full product details
    const jobId = await syncJobsService.queuePullJob('tiktokshop', 'products', {
      productId: eventData.product_id,
      eventType: 'updated',
      updateTime: eventData.update_time
    })
    createdJobs.push(jobId)

  } catch (error) {
    console.error(`[TikTokShopWebhook] Error processing product update ${eventData.product_id}:`, error)
    throw error
  }
}

/**
 * Process inventory update event
 */
async function processInventoryUpdateEvent(eventData: TikTokShopInventoryEvent, createdJobs: string[]): Promise<void> {
  console.log(`[TikTokShopWebhook] Processing inventory update: ${eventData.product_id}/${eventData.variation_id}`)

  try {
    // This is a stock update event, queue pull to get current inventory state
    const jobId = await syncJobsService.queuePullJob('tiktokshop', 'products', {
      productId: eventData.product_id,
      variationId: eventData.variation_id,
      eventType: 'inventory_updated',
      newStock: eventData.stock,
      updateTime: eventData.update_time
    })
    createdJobs.push(jobId)

    // Could trigger low stock alerts if stock falls below threshold
    if (eventData.stock <= 10) {
      console.log(`[TikTokShopWebhook] Low stock alert for product ${eventData.product_id}: ${eventData.stock} units`)
    }

  } catch (error) {
    console.error(`[TikTokShopWebhook] Error processing inventory update ${eventData.product_id}:`, error)
    throw error
  }
}

/**
 * Process price update event
 */
async function processPriceUpdateEvent(eventData: TikTokShopProductEvent, createdJobs: string[]): Promise<void> {
  console.log(`[TikTokShopWebhook] Processing price update: ${eventData.product_id}`)

  try {
    // Queue pull job to get full product details with updated pricing
    const jobId = await syncJobsService.queuePullJob('tiktokshop', 'products', {
      productId: eventData.product_id,
      eventType: 'price_updated',
      newPrice: eventData.price,
      updateTime: eventData.update_time
    })
    createdJobs.push(jobId)

  } catch (error) {
    console.error(`[TikTokShopWebhook] Error processing price update ${eventData.product_id}:`, error)
    throw error
  }
}