-- ============================================================================
-- INSERT 23 CLIENTS FOR BV FUNGUO LTD (UV1K) - WITH FIRST/LAST NAME SPLIT
-- ============================================================================
-- Properly splitting names into first_name and last_name
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_client_count INTEGER := 0;
BEGIN
    -- Get organization ID for BV Funguo Ltd (UV1K)
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION '❌ Organization UV1K not found!';
    END IF;

    RAISE NOTICE '============================================================';
    RAISE NOTICE '🚀 Starting insertion of 23 clients for BV Funguo Ltd';
    RAISE NOTICE '============================================================';

    -- CLIENT 1: James Collins
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00001', 'James', 'Collins', '0724566544', 'james.collins@gmail.com', '111111');
    v_client_count := v_client_count + 1;

    -- CLIENT 2: Stephen Mulu Nzavi
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00002', 'Stephen', 'Mulu Nzavi', '+254721851725', 'mulunzavi@gmail.com', '11376836');
    v_client_count := v_client_count + 1;

    -- CLIENT 3: OLIVE KAMENE NDEVENI
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00003', 'OLIVE', 'KAMENE NDEVENI', '0728330108', 'olivelindika@gmail.com', '248858793');
    v_client_count := v_client_count + 1;

    -- CLIENT 4: Josphat Matheka
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00004', 'Josphat', 'Matheka', '0724314868', 'josphat.matheka@gmail.com', '1111112');
    v_client_count := v_client_count + 1;

    -- CLIENT 5: NATALIA THOMAS
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00005', 'NATALIA', 'THOMAS', '0714219823', '', '1111113');
    v_client_count := v_client_count + 1;

    -- CLIENT 6: Saumu Ouma
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00006', 'Saumu', 'Ouma', '0799584652', '', '37109688');
    v_client_count := v_client_count + 1;

    -- CLIENT 7: SEBASTIAN PETER
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00007', 'SEBASTIAN', 'PETER', '0726707944', '', '25225003');
    v_client_count := v_client_count + 1;

    -- CLIENT 8: ELIZABETH WAWERU
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00008', 'ELIZABETH', 'WAWERU', '0719764331', '', '22000875');
    v_client_count := v_client_count + 1;

    -- CLIENT 9: Eric Muthama
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00009', 'Eric', 'Muthama', '0727268009', 'emuthama4@gmail.com', '25267113');
    v_client_count := v_client_count + 1;

    -- CLIENT 10: ROONEY MBANI
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00010', 'ROONEY', 'MBANI', '0726481920', '', '11111115');
    v_client_count := v_client_count + 1;

    -- CLIENT 11: Ben Mbuvi
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00011', 'Ben', 'Mbuvi', '0722798702', '', '1111116');
    v_client_count := v_client_count + 1;

    -- CLIENT 12: George Munyau Kawaya
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00012', 'George', 'Munyau Kawaya', '0768374146', 'KAWREK79@GMAIL.COM', '22195033');
    v_client_count := v_client_count + 1;

    -- CLIENT 13: Yusuf Olela Omanya
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00013', 'Yusuf', 'Olela Omanya', '+23350163l240', 'yolela@yahoo.com', '12508228');
    v_client_count := v_client_count + 1;

    -- CLIENT 14: Kifalu Samson Masha
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00014', 'Kifalu', 'Samson Masha', '+233540123795', 'kifalumasha@gmail.com', '13143767');
    v_client_count := v_client_count + 1;

    -- CLIENT 15: BILLY BOSTON ANYONYI
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00015', 'BILLY', 'BOSTON ANYONYI', '+254729925858', '', '24090458');
    v_client_count := v_client_count + 1;

    -- CLIENT 16: Geoffrey Rogiers Mwandango
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00016', 'Geoffrey', 'Rogiers Mwandango', '+254724046842', 'gkilemba@gmail.com', '23260758');
    v_client_count := v_client_count + 1;

    -- CLIENT 17: Benson Njoronge
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00017', 'Benson', 'Njoronge', '0720244602', '', '20314554');
    v_client_count := v_client_count + 1;

    -- CLIENT 18: James Mbuvi
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00018', 'James', 'Mbuvi', '+254720300339', 'mbuvi.felix@yahoo.com', '21019115');
    v_client_count := v_client_count + 1;

    -- CLIENT 19: Nicholas Ndiragu Mwangi
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00019', 'Nicholas', 'Ndiragu Mwangi', '+25472112387', 'gitimwa@gmail.com', '23118869');
    v_client_count := v_client_count + 1;

    -- CLIENT 20: JUWEYRLYA ALI MUHAMMAD
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00020', 'JUWEYRLYA', 'ALI MUHAMMAD', '0724442409', 'JAYMAYANJA@YAHOO.COM', '13214492');
    v_client_count := v_client_count + 1;

    -- CLIENT 21: PRISCAH LOICE MBUVI
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00021', 'PRISCAH', 'LOICE MBUVI', '0720817837', 'rosemutava@gmail.com', '23906403');
    v_client_count := v_client_count + 1;

    -- CLIENT 22: DANIEL COLLINS MAKOKO MWATETI
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00022', 'DANIEL', 'COLLINS MAKOKO MWATETI', '0710539049', 'collinsmakoko@gmail.com', '22482535');
    v_client_count := v_client_count + 1;

    -- CLIENT 23: QUENTIN DAUDI AFANDE
    INSERT INTO clients (organization_id, client_number, first_name, last_name, phone, email, id_number)
    VALUES (v_org_id, 'CL00023', 'QUENTIN', 'DAUDI AFANDE', '0721371892', 'QAFANDE@gmail.com', '22937024');
    v_client_count := v_client_count + 1;

    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Successfully inserted % clients for BV Funguo Ltd', v_client_count;
    RAISE NOTICE '============================================================';

END $$;

-- Verify insertion
SELECT 
    '✅ VERIFICATION: All 23 Clients Inserted' as info,
    COUNT(*) as total_clients
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');

-- Show all clients
SELECT 
    '📋 ALL CLIENTS DETAILS' as info,
    client_number,
    first_name,
    last_name,
    phone,
    id_number,
    email
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY client_number;
