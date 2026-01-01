# 🧹 Complete Data Cleanup Guide

This guide will help you clean ALL data from both frontend and backend to start fresh.

---

## ⚡ Quick Method (Recommended)

### Step 1: Clean Frontend + Backend Together

1. **Open your browser console** (Press `F12` or `Ctrl+Shift+J`)
2. **Type and run:**
   ```javascript
   completeDataReset()
   ```
3. **Wait 3 seconds** - The page will auto-refresh
4. ✅ Done! Both frontend and backend are now clean

---

## 🔧 Manual Method (If Quick Method Fails)

### Part A: Clean Frontend Data

1. **Open browser console** (`F12`)
2. **Run:**
   ```javascript
   clearAppData()
   ```
3. **Wait for auto-refresh** (2 seconds)

---

### Part B: Clean Backend (Supabase)

#### **Option 1: Using SQL Script (Easiest)**

1. Go to your **SmartLenderUp Test** project in Supabase
2. Click **SQL Editor** (left sidebar)
3. Click **"+ New query"**
4. **Copy and paste** the contents from `/supabase-cleanup.sql`
5. Click **"Run"** button
6. ✅ All data deleted!

#### **Option 2: Using Supabase Dashboard**

1. Go to **Table Editor** in Supabase
2. For each table, click the table name
3. Click the **"..."** menu (top right)
4. Select **"Truncate table"**
5. Confirm the action
6. Repeat for all tables

#### **Option 3: Manual DELETE Queries**

Run these one by one in SQL Editor:

```sql
-- Delete all data (order matters!)
DELETE FROM payments;
DELETE FROM loan_documents;
DELETE FROM loans;
DELETE FROM loan_products;
DELETE FROM clients;
DELETE FROM journal_entries;
DELETE FROM payroll_records;
DELETE FROM expenses;
DELETE FROM settings;
DELETE FROM audit_logs;
```

---

## 📋 Verification

### Check Frontend is Clean:
1. Open browser console
2. Run:
   ```javascript
   localStorage.getItem('bv_funguo_db')
   ```
3. Should return `null` or `{}`

### Check Backend is Clean:
1. Go to **Table Editor** in Supabase
2. Click on each table
3. Verify **0 rows** in all tables

---

## 🎯 What Gets Deleted?

### Frontend (localStorage):
- ✅ All client data
- ✅ All loan data
- ✅ All payment records
- ✅ All loan products
- ✅ All journal entries
- ✅ All settings
- ✅ Dashboard filter preferences

### Backend (Supabase):
- ✅ All client records
- ✅ All loan records
- ✅ All payment records
- ✅ All loan products
- ✅ All documents
- ✅ All journal entries
- ✅ All payroll records
- ✅ All expense records
- ✅ All settings

### What STAYS:
- ✅ Table structure (all tables remain)
- ✅ Database schema
- ✅ Application code
- ✅ User authentication tables (if separate)

---

## 🚀 Next Steps After Cleanup

After cleaning all data, you can:

1. **Create fresh test data** manually
2. **Import real client data** when ready
3. **Set up new loan products**
4. **Configure organization settings**

---

## ⚠️ Important Notes

- **This action cannot be undone** - Make sure you want to delete everything
- **Backup important data** before running cleanup if needed
- **Currently in TEST environment** - This is safe to clean anytime
- **Don't run this on PRODUCTION** - Only use on your test project

---

## 🆘 Troubleshooting

### "completeDataReset is not defined"
- Refresh the page and try again
- Make sure you're on the main app page, not login page

### "Permission denied" in Supabase
- Check you're logged into the correct Supabase project
- Verify you have admin access to the project

### Frontend data still showing after cleanup
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache completely
- Try in incognito/private window

---

## 📞 Need Help?

If cleanup fails or you see errors, check:
1. Browser console for error messages
2. Supabase SQL Editor for error details
3. Verify you have correct permissions

---

**Last Updated:** December 2024