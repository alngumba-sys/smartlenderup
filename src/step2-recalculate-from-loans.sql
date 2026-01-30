-- ============================================================================
-- STEP 2: RECALCULATE CHART OF ACCOUNTS FROM LOAN DATA
-- ============================================================================
-- This calculates actual balances based on loan data in the database
-- ============================================================================

DO $$
DECLARE
  org_id UUID := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;
  
  -- Loan calculations
  total_loans_disbursed DECIMAL(15,2);
  total_outstanding_principal DECIMAL(15,2);
  total_repayments_received DECIMAL(15,2);
  total_principal_repaid DECIMAL(15,2);
  total_interest_charged DECIMAL(15,2);
  total_interest_paid DECIMAL(15,2);
  total_interest_outstanding DECIMAL(15,2);
  
  -- Account balances
  cash_balance DECIMAL(15,2);
  loans_receivable DECIMAL(15,2);
  interest_receivable DECIMAL(15,2);
  starting_capital DECIMAL(15,2) := 10000000.00; -- KES 10 Million
  interest_income DECIMAL(15,2);
  retained_earnings DECIMAL(15,2);
  
  -- Verification
  total_assets DECIMAL(15,2);
  total_liabilities DECIMAL(15,2);
  total_equity DECIMAL(15,2);
  
