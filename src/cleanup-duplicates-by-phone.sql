-- ============================================================================
-- CLEANUP DUPLICATES BY PHONE NUMBER (Most Unique Identifier)
-- ============================================================================
-- Strategy:
-- 1. Normalize phone numbers (+254XXXXXXXXX → 0XXXXXXXXX)
-- 2. Group by normalized phone to find duplicates
-- 3. Keep clients with "0XXX" format, delete "+254XXX" duplicates
-- 4. If only "+254XXX" exists, update it to "0XXX" format
-- ============================================================================

-- ============================================================================
-- STEP 1: SHOW CURRENT DUPLICATES (by normalized phone)
-- ============================================================================
SELECT 
    '🔍 DUPLICATE CLIENTS (Same Phone)' as info,
    CASE 
        WHEN phone LIKE '+254%' THEN '0' || SUBSTRING(phone FROM 5)
        ELSE phone
    END as normalized_phone,
    COUNT(*) as duplicate_count,
    STRING_AGG(
        client_number || ' - ' || name || ' (' || phone || ')', 
        ' | ' 
        ORDER BY 
            CASE WHEN phone LIKE '0%' THEN 1 ELSE 2 END,  -- Prefer 0XXX
            created_at
    ) as all_records
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
GROUP BY 
    CASE 
        WHEN phone LIKE '+254%' THEN '0' || SUBSTRING(phone FROM 5)
        ELSE phone
    END
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- ============================================================================
-- STEP 2: SHOW WHICH RECORDS WILL BE KEPT vs DELETED
-- ============================================================================
WITH normalized_clients AS (
    SELECT 
        id,
        client_number,
        name,
        phone,
        email,
        id_number,
        created_at,
        CASE 
            WHEN phone LIKE '+254%' THEN '0' || SUBSTRING(phone FROM 5)
            ELSE phone
        END as normalized_phone,
        CASE WHEN phone LIKE '0%' THEN 1 ELSE 2 END as priority,
        ROW_NUMBER() OVER (
            PARTITION BY 
                CASE 
                    WHEN phone LIKE '+254%' THEN '0' || SUBSTRING(phone FROM 5)
                    ELSE phone
                END
            ORDER BY 
                CASE WHEN phone LIKE '0%' THEN 1 ELSE 2 END,  -- Prefer 0XXX
                created_at  -- Keep older record if same format
        ) as row_num
    FROM clients
    WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
)
SELECT 
    '📋 KEEP vs DELETE PLAN' as info,
    client_number,
    name,
    phone,
    normalized_phone,
    CASE 
        WHEN row_num = 1 THEN '✅ KEEP'
        ELSE '❌ DELETE (duplicate)'
    END as action,
    CASE 
        WHEN row_num = 1 AND phone LIKE '+254%' THEN '⚠️ UPDATE phone to ' || normalized_phone
        ELSE ''
    END as note
FROM normalized_clients
WHERE normalized_phone IN (
    SELECT normalized_phone
    FROM normalized_clients
    GROUP BY normalized_phone
    HAVING COUNT(*) > 1
)
ORDER BY normalized_phone, row_num;

-- ============================================================================
-- STEP 3: UPDATE +254 PHONES TO 0XXX FORMAT (for records we're keeping)
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
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Updated % phone numbers from +254 to 0 format', v_updated_count;
    RAISE NOTICE '============================================================';
    
END $$;

-- ============================================================================
-- STEP 4: DELETE DUPLICATE CLIENTS (keeping the first occurrence)
-- ============================================================================
DO $$
DECLARE
    v_org_id UUID;
    v_deleted_count INTEGER := 0;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    -- Delete duplicates, keeping the oldest record per phone number
    DELETE FROM clients
    WHERE id IN (
        WITH ranked_clients AS (
            SELECT 
                id,
                phone,
                ROW_NUMBER() OVER (
                    PARTITION BY phone
                    ORDER BY created_at  -- Keep oldest record
                ) as row_num
            FROM clients
            WHERE organization_id = v_org_id
        )
        SELECT id
        FROM ranked_clients
        WHERE row_num > 1  -- Delete all except first occurrence
    );
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Deleted % duplicate client records', v_deleted_count;
    RAISE NOTICE '============================================================';
    
END $$;

-- ============================================================================
-- STEP 5: ALSO CHECK FOR EMAIL DUPLICATES (secondary check)
-- ============================================================================
SELECT 
    '📧 EMAIL DUPLICATES (if any)' as info,
    email,
    COUNT(*) as duplicate_count,
    STRING_AGG(client_number || ' - ' || name, ' | ' ORDER BY created_at) as records
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
AND email IS NOT NULL
AND email != ''
GROUP BY email
HAVING COUNT(*) > 1;

-- ============================================================================
-- STEP 6: DELETE EMAIL DUPLICATES (if any remain)
-- ============================================================================
DO $$
DECLARE
    v_org_id UUID;
    v_deleted_count INTEGER := 0;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    -- Delete email duplicates, keeping the oldest record
    DELETE FROM clients
    WHERE id IN (
        WITH ranked_clients AS (
            SELECT 
                id,
                email,
                ROW_NUMBER() OVER (
                    PARTITION BY email
                    ORDER BY created_at
                ) as row_num
            FROM clients
            WHERE organization_id = v_org_id
            AND email IS NOT NULL
            AND email != ''
        )
        SELECT id
        FROM ranked_clients
        WHERE row_num > 1
    );
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    IF v_deleted_count > 0 THEN
        RAISE NOTICE '✅ Deleted % email duplicate records', v_deleted_count;
    ELSE
        RAISE NOTICE '✅ No email duplicates found';
    END IF;
    
END $$;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Count total clients
SELECT 
    '✅ TOTAL CLIENTS AFTER CLEANUP' as info,
    COUNT(*) as total_clients
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');

-- Show all clients with their phone numbers (should all be 0XXX format now)
SELECT 
    '📱 ALL CLIENTS (No Duplicates)' as info,
    client_number,
    name,
    phone,
    email,
    id_number,
    (SELECT COUNT(*) FROM loans WHERE client_id = clients.id) as loan_count
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY client_number;

-- Verify no phone duplicates remain
SELECT 
    '✅ PHONE DUPLICATE CHECK' as info,
    phone,
    COUNT(*) as count
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
GROUP BY phone
HAVING COUNT(*) > 1;
