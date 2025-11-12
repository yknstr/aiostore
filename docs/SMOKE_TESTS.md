# AIOStore Phase 3 - Smoke Test Script

> 10-minute comprehensive test suite to validate all Phase 3 functionality

## Test Environment Setup

Before running tests, ensure you have:

1. **Supabase project configured** with Phase 3 migrations applied
2. **Shopee Sandbox credentials** in `.env.local`
3. **Development server running** (`npm run dev`)
4. **Browser developer tools** open for debugging

## Test Execution Order

### Test 1: Authentication Flow ✅
**Expected Duration:** 2 minutes

1. **Register new account:**
   - Navigate to `/register`
   - Create account with email: `test@example.com`
   - Verify registration success

2. **Login and redirect:**
   - Navigate to `/login`
   - Login with `test@example.com`
   - **Expected:** Should redirect to `/dashboard` without loops
   - **Check browser console:** No authentication errors
   - **Check local storage:** Should have `sb-*-auth-token` entry

3. **Authentication state validation:**
   - In browser console: `localStorage.getItem('sb-*-auth-token')`
   - Should return authentication token
   - Navigate away and back to `/dashboard` - should stay authenticated

**Success Criteria:**
- [ ] Registration completes successfully
- [ ] Login redirects to `/dashboard`
- [ ] No authentication loops
- [ ] Auth token stored in localStorage

### Test 2: Multi-Tenant Database Setup ✅
**Expected Duration:** 3 minutes

1. **Database connection check:**
   ```bash
   # In Supabase SQL Editor, run:
   SELECT COUNT(*) FROM branches;
   SELECT COUNT(*) FROM channel_accounts;
   SELECT COUNT(*) FROM channel_tokens;
   ```

2. **Branch creation (automatic):**
   - After login, check that a default branch was created
   ```sql
   SELECT * FROM branches WHERE created_by = '<your-user-id>';
   ```

3. **RLS policy validation:**
   ```sql
   -- Should return your branch only
   SELECT * FROM branches;
   ```

**Success Criteria:**
- [ ] All Phase 3 tables exist
- [ ] Default branch created for user
- [ ] RLS policies restrict data to user's branches

### Test 3: Shopee Authentication & Token Exchange ✅
**Expected Duration:** 2 minutes

1. **Token exchange simulation:**
   ```bash
   # Use sandbox redirect URL parameters:
   curl -X POST http://localhost:3000/api/auth/shopee/exchange \
     -H "Content-Type: application/json" \
     -d '{
       "code": "test-code-from-shopee-sandbox",
       "shop_id": "123456",
       "branch_id": "<your-branch-id>",
       "is_sandbox": true
     }'
   ```

2. **Database verification:**
   ```sql
   -- Check channel account created
   SELECT * FROM channel_accounts WHERE channel = 'SHOPEE';
   
   -- Check tokens stored
   SELECT * FROM channel_tokens WHERE token_type IN ('access', 'refresh');
   ```

**Success Criteria:**
- [ ] API responds with success: true
- [ ] Channel account created in database
- [ ] Both access and refresh tokens stored
- [ ] Tokens marked as active = true

### Test 4: Shopee v2 API Client ✅
**Expected Duration:** 1 minute

1. **Signed API call test:**
   ```bash
   # Test with valid tokens
   curl -X GET http://localhost:3000/api/catalog/preview \
     -H "Content-Type: application/json" \
     -d '{"channel": "shopee", "account_id": "<account-id>"}'
   ```

2. **Manual client test (if direct testing):**
   ```typescript
   import { createShopeeV2Client } from '@/connectors/shopee/client-v2'
   
   const client = createShopeeV2Client()
   const result = await client.getShopInfo()
   console.log('Shopee v2 API result:', result)
   ```

**Success Criteria:**
- [ ] API calls complete without signature errors
- [ ] 200 OK responses from Shopee v2 endpoints
- [ ] No "Invalid signature" errors
- [ ] Token-based requests succeed

