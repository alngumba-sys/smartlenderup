-- ⚠️ DISABLE RLS FOR TESTING ONLY
-- ⚠️ DO NOT USE IN PRODUCTION!
-- 
-- This script disables Row Level Security (RLS) on all tables
-- to allow unrestricted access for development and testing.
--
-- WHEN TO USE THIS:
-- - During development and testing
-- - When you're getting "permission denied" errors
-- - When you're using auto-login without proper Supabase authentication
--
-- HOW TO USE:
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and run
-- 4. Refresh your app
--
-- ⚠️ SECURITY WARNING:
-- With RLS disabled, ANYONE can read/write ALL data in these tables!
-- Only use this for development/testing, NOT for production!

-- Disable RLS on all tables
ALTER TABLE IF EXISTS organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loan_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS repayments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bank_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shareholders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shareholder_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS funding_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS disbursements DISABLE ROW LEVEL SECURITY;  -- FIXED: was loan_disbursements
ALTER TABLE IF EXISTS processing_fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS journal_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS staff_users DISABLE ROW LEVEL SECURITY;  -- FIXED: was staff_members
ALTER TABLE IF EXISTS payees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payroll_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS institutions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS guarantors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS collaterals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loan_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kyc_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS savings_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS savings_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_states DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pricing_configuration DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chart_of_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credit_scoring_parameters DISABLE ROW LEVEL SECURITY;

-- Optional: Drop all existing policies (clean slate)
-- Uncomment the lines below if you want to remove all existing policies

/*
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;
*/

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- You should see "false" in the rls_enabled column for all tables