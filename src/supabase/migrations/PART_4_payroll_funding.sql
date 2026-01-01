-- =====================================================
-- PART 4: PAYROLL_RUNS, FUNDING_TRANSACTIONS
-- Run this after Part 3 completes successfully
-- =====================================================

-- 8. PAYROLL_RUNS (12 missing columns)
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

-- 9. FUNDING_TRANSACTIONS (3 missing columns)
ALTER TABLE funding_transactions
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMPTZ DEFAULT NOW();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payroll_runs_pay_date ON payroll_runs(pay_date);
CREATE INDEX IF NOT EXISTS idx_funding_transactions_org_id ON funding_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_funding_transactions_transaction_id ON funding_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_funding_transactions_transaction_date ON funding_transactions(transaction_date);

-- Enable RLS
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_transactions ENABLE ROW LEVEL SECURITY;
