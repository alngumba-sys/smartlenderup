# SmartLenderUp - Go Live Production Deployment Guide

## 🚀 Quick Deployment (Fastest Way to Go Live)

### Option 1: Deploy to Vercel (Recommended - 5 minutes)

**Why Vercel?**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero configuration for React
- ✅ Automatic deployments from Git

**Steps:**

1. **Create GitHub Repository**
   ```bash
   # In your local project folder
   git init
   git add .
   git commit -m "Initial commit - SmartLenderUp platform"
   
   # Create repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/smartlenderup.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "Sign Up" (use GitHub account)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects React/Vite settings
   - Click "Deploy"
   - **Done!** Your site is live in ~2 minutes

3. **Your Live URL**
   - Vercel gives you: `https://smartlenderup.vercel.app`
   - Free custom domain support available

---

### Option 2: Deploy to Netlify (Alternative - 5 minutes)

**Steps:**

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to https://netlify.com
   - Click "Add new site" → "Import from Git"
   - Connect GitHub
   - Select your repository
   - Build settings (auto-detected):
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"
   - **Done!** Live in ~2 minutes

3. **Your Live URL**
   - Netlify gives you: `https://smartlenderup.netlify.app`

---

## 🗄️ Database Setup (For Real Data Persistence)

### Add Supabase Backend (10 minutes)

**Why Supabase?**
- ✅ Free tier (up to 500MB database)
- ✅ PostgreSQL database
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Row-level security
- ✅ Auto-generated REST API

**Steps:**

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "Start your project"
   - Create new organization
   - Create new project:
     - Name: SmartLenderUp
     - Database password: (save this!)
     - Region: Singapore (or closest to Kenya)
   - Wait 2 minutes for setup

2. **Get API Credentials**
   - Go to Project Settings → API
   - Copy:
     - `Project URL`
     - `anon public` key

3. **Add to Your Project**
   
   Create `.env` file in your project root:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Install Supabase Client**
   ```bash
   npm install @supabase/supabase-js
   ```

