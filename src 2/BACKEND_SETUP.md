># SmartLenderUp - Backend Setup Guide

This guide will help you set up the complete backend infrastructure for your SmartLenderUp platform.

---

## 📋 Overview

Your backend consists of:
- **Supabase** - PostgreSQL database with authentication
- **Vercel Serverless Functions** - REST API endpoints
- **M-Pesa Integration** - Kenya mobile payments
- **Email/SMS Services** - Notifications

---

## 🗄️ Step 1: Supabase Database Setup (15 minutes)

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub
4. Click "New Project"
5. Fill in:
   - **Name**: SmartLenderUp
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Singapore (closest to Kenya) or Frankfurt
   - **Pricing Plan**: Free (for testing, upgrade later)

6. Wait 2-3 minutes for project setup

### 1.2 Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhb...` (starts with eyJ)
   - **service_role key**: `eyJhb...` (different from anon)

3. Save these - you'll need them!

### 1.3 Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `/supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (bottom right)
6. Wait ~30 seconds for completion
7. You should see "Success. No rows returned"

**What this creates:**
- ✅ 18 database tables
- ✅ Row-level security policies
- ✅ Indexes for performance
- ✅ Triggers for automation
- ✅ Helper functions

### 1.4 Verify Tables Created

1. Go to **Table Editor** (left sidebar)
2. You should see tables:
   - users
   - organizations
   - clients
   - loans
   - payments
   - mpesa_transactions
   - savings_accounts
   - notifications
   - (and more...)

3. If you see these, you're good! ✅

---

## 🔐 Step 2: Environment Variables Setup (5 minutes)

### 2.1 Local Development

1. In your project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the Supabase credentials from Step 1.2:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhb...your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=eyJhb...your_service_key
   ```

3. Save the file

### 2.2 Vercel Deployment

1. Go to https://vercel.com
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_SUPABASE_URL` | Your Supabase URL | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | Your anon key | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Production, Preview |

5. Click "Save"
6. **Redeploy** your project for changes to take effect

---

## 💳 Step 3: M-Pesa Integration (30 minutes)

### 3.1 Create Safaricom Developer Account

1. Go to https://developer.safaricom.co.ke
2. Click "Sign Up"
3. Fill in your details
4. Verify email
5. Complete profile

### 3.2 Create Sandbox App

1. Go to **My Apps**
2. Click "Add a new App"
3. Fill in:
   - **App Name**: SmartLenderUp
   - **Description**: Microfinance platform
4. Click "Create App"

### 3.3 Get Sandbox Credentials

1. Click on your app
2. Copy these credentials:
   - **Consumer Key**
   - **Consumer Secret**
3. For Lipa Na M-Pesa Online:
   - **Shortcode**: 174379 (sandbox default)
   - **Passkey**: Get from "Test Credentials" section

### 3.4 Add M-Pesa Environment Variables

**Local (.env file):**
```env
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=http://localhost:5173/api/mpesa/callback
```

**Vercel:**

Add these in Vercel Environment Variables:
- `MPESA_ENV` = `sandbox`
- `MPESA_CONSUMER_KEY` = (your key)
- `MPESA_CONSUMER_SECRET` = (your secret)
- `MPESA_SHORTCODE` = `174379`
- `MPESA_PASSKEY` = (your passkey)
- `MPESA_CALLBACK_URL` = `https://your-app.vercel.app/api/mpesa/callback`

### 3.5 Test M-Pesa (Sandbox)

Use these test credentials:
- **Phone Number**: 254708374149
- **Amount**: 10 (any amount works)
- **PIN**: 1234

