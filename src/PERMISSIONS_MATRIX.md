# Granular Permissions Matrix - BV Funguo Platform

## Complete Role Permissions Breakdown

This document provides a comprehensive view of which roles have which specific permissions across the platform.

### Legend
- ✅ = Has Permission
- ⛔ = No Permission
- 🔸 = Partial/Conditional Access

---

## 1. DASHBOARD PERMISSIONS

| Permission | Super Admin | Admin | Manager | Loan Officer | Accountant | Cashier | Auditor | Viewer |
|-----------|-------------|-------|---------|--------------|------------|---------|---------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Metrics | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ✅ |
| View Portfolio Summary | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ✅ | ✅ |
| View Disbursement Stats | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| View Collection Stats | ✅ | ✅ | ✅ | ⛔ | ✅ | ✅ | ✅ | ⛔ |
| View PAR Metrics | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ |
| View Client Growth | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ |
| View Loan Analytics | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ |
| Export Dashboard | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ |

---

## 2. CLIENT PERMISSIONS

| Permission | Super Admin | Admin | Manager | Loan Officer | Accountant | Cashier | Auditor | Viewer |
|-----------|-------------|-------|---------|--------------|------------|---------|---------|--------|
| View Clients | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Client Details | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Client Financials | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ |
| View Credit Score | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ |
| View Client Loans | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ |
| View Client Payments | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ |
| View Client Documents | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ |
| View GPS Location | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Add Client | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Edit Client | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Edit Personal Info | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Edit Financial Info | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Delete Client | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Export Clients | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ |
| Send SMS | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Send Email | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Invite Clients | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| View Statistics | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ |

---

## 3. LOAN PERMISSIONS

| Permission | Super Admin | Admin | Manager | Loan Officer | Accountant | Cashier | Auditor | Viewer |
|-----------|-------------|-------|---------|--------------|------------|---------|---------|--------|
| View Loans | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Loan Details | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Loan Schedule | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ✅ | ⛔ |
| View Guarantors | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ |
| View Comments | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ |
| View Documents | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ |
| View Financials | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ |
| View Loan Amount | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ |
| View Outstanding Balance | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ✅ | ⛔ |
| Create Loan | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Edit Loan | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Edit Loan Amount | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Edit Loan Terms | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Edit Interest Rate | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Delete Loan | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Disburse Loan | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Write Off Loan | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Rollover Loan | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Add Guarantor | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Remove Guarantor | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Add Comment | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Export Loans | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ |
| View Statistics | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ |

---

## 4. APPROVAL WORKFLOW PERMISSIONS

| Permission | Super Admin | Admin | Manager | Loan Officer | Accountant | Cashier | Auditor | Viewer |
|-----------|-------------|-------|---------|--------------|------------|---------|---------|--------|
| View Approvals | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ |
| View Approval Details | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ |
| **Approve Phase 1** (Submission) | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| **Approve Phase 2** (Credit Check) | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| **Approve Phase 3** (Manager Review) | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| **Approve Phase 4** (Final Approval) | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| **Approve Phase 5** (Disbursement) | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Reject Approval | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Assign Approver | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| View Approval History | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ |
| Export Approvals | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ |

---

## 5. REPAYMENT PERMISSIONS

| Permission | Super Admin | Admin | Manager | Loan Officer | Accountant | Cashier | Auditor | Viewer |
|-----------|-------------|-------|---------|--------------|------------|---------|---------|--------|
| View Repayments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Repayment Details | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ |
| Record Repayment | ✅ | ✅ | ⛔ | ✅ | ✅ | ✅ | ⛔ | ⛔ |
| Approve Repayment | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Reject Repayment | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Edit Repayment | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Delete Repayment | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| View Statistics | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ |
| Export Repayments | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |

---

## 6. ACCOUNTING PERMISSIONS

| Permission | Super Admin | Admin | Manager | Loan Officer | Accountant | Cashier | Auditor | Viewer |
|-----------|-------------|-------|---------|--------------|------------|---------|---------|--------|
| View Accounting | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| View Financial Statements | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| View Income Statement | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| View Balance Sheet | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| View Cash Flow | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| View Trial Balance | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| View General Ledger | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| View Journal Entries | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| Create Journal Entry | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Edit Journal Entry | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Delete Journal Entry | ✅ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| View Chart of Accounts | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| Add Account | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Edit Account | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Delete Account | ✅ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Export Financial Reports | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| View Audit Trail | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |

