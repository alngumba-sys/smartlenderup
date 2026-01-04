-- =====================================================
-- SIMPLE PAYEES TABLE FIX - Copy and Run All at Once
-- =====================================================
-- Select all the text below and paste into Supabase SQL Editor
-- Then click "Run" - should take less than 1 second

-- Add all missing columns (INCLUDING contact_phone)
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
-- VERIFICATION (Run this separately after the above)
-- =====================================================
-- This will show you all columns in the payees table
-- You should see all the new columns listed

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'payees'
ORDER BY ordinal_position;
