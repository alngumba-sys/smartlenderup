-- ============================================================================
-- STEP 4: INSERT 12 ACTIVE/DEFAULT LOANS WITH OUTSTANDING BALANCES
-- ============================================================================
-- Run this AFTER step3-insert-missing-clients.sql
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
    
    -- Get loan product IDs
    SELECT id INTO v_personal_loan_id 
    FROM loan_products 
    WHERE organization_id = v_org_id AND product_name = 'PERSONAL LOAN';
    
    SELECT id INTO v_business_loan_id 
    FROM loan_products 
    WHERE organization_id = v_org_id AND product_name = 'BUSINESS LOAN';
    
    IF v_personal_loan_id IS NULL OR v_business_loan_id IS NULL THEN
        RAISE EXCEPTION 'Loan products not found!';
    END IF;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Inserting 12 Active/Default Loans with Outstanding Balances';
    RAISE NOTICE '============================================================';
    
    -- ========================================================================
    -- LOAN 5034: Stephen Mulu Nzavi - PERSONAL LOAN - 200K - DEFAULT/PAST DUE
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
        v_org_id, v_client_id, v_personal_loan_id, '5034',
        200000.00, 10.0, 3, 'months', 'monthly',
        220000.00, 220000.00, 0.00,
        '2026-01-23'::timestamp, '2026-01-23'::timestamp, '2026-04-23'::date,
        5, 'overdue', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5034 - Stephen Mulu Nzavi - 200K - OVERDUE';
    
    -- ========================================================================
    -- LOAN 5035: Ben Mbuvi - PERSONAL LOAN - 50K - DEFAULT/PAST DUE
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
        v_org_id, v_client_id, v_personal_loan_id, '5035',
        50000.00, 10.0, 3, 'months', 'monthly',
        55000.00, 55000.00, 0.00,
        '2026-01-23'::timestamp, '2026-01-23'::timestamp, '2026-04-23'::date,
        5, 'overdue', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5035 - Ben Mbuvi - 50K - OVERDUE';
    
    -- ========================================================================
    -- LOAN 5021: Ben Mbuvi - PERSONAL LOAN - 50K - DEFAULT/PAST DUE
    -- ========================================================================
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '5021',
        50000.00, 10.0, 3, 'months', 'monthly',
        55000.00, 55000.00, 0.00,
        '2026-01-23'::timestamp, '2026-01-23'::timestamp, '2026-04-23'::date,
        5, 'overdue', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5021 - Ben Mbuvi - 50K - OVERDUE';
    
    -- ========================================================================
    -- LOAN 4926: BILLY BOSTON AMBWAYA - PERSONAL LOAN - 200K - ACTIVE
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '24909456';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '4926',
        200000.00, 7.5, 6, 'months', 'monthly',
        215000.00, 143300.00, 71700.00,
        '2025-12-06'::timestamp, '2025-12-06'::timestamp, '2026-06-06'::date,
        5, 'active', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 4926 - BILLY BOSTON - 200K - ACTIVE';
    
    -- ========================================================================
    -- LOAN 5396: QUENTIN DAVID AFANDE - PERSONAL LOAN - 100K - PENDING REVIEW
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '22332045';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '5396',
        100000.00, 7.5, 6, 'months', 'monthly',
        107500.00, 107500.00, 0.00,
        '2026-01-30'::timestamp, '2026-01-30'::timestamp, '2026-07-30'::date,
        5, 'active', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5396 - QUENTIN DAVID - 100K - ACTIVE';
    
    -- ========================================================================
    -- LOAN 5344: MAURICE LENS MAKOKI MWATETI - PERSONAL LOAN - 33K - ACTIVE
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '242829535';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '5344',
        33000.00, 7.5, 6, 'months', 'monthly',
        35475.00, 35475.00, 0.00,
        '2026-01-28'::timestamp, '2026-01-28'::timestamp, '2026-07-28'::date,
        5, 'active', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5344 - MAURICE LENS - 33K - ACTIVE';
    
    -- ========================================================================
    -- LOAN 5343: Geoffrey Bosiara Momantunga - PERSONAL LOAN - 150K - ACTIVE
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '23260758';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '5343',
        150000.00, 7.5, 6, 'months', 'monthly',
        161250.00, 161250.00, 0.00,
        '2026-01-28'::timestamp, '2026-01-28'::timestamp, '2026-07-28'::date,
        5, 'active', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5343 - Geoffrey Bosiara - 150K - ACTIVE';
    
    -- ========================================================================
    -- LOAN 5328: OLIVE KAMENE NGUUKI - BUSINESS LOAN - 300K - ACTIVE
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '245858793';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_business_loan_id, '5328',
        300000.00, 7.5, 6, 'months', 'monthly',
        322500.00, 322500.00, 0.00,
        '2026-01-28'::timestamp, '2026-01-28'::timestamp, '2026-07-28'::date,
        5, 'active', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5328 - OLIVE KAMENE - 300K - ACTIVE';
    
    -- ========================================================================
    -- LOAN 5276: PRISCAH LOICE IHUNJI - PERSONAL LOAN - 35K - ACTIVE
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '23906403';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '5276',
        35000.00, 7.5, 6, 'months', 'monthly',
        37625.00, 37625.00, 0.00,
        '2026-01-21'::timestamp, '2026-01-21'::timestamp, '2026-07-21'::date,
        5, 'active', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5276 - PRISCAH LOICE - 35K - ACTIVE';
    
    -- ========================================================================
    -- LOAN 5260: AJAWEYIYA ALI ADAN - BUSINESS LOAN - 300K - ACTIVE
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '1301482';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_business_loan_id, '5260',
        300000.00, 7.5, 6, 'months', 'monthly',
        345000.00, 345000.00, 0.00,
        '2026-01-16'::timestamp, '2026-01-16'::timestamp, '2026-07-16'::date,
        5, 'active', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5260 - AJAWEYIYA ALI - 300K - ACTIVE';
    
    -- ========================================================================
    -- LOAN 5224: Nicholas Ndegwa Chege - BUSINESS LOAN - 300K - ACTIVE
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '23118863';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_business_loan_id, '5224',
        300000.00, 7.5, 6, 'months', 'monthly',
        345000.00, 345000.00, 0.00,
        '2026-01-07'::timestamp, '2026-01-07'::timestamp, '2026-07-07'::date,
        5, 'active', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5224 - Nicholas Ndegwa - 300K - ACTIVE';
    
    -- ========================================================================
    -- LOAN 5110: James Mbuvi - PERSONAL LOAN - 50K - ACTIVE
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '2130115';
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '5110',
        50000.00, 7.5, 6, 'months', 'monthly',
        53750.00, 28750.00, 25000.00,
        '2025-12-27'::timestamp, '2025-12-27'::timestamp, '2026-06-27'::date,
        5, 'active', NOW(), NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5110 - James Mbuvi - 50K - ACTIVE';
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Successfully inserted 12 active/overdue loans!';
    RAISE NOTICE 'Total Principal: KES 1,768,000';
    RAISE NOTICE 'Total Outstanding Balance: KES 1,918,575';
    RAISE NOTICE 'Status Breakdown:';
    RAISE NOTICE '  - 9 Active loans';
    RAISE NOTICE '  - 3 Overdue loans';
    RAISE NOTICE '============================================================';
    
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show all active/overdue loans
SELECT 
    '📋 ACTIVE/OVERDUE LOANS' as info,
    l.loan_number,
    c.client_number,
    c.name as client_name,
    p.product_name,
    l.amount::numeric as principal,
    l.balance::numeric as outstanding,
    l.amount_paid::numeric as paid,
    l.status,
    l.disbursement_date::date
FROM loans l
JOIN clients c ON l.client_id = c.id
JOIN loan_products p ON l.product_id = p.id
WHERE l.organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
AND l.status IN ('active', 'overdue')
ORDER BY l.loan_number;

-- Summary by status
SELECT 
    status,
    COUNT(*) as loan_count,
    SUM(amount)::numeric as total_principal,
    SUM(balance)::numeric as total_outstanding
FROM loans
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
GROUP BY status
ORDER BY status;

-- Overall portfolio summary
SELECT 
    COUNT(*) as total_loans,
    SUM(amount)::numeric as total_principal,
    SUM(balance)::numeric as total_outstanding,
    SUM(amount_paid)::numeric as total_collected
FROM loans
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');
