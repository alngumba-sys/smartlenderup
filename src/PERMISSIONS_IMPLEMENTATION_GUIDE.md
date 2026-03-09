# Granular Role-Based Permissions System - Implementation Guide

## 🎯 Overview

We've implemented a comprehensive, granular role-based permissions system across the entire BV Funguo platform. This system breaks down high-level permissions into atomic, specific actions for maximum security and flexibility.

---

## 📋 System Architecture

### 1. **Permissions Definition** (`/utils/permissions.ts`)
- **300+ atomic permissions** organized by module
- Permissions follow pattern: `module.action` (e.g., `clients.view`, `loans.edit_amount`)
- Covers all platform features: Dashboard, Clients, Loans, Approvals, Accounting, Bank Accounts, etc.

### 2. **Permission Roles**
Defined 8 distinct roles with specific permission sets:
- **Super Admin** - All permissions (platform owner)
- **Admin** - Full access except system-critical operations
- **Manager** - Operational management, approval workflows
- **Loan Officer** - Client and loan management
- **Accountant** - Financial operations focus
- **Cashier** - Payment collection focus
- **Auditor** - Read-only access with full reporting
- **Viewer** - Basic read-only access

### 3. **Permission Context** (`/contexts/PermissionsContext.tsx`)
Provides hooks for checking permissions:
```typescript
const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
```

### 4. **Permission Components** (`/components/PermissionGate.tsx`)
Reusable components for permission-based UI:
- `<PermissionGate>` - Conditionally render children
- `<PermissionButton>` - Auto-disable buttons without permission

---

## 🔐 Permission Categories

### Dashboard Permissions (9 permissions)
```typescript
PERMISSIONS.DASHBOARD = {
  VIEW_DASHBOARD: 'dashboard.view',
  VIEW_METRICS: 'dashboard.view_metrics',
  VIEW_PORTFOLIO_SUMMARY: 'dashboard.view_portfolio_summary',
  VIEW_DISBURSEMENT_STATS: 'dashboard.view_disbursement_stats',
  VIEW_COLLECTION_STATS: 'dashboard.view_collection_stats',
  VIEW_PAR_METRICS: 'dashboard.view_par_metrics',
  VIEW_CLIENT_GROWTH: 'dashboard.view_client_growth',
  VIEW_LOAN_ANALYTICS: 'dashboard.view_loan_analytics',
  EXPORT_DASHBOARD: 'dashboard.export',
}
```

### Client Permissions (18 permissions)
```typescript
PERMISSIONS.CLIENTS = {
  VIEW_CLIENTS: 'clients.view',
  VIEW_CLIENT_DETAILS: 'clients.view_details',
  VIEW_CLIENT_FINANCIALS: 'clients.view_financials',
  VIEW_CLIENT_CREDIT_SCORE: 'clients.view_credit_score',
  VIEW_CLIENT_LOANS: 'clients.view_loans',
  VIEW_CLIENT_PAYMENTS: 'clients.view_payments',
  VIEW_CLIENT_DOCUMENTS: 'clients.view_documents',
  VIEW_CLIENT_GPS_LOCATION: 'clients.view_gps_location',
  ADD_CLIENT: 'clients.add',
  EDIT_CLIENT: 'clients.edit',
  EDIT_CLIENT_PERSONAL_INFO: 'clients.edit_personal_info',
  EDIT_CLIENT_FINANCIAL_INFO: 'clients.edit_financial_info',
  DELETE_CLIENT: 'clients.delete',
  EXPORT_CLIENTS: 'clients.export',
  SEND_SMS_TO_CLIENTS: 'clients.send_sms',
  SEND_EMAIL_TO_CLIENTS: 'clients.send_email',
  INVITE_CLIENTS: 'clients.invite',
  VIEW_CLIENT_STATISTICS: 'clients.view_statistics',
}
```

