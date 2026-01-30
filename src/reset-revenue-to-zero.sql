-- ============================================================================
-- RESET REVENUE TO ZERO - Fresh Start
-- ============================================================================
-- This resets the KES 70,800 revenue shown in your dashboard to 0
-- ============================================================================

-- Reset all Revenue accounts to 0
UPDATE chart_of_accounts 
SET balance = 0, updated_at = NOW()
WHERE account_type = 'revenue';

-- Also reset these specific revenue account codes if they exist
UPDATE chart_of_accounts 
SET balance = 0, updated_at = NOW()
WHERE account_code IN ('4000', '4100', '4200', '4300', '4400');

-- Verify Revenue is now 0
SELECT 
    '📊 REVENUE CHECK' as info,
    account_code,
    account_name,
    account_type,
    balance
FROM chart_of_accounts 
WHERE account_type = 'revenue'
ORDER BY account_code;

-- Show summary of all account types
SELECT 
    '✅ FINAL STATE' as info,
    account_type,
    SUM(balance) as total_balance
FROM chart_of_accounts
GROUP BY account_type
ORDER BY account_type;

-- Verify your cash in bank
SELECT 
    '💰 CASH VERIFICATION' as info,
    account_code,
    account_name,
    balance
FROM chart_of_accounts 
WHERE account_code IN ('1110', '1120', '1130')
ORDER BY account_code;
