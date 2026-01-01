# 🚀 SmartLenderUp Deployment Checklist

## ✅ Pre-Deployment Steps

### 1. Supabase Configuration
- [x] Updated to LIVE Supabase account (yrsnylrcgejnrxphjvtf)
- [x] Service role key added to `/lib/supabase.ts`
- [ ] Run `SUPABASE_MIGRATION.sql` in Supabase SQL Editor
- [ ] Verify tables created: `project_states`, `stripe_customers`, `stripe_subscriptions`
- [ ] Test data sync by saving changes in the app

### 2. GitHub Repository
- [ ] Download code from Figma Make
- [ ] Clone repository: `git clone https://github.com/alngumba-sys/smartlenderup.git`
- [ ] Replace all files with Figma Make code
- [ ] Commit: `git commit -m "Migration from Figma Make - Live deployment"`
- [ ] Push: `git push origin main --force`
- [ ] Verify on GitHub: https://github.com/alngumba-sys/smartlenderup

### 3. Environment Variables
For production deployment (Vercel/Netlify), set these:
```
VITE_SUPABASE_URL=https://yrsnylrcgejnrxphjvtf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc255bHJjZ2VqbnJ4cGhqdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTAxNDIsImV4cCI6MjA4MjU4NjE0Mn0.RCcfK0ObcSCnwqW_bD7c4M7DSN_SCTPT6QK7LXi4R9o
```

**⚠️ DO NOT** set `VITE_SUPABASE_SERVICE_KEY` in production (security risk!)

### 4. Stripe Configuration (if using payments)
- [ ] Add Stripe publishable key
- [ ] Configure webhook endpoints
- [ ] Test payment flow

---

## 🗄️ Supabase Migration Steps

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/yrsnylrcgejnrxphjvtf
2. Click **SQL Editor** in left sidebar
3. Click **New Query**

### Step 2: Run Migration Script
1. Open the file `SUPABASE_MIGRATION.sql` from your project
2. Copy ALL the SQL code
3. Paste into Supabase SQL Editor
4. Click **RUN** button (bottom right)

### Step 3: Verify Tables Created
Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('project_states', 'stripe_customers', 'stripe_subscriptions');
```

You should see 3 rows returned.

### Step 4: Test Data Sync
1. Open your application
2. Create a test client (e.g., "Test Client")
3. Check browser console for: `✅ Project state saved successfully to Supabase`
4. Go to Supabase Dashboard → Table Editor → `project_states`
5. Verify your data is saved

---

## 🐙 GitHub Push Steps

### Quick Push (Overwrite Everything)
```bash
# 1. Download code from Figma Make (ZIP file)
# 2. Extract to a folder

# 3. Clone your repo
git clone https://github.com/alngumba-sys/smartlenderup.git
cd smartlenderup

# 4. Delete all files except .git
# Windows:
del /s /q *.*
# Mac/Linux:
find . -not -path './.git/*' -not -name '.git' -delete

# 5. Copy Figma Make files
# Windows:
xcopy "C:\path\to\extracted\files\*" . /E /I /Y
# Mac/Linux:
cp -r ~/Downloads/figma-make-export/* .

# 6. Add, commit, and push
git add .
git commit -m "Complete migration from Figma Make - Live deployment ready"
git push origin main --force
```

### Verify on GitHub
1. Visit: https://github.com/alngumba-sys/smartlenderup
2. Check commit timestamp (should be recent)
3. Click into files to verify content
4. Check README.md displays correctly

---

## 🌐 Vercel Deployment (Optional)

### Step 1: Connect to Vercel
1. Go to: https://vercel.com
2. Sign in with GitHub
3. Click **New Project**
4. Import: `alngumba-sys/smartlenderup`

### Step 2: Configure Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables
In Vercel Project Settings → Environment Variables:
```
VITE_SUPABASE_URL = https://yrsnylrcgejnrxphjvtf.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc255bHJjZ2VqbnJ4cGhqdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTAxNDIsImV4cCI6MjA4MjU4NjE0Mn0.RCcfK0ObcSCnwqW_bD7c4M7DSN_SCTPT6QK7LXi4R9o
```

### Step 4: Deploy
1. Click **Deploy**
2. Wait 2-3 minutes for build
3. Click your production URL
4. Test login and data sync

---

## 🧪 Testing Checklist

After deployment, test these features:

### Authentication
- [ ] Login with admin credentials
- [ ] Login with manager credentials
- [ ] Login with officer credentials
- [ ] Super Admin access (click logo 5 times)

### Core Features
- [ ] Create a new client
- [ ] Create a new loan
- [ ] Make a payment
- [ ] View reports
- [ ] Test AI Insights
- [ ] Create journal entry

### Data Persistence
- [ ] Logout and login again
- [ ] Verify data is still there
- [ ] Check Supabase table has data
- [ ] Test on different browser/device

### Stripe (if configured)
- [ ] Free trial countdown displays
- [ ] Payment checkout opens
- [ ] Payment processes successfully
- [ ] Trial days extend after payment

---

## 🆘 Troubleshooting

### "RLS Error" in Console
**Fix:** You're using anon key in production (good!), but RLS policies might be preventing access.
- Check RLS policies in Supabase
- Make sure policies allow `auth.uid()` access
- For development, use service role key in `/lib/supabase.ts`

### "Failed to sync to Supabase"
**Fix:**
1. Check browser console for specific error
2. Verify Supabase credentials are correct
3. Check if tables exist in Supabase
4. Verify RLS policies

### GitHub push fails
**Fix:**
```bash
# Generate personal access token
# GitHub → Settings → Developer Settings → Personal Access Tokens

# Use token as password
git remote set-url origin https://YOUR_TOKEN@github.com/alngumba-sys/smartlenderup.git
git push origin main --force
```

### Vercel build fails
**Fix:**
1. Check build logs for specific error
2. Verify all dependencies in package.json
3. Make sure environment variables are set
4. Try local build: `npm run build`

---

## 📋 Summary

**Completed:**
- ✅ Supabase credentials updated to LIVE account
- ✅ Migration SQL script created
- ✅ .gitignore file added
- ✅ README.md updated
- ✅ Deployment guides created

**Your Action Items:**
1. Run `SUPABASE_MIGRATION.sql` in Supabase SQL Editor
2. Download code from Figma Make
3. Push to GitHub following the guide
4. (Optional) Deploy to Vercel
5. Test all features

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- GitHub Docs: https://docs.github.com

**Ready to go live! 🚀**
