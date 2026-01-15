# 🔄 REBUILD LOAN PRODUCTS TABLE - Instructions

## The Problem
Your current `loan_products` table has a `user_id` column with NOT NULL constraint that's causing errors. Let's start fresh!

---

## ✅ Simple 3-Step Fix

### Step 1: Copy the SQL
Open the file `/CREATE_LOAN_PRODUCTS_TABLE.sql`

### Step 2: Run in Supabase
1. Go to **Supabase Dashboard**
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. **Paste the entire SQL** from `/CREATE_LOAN_PRODUCTS_TABLE.sql`
5. Click **Run** ▶️

### Step 3: Test in Your App
1. Go to **Internal Staff Portal** → **Loan Products**
2. Click **"New Product"**
3. Fill in the form and save
4. Check browser console for: `✅ Loan product created successfully`

---

## 🎯 What This SQL Does

### Drops Old Table
```sql
DROP TABLE IF EXISTS loan_products CASCADE;
```
- Removes the broken table completely
- `CASCADE` removes any dependencies safely

### Creates New Table With:
- ✅ **Auto-generated UUID** for `id` column (fixes the error!)
- ✅ **NO user_id requirement** (this was causing the error!)
- ✅ **All expected columns** from the code
- ✅ **Dual naming support** (e.g., both `min_amount` AND `minimum_amount`)
- ✅ **Proper defaults** for all fields
- ✅ **Indexes** for fast queries
- ✅ **Auto-updating timestamps**

### Key Columns Created:
```
id                          → UUID (auto-generated)
organization_id             → UUID (required)
product_name                → Text (required)
product_code                → Text (unique)
min_amount / minimum_amount → Decimal
max_amount / maximum_amount → Decimal
min_term / minimum_term     → Integer
max_term / maximum_term     → Integer
interest_rate               → Decimal
interest_method             → Text
repayment_frequency         → Text
processing_fee_percentage   → Decimal
guarantor_required          → Boolean
collateral_required         → Boolean
status                      → Text (default: 'active')
created_at                  → Timestamp (auto)
updated_at                  → Timestamp (auto)
```

---

## 🧪 After Running the SQL

You'll see two result tables:

### Table 1: Column List
Shows all 30+ columns with their types and defaults
- Look for `id` with `gen_random_uuid()` default ✅
- Look for `organization_id` marked as REQUIRED ✅

### Table 2: Index List
Shows 4 indexes created for performance:
- `idx_loan_products_organization`
- `idx_loan_products_status`
- `idx_loan_products_code`
- `idx_loan_products_created`

---

## 📝 Optional: Add Sample Data

If you want to test with sample products, uncomment the INSERT statements at the bottom of the SQL file and replace `'YOUR_ORG_ID_HERE'` with your actual organization ID.

To get your organization ID:
```javascript
// Run in browser console
const org = JSON.parse(localStorage.getItem('current_organization'));
console.log('Organization ID:', org.id);
```

Then update the SQL:
```sql
'YOUR_ORG_ID_HERE' → '8f81b4e3-9fac-40e1-9042-9dba79ed33aa'
```

---

## 🔒 Optional: Enable Row Level Security (RLS)

The SQL includes commented-out RLS policies. If you want to enable organization-level security:

1. Uncomment the policy sections in the SQL
2. Make sure you have a `user_organizations` table
3. Re-run the SQL

---

## ✅ Verification Checklist

After running the SQL:
- [ ] SQL executed without errors
- [ ] Column list displayed (30+ columns)
- [ ] Index list displayed (4 indexes)
- [ ] Try creating a product in your app
- [ ] Product appears in Supabase Table Editor
- [ ] No console errors

---

## 🚨 If You Still Get Errors

### Error: "organization_id is null"
**Solution:** Check that your app is passing the organization ID correctly.

```javascript
// In browser console
const org = JSON.parse(localStorage.getItem('current_organization'));
console.log('Current organization:', org);
```

### Error: "relation does not exist"
**Solution:** Make sure the SQL completed successfully. Check for any red errors in the SQL editor.

### Error: "permission denied"
**Solution:** You might have RLS enabled. Either:
1. Disable RLS: `ALTER TABLE loan_products DISABLE ROW LEVEL SECURITY;`
2. Or add proper RLS policies (see the commented section in SQL)

---

## 📊 Check Your Data

After creating products, view them in Supabase:
1. Go to **Table Editor**
2. Select **loan_products** table
3. You should see your products listed

---

## 🎉 That's It!

Your loan_products table is now properly configured and ready to use. All products will be stored in Supabase with no localStorage dependency.

---

**Questions?** Check the console logs for detailed error messages.
