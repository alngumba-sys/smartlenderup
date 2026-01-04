# ⚡ Quick Fix: Remove loan_id NOT NULL Constraint

## If you already added the missing columns but still get this error:
```
null value in column "loan_id" violates not-null constraint
```

## Run This Simple SQL:

1. **Go to Supabase SQL Editor**
   - https://supabase.com/dashboard
   - Select SmartLenderUp project
   - Click "SQL Editor" → "+ New query"

2. **Copy & Paste This:**

```sql
-- Remove NOT NULL constraint from loan_id
ALTER TABLE approvals ALTER COLUMN loan_id DROP NOT NULL;

-- Verify
SELECT 
  column_name, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'approvals' 
  AND column_name = 'loan_id';
```

3. **Click RUN**

4. **Verify Result:**
   You should see: `loan_id | YES` (meaning it's now nullable)

5. **Done!** Try creating a loan application again.

---

## Why This Fix?

Your app uses `related_id` to store the loan ID (e.g., "LN004").
The `loan_id` column is for backwards compatibility only and should be nullable.

---

**Alternative:** Just run `/FIX_EXISTING_APPROVALS_TABLE.sql` - it includes this fix plus all the column additions.
