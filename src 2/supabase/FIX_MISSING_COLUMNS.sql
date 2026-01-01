-- ============================================
-- FIX MISSING COLUMNS
-- Add all missing columns to shareholders, shareholder_transactions, 
-- bank_accounts, and expenses tables
-- ============================================

-- ============================================
-- 1. SHAREHOLDERS TABLE - Add 3 missing columns
-- ============================================

-- Add organization_id column
ALTER TABLE shareholders 
ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- Add shareholder_id column
ALTER TABLE shareholders 
ADD COLUMN IF NOT EXISTS shareholder_id TEXT;

-- Add shares column
ALTER TABLE shareholders 
ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_shareholders_org_id ON shareholders(organization_id);
CREATE INDEX IF NOT EXISTS idx_shareholders_shareholder_id ON shareholders(shareholder_id);

-- ============================================
-- 2. SHAREHOLDER_TRANSACTIONS TABLE - Add 1 missing column
-- ============================================

-- Add organization_id column
ALTER TABLE shareholder_transactions 
ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_shareholder_transactions_org_id ON shareholder_transactions(organization_id);

-- ============================================
-- 3. BANK_ACCOUNTS TABLE - Add 2 missing columns
-- ============================================

-- Add organization_id column
ALTER TABLE bank_accounts 
ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- Add account_name column
ALTER TABLE bank_accounts 
ADD COLUMN IF NOT EXISTS account_name TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_bank_accounts_org_id ON bank_accounts(organization_id);

-- ============================================
-- 4. EXPENSES TABLE - Add 7 missing columns
-- ============================================

-- Add organization_id column
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- Add expense_id column
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS expense_id TEXT;

-- Add subcategory column
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Add payment_reference column
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Add payment_date column
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- Add attachments column (JSONB for storing array of attachment objects)
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Add payment_type column
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS payment_type TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_org_id ON expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_id ON expenses(expense_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_date ON expenses(payment_date);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check shareholders columns
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'shareholders'
ORDER BY ordinal_position;

-- Check shareholder_transactions columns
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'shareholder_transactions'
ORDER BY ordinal_position;

-- Check bank_accounts columns
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'bank_accounts'
ORDER BY ordinal_position;

-- Check expenses columns
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'expenses'
ORDER BY ordinal_position;

-- ============================================
-- OPTIONAL: Populate default values
-- ============================================

-- Set default organization_id for existing records (if needed)
-- Replace 'default-org-123' with your actual organization ID

/*
UPDATE shareholders 
SET organization_id = 'default-org-123' 
WHERE organization_id IS NULL;

UPDATE shareholder_transactions 
SET organization_id = 'default-org-123' 
WHERE organization_id IS NULL;

UPDATE bank_accounts 
SET organization_id = 'default-org-123' 
WHERE organization_id IS NULL;

UPDATE expenses 
SET organization_id = 'default-org-123' 
WHERE organization_id IS NULL;
*/

-- ============================================
-- COMPLETE! ✅
-- ============================================

/*
Summary of changes:

SHAREHOLDERS:
✅ Added organization_id (TEXT)
✅ Added shareholder_id (TEXT)
✅ Added shares (INTEGER)

SHAREHOLDER_TRANSACTIONS:
✅ Added organization_id (TEXT)

BANK_ACCOUNTS:
✅ Added organization_id (TEXT)
✅ Added account_name (TEXT)

EXPENSES:
✅ Added organization_id (TEXT)
✅ Added expense_id (TEXT)
✅ Added subcategory (TEXT)
✅ Added payment_reference (TEXT)
✅ Added payment_date (TIMESTAMPTZ)
✅ Added attachments (JSONB)
✅ Added payment_type (TEXT)

Total: 13 columns added
Indexes: 7 new indexes created

Next steps:
1. Run the optional UPDATE statements to populate organization_id for existing records
2. Consider adding NOT NULL constraints after populating data
3. Update your application code to use these new columns
*/
