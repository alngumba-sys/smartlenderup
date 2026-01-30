-- ============================================================================
-- CHECK LOANS TABLE STRUCTURE
-- ============================================================================

-- Show all columns in the loans table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'loans'
ORDER BY ordinal_position;

-- Also check loan_products table
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'loan_products'
ORDER BY ordinal_position;

-- Check if PERSONAL LOAN and BUSINESS LOAN products exist
SELECT 
    id,
    name,
    interest_rate,
    loan_term_months
FROM loan_products
LIMIT 10;
