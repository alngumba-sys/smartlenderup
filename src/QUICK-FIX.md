# 🚨 QUICK FIX - Database Setup Required

## The Problem
Your Supabase database is missing two things:
1. `contact_messages` table (for Contact Us feature)
2. `trial_days` column in `pricing_config` table

## ⚠️ UPDATE: "plan_name" Error?

If you got an error about "plan_name" column, use the **FIXED** script instead!

## The Solution (2 Minutes)

### **Option 1: Use FIXED Script** ⚡ (RECOMMENDED if you got an error)

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Click "SQL Editor"** (left sidebar)
3. **Click "New Query"**
4. **Copy & paste** ALL code from **`/supabase-setup-fixed.sql`** ⭐
5. **Click "Run"** (or Ctrl+Enter)
6. **Done!** ✅

### **Option 2: Check Your Database First** 🔍

Want to see what's actually in your database?

1. Open Supabase SQL Editor
2. Copy code from **`/supabase-diagnostic.sql`**
3. Run it
4. Look at the results to see your table structure
5. Then use the fixed script above

---

## Verify It Worked

Refresh your app and:
- ✅ No more red errors in console
- ✅ Contact form works (footer button)
- ✅ Super Admin shows "Contact Messages" tab
- ✅ Pricing control panel saves without errors

---

## Files Created

1. **`/supabase-setup.sql`** - Complete database setup (includes tables, indexes, RLS policies, sample data)
2. **`/supabase-setup-fixed.sql`** - Fixed script for "plan_name" error
3. **`/supabase-diagnostic.sql`** - Diagnostic script to check your database
4. **`/DATABASE-SETUP-GUIDE.md`** - Detailed step-by-step guide with troubleshooting
5. **`/QUICK-FIX.md`** - This file (quick reference)

---

**Need detailed instructions?** Read `/DATABASE-SETUP-GUIDE.md`

**Ready to test?** 
1. Run the SQL script
2. Refresh your browser
3. Try the Contact Us button in the footer
4. Check Super Admin → Contact Messages tab

🎉 **You'll be up and running in 2 minutes!**