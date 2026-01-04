-- SmartLenderUp Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  id_number TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'loan_officer', 'accountant', 'client')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  avatar_url TEXT,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sacco', 'mfi', 'credit_union', 'community_bank', 'lending_group')),
  registration_number TEXT UNIQUE,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT,
  county TEXT,
  physical_address TEXT,
  logo_url TEXT,
  website TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'growth', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled')),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups table (for informal lending groups/chamas)
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  registration_number TEXT,
  group_type TEXT CHECK (group_type IN ('investment_club', 'savings_group', 'lending_circle', 'chama', 'cooperative', 'other')),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT,
  number_of_members INTEGER,
  founded_year INTEGER,
  admin_user_id UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key after groups table is created
ALTER TABLE public.users ADD CONSTRAINT fk_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

-- ============================================
-- CLIENTS & KYC
-- ============================================

-- Clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  client_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  id_number TEXT UNIQUE NOT NULL,
  id_type TEXT CHECK (id_type IN ('national_id', 'passport', 'military_id', 'alien_id')),
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT,
  county TEXT,
  sub_county TEXT,
  ward TEXT,
  physical_address TEXT,
  occupation TEXT,
  employer_name TEXT,
  employer_phone TEXT,
  monthly_income DECIMAL(15,2),
  next_of_kin_name TEXT,
  next_of_kin_phone TEXT,
  next_of_kin_relationship TEXT,
  profile_photo_url TEXT,
  -- Business fields for Business/Group clients
  business_type TEXT,
  business_name TEXT,
  business_location TEXT,
  years_in_business INTEGER,
  -- Status and KYC fields
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  kyc_verified_at TIMESTAMP WITH TIME ZONE,
  kyc_verified_by UUID REFERENCES public.users(id),
  credit_score INTEGER CHECK (credit_score >= 0 AND credit_score <= 1000),
  risk_rating TEXT CHECK (risk_rating IN ('low', 'medium', 'high', 'very_high')),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for business fields
COMMENT ON COLUMN public.clients.business_type IS 'Type of business (e.g., Retail, Agriculture, Services, Manufacturing, etc.)';
COMMENT ON COLUMN public.clients.business_name IS 'Registered or trading name of the business';
COMMENT ON COLUMN public.clients.business_location IS 'Physical location or address of the business';
COMMENT ON COLUMN public.clients.years_in_business IS 'Number of years the business has been operating';

-- Client documents table
CREATE TABLE public.client_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('national_id', 'passport', 'proof_of_residence', 'payslip', 'bank_statement', 'business_permit', 'tax_pin', 'other')),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.users(id),
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LOAN PRODUCTS & LOANS
-- ============================================

-- Loan products table
CREATE TABLE public.loan_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id),
  product_code TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  min_amount DECIMAL(15,2) NOT NULL,
  max_amount DECIMAL(15,2) NOT NULL,
  min_duration_months INTEGER NOT NULL,
  max_duration_months INTEGER NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  interest_method TEXT CHECK (interest_method IN ('flat', 'reducing_balance', 'compound')),
  repayment_frequency TEXT DEFAULT 'monthly' CHECK (repayment_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually')),
  processing_fee_percentage DECIMAL(5,2) DEFAULT 0,
  processing_fee_fixed DECIMAL(10,2) DEFAULT 0,
  insurance_fee_percentage DECIMAL(5,2) DEFAULT 0,
  insurance_fee_fixed DECIMAL(10,2) DEFAULT 0,
  late_payment_penalty_percentage DECIMAL(5,2) DEFAULT 0,
  collateral_required BOOLEAN DEFAULT FALSE,
  guarantor_required BOOLEAN DEFAULT FALSE,
  number_of_guarantors INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  organization_id UUID REFERENCES public.organizations(id),
  loan_product_id UUID REFERENCES public.loan_products(id),
  loan_officer_id UUID REFERENCES public.users(id),
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  processing_fee DECIMAL(10,2) DEFAULT 0,
  insurance_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  monthly_installment DECIMAL(15,2) NOT NULL,
  outstanding_balance DECIMAL(15,2) NOT NULL,
  paid_amount DECIMAL(15,2) DEFAULT 0,
  purpose TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'disbursed', 'active', 'completed', 'defaulted', 'written_off')),
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  disbursed_by UUID REFERENCES public.users(id),
  disbursed_at TIMESTAMP WITH TIME ZONE,
  disbursement_method TEXT CHECK (disbursement_method IN ('mpesa', 'bank_transfer', 'cash', 'cheque')),
  disbursement_reference TEXT,
  first_payment_date DATE,
  maturity_date DATE,
  days_in_arrears INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan guarantors table
