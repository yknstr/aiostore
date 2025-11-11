/**
 * Messages Service Layer
 * 
 * Provides unified interface for Messages and Conversations data with feature flag switching
 * between mock data and Supabase database
 */

import { Message, Conversation, MessageSender } from '@/types/message'
import { PlatformType } from '@/types/product'
import { 
  mockMessages as mockMessagesData, 
  mockConversations as mockConversationsData,
  getMessagesByConversationId as getMockMessagesByConversationId,
  getConversationById as getMockConversationById,
  filterConversations as filterMockConversations
} from '@/lib/mock-data/messages'
import { supabase } from '@/lib/supabase'
import { featureFlags, dataTransformers } from '@/lib/data-sources'

// Message filter interface
export interface MessageFilters {
  conversationId?: string
  platform?: PlatformType
  sender?: MessageSender
  isRead?: boolean
  dateFrom?: Date
  dateTo?: Date
}

// Conversation filter interface
export interface ConversationFilters {
  search?: string
  platform?: PlatformType
  unreadOnly?: boolean
  hasOrder?: boolean
}

// Service response interface
export interface MessageServiceResponse<T = any> {
  data: T
  success: boolean
  error?: string
  source: 'mock' | 'supabase'
  timestamp: Date
}

/**
 * Messages Service Class
 */
export class MessagesService {
  private readonly messagesTable = 'messages'
  private readonly conversationsTable = 'conversations'
  private readonly logPrefix = '[MessagesService]'

