# Staff Management User Guide

## Overview

The Staff Management system allows Managers to create staff accounts with customized permission levels. Each staff member can only access the tabs and features that the Manager has explicitly granted them permission to view, edit, or delete.

## For Managers

### Creating a New Staff Member

1. **Navigate to Staff Management**
   - Click on **Admin** in the navigation menu
   - Select **Settings**
   - Click on the **Staff Management** tab

2. **Click "Add Staff Member"**
   - A modal will open with a form

3. **Fill in Basic Information**
   - **Full Name**: Enter the staff member's full name
   - **Phone Number**: Enter their phone number (e.g., +254712345678)
     - ⚠️ The last 4 digits will be their default password
   - **Email** (optional): Enter their email address
   - **Role**: Select their role:
     - Staff (general staff member)
     - Loan Officer (focuses on loan processing)
     - Accountant (focuses on accounting tasks)
     - Collector (focuses on collections)

4. **Set Tab Permissions**
   - For each tab, you can grant three levels of access:
     - **View**: Staff can see the tab and its content
     - **Edit**: Staff can modify data in the tab
     - **Delete**: Staff can delete records in the tab
   
   - Available tabs:
     - Dashboard
     - Operations (Loans, Products, Clients, Groups)
     - Accounting (Chart of Accounts, Journal Entries, Trial Balance)
     - Reports (PAR, Collections, Management)
     - Payroll
     - AI Tools
     - Settings

5. **Create the Staff Member**
   - Click **Create Staff Member**
   - The system will show a success message with the default password
   - ⚠️ **Important**: Share the phone number and default password with the staff member

### Managing Existing Staff

#### Edit Permissions
1. Find the staff member in the list
2. Click the **Edit** (pencil) icon
3. Modify their permissions
4. Click **Update Permissions**

#### Deactivate Staff
1. Find the staff member in the list
2. Click the **Trash** icon
3. Confirm deactivation
4. The staff member will no longer be able to log in

### Understanding Permission Levels

- **View Only**: Staff can see data but cannot make changes
- **View + Edit**: Staff can see and modify existing data
- **View + Edit + Delete**: Staff has full control (can add, modify, and delete)

#### Permission Logic
- If you disable **View**, Edit and Delete are automatically disabled
- If you enable **Edit** or **Delete**, View is automatically enabled

### Best Practices

1. **Principle of Least Privilege**: Only grant permissions that are necessary for the job
2. **Regular Audits**: Periodically review staff permissions and remove unnecessary access
3. **Role-Based Assignment**: Use consistent permission sets for similar roles
4. **Document Changes**: Keep track of why certain permissions were granted

### Example Permission Sets

**Loan Officer**
- ✅ View: Dashboard, Loans, Clients
- ✅ Edit: Loans, Clients
- ❌ Delete: (none)
- ❌ Access: Accounting, Payroll, Settings

**Accountant**
- ✅ View: Dashboard, Accounting, Reports
- ✅ Edit: Journal Entries
- ❌ Delete: (none)
- ❌ Access: Operations, Payroll

**Collector**
- ✅ View: Dashboard, Loans, Clients, Collections Report
- ✅ Edit: Payments
- ❌ Delete: (none)
- ❌ Access: Accounting, Payroll, Settings

---

## For Staff Members

### First-Time Login

1. **Go to the Login Page**
   - Visit the SmartLenderUp login page

2. **Click "Staff Login"**
   - This is located at the bottom of the main login form

3. **Enter Your Credentials**
   - **Phone Number**: Your full phone number (as provided by your manager)
   - **Password**: The last 4 digits of your phone number
   - Click **Login as Staff**

4. **Change Your Password (First Login)**
   - You'll be prompted to set a new password
   - Enter a new password (minimum 4 characters)
   - Confirm the new password
   - Click **Change Password & Login**

5. **Access the Platform**
   - You'll be logged in and see only the tabs you have permission to access

### Regular Login

1. Click **Staff Login** on the login page
2. Enter your phone number
3. Enter your password (the one you set after first login)
4. Click **Login as Staff**

### Changing Your Password Later

(This feature will be added in a future update)

### What You Can See

Your navigation menu will only show the tabs that your Manager has given you permission to view. If you don't see a tab, it means you don't have access to it.

### Permission Restrictions

- **View Only**: You can see data but buttons for editing/creating will be disabled
- **Can Edit**: You can modify existing records and create new ones
- **Can Delete**: You can remove records (use with caution!)

---

## Technical Details

### Login Credentials

- **Username**: Phone number (e.g., +254712345678)
- **Default Password**: Last 4 digits of phone number
- **Password Change**: Required on first login

### Security Features

- Passwords must be changed on first login
- Staff can only access tabs explicitly granted by the Manager
- All staff actions are tied to their organization
- Sessions are managed securely

### Data Storage

All staff data is stored in your Supabase database:
- `staff_users` table: Staff account information
- `staff_permissions` table: Tab-level permissions for each staff member

### Database Tables

Refer to `/database/migrations/README.md` for detailed database schema information.

---

## FAQ

### Can staff members create other staff members?
No, only Managers can create and manage staff accounts.

### Can I have multiple Managers?
Currently, only the organization owner is a Manager. Staff members have the role assigned but not Manager-level permissions unless explicitly granted.

### What happens when a staff member is deactivated?
They can no longer log in, but their historical data and actions remain in the system for audit purposes.

### Can staff see each other's permissions?
No, only Managers can view and edit staff permissions.

### How do I reset a staff member's password?
(This feature will be added in a future update. For now, you can update the password directly in the database.)

### Can permissions be changed while a staff member is logged in?
Yes, but they will need to log out and log back in for the changes to take effect.

### What if a staff member forgets their password?
(This feature will be added in a future update. For now, contact your Manager to reset it.)

---

## Troubleshooting

### Staff Login Error: "Invalid phone number or password"
- Verify the phone number is correct (include country code)
- On first login, use the last 4 digits of the phone number
- After first login, use the password you set

### Database Not Reachable Error
- Check your internet connection
- Verify the Supabase database is accessible
- Contact support if the issue persists

### Navigation Tabs Not Showing
- Make sure your Manager has granted you permission to view those tabs
- Try logging out and logging back in
- Contact your Manager to verify your permissions

### Can't Edit Even Though I Have Edit Permission
- Verify you have both View and Edit permissions
- Some features may require additional payment or subscription
- Contact your Manager to verify settings

---

## Support

For technical support or questions:
- Email: support@smartlenderup.com
- Platform: SmartLenderUp Help Center

For permission requests:
- Contact your organization's Manager
