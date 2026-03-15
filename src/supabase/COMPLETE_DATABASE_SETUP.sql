-- ============================================
-- SMARTLENDERUP - COMPLETE DATABASE SETUP
-- ============================================
-- This script creates ALL tables with ALL required columns
-- Run this ONCE in Supabase SQL Editor to set up your database
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name TEXT NOT NULL,
  organization_type TEXT DEFAULT 'mother_company' CHECK (organization_type IN ('mother_company', 'subsidiary_company', 'branch')),
  parent_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  country TEXT DEFAULT 'Kenya',
  currency TEXT DEFAULT 'KES',
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled')),
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '14 days',
  subscription_plan TEXT CHECK (subscription_plan IN ('growth', 'professional', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  number_format TEXT DEFAULT 'comma',
  fiscal_year_start TEXT DEFAULT '01-01',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'rejected', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  
  -- CRITICAL: Password field for authentication
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE
);

-- Create index for faster authentication queries
CREATE INDEX IF NOT EXISTS idx_organizations_email ON public.organizations(email);
CREATE INDEX IF NOT EXISTS idx_organizations_username ON public.organizations(username);

-- ============================================
-- 2. STAFF USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.staff_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  staff_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT NOT NULL,
  id_number TEXT,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Loan Officer', 'Manager', 'Accountant', 'Collections Officer', 'Branch Manager', 'Cashier', 'Teller', 'Collector', 'Operations Manager')),
  branch TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  date_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Permissions
  granular_permissions JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_staff_users_org ON public.staff_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_users_email ON public.staff_users(email);

-- ============================================
-- 3. CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  id_number TEXT NOT NULL,
  id_type TEXT CHECK (id_type IN ('national_id', 'passport', 'military_id', 'alien_id')),
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT,
  county TEXT,
  sub_county TEXT,
  ward TEXT,
  physical_address TEXT,
  postal_address TEXT,
  
  -- Employment
  occupation TEXT,
  employer_name TEXT,
  employer_phone TEXT,
  monthly_income DECIMAL(15,2),
  
  -- Next of Kin
  next_of_kin_name TEXT,
  next_of_kin_phone TEXT,
  next_of_kin_relationship TEXT,
  
  -- Business Information
  business_name TEXT,
  business_type TEXT,
  business_location TEXT,
  business_registration_number TEXT,
  years_in_business INTEGER,
  monthly_business_revenue DECIMAL(15,2),
  monthly_business_expenses DECIMAL(15,2),
  number_of_employees INTEGER,
  business_premises_ownership TEXT CHECK (business_premises_ownership IN ('owned', 'rented', 'family_owned', 'other')),
  
  -- Financial
  monthly_expenses DECIMAL(15,2),
  other_income DECIMAL(15,2),
  number_of_dependents INTEGER,
  
  -- Credit Score
  credit_score INTEGER DEFAULT 0,
  credit_rating TEXT,
  
  -- Status
  profile_photo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive', 'blacklisted')),
  blacklist_reason TEXT,
  
  -- GPS Location
  gps_latitude DECIMAL(10,8),
  gps_longitude DECIMAL(11,8),
  gps_accuracy DECIMAL(10,2),
  gps_timestamp TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_org ON public.clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_client_number ON public.clients(client_number);

-- ============================================
-- 4. LOAN PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.loan_products (
  id TEXT PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_code TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Interest & Fees
  interest_rate DECIMAL(5,2) NOT NULL,
  interest_method TEXT DEFAULT 'flat' CHECK (interest_method IN ('flat', 'reducing_balance', 'compound')),
  application_fee DECIMAL(15,2) DEFAULT 0,
  processing_fee DECIMAL(15,2) DEFAULT 0,
  processing_fee_type TEXT DEFAULT 'fixed' CHECK (processing_fee_type IN ('fixed', 'percentage')),
  insurance_fee DECIMAL(15,2) DEFAULT 0,
  insurance_fee_type TEXT DEFAULT 'fixed' CHECK (insurance_fee_type IN ('fixed', 'percentage')),
  late_payment_penalty DECIMAL(15,2) DEFAULT 0,
  late_payment_penalty_type TEXT DEFAULT 'fixed' CHECK (late_payment_penalty_type IN ('fixed', 'percentage')),
  
  -- Loan Limits
  min_amount DECIMAL(15,2) NOT NULL,
  max_amount DECIMAL(15,2) NOT NULL,
  min_term INTEGER NOT NULL,
  max_term INTEGER NOT NULL,
  
  -- Requirements
  collateral_required BOOLEAN DEFAULT false,
  guarantor_required BOOLEAN DEFAULT false,
  min_guarantors INTEGER DEFAULT 0,
  max_guarantors INTEGER DEFAULT 0,
  min_credit_score INTEGER DEFAULT 0,
  
  -- Approval Workflow
  approval_workflow_enabled BOOLEAN DEFAULT false,
  approval_levels INTEGER DEFAULT 1,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_loan_products_org ON public.loan_products(organization_id);
CREATE INDEX IF NOT EXISTS idx_loan_products_code ON public.loan_products(product_code);

-- ============================================
-- 5. LOANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.loans (
  id TEXT PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  loan_product_id TEXT REFERENCES public.loan_products(id),
  
  -- Loan Details
  loan_number TEXT UNIQUE NOT NULL,
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  interest_method TEXT DEFAULT 'flat',
  loan_term INTEGER NOT NULL,
  disbursement_date DATE,
  maturity_date DATE,
  
  -- Calculated Amounts
  interest_amount DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  monthly_repayment DECIMAL(15,2) NOT NULL,
  
  -- Fees
  application_fee DECIMAL(15,2) DEFAULT 0,
  processing_fee DECIMAL(15,2) DEFAULT 0,
  insurance_fee DECIMAL(15,2) DEFAULT 0,
  total_fees DECIMAL(15,2) DEFAULT 0,
  
  -- Purpose
  loan_purpose TEXT,
  
  -- Status & Approval
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'disbursed', 'active', 'completed', 'defaulted', 'written_off')),
  approval_status TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Outstanding Balance
  outstanding_principal DECIMAL(15,2),
  outstanding_interest DECIMAL(15,2),
  outstanding_fees DECIMAL(15,2),
  outstanding_penalties DECIMAL(15,2),
  total_outstanding DECIMAL(15,2),
  
  -- Payment Tracking
  total_paid DECIMAL(15,2) DEFAULT 0,
  principal_paid DECIMAL(15,2) DEFAULT 0,
  interest_paid DECIMAL(15,2) DEFAULT 0,
  fees_paid DECIMAL(15,2) DEFAULT 0,
  penalties_paid DECIMAL(15,2) DEFAULT 0,
  
  -- Days in Arrears
  days_in_arrears INTEGER DEFAULT 0,
  arrears_amount DECIMAL(15,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_loans_org ON public.loans(organization_id);
CREATE INDEX IF NOT EXISTS idx_loans_client ON public.loans(client_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);

-- ============================================
-- 6. REPAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.repayments (
  id TEXT PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  loan_id TEXT REFERENCES public.loans(id) ON DELETE CASCADE,
  
  -- Payment Details
  receipt_number TEXT UNIQUE NOT NULL,
  payment_date DATE NOT NULL,
  amount_paid DECIMAL(15,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'mpesa', 'bank_transfer', 'cheque', 'card')),
  transaction_reference TEXT,
  
  -- Payment Breakdown
  principal_paid DECIMAL(15,2) DEFAULT 0,
  interest_paid DECIMAL(15,2) DEFAULT 0,
  fees_paid DECIMAL(15,2) DEFAULT 0,
  penalties_paid DECIMAL(15,2) DEFAULT 0,
  
  -- Remaining Balance
  remaining_balance DECIMAL(15,2),
  
  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_repayments_org ON public.repayments(organization_id);
CREATE INDEX IF NOT EXISTS idx_repayments_loan ON public.repayments(loan_id);

-- ============================================
-- 7. SHAREHOLDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.shareholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Shareholder Details
  name TEXT,
  shareholder_name TEXT,
  id_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  
  -- Shares & Investment
  shares INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  share_value DECIMAL(15,2) DEFAULT 0,
  share_percentage DECIMAL(5,2) DEFAULT 0,
  total_investment DECIMAL(15,2) DEFAULT 0,
  share_capital DECIMAL(15,2) DEFAULT 0,
  ownership_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Dividends
  total_dividends DECIMAL(15,2) DEFAULT 0,
  
  -- Dates
  investment_date DATE,
  join_date DATE,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shareholders_org ON public.shareholders(organization_id);

-- ============================================
-- 8. SHAREHOLDER TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.shareholder_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  shareholder_id UUID REFERENCES public.shareholders(id) ON DELETE CASCADE,
  
  transaction_type TEXT CHECK (transaction_type IN ('investment', 'dividend', 'withdrawal', 'share_purchase', 'share_sale')),
  amount DECIMAL(15,2) NOT NULL,
  shares INTEGER DEFAULT 0,
  transaction_date DATE NOT NULL,
  description TEXT,
  reference_number TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shareholder_transactions_org ON public.shareholder_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_shareholder_transactions_shareholder ON public.shareholder_transactions(shareholder_id);

-- ============================================
-- 9. BANK ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  branch TEXT,
  account_type TEXT CHECK (account_type IN ('savings', 'current', 'fixed_deposit', 'mobile_money')),
  currency TEXT DEFAULT 'KES',
  balance DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_org ON public.bank_accounts(organization_id);

-- ============================================
-- 10. FUNDING TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.funding_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID,
  bank_account_id UUID REFERENCES public.bank_accounts(id),
  shareholder_id UUID REFERENCES public.shareholders(id),
  
  transaction_type TEXT DEFAULT 'Credit' CHECK (transaction_type IN ('Credit', 'Debit')),
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  reference TEXT,
  description TEXT,
  source TEXT,
  shareholder_name TEXT,
  payment_method TEXT,
  depositor_name TEXT,
  related_loan_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funding_transactions_org ON public.funding_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_funding_transactions_bank ON public.funding_transactions(bank_account_id);

-- ============================================
-- 11. CHART OF ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  description TEXT,
  balance DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, account_code)
);

CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_org ON public.chart_of_accounts(organization_id);

-- ============================================
-- 12. EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  expense_number TEXT,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  payment_method TEXT,
  payee_id UUID,
  payee_name TEXT,
  receipt_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_org ON public.expenses(organization_id);

-- ============================================
-- 13. PAYEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('individual', 'company', 'government', 'other')),
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  bank_name TEXT,
  bank_account TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payees_org ON public.payees(organization_id);

-- ============================================
-- 14. PAYROLL RUNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  payroll_number TEXT UNIQUE NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  payment_date DATE NOT NULL,
  total_gross DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) DEFAULT 0,
  total_net DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid', 'cancelled')),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_org ON public.payroll_runs(organization_id);

-- ============================================
-- 15. JOURNAL ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  entry_number TEXT UNIQUE NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  reference TEXT,
  entry_type TEXT DEFAULT 'manual' CHECK (entry_type IN ('manual', 'automatic', 'adjustment')),
  total_debit DECIMAL(15,2) DEFAULT 0,
  total_credit DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'cancelled')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_org ON public.journal_entries(organization_id);

-- ============================================
-- 16. KYC RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.kyc_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  document_type TEXT CHECK (document_type IN ('national_id', 'passport', 'driving_license', 'proof_of_residence', 'bank_statement', 'payslip', 'business_permit', 'other')),
  document_number TEXT,
  document_url TEXT,
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_records_org ON public.kyc_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_kyc_records_client ON public.kyc_records(client_id);

