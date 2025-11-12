/**
 * Shopee Orders Module
 * 
 * Handles order-related operations for Shopee platform:
 * - List orders with pagination and filtering
 * - Get order details
 * - Update order status (where allowed by Shopee API)
 * 
 * Note: Shopee has strict policies on order status updates.
 * Only certain status changes are allowed via API.
 * 
 * Shopee API Reference: https://shopee.github.io/shopee-marathon-api/
 */

import { 
  OrderListParams,
  OrderDetail,
  OrderStatusUpdate,
  ConnectorResponse,
  OrderStatus,
  PaymentStatus
} from '@/connectors/types'
import { ShopeeClient } from './client'

// =============================================================================
// SHOPEE ORDER API RESPONSE TYPES
// =============================================================================

interface ShopeeOrder {
  order_id: string
  order_sn: string
  create_time: number
  update_time: number
  order_status: string
  payment_status: string
  total_price: number
  order_cost: number
  shipping_fee: number
  buyer_username: string
  buyer_phone: string
  recipient_name: string
  recipient_phone: string
  recipient_address: string
  country: string
  city: string
  district: string
  zipcode: string
  items: Array<{
    item_id: string
    item_sku: string
    item_name: string
    item_price: number
    quantity: number
    subtotal: number
  }>
}

interface ShopeeOrderListResponse {
  orders: ShopeeOrder[]
  more: boolean
  next_offset: string
}

interface ShopeeOrderDetailResponse {
  order: ShopeeOrder
}

// =============================================================================
// SHOPEE ORDER STATUS MAPPING
// =============================================================================

const SHOPEE_ORDER_STATUS_MAPPING: Record<string, OrderStatus> = {
  'unpaid': 'pending',
  'paid': 'paid',
  'ready_to_ship': 'processing',
  'shipped': 'shipped',
  'delivered': 'delivered',
  'completed': 'delivered',
  'cancelled': 'cancelled',
  'refund': 'refunded',
  'refunded': 'refunded'
}

const SHOPEE_PAYMENT_STATUS_MAPPING: Record<string, PaymentStatus> = {
  'unpaid': 'unpaid',
  'paid': 'paid',
  'refunded': 'refunded'
}

// =============================================================================
// SHOPEE ORDERS CLASS
// =============================================================================

export class ShopeeOrders {
  private client: ShopeeClient
  private logPrefix = '[ShopeeOrders]'

  constructor(client: ShopeeClient) {
    this.client = client
  }

  // =============================================================================
  // ORDER LISTING OPERATIONS
  // =============================================================================

