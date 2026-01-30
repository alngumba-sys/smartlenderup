-- ============================================================================
-- CHECK LOAN PRODUCTS
-- ============================================================================

-- Check loan_products table structure
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'loan_products'
ORDER BY ordinal_position;

-- Check existing loan products
SELECT 
    id,
    name,
    interest_rate,
    loan_term_months,
    interest_method,
    status
FROM loan_products
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY name;

-- Count products
SELECT COUNT(*) as total_products
FROM loan_products
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');
