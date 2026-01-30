-- ============================================================================
-- DELETE ALL CLIENTS FOR BV FUNGUO LTD (UV1K)
-- ============================================================================
-- This will delete all clients to start fresh with correct data
-- ============================================================================

-- STEP 1: Show current clients before deletion
SELECT 
    '📋 CLIENTS BEFORE DELETION' as info,
    client_number,
    name,
    phone,
    email,
    (SELECT COUNT(*) FROM loans WHERE client_id = clients.id) as loan_count
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY client_number;

-- STEP 2: Show total count
SELECT 
    '📊 TOTAL CLIENTS BEFORE' as info,
    COUNT(*) as total_clients
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');

-- STEP 3: Delete all clients
DO $$
DECLARE
    v_org_id UUID;
    v_deleted_count INTEGER := 0;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    -- Delete all clients for this organization
    DELETE FROM clients
    WHERE organization_id = v_org_id;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Deleted ALL % clients for BV Funguo Ltd', v_deleted_count;
    RAISE NOTICE '============================================================';
    
END $$;

-- STEP 4: Verify deletion
SELECT 
    '✅ TOTAL CLIENTS AFTER DELETION' as info,
    COUNT(*) as total_clients
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');

-- STEP 5: Show any remaining clients (should be empty)
SELECT 
    '🔍 REMAINING CLIENTS (Should be empty)' as info,
    client_number,
    name,
    phone
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY client_number;
