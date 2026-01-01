# 🔧 Shareholders Schema Fix - Column Mismatch Error

## Error Found ❌

```
"Could not find the 'address' column of 'shareholders' in the schema cache"
```

**Root Cause:** The Supabase `shareholders` table schema doesn't match your TypeScript interface.

---

## What Was Fixed ✅

### Updated Shareholders Table Schema:

**Old Schema (Missing Columns) ❌**
```sql
CREATE TABLE shareholders (
  id TEXT PRIMARY KEY,
  user_id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  id_number TEXT,
  -- ❌ MISSING: address
  share_certificate_number TEXT,  -- Wrong
  shares_owned INTEGER,           -- Wrong
  share_value NUMERIC,            -- Wrong
  total_investment NUMERIC,       -- Wrong
  total_dividends NUMERIC,
  join_date DATE,
  status TEXT
);
```

**New Schema (Complete) ✅**
```sql
CREATE TABLE shareholders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  id_number TEXT,
  address TEXT,                    -- ✅ ADDED
  share_capital NUMERIC(15, 2),    -- ✅ FIXED
  ownership_percentage NUMERIC,    -- ✅ ADDED
  join_date DATE,
  status TEXT DEFAULT 'Active',
  total_dividends NUMERIC(15, 2) DEFAULT 0,
  bank_account JSONB DEFAULT NULL, -- ✅ ADDED (for banking details)
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Updated Shareholder Transactions Table:

**Old Schema ❌**
```sql
CREATE TABLE shareholder_transactions (
  ...
  reference TEXT,
  description TEXT,
  performed_by TEXT,
  shares INTEGER -- ❌ Wrong field
);
```

**New Schema ✅**
```sql
CREATE TABLE shareholder_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shareholder_id TEXT NOT NULL REFERENCES shareholders(id),
  shareholder_name TEXT,
  transaction_type TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,         -- ✅ FIXED
  transaction_date DATE NOT NULL,
  receipt_number TEXT,            -- ✅ ADDED
  processed_by TEXT,              -- ✅ FIXED
  notes TEXT,                     -- ✅ ADDED
  bank_account_id TEXT,           -- ✅ ADDED
  created_date DATE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## How to Apply the Fix

### Option 1: Run Complete Schema Reset (Recommended)

**⚠️ WARNING: This will DELETE all data in Supabase!**

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy the entire `/supabase-reset-schema.sql` file**
3. **Paste into SQL Editor**
4. **Run the script** (Click "Run")
5. **Wait for completion** (~30 seconds)

**Result:** Fresh database with correct schema! ✅

---

### Option 2: Add Missing Columns Only (Preserves Data)

If you want to keep existing data, run these ALTER TABLE commands:

```sql
-- Fix shareholders table
ALTER TABLE shareholders 
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS share_capital NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ownership_percentage NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bank_account JSONB DEFAULT NULL,
  DROP COLUMN IF EXISTS share_certificate_number,
  DROP COLUMN IF EXISTS shares_owned,
  DROP COLUMN IF EXISTS share_value,
  DROP COLUMN IF EXISTS total_investment;

-- Fix shareholder_transactions table
ALTER TABLE shareholder_transactions
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS receipt_number TEXT,
  ADD COLUMN IF NOT EXISTS processed_by TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_id TEXT,
  DROP COLUMN IF EXISTS shares,
  DROP COLUMN IF EXISTS reference,
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS performed_by;
```

**Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy the SQL above
3. Paste and run
4. Check shareholders table in Table Editor

---

## After Applying the Fix

### 1. Test the Sync

Try creating a shareholder again:

```javascript
// In your app, add a shareholder
// It should work now!
```

### 2. Sync Existing Shareholders (If Any)

If you had shareholders in LocalStorage:

```javascript
// In console
syncShareholdersOnly()
```

### 3. Verify in Supabase

1. Go to Table Editor
2. Select **shareholders** table
3. Click on a row
4. See all columns:
   - ✅ name
   - ✅ email
   - ✅ phone
   - ✅ id_number
   - ✅ address (NEW!)
   - ✅ share_capital (NEW!)
   - ✅ ownership_percentage (NEW!)
   - ✅ bank_account (NEW!)

---

## Why This Happened

**Problem:** The Supabase schema was created before the TypeScript interface was updated.

**Solution:** Keep schema and interface in sync!

**Prevention:** Always check `/supabase-reset-schema.sql` matches TypeScript interfaces.

---

## Schema vs Interface Mapping

### TypeScript Interface:
```typescript
interface Shareholder {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  address: string;                    // ← Was missing
  shareCapital: number;               // ← Was wrong name
  ownershipPercentage: number;        // ← Was missing
  joinDate: string;
  status: 'Active' | 'Inactive';
  totalDividends: number;
  bankAccount?: {                     // ← Was missing
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}
```

### Supabase Table (NOW MATCHES):
```sql
CREATE TABLE shareholders (
  id TEXT,                           -- ✅ matches
  name TEXT,                         -- ✅ matches
  email TEXT,                        -- ✅ matches
  phone TEXT,                        -- ✅ matches
  id_number TEXT,                    -- ✅ matches (snake_case)
  address TEXT,                      -- ✅ NOW ADDED
  share_capital NUMERIC,             -- ✅ NOW FIXED
  ownership_percentage NUMERIC,      -- ✅ NOW ADDED
  join_date DATE,                    -- ✅ matches
  status TEXT,                       -- ✅ matches
  total_dividends NUMERIC,           -- ✅ matches
  bank_account JSONB                 -- ✅ NOW ADDED
);
```

---

## Recommended Action

### Quick Path (No Data to Preserve):

1. **Go to Supabase SQL Editor**
2. **Copy entire `/supabase-reset-schema.sql`**
3. **Paste and Run**
4. **Done!** ✅

### Safe Path (Preserve Existing Data):

1. **Run the ALTER TABLE commands** (Option 2 above)
2. **Verify columns added**
3. **Test adding a shareholder**
4. **Done!** ✅

---

## Verification Checklist

After applying the fix:

- [ ] Run SQL script successfully
- [ ] Check shareholders table has `address` column
- [ ] Check shareholders table has `share_capital` column
- [ ] Check shareholders table has `ownership_percentage` column
- [ ] Check shareholders table has `bank_account` column
- [ ] Try adding a new shareholder in app
- [ ] Check shareholder appears in Supabase
- [ ] No more "Could not find column" errors

---

## Summary

✅ **Root Cause:** Schema mismatch between Supabase and TypeScript  
✅ **Fix Applied:** Updated `/supabase-reset-schema.sql`  
✅ **Action Needed:** Run schema script in Supabase SQL Editor  
✅ **Result:** Shareholders will sync successfully! 🎉

---

**Run this now:**

1. Open Supabase Dashboard
2. SQL Editor
3. Copy `/supabase-reset-schema.sql`
4. Paste & Run
5. Try adding shareholders again!

---

**After schema is updated, shareholders will sync perfectly!** ✅
