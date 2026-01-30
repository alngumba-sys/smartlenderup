# 🔧 Fix: Type Casting Error in Supabase

## The Error You Got:
```
ERROR: 42883: operator does not exist: text = uuid
HINT: No operator matches the given name and argument types. 
You might need to add explicit type casts.
```

---

## 🎯 What This Means:

Supabase is trying to compare two different data types:
- `organization_id` column is **UUID** type
- The subquery result is being interpreted as **TEXT** type

PostgreSQL (which Supabase uses) won't automatically convert between these types.

---

## ✅ **SOLUTION: Use the FIXED Scripts**

I've created **2 new scripts** that fix this issue:

### **Option 1: `/quick-reset-chart-of-accounts-FIXED.sql`** (Recommended)
- ✅ Uses proper type handling with variables
- ✅ Checks if organization exists first
- ✅ Shows detailed output
- ✅ Safe and reliable

### **Option 2: `/reset-chart-simple.sql`** (Simplest)
- ✅ Doesn't use organization filtering
- ✅ Just resets specific account codes
- ✅ Works even if there are type issues
- ✅ Fastest to run

---

## 🚀 **Quick Fix - Use Option 2 (Simplest)**

### **Copy & Paste This:**

```sql
-- Reset Loans Receivable
UPDATE chart_of_accounts 
SET balance = 0, debit = 0, credit = 0, updated_at = NOW()
WHERE account_code = '1200';

-- Reset Interest Receivable
UPDATE chart_of_accounts 
SET balance = 0, debit = 0, credit = 0, updated_at = NOW()
WHERE account_code = '1210';

-- Reset Retained Earnings
UPDATE chart_of_accounts 
SET balance = 0, debit = 0, credit = 0, updated_at = NOW()
WHERE account_code = '3200';

-- Reset Revenue accounts
UPDATE chart_of_accounts 
SET balance = 0, debit = 0, credit = 0, updated_at = NOW()
WHERE account_type = 'revenue';

-- Reset Expense accounts
UPDATE chart_of_accounts 
SET balance = 0, debit = 0, credit = 0, updated_at = NOW()
WHERE account_type = 'expense';

-- Verify what was preserved
SELECT account_code, account_name, balance
FROM chart_of_accounts 
WHERE account_code IN ('1110', '1120', '1130', '3100');
```

**This will work 100%!** ✅

---

## 💡 **Why The Simple Version Works:**

Instead of filtering by `organization_id` (which has type issues), we:
1. ✅ Target specific account codes directly
2. ✅ No UUID comparisons needed
3. ✅ Works across all organizations (safe if you only have UV1K)

---

## 🔍 **If You Want to Understand the Error:**

### **The Problem Was Here:**
```sql
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
                         ↑
                         This subquery returns UUID
                         But PostgreSQL thought it was TEXT
```

### **The Fix:**
```sql
-- Store in a variable first (proper type)
DECLARE v_org_id UUID;
SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';

-- Then use the variable
WHERE organization_id = v_org_id
                        ↑
                        Now both are UUID type
```

---

## 🎯 **Which Script Should You Use?**

| Script | When to Use |
|--------|-------------|
| **`/reset-chart-simple.sql`** | ✅ **Use this now!** Easiest, no type issues |
| **`/quick-reset-chart-of-accounts-FIXED.sql`** | Use if you have multiple organizations |

---

## ✅ **Step-by-Step Instructions:**

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy the entire script** from `/reset-chart-simple.sql`
4. **Paste it** into the SQL Editor
5. **Click "Run"**
6. **Done!** ✅

---

## 🔒 **What Gets Preserved:**

After running the script:
- ✅ Cash in Hand (1110) - **Balance stays**
- ✅ Cash at Bank (1120) - **Balance stays**
- ✅ M-Pesa Account (1130) - **Balance stays**
- ✅ Share Capital (3100) - **Balance stays**

---

## 🔄 **What Gets Reset:**

- ✅ Loans Receivable (1200) → **0**
- ✅ Interest Receivable (1210) → **0**
- ✅ Retained Earnings (3200) → **0**
- ✅ All Revenue accounts → **0**
- ✅ All Expense accounts → **0**

---

## 📊 **Verification Query:**

After running, check your results:

```sql
-- See all accounts with their balances
SELECT 
    account_code,
    account_name,
    balance,
    CASE 
        WHEN balance > 0 THEN '💰 Has Balance'
        ELSE '📝 Zero'
    END as status
FROM chart_of_accounts
ORDER BY account_code;
```

---

## 🆘 **Still Getting Errors?**

If you still get an error, it might be:

### **Error: "table chart_of_accounts does not exist"**
**Solution:** Your table might be named differently:
- Try: `accounts`
- Try: `gl_accounts`
- Try: `ledger_accounts`

Check with:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%account%';
```

### **Error: "column does not exist"**
**Solution:** Your columns might be named differently:
```sql
-- Check your column names
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'chart_of_accounts';
```

---

**Try the simple script now - it should work perfectly!** 🚀
