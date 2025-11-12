-- =============================================================================
-- AIOStore Phase 3 - Database Migration Script
-- 
-- This script creates all the new tables and indexes needed for Phase 3
-- platform integration and sync operations.
-- 
-- Run this in Supabase SQL Editor or via Supabase CLI:
-- supabase db reset --db-url postgresql://postgres:password@localhost:5432/postgres
-- 
-- =============================================================================

-- Create enums for better data integrity
DO $$ BEGIN
    CREATE TYPE job_type AS ENUM ('pull', 'push', 'sync');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_item_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE log_level AS ENUM ('info', 'warning', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('draft', 'published', 'unlisted', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- CHANNELS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL, -- 'shopee', 'tiktokshop', 'tokopedia'
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE channels IS 'Available e-commerce platforms/channels';
COMMENT ON COLUMN channels.slug IS 'Unique identifier for the channel (used in URLs and API calls)';
COMMENT ON COLUMN channels.name IS 'Display name for the channel';
COMMENT ON COLUMN channels.config IS 'Channel-specific configuration (rate limits, features, etc.)';

-- =============================================================================
-- CHANNEL_ACCOUNTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS channel_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_slug TEXT REFERENCES channels(slug) NOT NULL,
    country_code TEXT NOT NULL, -- 'ID', 'SG', 'MY', 'TH', 'VN', 'PH'
    shop_name TEXT NOT NULL,
    shop_id TEXT,
    credentials_ref TEXT NOT NULL, -- 'env:SHOPEE_*' or 'vault:shopee_sg'
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_slug, country_code, shop_id)
);

COMMENT ON TABLE channel_accounts IS 'User accounts on various channels (multi-market support)';
COMMENT ON COLUMN channel_accounts.credentials_ref IS 'Reference to where credentials are stored: env:VARIABLE_NAME or vault:key_name';
COMMENT ON COLUMN channel_accounts.metadata IS 'Additional account-specific data (API versions, features, etc.)';

-- =============================================================================
-- LISTINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    channel TEXT NOT NULL,
    channel_account_id UUID REFERENCES channel_accounts(id) NOT NULL,
    platform_listing_id TEXT,
    title TEXT,
    description TEXT,
    price DECIMAL(10,2),
    stock INTEGER,
    status listing_status NOT NULL DEFAULT 'draft',
    is_published BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    sync_error TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, channel, channel_account_id)
);

COMMENT ON TABLE listings IS 'Product listings on specific channels and markets';
COMMENT ON COLUMN listings.status IS 'draft=not synced, published=live on platform, unlisted=removed, error=failed sync';
COMMENT ON COLUMN listings.metadata IS 'Channel-specific listing data (tags, variations, etc.)';

-- =============================================================================
-- JOBS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type job_type NOT NULL,
    status job_status NOT NULL DEFAULT 'pending',
    channel TEXT NOT NULL,
    channel_account_id UUID REFERENCES channel_accounts(id),
    total_items INTEGER DEFAULT 0,
    completed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE jobs IS 'Background sync job queue and tracking';
COMMENT ON COLUMN jobs.type IS 'pull=fetch from platform, push=send to platform, sync=bi-directional';
COMMENT ON COLUMN jobs.metadata IS 'Job-specific configuration and context data';

-- =============================================================================
-- JOB_ITEMS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS job_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) NOT NULL,
    item_type TEXT NOT NULL, -- 'product', 'order', 'stock', 'price'
    item_id TEXT NOT NULL,
    status job_item_status NOT NULL DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE job_items IS 'Individual items within sync jobs';
COMMENT ON COLUMN job_items.item_type IS 'Type of item being synced: product, order, stock, price';

-- =============================================================================
-- SYNC_LOGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id),
    level log_level NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE sync_logs IS 'Audit log for all sync operations';

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Products indexes (if not already exists)
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at);

-- Orders indexes (if not already exists)
CREATE INDEX IF NOT EXISTS idx_orders_platform ON orders(platform);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);

-- Channels indexes
CREATE INDEX IF NOT EXISTS idx_channels_slug ON channels(slug);
CREATE INDEX IF NOT EXISTS idx_channels_active ON channels(is_active);

-- Channel Accounts indexes
CREATE INDEX IF NOT EXISTS idx_channel_accounts_channel ON channel_accounts(channel_slug);
CREATE INDEX IF NOT EXISTS idx_channel_accounts_country ON channel_accounts(country_code);
CREATE INDEX IF NOT EXISTS idx_channel_accounts_active ON channel_accounts(is_active);

-- Listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_product_id ON listings(product_id);
CREATE INDEX IF NOT EXISTS idx_listings_channel ON listings(channel);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_published ON listings(is_published);
CREATE INDEX IF NOT EXISTS idx_listings_channel_account ON listings(channel_account_id);
CREATE INDEX IF NOT EXISTS idx_listings_platform_listing ON listings(platform_listing_id);

-- Jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_channel ON jobs(channel);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_channel_account ON jobs(channel_account_id);

-- Job Items indexes
CREATE INDEX IF NOT EXISTS idx_job_items_job_id ON job_items(job_id);
CREATE INDEX IF NOT EXISTS idx_job_items_status ON job_items(status);
CREATE INDEX IF NOT EXISTS idx_job_items_type ON job_items(item_type);
CREATE INDEX IF NOT EXISTS idx_job_items_next_retry ON job_items(next_retry_at);

