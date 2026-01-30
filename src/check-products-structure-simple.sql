-- ============================================================================
-- CHECK LOAN PRODUCTS TABLE STRUCTURE
-- ============================================================================

-- Show all columns in loan_products table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'loan_products'
ORDER BY ordinal_position;