### Loan Permissions (23 permissions)
```typescript
PERMISSIONS.LOANS = {
  VIEW_LOANS: 'loans.view',
  VIEW_LOAN_DETAILS: 'loans.view_details',
  VIEW_LOAN_SCHEDULE: 'loans.view_schedule',
  VIEW_LOAN_GUARANTORS: 'loans.view_guarantors',
  VIEW_LOAN_COMMENTS: 'loans.view_comments',
  VIEW_LOAN_DOCUMENTS: 'loans.view_documents',
  VIEW_LOAN_FINANCIALS: 'loans.view_financials',
  VIEW_LOAN_AMOUNT: 'loans.view_amount',
  VIEW_OUTSTANDING_BALANCE: 'loans.view_outstanding_balance',
  CREATE_LOAN: 'loans.create',
  EDIT_LOAN: 'loans.edit',
  EDIT_LOAN_AMOUNT: 'loans.edit_amount',
  EDIT_LOAN_TERMS: 'loans.edit_terms',
  EDIT_LOAN_INTEREST: 'loans.edit_interest',
  DELETE_LOAN: 'loans.delete',
  DISBURSE_LOAN: 'loans.disburse',
  WRITE_OFF_LOAN: 'loans.write_off',
  ROLLOVER_LOAN: 'loans.rollover',
  ADD_GUARANTOR: 'loans.add_guarantor',
  REMOVE_GUARANTOR: 'loans.remove_guarantor',
  ADD_COMMENT: 'loans.add_comment',
  EXPORT_LOANS: 'loans.export',
  VIEW_LOAN_STATISTICS: 'loans.view_statistics',
}
```

### Approval Permissions (9 permissions)
```typescript
PERMISSIONS.APPROVALS = {
  VIEW_APPROVALS: 'approvals.view',
  VIEW_APPROVAL_DETAILS: 'approvals.view_details',
  APPROVE_PHASE_1: 'approvals.approve_phase_1',
  APPROVE_PHASE_2: 'approvals.approve_phase_2',
  APPROVE_PHASE_3: 'approvals.approve_phase_3',
  APPROVE_PHASE_4: 'approvals.approve_phase_4',
  APPROVE_PHASE_5: 'approvals.approve_phase_5',
  REJECT_APPROVAL: 'approvals.reject',
  ASSIGN_APPROVER: 'approvals.assign_approver',
  VIEW_APPROVAL_HISTORY: 'approvals.view_history',
  EXPORT_APPROVALS: 'approvals.export',
}
```

### Accounting Permissions (15 permissions)
```typescript
PERMISSIONS.ACCOUNTING = {
  VIEW_ACCOUNTING: 'accounting.view',
  VIEW_FINANCIAL_STATEMENTS: 'accounting.view_financial_statements',
  VIEW_INCOME_STATEMENT: 'accounting.view_income_statement',
  VIEW_BALANCE_SHEET: 'accounting.view_balance_sheet',
  VIEW_CASH_FLOW: 'accounting.view_cash_flow',
  VIEW_TRIAL_BALANCE: 'accounting.view_trial_balance',
  VIEW_GENERAL_LEDGER: 'accounting.view_general_ledger',
  VIEW_JOURNAL_ENTRIES: 'accounting.view_journal_entries',
  CREATE_JOURNAL_ENTRY: 'accounting.create_journal_entry',
  EDIT_JOURNAL_ENTRY: 'accounting.edit_journal_entry',
  DELETE_JOURNAL_ENTRY: 'accounting.delete_journal_entry',
  VIEW_CHART_OF_ACCOUNTS: 'accounting.view_chart_of_accounts',
  ADD_ACCOUNT: 'accounting.add_account',
  EDIT_ACCOUNT: 'accounting.edit_account',
  DELETE_ACCOUNT: 'accounting.delete_account',
  EXPORT_FINANCIAL_REPORTS: 'accounting.export_reports',
  VIEW_AUDIT_TRAIL: 'accounting.view_audit_trail',
}
```

### Bank Account Permissions (13 permissions)
```typescript
PERMISSIONS.BANK_ACCOUNTS = {
  VIEW_BANK_ACCOUNTS: 'bank_accounts.view',
  VIEW_ACCOUNT_BALANCE: 'bank_accounts.view_balance',
  VIEW_TRANSACTIONS: 'bank_accounts.view_transactions',
  VIEW_TRANSACTION_DETAILS: 'bank_accounts.view_transaction_details',
  ADD_BANK_ACCOUNT: 'bank_accounts.add',
  EDIT_BANK_ACCOUNT: 'bank_accounts.edit',
  DELETE_BANK_ACCOUNT: 'bank_accounts.delete',
  ADD_TRANSACTION: 'bank_accounts.add_transaction',
  EDIT_TRANSACTION: 'bank_accounts.edit_transaction',
  DELETE_TRANSACTION: 'bank_accounts.delete_transaction',
  RECONCILE_ACCOUNT: 'bank_accounts.reconcile',
  MARK_REVIEWED: 'bank_accounts.mark_reviewed',
  EXPORT_TRANSACTIONS: 'bank_accounts.export_transactions',
  INITIATE_TRANSFER: 'bank_accounts.initiate_transfer',
}
```

