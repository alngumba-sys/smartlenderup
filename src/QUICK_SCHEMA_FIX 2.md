# ⚡ Quick Schema Fix Guide

## 🚨 "Column Not Found" Error? Fix it in 3 Steps!

---

## Step 1: Open Super Admin Panel

1. Go to login page
2. Click **SmartLenderUp logo 5 times**
3. Enter super admin credentials
4. Navigate to **Settings** tab

---

## Step 2: Run Schema Check

1. Scroll to **"Database Schema Migration"** panel
2. Click **"Check Database Schema"** button
3. Wait 5-10 seconds for scan
4. Click **"Copy SQL"** button

---

## Step 3: Apply in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **"New query"**
5. Paste the copied SQL
6. Click **RUN** ▶️
7. Wait for success message
8. Refresh SmartLenderUp page

---

## ✅ Done!

The missing columns are now added. Your application should work perfectly!

---

## 🔄 Alternative: Manual SQL

If the UI is not accessible, paste this in Supabase SQL Editor:

```sql
-- Check which tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- For each table with missing columns, run:
ALTER TABLE shareholders 
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS share_capital NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ownership_percentage NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bank_account JSONB;

ALTER TABLE shareholder_transactions
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS receipt_number TEXT,
  ADD COLUMN IF NOT EXISTS processed_by TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_id TEXT;

-- Add more as needed based on error messages
```

---

## 📞 Still Having Issues?

1. Check console logs (F12 → Console tab)
2. Look for "Could not find column" errors
3. Note which table and column
4. Run schema check again
5. Contact support with error details

---

**Need help?** support@smartlenderup.com
