-- =====================================================
-- PART 7: JOURNAL_ENTRIES, PROCESSING_FEE_RECORDS
-- Run this after Part 6 completes successfully
-- =====================================================

-- 12. JOURNAL_ENTRIES (9 missing columns)
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

-- 13. PROCESSING_FEE_RECORDS (4 missing columns)
ALTER TABLE processing_fee_records
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS waived_by TEXT,
ADD COLUMN IF NOT EXISTS waived_reason TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_org_id ON journal_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_id ON journal_entries(entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_processing_fee_records_org_id ON processing_fee_records(organization_id);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_fee_records ENABLE ROW LEVEL SECURITY;
