-- ============================================================================
-- CHECK CLIENTS TABLE STRUCTURE
-- ============================================================================
-- Run this to see what columns the clients table actually has
-- ============================================================================

-- Get all columns in the clients table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'clients'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also show a sample client to see the data
SELECT *
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
LIMIT 1;
