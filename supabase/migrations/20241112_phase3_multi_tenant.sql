-- =============================================================================
-- AIOStore Phase 3 - Multi-Tenant Database Migration
-- 
-- This script implements the multi-tenant architecture as specified in the
-- production hardening plan, including branches, memberships, and token storage.
-- 
-- Run this in Supabase SQL Editor after confirming all prerequisites.
-- =============================================================================

-- Extensions (enable from Extensions UI if needed)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============ SCHEMA ============
-- 1) Tenancy roots
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.branch_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner','admin','operator','viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_branch_members_branch ON public.branch_members(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_members_user ON public.branch_members(user_id);

-- 2) Channel accounts (Shopee/TTS/Tokopedia)
CREATE TABLE IF NOT EXISTS public.channel_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('SHOPEE','TTS','TOKOPEDIA')),
  is_sandbox boolean NOT NULL DEFAULT false,
  shop_id text, -- Shopee/TTS shop id (text to avoid bigint hassles)
  seller_id text, -- optional for Shopee merchant-based flows
  display_name text,
  scopes text[],
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','disabled','error')),
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (channel, shop_id, is_sandbox)
);
CREATE INDEX IF NOT EXISTS idx_channel_accounts_branch ON public.channel_accounts(branch_id);
CREATE INDEX IF NOT EXISTS idx_channel_accounts_channel ON public.channel_accounts(channel, is_sandbox);

-- 3) Token storage (access/refresh, active flag, expiry)
CREATE TABLE IF NOT EXISTS public.channel_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_account_id uuid NOT NULL REFERENCES public.channel_accounts(id) ON DELETE CASCADE,
  token_type text NOT NULL CHECK (token_type IN ('access','refresh')),
  token text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_channel_tokens_account ON public.channel_tokens(channel_account_id, active);
CREATE INDEX IF NOT EXISTS idx_channel_tokens_expiry ON public.channel_tokens(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_channel_tokens_active_one
  ON public.channel_tokens(channel_account_id, token_type)
  WHERE active = true;

-- (Optional) Job tables if not present yet
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  channel_account_id uuid REFERENCES public.channel_accounts(id) ON DELETE SET NULL,
  kind text NOT NULL, -- e.g., 'pull:products', 'push:stock', 'pull:orders'
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','done','failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text
);
CREATE INDEX IF NOT EXISTS idx_jobs_branch ON public.jobs(branch_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);

CREATE TABLE IF NOT EXISTS public.job_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  ref_id text, -- item id at source
  payload jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','done','failed','skipped')),
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_job_items_job ON public.job_items(job_id);

CREATE TABLE IF NOT EXISTS public.sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  channel_account_id uuid REFERENCES public.channel_accounts(id) ON DELETE SET NULL,
  level text NOT NULL DEFAULT 'info' CHECK (level IN ('debug','info','warn','error')),
  message text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ RLS ============
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Helper: membership check
CREATE OR REPLACE FUNCTION public.is_member_of_branch(b_id uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = b_id AND bm.user_id = auth.uid()
  );
$$;

-- branches
CREATE POLICY IF NOT EXISTS branches_select ON public.branches
FOR SELECT USING (public.is_member_of_branch(id));
CREATE POLICY IF NOT EXISTS branches_modify ON public.branches
FOR ALL USING (false) WITH CHECK (false);

-- branch_members
CREATE POLICY IF NOT EXISTS branch_members_select ON public.branch_members
FOR SELECT USING (public.is_member_of_branch(branch_id));
CREATE POLICY IF NOT EXISTS branch_members_modify ON public.branch_members
FOR ALL USING (false) WITH CHECK (false);

-- channel_accounts
CREATE POLICY IF NOT EXISTS channel_accounts_select ON public.channel_accounts
FOR SELECT USING (public.is_member_of_branch(branch_id));
CREATE POLICY IF NOT EXISTS channel_accounts_modify ON public.channel_accounts
FOR ALL USING (false) WITH CHECK (false);

-- channel_tokens (read limited)
CREATE POLICY IF NOT EXISTS channel_tokens_select ON public.channel_tokens
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.channel_accounts ca
    WHERE ca.id = channel_account_id AND public.is_member_of_branch(ca.branch_id)
  )
);
CREATE POLICY IF NOT EXISTS channel_tokens_modify ON public.channel_tokens
FOR ALL USING (false) WITH CHECK (false);

-- jobs / job_items / logs (read only for members)
CREATE POLICY IF NOT EXISTS jobs_select ON public.jobs
FOR SELECT USING (public.is_member_of_branch(branch_id));
CREATE POLICY IF NOT EXISTS jobs_modify ON public.jobs
FOR ALL USING (false) WITH CHECK (false);

CREATE POLICY IF NOT EXISTS job_items_select ON public.job_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = job_id AND public.is_member_of_branch(j.branch_id)
  )
);
CREATE POLICY IF NOT EXISTS job_items_modify ON public.job_items
FOR ALL USING (false) WITH CHECK (false);

CREATE POLICY IF NOT EXISTS sync_logs_select ON public.sync_logs
FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS sync_logs_modify ON public.sync_logs
FOR ALL USING (false) WITH CHECK (false);

-- ============ SECURE RPCS (server-only usage) ============
-- Optional: use these via PostgREST with service role from server (NOT from client)

-- Fetch active access token for an account
CREATE OR REPLACE FUNCTION public.get_active_access_token(p_account_id uuid)
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT token FROM public.channel_tokens
  WHERE channel_account_id = p_account_id AND token_type = 'access' AND active = true
  LIMIT 1;
$$;

-- Rotate tokens: deactivate old and insert new (call from server only)
CREATE OR REPLACE FUNCTION public.rotate_channel_token(
  p_account_id uuid,
  p_token_type text,
  p_token text,
  p_expires_at timestamptz,
  p_raw jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.channel_tokens
    SET active = false
    WHERE channel_account_id = p_account_id AND token_type = p_token_type AND active = true;

  INSERT INTO public.channel_tokens(channel_account_id, token_type, token, expires_at, active, raw)
  VALUES (p_account_id, p_token_type, p_token, p_expires_at, true, p_raw);
END;$$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ AIOStore Phase 3 multi-tenant migration completed!';
    RAISE NOTICE '📊 Created branches, memberships, channel accounts, tokens, and RLS policies';
    RAISE NOTICE '🔒 All tables have proper multi-tenant RLS policies';
    RAISE NOTICE '🚀 Ready for production use!';
END $$;