# ✅ SmartLenderUp - Deployment Checklist

Quick reference checklist for deploying your full-stack platform.

---

## 📋 Phase 1: Local Setup (10 min)

```bash
□ Navigate to project folder
□ Run: npm install
□ Run: cp .env.example .env
□ Run: npm run dev
□ Test: Open http://localhost:5173
□ Verify: Landing page loads correctly
```

---

## 📋 Phase 2: Supabase Setup (20 min)

```bash
□ Create Supabase account at https://supabase.com
□ Create new project named "SmartLenderUp"
□ Set strong database password (save it!)
□ Choose region: Singapore or Frankfurt
□ Wait for project creation (2-3 minutes)

□ Get API credentials:
  □ Project URL: https://xxxxx.supabase.co
  □ anon public key: eyJhbG...
  □ service_role key: eyJhbG...

□ Update .env file with credentials:
  VITE_SUPABASE_URL=your_url
  VITE_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_key

□ Go to SQL Editor in Supabase
□ Open /supabase/schema.sql file
□ Copy entire contents (800+ lines)
□ Paste into SQL Editor
□ Click Run
□ Wait for "Success. No rows returned"

□ Verify 18 tables created:
  □ users
  □ organizations
  □ groups
  □ clients
  □ client_documents
  □ loan_products
  □ loans
  □ loan_guarantors
  □ loan_collateral
  □ payments
  □ mpesa_transactions
  □ savings_accounts
  □ savings_transactions
  □ sms_campaigns
  □ sms_logs
  □ notifications
  □ audit_logs
  □ system_settings

□ Restart dev server: Ctrl+C, then npm run dev
```

---

## 📋 Phase 3: Test Full Stack Locally (15 min)

```bash
□ Test User Registration:
  □ Open http://localhost:5173
  □ Click "Sign Up"
  □ Choose "Individual"
  □ Fill form: test@example.com / Test123!
  □ Submit
  □ Check Supabase → users table → User appears

□ Test Login:
  □ Click "Sign In"
  □ Enter: test@example.com / Test123!
  □ Should see portal dashboard

□ Test API (Terminal):
  curl -X POST http://localhost:5173/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"api@test.com","password":"Test123!","full_name":"API Test","role":"client"}'
  □ Should return: {"success":true,...}

□ Test Complete Flow:
  □ Login as admin (admin@bvfunguo.com / admin123)
  □ Create a client
  □ Check Supabase → clients table
  □ Apply for loan
  □ Check Supabase → loans table
```

---

## 📋 Phase 4: Git Setup (10 min)

```bash
□ Initialize Git:
  cd /path/to/smartlenderup-platform
  git init

□ Verify .gitignore contains:
  □ node_modules/
  □ .env
  □ .env.local
  □ dist/

□ Stage files:
  git add .
  git status
  □ Verify .env is NOT in the list!

□ Create first commit:
  git commit -m "Initial commit - SmartLenderUp complete"

□ Create GitHub repository:
  □ Go to https://github.com
  □ Click "+" → New repository
  □ Name: smartlenderup-platform
  □ Visibility: Private (recommended)
  □ DO NOT initialize with README
  □ Click "Create repository"

□ Link and push:
  git remote add origin https://github.com/YOUR_USERNAME/smartlenderup-platform.git
  git branch -M main
  git push -u origin main

□ Verify on GitHub:
  □ Refresh repository page
  □ Code files are there
  □ .env is NOT there
  □ Documentation files present
```

---

## 📋 Phase 5: Deploy to Vercel (10 min)

```bash
□ Create Vercel account:
  □ Go to https://vercel.com
  □ Sign up with GitHub
  □ Authorize Vercel

□ Import project:
  □ Click "Add New..." → "Project"
  □ Find "smartlenderup-platform"
  □ Click "Import"

□ Configure build:
  □ Framework: Vite (auto-detected)
  □ Build Command: npm run build
  □ Output Directory: dist
  □ Keep defaults

□ Add environment variables:
  □ VITE_SUPABASE_URL = your_supabase_url
  □ VITE_SUPABASE_ANON_KEY = your_anon_key
  □ SUPABASE_SERVICE_ROLE_KEY = your_service_key
  □ Select: Production, Preview, Development

□ Deploy:
  □ Click "Deploy"
  □ Wait 2-5 minutes
  □ See "Success" message

□ Get live URL:
  □ Click "Visit"
  □ URL: https://smartlenderup-platform.vercel.app
  □ Save this URL!
```

---

## 📋 Phase 6: Test Production (10 min)

```bash
□ Test production app:
  □ Open Vercel URL in browser
  □ Landing page loads
  □ Navigation works
  □ Sign Up modal opens
  □ Sign In modal opens
  □ Theme toggle works
  □ Test on mobile (F12 → device toolbar)

□ Test production registration:
  □ Sign Up with real email
  □ Check Supabase → users table
  □ User appears in database

□ Test production login:
  □ Login with created user
  □ Access portal successfully
  □ Navigate different sections

□ Test production API:
  PROD_URL="https://your-app.vercel.app"
  curl -X POST $PROD_URL/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"prod@test.com","password":"Test123!","full_name":"Prod Test","role":"client"}'
  □ Returns: {"success":true,...}

□ Check Vercel dashboard:
  □ Deployments → Successful
  □ Logs → No errors
  □ Analytics → Working
```

---

