# 🚀 Granular Permissions System - Quick Start Guide

## ✅ What's Been Implemented

The granular permissions system is **FULLY OPERATIONAL** and ready to use! Here's what you have:

### 📦 Core Files Created:
1. **`/utils/permissions.ts`** - 300+ atomic permissions & role definitions
2. **`/contexts/PermissionsContext.tsx`** - React context for permissions
3. **`/components/PermissionGate.tsx`** - Reusable UI components
4. **`/components/PermissionsDebugPanel.tsx`** - Debug tool to see your permissions

### ✨ Integration Complete:
- ✅ **PermissionsProvider** wrapped around entire app in `/src/App.tsx`
- ✅ **ClientsTab** updated with permission checks (demo)
- ✅ **PermissionsDebugPanel** added to InternalStaffPortal (temporary)

---

## 🎯 HOW TO SEE IT WORKING RIGHT NOW

### Step 1: Open the Application
1. Start your dev server (if not running)
2. Login to the platform as any user

### Step 2: Look for the Purple Debug Button
You should see a **purple button in the bottom-right corner** that says:
```
🛡️ Permissions: [Your Role Name]
```

### Step 3: Click the Purple Button
This will open the **Permissions Debug Panel** showing:
- ✅ Your current role
- ✅ Total permissions you have
- ✅ Quick permission tests (Can Add Clients? Can Delete? etc.)
- ✅ All permissions organized by category
- ✅ Complete list of your permissions

---

## 🧪 Test Scenarios

### Test 1: Change Your Role to "Viewer"

1. Go to **Staff Management** tab
2. Find your user or create a test user
3. Click "Edit Permissions"
4. Change role to **"Viewer"**
5. Save
6. **Logout and login** again (or refresh)
7. Open the **Purple Debug Panel** (bottom-right)

**Expected Results:**
- ✅ Total Permissions: ~30 (very limited)
- ⛔ "Can Add Clients?" → **✗ No** (RED)
- ⛔ "Can Delete Clients?" → **✗ No** (RED)
- ⛔ "Can View Credit Scores?" → **✗ No** (RED)
- ⛔ "Can View Financials?" → **✗ No** (RED)

**In the UI:**
- Go to **Clients** tab
- The **"Add Client"** button should be **DISABLED (grayed out)**
- The **"Avg Credit Score"** card should be **COMPLETELY HIDDEN**
- The **"Total Outstanding"** card should be **COMPLETELY HIDDEN**

---

### Test 2: Change Role to "Loan Officer"

1. Edit permissions again
2. Change role to **"Loan Officer"**
3. Save, logout, login
4. Open the **Purple Debug Panel**

**Expected Results:**
- ✅ Total Permissions: ~100
- ✅ "Can Add Clients?" → **✓ Yes** (GREEN)
- ⛔ "Can Delete Clients?" → **✗ No** (RED)
- ✅ "Can View Credit Scores?" → **✓ Yes** (GREEN)
- ✅ "Can View Financials?" → **✓ Yes** (GREEN)
- ✅ "Can Create Loans?" → **✓ Yes** (GREEN)
- ⛔ "Can Disburse Loans?" → **✗ No** (RED)
- ⛔ "Can Approve Phase 4?" → **✗ No** (RED)

**In the UI:**
- **"Add Client"** button → **ENABLED**
- **"Avg Credit Score"** card → **VISIBLE**
- **"Total Outstanding"** card → **VISIBLE**

---

### Test 3: Change Role to "Admin"

1. Edit permissions
2. Change role to **"Admin"**
3. Save, logout, login
4. Open the **Purple Debug Panel**

**Expected Results:**
- ✅ Total Permissions: ~280 (almost everything)
- ✅ "Can Add Clients?" → **✓ Yes** (GREEN)
- ✅ "Can Delete Clients?" → **✓ Yes** (GREEN)
- ✅ "Can View Credit Scores?" → **✓ Yes** (GREEN)
- ✅ "Can Disburse Loans?" → **✓ Yes** (GREEN)
- ✅ "Can Approve Phase 4?" → **✓ Yes** (GREEN)
- ✅ "Can View Bank Balances?" → **✓ Yes** (GREEN)

