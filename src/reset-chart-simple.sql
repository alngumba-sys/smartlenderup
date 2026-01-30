-- ============================================================================
-- SIMPLEST CHART OF ACCOUNTS RESET
-- ============================================================================
-- Just resets specific account codes to zero
-- ============================================================================

-- First, check if chart_of_accounts table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chart_of_accounts') THEN
        RAISE EXCEPTION 'Table chart_of_accounts does not exist!';
    END IF;
    
    RAISE NOTICE '✅ Table chart_of_accounts found';
END $$;

-- Reset Loans Receivable to 0
UPDATE chart_of_accounts 
SET balance = 0, debit = 0, credit = 0, updated_at = NOW()
WHERE account_code = '1200';

-- Reset Interest Receivable to 0
UPDATE chart_of_accounts 
SET balance = 0, debit = 0, credit = 0, updated_at = NOW()
WHERE account_code = '1210';

-- Reset Retained Earnings to 0
UPDATE chart_of_accounts 
SET balance = 0, debit = 0, credit = 0, updated_at = NOW()
WHERE account_code = '3200';

-- Reset all Revenue accounts (4000-4999)
UPDATE chart_of_accounts 
SET balance = 0, debit = 0, credit = 0, updated_at = NOW()
WHERE account_type = 'revenue';

-- Reset all Expense accounts (5000-5999)
UPDATE chart_of_accounts 
SET balance = 0, debit = 0, credit = 0, updated_at = NOW()
WHERE account_type = 'expense';

-- Show results
SELECT 
    'RESET COMPLETE!' as status,
    'Accounts have been reset' as message;

-- Show preserved accounts (should still have balances)
SELECT 
    '🔒 PRESERVED ACCOUNTS' as info,
    account_code,
    account_name,
    balance
FROM chart_of_accounts 
WHERE account_code IN ('1110', '1120', '1130', '3100')
ORDER BY account_code;

-- Show reset accounts (should be zero)
SELECT 
    '✅ RESET ACCOUNTS' as info,
    account_code,
    account_name,
    balance
FROM chart_of_accounts 
WHERE account_code IN ('1200', '1210', '3200')
ORDER BY account_code;
