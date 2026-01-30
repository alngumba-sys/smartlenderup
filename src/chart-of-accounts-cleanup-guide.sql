-- ============================================================================
-- CHART OF ACCOUNTS CLEANUP - FRESH START FOR LOAN PROCESSING
-- ============================================================================
-- 
-- GOAL: Keep bank balances, reset loan-related accounts to start fresh
-- 
-- WHAT THIS DOES:
-- ✅ KEEPS: All account structures (codes, names)
-- ✅ KEEPS: Cash in Hand, Cash at Bank, M-Pesa balances
-- ✅ KEEPS: Share Capital (shareholder equity)
-- ✅ RESETS: Loans Receivable, Interest Receivable to 0
-- ✅ RESETS: All Revenue and Expense accounts to 0
-- ✅ RESETS: Retained Earnings
--
-- INSTRUCTIONS:
-- 1. Run this in Supabase SQL Editor
-- 2. Review the output to see what was reset
-- 3. Your bank balances will remain untouched
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
BEGIN
    -- Get BV Funguo Ltd organization
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization UV1K not found!';
    END IF;
    
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '     CHART OF ACCOUNTS CLEANUP - FRESH START';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '🏦 Organization: BV Funguo Ltd (UV1K)';
    RAISE NOTICE '';
    
    -- Show BEFORE balances
    RAISE NOTICE '📊 BEFORE CLEANUP:';
    RAISE NOTICE '';
    RAISE NOTICE '💰 CASH ACCOUNTS (WILL BE KEPT):';
    RAISE NOTICE '   Cash in Hand (1110): KSh %', 
        COALESCE((SELECT balance FROM chart_of_accounts WHERE account_code = '1110' AND organization_id = v_org_id), 0);
    RAISE NOTICE '   Cash at Bank (1120): KSh %', 
        COALESCE((SELECT balance FROM chart_of_accounts WHERE account_code = '1120' AND organization_id = v_org_id), 0);
    RAISE NOTICE '   M-Pesa Account (1130): KSh %', 
        COALESCE((SELECT balance FROM chart_of_accounts WHERE account_code = '1130' AND organization_id = v_org_id), 0);
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 LOAN ACCOUNTS (WILL BE RESET TO 0):';
    RAISE NOTICE '   Loans Receivable (1200): KSh %', 
        COALESCE((SELECT balance FROM chart_of_accounts WHERE account_code = '1200' AND organization_id = v_org_id), 0);
    RAISE NOTICE '   Interest Receivable (1210): KSh %', 
        COALESCE((SELECT balance FROM chart_of_accounts WHERE account_code = '1210' AND organization_id = v_org_id), 0);
    
    RAISE NOTICE '';
    RAISE NOTICE '💼 EQUITY ACCOUNTS:';
    RAISE NOTICE '   Share Capital (3100): KSh % (WILL BE KEPT)', 
        COALESCE((SELECT balance FROM chart_of_accounts WHERE account_code = '3100' AND organization_id = v_org_id), 0);
    RAISE NOTICE '   Retained Earnings (3200): KSh % (WILL BE RESET)', 
        COALESCE((SELECT balance FROM chart_of_accounts WHERE account_code = '3200' AND organization_id = v_org_id), 0);
    
    RAISE NOTICE '';
    RAISE NOTICE '🗑️  PERFORMING CLEANUP...';
    RAISE NOTICE '';
    
    -- ========================================================================
    -- RESET LOAN-RELATED ASSET ACCOUNTS TO 0
    -- ========================================================================
    
    -- Reset Loans Receivable
    UPDATE chart_of_accounts 
    SET balance = 0, 
        debit = 0, 
        credit = 0,
        updated_at = NOW()
    WHERE account_code = '1200' -- Loans Receivable
        AND organization_id = v_org_id;
    
    RAISE NOTICE '✅ Reset Loans Receivable (1200) to 0';
    
    -- Reset Interest Receivable
    UPDATE chart_of_accounts 
    SET balance = 0, 
        debit = 0, 
        credit = 0,
        updated_at = NOW()
    WHERE account_code = '1210' -- Interest Receivable
        AND organization_id = v_org_id;
    
    RAISE NOTICE '✅ Reset Interest Receivable (1210) to 0';
    
    -- Reset Accrued Interest (if exists)
    UPDATE chart_of_accounts 
    SET balance = 0, 
        debit = 0, 
        credit = 0,
        updated_at = NOW()
    WHERE account_code IN ('1220', '1230', '1240') -- Various interest accounts
        AND organization_id = v_org_id;
    
    -- ========================================================================
    -- RESET ALL REVENUE ACCOUNTS TO 0
    -- ========================================================================
    
    UPDATE chart_of_accounts 
    SET balance = 0, 
        debit = 0, 
        credit = 0,
        updated_at = NOW()
    WHERE account_type = 'revenue'
        AND organization_id = v_org_id;
    
    RAISE NOTICE '✅ Reset all Revenue accounts to 0';
    
    -- ========================================================================
    -- RESET ALL EXPENSE ACCOUNTS TO 0
    -- ========================================================================
    
    UPDATE chart_of_accounts 
    SET balance = 0, 
        debit = 0, 
        credit = 0,
        updated_at = NOW()
    WHERE account_type = 'expense'
        AND organization_id = v_org_id;
    
    RAISE NOTICE '✅ Reset all Expense accounts to 0';
    
    -- ========================================================================
    -- RESET RETAINED EARNINGS TO 0
    -- ========================================================================
    
    UPDATE chart_of_accounts 
    SET balance = 0, 
        debit = 0, 
        credit = 0,
        updated_at = NOW()
    WHERE account_code = '3200' -- Retained Earnings
        AND organization_id = v_org_id;
    
    RAISE NOTICE '✅ Reset Retained Earnings (3200) to 0';
    
    -- ========================================================================
    -- KEEP CASH ACCOUNTS AS-IS (No changes)
    -- ========================================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '🔒 PRESERVED ACCOUNTS (No changes):';
    RAISE NOTICE '   ✅ Cash in Hand (1110)';
    RAISE NOTICE '   ✅ Cash at Bank (1120)';
    RAISE NOTICE '   ✅ M-Pesa Account (1130)';
    RAISE NOTICE '   ✅ Share Capital (3100)';
    RAISE NOTICE '   ✅ All account structures and codes';
    
    -- ========================================================================
    -- SHOW AFTER BALANCES
    -- ========================================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '     CLEANUP COMPLETE!';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 AFTER CLEANUP:';
    RAISE NOTICE '';
    RAISE NOTICE '💰 CASH ACCOUNTS (PRESERVED):';
    RAISE NOTICE '   Cash in Hand (1110): KSh %', 
        COALESCE((SELECT balance FROM chart_of_accounts WHERE account_code = '1110' AND organization_id = v_org_id), 0);
    RAISE NOTICE '   Cash at Bank (1120): KSh %', 
        COALESCE((SELECT balance FROM chart_of_accounts WHERE account_code = '1120' AND organization_id = v_org_id), 0);
    RAISE NOTICE '   M-Pesa Account (1130): KSh %', 
        COALESCE((SELECT balance FROM chart_of_accounts WHERE account_code = '1130' AND organization_id = v_org_id), 0);
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 LOAN ACCOUNTS (RESET):';
    RAISE NOTICE '   Loans Receivable (1200): KSh 0';
    RAISE NOTICE '   Interest Receivable (1210): KSh 0';
    
    RAISE NOTICE '';
    RAISE NOTICE '💼 EQUITY ACCOUNTS:';
    RAISE NOTICE '   Share Capital (3100): KSh % (PRESERVED)', 
        COALESCE((SELECT balance FROM chart_of_accounts WHERE account_code = '3100' AND organization_id = v_org_id), 0);
    RAISE NOTICE '   Retained Earnings (3200): KSh 0 (RESET)';
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ You are now ready to start processing fresh loans!';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Your starting capital is the total of:';
    RAISE NOTICE '   - Cash in Hand';
    RAISE NOTICE '   - Cash at Bank';
    RAISE NOTICE '   - M-Pesa Account';
    RAISE NOTICE '   = Total Available Cash';
    RAISE NOTICE '';
    
END $$;

-- ============================================================================
-- VERIFICATION QUERY - Run this to see your clean Chart of Accounts
-- ============================================================================

SELECT 
    account_code,
    account_name,
    account_type,
    balance,
    status,
    CASE 
        WHEN account_code IN ('1110', '1120', '1130', '3100') THEN '🔒 PRESERVED'
        WHEN account_code IN ('1200', '1210', '3200') THEN '✅ RESET TO 0'
        WHEN account_type IN ('revenue', 'expense') THEN '✅ RESET TO 0'
        ELSE '📝 Structure Kept'
    END as action_taken
FROM chart_of_accounts
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY account_code;
