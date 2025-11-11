/**
 * Unified Data Service
 * 
 * Provides a single interface for all data operations with feature flag support.
 * This service acts as a facade over individual services and makes it easy to 
 * toggle between mock and Supabase data sources.
 */

import { Product } from '@/types/product'
import { Order } from '@/types/order'
import { Transaction } from '@/types/transaction'
import { Message, Conversation } from '@/types/message'

// Import individual services
import { 
  productsService, 
  listProductsService, 
  getProductByIdService, 
  filterProductsService,
  getProductStatsService,
  type ProductFilters 
} from './products-service'

import { 
  ordersService,
  listOrdersService, 
  getOrderByIdService, 
  filterOrdersService,
  getOrderStatsService,
  getOrdersByPlatformService,
  type OrderFilters 
} from './orders-service'

import {
  customersService,
  listCustomersService,
  getCustomerByIdService,
  getCustomerStatsService,
  type CustomerFilters
} from './customers-service'

import {
  transactionsService,
  listTransactionsService,
  getTransactionByIdService,
  filterTransactionsService,
  getTransactionSummaryService,
  getTransactionsByCategoryService,
  getPlatformRevenueService,
  type TransactionFilters
} from './transactions-service'

import {
  messagesService,
  listMessagesService,
  listConversationsService,
  getMessagesByConversationIdService,
  getConversationByIdService,
  getConversationStatsService,
  type MessageFilters,
  type ConversationFilters
} from './messages-service'

// Import feature flags and types
import { featureFlags } from '@/lib/data-sources'

// Unified service interfaces
export interface DataServiceConfig {
  products: {
    source: 'mock' | 'supabase'
    methods: string[]
  }
  orders: {
    source: 'mock' | 'supabase'
    methods: string[]
  }
  customers: {
    source: 'mock' | 'supabase'
    methods: string[]
  }
  transactions: {
    source: 'mock' | 'supabase'
    methods: string[]
  }
  messages: {
    source: 'mock' | 'supabase'
    methods: string[]
  }
}

export interface ServiceStatus {
  products: {
    available: boolean
    source: 'mock' | 'supabase'
    connected: boolean
    lastError?: string
  }
  orders: {
    available: boolean
    source: 'mock' | 'supabase'
    connected: boolean
    lastError?: string
  }
  customers: {
    available: boolean
    source: 'mock' | 'supabase'
    connected: boolean
    lastError?: string
  }
  transactions: {
    available: boolean
    source: 'mock' | 'supabase'
    connected: boolean
    lastError?: string
  }
  messages: {
    available: boolean
    source: 'mock' | 'supabase'
    connected: boolean
    lastError?: string
  }
}

/**
 * Unified Data Service Class
 */
export class DataService {
  private static instance: DataService
  private config: DataServiceConfig
  private status: ServiceStatus