BEGIN
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '📊 RECALCULATING FROM LOAN DATA';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 1: Get Loan Summary Statistics
  -- =========================================================================
  
  SELECT 
    COUNT(*),
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(balance), 0),
    COALESCE(SUM(amount_paid), 0)
  INTO 
    total_loans_disbursed,  -- Reusing variable for count
    total_loans_disbursed,  -- Total disbursed
    total_outstanding_principal,
    total_repayments_received
  FROM loans
  WHERE organization_id = org_id;
  
  RAISE NOTICE '📋 Loan Statistics:';
  RAISE NOTICE '   Total Disbursed: KES %', to_char(total_loans_disbursed, 'FM999,999,990.00');
  RAISE NOTICE '   Outstanding Principal: KES %', to_char(total_outstanding_principal, 'FM999,999,990.00');
  RAISE NOTICE '   Total Repayments: KES %', to_char(total_repayments_received, 'FM999,999,990.00');
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 2: Calculate Principal Repaid
  -- =========================================================================
  -- For closed loans: amount (full principal)
  -- For active/default loans: amount - balance (partial principal)
  
  SELECT COALESCE(SUM(
    CASE 
      WHEN status = 'closed' THEN amount
      WHEN status IN ('active', 'default', 'disbursed') THEN (amount - balance)
      ELSE 0
    END
  ), 0)
  INTO total_principal_repaid
  FROM loans
  WHERE organization_id = org_id;
  
  RAISE NOTICE '💵 Principal Repaid: KES %', to_char(total_principal_repaid, 'FM999,999,990.00');
  
  -- =========================================================================
  -- STEP 3: Calculate Interest (Charged vs Paid)
  -- =========================================================================
  
  -- Total interest charged on all loans
  SELECT COALESCE(SUM(total_amount - amount), 0)
  INTO total_interest_charged
  FROM loans
  WHERE organization_id = org_id;
  
  -- Interest paid = Total repayments - Principal repaid
  total_interest_paid := total_repayments_received - total_principal_repaid;
  
  -- Interest outstanding = Interest charged - Interest paid
  total_interest_outstanding := total_interest_charged - total_interest_paid;
  
  RAISE NOTICE '💰 Interest Analysis:';
  RAISE NOTICE '   Interest Charged: KES %', to_char(total_interest_charged, 'FM999,999,990.00');
  RAISE NOTICE '   Interest Paid: KES %', to_char(total_interest_paid, 'FM999,999,990.00');
  RAISE NOTICE '   Interest Outstanding: KES %', to_char(total_interest_outstanding, 'FM999,999,990.00');
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 4: Calculate Account Balances
  -- =========================================================================
  
  -- ASSET: Loans Receivable = Outstanding Principal
  loans_receivable := total_outstanding_principal;
  
  -- ASSET: Interest Receivable = Outstanding Interest
  interest_receivable := GREATEST(total_interest_outstanding, 0);
  
  -- ASSET: Cash at Bank = Starting Capital - Disbursed + Repayments
  cash_balance := starting_capital - total_loans_disbursed + total_repayments_received;
  
  -- REVENUE: Interest Income = Interest Paid
  interest_income := total_interest_paid;
  
  -- EQUITY: Retained Earnings = Interest Income (profit)
  retained_earnings := interest_income;
  
  RAISE NOTICE '🏦 Account Balances:';
  RAISE NOTICE '   Cash at Bank: KES %', to_char(cash_balance, 'FM999,999,990.00');
  RAISE NOTICE '   Loans Receivable: KES %', to_char(loans_receivable, 'FM999,999,990.00');
  RAISE NOTICE '   Interest Receivable: KES %', to_char(interest_receivable, 'FM999,999,990.00');
  RAISE NOTICE '   Share Capital: KES %', to_char(starting_capital, 'FM999,999,990.00');
  RAISE NOTICE '   Retained Earnings: KES %', to_char(retained_earnings, 'FM999,999,990.00');
  RAISE NOTICE '   Interest Income: KES %', to_char(interest_income, 'FM999,999,990.00');
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 5: Update Chart of Accounts
  -- =========================================================================
  
  RAISE NOTICE '📝 Updating Chart of Accounts...';
  RAISE NOTICE '';
  
  -- ASSETS --
  
  -- 1120 - Cash at Bank
  UPDATE chart_of_accounts 
  SET balance = cash_balance, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1120';
  RAISE NOTICE '✅ 1120 - Cash at Bank: KES %', to_char(cash_balance, 'FM999,999,990.00');
  
  -- 1200 - Loans Receivable
  UPDATE chart_of_accounts 
  SET balance = loans_receivable, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1200';
  RAISE NOTICE '✅ 1200 - Loans Receivable: KES %', to_char(loans_receivable, 'FM999,999,990.00');
  
  -- 1210 - Interest Receivable
  UPDATE chart_of_accounts 
  SET balance = interest_receivable, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1210';
  RAISE NOTICE '✅ 1210 - Interest Receivable: KES %', to_char(interest_receivable, 'FM999,999,990.00');
  
  -- 1100 - Current Assets (sum of sub-accounts)
  UPDATE chart_of_accounts 
  SET balance = cash_balance + loans_receivable + interest_receivable, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1100';
  RAISE NOTICE '✅ 1100 - Current Assets: KES %', to_char(cash_balance + loans_receivable + interest_receivable, 'FM999,999,990.00');
  
  -- 1000 - Total Assets
  UPDATE chart_of_accounts 
  SET balance = cash_balance + loans_receivable + interest_receivable, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1000';
  RAISE NOTICE '✅ 1000 - Total Assets: KES %', to_char(cash_balance + loans_receivable + interest_receivable, 'FM999,999,990.00');
  
  RAISE NOTICE '';
  
  -- EQUITY --
  
  -- 3100 - Share Capital
  UPDATE chart_of_accounts 
  SET balance = starting_capital, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '3100';
  RAISE NOTICE '✅ 3100 - Share Capital: KES %', to_char(starting_capital, 'FM999,999,990.00');
  
  -- 3200 - Retained Earnings
  UPDATE chart_of_accounts 
  SET balance = retained_earnings, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '3200';
  RAISE NOTICE '✅ 3200 - Retained Earnings: KES %', to_char(retained_earnings, 'FM999,999,990.00');
  
  -- 3000 - Total Equity
  UPDATE chart_of_accounts 
  SET balance = starting_capital + retained_earnings, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '3000';
  RAISE NOTICE '✅ 3000 - Total Equity: KES %', to_char(starting_capital + retained_earnings, 'FM999,999,990.00');
  
  RAISE NOTICE '';
  
  -- REVENUE --
  
  -- 4100 - Interest Income
  UPDATE chart_of_accounts 
  SET balance = interest_income, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '4100';
  RAISE NOTICE '✅ 4100 - Interest Income: KES %', to_char(interest_income, 'FM999,999,990.00');
  
  -- 4000 - Total Revenue
  UPDATE chart_of_accounts 
  SET balance = interest_income, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '4000';
  RAISE NOTICE '✅ 4000 - Total Revenue: KES %', to_char(interest_income, 'FM999,999,990.00');
  
  RAISE NOTICE '';
  
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
  
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '🔍 ACCOUNTING EQUATION VERIFICATION';
  RAISE NOTICE '════════════════════════════════════════';
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
-- VERIFICATION: View Updated Chart of Accounts
-- ============================================================================

SELECT 
  account_code,
  account_name,
  account_type,
  'KES ' || TO_CHAR(balance, 'FM999,999,999,990.00') as balance,
  is_active
FROM chart_of_accounts
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code IN ('1000', '1100', '1110', '1120', '1130', '1200', '1210', 
                       '2000', '3000', '3100', '3200', '4000', '4100', '5000')
ORDER BY account_code;
