-- =====================================================
-- COMPLETE PART 7: CREATE TABLES + ADD COLUMNS
-- Journal Entries, Processing Fee Records
-- =====================================================

-- 12. CREATE JOURNAL_ENTRIES TABLE
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  entry_id TEXT,
  entry_date TIMESTAMPTZ DEFAULT NOW(),
  description TEXT,
  reference_type TEXT,
  reference_id TEXT,
  status TEXT DEFAULT 'Posted',
  lines JSONB DEFAULT '[]'::jsonb,
  account TEXT,
  debit NUMERIC DEFAULT 0,
  credit NUMERIC DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS entry_id TEXT,
ADD COLUMN IF NOT EXISTS entry_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS reference_type TEXT,
ADD COLUMN IF NOT EXISTS reference_id TEXT,
ADD COLUMN IF NOT EXISTS lines JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS account TEXT,
ADD COLUMN IF NOT EXISTS debit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit NUMERIC DEFAULT 0;

-- 13. CREATE PROCESSING_FEE_RECORDS TABLE
CREATE TABLE IF NOT EXISTS processing_fee_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Pending',
  waived BOOLEAN DEFAULT FALSE,
  waived_by TEXT,
  waived_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE processing_fee_records
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS waived_by TEXT,
ADD COLUMN IF NOT EXISTS waived_reason TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_org_id ON journal_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_id ON journal_entries(entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference_type ON journal_entries(reference_type);
CREATE INDEX IF NOT EXISTS idx_processing_fee_records_org_id ON processing_fee_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_processing_fee_records_loan_id ON processing_fee_records(loan_id);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_fee_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view journal_entries in their organization" ON journal_entries;
CREATE POLICY "Users can view journal_entries in their organization"
  ON journal_entries FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

DROP POLICY IF EXISTS "Users can view processing_fee_records in their organization" ON processing_fee_records;
CREATE POLICY "Users can view processing_fee_records in their organization"
  ON processing_fee_records FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));
