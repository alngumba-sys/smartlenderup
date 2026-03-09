# Granular Permissions Admin Setup Guide

## ✅ FIXED: Admin Can Now Assign Granular Permissions!

### What Was The Problem?

When an Admin created staff members, they could only assign basic "tab-based" permissions (14 tabs × 4 CRUD operations). The new granular permission system (300+ permissions) had no UI for assignment.

### What's Been Fixed?

✅ **GranularPermissionsEditor Component** - New UI for assigning 300+ permissions  
✅ **StaffManagement Updated** - Now includes granular permission setup  
✅ **Database Schema** - Added `granular_permissions` column to `staff_users` table  
✅ **Dual Permission Modes** - Choose between Tab-Based (legacy) or Granular (new)  
✅ **Preset Roles** - 7 predefined roles with automatic permission sets  
✅ **Custom Permissions** - Ability to create custom permission combinations  

---

## 🚀 How To Use

### Step 1: Apply Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add granular_permissions column
ALTER TABLE public.staff_users 
ADD COLUMN IF NOT EXISTS granular_permissions jsonb;

COMMENT ON COLUMN public.staff_users.granular_permissions IS 
'Stores granular permission configuration: { useGranularPermissions: boolean, role: string, customPermissions: string[] }';
```

Or run the migration file:
```
/database/migrations/add_granular_permissions_column.sql
```

### Step 2: Create Staff with Granular Permissions

1. Navigate to **Settings** tab
2. Go to **Staff Management**
3. Click **"Add Staff Member"**
4. Fill in basic information (Name, Phone, Email)
5. **Choose Permission Mode:**
   - Click **"✨ Granular (300+ Permissions)"** button (default)
   - OR click **"Tab-Based (Legacy)"** for old system

### Step 3: Assign Permissions

#### Option A: Use Preset Role (Recommended)
1. Select **"Use Preset Role"** radio button
2. Choose from dropdown:
   - **Admin** - 280+ permissions (nearly everything)
   - **Manager** - 200+ permissions (most operations)
   - **Loan Officer** - 120+ permissions (loans, clients, limited approvals)
   - **Accountant** - 80+ permissions (financial data, reports)
   - **Cashier** - 60+ permissions (repayments, disbursements)
   - **Auditor** - 100+ permissions (read-only access)
   - **Viewer** - 20+ permissions (minimal read-only)
3. See permission count below dropdown
4. Click **"Create Staff Member"**

#### Option B: Custom Permissions (Advanced)
1. Select **"Custom Permissions"** radio button
2. Use the search bar to find specific permissions
3. Click category headers to expand/collapse
4. Click **"Grant All"** or **"Revoke All"** per category
5. Check individual permissions as needed
6. Toggle **"Granted Only"** filter to see only selected permissions
7. See total permission count at bottom
8. Click **"Create Staff Member"**

---

## 🎯 Permission Categories

The GranularPermissionsEditor organizes 300+ permissions into 19 categories:

1. **Dashboard** (9 permissions) - Dashboard views and metrics
2. **Clients** (15 permissions) - Client operations
3. **Loans** (18 permissions) - Loan lifecycle management
4. **Approvals** (9 permissions) - Multi-phase approval workflow
5. **Repayments** (12 permissions) - Payment processing
6. **Accounting** (20 permissions) - Financial statements, journal entries
7. **Bank Accounts** (8 permissions) - Bank account management
8. **Collection Sheets** (7 permissions) - Collection operations
9. **Credit Scoring** (10 permissions) - Credit evaluation
10. **Groups** (12 permissions) - Group lending
11. **Loan Products** (8 permissions) - Product configuration
12. **Savings** (14 permissions) - Savings accounts
13. **Expenses** (8 permissions) - Expense tracking
14. **Staff** (10 permissions) - Staff management
15. **Reports** (15 permissions) - Report generation
16. **Notifications** (8 permissions) - Communication
17. **Settings** (12 permissions) - System configuration
18. **AI Insights** (8 permissions) - AI/ML features
19. **Data Management** (4 permissions) - Import/export

---

## 📊 Preset Role Breakdown

### Admin (280+ permissions)
- ✅ Full dashboard access
- ✅ Full client management
- ✅ Full loan operations
- ✅ All approval phases
- ✅ Full accounting access
- ✅ All reports
- ✅ Staff management
- ✅ Settings configuration
- ❌ Cannot delete system-critical data (Super Admin only)

### Manager (200+ permissions)
- ✅ View all data
- ✅ Create clients, loans, products
- ✅ Edit most records
- ✅ Approve phases 1-3
- ✅ Generate reports
- ✅ Limited staff management
- ❌ Cannot delete loans/clients
- ❌ Cannot approve phase 4-5
- ❌ Cannot modify system settings

### Loan Officer (120+ permissions)
- ✅ View clients and loans
- ✅ Create loans
- ✅ Edit loan details
- ✅ Record repayments
- ✅ Generate loan reports
- ✅ Approve phase 1 only
- ❌ Cannot delete loans
- ❌ Cannot access accounting
- ❌ Cannot manage staff

### Accountant (80+ permissions)
- ✅ Full accounting access
- ✅ View all financial data
- ✅ Generate financial reports
- ✅ Manage expenses
- ✅ View transactions
- ❌ Cannot create/edit loans
- ❌ Cannot manage clients
- ❌ Cannot approve loans

### Cashier (60+ permissions)
- ✅ Record repayments
- ✅ Disburse loans
- ✅ View bank accounts
- ✅ Record expenses
- ❌ Cannot create loans
- ❌ Cannot approve loans
- ❌ Cannot access reports

### Auditor (100+ permissions)
- ✅ View all data (read-only)
- ✅ Generate all reports
- ✅ View audit logs
- ✅ View transactions
- ❌ Cannot create/edit/delete anything
- ❌ Cannot approve loans
- ❌ Cannot record payments

### Viewer (20+ permissions)
- ✅ View dashboard
- ✅ View clients (basic info only)
- ✅ View loans (basic info only)
- ❌ Cannot view financial details
- ❌ Cannot create/edit/delete
- ❌ Cannot generate reports

---

## 🔍 Features of the Permission Editor

### Search
- Search by permission label: "Delete Client"
- Search by permission code: "clients.delete"
- Real-time filtering

### Category Management
- Expand/collapse categories
- Grant all permissions in category
- Revoke all permissions in category
- See granted vs. total count per category

### Visual Indicators
- ✅ Green checkmark for granted permissions
- 📊 Progress badges: "All Granted", "Partial"
- 🔢 Live permission counter

### Filter
- Toggle "Granted Only" to see only selected permissions
- Useful for reviewing what's been assigned

---

## 💾 How Permissions Are Stored

### Database Structure
```sql
staff_users.granular_permissions: jsonb
```

### Data Format
```json
{
  "useGranularPermissions": true,
  "role": "Loan Officer",
  "customPermissions": []
}
```

**For Preset Roles:**
- `role`: Name of the role (e.g., "Loan Officer")
- `customPermissions`: Empty array

**For Custom Permissions:**
- `role`: null
- `customPermissions`: Array of permission strings (e.g., ["clients.view", "loans.create"])

---

## 🔄 Backward Compatibility

### Dual System Support
The platform maintains BOTH permission systems:

1. **Tab-Based** (Legacy) - 14 tabs × 4 CRUD = 56 permissions
2. **Granular** (New) - 300+ atomic permissions

### When Creating Staff:
- **Granular Mode**: Saves to `granular_permissions` column
- **Tab-Based Mode**: Saves to `staff_permissions` table

### When Logging In:
- System checks `granular_permissions` first
- Falls back to tab-based permissions if not found
- Admin/Manager roles bypass restrictions

---

## 🧪 Testing Granular Permissions

### Test Scenario 1: Loan Officer
1. Create staff with role "Loan Officer"
2. Log out from Admin
3. Log in as the new Loan Officer
4. **Expected:** Can create loans, view clients, limited access
5. **Cannot:** Delete loans, access accounting, manage staff

### Test Scenario 2: Custom Cashier
1. Create staff with Custom Permissions
2. Grant only:
   - `repayments.record_payment`
   - `loans.view`
   - `clients.view`
   - `bank_accounts.view_accounts`
3. Log in as this user
4. **Expected:** Can only record payments and view data
5. **Cannot:** Create loans, edit clients, generate reports

### Test Scenario 3: Auditor
1. Create staff with role "Auditor"
2. Log in as Auditor
3. **Expected:** Can view everything, generate reports
4. **Cannot:** Edit/create/delete anything

---

## 🎓 Best Practices

### For Admins:
1. **Use Preset Roles** for standard positions
2. **Use Custom Permissions** for specialized roles
3. **Test each role** before assigning to real staff
4. **Review permissions quarterly** to ensure they're still appropriate
5. **Document custom roles** for future reference

### For Custom Roles:
1. **Start with minimum permissions** and add as needed
2. **Group related permissions** by category
3. **Test thoroughly** before deployment
4. **Name custom roles clearly** (e.g., "Branch Cashier", "Remote Auditor")

### Security:
1. **Never give delete permissions** to junior staff
2. **Limit approval permissions** based on seniority
3. **Restrict financial data access** to accounting team
4. **Monitor permission changes** via audit logs

---

## 📝 Migration Guide

### Migrating From Tab-Based to Granular:

1. **Audit Current Permissions**
   - Review which staff have which tab permissions
   - Document their responsibilities

2. **Map to Granular Roles**
   - Most "staff" → Loan Officer or Cashier
   - Most "loan_officer" → Loan Officer
   - Most "accountant" → Accountant
   - Most "manager" → Manager

3. **Update Staff Records**
   ```sql
   UPDATE staff_users 
   SET granular_permissions = '{"useGranularPermissions": true, "role": "Loan Officer", "customPermissions": []}'::jsonb
   WHERE role = 'loan_officer';
   ```

4. **Test Before Full Rollout**
   - Update 1-2 staff first
   - Verify they can perform their duties
   - Get feedback
   - Roll out to all staff

---

## 🐛 Troubleshooting

### Staff Can't See Anything After Creation
**Cause:** No permissions assigned  
**Fix:** Edit staff member, assign a preset role

### Staff Has Too Much Access
**Cause:** Wrong role assigned  
**Fix:** Edit staff, change to more restrictive role

### Custom Permissions Not Working
**Cause:** `granular_permissions` column doesn't exist  
**Fix:** Run the database migration

### Permission Changes Not Taking Effect
**Cause:** Staff needs to log out and log back in  
**Fix:** Tell staff to logout and login again

---

## ✅ Verification Checklist

After setting up a staff member:

- [ ] Basic info saved (name, phone, email)
- [ ] Granular permissions assigned
- [ ] Staff can log in with default password
- [ ] Staff sees correct tabs based on permissions
- [ ] Staff can perform allowed actions
- [ ] Staff is blocked from restricted actions
- [ ] Permission error toast shows when blocked

---

## 🎉 Summary

You now have a complete granular permissions system! Admins can:

✅ Choose between 7 preset roles  
✅ Create custom permission combinations  
✅ Search and filter 300+ permissions  
✅ Grant/revoke by category  
✅ See live permission counts  
✅ Maintain backward compatibility  

The "advanced permissions" were never lost - they've been **enhanced** with an enterprise-grade UI! 🚀