5. **Create Database Tables**
   
   Go to Supabase → SQL Editor → New Query, run:
   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     full_name TEXT,
     phone TEXT,
     role TEXT DEFAULT 'client',
     organization_id UUID,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Organizations table
   CREATE TABLE organizations (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     type TEXT,
     registration_number TEXT,
     email TEXT,
     phone TEXT,
     location TEXT,
     logo_url TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Loans table
   CREATE TABLE loans (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     client_id UUID REFERENCES users(id),
     loan_type TEXT,
     amount DECIMAL(15,2),
     interest_rate DECIMAL(5,2),
     duration_months INTEGER,
     status TEXT DEFAULT 'pending',
     applied_date TIMESTAMP DEFAULT NOW(),
     approved_date TIMESTAMP,
     disbursed_date TIMESTAMP
   );

   -- Payments table
   CREATE TABLE payments (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     loan_id UUID REFERENCES loans(id),
     amount DECIMAL(15,2),
     payment_method TEXT,
     mpesa_transaction_id TEXT,
     payment_date TIMESTAMP DEFAULT NOW(),
     status TEXT DEFAULT 'completed'
   );

   -- Savings accounts table
   CREATE TABLE savings_accounts (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     client_id UUID REFERENCES users(id),
     account_number TEXT UNIQUE,
     balance DECIMAL(15,2) DEFAULT 0,
     interest_rate DECIMAL(5,2),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

6. **Add Environment Variables to Vercel/Netlify**
   
   **For Vercel:**
   - Go to your project → Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL` = your_url
     - `VITE_SUPABASE_ANON_KEY` = your_key
   - Redeploy

   **For Netlify:**
   - Site settings → Build & deploy → Environment
   - Add same variables
   - Trigger new deploy

---

## 🌐 Custom Domain Setup

### Option A: Connect Your Own Domain

1. **Buy Domain** (if you don't have one)
   - Namecheap: ~$10/year for .com
   - Google Domains: ~$12/year
   - Recommended: `smartlenderup.com` or `smartlenderup.co.ke`

2. **Connect to Vercel**
   - Vercel → Your project → Settings → Domains
   - Add your domain: `smartlenderup.com`
   - Follow DNS instructions:
     - Add A record: `76.76.21.21`
     - Add CNAME: `cname.vercel-dns.com`
   - Wait 5-60 minutes for DNS propagation
   - Vercel auto-adds HTTPS certificate

3. **Connect to Netlify**
   - Netlify → Domain settings → Add custom domain
   - Follow DNS instructions
   - Auto HTTPS enabled

### Option B: Use Free Subdomain

- Vercel: `smartlenderup.vercel.app` (free)
- Netlify: `smartlenderup.netlify.app` (free)
- Both include free HTTPS

---

## 📱 M-Pesa Integration (For Kenya)

### Set Up Safaricom M-Pesa

1. **Get M-Pesa Developer Account**
   - Go to https://developer.safaricom.co.ke
   - Register account
   - Create app
   - Get credentials:
     - Consumer Key
     - Consumer Secret
     - Passkey
     - Shortcode

2. **Add to Environment Variables**
   ```env
   VITE_MPESA_CONSUMER_KEY=your_consumer_key
   VITE_MPESA_CONSUMER_SECRET=your_consumer_secret
   VITE_MPESA_PASSKEY=your_passkey
   VITE_MPESA_SHORTCODE=your_shortcode
   VITE_MPESA_CALLBACK_URL=https://smartlenderup.com/api/mpesa/callback
   ```

3. **Create Backend API** (Required for M-Pesa)
   
   M-Pesa requires server-side calls. Use Vercel Serverless Functions:
   
   Create `/api/mpesa-stk-push.ts`:
   ```typescript
   import type { VercelRequest, VercelResponse } from '@vercel/node';

   export default async function handler(
     req: VercelRequest,
     res: VercelResponse
   ) {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }

     const { phoneNumber, amount } = req.body;

     // M-Pesa STK Push logic here
     // (Implementation details in separate document)

     return res.status(200).json({ success: true });
   }
   ```

---

## 📧 Email Notifications Setup

### Option 1: Use Resend (Recommended)

1. **Sign up at https://resend.com**
   - Free tier: 3,000 emails/month

2. **Get API Key**
   - Dashboard → API Keys → Create

3. **Add to Environment Variables**
   ```env
   VITE_RESEND_API_KEY=your_api_key
   VITE_FROM_EMAIL=noreply@smartlenderup.com
   ```

4. **Verify Domain**
   - Add DNS records to your domain
   - Enables sending from `@smartlenderup.com`

### Option 2: Use SendGrid

- Free tier: 100 emails/day
- Similar setup process

---

## 🔐 Production Security Checklist

### Essential Security Updates

1. **Environment Variables**
   - ✅ Never commit `.env` to GitHub
   - ✅ Add `.env` to `.gitignore`
   - ✅ Use different keys for production
   - ✅ Store in Vercel/Netlify dashboard

2. **Authentication**
   - ⚠️ Replace demo login with Supabase Auth
   - ✅ Use JWT tokens
   - ✅ Implement password hashing
   - ✅ Add rate limiting

3. **API Security**
   - ✅ Enable CORS properly
   - ✅ Validate all inputs
   - ✅ Use HTTPS only
   - ✅ Implement API rate limiting

4. **Database Security**
   - ✅ Enable Row Level Security (RLS) in Supabase
   - ✅ Create proper user permissions
   - ✅ Encrypt sensitive data

---

## 📊 Analytics & Monitoring

### Add Google Analytics

1. **Create GA4 Property**
   - Go to https://analytics.google.com
   - Create account
   - Get Measurement ID: `G-XXXXXXXXXX`

2. **Add to Your App**
   
   Install:
   ```bash
   npm install react-ga4
   ```

   Add to `App.tsx`:
   ```typescript
   import ReactGA from 'react-ga4';
   
   ReactGA.initialize('G-XXXXXXXXXX');
   ```

### Add Error Tracking with Sentry

1. **Sign up at https://sentry.io**
   - Free tier available

2. **Install**
   ```bash
   npm install @sentry/react
   ```

3. **Initialize in App.tsx**
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "your_sentry_dsn",
     environment: "production"
   });
   ```

---

## ✅ Pre-Launch Checklist

### Before Going Live

- [ ] Test all forms with real data
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Set up custom domain
- [ ] Configure SSL certificate (auto with Vercel/Netlify)
- [ ] Add Google Analytics
- [ ] Set up error monitoring
- [ ] Configure email notifications
- [ ] Test M-Pesa integration (sandbox first)
- [ ] Add privacy policy content
- [ ] Add terms of service content
- [ ] Set up backup strategy
- [ ] Create admin documentation
- [ ] Train staff on platform usage
- [ ] Set up customer support email

### Performance Optimization

- [ ] Enable Vercel/Netlify CDN
- [ ] Compress images
- [ ] Enable caching
- [ ] Minify JavaScript (auto in build)
- [ ] Use lazy loading for images

---

## 💰 Cost Breakdown

### Free Tier (Good for Start)

| Service | Free Tier | Cost if Exceeded |
|---------|-----------|------------------|
| **Vercel** | Unlimited personal projects | $20/month Pro |
| **Supabase** | 500MB database, 2GB bandwidth | $25/month Pro |
| **Resend** | 3,000 emails/month | $20/month for 50k |
| **Domain** | N/A | $10-15/year |
| **M-Pesa** | Transaction fees only | ~1% per transaction |

**Total to Start**: $0-15/year (just domain)

### Growth Tier (1000+ users)

- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Resend: $20/month
- **Total**: ~$65/month + domain

---

## 🚀 Deployment Commands Summary

```bash
# 1. Build for production
npm run build

# 2. Test production build locally
npm run preview

# 3. Push to GitHub
git add .
git commit -m "Ready for production"
git push origin main

# 4. Vercel auto-deploys from GitHub push
# OR manually deploy:
npx vercel --prod
```

---

## 📞 Next Steps After Deployment

1. **Test Everything**
   - Sign up flow
   - Login flow
   - Loan application
   - M-Pesa payments

2. **SEO Setup**
   - Add meta tags
   - Create sitemap
   - Submit to Google Search Console

3. **Marketing**
   - Create social media accounts
   - Design marketing materials
   - Plan launch campaign

4. **Compliance**
   - Register with Kenya Data Protection office
   - Ensure GDPR compliance
   - Get necessary financial licenses

5. **Support Setup**
   - Set up support email
   - Create help documentation
   - Train customer service team

---

## 🆘 Quick Help

**Deployment Issues?**
- Check build logs in Vercel/Netlify dashboard
- Ensure all environment variables are set
- Clear build cache and redeploy

**Database Not Connecting?**
- Verify Supabase URL and key
- Check Supabase project is not paused
- Verify environment variables are loaded

**Domain Not Working?**
- Wait 24-48 hours for DNS propagation
- Check DNS records with https://dnschecker.org
- Verify domain registrar settings

---

## 📝 Recommended Timeline

- **Day 1**: Deploy to Vercel (5 min)
- **Day 1**: Set up Supabase (30 min)
- **Day 2**: Configure custom domain (1 hour)
- **Day 3**: Set up M-Pesa sandbox (2 hours)
- **Week 1**: Testing and refinement
- **Week 2**: Beta testing with select users
- **Week 3**: Official launch

**You can be live with basic features in 1 hour!**

---

**Ready to Deploy?** Start with Vercel deployment - it's the fastest way to get live!
