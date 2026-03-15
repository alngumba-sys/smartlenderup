# ❌ FIX: Database Schema Errors (PGRST204)

## Common Errors:
- "Could not find the 'name' column of 'shareholders'"
- "Could not find the 'description' column of 'bank_accounts'"
- Any "PGRST204" or "schema cache" errors

## 🎯 **SIMPLE 3-STEP FIX**

### **Step 1: Open Supabase**
1. Go to https://supabase.com
2. Sign in
3. Select your project
4. Click **"SQL Editor"** (left sidebar)
5. Click **"New Query"**

### **Step 2: Copy & Run SQL**

**For Shareholders Error:**
1. Open this file: `/supabase/CREATE_SHAREHOLDERS_TABLE.sql`
2. **Select All** (`Ctrl+A` or `Cmd+A`)
3. **Copy** (`Ctrl+C` or `Cmd+C`)
4. Go back to Supabase SQL Editor
5. **Paste** into the query box (`Ctrl+V` or `Cmd+V`)
6. Click **"Run"** button (or press `Ctrl+Enter`)

**For Bank Accounts Error:**
1. Open this file: `/supabase/FIX_BANK_ACCOUNTS_TABLE.sql`
2. **Select All** (`Ctrl+A` or `Cmd+A`)
3. **Copy** (`Ctrl+C` or `Cmd+C`)
4. Go back to Supabase SQL Editor
5. **Paste** into the query box (`Ctrl+V` or `Cmd+V`)
6. Click **"Run"** button (or press `Ctrl+Enter`)

**For ALL Errors (Recommended):**
1. Open this file: `/supabase/COMPLETE_DATABASE_SETUP.sql`
2. **Select All** (`Ctrl+A` or `Cmd+A`)
3. **Copy** (`Ctrl+C` or `Cmd+C`)
4. Go back to Supabase SQL Editor
5. **Paste** into the query box (`Ctrl+V` or `Cmd+V`)
6. Click **"Run"** button (or press `Ctrl+Enter`)

✅ You should see: **"Success. No rows returned"**

### **Step 3: Refresh Your App**
1. Go back to your application
2. Press **F5** to refresh
3. The error is now **GONE** ✅

---

## ✅ **THAT'S IT!**

The error will disappear immediately after you run the SQL.

---

## 🔧 **What This Does:**

- Creates the `shareholders` table in your database
- Adds all required columns (`name`, `id_number`, `total_investment`, etc.)
- Sets up security policies so the app can read/write data
- **Fixes the error permanently**

---

## ❓ **Common Questions:**

### Q: Do I need to create the organization table too?
**A:** If you already have an organization and can login, then **NO**. This fix is ONLY for the shareholders error.

### Q: Will I lose any data?
**A:** No. This creates a new table. It doesn't touch any existing data.

### Q: What if I see "relation already exists"?
**A:** Great! The table already exists. Just refresh your app (F5).

---

## 🆘 **Still Having Issues?**

Check if you have the full database setup:
- If you're getting OTHER errors (not just shareholders), run `/supabase/COMPLETE_DATABASE_SETUP.sql` instead
- That creates ALL 32 tables needed for the full application

---

**This fix takes 2 minutes.** 🚀
