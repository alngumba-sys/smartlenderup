-- =====================================================
-- FIX OPENING BALANCE - RECORD INITIAL CAPITAL
-- SmartLenderUp Platform
-- =====================================================
-- This creates the missing opening balance entry for Share Capital

-- Step 1: Create Opening Balance Journal Entry
INSERT INTO journal_entries (
  id,
  organization_id,
  entry_number,
  entry_date,
  description,
  reference,
  source_type,
  source_id,
  status,
  total_debit,
  total_credit,
  created_by,
  created_date,
  posted_date,
  created_at
)
VALUES (
  gen_random_uuid()::text,
  (SELECT id::text FROM organizations LIMIT 1),
  'JE-OB001',
  '2024-01-01',
  'Opening Balance - Initial Share Capital Investment',
  'OB-CAPITAL-001',
  'Opening Balance',
  'OB-CAPITAL-001',
  'Posted',
  2265000.00,
  2265000.00,
  'System',
  '2024-01-01',
  '2024-01-01',
  NOW()
) RETURNING id;

-- Get the journal entry ID we just created
WITH new_entry AS (
  SELECT id FROM journal_entries WHERE entry_number = 'JE-OB001' AND organization_id::text = (SELECT id::text FROM organizations LIMIT 1)
)

-- Step 2: Create Journal Entry Lines
INSERT INTO journal_entry_lines (
  id,
  journal_entry_id,
  organization_id,
  account_code,
  account_name,
  description,
  debit,
  credit
)
SELECT 
  gen_random_uuid()::text,
  new_entry.id,
  (SELECT id::text FROM organizations LIMIT 1),
  '1120',
  'Cash at Bank',
  'Opening Balance - Capital Investment',
  2265000.00,
  0
FROM new_entry
UNION ALL
SELECT 
  gen_random_uuid()::text,
  new_entry.id,
  (SELECT id::text FROM organizations LIMIT 1),
  '3100',
  'Share Capital',
  'Opening Balance - Capital Investment',
  0,
  2265000.00
FROM new_entry;

-- Step 3: Recalculate all account balances
WITH account_balances AS (
  SELECT 
    jel.account_code,
    -- Balance calculation based on account type:
    CASE 
      WHEN coa.account_type IN ('Asset', 'Expense') THEN 
        SUM(jel.debit) - SUM(jel.credit)
      WHEN coa.account_type IN ('Liability', 'Equity', 'Revenue') THEN 
        SUM(jel.credit) - SUM(jel.debit)
      ELSE 0
    END as calculated_balance
  FROM journal_entry_lines jel
  INNER JOIN chart_of_accounts coa ON jel.account_code = coa.account_code AND jel.organization_id = coa.organization_id
  WHERE jel.organization_id::text = (SELECT id::text FROM organizations LIMIT 1)
  GROUP BY jel.account_code, coa.account_type
)
UPDATE chart_of_accounts
SET 
  balance = COALESCE(ab.calculated_balance, 0),
  updated_at = NOW()
FROM account_balances ab
WHERE chart_of_accounts.account_code = ab.account_code
  AND chart_of_accounts.organization_id::text = (SELECT id::text FROM organizations LIMIT 1);

-- Step 4: Verification - Show Updated Balances
SELECT 
  '=== UPDATED BALANCES ===' as header;

SELECT 
  account_code,
  account_name,
  account_type,
  account_category,
  balance as "Net Balance"
FROM chart_of_accounts
WHERE organization_id::text = (SELECT id::text FROM organizations LIMIT 1)
  AND balance != 0
ORDER BY 
  CASE account_type
    WHEN 'Asset' THEN 1
    WHEN 'Liability' THEN 2
    WHEN 'Equity' THEN 3
    WHEN 'Revenue' THEN 4
    WHEN 'Expense' THEN 5
  END,
  account_code;

-- Step 5: Summary Totals
SELECT 
  'SUMMARY AFTER FIX' as section,
  SUM(CASE WHEN account_type = 'Asset' THEN balance ELSE 0 END) as total_assets,
  SUM(CASE WHEN account_type = 'Liability' THEN balance ELSE 0 END) as total_liabilities,
  SUM(CASE WHEN account_type = 'Equity' THEN balance ELSE 0 END) as total_equity,
  SUM(CASE WHEN account_type = 'Revenue' THEN balance ELSE 0 END) as total_revenue,
  SUM(CASE WHEN account_type = 'Expense' THEN balance ELSE 0 END) as total_expenses,
  -- Accounting Equation Check
  SUM(CASE WHEN account_type = 'Asset' THEN balance ELSE 0 END) as assets_side,
  SUM(CASE WHEN account_type = 'Liability' THEN balance ELSE 0 END) + 
  SUM(CASE WHEN account_type = 'Equity' THEN balance ELSE 0 END) + 
  SUM(CASE WHEN account_type = 'Revenue' THEN balance ELSE 0 END) - 
  SUM(CASE WHEN account_type = 'Expense' THEN balance ELSE 0 END) as liabilities_equity_side,
  -- Should be 0
  SUM(CASE WHEN account_type = 'Asset' THEN balance ELSE 0 END) - 
  (SUM(CASE WHEN account_type = 'Liability' THEN balance ELSE 0 END) + 
   SUM(CASE WHEN account_type = 'Equity' THEN balance ELSE 0 END) + 
   SUM(CASE WHEN account_type = 'Revenue' THEN balance ELSE 0 END) - 
   SUM(CASE WHEN account_type = 'Expense' THEN balance ELSE 0 END)) as equation_difference
FROM chart_of_accounts
WHERE organization_id::text = (SELECT id::text FROM organizations LIMIT 1);