-- =====================================================
-- COMPLETE PART 8: CREATE TABLES + ADD COLUMNS
-- Tickets, KYC Records, Audit Logs
-- =====================================================

-- 14. CREATE TICKETS TABLE
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT,
  client_id TEXT,
  client_name TEXT,
  subject TEXT,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Open',
  assigned_to TEXT,
  channel TEXT DEFAULT 'Portal',
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS ticket_number TEXT,
ADD COLUMN IF NOT EXISTS client_id TEXT,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'Portal',
ADD COLUMN IF NOT EXISTS updated_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS resolution TEXT;

-- 15. CREATE KYC_RECORDS TABLE
CREATE TABLE IF NOT EXISTS kyc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  client_name TEXT,
  status TEXT DEFAULT 'Pending',
  risk_rating TEXT,
  verification_date TIMESTAMPTZ,
  last_review_date TIMESTAMPTZ,
  next_review_date TIMESTAMPTZ,
  national_id TEXT,
  national_id_verified BOOLEAN DEFAULT FALSE,
  address_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  biometrics_collected BOOLEAN DEFAULT FALSE,
  documents_on_file JSONB DEFAULT '[]'::jsonb,
  reviewed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE kyc_records
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS risk_rating TEXT,
ADD COLUMN IF NOT EXISTS last_review_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_review_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS national_id_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS address_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS biometrics_collected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS documents_on_file JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- 16. CREATE AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  performed_by TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS performed_by TEXT,
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_client_id ON tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_kyc_records_client_id ON kyc_records(client_id);
CREATE INDEX IF NOT EXISTS idx_kyc_records_status ON kyc_records(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view all tickets" ON tickets;
CREATE POLICY "Users can view all tickets"
  ON tickets FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can view all kyc_records" ON kyc_records;
CREATE POLICY "Users can view all kyc_records"
  ON kyc_records FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can view audit_logs in their organization" ON audit_logs;
CREATE POLICY "Users can view audit_logs in their organization"
  ON audit_logs FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));
