-- ============================================================================
-- SUPER SIMPLE CHART OF ACCOUNTS RESET
-- ============================================================================
-- Just updates balance column (no debit/credit)
-- Copy and paste this entire script into Supabase SQL Editor
-- ============================================================================

-- Reset Loans Receivable
UPDATE chart_of_accounts SET balance = 0 WHERE account_code = '1200';

-- Reset Interest Receivable
UPDATE chart_of_accounts SET balance = 0 WHERE account_code = '1210';

-- Reset Retained Earnings
UPDATE chart_of_accounts SET balance = 0 WHERE account_code = '3200';

-- Reset Revenue accounts
UPDATE chart_of_accounts SET balance = 0 WHERE account_type = 'revenue';

-- Reset Expense accounts
UPDATE chart_of_accounts SET balance = 0 WHERE account_type = 'expense';

-- Show results
SELECT 
    account_code,
    account_name,
    balance,
    CASE 
        WHEN account_code IN ('1110', '1120', '1130', '3100') AND balance > 0 THEN '✅ PRESERVED'
        WHEN account_code IN ('1200', '1210', '3200') AND balance = 0 THEN '✅ RESET'
        WHEN account_type IN ('revenue', 'expense') AND balance = 0 THEN '✅ RESET'
        ELSE ''
    END as status
FROM chart_of_accounts
WHERE account_code IN ('1110', '1120', '1130', '3100', '1200', '1210', '3200')
   OR account_type IN ('revenue', 'expense')
ORDER BY account_code;
