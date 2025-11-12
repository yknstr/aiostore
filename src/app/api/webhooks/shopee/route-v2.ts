/**
 * Shopee v2 Webhook Handler
 * 
 * POST /api/webhooks/shopee
 * 
 * Handles incoming webhook events from Shopee platform with v2 signature verification.
 * Verifies HMAC signatures using v2 client, processes events, and triggers sync jobs.
 * 
 * Phase 3 Implementation: Uses verifyShopeeV2Signature from new v2 client
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyShopeeV2Signature } from '@/connectors/shopee/client-v2'
import { syncJobsService } from '@/services/sync-jobs-service'

// =============================================================================
// V2 WEBHOOK EVENT TYPES
// =============================================================================

interface ShopeeV2WebhookEvent {
  event: string
  timestamp: number
  data: any
  shop_id: string
  partner_id: string
  source: string
}

interface V2OrderCreatedEvent {
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

interface V2ProductUpdateEvent {
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

interface V2InventoryUpdateEvent {
  item_id: string
  variation_id: string
  stock: number
  update_time: number
}

// =============================================================================
// V2 WEBHOOK HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Get raw body for v2 signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature')
    const partnerId = request.headers.get('x-partner-id')
    const timestamp = request.headers.get('x-timestamp')
    
    console.log('[ShopeeV2Webhook] Received webhook:', {
      signature: signature?.substring(0, 16) + '...',
      partnerId,
      timestamp,
      bodyLength: rawBody.length
    })

    // Phase 3: Verify webhook signature using v2 client
    if (!verifyShopeeV2Signature(rawBody, signature || '')) {
      console.error('[ShopeeV2Webhook] Invalid v2 signature')
      return NextResponse.json({
        success: false,
        error: 'Invalid v2 signature'
      }, { status: 401 })
    }

    // Parse webhook event
    let event: ShopeeV2WebhookEvent
    try {
      event = JSON.parse(rawBody)
    } catch (error) {
      console.error('[ShopeeV2Webhook] Failed to parse JSON:', error)
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
    const result = await processV2WebhookEvent(event)

    const processingTime = Date.now() - startTime
    console.log(`[ShopeeV2Webhook] Processed ${event.event} in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      event: event.event,
      processed: result.processed,
      createdJobs: result.createdJobs,
      processingTime
    })

  } catch (error) {
    console.error('[ShopeeV2Webhook] Processing error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// =============================================================================
// V2 EVENT PROCESSING
// =============================================================================

async function processV2WebhookEvent(event: ShopeeV2WebhookEvent): Promise<{
  processed: boolean
  createdJobs: string[]
  message?: string
}> {
  const createdJobs: string[] = []

  try {
    switch (event.event) {
      case 'order.created':
        await processOrderCreatedEventV2(event.data as V2OrderCreatedEvent, createdJobs)
        break

      case 'order.updated':
        await processOrderUpdatedEventV2(event.data as V2OrderCreatedEvent, createdJobs)
        break

      case 'order.cancelled':
        await processOrderCancelledEventV2(event.data as V2OrderCreatedEvent, createdJobs)
        break

      case 'product.update':
        await processProductUpdateEventV2(event.data as V2ProductUpdateEvent, createdJobs)
        break

      case 'inventory.updated':
        await processInventoryUpdateEventV2(event.data as V2InventoryUpdateEvent, createdJobs)
        break

      case 'price.updated':
        await processPriceUpdateEventV2(event.data as V2ProductUpdateEvent, createdJobs)
        break

      default:
        console.log(`[ShopeeV2Webhook] Unhandled event type: ${event.event}`)
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
    console.error(`[ShopeeV2Webhook] Error processing ${event.event}:`, error)
    throw error
  }
}

// =============================================================================
// V2 SPECIFIC EVENT HANDLERS
// =============================================================================

async function processOrderCreatedEventV2(eventData: V2OrderCreatedEvent, createdJobs: string[]): Promise<void> {
  console.log(`[ShopeeV2Webhook] Processing order created: ${eventData.order_id}`)

  try {
    // Queue pull job to get full order details using v2 client
    const jobId = await syncJobsService.queuePullJob('shopee', 'orders', {
      orderId: eventData.order_id,
      eventType: 'created',
      apiVersion: 'v2'
    })
    createdJobs.push(jobId)

    // Also sync related products
    const productIds = eventData.order_items.map(item => item.item_id)
    if (productIds.length > 0) {
      const productJobId = await syncJobsService.queuePullJob('shopee', 'products', {
        productIds,
        triggerEvent: 'order_created',
        orderId: eventData.order_id,
        apiVersion: 'v2'
      })
      createdJobs.push(productJobId)
    }

    console.log(`[ShopeeV2Webhook] Created jobs for order ${eventData.order_id}:`, createdJobs)

  } catch (error) {
    console.error(`[ShopeeV2Webhook] Error processing order created ${eventData.order_id}:`, error)
    throw error
  }
}

async function processOrderUpdatedEventV2(eventData: V2OrderCreatedEvent, createdJobs: string[]): Promise<void> {
  console.log(`[ShopeeV2Webhook] Processing order updated: ${eventData.order_id}`)

  try {
    const jobId = await syncJobsService.queuePullJob('shopee', 'orders', {
      orderId: eventData.order_id,
      eventType: 'updated',
      apiVersion: 'v2'
    })
    createdJobs.push(jobId)

  } catch (error) {
    console.error(`[ShopeeV2Webhook] Error processing order updated ${eventData.order_id}:`, error)
    throw error
  }
}

async function processOrderCancelledEventV2(eventData: V2OrderCreatedEvent, createdJobs: string[]): Promise<void> {
  console.log(`[ShopeeV2Webhook] Processing order cancelled: ${eventData.order_id}`)

  try {
    const jobId = await syncJobsService.queuePullJob('shopee', 'orders', {
      orderId: eventData.order_id,
      eventType: 'cancelled',
      apiVersion: 'v2'
    })
    createdJobs.push(jobId)

    // Restore inventory
    const productIds = eventData.order_items.map(item => item.item_id)
    if (productIds.length > 0) {
      const inventoryJobId = await syncJobsService.queuePullJob('shopee', 'products', {
        productIds,
        triggerEvent: 'order_cancelled',
        orderId: eventData.order_id,
        action: 'restore_inventory',
        apiVersion: 'v2'
      })
      createdJobs.push(inventoryJobId)
    }

  } catch (error) {
    console.error(`[ShopeeV2Webhook] Error processing order cancelled ${eventData.order_id}:`, error)
    throw error
  }
}

async function processProductUpdateEventV2(eventData: V2ProductUpdateEvent, createdJobs: string[]): Promise<void> {
  console.log(`[ShopeeV2Webhook] Processing product update: ${eventData.item_id}`)

  try {
    const jobId = await syncJobsService.queuePullJob('shopee', 'products', {
      productId: eventData.item_id,
      eventType: 'updated',
      updateTime: eventData.update_time,
      apiVersion: 'v2'
    })
    createdJobs.push(jobId)

  } catch (error) {
    console.error(`[ShopeeV2Webhook] Error processing product update ${eventData.item_id}:`, error)
    throw error
  }
}

async function processInventoryUpdateEventV2(eventData: V2InventoryUpdateEvent, createdJobs: string[]): Promise<void> {
  console.log(`[ShopeeV2Webhook] Processing inventory update: ${eventData.item_id}/${eventData.variation_id}`)

  try {
    const jobId = await syncJobsService.queuePullJob('shopee', 'products', {
      productId: eventData.item_id,
      variationId: eventData.variation_id,
      eventType: 'inventory_updated',
      newStock: eventData.stock,
      updateTime: eventData.update_time,
      apiVersion: 'v2'
    })
    createdJobs.push(jobId)

  } catch (error) {
    console.error(`[ShopeeV2Webhook] Error processing inventory update ${eventData.item_id}:`, error)
    throw error
  }
}

async function processPriceUpdateEventV2(eventData: V2ProductUpdateEvent, createdJobs: string[]): Promise<void> {
  console.log(`[ShopeeV2Webhook] Processing price update: ${eventData.item_id}`)

  try {
    const jobId = await syncJobsService.queuePullJob('shopee', 'products', {
      productId: eventData.item_id,
      eventType: 'price_updated',
      newPrice: eventData.price,
      updateTime: eventData.update_time,
      apiVersion: 'v2'
    })
    createdJobs.push(jobId)

  } catch (error) {
    console.error(`[ShopeeV2Webhook] Error processing price update ${eventData.item_id}:`, error)
    throw error
  }
}