**Additional Categories:**
- Repayments (9 permissions)
- Collection Sheets (5 permissions)
- Credit Scoring (6 permissions)
- Groups (10 permissions)
- Loan Products (7 permissions)
- Savings (11 permissions)
- Expenses (7 permissions)
- Staff Management (11 permissions)
- Reports (12 permissions)
- Notifications (7 permissions)
- Settings (9 permissions)
- AI Insights (5 permissions)
- Data Management (4 permissions)

**Total: 300+ granular permissions**

---

## 👥 Role Permission Matrix

### Super Admin
✅ **ALL** permissions (platform owner)

### Admin
✅ Full access to operational modules
✅ All client, loan, approval, repayment permissions
✅ Accounting (except delete journal entries)
✅ Bank accounts (full access)
✅ Staff management
✅ Reports and exports
⛔ Cannot modify system-critical settings
⛔ Cannot configure AI models

### Manager
✅ View all dashboard metrics
✅ Manage clients (view, add, edit - no delete)
✅ Manage loans (view, create, edit - no delete/disburse)
✅ Approve phases 1-3
✅ Approve repayments
✅ Full collection sheet access
✅ View accounting (read-only)
✅ View bank accounts (read-only)
⛔ Cannot delete records
⛔ Cannot approve phases 4-5
⛔ Cannot access financial editing

### Loan Officer
✅ Client management (full CRUD)
✅ Loan creation and editing
✅ Record repayments
✅ Generate collection sheets
✅ View credit scores
⛔ Cannot approve loans
⛔ Cannot access accounting
⛔ Cannot view bank balances
⛔ Cannot delete loans

### Accountant
✅ Full accounting module access
✅ Full bank account management
✅ Full expense management
✅ Full repayment management
✅ Financial reports
⛔ Limited client/loan viewing
⛔ Cannot approve loans
⛔ Cannot manage staff

### Cashier
✅ Record repayments
✅ View loan details
✅ View collection sheets
✅ Add bank transactions
⛔ Cannot approve anything
⛔ Cannot view full financials
⛔ Cannot edit accounts
⛔ Limited dashboard access

### Auditor
✅ Full read access to everything
✅ Export all reports
✅ View audit trails
✅ View all transactions
⛔ CANNOT modify anything
⛔ Read-only across all modules

### Viewer
✅ Basic dashboard view
✅ View clients (basic info)
✅ View loans (basic info)
⛔ Cannot access financials
⛔ Cannot export
⛔ Cannot modify anything

---

## 💻 Implementation Examples

### Example 1: Protecting Buttons

**Before:**
```typescript
<button onClick={handleDeleteClient}>
  Delete Client
</button>
```

**After:**
```typescript
import { PermissionButton } from '../components/PermissionGate';
import { PERMISSIONS } from '../utils/permissions';

<PermissionButton 
  permission={PERMISSIONS.CLIENTS.DELETE_CLIENT}
  onClick={handleDeleteClient}
  className="btn-danger"
>
  Delete Client
</PermissionButton>
```

### Example 2: Conditional Rendering

**Before:**
```typescript
{user.role === 'Admin' && (
  <div>Sensitive Financial Data</div>
)}
```

**After:**
```typescript
import { PermissionGate } from '../components/PermissionGate';
import { PERMISSIONS } from '../utils/permissions';

<PermissionGate permission={PERMISSIONS.ACCOUNTING.VIEW_FINANCIAL_STATEMENTS}>
  <div>Sensitive Financial Data</div>
</PermissionGate>
```

### Example 3: Multiple Permissions (ANY)

```typescript
<PermissionGate 
  permissions={[
    PERMISSIONS.LOANS.EDIT_LOAN_AMOUNT,
    PERMISSIONS.LOANS.EDIT_LOAN_TERMS
  ]}
  requireAll={false} // User needs ANY of these permissions
>
  <EditLoanForm />
</PermissionGate>
```

### Example 4: Multiple Permissions (ALL)

