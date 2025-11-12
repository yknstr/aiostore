/**
 * Shopee Token Exchange Route
 * 
 * POST /api/auth/shopee/exchange
 * 
 * Exchanges authorization code for access/refresh tokens using v2 API.
 * Persists tokens to database using multi-tenant architecture.
 * 
 * Phase 3 Requirements:
 * - Body: { code, shop_id }
 * - Uses rotate_channel_token RPC for token storage
 * - Associates to channel_account in branch context
 */

import { NextRequest, NextResponse } from 'next/server'
import { createShopeeV2Client } from '@/connectors/shopee/client-v2'
import { supabase } from '@/lib/supabase'

interface ExchangeRequest {
  code: string
  shop_id: string
  branch_id?: string // Multi-tenant context
  is_sandbox?: boolean
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('[ShopeeExchange] Starting token exchange process')

    // Parse and validate request body
    const body: ExchangeRequest = await request.json()
    const { code, shop_id, branch_id, is_sandbox = false } = body

    if (!code || !shop_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: code and shop_id'
      }, { status: 400 })
    }

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[ShopeeExchange] Authentication required')
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Determine branch context
    const targetBranchId = branch_id || await getOrCreateDefaultBranch(user.id)
    if (!targetBranchId) {
      return NextResponse.json({
        success: false,
        error: 'Unable to determine branch context'
      }, { status: 400 })
    }

    // Create Shopee v2 client
    const shopeeClient = createShopeeV2Client()

    console.log('[ShopeeExchange] Exchanging code for tokens...')

    // Exchange authorization code for tokens using v2 API
    const tokenResponse = await shopeeClient.request<TokenResponse>('/api/v2/auth/token/get', {
      method: 'POST',
      body: {
        code,
        shop_id
      },
      includeShopId: true
    })

    if (!tokenResponse.success) {
      console.error('[ShopeeExchange] Token exchange failed:', tokenResponse.error)
      return NextResponse.json({
        success: false,
        error: 'Token exchange failed',
        details: tokenResponse.error?.message
      }, { status: 400 })
    }

    const { access_token, refresh_token, expires_in } = tokenResponse.data!

    console.log('[ShopeeExchange] Token exchange successful, storing in database...')

    // Get or create channel account
    const accountId = await getOrCreateChannelAccount(targetBranchId, shop_id, is_sandbox)
    
    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create channel account'
      }, { status: 500 })
    }

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + (expires_in * 1000))

    // Store tokens using RPC (server-only)
    const { error: rotateError } = await supabase.rpc('rotate_channel_token', {
      p_account_id: accountId,
      p_token_type: 'access',
      p_token: access_token,
      p_expires_at: expiresAt.toISOString(),
      p_raw: {
        token_type: 'Bearer',
        expires_in,
        obtained_at: new Date().toISOString()
      }
    })

    if (rotateError) {
      console.error('[ShopeeExchange] Failed to store access token:', rotateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to store access token'
      }, { status: 500 })
    }

    // Store refresh token
    const { error: refreshError } = await supabase.rpc('rotate_channel_token', {
      p_account_id: accountId,
      p_token_type: 'refresh',
      p_token: refresh_token,
      p_expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 days
      p_raw: {
        token_type: 'refresh',
        obtained_at: new Date().toISOString()
      }
    })

    if (refreshError) {
      console.error('[ShopeeExchange] Failed to store refresh token:', refreshError)
      return NextResponse.json({
        success: false,
        error: 'Failed to store refresh token'
      }, { status: 500 })
    }

    // Update channel account status
    const { error: updateError } = await supabase
      .from('channel_accounts')
      .update({
        status: 'active',
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId)

    if (updateError) {
      console.error('[ShopeeExchange] Failed to update account status:', updateError)
    }

    const processingTime = Date.now() - startTime
    console.log(`[ShopeeExchange] Token exchange completed in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      account_id: accountId,
      branch_id: targetBranchId,
      shop_id,
      is_sandbox,
      expires_in,
      processingTime
    })

  } catch (error) {
    console.error('[ShopeeExchange] Processing error:', error)
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
 * Get or create default branch for user
 */
async function getOrCreateDefaultBranch(userId: string): Promise<string | null> {
  try {
    // Check if user already has a branch
    const { data: existingBranch } = await supabase
      .from('branch_members')
      .select('branch_id, branches(id, name, status)')
      .eq('user_id', userId)
      .eq('role', 'owner')
      .eq('branches.status', 'active')
      .single()

    if (existingBranch?.branch_id) {
      return existingBranch.branch_id
    }

    // Create new branch for user
    const branchName = `${userId.split('@')[0]}'s Store`
    
    const { data: newBranch, error: createError } = await supabase
      .from('branches')
      .insert({
        name: branchName,
        created_by: userId,
        status: 'active'
      })
      .select('id')
      .single()

    if (createError || !newBranch?.id) {
      console.error('[ShopeeExchange] Failed to create branch:', createError)
      return null
    }

    // Add user as owner
    const { error: memberError } = await supabase
      .from('branch_members')
      .insert({
        branch_id: newBranch.id,
        user_id: userId,
        role: 'owner'
      })

    if (memberError) {
      console.error('[ShopeeExchange] Failed to create branch membership:', memberError)
      return null
    }

    return newBranch.id

  } catch (error) {
    console.error('[ShopeeExchange] Error in getOrCreateDefaultBranch:', error)
    return null
  }
}

/**
 * Get or create channel account
 */
async function getOrCreateChannelAccount(
  branchId: string, 
  shopId: string, 
  isSandbox: boolean
): Promise<string | null> {
  try {
    // Try to find existing account
    const { data: existingAccount } = await supabase
      .from('channel_accounts')
      .select('id')
      .eq('branch_id', branchId)
      .eq('shop_id', shopId)
      .eq('channel', 'SHOPEE')
      .eq('is_sandbox', isSandbox)
      .single()

    if (existingAccount?.id) {
      return existingAccount.id
    }

    // Create new account
    const { data: newAccount, error: createError } = await supabase
      .from('channel_accounts')
      .insert({
        branch_id: branchId,
        channel: 'SHOPEE',
        is_sandbox: isSandbox,
        shop_id: shopId,
        display_name: `Shopee ${isSandbox ? '(Sandbox)' : ''}`,
        status: 'pending'
      })
      .select('id')
      .single()

    if (createError || !newAccount?.id) {
      console.error('[ShopeeExchange] Failed to create channel account:', createError)
      return null
    }

    return newAccount.id

  } catch (error) {
    console.error('[ShopeeExchange] Error in getOrCreateChannelAccount:', error)
    return null
  }
}