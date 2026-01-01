-- =====================================================
-- PART 2: EXPENSES, PAYEES
-- Run this after Part 1 completes successfully
-- =====================================================

-- 4. EXPENSES (7 missing columns)
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS expense_id TEXT,
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS payment_type TEXT;

-- 5. PAYEES (8 missing columns)
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
