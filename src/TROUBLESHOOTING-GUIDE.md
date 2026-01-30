# 🔧 Troubleshooting Guide - Database Schema Issues

## Issue: "column organization_id does not exist" Error

This error means your database schema is different from what the script expected. Here's how to fix it:

---

## 🔍 STEP 1: Check Your Database Schema

Run the schema checker to see your actual table structure:

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy & paste** the script from `/check-database-schema.sql`
3. **Click "Run"**
4. **Review the output** - it will show:
   - All table names in your database
   - All column names in each table
   - Foreign key relationships
   - Current record counts

---

## ✅ STEP 2: Use the Fixed Cleanup Script

I've created a **new, smarter cleanup script** that automatically detects your schema:

📄 **File:** `/database-cleanup-script-FIXED.sql`

### What's Different:

✅ **Auto-detects schema** - Checks if columns exist before using them  
✅ **Handles different user table structures** - Works with or without organization_id  
✅ **Checks table existence** - Only operates on tables that exist  
✅ **Better error handling** - Won't crash if schema is different  
✅ **More detailed logging** - Shows exactly what it's doing  

### How to Use:

1. **Run the schema checker first** (optional but recommended)
2. **Copy the FIXED cleanup script** from `/database-cleanup-script-FIXED.sql`
3. **Paste into Supabase SQL Editor**
4. **Click "Run"**
5. **Review the output** - it will show before/after counts

---

## 📋 Common Schema Variations

### **Variation 1: Supabase Auth Users**

If you're using Supabase Authentication:
- The `auth.users` table exists (not `public.users`)
- It doesn't have an `organization_id` column
- User-organization mapping might be in a different table (like `profiles` or `user_organizations`)

**Solution:** The FIXED script handles this automatically.

### **Variation 2: Custom User Profiles**

You might have a structure like:
- `auth.users` - Supabase auth users
- `profiles` or `user_profiles` - Your custom user data with organization_id

**Solution:** The FIXED script will skip deleting auth users and only clean your custom tables.

### **Variation 3: No Organization Column**

Some tables might not have `organization_id`:
- They might use a different column name
- They might not be multi-tenant

**Solution:** The FIXED script checks for column existence before using it.

---

## 🎯 What the Fixed Script Does

### **Safety Checks:**
1. ✅ Checks if UV1K organization exists
2. ✅ Checks if each table exists before deleting from it
3. ✅ Checks if columns exist before filtering by them
4. ✅ Wrapped in a transaction (automatic rollback on error)

### **Deletion Strategy:**
1. **DELETE ALL:** payments, loan_collateral, loan_guarantors, journal_entries, loans, clients, loan_products
2. **DELETE EXCEPT UV1K:** employees, payroll, bank_accounts, bank_branches, shareholders, organizations
3. **CONDITIONAL:** users (only if organization_id column exists)

### **Preservation:**
- ✅ BV Funguo Ltd organization (UV1K)
- ✅ All bank accounts for UV1K
- ✅ All bank branches for UV1K
- ✅ All shareholders for UV1K
- ✅ All users for UV1K (if possible)

---

## 🚨 If You Still Get Errors

### **Error: "table does not exist"**
This means your database doesn't have that table.

**Solution:** The FIXED script checks for table existence, but if you still get this error:
1. Run the schema checker to see what tables you have
2. Let me know which tables exist
3. I'll create a custom cleanup script for your exact schema

### **Error: "permission denied"**
You don't have permission to delete from certain tables.

**Solution:**
1. Make sure you're logged in as the database owner
2. Check your Row Level Security (RLS) policies
3. You might need to temporarily disable RLS:
   ```sql
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   -- Run cleanup
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   ```

### **Error: "foreign key constraint violation"**
Some tables have dependencies that need to be deleted first.

**Solution:** The FIXED script deletes in the correct order, but if you still get this:
1. Check the error message for which constraint failed
2. Delete child records before parent records
3. Run: `SELECT * FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';`

---

## 📊 Verify the Schema

After running the schema checker, look for these key details:

### **Check 1: Organizations Table**
Should have columns:
- `id` (uuid)
- `organization_name` (text)
- `username` (text)
- `email` (text)
- `country` (text)
- `currency` (text)

### **Check 2: Users Table**
Might have:
- `id` (uuid)
- `email` (text)
- `name` (text)
- `organization_id` (uuid) ← **This is the key column**

If you see `auth.users` instead of `public.users`, that's normal!

### **Check 3: Client/Loan Tables**
Should have:
- `organization_id` (uuid) column
- Foreign key to `organizations(id)`

---

## 🎯 Quick Fix Checklist

- [ ] Run `/check-database-schema.sql` to see your schema
- [ ] Use `/database-cleanup-script-FIXED.sql` instead of the old script
- [ ] Backup your database first (use methods from earlier)
- [ ] Review the output to confirm correct data preserved
- [ ] Test with the 22 clients and 11 loans scripts

---

## 💡 Pro Tip

If you want to be extra safe:

1. **Test on a subset first:**
   ```sql
   -- Delete just clients as a test
   DELETE FROM clients WHERE organization_id != (SELECT id FROM organizations WHERE username = 'UV1K');
   
   -- If that works, proceed with the full cleanup
   ```

2. **Use a transaction manually:**
   ```sql
   BEGIN;
   -- Run the cleanup script
   -- Review the output
   -- If looks good:
   COMMIT;
   -- If something wrong:
   ROLLBACK;
   ```

---

## 📞 Still Need Help?

If you're still having issues:

1. **Share the output** from `/check-database-schema.sql`
2. **Share the exact error message** you're getting
3. I'll create a custom cleanup script for your exact database structure

---

**Happy Cleaning! 🧹**
