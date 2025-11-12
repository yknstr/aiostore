/**
 * Internal Cron Job - Token Refresh
 * 
 * POST /api/internal/cron/token-refresh
 * 
 * This endpoint is called by pg_cron or Vercel Cron every 10 minutes
 * to refresh tokens that are expiring within 15 minutes.
 * 
 * Phase 3 Implementation:
 * - Selects active access tokens that expire in ≤15 minutes
 * - Calls /api/auth/shopee/refresh per account
 * - Uses proper authorization and error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { getExpiredTokens } from '@/app/api/auth/shopee/refresh/route'

interface CronResponse {
  success: boolean
  processed_accounts: number
  refreshed_tokens: number
  failed_refreshes: number
  details: Array<{
    account_id: string
    status: 'success' | 'failed'
    error?: string
    refresh_time?: number
  }>
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  // Verify cron authentication (optional - can be done via header or secret)
  const cronSecret = request.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized cron request'
    }, { status: 401 })
  }

  console.log('[TokenRefreshCron] Starting token refresh cron job')

  try {
    // Get tokens that need refreshing (expire within 15 minutes)
    const expiredTokens = await getExpiredTokens(15)
    
    console.log(`[TokenRefreshCron] Found ${expiredTokens.length} tokens needing refresh`)

    const results: CronResponse['details'] = []
    let refreshedCount = 0
    let failedCount = 0

    // Process each account
    for (const token of expiredTokens) {
      const result: {
        account_id: string
        status: 'success' | 'failed'
        error?: string
        refresh_time?: number
      } = {
        account_id: token.account_id,
        status: 'failed'
      }

      try {
        console.log(`[TokenRefreshCron] Refreshing token for account ${token.account_id}`)

        // Call the refresh endpoint
        const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/shopee/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Include authentication if needed
            'Authorization': `Bearer ${process.env.SERVICE_ROLE_KEY || ''}`
          },
          body: JSON.stringify({
            account_id: token.account_id
          })
        })

        const refreshData = await refreshResponse.json()

        if (refreshResponse.ok && refreshData.success) {
          result.status = 'success'
          result.refresh_time = refreshData.expires_in
          refreshedCount++
          console.log(`[TokenRefreshCron] Successfully refreshed token for account ${token.account_id}`)
        } else {
          result.status = 'failed'
          result.error = refreshData.error || 'Refresh failed'
          failedCount++
          console.error(`[TokenRefreshCron] Failed to refresh token for account ${token.account_id}:`, result.error)
        }

      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Network error'
        failedCount++
        console.error(`[TokenRefreshCron] Error refreshing token for account ${token.account_id}:`, error)
      }

      results.push(result)
    }

    const processingTime = Date.now() - startTime
    console.log(`[TokenRefreshCron] Completed in ${processingTime}ms`)

    const response: CronResponse = {
      success: true,
      processed_accounts: expiredTokens.length,
      refreshed_tokens: refreshedCount,
      failed_refreshes: failedCount,
      details: results
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[TokenRefreshCron] Cron job error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// For testing - allow GET requests to trigger manually
export async function GET(request: NextRequest) {
  return POST(request)
}