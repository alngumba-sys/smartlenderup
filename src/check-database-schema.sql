-- ============================================================================
-- DATABASE SCHEMA CHECKER FOR BV FUNGUO LTD
-- ============================================================================
-- 
-- PURPOSE: Check the actual structure of your database tables
-- This will help us understand the correct column names and relationships
--
-- INSTRUCTIONS:
-- Run this script in Supabase SQL Editor to see your database structure
-- ============================================================================

-- Check if organizations table exists and its structure
SELECT 'ORGANIZATIONS TABLE' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- Check if users table exists and its structure
SELECT 'USERS TABLE' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check if clients table exists and its structure
SELECT 'CLIENTS TABLE' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;

-- Check if loans table exists and its structure
SELECT 'LOANS TABLE' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'loans'
ORDER BY ordinal_position;

-- Check if payments table exists and its structure
SELECT 'PAYMENTS TABLE' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- Check if bank_accounts table exists and its structure
SELECT 'BANK_ACCOUNTS TABLE' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'bank_accounts'
ORDER BY ordinal_position;

-- Check if bank_branches table exists and its structure
SELECT 'BANK_BRANCHES TABLE' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'bank_branches'
ORDER BY ordinal_position;

-- Check if shareholders table exists and its structure
SELECT 'SHAREHOLDERS TABLE' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'shareholders'
ORDER BY ordinal_position;

-- List all tables in the public schema
SELECT 'ALL TABLES IN DATABASE' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check foreign key relationships
SELECT 'FOREIGN KEY RELATIONSHIPS' as info;
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Check for organization with username UV1K
SELECT 'BV FUNGUO LTD ORGANIZATION' as info;
SELECT * FROM organizations WHERE username = 'UV1K';

-- Count records in each table
SELECT 'RECORD COUNTS' as info;
SELECT 
    'organizations' as table_name,
    COUNT(*) as record_count
FROM organizations
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'loans', COUNT(*) FROM loans
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'bank_accounts', COUNT(*) FROM bank_accounts
UNION ALL
SELECT 'bank_branches', COUNT(*) FROM bank_branches
UNION ALL
SELECT 'shareholders', COUNT(*) FROM shareholders
ORDER BY record_count DESC;
