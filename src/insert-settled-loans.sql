-- ============================================================================
-- INSERT 18 SETTLED LOANS FOR BV FUNGUO LTD (UV1K)
-- ============================================================================
-- All settled loans from the screenshots - fully paid off
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
    RAISE NOTICE '🚀 Starting insertion of 18 settled loans';
    RAISE NOTICE '============================================================';

    -- LOAN 1: 5064 - Geoffrey Rogiers Mwandango
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '23260758';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '5064',
            100000.00, 10.0, 3, 'months', 'monthly',
            110000.00, 0.00, 110000.00,
            'settled', 5, '2026-01-22', '2026-01-22'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 5064 - Geoffrey Rogiers Mwandango';
    END IF;

    -- LOAN 2: 5002 - Eric Muthama
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '25267113';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '5002',
            150000.00, 10.0, 3, 'months', 'monthly',
            165000.00, 0.00, 165000.00,
            'settled', 5, '2026-02-17', '2026-02-17'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 5002 - Eric Muthama';
    END IF;

    -- LOAN 3: 4928 - Yusuf Olela Omanya
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '12508228';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4928',
            200000.00, 20.0, 3, 'months', 'monthly',
            240000.00, 0.00, 240000.00,
            'settled', 5, '2026-02-04', '2026-02-04'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4928 - Yusuf Olela Omanya';
    END IF;

    -- LOAN 4: 4885 - Kifalu Samson Masha
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '13143767';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4885',
            40000.00, 10.0, 3, 'months', 'monthly',
            44000.00, 0.00, 44000.00,
            'settled', 5, '2026-01-04', '2026-01-04'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4885 - Kifalu Samson Masha';
    END IF;

    -- LOAN 5: 4878 - OLIVE KAMENE NDEVENI
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '248858793';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4878',
            150000.00, 7.5, 3, 'months', 'monthly',
            161250.00, 0.00, 161250.00,
            'settled', 5, '2026-03-03', '2026-03-03'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4878 - OLIVE KAMENE NDEVENI';
    END IF;

    -- LOAN 6: 4876 - Stephen Mulu Nzavi
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '11376836';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4876',
            100000.00, 10.0, 3, 'months', 'monthly',
            110000.00, 0.00, 110000.00,
            'settled', 5, '2026-01-03', '2026-01-03'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4876 - Stephen Mulu Nzavi';
    END IF;

    -- LOAN 7: 4869 - George Munyau Kawaya
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '22195033';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4869',
            50000.00, 30.0, 3, 'months', 'monthly',
            65000.00, 0.00, 65000.00,
            'settled', 5, '2026-02-20', '2026-02-20'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4869 - George Munyau Kawaya';
    END IF;

    -- LOAN 8: 4867 - Stephen Mulu Nzavi
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '11376836';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4867',
            50000.00, 10.0, 3, 'months', 'monthly',
            55000.00, 0.00, 55000.00,
            'settled', 5, '2025-11-27', '2025-11-27'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4867 - Stephen Mulu Nzavi';
    END IF;

    -- LOAN 9: 4866 - Ben Mbuvi
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '1111116';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4866',
            50000.00, 10.0, 3, 'months', 'monthly',
            55000.00, 0.00, 55000.00,
            'settled', 5, '2025-11-28', '2025-11-28'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4866 - Ben Mbuvi';
    END IF;

    -- LOAN 10: 4865 - ROONEY MBANI
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '11111115';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4865',
            50000.00, 10.0, 3, 'months', 'monthly',
            55000.00, 0.00, 55000.00,
            'settled', 5, '2025-11-28', '2025-11-28'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4865 - ROONEY MBANI';
    END IF;

    -- LOAN 11: 4864 - Eric Muthama
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '25267113';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4864',
            100000.00, 10.0, 3, 'months', 'monthly',
            110000.00, 0.00, 110000.00,
            'settled', 5, '2025-12-06', '2025-12-06'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4864 - Eric Muthama';
    END IF;

    -- LOAN 12: 4863 - ELIZABETH WAWERU
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '22000875';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4863',
            100000.00, 10.0, 3, 'months', 'monthly',
            110000.00, 0.00, 110000.00,
            'settled', 5, '2025-12-13', '2025-12-13'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4863 - ELIZABETH WAWERU';
    END IF;

    -- LOAN 13: 4862 - SEBASTIAN PETER
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '25225003';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4862',
            75000.00, 5.0, 3, 'months', 'monthly',
            78750.00, 0.00, 78750.00,
            'settled', 5, '2025-12-10', '2025-12-10'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4862 - SEBASTIAN PETER';
    END IF;

    -- LOAN 14: 4861 - Saumu Ouma
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '37109688';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4861',
            30000.00, 10.0, 3, 'months', 'monthly',
            33000.00, 0.00, 33000.00,
            'settled', 5, '2025-12-07', '2025-12-07'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4861 - Saumu Ouma';
    END IF;

    -- LOAN 15: 4860 - NATALIA THOMAS
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '1111113';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4860',
            100000.00, 5.0, 3, 'months', 'monthly',
            105000.00, 0.00, 105000.00,
            'settled', 5, '2025-12-01', '2025-12-01'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4860 - NATALIA THOMAS';
    END IF;

    -- LOAN 16: 4859 - Josphat Matheka (First loan)
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '1111112';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4859',
            50000.00, 10.0, 3, 'months', 'monthly',
            55000.00, 0.00, 55000.00,
            'settled', 5, '2025-12-03', '2025-12-03'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4859 - Josphat Matheka';
    END IF;

    -- LOAN 17: 4858 - Josphat Matheka (Second loan)
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '1111112';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4858',
            250000.00, 10.0, 3, 'months', 'monthly',
            275000.00, 0.00, 275000.00,
            'settled', 5, '2025-11-23', '2025-11-23'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4858 - Josphat Matheka';
    END IF;

    -- LOAN 18: 4845 - Stephen Mulu Nzavi
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND id_number = '11376836';
    IF v_client_id IS NOT NULL THEN
        INSERT INTO loans (
            organization_id, client_id, product_id, loan_number,
            amount, interest_rate, term_period, term_period_unit, repayment_frequency,
            total_amount, balance, amount_paid,
            status, phase, disbursement_date, application_date
        ) VALUES (
            v_org_id, v_client_id, v_product_id, '4845',
            50000.00, 10.0, 3, 'months', 'monthly',
            55000.00, 0.00, 55000.00,
            'settled', 5, '2025-12-29', '2025-12-29'
        );
        v_loan_count := v_loan_count + 1;
        RAISE NOTICE '✅ Inserted Loan 4845 - Stephen Mulu Nzavi';
    END IF;

    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Successfully inserted % settled loans', v_loan_count;
    RAISE NOTICE '============================================================';

END $$;

-- Verify insertion
SELECT 
    '✅ VERIFICATION: All Settled Loans Inserted' as info,
    COUNT(*) as total_settled_loans
FROM loans
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
AND status = 'settled';

-- Show all settled loans with client details
SELECT 
    '📋 ALL SETTLED LOANS WITH CLIENT DETAILS' as info,
    l.loan_number,
    c.first_name || ' ' || c.last_name as client_name,
    c.id_number,
    l.amount as principal,
    l.total_amount,
    l.balance,
    l.amount_paid,
    l.status,
    l.disbursement_date
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE l.organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
AND l.status = 'settled'
ORDER BY l.loan_number DESC;
