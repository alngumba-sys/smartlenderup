-- ============================================
-- VERIFY SCHEMA FIX
-- Run this after applying FIX_ALL_MISSING_COLUMNS.sql
-- to verify all columns were added successfully
-- ============================================

-- Check shareholders table (should show 19 columns)
SELECT 
  'shareholders' as table_name,
  COUNT(*) as column_count,
  STRING_AGG(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'shareholders'
GROUP BY table_name;

-- Check shareholder_transactions table (should show 18 columns)
SELECT 
  'shareholder_transactions' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'shareholder_transactions'
GROUP BY table_name;

-- Check bank_accounts table (should show 19 columns)
SELECT 
  'bank_accounts' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'bank_accounts'
GROUP BY table_name;

-- Check expenses table (should show 26 columns)
SELECT 
  'expenses' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'expenses'
GROUP BY table_name;

-- Check payees table (should show 19 columns)
SELECT 
  'payees' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'payees'
GROUP BY table_name;

-- Check groups table (should show 24 columns)
SELECT 
  'groups' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'groups'
GROUP BY table_name;

-- Check tasks table
SELECT 
  'tasks' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'tasks'
GROUP BY table_name;

-- Check payroll_runs table
SELECT 
  'payroll_runs' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'payroll_runs'
GROUP BY table_name;

-- Check funding_transactions table (should show 18 columns)
SELECT 
  'funding_transactions' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'funding_transactions'
GROUP BY table_name;

-- Check disbursements table
SELECT 
  'disbursements' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'disbursements'
GROUP BY table_name;

-- Check approvals table (should show 27 columns)
SELECT 
  'approvals' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'approvals'
GROUP BY table_name;

-- Check journal_entries table (should show 28 columns)
SELECT 
  'journal_entries' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'journal_entries'
GROUP BY table_name;

-- Check processing_fee_records table (should show 18 columns)
SELECT 
  'processing_fee_records' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'processing_fee_records'
GROUP BY table_name;

-- Check tickets table
SELECT 
  'tickets' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'tickets'
GROUP BY table_name;

-- Check kyc_records table
SELECT 
  'kyc_records' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'kyc_records'
GROUP BY table_name;

-- Check audit_logs table (should show 15 columns)
SELECT 
  'audit_logs' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'audit_logs'
GROUP BY table_name;

-- ============================================
-- Summary of all tables
-- ============================================
SELECT 
  table_name,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name IN (
  'shareholders',
  'shareholder_transactions',
  'bank_accounts',
  'expenses',
  'payees',
  'groups',
  'tasks',
  'payroll_runs',
  'funding_transactions',
  'disbursements',
  'approvals',
  'journal_entries',
  'processing_fee_records',
  'tickets',
  'kyc_records',
  'audit_logs'
)
GROUP BY table_name
ORDER BY table_name;

-- ============================================
-- Check indexes were created
-- ============================================
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN (
  'shareholders',
  'shareholder_transactions',
  'bank_accounts',
  'expenses',
  'payees',
  'groups',
  'tasks',
  'payroll_runs',
  'funding_transactions',
  'disbursements',
  'approvals',
  'journal_entries',
  'processing_fee_records',
  'tickets',
  'kyc_records',
  'audit_logs'
)
ORDER BY tablename, indexname;

-- ============================================
-- EXPECTED RESULTS:
--
-- shareholders: 19+ columns
-- shareholder_transactions: 18+ columns
-- bank_accounts: 19+ columns
-- expenses: 26+ columns
-- payees: 19+ columns
-- groups: 24+ columns
-- tasks: 6+ additional columns
-- payroll_runs: 12+ additional columns
-- funding_transactions: 18+ columns
-- disbursements: 14+ additional columns
-- approvals: 27+ columns
-- journal_entries: 28+ columns
-- processing_fee_records: 18+ columns
-- tickets: 7+ additional columns
-- kyc_records: 10+ additional columns
-- audit_logs: 15+ columns
--
-- Multiple indexes should be shown for each table
-- ============================================
