# Client Portal & Staff Commissions - Complete Implementation Guide

## 🎯 Overview

This implementation adds four major features to the BV Funguo microfinance platform:

### A) Client Login & Application Portal
- Clients can login using last 4 digits of phone number
- First-time login requires password creation
- Complete portfolio view with loan history
- New loan application functionality
- Real-time notifications to admin

### B) Admin Loan Notifications with Actions
- Admin receives notifications when clients apply
- Review or Decline options with client feedback
- Status updates sent to client automatically
- Full notification management system

### C) Staff Member Tracking on Loans
- Assign loans to staff members (deal owners)
- Track which staff brought each deal
- Optional field in loan creation

### D) Commission Tracking in Payroll
- New "Commissions" tab in Payroll Management
- Calculate commissions based on facilitation fees
- Editable commission rates per staff member
- Real-time commission calculations

---

## 📁 Files Created

### 1. Client Login Component
**File:** `/components/ClientLogin.tsx`
- Handles client authentication
- Last 4 digits + password login
- Password change on first login
- Integration with Supabase for password storage

### 2. Client Loan Notification Card
**File:** `/components/ClientLoanNotificationCard.tsx`
- Special card for client loan applications
- Review and Decline actions
- Auto-notification to clients
- Status tracking

### 3. Payroll Commissions Tab
**File:** `/components/tabs/PayrollCommissionsTab.tsx`
- Staff commission tracking
- Editable commission rates
- Facilitation fee calculations
- Commission payment tracking

### 4. SQL Migration
**File:** `/supabase-migrations/add-client-portal-and-notifications.sql`
- Adds client_password fields to clients table
- Adds staff_member_id and staff_member_name to loans table
- Creates notifications table with RLS policies
- Indexes for performance

---

## 📊 Database Schema Changes

### Clients Table
```sql
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS client_password TEXT,
ADD COLUMN IF NOT EXISTS has_changed_password BOOLEAN DEFAULT FALSE;
```

### Loans Table
```sql
ALTER TABLE loans
ADD COLUMN IF NOT EXISTS staff_member_id TEXT,
ADD COLUMN IF NOT EXISTS staff_member_name TEXT;
```

