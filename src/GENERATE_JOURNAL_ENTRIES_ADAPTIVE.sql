-- ==========================================
-- GENERATE JOURNAL ENTRIES - ADAPTIVE VERSION
-- SmartLenderUp - Works with ANY column names
-- ==========================================
-- IMPORTANT: Replace '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9' with your actual organization_id
-- ==========================================

-- STEP 1: Add missing columns to journal_entries
-- ==========================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journal_entries' AND column_name = 'reference_type'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN reference_type TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journal_entries' AND column_name = 'reference_id'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN reference_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journal_entries' AND column_name = 'status'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN status TEXT DEFAULT 'Posted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journal_entries' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN created_by TEXT;
  END IF;
END $$;

-- ==========================================
-- STEP 2: Create Chart of Accounts
-- ==========================================

CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  organization_id TEXT NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  account_category TEXT,
  parent_account_code TEXT,
  balance DECIMAL(15, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, account_code)
);

-- ==========================================
-- STEP 3: Insert Standard Chart of Accounts
-- ==========================================

INSERT INTO chart_of_accounts (organization_id, account_code, account_name, account_type, account_category, balance, description) VALUES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1000', 'Assets', 'Asset', 'Header', 0, 'All Assets'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1100', 'Current Assets', 'Asset', 'Header', 0, 'Current Assets'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1110', 'Cash in Hand', 'Asset', 'Current Asset', 0, 'Physical cash'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 'Asset', 'Current Asset', 0, 'Bank account balances'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1130', 'M-Pesa Account', 'Asset', 'Current Asset', 0, 'M-Pesa mobile money'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 'Asset', 'Current Asset', 0, 'Outstanding loan principal'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1210', 'Interest Receivable', 'Asset', 'Current Asset', 0, 'Accrued interest not yet collected'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '2000', 'Liabilities', 'Liability', 'Header', 0, 'All Liabilities'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '2100', 'Current Liabilities', 'Liability', 'Header', 0, 'Current Liabilities'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '2110', 'Accounts Payable', 'Liability', 'Current Liability', 0, 'Money owed to suppliers'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '3000', 'Equity', 'Equity', 'Header', 0, 'All Equity'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '3100', 'Share Capital', 'Equity', 'Capital', 0, 'Initial capital investment'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '3200', 'Retained Earnings', 'Equity', 'Retained Earnings', 0, 'Accumulated profits'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '4000', 'Revenue', 'Revenue', 'Header', 0, 'All Revenue'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '4100', 'Interest Income', 'Revenue', 'Operating Revenue', 0, 'Interest earned on loans'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '4200', 'Fee Income', 'Revenue', 'Operating Revenue', 0, 'Processing fees and other charges'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '5000', 'Expenses', 'Expense', 'Header', 0, 'All Expenses'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '5100', 'Operating Expenses', 'Expense', 'Operating Expense', 0, 'Day-to-day expenses'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '5200', 'Loan Loss Provision', 'Expense', 'Operating Expense', 0, 'Provision for bad debts')
ON CONFLICT (organization_id, account_code) DO NOTHING;

-- ==========================================
-- STEP 4: SHOW WHAT WE'RE ABOUT TO DO
-- ==========================================

-- Show the loans we'll process
SELECT 
  'LOANS TO PROCESS' as info,
  COUNT(*) as total_loans,
  'KES ' || TO_CHAR(SUM(COALESCE(amount, principal, loan_amount, approved_amount)), 'FM999,999,999.00') as total_principal
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Show the payments we'll process
SELECT 
  'PAYMENTS TO PROCESS' as info,
  COUNT(*) as total_payments,
  'KES ' || TO_CHAR(SUM(amount), 'FM999,999,999.00') as total_amount
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- ==========================================
-- STEP 5: Generate Journal Entries for LOAN DISBURSEMENTS
-- This version dynamically determines column names
-- ==========================================

DO $$
DECLARE
  loan_rec RECORD;
  entry_counter INTEGER := 1;
  org_id TEXT := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';
  principal_col TEXT;
  date_col TEXT;