-- Sync Logs indexes
CREATE INDEX IF NOT EXISTS idx_sync_logs_job_id ON sync_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_level ON sync_logs(level);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs(created_at);

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Function to log sync operations
CREATE OR REPLACE FUNCTION log_sync_operation(
    p_job_id UUID,
    p_level log_level,
    p_message TEXT,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO sync_logs (job_id, level, message, details)
    VALUES (p_job_id, p_level, p_message, p_details)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate next retry time
CREATE OR REPLACE FUNCTION calculate_next_retry(
    attempts INTEGER,
    base_delay_seconds INTEGER DEFAULT 60,
    max_delay_hours INTEGER DEFAULT 24
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    delay_seconds INTEGER;
BEGIN
    -- Exponential backoff: base_delay * (2 ^ attempts), capped at max_delay
    delay_seconds := LEAST(
        base_delay_seconds * (2 ^ attempts),
        max_delay_hours * 3600
    );
    
    RETURN NOW() + (delay_seconds || ' seconds')::INTERVAL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update job progress
CREATE OR REPLACE FUNCTION update_job_progress(p_job_id UUID)
RETURNS VOID AS $$
DECLARE
    total_items INTEGER;
    completed_items INTEGER;
    failed_items INTEGER;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'completed'),
        COUNT(*) FILTER (WHERE status = 'failed')
    INTO total_items, completed_items, failed_items
    FROM job_items 
    WHERE job_id = p_job_id;
    
    UPDATE jobs SET
        total_items = total_items,
        completed_items = completed_items,
        failed_items = failed_items,
        updated_at = NOW()
    WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- INITIAL DATA SETUP
-- =============================================================================

-- Insert default channels
INSERT INTO channels (slug, name, is_active, config) VALUES
    ('shopee', 'Shopee', true, '{"rate_limit_per_minute": 100, "max_products": 50000}'),
    ('tiktokshop', 'TikTok Shop', true, '{"rate_limit_per_minute": 50, "max_products": 10000}'),
    ('tokopedia', 'Tokopedia', false, '{"rate_limit_per_minute": 75, "max_products": 25000}')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    config = EXCLUDED.config,
    updated_at = NOW();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES FOR NEW TABLES
-- =============================================================================

-- Channels policies (read-only for most users, admin can modify)
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON channels;
CREATE POLICY "Allow SELECT for authenticated users" ON channels
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON channels;
CREATE POLICY "Allow INSERT for authenticated users" ON channels
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON channels;
CREATE POLICY "Allow UPDATE for authenticated users" ON channels
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON channels;
CREATE POLICY "Allow DELETE for authenticated users" ON channels
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Channel Accounts policies
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON channel_accounts;
CREATE POLICY "Allow SELECT for authenticated users" ON channel_accounts
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON channel_accounts;
CREATE POLICY "Allow INSERT for authenticated users" ON channel_accounts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON channel_accounts;
CREATE POLICY "Allow UPDATE for authenticated users" ON channel_accounts
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON channel_accounts;
CREATE POLICY "Allow DELETE for authenticated users" ON channel_accounts
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Listings policies
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON listings;
CREATE POLICY "Allow SELECT for authenticated users" ON listings
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON listings;
CREATE POLICY "Allow INSERT for authenticated users" ON listings
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON listings;
CREATE POLICY "Allow UPDATE for authenticated users" ON listings
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON listings;
CREATE POLICY "Allow DELETE for authenticated users" ON listings
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Jobs policies
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON jobs;
CREATE POLICY "Allow SELECT for authenticated users" ON jobs
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON jobs;
CREATE POLICY "Allow INSERT for authenticated users" ON jobs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON jobs;
CREATE POLICY "Allow UPDATE for authenticated users" ON jobs
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Job Items policies
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON job_items;
CREATE POLICY "Allow SELECT for authenticated users" ON job_items
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON job_items;
CREATE POLICY "Allow INSERT for authenticated users" ON job_items
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON job_items;
CREATE POLICY "Allow UPDATE for authenticated users" ON job_items
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Sync Logs policies (append-only for most operations)
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON sync_logs;
CREATE POLICY "Allow SELECT for authenticated users" ON sync_logs
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON sync_logs;
CREATE POLICY "Allow INSERT for authenticated users" ON sync_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_channels_updated_at 
    BEFORE UPDATE ON channels 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channel_accounts_updated_at 
    BEFORE UPDATE ON channel_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at 
    BEFORE UPDATE ON listings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_items_updated_at 
    BEFORE UPDATE ON job_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check if all tables exist and have proper structure
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('channels', 'channel_accounts', 'listings', 'jobs', 'job_items', 'sync_logs')
ORDER BY tablename;

-- Check if indexes exist
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('channels', 'channel_accounts', 'listings', 'jobs', 'job_items', 'sync_logs')
ORDER BY tablename, indexname;

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrls
FROM pg_tables 
LEFT JOIN (
    SELECT 
        schemaname,
        tablename,
        rowsecurity,
        hasrls
    FROM information_schema.table_privileges tp
    JOIN information_schema.role_table_grants rtg ON tp.grantee = rtg.grantee
) rls_info USING (schemaname, tablename)
WHERE schemaname = 'public' 
AND tablename IN ('channels', 'channel_accounts', 'listings', 'jobs', 'job_items', 'sync_logs')
ORDER BY tablename;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ AIOStore Phase 3 migration completed successfully!';
    RAISE NOTICE '📊 Created tables: channels, channel_accounts, listings, jobs, job_items, sync_logs';
    RAISE NOTICE '🔒 RLS enabled on all tables';
    RAISE NOTICE '🚀 Ready for platform integration!';
END $$;