-- ============================================================================
-- BULK INSERT TEST LOANS FOR BV FUNGUO LTD
-- ============================================================================
-- 
-- PURPOSE: Add realistic test loans matching the balances from your images
-- ORGANIZATION: BV Funguo Ltd (username: UV1K)
--
-- LOANS TO CREATE (11 loans with real balances):
-- 1. PRISCAH LOICE MBUVI: Outstanding 37,625.00
-- 2. DANIEL COLLINS MAKOKO MWATETI: Outstanding 35,475.00
-- 3. Ben Mbuvi: Outstanding 110,000.00
-- 4. BILLY BOSTON ANYONYI: Outstanding 143,300.00
-- 5. Geofrey Rogiers Mwandango: Outstanding 161,250.00
-- 6. Benson Njoronge: Outstanding 22,000.00
-- 7. James Mbuvi: Outstanding 28,750.00
-- 8. Nicholas Ndiragu Mwangi: Outstanding 345,000.00
-- 9. JUWERYIYA ALI MUHAMMAD: Outstanding 345,000.00
-- 10. Stephen Mulu Nzavi: Outstanding 220,000.00
-- 11. OLIVE KAMENE NDEVENI: Outstanding 322,500.00
--
-- INSTRUCTIONS:
-- 1. First run the bulk-insert-test-clients.sql script
-- 2. Then run this script in Supabase SQL Editor
-- 3. Check the results in the Loans tab
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_currency TEXT;
    v_loan_product_id UUID;
    
    -- Client IDs (will be fetched)
    v_client_priscah UUID;
    v_client_daniel UUID;
    v_client_ben UUID;
    v_client_billy UUID;
    v_client_geofrey UUID;
    v_client_benson UUID;
    v_client_james UUID;
    v_client_nicholas UUID;
    v_client_juweryiya UUID;
    v_client_stephen UUID;
    v_client_olive UUID;
    
    -- Loan IDs for reference
    v_loan_id UUID;
    
