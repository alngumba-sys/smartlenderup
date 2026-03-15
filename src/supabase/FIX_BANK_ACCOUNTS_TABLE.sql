-- ============================================
-- FIX BANK ACCOUNTS TABLE
-- ============================================
-- Run this in Supabase SQL Editor to fix bank account errors
-- This adds missing columns if they don't exist
-- ============================================

-- Option 1: If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  
  -- Basic Information
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  branch TEXT,
  account_type TEXT,
  
  -- Financial Information
  balance NUMERIC(15, 2) DEFAULT 0,
  opening_balance NUMERIC(15, 2) DEFAULT 0,
  current_balance NUMERIC(15, 2) DEFAULT 0,
  
  -- Optional Fields
  currency TEXT DEFAULT 'KES',
  status TEXT DEFAULT 'active',
  opening_date DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Option 2: If table exists but missing columns, add them
-- These will silently succeed if columns already exist

ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS account_name TEXT;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS account_type TEXT;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS balance NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS opening_balance NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS current_balance NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'KES';
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS opening_date DATE;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bank_accounts_org ON public.bank_accounts(organization_id);

-- Enable Row Level Security
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "bank_accounts_select_policy" ON public.bank_accounts;
CREATE POLICY "bank_accounts_select_policy"
ON public.bank_accounts FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "bank_accounts_insert_policy" ON public.bank_accounts;
CREATE POLICY "bank_accounts_insert_policy"
ON public.bank_accounts FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "bank_accounts_update_policy" ON public.bank_accounts;
CREATE POLICY "bank_accounts_update_policy"
ON public.bank_accounts FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "bank_accounts_delete_policy" ON public.bank_accounts;
CREATE POLICY "bank_accounts_delete_policy"
ON public.bank_accounts FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- DONE! Bank accounts table is now ready.
-- Refresh your application to test.
-- ============================================
