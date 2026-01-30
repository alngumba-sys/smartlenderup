-- ============================================================================
-- UPDATE CHART OF ACCOUNTS WITH CORRECT BALANCES (SIMPLE VERSION)
-- ============================================================================
-- This version calculates balances without relying on shareholders table
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
  starting_capital DECIMAL(15,2) := 10000000.00; -- KES 10 Million starting capital
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
  -- STEP 2: Calculate Interest Receivable (Total Interest - Interest Paid)
  -- =========================================================================
  -- For all outstanding loans, calculate total interest minus what's been paid
  SELECT 
    COALESCE(SUM(total_amount - amount), 0),  -- Total interest charged
    COALESCE(SUM(amount_paid), 0),            -- Total paid
    COALESCE(SUM(amount - balance), 0)         -- Principal repaid
  INTO total_interest_receivable, total_repayments, total_principal_repaid
  FROM loans
  WHERE organization_id = org_id
    AND status IN ('disbursed', 'active', 'default')
    AND balance > 0;
  
  -- Interest already collected = Total paid - Principal repaid
  total_interest_income := total_repayments - total_principal_repaid;
  
  -- Interest still receivable = Total interest - Interest collected
  total_interest_receivable := total_interest_receivable - total_interest_income;
  
  -- Ensure it's not negative
  total_interest_receivable := GREATEST(total_interest_receivable, 0);
  
  RAISE NOTICE '💰 Interest Receivable (Accrued): KES %', to_char(total_interest_receivable, 'FM999,999,990.00');
  
  -- =========================================================================
  -- STEP 3: Get totals from ALL loans (including closed ones)
  -- =========================================================================
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(amount_paid), 0)
  INTO total_cash_disbursed, total_repayments
  FROM loans
  WHERE organization_id = org_id;
  
  -- Recalculate principal repaid for ALL loans
  SELECT COALESCE(SUM(
    CASE 
      WHEN status = 'closed' THEN amount 
      ELSE (amount - balance) 
    END
  ), 0)
  INTO total_principal_repaid
  FROM loans
  WHERE organization_id = org_id;
  
  -- Total interest income collected
  total_interest_income := total_repayments - total_principal_repaid;
  
  RAISE NOTICE '💵 Total Disbursed: KES %', to_char(total_cash_disbursed, 'FM999,999,990.00');
  RAISE NOTICE '💵 Total Repayments: KES %', to_char(total_repayments, 'FM999,999,990.00');
  RAISE NOTICE '💵 Principal Repaid: KES %', to_char(total_principal_repaid, 'FM999,999,990.00');
  RAISE NOTICE '💰 Interest Income (Earned): KES %', to_char(total_interest_income, 'FM999,999,990.00');
  
  -- =========================================================================
  -- STEP 4: Calculate Cash Position
  -- =========================================================================
  -- Current cash = Starting Capital - Disbursed + Repayments
  current_cash_balance := starting_capital - total_cash_disbursed + total_repayments;
  
  RAISE NOTICE '💼 Starting Capital: KES %', to_char(starting_capital, 'FM999,999,990.00');
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
  RAISE NOTICE '✅ 1100 - Current Assets: KES %', to_char(total_loans_receivable + total_interest_receivable + current_cash_balance, 'FM999,999,990.00');
  
  -- Update Assets Header (same as current assets for now)
  UPDATE chart_of_accounts 
  SET balance = total_loans_receivable + total_interest_receivable + current_cash_balance, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1000';
  RAISE NOTICE '✅ 1000 - Total Assets: KES %', to_char(total_loans_receivable + total_interest_receivable + current_cash_balance, 'FM999,999,990.00');
  
  -- EQUITY
  UPDATE chart_of_accounts 
  SET balance = starting_capital, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '3100';
  RAISE NOTICE '✅ 3100 - Share Capital: KES %', to_char(starting_capital, 'FM999,999,990.00');
  
  UPDATE chart_of_accounts 
  SET balance = retained_earnings, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '3200';
  RAISE NOTICE '✅ 3200 - Retained Earnings: KES %', to_char(retained_earnings, 'FM999,999,990.00');
  
  -- Update Equity Header
  UPDATE chart_of_accounts 
  SET balance = starting_capital + retained_earnings, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '3000';
  RAISE NOTICE '✅ 3000 - Total Equity: KES %', to_char(starting_capital + retained_earnings, 'FM999,999,990.00');
  
  -- REVENUE
  UPDATE chart_of_accounts 
  SET balance = total_interest_income, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '4100';
  RAISE NOTICE '✅ 4100 - Interest Income: KES %', to_char(total_interest_income, 'FM999,999,990.00');
  
  -- Update Revenue Header
  UPDATE chart_of_accounts 
  SET balance = total_interest_income, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '4000';
  RAISE NOTICE '✅ 4000 - Total Revenue: KES %', to_char(total_interest_income, 'FM999,999,990.00');
  
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
  AND account_code IN ('1000', '1100', '1120', '1200', '1210', '2000', '3000', '3100', '3200', '4000', '4100')
ORDER BY account_code;
