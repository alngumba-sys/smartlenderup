-- SmartLenderUp Complete Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ORGANIZATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name TEXT NOT NULL,
  registration_number TEXT,
  industry TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  country TEXT NOT NULL,
  currency TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternative_phone TEXT,
  website TEXT,
  county TEXT NOT NULL,
  town TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT,
  date_of_incorporation DATE NOT NULL,
  organization_logo TEXT,
  contact_person_first_name TEXT NOT NULL,
  contact_person_last_name TEXT NOT NULL,
  contact_person_title TEXT NOT NULL,
  contact_person_email TEXT NOT NULL UNIQUE,
  contact_person_phone TEXT NOT NULL,
  number_of_employees INTEGER,
  expected_clients INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CLIENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  marital_status TEXT NOT NULL,
  number_of_dependents INTEGER NOT NULL,
  county TEXT NOT NULL,
  town TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT,
  occupation TEXT NOT NULL,
  employer TEXT,
  monthly_income NUMERIC(15, 2) NOT NULL,
  other_income NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  kyc_status TEXT NOT NULL,
  risk_rating TEXT NOT NULL,
  date_registered DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, id_number)
);

CREATE INDEX idx_clients_organization ON clients(organization_id);
CREATE INDEX idx_clients_status ON clients(status);

-- =============================================
-- LOAN PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS loan_products (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  min_amount NUMERIC(15, 2) NOT NULL,
  max_amount NUMERIC(15, 2) NOT NULL,
  interest_rate NUMERIC(5, 2) NOT NULL,
  min_term INTEGER NOT NULL,
  max_term INTEGER NOT NULL,
  processing_fee_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
  guarantor_required BOOLEAN NOT NULL DEFAULT false,
  collateral_required BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loan_products_organization ON loan_products(organization_id);

-- =============================================
-- LOANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  loan_product_id TEXT NOT NULL REFERENCES loan_products(id),
  amount NUMERIC(15, 2) NOT NULL,
  interest_rate NUMERIC(5, 2) NOT NULL,
  term_months INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL,
  application_date DATE NOT NULL,
  approval_date DATE,
  disbursement_date DATE,
  first_payment_date DATE,
  total_payable NUMERIC(15, 2) NOT NULL,
  monthly_payment NUMERIC(15, 2) NOT NULL,
  balance NUMERIC(15, 2) NOT NULL,
  principal_paid NUMERIC(15, 2) NOT NULL DEFAULT 0,
  interest_paid NUMERIC(15, 2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  guarantor_required BOOLEAN NOT NULL DEFAULT false,
  collateral_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loans_organization ON loans(organization_id);
CREATE INDEX idx_loans_client ON loans(client_id);
CREATE INDEX idx_loans_status ON loans(status);

-- =============================================
-- REPAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS repayments (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  principal_amount NUMERIC(15, 2) NOT NULL,
  interest_amount NUMERIC(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_repayments_organization ON repayments(organization_id);
CREATE INDEX idx_repayments_loan ON repayments(loan_id);

-- =============================================
-- SAVINGS ACCOUNTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS savings_accounts (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  account_type TEXT NOT NULL,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  interest_rate NUMERIC(5, 2) NOT NULL,
  status TEXT NOT NULL,
  opening_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, account_number)
);

CREATE INDEX idx_savings_accounts_organization ON savings_accounts(organization_id);
CREATE INDEX idx_savings_accounts_client ON savings_accounts(client_id);

-- =============================================
-- SAVINGS TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS savings_transactions (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES savings_accounts(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  balance_after NUMERIC(15, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  reference_number TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_savings_transactions_organization ON savings_transactions(organization_id);
CREATE INDEX idx_savings_transactions_account ON savings_transactions(account_id);

-- =============================================
-- SHAREHOLDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS shareholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shareholder_id TEXT NOT NULL,
  name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  shares INTEGER NOT NULL,
  share_value NUMERIC(15, 2) NOT NULL,
  total_investment NUMERIC(15, 2) NOT NULL,
  join_date DATE NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, shareholder_id)
);

CREATE INDEX idx_shareholders_organization ON shareholders(organization_id);

-- =============================================
-- SHAREHOLDER TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS shareholder_transactions (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shareholder_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  shares INTEGER NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shareholder_transactions_organization ON shareholder_transactions(organization_id);
CREATE INDEX idx_shareholder_transactions_shareholder ON shareholder_transactions(shareholder_id);

-- =============================================
-- PAYEES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payees (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payees_organization ON payees(organization_id);

-- =============================================
-- EXPENSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  expense_id TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  payee_id TEXT REFERENCES payees(id),
  payment_method TEXT NOT NULL,
  payment_date DATE NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, expense_id)
);

CREATE INDEX idx_expenses_organization ON expenses(organization_id);

-- =============================================
-- BANK ACCOUNTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  branch TEXT,
  account_type TEXT NOT NULL,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bank_accounts_organization ON bank_accounts(organization_id);

-- =============================================
-- TASKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_organization ON tasks(organization_id);

-- =============================================
-- KYC RECORDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS kyc_records (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  status TEXT NOT NULL,
  verified_date DATE,
  verified_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kyc_records_organization ON kyc_records(organization_id);
CREATE INDEX idx_kyc_records_client ON kyc_records(client_id);

-- =============================================
-- APPROVALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  approver_role TEXT NOT NULL,
  approver_name TEXT,
  status TEXT NOT NULL,
  decision TEXT,
  comments TEXT,
  decision_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approvals_organization ON approvals(organization_id);
CREATE INDEX idx_approvals_loan ON approvals(loan_id);

-- =============================================
-- FUNDING TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS funding_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL,
  source TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, transaction_id)
);

CREATE INDEX idx_funding_transactions_organization ON funding_transactions(organization_id);

-- =============================================
-- PROCESSING FEE RECORDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS processing_fee_records (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  fee_amount NUMERIC(15, 2) NOT NULL,
  collected_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_processing_fee_records_organization ON processing_fee_records(organization_id);
CREATE INDEX idx_processing_fee_records_loan ON processing_fee_records(loan_id);

-- =============================================
-- DISBURSEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS disbursements (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  disbursement_date DATE NOT NULL,
  method TEXT NOT NULL,
  reference_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_disbursements_organization ON disbursements(organization_id);
CREATE INDEX idx_disbursements_loan ON disbursements(loan_id);

-- =============================================
-- PAYROLL RUNS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  run_id TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  total_gross NUMERIC(15, 2) NOT NULL,
  total_deductions NUMERIC(15, 2) NOT NULL,
  total_net NUMERIC(15, 2) NOT NULL,
  status TEXT NOT NULL,
  processed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, run_id)
);

CREATE INDEX idx_payroll_runs_organization ON payroll_runs(organization_id);

-- =============================================
-- JOURNAL ENTRIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entry_id TEXT NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  account TEXT NOT NULL,
  debit NUMERIC(15, 2) NOT NULL DEFAULT 0,
  credit NUMERIC(15, 2) NOT NULL DEFAULT 0,
  reference_type TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_journal_entries_organization ON journal_entries(organization_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);

-- =============================================
-- AUDIT LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  performed_by TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- =============================================
-- TICKETS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  raised_by TEXT NOT NULL,
  assigned_to TEXT,
  created_date DATE NOT NULL,
  resolved_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, ticket_id)
);

CREATE INDEX idx_tickets_organization ON tickets(organization_id);

-- =============================================
-- GROUPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL,
  name TEXT NOT NULL,
  registration_date DATE NOT NULL,
  chairperson TEXT NOT NULL,
  secretary TEXT NOT NULL,
  treasurer TEXT NOT NULL,
  member_count INTEGER NOT NULL,
  total_savings NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, group_id)
);

