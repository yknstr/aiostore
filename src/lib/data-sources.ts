/**
 * AIOStore Data Sources Configuration
 * 
 * Manages feature flags for switching between mock data and Supabase data
 * per module (Products, Orders, Customers, Transactions, Messages)
 */

import { Product, Order, Transaction } from '@/types'
import { PlatformType } from '@/types/product'

// Data source types
export type DataSource = 'mock' | 'supabase'

// Feature flag configuration
export interface DataSourceConfig {
  products: DataSource
  orders: DataSource
  customers: DataSource
  transactions: DataSource
  messages: DataSource
}

// Default configuration (all mock data)
const DEFAULT_CONFIG: DataSourceConfig = {
  products: (process.env.DATA_SOURCE_PRODUCTS as DataSource) || 'mock',
  orders: (process.env.DATA_SOURCE_ORDERS as DataSource) || 'mock',
  customers: (process.env.DATA_SOURCE_CUSTOMERS as DataSource) || 'mock',
  transactions: (process.env.DATA_SOURCE_TRANSACTIONS as DataSource) || 'mock',
  messages: (process.env.DATA_SOURCE_MESSAGES as DataSource) || 'mock',
}

// Validate environment variables
Object.entries(DEFAULT_CONFIG).forEach(([module, source]) => {
  if (source !== 'mock' && source !== 'supabase') {
    console.warn(`⚠️ Invalid DATA_SOURCE_${module.toUpperCase()}: ${source}. Using 'mock'.`)
  }
})

/**
 * Data source configuration instance
 */
export class DataSourceManager {
  private config: DataSourceConfig

  constructor(config: Partial<DataSourceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Get current data source for a module
   */
  getSource(module: keyof DataSourceConfig): DataSource {
    return this.config[module]
  }

  /**
   * Check if a module should use Supabase
   */
  useSupabase(module: keyof DataSourceConfig): boolean {
    return this.config[module] === 'supabase'
  }

  /**
   * Check if a module should use mock data
   */
  useMock(module: keyof DataSourceConfig): boolean {
    return this.config[module] === 'mock'
  }

  /**
   * Set data source for a module
   */
  setSource(module: keyof DataSourceConfig, source: DataSource): void {
    this.config[module] = source
  }

  /**
   * Get full configuration
   */
  getConfig(): DataSourceConfig {
    return { ...this.config }
  }

  /**
   * Toggle data source for a module
   */
  toggleSource(module: keyof DataSourceConfig): DataSource {
    const current = this.config[module]
    const newSource = current === 'mock' ? 'supabase' : 'mock'
    this.config[module] = newSource
    return newSource
  }

  /**
   * Check if Supabase is properly configured
   */
  isSupabaseConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }
}

// Global instance
export const dataSourceManager = new DataSourceManager()

/**
 * Type-safe feature flag checking
 */
export const featureFlags = {
  // Products
  get products(): DataSource {
    return dataSourceManager.getSource('products')
  },
  useProductsSupabase(): boolean {
    return dataSourceManager.useSupabase('products')
  },
  useProductsMock(): boolean {
    return dataSourceManager.useMock('products')
  },

  // Orders
  get orders(): DataSource {
    return dataSourceManager.getSource('orders')
  },
  useOrdersSupabase(): boolean {
    return dataSourceManager.useSupabase('orders')
  },
  useOrdersMock(): boolean {
    return dataSourceManager.useMock('orders')
  },

  // Customers
  get customers(): DataSource {
    return dataSourceManager.getSource('customers')
  },
  useCustomersSupabase(): boolean {
    return dataSourceManager.useSupabase('customers')
  },
  useCustomersMock(): boolean {
    return dataSourceManager.useMock('customers')
  },

  // Transactions
  get transactions(): DataSource {
    return dataSourceManager.getSource('transactions')
  },
  useTransactionsSupabase(): boolean {
    return dataSourceManager.useSupabase('transactions')
  },
  useTransactionsMock(): boolean {
    return dataSourceManager.useMock('transactions')
  },

  // Messages
  get messages(): DataSource {
    return dataSourceManager.getSource('messages')
  },
  useMessagesSupabase(): boolean {
    return dataSourceManager.useSupabase('messages')
  },
  useMessagesMock(): boolean {
    return dataSourceManager.useMock('messages')
  },

  // System-wide checks
  isSupabaseConfigured(): boolean {
    return dataSourceManager.isSupabaseConfigured()
  },
  get allSources(): DataSourceConfig {
    return dataSourceManager.getConfig()
  },
}

/**
 * Development helper: Log current data source configuration
 */
export function logDataSourceConfig(): void {
  console.group('🔄 AIOStore Data Source Configuration')
  console.log('Products:', featureFlags.products)
  console.log('Orders:', featureFlags.orders)
  console.log('Customers:', featureFlags.customers)
  console.log('Transactions:', featureFlags.transactions)
  console.log('Messages:', featureFlags.messages)
  console.log('Supabase Configured:', featureFlags.isSupabaseConfigured() ? '✅' : '❌')
  console.groupEnd()
}

// Log configuration on module load (development only)
if (process.env.NODE_ENV === 'development') {
  logDataSourceConfig()
}

/**
 * Query builder for Supabase operations
 */
export class SupabaseQueryBuilder {
  private query: any

  constructor(table: string) {
    this.query = { from: table }
  }

  /**
   * Select columns
   */
  select(columns: string = '*'): this {
    this.query = this.query.select(columns)
    return this
  }

  /**
   * Add equals filter
   */
  eq(column: string, value: any): this {
    this.query = this.query.eq(column, value)
    return this
  }

  /**
   * Add IN filter
   */
  in(column: string, values: any[]): this {
    this.query = this.query.in(column, values)
    return this
  }

  /**
   * Add ILIKE filter (case-insensitive)
   */
  ilike(column: string, pattern: string): this {
    this.query = this.query.ilike(column, `%${pattern}%`)
    return this
  }

  /**
   * Add order
   */
  order(column: string, ascending: boolean = true): this {
    this.query = this.query.order(column, { ascending })
    return this
  }

  /**
   * Add range (pagination)
   */
  range(from: number, to: number): this {
    this.query = this.query.range(from, to)
    return this
  }

  /**
   * Add limit
   */
  limit(count: number): this {
    this.query = this.query.limit(count)
    return this
  }

  /**
   * Execute query
   */
  async execute() {
    const { data, error } = await this.query
    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }
    return data
  }

  /**
   * Get the raw query
   */
  getQuery() {
    return this.query
  }
}

/**
 * Utility functions for data transformation
 */
export const dataTransformers = {
  /**
   * Transform database snake_case to camelCase
   */
  snakeToCamel(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.snakeToCamel(item))
    }
    
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    const camelObj: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
        camelObj[camelKey] = this.snakeToCamel(obj[key])
      }
    }
    return camelObj
  },

  /**
   * Transform camelCase to snake_case
   */
  camelToSnake(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.camelToSnake(item))
    }
    
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    const snakeObj: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        snakeObj[snakeKey] = this.camelToSnake(obj[key])
      }
    }
    return snakeObj
  },

  /**
   * Format date for database
   */
  formatDate(date: Date): string {
    return date.toISOString()
  },

  /**
   * Parse date from database
   */
  parseDate(dateString: string): Date {
    return new Date(dateString)
  },
}

export default DataSourceManager