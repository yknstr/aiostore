/**
 * Transactions Service Layer
 * 
 * Provides unified interface for Transactions data with feature flag switching
 * between mock data and Supabase database
 */

import { Transaction, TransactionType, TransactionCategory } from '@/types/transaction'
import { PlatformType } from '@/types/product'
import { mockTransactions as mockTransactionsData, getTransactionById as getMockTransactionById, filterTransactions as filterMockTransactions } from '@/lib/mock-data/transactions'
import { supabase } from '@/lib/supabase'
import { featureFlags, dataTransformers } from '@/lib/data-sources'

// Transaction filter interface
export interface TransactionFilters {
  type?: TransactionType
  category?: TransactionCategory
  platform?: PlatformType
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
  paymentMethod?: string
}

// Service response interface
export interface TransactionServiceResponse<T = any> {
  data: T
  success: boolean
  error?: string
  source: 'mock' | 'supabase'
  timestamp: Date
}

/**
 * Transactions Service Class
 */
export class TransactionsService {
  private readonly tableName = 'transactions'
  private readonly logPrefix = '[TransactionsService]'

  /**
   * Get all transactions with optional filtering
   */
  async listTransactions(filters: TransactionFilters = {}): Promise<TransactionServiceResponse<Transaction[]>> {
    const source = featureFlags.transactions
    const startTime = Date.now()

    try {
      if (featureFlags.useTransactionsSupabase()) {
        const data = await this.getTransactionsFromSupabase(filters)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const data = await this.getTransactionsFromMock(filters)
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
   * Get a single transaction by ID
   */
  async getTransactionById(id: string): Promise<TransactionServiceResponse<Transaction | null>> {
    const source = featureFlags.transactions
    const startTime = Date.now()

    try {
      if (featureFlags.useTransactionsSupabase()) {
        const data = await this.getTransactionFromSupabase(id)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const data = await this.getTransactionFromMock(id)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} getTransactionById error:`, error)
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    } finally {
      const duration = Date.now() - startTime
      console.log(`${this.logPrefix} getTransactionById ${source} query completed in ${duration}ms`)
    }
  }

  /**
   * Filter transactions (alias for listTransactions with filters)
   */
  async filterTransactions(filters: TransactionFilters): Promise<TransactionServiceResponse<Transaction[]>> {
    return this.listTransactions(filters)
  }

  /**
   * Get transaction summary (income, expenses, net profit)
   */
  async getTransactionSummary(filters: TransactionFilters = {}): Promise<TransactionServiceResponse<{
    totalIncome: number
    totalExpenses: number
    netProfit: number
    transactionCount: number
    averageTransaction: number
  }>> {
    const source = featureFlags.transactions

    try {
      if (featureFlags.useTransactionsSupabase()) {
        const transactions = await this.getTransactionsFromSupabase(filters)
        
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        
        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        
        const summary = {
          totalIncome,
          totalExpenses,
          netProfit: totalIncome - totalExpenses,
          transactionCount: transactions.length,
          averageTransaction: transactions.length > 0 ? (totalIncome + totalExpenses) / transactions.length : 0,
        }

        return {
          data: summary,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const transactions = await this.getTransactionsFromMock(filters)
        
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        
        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        
        const summary = {
          totalIncome,
          totalExpenses,
          netProfit: totalIncome - totalExpenses,
          transactionCount: transactions.length,
          averageTransaction: transactions.length > 0 ? (totalIncome + totalExpenses) / transactions.length : 0,
        }

        return {
          data: summary,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} getTransactionSummary error:`, error)
      return {
        data: {
          totalIncome: 0,
          totalExpenses: 0,
          netProfit: 0,
          transactionCount: 0,
          averageTransaction: 0,
        },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Get transactions by category
   */
  async getTransactionsByCategory(filters: TransactionFilters = {}): Promise<TransactionServiceResponse<Record<TransactionCategory, number>>> {
    const source = featureFlags.transactions

    try {
      if (featureFlags.useTransactionsSupabase()) {
        const transactions = await this.getTransactionsFromSupabase(filters)
        
        const categoryTotals: Record<TransactionCategory, number> = {
          sales: 0,
          refund_received: 0,
          other_income: 0,
          product_cost: 0,
          shipping_cost: 0,
          packaging: 0,
          marketing: 0,
          platform_fee: 0,
          other_expense: 0,
        }

        transactions.forEach(transaction => {
          const amount = transaction.type === 'income' ? transaction.amount : Math.abs(transaction.amount)
          categoryTotals[transaction.category] += amount
        })

        return {
          data: categoryTotals,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const transactions = await this.getTransactionsFromMock(filters)
        
        const categoryTotals: Record<TransactionCategory, number> = {
          sales: 0,
          refund_received: 0,
          other_income: 0,
          product_cost: 0,
          shipping_cost: 0,
          packaging: 0,
          marketing: 0,
          platform_fee: 0,
          other_expense: 0,
        }

        transactions.forEach(transaction => {
          const amount = transaction.type === 'income' ? transaction.amount : Math.abs(transaction.amount)
          categoryTotals[transaction.category] += amount
        })

        return {
          data: categoryTotals,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} getTransactionsByCategory error:`, error)
      return {
        data: {
          sales: 0,
          refund_received: 0,
          other_income: 0,
          product_cost: 0,
          shipping_cost: 0,
          packaging: 0,
          marketing: 0,
          platform_fee: 0,
          other_expense: 0,
        },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Get platform revenue breakdown
   */
  async getPlatformRevenue(filters: TransactionFilters = {}): Promise<TransactionServiceResponse<Record<PlatformType, number>>> {
    const source = featureFlags.transactions

    try {
      if (featureFlags.useTransactionsSupabase()) {
        const transactions = await this.getTransactionsFromSupabase({ ...filters, type: 'income' })
        
        const platformRevenue: Record<PlatformType, number> = {
          shopee: 0,
          tiktok: 0,
          tokopedia: 0,
          lazada: 0,
        }

        transactions.forEach(transaction => {
          if (transaction.platform) {
            platformRevenue[transaction.platform] += transaction.amount
          }
        })

        return {
          data: platformRevenue,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const transactions = await this.getTransactionsFromMock({ ...filters, type: 'income' })
        
        const platformRevenue: Record<PlatformType, number> = {
          shopee: 0,
          tiktok: 0,
          tokopedia: 0,
          lazada: 0,
        }

        transactions.forEach(transaction => {
          if (transaction.platform) {
            platformRevenue[transaction.platform] += transaction.amount
          }
        })

        return {
          data: platformRevenue,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} getPlatformRevenue error:`, error)
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

  // Private methods

  /**
   * Get transactions from mock data
   */
  private async getTransactionsFromMock(filters: TransactionFilters): Promise<Transaction[]> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return filterMockTransactions(filters)
  }

  /**
   * Get a single transaction from mock data
   */
  private async getTransactionFromMock(id: string): Promise<Transaction | null> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50))
    
    return getMockTransactionById(id) || null
  }

  /**
   * Get transactions from Supabase
   */
  private async getTransactionsFromSupabase(filters: TransactionFilters): Promise<Transaction[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.platform) {
        query = query.eq('platform', filters.platform)
      }

      if (filters.paymentMethod) {
        query = query.ilike('payment_method', `%${filters.paymentMethod}%`)
      }

      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom.toISOString())
      }

      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo.toISOString())
      }

