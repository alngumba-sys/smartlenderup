-- =====================================================
-- FIX PART 4: Add columns to disbursements
-- =====================================================

-- DISBURSEMENTS (14 missing columns)
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS actual_date TIMESTAMPTZ;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS channel TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS mpesa_number TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS processed_by TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS created_by TEXT;
