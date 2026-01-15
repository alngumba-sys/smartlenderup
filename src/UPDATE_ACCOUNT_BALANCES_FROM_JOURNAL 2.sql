-- =====================================================
-- UPDATE CHART OF ACCOUNTS BALANCES FROM JOURNAL ENTRIES
-- SmartLenderUp Platform
-- =====================================================
-- This script recalculates all account balances from journal_entry_lines
-- and updates the chart_of_accounts table

-- Step 1: Calculate balances for each account from journal entry lines
WITH account_balances AS (
  SELECT 
    jel.account_code,
    SUM(jel.debit) as total_debits,
    SUM(jel.credit) as total_credits,
    -- Balance calculation based on account type:
    -- Assets & Expenses: Debit increases, Credit decreases (Debit - Credit)
    -- Liabilities, Equity, Revenue: Credit increases, Debit decreases (Credit - Debit)
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

-- Step 2: Update the chart_of_accounts table with calculated balances
UPDATE chart_of_accounts
SET 
  balance = COALESCE(ab.calculated_balance, 0),
  updated_at = NOW()
FROM account_balances ab
WHERE chart_of_accounts.account_code = ab.account_code
  AND chart_of_accounts.organization_id::text = (SELECT id::text FROM organizations LIMIT 1);

-- Step 3: Show updated balances with debit/credit totals
SELECT 
  coa.account_code,
  coa.account_name,
  coa.account_type,
  coa.account_category,
  COALESCE(SUM(jel.debit), 0) as total_debits,
  COALESCE(SUM(jel.credit), 0) as total_credits,
  coa.balance as net_balance,
  CASE 
    WHEN coa.account_type = 'Asset' THEN coa.balance
    ELSE 0 
  END as asset_balance,
  CASE 
    WHEN coa.account_type = 'Liability' THEN coa.balance
    ELSE 0 
  END as liability_balance,
  CASE 
    WHEN coa.account_type = 'Equity' THEN coa.balance
    ELSE 0 
  END as equity_balance,
  CASE 
    WHEN coa.account_type = 'Revenue' THEN coa.balance
    ELSE 0 
  END as revenue_balance,
  CASE 
    WHEN coa.account_type = 'Expense' THEN coa.balance
    ELSE 0 
  END as expense_balance
FROM chart_of_accounts coa
LEFT JOIN journal_entry_lines jel ON coa.account_code = jel.account_code AND coa.organization_id = jel.organization_id
WHERE coa.organization_id::text = (SELECT id::text FROM organizations LIMIT 1)
GROUP BY coa.account_code, coa.account_name, coa.account_type, coa.account_category, coa.balance
HAVING coa.balance != 0 OR SUM(jel.debit) != 0 OR SUM(jel.credit) != 0
ORDER BY coa.account_code;

-- Step 4: Summary Totals
SELECT 
  'SUMMARY' as section,
  SUM(CASE WHEN account_type = 'Asset' THEN balance ELSE 0 END) as total_assets,
  SUM(CASE WHEN account_type = 'Liability' THEN balance ELSE 0 END) as total_liabilities,
  SUM(CASE WHEN account_type = 'Equity' THEN balance ELSE 0 END) as total_equity,
  SUM(CASE WHEN account_type = 'Revenue' THEN balance ELSE 0 END) as total_revenue,
  SUM(CASE WHEN account_type = 'Expense' THEN balance ELSE 0 END) as total_expenses,
  -- Accounting Equation Check: Assets = Liabilities + Equity + (Revenue - Expenses)
  SUM(CASE WHEN account_type = 'Asset' THEN balance ELSE 0 END) as assets_side,
  SUM(CASE WHEN account_type = 'Liability' THEN balance ELSE 0 END) + 
  SUM(CASE WHEN account_type = 'Equity' THEN balance ELSE 0 END) + 
  SUM(CASE WHEN account_type = 'Revenue' THEN balance ELSE 0 END) - 
  SUM(CASE WHEN account_type = 'Expense' THEN balance ELSE 0 END) as liabilities_equity_side,
  -- Difference (should be 0 or very close to 0)
  SUM(CASE WHEN account_type = 'Asset' THEN balance ELSE 0 END) - 
  (SUM(CASE WHEN account_type = 'Liability' THEN balance ELSE 0 END) + 
   SUM(CASE WHEN account_type = 'Equity' THEN balance ELSE 0 END) + 
   SUM(CASE WHEN account_type = 'Revenue' THEN balance ELSE 0 END) - 
   SUM(CASE WHEN account_type = 'Expense' THEN balance ELSE 0 END)) as equation_difference
FROM chart_of_accounts
WHERE organization_id::text = (SELECT id::text FROM organizations LIMIT 1);

-- Step 5: Show accounts with non-zero balances
SELECT 
  '=== ACCOUNTS WITH BALANCES ===' as header;

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
