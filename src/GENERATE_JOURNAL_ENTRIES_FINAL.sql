-- ==========================================
-- GENERATE JOURNAL ENTRIES - FINAL VERSION
-- SmartLenderUp - Double-Entry Bookkeeping
-- ==========================================
-- IMPORTANT: Replace '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9' with your actual organization_id
-- ==========================================

-- STEP 1: Verify/Create journal_entries table structure
-- ==========================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  organization_id TEXT NOT NULL,
  entry_number TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT,
  reference TEXT,
  source_type TEXT,
  source_id TEXT,
  total_debit DECIMAL(15, 2) DEFAULT 0,
  total_credit DECIMAL(15, 2) DEFAULT 0,
  status TEXT DEFAULT 'Posted',
  created_by TEXT,
  created_date TEXT,
  posted_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Create journal_entry_lines table
-- ==========================================

CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  journal_entry_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  description TEXT,
  debit DECIMAL(15, 2) DEFAULT 0,
  credit DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
);

-- STEP 3: Create Chart of Accounts
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

-- STEP 4: Insert Standard Chart of Accounts
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
-- STEP 5: Show what we're processing
-- ==========================================

SELECT 
  '📊 LOANS TO PROCESS' as info,
  COUNT(*) as total_loans,
  'KES ' || TO_CHAR(SUM(COALESCE(amount, 0)), 'FM999,999,999.00') as total_principal
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;

SELECT 
  '📊 PAYMENTS TO PROCESS' as info,
  COUNT(*) as total_payments,
  'KES ' || TO_CHAR(SUM(amount), 'FM999,999,999.00') as total_amount,
  'KES ' || TO_CHAR(SUM(principal_amount), 'FM999,999,999.00') as total_principal,
  'KES ' || TO_CHAR(SUM(interest_amount), 'FM999,999,999.00') as total_interest
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;

-- ==========================================
-- STEP 6: Generate Journal Entries for LOAN DISBURSEMENTS
-- ==========================================

DO $$
DECLARE
  loan_rec RECORD;
  entry_counter INTEGER := 1;
  org_id UUID := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;
  je_id TEXT;
  entry_num TEXT;
  entry_date TEXT;
BEGIN
  FOR loan_rec IN 
    SELECT 
      l.id::TEXT as loan_id,
      l.loan_number,
      l.amount as loan_amount,
      COALESCE(l.disbursement_date, l.approval_date, l.created_at)::DATE as disburse_date,
      COALESCE(c.name, c.first_name || ' ' || COALESCE(c.last_name, ''), 'Client') as client_display
    FROM loans l
    LEFT JOIN clients c ON l.client_id = c.id
    WHERE l.organization_id = org_id
    ORDER BY COALESCE(l.disbursement_date, l.approval_date, l.created_at), l.loan_number
  LOOP
    je_id := gen_random_uuid()::TEXT;
    entry_num := 'JE-DISB-' || LPAD(entry_counter::TEXT, 4, '0');
    entry_date := loan_rec.disburse_date::TEXT;
    
    -- Insert journal entry header
    INSERT INTO journal_entries (
      id, organization_id, entry_number, date, description, reference,
      source_type, source_id, total_debit, total_credit, status, 
      created_by, created_date, posted_date
    ) VALUES (
      je_id,
      org_id::TEXT,
      entry_num,
      entry_date,
      'Loan disbursement - ' || loan_rec.loan_number || ' - ' || loan_rec.client_display,
      loan_rec.loan_number,
      'Loan Disbursement',
      loan_rec.loan_id,
      loan_rec.loan_amount,
      loan_rec.loan_amount,
      'Posted',
      'System',
      entry_date,
      entry_date
    );

    -- Insert journal entry lines
    -- Line 1: DEBIT Loans Receivable
    INSERT INTO journal_entry_lines (
      id, journal_entry_id, organization_id, account_code, account_name,
      description, debit, credit
    ) VALUES (
      gen_random_uuid()::TEXT,
      je_id,
      org_id::TEXT,
      '1200',
      'Loans Receivable',
      'Loan disbursed to ' || loan_rec.client_display,
      loan_rec.loan_amount,
      0
    );

    -- Line 2: CREDIT Cash at Bank
    INSERT INTO journal_entry_lines (
      id, journal_entry_id, organization_id, account_code, account_name,
      description, debit, credit
    ) VALUES (
      gen_random_uuid()::TEXT,
      je_id,
      org_id::TEXT,
      '1120',
      'Cash at Bank',
      'Cash disbursed for ' || loan_rec.loan_number,
      0,
      loan_rec.loan_amount
    );

    entry_counter := entry_counter + 1;
  END LOOP;

  RAISE NOTICE '✅ Created % loan disbursement entries', entry_counter - 1;
