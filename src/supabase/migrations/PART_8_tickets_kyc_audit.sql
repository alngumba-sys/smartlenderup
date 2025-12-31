-- =====================================================
-- PART 8: TICKETS, KYC_RECORDS, AUDIT_LOGS
-- Run this after Part 7 completes successfully
-- =====================================================

-- 14. TICKETS (7 missing columns)
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS ticket_number TEXT,
ADD COLUMN IF NOT EXISTS client_id TEXT,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'Portal',
ADD COLUMN IF NOT EXISTS updated_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS resolution TEXT;

-- 15. KYC_RECORDS (10 missing columns)
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

-- 16. AUDIT_LOGS (3 missing columns)
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS performed_by TEXT,
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_client_id ON tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
