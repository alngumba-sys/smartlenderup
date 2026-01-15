# 🔧 Supabase Schema Migration Guide

## Issue
The `organizations` table is missing the `password_hash`, `username`, and `status` columns needed for authentication.

---

## ✅ Solution: Add Missing Columns

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: **SmartLenderUp**

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run This SQL**:
```sql
-- Add missing columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add comment for documentation
COMMENT ON COLUMN organizations.password_hash IS 'User password (plain text for demo - use proper hashing in production)';
COMMENT ON COLUMN organizations.username IS 'Auto-generated username for the organization';
COMMENT ON COLUMN organizations.status IS 'Organization status: active, suspended, inactive';
```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify**:
   - Go to **Table Editor**
   - Select **organizations** table
   - You should see the new columns: `password_hash`, `username`, `status`

---

### Option 2: Using Table Editor UI

1. **Go to Supabase Dashboard** → **Table Editor**
2. **Select `organizations` table**
3. **Click "+ New Column"** button

**Add these 3 columns:**

#### Column 1: password_hash
- **Name**: `password_hash`
- **Type**: `text`
- **Default value**: *(leave empty)*
- **Is nullable**: ✅ Yes (check)
- Click **Save**

#### Column 2: username
- **Name**: `username`
- **Type**: `text`
- **Default value**: *(leave empty)*
- **Is nullable**: ✅ Yes (check)
- Click **Save**

#### Column 3: status
- **Name**: `status`
- **Type**: `text`
- **Default value**: `active`
- **Is nullable**: ✅ Yes (check)
- Click **Save**

---

## 🎯 After Adding Columns

1. **Refresh your SmartLenderUp page**
2. **Register your organization again**
3. **You should see**: ✅ `Organization Created & Synced!`
4. **Login with your credentials**

---

## 🔍 Verify the Migration

Run this in SQL Editor to check:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'organizations'
AND column_name IN ('password_hash', 'username', 'status');
```

You should see all 3 columns listed.

---

## 📝 Notes

- **Security**: In production, always hash passwords using bcrypt or similar
- **Current Setup**: Using plain text for demo purposes only
- **Username**: Auto-generated 4-character code (e.g., "AB12")
- **Status**: Defaults to 'active' for new organizations

---

## 🆘 Troubleshooting

**If you still get errors:**
1. Check if columns exist: Table Editor → organizations
2. Check for typos in column names
3. Make sure you're in the correct Supabase project
4. Try hard refresh (Ctrl+Shift+R) on SmartLenderUp

**Need help?**
- Copy any error messages from the console
- Check which columns are missing
- Verify Supabase connection is working
