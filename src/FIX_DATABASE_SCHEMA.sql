-- ============================================
-- 🔧 FIX FOR SCHEMA ERROR
-- ============================================
-- This fixes the "user_id does not exist" error
-- Run this FIRST, then run the main schema
-- ============================================

-- STEP 1: Drop existing tables if they have conflicts
-- (Only if you're okay losing existing data!)
-- ⚠️ WARNING: This will delete all data in these tables!

-- Uncomment the lines below if you want to start fresh:
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.audit_logs CASCADE;
-- DROP TABLE IF EXISTS public.funding_transactions CASCADE;

-- ============================================
-- STEP 2: Check if organizations table already exists with wrong schema
-- ============================================

-- If you already have an organizations table, you need to check if it has user_id column
-- Run this query first to see:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'organizations' AND table_schema = 'public';

-- ============================================
-- ALTERNATIVE APPROACH: Run the schema in sections
-- ============================================

-- Instead of running the entire COMPLETE_DATABASE_SETUP.sql at once,
-- run it in sections:

-- SECTION 1: Extensions (lines 8-10)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- SECTION 2: Organizations table (lines 15-46)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name TEXT NOT NULL,
  organization_type TEXT DEFAULT 'mother_company' CHECK (organization_type IN ('mother_company', 'subsidiary_company', 'branch')),
  parent_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  country TEXT DEFAULT 'Kenya',
  currency TEXT DEFAULT 'KES',
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled')),
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '14 days',
  subscription_plan TEXT CHECK (subscription_plan IN ('growth', 'professional', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  number_format TEXT DEFAULT 'comma',
  fiscal_year_start TEXT DEFAULT '01-01',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'rejected', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  
  -- CRITICAL: Password field for authentication
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organizations_email ON public.organizations(email);
CREATE INDEX IF NOT EXISTS idx_organizations_username ON public.organizations(username);

-- ============================================
-- 💡 DEBUGGING HINT
-- ============================================
-- If this fails with "user_id does not exist", it means:
--
-- 1. You have an existing organizations table with a DIFFERENT schema
-- 2. There's a trigger/policy on organizations that references user_id
-- 3. There's a view or function that references user_id
--
-- TO FIX:
-- Run this query to find the problem:

SELECT 
  'TABLE' as type, 
  table_name 
FROM information_schema.columns 
WHERE column_name = 'user_id' 
  AND table_schema = 'public'
UNION ALL
SELECT 
  'TRIGGER' as type,
  trigger_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
UNION ALL
SELECT 
  'VIEW' as type,
  table_name
FROM information_schema.views
WHERE table_schema = 'public';

-- This will show you WHAT is referencing user_id
-- Then you can drop it manually before running the schema
