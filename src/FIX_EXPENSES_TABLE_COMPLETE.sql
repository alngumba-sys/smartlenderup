-- ========================================================
-- COMPLETE FIX: Create or Update Expenses Table
-- ========================================================
-- This will work regardless of whether the table exists or not

-- Step 1: Create the table with minimum required columns if it doesn't exist
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Add optional columns (if they don't exist)
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_id TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_date DATE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_category TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payee_id TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payee_name TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS bank_account_id TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approved_date DATE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS paid_by TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS paid_date DATE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS notes TEXT;

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_expenses_organization_id ON expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_date ON expenses(payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);

-- Step 4: Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
DROP POLICY IF EXISTS "Users can view their organization's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their organization's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their organization's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their organization's expenses" ON expenses;

CREATE POLICY "Users can view their organization's expenses"
  ON expenses FOR SELECT
  USING (true);  -- Allow all for now (using service_role key)

CREATE POLICY "Users can insert their organization's expenses"
  ON expenses FOR INSERT
  WITH CHECK (true);  -- Allow all for now (using service_role key)

CREATE POLICY "Users can update their organization's expenses"
  ON expenses FOR UPDATE
  USING (true);  -- Allow all for now (using service_role key)

CREATE POLICY "Users can delete their organization's expenses"
  ON expenses FOR DELETE
  USING (true);  -- Allow all for now (using service_role key)

-- Done!
SELECT 'Expenses table created/updated successfully!' as message;
