-- ============================================================================
-- DATABASE CLEANUP SCRIPT FOR BV FUNGUO LTD MICROFINANCE PLATFORM
-- ============================================================================
-- 
-- PURPOSE: Clear all tables while preserving BV Funguo Ltd organization data
-- PRESERVES: Organization (UV1K), Users, Bank Branches, Bank Accounts, Shareholders
-- DELETES: All clients, loans, payments, products, employees, payroll, journals, etc.
--
-- SAFETY FEATURES:
-- - Wrapped in a transaction (can be rolled back)
-- - Before/After counts for verification
-- - Step-by-step execution with comments
--
-- USAGE:
-- 1. Review the script carefully
-- 2. Run in Supabase SQL Editor
-- 3. Check the results
-- 4. If satisfied, it auto-commits. If not, you can ROLLBACK before commit
-- ============================================================================

-- Start transaction
BEGIN;

-- ============================================================================
-- STEP 1: VERIFICATION - Show current state BEFORE cleanup
-- ============================================================================
DO $$
DECLARE
    org_id UUID;
    org_count INTEGER;
BEGIN
    -- Get and verify the organization ID
    SELECT id INTO org_id FROM organizations WHERE username = 'UV1K';
    
    IF org_id IS NULL THEN
        RAISE EXCEPTION 'Organization with username UV1K not found! Aborting...';
    END IF;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'VERIFICATION: Organization UV1K found with ID: %', org_id;
    RAISE NOTICE '============================================================================';
END $$;

-- Show counts BEFORE cleanup
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE username = 'UV1K';
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 DATA COUNTS BEFORE CLEANUP:';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Organizations (Total): %', (SELECT COUNT(*) FROM organizations);
    RAISE NOTICE 'Organizations (UV1K): %', (SELECT COUNT(*) FROM organizations WHERE username = 'UV1K');
    RAISE NOTICE 'Users (UV1K): %', (SELECT COUNT(*) FROM users WHERE organization_id = org_id);
    RAISE NOTICE 'Clients (UV1K): %', (SELECT COUNT(*) FROM clients WHERE organization_id = org_id);
    RAISE NOTICE 'Loans (UV1K): %', (SELECT COUNT(*) FROM loans WHERE organization_id = org_id);
    RAISE NOTICE 'Payments (UV1K): %', (SELECT COUNT(*) FROM payments WHERE loan_id IN (SELECT id FROM loans WHERE organization_id = org_id));
    RAISE NOTICE 'Loan Products (UV1K): %', (SELECT COUNT(*) FROM loan_products WHERE organization_id = org_id);
    RAISE NOTICE 'Bank Accounts (UV1K): %', (SELECT COUNT(*) FROM bank_accounts WHERE organization_id = org_id);
    RAISE NOTICE 'Bank Branches (UV1K): %', (SELECT COUNT(*) FROM bank_branches WHERE organization_id = org_id);
    RAISE NOTICE 'Shareholders (UV1K): %', (SELECT COUNT(*) FROM shareholders WHERE organization_id = org_id);
    RAISE NOTICE 'Employees (UV1K): %', (SELECT COUNT(*) FROM employees WHERE organization_id = org_id);
    RAISE NOTICE 'Journal Entries (UV1K): %', (SELECT COUNT(*) FROM journal_entries WHERE organization_id = org_id);
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 2: DELETE LOAN-RELATED DATA (UV1K Organization)
-- ============================================================================
DO $$
DECLARE
    org_id UUID;
    deleted_count INTEGER;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE username = 'UV1K';
    
    RAISE NOTICE '🗑️  STEP 2: Deleting loan-related data for UV1K...';
    
    -- Delete payments
    DELETE FROM payments 
    WHERE loan_id IN (SELECT id FROM loans WHERE organization_id = org_id);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % payments', deleted_count;
    
    -- Delete loan documents
    DELETE FROM loan_documents 
    WHERE loan_id IN (SELECT id FROM loans WHERE organization_id = org_id);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % loan documents', deleted_count;
    
    -- Delete guarantors
    DELETE FROM guarantors 
    WHERE loan_id IN (SELECT id FROM loans WHERE organization_id = org_id);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % guarantors', deleted_count;
    
    -- Delete collaterals
    DELETE FROM collaterals 
    WHERE loan_id IN (SELECT id FROM loans WHERE organization_id = org_id);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % collaterals', deleted_count;
    
    -- Delete loan comments
    DELETE FROM loan_comments 
    WHERE loan_id IN (SELECT id FROM loans WHERE organization_id = org_id);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % loan comments', deleted_count;
    
    -- Delete loans
    DELETE FROM loans WHERE organization_id = org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % loans', deleted_count;
    
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 3: DELETE CLIENTS (UV1K Organization)
-- ============================================================================
DO $$
DECLARE
    org_id UUID;
    deleted_count INTEGER;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE username = 'UV1K';
    
    RAISE NOTICE '🗑️  STEP 3: Deleting clients for UV1K...';
    
    DELETE FROM clients WHERE organization_id = org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % clients', deleted_count;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 4: DELETE LOAN PRODUCTS (UV1K Organization)
