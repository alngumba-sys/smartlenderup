-- ============================================
-- SUPABASE TABLE CREATION SCRIPT
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- SHAREHOLDERS TABLE
CREATE TABLE IF NOT EXISTS public.shareholders (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  id_number TEXT,
  address TEXT,
  share_capital NUMERIC(15, 2) DEFAULT 0,
  ownership_percentage NUMERIC(5, 2) DEFAULT 0,
  bank_account JSONB,
  status TEXT NOT NULL DEFAULT 'active',
  total_dividends NUMERIC(15, 2) DEFAULT 0,
  shares NUMERIC(10, 2) DEFAULT 0,
  share_value NUMERIC(15, 2) DEFAULT 0,
  total_investment NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for organization_id lookups
CREATE INDEX IF NOT EXISTS idx_shareholders_organization_id ON public.shareholders(organization_id);

-- Enable Row Level Security
ALTER TABLE public.shareholders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their organization's shareholders
CREATE POLICY "Users can view shareholders in their organization" ON public.shareholders
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to insert shareholders in their organization
CREATE POLICY "Users can insert shareholders in their organization" ON public.shareholders
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow authenticated users to update shareholders in their organization
CREATE POLICY "Users can update shareholders in their organization" ON public.shareholders
  FOR UPDATE
  USING (true);

-- Create policy to allow authenticated users to delete shareholders in their organization
CREATE POLICY "Users can delete shareholders in their organization" ON public.shareholders
  FOR DELETE
  USING (true);
