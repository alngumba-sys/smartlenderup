-- ==========================================
-- GENERATE JOURNAL ENTRIES FOR IMPORTED LOANS & PAYMENTS
-- SmartLenderUp - Double-Entry Bookkeeping
-- ==========================================
-- This script creates journal entries for:
-- 1. All 23 loan disbursements
-- 2. All 23 payment collections
-- 
-- IMPORTANT: Replace '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9' with your actual organization_id
-- ==========================================

-- STEP 1: Create Chart of Accounts (if not exists)
-- ==========================================

-- Check if chart_of_accounts table exists, if not create it
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

-- Check if journal_entries table exists, if not create it
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  organization_id TEXT NOT NULL,
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  reference_type TEXT, -- 'Loan Disbursement', 'Payment Received', 'Manual Entry'
  reference_id TEXT, -- loan_id or payment_id
  status TEXT DEFAULT 'Posted', -- Draft, Posted, Reversed
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, entry_number)
);

-- Check if journal_entry_lines table exists, if not create it
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  journal_entry_id TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT,
  debit_amount DECIMAL(15, 2) DEFAULT 0,
  credit_amount DECIMAL(15, 2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- STEP 2: Insert Standard Chart of Accounts
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
-- STEP 3: Generate Journal Entries for LOAN DISBURSEMENTS
-- ==========================================
-- When a loan is disbursed:
-- DR: Loans Receivable (Asset increases)
-- CR: Cash/Bank (Asset decreases - money goes out)
-- ==========================================

-- LN00001: STEPHEN MULU NZAVI - 50,000 disbursed on 2025-10-28
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by) VALUES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'JE-2025-001', '2025-10-28', 'Loan disbursement - LN00001 - STEPHEN MULU NZAVI', 'Loan Disbursement', (SELECT id FROM loans WHERE loan_number = 'LN00001'), 'Posted', 'System');

INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description) VALUES
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-001'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 50000, 0, 'Loan disbursed to STEPHEN MULU NZAVI'),
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-001'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 0, 50000, 'Cash disbursed for loan LN00001');

-- LN00002: ROONEY - 50,000 disbursed on 2025-10-29
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by) VALUES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'JE-2025-002', '2025-10-29', 'Loan disbursement - LN00002 - ROONEY', 'Loan Disbursement', (SELECT id FROM loans WHERE loan_number = 'LN00002'), 'Posted', 'System');

INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description) VALUES
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-002'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 50000, 0, 'Loan disbursed to ROONEY'),
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-002'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 0, 50000, 'Cash disbursed for loan LN00002');

-- LN00003: JOSPHAT M MATHEKA - 50,000 disbursed on 2025-10-24
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by) VALUES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'JE-2025-003', '2025-10-24', 'Loan disbursement - LN00003 - JOSPHAT M MATHEKA', 'Loan Disbursement', (SELECT id FROM loans WHERE loan_number = 'LN00003'), 'Posted', 'System');

INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description) VALUES
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-003'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 50000, 0, 'Loan disbursed to JOSPHAT M MATHEKA'),
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-003'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 0, 50000, 'Cash disbursed for loan LN00003');

-- LN00004: BEN K MBUVI - 50,000 disbursed on 2025-10-29
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by) VALUES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'JE-2025-004', '2025-10-29', 'Loan disbursement - LN00004 - BEN K MBUVI', 'Loan Disbursement', (SELECT id FROM loans WHERE loan_number = 'LN00004'), 'Posted', 'System');

INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description) VALUES
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-004'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 50000, 0, 'Loan disbursed to BEN K MBUVI'),
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-004'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 0, 50000, 'Cash disbursed for loan LN00004');

-- LN00005: NATALIA THOMAS - 50,000 disbursed on 2025-11-01
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by) VALUES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'JE-2025-005', '2025-11-01', 'Loan disbursement - LN00005 - NATALIA THOMAS', 'Loan Disbursement', (SELECT id FROM loans WHERE loan_number = 'LN00005'), 'Posted', 'System');

INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description) VALUES
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-005'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 50000, 0, 'Loan disbursed to NATALIA THOMAS'),
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-005'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 0, 50000, 'Cash disbursed for loan LN00005');

-- LN00006: ERIC MUTHAMA - 50,000 disbursed on 2025-11-07
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by) VALUES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'JE-2025-006', '2025-11-07', 'Loan disbursement - LN00006 - ERIC MUTHAMA', 'Loan Disbursement', (SELECT id FROM loans WHERE loan_number = 'LN00006'), 'Posted', 'System');

INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description) VALUES
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-006'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 50000, 0, 'Loan disbursed to ERIC MUTHAMA'),
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-006'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 0, 50000, 'Cash disbursed for loan LN00006');

