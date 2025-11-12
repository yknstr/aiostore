/**
 * Shopee Webhook Handler
 * 
 * POST /api/webhooks/shopee
 * 
 * Handles incoming webhook events from Shopee platform.
 * Verifies HMAC signatures, processes events, and triggers appropriate sync jobs.
 * 
 * Supported Events:
 * - product.update
 * - order.created
 * - order.updated
 * - order.cancelled
 * - inventory.updated
 * - price.updated
 */

import { NextRequest, NextResponse } from 'next/server'
import { createShopeeConnector } from '../../../../connectors/shopee'
import { syncJobsService } from '../../../../services/sync-jobs-service'
import { verifyShopeeSignature } from '../../../../connectors/shopee/client'

// =============================================================================
// WEBHOOK EVENT TYPES
// =============================================================================

interface ShopeeWebhookEvent {
  event: string
  timestamp: number
  data: any
  shop_id: string
  partner_id: string
  source: string
}

interface OrderCreatedEvent {
  order_id: string
  order_sn: string
  order_status: string
  pay_time: number
  create_time: number
  update_time: number
  currency: string
  total_amount: number
  order_items: Array<{
    item_id: string
    item_name: string
    item_sku: string
    variation_id: string
    variation_name: string
    price: number
    weight: number
    wholesale_price: number
    order_item_id: string
  }>
  recipient_address: {
    name: string
    phone: string
    town: string
    district: string
    city: string
    state: string
    zipcode: string
    full_address: string
  }
}

interface ProductUpdateEvent {
  item_id: string
  update_time: number
  item_name: string
  item_sku: string
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

interface InventoryUpdateEvent {
  item_id: string
  variation_id: string
  stock: number
  update_time: number
}

// =============================================================================
// MAIN WEBHOOK HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature')
    const partnerId = request.headers.get('x-partner-id')
    const timestamp = request.headers.get('x-timestamp')
    
    console.log('[ShopeeWebhook] Received webhook:', {
      signature: signature?.substring(0, 16) + '...',
      partnerId,
      timestamp,
      bodyLength: rawBody.length
    })

    // Verify webhook signature
    if (!verifyShopeeSignature(rawBody, signature || '')) {
      console.error('[ShopeeWebhook] Invalid signature')
      return NextResponse.json({
        success: false,
        error: 'Invalid signature'
      }, { status: 401 })
    }

