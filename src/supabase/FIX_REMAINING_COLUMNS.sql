-- ============================================
-- FIX REMAINING MISSING COLUMNS
-- Quick fix for final missing columns
-- ============================================

-- TABLE: shareholders (3 missing columns)
ALTER TABLE shareholders
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS shareholder_id TEXT,
  ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0;

-- TABLE: shareholder_transactions (1 missing column)
ALTER TABLE shareholder_transactions
  ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- TABLE: bank_accounts (2 missing columns)
ALTER TABLE bank_accounts
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS account_name TEXT;

-- TABLE: expenses (7 missing columns)
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS organization_id TEXT,
  ADD COLUMN IF NOT EXISTS expense_id TEXT,
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_date TEXT,
  ADD COLUMN IF NOT EXISTS attachments JSONB,
  ADD COLUMN IF NOT EXISTS payment_type TEXT;

-- ============================================
-- CREATE INDEXES FOR ORGANIZATION_ID
-- ============================================

CREATE INDEX IF NOT EXISTS idx_shareholders_org_id ON shareholders(organization_id);
CREATE INDEX IF NOT EXISTS idx_shareholders_shareholder_id ON shareholders(shareholder_id);
CREATE INDEX IF NOT EXISTS idx_shareholder_trans_org_id ON shareholder_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_org_id ON bank_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_org_id ON expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_id ON expenses(expense_id);

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Run this to verify all columns were added:
/*
SELECT 
  'shareholders' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'shareholders';

SELECT 
  'shareholder_transactions' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'shareholder_transactions';

SELECT 
  'bank_accounts' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'bank_accounts';

SELECT 
  'expenses' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'expenses';
*/

-- ============================================
-- COMPLETE! ✅
-- ============================================
