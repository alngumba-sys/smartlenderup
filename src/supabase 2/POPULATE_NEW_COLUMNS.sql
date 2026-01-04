-- ============================================
-- POPULATE NEW COLUMNS WITH DATA
-- Fill in default values and generate IDs for new columns
-- ============================================

-- IMPORTANT: Replace 'YOUR_ORG_ID_HERE' with your actual organization ID
-- You can find it by running: SELECT DISTINCT organization_id FROM clients LIMIT 1;

-- ============================================
-- 1. POPULATE SHAREHOLDERS TABLE
-- ============================================

-- Set organization_id for all existing shareholders
UPDATE shareholders 
SET organization_id = 'YOUR_ORG_ID_HERE'  -- Replace with your org ID
WHERE organization_id IS NULL;

-- Generate shareholder_id if not already set
-- Format: SH001, SH002, SH003, etc.
WITH numbered_shareholders AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM shareholders
  WHERE shareholder_id IS NULL
)
UPDATE shareholders s
SET shareholder_id = 'SH' || LPAD(ns.row_num::text, 3, '0')
FROM numbered_shareholders ns
WHERE s.id = ns.id;

-- Set default shares value if not set
UPDATE shareholders 
SET shares = 0
WHERE shares IS NULL;

-- ============================================
-- 2. POPULATE SHAREHOLDER_TRANSACTIONS TABLE
-- ============================================

-- Set organization_id for all existing transactions
UPDATE shareholder_transactions 
SET organization_id = 'YOUR_ORG_ID_HERE'  -- Replace with your org ID
WHERE organization_id IS NULL;

-- ============================================
-- 3. POPULATE BANK_ACCOUNTS TABLE
-- ============================================

-- Set organization_id for all existing bank accounts
UPDATE bank_accounts 
SET organization_id = 'YOUR_ORG_ID_HERE'  -- Replace with your org ID
WHERE organization_id IS NULL;

-- Set account_name from existing 'name' column if available
UPDATE bank_accounts 
SET account_name = name
WHERE account_name IS NULL AND name IS NOT NULL;

-- Or set a default account_name if no name exists
UPDATE bank_accounts 
SET account_name = 'Account ' || id
WHERE account_name IS NULL;

-- ============================================
-- 4. POPULATE EXPENSES TABLE
-- ============================================

-- Set organization_id for all existing expenses
UPDATE expenses 
SET organization_id = 'YOUR_ORG_ID_HERE'  -- Replace with your org ID
WHERE organization_id IS NULL;

-- Generate expense_id if not already set
-- Format: EXP001, EXP002, EXP003, etc.
WITH numbered_expenses AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY date) as row_num
  FROM expenses
  WHERE expense_id IS NULL
)
UPDATE expenses e
SET expense_id = 'EXP' || LPAD(ne.row_num::text, 4, '0')
FROM numbered_expenses ne
WHERE e.id = ne.id;

-- Set subcategory from category if not set
UPDATE expenses 
SET subcategory = category
WHERE subcategory IS NULL AND category IS NOT NULL;

-- Set payment_reference if not set (use transaction ID or generate one)
UPDATE expenses 
SET payment_reference = 'REF-' || id
WHERE payment_reference IS NULL;

-- Set payment_date from existing date column if available
UPDATE expenses 
SET payment_date = date::timestamp with time zone
WHERE payment_date IS NULL AND date IS NOT NULL;

-- Initialize empty attachments array if not set
UPDATE expenses 
SET attachments = '[]'::jsonb
WHERE attachments IS NULL;

-- Set default payment_type if not set
UPDATE expenses 
SET payment_type = CASE 
  WHEN payment_method IS NOT NULL THEN payment_method
  ELSE 'Cash'
END
WHERE payment_type IS NULL;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check shareholders
SELECT 
  COUNT(*) as total_shareholders,
  COUNT(organization_id) as with_org_id,
  COUNT(shareholder_id) as with_shareholder_id,
  COUNT(shares) as with_shares,
  SUM(shares) as total_shares
FROM shareholders;

-- Check shareholder_transactions
SELECT 
  COUNT(*) as total_transactions,
  COUNT(organization_id) as with_org_id
FROM shareholder_transactions;

-- Check bank_accounts
SELECT 
  COUNT(*) as total_accounts,
  COUNT(organization_id) as with_org_id,
  COUNT(account_name) as with_account_name
FROM bank_accounts;

-- Check expenses
SELECT 
  COUNT(*) as total_expenses,
  COUNT(organization_id) as with_org_id,
  COUNT(expense_id) as with_expense_id,
  COUNT(subcategory) as with_subcategory,
  COUNT(payment_reference) as with_payment_ref,
  COUNT(payment_date) as with_payment_date,
  COUNT(payment_type) as with_payment_type
FROM expenses;

-- Sample data from each table
SELECT 'SHAREHOLDERS' as table_name, id, organization_id, shareholder_id, shares 
FROM shareholders LIMIT 3;

SELECT 'SHAREHOLDER_TRANSACTIONS' as table_name, id, organization_id 
FROM shareholder_transactions LIMIT 3;

SELECT 'BANK_ACCOUNTS' as table_name, id, organization_id, account_name 
FROM bank_accounts LIMIT 3;

SELECT 'EXPENSES' as table_name, id, organization_id, expense_id, subcategory, payment_type 
FROM expenses LIMIT 3;

-- ============================================
-- OPTIONAL: Add NOT NULL constraints
-- (Only run after verifying all data is populated)
-- ============================================

/*
-- Uncomment these after verifying all data is populated correctly

ALTER TABLE shareholders 
  ALTER COLUMN organization_id SET NOT NULL,
  ALTER COLUMN shareholder_id SET NOT NULL,
  ALTER COLUMN shares SET NOT NULL;

ALTER TABLE shareholder_transactions 
  ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE bank_accounts 
  ALTER COLUMN organization_id SET NOT NULL,
  ALTER COLUMN account_name SET NOT NULL;

ALTER TABLE expenses 
  ALTER COLUMN organization_id SET NOT NULL,
  ALTER COLUMN expense_id SET NOT NULL,
  ALTER COLUMN payment_type SET NOT NULL;
*/

-- ============================================
-- COMPLETE! ✅
-- ============================================

/*
Summary of changes:

SHAREHOLDERS:
✅ organization_id populated
✅ shareholder_id generated (SH001, SH002, etc.)
✅ shares defaulted to 0

SHAREHOLDER_TRANSACTIONS:
✅ organization_id populated

BANK_ACCOUNTS:
✅ organization_id populated
✅ account_name populated from name column

EXPENSES:
✅ organization_id populated
✅ expense_id generated (EXP0001, EXP0002, etc.)
✅ subcategory populated from category
✅ payment_reference generated
✅ payment_date populated from date
✅ attachments initialized as empty array
✅ payment_type populated from payment_method

Next steps:
1. Review the verification queries above
2. If everything looks good, uncomment and run the NOT NULL constraints
3. Update your application code to use these new columns
*/
