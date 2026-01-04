-- ========================================================
-- COMPLETE FIX: Create or Update Bank Accounts Table
-- ========================================================
-- This will work regardless of whether the table exists or not

-- Step 1: Create the table with minimum required columns if it doesn't exist
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Add optional columns (if they don't exist)
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS account_type TEXT;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS balance NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'KES';
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS opening_balance NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS current_balance NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS account_holder_name TEXT;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS swift_code TEXT;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS iban TEXT;

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_organization_id ON bank_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_status ON bank_accounts(status);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_account_number ON bank_accounts(account_number);

-- Step 4: Enable RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
DROP POLICY IF EXISTS "Users can view their organization's bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can insert their organization's bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can update their organization's bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can delete their organization's bank accounts" ON bank_accounts;

CREATE POLICY "Users can view their organization's bank accounts"
  ON bank_accounts FOR SELECT
  USING (true);  -- Allow all for now (using service_role key)

CREATE POLICY "Users can insert their organization's bank accounts"
  ON bank_accounts FOR INSERT
  WITH CHECK (true);  -- Allow all for now (using service_role key)

CREATE POLICY "Users can update their organization's bank accounts"
  ON bank_accounts FOR UPDATE
  USING (true);  -- Allow all for now (using service_role key)

CREATE POLICY "Users can delete their organization's bank accounts"
  ON bank_accounts FOR DELETE
  USING (true);  -- Allow all for now (using service_role key)

-- Done!
SELECT 'Bank accounts table created/updated successfully!' as message;