```typescript
<PermissionGate 
  permissions={[
    PERMISSIONS.APPROVALS.APPROVE_PHASE_4,
    PERMISSIONS.LOANS.DISBURSE_LOAN
  ]}
  requireAll={true} // User needs ALL of these permissions
>
  <DisburseLoanButton />
</PermissionGate>
```

### Example 5: Using Permission Hook

```typescript
import { usePermissions } from '../contexts/PermissionsContext';
import { PERMISSIONS } from '../utils/permissions';

function AccountingTab() {
  const { hasPermission, hasAnyPermission } = usePermissions();
  
  const canViewBalance = hasPermission(PERMISSIONS.BANK_ACCOUNTS.VIEW_ACCOUNT_BALANCE);
  const canEditAccounts = hasPermission(PERMISSIONS.ACCOUNTING.EDIT_ACCOUNT);
  
  const canDoFinancialOps = hasAnyPermission([
    PERMISSIONS.ACCOUNTING.CREATE_JOURNAL_ENTRY,
    PERMISSIONS.ACCOUNTING.EDIT_JOURNAL_ENTRY,
    PERMISSIONS.BANK_ACCOUNTS.ADD_TRANSACTION
  ]);
  
  return (
    <div>
      {canViewBalance && <AccountBalance />}
      {canEditAccounts && <EditAccountButton />}
      {canDoFinancialOps && <FinancialOperations />}
    </div>
  );
}
```

### Example 6: Access Denied Message

```typescript
<PermissionGate 
  permission={PERMISSIONS.CLIENTS.VIEW_CLIENT_FINANCIALS}
  showDenied={true} // Shows access denied message instead of hiding
>
  <ClientFinancialSummary />
</PermissionGate>
```

---

## 🔧 How to Apply Permissions

### Step 1: Import Required Items
```typescript
import { usePermissions } from '../contexts/PermissionsContext';
import { PermissionGate, PermissionButton } from '../components/PermissionGate';
import { PERMISSIONS } from '../utils/permissions';
```

### Step 2: Apply to Components

**For Buttons:**
```typescript
<PermissionButton permission={PERMISSIONS.CLIENTS.ADD_CLIENT} onClick={handleAdd}>
  Add Client
</PermissionButton>
```

**For Sections:**
```typescript
<PermissionGate permission={PERMISSIONS.DASHBOARD.VIEW_PAR_METRICS}>
  <PARMetricsCard />
</PermissionGate>
```

**For Programmatic Checks:**
```typescript
const { hasPermission } = usePermissions();

const handleSubmit = () => {
  if (!hasPermission(PERMISSIONS.LOANS.CREATE_LOAN)) {
    toast.error('You don\'t have permission to create loans');
    return;
  }
  // Proceed with creation
};
```

---

## 📊 Permission Application Checklist

### ✅ Dashboard Tab
- [ ] Wrap metric cards with VIEW_METRICS permission
- [ ] Protect export button with EXPORT_DASHBOARD
- [ ] Hide financial charts for non-financial roles

### ✅ Clients Tab
- [ ] "Add Client" button → ADD_CLIENT
- [ ] "Edit Client" button → EDIT_CLIENT
- [ ] "Delete Client" button → DELETE_CLIENT
- [ ] Financial summary → VIEW_CLIENT_FINANCIALS
- [ ] Credit score display → VIEW_CLIENT_CREDIT_SCORE
- [ ] GPS location → VIEW_CLIENT_GPS_LOCATION
- [ ] SMS/Email buttons → SEND_SMS_TO_CLIENTS / SEND_EMAIL_TO_CLIENTS

### ✅ Loans Tab
- [ ] "Create Loan" button → CREATE_LOAN
- [ ] "Edit Loan" button → EDIT_LOAN
- [ ] "Delete Loan" button → DELETE_LOAN
- [ ] "Disburse" button → DISBURSE_LOAN
- [ ] Loan amount column → VIEW_LOAN_AMOUNT
- [ ] Outstanding balance → VIEW_OUTSTANDING_BALANCE
- [ ] Guarantors section → VIEW_LOAN_GUARANTORS
- [ ] Export button → EXPORT_LOANS

