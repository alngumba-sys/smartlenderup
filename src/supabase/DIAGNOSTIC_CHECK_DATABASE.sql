-- ============================================
-- DATABASE DIAGNOSTIC SCRIPT
-- ============================================
-- Run this to check the current state of your database
-- and identify what needs to be fixed
-- ============================================

-- Check 1: Do tables exist?
SELECT 
    '1. TABLES CHECK' as check_name,
    COUNT(*) as table_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ NO TABLES - Run COMPLETE_DATABASE_SETUP.sql'
        WHEN COUNT(*) < 30 THEN '⚠️ INCOMPLETE - Some tables missing'
        ELSE '✅ ALL TABLES EXIST'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check 2: Is RLS enabled? (should be disabled for testing)
SELECT 
    '2. RLS CHECK' as check_name,
    COUNT(*) as tables_with_rls,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ RLS DISABLED ON ALL TABLES'
        ELSE '❌ RLS ENABLED - Run DISABLE_RLS_FOR_TESTING.sql'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Check 3: Do critical tables exist?
SELECT 
    '3. CRITICAL TABLES CHECK' as check_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') 
        THEN '✅ organizations exists'
        ELSE '❌ organizations missing'
    END as organizations,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') 
        THEN '✅ clients exists'
        ELSE '❌ clients missing'
    END as clients,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loans') 
        THEN '✅ loans exists'
        ELSE '❌ loans missing'
    END as loans,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loan_products') 
        THEN '✅ loan_products exists'
        ELSE '❌ loan_products missing'
    END as loan_products;

-- Check 4: Verify correct table names (not the wrong ones)
SELECT 
    '4. TABLE NAMES CHECK' as check_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loan_disbursements') 
        THEN '❌ WRONG NAME: loan_disbursements exists (should be disbursements)'
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'disbursements')
        THEN '✅ CORRECT: disbursements exists'
        ELSE '⚠️ No disbursements table'
    END as disbursements_check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_members') 
        THEN '❌ WRONG NAME: staff_members exists (should be staff_users)'
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_users')
        THEN '✅ CORRECT: staff_users exists'
        ELSE '⚠️ No staff_users table'
    END as staff_check;

-- Check 5: List all tables
SELECT 
    '5. ALL TABLES' as check_name,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
    (SELECT rowsecurity FROM pg_tables WHERE tablename = t.table_name AND schemaname = 'public') as rls_enabled
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check 6: Database extensions
SELECT 
    '6. EXTENSIONS CHECK' as check_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') 
        THEN '✅ uuid-ossp installed'
        ELSE '❌ uuid-ossp missing - Run: CREATE EXTENSION "uuid-ossp";'
    END as uuid_ossp,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') 
        THEN '✅ pgcrypto installed'
        ELSE '❌ pgcrypto missing - Run: CREATE EXTENSION "pgcrypto";'
    END as pgcrypto;

-- Check 7: Sample data check
SELECT 
    '7. DATA CHECK' as check_name,
    (SELECT COUNT(*) FROM organizations) as organizations_count,
    (SELECT COUNT(*) FROM clients) as clients_count,
    (SELECT COUNT(*) FROM loans) as loans_count,
    (SELECT COUNT(*) FROM loan_products) as loan_products_count;

-- ============================================
-- SUMMARY & RECOMMENDATIONS
-- ============================================
SELECT 
    '============================================' as line1,
    'DIAGNOSTIC SUMMARY' as line2,
    '============================================' as line3;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') = 0 
        THEN '👉 ACTION REQUIRED: Run /supabase/COMPLETE_DATABASE_SETUP.sql'
        
        WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) > 0
        THEN '👉 ACTION REQUIRED: Run /supabase/DISABLE_RLS_FOR_TESTING.sql'
        
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loan_disbursements')
        THEN '👉 ACTION REQUIRED: You have wrong table names. Run /supabase/CLEANUP_BEFORE_SETUP.sql then /supabase/COMPLETE_DATABASE_SETUP.sql'
        
        ELSE '✅ ALL GOOD! Database is properly configured.'
    END as recommendation;

SELECT 
    '============================================' as line1,
    'END OF DIAGNOSTIC' as line2,
    '============================================' as line3;