**In the UI:**
- ALL buttons **ENABLED**
- ALL cards **VISIBLE**

---

## 🔍 How to Use the Debug Panel

### Panel Sections:

1. **Quick Permission Tests** (Blue Section)
   - Shows common permissions with ✓/✗ indicators
   - Green ✓ = You have this permission
   - Red ✗ = You DON'T have this permission

2. **Permissions by Category** (Expandable)
   - Click a category to expand
   - Shows all permissions in that category
   - E.g., "CLIENTS (18)" means 18 client-related permissions

3. **All Permissions List** (Bottom, scrollable)
   - Complete list of every permission you have
   - Shown in `module.action` format
   - E.g., `clients.add`, `loans.view_details`

---

## 🛠️ How to Apply Permissions to More Components

The system is ready - you just need to wrap UI elements with permission checks.

### Example 1: Protect a Delete Button in LoansTab

**Find this:**
```typescript
<button onClick={handleDeleteLoan} className="btn-danger">
  <Trash2 className="size-4" />
  Delete
</button>
```

**Replace with:**
```typescript
import { PermissionButton } from '../components/PermissionGate';
import { PERMISSIONS } from '../utils/permissions';

<PermissionButton 
  permission={PERMISSIONS.LOANS.DELETE_LOAN}
  onClick={handleDeleteLoan}
  className="btn-danger"
>
  <Trash2 className="size-4" />
  Delete
</PermissionButton>
```

### Example 2: Hide a Financial Card

**Find this:**
```typescript
<div className="metric-card">
  <h3>Portfolio Value</h3>
  <p>KES 12.5M</p>
</div>
```

**Replace with:**
```typescript
import { PermissionGate } from '../components/PermissionGate';
import { PERMISSIONS } from '../utils/permissions';

<PermissionGate permission={PERMISSIONS.DASHBOARD.VIEW_PORTFOLIO_SUMMARY}>
  <div className="metric-card">
    <h3>Portfolio Value</h3>
    <p>KES 12.5M</p>
  </div>
</PermissionGate>
```

---

## 📋 Permission Reference Quick List

### Common Client Permissions:
- `PERMISSIONS.CLIENTS.VIEW_CLIENTS` - Can view client list
- `PERMISSIONS.CLIENTS.ADD_CLIENT` - Can add new clients
- `PERMISSIONS.CLIENTS.EDIT_CLIENT` - Can edit client details
- `PERMISSIONS.CLIENTS.DELETE_CLIENT` - Can delete clients
- `PERMISSIONS.CLIENTS.VIEW_CLIENT_FINANCIALS` - Can see financial data
- `PERMISSIONS.CLIENTS.VIEW_CLIENT_CREDIT_SCORE` - Can see credit scores
- `PERMISSIONS.CLIENTS.SEND_SMS_TO_CLIENTS` - Can send SMS
- `PERMISSIONS.CLIENTS.EXPORT_CLIENTS` - Can export data

### Common Loan Permissions:
- `PERMISSIONS.LOANS.VIEW_LOANS` - Can view loans
- `PERMISSIONS.LOANS.CREATE_LOAN` - Can create new loans
- `PERMISSIONS.LOANS.EDIT_LOAN` - Can edit loans
- `PERMISSIONS.LOANS.DELETE_LOAN` - Can delete loans
- `PERMISSIONS.LOANS.DISBURSE_LOAN` - Can disburse funds
- `PERMISSIONS.LOANS.VIEW_LOAN_AMOUNT` - Can see loan amounts
- `PERMISSIONS.LOANS.VIEW_OUTSTANDING_BALANCE` - Can see balances
- `PERMISSIONS.LOANS.EXPORT_LOANS` - Can export data