### ✅ Approvals Tab
- [ ] Approve Phase 1 button → APPROVE_PHASE_1
- [ ] Approve Phase 2 button → APPROVE_PHASE_2
- [ ] Approve Phase 3 button → APPROVE_PHASE_3
- [ ] Approve Phase 4 button → APPROVE_PHASE_4
- [ ] Approve Phase 5 button → APPROVE_PHASE_5
- [ ] Reject button → REJECT_APPROVAL
- [ ] Assign approver dropdown → ASSIGN_APPROVER

### ✅ Repayments Tab
- [ ] "Record Repayment" button → RECORD_REPAYMENT
- [ ] "Approve" button → APPROVE_REPAYMENT
- [ ] "Edit" button → EDIT_REPAYMENT
- [ ] "Delete" button → DELETE_REPAYMENT

### ✅ Accounting Tab
- [ ] Financial statements → VIEW_FINANCIAL_STATEMENTS
- [ ] Income statement → VIEW_INCOME_STATEMENT
- [ ] Balance sheet → VIEW_BALANCE_SHEET
- [ ] Create journal entry → CREATE_JOURNAL_ENTRY
- [ ] Edit account → EDIT_ACCOUNT
- [ ] Delete transaction → DELETE_JOURNAL_ENTRY
- [ ] Export reports → EXPORT_FINANCIAL_REPORTS

### ✅ Bank Accounts Tab
- [ ] Account balance display → VIEW_ACCOUNT_BALANCE
- [ ] Add account button → ADD_BANK_ACCOUNT
- [ ] Edit account button → EDIT_BANK_ACCOUNT
- [ ] Delete account button → DELETE_BANK_ACCOUNT
- [ ] Add transaction → ADD_TRANSACTION
- [ ] Edit transaction → EDIT_TRANSACTION
- [ ] Delete transaction → DELETE_TRANSACTION
- [ ] Reconcile button → RECONCILE_ACCOUNT
- [ ] Mark reviewed checkbox → MARK_REVIEWED

### ✅ Collection Sheets Tab
- [ ] View sheet → VIEW_COLLECTION_SHEETS
- [ ] Generate button → GENERATE_COLLECTION_SHEET
- [ ] Export button → EXPORT_COLLECTION_SHEET
- [ ] Record collections → RECORD_COLLECTIONS

### ✅ Credit Scoring Tab
- [ ] Credit scores table → VIEW_CREDIT_SCORES
- [ ] Score details → VIEW_SCORE_DETAILS
- [ ] Configure parameters → CONFIGURE_SCORING_PARAMETERS
- [ ] Recalculate button → RECALCULATE_SCORES

### ✅ Settings Tab
- [ ] Organization settings → EDIT_ORG_SETTINGS
- [ ] System settings → EDIT_SYSTEM_SETTINGS
- [ ] Manage users → STAFF.MANAGE_ROLES
- [ ] View audit log → VIEW_AUDIT_LOG

---

## 🚀 Next Steps

1. **Apply permissions to all tabs** - Systematically go through each component
2. **Test each role** - Login as different roles and verify access
3. **Add toast notifications** - Show permission denied messages
4. **Backend enforcement** - Add permission checks in Supabase policies
5. **Audit log** - Track permission-denied attempts
6. **Permission management UI** - Allow admins to customize role permissions

---

## 📝 Best Practices

1. **Always use atomic permissions** - Never check for `role === 'Admin'`
2. **Fail secure** - Default to deny if permission unclear
3. **Consistent naming** - Follow `module.action` pattern
4. **Document changes** - Update this guide when adding permissions
5. **Test thoroughly** - Verify each role can/cannot access features
6. **User feedback** - Show why access is denied
7. **Audit trails** - Log permission-denied events for security

---

## 🎓 Training Users

### For Administrators:
- Understand the permission model
- Know which roles have which permissions
- Use principle of least privilege
- Regularly audit user roles

### For End Users:
- Understand your role's capabilities
- Request access through proper channels
- Report unexpected access denials
- Don't share credentials

---

## 📈 Benefits

✅ **Enhanced Security** - Granular control prevents unauthorized access
✅ **Compliance** - Meet audit requirements with detailed permissions
✅ **Flexibility** - Easy to customize roles for specific needs
✅ **Maintainability** - Clear, consistent permission structure
✅ **User Experience** - Users see only what they can access
✅ **Audit Trail** - Track who can do what
✅ **Scalability** - Easy to add new permissions

---

**Version:** 1.0.0  
**Last Updated:** March 4, 2026  
**Author:** BV Funguo Development Team
