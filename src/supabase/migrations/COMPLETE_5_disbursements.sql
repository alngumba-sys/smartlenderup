-- =====================================================
-- COMPLETE PART 5: CREATE TABLES + ADD COLUMNS
-- Disbursements
-- =====================================================

-- 10. CREATE DISBURSEMENTS TABLE
CREATE TABLE IF NOT EXISTS disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id TEXT NOT NULL,
  client_id TEXT,
  client_name TEXT,
  amount NUMERIC NOT NULL,
  scheduled_date TIMESTAMPTZ,
  actual_date TIMESTAMPTZ,
  channel TEXT,
  mpesa_number TEXT,
  bank_name TEXT,
  account_number TEXT,
  reference TEXT,
  status TEXT DEFAULT 'Pending',
  processed_by TEXT,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
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
CREATE INDEX IF NOT EXISTS idx_disbursements_loan_id ON disbursements(loan_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_client_id ON disbursements(client_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_status ON disbursements(status);
CREATE INDEX IF NOT EXISTS idx_disbursements_scheduled_date ON disbursements(scheduled_date);

-- Enable RLS
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view all disbursements" ON disbursements;
CREATE POLICY "Users can view all disbursements"
  ON disbursements FOR SELECT
  USING (true);
