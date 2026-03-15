-- ============================================
-- DATABASE CLEANUP SCRIPT
-- ============================================
-- Run this FIRST if you're getting "table already exists" errors
-- or if you want to start completely fresh
--
-- ⚠️ WARNING: This will DELETE ALL DATA in your database!
-- Only use this for development/testing setup
-- ============================================

-- Drop all tables in dependency order (children first, then parents)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS funding_transactions CASCADE;
DROP TABLE IF EXISTS savings_transactions CASCADE;
DROP TABLE IF EXISTS savings_accounts CASCADE;
DROP TABLE IF EXISTS kyc_records CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS loan_documents CASCADE;
DROP TABLE IF EXISTS collaterals CASCADE;
DROP TABLE IF EXISTS guarantors CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;
DROP TABLE IF EXISTS payroll_runs CASCADE;
DROP TABLE IF EXISTS payees CASCADE;
DROP TABLE IF EXISTS staff_members CASCADE;
DROP TABLE IF EXISTS staff_users CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS processing_fees CASCADE;
DROP TABLE IF EXISTS disbursements CASCADE;
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS shareholders CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS repayments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS loan_products CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS project_states CASCADE;

-- Drop any remaining functions
DROP FUNCTION IF EXISTS calculate_credit_score CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Verify all tables are dropped
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- If the query above returns no rows, cleanup was successful!
-- Now you can run COMPLETE_DATABASE_SETUP.sql

SELECT '✅ Database cleanup complete! All tables dropped.' as status;
SELECT '👉 Next step: Run COMPLETE_DATABASE_SETUP.sql' as next_action;
