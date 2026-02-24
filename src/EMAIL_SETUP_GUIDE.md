# Email Notification Setup Guide for BV Funguo

This guide will help you set up email sending functionality for your microfinance platform using Resend and Supabase Edge Functions.

## Overview

The email system allows you to:
- Send automated payment reminders
- Send loan approval notifications
- Send disbursement confirmations
- Send overdue payment alerts
- Send monthly statements
- Send custom notifications

## Prerequisites

1. Supabase project (Project ID: `yrsnylrcgejnrxphjvtf`)
2. Resend account (free tier available)
3. Domain verification for `info@bvfunguo.com`
4. Supabase CLI installed

## Step 1: Set Up Resend Account

### 1.1 Create Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 1.2 Add and Verify Your Domain
1. In Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter `bvfunguo.com`
4. Follow the DNS verification instructions:
   - Add the provided DNS records to your domain registrar
   - Wait for DNS propagation (can take up to 24 hours)
   - Verify the domain in Resend

### 1.3 Get Your API Key
1. In Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Name it "BV Funguo Production"
4. Copy the API key (starts with `re_`)
5. **IMPORTANT**: Save this key securely - you won't be able to see it again

## Step 2: Install Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref yrsnylrcgejnrxphjvtf
```

## Step 3: Create the Edge Function

### 3.1 Create Function Directory
```bash
# Create the function
supabase functions new send-email
```

### 3.2 Add Function Code

Create/edit `supabase/functions/send-email/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    const { to, subject, html, from } = await req.json()

    const data = await resend.emails.send({
      from: from || 'BV Funguo Ltd <info@bvfunguo.com>',
      to: [to],
      subject: subject,
      html: html,
    })

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

## Step 4: Set Resend API Key as Secret

```bash
# Set the Resend API key as a secret
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

Replace `your_resend_api_key_here` with your actual Resend API key from Step 1.3.

## Step 5: Deploy the Edge Function

```bash
# Deploy the function
supabase functions deploy send-email --no-verify-jwt
```

The `--no-verify-jwt` flag allows the function to be called from your frontend without JWT verification. For production, you may want to enable JWT verification.

## Step 6: Test the Email Function

### 6.1 Test from Command Line
```bash
curl -L -X POST 'https://yrsnylrcgejnrxphjvtf.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello from BV Funguo!</h1>"
  }'
