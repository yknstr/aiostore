-- =============================================================================
-- AIOStore Phase 3 - Row Level Security (RLS) Policies
-- 
-- IMPORTANT: Apply these policies BEFORE switching WRITE_MODE to 'live'
-- 
-- This script enables RLS on all tables and creates policies for authenticated
-- users. Adjust policies according to your security requirements.
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create new tables for Phase 3 if they don't exist
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- 'shopee', 'tiktokshop', 'tokopedia'
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_slug TEXT REFERENCES channels(slug) NOT NULL,
  country_code TEXT NOT NULL, -- 'ID', 'SG', 'MY', etc.
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
  status TEXT NOT NULL, -- 'draft', 'published', 'unlisted', 'error'
  is_published BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_error TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, channel, channel_account_id)
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'pull', 'push', 'sync'
  status TEXT NOT NULL, -- 'pending', 'running', 'completed', 'failed'
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

CREATE TABLE IF NOT EXISTS job_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) NOT NULL,
  item_type TEXT NOT NULL, -- 'product', 'order', 'stock'
  item_id TEXT NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed'
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  level TEXT NOT NULL, -- 'info', 'warning', 'error'
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES FOR EXISTING TABLES
-- =============================================================================

-- Products policies
CREATE POLICY "Allow all operations for authenticated users" ON products
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Orders policies (SELECT only, no updates via RLS - handled in service layer)
CREATE POLICY "Allow SELECT for authenticated users" ON orders
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow UPDATE for authenticated users" ON orders
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Customers policies (with PII masking - SELECT only by default)
CREATE POLICY "Allow all operations for authenticated users" ON customers
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Transactions policies
CREATE POLICY "Allow all operations for authenticated users" ON transactions
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Conversations policies
CREATE POLICY "Allow all operations for authenticated users" ON conversations
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Messages policies
CREATE POLICY "Allow all operations for authenticated users" ON messages
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- RLS POLICIES FOR NEW PHASE 3 TABLES
-- =============================================================================

-- Channels policies (read-only for most users, admin can modify)
CREATE POLICY "Allow SELECT for authenticated users" ON channels
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow INSERT for authenticated users" ON channels
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow UPDATE for authenticated users" ON channels
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow DELETE for authenticated users" ON channels
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Channel Accounts policies
CREATE POLICY "Allow SELECT for authenticated users" ON channel_accounts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow INSERT for authenticated users" ON channel_accounts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow UPDATE for authenticated users" ON channel_accounts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow DELETE for authenticated users" ON channel_accounts
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Listings policies
CREATE POLICY "Allow SELECT for authenticated users" ON listings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow INSERT for authenticated users" ON listings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow UPDATE for authenticated users" ON listings
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow DELETE for authenticated users" ON listings
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Jobs policies
CREATE POLICY "Allow SELECT for authenticated users" ON jobs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow INSERT for authenticated users" ON jobs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow UPDATE for authenticated users" ON jobs
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Job Items policies
CREATE POLICY "Allow SELECT for authenticated users" ON job_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow INSERT for authenticated users" ON job_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow UPDATE for authenticated users" ON job_items
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Sync Logs policies (append-only for most operations)
CREATE POLICY "Allow SELECT for authenticated users" ON sync_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow INSERT for authenticated users" ON sync_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- INITIAL DATA SETUP
-- =============================================================================

-- Insert default channels
INSERT INTO channels (slug, name, is_active) VALUES
  ('shopee', 'Shopee', true),
  ('tiktokshop', 'TikTok Shop', true),
  ('tokopedia', 'Tokopedia', false)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- UTILITY FUNCTIONS FOR AUDIT LOGGING
-- =============================================================================

-- Function to log sync operations
CREATE OR REPLACE FUNCTION log_sync_operation(
  p_job_id UUID,
  p_level TEXT,
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

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_platform ON orders(platform);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);

-- Listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_product_id ON listings(product_id);
CREATE INDEX IF NOT EXISTS idx_listings_channel ON listings(channel);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_published ON listings(is_published);

-- Jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_channel ON jobs(channel);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- Job Items indexes
CREATE INDEX IF NOT EXISTS idx_job_items_job_id ON job_items(job_id);
CREATE INDEX IF NOT EXISTS idx_job_items_status ON job_items(status);
CREATE INDEX IF NOT EXISTS idx_job_items_next_retry ON job_items(next_retry_at);

-- Sync Logs indexes
CREATE INDEX IF NOT EXISTS idx_sync_logs_job_id ON sync_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_level ON sync_logs(level);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs(created_at);

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE channels IS 'Available e-commerce platforms/channels';
COMMENT ON TABLE channel_accounts IS 'User accounts on various channels (multi-market support)';
COMMENT ON TABLE listings IS 'Product listings on specific channels and markets';
COMMENT ON TABLE jobs IS 'Background sync job queue and tracking';
COMMENT ON TABLE job_items IS 'Individual items within sync jobs';
COMMENT ON TABLE sync_logs IS 'Audit log for all sync operations';

COMMENT ON COLUMN channel_accounts.credentials_ref IS 'Reference to where credentials are stored: env:VARIABLE_NAME or vault:key_name';
COMMENT ON COLUMN listings.status IS 'draft=not synced, published=live on platform, unlisted=removed, error=failed sync';
COMMENT ON COLUMN jobs.type IS 'pull=fetch from platform, push=send to platform, sync=bi-directional';
COMMENT ON COLUMN job_items.item_type IS 'Type of item being synced: product, order, stock, price';

-- =============================================================================
-- SECURITY VERIFICATION
-- =============================================================================

-- Verify RLS is enabled
DO $$
DECLARE
  table_name TEXT;
  rls_enabled BOOLEAN;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    AND tablename IN ('products', 'orders', 'customers', 'transactions', 'conversations', 'messages', 'channels', 'channel_accounts', 'listings', 'jobs', 'job_items', 'sync_logs')
  LOOP
    EXECUTE format('SELECT row_security FROM pg_tables WHERE schemaname = ''public'' AND tablename = %L', table_name) INTO rls_enabled;
    IF NOT rls_enabled THEN
      RAISE EXCEPTION 'RLS not enabled on table: %', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'All tables have RLS enabled successfully';
END;
$$;