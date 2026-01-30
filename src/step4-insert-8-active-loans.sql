-- ============================================================================
-- STEP 4: INSERT 8 ACTIVE LOANS (with outstanding balances)
-- ============================================================================
-- Run this AFTER step3-insert-8-new-clients.sql
-- These loans have balances > 0 and status = 'active'
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
    
    IF v_personal_loan_id IS NULL THEN
        RAISE EXCEPTION 'PERSONAL LOAN product not found!';
    END IF;
    
    IF v_business_loan_id IS NULL THEN
        RAISE EXCEPTION 'BUSINESS LOAN product not found!';
    END IF;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Inserting 8 Active Loans';
    RAISE NOTICE '============================================================';
    
    -- ========================================================================
    -- LOAN 5344: DANIEL COLLINS - PERSONAL LOAN - KES 33,000
    -- Disbursed: 25,815 | Total: 35,475 | Balance: 35,475 (no payments yet)
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '22482936';
    
    IF v_client_id IS NULL THEN
        RAISE EXCEPTION 'Client 22482936 (DANIEL COLLINS) not found!';
    END IF;
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '5344',
        33000.00,           -- principal
        7.5,                -- interest rate (2,475 / 33,000 = 7.5%)
        3,                  -- term
        'months',
        'monthly',
        35475.00,           -- total amount (33,000 + 2,475)
        35475.00,           -- balance (no payments yet)
        0.00,               -- amount paid
        '2026-01-28'::timestamp,
        '2026-01-28'::timestamp,
        '2026-04-28'::date,
        5,                  -- phase 5 (disbursed)
        'active',
        NOW(),
        NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5344 - DANIEL COLLINS - KES 33,000 (Balance: 35,475)';
    
    -- ========================================================================
    -- LOAN 5343: Isaiah Mwangangi - PERSONAL LOAN - KES 150,000
    -- Disbursed: 141,750 | Total: 161,250 | Balance: 161,250 (no payments yet)
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '22220758';
    
    IF v_client_id IS NULL THEN
        RAISE EXCEPTION 'Client 22220758 (Isaiah Mwangangi) not found!';
    END IF;
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '5343',
        150000.00,          -- principal
        7.5,                -- interest rate (11,250 / 150,000 = 7.5%)
        3,
        'months',
        'monthly',
        161250.00,          -- total amount (150,000 + 11,250)
        161250.00,          -- balance (no payments yet)
        0.00,               -- amount paid
        '2026-01-28'::timestamp,
        '2026-01-28'::timestamp,
        '2026-04-28'::date,
        5,
        'active',
        NOW(),
        NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5343 - Isaiah Mwangangi - KES 150,000 (Balance: 161,250)';
    
    -- ========================================================================
    -- LOAN 5328: ISAAC LEMPE - BUSINESS LOAN - KES 300,000
    -- Disbursed: 284,000 | Total: 322,500 | Balance: 322,500 (no payments yet)
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '245686793';
    
    IF v_client_id IS NULL THEN
        RAISE EXCEPTION 'Client 245686793 (ISAAC LEMPE) not found!';
    END IF;
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_business_loan_id, '5328',
        300000.00,          -- principal
        7.5,                -- interest rate (22,500 / 300,000 = 7.5%)
        6,
        'months',
        'monthly',
        322500.00,          -- total amount (300,000 + 22,500)
        322500.00,          -- balance (no payments yet)
        0.00,               -- amount paid
        '2026-01-20'::timestamp,
        '2026-01-20'::timestamp,
        '2026-07-20'::date,
        5,
        'active',
        NOW(),
        NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5328 - ISAAC LEMPE - KES 300,000 (Balance: 322,500)';
    
    -- ========================================================================
    -- LOAN 5276: DRISCAH LOICE MBUU - PERSONAL LOAN - KES 35,000
    -- Disbursed: 31,875 | Total: 37,625 | Balance: 37,625 (no payments yet)
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '23106403';
    
    IF v_client_id IS NULL THEN
        RAISE EXCEPTION 'Client 23106403 (DRISCAH LOICE MBUU) not found!';
    END IF;
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '5276',
        35000.00,           -- principal
        7.5,                -- interest rate (2,625 / 35,000 = 7.5%)
        3,
        'months',
        'monthly',
        37625.00,           -- total amount (35,000 + 2,625)
        37625.00,           -- balance (no payments yet)
        0.00,               -- amount paid
        '2026-01-21'::timestamp,
        '2026-01-21'::timestamp,
        '2026-04-21'::date,
        5,
        'active',
        NOW(),
        NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5276 - DRISCAH LOICE MBUU - KES 35,000 (Balance: 37,625)';
    
    -- ========================================================================
    -- LOAN 5250: JUMPSYKE ALI - BUSINESS LOAN - KES 300,000
    -- Disbursed: 284,000 | Total: 322,500 | Balance: 345,000 (22,500 penalty)
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '19214492';
    
    IF v_client_id IS NULL THEN
        RAISE EXCEPTION 'Client 19214492 (JUMPSYKE ALI) not found!';
    END IF;
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_business_loan_id, '5250',
        300000.00,          -- principal
        7.5,                -- interest rate
        6,
        'months',
        'monthly',
        322500.00,          -- total amount (300,000 + 22,500)
        345000.00,          -- balance (includes 22,500 penalty)
        0.00,               -- amount paid
        '2026-01-10'::timestamp,
        '2026-01-10'::timestamp,
        '2026-07-10'::date,
        5,
        'active',
        NOW(),
        NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5250 - JUMPSYKE ALI - KES 300,000 (Balance: 345,000)';
    
    -- ========================================================================
    -- LOAN 5234: Nicholas Ndiringu - BUSINESS LOAN - KES 300,000
    -- Disbursed: 284,000 | Total: 322,500 | Balance: 345,000 (22,500 penalty)
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '21118809';
    
    IF v_client_id IS NULL THEN
        RAISE EXCEPTION 'Client 21118809 (Nicholas Ndiringu) not found!';
    END IF;
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_business_loan_id, '5234',
        300000.00,          -- principal
        7.5,                -- interest rate
        6,
        'months',
        'monthly',
        322500.00,          -- total amount (300,000 + 22,500)
        345000.00,          -- balance (includes 22,500 penalty)
        0.00,               -- amount paid
        '2026-01-07'::timestamp,
        '2026-01-07'::timestamp,
        '2026-07-07'::date,
        5,
        'active',
        NOW(),
        NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5234 - Nicholas Ndiringu - KES 300,000 (Balance: 345,000)';
    
    -- ========================================================================
    -- LOAN 5110: James Mbua - PERSONAL LOAN - KES 50,000
    -- Disbursed: 50,000 | Total: 53,750 | Balance: 28,750 | Paid: 25,000
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '21101116';
    
    IF v_client_id IS NULL THEN
        RAISE EXCEPTION 'Client 21101116 (James Mbua) not found!';
    END IF;
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '5110',
        50000.00,           -- principal
        7.5,                -- interest rate (3,750 / 50,000 = 7.5%)
        3,
        'months',
        'monthly',
        53750.00,           -- total amount (50,000 + 3,750)
        28750.00,           -- balance (53,750 - 25,000 paid)
        25000.00,           -- amount paid
        '2025-12-27'::timestamp,
        '2025-12-27'::timestamp,
        '2026-03-27'::date,
        5,
        'active',
        NOW(),
        NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 5110 - James Mbua - KES 50,000 (Balance: 28,750)';
    
    -- ========================================================================
    -- LOAN 4926: BILLY BOSTON - PERSONAL LOAN - KES 200,000
    -- Disbursed: 200,000 | Total: 215,000 | Balance: 143,300 | Paid: 71,700
    -- ========================================================================
    SELECT id INTO v_client_id FROM clients 
    WHERE organization_id = v_org_id AND id_number = '24000458';
    
    IF v_client_id IS NULL THEN
        RAISE EXCEPTION 'Client 24000458 (BILLY BOSTON) not found!';
    END IF;
    
    INSERT INTO loans (
        organization_id, client_id, product_id, loan_number,
        amount, interest_rate, term_period, term_period_unit, repayment_frequency,
        total_amount, balance, amount_paid,
        disbursement_date, application_date, maturity_date,
        phase, status, created_at, updated_at
    ) VALUES (
        v_org_id, v_client_id, v_personal_loan_id, '4926',
        200000.00,          -- principal
        7.5,                -- interest rate (15,000 / 200,000 = 7.5%)
        3,
        'months',
        'monthly',
        215000.00,          -- total amount (200,000 + 15,000)
        143300.00,          -- balance (215,000 - 71,700 paid)
        71700.00,           -- amount paid
        '2025-12-05'::timestamp,
        '2025-12-05'::timestamp,
        '2026-03-05'::date,
        5,
        'active',
        NOW(),
        NOW()
    ) RETURNING id INTO v_loan_id;
    RAISE NOTICE '✅ Loan 4926 - BILLY BOSTON - KES 200,000 (Balance: 143,300)';
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Successfully inserted 8 active loans!';
    RAISE NOTICE 'Total Principal: KES 1,368,000';
    RAISE NOTICE 'Total Outstanding: KES 1,471,300';
    RAISE NOTICE 'Total Paid: KES 96,700';
    RAISE NOTICE '============================================================';
    
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show all active loans
SELECT 
    '📋 ACTIVE LOANS' as info,
    l.loan_number,
    c.client_number,
    c.name as client_name,
    p.product_name,
    l.amount::numeric as principal,
    l.total_amount::numeric,
    l.balance::numeric,
    l.amount_paid::numeric,
    l.status,
    l.disbursement_date::date
FROM loans l
JOIN clients c ON l.client_id = c.id
JOIN loan_products p ON l.product_id = p.id
WHERE l.organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
AND l.status = 'active'
ORDER BY l.loan_number;

-- Summary totals
SELECT 
    '📊 SUMMARY' as info,
    COUNT(*) as total_active_loans,
    SUM(amount)::numeric as total_principal,
    SUM(total_amount)::numeric as total_amount,
    SUM(balance)::numeric as total_outstanding,
    SUM(amount_paid)::numeric as total_paid
FROM loans
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
AND status = 'active';

-- Overall portfolio
SELECT 
    '🎯 OVERALL PORTFOLIO' as info,
    COUNT(*) as all_loans,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_loans,
    SUM(CASE WHEN status = 'settled' THEN 1 ELSE 0 END) as settled_loans,
    SUM(amount)::numeric as total_disbursed,
    SUM(balance)::numeric as total_outstanding
FROM loans
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');
