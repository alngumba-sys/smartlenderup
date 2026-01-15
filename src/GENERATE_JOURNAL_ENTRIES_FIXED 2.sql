-- ==========================================
-- GENERATE JOURNAL ENTRIES FOR IMPORTED LOANS & PAYMENTS
-- SmartLenderUp - Double-Entry Bookkeeping - FIXED VERSION
-- ==========================================
-- This works with the EXISTING journal_entries table schema
-- IMPORTANT: Replace '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9' with your actual organization_id
-- ==========================================

-- STEP 1: First, let's add missing columns to journal_entries if they don't exist
-- ==========================================

-- Add reference_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journal_entries' 
    AND column_name = 'reference_type'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN reference_type TEXT;
  END IF;
END $$;

-- Add reference_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journal_entries' 
    AND column_name = 'reference_id'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN reference_id TEXT;
  END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journal_entries' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN status TEXT DEFAULT 'Posted';
  END IF;
END $$;

-- Add created_by column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journal_entries' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN created_by TEXT;
  END IF;
END $$;

-- ==========================================
-- STEP 2: Create Chart of Accounts Table (if not exists)
-- ==========================================

CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  organization_id TEXT NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL, -- Asset, Liability, Equity, Revenue, Expense
  account_category TEXT, -- Current Asset, Fixed Asset, etc.
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
-- ASSETS
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1000', 'Assets', 'Asset', 'Header', 0, 'All Assets'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1100', 'Current Assets', 'Asset', 'Header', 0, 'Current Assets'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1110', 'Cash in Hand', 'Asset', 'Current Asset', 0, 'Physical cash'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 'Asset', 'Current Asset', 0, 'Bank account balances'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1130', 'M-Pesa Account', 'Asset', 'Current Asset', 0, 'M-Pesa mobile money'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 'Asset', 'Current Asset', 0, 'Outstanding loan principal'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1210', 'Interest Receivable', 'Asset', 'Current Asset', 0, 'Accrued interest not yet collected'),

-- LIABILITIES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '2000', 'Liabilities', 'Liability', 'Header', 0, 'All Liabilities'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '2100', 'Current Liabilities', 'Liability', 'Header', 0, 'Current Liabilities'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '2110', 'Accounts Payable', 'Liability', 'Current Liability', 0, 'Money owed to suppliers'),

-- EQUITY
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '3000', 'Equity', 'Equity', 'Header', 0, 'All Equity'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '3100', 'Share Capital', 'Equity', 'Capital', 0, 'Initial capital investment'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '3200', 'Retained Earnings', 'Equity', 'Retained Earnings', 0, 'Accumulated profits'),

-- REVENUE
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '4000', 'Revenue', 'Revenue', 'Header', 0, 'All Revenue'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '4100', 'Interest Income', 'Revenue', 'Operating Revenue', 0, 'Interest earned on loans'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '4200', 'Fee Income', 'Revenue', 'Operating Revenue', 0, 'Processing fees and other charges'),

-- EXPENSES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '5000', 'Expenses', 'Expense', 'Header', 0, 'All Expenses'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '5100', 'Operating Expenses', 'Expense', 'Operating Expense', 0, 'Day-to-day expenses'),
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '5200', 'Loan Loss Provision', 'Expense', 'Operating Expense', 0, 'Provision for bad debts')
ON CONFLICT (organization_id, account_code) DO NOTHING;

-- ==========================================
-- STEP 4: Generate Journal Entries for ALL 23 LOAN DISBURSEMENTS
-- ==========================================
-- Using the simple flat structure: each line is a separate row
-- When a loan is disbursed:
-- Row 1: DR Loans Receivable (positive debit)
-- Row 2: CR Cash at Bank (positive credit)
-- ==========================================

-- Get the table structure first
DO $$
DECLARE
  loan_rec RECORD;
  entry_counter INTEGER := 1;
  org_id TEXT := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';
