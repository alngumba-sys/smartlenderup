-- =====================================================
-- COMPLETE PART 6: CREATE TABLES + ADD COLUMNS
-- Approvals
-- =====================================================

-- 11. CREATE APPROVALS TABLE
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  description TEXT,
  requested_by TEXT,
  request_date TIMESTAMPTZ DEFAULT NOW(),
  amount NUMERIC,
  client_id TEXT,
  client_name TEXT,
  status TEXT DEFAULT 'Pending',
  priority TEXT DEFAULT 'Medium',
  approver TEXT,
  approver_name TEXT,
  approval_date TIMESTAMPTZ,
  decision_date TIMESTAMPTZ,
  rejection_reason TEXT,
  related_id TEXT,
  phase INTEGER,
  decision TEXT,
  disbursement_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
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
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_client_id ON approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_approvals_request_date ON approvals(request_date);
CREATE INDEX IF NOT EXISTS idx_approvals_phase ON approvals(phase);

-- Enable RLS
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view approvals in their organization" ON approvals;
CREATE POLICY "Users can view approvals in their organization"
  ON approvals FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));
