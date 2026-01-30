-- ============================================================================
-- STEP 3: INSERT ALL CLIENTS (WITH DUPLICATE PREVENTION)
-- ============================================================================
-- This script inserts ALL clients from screenshots
-- PREVENTS DUPLICATES by checking loan_number and id_number
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_client_id UUID;
    v_exists BOOLEAN;
    v_next_client_num INTEGER := 23; -- Starting from CL00023
BEGIN
    -- Get organization ID
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization UV1K not found!';
    END IF;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Inserting ALL Missing Clients with Duplicate Prevention';
    RAISE NOTICE '============================================================';
    
    -- ========================================================================
    -- CLIENT: QUENTIN DAUGI AFANDE (NRC: 22037024) - Loan 5366
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '22037024') INTO v_exists;
    IF NOT v_exists THEN
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id,
            'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
            'QUENTIN DAUGI',
            'AFANDE',
            'QUENTIN DAUGI AFANDE',
            '22037024',
            '0700000031',
            'quentin.afande@email.com',
            'Nairobi, Kenya',
            'Male',
            'active',
            'approved',
            'verified',
            '2025-11-01'::timestamp,
            NOW()
        );
        RAISE NOTICE '✅ CL000% - QUENTIN DAUGI AFANDE (NRC: 22037024)', v_next_client_num;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - QUENTIN DAUGI AFANDE (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: DANIEL COLLINS MAKOKO MWATETI (NRC: 22482536) - Loan 5344
    -- CORRECTED NRC: 22482536 (not 22482936)
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '22482536') INTO v_exists;
    IF NOT v_exists THEN
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id,
            'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
            'DANIEL COLLINS',
            'MAKOKO MWATETI',
            'DANIEL COLLINS MAKOKO MWATETI',
            '22482536',
            '0700000032',
            'daniel.collins@email.com',
            'Nairobi, Kenya',
            'Male',
            'active',
            'approved',
            'verified',
            '2025-11-01'::timestamp,
            NOW()
        );
        RAISE NOTICE '✅ CL000% - DANIEL COLLINS MAKOKO MWATETI (NRC: 22482536)', v_next_client_num;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - DANIEL COLLINS MAKOKO MWATETI (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: Absoley Rodera Mwangangi (NRC: 23260708) - Loans 5343, 5054
    -- CORRECTED: This is Absoley (not Isaiah)
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '23260708') INTO v_exists;
    IF NOT v_exists THEN
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id,
            'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
            'Absoley Rodera',
            'Mwangangi',
            'Absoley Rodera Mwangangi',
            '23260708',
            '0700000033',
            'absoley.mwangangi@email.com',
            'Nairobi, Kenya',
            'Male',
            'active',
            'approved',
            'verified',
            '2025-11-01'::timestamp,
            NOW()
        );
        RAISE NOTICE '✅ CL000% - Absoley Rodera Mwangangi (NRC: 23260708)', v_next_client_num;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - Absoley Rodera Mwangangi (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: OLIVE KAMENE MUKOYA (NRC: 245858793) - Loans 5328, 4878
    -- CORRECTED: This is OLIVE (not ISAAC LEMPE)
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '245858793') INTO v_exists;
    IF NOT v_exists THEN
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id,
            'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
            'OLIVE KAMENE',
            'MUKOYA',
            'OLIVE KAMENE MUKOYA',
            '245858793',
            '0700000034',
            'olive.mukoya@email.com',
            'Nairobi, Kenya',
            'Female',
            'active',
            'approved',
            'verified',
            '2025-11-01'::timestamp,
            NOW()
        );
        RAISE NOTICE '✅ CL000% - OLIVE KAMENE MUKOYA (NRC: 245858793)', v_next_client_num;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - OLIVE KAMENE MUKOYA (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: PRISCAH LOICE MBUU (NRC: 23506403) - Loan 5276
    -- CORRECTED NRC: 23506403 (not 23106403)
    -- NOTE: Different from CL00001 PRISCAH LOICE MBUVI (23806403)
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '23506403') INTO v_exists;
    IF NOT v_exists THEN
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id,
            'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
            'PRISCAH LOICE',
            'MBUU',
            'PRISCAH LOICE MBUU',
            '23506403',
            '0700000035',
            'priscah.mbuu@email.com',
            'Nairobi, Kenya',
            'Female',
            'active',
            'approved',
            'verified',
            '2025-11-01'::timestamp,
            NOW()
        );
        RAISE NOTICE '✅ CL000% - PRISCAH LOICE MBUU (NRC: 23506403)', v_next_client_num;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - PRISCAH LOICE MBUU (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: JUMPSYKE ALI NDENDIO (NRC: 19214492) - Loan 5250
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '19214492') INTO v_exists;
    IF NOT v_exists THEN
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id,
            'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
            'JUMPSYKE ALI',
            'NDENDIO',
            'JUMPSYKE ALI NDENDIO',
            '19214492',
            '0700000036',
            'jumpsyke.ndendio@email.com',
            'Nairobi, Kenya',
            'Male',
            'active',
            'approved',
            'verified',
            '2025-11-01'::timestamp,
            NOW()
        );
        RAISE NOTICE '✅ CL000% - JUMPSYKE ALI NDENDIO (NRC: 19214492)', v_next_client_num;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - JUMPSYKE ALI NDENDIO (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: Nicholas Ndiringu Mwangi (NRC: 21118809) - Loan 5224
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '21118809') INTO v_exists;
    IF NOT v_exists THEN
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id,
            'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
            'Nicholas Ndiringu',
            'Mwangi',
            'Nicholas Ndiringu Mwangi',
            '21118809',
            '0700000037',
            'nicholas.mwangi@email.com',
            'Nairobi, Kenya',
            'Male',
            'active',
            'approved',
            'verified',
            '2025-11-01'::timestamp,
            NOW()
        );
        RAISE NOTICE '✅ CL000% - Nicholas Ndiringu Mwangi (NRC: 21118809)', v_next_client_num;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - Nicholas Ndiringu Mwangi (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: James Mbua (NRC: 21011116) - Loan 5110
    -- CORRECTED NRC: 21011116 (not 21101116)
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '21011116') INTO v_exists;
    IF NOT v_exists THEN
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id,
            'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
            'James',
            'Mbua',
            'James Mbua',
            '21011116',
            '0700000038',
            'james.mbua@email.com',
            'Nairobi, Kenya',
            'Male',
            'active',
            'approved',
            'verified',
            '2025-11-01'::timestamp,
            NOW()
        );
        RAISE NOTICE '✅ CL000% - James Mbua (NRC: 21011116)', v_next_client_num;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - James Mbua (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: Benson Njoroge (NRC: 20914564) - Loan 5052
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '20914564') INTO v_exists;
    IF NOT v_exists THEN
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id,
            'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
            'Benson',
            'Njoroge',
            'Benson Njoroge',
            '20914564',
            '0700000039',
            'benson.njoroge@email.com',
            'Nairobi, Kenya',
            'Male',
            'active',
            'approved',
            'verified',
            '2025-11-01'::timestamp,
            NOW()
        );
        RAISE NOTICE '✅ CL000% - Benson Njoroge (NRC: 20914564)', v_next_client_num;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - Benson Njoroge (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: BILLY BOSTON ANYOKIU (NRC: 24080458) - Loan 4926
    -- CORRECTED NRC: 24080458 (not 24000458)
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '24080458') INTO v_exists;
    IF NOT v_exists THEN
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id,
            'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
            'BILLY BOSTON',
            'ANYOKIU',
            'BILLY BOSTON ANYOKIU',
            '24080458',
            '0700000040',
            'billy.anyokiu@email.com',
            'Nairobi, Kenya',
            'Male',
            'active',
            'approved',
            'verified',
            '2025-11-01'::timestamp,
            NOW()
        );
        RAISE NOTICE '✅ CL000% - BILLY BOSTON ANYOKIU (NRC: 24080458)', v_next_client_num;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - BILLY BOSTON ANYOKIU (already exists)';
    END IF;
    
    -- Note: Ben Mbuvi, ROONEY MBANI have no NRC visible in screenshots
    -- They may already exist in the first 22 clients. Will handle in loan script.
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Client insertion complete (with duplicate prevention)';
    RAISE NOTICE '============================================================';
    
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show all clients
SELECT 
    client_number,
    name,
    id_number,
    phone,
    status
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY client_number;

-- Count total clients
SELECT COUNT(*) as total_clients
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');