BEGIN
  -- Loop through all loans
  FOR loan_rec IN 
    SELECT id, loan_number, client_name, principal_amount, disbursement_date
    FROM loans 
    WHERE organization_id = org_id
    ORDER BY disbursement_date, loan_number
  LOOP
    -- Insert DEBIT line: Loans Receivable
    INSERT INTO journal_entries (
      id,
      organization_id,
      entry_id,
      entry_date,
      description,
      account,
      debit,
      credit,
      reference_type,
      reference_id,
      status,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      org_id,
      'JE-' || TO_CHAR(loan_rec.disbursement_date, 'YYYY') || '-' || LPAD(entry_counter::TEXT, 4, '0') || '-DR',
      loan_rec.disbursement_date,
      'Loan disbursement - ' || loan_rec.loan_number || ' - ' || loan_rec.client_name,
      '1200 - Loans Receivable',
      loan_rec.principal_amount,
      0,
      'Loan Disbursement',
      loan_rec.id,
      'Posted',
      'System',
      NOW(),
      NOW()
    );

    -- Insert CREDIT line: Cash at Bank
    INSERT INTO journal_entries (
      id,
      organization_id,
      entry_id,
      entry_date,
      description,
      account,
      debit,
      credit,
      reference_type,
      reference_id,
      status,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      org_id,
      'JE-' || TO_CHAR(loan_rec.disbursement_date, 'YYYY') || '-' || LPAD(entry_counter::TEXT, 4, '0') || '-CR',
      loan_rec.disbursement_date,
      'Loan disbursement - ' || loan_rec.loan_number || ' - ' || loan_rec.client_name,
      '1120 - Cash at Bank',
      0,
      loan_rec.principal_amount,
      'Loan Disbursement',
      loan_rec.id,
      'Posted',
      'System',
      NOW(),
      NOW()
    );

    entry_counter := entry_counter + 1;
  END LOOP;

  RAISE NOTICE 'Created % loan disbursement journal entries (% pairs)', entry_counter - 1, (entry_counter - 1) * 2;
END $$;

-- ==========================================
-- STEP 5: Generate Journal Entries for ALL 23 PAYMENT RECEIPTS
-- ==========================================
-- When a payment is received:
-- Row 1: DR Cash/M-Pesa/Bank (money comes in)
-- Row 2: CR Loans Receivable (principal portion)
-- Row 3: CR Interest Income (interest portion)
-- ==========================================

DO $$
DECLARE
  payment_rec RECORD;
  loan_rec RECORD;
  entry_counter INTEGER := 1;
  org_id TEXT := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';
  cash_account TEXT;
BEGIN
  -- Loop through all payments
  FOR payment_rec IN 
    SELECT 
      r.id,
      r.loan_id,
      r.amount,
      r.principal_amount,
      r.interest_amount,
      r.payment_date,
      r.payment_method,
      r.reference_number
    FROM repayments r
    WHERE r.organization_id = org_id
    ORDER BY r.payment_date
  LOOP
    -- Get loan details
    SELECT loan_number, client_name INTO loan_rec
    FROM loans WHERE id = payment_rec.loan_id;

    -- Determine cash account based on payment method
    cash_account := CASE 
      WHEN payment_rec.payment_method = 'M-Pesa' THEN '1130 - M-Pesa Account'
      WHEN payment_rec.payment_method = 'Cash' THEN '1110 - Cash in Hand'
      ELSE '1120 - Cash at Bank'
    END;

    -- Insert DEBIT line: Cash received
    INSERT INTO journal_entries (
      id,
      organization_id,
      entry_id,
      entry_date,
      description,
      account,
      debit,
      credit,
      reference_type,
      reference_id,
      status,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      org_id,
      'JE-PMT-' || TO_CHAR(payment_rec.payment_date, 'YYYY') || '-' || LPAD(entry_counter::TEXT, 4, '0') || '-DR',
      payment_rec.payment_date,
      'Payment received - ' || loan_rec.loan_number || ' - ' || payment_rec.payment_method || ' - ' || payment_rec.reference_number,
      cash_account,
      payment_rec.amount,
      0,
      'Payment Received',
      payment_rec.id,
      'Posted',
      'System',
      NOW(),
      NOW()
    );

    -- Insert CREDIT line: Loans Receivable (principal)
    INSERT INTO journal_entries (
      id,
      organization_id,
      entry_id,
      entry_date,
      description,
      account,
      debit,
      credit,
      reference_type,
      reference_id,
      status,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      org_id,
      'JE-PMT-' || TO_CHAR(payment_rec.payment_date, 'YYYY') || '-' || LPAD(entry_counter::TEXT, 4, '0') || '-CR1',
      payment_rec.payment_date,
      'Payment received - ' || loan_rec.loan_number || ' - Principal portion',
      '1200 - Loans Receivable',
      0,
      payment_rec.principal_amount,
      'Payment Received',
      payment_rec.id,
      'Posted',
      'System',
      NOW(),
      NOW()
    );

    -- Insert CREDIT line: Interest Income
    INSERT INTO journal_entries (
      id,
      organization_id,
      entry_id,
      entry_date,
      description,
      account,
      debit,
      credit,
      reference_type,
      reference_id,
      status,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      org_id,
      'JE-PMT-' || TO_CHAR(payment_rec.payment_date, 'YYYY') || '-' || LPAD(entry_counter::TEXT, 4, '0') || '-CR2',
      payment_rec.payment_date,
      'Payment received - ' || loan_rec.loan_number || ' - Interest income',
      '4100 - Interest Income',
      0,
      payment_rec.interest_amount,
      'Payment Received',
      payment_rec.id,
      'Posted',
      'System',
      NOW(),
      NOW()
    );

    entry_counter := entry_counter + 1;
  END LOOP;

  RAISE NOTICE 'Created % payment journal entries (% lines total)', entry_counter - 1, (entry_counter - 1) * 3;
