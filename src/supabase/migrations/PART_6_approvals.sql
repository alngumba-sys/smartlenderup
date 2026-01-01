-- =====================================================
-- PART 6: APPROVALS
-- Run this after Part 5 completes successfully
-- =====================================================

-- 11. APPROVALS (18 missing columns)
ALTER TABLE approvals
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS requested_by TEXT,
ADD COLUMN IF NOT EXISTS request_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS amount NUMERIC,
ADD COLUMN IF NOT EXISTS client_id TEXT,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS approver_name TEXT,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS decision_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS related_id TEXT,
ADD COLUMN IF NOT EXISTS phase INTEGER,
ADD COLUMN IF NOT EXISTS decision TEXT,
ADD COLUMN IF NOT EXISTS disbursement_data JSONB;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_approvals_org_id ON approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_client_id ON approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_approvals_request_date ON approvals(request_date);

-- Enable RLS
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
