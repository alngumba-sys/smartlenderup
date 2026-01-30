-- ============================================================================
-- COMPLETE FRESH START FOR BV FUNGUO LTD
-- ============================================================================
-- Based on your dashboard showing:
-- - Assets: KES 830,800 (all in bank)
-- - Equity: KES 2,265,000 (share capital)
-- - Revenue: KES 70,800 (needs to be reset to 0)
-- - Expenses: KES 0
-- ============================================================================

-- Step 1: Reset ALL loan-related accounts to 0
UPDATE chart_of_accounts 
SET balance = 0, updated_at = NOW()
WHERE account_code IN (
    '1200',  -- Loans Receivable
    '1210',  -- Interest Receivable
    '1220',  -- Accrued Interest
    '1230',  -- Other loan accounts
    '3200'   -- Retained Earnings
);

-- Step 2: Reset ALL Revenue accounts to 0 (to fix the KES 70,800 issue)
UPDATE chart_of_accounts 
SET balance = 0, updated_at = NOW()
WHERE account_type = 'revenue';

-- Step 3: Reset ALL Expense accounts to 0
UPDATE chart_of_accounts 
SET balance = 0, updated_at = NOW()
WHERE account_type = 'expense';

-- Step 4: Verify cash accounts (should show KES 830,800 total)
SELECT 
    '💰 CASH ACCOUNTS' as section,
    account_code,
    account_name,
    balance
FROM chart_of_accounts 
WHERE account_code IN ('1110', '1120', '1130')
ORDER BY account_code;

-- Step 5: Verify equity (should show KES 2,265,000)
SELECT 
    '💼 EQUITY ACCOUNTS' as section,
    account_code,
    account_name,
    balance
FROM chart_of_accounts 
WHERE account_type = 'equity'
ORDER BY account_code;

-- Step 6: Verify revenue is now 0 (was KES 70,800)
SELECT 
    '📊 REVENUE ACCOUNTS (Should be 0)' as section,
    account_code,
    account_name,
    balance
FROM chart_of_accounts 
WHERE account_type = 'revenue'
ORDER BY account_code;

-- Step 7: Show final totals (should match dashboard after refresh)
SELECT 
    '✅ FINAL TOTALS' as section,
    account_type,
    SUM(balance) as total
FROM chart_of_accounts
GROUP BY account_type
ORDER BY 
    CASE account_type
        WHEN 'asset' THEN 1
        WHEN 'liability' THEN 2
        WHEN 'equity' THEN 3
        WHEN 'revenue' THEN 4
        WHEN 'expense' THEN 5
    END;