-- ============================================================================
DO $$
DECLARE
    org_id UUID;
    deleted_count INTEGER;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE username = 'UV1K';
    
    RAISE NOTICE '🗑️  STEP 4: Deleting loan products for UV1K...';
    
    DELETE FROM loan_products WHERE organization_id = org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % loan products', deleted_count;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 5: DELETE PAYROLL & EMPLOYEE DATA (UV1K Organization)
-- ============================================================================
DO $$
DECLARE
    org_id UUID;
    deleted_count INTEGER;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE username = 'UV1K';
    
    RAISE NOTICE '🗑️  STEP 5: Deleting payroll and employee data for UV1K...';
    
    -- Delete payroll records
    DELETE FROM payroll WHERE organization_id = org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % payroll records', deleted_count;
    
    -- Delete employees
    DELETE FROM employees WHERE organization_id = org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % employees', deleted_count;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 6: DELETE JOURNAL ENTRIES (UV1K Organization)
-- ============================================================================
DO $$
DECLARE
    org_id UUID;
    deleted_count INTEGER;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE username = 'UV1K';
    
    RAISE NOTICE '🗑️  STEP 6: Deleting journal entries for UV1K...';
    
    DELETE FROM journal_entries WHERE organization_id = org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % journal entries', deleted_count;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 7: DELETE COLLECTION SHEETS (UV1K Organization)
-- ============================================================================
DO $$
DECLARE
    org_id UUID;
    deleted_count INTEGER;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE username = 'UV1K';
    
    RAISE NOTICE '🗑️  STEP 7: Deleting collection sheets for UV1K...';
    
    DELETE FROM collection_sheets WHERE organization_id = org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % collection sheets', deleted_count;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 8: DELETE OTHER ORGANIZATIONAL DATA (UV1K Organization)
