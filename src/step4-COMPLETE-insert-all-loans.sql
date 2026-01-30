-- ============================================================================
-- STEP 4: INSERT ALL LOANS (WITH DUPLICATE PREVENTION)
-- ============================================================================
-- This script inserts ALL 26 loans from screenshots
-- PREVENTS DUPLICATES by checking if loan_number already exists
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_client_id UUID;
    v_personal_loan_id UUID;
    v_business_loan_id UUID;
    v_loan_id UUID;
    v_exists BOOLEAN;
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
    RAISE NOTICE 'Inserting ALL Loans (26 total) with Duplicate Prevention';
    RAISE NOTICE '============================================================';
    
    -- ========================================================================
    -- LOAN 5366: QUENTIN DAUGI AFANDE - PENDING REVIEW - KES 100,000
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5366') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '22037024';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                application_date, phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '5366',
                100000.00, 7.5, 3, 'months', 'monthly',
                107500.00, 107500.00, 0.00,
                '2026-01-30'::timestamp, 1, 'pending',
                NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5366 - QUENTIN - KES 100,000 (PENDING)';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 5366 - Client not found';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5366 - Already exists';
    END IF;
    
    -- ========================================================================
    -- LOAN 5344: DANIEL COLLINS - ACTIVE - KES 33,000
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5344') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '22482536';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '5344',
                33000.00, 7.5, 3, 'months', 'monthly',
                35475.00, 35475.00, 0.00,
                '2026-01-28'::timestamp, '2026-01-28'::timestamp, '2026-04-28'::date,
                5, 'active', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5344 - DANIEL COLLINS - KES 33,000';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 5344 - Client not found';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5344 - Already exists';
    END IF;
    
    -- ========================================================================
    -- LOAN 5343: Absoley Rodera Mwangangi - ACTIVE - KES 150,000
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5343') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '23260708';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '5343',
                150000.00, 7.5, 3, 'months', 'monthly',
                161250.00, 161250.00, 0.00,
                '2026-01-28'::timestamp, '2026-01-28'::timestamp, '2026-04-28'::date,
                5, 'active', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5343 - Absoley Mwangangi - KES 150,000';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 5343 - Client not found';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5343 - Already exists';
    END IF;
    
    -- ========================================================================
    -- LOAN 5328: OLIVE KAMENE MUKOYA - ACTIVE - KES 300,000
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5328') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '245858793';
        IF v_client_id IS NOT NULL THEN
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
                '2026-01-26'::timestamp, '2026-01-26'::timestamp, '2026-07-26'::date,
                5, 'active', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5328 - OLIVE KAMENE - KES 300,000';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 5328 - Client not found';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5328 - Already exists';
    END IF;
    
    -- ========================================================================
    -- LOAN 5276: PRISCAH LOICE MBUU - ACTIVE - KES 35,000
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5276') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '23506403';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '5276',
                35000.00, 7.5, 3, 'months', 'monthly',
                37625.00, 37625.00, 0.00,
                '2026-01-21'::timestamp, '2026-01-21'::timestamp, '2026-04-21'::date,
                5, 'active', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5276 - PRISCAH MBUU - KES 35,000';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 5276 - Client not found';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5276 - Already exists';
    END IF;
    
    -- ========================================================================
    -- LOAN 5250: JUMPSYKE ALI - ACTIVE - KES 300,000 (with penalty)
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5250') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '19214492';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_business_loan_id, '5250',
                300000.00, 7.5, 6, 'months', 'monthly',
                322500.00, 345000.00, 0.00,
                '2026-01-16'::timestamp, '2026-01-16'::timestamp, '2026-07-16'::date,
                5, 'active', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5250 - JUMPSYKE ALI - KES 300,000';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 5250 - Client not found';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5250 - Already exists';
    END IF;
    
    -- ========================================================================
    -- LOAN 5224: Nicholas Ndiringu - ACTIVE - KES 300,000 (with penalty)
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5224') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '21118809';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_business_loan_id, '5224',
                300000.00, 7.5, 6, 'months', 'monthly',
                322500.00, 345000.00, 0.00,
                '2026-01-07'::timestamp, '2026-01-07'::timestamp, '2026-07-07'::date,
                5, 'active', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5224 - Nicholas Ndiringu - KES 300,000';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 5224 - Client not found';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5224 - Already exists';
    END IF;
    
    -- ========================================================================
    -- LOAN 5110: James Mbua - ACTIVE - KES 50,000 (partially paid)
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5110') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '21011116';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '5110',
                50000.00, 7.5, 3, 'months', 'monthly',
                53750.00, 28750.00, 25000.00,
                '2025-12-27'::timestamp, '2025-12-27'::timestamp, '2026-03-27'::date,
                5, 'active', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5110 - James Mbua - KES 50,000';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 5110 - Client not found';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5110 - Already exists';
    END IF;
    
    -- ========================================================================
    -- LOAN 5054: Absoley Mwangangi - SETTLED - KES 100,000
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5054') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '23260708';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '5054',
                100000.00, 10.0, 3, 'months', 'monthly',
                110000.00, 0.00, 110000.00,
                '2025-12-23'::timestamp, '2025-12-23'::timestamp, '2026-03-23'::date,
                5, 'settled', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5054 - Absoley - KES 100,000 (SETTLED)';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 5054 - Client not found';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5054 - Already exists';
    END IF;
    
    -- ========================================================================
    -- LOAN 5052: Benson Njoroge - DEFAULT - KES 20,000
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5052') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '20914564';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '5052',
                20000.00, 10.0, 3, 'months', 'monthly',
                22000.00, 22000.00, 0.00,
                '2025-12-23'::timestamp, '2025-12-23'::timestamp, '2026-03-23'::date,
                5, 'default', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5052 - Benson Njoroge - KES 20,000 (DEFAULT)';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 5052 - Client not found';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5052 - Already exists';
    END IF;
    
    -- ========================================================================
    -- LOAN 5044: Stephen Mulu Nzivu - DEFAULT - KES 200,000
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5044') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '11376836';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '5044',
                200000.00, 10.0, 3, 'months', 'monthly',
                220000.00, 220000.00, 0.00,
                '2025-12-23'::timestamp, '2025-12-23'::timestamp, '2026-03-23'::date,
                5, 'default', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5044 - Stephen Nzivu - KES 200,000 (DEFAULT)';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 5044 - Client not found (may be in first 22)';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5044 - Already exists';
    END IF;
    
    -- ========================================================================
    -- LOAN 5035: Ben Mbuvi - DEFAULT - KES 50,000
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5035') INTO v_exists;
    IF NOT v_exists THEN
        -- Try to find Ben Mbuvi in first 22 clients by name
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND name ILIKE '%Ben Mbuvi%' LIMIT 1;
        IF v_client_id IS NOT NULL THEN
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
                '2025-12-22'::timestamp, '2025-12-22'::timestamp, '2026-03-22'::date,
                5, 'default', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5035 - Ben Mbuvi - KES 50,000 (DEFAULT)';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 5035 - Client "Ben Mbuvi" not found';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5035 - Already exists';
    END IF;
    
    -- ========================================================================
    -- LOAN 5021: Ben Mbuvi - DEFAULT - KES 50,000
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5021') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND name ILIKE '%Ben Mbuvi%' LIMIT 1;
        IF v_client_id IS NOT NULL THEN
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
                '2025-12-19'::timestamp, '2025-12-19'::timestamp, '2026-03-19'::date,
                5, 'default', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5021 - Ben Mbuvi - KES 50,000 (DEFAULT)';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 5021 - Client not found';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5021 - Already exists';
    END IF;
    
    -- ========================================================================
    -- LOAN 4926: BILLY BOSTON - ACTIVE - KES 200,000 (partially paid)
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '4926') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '24080458';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '4926',
                200000.00, 7.5, 3, 'months', 'monthly',
                215000.00, 143300.00, 71700.00,
                '2025-12-05'::timestamp, '2025-12-05'::timestamp, '2026-03-05'::date,
                5, 'active', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 4926 - BILLY BOSTON - KES 200,000';
        ELSE
            RAISE NOTICE '⚠️  SKIPPED Loan 4926 - Client not found';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 4926 - Already exists';
    END IF;
    
    -- ========================================================================
    -- REMAINING SETTLED LOANS (from first 22 clients)
    -- ========================================================================
    -- These clients should already exist in the first 22
    
    -- LOAN 5002: Eric Muthama - SETTLED
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '5002') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '25265113';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '5002',
                150000.00, 10.0, 3, 'months', 'monthly',
                165000.00, 0.00, 165000.00,
                '2025-12-17'::timestamp, '2025-12-17'::timestamp, '2026-03-17'::date,
                5, 'settled', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 5002 - Eric Muthama - KES 150,000 (SETTLED)';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 5002 - Already exists';
    END IF;
    
    -- LOAN 4928: Yusuf Olela - SETTLED
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '4928') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '12505228';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '4928',
                200000.00, 20.0, 3, 'months', 'monthly',
                240000.00, 0.00, 240000.00,
                '2025-12-05'::timestamp, '2025-12-05'::timestamp, '2026-03-05'::date,
                5, 'settled', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 4928 - Yusuf Olela - KES 200,000 (SETTLED)';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 4928 - Already exists';
    END IF;
    
    -- LOAN 4895: Kilafu Simpson - SETTLED
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '4895') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '19143787';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '4895',
                40000.00, 10.0, 3, 'months', 'monthly',
                44000.00, 0.00, 44000.00,
                '2025-10-04'::timestamp, '2025-10-04'::timestamp, '2026-01-04'::date,
                5, 'settled', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 4895 - Kilafu Simpson - KES 40,000 (SETTLED)';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 4895 - Already exists';
    END IF;
    
    -- LOAN 4878: OLIVE KAMENE - SETTLED (BUSINESS)
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '4878') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '245858793';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_business_loan_id, '4878',
                150000.00, 7.5, 6, 'months', 'monthly',
                161250.00, 0.00, 161250.00,
                '2025-09-03'::timestamp, '2025-09-03'::timestamp, '2026-03-03'::date,
                5, 'settled', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 4878 - OLIVE KAMENE - KES 150,000 (SETTLED)';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 4878 - Already exists';
    END IF;
    
    -- LOAN 4875: Stephen Mulu - SETTLED
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '4875') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '11376836';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '4875',
                100000.00, 10.0, 3, 'months', 'monthly',
                110000.00, 0.00, 110000.00,
                '2026-01-03'::timestamp, '2026-01-03'::timestamp, '2026-04-03'::date,
                5, 'settled', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 4875 - Stephen Mulu - KES 100,000 (SETTLED)';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 4875 - Already exists';
    END IF;
    
    -- LOAN 4869: George Munyau - SETTLED
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '4869') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '22195033';
        IF v_client_id IS NOT NULL THEN
            INSERT INTO loans (
                organization_id, client_id, product_id, loan_number,
                amount, interest_rate, term_period, term_period_unit, repayment_frequency,
                total_amount, balance, amount_paid,
                disbursement_date, application_date, maturity_date,
                phase, status, created_at, updated_at
            ) VALUES (
                v_org_id, v_client_id, v_personal_loan_id, '4869',
                50000.00, 30.0, 3, 'months', 'monthly',
                65000.00, 0.00, 65000.00,
                '2026-01-02'::timestamp, '2026-01-02'::timestamp, '2026-04-02'::date,
                5, 'settled', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 4869 - George Munyau - KES 50,000 (SETTLED)';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 4869 - Already exists';
    END IF;
    
    -- LOAN 4867: Stephen Mulu - SETTLED
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '4867') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '11376836';
        IF v_client_id IS NOT NULL THEN
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
            );
            RAISE NOTICE '✅ Loan 4867 - Stephen Mulu - KES 50,000 (SETTLED)';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 4867 - Already exists';
    END IF;
    
    -- LOAN 4866: Ben Mbuvi - SETTLED
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '4866') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND name ILIKE '%Ben Mbuvi%' LIMIT 1;
        IF v_client_id IS NOT NULL THEN
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
            );
            RAISE NOTICE '✅ Loan 4866 - Ben Mbuvi - KES 50,000 (SETTLED)';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 4866 - Already exists';
    END IF;
    
    -- LOAN 4865: ROONEY MBANI - SETTLED
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '4865') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND name ILIKE '%ROONEY MBANI%' LIMIT 1;
        IF v_client_id IS NOT NULL THEN
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
            );
            RAISE NOTICE '✅ Loan 4865 - ROONEY MBANI - KES 50,000 (SETTLED)';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 4865 - Already exists';
    END IF;
    
    -- LOAN 4864: Eric Muthama - SETTLED
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '4864') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '25265113';
        IF v_client_id IS NOT NULL THEN
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
                '2025-12-06'::timestamp, '2025-12-06'::timestamp, '2026-03-06'::date,
                5, 'settled', NOW(), NOW()
            );
            RAISE NOTICE '✅ Loan 4864 - Eric Muthama - KES 100,000 (SETTLED)';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 4864 - Already exists';
    END IF;
    
    -- LOAN 4863: ELIZABETH WAWERU - SETTLED
    SELECT EXISTS(SELECT 1 FROM loans WHERE organization_id = v_org_id AND loan_number = '4863') INTO v_exists;
    IF NOT v_exists THEN
        SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '22000875';
        IF v_client_id IS NOT NULL THEN
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
            );
            RAISE NOTICE '✅ Loan 4863 - ELIZABETH WAWERU - KES 100,000 (SETTLED)';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED Loan 4863 - Already exists';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Loan insertion complete (with duplicate prevention)';
    RAISE NOTICE '============================================================';
    
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Summary by status
SELECT 
    '📊 LOANS BY STATUS' as info,
    status,
    COUNT(*) as count,
    SUM(amount)::numeric as total_principal,
    SUM(balance)::numeric as total_outstanding
FROM loans
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
GROUP BY status
ORDER BY status;

-- Overall totals
SELECT 
    '🎯 OVERALL PORTFOLIO' as info,
    COUNT(*) as total_loans,
    SUM(amount)::numeric as total_disbursed,
    SUM(balance)::numeric as total_outstanding,
    SUM(amount_paid)::numeric as total_collected
FROM loans
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');