  private constructor() {
    this.config = this.buildConfig()
    this.status = this.buildStatus()
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService()
    }
    return DataService.instance
  }

  /**
   * Build configuration from feature flags
   */
  private buildConfig(): DataServiceConfig {
    return {
      products: {
        source: featureFlags.products,
        methods: ['listProducts', 'getProductById', 'filterProducts', 'getProductStats']
      },
      orders: {
        source: featureFlags.orders,
        methods: ['listOrders', 'getOrderById', 'filterOrders', 'getOrderStats', 'getOrdersByPlatform']
      },
      customers: {
        source: featureFlags.customers,
        methods: ['listCustomers', 'getCustomerById', 'getCustomerStats']
      },
      transactions: {
        source: featureFlags.transactions,
        methods: ['listTransactions', 'getTransactionById', 'filterTransactions', 'getTransactionSummary', 'getTransactionsByCategory', 'getPlatformRevenue']
      },
      messages: {
        source: featureFlags.messages,
        methods: ['listMessages', 'listConversations', 'getMessagesByConversationId', 'getConversationById', 'getConversationStats']
      }
    }
  }

  /**
   * Build service status from configuration
   */
  private buildStatus(): ServiceStatus {
    return {
      products: {
        available: true,
        source: this.config.products.source,
        connected: true
      },
      orders: {
        available: true,
        source: this.config.orders.source,
        connected: true
      },
      customers: {
        available: true,
        source: this.config.customers.source,
        connected: true
      },
      transactions: {
        available: true,
        source: this.config.transactions.source,
        connected: true
      },
      messages: {
        available: true,
        source: this.config.messages.source,
        connected: true
      }
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): DataServiceConfig {
    return { ...this.config }
  }

  /**
   * Get service status
   */
  public getStatus(): ServiceStatus {
    return { ...this.status }
  }

  // Product Methods

  /**
   * List products with automatic data source selection
   */
  async listProducts(filters: ProductFilters = {}) {
    const source = featureFlags.products
    console.log(`📦 Using ${source} data source for products`)
    
    return productsService.listProducts(filters)
  }

  /**
   * Get product by ID with automatic data source selection
   */
  async getProductById(id: string) {
    const source = featureFlags.products
    console.log(`📦 Using ${source} data source for product ${id}`)
    
    return productsService.getProductById(id)
  }

  /**
   * Filter products with automatic data source selection
   */
  async filterProducts(filters: ProductFilters) {
    const source = featureFlags.products
    console.log(`📦 Using ${source} data source for product filtering`)
    
    return productsService.filterProducts(filters)
  }

  /**
   * Get product statistics with automatic data source selection
   */
  async getProductStats() {
    const source = featureFlags.products
    console.log(`📦 Using ${source} data source for product stats`)
    
    return productsService.getProductStats()
  }

  // Order Methods

  /**
   * List orders with automatic data source selection
   */
  async listOrders(filters: OrderFilters = {}) {
    const source = featureFlags.orders
    console.log(`🛒 Using ${source} data source for orders`)
    
    return ordersService.listOrders(filters)
  }

  /**
   * Get order by ID with automatic data source selection
   */
  async getOrderById(id: string) {
    const source = featureFlags.orders
    console.log(`🛒 Using ${source} data source for order ${id}`)
    
    return ordersService.getOrderById(id)
  }

  /**
   * Filter orders with automatic data source selection
   */
  async filterOrders(filters: OrderFilters) {
    const source = featureFlags.orders
    console.log(`🛒 Using ${source} data source for order filtering`)
    
    return ordersService.filterOrders(filters)
  }

  /**
   * Get order statistics with automatic data source selection
   */
  async getOrderStats() {
    const source = featureFlags.orders
    console.log(`🛒 Using ${source} data source for order stats`)
    
    return ordersService.getOrderStats()
  }

  /**
   * Get orders by platform with automatic data source selection
   */
  async getOrdersByPlatform() {
    const source = featureFlags.orders
    console.log(`🛒 Using ${source} data source for platform orders`)
    
    return ordersService.getOrdersByPlatform()
  }

  // Customer Methods

  /**
   * List customers with automatic data source selection
   */
  async listCustomers(filters: CustomerFilters = {}) {
    const source = featureFlags.customers
    console.log(`👥 Using ${source} data source for customers`)
    
    return customersService.listCustomers(filters)
  }

  /**
   * Get customer by ID with automatic data source selection
   */
  async getCustomerById(id: string) {
    const source = featureFlags.customers
    console.log(`👥 Using ${source} data source for customer ${id}`)
    
    return customersService.getCustomerById(id)
  }

  /**
   * Get customer statistics with automatic data source selection
   */
  async getCustomerStats() {
    const source = featureFlags.customers
    console.log(`👥 Using ${source} data source for customer stats`)
    
    return customersService.getCustomerStats()
  }

  // Transaction Methods

  /**
   * List transactions with automatic data source selection
   */
  async listTransactions(filters: TransactionFilters = {}) {
    const source = featureFlags.transactions
    console.log(`💰 Using ${source} data source for transactions`)
    
    return transactionsService.listTransactions(filters)
  }

  /**
   * Get transaction by ID with automatic data source selection
   */
  async getTransactionById(id: string) {
    const source = featureFlags.transactions
    console.log(`💰 Using ${source} data source for transaction ${id}`)
    
    return transactionsService.getTransactionById(id)
  }

  /**
   * Filter transactions with automatic data source selection
   */
  async filterTransactions(filters: TransactionFilters) {
    const source = featureFlags.transactions
    console.log(`💰 Using ${source} data source for transaction filtering`)
    
    return transactionsService.filterTransactions(filters)
  }

  /**
   * Get transaction summary with automatic data source selection
   */
  async getTransactionSummary(filters: TransactionFilters = {}) {
    const source = featureFlags.transactions
    console.log(`💰 Using ${source} data source for transaction summary`)
    
    return transactionsService.getTransactionSummary(filters)
  }

  /**
   * Get transactions by category with automatic data source selection
   */
  async getTransactionsByCategory(filters: TransactionFilters = {}) {
    const source = featureFlags.transactions
    console.log(`💰 Using ${source} data source for transaction categories`)
    
    return transactionsService.getTransactionsByCategory(filters)
  }

  /**
   * Get platform revenue with automatic data source selection
   */
  async getPlatformRevenue(filters: TransactionFilters = {}) {
    const source = featureFlags.transactions
    console.log(`💰 Using ${source} data source for platform revenue`)
    
    return transactionsService.getPlatformRevenue(filters)
  }

  // Message Methods

  /**
   * List messages with automatic data source selection
   */
  async listMessages(filters: MessageFilters = {}) {
    const source = featureFlags.messages
    console.log(`💬 Using ${source} data source for messages`)
    
    return messagesService.listMessages(filters)
  }

  /**
   * List conversations with automatic data source selection
   */
  async listConversations(filters: ConversationFilters = {}) {
    const source = featureFlags.messages
    console.log(`💬 Using ${source} data source for conversations`)
    
    return messagesService.listConversations(filters)
  }

  /**
   * Get messages by conversation with automatic data source selection
   */
  async getMessagesByConversationId(conversationId: string) {
    const source = featureFlags.messages
    console.log(`💬 Using ${source} data source for conversation ${conversationId}`)
    
    return messagesService.getMessagesByConversationId(conversationId)
  }

  /**
   * Get conversation by ID with automatic data source selection
   */
  async getConversationById(id: string) {
    const source = featureFlags.messages
    console.log(`💬 Using ${source} data source for conversation ${id}`)
    
    return messagesService.getConversationById(id)
  }

  /**
   * Get conversation statistics with automatic data source selection
   */
  async getConversationStats() {
    const source = featureFlags.messages
    console.log(`💬 Using ${source} data source for conversation stats`)
    
    return messagesService.getConversationStats()
  }

  /**
   * Toggle data source for a specific module
   */
  public toggleDataSource(module: keyof DataServiceConfig): 'mock' | 'supabase' {
    const currentSource = this.config[module].source
    const newSource = currentSource === 'mock' ? 'supabase' : 'mock'
    
    // Update feature flags (this would normally update environment variables)
    console.log(`🔄 Toggling ${module} from ${currentSource} to ${newSource}`)
    
    // Update configuration
    this.config[module].source = newSource
    this.status[module as keyof ServiceStatus].source = newSource
    
    return newSource
  }

  /**
   * Check if a service is available and working
   */
  public async checkServiceHealth(module: keyof DataServiceConfig): Promise<boolean> {
    try {
      if (module === 'products') {
        const result = await productsService.listProducts({})
        const isHealthy = result.success
        this.status.products.connected = isHealthy
        return isHealthy
      }
      
      if (module === 'orders') {
        const result = await ordersService.listOrders({})
        const isHealthy = result.success
        this.status.orders.connected = isHealthy
        return isHealthy
      }

      if (module === 'customers') {
        const result = await customersService.listCustomers({})
        const isHealthy = result.success
        this.status.customers.connected = isHealthy
        return isHealthy
      }

      if (module === 'transactions') {
        const result = await transactionsService.listTransactions({})
        const isHealthy = result.success
        this.status.transactions.connected = isHealthy
        return isHealthy
      }

      if (module === 'messages') {
        const result = await messagesService.listConversations({})
        const isHealthy = result.success
        this.status.messages.connected = isHealthy
        return isHealthy
      }
      
      return false
    } catch (error) {
      console.error(`Health check failed for ${module}:`, error)
      this.status[module as keyof ServiceStatus].lastError = error instanceof Error ? error.message : 'Unknown error'
      return false
    }
  }

  /**
   * Get summary of all services
   */
  public getServicesSummary() {
    const summary = {
      totalServices: Object.keys(this.config).length,
      activeServices: Object.values(this.status).filter(s => s.available && s.connected).length,
      mockServices: Object.values(this.config).filter(c => c.source === 'mock').length,
      supabaseServices: Object.values(this.config).filter(c => c.source === 'supabase').length,
      healthChecks: {
        products: this.status.products.connected ? '✅' : '❌',
        orders: this.status.orders.connected ? '✅' : '❌',
        customers: this.status.customers.connected ? '✅' : '❌',
        transactions: this.status.transactions.connected ? '✅' : '❌',
        messages: this.status.messages.connected ? '✅' : '❌'
      },
      configuration: {
        products: this.config.products.source,
        orders: this.config.orders.source,
        customers: this.config.customers.source,
        transactions: this.config.transactions.source,
        messages: this.config.messages.source
      }
    }
    
    return summary
  }

  /**
   * Log current service status to console
   */
  public logStatus() {
    console.group('📊 AIOStore Data Service Status')
    const summary = this.getServicesSummary()
    
    console.log('Summary:', summary)
    console.log('Health Checks:', summary.healthChecks)
    console.log('Configuration:', summary.configuration)
    
    console.groupEnd()
  }

  /**
   * Test all services and log results
   */
  public async testAllServices() {
    console.group('🧪 AIOStore Data Service Tests')
    
    const modules: Array<keyof DataServiceConfig> = ['products', 'orders', 'customers', 'transactions', 'messages']
    
    for (const serviceModule of modules) {
      const isHealthy = await this.checkServiceHealth(serviceModule)
      console.log(`${serviceModule}: ${isHealthy ? '✅' : '❌'} ${isHealthy ? 'Healthy' : 'Failed'}`)
      
      if (this.status[serviceModule as keyof ServiceStatus].lastError) {
        console.log(`  Error: ${this.status[serviceModule as keyof ServiceStatus].lastError}`)
      }
    }
    
    console.groupEnd()
  }
}

// Export singleton instance
export const dataService = DataService.getInstance()

// Export utility functions for backward compatibility
export const listProducts = dataService.listProducts.bind(dataService)
export const getProductById = dataService.getProductById.bind(dataService)
export const listOrders = dataService.listOrders.bind(dataService)
export const getOrderById = dataService.getOrderById.bind(dataService)
export const listCustomers = dataService.listCustomers.bind(dataService)
export const listTransactions = dataService.listTransactions.bind(dataService)
export const listMessages = dataService.listMessages.bind(dataService)

// Export feature flags for easy access
export { featureFlags }

export default dataService