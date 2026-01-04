-- =====================================================
-- FIX PRODUCT ID MISMATCH - Run This Now!
-- =====================================================
-- This will update all loans to use the correct product ID
-- Your correct product ID: 11794d71-e44c-4b16-8c84-1b06b54d0938

-- STEP 1: Check which loans have incorrect product IDs
SELECT 
    loan_number,
    borrower_name,
    product_id,
    CASE 
        WHEN product_id = '11794d71-e44c-4b16-8c84-1b06b54d0938' THEN '✅ CORRECT'
        ELSE '❌ WRONG - Will be fixed'
    END AS status
FROM loans
ORDER BY created_at DESC;

-- STEP 2: Fix all loans with incorrect product IDs
-- This updates loans with "PROD-723555" or empty product_id to the correct UUID
UPDATE loans
SET product_id = '11794d71-e44c-4b16-8c84-1b06b54d0938'
WHERE product_id != '11794d71-e44c-4b16-8c84-1b06b54d0938'
   OR product_id IS NULL
   OR product_id = '';

-- STEP 3: Verify all loans now have the correct product ID
SELECT 
    COUNT(*) as total_loans,
    COUNT(CASE WHEN product_id = '11794d71-e44c-4b16-8c84-1b06b54d0938' THEN 1 END) as correct_product_id,
    COUNT(CASE WHEN product_id != '11794d71-e44c-4b16-8c84-1b06b54d0938' OR product_id IS NULL THEN 1 END) as wrong_product_id
FROM loans;

-- =====================================================
-- EXPECTED RESULT:
-- =====================================================
-- total_loans: X
-- correct_product_id: X (should match total_loans)
-- wrong_product_id: 0 (should be zero)
-- 
-- After running this, refresh your app and:
-- ✅ Portfolio by Product chart will show data
-- ✅ Loan Products statistics will be accurate
-- ✅ No more product ID mismatch warnings
