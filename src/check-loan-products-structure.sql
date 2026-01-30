-- ============================================================================
-- CHECK LOAN_PRODUCTS TABLE STRUCTURE
-- ============================================================================

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'loan_products'
ORDER BY ordinal_position;

-- Also show existing products
SELECT * FROM loan_products LIMIT 5;