CREATE TABLE public.loan_guarantors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  guarantor_name TEXT NOT NULL,
  guarantor_phone TEXT NOT NULL,
  guarantor_id_number TEXT NOT NULL,
  guarantor_email TEXT,
  relationship_to_client TEXT,
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan collateral table
CREATE TABLE public.loan_collateral (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  collateral_type TEXT NOT NULL CHECK (collateral_type IN ('land', 'vehicle', 'property', 'equipment', 'shares', 'other')),
  description TEXT NOT NULL,
  estimated_value DECIMAL(15,2) NOT NULL,
  ownership_document_url TEXT,
  valuation_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PAYMENTS & TRANSACTIONS
-- ============================================

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES public.loans(id),
  payment_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  principal_paid DECIMAL(15,2) NOT NULL,
  interest_paid DECIMAL(15,2) NOT NULL,
  penalty_paid DECIMAL(15,2) DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'bank_transfer', 'cash', 'cheque', 'bank_deposit')),
  payment_reference TEXT,
  mpesa_receipt_number TEXT,
  mpesa_transaction_id TEXT,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  received_by UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- M-Pesa transactions table
CREATE TABLE public.mpesa_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('stk_push', 'b2c', 'c2b', 'b2b')),
  merchant_request_id TEXT,
  checkout_request_id TEXT,
  transaction_id TEXT UNIQUE,
  amount DECIMAL(15,2) NOT NULL,
  phone_number TEXT NOT NULL,
  account_reference TEXT,
  transaction_desc TEXT,
  result_code TEXT,
  result_desc TEXT,
  mpesa_receipt_number TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE,
  loan_id UUID REFERENCES public.loans(id),
  payment_id UUID REFERENCES public.payments(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SAVINGS ACCOUNTS
-- ============================================

-- Savings accounts table
CREATE TABLE public.savings_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  organization_id UUID REFERENCES public.organizations(id),
  account_type TEXT DEFAULT 'regular' CHECK (account_type IN ('regular', 'fixed', 'target', 'children')),
  balance DECIMAL(15,2) DEFAULT 0,
  available_balance DECIMAL(15,2) DEFAULT 0,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  minimum_balance DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dormant', 'closed', 'frozen')),
  opened_by UUID REFERENCES public.users(id),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Savings transactions table
CREATE TABLE public.savings_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  savings_account_id UUID NOT NULL REFERENCES public.savings_accounts(id),
  transaction_number TEXT UNIQUE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'interest', 'fee', 'transfer')),
  amount DECIMAL(15,2) NOT NULL,
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('mpesa', 'cash', 'bank_transfer', 'cheque')),
  reference_number TEXT,
  description TEXT,
  processed_by UUID REFERENCES public.users(id),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- COMMUNICATION
-- ============================================

-- SMS campaigns table
CREATE TABLE public.sms_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id),
  campaign_name TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient_type TEXT CHECK (recipient_type IN ('all_clients', 'active_borrowers', 'defaulters', 'custom')),
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS logs table
CREATE TABLE public.sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.sms_campaigns(id),
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  cost DECIMAL(10,4),
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error', 'loan_approved', 'payment_received', 'payment_due', 'system')),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REPORTS & ANALYTICS
-- ============================================

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id),
  setting_key TEXT NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, setting_key)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_organization ON public.users(organization_id);
CREATE INDEX idx_users_role ON public.users(role);

CREATE INDEX idx_organizations_status ON public.organizations(status);
CREATE INDEX idx_organizations_type ON public.organizations(type);

