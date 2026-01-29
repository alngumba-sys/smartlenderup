# Staff Management System - Complete Setup Guide

## 🎯 Overview

Your SmartLenderUp platform now has a comprehensive staff management system that allows Managers to:
- Create staff accounts with customized permissions
- Control which tabs each staff member can access
- Set View, Edit, and Delete permissions for each tab
- Manage staff accounts (activate/deactivate)

Staff members can:
- Login with their phone number and password
- Only see and access tabs they have permission for
- Change their password on first login

## 📋 Prerequisites

Before setting up the staff management system, ensure you have:

1. ✅ A Supabase project (SmartlenderUp)
2. ✅ Access to the Supabase SQL Editor
3. ✅ An existing `organizations` table in your database
4. ✅ At least one organization record

## 🔧 Step 1: Database Setup

### 1.1 Connect to Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your **SmartlenderUp** project from the dashboard

### 1.2 Run the Migration

1. In the left sidebar, click on **SQL Editor**
2. Click **New query** button
3. Open the file `/database/migrations/create_staff_tables.sql` from your project
4. Copy the entire contents of the SQL file
5. Paste it into the SQL Editor
6. Click **Run** (or press `Ctrl/Cmd + Enter`)

You should see a success message indicating that the tables were created.

### 1.3 Verify Tables Were Created

1. In the left sidebar, click on **Table Editor**
2. You should now see two new tables:
   - ✅ **staff_users** - Stores staff account information
   - ✅ **staff_permissions** - Stores tab permissions

## 🚀 Step 2: Test the System

### 2.1 Login as Manager

