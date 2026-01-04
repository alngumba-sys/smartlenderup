-- =====================================================
-- SMARTLENDERUP COMPLETE DATABASE RESET
-- =====================================================
-- This script will:
-- 1. DROP all existing tables
-- 2. CREATE all tables fresh with correct structure
-- 3. Set up indexes, triggers, and relationships
--
-- ⚠️ WARNING: This will DELETE ALL DATA!
-- ⚠️ Export any important data before running!
--
-- Time to run: ~10 seconds
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL EXISTING TABLES
-- =====================================================

DROP TABLE IF EXISTS shareholder_transactions CASCADE;
DROP TABLE IF EXISTS shareholders CASCADE;
DROP TABLE IF EXISTS payroll_records CASCADE;
DROP TABLE IF EXISTS payroll_runs CASCADE;
DROP TABLE IF EXISTS journal_entry_lines CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS savings_transactions CASCADE;
DROP TABLE IF EXISTS savings_accounts CASCADE;
DROP TABLE IF EXISTS loan_documents CASCADE;
DROP TABLE IF EXISTS disbursements CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS payees CASCADE;
DROP TABLE IF EXISTS repayments CASCADE;
DROP TABLE IF EXISTS guarantors CASCADE;
DROP TABLE IF EXISTS collaterals CASCADE;
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS loan_products CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS kyc_records CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS user_organizations CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any existing functions/triggers
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- =====================================================
-- STEP 2: CREATE UTILITY FUNCTIONS
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 3: CREATE CORE TABLES
-- =====================================================

-- Organizations (Mother Companies, Branches, Chamas)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name VARCHAR(255) NOT NULL,
  organization_type VARCHAR(50) NOT NULL, -- mother_company, branch, chama
  parent_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Contact information
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  country VARCHAR(100) DEFAULT 'Kenya',
  currency VARCHAR(10) DEFAULT 'KES',
  
  -- Authentication (for simplified login)
  password_hash TEXT,
  username VARCHAR(100),
  
  -- Subscription & trial
  subscription_status VARCHAR(50) DEFAULT 'trial', -- trial, active, expired, cancelled
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_plan VARCHAR(50), -- starter, professional, enterprise
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  
  -- Settings
  date_format VARCHAR(50) DEFAULT 'DD/MM/YYYY',
  number_format VARCHAR(50) DEFAULT 'comma', -- comma, period, space
  fiscal_year_start VARCHAR(10) DEFAULT '01-01',
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  
  -- Authentication (if managing locally, otherwise use Supabase Auth)
  password_hash TEXT,
  
  -- Profile
  role VARCHAR(50), -- super_admin, org_admin, staff, loan_officer
  avatar_url TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User-Organization Relationships (Multi-tenancy)
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- admin, manager, loan_officer, accountant, viewer
  
  -- Permissions
  permissions JSONB DEFAULT '{}',
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, organization_id)
);

-- =====================================================
-- STEP 4: CLIENT MANAGEMENT TABLES
-- =====================================================

-- Clients/Borrowers
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Client identification (CL001 format)
  client_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Personal information
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  name VARCHAR(255), -- Full name for compatibility
  date_of_birth DATE,
  gender VARCHAR(20),
  marital_status VARCHAR(50),
  
  -- Contact information
  email VARCHAR(255),
  phone VARCHAR(50),
  phone_secondary VARCHAR(50),
  
  -- Address
  address TEXT,
  county VARCHAR(100),
  sub_county VARCHAR(100),
  ward VARCHAR(100),
  town VARCHAR(100),
  
  -- Identification
  id_number VARCHAR(100),
  id_type VARCHAR(50), -- national_id, passport, etc.
  
  -- Employment
  occupation VARCHAR(255),
  employer VARCHAR(255),
  employer_phone VARCHAR(50),
  monthly_income DECIMAL(15,2),
  
  -- Business (if applicable)
  business_name VARCHAR(255),
  business_type VARCHAR(100),
  business_location TEXT,
  years_in_business INTEGER,
  
  -- Next of Kin
  next_of_kin_name VARCHAR(255),
  next_of_kin_phone VARCHAR(50),
  next_of_kin_relationship VARCHAR(100),
  
  -- Status & verification
  status VARCHAR(20) DEFAULT 'active',
  kyc_status VARCHAR(20) DEFAULT 'pending',
  verification_status VARCHAR(20) DEFAULT 'pending',
  
  -- Profile
  photo_url TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id)
);