### Approval Workflow Permissions:
- `PERMISSIONS.APPROVALS.APPROVE_PHASE_1` - Phase 1 approval
- `PERMISSIONS.APPROVALS.APPROVE_PHASE_2` - Phase 2 approval
- `PERMISSIONS.APPROVALS.APPROVE_PHASE_3` - Phase 3 approval
- `PERMISSIONS.APPROVALS.APPROVE_PHASE_4` - Phase 4 (Admin only)
- `PERMISSIONS.APPROVALS.APPROVE_PHASE_5` - Phase 5 (Admin only)

### Financial Permissions:
- `PERMISSIONS.ACCOUNTING.VIEW_FINANCIAL_STATEMENTS` - View statements
- `PERMISSIONS.ACCOUNTING.CREATE_JOURNAL_ENTRY` - Create entries
- `PERMISSIONS.BANK_ACCOUNTS.VIEW_ACCOUNT_BALANCE` - See balances
- `PERMISSIONS.BANK_ACCOUNTS.ADD_TRANSACTION` - Add transactions

---

## 🎨 Visual Indicators

### When a button is disabled by permissions:
```typescript
<PermissionButton ...>
  Delete Client
</PermissionButton>
```
→ **Appears grayed out**
→ **Cursor becomes "not-allowed"**
→ **Hover shows tooltip: "You don't have permission for this action"**

### When a section is hidden:
```typescript
<PermissionGate ...>
  <div>Sensitive Data</div>
</PermissionGate>
```
→ **Entire section is NOT RENDERED**
→ **No placeholder shown**
→ **User never knows it exists**

---

## 🧹 Cleanup (Before Production)

### Remove the Debug Panel:

**File: `/components/InternalStaffPortal.tsx`**

Find and **DELETE** these lines:
```typescript
import { PermissionsDebugPanel } from './PermissionsDebugPanel';

...

{/* 🔒 DEBUG: Permissions Debug Panel - Remove in production */}
<PermissionsDebugPanel />
```

---

## ❓ Troubleshooting

### Problem: "I don't see the purple debug button"
**Solution:** 
- Make sure you're logged in
- Check browser console for errors
- Verify `PermissionsProvider` is in `/src/App.tsx`

### Problem: "All permissions show as ✗ No"
**Solution:**
- Check your user's role in Staff Management
- Make sure role is one of the 8 defined roles
- Logout and login again after changing role

### Problem: "Buttons aren't getting disabled"
**Solution:**
- Make sure you wrapped the button with `<PermissionButton>`
- Import `PERMISSIONS` from `/utils/permissions`
- Check the permission string is correct

### Problem: "Section isn't hiding"
**Solution:**
- Use `<PermissionGate>` around the entire section
- Make sure you imported it from `/components/PermissionGate`
- Check the permission name matches exactly

---

## 🎓 Role Overview (Quick Reference)

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Super Admin** | ALL (300+) | Platform owner, full control |
| **Admin** | ~280 | Full operations, no system settings |
| **Manager** | ~180 | Operational management, approvals 1-3 |
| **Loan Officer** | ~100 | Field work, client & loan management |
| **Accountant** | ~120 | Financial operations, bookkeeping |
| **Cashier** | ~40 | Payment collection only |
| **Auditor** | ~150 | Read-only access, exports |
| **Viewer** | ~30 | Basic viewing only |

---

## 📞 Next Steps

1. ✅ **Test the debug panel right now** - Click the purple button
2. ✅ **Try different roles** - See permissions change in real-time
3. ✅ **Apply to more components** - Use the patterns above
4. ✅ **Test thoroughly** - Login as each role and verify
5. ✅ **Remove debug panel** - Before going to production

---

## 🎉 Success!

Your permissions system is **fully functional** and **ready to use**!

The infrastructure is complete - now it's just a matter of applying the permission gates to the remaining components. The pattern is simple and consistent everywhere.

**Happy securing! 🔒**

---

**Last Updated:** March 4, 2026  
**Status:** ✅ **IMPLEMENTED & WORKING**  
**Next:** Apply permissions to remaining tabs
