-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this AFTER running RUN_THIS_SQL.sql
-- This confirms both fixes worked correctly
-- =====================================================

-- Check 1: Verify payees table has all required columns
SELECT 
    '✅ Payees Table Columns' AS check_name,
    COUNT(column_name) as total_columns,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) as column_names
FROM information_schema.columns
WHERE table_name = 'payees'
GROUP BY table_name;

-- Check 2: Verify all loans have correct product ID
SELECT 
    '✅ Loan Product IDs' AS check_name,
    COUNT(*) as total_loans,
    COUNT(CASE WHEN product_id = '11794d71-e44c-4b16-8c84-1b06b54d0938' THEN 1 END) as correct_product_id,
    COUNT(CASE WHEN product_id != '11794d71-e44c-4b16-8c84-1b06b54d0938' OR product_id IS NULL OR product_id = '' THEN 1 END) as wrong_product_id
FROM loans;

-- Check 3: Get product name for reference
SELECT 
    '✅ Your Product' AS check_name,
    product_name,
    id as product_id
FROM products
WHERE id = '11794d71-e44c-4b16-8c84-1b06b54d0938';

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- Check 1: Should show 11+ columns including contact_phone, contact_email
-- Check 2: wrong_product_id should be 0 (all loans have correct ID)
-- Check 3: Should show your product name and ID
-- =====================================================
