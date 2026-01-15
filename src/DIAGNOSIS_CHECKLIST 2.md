# 🔍 COMPREHENSIVE DIAGNOSIS CHECKLIST

## Issue: Loans showing 0 in Dashboard

### ✅ What I've Fixed So Far:
1. ✅ Fixed `outstandingBalance` field mapping in DataContext (was using `l.balance`, now uses `l.outstanding_balance`)
2. ✅ Fixed Outstanding column calculation in ClientsTab (now includes 'Disbursed' status)
3. ✅ Added enhanced debug logging to DashboardTab
4. ✅ Added null safety checks

### 🔍 Step 1: Check Browser Console Logs

Open your browser Developer Tools (F12) and look for these specific sections:

#### A) Check if loans are being loaded:
Look for this section in console:
```
💰 ========================================
💰 LOADING LOANS FROM INDIVIDUAL TABLE
💰 ========================================
```

**Expected outcomes:**
- ✅ GOOD: "✅ Loaded 23 loans from individual table"
- ⚠️  PROBLEM: "ℹ️ No loans found in individual table"
- ❌ ERROR: "❌ Error loading loans from Supabase:"

#### B) Check the LOAN STATUS DEBUG section:
```
=== LOAN STATUS DEBUG ===
Total loans in context: ???
```

**What to look for:**
- If `Total loans in context: 0` → Loans not loading from database
- If `Total loans in context: 23` → Loans loading but status values wrong

#### C) Check for errors:
Look for any RED error messages mentioning:
- "Database not reachable"
- "organization_id"
- "loans"
- "RPC"

### 🔍 Step 2: Check Supabase Database

Run this SQL in Supabase SQL Editor:

\`\`\`sql
-- Check if loans exist
SELECT COUNT(*) as total_loans FROM loans;

-- Check loan statuses
SELECT status, COUNT(*) as count 
FROM loans 
GROUP BY status;

-- Check if outstanding_balance is populated
SELECT 
  id,
  loan_number,
  principal_amount,
  amount_paid,
  outstanding_balance,
  status
FROM loans
LIMIT 10;
\`\`\`

### 🔍 Step 3: Check Organization ID

The loans must belong to your organization. Run:

\`\`\`sql
-- Check your organization ID
SELECT id, organization_name FROM organizations LIMIT 5;

-- Check which organization the loans belong to
SELECT 
  organization_id,
  COUNT(*) as loan_count
FROM loans
GROUP BY organization_id;
\`\`\`

### 🛠️ Step 4: Fix Data Issues

If loans have wrong status or null outstanding_balance:

\`\`\`sql
-- Fix outstanding balance
UPDATE loans
SET outstanding_balance = COALESCE(principal_amount, 0) - COALESCE(amount_paid, 0);

-- Fix status
UPDATE loans
SET status = CASE 
  WHEN outstanding_balance <= 0 THEN 'Fully Paid'
  WHEN outstanding_balance > 0 THEN 'Active'
  ELSE 'Active'
END;
\`\`\`

### 🔧 Step 5: Verify the Fix

After running SQL:
1. Refresh your browser (Ctrl+R or Cmd+R)
2. Check console logs again
3. Dashboard should now show correct data

## 📊 What Should Work Now:

1. ✅ Loans load from Supabase `loans` table
2. ✅ Outstanding balance uses correct field (`outstanding_balance`)
3. ✅ Client Outstanding column shows correct amounts
4. ✅ Loan Status Distribution chart shows correct counts
5. ✅ All charts and metrics reflect actual database data

## 🆘 If Still Not Working:

**Share these specific details:**
1. What does console show for "💰 LOADING LOANS FROM INDIVIDUAL TABLE"?
2. What does "Total loans in context:" show?
3. What does the SQL query `SELECT COUNT(*) FROM loans;` return?
4. Any RED error messages in console?
