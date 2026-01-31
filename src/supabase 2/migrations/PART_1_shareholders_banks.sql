-- =====================================================
-- PART 1: SHAREHOLDERS, SHAREHOLDER_TRANSACTIONS, BANK_ACCOUNTS
-- Run this first, then wait for it to complete before running Part 2
-- =====================================================

-- 1. SHAREHOLDERS (3 missing columns)
ALTER TABLE shareholders
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS shareholder_id TEXT,
ADD COLUMN IF NOT EXISTS shares NUMERIC DEFAULT 0;

-- 2. SHAREHOLDER_TRANSACTIONS (1 missing column)
ALTER TABLE shareholder_transactions
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- 3. BANK_ACCOUNTS (2 missing columns)
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
