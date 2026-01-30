-- ============================================================================
-- BULK INSERT TEST CLIENTS FOR BV FUNGUO LTD
-- ============================================================================
-- 
-- PURPOSE: Add 22 test clients to verify database structure before cleanup
-- ORGANIZATION: BV Funguo Ltd (username: UV1K)
--
-- INSTRUCTIONS:
-- 1. Run this script in Supabase SQL Editor
-- 2. All clients will be added with proper CL00001 format IDs
-- 3. Check the results in the Clients tab
-- ============================================================================

-- Get the organization ID for BV Funguo Ltd
DO $$
DECLARE
    v_org_id UUID;
    v_base_client_number INTEGER;
    v_country TEXT;
    v_currency TEXT;
BEGIN
    -- Get organization details
    SELECT id, country, currency INTO v_org_id, v_country, v_currency
    FROM organizations 
    WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization UV1K not found!';
    END IF;
    
    -- Get the current max client number to continue sequence
    SELECT COALESCE(MAX(CAST(SUBSTRING(client_number FROM 3) AS INTEGER)), 0)
    INTO v_base_client_number
    FROM clients
    WHERE organization_id = v_org_id;
    
    RAISE NOTICE 'Organization ID: %', v_org_id;
    RAISE NOTICE 'Starting client number: CL%', LPAD((v_base_client_number + 1)::TEXT, 5, '0');
    RAISE NOTICE 'Country: %, Currency: %', v_country, v_currency;
    RAISE NOTICE '';
    RAISE NOTICE 'Inserting 22 test clients...';
    RAISE NOTICE '';
    
    -- Insert all 22 clients
    -- Batch 1: First 2 clients
    INSERT INTO clients (
        id,
        organization_id,
        client_number,
        first_name,
        last_name,
        email,
        phone,
        id_number,
        gender,
        country,
        status,
        created_at
    ) VALUES
    -- Client 1: PRISCAH LOICE MBUVI
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 1)::TEXT, 5, '0'),
        'PRISCAH LOICE',
        'MBUVI',
        'rosemuldova@gmail.com',
        '0720817837',
        '23806403',
        'Female',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 2: DANIEL COLLINS MAKOKO MWATETI
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 2)::TEXT, 5, '0'),
        'DANIEL COLLINS MAKOKO',
        'MWATETI',
        'collinsmakoko@gmail.com',
        '0710539048',
        '22482535',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    
    -- Batch 2: Next 10 clients
    -- Client 3: Ben Mbuvi
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 3)::TEXT, 5, '0'),
        'Ben',
        'Mbuvi',
        NULL,
        '0722798702',
        '11111118',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 4: George Munyau Kawaya
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 4)::TEXT, 5, '0'),
        'George Munyau',
        'Kawaya',
        'KAWIRI73@GMAIL.COM',
        '0768374146',
        '22195033',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 5: Yusuf Olela Omanya
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 5)::TEXT, 5, '0'),
        'Yusuf Olela',
        'Omanya',
        'yolela@yahoo.com',
        '+23350163I240',
        '12508228',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 6: Kifalu Samson Masha
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 6)::TEXT, 5, '0'),
        'Kifalu Samson',
        'Masha',
        'kifalumasha@gmail.com',
        '+233540123785',
        '13143767',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 7: BILLY BOSTON ANYONYI
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 7)::TEXT, 5, '0'),
        'BILLY BOSTON',
        'ANYONYI',
        NULL,
        '+254728925858',
        '24090458',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 8: Geofrey Rogiers Mwandango
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 8)::TEXT, 5, '0'),
        'Geofrey Rogiers',
        'Mwandango',
        'gkliemba@gmail.com',
        '+254724046842',
        '23260758',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 9: Benson Njoronge
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 9)::TEXT, 5, '0'),
        'Benson',
        'Njoronge',
        NULL,
        '0720244502',
        '20314554',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 10: James Mbuvi
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 10)::TEXT, 5, '0'),
        'James',
        'Mbuvi',
        'mbuvi.felix@yahoo.com',
        '+254720300338',
        '21019115',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 11: Nicholas Ndiragu Mwangi
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 11)::TEXT, 5, '0'),
        'Nicholas Ndiragu',
        'Mwangi',
        'gitmwa@gmail.com',
        '+254721112397',
        '23118869',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 12: JUWERYIYA ALI MUHAMMAD
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 12)::TEXT, 5, '0'),
        'JUWERYIYA ALI',
        'MUHAMMAD',
        'JATMAYANJA@YAHOO.COM',
        '0724442409',
        '13214492',
        'Female',
        v_country,
        'Active',
        NOW()
    ),
    
    -- Batch 3: Last 10 clients
    -- Client 13: James Collins
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 13)::TEXT, 5, '0'),
        'James',
        'Collins',
        'james.collins@gmail.com',
        '072456544',
        '11111111',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 14: Stephen Mulu Nzavi
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 14)::TEXT, 5, '0'),
        'Stephen Mulu',
        'Nzavi',
        'mulunzavi@gmail.com',
        '+254721881725',
        '11378836',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 15: OLIVE KAMENE NDEVENI
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 15)::TEXT, 5, '0'),
        'OLIVE KAMENE',
        'NDEVENI',
        'olivetinda@gmail.com',
        '0728330108',
        '245858793',
        'Female',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 16: Josphat Matheka
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 16)::TEXT, 5, '0'),
        'Josphat',
        'Matheka',
        'josphat.matheka@gmail.com',
        '0724314868',
        '11111112',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 17: NATALIA THOMAS
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 17)::TEXT, 5, '0'),
        'NATALIA',
        'THOMAS',
        NULL,
        '0714239823',
        '11111113',
        'Female',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 18: Saumu Ouma
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 18)::TEXT, 5, '0'),
        'Saumu',
        'Ouma',
        NULL,
        '0739584652',
        '37109668',
        'Female',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 19: SEBASTIAN PETER
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 19)::TEXT, 5, '0'),
        'SEBASTIAN',
        'PETER',
        NULL,
        '0726707944',
        '25225003',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 20: ELIZABETH WAWERU
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 20)::TEXT, 5, '0'),
        'ELIZABETH',
        'WAWERU',
        NULL,
        '0718754331',
        '22000875',
        'Female',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 21: Eric Muthama
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 21)::TEXT, 5, '0'),
        'Eric',
        'Muthama',
        'emuthama4@gmail.com',
        '0727268009',
        '25267113',
        'Male',
        v_country,
        'Active',
        NOW()
    ),
    -- Client 22: ROONEY MBANI
    (
        gen_random_uuid(),
        v_org_id,
        'CL' || LPAD((v_base_client_number + 22)::TEXT, 5, '0'),
        'ROONEY',
        'MBANI',
        NULL,
        '0725481920',
        '11111115',
        'Male',
        v_country,
        'Active',
        NOW()
    );
    
    RAISE NOTICE '✅ Successfully inserted 22 clients!';
    RAISE NOTICE '';
    RAISE NOTICE 'Client IDs: CL% to CL%', 
        LPAD((v_base_client_number + 1)::TEXT, 5, '0'),
        LPAD((v_base_client_number + 22)::TEXT, 5, '0');
    RAISE NOTICE '';
    RAISE NOTICE '📊 Current total clients: %', (SELECT COUNT(*) FROM clients WHERE organization_id = v_org_id);
    
END $$;

-- Show the newly inserted clients
SELECT 
    client_number,
    first_name || ' ' || last_name AS full_name,
    phone,
    email,
    id_number,
    gender,
    status,
    created_at
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY client_number DESC
LIMIT 22;
