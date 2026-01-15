-- =====================================================
-- QUICK FIX: Add Authentication Columns to Organizations
-- =====================================================
-- Run this in Supabase SQL Editor
-- This is faster than running the full COMPLETE_DATABASE_RESET.sql
-- =====================================================

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS username VARCHAR(100);

-- Verify it worked
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
AND column_name IN ('password_hash', 'username');
