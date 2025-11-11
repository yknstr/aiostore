/**
 * Orders Service Layer
 * 
 * Provides unified interface for Orders data with feature flag switching
 * between mock data and Supabase database
 */

import { Order, OrderStatus, PaymentStatus } from '@/types/order'
import { PlatformType } from '@/types/product'
import { mockOrders as mockOrdersData, getOrderById as getMockOrderById, filterOrders as filterMockOrders } from '@/lib/mock-data/orders'
import { supabase } from '@/lib/supabase'
import { featureFlags, dataTransformers } from '@/lib/data-sources'

// Order filter interface
export interface OrderFilters {
  search?: string
  platform?: PlatformType
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  dateFrom?: Date
  dateTo?: Date
  customerName?: string
}

// Service response interface
export interface OrderServiceResponse<T = any> {
  data: T
  success: boolean
  error?: string
  source: 'mock' | 'supabase'
  timestamp: Date
}

/**
 * Orders Service Class
 */
export class OrdersService {
  private readonly tableName = 'orders'
  private readonly logPrefix = '[OrdersService]'

  /**
   * Get all orders with optional filtering
   */
  async listOrders(filters: OrderFilters = {}): Promise<OrderServiceResponse<Order[]>> {
    const source = featureFlags.orders
    const startTime = Date.now()

    try {
      if (featureFlags.useOrdersSupabase()) {
        const data = await this.getOrdersFromSupabase(filters)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const data = await this.getOrdersFromMock(filters)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error:`, error)
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    } finally {
      const duration = Date.now() - startTime
      console.log(`${this.logPrefix} ${source} query completed in ${duration}ms`)
    }
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(id: string): Promise<OrderServiceResponse<Order | null>> {
    const source = featureFlags.orders
    const startTime = Date.now()

    try {
      if (featureFlags.useOrdersSupabase()) {
        const data = await this.getOrderFromSupabase(id)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const data = await this.getOrderFromMock(id)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} getOrderById error:`, error)
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    } finally {
      const duration = Date.now() - startTime
      console.log(`${this.logPrefix} getOrderById ${source} query completed in ${duration}ms`)
    }
  }

  /**
   * Filter orders (alias for listOrders with filters)
   */
  async filterOrders(filters: OrderFilters): Promise<OrderServiceResponse<Order[]>> {
    return this.listOrders(filters)
  }

  // Private methods

