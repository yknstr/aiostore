/**
 * Listings Service
 * 
 * Provides unified interface for managing product listings across
 * different channels and markets with filtering, searching, and
 * batch operations.
 */

import { PlatformType } from '@/types/product'
import { supabase } from '@/lib/supabase'
import { featureFlags, dataTransformers } from '@/lib/data-sources'
import { seoValidator, ValidationResult } from '@/domain/mapping/validators'
// import { transformTemplateEngine, TransformTemplateEngine } from '@/domain/mapping/transform-template'

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface Listing {
  id: string
  productId: string
  channel: PlatformType
  market: string
  channelAccountId: string
  platformListingId?: string
  status: 'draft' | 'active' | 'inactive' | 'error' | 'pending'
  title: string
  description: string
  price: number
  compareAtPrice?: number
  stock: number
  lowStockThreshold: number
  images: string[]
  attributes: Record<string, any>
  category: string
  tags: string[]
  seoTitle?: string
  seoDescription?: string
  publishedAt?: Date
  lastSyncedAt?: Date
  syncStatus: 'synced' | 'pending' | 'failed' | 'partial'
  syncErrors?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ListingFilters {
  search?: string
  channel?: PlatformType
  market?: string
  status?: string
  category?: string
  priceMin?: number
  priceMax?: number
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
  syncStatus?: string
  updatedAfter?: Date
  createdAfter?: Date
}

export interface ListingSummary {
  total: number
  active: number
  inactive: number
  draft: number
  error: number
  pending: number
  byChannel: Record<PlatformType, {
    total: number
    active: number
    error: number
  }>
  byMarket: Record<string, {
    total: number
    active: number
    error: number
  }>
}

export interface BatchOperation {
  operation: 'activate' | 'deactivate' | 'update_price' | 'update_stock' | 'sync' | 'delete'
  listingIds: string[]
  parameters?: Record<string, any>
  dryRun?: boolean
}

export interface BatchOperationResult {
  success: boolean
  totalProcessed: number
  successful: number
  failed: number
  errors: Array<{
    listingId: string
    error: string
  }>
  warnings: Array<{
    listingId: string
    message: string
  }>
}

// =============================================================================
// LISTINGS SERVICE CLASS
// =============================================================================

export class ListingsService {
  private readonly tableName = 'listings'
  private readonly logPrefix = '[ListingsService]'

  /**
   * Get all listings with filtering and pagination
   */
  async listListings(
    filters: ListingFilters = {},
    options: {
      page?: number
      limit?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } = {}
  ): Promise<{
    listings: Listing[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    try {
      if (featureFlags.useProductsSupabase()) {
        return await this.listListingsFromSupabase(filters, options)
      } else {
        return await this.listListingsMock(filters, options)
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error listing listings:`, error)
      throw error
    }
  }

  /**
   * Get listing by ID
   */
  async getListingById(id: string): Promise<Listing | null> {
    try {
      if (featureFlags.useProductsSupabase()) {
        return await this.getListingFromSupabase(id)
      } else {
        return await this.getListingMock(id)
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error getting listing:`, error)
      throw error
    }
  }

  /**
   * Get listings by product ID
   */
  async getListingsByProductId(productId: string): Promise<Listing[]> {
    try {
      if (featureFlags.useProductsSupabase()) {
        return await this.getListingsByProductFromSupabase(productId)
      } else {
        return await this.getListingsByProductMock(productId)
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error getting listings by product:`, error)
      throw error
    }
  }

  /**
   * Get listing summary/statistics
   */
  async getListingSummary(): Promise<ListingSummary> {
    try {
      if (featureFlags.useProductsSupabase()) {
        return await this.getSummaryFromSupabase()
      } else {
        return await this.getSummaryMock()
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error getting summary:`, error)
      throw error
    }
  }

  /**
   * Create new listing
   */
  async createListing(listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>): Promise<Listing> {
    const writeMode = featureFlags.writeMode

    try {
      if (featureFlags.isDryRun()) {
        console.log(`${this.logPrefix} [DRY-RUN] Would create listing:`, listingData)
        return this.createMockListing(listingData)
      }

      if (featureFlags.useProductsSupabase()) {
        return await this.createListingInSupabase(listingData)
      } else {
        return await this.createMockListing(listingData)
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error creating listing:`, error)
      throw error
    }
  }

  /**
   * Update listing
   */
  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
    const writeMode = featureFlags.writeMode

    try {
      if (featureFlags.isDryRun()) {
        console.log(`${this.logPrefix} [DRY-RUN] Would update listing ${id}:`, updates)
        return { ...updates } as Listing
      }

      if (featureFlags.useProductsSupabase()) {
        return await this.updateListingInSupabase(id, updates)
      } else {
        return { ...updates } as Listing
      }
    } catch (error) {
      console.error(`${this.logPrefix} Error updating listing:`, error)
      throw error
    }
  }

  /**
   * Validate listing for specific platform
   */
  async validateListing(listing: Listing): Promise<ValidationResult> {
    return seoValidator.validate(listing, listing.channel, listing.market, listing.category)
  }

  /**
   * Transform listing for specific platform using templates
   */
  async transformListing(listing: Listing): Promise<{
    title: string
    description: string
    attributes: Record<string, string>
    metadata: any
  }> {
    // TODO: Implement with actual transformTemplateEngine when available
    // For now, return the listing as-is with some basic transformations
    return {
      title: listing.title,
      description: listing.description,
      attributes: Object.fromEntries(
        Object.entries(listing.attributes).map(([key, value]) => [key, String(value)])
      ),
      metadata: {
        template: 'fallback',
        transformations: ['no_transform']
      }
    }
  }

  /**
   * Execute batch operation on listings
   */
  async executeBatchOperation(operation: BatchOperation): Promise<BatchOperationResult> {
    const startTime = Date.now()
    console.log(`${this.logPrefix} Executing batch operation:`, operation)

    const result: BatchOperationResult = {
      success: true,
      totalProcessed: operation.listingIds.length,
      successful: 0,
      failed: 0,
      errors: [],
      warnings: []
    }

    for (const listingId of operation.listingIds) {
      try {
        const listing = await this.getListingById(listingId)
        if (!listing) {
          result.errors.push({
            listingId,
            error: 'Listing not found'
          })
          result.failed++
          continue
        }

        await this.executeSingleOperation(listing, operation)
        result.successful++
      } catch (error) {
        result.errors.push({
          listingId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        result.failed++
      }
    }

    result.success = result.failed === 0
    const duration = Date.now() - startTime
    console.log(`${this.logPrefix} Batch operation completed in ${duration}ms:`, result)

    return result
  }

  /**
   * Sync listing with platform
   */
  async syncListing(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const listing = await this.getListingById(id)
      if (!listing) {
        return { success: false, error: 'Listing not found' }
      }

      // TODO: Implement actual sync with platform connector
      console.log(`${this.logPrefix} Syncing listing ${id} with ${listing.channel}`)
      
      // For now, just update the sync timestamp
      await this.updateListing(id, {
        lastSyncedAt: new Date(),
        syncStatus: 'synced'
      })

      return { success: true }
    } catch (error) {
      console.error(`${this.logPrefix} Error syncing listing:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sync failed' 
      }
    }
  }

  // =============================================================================
  // SUPABASE IMPLEMENTATIONS
  // =============================================================================

  /**
   * Get listings from Supabase with filters
   */
  private async listListingsFromSupabase(
    filters: ListingFilters,
    options: any
  ): Promise<any> {
    let query = supabase.from(this.tableName).select('*')

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.channel) {
      query = query.eq('channel', filters.channel)
    }

    if (filters.market) {
      query = query.eq('market', filters.market)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.priceMin !== undefined) {
      query = query.gte('price', filters.priceMin)
    }

    if (filters.priceMax !== undefined) {
      query = query.lte('price', filters.priceMax)
    }

    if (filters.syncStatus) {
      query = query.eq('sync_status', filters.syncStatus)
    }

    if (filters.updatedAfter) {
      query = query.gte('updated_at', filters.updatedAfter.toISOString())
    }

    if (filters.createdAfter) {
      query = query.gte('created_at', filters.createdAfter.toISOString())
    }

    // Apply stock status filter
    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'in_stock':
          query = query.gt('stock', 10)
          break
        case 'low_stock':
          query = query.lte('stock', 10).gt('stock', 0)
          break
        case 'out_of_stock':
          query = query.eq('stock', 0)
          break
      }
    }

    // Apply sorting
    const sortBy = options.sortBy || 'updated_at'
    const sortOrder = options.sortOrder || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const page = options.page || 1
    const limit = options.limit || 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    // Transform data
    const listings = dataTransformers.snakeToCamel(data || []) as Listing[]

    return {
      listings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  /**
   * Get single listing from Supabase
   */
  private async getListingFromSupabase(id: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Supabase error: ${error.message}`)
    }

    return dataTransformers.snakeToCamel(data) as Listing
  }

  /**
   * Get listings by product ID from Supabase
   */
  private async getListingsByProductFromSupabase(productId: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('product_id', productId)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return dataTransformers.snakeToCamel(data || []) as Listing[]
  }

  /**
   * Get summary from Supabase
   */
  private async getSummaryFromSupabase(): Promise<ListingSummary> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('status, channel, market, sync_status')

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    const listings = data || []
    const summary: ListingSummary = {
      total: listings.length,
      active: listings.filter(l => l.status === 'active').length,
      inactive: listings.filter(l => l.status === 'inactive').length,
      draft: listings.filter(l => l.status === 'draft').length,
      error: listings.filter(l => l.status === 'error').length,
      pending: listings.filter(l => l.status === 'pending').length,
      byChannel: {} as any,
      byMarket: {} as any
    }

    // Group by channel
    listings.forEach(listing => {
      const channel = listing.channel as PlatformType
      if (!summary.byChannel[channel]) {
        summary.byChannel[channel] = { total: 0, active: 0, error: 0 }
      }
      summary.byChannel[channel].total++
      if (listing.status === 'active') {
        summary.byChannel[channel].active++
      }
      if (listing.status === 'error') {
        summary.byChannel[channel].error++
      }
    })

    // Group by market
    listings.forEach(listing => {
      const market = listing.market
      if (!summary.byMarket[market]) {
        summary.byMarket[market] = { total: 0, active: 0, error: 0 }
      }
      summary.byMarket[market].total++
      if (listing.status === 'active') {
        summary.byMarket[market].active++
      }
      if (listing.status === 'error') {
        summary.byMarket[market].error++
      }
    })

    return summary
  }

  /**
   * Create listing in Supabase
   */
  private async createListingInSupabase(listingData: any): Promise<Listing> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(dataTransformers.camelToSnake(listingData))
      .select()
      .single()

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return dataTransformers.snakeToCamel(data) as Listing
  }

  /**
   * Update listing in Supabase
   */
  private async updateListingInSupabase(id: string, updates: any): Promise<Listing> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(dataTransformers.camelToSnake(updates))
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return dataTransformers.snakeToCamel(data) as Listing
  }

  // =============================================================================
  // MOCK IMPLEMENTATIONS
  // =============================================================================

  /**
   * Mock listings for development
   */
  private async listListingsMock(filters: ListingFilters, options: any): Promise<any> {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100))

    const mockListings: Listing[] = [
      {
        id: '1',
        productId: 'prod-1',
        channel: 'shopee',
        market: 'ID',
        channelAccountId: 'acc-shopee-id',
        platformListingId: 'shp-12345',
        status: 'active',
        title: 'iPhone 15 Pro Max - 256GB',
        description: 'Latest iPhone with A17 Pro chip',
        price: 18999000,
        compareAtPrice: 20999000,
        stock: 25,
        lowStockThreshold: 5,
        images: ['/images/iphone-15-pro.jpg'],
        attributes: { brand: 'Apple', model: 'iPhone 15 Pro Max', storage: '256GB' },
        category: 'electronics',
        tags: ['smartphone', 'apple', 'premium'],
        seoTitle: 'iPhone 15 Pro Max 256GB - Apple Indonesia',
        seoDescription: 'Buy iPhone 15 Pro Max 256GB online with warranty',
        publishedAt: new Date(),
        lastSyncedAt: new Date(),
        syncStatus: 'synced',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Apply filters
    let filteredListings = mockListings

    if (filters.channel) {
      filteredListings = filteredListings.filter(l => l.channel === filters.channel)
    }

    if (filters.market) {
      filteredListings = filteredListings.filter(l => l.market === filters.market)
    }

    if (filters.status) {
      filteredListings = filteredListings.filter(l => l.status === filters.status)
    }

    // Apply pagination
    const page = options.page || 1
    const limit = options.limit || 20
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedListings = filteredListings.slice(start, end)

    return {
      listings: paginatedListings,
      pagination: {
        page,
        limit,
        total: filteredListings.length,
        totalPages: Math.ceil(filteredListings.length / limit)
      }
    }
  }

  /**
   * Get mock listing
   */
  private async getListingMock(id: string): Promise<Listing | null> {
    await new Promise(resolve => setTimeout(resolve, 50))
    
    if (id === '1') {
      return {
        id: '1',
        productId: 'prod-1',
        channel: 'shopee',
        market: 'ID',
        channelAccountId: 'acc-shopee-id',
        platformListingId: 'shp-12345',
        status: 'active',
        title: 'iPhone 15 Pro Max - 256GB',
        description: 'Latest iPhone with A17 Pro chip',
        price: 18999000,
        compareAtPrice: 20999000,
        stock: 25,
        lowStockThreshold: 5,
        images: ['/images/iphone-15-pro.jpg'],
        attributes: { brand: 'Apple', model: 'iPhone 15 Pro Max', storage: '256GB' },
        category: 'electronics',
        tags: ['smartphone', 'apple', 'premium'],
        seoTitle: 'iPhone 15 Pro Max 256GB - Apple Indonesia',
        seoDescription: 'Buy iPhone 15 Pro Max 256GB online with warranty',
        publishedAt: new Date(),
        lastSyncedAt: new Date(),
        syncStatus: 'synced',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    return null
  }

  /**
   * Get mock listings by product
   */
  private async getListingsByProductMock(productId: string): Promise<Listing[]> {
    await new Promise(resolve => setTimeout(resolve, 75))
    
    if (productId === 'prod-1') {
      return [await this.getListingMock('1') as Listing]
    }

    return []
  }

  /**
   * Get mock summary
   */
  private async getSummaryMock(): Promise<ListingSummary> {
    await new Promise(resolve => setTimeout(resolve, 100))

    return {
      total: 150,
      active: 120,
      inactive: 20,
      draft: 8,
      error: 2,
      pending: 0,
      byChannel: {
        shopee: { total: 60, active: 50, error: 1 },
        tiktok: { total: 45, active: 35, error: 1 },
        tokopedia: { total: 30, active: 25, error: 0 },
        lazada: { total: 15, active: 10, error: 0 }
      },
      byMarket: {
        'ID': { total: 120, active: 100, error: 2 },
        'SG': { total: 20, active: 15, error: 0 },
        'MY': { total: 10, active: 5, error: 0 }
      }
    }
  }

  /**
   * Create mock listing
   */
  private async createMockListing(listingData: any): Promise<Listing> {
    await new Promise(resolve => setTimeout(resolve, 200))

    return {
      ...listingData,
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Listing
  }

  /**
   * Execute single operation
   */
  private async executeSingleOperation(listing: Listing, operation: BatchOperation): Promise<void> {
    switch (operation.operation) {
      case 'activate':
        await this.updateListing(listing.id, { status: 'active' })
        break

      case 'deactivate':
        await this.updateListing(listing.id, { status: 'inactive' })
        break

      case 'update_price':
        if (operation.parameters?.price) {
          await this.updateListing(listing.id, { price: operation.parameters.price })
        }
        break

      case 'update_stock':
        if (operation.parameters?.stock !== undefined) {
          await this.updateListing(listing.id, { stock: operation.parameters.stock })
        }
        break

      case 'sync':
        await this.syncListing(listing.id)
        break

      default:
        throw new Error(`Unknown operation: ${operation.operation}`)
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const listingsService = new ListingsService()

export default listingsService