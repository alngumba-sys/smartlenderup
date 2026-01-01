-- =====================================================
-- FIX PART 7: Add columns to tickets, kyc_records, and audit_logs
-- =====================================================

-- TICKETS (7 missing columns)
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_number TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'Portal';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS updated_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolution TEXT;

-- KYC_RECORDS (10 missing columns)
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS risk_rating TEXT;
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS last_review_date TIMESTAMPTZ;
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS next_review_date TIMESTAMPTZ;
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS national_id_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS address_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS biometrics_collected BOOLEAN DEFAULT FALSE;
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS documents_on_file JSONB DEFAULT '[]'::jsonb;
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- AUDIT_LOGS (2 missing columns)
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS performed_by TEXT;
