/**
 * Channels Service
 * 
 * Manages Channel and ChannelAccount entities for multi-market operations.
 * Handles account connections, credential management, and platform-specific
 * configurations for different markets and shops.
 */

import { PlatformType } from '@/types/product'
import { supabase } from '@/lib/supabase'
import { featureFlags, dataTransformers } from '@/lib/data-sources'

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface Channel {
  id: string
  name: PlatformType
  displayName: string
  isActive: boolean
  supportedMarkets: string[]
  webhookUrl?: string
  config: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface ChannelAccount {
  id: string
  channelId: string
  channel: PlatformType
  country: string
  market: string
  shopName: string
  shopId: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  credentials: ChannelCredentials
  config: ChannelAccountConfig
  lastSyncedAt?: Date
  syncStatus: 'synced' | 'pending' | 'failed' | 'partial'
  errorMessage?: string
  createdAt: Date
  updatedAt: Date
}

export interface ChannelCredentials {
  partnerId?: string
  partnerKey?: string
  appKey?: string
  appSecret?: string
  shopId: string
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  webhookSecret?: string
  baseUrl: string
}

export interface ChannelAccountConfig {
  autoSync: boolean
  syncInterval: number // in minutes
  stockSync: boolean
  priceSync: boolean
  orderSync: boolean
  inventoryThreshold: number
  priceThreshold: number
  retryAttempts: number
  timeoutMs: number
  rateLimitPerMinute: number
}

export interface AccountConnectionTest {
  success: boolean
  message: string
  details?: Record<string, any>
  errorCode?: string
  apiVersion?: string
  rateLimit?: {
    limit: number
    remaining: number
    resetTime: Date
  }
}

export interface MarketplaceInfo {
  channel: PlatformType
  market: string
  displayName: string
  currency: string
  timezone: string
  language: string
  isActive: boolean
  defaultAccount?: string
}

// =============================================================================
// CHANNELS SERVICE CLASS
// =============================================================================

export class ChannelsService {
  private readonly channelsTable = 'channels'
  private readonly accountsTable = 'channel_accounts'
  private readonly logPrefix = '[ChannelsService]'

  /**
   * Get all channels with their accounts
   */
  async listChannels(): Promise<{
    channels: (Channel & { accounts: ChannelAccount[] })[]
  }> {
    try {
      if (featureFlags.useProductsSupabase()) {
        return await this.listChannelsFromSupabase()
      } else {
        return await this.listChannelsMock()
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error listing channels:`, error)
      throw error
    }
  }

  /**
   * Get all channel accounts
   */
  async listChannelAccounts(filters: {
    channel?: PlatformType
    market?: string
    status?: string
  } = {}): Promise<ChannelAccount[]> {
    try {
      if (featureFlags.useProductsSupabase()) {
        return await this.listChannelAccountsFromSupabase(filters)
      } else {
        return await this.listChannelAccountsMock(filters)
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error listing channel accounts:`, error)
      throw error
    }
  }

  /**
   * Get channel account by ID
   */
  async getChannelAccount(id: string): Promise<ChannelAccount | null> {
    try {
      if (featureFlags.useProductsSupabase()) {
        return await this.getChannelAccountFromSupabase(id)
      } else {
        return await this.getChannelAccountMock(id)
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error getting channel account:`, error)
      throw error
    }
  }

  /**
   * Test connection for a channel account
   */
  async testConnection(accountId: string): Promise<AccountConnectionTest> {
    try {
      console.log(`${this.logPrefix} Testing connection for account: ${accountId}`)
      
      const account = await this.getChannelAccount(accountId)
      if (!account) {
        return {
          success: false,
          message: 'Channel account not found',
          errorCode: 'ACCOUNT_NOT_FOUND'
        }
      }

      // TODO: Implement actual connection test with platform connector
      // For now, simulate the test
      const testResult = await this.simulateConnectionTest(account)
      
      // Update account status based on test result
      if (featureFlags.isLiveMode() && !featureFlags.isDryRun()) {
        await this.updateChannelAccountStatus(accountId, testResult.success ? 'active' : 'suspended')
      }

      return testResult
    } catch (error) {
      console.error(`${this.logPrefix} Error testing connection:`, error)
      return {
        success: false,
        message: 'Connection test failed',
        errorCode: 'TEST_FAILED',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  /**
   * Create new channel account
   */
  async createChannelAccount(accountData: Omit<ChannelAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChannelAccount> {
    try {
      if (featureFlags.isDryRun()) {
        console.log(`${this.logPrefix} [DRY-RUN] Would create channel account:`, accountData)
        return this.createMockChannelAccount(accountData)
      }

      if (featureFlags.useProductsSupabase()) {
        return await this.createChannelAccountInSupabase(accountData)
      } else {
        return await this.createMockChannelAccount(accountData)
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error creating channel account:`, error)
      throw error
    }
  }

  /**
   * Update channel account
   */
  async updateChannelAccount(id: string, updates: Partial<ChannelAccount>): Promise<ChannelAccount> {
    try {
      if (featureFlags.isDryRun()) {
        console.log(`${this.logPrefix} [DRY-RUN] Would update channel account ${id}:`, updates)
        return { ...updates } as ChannelAccount
      }

      if (featureFlags.useProductsSupabase()) {
        return await this.updateChannelAccountInSupabase(id, updates)
      } else {
        return { ...updates } as ChannelAccount
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error updating channel account:`, error)
      throw error
    }
  }

  /**
   * Delete channel account
   */
  async deleteChannelAccount(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (featureFlags.isDryRun()) {
        console.log(`${this.logPrefix} [DRY-RUN] Would delete channel account ${id}`)
        return { success: true }
      }

      if (featureFlags.useProductsSupabase()) {
        const { error } = await supabase
          .from(this.accountsTable)
          .delete()
          .eq('id', id)

        if (error) {
          throw new Error(`Supabase error: ${error.message}`)
        }

        return { success: true }
      } else {
        console.log(`${this.logPrefix} Mock delete channel account ${id}`)
        return { success: true }
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error deleting channel account:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      }
    }
  }

  /**
   * Get supported marketplaces for a channel
   */
  async getMarketplaces(channel: PlatformType): Promise<MarketplaceInfo[]> {
    const marketplaceData: Record<PlatformType, MarketplaceInfo[]> = {
      shopee: [
        {
          channel: 'shopee',
          market: 'ID',
          displayName: 'Shopee Indonesia',
          currency: 'IDR',
          timezone: 'Asia/Jakarta',
          language: 'id',
          isActive: true
        },
        {
          channel: 'shopee',
          market: 'SG',
          displayName: 'Shopee Singapore',
          currency: 'SGD',
          timezone: 'Asia/Singapore',
          language: 'en',
          isActive: true
        },
        {
          channel: 'shopee',
          market: 'MY',
          displayName: 'Shopee Malaysia',
          currency: 'MYR',
          timezone: 'Asia/Kuala_Lumpur',
          language: 'en',
          isActive: true
        }
      ],
      tiktok: [
        {
          channel: 'tiktok',
          market: 'ID',
          displayName: 'TikTok Shop Indonesia',
          currency: 'IDR',
          timezone: 'Asia/Jakarta',
          language: 'id',
          isActive: true
        },
        {
          channel: 'tiktok',
          market: 'SG',
          displayName: 'TikTok Shop Singapore',
          currency: 'SGD',
          timezone: 'Asia/Singapore',
          language: 'en',
          isActive: true
        }
      ],
      tokopedia: [
        {
          channel: 'tokopedia',
          market: 'ID',
          displayName: 'Tokopedia Indonesia',
          currency: 'IDR',
          timezone: 'Asia/Jakarta',
          language: 'id',
          isActive: true
        }
      ],
      lazada: [
        {
          channel: 'lazada',
          market: 'ID',
          displayName: 'Lazada Indonesia',
          currency: 'IDR',
          timezone: 'Asia/Jakarta',
          language: 'id',
          isActive: true
        },
        {
          channel: 'lazada',
          market: 'SG',
          displayName: 'Lazada Singapore',
          currency: 'SGD',
          timezone: 'Asia/Singapore',
          language: 'en',
          isActive: true
        }
      ]
    }

    return marketplaceData[channel] || []
  }

  /**
   * Refresh access token for channel account
   */
  async refreshAccessToken(accountId: string): Promise<{ success: boolean; newToken?: string; error?: string }> {
    try {
      console.log(`${this.logPrefix} Refreshing access token for account: ${accountId}`)
      
      const account = await this.getChannelAccount(accountId)
      if (!account) {
        return { success: false, error: 'Channel account not found' }
      }

      // TODO: Implement actual token refresh with platform connector
      console.log(`${this.logPrefix} Token refresh simulated for ${account.channel}/${account.market}`)
      
      // For now, just update the timestamp
      await this.updateChannelAccount(accountId, {
        lastSyncedAt: new Date(),
        syncStatus: 'synced'
      })

      return { success: true, newToken: account.credentials.accessToken }
    } catch (error) {
      console.error(`${this.logPrefix} Error refreshing token:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Token refresh failed' 
      }
    }
  }

  /**
   * Update channel account status
   */
  private async updateChannelAccountStatus(id: string, status: ChannelAccount['status']): Promise<void> {
    await this.updateChannelAccount(id, { 
      status,
      lastSyncedAt: new Date(),
      syncStatus: status === 'active' ? 'synced' : 'failed'
    })
  }

  /**
   * Simulate connection test (placeholder for actual implementation)
   */
  private async simulateConnectionTest(account: ChannelAccount): Promise<AccountConnectionTest> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate random success/failure for demo
    const success = Math.random() > 0.2 // 80% success rate

    return {
      success,
      message: success ? 'Connection successful' : 'Connection failed',
      details: {
        channel: account.channel,
        market: account.market,
        shopId: account.shopId
      },
      apiVersion: 'v2.0',
      rateLimit: {
        limit: 100,
        remaining: Math.floor(Math.random() * 100),
        resetTime: new Date(Date.now() + 60000)
      }
    }
  }

  // =============================================================================
  // SUPABASE IMPLEMENTATIONS
  // =============================================================================

  /**
   * List channels from Supabase
   */
  private async listChannelsFromSupabase(): Promise<any> {
    // Get channels
    const { data: channelsData, error: channelsError } = await supabase
      .from(this.channelsTable)
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (channelsError) {
      throw new Error(`Supabase error: ${channelsError.message}`)
    }

    // Get accounts for each channel
    const channelsWithAccounts = []
    for (const channel of channelsData || []) {
      const { data: accountsData, error: accountsError } = await supabase
        .from(this.accountsTable)
        .select('*')
        .eq('channel_id', channel.id)

      if (accountsError) {
        console.error(`Error fetching accounts for channel ${channel.name}:`, accountsError)
        channelsWithAccounts.push({
          ...dataTransformers.snakeToCamel(channel),
          accounts: []
        })
      } else {
        channelsWithAccounts.push({
          ...dataTransformers.snakeToCamel(channel),
          accounts: dataTransformers.snakeToCamel(accountsData || [])
        })
      }
    }

    return { channels: channelsWithAccounts }
  }

  /**
   * List channel accounts from Supabase
   */
  private async listChannelAccountsFromSupabase(filters: any): Promise<ChannelAccount[]> {
    let query = supabase.from(this.accountsTable).select('*')

    if (filters.channel) {
      query = query.eq('channel', filters.channel)
    }

    if (filters.market) {
      query = query.eq('market', filters.market)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    query = query.order('shop_name')

    const { data, error } = await query

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return dataTransformers.snakeToCamel(data || []) as ChannelAccount[]
  }

  /**
   * Get channel account from Supabase
   */
  private async getChannelAccountFromSupabase(id: string): Promise<ChannelAccount | null> {
    const { data, error } = await supabase
      .from(this.accountsTable)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Supabase error: ${error.message}`)
    }

    return dataTransformers.snakeToCamel(data) as ChannelAccount
  }

  /**
   * Create channel account in Supabase
   */
  private async createChannelAccountInSupabase(accountData: any): Promise<ChannelAccount> {
    const { data, error } = await supabase
      .from(this.accountsTable)
      .insert(dataTransformers.camelToSnake(accountData))
      .select()
      .single()

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return dataTransformers.snakeToCamel(data) as ChannelAccount
  }

  /**
   * Update channel account in Supabase
   */
  private async updateChannelAccountInSupabase(id: string, updates: any): Promise<ChannelAccount> {
    const { data, error } = await supabase
      .from(this.accountsTable)
      .update(dataTransformers.camelToSnake(updates))
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return dataTransformers.snakeToCamel(data) as ChannelAccount
  }

  // =============================================================================
  // MOCK IMPLEMENTATIONS
  // =============================================================================

  /**
   * Mock channels for development
   */
  private async listChannelsMock(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 100))

    return {
      channels: [
        {
          id: 'channel-shopee',
          name: 'shopee',
          displayName: 'Shopee',
          isActive: true,
          supportedMarkets: ['ID', 'SG', 'MY'],
          webhookUrl: '/api/webhooks/shopee',
          config: {
            apiVersion: 'v2',
            rateLimitPerMinute: 100
          },
          accounts: [
            {
              id: 'acc-shopee-id',
              channelId: 'channel-shopee',
              channel: 'shopee',
              country: 'ID',
              market: 'ID',
              shopName: 'R3D Store ID',
              shopId: '123456',
              status: 'active',
              credentials: {
                partnerId: 'shopee-partner-id',
                partnerKey: 'shopee-partner-key',
                shopId: '123456',
                accessToken: 'shopee-access-token',
                baseUrl: 'https://partner.shopeemobile.com/api/v2'
              },
              config: {
                autoSync: true,
                syncInterval: 15,
                stockSync: true,
                priceSync: true,
                orderSync: true,
                inventoryThreshold: 10,
                priceThreshold: 5,
                retryAttempts: 3,
                timeoutMs: 30000,
                rateLimitPerMinute: 100
              },
              lastSyncedAt: new Date(),
              syncStatus: 'synced',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  }

  /**
   * Mock channel accounts for development
   */
  private async listChannelAccountsMock(filters: any): Promise<ChannelAccount[]> {
    await new Promise(resolve => setTimeout(resolve, 75))

    const mockAccounts: ChannelAccount[] = [
      {
        id: 'acc-shopee-id',
        channelId: 'channel-shopee',
        channel: 'shopee',
        country: 'ID',
        market: 'ID',
        shopName: 'R3D Store ID',
        shopId: '123456',
        status: 'active',
        credentials: {
          partnerId: 'shopee-partner-id',
          partnerKey: 'shopee-partner-key',
          shopId: '123456',
          accessToken: 'shopee-access-token',
          baseUrl: 'https://partner.shopeemobile.com/api/v2'
        },
        config: {
          autoSync: true,
          syncInterval: 15,
          stockSync: true,
          priceSync: true,
          orderSync: true,
          inventoryThreshold: 10,
          priceThreshold: 5,
          retryAttempts: 3,
          timeoutMs: 30000,
          rateLimitPerMinute: 100
        },
        lastSyncedAt: new Date(),
        syncStatus: 'synced',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Apply filters
    let filtered = mockAccounts

    if (filters.channel) {
      filtered = filtered.filter(a => a.channel === filters.channel)
    }

    if (filters.market) {
      filtered = filtered.filter(a => a.market === filters.market)
    }

    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status)
    }

    return filtered
  }

  /**
   * Get mock channel account
   */
  private async getChannelAccountMock(id: string): Promise<ChannelAccount | null> {
    await new Promise(resolve => setTimeout(resolve, 50))

    if (id === 'acc-shopee-id') {
      return {
        id: 'acc-shopee-id',
        channelId: 'channel-shopee',
        channel: 'shopee',
        country: 'ID',
        market: 'ID',
        shopName: 'R3D Store ID',
        shopId: '123456',
        status: 'active',
        credentials: {
          partnerId: 'shopee-partner-id',
          partnerKey: 'shopee-partner-key',
          shopId: '123456',
          accessToken: 'shopee-access-token',
          baseUrl: 'https://partner.shopeemobile.com/api/v2'
        },
        config: {
          autoSync: true,
          syncInterval: 15,
          stockSync: true,
          priceSync: true,
          orderSync: true,
          inventoryThreshold: 10,
          priceThreshold: 5,
          retryAttempts: 3,
          timeoutMs: 30000,
          rateLimitPerMinute: 100
        },
        lastSyncedAt: new Date(),
        syncStatus: 'synced',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    return null
  }

  /**
   * Create mock channel account
   */
  private async createMockChannelAccount(accountData: any): Promise<ChannelAccount> {
    await new Promise(resolve => setTimeout(resolve, 200))

    return {
      ...accountData,
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    } as ChannelAccount
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const channelsService = new ChannelsService()

export default channelsService