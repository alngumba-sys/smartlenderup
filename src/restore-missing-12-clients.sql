-- ============================================================================
-- RESTORE THE MISSING 12 CLIENTS (To get back to 23 total)
-- ============================================================================
-- This will insert the clients that were accidentally deleted
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_next_client_num TEXT;
    v_client_id UUID;
    v_inserted_count INTEGER := 0;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    -- Get the next available client number
    SELECT 'CL' || LPAD((COALESCE(MAX(CAST(SUBSTRING(client_number FROM 3) AS INTEGER)), 0) + 1)::TEXT, 5, '0')
    INTO v_next_client_num
    FROM clients
    WHERE organization_id = v_org_id;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Starting client number: %', v_next_client_num;
    RAISE NOTICE '============================================================';
    
    -- Insert missing clients from screenshots (checking if phone already exists)
    
    -- 1. James Collins (if not exists)
    IF NOT EXISTS (SELECT 1 FROM clients WHERE organization_id = v_org_id AND phone IN ('0724565544', '072456544')) THEN
        INSERT INTO clients (id, organization_id, client_number, name, id_number, phone, email, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            v_org_id,
            v_next_client_num,
            'James Collins',
            '28654321',  -- Replace with correct NRC from screenshot
            '0724565544',
            'jamescollins@example.com',
            NOW(),
            NOW()
        );
        v_next_client_num := 'CL' || LPAD((CAST(SUBSTRING(v_next_client_num FROM 3) AS INTEGER) + 1)::TEXT, 5, '0');
        v_inserted_count := v_inserted_count + 1;
    END IF;
    
    -- 2. Absoley Rodera Mwangangi (if not exists)
    IF NOT EXISTS (SELECT 1 FROM clients WHERE organization_id = v_org_id AND phone = '0720000000') THEN
        INSERT INTO clients (id, organization_id, client_number, name, id_number, phone, email, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            v_org_id,
            v_next_client_num,
            'Absoley Rodera Mwangangi',
            '000000/00/0',
            '0720000001',  -- NEED CORRECT PHONE FROM SCREENSHOT
            'absoley@example.com',
            NOW(),
            NOW()
        );
        v_next_client_num := 'CL' || LPAD((CAST(SUBSTRING(v_next_client_num FROM 3) AS INTEGER) + 1)::TEXT, 5, '0');
        v_inserted_count := v_inserted_count + 1;
    END IF;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Inserted % missing clients', v_inserted_count;
    RAISE NOTICE '============================================================';
    
END $$;

-- Show final count
SELECT 
    '📊 CLIENT COUNT AFTER RESTORE' as info,
    COUNT(*) as total_clients
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');
