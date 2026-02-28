# Notification System Testing Guide

## ✅ Database Migration Complete

The database has been successfully migrated with:
- ✅ `notifications` table created with UUID types
- ✅ `client_password` and `has_changed_password` fields added to `clients` table
- ✅ `staff_member_id` and `staff_member_name` fields added to `loans` table
- ✅ Row Level Security (RLS) policies configured
- ✅ Indexes created for performance

## Database Schema

```sql
-- Notifications table structure:
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  action_required BOOLEAN DEFAULT FALSE,
  related_id TEXT,
  related_type TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## TypeScript Updates

### ✅ Updated `addNotification` function
- Now uses database-generated UUIDs
- Properly maps snake_case database fields to camelCase frontend fields
- Handles `action_required`, `related_id`, `related_type` field mapping

### ✅ Updated notification loading
- Maps database fields during initial load
- Converts snake_case to camelCase for consistency

## Testing the Features

### 1. Client Login & Loan Application

**Test Steps:**
1. Go to Admin → Clients tab
2. Select a client and set their password in the "Client Portal" section
3. Note the last 4 digits of their phone number
4. Click "Client Login" in the top navigation
5. Enter phone number (last 4 digits) and password
6. Navigate to "Apply for Loan" tab
7. Fill out loan application form
8. Submit application

**Expected Result:**
- ✅ Loan created with status "Pending"
- ✅ Notification created in admin view with category "client_application"
- ✅ Notification shows "New Loan Application" from client

### 2. Admin Notification System

**Test Steps:**
1. Click the bell icon (🔔) in admin navigation
2. Review notifications list
3. Click on a client loan application notification
4. Click "Review" or "Decline"
5. Add optional notes
6. Submit action

**Expected Result:**
- ✅ Loan status updates to "Under Review" or "Declined"
- ✅ Notification sent back to client
- ✅ Original notification marked as read
- ✅ Toast confirmation shown

### 3. Staff Assignment

**Test Steps:**
1. Go to Loans tab
2. Click "+ New Loan" or edit existing loan
3. Look for "Staff Member" field in the form
4. Select a staff member from dropdown
5. Save loan

**Expected Result:**
- ✅ Loan saved with staff_member_id and staff_member_name
- ✅ Staff assignment visible in loan details

### 4. Commission Tracking

**Test Steps:**
1. Go to Payroll → Commissions tab
2. Select a staff member
3. Review their assigned loans
4. Check commission calculations

**Expected Result:**
- ✅ Shows loans assigned to selected staff member
- ✅ Calculates commissions based on loan amounts
- ✅ Displays total commission earned

## Verification Queries

Run these in Supabase SQL Editor to verify data:

```sql
-- Check notifications table
SELECT id, type, category, title, read, action_required, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- Check client passwords
SELECT id, name, client_password, has_changed_password 
FROM clients 
WHERE client_password IS NOT NULL;

-- Check staff assignments on loans
SELECT loan_number, client_name, staff_member_name, approval_status 
FROM loans 
WHERE staff_member_id IS NOT NULL;

-- Count notifications by category
SELECT category, COUNT(*) as count 
FROM notifications 
GROUP BY category;
```

## Common Issues & Solutions

### Issue: "Column does not exist" error
**Solution:** Re-run the migration SQL file

### Issue: Notifications not showing
**Solution:** Check browser console for errors, verify organization_id matches

### Issue: Client login fails
**Solution:** Ensure client has `client_password` set and `has_changed_password` is false for first login

### Issue: UUID type mismatch
**Solution:** This has been fixed - notifications now use UUID for id and organization_id

## Next Steps

After testing, you may want to:

1. **Tighten RLS Policies**: Currently set to permissive (true), can be restricted based on user roles
2. **Add Email Notifications**: Integrate Supabase Edge Functions for email alerts
3. **Add Notification Preferences**: Let users configure which notifications they receive
4. **Add Push Notifications**: Integrate web push for real-time alerts
5. **Add Notification Filtering**: Filter by category, read/unread status
6. **Add Bulk Actions**: Mark multiple notifications as read/delete

## Architecture Notes

- **Frontend**: React components with TypeScript interfaces
- **Backend**: Supabase PostgreSQL database
- **Authentication**: Client login uses last 4 digits of phone + password
- **State Management**: React Context API (DataContext.tsx)
- **Field Mapping**: Database uses snake_case, frontend uses camelCase
- **UUID Generation**: Database auto-generates UUIDs using `gen_random_uuid()`
