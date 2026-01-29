# Staff Management - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Database (2 minutes)

1. Go to [Supabase Dashboard](https://supabase.com) → SmartlenderUp project
2. Click **SQL Editor** → **New query**
3. Copy `/database/migrations/create_staff_tables.sql` and paste
4. Click **Run**
5. ✅ Verify: See `staff_users` and `staff_permissions` in **Table Editor**

### Step 2: Create First Staff (2 minutes)

1. Login to SmartLenderUp as Manager
2. Go to **Admin** → **Settings** → **Staff Management**
3. Click **Add Staff Member**
4. Fill in:
   - Name: John Doe
   - Phone: +254712345678
   - Role: Staff
5. Check permissions:
   - Dashboard: ✅ View
   - Operations → Loans: ✅ View
6. Click **Create Staff Member**
7. ✅ Note the default password (last 4 digits: 5678)

### Step 3: Test Staff Login (1 minute)

1. **Logout** from Manager account
2. Click **Staff Login** on login page
3. Login with:
   - Phone: +254712345678
   - Password: 5678
4. Set new password when prompted
5. ✅ Verify: See only Dashboard and Loans in navigation

## 🎯 Key Concepts

### Permission Levels
- **View**: Can see the tab and data
- **Edit**: Can modify and create records
- **Delete**: Can remove records

### Default Password
- Always the **last 4 digits** of phone number
- Example: +254712345678 → password is **5678**
- Must be changed on first login

### Access Control
- **Managers**: See everything (permissions don't apply)
- **Staff**: See only permitted tabs
- **Automatic**: Navigation filters based on permissions

## 📋 Common Tasks

### Add Staff Member
```
Settings → Staff Management → Add Staff Member
```

### Edit Permissions
```
Settings → Staff Management → Click Edit icon → Update → Save
```

### Deactivate Staff
```
Settings → Staff Management → Click Trash icon → Confirm
```

### Staff Login
```
Login Page → Staff Login → Phone + Password → Change Password (first time)
```

## 🔍 Tab Keys Reference

| Tab Key | What it Controls |
|---------|------------------|
| `dashboard` | Dashboard |
| `operations_loans` | Loans tab |
| `operations_clients` | Clients tab |
| `operations_products` | Loan Products |
| `operations_groups` | Groups |
| `accounting_chart` | Chart of Accounts |
| `accounting_journal` | Journal Entries |
| `accounting_trial` | Trial Balance |
| `reports_par` | PAR Report |
| `reports_collections` | Collections Report |
| `reports_management` | Management Report |
| `payroll` | Payroll |
| `ai_tools` | AI Tools |
| `settings` | Settings |

## 💡 Quick Tips

1. **Default Password**: Last 4 digits of phone number
2. **Permission Hierarchy**: View must be enabled for Edit/Delete
3. **Changes Take Effect**: After logout/login
4. **Managers Always See All**: Permissions don't apply to managers
5. **Phone Format**: Include country code (+254...)

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't create staff | Check internet, verify Supabase is connected |
| Staff login fails | Use phone number exactly as entered, verify password |
| Tabs not showing | Check permissions were granted, logout and login again |
| Database error | Verify tables were created in Supabase |

## 📚 Full Documentation

- **Complete Setup**: `/STAFF_MANAGEMENT_SETUP.md`
- **User Guide**: `/docs/STAFF_MANAGEMENT_GUIDE.md`
- **Database Schema**: `/database/migrations/README.md`
- **Implementation Details**: `/IMPLEMENTATION_SUMMARY.md`

## 🎯 Example: Loan Officer

**Permissions to Grant:**
- ✅ Dashboard → View
- ✅ Operations → Loans → View, Edit
- ✅ Operations → Clients → View, Edit
- ✅ Reports → Collections → View

**Result:** Can manage loans and clients, view reports, but can't access accounting or delete records.

## 🎯 Example: Accountant

**Permissions to Grant:**
- ✅ Dashboard → View
- ✅ Accounting → Chart of Accounts → View
- ✅ Accounting → Journal Entries → View, Edit
- ✅ Reports → Management → View

**Result:** Full access to accounting, read-only reports, no access to operations.

## ✅ Success Checklist

- [ ] Database tables created in Supabase
- [ ] Created first test staff member  
- [ ] Staff logged in successfully
- [ ] Changed password on first login
- [ ] Verified navigation shows only permitted tabs
- [ ] Tested permission editing
- [ ] Read full documentation

## 🚀 You're Ready!

Your staff management system is set up and ready to use. Managers can create staff accounts with custom permissions, and staff can securely login to access only their permitted features.

---

**Need Help?**  
📧 support@smartlenderup.com  
📖 Full docs in `/docs/` folder
