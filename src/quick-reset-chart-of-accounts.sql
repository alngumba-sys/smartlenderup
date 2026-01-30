-- ============================================================================
-- QUICK RESET - Chart of Accounts for Fresh Loan Processing
-- ============================================================================
-- 
-- ⚡ ONE-COMMAND CLEANUP:
-- This resets loan-related accounts to 0 while keeping bank balances
--
-- RUN THIS: Copy and paste into Supabase SQL Editor, then click "Run"
-- ============================================================================

-- Reset loan accounts, revenue, expenses to 0 (keep cash & share capital)
UPDATE chart_of_accounts 
SET 
    balance = 0, 
    debit = 0, 
    credit = 0,
    updated_at = NOW()
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
  AND (
    -- Reset loan-related asset accounts
    account_code IN ('1200', '1210', '1220', '1230', '3200')
    -- OR reset all revenue accounts
    OR account_type = 'revenue'
    -- OR reset all expense accounts
    OR account_type = 'expense'
  )
  -- BUT KEEP these accounts (don't reset):
  AND account_code NOT IN ('1110', '1120', '1130', '3100');

-- Show what was done
SELECT 
    '✅ RESET COMPLETE!' as status,
    COUNT(*) as accounts_reset
FROM chart_of_accounts 
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
  AND balance = 0;

-- Show what was preserved
SELECT 
    '🔒 PRESERVED ACCOUNTS' as status,
    account_code,
    account_name,
    balance
FROM chart_of_accounts 
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
  AND balance > 0
ORDER BY account_code;