1. Go to your SmartLenderUp platform (https://smartlenderup.netlify.app)
2. Click **Sign In** at the top
3. Login with your Manager/Organization credentials

### 2.2 Navigate to Staff Management

1. After logging in, click on **Admin** in the navigation menu
2. Select **Settings**
3. Click on the **Staff Management** tab

You should see an empty staff list with an "Add Staff Member" button.

### 2.3 Create Your First Staff Member

1. Click **Add Staff Member**
2. Fill in the form:
   - **Full Name**: Test User
   - **Phone Number**: +254712345678 (use a real format)
   - **Email** (optional): test@example.com
   - **Role**: Staff

3. Set permissions - for testing, enable:
   - ✅ Dashboard → View
   - ✅ Operations → Loans → View
   - ✅ Operations → Clients → View

4. Click **Create Staff Member**
5. You'll see a success message with the default password (last 4 digits: 5678)

### 2.4 Test Staff Login

1. **Logout** from the Manager account
2. On the login page, click **Staff Login** (at the bottom of the sign-in form)
3. Enter the staff credentials:
   - Phone Number: +254712345678
   - Password: 5678 (last 4 digits)
4. Click **Login as Staff**

### 2.5 Change Password (First Login)

1. You'll be prompted to change your password
2. Enter a new password (minimum 4 characters)
3. Confirm the new password
4. Click **Change Password & Login**

### 2.6 Verify Permission-Based Access

After logging in as staff, you should see:
- ✅ Only the Dashboard and Operations (with Loans and Clients) in the navigation
- ❌ Other tabs should NOT be visible
- ❌ Edit/Delete buttons should be disabled (if you didn't grant those permissions)

## 📚 Step 3: Understanding the System

### Permission Levels

Each tab can have three permission levels:

| Permission | Description |
|-----------|-------------|
| **View** | Staff can see the tab and view data |
| **Edit** | Staff can modify existing data and create new records |
| **Delete** | Staff can remove records |

### Permission Logic

- If **View** is disabled, Edit and Delete are automatically disabled
- If **Edit** or **Delete** is enabled, View is automatically enabled
- Managers always have full access to all tabs (permissions don't apply)

### Available Tabs

The system supports permissions for these tabs:

**Operations**
- `operations_loans` - Operations → Loans
- `operations_products` - Operations → Loan Products
- `operations_clients` - Operations → Clients
- `operations_groups` - Operations → Groups

**Accounting**
- `accounting_chart` - Accounting → Chart of Accounts
- `accounting_journal` - Accounting → Journal Entries
- `accounting_trial` - Accounting → Trial Balance

**Reports**
- `reports_par` - Reports → PAR Report
- `reports_collections` - Reports → Collections Report
- `reports_management` - Reports → Management Report

**Other**
- `dashboard` - Dashboard
- `payroll` - Payroll
- `ai_tools` - AI Tools
- `settings` - Settings

### Staff Roles

When creating staff, you can assign roles:

- **Staff** - General staff member
- **Loan Officer** - Focuses on loan processing
- **Accountant** - Focuses on accounting tasks
- **Collector** - Focuses on collections

Currently, roles are for organizational purposes and don't automatically grant permissions. You must manually set permissions for each staff member.

## 🔐 Security Considerations

### Current Implementation

⚠️ **For Demo/Testing Only**
- Passwords are stored as plain text
- Basic validation is implemented
- Session management is localStorage-based

### For Production Deployment

Before deploying to production with real staff, implement:

1. **Password Hashing**
   - Use bcrypt or similar for password hashing
   - Never store plain text passwords

2. **Email Verification**
   - Verify staff email addresses
   - Send confirmation emails

3. **Password Reset Flow**
   - Allow staff to reset forgotten passwords
   - Implement secure token-based reset

4. **Session Management**
   - Use secure HTTP-only cookies
   - Implement session timeouts
   - Add CSRF protection

5. **Audit Logging**
   - Log all permission changes
   - Track staff actions
   - Monitor suspicious activity

6. **Rate Limiting**
   - Prevent brute force login attempts
   - Limit API requests per user

## 🛠️ Common Use Cases

### Use Case 1: Loan Officer with Limited Access

**Permissions:**
- Dashboard: View
- Operations → Loans: View, Edit
- Operations → Clients: View, Edit
- Reports → Collections: View

**Result:** Can process loans and manage clients, view reports, but cannot delete records or access accounting.

### Use Case 2: Accountant

**Permissions:**
- Dashboard: View
- Accounting → Chart of Accounts: View
- Accounting → Journal Entries: View, Edit
- Accounting → Trial Balance: View
- Reports → Management: View

**Result:** Full access to accounting features, read-only access to reports.

### Use Case 3: Data Entry Clerk

**Permissions:**
- Dashboard: View
- Operations → Clients: View, Edit
- Operations → Groups: View, Edit

**Result:** Can only add and update client and group information.

## 🔄 Managing Staff

### Edit Staff Permissions

1. Go to **Settings** → **Staff Management**
2. Find the staff member in the list
3. Click the **Edit** (pencil) icon
4. Modify their permissions
5. Click **Update Permissions**
6. Staff member will need to logout and login again to see changes

### Deactivate Staff

1. Go to **Settings** → **Staff Management**
2. Find the staff member in the list
3. Click the **Trash** icon
4. Confirm deactivation
5. Staff member can no longer login

**Note:** Deactivating a staff member doesn't delete their data. Their historical actions remain in the system for audit purposes.

## 🐛 Troubleshooting

### Database Not Reachable Error

**Problem:** "Database not reachable. Check your internet" when creating staff

**Solutions:**
1. Check your internet connection
2. Verify Supabase project is online
3. Check Supabase dashboard for any issues
4. Verify the `organizations` table exists

### Staff Login Fails

**Problem:** "Invalid phone number or password"

**Solutions:**
1. Verify phone number format matches what was entered (include country code)
2. On first login, use last 4 digits of phone number
3. After first login, use the password you set
4. Check if staff account is active (not deactivated)

### Navigation Tabs Not Showing

**Problem:** Staff can't see expected tabs

**Solutions:**
1. Verify Manager granted View permission for those tabs
2. Have staff logout and login again
3. Check browser console for errors
4. Verify permissions in database: `SELECT * FROM staff_permissions WHERE staff_user_id = 'USER_ID'`

### Can't Create Staff

**Problem:** Error when clicking "Create Staff Member"

**Solutions:**
1. Ensure all required fields are filled (Full Name, Phone Number)
2. Use valid phone number format (+254712345678)
3. Check browser console for detailed error
4. Verify you're logged in as Manager
5. Check Supabase connection

## 📊 Database Queries

Useful SQL queries for managing staff:

### View all staff members
```sql
SELECT * FROM staff_users WHERE organization_id = 'YOUR_ORG_ID';
```

### View staff permissions
```sql
SELECT 
  su.full_name, 
  su.phone_number, 
  sp.tab_name, 
  sp.can_view, 
  sp.can_edit, 
  sp.can_delete
FROM staff_users su
LEFT JOIN staff_permissions sp ON su.id = sp.staff_user_id
WHERE su.organization_id = 'YOUR_ORG_ID'
ORDER BY su.full_name, sp.tab_name;
```

### Reset staff password
```sql
UPDATE staff_users 
SET password_hash = '1234', is_first_login = true 
WHERE id = 'STAFF_USER_ID';
```

### Reactivate staff
```sql
UPDATE staff_users 
SET is_active = true 
WHERE id = 'STAFF_USER_ID';
```

## 📝 Best Practices

1. **Principle of Least Privilege**
   - Only grant permissions necessary for the job
   - Regularly review and remove unnecessary access

2. **Use Descriptive Names**
   - Use full names for easy identification
   - Keep phone numbers consistent with country codes

3. **Document Permission Sets**
   - Create standard permission templates for common roles
   - Document why certain permissions were granted

4. **Regular Audits**
   - Review staff permissions quarterly
   - Remove access for staff who change roles
   - Deactivate accounts for staff who leave

5. **Communication**
   - Inform staff about their access levels
   - Provide clear instructions for first login
   - Share password securely (not via email)

## 📞 Support

For questions or issues:
- **Email:** support@smartlenderup.com
- **Documentation:** `/docs/STAFF_MANAGEMENT_GUIDE.md`
- **Database Schema:** `/database/migrations/README.md`

## ✅ Checklist

Use this checklist to ensure proper setup:

- [ ] Database tables created in Supabase
- [ ] Tables verified in Table Editor
- [ ] Successfully created first test staff member
- [ ] Tested staff login flow
- [ ] Verified password change on first login
- [ ] Confirmed permission-based navigation works
- [ ] Tested edit permissions functionality
- [ ] Tested staff deactivation
- [ ] Read security considerations for production
- [ ] Documented staff permission templates

## 🎉 Success!

If you've completed all the steps above, your staff management system is fully functional! Managers can now create staff accounts with granular permissions, and staff members can login with their own credentials and access only the features they're authorized to use.

---

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Platform:** SmartLenderUp by BV Funguo Ltd
