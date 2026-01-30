-- ============================================================================
-- STEP 3: INSERT 8 NEW CLIENTS (for active loans)
-- ============================================================================
-- These clients have active loans with outstanding balances
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_client_id UUID;
    v_next_client_num INTEGER := 23; -- Starting from CL00023
BEGIN
    -- Get organization ID
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization UV1K not found!';
    END IF;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Inserting 8 New Clients (CL00023 - CL00030)';
    RAISE NOTICE '============================================================';
    
    -- ========================================================================
    -- CLIENT 1: DANIEL COLLINS MAKOKO MWATETI (NRC: 22482936)
    -- ========================================================================
    INSERT INTO clients (
        organization_id, client_number, first_name, last_name, name,
        id_number, phone, email, address, date_of_birth, gender,
        status, kyc_status, verification_status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
        'DANIEL COLLINS',
        'MAKOKO MWATETI',
        'DANIEL COLLINS MAKOKO MWATETI',
        '22482936',
        '0700000023',
        'daniel.collins@email.com',
        'Nairobi, Kenya',
        '1980-01-01',
        'Male',
        'active',
        'approved',
        'verified',
        '2025-12-01'::timestamp,
        NOW()
    ) RETURNING id INTO v_client_id;
    RAISE NOTICE '✅ CL00023 - DANIEL COLLINS MAKOKO MWATETI (NRC: 22482936)';
    v_next_client_num := v_next_client_num + 1;
    
    -- ========================================================================
    -- CLIENT 2: Isaiah Mwangangi (NRC: 22220758)
    -- ========================================================================
    INSERT INTO clients (
        organization_id, client_number, first_name, last_name, name,
        id_number, phone, email, address, date_of_birth, gender,
        status, kyc_status, verification_status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
        'Isaiah',
        'Mwangangi',
        'Isaiah Mwangangi',
        '22220758',
        '0700000024',
        'isaiah.mwangangi@email.com',
        'Nairobi, Kenya',
        '1980-01-01',
        'Male',
        'active',
        'approved',
        'verified',
        '2025-12-01'::timestamp,
        NOW()
    ) RETURNING id INTO v_client_id;
    RAISE NOTICE '✅ CL00024 - Isaiah Mwangangi (NRC: 22220758)';
    v_next_client_num := v_next_client_num + 1;
    
    -- ========================================================================
    -- CLIENT 3: ISAAC LEMPE Kwani (NRC: 245686793)
    -- ========================================================================
    INSERT INTO clients (
        organization_id, client_number, first_name, last_name, name,
        id_number, phone, email, address, date_of_birth, gender,
        status, kyc_status, verification_status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
        'ISAAC LEMPE',
        'Kwani',
        'ISAAC LEMPE Kwani',
        '245686793',
        '0700000025',
        'isaac.kwani@email.com',
        'Nairobi, Kenya',
        '1980-01-01',
        'Male',
        'active',
        'approved',
        'verified',
        '2025-12-01'::timestamp,
        NOW()
    ) RETURNING id INTO v_client_id;
    RAISE NOTICE '✅ CL00025 - ISAAC LEMPE Kwani (NRC: 245686793)';
    v_next_client_num := v_next_client_num + 1;
    
    -- ========================================================================
    -- CLIENT 4: DRISCAH LOICE MBUU (NRC: 23106403)
    -- ========================================================================
    INSERT INTO clients (
        organization_id, client_number, first_name, last_name, name,
        id_number, phone, email, address, date_of_birth, gender,
        status, kyc_status, verification_status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
        'DRISCAH LOICE',
        'MBUU',
        'DRISCAH LOICE MBUU',
        '23106403',
        '0700000026',
        'driscah.mbuu@email.com',
        'Nairobi, Kenya',
        '1980-01-01',
        'Female',
        'active',
        'approved',
        'verified',
        '2025-12-01'::timestamp,
        NOW()
    ) RETURNING id INTO v_client_id;
    RAISE NOTICE '✅ CL00026 - DRISCAH LOICE MBUU (NRC: 23106403)';
    v_next_client_num := v_next_client_num + 1;
    
    -- ========================================================================
    -- CLIENT 5: JUMPSYKE ALI NDENDIO (NRC: 19214492)
    -- ========================================================================
    INSERT INTO clients (
        organization_id, client_number, first_name, last_name, name,
        id_number, phone, email, address, date_of_birth, gender,
        status, kyc_status, verification_status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
        'JUMPSYKE ALI',
        'NDENDIO',
        'JUMPSYKE ALI NDENDIO',
        '19214492',
        '0700000027',
        'jumpsyke.ndendio@email.com',
        'Nairobi, Kenya',
        '1980-01-01',
        'Male',
        'active',
        'approved',
        'verified',
        '2025-12-01'::timestamp,
        NOW()
    ) RETURNING id INTO v_client_id;
    RAISE NOTICE '✅ CL00027 - JUMPSYKE ALI NDENDIO (NRC: 19214492)';
    v_next_client_num := v_next_client_num + 1;
    
    -- ========================================================================
    -- CLIENT 6: Nicholas Ndiringu Mwangi (NRC: 21118809)
    -- ========================================================================
    INSERT INTO clients (
        organization_id, client_number, first_name, last_name, name,
        id_number, phone, email, address, date_of_birth, gender,
        status, kyc_status, verification_status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
        'Nicholas Ndiringu',
        'Mwangi',
        'Nicholas Ndiringu Mwangi',
        '21118809',
        '0700000028',
        'nicholas.mwangi@email.com',
        'Nairobi, Kenya',
        '1980-01-01',
        'Male',
        'active',
        'approved',
        'verified',
        '2025-12-01'::timestamp,
        NOW()
    ) RETURNING id INTO v_client_id;
    RAISE NOTICE '✅ CL00028 - Nicholas Ndiringu Mwangi (NRC: 21118809)';
    v_next_client_num := v_next_client_num + 1;
    
    -- ========================================================================
    -- CLIENT 7: James Mbua (NRC: 21101116)
    -- ========================================================================
    INSERT INTO clients (
        organization_id, client_number, first_name, last_name, name,
        id_number, phone, email, address, date_of_birth, gender,
        status, kyc_status, verification_status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
        'James',
        'Mbua',
        'James Mbua',
        '21101116',
        '0700000029',
        'james.mbua@email.com',
        'Nairobi, Kenya',
        '1980-01-01',
        'Male',
        'active',
        'approved',
        'verified',
        '2025-12-01'::timestamp,
        NOW()
    ) RETURNING id INTO v_client_id;
    RAISE NOTICE '✅ CL00029 - James Mbua (NRC: 21101116)';
    v_next_client_num := v_next_client_num + 1;
    
    -- ========================================================================
    -- CLIENT 8: BILLY BOSTON ANYOKIU (NRC: 24000458)
    -- ========================================================================
    INSERT INTO clients (
        organization_id, client_number, first_name, last_name, name,
        id_number, phone, email, address, date_of_birth, gender,
        status, kyc_status, verification_status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL' || LPAD(v_next_client_num::TEXT, 5, '0'),
        'BILLY BOSTON',
        'ANYOKIU',
        'BILLY BOSTON ANYOKIU',
        '24000458',
        '0700000030',
        'billy.anyokiu@email.com',
        'Nairobi, Kenya',
        '1980-01-01',
        'Male',
        'active',
        'approved',
        'verified',
        '2025-12-01'::timestamp,
        NOW()
    ) RETURNING id INTO v_client_id;
    RAISE NOTICE '✅ CL00030 - BILLY BOSTON ANYOKIU (NRC: 24000458)';
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Successfully inserted 8 new clients!';
    RAISE NOTICE 'Total clients now: 30 (22 existing + 8 new)';
    RAISE NOTICE '============================================================';
    
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show newly inserted clients
SELECT 
    client_number,
    name,
    id_number,
    phone,
    status
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
AND client_number >= 'CL00023'
ORDER BY client_number;

-- Count total clients
SELECT COUNT(*) as total_clients
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');
