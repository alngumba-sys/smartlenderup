-- =====================================================
-- SQL QUERIES TO FIX PAYEES TABLE
-- =====================================================
-- Run these queries in your Supabase SQL Editor to add missing columns to the payees table
-- Copy and paste each section into the Supabase SQL Editor and execute

-- =====================================================
-- 1. ADD MISSING COLUMNS TO PAYEES TABLE
-- =====================================================

-- Add contact_phone column (CRITICAL - causing the error)
ALTER TABLE payees 
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Add contact_email column (CRITICAL - causing the error)
ALTER TABLE payees 
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Add category column
ALTER TABLE payees 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';

-- Add contact_person column
ALTER TABLE payees 
ADD COLUMN IF NOT EXISTS contact_person TEXT;

-- Add physical_address column
ALTER TABLE payees 
ADD COLUMN IF NOT EXISTS physical_address TEXT;

-- Add kra_pin column (Kenya Revenue Authority PIN)
ALTER TABLE payees 
ADD COLUMN IF NOT EXISTS kra_pin TEXT;

-- Add bank_name column
ALTER TABLE payees 
ADD COLUMN IF NOT EXISTS bank_name TEXT;

-- Add account_number column
ALTER TABLE payees 
ADD COLUMN IF NOT EXISTS account_number TEXT;

-- Add mpesa_number column
ALTER TABLE payees 
ADD COLUMN IF NOT EXISTS mpesa_number TEXT;

-- Add notes column
ALTER TABLE payees 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add total_paid column (track total amount paid to payee)
ALTER TABLE payees 
ADD COLUMN IF NOT EXISTS total_paid NUMERIC DEFAULT 0;

-- =====================================================
-- 2. VERIFY THE TABLE STRUCTURE
-- =====================================================
-- Run this to see all columns in the payees table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'payees'
ORDER BY ordinal_position;

-- =====================================================
-- 3. CHECK EXISTING DATA
-- =====================================================
-- Run this to see what data you currently have
SELECT * FROM payees LIMIT 10;

-- =====================================================
-- 4. OPTIONAL: CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Index on contact_phone for faster searches
CREATE INDEX IF NOT EXISTS idx_payees_contact_phone 
ON payees(contact_phone);

-- Index on contact_email for faster searches
CREATE INDEX IF NOT EXISTS idx_payees_contact_email 
ON payees(contact_email);

-- Index on category for filtering
CREATE INDEX IF NOT EXISTS idx_payees_category 
ON payees(category);

-- Index on payee_name for faster searches
CREATE INDEX IF NOT EXISTS idx_payees_name 
ON payees(payee_name);

-- =====================================================
-- 5. OPTIONAL: ADD CONSTRAINT (FIXED - No IF NOT EXISTS)
-- =====================================================

-- Ensure category is one of the valid values
-- Note: This will fail if constraint already exists - that's okay, just ignore the error
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_payee_category'
    ) THEN
        ALTER TABLE payees 
        ADD CONSTRAINT check_payee_category 
        CHECK (category IN ('Employee', 'Utilities', 'Rent', 'Services', 'Suppliers', 'Other'));
    END IF;
END $$;

-- =====================================================
-- NOTES:
-- =====================================================
-- After running these queries:
-- 1. The payees table will have all required columns (including contact_phone)
-- 2. Existing payees will have NULL or default values for new columns
-- 3. New payees will be saved with all fields properly
-- 4. The error "Could not find the 'contact_phone' column" will be fixed
-- 5. The error "Could not find the 'contact_email' column" will be fixed
