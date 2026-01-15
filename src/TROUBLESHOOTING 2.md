# 🔧 Troubleshooting Database Errors

## ❌ Error: "column 'plan_name' does not exist"

### **What Happened:**
The original SQL script assumed your `pricing_config` table had a column called `plan_name`, but your actual table has different column names.

### **Why This Happened:**
Your `pricing_config` table was created with a different schema than expected. This is common when:
- The table was created manually
- A different migration was run previously
- The table structure was customized

---

## ✅ Solution: Use the FIXED Script

### **Step 1: Run Diagnostic (Optional)**
First, see what's actually in your database:

1. Open Supabase SQL Editor
2. Copy code from: **`/supabase-diagnostic.sql`**
3. Run it
4. Look at the output - it will show you:
   - All tables in your database
   - Column names in `pricing_config`
   - Current data in `pricing_config`
   - Whether `contact_messages` exists

### **Step 2: Run the Fixed Script**
1. Open Supabase SQL Editor
2. Copy code from: **`/supabase-setup-fixed.sql`**
3. Run it
4. Should complete successfully! ✅

---

## 🔍 What the Fixed Script Does Differently:

### **Original Script (had issues):**
```sql
-- Assumed specific column names
INSERT INTO pricing_config (plan_name, monthly_price, ...) 
VALUES ('Growth', 199, ...);
```

### **Fixed Script (works with any schema):**
```sql
-- Just adds the missing column, doesn't assume structure
ALTER TABLE pricing_config 
ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 14;
```

---

## 📋 Differences Between Scripts:

| Feature | Original Script | Fixed Script |
|---------|----------------|--------------|
| Creates `contact_messages` | ✅ Yes | ✅ Yes |
| Adds `trial_days` column | ✅ Yes | ✅ Yes |
| Assumes table structure | ❌ Yes (causes errors) | ✅ No (safe) |
| Inserts sample pricing data | ✅ Yes | ❌ No (safer) |
| Works with existing tables | ⚠️ Maybe | ✅ Always |

---

## 🎯 What Each File Does:

### **`/supabase-diagnostic.sql`** 🔍
- **Purpose:** Check what's in your database
- **Safe:** Yes, read-only queries
- **When to use:** Before running setup, or if errors occur
- **Output:** Shows all tables, columns, and data

### **`/supabase-setup-fixed.sql`** ⭐
- **Purpose:** Add missing tables and columns
- **Safe:** Yes, uses IF NOT EXISTS
- **When to use:** After getting "plan_name" error
- **What it does:**
  - Creates `contact_messages` table (if missing)
  - Adds `trial_days` column to `pricing_config` (if missing)
  - Sets up security policies
  - Shows verification messages

### **`/supabase-setup.sql`** 
- **Purpose:** Complete setup with sample data
- **Safe:** No, assumes table structure
- **When to use:** Only if you have a fresh database
- **Issues:** Assumes specific column names

---

## 🚨 Common Errors & Fixes:

### Error: "relation 'pricing_config' does not exist"
**Problem:** Your database doesn't have a `pricing_config` table at all.

**Fix:** You need to create it first. Check your codebase for the original table creation script, or contact your team to see how this table was set up.

### Error: "column 'trial_days' already exists"
**Problem:** You already ran the script successfully!

**Fix:** Nothing to fix - refresh your app and it should work.

### Error: "permission denied for table pricing_config"
**Problem:** Your Supabase user doesn't have permission to modify tables.

**Fix:** Make sure you're logged in as the project owner in Supabase.

### Error: "duplicate key value violates unique constraint"
**Problem:** Trying to insert data that already exists.

**Fix:** Use the fixed script instead - it doesn't insert data, just adds columns.

---

## ✅ Success Checklist:

After running the fixed script, you should see:

```
✅ contact_messages table exists
✅ pricing_config.trial_days column exists
```

Plus these verification outputs:
- List of columns in `pricing_config`
- Current data in `pricing_config` with `trial_days` column
- No error messages

---

## 🎊 After Success:

1. **Refresh your app** (Ctrl+Shift+R)
2. **Test Contact Form:**
   - Go to landing page footer
   - Click "Contact Us"
   - Fill form and submit
   - Should see success message
3. **Check Super Admin:**
   - Login as Super Admin
   - Go to "Contact Messages" tab
   - Should see your test message
4. **Test Trial Management:**
   - Go to "Subscriptions" tab
   - Scroll to "Pricing Remote Control"
   - Change trial days
   - Click "Save Changes"
   - Should save successfully

---

## 📞 Still Having Issues?

### Check Browser Console:
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for messages starting with:
   - `✅` = Success
   - `❌` = Error
   - `🔍` = Diagnostic info

### Check Supabase Logs:
1. Go to Supabase Dashboard
2. Click "Logs" in left sidebar
3. Look for recent errors
4. Check the exact error message

### Verify Table Structure:
Run this query in Supabase SQL Editor:
```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'pricing_config';
```

Should show `trial_days` with type `integer`.

---

## 🎯 Quick Reference:

**Got "plan_name" error?**  
→ Use `/supabase-setup-fixed.sql` ⭐

**Want to see your database?**  
→ Run `/supabase-diagnostic.sql` 🔍

**Fresh database setup?**  
→ Use `/supabase-setup.sql` (but might have issues)

**Need detailed help?**  
→ Read `/DATABASE-SETUP-GUIDE.md` 📖

---

**The fixed script should work! Just copy and run it in Supabase SQL Editor.** 🚀