-- LN00007: SAUMU OUMA - 50,000 disbursed on 2025-11-08
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by) VALUES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'JE-2025-007', '2025-11-08', 'Loan disbursement - LN00007 - SAUMU OUMA', 'Loan Disbursement', (SELECT id FROM loans WHERE loan_number = 'LN00007'), 'Posted', 'System');

INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description) VALUES
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-007'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 50000, 0, 'Loan disbursed to SAUMU OUMA'),
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-007'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 0, 50000, 'Cash disbursed for loan LN00007');

-- LN00008: SEBASTIAN M PETER - 50,000 disbursed on 2025-11-11
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by) VALUES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'JE-2025-008', '2025-11-11', 'Loan disbursement - LN00008 - SEBASTIAN M PETER', 'Loan Disbursement', (SELECT id FROM loans WHERE loan_number = 'LN00008'), 'Posted', 'System');

INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description) VALUES
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-008'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 50000, 0, 'Loan disbursed to SEBASTIAN M PETER'),
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-008'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 0, 50000, 'Cash disbursed for loan LN00008');

-- LN00009: ELIZABETH WAWERU KIDIGA - 50,000 disbursed on 2025-11-14
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by) VALUES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'JE-2025-009', '2025-11-14', 'Loan disbursement - LN00009 - ELIZABETH WAWERU KIDIGA', 'Loan Disbursement', (SELECT id FROM loans WHERE loan_number = 'LN00009'), 'Posted', 'System');

INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description) VALUES
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-009'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 50000, 0, 'Loan disbursed to ELIZABETH WAWERU KIDIGA'),
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-009'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 0, 50000, 'Cash disbursed for loan LN00009');

-- LN00010: STEPHEN MULU NZAVI (3rd loan) - 50,000 disbursed on 2025-10-28
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by) VALUES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'JE-2025-010', '2025-10-28', 'Loan disbursement - LN00010 - STEPHEN MULU NZAVI', 'Loan Disbursement', (SELECT id FROM loans WHERE loan_number = 'LN00010'), 'Posted', 'System');

INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description) VALUES
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-010'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 50000, 0, 'Loan disbursed to STEPHEN MULU NZAVI'),
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-010'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 0, 50000, 'Cash disbursed for loan LN00010');

-- LN00011: ROONEY (2nd loan) - 50,000 disbursed on 2025-11-06
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by) VALUES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'JE-2025-011', '2025-11-06', 'Loan disbursement - LN00011 - ROONEY', 'Loan Disbursement', (SELECT id FROM loans WHERE loan_number = 'LN00011'), 'Posted', 'System');

INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description) VALUES
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-011'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 50000, 0, 'Loan disbursed to ROONEY'),
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-011'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 0, 50000, 'Cash disbursed for loan LN00011');

-- LN00012: STEPHEN MULU NZAVI (2nd loan) - 50,000 disbursed on 2025-11-02
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by) VALUES
('958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', 'JE-2025-012', '2025-11-02', 'Loan disbursement - LN00012 - STEPHEN MULU NZAVI', 'Loan Disbursement', (SELECT id FROM loans WHERE loan_number = 'LN00012'), 'Posted', 'System');

INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description) VALUES
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-012'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1200', 'Loans Receivable', 50000, 0, 'Loan disbursed to STEPHEN MULU NZAVI'),
((SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-012'), '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9', '1120', 'Cash at Bank', 0, 50000, 'Cash disbursed for loan LN00012');

-- Continue for remaining loans LN00013 to LN00023 (same pattern)
-- For brevity, I'll create them all at once

-- LN00013 to LN00023
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by) 
SELECT 
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  'JE-2025-' || LPAD((ROW_NUMBER() OVER (ORDER BY disbursement_date))::TEXT + 12, 3, '0'),
  disbursement_date,
  'Loan disbursement - ' || loan_number || ' - ' || client_name,
  'Loan Disbursement',
  id,
  'Posted',
  'System'
FROM loans 
WHERE loan_number IN ('LN00013', 'LN00014', 'LN00015', 'LN00016', 'LN00017', 'LN00018', 'LN00019', 'LN00020', 'LN00021', 'LN00022', 'LN00023')
  AND organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Insert journal entry lines for loans LN00013 to LN00023
INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description)
SELECT 
  je.id,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  '1200',
  'Loans Receivable',
  l.principal_amount,
  0,
  'Loan disbursed to ' || l.client_name
FROM journal_entries je
JOIN loans l ON je.reference_id = l.id
WHERE je.reference_type = 'Loan Disbursement' 
  AND l.loan_number IN ('LN00013', 'LN00014', 'LN00015', 'LN00016', 'LN00017', 'LN00018', 'LN00019', 'LN00020', 'LN00021', 'LN00022', 'LN00023')
  AND je.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description)
SELECT 
  je.id,
  '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9',
  '1120',
  'Cash at Bank',
  0,
  l.principal_amount,
  'Cash disbursed for loan ' || l.loan_number