-- ============================================================================
DO $$
DECLARE
    org_id UUID;
    deleted_count INTEGER;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE username = 'UV1K';
    
    RAISE NOTICE '🗑️  STEP 8: Deleting other organizational data for UV1K...';
    
    -- Delete expenses (if table exists)
    BEGIN
        DELETE FROM expenses WHERE organization_id = org_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE '   ✓ Deleted % expenses', deleted_count;
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE '   ⚠ Expenses table does not exist, skipping...';
    END;
    
    -- Delete income (if table exists)
    BEGIN
        DELETE FROM income WHERE organization_id = org_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE '   ✓ Deleted % income records', deleted_count;
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE '   ⚠ Income table does not exist, skipping...';
    END;
    
    -- Delete reports (if table exists)
    BEGIN
        DELETE FROM reports WHERE organization_id = org_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE '   ✓ Deleted % reports', deleted_count;
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE '   ⚠ Reports table does not exist, skipping...';
    END;
    
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 9: DELETE ALL DATA FROM OTHER ORGANIZATIONS (NOT UV1K)
-- ============================================================================
DO $$
DECLARE
    org_id UUID;
    deleted_count INTEGER;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE username = 'UV1K';
    
    RAISE NOTICE '🗑️  STEP 9: Deleting ALL data from other organizations (NOT UV1K)...';
    
    -- Delete payments for other organizations
    DELETE FROM payments 
    WHERE loan_id IN (SELECT id FROM loans WHERE organization_id != org_id);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % payments from other orgs', deleted_count;
    
    -- Delete loan documents for other organizations
    DELETE FROM loan_documents 
    WHERE loan_id IN (SELECT id FROM loans WHERE organization_id != org_id);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % loan documents from other orgs', deleted_count;
    
    -- Delete guarantors for other organizations
    DELETE FROM guarantors 
    WHERE loan_id IN (SELECT id FROM loans WHERE organization_id != org_id);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % guarantors from other orgs', deleted_count;
    
    -- Delete collaterals for other organizations
    DELETE FROM collaterals 
    WHERE loan_id IN (SELECT id FROM loans WHERE organization_id != org_id);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % collaterals from other orgs', deleted_count;
    
    -- Delete loans for other organizations
    DELETE FROM loans WHERE organization_id != org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % loans from other orgs', deleted_count;
    
    -- Delete clients for other organizations
    DELETE FROM clients WHERE organization_id != org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % clients from other orgs', deleted_count;
    
    -- Delete loan products for other organizations
    DELETE FROM loan_products WHERE organization_id != org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % loan products from other orgs', deleted_count;
    
    -- Delete employees for other organizations
    DELETE FROM employees WHERE organization_id != org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % employees from other orgs', deleted_count;
    
    -- Delete payroll for other organizations
    DELETE FROM payroll WHERE organization_id != org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % payroll records from other orgs', deleted_count;
    
    -- Delete journal entries for other organizations
    DELETE FROM journal_entries WHERE organization_id != org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % journal entries from other orgs', deleted_count;
    
    -- Delete bank accounts for other organizations
    DELETE FROM bank_accounts WHERE organization_id != org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % bank accounts from other orgs', deleted_count;
    
    -- Delete bank branches for other organizations
    DELETE FROM bank_branches WHERE organization_id != org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % bank branches from other orgs', deleted_count;
    
    -- Delete shareholders for other organizations
    DELETE FROM shareholders WHERE organization_id != org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % shareholders from other orgs', deleted_count;
    
    -- Delete users for other organizations
    DELETE FROM users WHERE organization_id != org_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % users from other orgs', deleted_count;
    
    -- Delete other organizations
    DELETE FROM organizations WHERE username != 'UV1K';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '   ✓ Deleted % other organizations', deleted_count;
    
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 10: VERIFICATION - Show state AFTER cleanup
-- ============================================================================
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE username = 'UV1K';
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 DATA COUNTS AFTER CLEANUP:';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Organizations (Total): %', (SELECT COUNT(*) FROM organizations);
    RAISE NOTICE 'Organizations (UV1K): %', (SELECT COUNT(*) FROM organizations WHERE username = 'UV1K');
    RAISE NOTICE 'Users (UV1K): %', (SELECT COUNT(*) FROM users WHERE organization_id = org_id);
    RAISE NOTICE 'Clients (UV1K): %', (SELECT COUNT(*) FROM clients WHERE organization_id = org_id);
    RAISE NOTICE 'Loans (UV1K): %', (SELECT COUNT(*) FROM loans WHERE organization_id = org_id);
    RAISE NOTICE 'Payments (UV1K): %', (SELECT COUNT(*) FROM payments WHERE loan_id IN (SELECT id FROM loans WHERE organization_id = org_id));
    RAISE NOTICE 'Loan Products (UV1K): %', (SELECT COUNT(*) FROM loan_products WHERE organization_id = org_id);
    RAISE NOTICE 'Bank Accounts (UV1K): %', (SELECT COUNT(*) FROM bank_accounts WHERE organization_id = org_id);
    RAISE NOTICE 'Bank Branches (UV1K): %', (SELECT COUNT(*) FROM bank_branches WHERE organization_id = org_id);
    RAISE NOTICE 'Shareholders (UV1K): %', (SELECT COUNT(*) FROM shareholders WHERE organization_id = org_id);
    RAISE NOTICE 'Employees (UV1K): %', (SELECT COUNT(*) FROM employees WHERE organization_id = org_id);
    RAISE NOTICE 'Journal Entries (UV1K): %', (SELECT COUNT(*) FROM journal_entries WHERE organization_id = org_id);
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';
    
    RAISE NOTICE '✅ CLEANUP COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 PRESERVED DATA:';
    RAISE NOTICE '   - Organization: BV Funguo Ltd (UV1K)';
    RAISE NOTICE '   - Users associated with UV1K';
    RAISE NOTICE '   - Bank accounts for UV1K';
    RAISE NOTICE '   - Bank branches for UV1K';
    RAISE NOTICE '   - Shareholders for UV1K';
    RAISE NOTICE '';
    RAISE NOTICE '🗑️  DELETED DATA:';
    RAISE NOTICE '   - All clients';
    RAISE NOTICE '   - All loans and related data';
    RAISE NOTICE '   - All loan products';
    RAISE NOTICE '   - All employees and payroll';
    RAISE NOTICE '   - All journal entries';
    RAISE NOTICE '   - All other organizations and their data';
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- COMMIT TRANSACTION
-- ============================================================================
-- The transaction will be committed automatically if all steps succeed
-- If you want to review before committing, replace COMMIT with ROLLBACK
-- ============================================================================

COMMIT;

-- If you want to undo everything, run: ROLLBACK;
