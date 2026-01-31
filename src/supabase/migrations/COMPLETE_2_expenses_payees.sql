-- =====================================================
-- COMPLETE PART 2: CREATE TABLES + ADD COLUMNS
-- Expenses, Payees
-- =====================================================

-- 4. CREATE EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  expense_id TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  amount NUMERIC NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  description TEXT,
  payee TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  payment_date TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]'::jsonb,
  payment_type TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS expense_id TEXT,
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS payment_type TEXT;

-- 5. CREATE PAYEES TABLE
CREATE TABLE IF NOT EXISTS payees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  bank_account TEXT,
  mpesa_number TEXT,
  tax_pin TEXT,
  kra_pin TEXT,
  contact_person TEXT,
  last_payment_date TIMESTAMPTZ,
  total_paid NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE payees
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS bank_account TEXT,
ADD COLUMN IF NOT EXISTS mpesa_number TEXT,
ADD COLUMN IF NOT EXISTS tax_pin TEXT,
ADD COLUMN IF NOT EXISTS kra_pin TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_expenses_org_id ON expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_id ON expenses(expense_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_date ON expenses(payment_date);
CREATE INDEX IF NOT EXISTS idx_payees_org_id ON payees(organization_id);
CREATE INDEX IF NOT EXISTS idx_payees_last_payment_date ON payees(last_payment_date);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view expenses in their organization" ON expenses;
CREATE POLICY "Users can view expenses in their organization"
  ON expenses FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

DROP POLICY IF EXISTS "Users can view payees in their organization" ON payees;
CREATE POLICY "Users can view payees in their organization"
  ON payees FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));