## 📋 Phase 7: Optional - Custom Domain (15 min)

```bash
□ Purchase domain:
  □ Namecheap.com / Google Domains
  □ Suggested: smartlenderup.com or smartlenderup.co.ke
  □ Cost: ~$10-15/year

□ Add to Vercel:
  □ Project → Settings → Domains
  □ Enter domain name
  □ Click "Add"

□ Configure DNS:
  □ Login to domain registrar
  □ Add A record:
    Type: A
    Name: @
    Value: 76.76.21.21
  □ Add CNAME record:
    Type: CNAME
    Name: www
    Value: cname.vercel-dns.com

□ Wait for DNS propagation:
  □ Usually 15-30 minutes
  □ Check: https://dnschecker.org
  □ Vercel auto-adds HTTPS

□ Test custom domain:
  □ Visit https://smartlenderup.com
  □ Should show your app
  □ HTTPS should be active
```

---

## 📋 Post-Deployment Tasks

```bash
□ Security:
  □ Change default admin password
  □ Change default employee password
  □ Review user permissions
  □ Enable 2FA (if available)

□ Configuration:
  □ Update company information
  □ Set organization details
  □ Configure email templates
  □ Set up notification preferences

□ Testing:
  □ Create test organization
  □ Create test client
  □ Submit test loan application
  □ Process test payment
  □ Generate test reports

□ Documentation:
  □ Create user guide
  □ Document admin procedures
  □ Write staff training manual
  □ Create FAQ document

□ Monitoring:
  □ Set up Google Analytics (optional)
  □ Enable Vercel Analytics
  □ Check Supabase metrics
  □ Set up error tracking (Sentry)

□ Marketing:
  □ Prepare launch announcement
  □ Create social media accounts
  □ Design marketing materials
  □ Plan launch campaign
```

---

## 📋 Optional Integrations

### M-Pesa Integration (Kenya Payments)

```bash
□ Create Safaricom developer account:
  □ Go to https://developer.safaricom.co.ke
  □ Sign up
  □ Verify email
  □ Complete profile

□ Create sandbox app:
  □ My Apps → Add new app
  □ Name: SmartLenderUp
  □ Get credentials:
    □ Consumer Key
    □ Consumer Secret
    □ Shortcode: 174379 (sandbox)
    □ Passkey

□ Add to environment variables:
  Local .env:
    MPESA_ENV=sandbox
    MPESA_CONSUMER_KEY=your_key
    MPESA_CONSUMER_SECRET=your_secret
    MPESA_SHORTCODE=174379
    MPESA_PASSKEY=your_passkey
    MPESA_CALLBACK_URL=http://localhost:5173/api/mpesa/callback

  Vercel (same variables):
    MPESA_CALLBACK_URL=https://your-app.vercel.app/api/mpesa/callback

□ Test sandbox:
  □ Use phone: 254708374149
  □ Amount: 10
  □ PIN: 1234
  □ Verify transaction completes
```

### Email Notifications (Resend)

```bash
□ Create Resend account:
  □ Go to https://resend.com
  □ Sign up (free: 3,000 emails/month)
  □ Create API key

□ Add to environment:
  VITE_RESEND_API_KEY=re_your_api_key
  VITE_FROM_EMAIL=noreply@smartlenderup.com

□ Verify domain (optional):
  □ Add DNS records
  □ Enables custom sender email
```

### SMS Notifications (Africa's Talking)

```bash
□ Create Africa's Talking account:
  □ Go to https://africastalking.com
  □ Sign up
  □ Create sandbox app
  □ Get API key

□ Add to environment:
  AFRICAS_TALKING_USERNAME=your_username
  AFRICAS_TALKING_API_KEY=your_api_key
  AFRICAS_TALKING_SENDER_ID=SmartLender
```

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Local development server runs without errors
- ✅ Supabase shows 18 tables created
- ✅ Can register users (appear in database)
- ✅ Can login successfully
- ✅ API endpoints return valid responses
- ✅ Code is on GitHub (without .env file)
- ✅ Vercel deployment succeeds
- ✅ Production URL is accessible
- ✅ Production registration works
- ✅ Production API responds correctly
- ✅ No errors in Vercel logs
- ✅ No errors in browser console

---

## 🆘 Quick Troubleshooting

**Build fails on Vercel?**
→ Run `npm run build` locally, fix errors, commit, push

**Database not connected?**
→ Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel

**API returns 404?**
→ Verify `api/` folder is in GitHub, check vercel.json exists

**Environment variables not working?**
→ Restart dev server, check spelling, redeploy in Vercel

**M-Pesa fails?**
→ Use sandbox credentials, check phone format (254...)

---

## 📞 Resources

**Documentation:**
- Full Guide: `/DEPLOYMENT_COMPLETE_GUIDE.md`
- Backend Setup: `/BACKEND_SETUP.md`
- API Testing: `/API_TESTING.md`
- Quick Start: `/QUICK_START.md`

**Services:**
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- GitHub Repository: https://github.com/yourusername/smartlenderup-platform

**Support:**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- M-Pesa Docs: https://developer.safaricom.co.ke

---

## 🎉 Deployment Complete!

When all checkboxes are marked:

**Your SmartLenderUp platform is LIVE and ready for business!** 🚀

**Total time:** ~60 minutes
**Total cost:** $0/month (free tier)
**Status:** Production-ready ✅

---

**Print this checklist and mark items as you complete them!**
