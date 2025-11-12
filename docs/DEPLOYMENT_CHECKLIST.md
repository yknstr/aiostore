# AIOStore Phase 3 - Deployment Checklist

> Quick reference guide for production deployment

## 🚀 Pre-Deployment Setup

### Environment Configuration

```bash
# Copy and configure environment
cp .env.local.example .env.local

# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Shopee API credentials
SHOPEE_PARTNER_ID=your-partner-id
SHOPEE_PARTNER_KEY=your-partner-key
SHOPEE_BASE_URL=https://partner.shopeemobile.com/api/v2

# Security
CRON_SECRET=your-secure-secret
WRITE_MODE=live  # Enable after RLS setup
```

### Database Migration

```sql
-- 1. Run in Supabase SQL Editor
-- Apply: supabase/migrations/20241112_phase3_multi_tenant.sql

-- 2. Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('branches', 'branch_members', 'channel_accounts', 'channel_tokens');

-- 3. Apply RLS policies
-- Run: supabase/rls/01_core.sql

-- 4. Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Supabase Auth Configuration

1. **Site URL Settings:**
   - Go to Authentication → URL Configuration
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: Add all deployment environments

2. **Auth Policies:**
   - Enable email confirmations (optional)
   - Configure password requirements
   - Set session timeout policies

## 🏗️ Application Deployment

### Build & Deploy

```bash
# Install dependencies
npm install

# Type checking
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```

### Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Application builds without errors
- [ ] Health check endpoint responds
- [ ] SSL certificates configured

## ⏰ Cron Job Setup

### Option A: Supabase pg_cron

```sql
-- Run in Supabase SQL Editor
SELECT cron.schedule(
  'aiostore_token_refresh', 
  '*/10 * * * *',  -- Every 10 minutes
  $$
  SELECT net.http_post(
    url := 'https://yourdomain.com/api/internal/cron/token-refresh',
    headers := '{"X-Cron":"1","X-Cron-Secret":"your-secret"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'aiostore_job_worker', 
  '*/2 * * * *',  -- Every 2 minutes
  $$
  SELECT net.http_post(
    url := 'https://yourdomain.com/api/internal/cron/run-jobs',
    headers := '{"X-Cron":"1","X-Cron-Secret":"your-secret"}'::jsonb
  );
  $$
);
```

### Option B: Vercel Cron

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/internal/cron/token-refresh",
      "schedule": "*/10 * * * *"
    },
    {
      "path": "/api/internal/cron/run-jobs",
      "schedule": "*/2 * * * *"
    }
  ]
}
```

## 🧪 Post-Deployment Testing

### 1. Health Checks

```bash
# Application health
curl https://yourdomain.com/api/health

# Database connectivity
curl https://yourdomain.com/api/auth/shopee/exchange \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"code":"test","shop_id":"123"}'
```

### 2. Smoke Test Execution

Follow the complete test suite in `docs/SMOKE_TESTS.md`:

- [ ] Authentication flow (Register → Login → Dashboard)
- [ ] Multi-tenant database operations
- [ ] Token exchange and storage
- [ ] Shopee v2 API integration
- [ ] Webhook signature verification
- [ ] Cron job execution

### 3. Performance Validation

```bash
# API response times
curl -w "@curl-format.txt" -o /dev/null -s "https://yourdomain.com/api/health"

# Database query performance
# Check Supabase dashboard for slow queries
```

## 🔍 Monitoring Setup

### Application Monitoring

1. **Error Tracking:**
   - Configure Sentry or similar service
   - Set up error alerts
   - Monitor API error rates

2. **Performance Monitoring:**
   - Set up APM (Application Performance Monitoring)
   - Track API response times
   - Monitor database query performance

3. **Log Aggregation:**
   - Centralize application logs
   - Set up log retention policies
   - Configure log-based alerts

### Business Monitoring

- **User Authentication Success Rate:** >99%
- **Token Refresh Success Rate:** >95%
- **API Response Time:** <500ms average
- **Webhook Processing Time:** <1s average

## 🔒 Security Validation

### Security Checklist

- [ ] All secrets stored in environment variables
- [ ] RLS policies active and tested
- [ ] Webhook signature verification working
- [ ] API rate limiting configured
- [ ] SSL/TLS certificates valid
- [ ] CORS policies configured correctly
- [ ] No sensitive data in logs

### Security Testing

```bash
# Test unauthorized access
curl -H "Authorization: invalid-token" \
  https://yourdomain.com/api/auth/shopee/exchange

# Should return 401 Unauthorized

# Test webhook signature verification
curl -X POST https://yourdomain.com/api/webhooks/shopee \
  -H "Content-Type: application/json" \
  -H "x-signature: invalid-signature" \
  -d '{"test":"data"}'

# Should return 401 Unauthorized
```

## 📊 Production Readiness Validation

### Final Checklist

- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] RLS policies active
- [ ] Application deployed and accessible
- [ ] Cron jobs scheduled and running
- [ ] All smoke tests passing
- [ ] Monitoring and alerting configured
- [ ] Error tracking operational
- [ ] Performance baselines established
- [ ] Security policies validated

### Go-Live Criteria

**Technical Readiness:**
- ✅ All tests passing
- ✅ Performance benchmarks met
- ✅ Security validation complete
- ✅ Monitoring operational

**Business Readiness:**
- ✅ User acceptance testing complete
- ✅ Support documentation ready
- ✅ Rollback procedures documented
- ✅ Team trained on new features

## 🚨 Emergency Procedures

### Rollback Plan

1. **Application Rollback:**
   ```bash
   # Revert to previous deployment
   git checkout previous-version
   npm run build
   npm start
   ```

2. **Database Rollback:**
   ```sql
   -- Disable new features temporarily
   UPDATE branches SET status = 'maintenance' WHERE status = 'active';
   ```

3. **Cron Job Emergency Stop:**
   ```sql
   SELECT cron.unschedule('aiostore_token_refresh');
   SELECT cron.unschedule('aiostore_job_worker');
   ```

### Incident Response

1. **Token Refresh Failures:**
   - Check cron job execution logs
   - Verify environment variables
   - Manual token refresh if needed

2. **Database Issues:**
   - Check Supabase dashboard
   - Review error logs
   - Contact Supabase support if needed

3. **API Integration Failures:**
   - Verify Shopee API status
   - Check token validity
   - Review signature generation

## 📞 Support Contacts

### Internal Team
- **Development Team:** Check error logs and code
- **DevOps Team:** Infrastructure and deployment issues
- **Product Team:** Feature requirements and user feedback

### External Services
- **Supabase Support:** Platform and database issues
- **Shopee Partner Support:** API integration problems
- **Hosting Provider:** Infrastructure and performance issues

---

## ✅ Deployment Success Criteria

**Deployment is considered successful when:**
- All smoke tests pass
- User authentication works end-to-end
- Platform integrations functional
- Background jobs running smoothly
- Monitoring shows healthy system metrics
- No critical errors in logs

**Status:** 🚀 **READY FOR DEPLOYMENT**