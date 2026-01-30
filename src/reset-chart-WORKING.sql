-- ============================================================================
-- CHART OF ACCOUNTS RESET - WORKING VERSION
-- ============================================================================
-- Only updates columns that exist: balance and updated_at
-- ============================================================================

-- First, let's see what columns your table actually has
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chart_of_accounts'
ORDER BY ordinal_position;

-- Now reset the accounts (only updating balance, not debit/credit)

-- Reset Loans Receivable to 0
UPDATE chart_of_accounts 
SET balance = 0, updated_at = NOW()
WHERE account_code = '1200';

-- Reset Interest Receivable to 0
UPDATE chart_of_accounts 
SET balance = 0, updated_at = NOW()
WHERE account_code = '1210';

-- Reset Retained Earnings to 0
UPDATE chart_of_accounts 
SET balance = 0, updated_at = NOW()
WHERE account_code = '3200';

-- Reset all Revenue accounts
UPDATE chart_of_accounts 
SET balance = 0, updated_at = NOW()
WHERE account_type = 'revenue';

-- Reset all Expense accounts
UPDATE chart_of_accounts 
SET balance = 0, updated_at = NOW()
WHERE account_type = 'expense';

-- Show what was preserved (should still have balances)
SELECT 
    '🔒 PRESERVED ACCOUNTS' as info,
    account_code,
    account_name,
    balance
FROM chart_of_accounts 
WHERE account_code IN ('1110', '1120', '1130', '3100')
ORDER BY account_code;

-- Show what was reset (should be zero now)
SELECT 
    '✅ RESET TO ZERO' as info,
    account_code,
    account_name,
    balance
FROM chart_of_accounts 
WHERE account_code IN ('1200', '1210', '3200')
ORDER BY account_code;

-- Show ALL accounts for verification
SELECT 
    account_code,
    account_name,
    account_type,
    balance,
    CASE 
        WHEN account_code IN ('1110', '1120', '1130', '3100') THEN '🔒 PRESERVED'
        WHEN account_code IN ('1200', '1210', '3200') THEN '✅ RESET'
        WHEN account_type IN ('revenue', 'expense') THEN '✅ RESET'
        ELSE '📝 Other'
    END as status
FROM chart_of_accounts
ORDER BY account_code;
