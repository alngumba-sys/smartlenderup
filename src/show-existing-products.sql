-- ============================================================================
-- SHOW EXISTING LOAN PRODUCTS
-- ============================================================================

SELECT 
    id,
    name,
    interest_rate,
    status,
    created_at
FROM loan_products
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY name;

-- Count products
SELECT COUNT(*) as total_products
FROM loan_products
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');
