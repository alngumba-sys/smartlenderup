# 🚀 Email System Deployment Checklist

## Prerequisites
- ✅ Supabase project: `yrsnylrcgejnrxphjvtf`
- ✅ Domain: `bvfunguo.com`
- ✅ Email: `info@bvfunguo.com`

---

## 📋 Step-by-Step Deployment

### ☐ **STEP 1: Resend Account Setup**
**Time: 5 minutes**

1. ☐ Go to [resend.com](https://resend.com)
2. ☐ Click "Get Started" → Sign up with email
3. ☐ Verify your email address
4. ☐ Click "Domains" in sidebar
5. ☐ Click "Add Domain"
6. ☐ Enter: `bvfunguo.com`
7. ☐ Copy the DNS records shown
8. ☐ Add DNS records to your domain registrar:
   - TXT record for verification
   - MX records for deliverability
   - SPF record
   - DKIM record
9. ☐ Click "Verify Domain" (may take 5-30 min)
10. ☐ Once verified, click "API Keys" in sidebar
11. ☐ Click "Create API Key"
12. ☐ Name it: "BV Funguo Production"
13. ☐ Copy the API key (starts with `re_`)
14. ☐ Save it somewhere safe!

**✅ Completion Check:**
- Domain shows "Verified" in Resend dashboard
- API key copied and saved

---

### ☐ **STEP 2: Install Supabase CLI**
**Time: 2 minutes**

**Option A: Using npm (Recommended)**
```bash
npm install -g supabase
```

**Option B: Using Homebrew (Mac)**
```bash
brew install supabase/tap/supabase
```

**Option C: Using Scoop (Windows)**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Verify Installation:**
```bash
supabase --version
```

**✅ Completion Check:**
- Command shows version number (e.g., `1.x.x`)

---

### ☐ **STEP 3: Connect to Supabase**
**Time: 1 minute**

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref yrsnylrcgejnrxphjvtf
```

**What happens:**
- Browser opens for authentication
- You login with your Supabase account
- CLI connects to your project

**✅ Completion Check:**
- See message: "Finished supabase link"

---

### ☐ **STEP 4: Set Resend API Key**
**Time: 30 seconds**

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

**Replace `re_your_api_key_here` with your actual Resend API key from Step 1**

**Example:**
```bash
supabase secrets set RESEND_API_KEY=re_abcd1234efgh5678ijkl
```

**✅ Completion Check:**
- See message: "Secret successfully set"
- Verify: `supabase secrets list` (should show RESEND_API_KEY)

---

### ☐ **STEP 5: Deploy Edge Functions**
**Time: 2 minutes**

**Deploy Send Email Function:**
```bash
cd /path/to/your/project
supabase functions deploy send-email --no-verify-jwt
```

**Deploy Scheduled Email Function (Optional):**
```bash
supabase functions deploy send-scheduled-emails
```

**What happens:**
- Functions are uploaded to Supabase
- Compiled and deployed
- URLs are generated

**✅ Completion Check:**
- See "Deployed Function send-email"
- Function URL displayed
- No errors in output

---

### ☐ **STEP 6: Create Database Tables**
**Time: 1 minute**

1. ☐ Open Supabase Dashboard
2. ☐ Go to: https://supabase.com/dashboard/project/yrsnylrcgejnrxphjvtf
3. ☐ Click "SQL Editor" in sidebar
4. ☐ Click "New Query"
5. ☐ Open file: `/supabase/email_notifications_setup.sql`
6. ☐ Copy ALL the SQL code
7. ☐ Paste into Supabase SQL Editor
8. ☐ Click "Run" button
9. ☐ Wait for "Success" message

**✅ Completion Check:**
- See "Success. No rows returned"
- Go to Table Editor → Should see:
  - email_logs
  - email_templates
  - email_automation_rules
  - email_settings

---

### ☐ **STEP 7: Test Email Sending**
**Time: 1 minute**

**Option A: Test from Application**
1. ☐ Open your BV Funguo platform
2. ☐ Login as admin
3. ☐ Go to **Settings** → **Notifications**
4. ☐ Click "Email Settings" tab
5. ☐ Scroll to "Send Test Email"
6. ☐ Enter your email address
7. ☐ Click "Send Test"
8. ☐ Check your inbox!

**Option B: Test from Command Line**
```bash
curl -L -X POST 'https://yrsnylrcgejnrxphjvtf.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc255bHJjZ2VqbnJ4cGhqdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTAxNDIsImV4cCI6MjA4MjU4NjE0Mn0.RCcfK0ObcSCnwqW_bD7c4M7DSN_SCTPT6QK7LXi4R9o' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email from BV Funguo",
    "html": "<h1>Success!</h1><p>Your email system is working!</p>"
  }'