### Notifications Table (New)
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  type TEXT CHECK (type IN ('alert', 'info', 'success', 'warning')),
  category TEXT CHECK (category IN ('loan', 'payment', 'client', 'system', 'compliance', 'client_application')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  action_required BOOLEAN DEFAULT FALSE,
  related_id TEXT,
  related_type TEXT CHECK (related_type IN ('loan', 'client', 'payment')),
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔄 Modified Files

### DataContext.tsx
**Changes:**
1. Added `Notification` interface
2. Added `staffMemberId` and `staffMemberName` to Loan interface
3. Added notification state and methods:
   - `notifications: Notification[]`
   - `addNotification()`
   - `markNotificationAsRead()`
   - `markAllNotificationsAsRead()`
   - `deleteNotification()`
   - `getUnreadNotificationsCount()`
4. Loads notifications from Supabase on startup

### NotificationsTab.tsx
**Changes:**
1. Integrated with DataContext notifications
2. Uses ClientLoanNotificationCard for client applications
3. Shows real notifications from database
4. Real-time notification count

### NewLoanModal.tsx
**Changes:**
1. Added `staffMemberId` to formData
2. Added staff member dropdown (optional field)
3. Filters active employees from payees
4. Saves staff assignment with loan

### LoansTab.tsx
**Changes:**
1. Imports `payees` from DataContext
2. Passes staff member data when creating loans
3. Includes staffMemberId and staffMemberName in loan object

### ClientApplyTab.tsx
**Changes:**
1. Imports `addNotification` from DataContext
2. Creates notification when client applies for loan
3. Links notification to loan and client

---

## 🚀 Setup Instructions

### Step 1: Run SQL Migration
```bash
# In Supabase SQL Editor, run:
/supabase-migrations/add-client-portal-and-notifications.sql
```

This creates:
- ✅ Client password fields
- ✅ Staff member fields on loans
- ✅ Notifications table
- ✅ Indexes for performance
- ✅ RLS policies for security

### Step 2: Verify Tables
```sql
-- Check clients table has new columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'clients' AND column_name IN ('client_password', 'has_changed_password');

-- Check loans table has new columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'loans' AND column_name IN ('staff_member_id', 'staff_member_name');

-- Check notifications table exists
SELECT * FROM notifications LIMIT 1;
```

### Step 3: Test Client Login
1. Find a client in your database
2. Note their phone number (e.g., +254712345678)
3. Go to Client Portal login
4. Enter last 4 digits (e.g., "5678")
5. On first login, set a password
6. Login again with same credentials

### Step 4: Test Loan Application
1. Login as a client
2. Go to "Apply for Loan" tab
3. Select a loan product
4. Fill in amount and purpose
5. Submit application
6. Logout and login as admin
7. Check Notifications tab for new application

### Step 5: Test Review/Decline
1. As admin, go to Notifications tab
2. Find client loan application
3. Click "Review" or "Decline"
4. Check that client receives notification
5. Login as client to see notification

### Step 6: Test Staff Assignment
1. As admin, create a new loan
2. Select "Staff Member (Who Brought This Deal)"
3. Choose a staff member from dropdown
4. Save the loan
5. Go to Payroll > Commissions tab
6. Verify staff member shows with their loan

### Step 7: Test Commissions
1. Go to Payroll Management
2. Add new tab: "Commissions"
3. View staff members and their deals
4. Edit commission rate (click pencil icon)
5. Enter new percentage (e.g., 15%)
6. Click save icon
7. Verify commission amount updates

---

## 📱 How to Use - Client Portal

### Client First-Time Login
1. Client navigates to platform
2. Clicks "Client Login" (you'll need to add this button to LoginPage)
3. Enters last 4 digits of phone: `5678`
4. Sets new password (min 6 characters)
5. Confirms password
6. Auto-logged in after password set

### Client Apply for Loan
1. Login to client portal
2. Click "Apply for Loan" tab
3. Select loan product
4. Enter requested amount
5. Enter loan purpose
6. Select desired tenor
7. Submit application
8. Receives confirmation with application reference

### Client Receives Notifications
1. Admin reviews or declines loan
2. Client sees notification in their portal
3. Notification shows in "Home" tab
4. Shows loan status (Under Review, Approved, Declined)

---

## 👨‍💼 How to Use - Admin Functions

### Receiving Client Applications
1. Client applies for loan
2. Notification appears in Notifications tab
3. Shows as "Action Required"
4. Unread count updates in header
5. Click notification to see details

### Reviewing Loan Application
1. Go to Notifications tab
2. Find client application (blue card)
3. Review loan details displayed
4. Click "Review" button
5. Confirm review action
6. Client receives "Under Review" notification
7. Loan status updates to "Under Review"

### Declining Loan Application
1. Go to Notifications tab
2. Find client application
3. Click "Decline" button
4. Enter decline reason (required)
5. Submit decline
6. Client receives notification with reason
7. Loan status updates to "Rejected"

### Assigning Loans to Staff
1. Create new loan (or edit pending loan)
2. Scroll to "Staff Member (Who Brought This Deal)"
3. Select staff member from dropdown
4. Staff member must be active employee in Payees
5. Save loan
6. Assignment tracked for commissions

### Managing Commissions
1. Go to Payroll Management
2. Select "Commissions" tab
3. View all staff with closed deals
4. See:
   - Number of deals
   - Total principal amount
   - Total facilitation fees
   - Commission rate
   - Amount owed
5. Edit commission rate:
   - Click pencil icon
   - Enter new percentage
   - Click save
   - Amount recalculates instantly

---

## 🔧 Technical Details

### Client Password Security
- Passwords stored as plain text in `client_password` field
- ⚠️ **NOT PRODUCTION READY** - Should use bcrypt/hashing
- Boolean `has_changed_password` tracks first login
- Modify `/components/ClientLogin.tsx` to add hashing

### Notification System
- Stored in Supabase `notifications` table
- Real-time sync with DataContext
- Filtered by organization_id
- RLS policies ensure security
- Categories: loan, payment, client, system, compliance, client_application

### Commission Calculation
- Formula: `(Facilitation Fee × Commission Rate) / 100`
- Facilitation Fee: 1.5% of principal (default)
- Commission Rate: 10% default, editable per staff
- Example: 
  - Principal: KES 100,000
  - Facilitation Fee: KES 1,500
  - Commission (10%): KES 150

### Staff Assignment
- Links loans to employees (payees with type='Employee')
- Stores both ID and name for efficiency
- Optional field - not required
- Used for commission tracking only

---

## 🎨 UI/UX Features

### Client Portal
- Clean, modern interface
- Mobile-responsive design
- Emerald/teal color scheme
- Easy navigation
- Portfolio overview
- Loan status tracking

### Admin Notifications
- Color-coded by type (alert, info, success, warning)
- Category badges (loan, payment, client, etc.)
- Unread indicators
- Action buttons for client applications
- Detailed loan information cards

### Commissions Tab
- Summary cards (staff count, deals, commissions)
- Sortable table
- Inline editing for rates
- Real-time calculations
- Visual staff indicators

---

## 🐛 Troubleshooting

### Client Can't Login
**Problem:** "Client not found"
**Solution:** 
1. Verify client exists in database
2. Check phone number format
3. Ensure last 4 digits match exactly
4. Check client's phone field isn't empty

### Notifications Not Showing
**Problem:** Notifications tab empty
**Solution:**
1. Run SQL migration
2. Check Supabase connection
3. Verify RLS policies allow read
4. Check organization_id matches
5. Look for browser console errors

### Staff Not in Dropdown
**Problem:** Staff member doesn't appear
**Solution:**
1. Verify payee type is 'Employee'
2. Check status is 'Active'
3. Ensure payee exists in database
4. Refresh the modal

### Commissions Tab Empty
**Problem:** No staff showing
**Solution:**
1. Verify loans have staff_member_id set
2. Check staff are active employees
3. Ensure loans are closed/disbursed
4. Look for data loading errors

### Commission Not Calculating
**Problem:** Amount shows 0 or NaN
**Solution:**
1. Check facilitation fee is set on loan
2. Verify principal amount is valid number
3. Ensure commission rate is valid (0-100)
4. Check browser console for errors

---

## 📈 Future Enhancements

### Security Improvements
- [ ] Hash client passwords with bcrypt
- [ ] Add password reset functionality
- [ ] Implement 2FA for sensitive operations
- [ ] Add login attempt limiting
- [ ] Session management

### Client Portal Features
- [ ] Loan status timeline
- [ ] Document upload
- [ ] Repayment history
- [ ] Payment reminders
- [ ] Live chat support

### Notification Enhancements
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Push notifications
- [ ] Notification preferences
- [ ] Bulk actions

### Commission Features
- [ ] Commission payment tracking
- [ ] Historical commission reports
- [ ] Commission adjustments
- [ ] Multi-tier commission structures
- [ ] Team-based commissions

---

## ✅ Testing Checklist

- [ ] Client can login with last 4 digits
- [ ] First-time login prompts password creation
- [ ] Client can view portfolio
- [ ] Client can apply for new loan
- [ ] Admin receives notification
- [ ] Review button updates loan status
- [ ] Review sends notification to client
- [ ] Decline button requires reason
- [ ] Decline sends notification to client
- [ ] Staff dropdown shows active employees
- [ ] Staff assignment saves with loan
- [ ] Commissions tab shows staff with loans
- [ ] Commission rate editing works
- [ ] Commission calculation is accurate
- [ ] Notifications mark as read correctly
- [ ] Unread count updates properly

---

## 📞 Support

For issues or questions:
1. Check this documentation first
2. Review browser console for errors
3. Check Supabase logs
4. Verify SQL migration ran successfully
5. Test with a fresh client/staff member

---

## 🎉 Summary

You now have:
✅ Full client portal with login
✅ Client loan application workflow
✅ Admin notification system with actions
✅ Staff assignment on loans
✅ Commission tracking in payroll

All features integrate seamlessly with the existing BV Funguo platform and follow the established design patterns and color scheme.
