-- ============================================
-- Add share_capital column to shareholders table
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================

-- Add share_capital column if it doesn't exist
ALTER TABLE shareholders 
  ADD COLUMN IF NOT EXISTS share_capital NUMERIC(15, 2) DEFAULT 0;

-- Add other missing columns that might be needed
ALTER TABLE shareholders
  ADD COLUMN IF NOT EXISTS shareholder_name TEXT,
  ADD COLUMN IF NOT EXISTS shareholder_type TEXT,
  ADD COLUMN IF NOT EXISTS total_shares INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS share_percentage NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_dividends NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ownership_percentage NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS investment_date DATE;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'shareholders' 
ORDER BY column_name;