END $$;

-- ==========================================
-- STEP 7: Generate Journal Entries for PAYMENTS
-- ==========================================

DO $$
DECLARE
  payment_rec RECORD;
  entry_counter INTEGER := 1;
  org_id UUID := '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID;
  je_id TEXT;
  entry_num TEXT;
  entry_date TEXT;
  cash_account_code TEXT;
  cash_account_name TEXT;
BEGIN
  FOR payment_rec IN 
    SELECT 
      r.id::TEXT as payment_id,
      r.amount,
      r.principal_amount,
      r.interest_amount,
      r.payment_date::DATE as pay_date,
      r.payment_method,
      r.transaction_ref,
      l.loan_number,
      COALESCE(c.name, c.first_name || ' ' || COALESCE(c.last_name, ''), 'Client') as client_display
    FROM repayments r
    JOIN loans l ON r.loan_id = l.id
    LEFT JOIN clients c ON r.client_id = c.id
    WHERE r.organization_id = org_id
    ORDER BY r.payment_date
  LOOP
    je_id := gen_random_uuid()::TEXT;
    entry_num := 'JE-PMT-' || LPAD(entry_counter::TEXT, 4, '0');
    entry_date := payment_rec.pay_date::TEXT;
    
    -- Determine cash account based on payment method
    IF payment_rec.payment_method = 'M-Pesa' THEN
      cash_account_code := '1130';
      cash_account_name := 'M-Pesa Account';
    ELSIF payment_rec.payment_method = 'Cash' THEN
      cash_account_code := '1110';
      cash_account_name := 'Cash in Hand';
    ELSE
      cash_account_code := '1120';
      cash_account_name := 'Cash at Bank';
    END IF;

    -- Insert journal entry header
    INSERT INTO journal_entries (
      id, organization_id, entry_number, date, description, reference,
      source_type, source_id, total_debit, total_credit, status,
      created_by, created_date, posted_date
    ) VALUES (
      je_id,
      org_id::TEXT,
      entry_num,
      entry_date,
      'Payment received - ' || payment_rec.loan_number || ' - ' || payment_rec.payment_method,
      payment_rec.transaction_ref,
      'Loan Repayment',
      payment_rec.payment_id,
      payment_rec.amount,
      payment_rec.amount,
      'Posted',
      'System',
      entry_date,
      entry_date
    );

    -- Line 1: DEBIT Cash (received)
    INSERT INTO journal_entry_lines (
      id, journal_entry_id, organization_id, account_code, account_name,
      description, debit, credit
    ) VALUES (
      gen_random_uuid()::TEXT,
      je_id,
      org_id::TEXT,
      cash_account_code,
      cash_account_name,
      'Payment received from ' || payment_rec.client_display,
      payment_rec.amount,
      0
    );

    -- Line 2: CREDIT Loans Receivable (principal portion)
    INSERT INTO journal_entry_lines (
      id, journal_entry_id, organization_id, account_code, account_name,
      description, debit, credit
    ) VALUES (
      gen_random_uuid()::TEXT,
      je_id,
      org_id::TEXT,
      '1200',
      'Loans Receivable',
      'Principal payment - ' || payment_rec.loan_number,
      0,
      payment_rec.principal_amount
    );

    -- Line 3: CREDIT Interest Income
    INSERT INTO journal_entry_lines (
      id, journal_entry_id, organization_id, account_code, account_name,
      description, debit, credit
    ) VALUES (
      gen_random_uuid()::TEXT,
      je_id,
      org_id::TEXT,
      '4100',
      'Interest Income',
      'Interest payment - ' || payment_rec.loan_number,
      0,
      payment_rec.interest_amount
    );

    entry_counter := entry_counter + 1;
  END LOOP;

  RAISE NOTICE '✅ Created % payment entries', entry_counter - 1;
END $$;

-- ==========================================
-- STEP 8: Update Chart of Accounts Balances
-- ==========================================

-- Loans Receivable (sum of outstanding balances)
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(outstanding_balance), 0)
  FROM loans
  WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
    AND status IN ('Active', 'In Arrears')
), updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '1200';

-- Cash in Hand (from cash payments)
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(amount), 0)
  FROM repayments
  WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
    AND payment_method = 'Cash'
), updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '1110';

-- M-Pesa Account (from M-Pesa payments)
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(amount), 0)
  FROM repayments
  WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
    AND payment_method = 'M-Pesa'
), updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '1130';