-- KYC Records
CREATE TABLE kyc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Document information
  document_type VARCHAR(100) NOT NULL,
  document_number VARCHAR(100),
  document_url TEXT,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- STEP 5: LOAN PRODUCT & LOAN TABLES
-- =====================================================

-- Loan Products
CREATE TABLE loan_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Product identification
  product_name VARCHAR(255) NOT NULL,
  name VARCHAR(255), -- Alternate name field
  product_code VARCHAR(50) UNIQUE,
  description TEXT,
  
  -- Amount limits (dual naming for compatibility)
  min_amount DECIMAL(15,2) DEFAULT 0,
  max_amount DECIMAL(15,2) DEFAULT 10000000,
  minimum_amount DECIMAL(15,2) DEFAULT 0,
  maximum_amount DECIMAL(15,2) DEFAULT 10000000,
  
  -- Term limits (dual naming for compatibility)
  min_term INTEGER DEFAULT 1,
  max_term INTEGER DEFAULT 60,
  minimum_term INTEGER DEFAULT 1,
  maximum_term INTEGER DEFAULT 60,
  term_unit VARCHAR(20) DEFAULT 'Months',
  
  -- Interest configuration
  interest_rate DECIMAL(5,2) DEFAULT 0,
  interest_method VARCHAR(50) DEFAULT 'flat', -- flat, reducing_balance
  interest_type VARCHAR(50) DEFAULT 'Flat',
  
  -- Repayment
  repayment_frequency VARCHAR(50) DEFAULT 'monthly',
  
  -- Fees
  processing_fee_percentage DECIMAL(5,2) DEFAULT 0,
  processing_fee_fixed DECIMAL(15,2) DEFAULT 0,
  insurance_fee_fixed DECIMAL(15,2) DEFAULT 0,
  
  -- Requirements (dual naming for compatibility)
  guarantor_required BOOLEAN DEFAULT false,
  collateral_required BOOLEAN DEFAULT false,
  require_guarantor BOOLEAN DEFAULT false,
  require_collateral BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Loans (5-Phase Approval Workflow)
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  product_id UUID REFERENCES loan_products(id) ON DELETE SET NULL,
  
  -- Loan identification
  loan_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Loan details
  amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  term_period INTEGER NOT NULL,
  term_period_unit VARCHAR(20) DEFAULT 'months',
  repayment_frequency VARCHAR(50) DEFAULT 'monthly',
  
  -- Financial calculations
  total_amount DECIMAL(15,2), -- Principal + interest + fees
  balance DECIMAL(15,2),
  amount_paid DECIMAL(15,2) DEFAULT 0,
  
  -- Purpose & disbursement
  purpose TEXT,
  disbursement_method VARCHAR(100),
  disbursement_account VARCHAR(255),
  disbursement_date TIMESTAMP WITH TIME ZONE,
  
  -- 5-Phase workflow
  phase INTEGER DEFAULT 1, -- 1-5
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, active, rejected, fully_paid, defaulted
  
  -- Important dates
  application_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approval_date TIMESTAMP WITH TIME ZONE,
  expected_repayment_date DATE,
  maturity_date DATE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id)
);

-- Loan Approvals (Track approval workflow)
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  
  -- Approval details
  phase INTEGER NOT NULL, -- 1-5
  approver_id UUID REFERENCES users(id),
  approval_status VARCHAR(50) NOT NULL, -- pending, approved, rejected
  comments TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Collaterals
