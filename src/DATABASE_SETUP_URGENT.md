# 🚨 URGENT: Database Setup Required

## 🔴 Error You're Seeing

```
Error: Failed to run sql query: ERROR: 42703: column "user_id" does not exist
```

## ✅ Solution (Takes 2 Minutes)

Your Supabase database is empty. You need to run ONE SQL file to set everything up.

---

## 📝 Step-by-Step Instructions

### 1️⃣ Open Supabase
- Go to: https://supabase.com/dashboard
- Select your project
- Click **"SQL Editor"** (left sidebar)
- Click **"New Query"**

### 2️⃣ Open the Setup File
In your code editor, open:
```
/supabase/COMPLETE_DATABASE_SETUP.sql
```

### 3️⃣ Copy ALL the SQL
- Press **Ctrl+A** (Windows) or **Cmd+A** (Mac) to select all
- Press **Ctrl+C** (Windows) or **Cmd+C** (Mac) to copy

### 4️⃣ Paste & Run
- Paste into Supabase SQL Editor
- Click the green **"RUN"** button (bottom right)
- Wait 5-10 seconds for "Success" message

### 5️⃣ Refresh Your Browser
- Press **F5** to refresh your application
- ✅ Done! Error will be gone.

---

## 🎯 What This Does

Creates **34 database tables** with **300+ columns** including:

✅ Organizations & Staff  
✅ Clients & Groups  
✅ Loan Products  
✅ Loans & Repayments  
✅ Bank Accounts  
✅ Shareholders  
✅ Accounting & Journal Entries  
✅ Expenses & Payroll  
✅ KYC & Compliance  
✅ Tasks, Tickets & Notifications  
✅ Credit Scoring  
✅ Approvals Workflow  
✅ Savings Accounts  
✅ And 21 more tables...

---

## ⚠️ Important

- ✅ **Safe to run multiple times** - Uses `CREATE TABLE IF NOT EXISTS`
- ✅ **Won't delete data** - Only creates missing tables/columns
- ✅ **One-time setup** - Only needed once per Supabase project
- ✅ **Takes 5-10 seconds** - Very fast!

---

## 🆘 Need Help?

### Still seeing errors after running?
1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Clear localStorage**: 
   - Open browser console (F12)
   - Type: `localStorage.clear()` and press Enter
   - Type: `location.reload()` and press Enter
3. **Verify tables created**:
   - Go to Supabase Dashboard
   - Click "Table Editor"
   - You should see 34 tables

### Can't find the SQL file?
The file is located at: `/supabase/COMPLETE_DATABASE_SETUP.sql`

Look in your project root folder, then the `supabase` subfolder.

### Permission denied in Supabase?
Make sure you're logged into the correct Supabase account and have selected the right project.

---

## 📚 More Documentation

- **Quick Start**: `/START_HERE_DATABASE_FIX.md`
- **Detailed Guide**: `/DATABASE_SETUP_GUIDE.md`
- **Setup SQL File**: `/supabase/COMPLETE_DATABASE_SETUP.sql`

---

**Platform:** SmartLenderUp / BV Funguo Ltd  
**Date:** March 9, 2026  
**Status:** ⚠️ CRITICAL - MUST RUN BEFORE USING PLATFORM
