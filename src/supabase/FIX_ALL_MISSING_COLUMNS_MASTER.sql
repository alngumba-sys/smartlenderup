-- ============================================
-- MASTER SCRIPT: FIX ALL MISSING COLUMNS
-- Run this complete script to fix all 13 missing columns
-- ============================================

-- STEP 0: Configuration
-- IMPORTANT: Replace 'YOUR_ORG_ID_HERE' with your actual organization ID
-- Find it by running: SELECT DISTINCT raw_user_meta_data->>'organizationId' FROM auth.users LIMIT 1;

DO $$
DECLARE
  v_org_id TEXT := 'YOUR_ORG_ID_HERE';  -- ⚠️ REPLACE THIS!
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Starting missing columns fix...';
  RAISE NOTICE 'Organization ID: %', v_org_id;
  RAISE NOTICE '====================================';
  
  -- Store the org_id in a temporary variable for use in this session
  -- (Note: This approach works within this DO block)
END $$;

-- ============================================
-- STEP 1: ADD MISSING COLUMNS
-- ============================================

-- SHAREHOLDERS - Add 3 columns
ALTER TABLE shareholders ADD COLUMN IF NOT EXISTS organization_id TEXT;
ALTER TABLE shareholders ADD COLUMN IF NOT EXISTS shareholder_id TEXT;
ALTER TABLE shareholders ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0;

-- SHAREHOLDER_TRANSACTIONS - Add 1 column
ALTER TABLE shareholder_transactions ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- BANK_ACCOUNTS - Add 2 columns
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS organization_id TEXT;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS account_name TEXT;

-- EXPENSES - Add 7 columns
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS organization_id TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_id TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_type TEXT;

RAISE NOTICE '✅ Step 1: All columns added';

-- ============================================
-- STEP 2: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_shareholders_org_id ON shareholders(organization_id);
CREATE INDEX IF NOT EXISTS idx_shareholders_shareholder_id ON shareholders(shareholder_id);
CREATE INDEX IF NOT EXISTS idx_shareholder_transactions_org_id ON shareholder_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_org_id ON bank_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_org_id ON expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_id ON expenses(expense_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_date ON expenses(payment_date);

RAISE NOTICE '✅ Step 2: Indexes created';

-- ============================================
-- STEP 3: POPULATE DATA
-- ============================================

-- Replace 'YOUR_ORG_ID_HERE' in the UPDATE statements below!

-- SHAREHOLDERS
UPDATE shareholders SET organization_id = 'YOUR_ORG_ID_HERE' WHERE organization_id IS NULL;

WITH numbered_shareholders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM shareholders WHERE shareholder_id IS NULL
)
UPDATE shareholders s
SET shareholder_id = 'SH' || LPAD(ns.row_num::text, 3, '0')
FROM numbered_shareholders ns
WHERE s.id = ns.id;

UPDATE shareholders SET shares = 0 WHERE shares IS NULL;

-- SHAREHOLDER_TRANSACTIONS
UPDATE shareholder_transactions SET organization_id = 'YOUR_ORG_ID_HERE' WHERE organization_id IS NULL;

-- BANK_ACCOUNTS
UPDATE bank_accounts SET organization_id = 'YOUR_ORG_ID_HERE' WHERE organization_id IS NULL;
UPDATE bank_accounts SET account_name = COALESCE(name, 'Account ' || id) WHERE account_name IS NULL;

-- EXPENSES
UPDATE expenses SET organization_id = 'YOUR_ORG_ID_HERE' WHERE organization_id IS NULL;

WITH numbered_expenses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY COALESCE(date, created_at)) as row_num
  FROM expenses WHERE expense_id IS NULL
)
UPDATE expenses e
SET expense_id = 'EXP' || LPAD(ne.row_num::text, 4, '0')
FROM numbered_expenses ne
WHERE e.id = ne.id;

UPDATE expenses SET subcategory = category WHERE subcategory IS NULL AND category IS NOT NULL;
UPDATE expenses SET payment_reference = 'REF-' || id WHERE payment_reference IS NULL;
UPDATE expenses SET payment_date = date::timestamp with time zone WHERE payment_date IS NULL AND date IS NOT NULL;
UPDATE expenses SET attachments = '[]'::jsonb WHERE attachments IS NULL;
UPDATE expenses SET payment_type = COALESCE(payment_method, 'Cash') WHERE payment_type IS NULL;

RAISE NOTICE '✅ Step 3: Data populated';

-- ============================================
-- STEP 4: ENABLE RLS
-- ============================================

ALTER TABLE shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareholder_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

RAISE NOTICE '✅ Step 4: RLS enabled';

-- ============================================
-- STEP 5: CREATE RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their organization's shareholders" ON shareholders;
DROP POLICY IF EXISTS "Users can insert their organization's shareholders" ON shareholders;
DROP POLICY IF EXISTS "Users can update their organization's shareholders" ON shareholders;
DROP POLICY IF EXISTS "Users can delete their organization's shareholders" ON shareholders;