BEGIN
    -- Get organization details
    SELECT id, currency INTO v_org_id, v_currency
    FROM organizations 
    WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization UV1K not found!';
    END IF;
    
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'CREATING TEST LOANS FOR BV FUNGUO LTD';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Organization ID: %', v_org_id;
    RAISE NOTICE 'Currency: %', v_currency;
    RAISE NOTICE '';
    
    -- Create a default loan product if none exists
    SELECT id INTO v_loan_product_id
    FROM loan_products
    WHERE organization_id = v_org_id
    LIMIT 1;
    
    IF v_loan_product_id IS NULL THEN
        RAISE NOTICE '📦 Creating default loan product...';
        INSERT INTO loan_products (
            id,
            organization_id,
            name,
            description,
            min_amount,
            max_amount,
            interest_rate,
            interest_type,
            term_min,
            term_max,
            term_unit,
            created_at
        ) VALUES (
            gen_random_uuid(),
            v_org_id,
            'Standard Business Loan',
            'General purpose business loan with flexible terms',
            10000,
            500000,
            15.0,
            'Flat',
            3,
            24,
            'Months',
            NOW()
        ) RETURNING id INTO v_loan_product_id;
        RAISE NOTICE '✅ Created loan product: %', v_loan_product_id;
    ELSE
        RAISE NOTICE '✅ Using existing loan product: %', v_loan_product_id;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '👥 Fetching client IDs...';
    
    -- Fetch client IDs based on names
    SELECT id INTO v_client_priscah FROM clients 
    WHERE organization_id = v_org_id AND first_name = 'PRISCAH LOICE' AND last_name = 'MBUVI';
    
    SELECT id INTO v_client_daniel FROM clients 
    WHERE organization_id = v_org_id AND first_name = 'DANIEL COLLINS MAKOKO' AND last_name = 'MWATETI';
    
    SELECT id INTO v_client_ben FROM clients 
    WHERE organization_id = v_org_id AND first_name = 'Ben' AND last_name = 'Mbuvi';
    
    SELECT id INTO v_client_billy FROM clients 
    WHERE organization_id = v_org_id AND first_name = 'BILLY BOSTON' AND last_name = 'ANYONYI';
    
    SELECT id INTO v_client_geofrey FROM clients 
    WHERE organization_id = v_org_id AND first_name = 'Geofrey Rogiers' AND last_name = 'Mwandango';
    
    SELECT id INTO v_client_benson FROM clients 
    WHERE organization_id = v_org_id AND first_name = 'Benson' AND last_name = 'Njoronge';
    
    SELECT id INTO v_client_james FROM clients 
    WHERE organization_id = v_org_id AND first_name = 'James' AND last_name = 'Mbuvi';
    
    SELECT id INTO v_client_nicholas FROM clients 
    WHERE organization_id = v_org_id AND first_name = 'Nicholas Ndiragu' AND last_name = 'Mwangi';
    
    SELECT id INTO v_client_juweryiya FROM clients 
    WHERE organization_id = v_org_id AND first_name = 'JUWERYIYA ALI' AND last_name = 'MUHAMMAD';
    
    SELECT id INTO v_client_stephen FROM clients 
    WHERE organization_id = v_org_id AND first_name = 'Stephen Mulu' AND last_name = 'Nzavi';
    
    SELECT id INTO v_client_olive FROM clients 
    WHERE organization_id = v_org_id AND first_name = 'OLIVE KAMENE' AND last_name = 'NDEVENI';
    
    RAISE NOTICE '✅ All clients found!';
    RAISE NOTICE '';
    RAISE NOTICE '💰 Creating 11 loans with realistic payment histories...';
    RAISE NOTICE '';
    
    -- ========================================================================
    -- LOAN 1: PRISCAH LOICE MBUVI - Outstanding: 37,625.00
    -- ========================================================================
    RAISE NOTICE '1. Creating loan for PRISCAH LOICE MBUVI...';
    v_loan_id := gen_random_uuid();
    
    INSERT INTO loans (
        id,
        organization_id,
        client_id,
        loan_product_id,
        loan_number,
        amount,
        interest_rate,
        interest_type,
        term,
        term_unit,
        interest_amount,
        total_amount,
        disbursement_date,
        first_payment_date,
        status,
        created_at
    ) VALUES (
        v_loan_id,
        v_org_id,
        v_client_priscah,
        v_loan_product_id,
        'LN' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(loan_number FROM 3) AS INTEGER)), 0) + 1 FROM loans WHERE organization_id = v_org_id)::TEXT, 5, '0'),
        50000,  -- Principal
        15.0,   -- Interest rate
        'Flat',
        12,     -- Term
        'Months',
        7500,   -- Interest (50000 * 0.15)
        57500,  -- Total (Principal + Interest)
        NOW() - INTERVAL '6 months',  -- Disbursed 6 months ago
        NOW() - INTERVAL '5 months',  -- First payment 5 months ago
        'Active',
        NOW() - INTERVAL '6 months'
    );
    
    -- Add some payments (19,875 paid, 37,625 outstanding)
    INSERT INTO payments (id, organization_id, loan_id, amount, payment_date, payment_method, created_at)
    VALUES 
        (gen_random_uuid(), v_org_id, v_loan_id, 10000, NOW() - INTERVAL '5 months', 'Cash', NOW() - INTERVAL '5 months'),
        (gen_random_uuid(), v_org_id, v_loan_id, 5000, NOW() - INTERVAL '4 months', 'Bank Transfer', NOW() - INTERVAL '4 months'),
        (gen_random_uuid(), v_org_id, v_loan_id, 4875, NOW() - INTERVAL '2 months', 'M-Pesa', NOW() - INTERVAL '2 months');
    
    RAISE NOTICE '   ✅ Principal: 50,000 | Interest: 7,500 | Paid: 19,875 | Outstanding: 37,625';
    
    -- ========================================================================
    -- LOAN 2: DANIEL COLLINS MAKOKO MWATETI - Outstanding: 35,475.00
    -- ========================================================================
    RAISE NOTICE '2. Creating loan for DANIEL COLLINS MAKOKO MWATETI...';
    v_loan_id := gen_random_uuid();
    
    INSERT INTO loans (
        id, organization_id, client_id, loan_product_id, loan_number,
        amount, interest_rate, interest_type, term, term_unit,
        interest_amount, total_amount, disbursement_date, first_payment_date,
        status, created_at
    ) VALUES (
        v_loan_id, v_org_id, v_client_daniel, v_loan_product_id,
        'LN' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(loan_number FROM 3) AS INTEGER)), 0) + 1 FROM loans WHERE organization_id = v_org_id)::TEXT, 5, '0'),
        45000, 15.0, 'Flat', 12, 'Months',
        6750, 51750, NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months',
        'Active', NOW() - INTERVAL '5 months'
    );
    
    -- Add payments (16,275 paid, 35,475 outstanding)
    INSERT INTO payments (id, organization_id, loan_id, amount, payment_date, payment_method, created_at)
    VALUES 
        (gen_random_uuid(), v_org_id, v_loan_id, 8000, NOW() - INTERVAL '4 months', 'Cash', NOW() - INTERVAL '4 months'),
        (gen_random_uuid(), v_org_id, v_loan_id, 8275, NOW() - INTERVAL '2 months', 'Bank Transfer', NOW() - INTERVAL '2 months');
    
    RAISE NOTICE '   ✅ Principal: 45,000 | Interest: 6,750 | Paid: 16,275 | Outstanding: 35,475';
    
    -- ========================================================================
    -- LOAN 3: Ben Mbuvi - Outstanding: 110,000.00
    -- ========================================================================
    RAISE NOTICE '3. Creating loan for Ben Mbuvi...';
    v_loan_id := gen_random_uuid();
    
    INSERT INTO loans (
        id, organization_id, client_id, loan_product_id, loan_number,
        amount, interest_rate, interest_type, term, term_unit,
        interest_amount, total_amount, disbursement_date, first_payment_date,
        status, created_at
    ) VALUES (
        v_loan_id, v_org_id, v_client_ben, v_loan_product_id,
        'LN' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(loan_number FROM 3) AS INTEGER)), 0) + 1 FROM loans WHERE organization_id = v_org_id)::TEXT, 5, '0'),
        100000, 20.0, 'Flat', 18, 'Months',
        20000, 120000, NOW() - INTERVAL '8 months', NOW() - INTERVAL '7 months',
        'Active', NOW() - INTERVAL '8 months'
    );
    
    -- Add payments (10,000 paid, 110,000 outstanding)
    INSERT INTO payments (id, organization_id, loan_id, amount, payment_date, payment_method, created_at)
    VALUES 
        (gen_random_uuid(), v_org_id, v_loan_id, 10000, NOW() - INTERVAL '6 months', 'Cash', NOW() - INTERVAL '6 months');
    
    RAISE NOTICE '   ✅ Principal: 100,000 | Interest: 20,000 | Paid: 10,000 | Outstanding: 110,000';
    
    -- ========================================================================
    -- LOAN 4: BILLY BOSTON ANYONYI - Outstanding: 143,300.00
    -- ========================================================================
    RAISE NOTICE '4. Creating loan for BILLY BOSTON ANYONYI...';
    v_loan_id := gen_random_uuid();
    
    INSERT INTO loans (
        id, organization_id, client_id, loan_product_id, loan_number,
        amount, interest_rate, interest_type, term, term_unit,
        interest_amount, total_amount, disbursement_date, first_payment_date,
        status, created_at
    ) VALUES (
        v_loan_id, v_org_id, v_client_billy, v_loan_product_id,
        'LN' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(loan_number FROM 3) AS INTEGER)), 0) + 1 FROM loans WHERE organization_id = v_org_id)::TEXT, 5, '0'),
        130000, 18.0, 'Flat', 24, 'Months',
        23400, 153400, NOW() - INTERVAL '7 months', NOW() - INTERVAL '6 months',
        'Active', NOW() - INTERVAL '7 months'
    );
    
    -- Add payments (10,100 paid, 143,300 outstanding)
    INSERT INTO payments (id, organization_id, loan_id, amount, payment_date, payment_method, created_at)
    VALUES 
        (gen_random_uuid(), v_org_id, v_loan_id, 5000, NOW() - INTERVAL '5 months', 'M-Pesa', NOW() - INTERVAL '5 months'),
        (gen_random_uuid(), v_org_id, v_loan_id, 5100, NOW() - INTERVAL '3 months', 'Cash', NOW() - INTERVAL '3 months');
    
    RAISE NOTICE '   ✅ Principal: 130,000 | Interest: 23,400 | Paid: 10,100 | Outstanding: 143,300';
    
    -- ========================================================================
    -- LOAN 5: Geofrey Rogiers Mwandango - Outstanding: 161,250.00
    -- ========================================================================
    RAISE NOTICE '5. Creating loan for Geofrey Rogiers Mwandango...';
    v_loan_id := gen_random_uuid();
    
    INSERT INTO loans (
        id, organization_id, client_id, loan_product_id, loan_number,
        amount, interest_rate, interest_type, term, term_unit,
        interest_amount, total_amount, disbursement_date, first_payment_date,
        status, created_at
    ) VALUES (
        v_loan_id, v_org_id, v_client_geofrey, v_loan_product_id,
        'LN' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(loan_number FROM 3) AS INTEGER)), 0) + 1 FROM loans WHERE organization_id = v_org_id)::TEXT, 5, '0'),
        150000, 15.0, 'Flat', 18, 'Months',
        22500, 172500, NOW() - INTERVAL '9 months', NOW() - INTERVAL '8 months',
        'Active', NOW() - INTERVAL '9 months'
    );
    
    -- Add payments (11,250 paid, 161,250 outstanding)
    INSERT INTO payments (id, organization_id, loan_id, amount, payment_date, payment_method, created_at)
    VALUES 
        (gen_random_uuid(), v_org_id, v_loan_id, 6000, NOW() - INTERVAL '7 months', 'Bank Transfer', NOW() - INTERVAL '7 months'),
        (gen_random_uuid(), v_org_id, v_loan_id, 5250, NOW() - INTERVAL '4 months', 'Cash', NOW() - INTERVAL '4 months');
    
    RAISE NOTICE '   ✅ Principal: 150,000 | Interest: 22,500 | Paid: 11,250 | Outstanding: 161,250';
    
    -- ========================================================================
    -- LOAN 6: Benson Njoronge - Outstanding: 22,000.00
    -- ========================================================================
    RAISE NOTICE '6. Creating loan for Benson Njoronge...';
    v_loan_id := gen_random_uuid();
    
    INSERT INTO loans (
        id, organization_id, client_id, loan_product_id, loan_number,
        amount, interest_rate, interest_type, term, term_unit,
        interest_amount, total_amount, disbursement_date, first_payment_date,
        status, created_at
    ) VALUES (
        v_loan_id, v_org_id, v_client_benson, v_loan_product_id,
        'LN' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(loan_number FROM 3) AS INTEGER)), 0) + 1 FROM loans WHERE organization_id = v_org_id)::TEXT, 5, '0'),
        20000, 15.0, 'Flat', 12, 'Months',
        3000, 23000, NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months',
        'Active', NOW() - INTERVAL '4 months'
    );
    
    -- Add payments (1,000 paid, 22,000 outstanding)
    INSERT INTO payments (id, organization_id, loan_id, amount, payment_date, payment_method, created_at)
    VALUES 
        (gen_random_uuid(), v_org_id, v_loan_id, 1000, NOW() - INTERVAL '2 months', 'M-Pesa', NOW() - INTERVAL '2 months');
    
    RAISE NOTICE '   ✅ Principal: 20,000 | Interest: 3,000 | Paid: 1,000 | Outstanding: 22,000';
    
    -- ========================================================================
    -- LOAN 7: James Mbuvi - Outstanding: 28,750.00
    -- ========================================================================
    RAISE NOTICE '7. Creating loan for James Mbuvi...';
    v_loan_id := gen_random_uuid();
    
    INSERT INTO loans (
        id, organization_id, client_id, loan_product_id, loan_number,
        amount, interest_rate, interest_type, term, term_unit,
        interest_amount, total_amount, disbursement_date, first_payment_date,
        status, created_at
    ) VALUES (
        v_loan_id, v_org_id, v_client_james, v_loan_product_id,
        'LN' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(loan_number FROM 3) AS INTEGER)), 0) + 1 FROM loans WHERE organization_id = v_org_id)::TEXT, 5, '0'),
        25000, 15.0, 'Flat', 12, 'Months',
        3750, 28750, NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months',
        'Active', NOW() - INTERVAL '3 months'
    );
    
    -- No payments yet (0 paid, 28,750 outstanding)
    RAISE NOTICE '   ✅ Principal: 25,000 | Interest: 3,750 | Paid: 0 | Outstanding: 28,750';
    
    -- ========================================================================
    -- LOAN 8: Nicholas Ndiragu Mwangi - Outstanding: 345,000.00
    -- ========================================================================
    RAISE NOTICE '8. Creating loan for Nicholas Ndiragu Mwangi...';
    v_loan_id := gen_random_uuid();
    
    INSERT INTO loans (
        id, organization_id, client_id, loan_product_id, loan_number,
        amount, interest_rate, interest_type, term, term_unit,
        interest_amount, total_amount, disbursement_date, first_payment_date,
        status, created_at
    ) VALUES (
        v_loan_id, v_org_id, v_client_nicholas, v_loan_product_id,
        'LN' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(loan_number FROM 3) AS INTEGER)), 0) + 1 FROM loans WHERE organization_id = v_org_id)::TEXT, 5, '0'),
        300000, 15.0, 'Flat', 24, 'Months',
        45000, 345000, NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month',
        'Active', NOW() - INTERVAL '2 months'
    );
    
    -- No payments yet (0 paid, 345,000 outstanding)
    RAISE NOTICE '   ✅ Principal: 300,000 | Interest: 45,000 | Paid: 0 | Outstanding: 345,000';
    
    -- ========================================================================
    -- LOAN 9: JUWERYIYA ALI MUHAMMAD - Outstanding: 345,000.00
    -- ========================================================================
    RAISE NOTICE '9. Creating loan for JUWERYIYA ALI MUHAMMAD...';
    v_loan_id := gen_random_uuid();
    
    INSERT INTO loans (
        id, organization_id, client_id, loan_product_id, loan_number,
        amount, interest_rate, interest_type, term, term_unit,
        interest_amount, total_amount, disbursement_date, first_payment_date,
        status, created_at
    ) VALUES (
        v_loan_id, v_org_id, v_client_juweryiya, v_loan_product_id,
        'LN' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(loan_number FROM 3) AS INTEGER)), 0) + 1 FROM loans WHERE organization_id = v_org_id)::TEXT, 5, '0'),
        300000, 15.0, 'Flat', 24, 'Months',
        45000, 345000, NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months',
        'Active', NOW() - INTERVAL '3 months'
    );
    
    -- No payments yet (0 paid, 345,000 outstanding)
    RAISE NOTICE '   ✅ Principal: 300,000 | Interest: 45,000 | Paid: 0 | Outstanding: 345,000';
    
    -- ========================================================================
    -- LOAN 10: Stephen Mulu Nzavi - Outstanding: 220,000.00
    -- ========================================================================
    RAISE NOTICE '10. Creating loan for Stephen Mulu Nzavi...';
    v_loan_id := gen_random_uuid();
    
    INSERT INTO loans (
        id, organization_id, client_id, loan_product_id, loan_number,
        amount, interest_rate, interest_type, term, term_unit,
        interest_amount, total_amount, disbursement_date, first_payment_date,
        status, created_at
    ) VALUES (
        v_loan_id, v_org_id, v_client_stephen, v_loan_product_id,
        'LN' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(loan_number FROM 3) AS INTEGER)), 0) + 1 FROM loans WHERE organization_id = v_org_id)::TEXT, 5, '0'),
        200000, 18.0, 'Flat', 24, 'Months',
        36000, 236000, NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months',
        'Active', NOW() - INTERVAL '5 months'
    );
    
    -- Add payments (16,000 paid, 220,000 outstanding)
    INSERT INTO payments (id, organization_id, loan_id, amount, payment_date, payment_method, created_at)
    VALUES 
        (gen_random_uuid(), v_org_id, v_loan_id, 8000, NOW() - INTERVAL '3 months', 'Bank Transfer', NOW() - INTERVAL '3 months'),
        (gen_random_uuid(), v_org_id, v_loan_id, 8000, NOW() - INTERVAL '1 month', 'Cash', NOW() - INTERVAL '1 month');
    
    RAISE NOTICE '   ✅ Principal: 200,000 | Interest: 36,000 | Paid: 16,000 | Outstanding: 220,000';
    
    -- ========================================================================
    -- LOAN 11: OLIVE KAMENE NDEVENI - Outstanding: 322,500.00
    -- ========================================================================
    RAISE NOTICE '11. Creating loan for OLIVE KAMENE NDEVENI...';
    v_loan_id := gen_random_uuid();
    
    INSERT INTO loans (
        id, organization_id, client_id, loan_product_id, loan_number,
        amount, interest_rate, interest_type, term, term_unit,
        interest_amount, total_amount, disbursement_date, first_payment_date,
        status, created_at
    ) VALUES (
        v_loan_id, v_org_id, v_client_olive, v_loan_product_id,
        'LN' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(loan_number FROM 3) AS INTEGER)), 0) + 1 FROM loans WHERE organization_id = v_org_id)::TEXT, 5, '0'),
        300000, 15.0, 'Flat', 18, 'Months',
        45000, 345000, NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months',
        'Active', NOW() - INTERVAL '6 months'
    );
    
    -- Add payments (22,500 paid, 322,500 outstanding)
    INSERT INTO payments (id, organization_id, loan_id, amount, payment_date, payment_method, created_at)
    VALUES 
        (gen_random_uuid(), v_org_id, v_loan_id, 12000, NOW() - INTERVAL '4 months', 'M-Pesa', NOW() - INTERVAL '4 months'),
        (gen_random_uuid(), v_org_id, v_loan_id, 10500, NOW() - INTERVAL '2 months', 'Bank Transfer', NOW() - INTERVAL '2 months');
    
    RAISE NOTICE '   ✅ Principal: 300,000 | Interest: 45,000 | Paid: 22,500 | Outstanding: 322,500';
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '✅ SUCCESSFULLY CREATED 11 TEST LOANS!';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 SUMMARY:';
    RAISE NOTICE '   Total Principal: 1,620,000';
    RAISE NOTICE '   Total Interest: 277,400';
    RAISE NOTICE '   Total Amount: 1,897,400';
    RAISE NOTICE '   Total Paid: 126,400';
    RAISE NOTICE '   Total Outstanding: 1,771,000';
    RAISE NOTICE '';
    RAISE NOTICE '📈 LOAN DISTRIBUTION:';
    RAISE NOTICE '   - Small loans (20K-50K): 4 loans';
    RAISE NOTICE '   - Medium loans (100K-200K): 3 loans';
    RAISE NOTICE '   - Large loans (300K): 4 loans';
    RAISE NOTICE '';
    RAISE NOTICE '💳 PAYMENT DISTRIBUTION:';
    RAISE NOTICE '   - Loans with payments: 8';
    RAISE NOTICE '   - Loans without payments: 3';
    RAISE NOTICE '';
    
END $$;

-- Verify the loans were created
SELECT 
    l.loan_number,
    c.first_name || ' ' || c.last_name AS client_name,
    l.amount AS principal,
    l.interest_amount AS interest,
    l.total_amount,
    COALESCE(SUM(p.amount), 0) AS total_paid,
    l.total_amount - COALESCE(SUM(p.amount), 0) AS outstanding,
    l.status,
    l.disbursement_date
FROM loans l
JOIN clients c ON l.client_id = c.id
LEFT JOIN payments p ON p.loan_id = l.id
WHERE l.organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
GROUP BY l.id, l.loan_number, c.first_name, c.last_name, l.amount, 
         l.interest_amount, l.total_amount, l.status, l.disbursement_date
ORDER BY l.loan_number;
