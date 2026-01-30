-- ============================================================================
-- INSERT CLIENTS - BATCH 1 (22 Clients from Screenshots)
-- ============================================================================
-- Client ID Format: CL00001, CL00002, etc.
-- NRC number = Client ID number (national ID)
-- ============================================================================

-- Get organization ID for BV Funguo Ltd
DO $$
DECLARE
    v_org_id UUID;
    v_client_id TEXT;
    v_counter INT := 1;
BEGIN
    -- Get organization ID
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization UV1K not found!';
    END IF;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Inserting 22 clients for BV Funguo Ltd';
    RAISE NOTICE '============================================================';
    
    -- ========================================================================
    -- SCREENSHOT 1 - 2 Clients
    -- ========================================================================
    
    -- Client 1: PRISCAH LOICE MBUVI
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00001',
        'PRISCAH LOICE MBUVI',
        '23806403',
        '0720817837',
        'rosemutdava@gmail.com',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00001 - PRISCAH LOICE MBUVI';
    
    -- Client 2: DANIEL COLLINS MAKOKO MWATETI
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00002',
        'DANIEL COLLINS MAKOKO MWATETI',
        '22482535',
        '0710539049',
        'collinsmakoko@gmail.com',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00002 - DANIEL COLLINS MAKOKO MWATETI';
    
    -- ========================================================================
    -- SCREENSHOT 2 - 10 Clients
    -- ========================================================================
    
    -- Client 3: Ben Mbuvi
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00003',
        'Ben Mbuvi',
        '11111118',
        '0722798702',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number;
    
    RAISE NOTICE '✅ CL00003 - Ben Mbuvi';
    
    -- Client 4: George Munyau Kawaya
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00004',
        'George Munyau Kawaya',
        '22195033',
        '0768374146',
        'KAWIRE73@GMAIL.COM',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00004 - George Munyau Kawaya';
    
    -- Client 5: Yusuf Olela Omanya
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00005',
        'Yusuf Olela Omanya',
        '12508228',
        '+233501631240',
        'yolela@yahoo.com',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00005 - Yusuf Olela Omanya';
    
    -- Client 6: Kifalu Samson Masha
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00006',
        'Kifalu Samson Masha',
        '13143767',
        '+233540123785',
        'kifalumasha@gmail.com',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00006 - Kifalu Samson Masha';
    
    -- Client 7: BILLY BOSTON ANYONYI
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00007',
        'BILLY BOSTON ANYONYI',
        '24090458',
        '+254728925856',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number;
    
    RAISE NOTICE '✅ CL00007 - BILLY BOSTON ANYONYI';
    
    -- Client 8: Geofrey Rogiers Mwandango
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00008',
        'Geofrey Rogiers Mwandango',
        '23260758',
        '+254724046842',
        'qkilambae@gmail.com',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00008 - Geofrey Rogiers Mwandango';
    
    -- Client 9: Benson Njoronge
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00009',
        'Benson Njoronge',
        '20314554',
        '0720244502',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number;
    
    RAISE NOTICE '✅ CL00009 - Benson Njoronge';
    
    -- Client 10: James Mbuvi
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00010',
        'James Mbuvi',
        '21019115',
        '+254720300338',
        'mbuvi.felix@yahoo.com',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00010 - James Mbuvi';
    
    -- Client 11: Nicholas Ndinagu Mwangi
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00011',
        'Nicholas Ndinagu Mwangi',
        '23118869',
        '+254721112397',
        'qttimwa@gmail.com',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00011 - Nicholas Ndinagu Mwangi';
    
    -- Client 12: JUWERYIYA ALI MUHAMMAD
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00012',
        'JUWERYIYA ALI MUHAMMAD',
        '13214492',
        '0724442409',
        'JATMAYANJA@YAHOO.COM',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00012 - JUWERYIYA ALI MUHAMMAD';
    
    -- ========================================================================
    -- SCREENSHOT 3 - 10 Clients
    -- ========================================================================
    
    -- Client 13: James Collins
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00013',
        'James Collins',
        '11111111',
        '072456544',
        'james.colllins@gmail.com',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00013 - James Collins';
    
    -- Client 14: Stephen Mulu Nzavi
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00014',
        'Stephen Mulu Nzavi',
        '11376836',
        '+254721881725',
        'mulunzavi@gmail.com',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00014 - Stephen Mulu Nzavi';
    
    -- Client 15: OLIVE KAMENE NDEVENI
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00015',
        'OLIVE KAMENE NDEVENI',
        '245858793',
        '0728330108',
        'olivetina@gmail.com',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00015 - OLIVE KAMENE NDEVENI';
    
    -- Client 16: Josphat Matheka
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00016',
        'Josphat Matheka',
        '11111112',
        '0724514868',
        'josphat.matheka@gmail.com',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00016 - Josphat Matheka';
    
    -- Client 17: NATALIA THOMAS
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00017',
        'NATALIA THOMAS',
        '11111113',
        '0714239823',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number;
    
    RAISE NOTICE '✅ CL00017 - NATALIA THOMAS';
    
    -- Client 18: Saumu Ouma
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00018',
        'Saumu Ouma',
        '37109668',
        '0739584652',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number;
    
    RAISE NOTICE '✅ CL00018 - Saumu Ouma';
    
    -- Client 19: SEBASTIAN PETER
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00019',
        'SEBASTIAN PETER',
        '25225003',
        '0726707944',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number;
    
    RAISE NOTICE '✅ CL00019 - SEBASTIAN PETER';
    
    -- Client 20: ELIZABETH WAWERU
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00020',
        'ELIZABETH WAWERU',
        '22000875',
        '0718754331',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number;
    
    RAISE NOTICE '✅ CL00020 - ELIZABETH WAWERU';
    
    -- Client 21: Eric Muthama
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00021',
        'Eric Muthama',
        '25267113',
        '0727268009',
        'emuthama4@gmail.com',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email;
    
    RAISE NOTICE '✅ CL00021 - Eric Muthama';
    
    -- Client 22: ROONEY MBANI
    INSERT INTO clients (
        organization_id, client_id, full_name, id_number, phone_number, 
        status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'CL00022',
        'ROONEY MBANI',
        '11111115',
        '0725481920',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, client_id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        phone_number = EXCLUDED.phone_number;
    
    RAISE NOTICE '✅ CL00022 - ROONEY MBANI';
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Successfully inserted/updated 22 clients!';
    RAISE NOTICE '============================================================';
    
END $$;

-- Verify the inserted clients
SELECT 
    '📋 VERIFICATION - All 22 Clients' as info,
    client_id,
    full_name,
    id_number as nrc_number,
    phone_number,
    email,
    status
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY client_id;
