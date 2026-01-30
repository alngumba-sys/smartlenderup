-- ============================================================================
-- KEEP ONLY THE 23 LEGITIMATE CLIENTS FROM SCREENSHOTS
-- ============================================================================
-- This script will:
-- 1. Show all current clients in the database
-- 2. Identify the 23 legitimate clients by their phone numbers
-- 3. Delete all other duplicate/extra records
-- 4. Format all names to Title Case
-- ============================================================================

-- ============================================================================
-- STEP 1: SHOW ALL CURRENT CLIENTS IN DATABASE
-- ============================================================================
SELECT 
    '📋 ALL CLIENTS IN DATABASE (Before Cleanup)' as info,
    client_number,
    name,
    id_number,
    phone,
    email,
    created_at::date as created
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY client_number;

SELECT 
    '📊 TOTAL COUNT BEFORE CLEANUP' as info,
    COUNT(*) as total_clients
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');

-- ============================================================================
-- STEP 2: NORMALIZE ALL PHONE NUMBERS (+254 → 0)
-- ============================================================================
DO $$
DECLARE
    v_org_id UUID;
    v_updated_count INTEGER := 0;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    -- Update all +254XXX phones to 0XXX format
    UPDATE clients
    SET phone = '0' || SUBSTRING(phone FROM 5),
        updated_at = NOW()
    WHERE organization_id = v_org_id
    AND phone LIKE '+254%';
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    RAISE NOTICE '✅ Normalized % phone numbers from +254 to 0 format', v_updated_count;
    
END $$;

-- ============================================================================
-- STEP 3: IDENTIFY THE 23 LEGITIMATE CLIENTS
-- ============================================================================
-- These are the 23 phone numbers from the screenshots
WITH legitimate_clients AS (
    SELECT unnest(ARRAY[
        '072456544',      -- James Collins
        '0721881725',     -- Stephen Mulu Nzavi
        '0728330108',     -- OLIVE KAMENE NDEVENI
        '0724314868',     -- Josphat Matheka
        '0714219823',     -- NATALIA THOMAS
        '0799584652',     -- Saumu Ouma
        '0726707944',     -- SEBASTIAN PETER
        '0719764331',     -- ELIZABETH WAWERU
        '0727268009',     -- Eric Muthama
        '0726481920',     -- ROONEY MBANI
        '0722798702',     -- Ben Mbuvi
        '0768374146',     -- George Munyau Kawaya
        '33350163124',    -- Yusuf Olela Omanya (international)
        '33540123795',    -- Kifalu Samson Masha (international)
        '0729925856',     -- BILLY BOSTON ANYONYI
        '0724046842',     -- Geodfrey Rogiers Mwandango
        '0720244602',     -- Benson Njoronge
        '0720300339',     -- James Mbuvi
        '0721112387',     -- Nicholas Ndiragu Mwangi
        '0724442409',     -- JUWEYRYYA ALI MUHAMMAD
        '0720817837',     -- PRISCAH LOICE MBUVI
        '0710539049',     -- DANIEL COLLINS MAKOKO MWATETI
        '0721371892'      -- QUENTIN DAUDI AFANDE
    ]) as phone
)
SELECT 
    '✅ LEGITIMATE CLIENTS (Will Keep)' as info,
    c.client_number,
    c.name,
    c.phone,
    c.email,
    CASE 
        WHEN l.phone IS NOT NULL THEN '✅ MATCH - Keep'
        ELSE '❌ NOT IN LIST - Delete'
    END as status
FROM clients c
LEFT JOIN legitimate_clients l ON c.phone = l.phone
WHERE c.organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY 
    CASE WHEN l.phone IS NOT NULL THEN 1 ELSE 2 END,
    c.client_number;

-- ============================================================================
-- STEP 4: SHOW CLIENTS THAT WILL BE DELETED
-- ============================================================================
WITH legitimate_clients AS (
    SELECT unnest(ARRAY[
        '072456544', '0721881725', '0728330108', '0724314868', '0714219823',
        '0799584652', '0726707944', '0719764331', '0727268009', '0726481920',
        '0722798702', '0768374146', '33350163124', '33540123795', '0729925856',
        '0724046842', '0720244602', '0720300339', '0721112387', '0724442409',
        '0720817837', '0710539049', '0721371892'
    ]) as phone
)
SELECT 
    '❌ CLIENTS TO BE DELETED (Duplicates/Extras)' as info,
    c.client_number,
    c.name,
    c.phone,
    c.email,
    c.id_number
FROM clients c
WHERE c.organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
AND c.phone NOT IN (SELECT phone FROM legitimate_clients)
ORDER BY c.client_number;

-- ============================================================================
-- STEP 5: DELETE ALL CLIENTS NOT IN THE LEGITIMATE LIST
-- ============================================================================
DO $$
DECLARE
    v_org_id UUID;
    v_deleted_count INTEGER := 0;
    v_legitimate_phones TEXT[];
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    -- Array of 23 legitimate phone numbers
    v_legitimate_phones := ARRAY[
        '072456544', '0721881725', '0728330108', '0724314868', '0714219823',
        '0799584652', '0726707944', '0719764331', '0727268009', '0726481920',
        '0722798702', '0768374146', '33350163124', '33540123795', '0729925856',
        '0724046842', '0720244602', '0720300339', '0721112387', '0724442409',
        '0720817837', '0710539049', '0721371892'
    ];
    
    -- Delete all clients whose phone is NOT in the legitimate list
    DELETE FROM clients
    WHERE organization_id = v_org_id
    AND phone != ALL(v_legitimate_phones);
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Deleted % duplicate/extra client records', v_deleted_count;
    RAISE NOTICE '============================================================';
    
END $$;

-- ============================================================================
-- STEP 6: FORMAT ALL NAMES TO TITLE CASE
-- ============================================================================
DO $$
DECLARE
    v_org_id UUID;
    v_updated_count INTEGER := 0;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    -- Update all client names to Title Case
    UPDATE clients
    SET 
        name = INITCAP(name),
        updated_at = NOW()
    WHERE organization_id = v_org_id
    AND name != INITCAP(name);
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    RAISE NOTICE '✅ Formatted % client names to Title Case', v_updated_count;
    
END $$;

-- ============================================================================
-- FINAL VERIFICATION: SHOW ALL 23 CLIENTS
-- ============================================================================
SELECT 
    '✅ FINAL CLIENT LIST (Should be exactly 23)' as info,
    client_number,
    name,
    id_number,
    phone,
    email,
    (SELECT COUNT(*) FROM loans WHERE client_id = clients.id) as loan_count
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY name;

-- Count verification
SELECT 
    '📊 FINAL COUNT' as info,
    COUNT(*) as total_clients,
    COUNT(DISTINCT phone) as unique_phones,
    COUNT(DISTINCT LOWER(email)) as unique_emails
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');

-- Verify no duplicates
SELECT 
    '🔍 DUPLICATE CHECK (Should be empty)' as info,
    phone,
    COUNT(*) as count
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
GROUP BY phone
HAVING COUNT(*) > 1;