---

## 7. BANK ACCOUNT PERMISSIONS

| Permission | Super Admin | Admin | Manager | Loan Officer | Accountant | Cashier | Auditor | Viewer |
|-----------|-------------|-------|---------|--------------|------------|---------|---------|--------|
| View Bank Accounts | ✅ | ✅ | ✅ | ⛔ | ✅ | ✅ | ✅ | ⛔ |
| **View Account Balance** | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| View Transactions | ✅ | ✅ | ✅ | ⛔ | ✅ | ✅ | ✅ | ⛔ |
| View Transaction Details | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| Add Bank Account | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Edit Bank Account | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Delete Bank Account | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Add Transaction | ✅ | ✅ | ⛔ | ⛔ | ✅ | ✅ | ⛔ | ⛔ |
| Edit Transaction | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Delete Transaction | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Reconcile Account | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Mark Reviewed | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |
| Export Transactions | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| Initiate Transfer | ✅ | ✅ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ |

---

## 8. SETTINGS & ADMINISTRATION

| Permission | Super Admin | Admin | Manager | Loan Officer | Accountant | Cashier | Auditor | Viewer |
|-----------|-------------|-------|---------|--------------|------------|---------|---------|--------|
| View Settings | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ |
| Edit Org Settings | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Edit System Settings | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Manage Currencies | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Manage Branches | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Manage Custom Fields | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Manage Integrations | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| View Audit Log | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ |
| Manage Backups | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |

---

## 9. STAFF MANAGEMENT PERMISSIONS

| Permission | Super Admin | Admin | Manager | Loan Officer | Accountant | Cashier | Auditor | Viewer |
|-----------|-------------|-------|---------|--------------|------------|---------|---------|--------|
| View Staff | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| View Staff Details | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| View Performance | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| View Commissions | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Add Staff | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Edit Staff | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Delete Staff | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Assign Loans | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| View Assignments | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| **Manage Roles** | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| **Manage Permissions** | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |

---

## 10. REPORTS & EXPORTS

| Permission | Super Admin | Admin | Manager | Loan Officer | Accountant | Cashier | Auditor | Viewer |
|-----------|-------------|-------|---------|--------------|------------|---------|---------|--------|
| View Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ✅ |
| Generate Custom Report | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| Export to PDF | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ |
| Export to Excel | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ |
| Export to CSV | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| View Portfolio Report | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ✅ |
| View Arrears Report | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ |
| View Collections Report | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ |
| View Disbursement Report | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| View PAR Report | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ |
| View Aging Report | ✅ | ✅ | ✅ | ⛔ | ✅ | ⛔ | ✅ | ⛔ |
| Schedule Report | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |

---

## Permission Count Summary

| Role | Total Permissions | % of All Permissions |
|------|------------------|---------------------|
| Super Admin | 300+ | 100% |
| Admin | ~280 | ~93% |
| Manager | ~180 | ~60% |
| Loan Officer | ~100 | ~33% |
| Accountant | ~120 | ~40% |
| Cashier | ~40 | ~13% |
| Auditor | ~150 | ~50% |
| Viewer | ~30 | ~10% |

---

## Key Permission Insights

### 🔒 Most Restricted Permissions (Admin+ only):
1. Delete journal entries
2. Edit system settings
3. Approve Phase 4 & 5 (final approval & disbursement)
4. Manage user roles and permissions
5. Manage system integrations and backups
6. Edit loan amounts and interest rates
7. Delete bank accounts and transactions
8. Write-off and rollover loans

### 🌟 Most Common Permissions (All roles):
1. View dashboard
2. View clients (basic info)
3. View loans (basic info)
4. View repayments

### 💼 Role-Specific Strengths:
- **Manager**: Approval workflow (Phases 1-3), operational oversight
- **Loan Officer**: Client & loan management, field operations
- **Accountant**: Financial operations, bookkeeping, reconciliation
- **Cashier**: Payment collection, transaction recording
- **Auditor**: Complete read-only access, export everything

---

**Last Updated:** March 4, 2026  
**Version:** 1.0.0
