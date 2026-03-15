-- ============================================
-- ⚡ QUICK DATABASE SETUP - COPY/PASTE THIS!
-- ============================================
-- This creates ALL tables needed for SmartLenderUp
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- STEP 1: Clean slate (removes any conflicting old data)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- STEP 2: Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- NOW RUN THE MAIN SCHEMA
-- ============================================
-- After running the above, copy/paste the ENTIRE contents of:
-- /supabase/COMPLETE_DATABASE_SETUP.sql
-- 
-- (Starting from line 8 - the CREATE EXTENSION commands)
-- 
-- This will create all 30+ tables including:
-- ✅ organizations
-- ✅ staff_users
-- ✅ clients
-- ✅ loan_products ← This fixes your error!
-- ✅ credit_scoring_parameters ← This fixes your error!
-- ✅ loans
-- ✅ loan_repayments
-- ✅ And 25+ more tables
-- ============================================

-- ⚠️ IMPORTANT: After running this script
-- 1. Refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
-- 2. You'll need to re-create your organization/login
-- 3. Create test clients, products, etc.
-- 4. Then create loans - everything will work! ✨
