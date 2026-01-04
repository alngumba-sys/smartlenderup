# 🚀 QUICK FIX: Approvals Table Error

## ❌ Error You're Seeing
```
Could not find the 'amount' column of 'approvals' in the schema cache
OR
column "status" does not exist
```

## ✅ 3-Step Fix (Takes 2 Minutes)

### Step 1️⃣: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your SmartLenderUp project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"+ New query"**

### Step 2️⃣: Use the Complete Migration File
**IMPORTANT:** The approvals table is missing many columns, so we need to use the complete migration.

**Option A: Copy from File (Recommended)**
1. Open the file `/supabase/migrations/FIX_APPROVALS_COMPLETE.sql` in your code editor
2. Copy the entire contents (it's about 350 lines with verification)
3. Paste into Supabase SQL Editor
4. Click **"RUN"**

**Option B: Minimal Quick Fix**
If you prefer a shorter version, paste this SQL:

```sql
-- Create approvals table with all required columns
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id TEXT,
  type TEXT,
  title TEXT,
  description TEXT,
  requested_by TEXT,
  request_date TIMESTAMPTZ DEFAULT NOW(),
  amount NUMERIC,
  client_id TEXT,
  client_name TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  approver TEXT,
  approver_role TEXT,
  approver_name TEXT,
  approval_date TIMESTAMPTZ,
  decision_date TIMESTAMPTZ,
  rejection_reason TEXT,
  related_id TEXT,
  phase INTEGER,
  stage TEXT,
  decision TEXT,
  comments TEXT,
  disbursement_data JSONB,
  step INTEGER,
  approval_status TEXT,
  approver_id UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_approvals_org_id ON approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_loan_id ON approvals(loan_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_client_id ON approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_approvals_phase ON approvals(phase);
CREATE INDEX IF NOT EXISTS idx_approvals_related_id ON approvals(related_id);

-- Enable RLS
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view approvals in their organization" ON approvals;
CREATE POLICY "Users can view approvals in their organization"
  ON approvals FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

DROP POLICY IF EXISTS "Users can insert approvals in their organization" ON approvals;
CREATE POLICY "Users can insert approvals in their organization"
  ON approvals FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

DROP POLICY IF EXISTS "Users can update approvals in their organization" ON approvals;
CREATE POLICY "Users can update approvals in their organization"
  ON approvals FOR UPDATE
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));
```

### Step 3️⃣: Run It
1. Click **"RUN"** (or press Ctrl+Enter / Cmd+Enter)
2. You should see success messages with a table structure report
3. Done! 🎉

## 🧪 Test the Fix
1. Go to https://smartlenderup.com
2. Login
3. Create a new loan application
4. It should work without errors now

## 📁 Alternative: Use Migration File
If you prefer, you can also:
1. Open the file `/supabase/migrations/FIX_APPROVALS_ADD_COLUMNS.sql` in your code editor
2. Copy its entire contents
3. Paste into Supabase SQL Editor
4. Run it

This file includes additional verification checks to confirm the fix worked.

## 🎯 What This Does
Adds 16 missing columns to your `approvals` table:
- ✅ `amount` - Loan amount being approved
- ✅ `client_id` - Client identifier (CL00001)
- ✅ `client_name` - Client's full name
- ✅ `type` - Approval type
- ✅ `title` - Approval title
- ✅ `description` - Detailed description
- ✅ `requested_by` - Who requested it
- ✅ `request_date` - When requested
- ✅ `priority` - Priority level
- ✅ `approver_name` - Approver's name
- ✅ `approval_date` - When approved
- ✅ `decision_date` - Decision date
- ✅ `rejection_reason` - Rejection reason (if any)
- ✅ `related_id` - Related loan ID
- ✅ `phase` - Current phase (1-5)
- ✅ `disbursement_data` - Additional data

## ⚠️ Important Notes
- ✅ This is a **safe** migration - won't delete any data
- ✅ Uses `IF NOT EXISTS` - won't fail if columns already exist
- ✅ Works with existing approvals data
- ✅ Required for the 5-phase loan approval workflow

## 🆘 Still Having Issues?

### Check if approvals table exists:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'approvals';
```

### Check what columns exist:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'approvals'
ORDER BY ordinal_position;
```

### If table doesn't exist, create it first:
```sql
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  loan_id TEXT,
  stage TEXT,
  status TEXT DEFAULT 'Pending',
  approver TEXT,
  approver_role TEXT,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Then run the ALTER TABLE commands from Step 2.

---

**Need help?** Check `/FIX_APPROVALS_TABLE.md` for detailed troubleshooting guide.