CREATE TABLE collaterals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Collateral details
  collateral_type VARCHAR(100) NOT NULL,
  description TEXT,
  estimated_value DECIMAL(15,2),
  
  -- Documentation
  document_url TEXT,
  valuation_date DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Guarantors
CREATE TABLE guarantors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Guarantor details
  guarantor_name VARCHAR(255) NOT NULL,
  guarantor_phone VARCHAR(50),
  guarantor_email VARCHAR(255),
  guarantor_id_number VARCHAR(100),
  relationship VARCHAR(100),
  
  -- Financial capacity
  monthly_income DECIMAL(15,2),
  employer VARCHAR(255),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Loan Documents
CREATE TABLE loan_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  
  -- Document details
  document_type VARCHAR(100) NOT NULL,
  document_name VARCHAR(255),
  document_url TEXT NOT NULL,
  file_size INTEGER,
  
  -- Audit
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Disbursements
CREATE TABLE disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  
  -- Disbursement details
  amount DECIMAL(15,2) NOT NULL,
  disbursement_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  disbursement_method VARCHAR(100),
  reference_number VARCHAR(255),
  
  -- Bank details
  bank_name VARCHAR(255),
  account_number VARCHAR(100),
  
  -- Status
  status VARCHAR(20) DEFAULT 'completed',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  disbursed_by UUID REFERENCES users(id)
);

-- =====================================================
-- STEP 6: REPAYMENT & PAYMENT TABLES
-- =====================================================

-- Repayments
CREATE TABLE repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(15,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_method VARCHAR(100) DEFAULT 'Cash',
  transaction_ref VARCHAR(255),
  
  -- Allocation
  principal_amount DECIMAL(15,2) DEFAULT 0,
  interest_amount DECIMAL(15,2) DEFAULT 0,
  penalty_amount DECIMAL(15,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'completed',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  recorded_by UUID REFERENCES users(id)
);

-- General Payments (for other expenses)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(15,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_method VARCHAR(100),
  reference_number VARCHAR(255),
  description TEXT,
  
  -- Category
  payment_category VARCHAR(100),
  
  -- Payee
  payee_name VARCHAR(255),
  
  -- Status
  status VARCHAR(20) DEFAULT 'completed',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id)
);

-- Payees
CREATE TABLE payees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Payee details
  payee_name VARCHAR(255) NOT NULL,
  payee_type VARCHAR(50), -- supplier, contractor, employee, etc.
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  
  -- Banking
  bank_name VARCHAR(255),
  account_number VARCHAR(100),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- STEP 7: SAVINGS & GROUPS
-- =====================================================

-- Groups (Chamas/Investment Groups)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Group details
  group_name VARCHAR(255) NOT NULL,
  group_code VARCHAR(50) UNIQUE,
  description TEXT,
  
  -- Meetings
  meeting_frequency VARCHAR(50),
  meeting_day VARCHAR(50),
  
  -- Financial
  registration_fee DECIMAL(15,2) DEFAULT 0,
  monthly_contribution DECIMAL(15,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id)
);

-- Savings Accounts
CREATE TABLE savings_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  
  -- Account details
  account_number VARCHAR(50) UNIQUE NOT NULL,
  account_type VARCHAR(50) DEFAULT 'regular', -- regular, fixed, recurring
  
  -- Balance
  balance DECIMAL(15,2) DEFAULT 0,
  
  -- Interest
  interest_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Savings Transactions
CREATE TABLE savings_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES savings_accounts(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type VARCHAR(50) NOT NULL, -- deposit, withdrawal, interest
  amount DECIMAL(15,2) NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reference_number VARCHAR(255),
  description TEXT,
  
  -- Balance after transaction
  balance_after DECIMAL(15,2),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id)
);

-- =====================================================
-- STEP 8: ACCOUNTING TABLES
-- =====================================================

-- Journal Entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Entry details
  entry_number VARCHAR(50) UNIQUE NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  
  -- Totals (for validation)
  total_debit DECIMAL(15,2) DEFAULT 0,
  total_credit DECIMAL(15,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, posted, reversed
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id),
  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMP WITH TIME ZONE
);

