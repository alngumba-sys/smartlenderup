-- =====================================================
-- SIMPLE FIX: Create Approvals Table with All Columns
-- Copy this entire file and paste into Supabase SQL Editor
-- =====================================================

-- Create approvals table with all required columns
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id TEXT,
  type TEXT,
  title TEXT,
  description TEXT,
  requested_by TEXT,
  request_date TIMESTAMPTZ DEFAULT NOW(),
  amount NUMERIC,
  client_id TEXT,
  client_name TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  approver TEXT,
  approver_role TEXT,
  approver_name TEXT,
  approval_date TIMESTAMPTZ,
  decision_date TIMESTAMPTZ,
  rejection_reason TEXT,
  related_id TEXT,
  phase INTEGER,
  stage TEXT,
  decision TEXT,
  comments TEXT,
  disbursement_data JSONB,
  step INTEGER,
  approval_status TEXT,
  approver_id UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_approvals_org_id ON approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_loan_id ON approvals(loan_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_client_id ON approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_approvals_phase ON approvals(phase);
CREATE INDEX IF NOT EXISTS idx_approvals_related_id ON approvals(related_id);

-- Enable Row Level Security
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view approvals in their organization" ON approvals;
CREATE POLICY "Users can view approvals in their organization"
  ON approvals FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

DROP POLICY IF EXISTS "Users can insert approvals in their organization" ON approvals;
CREATE POLICY "Users can insert approvals in their organization"
  ON approvals FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

DROP POLICY IF EXISTS "Users can update approvals in their organization" ON approvals;
CREATE POLICY "Users can update approvals in their organization"
  ON approvals FOR UPDATE
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

DROP POLICY IF EXISTS "Users can delete approvals in their organization" ON approvals;
CREATE POLICY "Users can delete approvals in their organization"
  ON approvals FOR DELETE
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

-- Done! You should see "Success" message.
