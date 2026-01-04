-- =====================================================
-- FIX PART 6: Add columns to journal_entries and processing_fee_records
-- =====================================================

-- JOURNAL_ENTRIES (9 missing columns)
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS entry_id TEXT;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS entry_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS reference_type TEXT;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS reference_id TEXT;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS lines JSONB DEFAULT '[]'::jsonb;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS account TEXT;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS debit NUMERIC DEFAULT 0;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS credit NUMERIC DEFAULT 0;

-- PROCESSING_FEE_RECORDS (4 missing columns)
ALTER TABLE processing_fee_records ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE processing_fee_records ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0;
ALTER TABLE processing_fee_records ADD COLUMN IF NOT EXISTS waived_by TEXT;
ALTER TABLE processing_fee_records ADD COLUMN IF NOT EXISTS waived_reason TEXT;
