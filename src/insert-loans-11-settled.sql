-- ============================================================================
-- INSERT 11 SETTLED LOANS
-- ============================================================================
-- These are fully paid loans from the screenshots
-- All loans have balance = 0, status = 'settled'
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_client_id UUID;
    v_personal_loan_id UUID;
    v_business_loan_id UUID;
    v_loan_id UUID;
BEGIN
    -- Get organization ID
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization UV1K not found!';
    END IF;
    
    -- Get loan product IDs (create them if they don't exist)
    SELECT id INTO v_personal_loan_id 
    FROM loan_products 
    WHERE organization_id = v_org_id AND UPPER(name) = 'PERSONAL LOAN';
    
    SELECT id INTO v_business_loan_id 
    FROM loan_products 
    WHERE organization_id = v_org_id AND UPPER(name) = 'BUSINESS LOAN';
    
    -- Create PERSONAL LOAN product if it doesn't exist
    IF v_personal_loan_id IS NULL THEN
        INSERT INTO loan_products (
            organization_id, name, interest_rate, loan_term_months, 
            interest_method, status, created_at, updated_at
        ) VALUES (
            v_org_id, 'PERSONAL LOAN', 10.0, 3,
            'flat', 'active', NOW(), NOW()
        ) RETURNING id INTO v_personal_loan_id;
        RAISE NOTICE 'Created PERSONAL LOAN product: %', v_personal_loan_id;
    END IF;
    
    -- Create BUSINESS LOAN product if it doesn't exist
    IF v_business_loan_id IS NULL THEN
        INSERT INTO loan_products (
            organization_id, name, interest_rate, loan_term_months,
            interest_method, status, created_at, updated_at
        ) VALUES (
            v_org_id, 'BUSINESS LOAN', 5.0, 6,
            'flat', 'active', NOW(), NOW()
        ) RETURNING id INTO v_business_loan_id;
        RAISE NOTICE 'Created BUSINESS LOAN product: %', v_business_loan_id;
    END IF;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Inserting 11 settled loans';
    RAISE NOTICE '============================================================';
    
    -- ========================================================================
    -- LOAN 4858: Josphat Matheka - PERSONAL LOAN - KES 250,000
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '11111112';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '4858',
        250000.00, 10.0, 3, 'months', 'monthly',
        275000.00, 0.00, 275000.00,
        '2025-11-23'::timestamp, '2025-11-23'::timestamp, '2026-02-23'::date,
        5, 'settled', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 4858 - Josphat Matheka - KES 250,000 (SETTLED)';
    
    -- ========================================================================
    -- LOAN 4859: Josphat Matheka - PERSONAL LOAN - KES 50,000
    -- ========================================================================
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '4859',
        50000.00, 10.0, 3, 'months', 'monthly',
        55000.00, 0.00, 55000.00,
        '2025-12-03'::timestamp, '2025-12-03'::timestamp, '2026-03-03'::date,
        5, 'settled', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 4859 - Josphat Matheka - KES 50,000 (SETTLED)';
    
    -- ========================================================================
    -- LOAN 4860: NATALIA THOMAS - BUSINESS LOAN - KES 100,000
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '11111113';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_business_loan_id, '4860',
        100000.00, 5.0, 6, 'months', 'monthly',
        105000.00, 0.00, 105000.00,
        '2025-12-01'::timestamp, '2025-12-01'::timestamp, '2026-06-01'::date,
        5, 'settled', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 4860 - NATALIA THOMAS - KES 100,000 (SETTLED)';
    
    -- ========================================================================
    -- LOAN 4861: Saumu Ouma - PERSONAL LOAN - KES 30,000
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '37109668';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '4861',
        30000.00, 10.0, 3, 'months', 'monthly',
        33000.00, 0.00, 33000.00,
        '2025-12-07'::timestamp, '2025-12-07'::timestamp, '2026-03-07'::date,
        5, 'settled', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 4861 - Saumu Ouma - KES 30,000 (SETTLED)';
    
    -- ========================================================================
    -- LOAN 4862: SEBASTIAN PETER - PERSONAL LOAN - KES 75,000
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '25225003';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '4862',
        75000.00, 5.0, 3, 'months', 'monthly',
        78750.00, 0.00, 78750.00,
        '2025-12-10'::timestamp, '2025-12-10'::timestamp, '2026-03-10'::date,
        5, 'settled', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 4862 - SEBASTIAN PETER - KES 75,000 (SETTLED)';
    
    -- ========================================================================
    -- LOAN 4863: ELIZABETH WAWERU - PERSONAL LOAN - KES 100,000
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '22000875';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '4863',
        100000.00, 10.0, 3, 'months', 'monthly',
        110000.00, 0.00, 110000.00,
        '2025-12-13'::timestamp, '2025-12-13'::timestamp, '2026-03-13'::date,
        5, 'settled', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 4863 - ELIZABETH WAWERU - KES 100,000 (SETTLED)';
    
    -- ========================================================================
    -- LOAN 4864: Eric Muthama - PERSONAL LOAN - KES 100,000
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '25267113';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '4864',
        100000.00, 10.0, 3, 'months', 'monthly',
        110000.00, 0.00, 110000.00,
        '2025-12-08'::timestamp, '2025-12-08'::timestamp, '2026-03-08'::date,
        5, 'settled', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 4864 - Eric Muthama - KES 100,000 (SETTLED)';
    
    -- ========================================================================
    -- LOAN 4865: ROONEY MBANI - PERSONAL LOAN - KES 50,000
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '11111115';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '4865',
        50000.00, 10.0, 3, 'months', 'monthly',
        55000.00, 0.00, 55000.00,
        '2025-11-28'::timestamp, '2025-11-28'::timestamp, '2026-02-28'::date,
        5, 'settled', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 4865 - ROONEY MBANI - KES 50,000 (SETTLED)';
    
    -- ========================================================================
    -- LOAN 4866: Ben Mbuvi - PERSONAL LOAN - KES 50,000
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '11111118';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '4866',
        50000.00, 10.0, 3, 'months', 'monthly',
        55000.00, 0.00, 55000.00,
        '2025-11-28'::timestamp, '2025-11-28'::timestamp, '2026-02-28'::date,
        5, 'settled', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 4866 - Ben Mbuvi - KES 50,000 (SETTLED)';
    
    -- ========================================================================
    -- LOAN 4867: Stephen Mulu Nzavi - PERSONAL LOAN - KES 50,000
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '11376836';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '4867',
        50000.00, 10.0, 3, 'months', 'monthly',
        55000.00, 0.00, 55000.00,
        '2025-11-27'::timestamp, '2025-11-27'::timestamp, '2026-02-27'::date,
        5, 'settled', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 4867 - Stephen Mulu Nzavi - KES 50,000 (SETTLED)';
    
    -- ========================================================================
    -- LOAN 4845: Stephen Mulu Nzavi - PERSONAL LOAN - KES 50,000
    -- ========================================================================
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '4845',
        50000.00, 10.0, 3, 'months', 'monthly',
        55000.00, 0.00, 55000.00,
        '2025-12-29'::timestamp, '2025-12-29'::timestamp, '2026-03-29'::date,
        5, 'settled', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 4845 - Stephen Mulu Nzavi - KES 50,000 (SETTLED)';
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Successfully inserted 11 settled loans!';
    RAISE NOTICE 'Total Principal: KES 855,000';
    RAISE NOTICE 'Total Interest: KES 76,500';
    RAISE NOTICE 'Total Amount: KES 931,500 (all fully repaid)';
    RAISE NOTICE '============================================================';
    
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show all inserted loans
SELECT 
    '📋 ALL SETTLED LOANS' as info,
    l.loan_number,
    c.client_number,
    c.name as client_name,
    p.name as product,
    l.amount as principal,
    l.total_amount,
    l.balance,
    l.amount_paid,
    l.status,
    l.disbursement_date::date
FROM loans l
JOIN clients c ON l.client_id = c.id
JOIN loan_products p ON l.product_id = p.id
WHERE l.organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY l.loan_number;

-- Summary by status
SELECT 
    status,
    COUNT(*) as loan_count,
    SUM(amount) as total_principal,
    SUM(total_amount) as total_amount,
    SUM(balance) as total_balance,
    SUM(amount_paid) as total_paid
FROM loans
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
GROUP BY status;

-- Summary by product
SELECT 
    p.name as product,
    COUNT(*) as loan_count,
    SUM(l.amount) as total_principal,
    SUM(l.total_amount) as total_amount
FROM loans l
JOIN loan_products p ON l.product_id = p.id
WHERE l.organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
GROUP BY p.name;