  /**
   * Get all messages with optional filtering
   */
  async listMessages(filters: MessageFilters = {}): Promise<MessageServiceResponse<Message[]>> {
    const source = featureFlags.messages
    const startTime = Date.now()

    try {
      if (featureFlags.useMessagesSupabase()) {
        const data = await this.getMessagesFromSupabase(filters)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const data = await this.getMessagesFromMock(filters)
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
   * Get all conversations with optional filtering
   */
  async listConversations(filters: ConversationFilters = {}): Promise<MessageServiceResponse<Conversation[]>> {
    const source = featureFlags.messages
    const startTime = Date.now()

    try {
      if (featureFlags.useMessagesSupabase()) {
        const data = await this.getConversationsFromSupabase(filters)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const data = await this.getConversationsFromMock(filters)
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
      console.log(`${this.logPrefix} listConversations ${source} query completed in ${duration}ms`)
    }
  }

  /**
   * Get messages for a specific conversation
   */
  async getMessagesByConversationId(conversationId: string): Promise<MessageServiceResponse<Message[]>> {
    const source = featureFlags.messages
    const startTime = Date.now()

    try {
      if (featureFlags.useMessagesSupabase()) {
        const data = await this.getMessagesFromSupabase({ conversationId })
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const data = await this.getMessagesFromMock({ conversationId })
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} getMessagesByConversationId error:`, error)
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    } finally {
      const duration = Date.now() - startTime
      console.log(`${this.logPrefix} getMessagesByConversationId ${source} query completed in ${duration}ms`)
    }
  }

  /**
   * Get a single conversation by ID
   */
  async getConversationById(id: string): Promise<MessageServiceResponse<Conversation | null>> {
    const source = featureFlags.messages
    const startTime = Date.now()

    try {
      if (featureFlags.useMessagesSupabase()) {
        const data = await this.getConversationFromSupabase(id)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const data = await this.getConversationFromMock(id)
        return {
          data,
          success: true,
          source,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      console.error(`${this.logPrefix} getConversationById error:`, error)
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp: new Date(),
      }
    } finally {
      const duration = Date.now() - startTime
      console.log(`${this.logPrefix} getConversationById ${source} query completed in ${duration}ms`)
    }
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(): Promise<MessageServiceResponse<{
    totalConversations: number
    unreadConversations: number
    totalMessages: number
    unreadMessages: number
    platformBreakdown: Record<PlatformType, number>
  }>> {
    const source = featureFlags.messages

    try {
      if (featureFlags.useMessagesSupabase()) {
        const [conversations, messages] = await Promise.all([
          this.getConversationsFromSupabase({}),
          this.getMessagesFromSupabase({})
        ])
        
        const unreadConversations = conversations.filter(c => c.unreadCount > 0).length
        const unreadMessages = messages.filter(m => !m.isRead).length
        
        const stats = {
          totalConversations: conversations.length,
          unreadConversations,
          totalMessages: messages.length,
          unreadMessages,
          platformBreakdown: {
            shopee: conversations.filter(c => c.platform === 'shopee').length,
            tiktok: conversations.filter(c => c.platform === 'tiktok').length,
            tokopedia: conversations.filter(c => c.platform === 'tokopedia').length,
            lazada: conversations.filter(c => c.platform === 'lazada').length,
          }
        }

        return {
          data: stats,
          success: true,
          source,
          timestamp: new Date(),
        }
      } else {
        const [conversations, messages] = await Promise.all([
          this.getConversationsFromMock({}),
          this.getMessagesFromMock({})
        ])
        
        const unreadConversations = conversations.filter(c => c.unreadCount > 0).length
        const unreadMessages = messages.filter(m => !m.isRead).length
        
        const stats = {
          totalConversations: conversations.length,
          unreadConversations,
          totalMessages: messages.length,
          unreadMessages,
          platformBreakdown: {
            shopee: conversations.filter(c => c.platform === 'shopee').length,
            tiktok: conversations.filter(c => c.platform === 'tiktok').length,
            tokopedia: conversations.filter(c => c.platform === 'tokopedia').length,
            lazada: conversations.filter(c => c.platform === 'lazada').length,
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
      console.error(`${this.logPrefix} getConversationStats error:`, error)
      return {
        data: {
          totalConversations: 0,
          unreadConversations: 0,
          totalMessages: 0,
          unreadMessages: 0,
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
   * Get messages from mock data
   */
  private async getMessagesFromMock(filters: MessageFilters): Promise<Message[]> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    let messages = [...mockMessagesData]
    
    // Apply filters
    if (filters.conversationId) {
      messages = messages.filter(m => m.conversationId === filters.conversationId)
    }
    
    if (filters.platform) {
      messages = messages.filter(m => m.platform === filters.platform)
    }
    
    if (filters.sender) {
      messages = messages.filter(m => m.sender === filters.sender)
    }
    
    if (filters.isRead !== undefined) {
      messages = messages.filter(m => m.isRead === filters.isRead)
    }
    
    if (filters.dateFrom) {
      messages = messages.filter(m => m.timestamp >= filters.dateFrom!)
    }
    
    if (filters.dateTo) {
      messages = messages.filter(m => m.timestamp <= filters.dateTo!)
    }
    
    return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  /**
   * Get conversations from mock data
   */
  private async getConversationsFromMock(filters: ConversationFilters): Promise<Conversation[]> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return filterMockConversations(filters)
  }

  /**
   * Get a single conversation from mock data
   */
  private async getConversationFromMock(id: string): Promise<Conversation | null> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50))
    
    return getMockConversationById(id) || null
  }

  /**
   * Get messages from Supabase
   */
  private async getMessagesFromSupabase(filters: MessageFilters): Promise<Message[]> {
    try {
      let query = supabase
        .from(this.messagesTable)
        .select('*')

      // Apply filters
      if (filters.conversationId) {
        query = query.eq('conversation_id', filters.conversationId)
      }

      if (filters.platform) {
        query = query.eq('platform', filters.platform)
      }

      if (filters.sender) {
        query = query.eq('sender', filters.sender)
      }

      if (filters.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead)
      }

      if (filters.dateFrom) {
        query = query.gte('timestamp', filters.dateFrom.toISOString())
      }

      if (filters.dateTo) {
        query = query.lte('timestamp', filters.dateTo.toISOString())
      }

      // Order by timestamp ascending
      query = query.order('timestamp', { ascending: true })

      const { data, error } = await query

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      // Transform from snake_case to camelCase
      return (data || []).map(message => {
        const transformed = dataTransformers.snakeToCamel(message) as Message
        
        // Parse JSON fields if needed - handle attachments as any to avoid TypeScript issues
        const transformedAny = transformed as any
        if (typeof transformedAny.attachments === 'string' && transformedAny.attachments.startsWith('[')) {
          try {
            transformedAny.attachments = JSON.parse(transformedAny.attachments)
          } catch {
            // Keep as string if parsing fails
          }
        }
        
        return transformedAny as Message
      })
    } catch (error) {
      console.error(`${this.logPrefix} Supabase query failed:`, error)
      throw error
    }
  }

  /**
   * Get conversations from Supabase
   */
  private async getConversationsFromSupabase(filters: ConversationFilters): Promise<Conversation[]> {
    try {
      let query = supabase
        .from(this.conversationsTable)
        .select('*')

      // Apply filters
      if (filters.search) {
        query = query.or(`customer_name.ilike.%${filters.search}%,last_message.ilike.%${filters.search}%`)
      }

      if (filters.platform) {
        query = query.eq('platform', filters.platform)
      }

      if (filters.unreadOnly) {
        query = query.gt('unread_count', 0)
      }

      if (filters.hasOrder) {
        query = query.not('related_order_id', 'is', null)
      }

      // Order by last_message_time descending
      query = query.order('last_message_time', { ascending: false })

      const { data, error } = await query

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      // Transform from snake_case to camelCase
      return (data || []).map(conversation => {
        const transformed = dataTransformers.snakeToCamel(conversation) as Conversation
        return transformed
      })
    } catch (error) {
      console.error(`${this.logPrefix} Supabase query failed:`, error)
      throw error
    }
  }

  /**
   * Get a single conversation from Supabase
   */
  private async getConversationFromSupabase(id: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from(this.conversationsTable)
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
      return dataTransformers.snakeToCamel(data) as Conversation
    } catch (error) {
      console.error(`${this.logPrefix} getConversationFromSupabase error:`, error)
      throw error
    }
  }
}

// Export singleton instance
export const messagesService = new MessagesService()

// Export utility functions for easy use
export const listMessagesService = (filters?: MessageFilters) => messagesService.listMessages(filters)
export const listConversationsService = (filters?: ConversationFilters) => messagesService.listConversations(filters)
export const getMessagesByConversationIdService = (conversationId: string) => messagesService.getMessagesByConversationId(conversationId)
export const getConversationByIdService = (id: string) => messagesService.getConversationById(id)
export const getConversationStatsService = () => messagesService.getConversationStats()

export default messagesService