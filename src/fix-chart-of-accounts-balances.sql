-- ============================================================================
-- UPDATE CHART OF ACCOUNTS WITH CORRECT BALANCES
-- ============================================================================
-- This script calculates actual balances based on loan data and updates
-- the chart_of_accounts table to reflect the true financial position.
-- 
-- Run this after adding/updating loans to sync account balances.
-- ============================================================================

DO $$
DECLARE
  org_id UUID := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;
  total_loans_receivable DECIMAL(15,2);
  total_interest_receivable DECIMAL(15,2);
  total_cash_disbursed DECIMAL(15,2);
  total_repayments DECIMAL(15,2);
  total_interest_income DECIMAL(15,2);
  total_principal_repaid DECIMAL(15,2);
  current_cash_balance DECIMAL(15,2);
  share_capital DECIMAL(15,2);
  retained_earnings DECIMAL(15,2);
  total_assets DECIMAL(15,2);
  total_liabilities DECIMAL(15,2);
  total_equity DECIMAL(15,2);
BEGIN
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '📊 CALCULATING CHART OF ACCOUNTS BALANCES';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 1: Calculate Loans Receivable (Outstanding Principal)
  -- =========================================================================
  SELECT COALESCE(SUM(balance), 0) 
  INTO total_loans_receivable
  FROM loans
  WHERE organization_id = org_id
    AND status IN ('disbursed', 'active', 'default');
  
  RAISE NOTICE '💰 Loans Receivable (Outstanding): KES %', to_char(total_loans_receivable, 'FM999,999,990.00');
  
  -- =========================================================================
  -- STEP 2: Calculate Interest Receivable (Accrued Interest on Outstanding Loans)
  -- =========================================================================
  -- Interest receivable = (Total Amount - Principal) - Interest Already Paid
  SELECT COALESCE(SUM(
    (total_amount - amount) - (amount_paid - LEAST(amount_paid, amount - balance))
  ), 0)
  INTO total_interest_receivable
  FROM loans
  WHERE organization_id = org_id
    AND status IN ('disbursed', 'active', 'default')
    AND balance > 0;
  
  -- Ensure it's not negative
  total_interest_receivable := GREATEST(total_interest_receivable, 0);
  
  RAISE NOTICE '💰 Interest Receivable (Accrued): KES %', to_char(total_interest_receivable, 'FM999,999,990.00');
  
  -- =========================================================================
  -- STEP 3: Calculate Total Interest Income (Already Collected)
  -- =========================================================================
  -- For closed loans: amount_paid - amount
  -- For active loans: amount_paid - (amount - balance)
  SELECT 
    COALESCE(SUM(amount_paid), 0),
    COALESCE(SUM(CASE 
      WHEN status = 'closed' THEN amount 
      ELSE (amount - balance) 
    END), 0)
  INTO total_repayments, total_principal_repaid
  FROM loans
  WHERE organization_id = org_id;
  
  total_interest_income := total_repayments - total_principal_repaid;
  
  RAISE NOTICE '💵 Total Repayments Collected: KES %', to_char(total_repayments, 'FM999,999,990.00');
  RAISE NOTICE '💵 Principal Repaid: KES %', to_char(total_principal_repaid, 'FM999,999,990.00');
  RAISE NOTICE '💰 Interest Income (Earned): KES %', to_char(total_interest_income, 'FM999,999,990.00');
  
  -- =========================================================================
  -- STEP 4: Calculate Cash Position
  -- =========================================================================
  -- Total cash disbursed (all loans)
  SELECT COALESCE(SUM(amount), 0)
  INTO total_cash_disbursed
  FROM loans
  WHERE organization_id = org_id;
  
  RAISE NOTICE '💸 Total Cash Disbursed: KES %', to_char(total_cash_disbursed, 'FM999,999,990.00');
  
  -- Get Share Capital from shareholders (use total_investment column)
  SELECT COALESCE(SUM(total_investment), 0)
  INTO share_capital
  FROM shareholders
  WHERE organization_id = org_id
    AND status = 'active';
  
  RAISE NOTICE '💼 Share Capital: KES %', to_char(share_capital, 'FM999,999,990.00');
  
  -- Current cash = Share Capital - Disbursed + Repayments
  current_cash_balance := share_capital - total_cash_disbursed + total_repayments;
  
  RAISE NOTICE '🏦 Current Cash Balance: KES %', to_char(current_cash_balance, 'FM999,999,990.00');
  
  -- Retained Earnings = Interest Income (profit)
  retained_earnings := total_interest_income;
  
  RAISE NOTICE '📈 Retained Earnings (Profit): KES %', to_char(retained_earnings, 'FM999,999,990.00');
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '📝 UPDATING CHART OF ACCOUNTS';
  RAISE NOTICE '════════════════════════════════════════';
  
  -- =========================================================================
  -- STEP 5: Update Chart of Accounts Balances
  -- =========================================================================
  
  -- ASSETS
  UPDATE chart_of_accounts 
  SET balance = total_loans_receivable, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1200';
  RAISE NOTICE '✅ 1200 - Loans Receivable: KES %', to_char(total_loans_receivable, 'FM999,999,990.00');
  
  UPDATE chart_of_accounts 
  SET balance = total_interest_receivable, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1210';
  RAISE NOTICE '✅ 1210 - Interest Receivable: KES %', to_char(total_interest_receivable, 'FM999,999,990.00');
  
  UPDATE chart_of_accounts 
  SET balance = current_cash_balance, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1120';
  RAISE NOTICE '✅ 1120 - Cash at Bank: KES %', to_char(current_cash_balance, 'FM999,999,990.00');
  
  -- Update Current Assets Header (sum of sub-accounts)
  UPDATE chart_of_accounts 
  SET balance = total_loans_receivable + total_interest_receivable + current_cash_balance, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1100';
  
  -- Update Assets Header (same as current assets for now)
  UPDATE chart_of_accounts 
  SET balance = total_loans_receivable + total_interest_receivable + current_cash_balance, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1000';
  
  -- EQUITY
  UPDATE chart_of_accounts 
  SET balance = share_capital, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '3100';
  RAISE NOTICE '✅ 3100 - Share Capital: KES %', to_char(share_capital, 'FM999,999,990.00');
  
  UPDATE chart_of_accounts 
  SET balance = retained_earnings, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '3200';
  RAISE NOTICE '✅ 3200 - Retained Earnings: KES %', to_char(retained_earnings, 'FM999,999,990.00');
  
  -- Update Equity Header
  UPDATE chart_of_accounts 
  SET balance = share_capital + retained_earnings, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '3000';
  
  -- REVENUE
  UPDATE chart_of_accounts 
  SET balance = total_interest_income, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '4100';
  RAISE NOTICE '✅ 4100 - Interest Income: KES %', to_char(total_interest_income, 'FM999,999,990.00');
  
  -- Update Revenue Header
  UPDATE chart_of_accounts 
  SET balance = total_interest_income, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '4000';
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '🔍 VERIFYING ACCOUNTING EQUATION';
  RAISE NOTICE '════════════════════════════════════════';
  
  -- =========================================================================
  -- STEP 6: Verify Accounting Equation
  -- =========================================================================
  
  SELECT COALESCE(balance, 0) INTO total_assets
  FROM chart_of_accounts
  WHERE organization_id = org_id::TEXT AND account_code = '1000';
  
  SELECT COALESCE(balance, 0) INTO total_liabilities
  FROM chart_of_accounts
  WHERE organization_id = org_id::TEXT AND account_code = '2000';
  
  SELECT COALESCE(balance, 0) INTO total_equity
  FROM chart_of_accounts
  WHERE organization_id = org_id::TEXT AND account_code = '3000';
  
  RAISE NOTICE '';
  RAISE NOTICE 'Assets:      KES %', to_char(total_assets, 'FM999,999,990.00');
  RAISE NOTICE 'Liabilities: KES %', to_char(total_liabilities, 'FM999,999,990.00');
  RAISE NOTICE 'Equity:      KES %', to_char(total_equity, 'FM999,999,990.00');
  RAISE NOTICE '';
  RAISE NOTICE 'Formula: Assets = Liabilities + Equity';
  RAISE NOTICE 'Result:  % = % + %', 
    to_char(total_assets, 'FM999,999,990.00'),
    to_char(total_liabilities, 'FM999,999,990.00'),
    to_char(total_equity, 'FM999,999,990.00');
  RAISE NOTICE '';
  
  IF ABS(total_assets - (total_liabilities + total_equity)) < 0.01 THEN
    RAISE NOTICE '✅ BALANCED! Accounting equation is correct.';
  ELSE
    RAISE NOTICE '⚠️  NOT BALANCED! Difference: KES %', 
      to_char(total_assets - (total_liabilities + total_equity), 'FM999,999,990.00');
  END IF;
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  
END $$;

-- ============================================================================
-- VERIFICATION QUERY: View Updated Chart of Accounts
-- ============================================================================

SELECT 
  account_code,
  account_name,
  account_type,
  account_category,
  'KES ' || TO_CHAR(balance, 'FM999,999,999,990.00') as balance,
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
  'KES ' || TO_CHAR(SUM(balance), 'FM999,999,999,990.00') as total_balance
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