-- Cash at Bank (bank transfers minus total disbursements)
UPDATE chart_of_accounts
SET balance = (
  (SELECT COALESCE(SUM(amount), 0)
   FROM repayments
   WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
     AND payment_method IN ('Bank Transfer', 'Bank'))
  -
  (SELECT COALESCE(SUM(amount), 0)
   FROM loans
   WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID)
), updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '1120';

-- Interest Income (total interest collected)
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(interest_amount), 0)
  FROM repayments
  WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
), updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '4100';

-- Share Capital (total capital deployed)
UPDATE chart_of_accounts
SET balance = (
  SELECT COALESCE(SUM(amount), 0)
  FROM loans
  WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'::UUID
), updated_at = NOW()
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND account_code = '3100';

-- ==========================================
-- STEP 9: VERIFICATION & RESULTS
-- ==========================================

SELECT '═══════════════════════════════════════════════════════════' as divider;
SELECT '✅ CHART OF ACCOUNTS - UPDATED BALANCES' as report_title;
SELECT '═══════════════════════════════════════════════════════════' as divider;

SELECT 
  account_code,
  account_name,
  account_type,
  'KES ' || TO_CHAR(balance, 'FM999,999,999.00') as balance
FROM chart_of_accounts
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND balance != 0
ORDER BY account_code;

SELECT '═══════════════════════════════════════════════════════════' as divider;
SELECT '✅ JOURNAL ENTRIES CREATED' as report_title;
SELECT '═══════════════════════════════════════════════════════════' as divider;

SELECT 
  source_type,
  COUNT(*) as total_entries,
  'KES ' || TO_CHAR(SUM(total_debit), 'FM999,999,999.00') as total_debits,
  'KES ' || TO_CHAR(SUM(total_credit), 'FM999,999,999.00') as total_credits
FROM journal_entries
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND source_type IN ('Loan Disbursement', 'Loan Repayment')
GROUP BY source_type;

SELECT '═══════════════════════════════════════════════════════════' as divider;
SELECT '✅ JOURNAL ENTRY LINES BY ACCOUNT' as report_title;
SELECT '═══════════════════════════════════════════════════════════' as divider;

SELECT 
  account_code,
  account_name,
  'KES ' || TO_CHAR(SUM(debit), 'FM999,999,999.00') as total_debits,
  'KES ' || TO_CHAR(SUM(credit), 'FM999,999,999.00') as total_credits,
  'KES ' || TO_CHAR(SUM(debit) - SUM(credit), 'FM999,999,999.00') as net_balance
FROM journal_entry_lines
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
GROUP BY account_code, account_name
ORDER BY account_code;

SELECT '═══════════════════════════════════════════════════════════' as divider;
SELECT '✅ SAMPLE JOURNAL ENTRIES' as report_title;
SELECT '═══════════════════════════════════════════════════════════' as divider;

SELECT 
  je.entry_number,
  je.date,
  LEFT(je.description, 50) as description,
  'KES ' || TO_CHAR(je.total_debit, 'FM999,999,999.00') as total_debit,
  'KES ' || TO_CHAR(je.total_credit, 'FM999,999,999.00') as total_credit
FROM journal_entries je
WHERE je.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND je.source_type IN ('Loan Disbursement', 'Loan Repayment')
ORDER BY je.date, je.entry_number
LIMIT 10;

SELECT '═══════════════════════════════════════════════════════════' as divider;
SELECT '✅ SAMPLE JOURNAL ENTRY LINES' as report_title;
SELECT '═══════════════════════════════════════════════════════════' as divider;

SELECT 
  je.entry_number,
  jel.account_code,
  jel.account_name,
  LEFT(jel.description, 40) as description,
  'KES ' || TO_CHAR(jel.debit, 'FM999,999,999.00') as debit,
  'KES ' || TO_CHAR(jel.credit, 'FM999,999,999.00') as credit
FROM journal_entry_lines jel
JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE jel.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY je.date, je.entry_number, jel.debit DESC
LIMIT 15;

SELECT '═══════════════════════════════════════════════════════════' as divider;
SELECT '🎉 SUCCESS! Journal entries have been generated.' as status;
SELECT 'Total Entries: ' || (SELECT COUNT(*) FROM journal_entries WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')::TEXT as summary;
SELECT 'Total Lines: ' || (SELECT COUNT(*) FROM journal_entry_lines WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9')::TEXT as detail;
SELECT 'Your Chart of Accounts now reflects all imported loan and payment data.' as message;
SELECT 'Refresh your dashboard to see the updated financial reports!' as next_step;
SELECT '═══════════════════════════════════════════════════════════' as divider;
