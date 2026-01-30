-- ============================================================================
-- STEP 3: INSERT ALL CLIENTS (WITH DUPLICATE PREVENTION - FIXED)
-- ============================================================================
-- This script inserts ALL clients from screenshots
-- PREVENTS DUPLICATES by checking id_number
-- DYNAMICALLY finds next available client_number
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_client_id UUID;
    v_exists BOOLEAN;
    v_next_client_num INTEGER;
    v_client_number TEXT;
BEGIN
    -- Get organization ID
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization UV1K not found!';
    END IF;
    
    -- Dynamically find the next available client number
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(client_number FROM 3) AS INTEGER)), 0
    ) + 1
    INTO v_next_client_num
    FROM clients
    WHERE organization_id = v_org_id
    AND client_number ~ '^CL[0-9]+$';
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Starting with client number: CL%', LPAD(v_next_client_num::TEXT, 5, '0');
    RAISE NOTICE '============================================================';
    
    -- ========================================================================
    -- CLIENT: QUENTIN DAUGI AFANDE (NRC: 22037024) - Loan 5366
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '22037024') INTO v_exists;
    IF NOT v_exists THEN
        v_client_number := 'CL' || LPAD(v_next_client_num::TEXT, 5, '0');
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id, v_client_number,
            'QUENTIN DAUGI', 'AFANDE', 'QUENTIN DAUGI AFANDE',
            '22037024', '0700000031', 'quentin.afande@email.com',
            'Nairobi, Kenya', 'Male',
            'active', 'approved', 'verified',
            '2025-11-01'::timestamp, NOW()
        );
        RAISE NOTICE '✅ % - QUENTIN DAUGI AFANDE (NRC: 22037024)', v_client_number;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - QUENTIN DAUGI AFANDE (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: DANIEL COLLINS MAKOKO MWATETI (NRC: 22482536) - Loan 5344
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '22482536') INTO v_exists;
    IF NOT v_exists THEN
        v_client_number := 'CL' || LPAD(v_next_client_num::TEXT, 5, '0');
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id, v_client_number,
            'DANIEL COLLINS', 'MAKOKO MWATETI', 'DANIEL COLLINS MAKOKO MWATETI',
            '22482536', '0700000032', 'daniel.collins@email.com',
            'Nairobi, Kenya', 'Male',
            'active', 'approved', 'verified',
            '2025-11-01'::timestamp, NOW()
        );
        RAISE NOTICE '✅ % - DANIEL COLLINS MAKOKO MWATETI (NRC: 22482536)', v_client_number;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - DANIEL COLLINS MAKOKO MWATETI (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: Absoley Rodera Mwangangi (NRC: 23260708) - Loans 5343, 5054
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '23260708') INTO v_exists;
    IF NOT v_exists THEN
        v_client_number := 'CL' || LPAD(v_next_client_num::TEXT, 5, '0');
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id, v_client_number,
            'Absoley Rodera', 'Mwangangi', 'Absoley Rodera Mwangangi',
            '23260708', '0700000033', 'absoley.mwangangi@email.com',
            'Nairobi, Kenya', 'Male',
            'active', 'approved', 'verified',
            '2025-11-01'::timestamp, NOW()
        );
        RAISE NOTICE '✅ % - Absoley Rodera Mwangangi (NRC: 23260708)', v_client_number;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - Absoley Rodera Mwangangi (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: OLIVE KAMENE MUKOYA (NRC: 245858793) - Loans 5328, 4878
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '245858793') INTO v_exists;
    IF NOT v_exists THEN
        v_client_number := 'CL' || LPAD(v_next_client_num::TEXT, 5, '0');
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id, v_client_number,
            'OLIVE KAMENE', 'MUKOYA', 'OLIVE KAMENE MUKOYA',
            '245858793', '0700000034', 'olive.mukoya@email.com',
            'Nairobi, Kenya', 'Female',
            'active', 'approved', 'verified',
            '2025-11-01'::timestamp, NOW()
        );
        RAISE NOTICE '✅ % - OLIVE KAMENE MUKOYA (NRC: 245858793)', v_client_number;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - OLIVE KAMENE MUKOYA (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: PRISCAH LOICE MBUU (NRC: 23506403) - Loan 5276
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '23506403') INTO v_exists;
    IF NOT v_exists THEN
        v_client_number := 'CL' || LPAD(v_next_client_num::TEXT, 5, '0');
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id, v_client_number,
            'PRISCAH LOICE', 'MBUU', 'PRISCAH LOICE MBUU',
            '23506403', '0700000035', 'priscah.mbuu@email.com',
            'Nairobi, Kenya', 'Female',
            'active', 'approved', 'verified',
            '2025-11-01'::timestamp, NOW()
        );
        RAISE NOTICE '✅ % - PRISCAH LOICE MBUU (NRC: 23506403)', v_client_number;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - PRISCAH LOICE MBUU (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: JUMPSYKE ALI NDENDIO (NRC: 19214492) - Loan 5250
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '19214492') INTO v_exists;
    IF NOT v_exists THEN
        v_client_number := 'CL' || LPAD(v_next_client_num::TEXT, 5, '0');
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id, v_client_number,
            'JUMPSYKE ALI', 'NDENDIO', 'JUMPSYKE ALI NDENDIO',
            '19214492', '0700000036', 'jumpsyke.ndendio@email.com',
            'Nairobi, Kenya', 'Male',
            'active', 'approved', 'verified',
            '2025-11-01'::timestamp, NOW()
        );
        RAISE NOTICE '✅ % - JUMPSYKE ALI NDENDIO (NRC: 19214492)', v_client_number;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - JUMPSYKE ALI NDENDIO (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: Nicholas Ndiringu Mwangi (NRC: 21118809) - Loan 5224
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '21118809') INTO v_exists;
    IF NOT v_exists THEN
        v_client_number := 'CL' || LPAD(v_next_client_num::TEXT, 5, '0');
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id, v_client_number,
            'Nicholas Ndiringu', 'Mwangi', 'Nicholas Ndiringu Mwangi',
            '21118809', '0700000037', 'nicholas.mwangi@email.com',
            'Nairobi, Kenya', 'Male',
            'active', 'approved', 'verified',
            '2025-11-01'::timestamp, NOW()
        );
        RAISE NOTICE '✅ % - Nicholas Ndiringu Mwangi (NRC: 21118809)', v_client_number;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - Nicholas Ndiringu Mwangi (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: James Mbua (NRC: 21011116) - Loan 5110
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '21011116') INTO v_exists;
    IF NOT v_exists THEN
        v_client_number := 'CL' || LPAD(v_next_client_num::TEXT, 5, '0');
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id, v_client_number,
            'James', 'Mbua', 'James Mbua',
            '21011116', '0700000038', 'james.mbua@email.com',
            'Nairobi, Kenya', 'Male',
            'active', 'approved', 'verified',
            '2025-11-01'::timestamp, NOW()
        );
        RAISE NOTICE '✅ % - James Mbua (NRC: 21011116)', v_client_number;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - James Mbua (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: Benson Njoroge (NRC: 20914564) - Loan 5052
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '20914564') INTO v_exists;
    IF NOT v_exists THEN
        v_client_number := 'CL' || LPAD(v_next_client_num::TEXT, 5, '0');
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id, v_client_number,
            'Benson', 'Njoroge', 'Benson Njoroge',
            '20914564', '0700000039', 'benson.njoroge@email.com',
            'Nairobi, Kenya', 'Male',
            'active', 'approved', 'verified',
            '2025-11-01'::timestamp, NOW()
        );
        RAISE NOTICE '✅ % - Benson Njoroge (NRC: 20914564)', v_client_number;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - Benson Njoroge (already exists)';
    END IF;
    
    -- ========================================================================
    -- CLIENT: BILLY BOSTON ANYOKIU (NRC: 24080458) - Loan 4926
    -- ========================================================================
    SELECT EXISTS(SELECT 1 FROM clients WHERE organization_id = v_org_id AND id_number = '24080458') INTO v_exists;
    IF NOT v_exists THEN
        v_client_number := 'CL' || LPAD(v_next_client_num::TEXT, 5, '0');
        INSERT INTO clients (
            organization_id, client_number, first_name, last_name, name,
            id_number, phone, email, address, gender,
            status, kyc_status, verification_status, created_at, updated_at
        ) VALUES (
            v_org_id, v_client_number,
            'BILLY BOSTON', 'ANYOKIU', 'BILLY BOSTON ANYOKIU',
            '24080458', '0700000040', 'billy.anyokiu@email.com',
            'Nairobi, Kenya', 'Male',
            'active', 'approved', 'verified',
            '2025-11-01'::timestamp, NOW()
        );
        RAISE NOTICE '✅ % - BILLY BOSTON ANYOKIU (NRC: 24080458)', v_client_number;
        v_next_client_num := v_next_client_num + 1;
    ELSE
        RAISE NOTICE '⏭️  SKIPPED - BILLY BOSTON ANYOKIU (already exists)';
    END IF;
    
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
