-- ============================================
-- QUICK FIX FOR MISSING TABLES
-- ============================================
-- Run this if you're seeing "table not found" errors
-- This creates the most commonly missing tables
-- ============================================

-- 1. Enable UUID extension (needed for IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create project_states table (if missing)
CREATE TABLE IF NOT EXISTS public.project_states (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_states_org 
  ON public.project_states(organization_id);

CREATE INDEX IF NOT EXISTS idx_project_states_updated 
  ON public.project_states(updated_at DESC);

-- 3. Create contact_messages table (if missing)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status 
  ON public.contact_messages(status);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created 
  ON public.contact_messages(created_at DESC);

-- 4. Create pricing_configuration table (if missing)
CREATE TABLE IF NOT EXISTS public.pricing_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plans JSONB NOT NULL,
  trial_days INTEGER DEFAULT 14,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing (only if table is empty)
INSERT INTO public.pricing_configuration (plans, trial_days)
SELECT 
  '{
    "growth": {
      "monthlyPrice": 15,
      "annualPrice": 150,
      "features": ["Up to 500 clients", "Basic reporting", "Email support", "Mobile access"]
    },
    "professional": {
      "monthlyPrice": 35,
      "annualPrice": 350,
      "features": ["Up to 2,000 clients", "Advanced analytics", "Priority support", "API access"]
    },
    "enterprise": {
      "monthlyPrice": 75,
      "annualPrice": 750,
      "features": ["Unlimited clients", "White-label option", "Dedicated support", "SLA guarantee"]
    }
  }'::jsonb,
  14
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_configuration LIMIT 1);

-- 5. Disable RLS on these tables for testing
ALTER TABLE IF EXISTS public.project_states DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pricing_configuration DISABLE ROW LEVEL SECURITY;

-- 6. Verify tables were created
SELECT 
  '✅ Quick fix complete!' as status,
  'The following tables are now available:' as info;

SELECT 
  table_name,
  CASE 
    WHEN table_name = 'project_states' THEN '📦 Stores organization data as JSON'
    WHEN table_name = 'contact_messages' THEN '📧 Stores contact form submissions'
    WHEN table_name = 'pricing_configuration' THEN '💰 Stores pricing plans'
    ELSE 'Other table'
  END as description
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('project_states', 'contact_messages', 'pricing_configuration')
ORDER BY table_name;

-- 7. Check RLS status
SELECT 
  '🔓 RLS Status (should be false for testing):' as info;

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('project_states', 'contact_messages', 'pricing_configuration')
ORDER BY tablename;

-- ============================================
-- DONE!
-- ============================================
-- Your missing tables have been created.
-- Refresh your app (Ctrl+Shift+R) to clear errors.
-- ============================================