END $$;

-- ==========================================
-- STEP 6: Update Chart of Accounts Balances
-- ==========================================

-- Update Loans Receivable balance (outstanding loans)
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(l.outstanding_balance), 0)
  FROM loans l
  WHERE l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
    AND l.status IN ('Active', 'In Arrears')
),
updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '1200';

-- Update Cash in Hand balance (from cash payments)
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(r.amount), 0)
  FROM repayments r
  WHERE r.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
    AND r.payment_method = 'Cash'
),
updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '1110';

-- Update M-Pesa Account balance
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(r.amount), 0)
  FROM repayments r
  WHERE r.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
    AND r.payment_method = 'M-Pesa'
),
updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '1130';

-- Update Cash at Bank balance (bank transfers minus disbursements)
UPDATE chart_of_accounts
SET balance = (
  (SELECT COALESCE(SUM(r.amount), 0)
   FROM repayments r
   WHERE r.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
     AND r.payment_method = 'Bank Transfer')
  -
  (SELECT COALESCE(SUM(l.principal_amount), 0)
   FROM loans l
   WHERE l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')
),
updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '1120';

-- Update Interest Income (total interest collected)
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(r.interest_amount), 0)
  FROM repayments r
  WHERE r.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
),
updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '4100';

-- Update Share Capital (assume initial capital funded all disbursements)
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(l.principal_amount), 0)
  FROM loans l
  WHERE l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
),
updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '3100';

-- ==========================================
-- STEP 7: VERIFICATION QUERIES
-- ==========================================

-- 1. Check Chart of Accounts balances
SELECT 
  account_code,
  account_name,
  account_type,
  TO_CHAR(balance, 'FM999,999,999.00') as balance_formatted,
  balance,
  updated_at
FROM chart_of_accounts
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND balance != 0
ORDER BY account_code;

-- 2. Count journal entries created
SELECT 
  reference_type,
  COUNT(*) as entry_count,
  TO_CHAR(SUM(debit), 'FM999,999,999.00') as total_debits,
  TO_CHAR(SUM(credit), 'FM999,999,999.00') as total_credits
FROM journal_entries
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND reference_type IN ('Loan Disbursement', 'Payment Received')
GROUP BY reference_type;

-- 3. Verify double-entry balancing by entry_id
SELECT 
  entry_id,
  entry_date,
  MAX(description) as description,
  TO_CHAR(SUM(debit), 'FM999,999,999.00') as total_debit,
  TO_CHAR(SUM(credit), 'FM999,999,999.00') as total_credit,
  SUM(debit) - SUM(credit) as difference
FROM journal_entries
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND reference_type IN ('Loan Disbursement', 'Payment Received')
GROUP BY entry_id, entry_date
HAVING SUM(debit) - SUM(credit) != 0
ORDER BY entry_date;

-- 4. Summary by account
SELECT 
  account,
  TO_CHAR(SUM(debit), 'FM999,999,999.00') as total_debits,
  TO_CHAR(SUM(credit), 'FM999,999,999.00') as total_credits,
  TO_CHAR(SUM(debit) - SUM(credit), 'FM999,999,999.00') as net_balance
FROM journal_entries
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND reference_type IN ('Loan Disbursement', 'Payment Received')
GROUP BY account
ORDER BY account;

-- ==========================================
-- SUMMARY OF WHAT THIS SCRIPT DOES
-- ==========================================
-- ✅ Adds missing columns to journal_entries table
-- ✅ Creates chart_of_accounts table with standard accounts
-- ✅ Generates 46 journal entry lines for 23 loan disbursements
-- ✅ Generates 69 journal entry lines for 23 payment receipts
-- ✅ Updates account balances in chart_of_accounts
-- ✅ Provides verification queries
--
-- EXPECTED RESULTS:
-- - Loans Receivable: ~KES 386,200 (outstanding balances)
-- - Interest Income: KES 70,800 (collected)
-- - Cash in Hand: ~KES 43,200 (cash payments)
-- - M-Pesa Account: ~KES 691,200 (M-Pesa payments)
-- - Cash at Bank: ~KES 96,400 (bank transfers minus disbursements)
-- - Share Capital: KES 1,150,000 (total capital deployed)
-- ==========================================
