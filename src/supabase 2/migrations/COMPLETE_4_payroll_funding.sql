-- =====================================================
-- COMPLETE PART 4: CREATE TABLES + ADD COLUMNS
-- Payroll Runs, Funding Transactions
-- =====================================================

-- 8. CREATE PAYROLL_RUNS TABLE
CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT,
  pay_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Draft',
  employees JSONB DEFAULT '[]'::jsonb,
  total_gross_pay NUMERIC DEFAULT 0,
  total_deductions NUMERIC DEFAULT 0,
  total_net_pay NUMERIC DEFAULT 0,
  created_by TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  approved_by TEXT,
  approved_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,
  bank_account_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE payroll_runs
ADD COLUMN IF NOT EXISTS period TEXT,
ADD COLUMN IF NOT EXISTS pay_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS employees JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_gross_pay NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_net_pay NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by TEXT,
ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS approved_by TEXT,
ADD COLUMN IF NOT EXISTS approved_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paid_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bank_account_id TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 9. CREATE FUNDING_TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS funding_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_id TEXT,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  source TEXT,
  destination TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  description TEXT,
  status TEXT DEFAULT 'Completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE funding_transactions
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMPTZ DEFAULT NOW();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payroll_runs_pay_date ON payroll_runs(pay_date);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_status ON payroll_runs(status);
CREATE INDEX IF NOT EXISTS idx_funding_transactions_org_id ON funding_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_funding_transactions_transaction_id ON funding_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_funding_transactions_transaction_date ON funding_transactions(transaction_date);

-- Enable RLS
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view all payroll runs" ON payroll_runs;
CREATE POLICY "Users can view all payroll runs"
  ON payroll_runs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can view funding_transactions in their organization" ON funding_transactions;
CREATE POLICY "Users can view funding_transactions in their organization"
  ON funding_transactions FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));
