# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 1. Database Migration Issues

#### Error: "Column 'type' does not exist"
**Cause:** Migration tried to add constraint before creating column  
**Solution:** Run the latest migration file:
```sql
-- In Supabase SQL Editor:
/supabase-migrations/add-client-portal-fixed-types.sql
```

#### Error: "Type mismatch: text vs uuid"
**Cause:** organization_id field type doesn't match organizations table  
**Solution:** ✅ Already fixed in latest migration (uses UUID)

#### Error: "Table already exists"
**Cause:** Migration was run multiple times  
**Solution:** Drop and recreate:
```sql
DROP TABLE IF EXISTS notifications CASCADE;
-- Then run the migration again
```

---

### 2. Client Login Issues

#### "Invalid credentials" error
**Possible Causes:**
1. Password not set for client
2. Wrong last 4 digits of phone number
3. Client from different organization

**Solution:**
```typescript
// Check in Admin → Clients:
// 1. Find the client
// 2. Scroll to "Client Portal" section
// 3. Verify phone number (last 4 digits must match exactly)
// 4. Set password again if needed
```

**Debug Query:**
```sql
-- Check client data
SELECT id, name, phone, 
  CASE WHEN client_password IS NOT NULL 
    THEN 'Password Set' 
    ELSE 'No Password' 
  END as password_status,
  has_changed_password
FROM clients
WHERE phone LIKE '%1234'; -- Replace 1234 with last 4 digits
```

#### Client login button not visible
**Solution:** Check that you're on the Staff Portal view (not already logged in as client)

---

### 3. Notification Issues

#### Notifications not showing up
**Possible Causes:**
1. Wrong organization_id filter
2. Notifications table doesn't exist
3. RLS policy blocking access

**Debug Steps:**
```sql
-- 1. Check if table exists
SELECT COUNT(*) FROM notifications;

-- 2. Check raw data (bypasses RLS)
SELECT * FROM notifications LIMIT 10;

-- 3. Check organization_id matches
SELECT DISTINCT organization_id FROM notifications;
SELECT organization_id FROM users WHERE id = auth.uid();
```

**Solution:**
```typescript
// In browser console:
console.log('Current User Org:', currentUser?.organizationId);
console.log('Notifications:', notifications);

// Check if notifications are being filtered out
const unfiltered = await supabase
  .from('notifications')
  .select('*')
  .limit(10);
console.log('All notifications:', unfiltered);
```

#### Notification created but not visible in UI
**Cause:** Field mapping issue (snake_case vs camelCase)  
**Solution:** ✅ Already fixed - check DataContext.tsx loads notifications correctly

**Verify:**
```typescript
// Should map action_required → actionRequired
// Should map related_id → relatedId
// Should map created_by → createdBy
```

#### "Action Required" badge not showing
**Check:**
```sql
SELECT id, title, action_required, read 
FROM notifications 
WHERE action_required = TRUE;
```

---

### 4. Staff Assignment Issues

#### Staff dropdown is empty
**Possible Causes:**
1. No staff members exist
2. Staff members in different organization
3. All staff are archived

**Solution:**
```typescript
// Check in Settings → Staff Management
// 1. Verify staff members exist
// 2. Check they're active (not archived)
// 3. Verify organization matches

// Debug query:
SELECT id, name, role, status, organization_id 
FROM staff 
WHERE status = 'active';
```

#### Staff assignment not saving
**Debug:**
```sql
-- Check if fields exist in loans table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'loans' 
AND column_name IN ('staff_member_id', 'staff_member_name');

-- Check saved data
SELECT loan_number, client_name, staff_member_id, staff_member_name 
FROM loans 
WHERE staff_member_id IS NOT NULL;
```

---

### 5. Commission Tracking Issues

#### Commissions showing as 0
**Possible Causes:**
1. No loans assigned to staff member
2. Commission rate is 0
3. Loans are in wrong status

**Debug:**
```sql
-- Check staff assignments
SELECT 
  staff_member_id,
  staff_member_name,
  COUNT(*) as loan_count,
  SUM(amount) as total_amount
FROM loans
WHERE staff_member_id IS NOT NULL
GROUP BY staff_member_id, staff_member_name;

-- Check specific staff member
SELECT loan_number, amount, approval_status, disbursement_status
FROM loans
WHERE staff_member_id = 'STF001'; -- Replace with actual ID
```

