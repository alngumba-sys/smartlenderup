-- ============================================================================
-- SHOW REMAINING 11 CLIENTS
-- ============================================================================

SELECT 
    '✅ REMAINING CLIENTS (11)' as info,
    client_number,
    name,
    id_number,
    phone,
    email,
    (SELECT COUNT(*) FROM loans WHERE client_id = clients.id) as loan_count
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY client_number;

-- Show which phone numbers we have
SELECT 
    '📱 PHONE NUMBERS WE KEPT' as info,
    phone
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY phone;
