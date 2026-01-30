-- ============================================================================
-- CONVERT ALL FIRST_NAME AND LAST_NAME TO TITLE CASE
-- ============================================================================
-- This will convert names like "JAMES" to "James" and "COLLINS" to "Collins"
-- ============================================================================

-- Update all clients to Title Case
UPDATE clients
SET 
    first_name = INITCAP(first_name),
    last_name = INITCAP(last_name)
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');

-- Verify the changes
SELECT 
    '✅ ALL NAMES CONVERTED TO TITLE CASE' as info,
    client_number,
    first_name,
    last_name,
    phone,
    id_number,
    email
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY client_number;

-- Show count
SELECT 
    '📊 TOTAL CLIENTS UPDATED' as info,
    COUNT(*) as total_clients
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');
