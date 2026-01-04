-- =====================================================
-- FIX PART 3: Add columns to payroll_runs and funding_transactions
-- =====================================================

-- PAYROLL_RUNS (12 missing columns)
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS period TEXT;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS pay_date TIMESTAMPTZ;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS employees JSONB DEFAULT '[]'::jsonb;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS total_gross_pay NUMERIC DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS total_net_pay NUMERIC DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS approved_date TIMESTAMPTZ;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS paid_date TIMESTAMPTZ;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS bank_account_id TEXT;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS notes TEXT;

-- FUNDING_TRANSACTIONS (3 missing columns)
ALTER TABLE funding_transactions ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE funding_transactions ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE funding_transactions ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMPTZ DEFAULT NOW();
