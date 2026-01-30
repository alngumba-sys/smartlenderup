-- ============================================================================
-- FINAL CORRECT CHART OF ACCOUNTS CALCULATION
-- ============================================================================
-- This reads from BOTH loans table AND repayments table for accuracy
-- ============================================================================

DO $$
DECLARE
  org_id UUID := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;
  
  -- Loan totals
  total_loans INTEGER;
  total_principal_disbursed DECIMAL(15,2);
  total_interest_charged DECIMAL(15,2);
  total_amount_due DECIMAL(15,2);
  total_outstanding DECIMAL(15,2);
  
  -- Repayment totals (from repayments table)
  total_collections DECIMAL(15,2);
  repayment_count INTEGER;
  
  -- Principal vs Interest breakdown
  principal_outstanding DECIMAL(15,2);
  interest_outstanding DECIMAL(15,2);
  principal_repaid DECIMAL(15,2);
  interest_collected DECIMAL(15,2);
  
  -- Starting capital
  starting_capital DECIMAL(15,2) := 10000000.00; -- KES 10 Million
  
  -- Chart of Accounts balances
  cash_balance DECIMAL(15,2);
  loans_receivable DECIMAL(15,2);
  interest_receivable DECIMAL(15,2);
  
  -- Verification
  total_assets DECIMAL(15,2);
  total_liabilities DECIMAL(15,2);
  total_equity DECIMAL(15,2);
  
