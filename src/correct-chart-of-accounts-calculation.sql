-- ============================================================================
-- CORRECT CHART OF ACCOUNTS CALCULATION
-- ============================================================================
-- This properly calculates based on ALL loans including settled ones
-- and correctly allocates payments between principal and interest
-- ============================================================================

DO $$
DECLARE
  org_id UUID := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;
  
  -- Loan totals (ALL loans including settled)
  total_loans INTEGER;
  total_principal_disbursed DECIMAL(15,2);
  total_interest_charged DECIMAL(15,2);
  total_amount_due DECIMAL(15,2);
  total_collections DECIMAL(15,2);
  total_outstanding DECIMAL(15,2);
  
  -- Breakdown by status
  settled_count INTEGER;
  settled_principal DECIMAL(15,2);
  settled_collections DECIMAL(15,2);
  
  active_count INTEGER;
  active_principal DECIMAL(15,2);
  active_collections DECIMAL(15,2);
  active_outstanding DECIMAL(15,2);
  
  -- Principal vs Interest split
  principal_repaid DECIMAL(15,2);
  interest_collected DECIMAL(15,2);
  principal_outstanding DECIMAL(15,2);
  interest_outstanding DECIMAL(15,2);
  
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
  RAISE NOTICE '📊 CHART OF ACCOUNTS - COMPLETE CALCULATION';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 1: Get totals from ALL loans (including settled)
  -- =========================================================================
  
  SELECT 
    COUNT(*),
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(total_amount - amount), 0),
    COALESCE(SUM(total_amount), 0),
    COALESCE(SUM(amount_paid), 0),
    COALESCE(SUM(balance), 0)
  INTO 
    total_loans,
    total_principal_disbursed,
    total_interest_charged,
    total_amount_due,
    total_collections,
    total_outstanding
  FROM loans
  WHERE organization_id = org_id;
  
  RAISE NOTICE '📋 OVERALL LOAN PORTFOLIO:';
  RAISE NOTICE '   Total Loans: %', total_loans;
  RAISE NOTICE '   Principal Disbursed: KES %', to_char(total_principal_disbursed, 'FM999,999,990.00');
  RAISE NOTICE '   Interest Charged: KES %', to_char(total_interest_charged, 'FM999,999,990.00');
  RAISE NOTICE '   Total Amount Due: KES %', to_char(total_amount_due, 'FM999,999,990.00');
  RAISE NOTICE '   Collections (Paid): KES %', to_char(total_collections, 'FM999,999,990.00');
  RAISE NOTICE '   Outstanding: KES %', to_char(total_outstanding, 'FM999,999,990.00');
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 2: Breakdown by loan status
  -- =========================================================================
  
  -- Settled loans (fully paid)
  SELECT 
    COUNT(*),
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(amount_paid), 0)
  INTO 
    settled_count,
    settled_principal,
    settled_collections
  FROM loans
  WHERE organization_id = org_id
    AND status = 'closed';
  
  -- Active/Default loans (outstanding)
  SELECT 
    COUNT(*),
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(amount_paid), 0),
    COALESCE(SUM(balance), 0)
  INTO 
    active_count,
    active_principal,
    active_collections,
    active_outstanding
  FROM loans
  WHERE organization_id = org_id
    AND status IN ('active', 'default', 'disbursed');
  
  RAISE NOTICE '📊 BREAKDOWN BY STATUS:';
  RAISE NOTICE '';
  RAISE NOTICE '   ✅ SETTLED LOANS:';
  RAISE NOTICE '      Count: %', settled_count;
  RAISE NOTICE '      Principal: KES %', to_char(settled_principal, 'FM999,999,990.00');
  RAISE NOTICE '      Collections: KES %', to_char(settled_collections, 'FM999,999,990.00');
  RAISE NOTICE '';
  RAISE NOTICE '   🔄 ACTIVE/DEFAULT LOANS:';
  RAISE NOTICE '      Count: %', active_count;
  RAISE NOTICE '      Principal: KES %', to_char(active_principal, 'FM999,999,990.00');
  RAISE NOTICE '      Collections: KES %', to_char(active_collections, 'FM999,999,990.00');
  RAISE NOTICE '      Outstanding: KES %', to_char(active_outstanding, 'FM999,999,990.00');
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 3: Calculate Principal vs Interest allocation
  -- =========================================================================
  
  -- For SETTLED loans: Principal repaid = full principal, Interest = collections - principal
  -- For ACTIVE loans: Balance tells us what's left, so principal repaid = amount - (balance portion that is principal)
  
  -- Method: Calculate what portion of outstanding balance is principal vs interest
  -- If a loan has paid X amount, and still owes Y balance on total due Z:
  -- The balance Y contains both principal and interest proportionally
  
  -- SETTLED LOANS: Full principal was repaid
  principal_repaid := settled_principal;
  
  -- ACTIVE LOANS: Principal repaid = Original Principal - (Balance × Principal/TotalDue ratio)
  -- For each active loan, we need to know what portion of balance is principal
  
  SELECT 
    COALESCE(SUM(
      amount - (balance * (amount / total_amount))
    ), 0)
  INTO principal_repaid
  FROM loans
  WHERE organization_id = org_id
    AND status IN ('active', 'default', 'disbursed')
    AND total_amount > 0;
  
  -- Add settled loan principal
  principal_repaid := principal_repaid + settled_principal;
  
  -- Interest collected = Total collections - Principal repaid
  interest_collected := total_collections - principal_repaid;
  
  -- Principal outstanding = Total principal - Principal repaid
  principal_outstanding := total_principal_disbursed - principal_repaid;
  
  -- Interest outstanding = Total interest charged - Interest collected
  interest_outstanding := total_interest_charged - interest_collected;
  
  RAISE NOTICE '💰 PRINCIPAL vs INTEREST ALLOCATION:';
  RAISE NOTICE '';
  RAISE NOTICE '   Principal:';
  RAISE NOTICE '      Disbursed: KES %', to_char(total_principal_disbursed, 'FM999,999,990.00');
  RAISE NOTICE '      Repaid: KES %', to_char(principal_repaid, 'FM999,999,990.00');
  RAISE NOTICE '      Outstanding: KES %', to_char(principal_outstanding, 'FM999,999,990.00');
  RAISE NOTICE '';
  RAISE NOTICE '   Interest:';
  RAISE NOTICE '      Charged: KES %', to_char(total_interest_charged, 'FM999,999,990.00');
  RAISE NOTICE '      Collected: KES %', to_char(interest_collected, 'FM999,999,990.00');
  RAISE NOTICE '      Outstanding: KES %', to_char(interest_outstanding, 'FM999,999,990.00');
  RAISE NOTICE '';
  
  -- =========================================================================
  -- STEP 4: Calculate Chart of Accounts balances
  -- =========================================================================
  
  -- ASSET: Loans Receivable = Outstanding Principal
  loans_receivable := principal_outstanding;
  
  -- ASSET: Interest Receivable = Outstanding Interest
  interest_receivable := interest_outstanding;
  
  -- ASSET: Cash at Bank = Starting Capital - Disbursed + Collections
  cash_balance := starting_capital - total_principal_disbursed + total_collections;
  
  -- EQUITY: Retained Earnings = Interest Collected (our profit)
  
  RAISE NOTICE '🏦 CHART OF ACCOUNTS BALANCES:';
  RAISE NOTICE '';
  RAISE NOTICE '   ASSETS:';
  RAISE NOTICE '      Cash at Bank: KES %', to_char(cash_balance, 'FM999,999,990.00');
  RAISE NOTICE '      Loans Receivable: KES %', to_char(loans_receivable, 'FM999,999,990.00');
  RAISE NOTICE '      Interest Receivable: KES %', to_char(interest_receivable, 'FM999,999,990.00');
  RAISE NOTICE '      ─────────────────────────────────';
  RAISE NOTICE '      Total Assets: KES %', to_char(cash_balance + loans_receivable + interest_receivable, 'FM999,999,990.00');
  RAISE NOTICE '';
  RAISE NOTICE '   EQUITY:';
  RAISE NOTICE '      Share Capital: KES %', to_char(starting_capital, 'FM999,999,990.00');
  RAISE NOTICE '      Retained Earnings: KES %', to_char(interest_collected, 'FM999,999,990.00');
  RAISE NOTICE '      ─────────────────────────────────';
  RAISE NOTICE '      Total Equity: KES %', to_char(starting_capital + interest_collected, 'FM999,999,990.00');
  RAISE NOTICE '';
  RAISE NOTICE '   REVENUE:';
  RAISE NOTICE '      Interest Income: KES %', to_char(interest_collected, 'FM999,999,990.00');
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
