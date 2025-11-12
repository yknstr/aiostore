/**
 * Shopee Token Refresh Route
 * 
 * POST /api/auth/shopee/refresh
 * 
 * Refreshes access tokens using current refresh token.
 * Maintains token lifecycle according to Phase 3 requirements.
 * 
 * Phase 3 Requirements:
 * - Body: { account_id }
 * - Uses current active refresh token to issue new access token
 * - Updates token storage via rotate_channel_token RPC
 */

import { NextRequest, NextResponse } from 'next/server'
import { createShopeeV2Client } from '@/connectors/shopee/client-v2'
import { supabase } from '@/lib/supabase'

interface RefreshRequest {
  account_id: string
}

interface RefreshResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('[ShopeeRefresh] Starting token refresh process')

    // Parse and validate request body
    const body: RefreshRequest = await request.json()
    const { account_id } = body

    if (!account_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: account_id'
      }, { status: 400 })
    }

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[ShopeeRefresh] Authentication required')
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Verify user has access to this account (multi-tenant check)
    const hasAccess = await verifyAccountAccess(account_id, user.id)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        error: 'Account not found or access denied'
      }, { status: 403 })
    }

    // Get current refresh token
    const { data: refreshToken, error: tokenError } = await supabase
      .rpc('get_active_access_token', {
        p_account_id: account_id
      })

    if (tokenError || !refreshToken) {
      console.error('[ShopeeRefresh] No active refresh token found:', tokenError)
      return NextResponse.json({
        success: false,
        error: 'No active refresh token found'
      }, { status: 400 })
    }

    console.log('[ShopeeRefresh] Using refresh token for token exchange...')

    // Create Shopee v2 client
    const shopeeClient = createShopeeV2Client()

    // Refresh tokens using refresh token
    const refreshResponse = await shopeeClient.request<RefreshResponse>('/api/v2/auth/access_token/get', {
      method: 'POST',
      body: {
        refresh_token: refreshToken
      }
    })

    if (!refreshResponse.success) {
      console.error('[ShopeeRefresh] Token refresh failed:', refreshResponse.error)
      return NextResponse.json({
        success: false,
        error: 'Token refresh failed',
        details: refreshResponse.error?.message
      }, { status: 400 })
    }

    const { access_token, refresh_token: new_refresh_token, expires_in } = refreshResponse.data!

    console.log('[ShopeeRefresh] Token refresh successful, updating database...')

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + (expires_in * 1000))

    // Update access token using RPC
    const { error: rotateError } = await supabase.rpc('rotate_channel_token', {
      p_account_id: account_id,
      p_token_type: 'access',
      p_token: access_token,
      p_expires_at: expiresAt.toISOString(),
      p_raw: {
        token_type: 'Bearer',
        expires_in,
        refreshed_at: new Date().toISOString(),
        original_refresh_token: refreshToken
      }
    })

    if (rotateError) {
      console.error('[ShopeeRefresh] Failed to update access token:', rotateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update access token'
      }, { status: 500 })
    }

    // Update refresh token (optional - some APIs issue new refresh tokens)
    if (new_refresh_token && new_refresh_token !== refreshToken) {
      const { error: refreshError } = await supabase.rpc('rotate_channel_token', {
        p_account_id: account_id,
        p_token_type: 'refresh',
        p_token: new_refresh_token,
        p_expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 days
        p_raw: {
          token_type: 'refresh',
          refreshed_at: new Date().toISOString()
        }
      })

      if (refreshError) {
        console.warn('[ShopeeRefresh] Failed to update refresh token:', refreshError)
        // Don't fail the whole operation if refresh token update fails
      }
    }

    // Update last sync time
    const { error: updateError } = await supabase
      .from('channel_accounts')
      .update({
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', account_id)

    if (updateError) {
      console.warn('[ShopeeRefresh] Failed to update last sync time:', updateError)
    }

    const processingTime = Date.now() - startTime
    console.log(`[ShopeeRefresh] Token refresh completed in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      account_id,
      expires_in,
      refreshed_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      processingTime
    })

  } catch (error) {
    console.error('[ShopeeRefresh] Processing error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Verify user has access to account (multi-tenant security check)
 */
async function verifyAccountAccess(accountId: string, userId: string): Promise<boolean> {
  try {
    const { data: account } = await supabase
      .from('channel_accounts')
      .select(`
        id,
        branch_id,
        branches!inner(
          id,
          branch_members(
            user_id,
            role
          )
        )
      `)
      .eq('id', accountId)
      .eq('branch_members.user_id', userId)
      .single()

    return !!account
  } catch (error) {
    console.error('[ShopeeRefresh] Error verifying account access:', error)
    return false
  }
}

/**
 * Get expired tokens that need refreshing (for cron jobs)
 */
export async function getExpiredTokens(thresholdMinutes = 15): Promise<Array<{
  account_id: string
  branch_id: string
  channel: string
  shop_id: string | null
}>> {
  try {
    const thresholdTime = new Date(Date.now() + (thresholdMinutes * 60 * 1000))

    const { data } = await supabase
      .from('channel_tokens')
      .select(`
        channel_account_id,
        active,
        expires_at,
        channel_accounts!inner(
          id,
          branch_id,
          channel,
          shop_id,
          status
        )
      `)
      .eq('token_type', 'access')
      .eq('active', true)
      .lte('expires_at', thresholdTime.toISOString())
      .eq('channel_accounts.status', 'active')

    if (!data) return []

    return data.map(token => ({
      account_id: token.channel_account_id,
      branch_id: (token.channel_accounts as any).branch_id,
      channel: (token.channel_accounts as any).channel,
      shop_id: (token.channel_accounts as any).shop_id
    }))

  } catch (error) {
    console.error('[ShopeeRefresh] Error getting expired tokens:', error)
    return []
  }
}