  /**
   * List orders with pagination and filtering
   */
  async listOrders(params: OrderListParams = {}): Promise<ConnectorResponse<OrderDetail[]>> {
    try {
      const queryParams: any = {
        page_size: params.pageSize || 50,
        page_no: params.page || 1
      }

      // Apply date filters
      if (params.dateFrom) {
        queryParams.create_time_from = Math.floor(params.dateFrom.getTime() / 1000)
      }

      if (params.dateTo) {
        queryParams.create_time_to = Math.floor(params.dateTo.getTime() / 1000)
      }

      if (params.status) {
        queryParams.order_status = this.mapStatusToShopee(params.status as OrderStatus)
      }

      if (params.search) {
        // Shopee doesn't have a direct search parameter for orders
        // We'll need to filter locally after fetching
        console.warn(`${this.logPrefix} Search parameter not supported by Shopee API`)
      }

      const response = await this.client.request<ShopeeOrderListResponse>(
        '/api/v1/orders/basics',
        {
          query: queryParams
        }
      )

      if (response.success && response.data) {
        const orders = response.data.orders.map((order: ShopeeOrder) => 
          this.transformOrderFromShopee(order)
        )

        console.log(`${this.logPrefix} Retrieved ${orders.length} orders`)
        return {
          success: true,
          data: orders,
          metadata: {
            hasMore: response.data.more,
            nextOffset: response.data.next_offset
          } as any
        }
      } else {
        return {
          success: false,
          error: response.error
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error listing orders:`, error)
      return {
        success: false,
        error: {
          code: 'LIST_ORDERS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list orders',
          retryable: true
        }
      }
    }
  }

  /**
   * Get detailed information about a specific order
   */
  async getOrder(orderId: string): Promise<ConnectorResponse<OrderDetail>> {
    try {
      const response = await this.client.request<ShopeeOrderDetailResponse>(
        '/api/v1/orders/detail',
        {
          query: {
            order_id: orderId
          }
        }
      )

      if (response.success && response.data) {
        const order = this.transformOrderFromShopee(response.data.order)
        console.log(`${this.logPrefix} Retrieved order: ${order.id}`)
        return {
          success: true,
          data: order
        }
      } else {
        return {
          success: false,
          error: response.error
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error getting order ${orderId}:`, error)
      return {
        success: false,
        error: {
          code: 'GET_ORDER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get order',
          retryable: true
        }
      }
    }
  }

  // =============================================================================
  // ORDER STATUS UPDATES
  // =============================================================================

  /**
   * Update order status (if allowed by Shopee API)
   * 
   * IMPORTANT: Shopee has very strict policies on order status updates.
   * Most status changes must be done manually through the seller dashboard.
   * Only certain actions are allowed via API.
   */
  async updateOrderStatus(orderId: string, update: OrderStatusUpdate): Promise<ConnectorResponse<void>> {
    try {
      // Check if the status update is allowed by Shopee
      const allowedUpdates = await this.getAllowedStatusUpdates()
      if (!allowedUpdates.includes(update.status)) {
        return {
          success: false,
          error: {
            code: 'STATUS_UPDATE_NOT_ALLOWED',
            message: `Status '${update.status}' cannot be updated via API on Shopee`,
            retryable: false
          }
        }
      }

      // Only ready_to_ship status is typically allowed via API
      if (update.status === 'processing') {
        return await this.markAsReadyToShip(orderId, update.trackingNumber, update.notes)
      }

      // Other status updates require manual intervention
      return {
        success: false,
        error: {
          code: 'MANUAL_UPDATE_REQUIRED',
          message: 'This order status update requires manual action in the Shopee seller dashboard',
          retryable: false
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error updating order status ${orderId}:`, error)
      return {
        success: false,
        error: {
          code: 'UPDATE_ORDER_STATUS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update order status',
          retryable: true
        }
      }
    }
  }

  /**
   * Mark order as ready to ship (if allowed)
   * This is one of the few status updates allowed via Shopee API
   */
  private async markAsReadyToShip(
    orderId: string, 
    trackingNumber?: string, 
    notes?: string
  ): Promise<ConnectorResponse<void>> {
    try {
      const idempotencyKey = this.client.generateIdempotencyKey()
      
      const updateData: any = {
        order_id: orderId,
        order_status: 'ready_to_ship'
      }

      if (trackingNumber) {
        updateData.tracking_no = trackingNumber
      }

      if (notes) {
        updateData.notes = notes
      }

      const response = await this.client.request(
        '/api/v1/orders/update_shipping_status',
        {
          body: updateData,
          idempotencyKey: idempotencyKey.key
        }
      )

      if (response.success) {
        console.log(`${this.logPrefix} Marked order ${orderId} as ready to ship`)
        return { success: true }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error marking order as ready to ship:`, error)
      return {
        success: false,
        error: {
          code: 'MARK_READY_TO_SHIP_ERROR',
          message: error instanceof Error ? error.message : 'Failed to mark order as ready to ship',
          retryable: true
        }
      }
    }
  }

  /**
   * Get list of allowed status updates for the current account
   * This would typically be fetched from Shopee's API
   */
  private async getAllowedStatusUpdates(): Promise<OrderStatus[]> {
    // Shopee API restrictions:
    // - Most status changes require manual action in seller dashboard
    // - Only 'ready_to_ship' is typically allowed via API
    return ['processing'] // Only ready_to_ship (mapped to processing)
  }

  // =============================================================================
  // TRANSFORMATION HELPERS
  // =============================================================================

  /**
   * Transform order from Shopee format to internal format
   */
  private transformOrderFromShopee(shopeeOrder: ShopeeOrder): OrderDetail {
    return {
      id: shopeeOrder.order_id,
      orderNumber: shopeeOrder.order_sn,
      platformOrderId: shopeeOrder.order_id,
      status: this.mapStatusFromShopee(shopeeOrder.order_status),
      paymentStatus: this.mapPaymentStatusFromShopee(shopeeOrder.payment_status),
      totalAmount: shopeeOrder.total_price,
      currency: 'SGD', // Will need to be determined from account settings
      customer: {
        name: shopeeOrder.recipient_name,
        email: '', // Shopee doesn't provide email in basic order info
        phone: shopeeOrder.recipient_phone
      },
      items: shopeeOrder.items.map(item => ({
        id: item.item_id,
        productId: item.item_id,
        title: item.item_name,
        sku: item.item_sku,
        quantity: item.quantity,
        price: item.item_price,
        total: item.subtotal
      })),
      shippingAddress: {
        name: shopeeOrder.recipient_name,
        phone: shopeeOrder.recipient_phone,
        addressLine1: shopeeOrder.recipient_address,
        city: shopeeOrder.city,
        state: shopeeOrder.district,
        postalCode: shopeeOrder.zipcode,
        country: shopeeOrder.country
      },
      createdAt: new Date(shopeeOrder.create_time * 1000),
      updatedAt: new Date(shopeeOrder.update_time * 1000),
      orderDate: new Date(shopeeOrder.create_time * 1000)
    }
  }

  /**
   * Map internal status to Shopee status
   */
  private mapStatusToShopee(status: OrderStatus): string {
    switch (status) {
      case 'pending':
        return 'unpaid'
      case 'paid':
        return 'paid'
      case 'processing':
        return 'ready_to_ship'
      case 'shipped':
        return 'shipped'
      case 'delivered':
        return 'delivered'
      case 'cancelled':
        return 'cancelled'
      case 'refunded':
        return 'refunded'
      default:
        return 'unpaid'
    }
  }

  /**
   * Map Shopee status to internal status
   */
  private mapStatusFromShopee(shopeeStatus: string): OrderStatus {
    return SHOPEE_ORDER_STATUS_MAPPING[shopeeStatus] || 'pending'
  }

  /**
   * Map Shopee payment status to internal payment status
   */
  private mapPaymentStatusFromShopee(shopeePaymentStatus: string): PaymentStatus {
    return SHOPEE_PAYMENT_STATUS_MAPPING[shopeePaymentStatus] || 'unpaid'
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ShopeeOrders