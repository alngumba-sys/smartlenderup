# 🔍 Monitor Database Updates - Quick Reference

## How to Verify Status Updates Are Working

### 1. Open Browser Console
Press **F12** or right-click → **Inspect** → **Console** tab

---

### 2. Look for These Log Messages

#### ✅ Successful Approval Update:
```
✅ Updated approval record for loan LN00001: Phase 2, Status pending
🔄 [DB UPDATE] Updating approval status in Supabase:
   approvalId: abc123-def456-789...
   loanId: LN00001
   newPhase: 2
   newStatus: pending
🔧 [approvalService.update] Starting approval update:
   📊 Final update payload: { step: 2, phase: 2, approval_status: 'pending', status: 'pending', ... }
   ✓ status field: pending
   ✓ approval_status field: pending
   ✓ phase field: 2
   ✓ step field: 2
✅ [approvalService.update] Approval successfully updated in database
✅ [DB UPDATE] Approval status successfully synced to Supabase database
   📊 Updated approval fields: ['step', 'phase', 'approval_status', 'status', 'loan_id', ...]
   ✓ Phase: 2
   ✓ Status: pending
```

#### ✅ Successful Loan Update:
```
🔄 [DB UPDATE] Updating loan in Supabase database:
   loanId: LN00001
   updates: { status: 'Need Approval' }
   organizationId: org-001
✅ [DB UPDATE] Loan successfully updated in Supabase database
   📝 Loan ID: LN00001
   📊 Updated fields: ['status']
   ✓ Status updated to: Need Approval
```

#### ❌ Database Error (Expected when offline):
```
❌ CRITICAL: Error syncing approval status to Supabase database:
   Approval ID: abc123-def456
   Loan ID: LN00001
   Organization ID: org-001
   Error message: Failed to fetch
   Error details: NetworkError...
🔴 Toast notification: "Failed to update approval status in database: Failed to fetch"
```

---

### 3. Check Supabase Database

1. **Open Supabase Dashboard:** https://app.supabase.com
2. **Navigate to:** Table Editor → `approvals` table
3. **Verify columns are updated:**
   - ✅ `status` column (NEW workflow)
   - ✅ `approval_status` column (OLD workflow)
   - ✅ `phase` column (NEW workflow)
   - ✅ `step` column (OLD workflow)
   - ✅ `updated_at` timestamp

**Example:**
```
| id          | step | approval_status | phase | status  | updated_at          |
|-------------|------|-----------------|-------|---------|---------------------|
| abc123-...  | 2    | pending         | 2     | pending | 2026-01-03 10:30:00 |
```

---

### 4. Test Scenarios

#### Scenario A: Move Loan Through Workflow
1. Go to **Loan Approval Workflow**
2. Select **Step 1: Auto-Assessment** tab
3. Click **Approve** on a loan
4. **Expected logs:**
   - ✅ "Updated approval record for loan..."
   - ✅ "[DB UPDATE] Updating approval status..."
   - ✅ "[approvalService.update] Starting approval update..."
   - ✅ "Approval successfully updated in database"

5. **Verify in Supabase:**
   - Phase changed from 1 → 2
   - Status = 'pending'
   - Loan status = 'Need Approval'

#### Scenario B: Manager Approval
1. Go to **Step 2: Manager Approval** tab
2. Click **Approve** on a loan
3. **Expected logs:**
   - ✅ Phase changes from 2 → 3
   - ✅ Status remains 'pending' (waiting for disbursement)
   - ✅ Loan status = 'Approved'

4. **Verify in Supabase:**
   - Phase = 3
   - Status = 'pending'
   - `approval_date` timestamp set

#### Scenario C: Disbursement
1. Go to **Step 3: Disbursement** tab
2. Click **Disburse** and select payment source
3. **Expected logs:**
   - ✅ Phase changes from 3 → 5
   - ✅ Status changes to 'approved'
   - ✅ Loan status = 'Disbursed'

4. **Verify in Supabase:**
   - Phase = 5
   - Status = 'approved'
   - Loan status = 'Disbursed'

#### Scenario D: Rejection
1. Click **Reject** on any loan
2. **Expected logs:**
   - ✅ Status changes to 'rejected'
   - ✅ `rejection_reason` field populated

3. **Verify in Supabase:**
   - Status = 'rejected'
   - `rejection_reason` contains user's input

---

### 5. Common Issues and Solutions

#### Issue: No console logs appearing
**Solution:**
- Make sure Console tab is open (F12)
- Clear console (🚫 icon) and try again
- Check if console filter is set to "All levels"

#### Issue: Logs show "Error syncing to Supabase"
**Possible Causes:**
1. **No internet connection** → Check network tab
2. **Organization ID not set** → Logs will show "Organization ID: undefined"
3. **Invalid approval ID** → Check "Approval ID: ..." in error log
4. **Database permissions (RLS)** → Check Supabase RLS policies

**Debug Steps:**
```javascript
// Run in browser console to check current user:
console.log('Current Org ID:', localStorage.getItem('current_organization'));
```

#### Issue: Status updates in UI but not in database
**Solution:**
1. Check console for error logs starting with "❌ CRITICAL:"
2. Look for network errors (Network tab in DevTools)
3. Verify Supabase project is active (not paused)
4. Check database table exists: `approvals` table

---

### 6. Debug Commands (Browser Console)

```javascript
// Check current organization
const org = JSON.parse(localStorage.getItem('current_organization') || '{}');
console.log('Organization:', org);

// Check Supabase connection
fetch('https://your-project.supabase.co/rest/v1/')
  .then(r => console.log('Supabase connected:', r.ok))
  .catch(e => console.error('Supabase error:', e));

// Force refresh approvals from database
window.location.reload();
```

---

### 7. Expected Database State

After approving a loan through all 3 steps, the final state should be:

**Loans Table:**
```sql
SELECT loan_number, status, approval_date, disbursement_date 
FROM loans 
WHERE loan_number = 'LN00001';

-- Expected result:
-- loan_number | status     | approval_date | disbursement_date
-- LN00001     | Disbursed  | 2026-01-03    | 2026-01-03
```

**Approvals Table:**
```sql
SELECT step, phase, approval_status, status, loan_id
FROM approvals 
WHERE loan_id = 'LN00001';

-- Expected result:
-- step | phase | approval_status | status   | loan_id
-- 5    | 5     | approved        | approved | LN00001
```

---

## 🎯 Key Indicators Everything Is Working

✅ **Console shows "[DB UPDATE]" messages**  
✅ **No "❌ CRITICAL" error messages**  
✅ **Toast notifications appear for errors only**  
✅ **Supabase table shows updated `status` and `approval_status`**  
✅ **Both `phase` and `step` columns match**  
✅ **Page refresh preserves loan status**  

---

## 📞 Still Having Issues?

Check these files for the implementation:
- `/contexts/DataContext.tsx` - Lines 2331-2430 (approval updates)
- `/services/supabaseDataService.ts` - Lines 1164-1240 (database operations)
- `/APPROVAL_STATUS_DB_UPDATE_COMPLETE.md` - Full documentation

---

**Last Updated:** January 3, 2026