CREATE INDEX idx_groups_organization ON groups(organization_id);

-- =============================================
-- GUARANTORS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS guarantors (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guarantors_organization ON guarantors(organization_id);
CREATE INDEX idx_guarantors_loan ON guarantors(loan_id);

-- =============================================
-- COLLATERALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS collaterals (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_value NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collaterals_organization ON collaterals(organization_id);
CREATE INDEX idx_collaterals_loan ON collaterals(loan_id);

-- =============================================
-- LOAN DOCUMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS loan_documents (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loan_documents_organization ON loan_documents(organization_id);
CREATE INDEX idx_loan_documents_loan ON loan_documents(loan_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_products_updated_at BEFORE UPDATE ON loan_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repayments_updated_at BEFORE UPDATE ON repayments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_accounts_updated_at BEFORE UPDATE ON savings_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_transactions_updated_at BEFORE UPDATE ON savings_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shareholders_updated_at BEFORE UPDATE ON shareholders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shareholder_transactions_updated_at BEFORE UPDATE ON shareholder_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payees_updated_at BEFORE UPDATE ON payees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kyc_records_updated_at BEFORE UPDATE ON kyc_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_funding_transactions_updated_at BEFORE UPDATE ON funding_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processing_fee_records_updated_at BEFORE UPDATE ON processing_fee_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disbursements_updated_at BEFORE UPDATE ON disbursements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON payroll_runs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guarantors_updated_at BEFORE UPDATE ON guarantors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collaterals_updated_at BEFORE UPDATE ON collaterals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_documents_updated_at BEFORE UPDATE ON loan_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareholder_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payees ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaterals ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_documents ENABLE ROW LEVEL SECURITY;

-- For now, allow all authenticated users to access all data
-- You can customize these policies based on your security requirements

CREATE POLICY "Allow all for authenticated users" ON organizations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON loans FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON loan_products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON repayments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON savings_accounts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON savings_transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON shareholders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON shareholder_transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON payees FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON bank_accounts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON kyc_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON approvals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON funding_transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON processing_fee_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON disbursements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON payroll_runs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON journal_entries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON audit_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON tickets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON groups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON guarantors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON collaterals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON loan_documents FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ SmartLenderUp database schema created successfully!';
  RAISE NOTICE '📊 Total tables created: 25';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '⏰ Auto-update triggers configured';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Get your Supabase Anon Key from: https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/settings/api';
  RAISE NOTICE '2. Update /lib/supabaseClient.ts with your anon key';
  RAISE NOTICE '3. The system will automatically sync all data to Supabase';
END $$;