    // Parse webhook event
    let event: ShopeeWebhookEvent
    try {
      event = JSON.parse(rawBody)
    } catch (error) {
      console.error('[ShopeeWebhook] Failed to parse JSON:', error)
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
    console.log(`[ShopeeWebhook] Processed ${event.event} in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      event: event.event,
      processed: result.processed,
      createdJobs: result.createdJobs,
      processingTime
    })

  } catch (error) {
    console.error('[ShopeeWebhook] Processing error:', error)
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
async function processWebhookEvent(event: ShopeeWebhookEvent): Promise<{
  processed: boolean
  createdJobs: string[]
  message?: string
}> {
  const createdJobs: string[] = []

  try {
    switch (event.event) {
      case 'order.created':
        await processOrderCreatedEvent(event.data as OrderCreatedEvent, createdJobs)
        break

      case 'order.updated':
        await processOrderUpdatedEvent(event.data as OrderCreatedEvent, createdJobs)
        break

      case 'order.cancelled':
        await processOrderCancelledEvent(event.data as OrderCreatedEvent, createdJobs)
        break

      case 'product.update':
        await processProductUpdateEvent(event.data as ProductUpdateEvent, createdJobs)
        break

      case 'inventory.updated':
        await processInventoryUpdateEvent(event.data as InventoryUpdateEvent, createdJobs)
        break

      case 'price.updated':
        await processPriceUpdateEvent(event.data as ProductUpdateEvent, createdJobs)
        break

      default:
        console.log(`[ShopeeWebhook] Unhandled event type: ${event.event}`)
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
    console.error(`[ShopeeWebhook] Error processing ${event.event}:`, error)
    throw error
  }
}

// =============================================================================
// SPECIFIC EVENT HANDLERS
// =============================================================================

/**
 * Process order created event
 */
async function processOrderCreatedEvent(eventData: OrderCreatedEvent, createdJobs: string[]): Promise<void> {
  console.log(`[ShopeeWebhook] Processing order created: ${eventData.order_id}`)

  try {
    // Queue pull job to get full order details
    const jobId = await syncJobsService.queuePullJob('shopee', 'orders', {
      orderId: eventData.order_id,
      eventType: 'created'
    })
    createdJobs.push(jobId)

    // Also sync related products if needed
    const productIds = eventData.order_items.map(item => item.item_id)
    if (productIds.length > 0) {
      const productJobId = await syncJobsService.queuePullJob('shopee', 'products', {
        productIds,
        triggerEvent: 'order_created',
        orderId: eventData.order_id
      })
      createdJobs.push(productJobId)
    }

    console.log(`[ShopeeWebhook] Created jobs for order ${eventData.order_id}:`, createdJobs)

  } catch (error) {
    console.error(`[ShopeeWebhook] Error processing order created ${eventData.order_id}:`, error)
    throw error
  }
}

/**
 * Process order updated event
 */
async function processOrderUpdatedEvent(eventData: OrderCreatedEvent, createdJobs: string[]): Promise<void> {
  console.log(`[ShopeeWebhook] Processing order updated: ${eventData.order_id}`)

  try {
    // Queue pull job to get updated order details
    const jobId = await syncJobsService.queuePullJob('shopee', 'orders', {
      orderId: eventData.order_id,
      eventType: 'updated',
      previousStatus: 'unknown' // Could be stored if needed
    })
    createdJobs.push(jobId)

    // If status changed to shipped, we might want to update shipping info
    if (eventData.order_status === 'shipped') {
      // Could queue additional jobs for shipping integration
      console.log(`[ShopeeWebhook] Order ${eventData.order_id} shipped - might trigger shipping jobs`)
    }

  } catch (error) {
    console.error(`[ShopeeWebhook] Error processing order updated ${eventData.order_id}:`, error)
    throw error
  }
}

/**
 * Process order cancelled event
 */
async function processOrderCancelledEvent(eventData: OrderCreatedEvent, createdJobs: string[]): Promise<void> {
  console.log(`[ShopeeWebhook] Processing order cancelled: ${eventData.order_id}`)

  try {
    // Queue pull job to get cancellation details
    const jobId = await syncJobsService.queuePullJob('shopee', 'orders', {
      orderId: eventData.order_id,
      eventType: 'cancelled'
    })
    createdJobs.push(jobId)

    // Restore inventory if products were affected
    const productIds = eventData.order_items.map(item => item.item_id)
    if (productIds.length > 0) {
      const inventoryJobId = await syncJobsService.queuePullJob('shopee', 'products', {
        productIds,
        triggerEvent: 'order_cancelled',
        orderId: eventData.order_id,
        action: 'restore_inventory'
      })
      createdJobs.push(inventoryJobId)
    }

  } catch (error) {
    console.error(`[ShopeeWebhook] Error processing order cancelled ${eventData.order_id}:`, error)
    throw error
  }
}

/**
 * Process product update event
 */
async function processProductUpdateEvent(eventData: ProductUpdateEvent, createdJobs: string[]): Promise<void> {
  console.log(`[ShopeeWebhook] Processing product update: ${eventData.item_id}`)

  try {
    // Queue pull job to get full product details
    const jobId = await syncJobsService.queuePullJob('shopee', 'products', {
      productId: eventData.item_id,
      eventType: 'updated',
      updateTime: eventData.update_time
    })
    createdJobs.push(jobId)

    // If stock or price changed significantly, we might want to trigger alerts
    // This could be extended with business logic for significant changes

  } catch (error) {
    console.error(`[ShopeeWebhook] Error processing product update ${eventData.item_id}:`, error)
    throw error
  }
}

/**
 * Process inventory update event
 */
async function processInventoryUpdateEvent(eventData: InventoryUpdateEvent, createdJobs: string[]): Promise<void> {
  console.log(`[ShopeeWebhook] Processing inventory update: ${eventData.item_id}/${eventData.variation_id}`)

  try {
    // This is a stock update event, queue pull to get current inventory state
    const jobId = await syncJobsService.queuePullJob('shopee', 'products', {
      productId: eventData.item_id,
      variationId: eventData.variation_id,
      eventType: 'inventory_updated',
      newStock: eventData.stock,
      updateTime: eventData.update_time
    })
    createdJobs.push(jobId)

    // Could trigger low stock alerts if stock falls below threshold
    if (eventData.stock <= 10) {
      console.log(`[ShopeeWebhook] Low stock alert for product ${eventData.item_id}: ${eventData.stock} units`)
      // Could integrate with notification system here
    }

  } catch (error) {
    console.error(`[ShopeeWebhook] Error processing inventory update ${eventData.item_id}:`, error)
    throw error
  }
}

/**
 * Process price update event
 */
async function processPriceUpdateEvent(eventData: ProductUpdateEvent, createdJobs: string[]): Promise<void> {
  console.log(`[ShopeeWebhook] Processing price update: ${eventData.item_id}`)

  try {
    // Queue pull job to get full product details with updated pricing
    const jobId = await syncJobsService.queuePullJob('shopee', 'products', {
      productId: eventData.item_id,
      eventType: 'price_updated',
      newPrice: eventData.price,
      updateTime: eventData.update_time
    })
    createdJobs.push(jobId)

    // Could trigger pricing alerts if significant price changes occur
    // Could also trigger competitive pricing analysis

  } catch (error) {
    console.error(`[ShopeeWebhook] Error processing price update ${eventData.item_id}:`, error)
    throw error
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Validate webhook timestamp (prevent replay attacks)
 */
function validateTimestamp(timestamp: string, toleranceMinutes = 15): boolean {
  const webhookTime = parseInt(timestamp) * 1000 // Convert to milliseconds
  const currentTime = Date.now()
  const timeDiff = Math.abs(currentTime - webhookTime)
  const toleranceMs = toleranceMinutes * 60 * 1000

  return timeDiff <= toleranceMs
}

/**
 * Log webhook event for audit trail
 */
async function logWebhookEvent(event: ShopeeWebhookEvent, result: any): Promise<void> {
  try {
    // In a production environment, you would store this in your database
    console.log('[ShopeeWebhook Audit]', {
      timestamp: new Date().toISOString(),
      event: event.event,
      shopId: event.shop_id,
      partnerId: event.partner_id,
      result,
      originalTimestamp: event.timestamp
    })
  } catch (error) {
    console.error('[ShopeeWebhook] Failed to log audit event:', error)
  }
}