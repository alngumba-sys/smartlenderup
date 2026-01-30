-- ============================================================================
-- INSERT CLIENTS - FIXED VERSION
-- ============================================================================
-- This version adapts to your actual table structure
-- Common column name variations:
-- - client_id OR borrower_id OR id
-- - full_name OR name OR client_name
-- - id_number OR nrc_number OR national_id
-- ============================================================================

-- First, let's check what your table looks like
SELECT column_name FROM information_schema.columns WHERE table_name = 'clients' ORDER BY ordinal_position;

-- ============================================================================
-- VERSION 1: Using common column names (most likely)
-- ============================================================================
-- Assuming columns: id, organization_id, name, national_id, phone, email, status
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
BEGIN
    -- Get organization ID
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization UV1K not found!';
    END IF;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Inserting 22 clients for BV Funguo Ltd';
    RAISE NOTICE '============================================================';
    
    -- Client 1: PRISCAH LOICE MBUVI
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'PRISCAH LOICE MBUVI',
        '23806403',
        '0720817837',
        'rosemutdava@gmail.com',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 1 - PRISCAH LOICE MBUVI';
    
    -- Client 2: DANIEL COLLINS MAKOKO MWATETI
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'DANIEL COLLINS MAKOKO MWATETI',
        '22482535',
        '0710539049',
        'collinsmakoko@gmail.com',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 2 - DANIEL COLLINS MAKOKO MWATETI';
    
    -- Client 3: Ben Mbuvi
    INSERT INTO clients (
        organization_id, name, national_id, phone, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'Ben Mbuvi',
        '11111118',
        '0722798702',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 3 - Ben Mbuvi';
    
    -- Client 4: George Munyau Kawaya
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'George Munyau Kawaya',
        '22195033',
        '0768374146',
        'KAWIRE73@GMAIL.COM',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 4 - George Munyau Kawaya';
    
    -- Client 5: Yusuf Olela Omanya
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'Yusuf Olela Omanya',
        '12508228',
        '+233501631240',
        'yolela@yahoo.com',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 5 - Yusuf Olela Omanya';
    
    -- Client 6: Kifalu Samson Masha
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'Kifalu Samson Masha',
        '13143767',
        '+233540123785',
        'kifalumasha@gmail.com',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 6 - Kifalu Samson Masha';
    
    -- Client 7: BILLY BOSTON ANYONYI
    INSERT INTO clients (
        organization_id, name, national_id, phone, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'BILLY BOSTON ANYONYI',
        '24090458',
        '+254728925856',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 7 - BILLY BOSTON ANYONYI';
    
    -- Client 8: Geofrey Rogiers Mwandango
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'Geofrey Rogiers Mwandango',
        '23260758',
        '+254724046842',
        'qkilambae@gmail.com',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 8 - Geofrey Rogiers Mwandango';
    
    -- Client 9: Benson Njoronge
    INSERT INTO clients (
        organization_id, name, national_id, phone, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'Benson Njoronge',
        '20314554',
        '0720244502',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 9 - Benson Njoronge';
    
    -- Client 10: James Mbuvi
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'James Mbuvi',
        '21019115',
        '+254720300338',
        'mbuvi.felix@yahoo.com',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 10 - James Mbuvi';
    
    -- Client 11: Nicholas Ndinagu Mwangi
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'Nicholas Ndinagu Mwangi',
        '23118869',
        '+254721112397',
        'qttimwa@gmail.com',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 11 - Nicholas Ndinagu Mwangi';
    
    -- Client 12: JUWERYIYA ALI MUHAMMAD
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'JUWERYIYA ALI MUHAMMAD',
        '13214492',
        '0724442409',
        'JATMAYANJA@YAHOO.COM',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 12 - JUWERYIYA ALI MUHAMMAD';
    
    -- Client 13: James Collins
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'James Collins',
        '11111111',
        '072456544',
        'james.colllins@gmail.com',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 13 - James Collins';
    
    -- Client 14: Stephen Mulu Nzavi
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'Stephen Mulu Nzavi',
        '11376836',
        '+254721881725',
        'mulunzavi@gmail.com',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 14 - Stephen Mulu Nzavi';
    
    -- Client 15: OLIVE KAMENE NDEVENI
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'OLIVE KAMENE NDEVENI',
        '245858793',
        '0728330108',
        'olivetina@gmail.com',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 15 - OLIVE KAMENE NDEVENI';
    
    -- Client 16: Josphat Matheka
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'Josphat Matheka',
        '11111112',
        '0724514868',
        'josphat.matheka@gmail.com',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 16 - Josphat Matheka';
    
    -- Client 17: NATALIA THOMAS
    INSERT INTO clients (
        organization_id, name, national_id, phone, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'NATALIA THOMAS',
        '11111113',
        '0714239823',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 17 - NATALIA THOMAS';
    
    -- Client 18: Saumu Ouma
    INSERT INTO clients (
        organization_id, name, national_id, phone, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'Saumu Ouma',
        '37109668',
        '0739584652',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 18 - Saumu Ouma';
    
    -- Client 19: SEBASTIAN PETER
    INSERT INTO clients (
        organization_id, name, national_id, phone, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'SEBASTIAN PETER',
        '25225003',
        '0726707944',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 19 - SEBASTIAN PETER';
    
    -- Client 20: ELIZABETH WAWERU
    INSERT INTO clients (
        organization_id, name, national_id, phone, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'ELIZABETH WAWERU',
        '22000875',
        '0718754331',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 20 - ELIZABETH WAWERU';
    
    -- Client 21: Eric Muthama
    INSERT INTO clients (
        organization_id, name, national_id, phone, email, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'Eric Muthama',
        '25267113',
        '0727268009',
        'emuthama4@gmail.com',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 21 - Eric Muthama';
    
    -- Client 22: ROONEY MBANI
    INSERT INTO clients (
        organization_id, name, national_id, phone, status, created_at, updated_at
    ) VALUES (
        v_org_id,
        'ROONEY MBANI',
        '11111115',
        '0725481920',
        'active',
        NOW(),
        NOW()
    );
    RAISE NOTICE '✅ Client 22 - ROONEY MBANI';
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Successfully inserted 22 clients!';
    RAISE NOTICE '============================================================';
    
END $$;

-- Verify the inserted clients
SELECT 
    '📋 VERIFICATION - All Clients' as info,
    id,
    name,
    national_id as nrc_number,
    phone,
    email,
    status
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY created_at DESC
LIMIT 25;
