-- ============================================================================
-- INSERT 9 ACTIVE LOANS FOR BV FUNGUO LTD (UV1K) - CORRECT SCHEMA
-- ============================================================================
-- Using actual database columns from schema
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_loan_count INTEGER := 0;
    v_client_id UUID;
    v_product_id UUID;
BEGIN
    -- Get organization ID
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION '❌ Organization UV1K not found!';
    END IF;

    -- Try to get a product_id (optional)
    SELECT id INTO v_product_id FROM loan_products WHERE organization_id = v_org_id LIMIT 1;

    RAISE NOTICE '============================================================';
    RAISE NOTICE '🚀 Starting insertion of 9 active loans';
    RAISE NOTICE '============================================================';

    -- LOAN 1: 5396 - QUENTIN DAUDI AFANDE
    -- Principal: 100,000 | Interest: 7,500 | Total: 107,500 | Balance: 107,500
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '22937024';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '5396',
            100000.00, 7.5, 3, 'months', 'monthly',
            107500.00, 107500.00, 0.00,
            'active', 5, '2026-01-30', '2026-01-30'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 5396 for QUENTIN DAUDI AFANDE';
    END IF;

    -- LOAN 2: 5344 - DANIEL COLLINS
    -- Principal: 33,000 | Interest: 2,475 | Total: 35,475 | Balance: 35,475
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '22482535';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '5344',
            33000.00, 7.5, 3, 'months', 'monthly',
            35475.00, 35475.00, 0.00,
            'active', 5, '2026-01-28', '2026-01-28'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 5344 for DANIEL COLLINS';
    END IF;

    -- LOAN 3: 5343 - Geoffrey Rogiers Mwandango
    -- Principal: 150,000 | Interest: 11,250 | Total: 161,250 | Balance: 161,250
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '23260758';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '5343',
            150000.00, 7.5, 3, 'months', 'monthly',
            161250.00, 161250.00, 0.00,
            'active', 5, '2026-01-28', '2026-01-28'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 5343 for Geoffrey Rogiers Mwandango';
    END IF;

    -- LOAN 4: 5328 - OLIVE KAMENE
    -- Principal: 300,000 | Interest: 22,500 | Total: 322,500 | Balance: 322,500
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '248858793';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '5328',
            300000.00, 7.5, 3, 'months', 'monthly',
            322500.00, 322500.00, 0.00,
            'active', 5, '2026-01-28', '2026-01-28'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 5328 for OLIVE KAMENE';
    END IF;

    -- LOAN 5: 5276 - PRISCAH LOICE MBUVI
    -- Principal: 35,000 | Interest: 2,625 | Total: 37,625 | Balance: 37,625
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '23906403';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '5276',
            35000.00, 7.5, 3, 'months', 'monthly',
            37625.00, 37625.00, 0.00,
            'active', 5, '2026-01-21', '2026-01-21'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 5276 for PRISCAH LOICE MBUVI';
    END IF;

    -- LOAN 6: 5250 - JUWEYRLYA ALI MUHAMMAD
    -- Principal: 300,000 | Interest: 22,500 | Total: 322,500 | Balance: 345,000 (has payments/penalties)
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '13214492';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '5250',
            300000.00, 7.5, 3, 'months', 'monthly',
            322500.00, 345000.00, 0.00,
            'active', 5, '2026-01-19', '2026-01-19'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 5250 for JUWEYRLYA ALI MUHAMMAD';
    END IF;

    -- LOAN 7: 5224 - Nicholas Ndiragu Mwangi
    -- Principal: 300,000 | Interest: 22,500 | Total: 322,500 | Balance: 345,000
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '23118869';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '5224',
            300000.00, 7.5, 3, 'months', 'monthly',
            322500.00, 345000.00, 0.00,
            'active', 5, '2026-01-27', '2026-01-27'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 5224 for Nicholas Ndiragu Mwangi';
    END IF;

    -- LOAN 8: 5110 - James Mbuvi
    -- Principal: 50,000 | Interest: 3,750 | Total: 53,750 | Balance: 26,750 | Paid: 27,000
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '21019115';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '5110',
            50000.00, 7.5, 3, 'months', 'monthly',
            53750.00, 26750.00, 27000.00,
            'active', 5, '2025-12-27', '2025-12-27'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 5110 for James Mbuvi';
    END IF;

    -- LOAN 9: 4926 - BILLY BOSTON ANYONYI
    -- Principal: 200,000 | Interest: 15,000 | Total: 215,000 | Balance: 143,300 | Paid: 71,700
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '24090458';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4926',
            200000.00, 7.5, 3, 'months', 'monthly',
            215000.00, 143300.00, 71700.00,
            'active', 5, '2025-12-05', '2025-12-05'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4926 for BILLY BOSTON ANYONYI';
    END IF;

    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Successfully inserted % active loans', v_loan_count;
    RAISE NOTICE '============================================================';

END $$;

-- Verify insertion
SELECT 
    '✅ VERIFICATION: All Active Loans Inserted' as info,
    COUNT(*) as total_active_loans
FROM loans
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
AND status = 'active';

-- Show all active loans with client details
SELECT 
    '📋 ALL ACTIVE LOANS WITH CLIENT DETAILS' as info,
    l.loan_number,
    c.first_name || ' ' || c.last_name as client_name,
    c.id_number,
    l.amount as principal,
    l.interest_rate,
    l.total_amount,
    l.balance as outstanding,
    l.amount_paid,
    l.status,
    l.phase,
    l.disbursement_date
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE l.organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
AND l.status = 'active'
ORDER BY l.loan_number DESC;
