-- ============================================================================
-- STEP 2A: INSERT LOAN PRODUCTS (PERSONAL LOAN & BUSINESS LOAN)
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_personal_loan_id UUID;
    v_business_loan_id UUID;
BEGIN
    -- Get organization ID
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization UV1K not found!';
    END IF;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Creating Loan Products';
    RAISE NOTICE '============================================================';
    
    -- ========================================================================
    -- PERSONAL LOAN PRODUCT
    -- ========================================================================
    INSERT INTO loan_products (
        organization_id,
        product_name,
        name,
        product_code,
        description,
        min_amount,
        max_amount,
        minimum_amount,
        maximum_amount,
        min_term,
        max_term,
        minimum_term,
        maximum_term,
        term_unit,
        interest_rate,
        interest_method,
        interest_type,
        repayment_frequency,
        processing_fee_percentage,
        processing_fee_fixed,
        insurance_fee_fixed,
        guarantor_required,
        collateral_required,
        require_guarantor,
        require_collateral,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_org_id,
        'PERSONAL LOAN',              -- product_name (required)
        'PERSONAL LOAN',              -- name (optional)
        'PL001',                      -- product_code
        'Personal loan for individuals with 10% flat interest rate',
        10000.00,                     -- min_amount
        500000.00,                    -- max_amount
        10000.00,                     -- minimum_amount
        500000.00,                    -- maximum_amount
        1,                            -- min_term
        12,                           -- max_term
        1,                            -- minimum_term
        12,                           -- maximum_term
        'months',                     -- term_unit
        10.0,                         -- interest_rate (10%)
        'flat',                       -- interest_method
        'flat',                       -- interest_type
        'monthly',                    -- repayment_frequency
        0.0,                          -- processing_fee_percentage
        0.0,                          -- processing_fee_fixed
        0.0,                          -- insurance_fee_fixed
        false,                        -- guarantor_required
        false,                        -- collateral_required
        false,                        -- require_guarantor
        false,                        -- require_collateral
        'active',                     -- status
        NOW(),
        NOW()
    ) RETURNING id INTO v_personal_loan_id;
    
    RAISE NOTICE '✅ Created PERSONAL LOAN product: %', v_personal_loan_id;
    
    -- ========================================================================
    -- BUSINESS LOAN PRODUCT
    -- ========================================================================
    INSERT INTO loan_products (
        organization_id,
        product_name,
        name,
        product_code,
        description,
        min_amount,
        max_amount,
        minimum_amount,
        maximum_amount,
        min_term,
        max_term,
        minimum_term,
        maximum_term,
        term_unit,
        interest_rate,
        interest_method,
        interest_type,
        repayment_frequency,
        processing_fee_percentage,
        processing_fee_fixed,
        insurance_fee_fixed,
        guarantor_required,
        collateral_required,
        require_guarantor,
        require_collateral,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_org_id,
        'BUSINESS LOAN',              -- product_name (required)
        'BUSINESS LOAN',              -- name (optional)
        'BL001',                      -- product_code
        'Business loan for enterprises with 5% flat interest rate',
        50000.00,                     -- min_amount
        1000000.00,                   -- max_amount
        50000.00,                     -- minimum_amount
        1000000.00,                   -- maximum_amount
        3,                            -- min_term
        12,                           -- max_term
        3,                            -- minimum_term
        12,                           -- maximum_term
        'months',                     -- term_unit
        5.0,                          -- interest_rate (5%)
        'flat',                       -- interest_method
        'flat',                       -- interest_type
        'monthly',                    -- repayment_frequency
        0.0,                          -- processing_fee_percentage
        0.0,                          -- processing_fee_fixed
        0.0,                          -- insurance_fee_fixed
        false,                        -- guarantor_required
        false,                        -- collateral_required
        false,                        -- require_guarantor
        false,                        -- require_collateral
        'active',                     -- status
        NOW(),
        NOW()
    ) RETURNING id INTO v_business_loan_id;
    
    RAISE NOTICE '✅ Created BUSINESS LOAN product: %', v_business_loan_id;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Successfully created 2 loan products!';
    RAISE NOTICE '============================================================';
    
END $$;

-- ============================================================================
-- VERIFICATION - Show Created Products
-- ============================================================================

SELECT 
    '📋 CREATED LOAN PRODUCTS' as info,
    product_name,
    product_code,
    interest_rate,
    interest_method,
    term_unit,
    min_amount,
    max_amount,
    status
FROM loan_products
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY product_name;
