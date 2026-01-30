-- ============================================================================
-- FORMAT ALL CLIENT NAMES TO TITLE CASE
-- ============================================================================
-- Converts names like:
--   "BILLY BOSTON ANYOKIU" → "Billy Boston Anyokiu"
--   "DANIEL COLLINS MAKOKO MWATETI" → "Daniel Collins Makoko Mwateti"
--   "james mbua" → "James Mbua"
-- ============================================================================

-- ============================================================================
-- STEP 1: SHOW CURRENT NAMES (Before formatting)
-- ============================================================================
SELECT 
    '📋 NAMES BEFORE TITLE CASE FORMATTING' as info,
    client_number,
    name as current_name,
    INITCAP(name) as formatted_name,
    CASE 
        WHEN name = INITCAP(name) THEN '✅ Already correct'
        ELSE '⚠️ Will be updated'
    END as status
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY client_number;

-- ============================================================================
-- STEP 2: UPDATE ALL NAMES TO TITLE CASE
-- ============================================================================
DO $$
DECLARE
    v_org_id UUID;
    v_updated_count INTEGER := 0;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    -- Update all client names to Title Case using INITCAP()
    UPDATE clients
    SET 
        name = INITCAP(name),
        updated_at = NOW()
    WHERE organization_id = v_org_id
    AND name != INITCAP(name);  -- Only update if different
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Updated % client names to Title Case format', v_updated_count;
    RAISE NOTICE '============================================================';
    
END $$;

-- ============================================================================
-- STEP 3: VERIFY - SHOW ALL NAMES AFTER FORMATTING
-- ============================================================================
SELECT 
    '✅ ALL NAMES AFTER TITLE CASE FORMATTING' as info,
    client_number,
    name,
    phone,
    email
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY client_number;

-- ============================================================================
-- STEP 4: COUNT TOTAL CLIENTS
-- ============================================================================
SELECT 
    '📊 TOTAL CLIENTS' as info,
    COUNT(*) as total_clients,
    COUNT(DISTINCT phone) as unique_phones,
    COUNT(DISTINCT LOWER(email)) as unique_emails
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');