BEGIN
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 FINAL CHART OF ACCOUNTS CALCULATION';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 1: Get loan portfolio totals
  -- =========================================================================
  
  SELECT 
    COUNT(*),
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(total_amount - amount), 0),
    COALESCE(SUM(total_amount), 0),
    COALESCE(SUM(balance), 0)
  INTO 
    total_loans,
    total_principal_disbursed,
    total_interest_charged,
    total_amount_due,
    total_outstanding
  FROM loans
  WHERE organization_id = org_id;
  
  RAISE NOTICE '📋 LOAN PORTFOLIO (from loans table):';
  RAISE NOTICE '   Total Loans: %', total_loans;
  RAISE NOTICE '   Principal Disbursed: KES %', to_char(total_principal_disbursed, 'FM999,999,990.00');
  RAISE NOTICE '   Interest Charged: KES %', to_char(total_interest_charged, 'FM999,999,990.00');
  RAISE NOTICE '   Total Amount Due: KES %', to_char(total_amount_due, 'FM999,999,990.00');
  RAISE NOTICE '   Current Outstanding: KES %', to_char(total_outstanding, 'FM999,999,990.00');
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 2: Get actual collections from repayments table
  -- =========================================================================
  
  -- Check if repayments table exists and get totals
  SELECT 
    COUNT(*),
    COALESCE(SUM(amount_paid), 0)
  INTO 
    repayment_count,
    total_collections
  FROM repayments
  WHERE organization_id = org_id::TEXT
    AND approval_status = 'Approved';
  
  RAISE NOTICE '💰 COLLECTIONS (from repayments table):';
  RAISE NOTICE '   Total Repayment Transactions: %', repayment_count;
  RAISE NOTICE '   Total Collections: KES %', to_char(total_collections, 'FM999,999,990.00');
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 3: Calculate what's been repaid vs outstanding
  -- =========================================================================
  
  -- Total repaid = Total Due - Current Outstanding
  -- This tells us principal + interest that's been paid
  
  -- Method: 
  -- Outstanding balance represents what's left to pay (principal + interest combined)
  -- We need to determine how much of that is principal vs interest
  
  -- For each loan, calculate:
  -- - Original principal amount
  -- - Original interest amount  
  -- - Current balance (principal + interest remaining)
  -- - Proportion to determine split
  
  -- Principal Outstanding = Sum of (balance × principal_ratio) for each loan
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN total_amount > 0 THEN balance * (amount / total_amount)
        ELSE 0
      END
    ), 0)
  INTO principal_outstanding
  FROM loans
  WHERE organization_id = org_id
    AND balance > 0;
  
  -- Interest Outstanding = Total Outstanding - Principal Outstanding
  interest_outstanding := total_outstanding - principal_outstanding;
  
  -- Principal Repaid = Total Principal - Principal Outstanding
  principal_repaid := total_principal_disbursed - principal_outstanding;
  
  -- Interest Collected = Total Collections - Principal Repaid
  interest_collected := total_collections - principal_repaid;
  
  RAISE NOTICE '📊 PRINCIPAL vs INTEREST BREAKDOWN:';
  RAISE NOTICE '';
  RAISE NOTICE '   PRINCIPAL:';
  RAISE NOTICE '      Total Disbursed: KES %', to_char(total_principal_disbursed, 'FM999,999,990.00');
  RAISE NOTICE '      Repaid: KES %', to_char(principal_repaid, 'FM999,999,990.00');
  RAISE NOTICE '      Outstanding: KES %', to_char(principal_outstanding, 'FM999,999,990.00');
  RAISE NOTICE '';
  RAISE NOTICE '   INTEREST:';
  RAISE NOTICE '      Total Charged: KES %', to_char(total_interest_charged, 'FM999,999,990.00');
  RAISE NOTICE '      Collected: KES %', to_char(interest_collected, 'FM999,999,990.00');
  RAISE NOTICE '      Outstanding: KES %', to_char(interest_outstanding, 'FM999,999,990.00');
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 4: Calculate Chart of Accounts balances
  -- =========================================================================
  
  -- ASSET: Loans Receivable = Outstanding Principal only
  loans_receivable := principal_outstanding;
  
  -- ASSET: Interest Receivable = Outstanding Interest only
  interest_receivable := interest_outstanding;
  
  -- ASSET: Cash at Bank = Starting Capital - Disbursed + Collections
  cash_balance := starting_capital - total_principal_disbursed + total_collections;
  
  -- REVENUE: Interest Income = Interest Collected
  -- EQUITY: Retained Earnings = Interest Collected (our profit)
  
  RAISE NOTICE '🏦 CHART OF ACCOUNTS BALANCES:';
  RAISE NOTICE '';
  RAISE NOTICE '   ASSETS:';
  RAISE NOTICE '      1120 - Cash at Bank: KES %', to_char(cash_balance, 'FM999,999,990.00');
  RAISE NOTICE '      1200 - Loans Receivable: KES %', to_char(loans_receivable, 'FM999,999,990.00');
  RAISE NOTICE '      1210 - Interest Receivable: KES %', to_char(interest_receivable, 'FM999,999,990.00');
  RAISE NOTICE '      ──────────────────────────────────────────';
  RAISE NOTICE '      1000 - Total Assets: KES %', to_char(cash_balance + loans_receivable + interest_receivable, 'FM999,999,990.00');
  RAISE NOTICE '';
  RAISE NOTICE '   EQUITY:';
  RAISE NOTICE '      3100 - Share Capital: KES %', to_char(starting_capital, 'FM999,999,990.00');
  RAISE NOTICE '      3200 - Retained Earnings: KES %', to_char(interest_collected, 'FM999,999,990.00');
  RAISE NOTICE '      ──────────────────────────────────────────';
  RAISE NOTICE '      3000 - Total Equity: KES %', to_char(starting_capital + interest_collected, 'FM999,999,990.00');
  RAISE NOTICE '';
  RAISE NOTICE '   REVENUE:';
  RAISE NOTICE '      4100 - Interest Income: KES %', to_char(interest_collected, 'FM999,999,990.00');
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 5: Update Chart of Accounts in database
  -- =========================================================================
  
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '📝 UPDATING CHART OF ACCOUNTS DATABASE';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Reset all balances first
  UPDATE chart_of_accounts 
  SET balance = 0.00, updated_at = NOW()
  WHERE organization_id = org_id::TEXT;
  
  RAISE NOTICE '✅ Reset all account balances to zero';
  RAISE NOTICE '';
  
  -- ASSETS
  UPDATE chart_of_accounts 
  SET balance = cash_balance, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1120';
  RAISE NOTICE '✅ 1120 - Cash at Bank: KES %', to_char(cash_balance, 'FM999,999,990.00');
  
  UPDATE chart_of_accounts 
  SET balance = loans_receivable, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1200';
  RAISE NOTICE '✅ 1200 - Loans Receivable: KES %', to_char(loans_receivable, 'FM999,999,990.00');
  
  UPDATE chart_of_accounts 
  SET balance = interest_receivable, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1210';
  RAISE NOTICE '✅ 1210 - Interest Receivable: KES %', to_char(interest_receivable, 'FM999,999,990.00');
  
  UPDATE chart_of_accounts 
  SET balance = cash_balance + loans_receivable + interest_receivable, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1100';
  RAISE NOTICE '✅ 1100 - Current Assets: KES %', to_char(cash_balance + loans_receivable + interest_receivable, 'FM999,999,990.00');
  
  UPDATE chart_of_accounts 
  SET balance = cash_balance + loans_receivable + interest_receivable, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '1000';
  RAISE NOTICE '✅ 1000 - Total Assets: KES %', to_char(cash_balance + loans_receivable + interest_receivable, 'FM999,999,990.00');
  
  RAISE NOTICE '';
  
  -- EQUITY
  UPDATE chart_of_accounts 
  SET balance = starting_capital, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '3100';
  RAISE NOTICE '✅ 3100 - Share Capital: KES %', to_char(starting_capital, 'FM999,999,990.00');
  
  UPDATE chart_of_accounts 
  SET balance = interest_collected, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '3200';
  RAISE NOTICE '✅ 3200 - Retained Earnings: KES %', to_char(interest_collected, 'FM999,999,990.00');
  
  UPDATE chart_of_accounts 
  SET balance = starting_capital + interest_collected, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '3000';
  RAISE NOTICE '✅ 3000 - Total Equity: KES %', to_char(starting_capital + interest_collected, 'FM999,999,990.00');
  
  RAISE NOTICE '';
  
  -- REVENUE
  UPDATE chart_of_accounts 
  SET balance = interest_collected, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '4100';
  RAISE NOTICE '✅ 4100 - Interest Income: KES %', to_char(interest_collected, 'FM999,999,990.00');
  
  UPDATE chart_of_accounts 
  SET balance = interest_collected, updated_at = NOW()
  WHERE organization_id = org_id::TEXT AND account_code = '4000';
  RAISE NOTICE '✅ 4000 - Total Revenue: KES %', to_char(interest_collected, 'FM999,999,990.00');
  
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
  
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '🔍 ACCOUNTING EQUATION VERIFICATION';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '   Assets:      KES %', to_char(total_assets, 'FM999,999,990.00');
  RAISE NOTICE '   Liabilities: KES %', to_char(total_liabilities, 'FM999,999,990.00');
  RAISE NOTICE '   Equity:      KES %', to_char(total_equity, 'FM999,999,990.00');
  RAISE NOTICE '';
  RAISE NOTICE '   Formula: Assets = Liabilities + Equity';
  RAISE NOTICE '   Result:  % = % + %', 
    to_char(total_assets, 'FM999,999,990.00'),
    to_char(total_liabilities, 'FM999,999,990.00'),
    to_char(total_equity, 'FM999,999,990.00');
  RAISE NOTICE '';
  
  IF ABS(total_assets - (total_liabilities + total_equity)) < 0.01 THEN
    RAISE NOTICE '   ✅ BALANCED! Accounting equation is correct.';
  ELSE
    RAISE NOTICE '   ⚠️  NOT BALANCED! Difference: KES %', 
      to_char(total_assets - (total_liabilities + total_equity), 'FM999,999,990.00');
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ CHART OF ACCOUNTS UPDATE COMPLETE';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
END $$;

-- ============================================================================
-- VERIFICATION: View Updated Chart of Accounts
-- ============================================================================

SELECT 
  account_code,
  account_name,
  account_type,
  'KES ' || TO_CHAR(balance, 'FM999,999,999,990.00') as balance
FROM chart_of_accounts
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code IN ('1000', '1100', '1120', '1200', '1210', 
                       '2000', '3000', '3100', '3200', '4000', '4100')
ORDER BY account_code;
