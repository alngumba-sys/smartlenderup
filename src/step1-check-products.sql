-- ============================================================================
-- STEP 1: CHECK LOAN PRODUCTS AND TABLE STRUCTURE
-- ============================================================================

-- First, let's see the loan_products table structure
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'loan_products'
ORDER BY ordinal_position;

RAISE NOTICE '';
RAISE NOTICE '============================================================';
RAISE NOTICE 'LOAN PRODUCTS TABLE STRUCTURE ABOVE ☝️';
RAISE NOTICE '============================================================';
RAISE NOTICE '';

-- Now let's see what products exist
SELECT 
    id,
    name,
    organization_id,
    status,
    created_at
FROM loan_products
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY name;

RAISE NOTICE '';
RAISE NOTICE '============================================================';
RAISE NOTICE 'EXISTING LOAN PRODUCTS ABOVE ☝️';
RAISE NOTICE '============================================================';
