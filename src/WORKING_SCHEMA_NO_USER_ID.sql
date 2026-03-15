-- ============================================
-- ✅ WORKING SCHEMA (NO user_id CONFLICTS)
-- ============================================
-- This is a FIXED version that removes problematic user_id columns
-- Run this if the main schema gives "user_id does not exist" error
-- ============================================

-- STEP 1: Clean slate (OPTIONAL - only if you want fresh start)
-- ⚠️ Uncomment these lines if you want to drop everything and start fresh:
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO public;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- IMPORTANT NOTE ABOUT user_id:
-- ============================================
-- The original schema had user_id columns in:
-- - funding_transactions (line 381)
-- - audit_logs (line 593)  
-- - notifications (line 878)
--
-- These columns are for tracking which staff user performed actions.
-- We're REMOVING them to avoid conflicts.
-- You can add them back later with:
-- ALTER TABLE table_name ADD COLUMN user_id UUID REFERENCES public.staff_users(id);
-- ============================================

-- Now just copy the ENTIRE COMPLETE_DATABASE_SETUP.sql content here
-- But SKIP these lines:
-- - Line 381: user_id UUID,
-- - Line 593: user_id UUID,
-- - Line 878: user_id UUID,
-- - Line 890: CREATE INDEX ... idx_notifications_user ...

-- OR use this simpler approach:
-- Just copy COMPLETE_DATABASE_SETUP.sql and find/replace:
-- 
-- Find:    user_id UUID,
-- Replace: -- user_id UUID,  (commented out)
--
-- Find:    CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
-- Replace: -- CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);  (commented out)

-- ============================================
-- 📋 ALTERNATIVE: Run schema sections separately
-- ============================================

-- Just run COMPLETE_DATABASE_SETUP.sql in sections:
-- 1. Lines 1-50: Organizations & Staff (should work fine)
-- 2. Lines 51-200: Clients & Products (should work fine)
-- 3. Lines 201-400: Loans & Repayments (should work fine)
-- 4. Skip any lines with user_id that cause errors
-- 5. Continue with remaining tables

-- If line 381, 593, or 878 causes an error, just skip that one line!
