-- =====================================================
-- FIX PART 5: Add columns to approvals
-- =====================================================

-- APPROVALS (18 missing columns)
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS requested_by TEXT;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS request_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS amount NUMERIC;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS approver_name TEXT;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS approval_date TIMESTAMPTZ;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS decision_date TIMESTAMPTZ;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS related_id TEXT;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS phase INTEGER;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS decision TEXT;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS disbursement_data JSONB;