```

Replace `YOUR_ANON_KEY` with your Supabase anon key.

### 6.2 Test from Application
Go to the Email Notification Settings in your application:
1. Navigate to Settings → Email Notifications
2. Click the "Settings" tab
3. Enter a test email address
4. Click "Send Test"

## Step 7: Configure Automated Rules

### 7.1 Create Database Table for Email Logs

Run this SQL in your Supabase SQL editor:

```sql
-- Create email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  template_type TEXT NOT NULL,
  loan_id UUID REFERENCES loans(id),
  client_id UUID REFERENCES clients(id),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_email_logs_org ON email_logs(organization_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- Create RLS policies
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can view their own email logs"
  ON email_logs FOR SELECT
  USING (organization_id = (current_setting('app.current_organization_id', true))::uuid);

CREATE POLICY "Organizations can insert their own email logs"
  ON email_logs FOR INSERT
  WITH CHECK (organization_id = (current_setting('app.current_organization_id', true))::uuid);
```

### 7.2 Create Email Templates Table

```sql
-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_email_templates_org ON email_templates(organization_id);
CREATE INDEX idx_email_templates_type ON email_templates(template_type);

-- RLS policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can manage their own templates"
  ON email_templates FOR ALL
  USING (organization_id = (current_setting('app.current_organization_id', true))::uuid);
```

### 7.3 Create Automated Email Rules Table

```sql
-- Create automated email rules table
CREATE TABLE IF NOT EXISTS email_automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- 'days_before_due', 'days_overdue', 'loan_approved', 'disbursed'
  trigger_days INTEGER,
  template_id UUID REFERENCES email_templates(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_email_rules_org ON email_automation_rules(organization_id);
CREATE INDEX idx_email_rules_active ON email_automation_rules(active);

-- RLS policies
ALTER TABLE email_automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can manage their own rules"
  ON email_automation_rules FOR ALL
  USING (organization_id = (current_setting('app.current_organization_id', true))::uuid);
```

## Step 8: Set Up Scheduled Email Function (Optional)

For automated scheduled emails (payment reminders, overdue alerts), create a CRON job:

### 8.1 Create Scheduled Email Function

```typescript
// supabase/functions/send-scheduled-emails/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    
    // Get active automation rules
    const { data: rules } = await supabase
      .from('email_automation_rules')
      .select('*, email_templates(*)')
      .eq('active', true)
    
    const today = new Date()
    let emailsSent = 0
    
    for (const rule of rules || []) {
      if (rule.trigger_type === 'days_before_due') {
        // Find payments due in X days
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + rule.trigger_days)
        
        const { data: payments } = await supabase
          .from('payments')
          .select('*, loans(*), clients(*)')
          .eq('organization_id', rule.organization_id)
          .gte('due_date', dueDate.toISOString().split('T')[0])
          .lte('due_date', dueDate.toISOString().split('T')[0])
          .eq('status', 'pending')
        
        for (const payment of payments || []) {
          if (!payment.clients?.email) continue
          
          // Replace template variables
          let emailBody = rule.email_templates.body
            .replace(/{{client_name}}/g, payment.clients.name)
            .replace(/{{loan_id}}/g, payment.loans.loan_number)
            .replace(/{{amount}}/g, payment.amount.toLocaleString())
            .replace(/{{due_date}}/g, payment.due_date)
          
          await resend.emails.send({
            from: 'BV Funguo Ltd <info@bvfunguo.com>',
            to: [payment.clients.email],
            subject: rule.email_templates.subject,
            html: emailBody.replace(/\n/g, '<br>')
          })
          
          // Log the email
          await supabase.from('email_logs').insert({
            organization_id: rule.organization_id,
            recipient_email: payment.clients.email,
            recipient_name: payment.clients.name,
            subject: rule.email_templates.subject,
            template_type: rule.email_templates.template_type,
            loan_id: payment.loan_id,
            client_id: payment.client_id,
            status: 'sent'
          })
          
          emailsSent++
        }
      }
      
      // Add similar logic for days_overdue, loan_approved, disbursed
    }
    
    return new Response(
      JSON.stringify({ success: true, emailsSent }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

### 8.2 Deploy Scheduled Function
```bash
supabase functions deploy send-scheduled-emails
```

### 8.3 Create CRON Job
In Supabase Dashboard:
1. Go to Database → Extensions
2. Enable `pg_cron` extension
3. Run this SQL:

```sql
-- Schedule daily email check at 8 AM
SELECT cron.schedule(
  'send-scheduled-emails',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://yrsnylrcgejnrxphjvtf.supabase.co/functions/v1/send-scheduled-emails',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    );
  $$
);
```

## Step 9: Update Application Configuration

In your application, update the Supabase configuration:

```typescript
// lib/supabase.ts already has your credentials
// The email function will work automatically
```

## Testing Checklist

- [ ] Resend account created
- [ ] Domain verified in Resend
- [ ] API key obtained
- [ ] Supabase CLI installed
- [ ] Edge function created
- [ ] Secrets configured
- [ ] Function deployed
- [ ] Test email sent successfully
- [ ] Database tables created
- [ ] Templates configured
- [ ] Automation rules set up
- [ ] CRON job scheduled (optional)

## Email Templates Available

1. **Payment Reminder** - Sent X days before payment due
2. **Loan Approved** - Sent when loan is approved
3. **Disbursement Confirmation** - Sent when loan is disbursed
4. **Overdue Payment Alert** - Sent when payment is overdue
5. **Monthly Statement** - Sent monthly with account summary

## Template Variables

You can use these variables in your email templates:

- `{{client_name}}` - Client's full name
- `{{loan_id}}` - Loan number/ID
- `{{amount}}` - Payment or loan amount
- `{{due_date}}` - Payment due date
- `{{outstanding_balance}}` - Current outstanding balance
- `{{interest_rate}}` - Loan interest rate
- `{{loan_term}}` - Loan term
- `{{days_overdue}}` - Number of days overdue
- `{{late_fee}}` - Late fee amount
- `{{disbursement_date}}` - Date loan was disbursed
- `{{first_payment_date}}` - First payment due date

## Troubleshooting

### Email not sending
1. Check Resend API key is correct
2. Verify domain is verified in Resend
3. Check Edge Function logs in Supabase
4. Verify client has valid email address

### Domain verification issues
1. Wait 24-48 hours for DNS propagation
2. Check DNS records are correctly added
3. Use DNS checker tool to verify records

### Function errors
1. Check Supabase logs: `supabase functions logs send-email`
2. Verify RESEND_API_KEY secret is set
3. Test with curl command first

## Production Considerations

1. **Rate Limits**: Resend free tier has limits - upgrade if needed
2. **Email Validation**: Validate email addresses before sending
3. **Bounce Handling**: Monitor bounced emails
4. **Unsubscribe**: Add unsubscribe links for marketing emails
5. **Compliance**: Ensure GDPR/local compliance
6. **Monitoring**: Set up monitoring for failed emails
7. **Testing**: Always test in staging before production

## Support

For issues:
- Resend support: [https://resend.com/support](https://resend.com/support)
- Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)
- Edge Functions: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)

## Cost

- **Resend Free Tier**: 3,000 emails/month free
- **Resend Pro**: $20/month for 50,000 emails
- **Supabase Edge Functions**: Free tier includes 500K invocations/month

## Next Steps

After setup:
1. Configure email templates in the application
2. Set up automation rules
3. Test with real client data
4. Monitor email delivery rates
5. Optimize templates based on open rates