```

**✅ Completion Check:**
- Email received in inbox
- From: info@bvfunguo.com
- Subject line correct
- HTML rendered properly

---

### ☐ **STEP 8: Configure Templates** (Optional)
**Time: 5 minutes**

1. ☐ Go to **Settings** → **Notifications** → **Templates**
2. ☐ Review default templates
3. ☐ Edit templates to match your brand:
   - Add your logo
   - Update contact information
   - Customize messaging
   - Add company footer
4. ☐ Save changes

**✅ Completion Check:**
- All templates reviewed
- Brand customizations applied
- Test email sent with new template

---

### ☐ **STEP 9: Set Up Automation Rules** (Optional)
**Time: 3 minutes**

1. ☐ Go to **Settings** → **Notifications** → **Automated Rules**
2. ☐ Review default rules:
   - Payment Reminder - 3 Days Before
   - Payment Reminder - 1 Day Before
   - Overdue Alert - 1 Day
   - Overdue Alert - 7 Days
3. ☐ Activate/deactivate as needed
4. ☐ Create custom rules if needed

**✅ Completion Check:**
- At least 2 rules active
- Rules match your business process

---

### ☐ **STEP 10: Enable Scheduled Emails** (Optional - Advanced)
**Time: 3 minutes**

**Only if you deployed send-scheduled-emails in Step 5**

1. ☐ In Supabase Dashboard, go to Database → Extensions
2. ☐ Search for `pg_cron`
3. ☐ Click toggle to enable
4. ☐ Go to SQL Editor
5. ☐ Run this query:

```sql
SELECT cron.schedule(
  'send-scheduled-emails-daily',
  '0 8 * * *',  -- 8 AM every day
  $$
  SELECT
    net.http_post(
      url:='https://yrsnylrcgejnrxphjvtf.supabase.co/functions/v1/send-scheduled-emails',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    );
  $$
);
```

**Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key**

**To get service role key:**
- Go to Project Settings → API
- Click eye icon next to "service_role"
- Copy the key

**✅ Completion Check:**
- Query returns: `send-scheduled-emails-daily`
- Check scheduled jobs: `SELECT * FROM cron.job;`

---

## 🎉 Deployment Complete!

### ✅ Final Verification

Run through this checklist:

- [ ] Resend domain verified ✅
- [ ] Resend API key working ✅
- [ ] Supabase CLI installed ✅
- [ ] Edge functions deployed ✅
- [ ] Database tables created ✅
- [ ] Test email received ✅
- [ ] Templates customized ✅
- [ ] Automation rules configured ✅
- [ ] Scheduled emails enabled ✅ (optional)

---

## 📊 What You Can Do Now

✅ **Send Manual Emails**
- From client details modal
- From loan operations
- From Settings → Notifications

✅ **Automated Reminders**
- Payment reminders sent automatically
- Overdue alerts sent automatically
- Loan notifications sent automatically

✅ **Track Everything**
- View all sent emails in Email Logs
- See delivery status
- Monitor open/click rates (if Resend webhook configured)

✅ **Customize**
- Edit templates
- Add/remove automation rules
- Adjust reminder schedules
- Change sending frequency

---

## 🐛 Troubleshooting

### Email Not Sending
**Check:**
1. Resend API key is correct: `supabase secrets list`
2. Domain is verified in Resend dashboard
3. Edge function deployed: `supabase functions list`
4. Function logs: `supabase functions logs send-email --tail`

**Common Issues:**
- API key typo → Re-run Step 4
- Domain not verified → Wait 24h, check DNS
- Function not deployed → Re-run Step 5

### Domain Verification Failing
**Check DNS Records:**
```bash
# Check TXT record
nslookup -type=TXT bvfunguo.com

# Check MX record
nslookup -type=MX bvfunguo.com
```

**Solutions:**
- Wait 24-48 hours for DNS propagation
- Verify records added correctly
- Use [dnschecker.org](https://dnschecker.org) to check globally

### Function Errors
**View logs:**
```bash
supabase functions logs send-email --tail
```

**Common errors:**
- "RESEND_API_KEY not set" → Re-run Step 4
- "Domain not verified" → Check Resend dashboard
- "Invalid from address" → Check email settings

---

## 📞 Get Help

**Documentation:**
- Complete Guide: `/EMAIL_SETUP_GUIDE.md`
- Quick Start: `/EMAIL_QUICK_START.md`
- Implementation: `/EMAIL_IMPLEMENTATION_COMPLETE.md`

**External Support:**
- Resend: [resend.com/support](https://resend.com/support)
- Supabase: [supabase.com/docs](https://supabase.com/docs)

---

## 💰 Cost Breakdown

**Resend:**
- Free tier: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Business: Custom pricing

**Supabase:**
- Free tier: 500K Edge Function calls/month
- Included in your current plan

**Total Monthly Cost:**
- **$0** for < 3,000 emails/month
- **$20** for < 50,000 emails/month

**Example Usage:**
- 100 clients
- 6 emails per client per month
- = 600 emails/month
- = **FREE**

---

## 🎯 Next Steps After Deployment

1. **Monitor Email Logs**
   - Check delivery rates
   - Identify failed emails
   - Track client engagement

2. **Optimize Templates**
   - A/B test subject lines
   - Improve email content
   - Add personalization

3. **Adjust Automation**
   - Fine-tune reminder timing
   - Add new trigger rules
   - Disable ineffective rules

4. **Scale Up**
   - Add more automation rules
   - Integrate with SMS
   - Add webhook tracking

---

**Deployment Date:** _________________
**Deployed By:** _________________
**Status:** ☐ Complete
**Time Taken:** _______ minutes

---

## 🚀 You're Live!

Your email notification system is now **ACTIVE** and ready to:
- ✅ Send automated payment reminders
- ✅ Alert clients about overdue payments
- ✅ Notify about loan approvals
- ✅ Confirm disbursements
- ✅ Deliver monthly statements

All from **info@bvfunguo.com** 📧

**Welcome to automated client communications!** 🎉
