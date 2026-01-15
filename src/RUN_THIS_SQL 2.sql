-- =====================================================
-- SMARTLENDERUP - COMPLETE FIX
-- =====================================================
-- Copy EVERYTHING below and run in Supabase SQL Editor
-- This fixes BOTH the payees error AND product ID mismatch
-- Estimated time: Less than 5 seconds
-- =====================================================

-- =====================================================
-- PART 1: FIX PAYEES TABLE
-- =====================================================
-- Adds all missing columns including contact_phone and contact_email

ALTER TABLE payees ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';
ALTER TABLE payees ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS physical_address TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS kra_pin TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS mpesa_number TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS total_paid NUMERIC DEFAULT 0;

-- =====================================================
-- PART 2: FIX PRODUCT ID MISMATCH
-- =====================================================
-- Updates all loans to use your correct product ID
-- Your product ID: 11794d71-e44c-4b16-8c84-1b06b54d0938

UPDATE loans
SET product_id = '11794d71-e44c-4b16-8c84-1b06b54d0938'
WHERE product_id != '11794d71-e44c-4b16-8c84-1b06b54d0938'
   OR product_id IS NULL
   OR product_id = '';

-- =====================================================
-- ✅ DONE! Now run the verification query below separately
-- =====================================================
