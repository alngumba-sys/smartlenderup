# 🚀 Quick Start - Database Setup

## ⚠️ ERROR: "Could not find the 'name' column of 'shareholders'"

You're seeing this error because **the database tables don't exist yet** in your Supabase project.

---

## ✅ **5-MINUTE FIX**

Follow these steps **exactly**:

### **Step 1: Open Supabase SQL Editor**
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project
4. Click **"SQL Editor"** in the left sidebar
5. Click **"New Query"**

### **Step 2: Copy the Database Setup SQL**
1. In your code editor, open this file: `/supabase/COMPLETE_DATABASE_SETUP.sql`
2. Press `Ctrl+A` (Windows) or `Cmd+A` (Mac) to **select all**
3. Press `Ctrl+C` (Windows) or `Cmd+C` (Mac) to **copy**

### **Step 3: Run the SQL**
1. Go back to Supabase SQL Editor
2. Click in the empty query box
3. Press `Ctrl+V` (Windows) or `Cmd+V` (Mac) to **paste**
4. Click the **"Run"** button (or press `Ctrl+Enter`)
5. Wait 5-10 seconds for it to complete

✅ You should see: **"Success. No rows returned"**

### **Step 4: Create Your Organization**

After the tables are created, you need to add your organization. Run this SQL:

```sql
INSERT INTO public.organizations (
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
  'ABCD Limited',
  'abcd@test.com',
  '09876543',
  'Test@1234',
  'KAR2',
  'Kenya',
  'KES',
  'active',
  'trial'
);
```

Click **"Run"** again.

### **Step 5: Refresh Your App**
1. Go back to your application
2. Press `F5` or click the refresh button
3. Login with:
   - **Email:** `abcd@test.com`
   - **Password:** `Test@1234`

---

## 🎉 **DONE!**

The error should be **completely gone** now. Your app will work perfectly with all features enabled.

---

## 📋 **What Was Created?**

The SQL script created **32 database tables** including:

- ✅ organizations
- ✅ clients
- ✅ loans
- ✅ repayments
- ✅ **shareholders** (this fixes the error!)
- ✅ bank_accounts
- ✅ funding_transactions
- ✅ And 25 more tables...

---

## ❓ **Still Getting Errors?**

### Error: "relation already exists"
**Solution:** The tables are already created. Skip to Step 4 (Create Your Organization).

### Error: "permission denied"
**Solution:** Make sure you're logged in as the project owner in Supabase.

### Error: "duplicate key value"
**Solution:** Your organization already exists. Skip Step 4 and just login.

---

## 🆘 **Need Help?**

Check the console output in your browser:
1. Press `F12` to open Developer Tools
2. Click the **"Console"** tab
3. Look for messages starting with `⚠️` or `❌`

The console will tell you exactly what to do.

---

**That's it! Your database is now fully set up.** 🎊
