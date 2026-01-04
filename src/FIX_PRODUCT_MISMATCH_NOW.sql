-- ============================================================
-- FIX PRODUCT ID MISMATCH - COPY ALL OF THIS AND RUN IT NOW
-- ============================================================
-- This will fix the error you're seeing in the console
-- ============================================================

-- Update all loans that have "PROD-723555" to use the correct product ID
UPDATE loans
SET product_id = '11794d71-e44c-4b16-8c84-1b06b54d0938'
WHERE product_id = 'PROD-723555';

-- Update all loans that have empty product_id
UPDATE loans
SET product_id = '11794d71-e44c-4b16-8c84-1b06b54d0938'
WHERE product_id = '' OR product_id IS NULL;

-- Verify it worked - you should see 0 in the 'mismatched' column
SELECT 
    COUNT(*) as total_loans,
    COUNT(CASE WHEN product_id = '11794d71-e44c-4b16-8c84-1b06b54d0938' THEN 1 END) as correct,
    COUNT(CASE WHEN product_id != '11794d71-e44c-4b16-8c84-1b06b54d0938' OR product_id IS NULL THEN 1 END) as mismatched
FROM loans;

-- ============================================================
-- DONE! Now refresh your app - the error should be gone
-- ============================================================