**Solution:**
```typescript
// In PayrollCommissionsTab:
// 1. Verify staff member is selected
// 2. Check commission rate (default should be 2)
// 3. Verify loans exist for that staff member
// 4. Check loan statuses (may be filtered)
```

#### Commission calculation seems wrong
**Formula:** `Commission = Loan Amount × Commission Rate / 100`

**Example:**
- Loan Amount: 100,000
- Commission Rate: 2%
- Expected: 100,000 × 2 / 100 = 2,000

**Debug in console:**
```javascript
const testCommission = (amount, rate) => {
  const result = (amount * rate) / 100;
  console.log(`Amount: ${amount}, Rate: ${rate}%, Commission: ${result}`);
  return result;
};

testCommission(100000, 2); // Should output: 2000
```

---

### 6. Client Loan Application Issues

#### Submit button not working
**Check browser console for errors:**
```javascript
// Common issues:
// 1. Missing required fields
// 2. Invalid amount (negative or 0)
// 3. No loan product selected
// 4. Supabase connection error
```

**Debug:**
```typescript
// In ClientApplyTab.tsx, check validation:
if (!selectedProduct) {
  console.error('No product selected');
}
if (!requestedAmount || parseFloat(requestedAmount) <= 0) {
  console.error('Invalid amount');
}
```

#### Loan created but status not "Pending"
**Check:**
```sql
SELECT loan_number, approval_status, client_name 
FROM loans 
WHERE client_id = 'CL001' -- Replace with actual client ID
ORDER BY created_at DESC;
```

**Expected:** `approval_status = 'Pending'`

#### Admin notification not created
**Debug:**
```typescript
// Check if addNotification was called
console.log('Creating notification...');
await addNotification({
  type: 'info',
  category: 'client_application',
  title: 'New Loan Application',
  message: `${clientName} applied for ${amount}`,
  actionRequired: true,
  relatedId: loanId,
  relatedType: 'loan',
  createdBy: clientId,
  read: false
});
console.log('Notification created');

// Check Supabase:
SELECT * FROM notifications 
WHERE category = 'client_application' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

### 7. Review/Decline Actions

#### Review/Decline modal not opening
**Check:**
```typescript
// In ClientLoanNotificationCard.tsx:
// 1. Verify showModal state
// 2. Check if action is set
// 3. Look for console errors
```

#### Loan status not updating
**Debug:**
```sql
-- Check if loan exists
SELECT * FROM loans WHERE loan_number = 'LN001'; -- Replace

-- Check update query
UPDATE loans 
SET approval_status = 'Under Review'
WHERE loan_number = 'LN001'; -- Should affect 1 row

-- Verify change
SELECT loan_number, approval_status FROM loans 
WHERE loan_number = 'LN001';
```

**Common Issue:** Using `id` instead of `loan_number`
```typescript
// ❌ WRONG (id expects UUID)
await supabase
  .from('loans')
  .update({ approval_status: 'Under Review' })
  .eq('id', loanId);

// ✅ CORRECT (use loan_number)
await supabase
  .from('loans')
  .update({ approval_status: 'Under Review' })
  .eq('loan_number', loanNumber);
```

---

### 8. Browser Console Errors

#### "Cannot read property of undefined"
**Likely Cause:** Data not loaded yet

**Solution:**
```typescript
// Add null checks:
if (!currentUser) return <div>Loading...</div>;
if (!notifications) return <div>Loading notifications...</div>;

// Use optional chaining:
const orgId = currentUser?.organizationId;
const count = notifications?.length ?? 0;
```

#### "Network request failed"
**Possible Causes:**
1. Supabase connection issue
2. Internet offline
3. Wrong Supabase URL/key

**Debug:**
```typescript
// Test Supabase connection:
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
      
    if (error) throw error;
    console.log('✅ Supabase connected');
  } catch (err) {
    console.error('❌ Supabase error:', err);
  }
};

testConnection();
```

#### "Permission denied" or RLS policy error
**Solution:**
```sql
-- Temporarily disable RLS for testing (NOT in production!)
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Check if issue resolves
-- If yes, RLS policy is the problem

-- Re-enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Fix policy:
DROP POLICY IF EXISTS "Users can view their organization's notifications" 
  ON notifications;

CREATE POLICY "Allow all reads for now" 
  ON notifications FOR SELECT 
  USING (true); -- Permissive for testing
