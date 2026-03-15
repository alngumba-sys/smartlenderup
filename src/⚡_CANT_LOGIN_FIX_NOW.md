# ⚡ Can't Login? Fix Now! (3 Options)

## 🚨 Your Problem
```
Email: victormuthama@gmail.com
Password: ••••••••
Error: "Login failed. Please check your connection and try again."
```

---

## ✅ Solution 1: Use Demo Login (Fastest - 30 seconds)

### DEMO ADMIN LOGIN
```
Email/Username: 12345
Password: Test@1234
```

### DEMO EMPLOYEE LOGIN
```
Email/Username: employee@bvfunguo.co.ke
Password: Employee@123
```

### DEMO STAFF LOGIN (Granular Permissions)
```
Email/Username: albert@bvfunguo.com
Password: Password123!
```

**Just enter these credentials and click Sign In!** ✅

---

## ✅ Solution 2: Create Your Organization (5 minutes)

Since you want to use `victormuthama@gmail.com`, you need to create an organization in the database first.

### Step 1: Go to Supabase SQL Editor
```
1. Open: https://supabase.com/dashboard
2. Select your project
3. Click: SQL Editor
4. Click: "New Query"
```

### Step 2: Run This SQL
```sql
-- Create your organization
INSERT INTO organizations (
  id,
  organization_name,
  email,
  phone,
  password_hash,
  username,
  country,
  currency,
  status,
  subscription_status,
  created_at
) VALUES (
  gen_random_uuid(),
  'Victor Muthama Organization',
  'victormuthama@gmail.com',
  '+254700000000',
  'yourpassword',  -- ⚠️ CHANGE THIS to your actual password
  'victormuthama',
  'Kenya',
  'KES',
  'active',
  'trial',
  NOW()
);
```

### Step 3: Verify It Worked
```sql
SELECT 
  organization_name,
  email,
  username,
  status
FROM organizations 
WHERE email = 'victormuthama@gmail.com';
```

**You should see your organization!**

### Step 4: Login
```
Email: victormuthama@gmail.com
Password: yourpassword  (whatever you set in the SQL)
```

---

## ✅ Solution 3: Fix Database First (If tables don't exist)

If you get errors running Solution 2, your database tables don't exist yet.

### Step 1: Create Tables
```
File: /supabase/COMPLETE_DATABASE_SETUP.sql
Action: Copy → Supabase SQL Editor → Run
```

### Step 2: Disable RLS
```
File: /supabase/DISABLE_RLS_FOR_TESTING.sql
Action: Copy → Supabase SQL Editor → Run
```

### Step 3: Create Your Organization (Solution 2 above)

### Step 4: Login with your credentials

---

## 🔍 Why Login Failed?

**The app checks Supabase database for organizations.**

Your error happened because:
- ❌ No organization exists with email `victormuthama@gmail.com`
- ❌ OR the `organizations` table doesn't exist yet
- ❌ OR RLS is blocking access

**The fix:** Either use demo credentials OR create your organization in database first.

---

## 📋 Quick Decision Tree

```
Can you login with demo credentials (12345 / Test@1234)?
│
├─ YES → Use that for now ✅
│         Or create your org (Solution 2)
│
└─ NO → Database tables don't exist
        Run Solution 3 (setup database first)
```

---

## 🎯 Recommended Approach

### For Testing (Right Now)
```
Use: 12345 / Test@1234
Time: 10 seconds
```

### For Your Account (Later)
```
1. Setup database (Solution 3)
2. Create your organization (Solution 2)
3. Login with victormuthama@gmail.com
Time: 10 minutes total
```

---

## 🆘 Troubleshooting

### "Relation organizations does not exist"
**Problem:** Database tables not created  
**Fix:** Run `/supabase/COMPLETE_DATABASE_SETUP.sql`

### "Login failed" with demo credentials too
**Problem:** Database connection issue  
**Fix:** Check Supabase URL/keys in your config

### SQL insert fails
**Problem:** Missing columns or RLS blocking  
**Fix:** Run `/supabase/DISABLE_RLS_FOR_TESTING.sql`

---

## 💡 Complete SQL to Create Your Account

Copy this entire block (customize the password):

```sql
-- Ensure organizations table exists
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE,
  country TEXT DEFAULT 'Kenya',
  currency TEXT DEFAULT 'KES',
  status TEXT DEFAULT 'active',
  subscription_status TEXT DEFAULT 'trial',
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '14 days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS temporarily
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Create your organization
INSERT INTO organizations (
  organization_name,
  email,
  phone,
  password_hash,
  username,
  country,
  currency,
  status,
  subscription_status
) VALUES (
  'Victor Muthama Organization',
  'victormuthama@gmail.com',
  '+254700000000',
  'Victor@123',  -- ⚠️ CHANGE THIS PASSWORD!
  'victormuthama',
  'Kenya',
  'KES',
  'active',
  'trial'
) ON CONFLICT (email) DO NOTHING;

-- Verify
SELECT 
  organization_name,
  email,
  username,
  status,
  created_at
FROM organizations 
WHERE email = 'victormuthama@gmail.com';
```

**After running this, login with:**
- Email: `victormuthama@gmail.com`
- Password: `Victor@123` (or whatever you changed it to)

---

## ✅ Success Checklist

- [ ] Can login with demo credentials (12345 / Test@1234)
- [ ] Database tables exist
- [ ] Your organization exists in database
- [ ] Can login with your email/password
- [ ] Dashboard loads successfully

---

## 🚀 Quick Start (30 seconds)

**DON'T OVERTHINK IT!**

Just login with:
```
Username: 12345
Password: Test@1234
```

**Everything works with demo account!**

You can create your own organization later.

---

**Choose your path and get started! 💪**