CREATE INDEX idx_clients_organization ON public.clients(organization_id);
CREATE INDEX idx_clients_client_number ON public.clients(client_number);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_id_number ON public.clients(id_number);
CREATE INDEX idx_clients_business_type ON public.clients(business_type);

CREATE INDEX idx_loans_client ON public.loans(client_id);
CREATE INDEX idx_loans_organization ON public.loans(organization_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loans_loan_number ON public.loans(loan_number);
CREATE INDEX idx_loans_application_date ON public.loans(application_date);

CREATE INDEX idx_payments_loan ON public.payments(loan_id);
CREATE INDEX idx_payments_payment_date ON public.payments(payment_date);
CREATE INDEX idx_payments_status ON public.payments(status);

CREATE INDEX idx_mpesa_transactions_phone ON public.mpesa_transactions(phone_number);
CREATE INDEX idx_mpesa_transactions_status ON public.mpesa_transactions(status);
CREATE INDEX idx_mpesa_transactions_transaction_id ON public.mpesa_transactions(transaction_id);

CREATE INDEX idx_savings_accounts_client ON public.savings_accounts(client_id);
CREATE INDEX idx_savings_accounts_account_number ON public.savings_accounts(account_number);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_collateral ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES (Non-recursive)
-- ============================================

-- Allow all authenticated users to SELECT users
CREATE POLICY "authenticated_users_select" ON public.users
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow all authenticated users to INSERT users
CREATE POLICY "authenticated_users_insert" ON public.users
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow all authenticated users to UPDATE users
CREATE POLICY "authenticated_users_update" ON public.users
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow all authenticated users to DELETE users
CREATE POLICY "authenticated_users_delete" ON public.users
  FOR DELETE 
  TO authenticated
  USING (true);

-- ============================================
-- OTHER TABLE POLICIES
-- ============================================

-- Clients can view their own data
CREATE POLICY "Clients can view own data" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

-- Staff can view clients in their organization
CREATE POLICY "Staff can view organization clients" ON public.clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.organization_id = clients.organization_id
    )
  );

-- Similar policies for loans, payments, savings, etc.
CREATE POLICY "Users can view own loans" ON public.loans
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Staff can view organization loans" ON public.loans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.organization_id = loans.organization_id
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_products_updated_at BEFORE UPDATE ON public.loan_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_accounts_updated_at BEFORE UPDATE ON public.savings_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mpesa_transactions_updated_at BEFORE UPDATE ON public.mpesa_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique loan number
CREATE OR REPLACE FUNCTION generate_loan_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    new_number := 'LN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.loans WHERE loan_number = new_number) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique client number
CREATE OR REPLACE FUNCTION generate_client_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    new_number := 'CL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.clients WHERE client_number = new_number) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate loan outstanding balance
CREATE OR REPLACE FUNCTION update_loan_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.loans
  SET 
    paid_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.payments
      WHERE loan_id = NEW.loan_id AND status = 'completed'
    ),
    outstanding_balance = total_amount - (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.payments
      WHERE loan_id = NEW.loan_id AND status = 'completed'
    )
  WHERE id = NEW.loan_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update loan balance after payment
CREATE TRIGGER update_loan_balance_after_payment
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION update_loan_balance();

-- Function to update savings account balance
CREATE OR REPLACE FUNCTION update_savings_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type IN ('deposit', 'interest') THEN
    NEW.balance_after = NEW.balance_before + NEW.amount;
  ELSIF NEW.transaction_type IN ('withdrawal', 'fee') THEN
    NEW.balance_after = NEW.balance_before - NEW.amount;
  END IF;
  
  UPDATE public.savings_accounts
  SET balance = NEW.balance_after,
      available_balance = NEW.balance_after
  WHERE id = NEW.savings_account_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update savings balance
CREATE TRIGGER update_savings_balance_trigger
BEFORE INSERT ON public.savings_transactions
FOR EACH ROW
EXECUTE FUNCTION update_savings_balance();

-- Grant permissions (adjust based on your needs)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Select permissions for anon users (for public-facing features)
GRANT SELECT ON public.loan_products TO anon;