# ⚡ Quick Fix Reference Card

## The Problem
```
⚠️ shareholders: Missing organization_id, shareholder_id, shares
⚠️ shareholder_transactions: Missing organization_id
⚠️ bank_accounts: Missing organization_id, account_name
⚠️ expenses: Missing 7 columns
```

## The Solution (Copy & Paste)

### 1️⃣ Find Your Org ID
```sql
SELECT raw_user_meta_data->>'organizationId' FROM auth.users LIMIT 1;
```
**Result:** Copy this ID (e.g., "abc-123")

### 2️⃣ Run This Script
Open: `/supabase/FIX_ALL_MISSING_COLUMNS_MASTER.sql`

**Find & Replace:**
- Find: `'YOUR_ORG_ID_HERE'`
- Replace: `'your-actual-org-id'` (from step 1)
- Count: 5 replacements

**Then:** Copy all → Paste in Supabase SQL Editor → RUN

### 3️⃣ Verify
You should see:
```
✅ Step 1: All columns added
✅ Step 2: Indexes created
✅ Step 3: Data populated
✅ Step 4: RLS enabled
✅ Step 5: RLS policies created
```

## Result
✅ All 13 missing columns added  
✅ Data populated  
✅ Security enforced  
✅ Schema errors gone  

---

## File Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| `FIX_ALL_MISSING_COLUMNS_MASTER.sql` | **Run this one** | First time, fixes everything |
| `FIX_MISSING_COLUMNS.sql` | Add columns only | If you want granular control |
| `POPULATE_NEW_COLUMNS.sql` | Add data only | After columns exist |
| `ADD_RLS_POLICIES_FOR_NEW_COLUMNS.sql` | Add security only | After data is populated |
| `FIX_MISSING_COLUMNS_GUIDE.md` | Full instructions | Need detailed steps |

---

## Columns Added by Table

### shareholders (3)
- `organization_id` → Your org ID
- `shareholder_id` → Auto: SH001, SH002...
- `shares` → Default: 0

### shareholder_transactions (1)
- `organization_id` → Your org ID

### bank_accounts (2)
- `organization_id` → Your org ID
- `account_name` → From existing name

### expenses (7)
- `organization_id` → Your org ID
- `expense_id` → Auto: EXP0001, EXP0002...
- `subcategory` → From category
- `payment_reference` → Auto: REF-{id}
- `payment_date` → From date
- `attachments` → Empty array []
- `payment_type` → From payment_method or "Cash"

---

## Quick Checks

### Before Running
```sql
-- Should show missing columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'shareholders';
```

### After Running
```sql
-- Should show all columns including new ones
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'shareholders' 
AND column_name IN ('organization_id', 'shareholder_id', 'shares');
-- Expected: 3 rows
```

### Verify Data
```sql
-- All should have org_id
SELECT COUNT(*), COUNT(organization_id) FROM shareholders;
-- Both numbers should match
```

---

## Emergency Rollback

If something goes wrong:

```sql
-- Remove columns (CAREFUL!)
ALTER TABLE shareholders 
  DROP COLUMN IF EXISTS organization_id,
  DROP COLUMN IF EXISTS shareholder_id,
  DROP COLUMN IF EXISTS shares;

ALTER TABLE shareholder_transactions 
  DROP COLUMN IF EXISTS organization_id;

ALTER TABLE bank_accounts 
  DROP COLUMN IF EXISTS organization_id,
  DROP COLUMN IF EXISTS account_name;

ALTER TABLE expenses 
  DROP COLUMN IF EXISTS organization_id,
  DROP COLUMN IF EXISTS expense_id,
  DROP COLUMN IF EXISTS subcategory,
  DROP COLUMN IF EXISTS payment_reference,
  DROP COLUMN IF EXISTS payment_date,
  DROP COLUMN IF EXISTS attachments,
  DROP COLUMN IF EXISTS payment_type;
```

---

## Time Estimate
- Find org ID: 30 seconds
- Edit script: 1 minute
- Run script: 2 minutes
- Verify: 1 minute
**Total: ~5 minutes**

---

## Success Indicators
✅ No errors in SQL output  
✅ Verification tables show matching counts  
✅ Schema checker shows no missing columns  
✅ App loads without errors  

---

**Need detailed help?** → `/FIX_MISSING_COLUMNS_GUIDE.md`  
**Ready to fix?** → Run the 3 steps above! 🚀