BEGIN
  -- Detect the principal amount column name
  SELECT column_name INTO principal_col
  FROM information_schema.columns
  WHERE table_name = 'loans' 
    AND column_name IN ('principal_amount', 'principal', 'amount', 'loan_amount', 'approved_amount')
  LIMIT 1;

  -- Detect the disbursement date column name
  SELECT column_name INTO date_col
  FROM information_schema.columns
  WHERE table_name = 'loans' 
    AND column_name IN ('disbursement_date', 'disbursed_date', 'disburse_date', 'approved_date', 'created_at')
  LIMIT 1;

  RAISE NOTICE 'Using columns: % for principal, % for date', principal_col, date_col;

  -- Build and execute dynamic SQL
  FOR loan_rec IN EXECUTE format('
    SELECT 
      l.id::TEXT as loan_id,
      l.loan_number,
      l.%I as loan_principal,
      l.%I as loan_date,
      COALESCE(c.name, c.first_name || '' '' || COALESCE(c.last_name, ''''), ''Client-'' || l.client_id::TEXT) as client_display
    FROM loans l
    LEFT JOIN clients c ON l.client_id = c.id
    WHERE l.organization_id = $1
    ORDER BY l.%I, l.loan_number
  ', principal_col, date_col, date_col)
  USING org_id
  LOOP
    -- Insert DEBIT line: Loans Receivable
    INSERT INTO journal_entries (
      id, organization_id, entry_id, entry_date, description, account,
      debit, credit, reference_type, reference_id, status, created_by, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      org_id,
      'JE-DISB-' || LPAD(entry_counter::TEXT, 4, '0') || '-DR',
      loan_rec.loan_date,
      'Loan disbursement - ' || loan_rec.loan_number || ' - ' || loan_rec.client_display,
      '1200 - Loans Receivable',
      loan_rec.loan_principal, 0,
      'Loan Disbursement', loan_rec.loan_id,
      'Posted', 'System', NOW(), NOW()
    );

    -- Insert CREDIT line: Cash at Bank
    INSERT INTO journal_entries (
      id, organization_id, entry_id, entry_date, description, account,
      debit, credit, reference_type, reference_id, status, created_by, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      org_id,
      'JE-DISB-' || LPAD(entry_counter::TEXT, 4, '0') || '-CR',
      loan_rec.loan_date,
      'Loan disbursement - ' || loan_rec.loan_number || ' - ' || loan_rec.client_display,
      '1120 - Cash at Bank',
      0, loan_rec.loan_principal,
      'Loan Disbursement', loan_rec.loan_id,
      'Posted', 'System', NOW(), NOW()
    );

    entry_counter := entry_counter + 1;
  END LOOP;

  RAISE NOTICE '✅ Created % loan disbursement entries (% journal lines)', entry_counter - 1, (entry_counter - 1) * 2;
END $$;

-- ==========================================
-- STEP 6: Generate Journal Entries for PAYMENTS
-- ==========================================

DO $$
DECLARE
  payment_rec RECORD;
  entry_counter INTEGER := 1;
  org_id TEXT := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';
  cash_account TEXT;
BEGIN
  FOR payment_rec IN 
    SELECT 
      r.id::TEXT as payment_id,
      r.amount,
      r.principal_amount,
      r.interest_amount,
      r.payment_date,
      r.payment_method,
      r.reference_number,
      l.loan_number,
      COALESCE(c.name, c.first_name || ' ' || COALESCE(c.last_name, ''), 'Client') as client_display
    FROM repayments r
    JOIN loans l ON r.loan_id = l.id
    LEFT JOIN clients c ON r.client_id = c.id
    WHERE r.organization_id = org_id
    ORDER BY r.payment_date
  LOOP
    -- Determine cash account
    cash_account := CASE 
      WHEN payment_rec.payment_method = 'M-Pesa' THEN '1130 - M-Pesa Account'
      WHEN payment_rec.payment_method = 'Cash' THEN '1110 - Cash in Hand'
      ELSE '1120 - Cash at Bank'
    END;

    -- DEBIT: Cash received
    INSERT INTO journal_entries (
      id, organization_id, entry_id, entry_date, description, account,
      debit, credit, reference_type, reference_id, status, created_by, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), org_id,
      'JE-PMT-' || LPAD(entry_counter::TEXT, 4, '0') || '-DR',
      payment_rec.payment_date,
      'Payment - ' || payment_rec.loan_number || ' - ' || payment_rec.payment_method,
      cash_account,
      payment_rec.amount, 0,
      'Payment Received', payment_rec.payment_id,
      'Posted', 'System', NOW(), NOW()
    );

    -- CREDIT: Loans Receivable (principal)
    INSERT INTO journal_entries (
      id, organization_id, entry_id, entry_date, description, account,
      debit, credit, reference_type, reference_id, status, created_by, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), org_id,
      'JE-PMT-' || LPAD(entry_counter::TEXT, 4, '0') || '-CR1',
      payment_rec.payment_date,
      'Payment - ' || payment_rec.loan_number || ' - Principal',
      '1200 - Loans Receivable',
      0, payment_rec.principal_amount,
      'Payment Received', payment_rec.payment_id,
      'Posted', 'System', NOW(), NOW()
    );

    -- CREDIT: Interest Income
    INSERT INTO journal_entries (
      id, organization_id, entry_id, entry_date, description, account,
      debit, credit, reference_type, reference_id, status, created_by, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), org_id,
      'JE-PMT-' || LPAD(entry_counter::TEXT, 4, '0') || '-CR2',
      payment_rec.payment_date,
      'Payment - ' || payment_rec.loan_number || ' - Interest',
      '4100 - Interest Income',
      0, payment_rec.interest_amount,
      'Payment Received', payment_rec.payment_id,
      'Posted', 'System', NOW(), NOW()
    );

    entry_counter := entry_counter + 1;
  END LOOP;

  RAISE NOTICE '✅ Created % payment entries (% journal lines)', entry_counter - 1, (entry_counter - 1) * 3;
END $$;

-- ==========================================
-- STEP 7: Update Chart of Accounts Balances
-- ==========================================

-- Loans Receivable
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(outstanding_balance), 0)
  FROM loans
  WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
    AND status IN ('Active', 'In Arrears')
), updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '1200';

-- Cash in Hand
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(amount), 0)
  FROM repayments
  WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
    AND payment_method = 'Cash'
), updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '1110';

-- M-Pesa Account
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(amount), 0)
  FROM repayments
  WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
    AND payment_method = 'M-Pesa'
), updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '1130';

-- Cash at Bank
UPDATE chart_of_accounts
SET balance = (
  (SELECT COALESCE(SUM(amount), 0)
   FROM repayments
   WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
     AND payment_method = 'Bank Transfer')
  -
  (SELECT COALESCE(SUM(COALESCE(amount, principal, loan_amount, approved_amount)), 0)
   FROM loans
   WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
), updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '1120';

-- Interest Income
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(interest_amount), 0)
  FROM repayments
  WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
), updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '4100';

-- Share Capital
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(COALESCE(amount, principal, loan_amount, approved_amount)), 0)
  FROM loans
  WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
), updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '3100';

-- ==========================================
-- STEP 8: VERIFICATION & RESULTS
-- ==========================================

SELECT '═══════════════════════════════════════════' as divider;
SELECT '✅ CHART OF ACCOUNTS - UPDATED BALANCES' as report_title;
SELECT '═══════════════════════════════════════════' as divider;

SELECT 
  account_code,
  account_name,
  account_type,
  'KES ' || TO_CHAR(balance, 'FM999,999,999.00') as balance
FROM chart_of_accounts
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND balance != 0
ORDER BY account_code;

SELECT '═══════════════════════════════════════════' as divider;
SELECT '✅ JOURNAL ENTRIES SUMMARY' as report_title;
SELECT '═══════════════════════════════════════════' as divider;

SELECT 
  reference_type,
  COUNT(*) as entries,
  'KES ' || TO_CHAR(SUM(debit), 'FM999,999,999.00') as debits,
  'KES ' || TO_CHAR(SUM(credit), 'FM999,999,999.00') as credits
FROM journal_entries
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND reference_type IN ('Loan Disbursement', 'Payment Received')
GROUP BY reference_type;

SELECT '═══════════════════════════════════════════' as divider;
SELECT '✅ ACCOUNT ACTIVITY' as report_title;
SELECT '═══════════════════════════════════════════' as divider;

SELECT 
  account,
  'KES ' || TO_CHAR(SUM(debit), 'FM999,999,999.00') as debits,
  'KES ' || TO_CHAR(SUM(credit), 'FM999,999,999.00') as credits,
  'KES ' || TO_CHAR(SUM(debit) - SUM(credit), 'FM999,999,999.00') as net
FROM journal_entries
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND reference_type IN ('Loan Disbursement', 'Payment Received')
GROUP BY account
ORDER BY account;

SELECT '═══════════════════════════════════════════' as divider;
SELECT '✅ SUCCESS! Journal entries generated.' as status;
SELECT 'Refresh your dashboard to see updated Chart of Accounts.' as next_step;
SELECT '═══════════════════════════════════════════' as divider;
