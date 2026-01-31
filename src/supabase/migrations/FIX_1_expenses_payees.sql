-- =====================================================
-- FIX PART 1: Add columns to expenses and payees
-- =====================================================

-- EXPENSES (7 missing columns)
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_id TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_type TEXT;

-- PAYEES (8 missing columns)
ALTER TABLE payees ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS mpesa_number TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS tax_pin TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS kra_pin TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;