-- ============================================
-- 17. TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID,
  assigned_by UUID,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_org ON public.tasks(organization_id);

-- ============================================
-- 18. TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  ticket_number TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_by UUID,
  assigned_to UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_org ON public.tickets(organization_id);

-- ============================================
-- 19. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs(organization_id);

-- ============================================
-- 20. GROUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  group_name TEXT NOT NULL,
  group_type TEXT,
  registration_number TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  number_of_members INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_org ON public.groups(organization_id);

-- ============================================
-- 21. GUARANTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.guarantors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  loan_id TEXT REFERENCES public.loans(id) ON DELETE CASCADE,
  
  guarantor_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  relationship TEXT,
  guaranteed_amount DECIMAL(15,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'released', 'defaulted')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guarantors_org ON public.guarantors(organization_id);
CREATE INDEX IF NOT EXISTS idx_guarantors_loan ON public.guarantors(loan_id);

-- ============================================
-- 22. COLLATERALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.collaterals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  loan_id TEXT REFERENCES public.loans(id) ON DELETE CASCADE,
  
  collateral_type TEXT CHECK (collateral_type IN ('property', 'vehicle', 'equipment', 'inventory', 'securities', 'other')),
  description TEXT NOT NULL,
  estimated_value DECIMAL(15,2) NOT NULL,
  valuation_date DATE,
  location TEXT,
  ownership_document_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'released', 'liquidated')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collaterals_org ON public.collaterals(organization_id);
CREATE INDEX IF NOT EXISTS idx_collaterals_loan ON public.collaterals(loan_id);

