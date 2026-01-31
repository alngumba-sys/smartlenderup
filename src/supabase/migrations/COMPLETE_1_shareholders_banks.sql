-- =====================================================
-- COMPLETE PART 1: CREATE TABLES + ADD COLUMNS
-- Shareholders, Shareholder Transactions, Bank Accounts
-- =====================================================

-- 1. CREATE SHAREHOLDERS TABLE
CREATE TABLE IF NOT EXISTS shareholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  shareholder_id TEXT,
  name TEXT NOT NULL,
  shares NUMERIC DEFAULT 0,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing table
ALTER TABLE shareholders
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS shareholder_id TEXT,
ADD COLUMN IF NOT EXISTS shares NUMERIC DEFAULT 0;

-- 2. CREATE SHAREHOLDER_TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS shareholder_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  shareholder_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE shareholder_transactions
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- 3. CREATE BANK_ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  account_name TEXT,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  branch TEXT,
  balance NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'KES',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE bank_accounts
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS account_name TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shareholders_org_id ON shareholders(organization_id);
CREATE INDEX IF NOT EXISTS idx_shareholders_shareholder_id ON shareholders(shareholder_id);
CREATE INDEX IF NOT EXISTS idx_shareholder_transactions_org_id ON shareholder_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_org_id ON bank_accounts(organization_id);

-- Enable RLS
ALTER TABLE shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareholder_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view shareholders in their organization" ON shareholders;
CREATE POLICY "Users can view shareholders in their organization"
  ON shareholders FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

DROP POLICY IF EXISTS "Users can view shareholder_transactions in their organization" ON shareholder_transactions;
CREATE POLICY "Users can view shareholder_transactions in their organization"
  ON shareholder_transactions FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

DROP POLICY IF EXISTS "Users can view bank_accounts in their organization" ON bank_accounts;
CREATE POLICY "Users can view bank_accounts in their organization"
  ON bank_accounts FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));