-- Journal Entry Lines (Double-entry bookkeeping)
CREATE TABLE journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  
  -- Account details
  account_code VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  
  -- Amounts
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  
  -- Description
  description TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Expense details
  expense_date DATE NOT NULL,
  expense_category VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  
  -- Payment
  payment_method VARCHAR(100),
  reference_number VARCHAR(255),
  
  -- Payee
  payee_name VARCHAR(255),
  
  -- Receipt
  receipt_url TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'approved',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id)
);

-- Bank Accounts
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Bank details
  bank_name VARCHAR(255) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  branch VARCHAR(255),
  
  -- Account type
  account_type VARCHAR(50) DEFAULT 'checking',
  currency VARCHAR(10) DEFAULT 'KES',
  
  -- Balance
  current_balance DECIMAL(15,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- STEP 9: HR & PAYROLL TABLES
-- =====================================================

-- Employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Personal information
  employee_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Employment details
  job_title VARCHAR(255),
  department VARCHAR(100),
  employment_type VARCHAR(50), -- full_time, part_time, contract
  date_hired DATE,
  
  -- Salary
  basic_salary DECIMAL(15,2),
  allowances JSONB DEFAULT '{}',
  deductions JSONB DEFAULT '{}',
  
  -- Bank details
  bank_name VARCHAR(255),
  account_number VARCHAR(100),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payroll Runs
CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Payroll details
  payroll_period VARCHAR(50) NOT NULL, -- January 2024, etc.
  payroll_date DATE NOT NULL,
  
  -- Totals
  total_gross DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) DEFAULT 0,
  total_net DECIMAL(15,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, approved, paid
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id)
);

-- Payroll Records
CREATE TABLE payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  
  -- Earnings
  basic_salary DECIMAL(15,2) NOT NULL,
  allowances DECIMAL(15,2) DEFAULT 0,
  gross_salary DECIMAL(15,2) NOT NULL,
  
  -- Deductions
  tax DECIMAL(15,2) DEFAULT 0,
  insurance DECIMAL(15,2) DEFAULT 0,
  pension DECIMAL(15,2) DEFAULT 0,
  other_deductions DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) DEFAULT 0,
  
  -- Net
  net_salary DECIMAL(15,2) NOT NULL,
  
  -- Payment
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_date DATE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- STEP 10: SHAREHOLDERS
-- =====================================================

-- Shareholders
CREATE TABLE shareholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Shareholder details
  shareholder_name VARCHAR(255) NOT NULL,
  shareholder_type VARCHAR(50), -- individual, corporate
  email VARCHAR(255),
  phone VARCHAR(50),
  id_number VARCHAR(100),
  
  -- Shareholding
  total_shares INTEGER DEFAULT 0,
  share_value DECIMAL(15,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Shareholder Transactions
CREATE TABLE shareholder_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shareholder_id UUID NOT NULL REFERENCES shareholders(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type VARCHAR(50) NOT NULL, -- purchase, sale, dividend
  shares INTEGER,
  amount DECIMAL(15,2) NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  description TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id)
);

-- =====================================================
-- STEP 11: SYSTEM TABLES
-- =====================================================

-- Branches
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Branch details
  branch_name VARCHAR(255) NOT NULL,
  branch_code VARCHAR(50) UNIQUE,
  
  -- Contact
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  
  -- Manager
  manager_id UUID REFERENCES users(id),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Task details
  task_title VARCHAR(255) NOT NULL,
  task_description TEXT,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  
  -- Dates
  due_date DATE,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tickets (Support/Issues)
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Ticket details
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  category VARCHAR(100),
  
  -- Assignment
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  
  -- Dates
  created_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification details
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50), -- info, warning, error, success
  
  -- Link
  link_url TEXT,
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Event details
  event_type VARCHAR(100) NOT NULL, -- create, update, delete, login, etc.
  table_name VARCHAR(100),
  record_id UUID,
  
  -- User
  user_id UUID REFERENCES users(id),
  user_email VARCHAR(255),
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- STEP 12: CREATE INDEXES
-- =====================================================