FROM journal_entries je
JOIN loans l ON je.reference_id = l.id
WHERE je.reference_type = 'Loan Disbursement' 
  AND l.loan_number IN ('LN00013', 'LN00014', 'LN00015', 'LN00016', 'LN00017', 'LN00018', 'LN00019', 'LN00020', 'LN00021', 'LN00022', 'LN00023')
  AND je.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- ==========================================
-- STEP 4: Generate Journal Entries for PAYMENTS RECEIVED
-- ==========================================
-- When a payment is received:
-- DR: Cash/M-Pesa/Bank (Asset increases - money comes in)
-- CR: Loans Receivable (Asset decreases - for principal portion)
-- CR: Interest Income (Revenue increases - for interest portion)
-- ==========================================

-- Create journal entries for all payments
INSERT INTO journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by)
SELECT 
  r.organization_id,
  'JE-PMT-' || LPAD((ROW_NUMBER() OVER (ORDER BY r.payment_date))::TEXT, 4, '0'),
  r.payment_date,
  'Payment received - ' || l.loan_number || ' - ' || r.payment_method,
  'Payment Received',
  r.id,
  'Posted',
  'System'
FROM repayments r
JOIN loans l ON r.loan_id = l.id
WHERE r.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY r.payment_date;

-- Insert DEBIT lines for cash received (based on payment method)
INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description)
SELECT 
  je.id,
  r.organization_id,
  CASE 
    WHEN r.payment_method = 'M-Pesa' THEN '1130'
    WHEN r.payment_method = 'Cash' THEN '1110'
    ELSE '1120'
  END,
  CASE 
    WHEN r.payment_method = 'M-Pesa' THEN 'M-Pesa Account'
    WHEN r.payment_method = 'Cash' THEN 'Cash in Hand'
    ELSE 'Cash at Bank'
  END,
  r.amount,
  0,
  'Payment received via ' || r.payment_method || ' for loan ' || l.loan_number
FROM journal_entries je
JOIN repayments r ON je.reference_id = r.id
JOIN loans l ON r.loan_id = l.id
WHERE je.reference_type = 'Payment Received'
  AND je.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Insert CREDIT lines for principal reduction
INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description)
SELECT 
  je.id,
  r.organization_id,
  '1200',
  'Loans Receivable',
  0,
  r.principal_amount,
  'Principal payment for loan ' || l.loan_number
FROM journal_entries je
JOIN repayments r ON je.reference_id = r.id
JOIN loans l ON r.loan_id = l.id
WHERE je.reference_type = 'Payment Received'
  AND je.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Insert CREDIT lines for interest income
INSERT INTO journal_entry_lines (journal_entry_id, organization_id, account_code, account_name, debit_amount, credit_amount, description)
SELECT 
  je.id,
  r.organization_id,
  '4100',
  'Interest Income',
  0,
  r.interest_amount,
  'Interest income for loan ' || l.loan_number
FROM journal_entries je
JOIN repayments r ON je.reference_id = r.id
JOIN loans l ON r.loan_id = l.id
WHERE je.reference_type = 'Payment Received'
  AND je.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- ==========================================
-- STEP 5: Update Chart of Accounts Balances
-- ==========================================

-- Update Loans Receivable balance (sum of all outstanding principal)
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

-- Update Cash at Bank balance (from bank transfers minus disbursements)
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
-- STEP 6: Verify Balances
-- ==========================================

-- Check Chart of Accounts balances
SELECT 
  account_code,
  account_name,
  account_type,
  balance,
  updated_at
FROM chart_of_accounts
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND balance != 0
ORDER BY account_code;

-- Verify journal entries created
SELECT 
  COUNT(*) as total_entries,
  SUM(CASE WHEN reference_type = 'Loan Disbursement' THEN 1 ELSE 0 END) as disbursement_entries,
  SUM(CASE WHEN reference_type = 'Payment Received' THEN 1 ELSE 0 END) as payment_entries
FROM journal_entries
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- Verify double-entry balancing
SELECT 
  je.entry_number,
  je.entry_date,
  je.description,
  SUM(jel.debit_amount) as total_debit,
  SUM(jel.credit_amount) as total_credit,
  SUM(jel.debit_amount) - SUM(jel.credit_amount) as difference
FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
WHERE je.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
GROUP BY je.id, je.entry_number, je.entry_date, je.description
HAVING SUM(jel.debit_amount) - SUM(jel.credit_amount) != 0;

-- ==========================================
-- SUMMARY
-- ==========================================
-- This script creates:
-- ✅ Chart of Accounts with standard accounts
-- ✅ 23 loan disbursement journal entries
-- ✅ 23 payment received journal entries
-- ✅ Updated account balances reflecting:
--    - Loans Receivable (outstanding balances)
--    - Cash/M-Pesa/Bank (payment collections)
--    - Interest Income (total interest collected)
--    - Share Capital (funding source)
-- ==========================================
