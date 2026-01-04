# 🚨 URGENT: Do This RIGHT NOW (30 Seconds)

## Your Error:
```
null value in column "loan_id" violates not-null constraint
```

## The Fix (4 Simple Steps):

### 1️⃣ Copy This One Line:
```sql
ALTER TABLE approvals ALTER COLUMN loan_id DROP NOT NULL;
```

### 2️⃣ Open Supabase:
Go to: https://supabase.com/dashboard

### 3️⃣ Open SQL Editor:
- Click on your **SmartLenderUp** project
- Click **"SQL Editor"** on the left side
- Click **"+ New query"** button

### 4️⃣ Paste and Run:
- Paste the SQL line
- Click the **"RUN"** button

## Done! ✅

Now go back to https://smartlenderup.com and create your loan application. It will work!

---

## Alternative (If you want to add missing columns too):

If you also need to add missing columns (status, amount, client_id, etc.), use this instead:

**File:** `/FIX_EXISTING_APPROVALS_TABLE.sql`
1. Open the file
2. Copy everything
3. Paste in SQL Editor
4. Click RUN

---

## Why This Happens:

Your `loan_id` column has a NOT NULL constraint, but your application stores the loan ID in `related_id` instead (you can see "LN005" in your error). The `loan_id` needs to be nullable.

---

**Just run that one SQL line above and you're fixed!** 🚀