```

---

### 9. Data Not Syncing

#### Changes in UI don't appear in Supabase
**Check:**
```typescript
// 1. Verify Supabase write succeeds
const { data, error } = await supabase
  .from('notifications')
  .insert([notification]);

if (error) {
  console.error('❌ Supabase error:', error);
  // Check error.message for details
}

// 2. Verify data exists
const { data: check } = await supabase
  .from('notifications')
  .select('*')
  .eq('id', notificationId)
  .single();

console.log('Saved notification:', check);
```

#### Changes in Supabase don't appear in UI
**Cause:** Local state not refreshed

**Solution:**
```typescript
// Force refresh:
const refreshData = async () => {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
    
  setNotifications(data);
};

// Call after major operations
await refreshData();
```

---

### 10. Performance Issues

#### Slow notification loading
**Check:**
```sql
-- Verify indexes exist
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'notifications';

-- Should see:
-- idx_notifications_org_id
-- idx_notifications_read
-- idx_notifications_category
-- idx_notifications_created_at
```

**Optimize query:**
```typescript
// Load only recent notifications initially
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('organization_id', orgId)
  .order('created_at', { ascending: false })
  .limit(50); // Don't load all at once
```

#### Large number of notifications slowing down app
**Solution:** Implement pagination
```typescript
const [page, setPage] = useState(0);
const pageSize = 20;

const loadPage = async (pageNum: number) => {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);
    
  return data;
};
```

---

## Quick Diagnostic Commands

### Check All Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'users', 
  'organizations', 
  'clients', 
  'loans', 
  'notifications'
);
```

### Check Notification System Health
```sql
-- Notifications exist?
SELECT COUNT(*) as total_notifications FROM notifications;

-- Recent notifications
SELECT 
  category,
  COUNT(*) as count,
  MAX(created_at) as most_recent
FROM notifications
GROUP BY category;

-- Unread notifications
SELECT COUNT(*) as unread_count 
FROM notifications 
WHERE read = FALSE;

-- Action required notifications
SELECT COUNT(*) as action_required_count 
FROM notifications 
WHERE action_required = TRUE AND read = FALSE;
```

### Check Staff Assignments
```sql
-- Total assignments
SELECT 
  COUNT(*) as assigned_loans,
  COUNT(DISTINCT staff_member_id) as unique_staff
FROM loans
WHERE staff_member_id IS NOT NULL;

-- Breakdown by staff
SELECT 
  staff_member_id,
  staff_member_name,
  COUNT(*) as loan_count,
  SUM(amount) as total_amount
FROM loans
WHERE staff_member_id IS NOT NULL
GROUP BY staff_member_id, staff_member_name
ORDER BY loan_count DESC;
```

### Check Client Portal Setup
```sql
-- How many clients have passwords?
SELECT 
  COUNT(*) FILTER (WHERE client_password IS NOT NULL) as with_password,
  COUNT(*) FILTER (WHERE client_password IS NULL) as without_password,
  COUNT(*) as total
FROM clients;

-- Clients ready for portal
SELECT id, name, phone, has_changed_password
FROM clients
WHERE client_password IS NOT NULL
ORDER BY name;
```

---

## Browser DevTools Tips

### Check Local State
```javascript
// In browser console:

// Current user
window.currentUser

// All notifications
window.notifications

// All loans
window.loans

// Supabase client
window.supabase
```

### Monitor Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "supabase"
4. Look for:
   - Status codes (200 = success, 4xx = error)
   - Request payload
   - Response data

### Check Console Logs
Look for:
- ✅ Success messages (green)
- ⚠️ Warnings (yellow)
- ❌ Errors (red)
- 🔔 Notification-specific logs

---

## Getting Help

If issues persist:

1. **Check browser console** for error messages
2. **Check Supabase logs** in dashboard
3. **Run diagnostic SQL queries** above
4. **Check the implementation files:**
   - `/IMPLEMENTATION_SUMMARY.md`
   - `/QUICK_START_GUIDE.md`
   - `/SYSTEM_ARCHITECTURE.md`

5. **Verify migration:**
   ```sql
   -- Check notification table structure
   \d notifications
   
   -- Check if all columns exist
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'notifications';
   ```

---

**Most Common Issues:**
1. ✅ UUID type mismatch - FIXED in latest migration
2. ✅ Field mapping (snake_case vs camelCase) - FIXED in DataContext
3. ⚠️ Client password not set - Set in Admin UI
4. ⚠️ Wrong organization_id - Verify user's organization

**System Status: Operational** 🟢
