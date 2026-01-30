-- ============================================================================
-- CLEANUP: Find and Remove Duplicate Clients
-- ============================================================================
-- This finds clients that were created with WRONG NRCs and removes them
-- ============================================================================

-- First, let's see what we have
SELECT 
    '📋 ALL CLIENTS (CL00023+)' as info,
    client_number,
    name,
    id_number,
    phone,
    created_at::date as created
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
AND client_number >= 'CL00023'
ORDER BY client_number;

-- Check for clients with similar names but different NRCs (duplicates)
SELECT 
    '🔍 POTENTIAL DUPLICATES' as info,
    name,
    COUNT(*) as count,
    STRING_AGG(client_number || ' (' || id_number || ')', ', ') as details
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
GROUP BY UPPER(REPLACE(name, ' ', ''))
HAVING COUNT(*) > 1
ORDER BY name;

-- ============================================================================
-- DELETE CLIENTS WITH WRONG NRCs (from first failed attempt)
-- ============================================================================
-- These are the clients created with WRONG NRCs in the first step3 attempt
-- We'll delete clients CL00023-CL00030 that have NO LOANS assigned to them

DO $$
DECLARE
    v_org_id UUID;
    v_deleted_count INTEGER := 0;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    -- Delete clients from first attempt (CL00023-CL00030) that have NO loans
    DELETE FROM clients
    WHERE organization_id = v_org_id
    AND client_number >= 'CL00023'
    AND client_number <= 'CL00030'
    AND id NOT IN (
        SELECT DISTINCT client_id FROM loans WHERE organization_id = v_org_id
    );
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Deleted % unused client records (CL00023-CL00030)', v_deleted_count;
    RAISE NOTICE '============================================================';
    
END $$;

-- ============================================================================
-- VERIFICATION AFTER CLEANUP
-- ============================================================================

-- Count total clients
SELECT 
    '✅ TOTAL CLIENTS AFTER CLEANUP' as info,
    COUNT(*) as total_clients
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');

-- Show all clients with their loan counts
SELECT 
    '📊 CLIENTS WITH LOAN COUNTS' as info,
    c.client_number,
    c.name,
    c.id_number,
    COUNT(l.id) as total_loans
FROM clients c
LEFT JOIN loans l ON c.id = l.client_id
WHERE c.organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
GROUP BY c.id, c.client_number, c.name, c.id_number
ORDER BY c.client_number;
