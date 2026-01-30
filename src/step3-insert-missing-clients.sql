-- ============================================================================
-- STEP 3: INSERT MISSING CLIENTS FOR ACTIVE LOANS
-- ============================================================================
-- These clients have active loans but weren't in the original 22
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_client_id UUID;
BEGIN
    -- Get organization ID
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization UV1K not found!';
    END IF;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Inserting Missing Clients for Active Loans';
    RAISE NOTICE '============================================================';
    
    -- ========================================================================
    -- QUENTIN DAVID AFANDE - NRC: 22332045
    -- ========================================================================
    INSERT INTO clients (
        organization_id, client_number, name, first_name, last_name,
        id_number, phone, email, gender, address, status,
        created_at, updated_at
    ) VALUES (
        v_org_id, 'CL00023', 'QUENTIN DAVID AFANDE', 'QUENTIN DAVID', 'AFANDE',
        '22332045', '0700000023', 'quentin.afande@email.com', 'male',
        'Nairobi', 'active', NOW(), NOW()
    ) RETURNING id INTO v_client_id;
    RAISE NOTICE '✅ CL00023 - QUENTIN DAVID AFANDE';
    
    -- ========================================================================
    -- MAURICE LENS MAKOKI MWATETI - NRC: 242829535
    -- ========================================================================
    INSERT INTO clients (
        organization_id, client_number, name, first_name, last_name,
        id_number, phone, email, gender, address, status,
        created_at, updated_at
    ) VALUES (
        v_org_id, 'CL00024', 'MAURICE LENS MAKOKI MWATETI', 'MAURICE LENS', 'MAKOKI MWATETI',
        '242829535', '0700000024', 'maurice.makoki@email.com', 'male',
        'Nairobi', 'active', NOW(), NOW()
    ) RETURNING id INTO v_client_id;
    RAISE NOTICE '✅ CL00024 - MAURICE LENS MAKOKI MWATETI';
    
    -- ========================================================================
    -- AJAWEYIYA ALI ADAN - NRC: 1301482
    -- ========================================================================
    INSERT INTO clients (
        organization_id, client_number, name, first_name, last_name,
        id_number, phone, email, gender, address, status,
        created_at, updated_at
    ) VALUES (
        v_org_id, 'CL00025', 'AJAWEYIYA ALI ADAN', 'AJAWEYIYA ALI', 'ADAN',
        '1301482', '0700000025', 'ajaweyiya.adan@email.com', 'male',
        'Nairobi', 'active', NOW(), NOW()
    ) RETURNING id INTO v_client_id;
    RAISE NOTICE '✅ CL00025 - AJAWEYIYA ALI ADAN';
    
    -- ========================================================================
    -- Nicholas Ndegwa Chege - NRC: 23118863
    -- ========================================================================
    INSERT INTO clients (
        organization_id, client_number, name, first_name, last_name,
        id_number, phone, email, gender, address, status,
        created_at, updated_at
    ) VALUES (
        v_org_id, 'CL00026', 'Nicholas Ndegwa Chege', 'Nicholas Ndegwa', 'Chege',
        '23118863', '0700000026', 'nicholas.chege@email.com', 'male',
        'Nairobi', 'active', NOW(), NOW()
    ) RETURNING id INTO v_client_id;
    RAISE NOTICE '✅ CL00026 - Nicholas Ndegwa Chege';
    
    -- ========================================================================
    -- James Mbuvi - NRC: 2130115
    -- ========================================================================
    INSERT INTO clients (
        organization_id, client_number, name, first_name, last_name,
        id_number, phone, email, gender, address, status,
        created_at, updated_at
    ) VALUES (
        v_org_id, 'CL00027', 'James Mbuvi', 'James', 'Mbuvi',
        '2130115', '0700000027', 'james.mbuvi@email.com', 'male',
        'Nairobi', 'active', NOW(), NOW()
    ) RETURNING id INTO v_client_id;
    RAISE NOTICE '✅ CL00027 - James Mbuvi';
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Successfully inserted 5 new clients! (CL00023-CL00027)';
    RAISE NOTICE '============================================================';
    
END $$;

-- Verify new clients
SELECT 
    client_number,
    name,
    id_number,
    phone
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
AND client_number IN ('CL00023', 'CL00024', 'CL00025', 'CL00026', 'CL00027')
ORDER BY client_number;
