-- Email Notifications Setup for BV Funguo Microfinance Platform
-- Run this script in your Supabase SQL Editor to set up email notification tables

-- =====================================================
-- 1. EMAIL LOGS TABLE
-- =====================================================
-- Stores history of all emails sent through the platform
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'payment_reminder', 'loan_approved', 'disbursement', 'overdue', 'statement', 'welcome'
  loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  resend_id TEXT, -- ID from Resend API for tracking
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_email_logs_org ON email_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_client ON email_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_loan ON email_logs(loan_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_type ON email_logs(template_type);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Organizations can view their own email logs"
  ON email_logs FOR SELECT
  USING (organization_id = (current_setting('app.current_organization_id', true))::uuid);

CREATE POLICY "Organizations can insert their own email logs"
  ON email_logs FOR INSERT
  WITH CHECK (organization_id = (current_setting('app.current_organization_id', true))::uuid);

CREATE POLICY "Organizations can update their own email logs"
  ON email_logs FOR UPDATE
  USING (organization_id = (current_setting('app.current_organization_id', true))::uuid);

-- =====================================================
-- 2. EMAIL TEMPLATES TABLE
-- =====================================================
-- Stores customizable email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'payment_reminder', 'loan_approved', 'disbursement', 'overdue', 'statement', 'welcome'
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Array of available variables like ["{{client_name}}", "{{amount}}"]
  active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_org ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(active);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Organizations can manage their own templates"
  ON email_templates FOR ALL
  USING (organization_id = (current_setting('app.current_organization_id', true))::uuid);

-- =====================================================
-- 3. EMAIL AUTOMATION RULES TABLE
-- =====================================================
-- Stores automated email trigger rules
CREATE TABLE IF NOT EXISTS email_automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'days_before_due', 'days_overdue', 'loan_approved', 'disbursed', 'loan_created'
  trigger_days INTEGER, -- Number of days for time-based triggers
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  send_time TIME DEFAULT '08:00:00', -- Time of day to send emails (for scheduled triggers)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_rules_org ON email_automation_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_rules_active ON email_automation_rules(active);
CREATE INDEX IF NOT EXISTS idx_email_rules_trigger ON email_automation_rules(trigger_type);

-- Enable RLS
ALTER TABLE email_automation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Organizations can manage their own rules"
  ON email_automation_rules FOR ALL
  USING (organization_id = (current_setting('app.current_organization_id', true))::uuid);

-- =====================================================
-- 4. EMAIL SETTINGS TABLE
-- =====================================================
-- Stores email configuration per organization
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  from_email TEXT DEFAULT 'info@bvfunguo.com',
  from_name TEXT DEFAULT 'BV Funguo Ltd',
  reply_to TEXT DEFAULT 'info@bvfunguo.com',
  smtp_configured BOOLEAN DEFAULT false,
  enable_reminders BOOLEAN DEFAULT true,
  enable_statements BOOLEAN DEFAULT true,
  enable_alerts BOOLEAN DEFAULT true,
  daily_limit INTEGER DEFAULT 1000, -- Max emails per day
  emails_sent_today INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_settings_org ON email_settings(organization_id);

-- Enable RLS
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Organizations can manage their own email settings"
  ON email_settings FOR ALL
  USING (organization_id = (current_setting('app.current_organization_id', true))::uuid);

-- =====================================================
-- 5. INSERT DEFAULT TEMPLATES (Optional)
-- =====================================================
-- You can insert default templates here for each organization
-- This is an example - modify the organization_id as needed

-- Example: Insert default templates for a specific organization
-- Replace 'YOUR_ORG_ID' with your actual organization UUID

/*
INSERT INTO email_templates (organization_id, name, template_type, subject, body, variables, active, is_default)
VALUES
  (
    'YOUR_ORG_ID'::uuid,
    'Payment Reminder',
    'payment_reminder',
    'Payment Reminder - {{loan_id}}',
    'Dear {{client_name}},

This is a friendly reminder that your loan payment of {{currency}}{{amount}} is due on {{due_date}}.

Loan Details:
- Loan ID: {{loan_id}}
- Amount Due: {{currency}}{{amount}}
- Due Date: {{due_date}}
- Outstanding Balance: {{currency}}{{outstanding_balance}}

Please make your payment on time to avoid late fees.

Thank you,
{{organization_name}}',
    '["{{client_name}}", "{{loan_id}}", "{{currency}}", "{{amount}}", "{{due_date}}", "{{outstanding_balance}}", "{{organization_name}}"]'::jsonb,
    true,
    true
  ),
  (
    'YOUR_ORG_ID'::uuid,
    'Loan Approved',
    'loan_approved',
    'Loan Application Approved - {{loan_id}}',
    'Dear {{client_name}},

Congratulations! Your loan application has been approved.

Loan Details:
- Loan ID: {{loan_id}}
- Approved Amount: {{currency}}{{amount}}
- Interest Rate: {{interest_rate}}%
- Loan Term: {{loan_term}}

Your loan will be disbursed shortly.

Thank you,
{{organization_name}}',
    '["{{client_name}}", "{{loan_id}}", "{{currency}}", "{{amount}}", "{{interest_rate}}", "{{loan_term}}", "{{organization_name}}"]'::jsonb,
    true,
    true
  ),
  (
    'YOUR_ORG_ID'::uuid,
    'Disbursement Confirmation',
    'disbursement',
    'Loan Disbursed - {{loan_id}}',
    'Dear {{client_name}},

Your loan has been successfully disbursed.

Disbursement Details:
- Loan ID: {{loan_id}}
- Amount Disbursed: {{currency}}{{amount}}
- Disbursement Date: {{disbursement_date}}
- First Payment Due: {{first_payment_date}}

Please ensure timely repayment.

Thank you,
{{organization_name}}',
    '["{{client_name}}", "{{loan_id}}", "{{currency}}", "{{amount}}", "{{disbursement_date}}", "{{first_payment_date}}", "{{organization_name}}"]'::jsonb,
    true,
    true
  ),
  (
    'YOUR_ORG_ID'::uuid,
    'Overdue Payment Alert',
    'overdue',
    'URGENT: Overdue Payment - {{loan_id}}',
    'Dear {{client_name}},

Your loan payment is now {{days_overdue}} days overdue.

Overdue Payment Details:
- Loan ID: {{loan_id}}
- Overdue Amount: {{currency}}{{amount}}
- Days Overdue: {{days_overdue}}
- Late Fee: {{currency}}{{late_fee}}

Please contact us immediately to arrange payment.

Thank you,
{{organization_name}}
Phone: {{organization_phone}}',
    '["{{client_name}}", "{{loan_id}}", "{{currency}}", "{{amount}}", "{{days_overdue}}", "{{late_fee}}", "{{organization_name}}", "{{organization_phone}}"]'::jsonb,
    true,
    true
  );
*/

-- =====================================================
-- 6. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_automation_rules_updated_at
  BEFORE UPDATE ON email_automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_settings_updated_at
  BEFORE UPDATE ON email_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to reset daily email count
CREATE OR REPLACE FUNCTION reset_daily_email_count()
RETURNS void AS $$
BEGIN
  UPDATE email_settings
  SET emails_sent_today = 0,
      last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================
-- Grant necessary permissions to authenticated users

GRANT SELECT, INSERT, UPDATE ON email_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_automation_rules TO authenticated;
GRANT SELECT, INSERT, UPDATE ON email_settings TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- To verify the setup, run:
SELECT 
  'email_logs' as table_name, 
  COUNT(*) as row_count 
FROM email_logs
UNION ALL
SELECT 
  'email_templates' as table_name, 
  COUNT(*) as row_count 
FROM email_templates
UNION ALL
SELECT 
  'email_automation_rules' as table_name, 
  COUNT(*) as row_count 
FROM email_automation_rules
UNION ALL
SELECT 
  'email_settings' as table_name, 
  COUNT(*) as row_count 
FROM email_settings;

-- Next steps:
-- 1. Set up Resend account and get API key
-- 2. Deploy Supabase Edge Function (see EMAIL_SETUP_GUIDE.md)
-- 3. Configure email settings in the application
-- 4. Create and activate automation rules
-- 5. Test email sending functionality
