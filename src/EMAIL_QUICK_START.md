# ⚡ Email System - 5 Minute Quick Start

## 🎯 What You're Building

**Automated email notifications** for your BV Funguo microfinance platform:
- ✅ Loan approvals/rejections
- ✅ Disbursement confirmations  
- ✅ Payment receipts
- ✅ Payment reminders

**All professionally designed, mobile-responsive, and branded!**

---

## 📋 What You Need

- [ ] Supabase project (already connected ✅)
- [ ] Resend account (free - get in 2 minutes)
- [ ] 15 minutes of your time

---

## 🚀 Step-by-Step (15 Minutes)

### **STEP 1: Get Resend API Key** ⏱️ 2 minutes

1. Go to **https://resend.com**
2. Click **"Get Started Free"**
3. Sign up with email
4. Click **"API Keys"** in dashboard
5. Click **"Create API Key"**
6. Copy the key (starts with `re_`)

**✅ Got your key? Continue to Step 2!**

---

### **STEP 2: Deploy Edge Functions** ⏱️ 5 minutes

#### **Option A: Automatic (Easiest)**

Open terminal in your project folder:

```bash
chmod +x deploy-email-system.sh
./deploy-email-system.sh
```

**That's it!** The script will:
- ✅ Check if Supabase CLI is installed
- ✅ Login to Supabase
- ✅ Link to your project
- ✅ Deploy both email functions
- ✅ Show you next steps

#### **Option B: Manual**

If you prefer manual steps:

```bash
# 1. Install Supabase CLI (if not installed)
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link to your project
supabase link --project-ref yrsnylrcgejnrxphjvtf

# 4. Deploy the email function
supabase functions deploy send-email --no-verify-jwt

# 5. Deploy scheduled emails (optional)
supabase functions deploy send-scheduled-emails
```

**✅ Functions deployed? Continue to Step 3!**

---

### **STEP 3: Add API Key to Supabase** ⏱️ 1 minute

1. Go to **https://supabase.com/dashboard/project/yrsnylrcgejnrxphjvtf/settings/functions**

2. Scroll to **"Secrets"** section

3. Click **"Add new secret"**

4. Fill in:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_xxxxxxxxxxxxx` (paste your Resend key)

5. Click **"Save"**

**✅ Done!** Your email system is live! 🎉

---

### **STEP 4: Test It!** ⏱️ 3 minutes

1. Go to **https://supabase.com/dashboard/project/yrsnylrcgejnrxphjvtf/functions**

2. Click **"send-email"**

3. Click **"Invoke function"**

4. Paste this test payload (replace with your email):

```json
{
  "to": "YOUR_EMAIL@example.com",
  "subject": "🎉 Test from BV Funguo",
  "html": "<h1>Success!</h1><p>Your email system is working perfectly!</p>",
  "text": "Success! Your email system is working!"
}
```

5. Click **"Send"**

6. **Check your inbox!** 📬

**✅ Got the email? You're ready to integrate!**

---

### **STEP 5: Integrate into Your App** ⏱️ 5 minutes

Pick any of these integrations to start:

#### **A) Send Approval Email**

Open `/components/tabs/ApprovalsTab.tsx` and add:

```typescript
import { sendLoanApprovalNotification } from '../../services/emailService';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { toast } from 'sonner@2.0.3';

// Find the handleApprove function and update it:
const handleApprove = async (approvalId: string) => {
  approveApproval(approvalId, 'Management Team');
  
  // Send email notification
  const approval = approvals.find(a => a.id === approvalId);
  const loan = loans.find(l => l.id === approval?.relatedId);
  const client = clients.find(c => c.id === loan?.clientId);
  
  if (client?.email) {
    await sendLoanApprovalNotification(
      client.email,
      client.name,
      loan.loanId,
      loan.approvedAmount,
      getCurrencyCode(),
      loan.repaymentPeriod
    );
    toast.success(`✅ Loan approved! Email sent to ${client.name}`);
  }
};
```

#### **B) Send Payment Confirmation**

Open `/components/modals/RecordPaymentModal.tsx` and add:

```typescript
import { sendPaymentConfirmationNotification } from '../../services/emailService';

// After recording payment:
if (client?.email) {
  await sendPaymentConfirmationNotification(
    client.email,
    client.name,
    loan.loanId,
    payment.amount,
    getCurrencyCode(),
    payment.paymentDate,
    payment.receiptNumber,
    updatedLoan.outstandingBalance
  );
  toast.success('✅ Payment recorded! Receipt sent to client');
}
```

**✅ That's it! Emails will now send automatically!**

---

## 🎉 You're Done!

Your email system is now:
- ✅ Deployed to Supabase
- ✅ Connected to Resend
- ✅ Ready to send emails
- ✅ Integrated into your app

---

## 📊 What Happens Next?

### **Automatic Emails:**
1. **Loan approved** → Client gets congratulations email
2. **Loan disbursed** → Client gets confirmation with payment schedule
3. **Payment received** → Client gets receipt
4. **Payment due** → Client gets reminder (3, 1 days before)
5. **Payment overdue** → Client gets urgent reminder

---

## 💰 Costs

**FREE!** 🎉

- Resend: 100 emails/day free
- Supabase: 500K function calls/month free
- Total: **$0/month** for your needs

---

## 📚 Need More Help?

### **Complete Documentation:**
- `/EMAIL_SYSTEM_READY.md` - Overview & quick deploy
- `/EMAIL_SYSTEM_SETUP_COMPLETE.md` - Detailed guide
- `/INTEGRATION_EXAMPLE_EMAIL.md` - Copy-paste code examples
- `/services/emailService.ts` - Source code (commented)

### **Test Emails:**
All templates are in `/services/emailService.ts`:
- `loanApprovalEmail()` - Preview in code
- `paymentReminderEmail()` - Preview in code
- `disbursementConfirmationEmail()` - Preview in code
- `paymentConfirmationEmail()` - Preview in code

---

## 🆘 Troubleshooting

### **"Edge Functions not deploying"**
- Install Supabase CLI: `npm install -g supabase`
- Login: `supabase login`
- Try manual deployment (see Step 2 Option B)

### **"Emails not sending"**
- Check RESEND_API_KEY is set in Supabase
- Verify key starts with `re_`
- Check Resend dashboard for quota/errors

### **"Emails going to spam"**
- Use Resend's testing domain first
- Later: verify your own domain (info@bvfunguo.com)
- Ask test recipients to check spam folder

---

## ✅ Quick Checklist

Before going live:

- [ ] Resend account created
- [ ] API key copied
- [ ] Edge functions deployed
- [ ] API key added to Supabase
- [ ] Test email sent successfully
- [ ] Test email received in inbox
- [ ] Code integrated in at least one place
- [ ] Real test: Approve a loan and check email

---

## 🚀 Deploy Command

```bash
./deploy-email-system.sh
```

**Total Time:** 15 minutes  
**Difficulty:** Easy  
**Cost:** FREE  

---

**Let's go! Run the deploy script now!** 🎉

```bash
chmod +x deploy-email-system.sh
./deploy-email-system.sh
```
