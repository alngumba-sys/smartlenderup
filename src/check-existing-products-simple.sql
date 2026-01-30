-- ============================================================================
-- CHECK EXISTING LOAN PRODUCTS
-- ============================================================================

-- Show all existing loan products
SELECT 
    id,
    name,
    interest_rate,
    status
FROM loan_products
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY name;