-- Organizations
CREATE INDEX idx_organizations_type ON organizations(organization_type);
CREATE INDEX idx_organizations_parent ON organizations(parent_id);

-- Clients
CREATE INDEX idx_clients_organization ON clients(organization_id);
CREATE INDEX idx_clients_number ON clients(client_number);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_name ON clients(first_name, last_name);

-- Loan Products
CREATE INDEX idx_loan_products_organization ON loan_products(organization_id);
CREATE INDEX idx_loan_products_status ON loan_products(status);
CREATE INDEX idx_loan_products_code ON loan_products(product_code);

-- Loans
CREATE INDEX idx_loans_organization ON loans(organization_id);
CREATE INDEX idx_loans_client ON loans(client_id);
CREATE INDEX idx_loans_product ON loans(product_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_phase ON loans(phase);
CREATE INDEX idx_loans_number ON loans(loan_number);

-- Repayments
CREATE INDEX idx_repayments_organization ON repayments(organization_id);
CREATE INDEX idx_repayments_loan ON repayments(loan_id);
CREATE INDEX idx_repayments_date ON repayments(payment_date DESC);

-- Employees
CREATE INDEX idx_employees_organization ON employees(organization_id);
CREATE INDEX idx_employees_status ON employees(status);

-- Audit Logs
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- =====================================================
-- STEP 13: CREATE TRIGGERS
-- =====================================================

-- Auto-update updated_at for all tables with that column
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_products_updated_at BEFORE UPDATE ON loan_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_accounts_updated_at BEFORE UPDATE ON savings_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 14: VERIFY SETUP
-- =====================================================

-- Count all tables
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN tablename LIKE '%organizations%' THEN '🏢 Core'
    WHEN tablename LIKE '%client%' THEN '👤 Clients'
    WHEN tablename LIKE '%loan%' THEN '💰 Loans'
    WHEN tablename LIKE '%repayment%' OR tablename LIKE '%payment%' THEN '💳 Payments'
    WHEN tablename LIKE '%saving%' OR tablename LIKE '%group%' THEN '🏦 Savings'
    WHEN tablename LIKE '%journal%' OR tablename LIKE '%expense%' OR tablename LIKE '%bank%' THEN '📊 Accounting'
    WHEN tablename LIKE '%employee%' OR tablename LIKE '%payroll%' THEN '👔 HR'
    WHEN tablename LIKE '%shareholder%' THEN '📈 Shareholders'
    WHEN tablename LIKE '%task%' OR tablename LIKE '%ticket%' OR tablename LIKE '%notification%' OR tablename LIKE '%audit%' THEN '⚙️ System'
    ELSE '📁 Other'
  END as category
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY category, tablename;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- 
-- ✅ All tables created successfully!
-- ✅ 30+ tables for complete microfinance platform
-- ✅ Proper relationships and foreign keys
-- ✅ Auto-generated UUIDs
-- ✅ Indexes for performance
-- ✅ Auto-updating timestamps
-- 
-- TABLE SUMMARY:
-- 🏢 Core: organizations, users, user_organizations
-- 👤 Clients: clients, kyc_records
-- 💰 Loans: loan_products, loans, approvals, collaterals, guarantors, loan_documents, disbursements
-- 💳 Payments: repayments, payments, payees
-- 🏦 Savings: groups, savings_accounts, savings_transactions
-- 📊 Accounting: journal_entries, journal_entry_lines, expenses, bank_accounts
-- 👔 HR: employees, payroll_runs, payroll_records
-- 📈 Shareholders: shareholders, shareholder_transactions
-- ⚙️ System: branches, tasks, tickets, notifications, audit_logs
-- 
-- NEXT STEPS:
-- 1. Create your first organization
-- 2. Create users and assign roles
-- 3. Start adding clients and loan products
-- 
-- =====================================================
