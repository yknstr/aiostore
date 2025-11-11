/**
 * Customers Service Layer
 * 
 * Provides unified interface for Customers data with feature flag switching
 * between mock data (derived from orders) and Supabase database
 */

import { PlatformType } from '@/types/product'
import { supabase } from '@/lib/supabase'
import { featureFlags, dataTransformers } from '@/lib/data-sources'

// Customer interface (derived from orders data)
export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  platform: PlatformType
  totalOrders: number
  totalSpent: number
  createdAt: Date
  updatedAt: Date
}

// Customer filter interface
export interface CustomerFilters {
  search?: string
  platform?: PlatformType
  minOrders?: number
  minSpent?: number
}

// Service response interface
export interface CustomerServiceResponse<T = any> {
  data: T
  success: boolean
  error?: string
  source: 'mock' | 'supabase'
  timestamp: Date
}

/**
 * Customers Service Class
 */
export class CustomersService {
  private readonly tableName = 'customers'
  private readonly logPrefix = '[CustomersService]'

  /**
   * Get all customers with optional filtering
   */
  async listCustomers(filters: CustomerFilters = {}): Promise<CustomerServiceResponse<Customer[]>> {
    const source = featureFlags.customers
    const startTime = Date.now()

    try {
      if (featureFlags.useCustomersSupabase()) {
        const data = await this.getCustomersFromSupabase(filters)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const data = await this.getCustomersFromMock(filters)
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
   * Get a single customer by ID
   */
  async getCustomerById(id: string): Promise<CustomerServiceResponse<Customer | null>> {
    const source = featureFlags.customers
    const startTime = Date.now()

    try {
      if (featureFlags.useCustomersSupabase()) {
        const data = await this.getCustomerFromSupabase(id)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const data = await this.getCustomerFromMock(id)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} getCustomerById error:`, error)
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    } finally {
      const duration = Date.now() - startTime
      console.log(`${this.logPrefix} getCustomerById ${source} query completed in ${duration}ms`)
    }
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(): Promise<CustomerServiceResponse<{
    total: number
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    platformBreakdown: Record<PlatformType, number>
  }>> {
    const source = featureFlags.customers

    try {
      if (featureFlags.useCustomersSupabase()) {
        const customers = await this.getCustomersFromSupabase({})
        
        const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0)
        const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0)
        
        const stats = {
          total: customers.length,
          totalOrders,
          totalSpent,
          averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
          platformBreakdown: {
            shopee: customers.filter(c => c.platform === 'shopee').length,
            tiktok: customers.filter(c => c.platform === 'tiktok').length,
            tokopedia: customers.filter(c => c.platform === 'tokopedia').length,
            lazada: customers.filter(c => c.platform === 'lazada').length,
          }
        }

        return {
          data: stats,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const customers = await this.getCustomersFromMock({})
        
        const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0)
        const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0)
        
        const stats = {
          total: customers.length,
          totalOrders,
          totalSpent,
          averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
          platformBreakdown: {
            shopee: customers.filter(c => c.platform === 'shopee').length,
            tiktok: customers.filter(c => c.platform === 'tiktok').length,
            tokopedia: customers.filter(c => c.platform === 'tokopedia').length,
            lazada: customers.filter(c => c.platform === 'lazada').length,
          }
        }

        return {
          data: stats,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} getCustomerStats error:`, error)
      return {
        data: {
          total: 0,
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          platformBreakdown: {
            shopee: 0,
            tiktok: 0,
            tokopedia: 0,
            lazada: 0,
          }
        },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    }
  }

  // Private methods

  /**
   * Get customers from mock data (derived from orders)
   */
  private async getCustomersFromMock(filters: CustomerFilters): Promise<Customer[]> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Import orders to derive customers
    const { mockOrders } = await import('@/lib/mock-data/orders')
    
    // Aggregate customers from orders
    const customerMap = new Map<string, Customer>()
    
    mockOrders.forEach(order => {
      const existing = customerMap.get(order.customerName)
      
      if (existing) {
        existing.totalOrders += 1
        existing.totalSpent += order.total
        existing.updatedAt = new Date()
      } else {
        customerMap.set(order.customerName, {
          id: `customer-${order.customerName.toLowerCase().replace(' ', '-')}`,
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
          platform: order.platform,
          totalOrders: 1,
          totalSpent: order.total,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    })
    
    let customers = Array.from(customerMap.values())
    
    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase()
      customers = customers.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.phone?.includes(search)
      )
    }
    
    if (filters.platform) {
      customers = customers.filter(c => c.platform === filters.platform)
    }
    
    if (filters.minOrders) {
      customers = customers.filter(c => c.totalOrders >= filters.minOrders!)
    }
    
    if (filters.minSpent) {
      customers = customers.filter(c => c.totalSpent >= filters.minSpent!)
    }
    
    return customers.sort((a, b) => b.totalSpent - a.totalSpent)
  }

  /**
   * Get a single customer from mock data
   */
  private async getCustomerFromMock(id: string): Promise<Customer | null> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50))
    
    const customers = await this.getCustomersFromMock({})
    return customers.find(c => c.id === id) || null
  }

  /**
   * Get customers from Supabase
   */
  private async getCustomersFromSupabase(filters: CustomerFilters): Promise<Customer[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
      }

      if (filters.platform) {
        query = query.eq('platform', filters.platform)
      }

      if (filters.minOrders) {
        query = query.gte('total_orders', filters.minOrders)
      }

      if (filters.minSpent) {
        query = query.gte('total_spent', filters.minSpent)
      }

      // Order by total_spent descending
      query = query.order('total_spent', { ascending: false })

      const { data, error } = await query

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      // Transform from snake_case to camelCase
      return (data || []).map(customer => {
        const transformed = dataTransformers.snakeToCamel(customer) as Customer
        
        // Parse JSON fields if needed
        if (typeof transformed.avatar === 'string' && transformed.avatar.startsWith('[')) {
          try {
            transformed.avatar = JSON.parse(transformed.avatar)
          } catch {
            // Keep as string if parsing fails
          }
        }
        
        return transformed
      })
    } catch (error) {
      console.error(`${this.logPrefix} Supabase query failed:`, error)
      throw error
    }
  }

  /**
   * Get a single customer from Supabase
   */
  private async getCustomerFromSupabase(id: string): Promise<Customer | null> {
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
      const transformed = dataTransformers.snakeToCamel(data) as Customer
      
      return transformed
    } catch (error) {
      console.error(`${this.logPrefix} getCustomerFromSupabase error:`, error)
      throw error
    }
  }
}

// Export singleton instance
export const customersService = new CustomersService()

// Export utility functions for easy use
export const listCustomersService = (filters?: CustomerFilters) => customersService.listCustomers(filters)
export const getCustomerByIdService = (id: string) => customersService.getCustomerById(id)
export const getCustomerStatsService = () => customersService.getCustomerStats()

export default customersService