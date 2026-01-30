# 🔧 Diagnose & Fix - Client Table Column Names

## The Problem
The error shows: `column "client_id" of relation "clients" does not exist`

This means your `clients` table uses different column names than expected.

---

## 🔍 Step 1: Find Out Your Actual Column Names

### **Run this first:**
```sql
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'clients'
ORDER BY ordinal_position;
```

**This will show you exactly what columns exist in your `clients` table.**

---

## 📋 Common Column Name Variations

Your table might use any of these naming conventions:

| Expected | Possible Actual Names |
|----------|----------------------|
| `client_id` | `id`, `borrower_id`, `customer_id` |
| `full_name` | `name`, `client_name`, `borrower_name`, `customer_name` |
| `id_number` | `national_id`, `nrc_number`, `id_no`, `identification` |
| `phone_number` | `phone`, `mobile`, `contact`, `mobile_number` |
| `email` | `email`, `email_address` |

---

## ✅ Step 2: Use the Correct Script

I've created **2 versions** of the insert script:

### **Version 1: `/insert-clients-FIXED.sql`**
Uses these column names:
- `name` (instead of full_name)
- `national_id` (instead of id_number)
- `phone` (instead of phone_number)
- `email`
- `status`
- `organization_id`
- `created_at`, `updated_at`

**Try this version first!** It's the most common naming convention.

---

## 🎯 Step 3: If Still Errors, Tell Me Your Column Names

After running Step 1, you'll see output like:

```
column_name       | data_type
------------------|-----------
id                | uuid
organization_id   | uuid
name              | text
national_id       | text
phone             | text
email             | text
status            | text
created_at        | timestamp
updated_at        | timestamp
```

**Send me this output and I'll create a perfect script for your exact table structure!**

---

## 🚀 Quick Fix Scripts

### **Option A: Check Table Structure**
File: `/check-clients-table-structure.sql`

```sql
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'clients'
ORDER BY ordinal_position;
```

### **Option B: Try Fixed Insert Script**
File: `/insert-clients-FIXED.sql`

Uses common column names:
- ✅ `name` instead of `full_name`
- ✅ `national_id` instead of `id_number`
- ✅ `phone` instead of `phone_number`

---

## 📊 What We're Trying to Insert

22 clients with this data:
- Name (e.g., "PRISCAH LOICE MBUVI")
- NRC Number (e.g., "23806403")
- Phone (e.g., "0720817837")
- Email (e.g., "rosemutdava@gmail.com")
- Status: "active"

---

## 🔄 Process

1. **Run** `/check-clients-table-structure.sql` to see your columns
2. **Run** `/insert-clients-FIXED.sql` (should work for most cases)
3. **If error**, copy the column names from Step 1
4. **Tell me** the column names, I'll create perfect script
5. **Run** the new script
6. **Success!** ✅

---

## 💡 Most Likely Issue

Your table probably uses:
- ❌ NOT `client_id` → ✅ BUT `id` (auto-generated UUID)
- ❌ NOT `full_name` → ✅ BUT `name`
- ❌ NOT `id_number` → ✅ BUT `national_id`
- ❌ NOT `phone_number` → ✅ BUT `phone`

The `/insert-clients-FIXED.sql` script uses these corrected names!

---

## ✅ Next Steps

1. **First, check your table structure:**
   - Copy `/check-clients-table-structure.sql`
   - Paste in Supabase SQL Editor
   - Click "Run"
   - See your actual column names

2. **Then, try the fixed insert:**
   - Copy `/insert-clients-FIXED.sql`
   - Paste in Supabase SQL Editor
   - Click "Run"
   - Should insert all 22 clients!

3. **If still error:**
   - Send me the column names from Step 1
   - I'll create a perfect custom script

---

**Ready! Try the fixed script now!** 🚀