      if (filters.minAmount) {
        query = query.gte('amount', filters.minAmount)
      }

      if (filters.maxAmount) {
        query = query.lte('amount', filters.maxAmount)
      }

      // Order by date descending
      query = query.order('date', { ascending: false })

      const { data, error } = await query

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      // Transform from snake_case to camelCase
      return (data || []).map(transaction => {
        const transformed = dataTransformers.snakeToCamel(transaction) as Transaction
        return transformed
      })
    } catch (error) {
      console.error(`${this.logPrefix} Supabase query failed:`, error)
      throw error
    }
  }

  /**
   * Get a single transaction from Supabase
   */
  private async getTransactionFromSupabase(id: string): Promise<Transaction | null> {
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
      return dataTransformers.snakeToCamel(data) as Transaction
    } catch (error) {
      console.error(`${this.logPrefix} getTransactionFromSupabase error:`, error)
      throw error
    }
  }
}

// Export singleton instance
export const transactionsService = new TransactionsService()

// Export utility functions for easy use
export const listTransactionsService = (filters?: TransactionFilters) => transactionsService.listTransactions(filters)
export const getTransactionByIdService = (id: string) => transactionsService.getTransactionById(id)
export const filterTransactionsService = (filters: TransactionFilters) => transactionsService.filterTransactions(filters)
export const getTransactionSummaryService = (filters?: TransactionFilters) => transactionsService.getTransactionSummary(filters)
export const getTransactionsByCategoryService = (filters?: TransactionFilters) => transactionsService.getTransactionsByCategory(filters)
export const getPlatformRevenueService = (filters?: TransactionFilters) => transactionsService.getPlatformRevenue(filters)

export default transactionsService