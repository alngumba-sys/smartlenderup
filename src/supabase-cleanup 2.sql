-- =====================================================
-- COMPLETE DATABASE CLEANUP - SmartLenderUp Test
-- =====================================================
-- ⚠️  WARNING: This deletes ALL data from ALL tables
-- ⚠️  Table structure will remain intact
-- ⚠️  This action CANNOT be undone
-- =====================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/sql
-- =====================================================

-- Disable triggers temporarily for faster deletion
SET session_replication_role = 'replica';

-- =====================================================
-- STEP 1: Delete all child table data first
-- (tables with foreign key dependencies)
-- =====================================================

-- Loan-related child tables
DELETE FROM guarantors;
DELETE FROM collaterals;
DELETE FROM loan_documents;
DELETE FROM disbursements;
DELETE FROM processing_fee_records;
DELETE FROM approvals;

-- Payment/Repayment tables (points to loans)
DELETE FROM repayments;  -- If this table exists in your schema

-- Shareholder-related child tables
DELETE FROM shareholder_transactions;

-- Savings-related child tables
DELETE FROM savings_transactions;

-- KYC and audit tables
DELETE FROM kyc_records;
DELETE FROM audit_logs;

-- Tasks and tickets
DELETE FROM tasks;
DELETE FROM tickets;

-- Journal entries
DELETE FROM journal_entries;

-- Payroll
DELETE FROM payroll_runs;

-- Expenses and payees
DELETE FROM expenses;
DELETE FROM payees;

-- Funding transactions
DELETE FROM funding_transactions;

-- =====================================================
-- STEP 2: Delete parent tables
-- (tables that other tables reference)
-- =====================================================

-- Delete loans (depends on clients and loan_products)
DELETE FROM loans;

-- Delete clients (depends on organization)
DELETE FROM clients;

-- Delete groups (depends on organization)
DELETE FROM groups;

-- Delete loan products (depends on organization)
DELETE FROM loan_products;

-- Delete savings accounts (depends on organization)
DELETE FROM savings_accounts;

-- Delete shareholders (depends on organization)
DELETE FROM shareholders;

-- Delete bank accounts (depends on organization)
DELETE FROM bank_accounts;

-- =====================================================
-- STEP 3: Delete organizations (top-level parent)
-- =====================================================

-- Delete organizations (this is the root table)
DELETE FROM organizations;

-- Delete users if they exist
DELETE FROM users;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- =====================================================
-- STEP 4: Verification Query
-- =====================================================

SELECT 
    'organizations' as table_name, 
    COUNT(*) as record_count 
FROM organizations
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'loans', COUNT(*) FROM loans
UNION ALL
SELECT 'repayments', COUNT(*) FROM repayments
UNION ALL
SELECT 'loan_products', COUNT(*) FROM loan_products
UNION ALL
SELECT 'savings_accounts', COUNT(*) FROM savings_accounts
UNION ALL
SELECT 'savings_transactions', COUNT(*) FROM savings_transactions
UNION ALL
SELECT 'shareholders', COUNT(*) FROM shareholders
UNION ALL
SELECT 'shareholder_transactions', COUNT(*) FROM shareholder_transactions
UNION ALL
SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'payees', COUNT(*) FROM payees
UNION ALL
SELECT 'bank_accounts', COUNT(*) FROM bank_accounts
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'kyc_records', COUNT(*) FROM kyc_records
UNION ALL
SELECT 'approvals', COUNT(*) FROM approvals
UNION ALL
SELECT 'funding_transactions', COUNT(*) FROM funding_transactions
UNION ALL
SELECT 'processing_fee_records', COUNT(*) FROM processing_fee_records
UNION ALL
SELECT 'disbursements', COUNT(*) FROM disbursements
UNION ALL
SELECT 'payroll_runs', COUNT(*) FROM payroll_runs
UNION ALL
SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'groups', COUNT(*) FROM groups
UNION ALL
SELECT 'guarantors', COUNT(*) FROM guarantors
UNION ALL
SELECT 'collaterals', COUNT(*) FROM collaterals
UNION ALL
SELECT 'loan_documents', COUNT(*) FROM loan_documents
ORDER BY table_name;

-- =====================================================
-- EXPECTED RESULT: All counts should be 0
-- =====================================================
-- If all counts show 0, your database is clean!
-- You can now start fresh with new organizations
-- =====================================================