**Test the STK Push:**
1. In your app, initiate a payment
2. Check your test phone (you'll get an SMS)
3. Enter PIN: 1234
4. Transaction should complete

---

## 📧 Step 4: Email Notifications (10 minutes)

### Option 1: Resend (Recommended)

1. Go to https://resend.com
2. Sign up (free tier: 3,000 emails/month)
3. Click "API Keys"
4. Create API key
5. Copy the key

**Add to Environment Variables:**
```env
VITE_RESEND_API_KEY=re_your_api_key
VITE_FROM_EMAIL=noreply@smartlenderup.com
```

### Option 2: SendGrid (Alternative)

1. Go to https://sendgrid.com
2. Sign up (free tier: 100 emails/day)
3. Create API key
4. Copy the key

```env
SENDGRID_API_KEY=SG.your_api_key
```

---

## 📱 Step 5: SMS Notifications (Optional)

### Using Africa's Talking

1. Go to https://africastalking.com
2. Sign up
3. Create Sandbox app
4. Get credentials:
   - Username
   - API Key

**Add to Environment Variables:**
```env
AFRICAS_TALKING_USERNAME=your_username
AFRICAS_TALKING_API_KEY=your_api_key
AFRICAS_TALKING_SENDER_ID=SmartLender
```

---

## 🧪 Step 6: Test the Backend (10 minutes)

### 6.1 Test Authentication

```bash
# Start your dev server
npm run dev

# Try registering a new user through the UI
# Or test the API directly:

curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "full_name": "Test User",
    "phone": "+254712345678",
    "role": "client"
  }'
```

### 6.2 Test Database Connection

1. Register a new user
2. Check Supabase → Table Editor → users
3. You should see the new user ✅

### 6.3 Test M-Pesa (Sandbox)

```bash
curl -X POST http://localhost:5173/api/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "phone_number": "254708374149",
    "amount": 10,
    "account_reference": "TEST"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "STK push sent successfully",
  "merchant_request_id": "...",
  "checkout_request_id": "..."
}
```

---

## 📊 Step 7: Verify Everything Works

### Checklist

- [ ] Supabase tables created
- [ ] Can register new users
- [ ] Can login with credentials
- [ ] Users appear in Supabase database
- [ ] M-Pesa STK push works (sandbox)
- [ ] Environment variables set in Vercel
- [ ] API endpoints respond correctly

### Test User Registration Flow

1. Open your app
2. Click "Sign Up"
3. Fill registration form
4. Submit
5. Check Supabase → users table
6. User should appear ✅

### Test Loan Application Flow

1. Login as staff
2. Create a client
3. Apply for loan (as client)
4. Check Supabase → loans table
5. Loan should appear ✅

---

## 🚀 Step 8: Deploy with Backend

### Push to Vercel

```bash
# Commit all changes
git add .
git commit -m "Add backend infrastructure"
git push origin main

# Vercel auto-deploys
# Wait 2-3 minutes
```

### Verify Deployment

1. Go to Vercel dashboard
2. Check **Deployments** → Latest
3. Click "Visit"
4. Test registration
5. Test login
6. Check Supabase for data

**If everything works, you're live! 🎉**

---

## 🔧 Troubleshooting

### Database Connection Failed

**Problem**: Can't connect to Supabase

**Solutions**:
1. Check Supabase project is not paused
2. Verify URL and anon key in .env
3. Check network/firewall
4. Try regenerating anon key in Supabase

### M-Pesa STK Push Fails

**Problem**: STK push returns error

**Solutions**:
1. Verify you're using sandbox credentials
2. Check phone number format (254...)
3. Verify shortcode is 174379
4. Check passkey is correct
5. Ensure callback URL is accessible

### API Returns 401 Unauthorized

**Problem**: API calls fail with 401

**Solutions**:
1. Check token is being sent
2. Verify token is valid
3. Check RLS policies in Supabase
4. Try logging in again

### Environment Variables Not Working

**Problem**: App can't read .env values

**Solutions**:
1. Restart dev server
2. Check variable names (VITE_ prefix for frontend)
3. In Vercel, check variables are set
4. Redeploy after adding variables

---

## 📚 API Documentation

### Authentication Endpoints

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "phone": "+254712345678",
  "role": "client"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Loans Endpoints

**POST /api/loans/create**
```json
{
  "client_id": "uuid",
  "principal_amount": 50000,
  "duration_months": 12,
  "purpose": "Business expansion"
}
```

**GET /api/loans/:id**

**PATCH /api/loans/:id**
```json
{
  "action": "approve",
  "notes": "Approved by manager"
}
```

### M-Pesa Endpoints

**POST /api/mpesa/stk-push**
```json
{
  "phone_number": "254712345678",
  "amount": 1000,
  "loan_id": "uuid",
  "account_reference": "Loan Payment"
}
```

**POST /api/mpesa/callback** (Called by Safaricom)

---

## 💰 Cost Summary

### Free Tier (Testing)

| Service | Free Tier | Limit |
|---------|-----------|-------|
| **Supabase** | Free | 500MB DB, 2GB bandwidth |
| **Vercel** | Free | Unlimited deployments |
| **Resend** | Free | 3,000 emails/month |
| **M-Pesa** | Sandbox Free | Testing only |

**Total: $0/month** ✅

### Production (Paid Tiers)

| Service | Cost | Features |
|---------|------|----------|
| **Supabase Pro** | $25/mo | 8GB DB, 250GB bandwidth |
| **Vercel Pro** | $20/mo | Team features, analytics |
| **Resend** | $20/mo | 50,000 emails |
| **M-Pesa** | Transaction fees | ~1% per transaction |
| **Africa's Talking** | Pay as you go | ~$0.01 per SMS |

**Total: ~$65/mo + transaction fees**

---

## 🎓 Next Steps

1. ✅ Complete this backend setup
2. 📱 Test all features thoroughly
3. 🧪 Beta test with real users
4. 📊 Monitor database performance
5. 🔒 Enable additional security features
6. 📈 Scale up as user base grows
7. 💳 Move M-Pesa to production
8. 🌍 Deploy to custom domain

---

## 🆘 Need Help?

**Documentation:**
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- M-Pesa Docs: https://developer.safaricom.co.ke/Documentation

**Support:**
- Supabase: support@supabase.com
- Vercel: vercel.com/support
- M-Pesa: Technical support at developer portal

---

**Congratulations! Your backend is now fully operational! 🎉**

The platform now has:
- ✅ Complete database
- ✅ REST API
- ✅ Authentication
- ✅ M-Pesa payments
- ✅ Email notifications
- ✅ Full CRUD operations

**You're ready for production!** 🚀