-- ============================================
-- 23. LOAN DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.loan_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  loan_id TEXT REFERENCES public.loans(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  uploaded_by UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_documents_org ON public.loan_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_loan_documents_loan ON public.loan_documents(loan_id);

-- ============================================
-- 24. DISBURSEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.disbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  loan_id TEXT REFERENCES public.loans(id) ON DELETE CASCADE,
  
  disbursement_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  disbursement_date DATE NOT NULL,
  payment_method TEXT,
  bank_account_id UUID REFERENCES public.bank_accounts(id),
  reference_number TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disbursed', 'cancelled')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disbursements_org ON public.disbursements(organization_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_loan ON public.disbursements(loan_id);

-- ============================================
-- 25. APPROVALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  loan_id TEXT REFERENCES public.loans(id) ON DELETE CASCADE,
  
  approval_level INTEGER NOT NULL,
  approver_id UUID,
  approver_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approvals_org ON public.approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_loan ON public.approvals(loan_id);

-- ============================================
-- 26. SAVINGS ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.savings_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  account_number TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT DEFAULT 'savings',
  balance DECIMAL(15,2) DEFAULT 0,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  minimum_balance DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dormant', 'closed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_savings_accounts_org ON public.savings_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_savings_accounts_client ON public.savings_accounts(client_id);

-- ============================================
-- 27. SAVINGS TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.savings_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.savings_accounts(id) ON DELETE CASCADE,
  
  transaction_type TEXT CHECK (transaction_type IN ('deposit', 'withdrawal', 'interest', 'fee', 'transfer')),
  amount DECIMAL(15,2) NOT NULL,
  transaction_date DATE NOT NULL,
  reference_number TEXT,
  description TEXT,
  balance_after DECIMAL(15,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_savings_transactions_org ON public.savings_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_account ON public.savings_transactions(account_id);

-- ============================================
-- 28. CREDIT SCORING PARAMETERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.credit_scoring_parameters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  client_type TEXT NOT NULL CHECK (client_type IN ('individual', 'business', 'group')),
  parameter_name TEXT NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, client_type, parameter_name)
);

CREATE INDEX IF NOT EXISTS idx_credit_scoring_parameters_org ON public.credit_scoring_parameters(organization_id);

-- ============================================
-- 29. INSTITUTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('bank', 'microfinance', 'mobile_money', 'sacco', 'other')),
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  county TEXT,
  registration_number TEXT,
  tax_id TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_institutions_org ON public.institutions(organization_id);

-- ============================================
-- 30. BRANCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  branch_name TEXT NOT NULL,
  branch_code TEXT,
  location TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  manager_id UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branches_org ON public.branches(organization_id);

-- ============================================
-- 31. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  payment_number TEXT UNIQUE NOT NULL,
  payment_type TEXT,
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  reference_number TEXT,
  description TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_org ON public.payments(organization_id);

-- ============================================
-- 32. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID,
  
  notification_type TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_org ON public.notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- ============================================
-- 7. PRICING CONFIGURATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pricing_configuration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plans JSONB NOT NULL,
  trial_days INTEGER DEFAULT 14,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing
INSERT INTO public.pricing_configuration (plans, trial_days)
VALUES (
  '{
    "growth": {
      "monthlyPrice": 15,
      "annualPrice": 150,
      "features": ["Up to 500 clients", "Basic reporting", "Email support", "Mobile access"]
    },
    "professional": {
      "monthlyPrice": 35,
      "annualPrice": 350,
      "features": ["Up to 2,000 clients", "Advanced analytics", "Priority support", "API access", "Custom workflows"]
    },
    "enterprise": {
      "monthlyPrice": 75,
      "annualPrice": 750,
      "features": ["Unlimited clients", "White-label option", "Dedicated support", "Advanced integrations", "SLA guarantee"]
    }
  }'::jsonb,
  14
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 8. CONTACT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. PROJECT STATES TABLE (for JSON blob storage)
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_states (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_project_states_organization 
    FOREIGN KEY (organization_id) 
    REFERENCES public.organizations(id) 
    ON DELETE CASCADE
);

-- Create indexes for project_states
CREATE INDEX IF NOT EXISTS idx_project_states_org ON public.project_states(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_states_updated ON public.project_states(updated_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- 🚨 IMPORTANT: RLS is DISABLED for internal business tools
-- For BV Funguo: Security is handled at application level
-- (Organization login + Staff permissions + Role-based access)
-- ============================================

-- ❌ RLS DISABLED - Uncomment below to enable RLS
-- ============================================
-- ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.shareholders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.funding_transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.payees ENABLE ROW LEVEL SECURITY;

-- Organizations Policies (DISABLED)
-- DROP POLICY IF EXISTS "organizations_select_policy" ON public.organizations;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is ready with:
-- ✅ 32+ tables created
-- ✅ All indexes created
-- ✅ RLS DISABLED (security handled at app level)
-- ✅ product_code column included in loan_products
-- 
-- Next steps:
-- 1. Refresh your browser (Ctrl+Shift+R)
-- 2. Your app should work now!
-- 3. Create test organizations, clients, loans
-- 4. Everything will work! 🎉
-- ============================================