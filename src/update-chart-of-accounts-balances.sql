-- ============================================================================
-- UPDATE CHART OF ACCOUNTS WITH CORRECT BALANCES
-- ============================================================================
-- This script calculates actual balances based on loan data and updates
-- the chart_of_accounts table to reflect the true financial position.
-- 
-- Run this after adding/updating loans to sync account balances.
-- ============================================================================

-- Get your organization_id
-- SELECT id FROM organizations WHERE name = 'BV Funguo Ltd';
-- Result: 958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9

DO $$
DECLARE
  org_id TEXT := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';
  total_loans_receivable DECIMAL(15,2);
  total_interest_receivable DECIMAL(15,2);
  total_cash_disbursed DECIMAL(15,2);
  total_repayments DECIMAL(15,2);
  total_interest_income DECIMAL(15,2);
  total_principal_repaid DECIMAL(15,2);
  current_cash_balance DECIMAL(15,2);
  share_capital DECIMAL(15,2);
  retained_earnings DECIMAL(15,2);
BEGIN
  
  -- =========================================================================
  -- STEP 1: Calculate Loans Receivable (Outstanding Principal)
  -- =========================================================================
  SELECT COALESCE(SUM(balance), 0) 
  INTO total_loans_receivable
  FROM loans
  WHERE organization_id = org_id
    AND status IN ('disbursed', 'active', 'default');
  
  RAISE NOTICE '📊 Total Loans Receivable (Outstanding): KES %', total_loans_receivable;
  
  -- =========================================================================
  -- STEP 2: Calculate Interest Receivable (Accrued Interest on Outstanding Loans)
  -- =========================================================================
  -- Interest receivable = (Total Amount - Principal) for outstanding loans
  SELECT COALESCE(SUM(total_amount - amount), 0)
  INTO total_interest_receivable
  FROM loans
  WHERE organization_id = org_id
    AND status IN ('disbursed', 'active', 'default')
    AND balance > 0;
  
  RAISE NOTICE '📊 Total Interest Receivable: KES %', total_interest_receivable;
  
  -- =========================================================================
  -- STEP 3: Calculate Total Interest Income (Already Collected)
  -- =========================================================================
  -- Interest income = Total amount paid - principal repaid (for all loans)
  SELECT 
    COALESCE(SUM(amount_paid), 0),
    COALESCE(SUM(CASE WHEN status = 'closed' THEN amount ELSE (amount - balance) END), 0)
  INTO total_repayments, total_principal_repaid
  FROM loans
  WHERE organization_id = org_id;
  
  total_interest_income := total_repayments - total_principal_repaid;
  
  RAISE NOTICE '📊 Total Repayments: KES %', total_repayments;
  RAISE NOTICE '📊 Total Principal Repaid: KES %', total_principal_repaid;
  RAISE NOTICE '📊 Total Interest Income: KES %', total_interest_income;
  
  -- =========================================================================
  -- STEP 4: Calculate Cash Position
  -- =========================================================================
  -- Total cash disbursed (all loans)
  SELECT COALESCE(SUM(amount), 0)
  INTO total_cash_disbursed
  FROM loans
  WHERE organization_id = org_id;
  
  RAISE NOTICE '📊 Total Cash Disbursed: KES %', total_cash_disbursed;
  
  -- Get Share Capital from shareholders
  SELECT COALESCE(SUM(total_contribution), 0)
  INTO share_capital
  FROM shareholders
  WHERE organization_id = org_id
    AND status = 'active';
  
  RAISE NOTICE '📊 Share Capital: KES %', share_capital;
  
  -- Current cash = Share Capital - Disbursed + Repayments
  current_cash_balance := share_capital - total_cash_disbursed + total_repayments;
  
  RAISE NOTICE '📊 Current Cash Balance: KES %', current_cash_balance;
  
  -- Retained Earnings = Interest Income (profit)
  retained_earnings := total_interest_income;
  
  RAISE NOTICE '📊 Retained Earnings (Profit): KES %', retained_earnings;
  
  -- =========================================================================
  -- STEP 5: Update Chart of Accounts Balances
  -- =========================================================================
  
  -- ASSETS
  UPDATE chart_of_accounts 
  SET balance = total_loans_receivable, updated_at = NOW()
  WHERE organization_id = org_id AND account_code = '1200';
  RAISE NOTICE '✅ Updated 1200 - Loans Receivable: KES %', total_loans_receivable;
  
  UPDATE chart_of_accounts 
  SET balance = total_interest_receivable, updated_at = NOW()
  WHERE organization_id = org_id AND account_code = '1210';
  RAISE NOTICE '✅ Updated 1210 - Interest Receivable: KES %', total_interest_receivable;
  
  UPDATE chart_of_accounts 
  SET balance = current_cash_balance, updated_at = NOW()
  WHERE organization_id = org_id AND account_code = '1120';
  RAISE NOTICE '✅ Updated 1120 - Cash at Bank: KES %', current_cash_balance;
  
  -- Update Current Assets Header (sum of sub-accounts)
  UPDATE chart_of_accounts 
  SET balance = total_loans_receivable + total_interest_receivable + current_cash_balance, updated_at = NOW()
  WHERE organization_id = org_id AND account_code = '1100';
  
  -- Update Assets Header (same as current assets for now)
  UPDATE chart_of_accounts 
  SET balance = total_loans_receivable + total_interest_receivable + current_cash_balance, updated_at = NOW()
  WHERE organization_id = org_id AND account_code = '1000';
  
  -- EQUITY
  UPDATE chart_of_accounts 
  SET balance = share_capital, updated_at = NOW()
  WHERE organization_id = org_id AND account_code = '3100';
  RAISE NOTICE '✅ Updated 3100 - Share Capital: KES %', share_capital;
  
  UPDATE chart_of_accounts 
  SET balance = retained_earnings, updated_at = NOW()
  WHERE organization_id = org_id AND account_code = '3200';
  RAISE NOTICE '✅ Updated 3200 - Retained Earnings: KES %', retained_earnings;
  
  -- Update Equity Header
  UPDATE chart_of_accounts 
  SET balance = share_capital + retained_earnings, updated_at = NOW()
  WHERE organization_id = org_id AND account_code = '3000';
  
  -- REVENUE
  UPDATE chart_of_accounts 
  SET balance = total_interest_income, updated_at = NOW()
  WHERE organization_id = org_id AND account_code = '4100';
  RAISE NOTICE '✅ Updated 4100 - Interest Income: KES %', total_interest_income;
  
  -- Update Revenue Header
  UPDATE chart_of_accounts 
  SET balance = total_interest_income, updated_at = NOW()
  WHERE organization_id = org_id AND account_code = '4000';
  
  -- =========================================================================
  -- STEP 6: Verify Accounting Equation
  -- =========================================================================
  DECLARE
    total_assets DECIMAL(15,2);
    total_liabilities DECIMAL(15,2);
    total_equity DECIMAL(15,2);
  BEGIN
    SELECT COALESCE(SUM(balance), 0) INTO total_assets
    FROM chart_of_accounts
    WHERE organization_id = org_id AND account_code = '1000';
    
    SELECT COALESCE(SUM(balance), 0) INTO total_liabilities
    FROM chart_of_accounts
    WHERE organization_id = org_id AND account_code = '2000';
    
    SELECT COALESCE(SUM(balance), 0) INTO total_equity
    FROM chart_of_accounts
    WHERE organization_id = org_id AND account_code = '3000';
    
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '📊 ACCOUNTING EQUATION VERIFICATION';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE 'Assets:      KES %', total_assets;
    RAISE NOTICE 'Liabilities: KES %', total_liabilities;
    RAISE NOTICE 'Equity:      KES %', total_equity;
    RAISE NOTICE '';
    RAISE NOTICE 'A = L + E';
    RAISE NOTICE '% = % + %', total_assets, total_liabilities, total_equity;
    
    IF total_assets = (total_liabilities + total_equity) THEN
      RAISE NOTICE '✅ BALANCED! Accounting equation is correct.';
    ELSE
      RAISE NOTICE '⚠️  NOT BALANCED! Difference: KES %', (total_assets - (total_liabilities + total_equity));
    END IF;
    RAISE NOTICE '════════════════════════════════════════';
  END;
  
END $$;

-- ============================================================================
-- VERIFICATION QUERY: View Updated Chart of Accounts
-- ============================================================================

SELECT 
  account_code,
  account_name,
  account_type,
  account_category,
  TO_CHAR(balance, 'FM999,999,999,990.00') as balance,
  is_active
FROM chart_of_accounts
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY account_code;

-- ============================================================================
-- SUMMARY BY TYPE
-- ============================================================================

SELECT 
  account_type,
  COUNT(*) as accounts,
  TO_CHAR(SUM(balance), 'FM999,999,999,990.00') as total_balance
FROM chart_of_accounts
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
GROUP BY account_type
ORDER BY 
  CASE account_type
    WHEN 'Asset' THEN 1
    WHEN 'Liability' THEN 2
    WHEN 'Equity' THEN 3
    WHEN 'Revenue' THEN 4
    WHEN 'Expense' THEN 5
  END;