DROP POLICY IF EXISTS "Users can view their organization's shareholder transactions" ON shareholder_transactions;
DROP POLICY IF EXISTS "Users can insert their organization's shareholder transactions" ON shareholder_transactions;
DROP POLICY IF EXISTS "Users can update their organization's shareholder transactions" ON shareholder_transactions;
DROP POLICY IF EXISTS "Users can delete their organization's shareholder transactions" ON shareholder_transactions;

DROP POLICY IF EXISTS "Users can view their organization's bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can insert their organization's bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can update their organization's bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can delete their organization's bank accounts" ON bank_accounts;

DROP POLICY IF EXISTS "Users can view their organization's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their organization's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their organization's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their organization's expenses" ON expenses;

-- Create new policies for SHAREHOLDERS
CREATE POLICY "Users can view their organization's shareholders" ON shareholders
  FOR SELECT USING (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their organization's shareholders" ON shareholders
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization's shareholders" ON shareholders
  FOR UPDATE USING (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their organization's shareholders" ON shareholders
  FOR DELETE USING (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

-- Create new policies for SHAREHOLDER_TRANSACTIONS
CREATE POLICY "Users can view their organization's shareholder transactions" ON shareholder_transactions
  FOR SELECT USING (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their organization's shareholder transactions" ON shareholder_transactions
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization's shareholder transactions" ON shareholder_transactions
  FOR UPDATE USING (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their organization's shareholder transactions" ON shareholder_transactions
  FOR DELETE USING (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

-- Create new policies for BANK_ACCOUNTS
CREATE POLICY "Users can view their organization's bank accounts" ON bank_accounts
  FOR SELECT USING (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their organization's bank accounts" ON bank_accounts
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization's bank accounts" ON bank_accounts
  FOR UPDATE USING (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their organization's bank accounts" ON bank_accounts
  FOR DELETE USING (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

-- Create new policies for EXPENSES
CREATE POLICY "Users can view their organization's expenses" ON expenses
  FOR SELECT USING (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their organization's expenses" ON expenses
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization's expenses" ON expenses
  FOR UPDATE USING (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their organization's expenses" ON expenses
  FOR DELETE USING (organization_id IN (SELECT organization_id::text FROM users WHERE id = auth.uid()));

RAISE NOTICE '✅ Step 5: RLS policies created';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check column counts
SELECT 
  'shareholders' as table_name,
  COUNT(*) FILTER (WHERE column_name = 'organization_id') as has_organization_id,
  COUNT(*) FILTER (WHERE column_name = 'shareholder_id') as has_shareholder_id,
  COUNT(*) FILTER (WHERE column_name = 'shares') as has_shares
FROM information_schema.columns
WHERE table_name = 'shareholders'
UNION ALL
SELECT 
  'shareholder_transactions',
  COUNT(*) FILTER (WHERE column_name = 'organization_id'),
  0, 0
FROM information_schema.columns
WHERE table_name = 'shareholder_transactions'
UNION ALL
SELECT 
  'bank_accounts',
  COUNT(*) FILTER (WHERE column_name = 'organization_id'),
  COUNT(*) FILTER (WHERE column_name = 'account_name'),
  0
FROM information_schema.columns
WHERE table_name = 'bank_accounts'
UNION ALL
SELECT 
  'expenses',
  COUNT(*) FILTER (WHERE column_name = 'organization_id'),
  COUNT(*) FILTER (WHERE column_name = 'expense_id'),
  COUNT(*) FILTER (WHERE column_name = 'subcategory')
FROM information_schema.columns
WHERE table_name = 'expenses';

-- Check data population
SELECT 'SHAREHOLDERS' as entity, 
  COUNT(*) as total_records,
  COUNT(organization_id) as with_org_id,
  COUNT(shareholder_id) as with_shareholder_id
FROM shareholders
UNION ALL
SELECT 'SHAREHOLDER_TRANSACTIONS', 
  COUNT(*), COUNT(organization_id), 0
FROM shareholder_transactions
UNION ALL
SELECT 'BANK_ACCOUNTS', 
  COUNT(*), COUNT(organization_id), COUNT(account_name)
FROM bank_accounts
UNION ALL
SELECT 'EXPENSES', 
  COUNT(*), COUNT(organization_id), COUNT(expense_id)
FROM expenses;

-- ============================================
-- COMPLETE! ✅
-- ============================================

/*
====================================
ALL MISSING COLUMNS FIXED!
====================================

Changes applied:
✅ 13 columns added across 4 tables
✅ 7 indexes created
✅ Data populated with default values
✅ RLS enabled on all tables
✅ 16 RLS policies created

Tables fixed:
1. shareholders (3 columns)
2. shareholder_transactions (1 column)
3. bank_accounts (2 columns)
4. expenses (7 columns)

⚠️ IMPORTANT: 
Make sure you replaced 'YOUR_ORG_ID_HERE' with your actual organization ID
in the UPDATE statements above!

Next steps:
1. Verify the results above show correct counts
2. Test your application to ensure it works with new columns
3. Update any TypeScript interfaces to match new schema
*/
