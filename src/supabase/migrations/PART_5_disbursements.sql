-- =====================================================
-- PART 5: DISBURSEMENTS
-- Run this after Part 4 completes successfully
-- =====================================================

-- 10. DISBURSEMENTS (14 missing columns)
ALTER TABLE disbursements
ADD COLUMN IF NOT EXISTS client_id TEXT,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actual_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS channel TEXT,
ADD COLUMN IF NOT EXISTS mpesa_number TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS reference TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS processed_by TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_disbursements_client_id ON disbursements(client_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_status ON disbursements(status);
CREATE INDEX IF NOT EXISTS idx_disbursements_scheduled_date ON disbursements(scheduled_date);

-- Enable RLS
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
