# ⚡ Netlify Quick Start - 15 Minutes to Production

Deploy your SmartLenderUp platform to Netlify in 15 minutes!

---

## ✅ Prerequisites (2 minutes)

```bash
# Verify you have:
node --version    # Should be 18+
npm --version     # Should be 9+
git --version     # Should be installed

# Verify Supabase is set up:
# - Project created
# - Database tables created (18 tables)
# - API credentials ready
```

---

## 🚀 Step 1: Push to GitHub (3 minutes)

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "SmartLenderUp complete"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/smartlenderup.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy to Netlify (5 minutes)

### 2.1: Sign Up & Import

1. Go to **https://netlify.com**
2. Click "Sign up with GitHub"
3. Authorize Netlify
4. Click "Add new site" → "Import an existing project"
5. Choose "GitHub"
6. Select `smartlenderup-platform`

### 2.2: Configure Build

**Leave defaults:**
- Build command: `npm run build`
- Publish directory: `dist`

### 2.3: Add Environment Variables

Click "Add environment variables" and add:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

Copy these from your Supabase dashboard!

### 2.4: Deploy

Click "Deploy site" → Wait 3 minutes → Done! ✅

Your URL: `https://your-site.netlify.app`

---

## ✅ Step 3: Test (5 minutes)

### Test 1: Open Site

```bash
# Open your Netlify URL
https://your-site.netlify.app
```

**Should see:** Landing page loads ✅

### Test 2: Register User

1. Click "Sign Up"
2. Register a test user
3. Check Supabase → users table
4. User appears ✅

### Test 3: API Endpoint

```bash
curl -X POST https://your-site.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","full_name":"Test","role":"client"}'
```

**Should return:** `{"success":true,...}` ✅

---

## 🎉 Done!

**Your platform is LIVE in 15 minutes!** 🚀

**URLs:**
- Live site: `https://your-site.netlify.app`
- Netlify dashboard: `https://app.netlify.com`
- Supabase dashboard: `https://supabase.com/dashboard`

**Auto-deploy enabled:**
- Push to GitHub → Netlify auto-deploys
- Every git push updates your site in 2 minutes

---

## 🔄 Make Updates

```bash
# Edit files
# ...

# Deploy update
git add .
git commit -m "Update feature"
git push origin main

# Netlify auto-deploys in 2 minutes!
```

---

## 📞 Need Help?

**Full guide:** See `/NETLIFY_DEPLOYMENT.md`

**Troubleshooting:**
- Build fails? Run `npm run build` locally
- 404 errors? Check netlify.toml redirects
- Database not connected? Verify environment variables

**Resources:**
- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs

---

**Your SmartLenderUp platform is live and ready for customers!** 🎊
