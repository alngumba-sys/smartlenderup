# Email Notifications - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Set Up Resend (2 minutes)
1. Go to [resend.com](https://resend.com) and sign up
2. Click "Add Domain" → Enter `bvfunguo.com`
3. Copy the DNS records and add them to your domain registrar
4. Wait for verification (usually 5-30 minutes)
5. Create API Key → Copy it (starts with `re_`)

### 2. Configure Supabase (2 minutes)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref yrsnylrcgejnrxphjvtf

# Set your Resend API key
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Deploy email function
supabase functions deploy send-email --no-verify-jwt
```

### 3. Set Up Database (1 minute)
In Supabase SQL Editor, run:
```sql
-- Copy and paste the contents of /supabase/email_notifications_setup.sql
```

### 4. Test It!
1. Open your BV Funguo platform
2. Go to **Settings** → **Notifications** tab
3. Enter your email in the "Send Test Email" section
4. Click "Send Test"
5. Check your inbox! 📧

## 📋 What You Get

✅ **Payment Reminders** - Automatically sent before due dates
✅ **Overdue Alerts** - Sent when payments are late  
✅ **Loan Approvals** - Notify clients when loans are approved
✅ **Disbursement Confirmations** - Sent when funds are transferred
✅ **Monthly Statements** - Regular account summaries
✅ **Custom Templates** - Fully customizable email content
✅ **Email Logs** - Track all sent emails
✅ **Automated Rules** - Set it and forget it

## 🎯 Using the Email System

### Send a Manual Email
```typescript
import { supabase } from './lib/supabase';

const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'client@example.com',
    subject: 'Payment Reminder',
    html: '<h1>Your payment is due!</h1>'
  }
});
```

### Configure Automation Rules
1. Go to **Settings** → **Notifications** → **Automated Rules**
2. Click "New Rule"
3. Select trigger type (e.g., "3 days before due")
4. Choose email template
5. Activate the rule

### Customize Templates
1. Go to **Settings** → **Notifications** → **Templates**
2. Click on a template to edit
3. Use variables like `{{client_name}}`, `{{amount}}`, etc.
4. Save and test

## 📊 Available Template Variables

Use these in your email templates:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{client_name}}` | Client's full name | John Doe |
| `{{loan_id}}` | Loan number | LN12345 |
| `{{amount}}` | Payment amount | 50,000 |
| `{{currency}}` | Currency symbol | KSh |
| `{{due_date}}` | Payment due date | 2024-03-01 |
| `{{outstanding_balance}}` | Remaining balance | 450,000 |
| `{{interest_rate}}` | Loan interest rate | 15% |
| `{{loan_term}}` | Loan duration | 12 months |
| `{{days_overdue}}` | Days past due | 5 |
| `{{organization_name}}` | Your company | BV Funguo Ltd |

## ⚙️ Automated Reminders

### Default Schedule
- **7 days before** due date
- **3 days before** due date  
- **1 day before** due date
- **On due date**
- **1 day overdue**
- **7 days overdue**

### Customize Schedule
1. **Settings** → **Notifications** → **Automated Rules**
2. Click on a rule to edit
3. Change the trigger days
4. Save changes

## 📈 Monitor Email Activity

### View Email Logs
1. **Settings** → **Notifications** → **Email Logs**
2. See all sent emails with:
   - Date/time sent
   - Recipient
   - Subject
   - Status (sent/failed)
   - Template used

### Check Statistics
```sql
-- Run in Supabase SQL Editor
SELECT 
  template_type,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM email_logs
WHERE organization_id = 'YOUR_ORG_ID'
GROUP BY template_type;
```

## 🔧 Advanced Setup (Optional)

### Enable Scheduled Emails (CRON)

1. Deploy the scheduled function:
```bash
supabase functions deploy send-scheduled-emails
```

2. In Supabase Dashboard → Database → Extensions, enable `pg_cron`

3. Run this SQL:
```sql
SELECT cron.schedule(
  'send-scheduled-emails-daily',
  '0 8 * * *',  -- Run at 8 AM daily
  $$
  SELECT
    net.http_post(
      url:='https://yrsnylrcgejnrxphjvtf.supabase.co/functions/v1/send-scheduled-emails',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    );
  $$
);
```

### Configure Email Rate Limits

In `email_settings` table:
```sql
UPDATE email_settings
SET daily_limit = 5000  -- Max emails per day
WHERE organization_id = 'YOUR_ORG_ID';
```

## 🐛 Troubleshooting

### Emails Not Sending
1. ✅ Check Resend API key is set: `supabase secrets list`
2. ✅ Verify domain in Resend dashboard
3. ✅ Check function logs: `supabase functions logs send-email`
4. ✅ Verify client has valid email address

### Domain Not Verified
1. Check DNS records are correctly added
2. Use DNS checker tool: [dnschecker.org](https://dnschecker.org)
3. Wait 24-48 hours for propagation
4. Contact Resend support if needed

### Function Errors
```bash
# Check function logs
supabase functions logs send-email --tail

# Test function directly
curl -L -X POST 'https://yrsnylrcgejnrxphjvtf.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"to":"test@example.com","subject":"Test","html":"<h1>Test</h1>"}'
```

## 💰 Costs

**Resend Pricing:**
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Business: Custom pricing

**Supabase:**
- Free tier: 500K Edge Function invocations/month
- Typically sufficient for most microfinance operations

## 📞 Support

**Resend:** [resend.com/support](https://resend.com/support)
**Supabase:** [supabase.com/docs](https://supabase.com/docs)

## ✅ Checklist

- [ ] Resend account created
- [ ] Domain verified
- [ ] API key obtained and set
- [ ] Edge function deployed
- [ ] Database tables created
- [ ] Test email sent successfully
- [ ] Templates customized
- [ ] Automation rules configured
- [ ] Email logs working
- [ ] Scheduled CRON set up (optional)

## 🎉 You're All Set!

Your email notification system is now active! Clients will automatically receive:
- Payment reminders before due dates
- Overdue alerts for late payments
- Loan approval confirmations
- Disbursement notifications
- Monthly statements

**From:** info@bvfunguo.com 📧
