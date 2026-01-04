# 🔧 Fix Approvals Table Schema Error

## Problem
You're getting this error:
```
❌ Error creating approval in Supabase: {
  "code": "PGRST204",
  "details": null,
  "hint": null,
  "message": "Could not find the 'amount' column of 'approvals' in the schema cache"
}
```

## Root Cause
Your Supabase `approvals` table is missing several columns that the application code expects. The code is trying to save fields like `amount`, `client_id`, `client_name`, `type`, `title`, `description`, etc., but these columns don't exist in your database yet.

## Solution

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard at https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run This SQL Migration
Copy and paste the following SQL code and click **RUN**:

```sql
-- =====================================================
-- FIX APPROVALS TABLE - ADD MISSING COLUMNS
-- =====================================================

-- Add all missing columns to approvals table
ALTER TABLE approvals
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS requested_by TEXT,
ADD COLUMN IF NOT EXISTS request_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS amount NUMERIC,
ADD COLUMN IF NOT EXISTS client_id TEXT,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS approver_name TEXT,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS decision_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS related_id TEXT,
ADD COLUMN IF NOT EXISTS phase INTEGER,
ADD COLUMN IF NOT EXISTS disbursement_data JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_client_id ON approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_approvals_request_date ON approvals(request_date);
CREATE INDEX IF NOT EXISTS idx_approvals_phase ON approvals(phase);
CREATE INDEX IF NOT EXISTS idx_approvals_related_id ON approvals(related_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Approvals table schema updated successfully!';
END $$;
```

### Step 3: Verify the Fix
After running the SQL, you should see a success message in the Results panel.

### Step 4: Test in Your Application
1. Go back to your application at https://smartlenderup.com
2. Try creating a new loan application
3. The approval should now be created successfully without errors

## What This Migration Does

This migration adds the following columns to your `approvals` table:
- ✅ `type` - Type of approval (e.g., 'loan_application')
- ✅ `title` - Approval title
- ✅ `description` - Detailed description
- ✅ `requested_by` - Who requested the approval
- ✅ `request_date` - When the approval was requested
- ✅ `amount` - The amount being approved (e.g., loan amount)
- ✅ `client_id` - Client identifier (e.g., CL00001)
- ✅ `client_name` - Client's full name
- ✅ `priority` - Priority level (low, medium, high)
- ✅ `approver_name` - Name of the approver
- ✅ `approval_date` - When it was approved
- ✅ `decision_date` - When a decision was made
- ✅ `rejection_reason` - Reason for rejection (if rejected)
- ✅ `related_id` - Related entity ID (e.g., loan ID)
- ✅ `phase` - Current phase in 5-phase approval workflow (1-5)
- ✅ `disbursement_data` - Additional disbursement data (JSON)

## Alternative: Use Existing Migration File

If the above SQL doesn't work, you can also apply the complete migration file that's already in your project:

1. Open `/supabase/migrations/COMPLETE_6_approvals.sql` in your code editor
2. Copy its entire contents
3. Paste into Supabase SQL Editor
4. Click **RUN**

## Troubleshooting

### If You Get "column already exists" Errors
That's fine! The SQL uses `ADD COLUMN IF NOT EXISTS`, so it will skip columns that already exist and only add the missing ones.

### If You Get "permission denied" Errors
Make sure you're logged in to Supabase as the project owner or have admin privileges.

### If the Error Persists
1. Check if the approvals table exists:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'approvals';
```

2. Check what columns exist:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'approvals'
ORDER BY ordinal_position;
```

3. If the table doesn't exist at all, create it first:
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

Then run the ALTER TABLE commands from Step 2 above.

---

## ✅ Expected Result

After applying this fix:
- ✅ Loan applications will create approvals successfully
- ✅ The 5-phase approval workflow will work correctly
- ✅ All approval data will be stored in Supabase
- ✅ No more "Could not find the 'amount' column" errors

## 📝 Note

This is a **safe** migration that:
- ✅ Only adds new columns (doesn't delete anything)
- ✅ Doesn't affect existing data
- ✅ Uses `IF NOT EXISTS` to prevent duplicate columns
- ✅ Maintains backward compatibility with old approval records
