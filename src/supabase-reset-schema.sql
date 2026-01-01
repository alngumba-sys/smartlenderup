-- ============================================
-- SMARTLENDERUP MICROFINANCE PLATFORM
-- Complete Supabase Database Reset Script
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING TABLES
-- ============================================

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS processing_fee_records CASCADE;
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS journal_entry_lines CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS payroll_records CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS funding_transactions CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS payees CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS shareholder_transactions CASCADE;
DROP TABLE IF EXISTS shareholders CASCADE;
DROP TABLE IF EXISTS savings_transactions CASCADE;
DROP TABLE IF EXISTS savings_accounts CASCADE;
DROP TABLE IF EXISTS repayments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS loan_products CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS subscription_payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;

-- ============================================
-- STEP 2: CREATE TABLES
-- ============================================

-- User Settings (stores user preferences and configuration)
CREATE TABLE user_settings (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country TEXT NOT NULL DEFAULT 'Kenya',
  currency TEXT NOT NULL DEFAULT 'KES',
  organization_name TEXT,
  logo_url TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions (14-day trial and paid subscriptions)
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'trial',
  status TEXT NOT NULL DEFAULT 'active',
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  days_remaining INTEGER DEFAULT 14,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Payments (Stripe payment records)
CREATE TABLE subscription_payments (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branches
CREATE TABLE branches (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  location TEXT,
  manager TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'Active',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  id_number TEXT,
  address TEXT,
  city TEXT,
  county TEXT,
  occupation TEXT,
  employer TEXT,
  monthly_income NUMERIC(15, 2) DEFAULT 0,
  date_of_birth DATE,
  gender TEXT,
  marital_status TEXT,
  next_of_kin JSONB,
  status TEXT DEFAULT 'Active',
  photo TEXT,
  documents JSONB,
  group_membership JSONB,
  credit_score INTEGER,
  risk_rating TEXT,
  client_type TEXT DEFAULT 'individual',
  business_type TEXT,
  branch TEXT,
  join_date DATE,
  created_by TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups (for group lending)
CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  registration_number TEXT,
  registration_date DATE,
  meeting_day TEXT,
  meeting_location TEXT,
  chairman_name TEXT,
  chairman_phone TEXT,
  secretary_name TEXT,
  secretary_phone TEXT,
  treasurer_name TEXT,
  treasurer_phone TEXT,
  member_count INTEGER DEFAULT 0,
  total_savings NUMERIC(15, 2) DEFAULT 0,
  total_loans NUMERIC(15, 2) DEFAULT 0,
  status TEXT DEFAULT 'Active',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Products
CREATE TABLE loan_products (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  min_amount NUMERIC(15, 2),
  max_amount NUMERIC(15, 2),
  interest_rate NUMERIC(5, 2),
  interest_type TEXT DEFAULT 'Reducing Balance',
  min_term INTEGER,
  max_term INTEGER,
  term_unit TEXT DEFAULT 'Months',
  repayment_frequency TEXT DEFAULT 'Monthly',
  processing_fee NUMERIC(10, 2) DEFAULT 0,
  processing_fee_type TEXT DEFAULT 'Fixed',
  insurance_required BOOLEAN DEFAULT false,
  insurance_rate NUMERIC(5, 2),
  collateral_required BOOLEAN DEFAULT false,
  guarantor_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Active',
  created_by TEXT,
  created_date DATE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans
CREATE TABLE loans (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT,
  product_id TEXT REFERENCES loan_products(id) ON DELETE SET NULL,
  product_name TEXT,
  principal_amount NUMERIC(15, 2) NOT NULL,
  interest_rate NUMERIC(5, 2) NOT NULL,
  interest_type TEXT DEFAULT 'Reducing Balance',
  term INTEGER NOT NULL,
  term_unit TEXT DEFAULT 'Months',
  repayment_frequency TEXT DEFAULT 'Monthly',
  disbursement_date DATE,
  first_repayment_date DATE,
  maturity_date DATE,
  status TEXT DEFAULT 'Pending',
  approved_by TEXT,
  approved_date DATE,
  disbursed_by TEXT,
  disbursed_date DATE,
  payment_source TEXT,
  collateral JSONB,
  guarantors JSONB,
  total_interest NUMERIC(15, 2) DEFAULT 0,
  total_repayable NUMERIC(15, 2) DEFAULT 0,
  installment_amount NUMERIC(15, 2) DEFAULT 0,
  number_of_installments INTEGER DEFAULT 0,
  paid_amount NUMERIC(15, 2) DEFAULT 0,
  outstanding_balance NUMERIC(15, 2) DEFAULT 0,
  principal_outstanding NUMERIC(15, 2),
  interest_outstanding NUMERIC(15, 2),
  days_in_arrears INTEGER DEFAULT 0,
  arrears_amount NUMERIC(15, 2) DEFAULT 0,
  overdue_amount NUMERIC(15, 2),
  penalty_amount NUMERIC(15, 2) DEFAULT 0,
  purpose TEXT,
  application_date DATE,
  created_by TEXT,
  last_payment_date DATE,
  last_payment_amount NUMERIC(15, 2),
  next_payment_date DATE,
  next_payment_amount NUMERIC(15, 2),
  loan_officer TEXT,
  notes TEXT,
  created_date DATE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repayments
CREATE TABLE repayments (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT,
  amount NUMERIC(15, 2) NOT NULL,
  principal NUMERIC(15, 2) DEFAULT 0,
  interest NUMERIC(15, 2) DEFAULT 0,
  penalty NUMERIC(15, 2) DEFAULT 0,
  payment_method TEXT,
  payment_reference TEXT,
  payment_date DATE NOT NULL,
  receipt_number TEXT,
  received_by TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Pending',
  approved_by TEXT,
  approved_date DATE,
  bank_account_id TEXT,
  created_date DATE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Savings Accounts
CREATE TABLE savings_accounts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT,
  account_type TEXT DEFAULT 'Regular Savings',
  balance NUMERIC(15, 2) DEFAULT 0,
  available_balance NUMERIC(15, 2) DEFAULT 0,
  interest_rate NUMERIC(5, 2) DEFAULT 0,
  minimum_balance NUMERIC(15, 2) DEFAULT 0,
  opening_date DATE,
  maturity_date DATE,
  status TEXT DEFAULT 'Active',
  total_deposits NUMERIC(15, 2) DEFAULT 0,
  total_withdrawals NUMERIC(15, 2) DEFAULT 0,
  interest_earned NUMERIC(15, 2) DEFAULT 0,
  last_transaction_date DATE,
  notes TEXT,
  created_by TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Savings Transactions
CREATE TABLE savings_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES savings_accounts(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT,
  transaction_type TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  balance NUMERIC(15, 2) DEFAULT 0,
  transaction_date DATE NOT NULL,
  payment_method TEXT,
  reference TEXT,
  description TEXT,
  performed_by TEXT,
  status TEXT DEFAULT 'Pending',
  approved_by TEXT,
  approved_date DATE,
  created_date DATE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shareholders
CREATE TABLE shareholders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  id_number TEXT,
  address TEXT,
  share_capital NUMERIC(15, 2) DEFAULT 0,
  ownership_percentage NUMERIC(5, 2) DEFAULT 0,
  join_date DATE,
  status TEXT DEFAULT 'Active',
  total_dividends NUMERIC(15, 2) DEFAULT 0,
  bank_account JSONB DEFAULT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shareholder Transactions
CREATE TABLE shareholder_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shareholder_id TEXT NOT NULL REFERENCES shareholders(id) ON DELETE CASCADE,
  shareholder_name TEXT,
  transaction_type TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,
  transaction_date DATE NOT NULL,
  receipt_number TEXT,
  processed_by TEXT,
  notes TEXT,
  bank_account_id TEXT,
  created_date DATE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payees
CREATE TABLE payees (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  bank_name TEXT,
  account_number TEXT,
  total_paid NUMERIC(15, 2) DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_date DATE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  category TEXT NOT NULL,
  payee_id TEXT REFERENCES payees(id) ON DELETE SET NULL,
  payee_name TEXT,
  amount NUMERIC(15, 2) NOT NULL,
  payment_method TEXT,
  reference TEXT,
  description TEXT,
  receipt_number TEXT,
  status TEXT DEFAULT 'Pending',
  approved_by TEXT,
  approved_date DATE,
  paid_by TEXT,
  paid_date DATE,
  bank_account_id TEXT,
  created_by TEXT,
  created_date DATE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bank Accounts
CREATE TABLE bank_accounts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  branch TEXT,
  currency TEXT DEFAULT 'KES',
  balance NUMERIC(15, 2) DEFAULT 0,
  opening_balance NUMERIC(15, 2) DEFAULT 0,
  opening_date DATE,
  status TEXT DEFAULT 'Active',
  description TEXT,
  created_by TEXT,
  created_date DATE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funding Transactions (Capital injections and loan disbursements)
CREATE TABLE funding_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_account_id TEXT NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  date DATE NOT NULL,
  reference TEXT,
  description TEXT,
  source TEXT,
  shareholder_id TEXT REFERENCES shareholders(id) ON DELETE SET NULL,
  shareholder_name TEXT,
  payment_method TEXT,
  depositor_name TEXT,
  transaction_type TEXT NOT NULL,
  related_loan_id TEXT REFERENCES loans(id) ON DELETE SET NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_number TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  id_number TEXT,
  position TEXT,
  department TEXT,
  branch TEXT,
  hire_date DATE,
  employment_type TEXT,
  basic_salary NUMERIC(15, 2) DEFAULT 0,
  housing_allowance NUMERIC(15, 2) DEFAULT 0,
  transport_allowance NUMERIC(15, 2) DEFAULT 0,
  other_allowances NUMERIC(15, 2) DEFAULT 0,
  nssf_number TEXT,
  nhif_number TEXT,
  kra_pin TEXT,
  bank_name TEXT,
  bank_account TEXT,
  status TEXT DEFAULT 'Active',
  created_by TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payroll Records
CREATE TABLE payroll_records (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  basic_salary NUMERIC(15, 2) DEFAULT 0,
  housing_allowance NUMERIC(15, 2) DEFAULT 0,
  transport_allowance NUMERIC(15, 2) DEFAULT 0,
  other_allowances NUMERIC(15, 2) DEFAULT 0,
  gross_pay NUMERIC(15, 2) DEFAULT 0,
  nssf_deduction NUMERIC(15, 2) DEFAULT 0,
  nhif_deduction NUMERIC(15, 2) DEFAULT 0,
  paye_deduction NUMERIC(15, 2) DEFAULT 0,
  other_deductions NUMERIC(15, 2) DEFAULT 0,
  total_deductions NUMERIC(15, 2) DEFAULT 0,
  net_pay NUMERIC(15, 2) DEFAULT 0,
  payment_date DATE,
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'Pending',
  approved_by TEXT,
  approved_date DATE,
  paid_by TEXT,
  notes TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal Entries (Double-Entry Bookkeeping)
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_number TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  reference TEXT,
  source_type TEXT,
  source_id TEXT,
  total_debit NUMERIC(15, 2) DEFAULT 0,
  total_credit NUMERIC(15, 2) DEFAULT 0,
  status TEXT DEFAULT 'Draft',
  created_by TEXT,
  created_date DATE,
  posted_date DATE,
  reversed_date DATE,
  reversed_by TEXT,
  reversal_reason TEXT,
  notes TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal Entry Lines
CREATE TABLE journal_entry_lines (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journal_entry_id TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  description TEXT,
  debit NUMERIC(15, 2) DEFAULT 0,
  credit NUMERIC(15, 2) DEFAULT 0,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approvals (Multi-stage approval workflow)
CREATE TABLE approvals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_id TEXT REFERENCES loans(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  approver TEXT,
  approver_role TEXT,
  comments TEXT,
  date DATE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing Fee Records
CREATE TABLE processing_fee_records (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT,
  loan_product_id TEXT,
  loan_product_name TEXT,
  fee_type TEXT,
  fee_amount NUMERIC(15, 2) NOT NULL,
  percentage NUMERIC(5, 2),
  loan_amount NUMERIC(15, 2),
  recorded_date DATE,
  recorded_by TEXT,
  status TEXT DEFAULT 'Pending',
  collected_date DATE,
  collected_by TEXT,
  payment_method TEXT,
  receipt_number TEXT,
  notes TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  changes TEXT,
  ip_address TEXT,
  status TEXT DEFAULT 'Success',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- User ID indexes for RLS
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscription_payments_user_id ON subscription_payments(user_id);
CREATE INDEX idx_branches_user_id ON branches(user_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_groups_user_id ON groups(user_id);
CREATE INDEX idx_loan_products_user_id ON loan_products(user_id);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_repayments_user_id ON repayments(user_id);
CREATE INDEX idx_savings_accounts_user_id ON savings_accounts(user_id);
CREATE INDEX idx_savings_transactions_user_id ON savings_transactions(user_id);
CREATE INDEX idx_shareholders_user_id ON shareholders(user_id);
CREATE INDEX idx_shareholder_transactions_user_id ON shareholder_transactions(user_id);
CREATE INDEX idx_payees_user_id ON payees(user_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX idx_funding_transactions_user_id ON funding_transactions(user_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_payroll_records_user_id ON payroll_records(user_id);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entry_lines_user_id ON journal_entry_lines(user_id);
CREATE INDEX idx_approvals_user_id ON approvals(user_id);
CREATE INDEX idx_processing_fee_records_user_id ON processing_fee_records(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Foreign key indexes
CREATE INDEX idx_loans_client_id ON loans(client_id);
CREATE INDEX idx_loans_product_id ON loans(product_id);
CREATE INDEX idx_repayments_loan_id ON repayments(loan_id);
CREATE INDEX idx_repayments_client_id ON repayments(client_id);
CREATE INDEX idx_savings_accounts_client_id ON savings_accounts(client_id);
CREATE INDEX idx_savings_transactions_account_id ON savings_transactions(account_id);
CREATE INDEX idx_funding_transactions_bank_account_id ON funding_transactions(bank_account_id);
CREATE INDEX idx_journal_entry_lines_journal_entry_id ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_approvals_loan_id ON approvals(loan_id);
CREATE INDEX idx_processing_fee_records_loan_id ON processing_fee_records(loan_id);

-- Status and date indexes for filtering
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_disbursement_date ON loans(disbursement_date);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_repayments_payment_date ON repayments(payment_date);
CREATE INDEX idx_expenses_status ON expenses(status);

-- ============================================
-- STEP 4: CREATE TRIGGERS FOR updated_at
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_payments_updated_at BEFORE UPDATE ON subscription_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_products_updated_at BEFORE UPDATE ON loan_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repayments_updated_at BEFORE UPDATE ON repayments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_accounts_updated_at BEFORE UPDATE ON savings_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_transactions_updated_at BEFORE UPDATE ON savings_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shareholders_updated_at BEFORE UPDATE ON shareholders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shareholder_transactions_updated_at BEFORE UPDATE ON shareholder_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payees_updated_at BEFORE UPDATE ON payees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_funding_transactions_updated_at BEFORE UPDATE ON funding_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_records_updated_at BEFORE UPDATE ON payroll_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entry_lines_updated_at BEFORE UPDATE ON journal_entry_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processing_fee_records_updated_at BEFORE UPDATE ON processing_fee_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audit_logs_updated_at BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 5: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareholder_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payees ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: CREATE RLS POLICIES
-- ============================================

-- User Settings Policies
CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON user_settings FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions Policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subscriptions" ON subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Subscription Payments Policies
CREATE POLICY "Users can view their own payments" ON subscription_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payments" ON subscription_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payments" ON subscription_payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payments" ON subscription_payments FOR DELETE USING (auth.uid() = user_id);

-- Branches Policies
CREATE POLICY "Users can view their own branches" ON branches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own branches" ON branches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own branches" ON branches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own branches" ON branches FOR DELETE USING (auth.uid() = user_id);

-- Clients Policies
CREATE POLICY "Users can view their own clients" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON clients FOR DELETE USING (auth.uid() = user_id);

-- Groups Policies
CREATE POLICY "Users can view their own groups" ON groups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own groups" ON groups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own groups" ON groups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own groups" ON groups FOR DELETE USING (auth.uid() = user_id);

-- Loan Products Policies
CREATE POLICY "Users can view their own loan products" ON loan_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own loan products" ON loan_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own loan products" ON loan_products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own loan products" ON loan_products FOR DELETE USING (auth.uid() = user_id);

-- Loans Policies
CREATE POLICY "Users can view their own loans" ON loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own loans" ON loans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own loans" ON loans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own loans" ON loans FOR DELETE USING (auth.uid() = user_id);

-- Repayments Policies
CREATE POLICY "Users can view their own repayments" ON repayments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own repayments" ON repayments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own repayments" ON repayments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own repayments" ON repayments FOR DELETE USING (auth.uid() = user_id);

-- Savings Accounts Policies
CREATE POLICY "Users can view their own savings accounts" ON savings_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own savings accounts" ON savings_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own savings accounts" ON savings_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own savings accounts" ON savings_accounts FOR DELETE USING (auth.uid() = user_id);

-- Savings Transactions Policies
CREATE POLICY "Users can view their own savings transactions" ON savings_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own savings transactions" ON savings_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own savings transactions" ON savings_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own savings transactions" ON savings_transactions FOR DELETE USING (auth.uid() = user_id);

-- Shareholders Policies
CREATE POLICY "Users can view their own shareholders" ON shareholders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own shareholders" ON shareholders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shareholders" ON shareholders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shareholders" ON shareholders FOR DELETE USING (auth.uid() = user_id);

-- Shareholder Transactions Policies
CREATE POLICY "Users can view their own shareholder transactions" ON shareholder_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own shareholder transactions" ON shareholder_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shareholder transactions" ON shareholder_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shareholder transactions" ON shareholder_transactions FOR DELETE USING (auth.uid() = user_id);

-- Payees Policies
CREATE POLICY "Users can view their own payees" ON payees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payees" ON payees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payees" ON payees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payees" ON payees FOR DELETE USING (auth.uid() = user_id);

-- Expenses Policies
CREATE POLICY "Users can view their own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- Bank Accounts Policies
CREATE POLICY "Users can view their own bank accounts" ON bank_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bank accounts" ON bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bank accounts" ON bank_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bank accounts" ON bank_accounts FOR DELETE USING (auth.uid() = user_id);

-- Funding Transactions Policies
CREATE POLICY "Users can view their own funding transactions" ON funding_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own funding transactions" ON funding_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own funding transactions" ON funding_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own funding transactions" ON funding_transactions FOR DELETE USING (auth.uid() = user_id);

-- Employees Policies
CREATE POLICY "Users can view their own employees" ON employees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own employees" ON employees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own employees" ON employees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own employees" ON employees FOR DELETE USING (auth.uid() = user_id);

-- Payroll Records Policies
CREATE POLICY "Users can view their own payroll records" ON payroll_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payroll records" ON payroll_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payroll records" ON payroll_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payroll records" ON payroll_records FOR DELETE USING (auth.uid() = user_id);

-- Journal Entries Policies
CREATE POLICY "Users can view their own journal entries" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Journal Entry Lines Policies
CREATE POLICY "Users can view their own journal entry lines" ON journal_entry_lines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entry lines" ON journal_entry_lines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entry lines" ON journal_entry_lines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entry lines" ON journal_entry_lines FOR DELETE USING (auth.uid() = user_id);

-- Approvals Policies
CREATE POLICY "Users can view their own approvals" ON approvals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own approvals" ON approvals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own approvals" ON approvals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own approvals" ON approvals FOR DELETE USING (auth.uid() = user_id);

-- Processing Fee Records Policies
CREATE POLICY "Users can view their own processing fee records" ON processing_fee_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own processing fee records" ON processing_fee_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own processing fee records" ON processing_fee_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own processing fee records" ON processing_fee_records FOR DELETE USING (auth.uid() = user_id);

-- Audit Logs Policies
CREATE POLICY "Users can view their own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own audit logs" ON audit_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own audit logs" ON audit_logs FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SCRIPT COMPLETE
-- ============================================
-- Your SmartLenderUp Supabase database is now ready!
-- 
-- Next steps:
-- 1. Copy this entire SQL script
-- 2. Go to your Supabase project dashboard
-- 3. Navigate to SQL Editor
-- 4. Paste and run this script
-- 5. Your database will be reset with the complete structure
-- ============================================