  /**
   * Get orders from mock data
   */
  private async getOrdersFromMock(filters: OrderFilters): Promise<Order[]> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return filterMockOrders(filters)
  }

  /**
   * Get a single order from mock data
   */
  private async getOrderFromMock(id: string): Promise<Order | null> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50))
    
    return getMockOrderById(id) || null
  }

  /**
   * Get orders from Supabase
   */
  private async getOrdersFromSupabase(filters: OrderFilters): Promise<Order[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')

      // Apply filters
      if (filters.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,platform_order_id.ilike.%${filters.search}%`)
      }

      if (filters.platform) {
        query = query.eq('platform', filters.platform)
      }

      if (filters.status) {
        query = query.eq('order_status', filters.status)
      }

      if (filters.paymentStatus) {
        query = query.eq('payment_status', filters.paymentStatus)
      }

      if (filters.customerName) {
        query = query.ilike('customer_name', `%${filters.customerName}%`)
      }

      if (filters.dateFrom) {
        query = query.gte('order_date', filters.dateFrom.toISOString())
      }

      if (filters.dateTo) {
        query = query.lte('order_date', filters.dateTo.toISOString())
      }

      // Order by order_date descending
      query = query.order('order_date', { ascending: false })

      const { data, error } = await query

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      // Transform from snake_case to camelCase and handle nested objects
      const transformedData = (data || []).map(order => {
        const transformed = dataTransformers.snakeToCamel(order) as Order
        
        // Parse JSON fields that are stored as strings in Supabase
        if (typeof transformed.shippingAddress === 'string') {
          try {
            transformed.shippingAddress = JSON.parse(transformed.shippingAddress)
          } catch {
            // Keep as string if parsing fails
          }
        }
        
        if (typeof transformed.items === 'string') {
          try {
            transformed.items = JSON.parse(transformed.items)
          } catch {
            // Keep as string if parsing fails
          }
        }
        
        return transformed
      })

      return transformedData
    } catch (error) {
      console.error(`${this.logPrefix} Supabase query failed:`, error)
      throw error
    }
  }

  /**
   * Get a single order from Supabase
   */
  private async getOrderFromSupabase(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        throw new Error(`Supabase error: ${error.message}`)
      }

      // Transform from snake_case to camelCase
      const transformed = dataTransformers.snakeToCamel(data) as Order
      
      // Parse JSON fields that are stored as strings in Supabase
      if (typeof transformed.shippingAddress === 'string') {
        try {
          transformed.shippingAddress = JSON.parse(transformed.shippingAddress)
        } catch {
          // Keep as string if parsing fails
        }
      }
      
      if (typeof transformed.items === 'string') {
        try {
          transformed.items = JSON.parse(transformed.items)
        } catch {
          // Keep as string if parsing fails
        }
      }
      
      return transformed
    } catch (error) {
      console.error(`${this.logPrefix} getOrderFromSupabase error:`, error)
      throw error
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(): Promise<OrderServiceResponse<{
    total: number
    pending: number
    paid: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
    totalRevenue: number
  }>> {
    const source = featureFlags.orders

    try {
      if (featureFlags.useOrdersSupabase()) {
        const orders = await this.getOrdersFromSupabase({})
        
        const stats = {
          total: orders.length,
          pending: orders.filter(o => o.orderStatus === 'pending').length,
          paid: orders.filter(o => o.orderStatus === 'paid').length,
          processing: orders.filter(o => o.orderStatus === 'processing').length,
          shipped: orders.filter(o => o.orderStatus === 'shipped').length,
          delivered: orders.filter(o => o.orderStatus === 'delivered').length,
          cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
          totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
        }

        return {
          data: stats,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const orders = await this.getOrdersFromMock({})
        
        const stats = {
          total: orders.length,
          pending: orders.filter(o => o.orderStatus === 'pending').length,
          paid: orders.filter(o => o.orderStatus === 'paid').length,
          processing: orders.filter(o => o.orderStatus === 'processing').length,
          shipped: orders.filter(o => o.orderStatus === 'shipped').length,
          delivered: orders.filter(o => o.orderStatus === 'delivered').length,
          cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
          totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
        }

        return {
          data: stats,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} getOrderStats error:`, error)
      return {
        data: {
          total: 0,
          pending: 0,
          paid: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          totalRevenue: 0,
        },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Get orders by platform
   */
  async getOrdersByPlatform(): Promise<OrderServiceResponse<Record<PlatformType, number>>> {
    const source = featureFlags.orders

    try {
      if (featureFlags.useOrdersSupabase()) {
        const orders = await this.getOrdersFromSupabase({})
        
        const platformStats: Record<PlatformType, number> = {
          shopee: 0,
          tiktok: 0,
          tokopedia: 0,
          lazada: 0,
        }

        orders.forEach(order => {
          platformStats[order.platform] = (platformStats[order.platform] || 0) + 1
        })

        return {
          data: platformStats,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const orders = await this.getOrdersFromMock({})
        
        const platformStats: Record<PlatformType, number> = {
          shopee: 0,
          tiktok: 0,
          tokopedia: 0,
          lazada: 0,
        }

        orders.forEach(order => {
          platformStats[order.platform] = (platformStats[order.platform] || 0) + 1
        })

        return {
          data: platformStats,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} getOrdersByPlatform error:`, error)
      return {
        data: {
          shopee: 0,
          tiktok: 0,
          tokopedia: 0,
          lazada: 0,
        },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    }
  }
}

// Export singleton instance
export const ordersService = new OrdersService()

// Export utility functions for easy use
export const listOrdersService = (filters?: OrderFilters) => ordersService.listOrders(filters)
export const getOrderByIdService = (id: string) => ordersService.getOrderById(id)
export const filterOrdersService = (filters: OrderFilters) => ordersService.filterOrders(filters)
export const getOrderStatsService = () => ordersService.getOrderStats()
export const getOrdersByPlatformService = () => ordersService.getOrdersByPlatform()

export default ordersService