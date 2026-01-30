-- ============================================================================
-- QUICK RESET - Chart of Accounts for Fresh Loan Processing (FIXED)
-- ============================================================================
-- 
-- ⚡ ONE-COMMAND CLEANUP WITH PROPER TYPE CASTING
-- This resets loan-related accounts to 0 while keeping bank balances
--
-- RUN THIS: Copy and paste into Supabase SQL Editor, then click "Run"
-- ============================================================================

-- Method 1: Using a variable (safest approach)
DO $$
DECLARE
    v_org_id UUID;
BEGIN
    -- Get the organization ID
    SELECT id INTO v_org_id 
    FROM organizations 
    WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization UV1K not found!';
    END IF;
    
    -- Reset loan accounts, revenue, expenses to 0 (keep cash & share capital)
    UPDATE chart_of_accounts 
    SET 
        balance = 0, 
        debit = 0, 
        credit = 0,
        updated_at = NOW()
    WHERE organization_id = v_org_id
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
    
    RAISE NOTICE '✅ Chart of Accounts reset complete!';
    RAISE NOTICE '   Loans Receivable: 0';
    RAISE NOTICE '   Interest Receivable: 0';
    RAISE NOTICE '   Revenue accounts: 0';
    RAISE NOTICE '   Expense accounts: 0';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Preserved accounts:';
    RAISE NOTICE '   Cash in Hand (1110)';
    RAISE NOTICE '   Cash at Bank (1120)';
    RAISE NOTICE '   M-Pesa Account (1130)';
    RAISE NOTICE '   Share Capital (3100)';
    
END $$;

-- Show what was preserved
SELECT 
    '🔒 PRESERVED ACCOUNTS WITH BALANCES' as info,
    account_code,
    account_name,
    balance
FROM chart_of_accounts 
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
  AND balance > 0
ORDER BY account_code;

-- Show what was reset
SELECT 
    '✅ ACCOUNTS RESET TO ZERO' as info,
    account_code,
    account_name,
    account_type
FROM chart_of_accounts 
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
  AND balance = 0
  AND account_code IN ('1200', '1210', '3200')
ORDER BY account_code;
