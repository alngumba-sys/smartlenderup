-- ============================================
-- CREATE SHAREHOLDERS TABLE ONLY
-- ============================================
-- Run this in Supabase SQL Editor to fix the error
-- ============================================

-- Create shareholders table
CREATE TABLE IF NOT EXISTS public.shareholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  
  -- Shareholder Details
  name TEXT,
  shareholder_name TEXT,
  id_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  
  -- Shares & Investment
  shares INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  share_value DECIMAL(15,2) DEFAULT 0,
  share_percentage DECIMAL(5,2) DEFAULT 0,
  total_investment DECIMAL(15,2) DEFAULT 0,
  share_capital DECIMAL(15,2) DEFAULT 0,
  ownership_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Dividends
  total_dividends DECIMAL(15,2) DEFAULT 0,
  
  -- Dates
  investment_date DATE,
  join_date DATE,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shareholders_org ON public.shareholders(organization_id);

-- Enable Row Level Security
ALTER TABLE public.shareholders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "shareholders_select_policy" ON public.shareholders;
CREATE POLICY "shareholders_select_policy"
ON public.shareholders FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "shareholders_insert_policy" ON public.shareholders;
CREATE POLICY "shareholders_insert_policy"
ON public.shareholders FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "shareholders_update_policy" ON public.shareholders;
CREATE POLICY "shareholders_update_policy"
ON public.shareholders FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "shareholders_delete_policy" ON public.shareholders;
CREATE POLICY "shareholders_delete_policy"
ON public.shareholders FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- DONE! The error should be fixed now.
-- Refresh your application to test.
-- ============================================
