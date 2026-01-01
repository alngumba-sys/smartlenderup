# 🔄 Fresh Start Guide - Complete Data Reset

## Overview
This guide will help you completely reset your SmartLenderUp Test environment, removing all organizations, clients, loans, expenses, and any other data.

---

## ⚠️ Important Warning

**This process will DELETE ALL DATA including:**
- ✅ All organizations
- ✅ All users
- ✅ All clients (individuals and groups)
- ✅ All loans and loan applications
- ✅ All payments and repayments
- ✅ All expenses and payees
- ✅ All savings accounts and transactions
- ✅ All shareholders and investments
- ✅ All bank accounts
- ✅ All payroll records
- ✅ All journal entries
- ✅ All audit logs
- ✅ All tasks and tickets
- ✅ All guarantors and collaterals
- ✅ All documents

**Table structure will remain intact** - only data is deleted.

**This action CANNOT be undone** - make sure you want to proceed!

---

## 📋 Step-by-Step Instructions

### **Step 1: Clear Supabase Database**

1. **Open your Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/sql
   ```

2. **Click "+ New query"** (top right)

3. **Copy the entire contents** of `/supabase-complete-cleanup.sql`

4. **Paste it** into the SQL Editor

5. **Click "Run"** (or press Ctrl+Enter / Cmd+Enter)

6. **Wait for execution** - you should see a verification table at the bottom

7. **Verify all counts are 0:**
   - All tables should show `record_count = 0`
   - If any table shows a count > 0, run the script again

8. **Success!** Your Supabase database is now clean ✅

---

### **Step 2: Clear Browser LocalStorage**

Your browser stores some data locally. Clear it to ensure a complete fresh start:

#### **Option A: Using Browser Console (Recommended)**

1. **Open your SmartLenderUp app** in the browser

2. **Open Developer Console:**
   - **Windows/Linux**: Press `F12` or `Ctrl+Shift+I`
   - **Mac**: Press `Cmd+Option+I`

3. **Click the "Console" tab**

4. **Type this command** and press Enter:
   ```javascript
   localStorage.clear()
   ```

5. **You should see:** `undefined` (this is normal)

6. **Refresh the page:** Press `F5` or `Ctrl+R` (Windows) / `Cmd+R` (Mac)

#### **Option B: Using Browser Settings**

**Chrome/Edge:**
1. Press `F12` to open DevTools
2. Click "Application" tab
3. Expand "Local Storage" in left sidebar
4. Right-click on your site URL
5. Click "Clear"

**Firefox:**
1. Press `F12` to open DevTools
2. Click "Storage" tab
3. Expand "Local Storage" in left sidebar
4. Right-click on your site URL
5. Click "Delete All"

**Safari:**
1. Open Safari → Preferences → Advanced
2. Check "Show Develop menu"
3. Develop → Show Web Inspector
4. Click "Storage" tab
5. Select "Local Storage"
6. Click "Clear"

---

### **Step 3: Verify Clean State**

1. **Refresh your SmartLenderUp app** (hard refresh: Ctrl+Shift+R / Cmd+Shift+R)

2. **You should see:**
   - Login page or landing page
   - No organizations in the system
   - No pre-loaded data
   - Clean slate ready for new registrations

3. **Check Browser Console** (F12) for any errors:
   - Should show: `ℹ️ No organization set - waiting for login`
   - This is normal for a fresh start

---

## ✅ Post-Cleanup Checklist

After completing the cleanup, verify:

- [ ] Supabase SQL query shows all tables with 0 records
- [ ] Browser localStorage is cleared
- [ ] App refreshed (hard refresh performed)
- [ ] No errors in browser console
- [ ] Login page loads correctly
- [ ] No organization data visible
- [ ] Ready to create new organization

---

## 🚀 Starting Fresh

Now you can:

1. **Register a new organization:**
   - Click "GET STARTED FOR FREE"
   - Fill in organization details
   - Create admin account

2. **Add fresh data:**
   - Create new clients
   - Set up loan products
   - Configure bank accounts
   - Add employees/users

3. **Test thoroughly:**
   - Everything will be stored in SmartLenderUp Test project
   - Experiment freely
   - No old data to interfere

---

## 🔍 Troubleshooting

### **Issue: Tables still have data after running script**

**Solution:**
1. Check if there are any error messages in SQL Editor
2. Run the script again (some foreign key constraints might need multiple passes)
3. If issues persist, delete data table by table manually:
   - Start with child tables (guarantors, collaterals, etc.)
   - End with parent tables (organizations, users)

### **Issue: App still shows old data after refresh**

**Solution:**
1. Clear localStorage again (see Step 2)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Close all browser tabs with the app
4. Open app in new incognito/private window
5. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### **Issue: "Organization not found" errors**

**Solution:**
This is normal after cleanup. Simply:
1. Register a new organization
2. Login with new credentials
3. System will create fresh organization_id

### **Issue: "Foreign key constraint violation" in SQL**

**Solution:**
The cleanup script handles foreign keys in correct order, but if you see this:
1. Run the script multiple times
2. Or delete tables in this specific order:
   - guarantors, collaterals, loan_documents (first)
   - loans, clients (second)
   - organizations (last)

---

## 📊 What Remains After Cleanup

### **Preserved (Not Deleted):**
- ✅ Database table structure (all 25 tables)
- ✅ Column definitions
- ✅ Indexes and constraints
- ✅ Row Level Security (RLS) policies
- ✅ Database functions and triggers
- ✅ Your Supabase configuration

### **Deleted (Removed):**
- ❌ All organization records
- ❌ All user accounts
- ❌ All client data
- ❌ All financial transactions
- ❌ All business data
- ❌ All audit trails

---

## 💡 Tips for Fresh Testing

1. **Create test organization first:**
   - Use recognizable test name (e.g., "Test Org 2024")
   - Use test email (e.g., test@example.com)
   - Document test credentials

2. **Add sample data systematically:**
   - Create 2-3 test clients
   - Create 1-2 loan products
   - Submit 1-2 loan applications
   - Test approval workflow

3. **Monitor Supabase in real-time:**
   - Keep Table Editor open
   - Watch data populate as you create records
   - Verify foreign keys are correct

4. **Use browser console:**
   - Keep console open (F12)
   - Watch for success messages: `✅ Client synced to Supabase`
   - Check for any error messages

---

## 🎯 Quick Commands Reference

### **Clear Supabase Database:**
```sql
-- Run in SQL Editor
-- Copy from: /supabase-complete-cleanup.sql
```

### **Clear localStorage:**
```javascript
// Run in Browser Console
localStorage.clear()
```

### **Verify Clean State:**
```javascript
// Run in Browser Console
console.log('Organizations:', localStorage.getItem('current_organization'))
console.log('User:', localStorage.getItem('current_user'))
// Both should show: null
```

### **Hard Refresh Browser:**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

## 📞 Need Help?

If you encounter issues during cleanup:

1. Check the browser console for error messages
2. Verify SQL script ran without errors in Supabase
3. Ensure you're using the correct Supabase project (mqunjutuftoueoxuyznn)
4. Try clearing cache and cookies
5. Use incognito/private browsing mode to test

---

## ✅ Success Indicators

You'll know the cleanup was successful when:

1. ✅ SQL verification query shows all 0s
2. ✅ Browser localStorage is empty
3. ✅ App loads to login/landing page
4. ✅ No organization data visible
5. ✅ Console shows "No organization set"
6. ✅ Registration flow works normally
7. ✅ New data saves to Supabase correctly

---

**Ready to start fresh?** Follow the steps above and you'll have a clean testing environment!

**Last Updated**: December 29, 2024  
**Status**: Ready to use  
**Database**: SmartLenderUp Test (mqunjutuftoueoxuyznn)