### Test 5: Webhook Verification ✅
**Expected Duration:** 1 minute

1. **Shopee webhook signature test:**
   ```bash
   # Create test payload
   PAYLOAD='{"event":"test","data":{}}'
   SIGNATURE=$(echo -n $PAYLOAD | openssl dgst -sha256 -hmac "$SHOPEE_PARTNER_KEY" | cut -d' ' -f2)
   
   curl -X POST http://localhost:3000/api/webhooks/shopee \
     -H "Content-Type: application/json" \
     -H "x-signature: $SIGNATURE" \
     -d $PAYLOAD
   ```

2. **Expected responses:**
   - **Valid signature:** `{"success": true, "processed": true}`
   - **Invalid signature:** `{"success": false, "error": "Invalid v2 signature"}`

**Success Criteria:**
- [ ] Valid signatures return 200 OK
- [ ] Invalid signatures return 401 Unauthorized
- [ ] Events processed and logged
- [ ] No webhook processing errors

### Test 6: Cron Job Endpoints ✅
**Expected Duration:** 1 minute

1. **Token refresh cron test:**
   ```bash
   curl -X POST http://localhost:3000/api/internal/cron/token-refresh \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

2. **Expected response structure:**
   ```json
   {
     "success": true,
     "processed_accounts": 1,
     "refreshed_tokens": 1,
     "failed_refreshes": 0,
     "details": [...]
   }
   ```

**Success Criteria:**
- [ ] Cron endpoint responds successfully
- [ ] Processes tokens due for refresh
- [ ] Returns detailed results
- [ ] Handles errors gracefully

## Troubleshooting Guide

### Authentication Issues
- **Problem:** Login redirects back to login page
  - **Check:** Supabase Site URL configuration
  - **Fix:** Set Site URL to exact host (http://localhost:3000)
  - **Verify:** Local storage contains auth token

### Database Errors
- **Problem:** "relation does not exist" errors
  - **Check:** Applied Phase 3 migrations
  - **Fix:** Run `supabase/migrations/20241112_phase3_multi_tenant.sql`

### API Signature Errors
- **Problem:** "Invalid signature" from Shopee
  - **Check:** Environment variables are set correctly
  - **Fix:** Verify SHOPEE_PARTNER_ID and SHOPEE_PARTNER_KEY
  - **Debug:** Check StringToSign pattern in client-v2.ts

### Cron Job Failures
- **Problem:** Cron endpoints return errors
  - **Check:** Service role key configured
  - **Fix:** Set SUPABASE_SERVICE_ROLE_KEY environment variable
  - **Verify:** Database connections from cron context

## Success Criteria Summary

**Overall Test Suite Pass:** ✅
- [ ] Authentication flow works end-to-end
- [ ] Multi-tenant database properly configured
- [ ] Token exchange and storage functional
- [ ] Shopee v2 API client signs requests correctly
- [ ] Webhook verification working
- [ ] Cron jobs execute successfully

**Post-Test Actions:**
1. Update production environment with valid credentials
2. Switch WRITE_MODE from 'dry' to 'live'
3. Enable scheduled cron jobs
4. Configure production webhook endpoints

## Continuous Testing

For ongoing validation, run these tests:
- **Daily:** Authentication and database connectivity
- **Weekly:** Full API integration tests
- **After deployments:** Complete smoke test suite

## Test Data Cleanup

After successful testing, clean up test data:
```sql
-- Remove test branch and associated data
DELETE FROM branch_members WHERE role = 'owner' AND user_id = '<test-user-id>';
DELETE FROM branches WHERE created_by = '<test-user-id>';
DELETE FROM channel_accounts WHERE shop_id = 'test-shop-id';
```

---

**Test Completion:** When all tests pass, AIOStore Phase 3 is ready for production use with multi-tenant architecture, Shopee v2 integration, and automated token management.